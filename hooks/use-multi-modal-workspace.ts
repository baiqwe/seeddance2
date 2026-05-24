"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import {
  estimateGenerationCredits,
  getAssetLimitForMode,
  KIE_SEEDANCE_SUPPORTED_DURATIONS,
  KIE_SEEDANCE_SUPPORTED_RATIOS,
  KIE_SEEDANCE_SUPPORTED_RESOLUTIONS,
  type VideoGenerationMode,
  type VideoModelId,
} from "@/utils/video-generation";

export type WorkspaceAssetKind = "image" | "video" | "audio";
export type WorkspaceAssetStatus = "queued" | "uploading" | "ready" | "error";

export type WorkspaceAsset = {
  id: string;
  kind: WorkspaceAssetKind;
  name: string;
  sizeLabel: string;
  previewUrl: string | null;
  remoteUrl: string | null;
  storagePath: string | null;
  progress: number;
  status: WorkspaceAssetStatus;
  error: string | null;
};

type AssetBuckets = Record<WorkspaceAssetKind, WorkspaceAsset[]>;

type WorkspaceState = {
  videoModel: VideoModelId;
  mode: VideoGenerationMode;
  prompt: string;
  resolution: "480p" | "720p" | "1080p";
  durationSeconds: 5 | 10 | 15;
  aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4" | "21:9" | "auto";
  containsRealPeople: boolean;
  returnLastFrame: boolean;
  generateAudio: boolean;
  webSearch: boolean;
  assets: AssetBuckets;
  notice: string | null;
  isSubmitting: boolean;
  activeGenerationId: string | null;
  activeGenerationStatus: string | null;
};

type WorkspaceHydrationPayload = Partial<{
  mode: string;
  prompt: string;
  resolution: string;
  duration: string;
  durationSeconds: string;
  aspectRatio: string;
  ratio: string;
  containsRealPeople: string;
  returnLastFrame: string;
  generateAudio: string;
  webSearch: string;
  model: string;
}>;

const initialState: WorkspaceState = {
  videoModel: "bytedance/seedance-2",
  mode: "multi_modal_video",
  prompt: "",
  resolution: "720p",
  durationSeconds: 15,
  aspectRatio: "16:9",
  containsRealPeople: true,
  returnLastFrame: true,
  generateAudio: false,
  webSearch: false,
  assets: {
    image: [],
    video: [],
    audio: [],
  },
  notice: null,
  isSubmitting: false,
  activeGenerationId: null,
  activeGenerationStatus: null,
};

let state: WorkspaceState = initialState;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function setState(updater: WorkspaceState | ((current: WorkspaceState) => WorkspaceState)) {
  state = typeof updater === "function" ? updater(state) : updater;
  emit();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function snapshot() {
  return state;
}

function isMode(value: string): value is VideoGenerationMode {
  return value === "multi_modal_video" || value === "image_to_video" || value === "text_to_video" || value === "video_extension";
}

function isVideoModel(value: string): value is VideoModelId {
  return value === "bytedance/seedance-2" || value === "bytedance/seedance-2-fast";
}

function isResolution(value: string): value is WorkspaceState["resolution"] {
  return value === "480p" || value === "720p" || value === "1080p";
}

function isDuration(value: number): value is WorkspaceState["durationSeconds"] {
  return value === 5 || value === 10 || value === 15;
}

function isAspectRatio(value: string): value is WorkspaceState["aspectRatio"] {
  return value === "16:9" || value === "9:16" || value === "1:1" || value === "4:3" || value === "3:4" || value === "21:9" || value === "auto";
}

function parseBoolean(value: string | undefined) {
  if (value === undefined) return undefined;
  if (value === "true" || value === "1") return true;
  if (value === "false" || value === "0") return false;
  return undefined;
}

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function updateAsset(kind: WorkspaceAssetKind, id: string, updater: (asset: WorkspaceAsset) => WorkspaceAsset) {
  setState((current) => ({
    ...current,
    assets: {
      ...current.assets,
      [kind]: current.assets[kind].map((asset) => (asset.id === id ? updater(asset) : asset)),
    },
  }));
}

async function prepareUpload(kind: WorkspaceAssetKind, file: File) {
  type PrepareUploadResponse = {
    path: string;
    publicUrl: string;
    signedUrl: string;
    error?: string;
  };

  const response = await fetch("/api/uploads/prepare", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      kind,
      fileName: file.name,
      contentType: file.type,
      size: file.size,
    }),
  });

  const payload = (await response.json().catch(() => null)) as PrepareUploadResponse | null;
  if (!response.ok || !payload?.signedUrl || !payload?.publicUrl) {
    throw new Error(payload?.error || `Failed to prepare upload (${response.status})`);
  }

  return payload;
}

