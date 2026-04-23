"use client";

import type { ComponentType, ReactNode } from "react";
import { useMemo } from "react";
import { useDropzone } from "react-dropzone";
import type { Accept } from "react-dropzone";
import { motion } from "framer-motion";
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  AudioLines,
  CheckCircle2,
  Clapperboard,
  Film,
  ImagePlus,
  Mic2,
  MonitorPlay,
  PlayCircle,
  Sparkles,
  Trash2,
  UploadCloud,
  WandSparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  useMultiModalWorkspace,
  type WorkspaceAsset,
  type WorkspaceAssetKind,
} from "@/hooks/use-multi-modal-workspace";
import type { VideoGenerationMode } from "@/utils/video-generation";

type WorkspaceCopy = {
  tabs: Array<{ label: string; mode: VideoGenerationMode }>;
  subtitle: string;
  uploadTitle: string;
  uploadHint: string;
  uploadMeta: string;
  containsRealPeople: string;
  returnLastFrame: string;
  promptLabel: string;
  promptPlaceholder: string;
  promptCounter: string;
  resolution: string;
  duration: string;
  aspectRatio: string;
  advanced: string;
  generate: string;
  queueTitle: string;
  queueEta: string;
  queueHint: string;
  previewTitle: string;
  previewSubtitle: string;
  stats: Array<{ label: string; value: string }>;
  quickPresetsTitle: string;
  presets: Array<{ name: string; prompt: string; mode: VideoGenerationMode }>;
  laneTitle: Record<WorkspaceAssetKind, string>;
  laneHint: Record<WorkspaceAssetKind, string>;
  estimatedCredits: string;
  noAssets: string;
};

type Props = {
  locale: string;
};

