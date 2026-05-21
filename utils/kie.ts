import type { VideoGenerationRequest, VideoModelId } from "@/utils/video-generation";
import { site } from "@/config/site";

export const KIE_DEFAULT_BASE_URL = "https://api.kie.ai/api/v1";
export const KIE_VIDEO_MODELS: VideoModelId[] = ["bytedance/seedance-2", "bytedance/seedance-2-fast"];

type KieCreateTaskResponse = {
  code?: number;
  msg?: string;
  data?: {
    taskId?: string;
  };
};

type KieRecordResponse = {
  code?: number;
  msg?: string;
  data?: Record<string, unknown>;
};

export type KieTaskState = "waiting" | "queuing" | "generating" | "success" | "fail";

export type KieTaskRecord = {
  taskId: string;
  state: KieTaskState;
  failMsg: string | null;
  failCode: string | null;
  resultUrls: string[];
  coverUrl: string | null;
  raw: Record<string, unknown>;
};

function getKieApiKey() {
  const apiKey = process.env.KIE_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("KIE_API_KEY is not configured");
  }

  return apiKey;
}

function getKieBaseUrl() {
  // Keep compatibility with an earlier typo key (KIE_API_UR) to avoid production misconfig breaks.
  const configured =
    process.env.KIE_API_URL?.trim() || process.env.KIE_API_UR?.trim() || KIE_DEFAULT_BASE_URL;
  return configured.replace(/\/$/, "");
}

function normalizeResolution(resolution: VideoGenerationRequest["resolution"]) {
  return resolution;
}

function normalizeAspectRatio(aspectRatio: VideoGenerationRequest["aspectRatio"]) {
  return aspectRatio === "auto" ? "16:9" : aspectRatio;
}

function safeJsonParse(value: unknown) {
  if (typeof value !== "string") return value;

  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

function extractResultUrls(source: unknown): string[] {
  if (!source) return [];

  if (typeof source === "string" && /^https?:\/\//i.test(source.trim())) {
    return [source.trim()];
  }

  if (Array.isArray(source)) {
    return source.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
  }

  if (typeof source === "object") {
    const value = source as Record<string, unknown>;
    const candidates = [
      ...extractResultUrls(value.resultUrls),
      ...extractResultUrls(value.video_urls),
      ...extractResultUrls(value.videos),
      ...extractResultUrls(value.output),
    ];
    return Array.from(new Set(candidates));
  }

  return [];
}

function extractCoverUrl(source: unknown): string | null {
  if (!source || typeof source !== "object") return null;
  const value = source as Record<string, unknown>;

  const candidates = [value.coverUrl, value.cover_url, value.posterUrl, value.poster_url, value.thumbnailUrl, value.thumbnail_url];
  const match = candidates.find((candidate) => typeof candidate === "string" && candidate.trim().length > 0);
  return typeof match === "string" ? match : null;
}

export function buildKieSeedanceInput(request: VideoGenerationRequest) {
  const baseInput: Record<string, unknown> = {
    prompt: request.prompt,
    duration: request.durationSeconds,
    resolution: normalizeResolution(request.resolution),
    aspect_ratio: normalizeAspectRatio(request.aspectRatio),
    generate_audio: request.generateAudio === true,
    return_last_frame: request.returnLastFrame !== false,
    web_search: request.webSearch === true,
  };

  if (request.mode === "text_to_video") {
    return baseInput;
  }

  if (request.mode === "image_to_video") {
    const firstFrame = request.images[0];
    if (!firstFrame) {
      throw new Error("Kie image-to-video requires at least one image");
    }

    return {
      ...baseInput,
      first_frame_url: firstFrame.url,
      ...(request.images[1] ? { last_frame_url: request.images[1].url } : {}),
    };
  }

  return {
    ...baseInput,
    ...(request.images.length > 0 ? { reference_image_urls: request.images.map((asset) => asset.url) } : {}),
    ...(request.videos.length > 0 ? { reference_video_urls: request.videos.map((asset) => asset.url) } : {}),
    ...(request.audios.length > 0 ? { reference_audio_urls: request.audios.map((asset) => asset.url) } : {}),
  };
}

export async function createKieSeedanceTask(input: {
  model: VideoModelId;
  request: VideoGenerationRequest;
  callbackUrl?: string | null;
}) {
  const response = await fetch(`${getKieBaseUrl()}/jobs/createTask`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getKieApiKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: input.model,
      input: buildKieSeedanceInput(input.request),
      ...(input.callbackUrl ? { callBackUrl: input.callbackUrl } : {}),
    }),
  });

  const payload = (await response.json().catch(() => null)) as KieCreateTaskResponse | null;
  if (!response.ok || payload?.code !== 200 || !payload?.data?.taskId) {
    throw new Error(payload?.msg || "Failed to create Kie task");
  }

  return payload.data.taskId;
}

export async function fetchKieTaskRecord(taskId: string) {
  const url = new URL(`${getKieBaseUrl()}/jobs/recordInfo`);
  url.searchParams.set("taskId", taskId);

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      Authorization: `Bearer ${getKieApiKey()}`,
      "Content-Type": "application/json",
    },
  });

  const payload = (await response.json().catch(() => null)) as KieRecordResponse | null;
  if (!response.ok || payload?.code !== 200 || !payload?.data) {
    throw new Error(payload?.msg || "Failed to fetch Kie task record");
  }

  return parseKieTaskRecord(payload.data);
}

export function parseKieTaskRecord(rawData: Record<string, unknown>): KieTaskRecord {
  const parsedResult = safeJsonParse(rawData.resultJson);
  const state = (rawData.state || "waiting") as KieTaskState;

  return {
    taskId: String(rawData.taskId || rawData.id || ""),
    state,
    failMsg: typeof rawData.failMsg === "string" ? rawData.failMsg : null,
    failCode: typeof rawData.failCode === "string" ? rawData.failCode : null,
    resultUrls: extractResultUrls(parsedResult),
    coverUrl: extractCoverUrl(parsedResult),
    raw: rawData,
  };
}

export function mapKieStateToGenerationState(state: KieTaskState) {
  if (state === "success") {
    return { status: "succeeded", statusDetail: "provider_completed" } as const;
  }

  if (state === "fail") {
    return { status: "failed", statusDetail: "provider_failed" } as const;
  }

  if (state === "generating") {
    return { status: "processing", statusDetail: "provider_generating" } as const;
  }

  if (state === "queuing") {
    return { status: "pending", statusDetail: "provider_queuing" } as const;
  }

  return { status: "pending", statusDetail: "provider_waiting" } as const;
}

export function buildKieCallbackUrl() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim() || process.env.NEXT_PUBLIC_SITE_URL?.trim() || site.siteUrl;
  const secret = process.env.KIE_CALLBACK_SECRET?.trim();

  if (!appUrl || !secret) {
    return null;
  }

  return `${appUrl.replace(/\/$/, "")}/api/webhooks/kie?token=${encodeURIComponent(secret)}`;
}
