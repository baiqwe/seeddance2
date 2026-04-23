"use client";

import { useSyncExternalStore } from "react";
import { estimateGenerationCredits, type VideoGenerationMode } from "@/utils/video-generation";

export type WorkspaceAssetKind = "image" | "video" | "audio";
export type WorkspaceAssetStatus = "queued" | "uploading" | "ready";

export type WorkspaceAsset = {
  id: string;
  kind: WorkspaceAssetKind;
  name: string;
  sizeLabel: string;
  previewUrl: string | null;
  progress: number;
  status: WorkspaceAssetStatus;
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

function simulateUpload(kind: WorkspaceAssetKind, id: string) {
  const timer = window.setInterval(() => {
    const asset = state.assets[kind].find((item) => item.id === id);
    if (!asset) {
      window.clearInterval(timer);
      return;
    }

    const nextProgress = Math.min(100, asset.progress + 20 + Math.floor(Math.random() * 25));
    updateAsset(kind, id, (current) => ({
      ...current,
      progress: nextProgress,
      status: nextProgress >= 100 ? "ready" : "uploading",
    }));

    if (nextProgress >= 100) {
      window.clearInterval(timer);
    }
  }, 220);
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
    progress: 12,
    status: "uploading",
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

    created.forEach((asset) => simulateUpload(kind, asset.id));
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
};

export function useMultiModalWorkspace() {
  const current = useSyncExternalStore(subscribe, snapshot, snapshot);

  return {
    ...current,
    estimatedCredits: estimateGenerationCredits({
      mode: current.mode,
      resolution: current.resolution,
      durationSeconds: current.durationSeconds,
      audios: current.assets.audio.map((asset) => ({
        id: asset.id,
        kind: "audio" as const,
        url: asset.previewUrl || asset.name,
      })),
    }),
    actions: workspaceActions,
  };
}