function uploadToSignedUrl(url: string, file: File, onProgress: (progress: number) => void) {
  return new Promise<void>((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open("PUT", url);
    if (file.type) {
      request.setRequestHeader("Content-Type", file.type);
    }
    request.upload.onprogress = (event) => {
      if (!event.lengthComputable) return;
      const percent = 20 + Math.round((event.loaded / event.total) * 75);
      onProgress(Math.min(percent, 95));
    };
    request.onload = () => {
      if (request.status >= 200 && request.status < 300) {
        onProgress(100);
        resolve();
        return;
      }

      const detail = request.responseText?.trim();
      reject(new Error(detail ? `Upload failed with status ${request.status}: ${detail.slice(0, 180)}` : `Upload failed with status ${request.status}`));
    };
    request.onerror = () => reject(new Error("R2 upload request failed or was blocked by CORS"));
    request.onabort = () => reject(new Error("Upload was cancelled before it finished"));
    request.ontimeout = () => reject(new Error("Upload timed out before it finished"));
    request.send(file);
  });
}

async function uploadAsset(kind: WorkspaceAssetKind, assetId: string, file: File) {
  try {
    updateAsset(kind, assetId, (current) => ({
      ...current,
      progress: 8,
      status: "uploading",
      error: null,
    }));

    const prepared = await prepareUpload(kind, file);
    updateAsset(kind, assetId, (current) => ({
      ...current,
      progress: 18,
      storagePath: prepared.path,
    }));

    await uploadToSignedUrl(prepared.signedUrl, file, (progress) => {
      updateAsset(kind, assetId, (current) => ({
        ...current,
        progress,
        status: progress >= 100 ? "ready" : "uploading",
      }));
    });

    updateAsset(kind, assetId, (current) => ({
      ...current,
      progress: 100,
      status: "ready",
      remoteUrl: prepared.publicUrl,
      storagePath: prepared.path,
      error: null,
    }));
  } catch (error: any) {
    updateAsset(kind, assetId, (current) => ({
      ...current,
      status: "error",
      error: error?.message || "Upload failed",
    }));
    setState((current) => ({
      ...current,
      notice: error?.message || "Upload failed",
    }));
  }
}

function createAsset(file: File, kind: WorkspaceAssetKind): WorkspaceAsset {
  const previewUrl =
    kind === "image" || kind === "video" ? URL.createObjectURL(file) : null;

  return {
    id: `${kind}_${crypto.randomUUID()}`,
    kind,
    name: file.name,
    sizeLabel: formatBytes(file.size),
    previewUrl,
    remoteUrl: null,
    storagePath: null,
    progress: 0,
    status: "queued",
    error: null,
  };
}

