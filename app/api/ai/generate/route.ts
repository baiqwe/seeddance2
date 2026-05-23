import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createServiceRoleClient } from "@/utils/supabase/service-role";
import { getProjectId } from "@/utils/supabase/project";
import { consumeRateLimit } from "@/utils/rate-limit";
import { estimateGenerationCredits, normalizeVideoGenerationRequest } from "@/utils/video-generation";
import { buildKieCallbackUrl, createKieSeedanceTask } from "@/utils/kie";
import { isCloudflareDataBackend } from "@/utils/backend/runtime";
import { requireSessionUser } from "@/utils/backend/auth";
import { createGenerationWithCredits, listProcessingGenerationViewsByUserId, updateGenerationProviderState } from "@/utils/d1/generations";
import { provisionCustomerIfMissing } from "@/utils/d1/customers";

export const runtime = "nodejs";

const ACTIVE_GENERATION_WINDOW_MS = 10 * 60 * 1000;

function getRequestIp(request: NextRequest) {
  const cloudflareIp = request.headers.get("cf-connecting-ip")?.trim();
  if (cloudflareIp) return cloudflareIp;

  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;

  const forwardedFor = request.headers.get("x-forwarded-for");
  const forwardedIp = forwardedFor?.split(",")[0]?.trim();
  return forwardedIp || "unknown";
}

export async function GET(request: NextRequest) {
  if (isCloudflareDataBackend()) {
    const user = await requireSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const limit = Math.min(Number(url.searchParams.get("limit") || "10"), 20);
    const generations = await listProcessingGenerationViewsByUserId(user.id, limit);
    return NextResponse.json({ generations });
  }

  const supabase = await createClient();
  const serviceSupabase = createServiceRoleClient();
  const projectId = await getProjectId(serviceSupabase);
  const url = new URL(request.url);
  const limit = Math.min(Number(url.searchParams.get("limit") || "10"), 20);

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await serviceSupabase
    .from("generations")
    .select(
      "id, status, status_detail, created_at, prompt, credits_cost, resolution, duration_seconds, aspect_ratio, generation_type, provider_job_id, output_video_url, metadata"
    )
    .eq("project_id", projectId)
    .eq("user_id", user.id)
    .in("status", ["pending", "processing"])
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    return NextResponse.json({ error: "Failed to load generations" }, { status: 500 });
  }

  return NextResponse.json({ generations: data || [] });
}

