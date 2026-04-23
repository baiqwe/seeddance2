"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { estimateGenerationCredits, type VideoGenerationMode } from "@/utils/video-generation";

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
  mode: VideoGenerationMode;
  prompt: string;
  resolution: "480p" | "720p" | "1080p";
  durationSeconds: 5 | 10 | 15;
  aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4" | "21:9" | "auto";
  containsRealPeople: boolean;
  returnLastFrame: boolean;
  assets: AssetBuckets;
  notice: string | null;
  isSubmitting: boolean;
  activeGenerationId: string | null;
  activeGenerationStatus: string | null;
};

const MAX_ASSETS: Record<WorkspaceAssetKind, number> = {
  image: 9,
  video: 3,
  audio: 3,
};

const initialState: WorkspaceState = {
  mode: "multi_modal_video",
  prompt: "",
  resolution: "1080p",
  durationSeconds: 5,
  aspectRatio: "16:9",
  containsRealPeople: true,
  returnLastFrame: true,
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

  const payload = await response.json().catch(() => null);
  if (!response.ok || !payload?.signedUrl || !payload?.publicUrl) {
    throw new Error(payload?.error || "Failed to prepare upload");
  }

  return payload as {
    path: string;
    publicUrl: string;
    signedUrl: string;
  };
}

function uploadToSignedUrl(url: string, file: File, onProgress: (progress: number) => void) {
  return new Promise<void>((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open("PUT", url);
    request.setRequestHeader("x-upsert", "false");
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

      reject(new Error(`Upload failed with status ${request.status}`));
    };
    request.onerror = () => reject(new Error("Network error during upload"));
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
  setMode(mode: VideoGenerationMode) {
    setState((current) => ({ ...current, mode }));
  },
  setPrompt(prompt: string) {
    setState((current) => ({ ...current, prompt: prompt.slice(0, 5000) }));
  },
  setResolution(resolution: WorkspaceState["resolution"]) {
    setState((current) => ({ ...current, resolution }));
  },
  setDurationSeconds(durationSeconds: WorkspaceState["durationSeconds"]) {
    setState((current) => ({ ...current, durationSeconds }));
  },
  setAspectRatio(aspectRatio: WorkspaceState["aspectRatio"]) {
    setState((current) => ({ ...current, aspectRatio }));
  },
  toggleContainsRealPeople() {
    setState((current) => ({ ...current, containsRealPeople: !current.containsRealPeople }));
  },
  toggleReturnLastFrame() {
    setState((current) => ({ ...current, returnLastFrame: !current.returnLastFrame }));
  },
  clearNotice() {
    setState((current) => ({ ...current, notice: null }));
  },
  addFiles(kind: WorkspaceAssetKind, files: File[]) {
    const remaining = MAX_ASSETS[kind] - state.assets[kind].length;
    const acceptedFiles = files.slice(0, Math.max(remaining, 0));
    const droppedCount = files.length - acceptedFiles.length;
    const created = acceptedFiles.map((file) => createAsset(file, kind));

    if (created.length === 0 && droppedCount > 0) {
      setState((current) => ({
        ...current,
        notice: `Only ${MAX_ASSETS[kind]} ${kind}${MAX_ASSETS[kind] > 1 ? "s" : ""} allowed in this lane.`,
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
      const response = await fetch("/api/ai/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mode: state.mode,
          prompt: state.prompt,
          resolution: state.resolution,
          durationSeconds: state.durationSeconds,
          aspectRatio: state.aspectRatio,
          containsRealPeople: state.containsRealPeople,
          returnLastFrame: state.returnLastFrame,
          images: readyAssets.image.map((asset) => ({
            id: asset.id,
            url: asset.remoteUrl,
          })),
          videos: readyAssets.video.map((asset) => ({
            id: asset.id,
            url: asset.remoteUrl,
          })),
          audios: readyAssets.audio.map((asset) => ({
            id: asset.id,
            url: asset.remoteUrl,
          })),
        }),
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok || !payload?.id) {
        throw new Error(payload?.error || "Failed to create generation");
      }

      setState((current) => ({
        ...current,
        isSubmitting: false,
        activeGenerationId: payload.id,
        activeGenerationStatus: payload.status || "pending",
        notice: "Generation queued. You can continue editing or monitor progress in the dashboard.",
      }));

      return { ok: true as const, id: payload.id };
    } catch (error: any) {
      setState((current) => ({
        ...current,
        isSubmitting: false,
        notice: error?.message || "Failed to create generation",
      }));
      return { ok: false as const, error: error?.message || "submit_failed" };
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
      audios: current.assets.audio.map((asset) => ({
        id: asset.id,
        kind: "audio" as const,
        url: asset.remoteUrl || asset.previewUrl || asset.name,
      })),
    }),
    actions: workspaceActions,
  };
}