export const workspaceActions = {
  hydrateFromQuery(payload: WorkspaceHydrationPayload) {
    setState((current) => {
      const nextState = { ...current };
      const nextMode =
        payload.mode === "seedance-2"
          ? "multi_modal_video"
          : payload.mode === "image-to-video"
            ? "image_to_video"
            : payload.mode === "text-to-video"
              ? "text_to_video"
              : payload.mode;
      const nextRatio = payload.ratio ?? payload.aspectRatio;
      const nextDurationValue = payload.durationSeconds ?? payload.duration;
      const parsedDuration = nextDurationValue ? Number.parseInt(nextDurationValue.replace(/s$/i, ""), 10) : NaN;

      if (nextMode && isMode(nextMode) && nextState.mode !== nextMode) {
        nextState.mode = nextMode;
      }

      const nextModel = payload.model ?? undefined;
      if (nextModel && isVideoModel(nextModel) && nextState.videoModel !== nextModel) {
        nextState.videoModel = nextModel;
      }

      if (typeof payload.prompt === "string" && payload.prompt.trim()) {
        nextState.prompt = payload.prompt.slice(0, 5000);
      }

      if (payload.resolution && isResolution(payload.resolution)) {
        nextState.resolution = payload.resolution;
      }

      if (Number.isFinite(parsedDuration) && isDuration(parsedDuration)) {
        nextState.durationSeconds = parsedDuration;
      }

      if (nextRatio && isAspectRatio(nextRatio)) {
        nextState.aspectRatio = nextRatio;
      }

      const realPeople = parseBoolean(payload.containsRealPeople);
      if (typeof realPeople === "boolean") {
        nextState.containsRealPeople = realPeople;
      }

      const lastFrame = parseBoolean(payload.returnLastFrame);
      if (typeof lastFrame === "boolean") {
        nextState.returnLastFrame = lastFrame;
      }

      const generateAudio = parseBoolean(payload.generateAudio);
      if (typeof generateAudio === "boolean") {
        nextState.generateAudio = generateAudio;
      }

      const webSearch = parseBoolean(payload.webSearch);
      if (typeof webSearch === "boolean") {
        nextState.webSearch = webSearch;
      }

      return nextState;
    });
  },
  setMode(mode: VideoGenerationMode) {
    setState((current) => ({
      ...current,
      mode,
      resolution: KIE_SEEDANCE_SUPPORTED_RESOLUTIONS[0],
      durationSeconds: KIE_SEEDANCE_SUPPORTED_DURATIONS[0],
      aspectRatio: KIE_SEEDANCE_SUPPORTED_RATIOS[0],
      assets: {
        image: current.assets.image.slice(0, getAssetLimitForMode(mode, "image")),
        video: current.assets.video.slice(0, getAssetLimitForMode(mode, "video")),
        audio: current.assets.audio.slice(0, getAssetLimitForMode(mode, "audio")),
      },
    }));
  },
  setVideoModel(videoModel: VideoModelId) {
    setState((current) => ({ ...current, videoModel }));
  },
  setPrompt(prompt: string) {
    setState((current) => ({ ...current, prompt: prompt.slice(0, 5000) }));
  },
  setResolution(resolution: WorkspaceState["resolution"]) {
    setState((current) => ({
      ...current,
      resolution: KIE_SEEDANCE_SUPPORTED_RESOLUTIONS.includes(resolution) ? resolution : KIE_SEEDANCE_SUPPORTED_RESOLUTIONS[0],
    }));
  },
  setDurationSeconds(durationSeconds: WorkspaceState["durationSeconds"]) {
    setState((current) => ({
      ...current,
      durationSeconds: KIE_SEEDANCE_SUPPORTED_DURATIONS.includes(durationSeconds)
        ? durationSeconds
        : KIE_SEEDANCE_SUPPORTED_DURATIONS[0],
    }));
  },
  setAspectRatio(aspectRatio: WorkspaceState["aspectRatio"]) {
    setState((current) => ({
      ...current,
      aspectRatio: KIE_SEEDANCE_SUPPORTED_RATIOS.includes(aspectRatio)
        ? aspectRatio
        : KIE_SEEDANCE_SUPPORTED_RATIOS[0],
    }));
  },
  toggleContainsRealPeople() {
    setState((current) => ({ ...current, containsRealPeople: !current.containsRealPeople }));
  },
  toggleReturnLastFrame() {
    setState((current) => ({ ...current, returnLastFrame: !current.returnLastFrame }));
  },
  toggleGenerateAudio() {
    setState((current) => ({ ...current, generateAudio: !current.generateAudio }));
  },
  toggleWebSearch() {
    setState((current) => ({ ...current, webSearch: !current.webSearch }));
  },
  clearNotice() {
    setState((current) => ({ ...current, notice: null }));
  },
  addFiles(kind: WorkspaceAssetKind, files: File[]) {
    const maxAssets = getAssetLimitForMode(state.mode, kind);
    const remaining = maxAssets - state.assets[kind].length;

    if (maxAssets <= 0) {
      setState((current) => ({
        ...current,
        notice: `This mode does not accept ${kind} references.`,
      }));
      return;
    }

    const acceptedFiles = files.slice(0, Math.max(remaining, 0));
    const droppedCount = files.length - acceptedFiles.length;
    const created = acceptedFiles.map((file) => createAsset(file, kind));

    if (created.length === 0 && droppedCount > 0) {
      setState((current) => ({
        ...current,
        notice: `Only ${maxAssets} ${kind}${maxAssets > 1 ? "s" : ""} allowed in this lane.`,
      }));
      return;
    }

    setState((current) => ({
      ...current,
      assets: {
        ...current.assets,
        [kind]: [...current.assets[kind], ...created],
      },
      notice:
        droppedCount > 0
          ? `Added ${acceptedFiles.length} ${kind}${acceptedFiles.length > 1 ? "s" : ""}. ${droppedCount} exceeded the lane limit.`
          : current.notice,
    }));

    created.forEach((asset, index) => {
      window.setTimeout(() => {
        void uploadAsset(kind, asset.id, acceptedFiles[index]);
      }, index * 140);
    });
  },
  removeAsset(kind: WorkspaceAssetKind, id: string) {
    const asset = state.assets[kind].find((item) => item.id === id);
    if (asset?.previewUrl) {
      URL.revokeObjectURL(asset.previewUrl);
    }

    setState((current) => ({
      ...current,
      assets: {
        ...current.assets,
        [kind]: current.assets[kind].filter((item) => item.id !== id),
      },
    }));
  },
  moveAsset(kind: WorkspaceAssetKind, id: string, direction: "up" | "down") {
    setState((current) => {
      const items = [...current.assets[kind]];
      const index = items.findIndex((item) => item.id === id);
      if (index === -1) return current;

      const swapIndex = direction === "up" ? index - 1 : index + 1;
      if (swapIndex < 0 || swapIndex >= items.length) return current;

      [items[index], items[swapIndex]] = [items[swapIndex], items[index]];

      return {
        ...current,
        assets: {
          ...current.assets,
          [kind]: items,
        },
      };
    });
  },
  loadPreset(prompt: string, mode: VideoGenerationMode) {
    setState((current) => ({
      ...current,
      prompt,
      mode,
    }));
  },
  async submitGeneration() {
    const readyAssets = {
      image: state.assets.image.filter((asset) => asset.status === "ready" && asset.remoteUrl),
      video: state.assets.video.filter((asset) => asset.status === "ready" && asset.remoteUrl),
      audio: state.assets.audio.filter((asset) => asset.status === "ready" && asset.remoteUrl),
    };

    if (!state.prompt.trim()) {
      setState((current) => ({ ...current, notice: "Prompt is required before generating." }));
      return { ok: false as const, error: "missing_prompt" };
    }

    if (state.mode === "image_to_video" && readyAssets.image.length === 0) {
      setState((current) => ({
        ...current,
        notice: "Upload at least one keyframe image before generating.",
      }));
      return { ok: false as const, error: "missing_image_keyframe" };
    }

    if (
      state.mode !== "text_to_video" &&
      readyAssets.image.length === 0 &&
      readyAssets.video.length === 0
    ) {
      setState((current) => ({
        ...current,
        notice: "Upload at least one image or video reference before generating.",
      }));
      return { ok: false as const, error: "missing_references" };
    }

    if (
      state.assets.image.some((asset) => asset.status === "uploading") ||
      state.assets.video.some((asset) => asset.status === "uploading") ||
      state.assets.audio.some((asset) => asset.status === "uploading")
    ) {
      setState((current) => ({
        ...current,
        notice: "Please wait until all uploads finish before generating.",
      }));
      return { ok: false as const, error: "uploads_in_progress" };
    }

    setState((current) => ({
      ...current,
      isSubmitting: true,
      notice: null,
    }));

    try {
      type SubmitGenerationResponse = {
        id?: string;
        status?: string;
        error?: string;
        code?: string;
        required?: number;
      };

      const response = await fetch("/api/ai/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          videoModel: state.videoModel,
          mode: state.mode,
          prompt: state.prompt,
          resolution: state.resolution,
          durationSeconds: state.durationSeconds,
          aspectRatio: state.aspectRatio,
          containsRealPeople: state.containsRealPeople,
          returnLastFrame: state.returnLastFrame,
          generateAudio: state.generateAudio,
          webSearch: state.webSearch,
          images: readyAssets.image.map((asset) => ({
            id: asset.id,
            url: asset.remoteUrl,
            objectKey: asset.storagePath,
          })),
          videos: readyAssets.video.map((asset) => ({
            id: asset.id,
            url: asset.remoteUrl,
            objectKey: asset.storagePath,
          })),
          audios: readyAssets.audio.map((asset) => ({
            id: asset.id,
            url: asset.remoteUrl,
            objectKey: asset.storagePath,
          })),
        }),
      });

      const payload = (await response.json().catch(() => null)) as SubmitGenerationResponse | null;
      if (!response.ok || !payload?.id) {
        const error = new Error(payload?.error || "Failed to create generation") as Error & {
          code?: string;
          status?: number;
          required?: number;
        };
        error.code = payload?.code;
        error.status = response.status;
        error.required = payload?.required;
        throw error;
      }

      setState((current) => ({
        ...current,
        isSubmitting: false,
        activeGenerationId: payload.id ?? null,
        activeGenerationStatus: payload.status || "pending",
        notice: "Generation queued. You can continue editing or monitor progress in the dashboard.",
      }));

      return { ok: true as const, id: payload.id };
    } catch (error: any) {
      const code =
        error?.code ||
        (error?.status === 401
          ? "UNAUTHORIZED"
          : error?.status === 402
            ? "INSUFFICIENT_CREDITS"
            : undefined);
      setState((current) => ({
        ...current,
        isSubmitting: false,
        notice: error?.message || "Failed to create generation",
      }));
      return {
        ok: false as const,
        error: code || error?.message || "submit_failed",
        message: error?.message,
        required: error?.required,
      };
    }
  },
};

