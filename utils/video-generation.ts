export type VideoGenerationMode =
  | "multi_modal_video"
  | "image_to_video"
  | "text_to_video"
  | "video_extension";

export type VideoModelId = "bytedance/seedance-2" | "bytedance/seedance-2-fast";
export type VideoAssetKind = "image" | "video" | "audio";

export type VideoAsset = {
  id: string;
  kind: VideoAssetKind;
  url: string;
  objectKey?: string;
};

export type VideoGenerationRequest = {
  videoModel: VideoModelId;
  mode: VideoGenerationMode;
  prompt: string;
  resolution: "480p" | "720p" | "1080p";
  durationSeconds: 5 | 10 | 15;
  aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4" | "21:9" | "auto";
  images: VideoAsset[];
  videos: VideoAsset[];
  audios: VideoAsset[];
  containsRealPeople?: boolean;
  returnLastFrame?: boolean;
  generateAudio?: boolean;
  webSearch?: boolean;
  workspacePreset?: string | null;
};

export const KIE_SEEDANCE_SUPPORTED_MODELS: VideoModelId[] = ["bytedance/seedance-2", "bytedance/seedance-2-fast"];
export const KIE_SEEDANCE_SUPPORTED_MODES: VideoGenerationMode[] = ["multi_modal_video", "image_to_video", "text_to_video"];
export const KIE_SEEDANCE_SUPPORTED_RESOLUTIONS: VideoGenerationRequest["resolution"][] = ["480p", "720p", "1080p"];
export const KIE_SEEDANCE_SUPPORTED_DURATIONS: VideoGenerationRequest["durationSeconds"][] = [5, 10, 15];
export const KIE_SEEDANCE_SUPPORTED_RATIOS: VideoGenerationRequest["aspectRatio"][] = ["16:9", "4:3", "1:1", "3:4", "9:16", "21:9"];

export const KIE_MODE_ASSET_LIMITS: Record<
  VideoGenerationMode,
  Record<VideoAssetKind, number>
> = {
  multi_modal_video: {
    image: 9,
    video: 3,
    audio: 3,
  },
  image_to_video: {
    image: 2,
    video: 0,
    audio: 0,
  },
  text_to_video: {
    image: 0,
    video: 0,
    audio: 0,
  },
  video_extension: {
    image: 0,
    video: 1,
    audio: 0,
  },
};

export function getAssetLimitForMode(mode: VideoGenerationMode, kind: VideoAssetKind) {
  return KIE_MODE_ASSET_LIMITS[mode][kind];
}

export const KIE_SEEDANCE_CREDIT_RATES_PER_SECOND = {
  withoutVideoInput: {
    "480p": 19,
    "720p": 41,
    "1080p": 102,
  },
  withVideoInput: {
    "480p": 11.5,
    "720p": 25,
    "1080p": 62,
  },
} satisfies Record<"withoutVideoInput" | "withVideoInput", Record<VideoGenerationRequest["resolution"], number>>;

/**
 * Kie bills video-reference tasks with output duration plus reference-video time.
 * Until we persist exact client-side media durations, reserve the documented max
 * reference-video budget so our balance check never undercharges GPU usage.
 */
export const KIE_REFERENCE_VIDEO_BILLING_FALLBACK_SECONDS = 15;

type CreditEstimateInput = Pick<
  VideoGenerationRequest,
  "mode" | "resolution" | "durationSeconds" | "audios"
> & {
  videos?: Pick<VideoAsset, "url">[];
};

function includesVideoInput(input: CreditEstimateInput) {
  return input.mode === "video_extension" || (input.videos?.length ?? 0) > 0;
}

export function estimateGenerationCredits(input: CreditEstimateInput) {
  const hasVideoInput = includesVideoInput(input);
  const rates = hasVideoInput
    ? KIE_SEEDANCE_CREDIT_RATES_PER_SECOND.withVideoInput
    : KIE_SEEDANCE_CREDIT_RATES_PER_SECOND.withoutVideoInput;
  const billableSeconds =
    input.durationSeconds +
    (hasVideoInput ? KIE_REFERENCE_VIDEO_BILLING_FALLBACK_SECONDS : 0);

  return Math.ceil(rates[input.resolution] * billableSeconds);
}

export function normalizeVideoGenerationRequest(payload: any): VideoGenerationRequest {
  const videoModel =
    payload?.videoModel === "bytedance/seedance-2-fast"
      ? "bytedance/seedance-2-fast"
      : "bytedance/seedance-2";
  const mode = (payload?.mode || "multi_modal_video") as VideoGenerationMode;
  const resolutionCandidate = (payload?.resolution || "720p") as VideoGenerationRequest["resolution"];
  const durationCandidate = Number(payload?.durationSeconds || 15) as VideoGenerationRequest["durationSeconds"];
  const aspectRatioCandidate = (payload?.aspectRatio || "16:9") as VideoGenerationRequest["aspectRatio"];
  const resolution = KIE_SEEDANCE_SUPPORTED_RESOLUTIONS.includes(resolutionCandidate) ? resolutionCandidate : "720p";
  const durationSeconds = KIE_SEEDANCE_SUPPORTED_DURATIONS.includes(durationCandidate) ? durationCandidate : 15;
  const aspectRatio = KIE_SEEDANCE_SUPPORTED_RATIOS.includes(aspectRatioCandidate) ? aspectRatioCandidate : "16:9";
  const prompt = typeof payload?.prompt === "string" ? payload.prompt.trim() : "";

  const normalizeAssets = (assets: any[], kind: VideoAsset["kind"]) =>
    Array.isArray(assets)
      ? assets
          .filter((asset) => asset && typeof asset.url === "string" && asset.url.trim())
          .map((asset, index) => ({
            id: typeof asset.id === "string" && asset.id.trim() ? asset.id : `${kind}-${index + 1}`,
            kind,
            url: asset.url.trim(),
            ...(typeof asset.objectKey === "string" && asset.objectKey.trim()
              ? { objectKey: asset.objectKey.trim() }
              : {}),
          }))
      : [];

  return {
    videoModel,
    mode,
    prompt,
    resolution,
    durationSeconds,
    aspectRatio,
    images: normalizeAssets(payload?.images, "image"),
    videos: normalizeAssets(payload?.videos, "video"),
    audios: normalizeAssets(payload?.audios, "audio"),
    containsRealPeople: payload?.containsRealPeople === true,
    returnLastFrame: payload?.returnLastFrame !== false,
    generateAudio: payload?.generateAudio === true,
    webSearch: payload?.webSearch === true,
    workspacePreset: typeof payload?.workspacePreset === "string" ? payload.workspacePreset : null,
  };
}