const COPY: Record<string, WorkspaceCopy> = {
  zh: {
    tabs: [
      { label: "多参考视频生成", mode: "multi_modal_video" },
      { label: "图像转视频", mode: "image_to_video" },
      { label: "文本转视频", mode: "text_to_video" },
    ],
    subtitle:
      "把图片、视频、音频和文本放进同一个创作台，让界面为画面让路。输入与输出都按电影级工作流组织。",
    uploadTitle: "拖入你的多模态素材",
    uploadHint: "每种模态独立排队、独立进度、可拖拽排序。这样后面接分片上传和真正的 staging 时不会推倒重来。",
    uploadMeta: "Images 9 · Videos 3 · Audios 3",
    containsRealPeople: "包含真人素材",
    returnLastFrame: "添加尾帧目标",
    promptLabel: "Prompt",
    promptPlaceholder:
      "例如：以 image-01 作为首帧角色，沿用 video-02 的推轨与镜头节奏，5 秒内从中景推进到近景，保留冷色夜景霓虹和电子鼓点推进感。",
    promptCounter: "5000 字符以内的自然语言控制",
    resolution: "分辨率",
    duration: "时长",
    aspectRatio: "画幅",
    advanced: "高级选项",
    generate: "Generate",
    queueTitle: "渲染队列",
    queueEta: "工作台状态已就绪",
    queueHint: "现在这里展示的是前端层的真实队列状态。接入后端后，这个面板会自然承接 provider job、轮询和失败恢复。",
    previewTitle: "Output Preview",
    previewSubtitle: "让结果成为视觉中心，让界面退后。",
    stats: [
      { label: "输入模态", value: "图 / 视 / 音 / 文" },
      { label: "控制维度", value: "参考 + Prompt + 队列" },
      { label: "适配流程", value: "生成 / 延展 / 编辑" },
    ],
    quickPresetsTitle: "一键代入工作流模板",
    presets: [
      {
        name: "舞蹈动作克隆",
        prompt: "用参考舞蹈视频的动作节奏，保持角色服装一致，生成 9:16 竖版短视频。",
        mode: "multi_modal_video",
      },
      {
        name: "广告产品镜头",
        prompt: "让产品图在黑色镜面桌面上完成 cinematic reveal，镜头缓慢推进并带有微弱高光扫过。",
        mode: "multi_modal_video",
      },
      {
        name: "电影预演",
        prompt: "参考第二段视频的推轨和转场节奏，把静帧角色扩展成连续镜头，保持场景连贯。",
        mode: "image_to_video",
      },
    ],
    laneTitle: {
      image: "图像参考",
      video: "视频参考",
      audio: "音频参考",
    },
    laneHint: {
      image: "首帧、角色、场景、尾帧",
      video: "动作、运镜、节奏、连续性",
      audio: "节拍、氛围、声音线索",
    },
    estimatedCredits: "预计扣费",
    noAssets: "当前还没有素材进入这一队列",
  },
  en: {
    tabs: [
      { label: "Multi-Reference Video", mode: "multi_modal_video" },
      { label: "Image to Video", mode: "image_to_video" },
      { label: "Text to Video", mode: "text_to_video" },
    ],
    subtitle:
      "Bring images, clips, audio, and text into one production-grade surface. The interface should step back so the media can lead.",
    uploadTitle: "Drop your multi-modal assets",
    uploadHint:
      "Each modality has its own queue, progress state, and order controls. That keeps the UX ready for chunked upload and real staging later.",
    uploadMeta: "Images 9 · Videos 3 · Audios 3",
    containsRealPeople: "Contains real people",
    returnLastFrame: "Add target last frame",
    promptLabel: "Prompt",
    promptPlaceholder:
      "Example: use image-01 as the opening character frame, borrow the push-in and pacing from video-02, move from medium shot to close-up in 5 seconds, and keep the cold neon night tone with an electronic beat ramp.",
    promptCounter: "Natural-language control, up to 5000 characters",
    resolution: "Resolution",
    duration: "Duration",
    aspectRatio: "Aspect Ratio",
    advanced: "Advanced",
    generate: "Generate",
    queueTitle: "Render Queue",
    queueEta: "Workspace state is live",
    queueHint: "This panel now reflects real front-end queue state. Once backend orchestration lands, it can naturally expand into provider jobs, polling, and retry handling.",
    previewTitle: "Output Preview",
    previewSubtitle: "Let the output become the focus and the interface recede.",
    stats: [
      { label: "Input Modes", value: "Image / Video / Audio / Text" },
      { label: "Control Layers", value: "References + Prompt + Queue" },
      { label: "Workflow", value: "Generate / Extend / Edit" },
    ],
    quickPresetsTitle: "Load workflow presets",
    presets: [
      {
        name: "Dance Motion Clone",
        prompt: "Transfer the choreography timing from the reference dance clip while keeping the character wardrobe consistent in a 9:16 short.",
        mode: "multi_modal_video",
      },
      {
        name: "Commercial Product Shot",
        prompt: "Reveal the product on a black reflective table with a slow cinematic push-in and a subtle specular sweep.",
        mode: "multi_modal_video",
      },
      {
        name: "Previs Storyboard",
        prompt: "Reuse the dolly move and transition rhythm from clip two, then extend the still character frame into a continuous shot.",
        mode: "image_to_video",
      },
    ],
    laneTitle: {
      image: "Image References",
      video: "Video References",
      audio: "Audio References",
    },
    laneHint: {
      image: "opening frame, character, scene, end frame",
      video: "motion, camera, timing, continuity",
      audio: "beat, atmosphere, sound cues",
    },
    estimatedCredits: "Estimated Cost",
    noAssets: "No assets in this queue yet",
  },
};

const RESOLUTIONS = ["480p", "720p", "1080p"] as const;
const DURATIONS = [5, 10, 15] as const;
const RATIOS = ["auto", "16:9", "9:16", "1:1", "4:3", "3:4", "21:9"] as const;

