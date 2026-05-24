import { getD1, isoNow, jsonStringify, safeJsonParse } from "@/utils/d1/db";
import type { D1Generation } from "@/utils/d1/types";
import { getCustomerByUserId } from "@/utils/d1/customers";

type CreateGenerationAssetInput = {
  kind: "image" | "video" | "audio";
  url: string;
  objectKey?: string | null;
  sortOrder: number;
};

function objectKeyFromPublicUrl(url: string) {
  try {
    const parsed = new URL(url);
    const key = decodeURIComponent(parsed.pathname.replace(/^\/+/, ""));
    return key || url;
  } catch {
    return url;
  }
}

export async function createGenerationWithCredits(input: {
  userId: string;
  prompt: string;
  modelId: string;
  generationType: string;
  creditsCost: number;
  resolution: string | null;
  durationSeconds: number | null;
  aspectRatio: string | null;
  metadata?: Record<string, unknown>;
  assets?: CreateGenerationAssetInput[];
}) {
  const db = getD1();
  const customer = await getCustomerByUserId(input.userId);
  if (!customer) {
    throw new Error("CUSTOMER_NOT_FOUND");
  }

  if (customer.credits < input.creditsCost) {
    throw new Error("INSUFFICIENT_CREDITS");
  }

  const generationId = crypto.randomUUID();
  const now = isoNow();
  const metadataJson = jsonStringify(input.metadata ?? {});

  const statements = [
    db
      .prepare("UPDATE customers SET credits = ?, updated_at = ? WHERE id = ?")
      .bind(customer.credits - input.creditsCost, now, customer.id),
    db
      .prepare(
        "INSERT INTO credits_history (id, user_id, amount, type, description, creem_order_id, metadata_json, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
      )
      .bind(
        crypto.randomUUID(),
        input.userId,
        -input.creditsCost,
        "spend",
        "Seedance generation charge",
        null,
        jsonStringify({ source: "create_generation_with_credits" }),
        now
      ),
    db
      .prepare(
        `INSERT INTO generations (
          id, user_id, prompt, model_id, generation_type, status, status_detail, credits_cost,
          resolution, duration_seconds, aspect_ratio, provider, provider_job_id, output_video_url, thumbnail_url,
          metadata_json, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        generationId,
        input.userId,
        input.prompt,
        input.modelId,
        input.generationType,
        "pending",
        "queued_for_provider",
        input.creditsCost,
        input.resolution,
        input.durationSeconds,
        input.aspectRatio,
        "kie",
        null,
        null,
        null,
        metadataJson,
        now,
        now
      ),
  ];

  for (const asset of input.assets ?? []) {
    statements.push(
      db
        .prepare(
          "INSERT INTO generation_assets (id, generation_id, asset_kind, asset_role, object_key, public_url, sort_order, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
        )
        .bind(
          crypto.randomUUID(),
          generationId,
          asset.kind,
          null,
          asset.objectKey?.trim() || objectKeyFromPublicUrl(asset.url),
          asset.url,
          asset.sortOrder,
          now
        )
    );
  }

  await db.batch(statements);
  return getGenerationById(generationId);
}

export async function getGenerationById(id: string) {
  const result = await getD1()
    .prepare("SELECT * FROM generations WHERE id = ? LIMIT 1")
    .bind(id)
    .first<D1Generation | null>();

  return result ?? null;
}

export async function listProcessingGenerationsByUserId(userId: string, limit = 10) {
  const result = await getD1()
    .prepare(
      `
      SELECT *
      FROM generations
      WHERE user_id = ?
        AND status IN ('pending', 'processing')
      ORDER BY created_at DESC
      LIMIT ?
      `
    )
    .bind(userId, limit)
    .all<D1Generation>();

  return result.results ?? [];
}

export async function countGenerationsByUserId(userId: string) {
  const result = await getD1()
    .prepare("SELECT COUNT(*) as total FROM generations WHERE user_id = ?")
    .bind(userId)
    .first<{ total: number } | null>();

  return result?.total ?? 0;
}

export async function listRecentGenerationsByUserId(userId: string, limit = 10, offset = 0) {
  const result = await getD1()
    .prepare(
      `
      SELECT *
      FROM generations
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT ?
      OFFSET ?
      `
    )
    .bind(userId, limit, offset)
    .all<D1Generation>();

  return result.results ?? [];
}

function toGenerationView(row: D1Generation) {
  return {
    id: row.id,
    status: row.status,
    status_detail: row.status_detail,
    created_at: row.created_at,
    prompt: row.prompt,
    credits_cost: row.credits_cost,
    resolution: row.resolution,
    duration_seconds: row.duration_seconds,
    aspect_ratio: row.aspect_ratio,
    generation_type: row.generation_type,
    provider_job_id: row.provider_job_id,
    output_video_url: row.output_video_url,
    metadata: safeJsonParse<Record<string, unknown>>(row.metadata_json, {}),
  };
}

export async function listProcessingGenerationViewsByUserId(userId: string, limit = 10) {
  const rows = await listProcessingGenerationsByUserId(userId, limit);
  return rows.map(toGenerationView);
}

export async function listRecentGenerationViewsByUserId(userId: string, limit = 10, offset = 0) {
  const rows = await listRecentGenerationsByUserId(userId, limit, offset);
  return rows.map(toGenerationView);
}

export async function getGenerationViewByIdForUser(generationId: string, userId: string) {
  const row = await getD1()
    .prepare("SELECT * FROM generations WHERE id = ? AND user_id = ? LIMIT 1")
    .bind(generationId, userId)
    .first<D1Generation | null>();

  if (!row) return null;

  const assets = await getD1()
    .prepare(
      "SELECT asset_kind, public_url, sort_order FROM generation_assets WHERE generation_id = ? ORDER BY sort_order ASC"
    )
    .bind(generationId)
    .all<{ asset_kind: "image" | "video" | "audio"; public_url: string | null; sort_order: number }>();

  const images = (assets.results ?? []).filter((asset) => asset.asset_kind === "image").map((asset) => asset.public_url).filter(Boolean);
  const videos = (assets.results ?? []).filter((asset) => asset.asset_kind === "video").map((asset) => asset.public_url).filter(Boolean);
  const audios = (assets.results ?? []).filter((asset) => asset.asset_kind === "audio").map((asset) => asset.public_url).filter(Boolean);

  return {
    ...row,
    metadata: safeJsonParse<Record<string, unknown>>(row.metadata_json, {}),
    input_images: images,
    input_videos: videos,
    input_audios: audios,
  };
}

export async function updateGenerationProviderState(input: {
  id: string;
  providerJobId?: string | null;
  status: string;
  statusDetail?: string | null;
  outputVideoUrl?: string | null;
  thumbnailUrl?: string | null;
  metadata?: Record<string, unknown>;
}) {
  const existing = await getGenerationById(input.id);
  if (!existing) return null;

  const mergedMetadata = {
    ...safeJsonParse<Record<string, unknown>>(existing.metadata_json, {}),
    ...(input.metadata ?? {}),
  };

  await getD1()
    .prepare(
      `
      UPDATE generations
      SET provider_job_id = ?,
          status = ?,
          status_detail = ?,
          output_video_url = ?,
          thumbnail_url = ?,
          metadata_json = ?,
          updated_at = ?
      WHERE id = ?
      `
    )
    .bind(
      input.providerJobId ?? existing.provider_job_id,
      input.status,
      input.statusDetail ?? existing.status_detail,
      input.outputVideoUrl ?? existing.output_video_url,
      input.thumbnailUrl ?? existing.thumbnail_url,
      jsonStringify(mergedMetadata),
      isoNow(),
      input.id
    )
    .run();

  return getGenerationById(input.id);
}