export function useMultiModalWorkspace() {
  const current = useSyncExternalStore(subscribe, snapshot, snapshot);
  const knownPreviewUrlsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const nextUrls = new Set(
      Object.values(current.assets)
        .flat()
        .map((asset) => asset.previewUrl)
        .filter((value): value is string => Boolean(value))
    );

    knownPreviewUrlsRef.current.forEach((url) => {
      if (!nextUrls.has(url)) {
        URL.revokeObjectURL(url);
        knownPreviewUrlsRef.current.delete(url);
      }
    });

    nextUrls.forEach((url) => knownPreviewUrlsRef.current.add(url));
  }, [current.assets]);

  useEffect(() => {
    return () => {
      knownPreviewUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      knownPreviewUrlsRef.current.clear();
    };
  }, []);

  return {
    ...current,
    estimatedCredits: estimateGenerationCredits({
      mode: current.mode,
      resolution: current.resolution,
      durationSeconds: current.durationSeconds,
      videos: current.assets.video.map((asset) => ({
        id: asset.id,
        kind: "video" as const,
        url: asset.remoteUrl || asset.previewUrl || asset.name,
      })),
      audios: current.assets.audio.map((asset) => ({
        id: asset.id,
        kind: "audio" as const,
        url: asset.remoteUrl || asset.previewUrl || asset.name,
      })),
    }),
    actions: workspaceActions,
  };
}