export function MultiModalWorkspace({ locale }: Props) {
  const copy = COPY[locale] ?? COPY.en;
  const {
    mode,
    prompt,
    resolution,
    durationSeconds,
    aspectRatio,
    containsRealPeople,
    returnLastFrame,
    assets,
    notice,
    estimatedCredits,
    actions,
  } = useMultiModalWorkspace();

  const promptLength = useMemo(() => prompt.length, [prompt]);

  return (
    <div id="workspace" className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="surface-panel relative overflow-hidden border-white/8 bg-[linear-gradient(180deg,rgba(8,11,18,0.98),rgba(7,9,16,0.94))] p-5 sm:p-6"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(125,211,252,0.08),transparent_24%),radial-gradient(circle_at_top_left,rgba(249,168,212,0.06),transparent_28%)]" />

        <div className="relative z-10 space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            {copy.tabs.map((tab) => (
              <button
                key={tab.mode}
                type="button"
                onClick={() => actions.setMode(tab.mode)}
                className={cn(
                  "rounded-full border px-4 py-2 text-sm font-semibold transition-all",
                  mode === tab.mode
                    ? "border-white/20 bg-white text-slate-950"
                    : "border-white/8 bg-white/[0.03] text-white/66 hover:border-white/16 hover:bg-white/[0.07]"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="space-y-2">
              <p className="text-sm uppercase tracking-[0.28em] text-white/38">Seedance Workspace</p>
              <h2 className="text-2xl font-black tracking-tight text-white sm:text-3xl">{copy.uploadTitle}</h2>
              <p className="max-w-2xl text-sm leading-7 text-white/56">{copy.subtitle}</p>
            </div>
            <div className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/72">
              {copy.uploadMeta}
            </div>
          </div>

          {notice ? (
            <div className="flex items-center gap-3 rounded-[20px] border border-amber-300/15 bg-amber-300/8 px-4 py-3 text-sm text-amber-100/90">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span className="flex-1">{notice}</span>
              <button type="button" onClick={actions.clearNotice} className="text-white/50 hover:text-white">
                ×
              </button>
            </div>
          ) : null}

          <div className="grid gap-4 lg:grid-cols-3">
            <UploadLane
              kind="image"
              title={copy.laneTitle.image}
              hint={copy.laneHint.image}
              assets={assets.image}
              onAddFiles={actions.addFiles}
              onMove={actions.moveAsset}
              onRemove={actions.removeAsset}
              emptyLabel={copy.noAssets}
            />
            <UploadLane
              kind="video"
              title={copy.laneTitle.video}
              hint={copy.laneHint.video}
              assets={assets.video}
              onAddFiles={actions.addFiles}
              onMove={actions.moveAsset}
              onRemove={actions.removeAsset}
              emptyLabel={copy.noAssets}
            />
            <UploadLane
              kind="audio"
              title={copy.laneTitle.audio}
              hint={copy.laneHint.audio}
              assets={assets.audio}
              onAddFiles={actions.addFiles}
              onMove={actions.moveAsset}
              onRemove={actions.removeAsset}
              emptyLabel={copy.noAssets}
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <TogglePill active={containsRealPeople} onClick={actions.toggleContainsRealPeople}>
              {copy.containsRealPeople}
            </TogglePill>
            <TogglePill active={returnLastFrame} onClick={actions.toggleReturnLastFrame}>
              {copy.returnLastFrame}
            </TogglePill>
          </div>

          <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-5">
            <div className="mb-3 flex items-center justify-between gap-3">
              <Label>{copy.promptLabel}</Label>
              <span className="text-xs uppercase tracking-[0.24em] text-white/38">{promptLength}/5000</span>
            </div>
            <Textarea
              value={prompt}
              onChange={(event) => actions.setPrompt(event.target.value)}
              placeholder={copy.promptPlaceholder}
              className="min-h-[150px] resize-none rounded-[18px] border-white/8 bg-black/20 text-base text-white placeholder:text-white/24 focus-visible:ring-cyan-300/30"
            />
            <div className="mt-3 text-sm text-white/42">{copy.promptCounter}</div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <OptionGroup
              title={copy.resolution}
              options={RESOLUTIONS}
              value={resolution}
              onChange={(next) => actions.setResolution(next as typeof resolution)}
            />
            <OptionGroup
              title={copy.duration}
              options={DURATIONS.map((value) => `${value}s`)}
              value={`${durationSeconds}s`}
              onChange={(next) => actions.setDurationSeconds(Number(next.replace("s", "")) as typeof durationSeconds)}
            />
            <OptionGroup
              title={copy.aspectRatio}
              options={RATIOS}
              value={aspectRatio}
              onChange={(next) => actions.setAspectRatio(next as typeof aspectRatio)}
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="rounded-full border border-white/8 bg-white/[0.03] px-4 py-2 text-sm text-white/70">
              {copy.estimatedCredits}: <span className="font-semibold text-white">{estimatedCredits} credits</span>
            </div>
            <Button className="rounded-full bg-white px-7 py-6 text-sm font-black uppercase tracking-[0.2em] text-slate-950 hover:bg-cyan-100">
              <WandSparkles className="mr-2 h-4 w-4" />
              {copy.generate}
            </Button>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.08, ease: "easeOut" }}
        className="space-y-6"
      >
        <div className="surface-panel overflow-hidden border-white/8 bg-[linear-gradient(180deg,rgba(8,11,18,0.98),rgba(8,10,16,0.92))] p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-white/38">{copy.previewTitle}</p>
              <h3 className="mt-2 text-2xl font-black text-white">{copy.previewSubtitle}</h3>
            </div>
            <PlayCircle className="h-6 w-6 text-white/66" />
          </div>

          <div className="mt-5 overflow-hidden rounded-[24px] border border-white/8 bg-[radial-gradient(circle_at_20%_10%,rgba(125,211,252,0.18),transparent_26%),radial-gradient(circle_at_80%_20%,rgba(249,168,212,0.12),transparent_24%),linear-gradient(160deg,#090f1c_0%,#101726_52%,#060811_100%)] p-6">
            <div className="flex items-center justify-between text-xs uppercase tracking-[0.26em] text-white/40">
              <span>Preview timeline</span>
              <span>{resolution} · {durationSeconds}s · {aspectRatio}</span>
            </div>
            <div className="mt-16 max-w-sm space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-3 py-1 text-xs text-white/90">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Cinematic reference lock
              </div>
              <div className="text-4xl font-black tracking-tight text-white">
                Quiet interface,
                <br />
                visible output.
              </div>
              <p className="text-sm leading-7 text-white/58">
                The surface should feel closer to a production console than a decorative AI dashboard.
              </p>
            </div>
            <div className="mt-16 flex items-center gap-3">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
                <div className="h-full w-[68%] rounded-full bg-[linear-gradient(90deg,#7dd3fc,#f9a8d4)]" />
              </div>
              <span className="text-sm text-white/44">68%</span>
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {copy.stats.map((stat) => (
              <div key={stat.label} className="rounded-[18px] border border-white/8 bg-white/[0.03] p-4">
                <div className="text-xs uppercase tracking-[0.22em] text-white/36">{stat.label}</div>
                <div className="mt-2 text-base font-semibold text-white">{stat.value}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="surface-panel border-white/8 bg-[linear-gradient(180deg,rgba(8,11,18,0.98),rgba(8,10,16,0.92))] p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-white/38">{copy.queueTitle}</p>
              <h3 className="mt-2 text-xl font-black text-white">{copy.queueEta}</h3>
            </div>
            <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-sm text-white/70">
              {assets.image.length + assets.video.length + assets.audio.length} assets loaded
            </div>
          </div>
          <div className="mt-5 space-y-4">
            <QueueItem title="Image lane" detail={`${assets.image.length} queued references`} progress={assets.image.length > 0 ? "done" : "idle"} />
            <QueueItem title="Video lane" detail={`${assets.video.length} queued motion clips`} progress={assets.video.length > 0 ? "active" : "idle"} />
            <QueueItem title="Audio lane" detail={`${assets.audio.length} queued audio cues`} progress={assets.audio.length > 0 ? "done" : "idle"} />
          </div>
          <p className="mt-4 text-sm leading-7 text-white/48">{copy.queueHint}</p>
        </div>

        <div className="surface-panel border-white/8 bg-[linear-gradient(180deg,rgba(8,11,18,0.98),rgba(8,10,16,0.92))] p-5">
          <Label>{copy.quickPresetsTitle}</Label>
          <div className="mt-4 space-y-3">
            {copy.presets.map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => actions.loadPreset(preset.prompt, preset.mode)}
                className="w-full rounded-[18px] border border-white/8 bg-white/[0.03] p-4 text-left transition-colors hover:border-white/16 hover:bg-white/[0.06]"
              >
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <Sparkles className="h-4 w-4 text-white/70" />
                  {preset.name}
                </div>
                <p className="mt-2 text-sm leading-6 text-white/52">{preset.prompt}</p>
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function UploadLane({
  kind,
  title,
  hint,
  assets,
  emptyLabel,
  onAddFiles,
  onMove,
  onRemove,
}: {
  kind: WorkspaceAssetKind;
  title: string;
  hint: string;
  assets: WorkspaceAsset[];
  emptyLabel: string;
  onAddFiles: (kind: WorkspaceAssetKind, files: File[]) => void;
  onMove: (kind: WorkspaceAssetKind, id: string, direction: "up" | "down") => void;
  onRemove: (kind: WorkspaceAssetKind, id: string) => void;
}) {
  const accept: Accept =
    kind === "image"
      ? { "image/*": [] }
      : kind === "video"
        ? { "video/*": [] }
        : { "audio/*": [] };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept,
    onDrop: (files) => onAddFiles(kind, files),
    multiple: true,
  });

  return (
    <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-base font-semibold text-white">{title}</div>
          <div className="mt-1 text-sm text-white/44">{hint}</div>
        </div>
        <div className="rounded-full border border-white/8 bg-white/[0.03] px-3 py-1 text-xs uppercase tracking-[0.18em] text-white/42">
          {assets.length}
        </div>
      </div>

      <div
        {...getRootProps()}
        className={cn(
          "mt-4 rounded-[18px] border border-dashed px-4 py-5 text-center transition-colors",
          isDragActive ? "border-white/20 bg-white/[0.06]" : "border-white/10 bg-black/10"
        )}
      >
        <input {...getInputProps()} />
        <UploadCloud className="mx-auto h-5 w-5 text-white/46" />
        <div className="mt-3 text-sm text-white/70">Drop {kind}s here or click to browse</div>
      </div>

      <div className="mt-4 space-y-3">
        {assets.length === 0 ? <div className="text-sm text-white/38">{emptyLabel}</div> : null}
        {assets.map((asset, index) => (
          <AssetRow
            key={asset.id}
            asset={asset}
            canMoveUp={index > 0}
            canMoveDown={index < assets.length - 1}
            onMove={(direction) => onMove(kind, asset.id, direction)}
            onRemove={() => onRemove(kind, asset.id)}
          />
        ))}
      </div>
    </div>
  );
}

function AssetRow({
  asset,
  canMoveUp,
  canMoveDown,
  onMove,
  onRemove,
}: {
  asset: WorkspaceAsset;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onMove: (direction: "up" | "down") => void;
  onRemove: () => void;
}) {
  const icon =
    asset.kind === "image" ? ImagePlus : asset.kind === "video" ? Film : Mic2;

  return (
    <div className="rounded-[16px] border border-white/8 bg-black/10 p-3">
      <div className="flex gap-3">
        <AssetThumb asset={asset} icon={icon} />
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-medium text-white">{asset.name}</div>
          <div className="mt-1 text-xs uppercase tracking-[0.18em] text-white/36">
            {asset.kind} · {asset.sizeLabel}
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-[linear-gradient(90deg,#7dd3fc,#f9a8d4)] transition-all"
              style={{ width: `${asset.progress}%` }}
            />
          </div>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <div className="text-xs text-white/44">
          {asset.status === "ready" ? "Ready for staging" : `${asset.progress}% uploaded`}
        </div>
        <div className="flex items-center gap-1">
          <IconButton disabled={!canMoveUp} onClick={() => onMove("up")}>
            <ArrowUp className="h-3.5 w-3.5" />
          </IconButton>
          <IconButton disabled={!canMoveDown} onClick={() => onMove("down")}>
            <ArrowDown className="h-3.5 w-3.5" />
          </IconButton>
          <IconButton onClick={onRemove}>
            <Trash2 className="h-3.5 w-3.5" />
          </IconButton>
        </div>
      </div>
    </div>
  );
}

function AssetThumb({
  asset,
  icon: Icon,
}: {
  asset: WorkspaceAsset;
  icon: ComponentType<{ className?: string }>;
}) {
  if (asset.previewUrl && asset.kind === "image") {
    return (
      <img
        src={asset.previewUrl}
        alt={asset.name}
        className="h-14 w-14 rounded-[12px] border border-white/8 object-cover"
      />
    );
  }

  if (asset.previewUrl && asset.kind === "video") {
    return (
      <video
        src={asset.previewUrl}
        muted
        playsInline
        className="h-14 w-14 rounded-[12px] border border-white/8 object-cover"
      />
    );
  }

  return (
    <div className="flex h-14 w-14 items-center justify-center rounded-[12px] border border-white/8 bg-white/[0.04] text-white/58">
      <Icon className="h-5 w-5" />
    </div>
  );
}

function Label({ children }: { children: ReactNode }) {
  return <div className="text-sm font-semibold uppercase tracking-[0.24em] text-white/46">{children}</div>;
}

function TogglePill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-all",
        active ? "border-white/16 bg-white/10 text-white" : "border-white/8 bg-white/[0.03] text-white/60"
      )}
    >
      <span className={cn("h-2.5 w-2.5 rounded-full", active ? "bg-emerald-300" : "bg-white/24")} />
      {children}
    </button>
  );
}