export async function POST(request: NextRequest) {
  if (isCloudflareDataBackend()) {
    const rawPayload = (await request.json()) as Record<string, unknown>;
    const payload = normalizeVideoGenerationRequest(rawPayload);
    if (!payload.prompt) {
      return NextResponse.json({ error: "Prompt is required.", code: "MISSING_PROMPT" }, { status: 400 });
    }

    if (payload.images.length === 0 && payload.videos.length === 0 && payload.mode !== "text_to_video") {
      return NextResponse.json(
        { error: "At least one image or video reference is required.", code: "MISSING_REFERENCES" },
        { status: 400 }
      );
    }

    if (payload.images.length > 9 || payload.videos.length > 3 || payload.audios.length > 3) {
      return NextResponse.json(
        { error: "The request exceeds the allowed asset limits.", code: "ASSET_LIMIT_EXCEEDED" },
        { status: 400 }
      );
    }

    const user = await requireSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Please sign in to generate.", code: "UNAUTHORIZED" }, { status: 401 });
    }

    await provisionCustomerIfMissing({
      userId: user.id,
      email: user.email,
      name: user.name,
    });

    const ip = getRequestIp(request);
    const rateLimit = await consumeRateLimit({
      scope: "ai-generate",
      key: `cloudflare:${user.id}:${ip}`,
      limit: 10,
      windowMs: 5 * 60 * 1000,
    });

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: "Too many generation attempts. Please wait a few minutes and try again.",
          code: "RATE_LIMITED",
        },
        {
          status: 429,
          headers: {
            "Retry-After": Math.max(Math.ceil((rateLimit.resetAt - Date.now()) / 1000), 1).toString(),
          },
        }
      );
    }

    const existingProcessing = await listProcessingGenerationViewsByUserId(user.id, 1);
    const latest = existingProcessing[0];
    if (latest) {
      const pendingAge = Date.now() - new Date(latest.created_at).getTime();
      if (pendingAge < ACTIVE_GENERATION_WINDOW_MS) {
        return NextResponse.json(
          { error: "A generation is already in progress. Please wait for it to finish.", code: "GENERATION_IN_PROGRESS" },
          { status: 429 }
        );
      }
    }

    const estimatedCredits = estimateGenerationCredits(payload);
    let generation;

    try {
      generation = await createGenerationWithCredits({
        userId: user.id,
        prompt: payload.prompt,
        modelId: payload.videoModel,
        generationType: payload.mode,
        creditsCost: estimatedCredits,
        resolution: payload.resolution,
        durationSeconds: payload.durationSeconds,
        aspectRatio: payload.aspectRatio,
        metadata: {
          provider: "kie",
          providerModel: payload.videoModel,
          containsRealPeople: payload.containsRealPeople,
          returnLastFrame: payload.returnLastFrame,
          generateAudio: payload.generateAudio,
          webSearch: payload.webSearch,
          workspacePreset: payload.workspacePreset,
          providerStatus: "waiting",
          orchestration: "kie_seedance",
          assetCounts: {
            images: payload.images.length,
            videos: payload.videos.length,
            audios: payload.audios.length,
          },
        },
        assets: [
          ...payload.images.map((asset, index) => ({
            kind: "image" as const,
            url: asset.url,
            objectKey: asset.objectKey,
            sortOrder: index,
          })),
          ...payload.videos.map((asset, index) => ({
            kind: "video" as const,
            url: asset.url,
            objectKey: asset.objectKey,
            sortOrder: index,
          })),
          ...payload.audios.map((asset, index) => ({
            kind: "audio" as const,
            url: asset.url,
            objectKey: asset.objectKey,
            sortOrder: index,
          })),
        ],
      });
    } catch (error: any) {
      if (error?.message === "INSUFFICIENT_CREDITS") {
        return NextResponse.json(
          { error: "Insufficient credits", code: "INSUFFICIENT_CREDITS", required: estimatedCredits },
          { status: 402 }
        );
      }
      return NextResponse.json({ error: error?.message || "Could not initialize generation", code: "GENERATION_LOG_FAILED" }, { status: 500 });
    }

    if (!generation?.id) {
      return NextResponse.json({ error: "Could not initialize generation", code: "GENERATION_LOG_FAILED" }, { status: 500 });
    }

    try {
      const providerJobId = await createKieSeedanceTask({
        model: payload.videoModel,
        request: payload,
        callbackUrl: buildKieCallbackUrl(),
      });

      await updateGenerationProviderState({
        id: generation.id,
        providerJobId,
        status: "pending",
        statusDetail: "provider_waiting",
        metadata: {
          provider: "kie",
          providerModel: payload.videoModel,
          providerStatus: "waiting",
          containsRealPeople: payload.containsRealPeople,
          returnLastFrame: payload.returnLastFrame,
          generateAudio: payload.generateAudio,
          webSearch: payload.webSearch,
          workspacePreset: payload.workspacePreset,
          orchestration: "kie_seedance",
          assetCounts: {
            images: payload.images.length,
            videos: payload.videos.length,
            audios: payload.audios.length,
          },
        },
      });

      return NextResponse.json(
        {
          id: generation.id,
          status: "pending",
          statusDetail: "provider_waiting",
          providerJobId,
          estimatedCredits,
          message: "Generation job created and submitted to Kie.",
        },
        { status: 202 }
      );
    } catch (providerError: any) {
      await updateGenerationProviderState({
        id: generation.id,
        status: "failed",
        statusDetail: "provider_submission_failed",
        metadata: {
          provider: "kie",
          providerModel: payload.videoModel,
          providerStatus: "submission_failed",
          failureMessage: providerError?.message || "Failed to submit task to Kie",
        },
      });

      return NextResponse.json(
        { error: providerError?.message || "Failed to submit generation to Kie", code: "PROVIDER_SUBMISSION_FAILED" },
        { status: 502 }
      );
    }
  }

  const supabase = await createClient();
  const serviceSupabase = createServiceRoleClient();

  let generationId: string | null = null;
  let projectId: string | null = null;
  let estimatedCredits = 0;

  try {
    projectId = await getProjectId(serviceSupabase);
    const rawPayload = (await request.json()) as Record<string, unknown>;
    const payload = normalizeVideoGenerationRequest(rawPayload);

    if (!payload.prompt) {
      return NextResponse.json({ error: "Prompt is required.", code: "MISSING_PROMPT" }, { status: 400 });
    }

    if (payload.images.length === 0 && payload.videos.length === 0 && payload.mode !== "text_to_video") {
      return NextResponse.json(
        { error: "At least one image or video reference is required.", code: "MISSING_REFERENCES" },
        { status: 400 }
      );
    }

    if (payload.images.length > 9 || payload.videos.length > 3 || payload.audios.length > 3) {
      return NextResponse.json(
        { error: "The request exceeds the allowed asset limits.", code: "ASSET_LIMIT_EXCEEDED" },
        { status: 400 }
      );
    }

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Please sign in to generate.", code: "UNAUTHORIZED" }, { status: 401 });
    }

    const ip = getRequestIp(request);
    const rateLimit = await consumeRateLimit({
      scope: "ai-generate",
      key: `${projectId}:${user.id}:${ip}`,
      limit: 10,
      windowMs: 5 * 60 * 1000,
    });

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: "Too many generation attempts. Please wait a few minutes and try again.",
          code: "RATE_LIMITED",
        },
        {
          status: 429,
          headers: {
            "Retry-After": Math.max(Math.ceil((rateLimit.resetAt - Date.now()) / 1000), 1).toString(),
          },
        }
      );
    }

    const { data: existingPendingGeneration, error: existingPendingError } = await serviceSupabase
      .from("generations")
      .select("id, created_at")
      .eq("project_id", projectId)
      .eq("user_id", user.id)
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existingPendingError) {
      return NextResponse.json({ error: "System busy, please try again", code: "SYSTEM_ERROR" }, { status: 500 });
    }

    if (existingPendingGeneration) {
      const pendingAge = Date.now() - new Date(existingPendingGeneration.created_at).getTime();
      if (pendingAge < ACTIVE_GENERATION_WINDOW_MS) {
        return NextResponse.json(
          {
            error: "A generation is already in progress. Please wait for it to finish.",
            code: "GENERATION_IN_PROGRESS",
          },
          { status: 429 }
        );
      }
    }

    estimatedCredits = estimateGenerationCredits(payload);

    type CreateGenerationRpcRow = {
      id: string;
      created_at: string;
      provider_job_id: string | null;
      credits_cost: number;
    };

    const { data: rpcRows, error: rpcError } = await supabase.rpc("create_seedance_generation_with_credits", {
      p_user_id: user.id,
      p_prompt: payload.prompt,
      p_model_id: payload.videoModel,
      p_generation_type: payload.mode,
      p_credits_cost: estimatedCredits,
      p_input_images: payload.images,
      p_input_videos: payload.videos,
      p_input_audios: payload.audios,
      p_resolution: payload.resolution,
      p_duration_seconds: payload.durationSeconds,
      p_aspect_ratio: payload.aspectRatio,
      p_provider_job_id: null,
      p_status: "pending",
      p_status_detail: "queued_for_provider",
      p_metadata: {
        provider: "kie",
        providerModel: payload.videoModel,
        containsRealPeople: payload.containsRealPeople,
        returnLastFrame: payload.returnLastFrame,
        workspacePreset: payload.workspacePreset,
        providerStatus: "waiting",
        orchestration: "kie_seedance",
        assetCounts: {
          images: payload.images.length,
          videos: payload.videos.length,
          audios: payload.audios.length,
        },
      },
    }) as { data: CreateGenerationRpcRow[] | null; error: { message?: string } | null };

    if (rpcError) {
      if (rpcError.message === "INSUFFICIENT_CREDITS") {
        return NextResponse.json(
          {
            error: "Insufficient credits",
            code: "INSUFFICIENT_CREDITS",
            required: estimatedCredits,
          },
          { status: 402 }
        );
      }

      if (rpcError.message === "CUSTOMER_NOT_FOUND" || rpcError.message === "PROJECT_CONTEXT_MISSING") {
        return NextResponse.json({ error: "System busy, please try again", code: "SYSTEM_ERROR" }, { status: 500 });
      }

      return NextResponse.json({ error: "Could not initialize generation", code: "GENERATION_LOG_FAILED" }, { status: 500 });
    }

    const generationRow = rpcRows?.[0];
    if (!generationRow?.id) {
      return NextResponse.json({ error: "Could not initialize generation", code: "GENERATION_LOG_FAILED" }, { status: 500 });
    }

    generationId = generationRow.id;

    try {
      const providerJobId = await createKieSeedanceTask({
        model: payload.videoModel,
        request: payload,
        callbackUrl: buildKieCallbackUrl(),
      });

      await serviceSupabase
        .from("generations")
        .update({
          model_id: payload.videoModel,
          provider_job_id: providerJobId,
          status: "pending",
          status_detail: "provider_waiting",
          metadata: {
            provider: "kie",
            providerModel: payload.videoModel,
            providerStatus: "waiting",
            containsRealPeople: payload.containsRealPeople,
            returnLastFrame: payload.returnLastFrame,
            workspacePreset: payload.workspacePreset,
            orchestration: "kie_seedance",
            assetCounts: {
              images: payload.images.length,
              videos: payload.videos.length,
              audios: payload.audios.length,
            },
          },
        })
        .eq("id", generationId)
        .eq("project_id", projectId);

      return NextResponse.json(
        {
          id: generationRow.id,
          status: "pending",
          statusDetail: "provider_waiting",
          providerJobId,
          estimatedCredits,
          message: "Generation job created and submitted to Kie.",
        },
        { status: 202 }
      );
    } catch (providerError: any) {
      await supabase.rpc("decrease_credits", {
        p_user_id: user.id,
        p_amount: -estimatedCredits,
        p_description: "Refund for failed Kie task bootstrap",
      });

      await serviceSupabase
        .from("generations")
        .update({
          status: "failed",
          status_detail: "provider_submission_failed",
          metadata: {
            provider: "kie",
            providerModel: payload.videoModel,
            providerStatus: "submission_failed",
            failureMessage: providerError?.message || "Failed to submit task to Kie",
          },
        })
        .eq("id", generationId)
        .eq("project_id", projectId);

      return NextResponse.json(
        {
          error: providerError?.message || "Failed to submit generation to Kie",
          code: "PROVIDER_SUBMISSION_FAILED",
        },
        { status: 502 }
      );
    }
  } catch (error: any) {
    if (generationId && projectId) {
      await serviceSupabase
        .from("generations")
        .update({
          status: "failed",
          status_detail: "bootstrap_failed",
          metadata: {
            failureMessage: error?.message || "Unknown error",
            failureCode: error?.code || "UNKNOWN_ERROR",
          },
        })
        .eq("id", generationId)
        .eq("project_id", projectId);
    }

    return NextResponse.json(
      {
        error: error?.message || "Server error",
        code: error?.code || "UNKNOWN_ERROR",
      },
      { status: 500 }
    );
  }
}