function OptionGroup({
  title,
  options,
  value,
  onChange,
}: {
  title: string;
  options: readonly string[];
  value: string;
  onChange: (next: string) => void;
}) {
  return (
    <div className="rounded-[22px] border border-white/8 bg-white/[0.03] p-4">
      <Label>{title}</Label>
      <div className="mt-3 flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-sm transition-colors",
              value === option
                ? "border-white bg-white text-slate-950"
                : "border-white/8 bg-transparent text-white/58 hover:bg-white/[0.05]"
            )}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

function QueueItem({
  title,
  detail,
  progress,
}: {
  title: string;
  detail: string;
  progress: "done" | "active" | "idle";
}) {
  const dotClass =
    progress === "done" ? "bg-emerald-300" : progress === "active" ? "bg-cyan-300" : "bg-white/20";

  return (
    <div className="flex items-start gap-3 rounded-[18px] border border-white/8 bg-white/[0.03] p-4">
      <span className={cn("mt-1 h-2.5 w-2.5 rounded-full", dotClass)} />
      <div>
        <div className="font-semibold text-white">{title}</div>
        <div className="mt-1 text-sm text-white/50">{detail}</div>
      </div>
    </div>
  );
}

function IconButton({
  children,
  disabled,
  onClick,
}: {
  children: ReactNode;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="rounded-full border border-white/8 bg-white/[0.03] p-2 text-white/54 transition-colors hover:bg-white/[0.07] hover:text-white disabled:cursor-not-allowed disabled:opacity-35"
    >
      {children}
    </button>
  );
}
