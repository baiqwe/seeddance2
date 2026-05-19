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
  Check,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/hooks/use-user";
import {
  useMultiModalWorkspace,
  type WorkspaceAsset,
  type WorkspaceAssetKind,
} from "@/hooks/use-multi-modal-workspace";
import {
  KIE_SEEDANCE_SUPPORTED_DURATIONS,
  KIE_SEEDANCE_SUPPORTED_RATIOS,
  KIE_SEEDANCE_SUPPORTED_RESOLUTIONS,
  getAssetLimitForMode,
  type VideoGenerationMode,
  type VideoModelId,
} from "@/utils/video-generation";

type WorkspaceCopy = {
  tabs: Array<{ label: string; mode: VideoGenerationMode }>;
  subtitle: string;
  uploadTitle: string;
  uploadHint: string;
  uploadMeta: string;
  modelLabel: string;
  modelName: string;
  modelDescription: string;
  modelBadges: string[];
  containsRealPeople: string;
  containsRealPeopleHint: string;
  returnLastFrame: string;
  returnLastFrameHint: string;
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
  queueBullets: string[];
  previewTitle: string;
  previewSubtitle: string;
  stats: Array<{ label: string; value: string }>;
  quickPresetsTitle: string;
  presets: Array<{ name: string; prompt: string; mode: VideoGenerationMode }>;
  laneTitle: Record<WorkspaceAssetKind, string>;
  laneHint: Record<WorkspaceAssetKind, string>;
  laneAction: Record<WorkspaceAssetKind, string>;
  laneEmptyMeta: Record<WorkspaceAssetKind, string>;
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
      "把图片、视频、音频和文本放进同一个创作台，让输入关系更清楚、输出更可控，也让界面真正服务于镜头结果。",
    uploadTitle: "拖入你的多模态素材",
    uploadHint: "把图像、动作参考和音频线索拆开管理，角色、镜头和节奏就能更清楚地分别控制。",
    uploadMeta: "Images 9 · Videos 3 · Audios 3",
    modelLabel: "AI 模型",
    modelName: "Seedance 2.0 Multi-Reference",
    modelDescription: "优先理解图像、视频、音频与文字之间的关系，适合做角色一致性、动作继承和镜头延展。",
    modelBadges: ["参考优先", "动作理解", "镜头延展"],
    containsRealPeople: "包含真人素材",
    containsRealPeopleHint: "启用后，会优先把人物身份、皮肤细节和镜头安全边界处理得更稳。",
    returnLastFrame: "添加尾帧目标",
    returnLastFrameHint: "给模型一个明确的终点画面，适合做延展、收束动作和更稳定的转场。",
    promptLabel: "Prompt",
    promptPlaceholder:
      "例如：以 image-01 作为首帧角色，沿用 video-02 的推轨与镜头节奏，5 秒内从中景推进到近景，保留冷色夜景霓虹和电子鼓点推进感。",
    promptCounter: "5000 字符以内的自然语言控制",
    resolution: "分辨率",
    duration: "时长",
    aspectRatio: "画幅",
    advanced: "高级选项",
    generate: "生成视频",
    queueTitle: "生成前检查",
    queueEta: "当前素材状态",
    queueHint: "先确认参考素材各自承担的职责，再发起生成。这样通常比一味加长 Prompt 更容易得到稳定结果。",
    queueBullets: [
      "先用图片锁定角色、场景和关键帧，再决定镜头应该怎么动。",
      "参考视频更适合描述动作、运镜和节奏，而不是取代所有文字说明。",
      "音频参考更适合给节拍和情绪，不适合单独承担画面结构。",
      "只要你关心稳定性，就尽量明确“谁负责角色，谁负责动作，谁负责节奏”。",
    ],
    previewTitle: "预览样片",
    previewSubtitle: "让结果成为视觉中心，让界面退后一步。",
    stats: [
      { label: "输入模态", value: "图 / 视 / 音 / 文" },
      { label: "控制维度", value: "参考 + Prompt + 进度" },
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
      image: "角色与关键帧",
      video: "动作与镜头",
      audio: "音频与节奏",
    },
    laneHint: {
      image: "角色设定、起始画面、场景、尾帧目标",
      video: "动作、运镜、速度、连续性",
      audio: "节拍、氛围、情绪提示",
    },
    laneAction: {
      image: "上传图片",
      video: "上传视频",
      audio: "上传音频",
    },
    laneEmptyMeta: {
      image: "最多 9 张",
      video: "最多 3 段 / 合计 15 秒",
      audio: "最多 3 段 / 合计 15 秒",
    },
    estimatedCredits: "预计扣费",
    noAssets: "当前还没有添加参考素材",
  },
  en: {
    tabs: [
      { label: "Multi-Reference Video", mode: "multi_modal_video" },
      { label: "Image to Video", mode: "image_to_video" },
      { label: "Text to Video", mode: "text_to_video" },
    ],
    subtitle:
      "Bring images, clips, audio, and text into one production-grade surface so identity, motion, and timing can be controlled more intentionally.",
    uploadTitle: "Drop your multi-modal assets",
    uploadHint:
      "Separate stills, motion clips, and audio cues so identity, camera behavior, and timing can be directed more clearly.",
    uploadMeta: "Images 9 · Videos 3 · Audios 3",
    modelLabel: "AI Model",
    modelName: "Seedance 2.0 Multi-Reference",
    modelDescription: "Built to interpret images, clips, audio, and text together, with stronger control over identity, motion transfer, and shot extension.",
    modelBadges: ["Reference-first", "Motion-aware", "Extendable"],
    containsRealPeople: "Contains real people",
    containsRealPeopleHint: "Use this when human identity, skin detail, and safer portrait behavior need extra stability.",
    returnLastFrame: "Add target last frame",
    returnLastFrameHint: "Give the model a visual destination for endings, transitions, and more stable clip extension.",
    promptLabel: "Prompt",
    promptPlaceholder:
      "Example: use image-01 as the opening character frame, borrow the push-in and pacing from video-02, move from medium shot to close-up in 5 seconds, and keep the cold neon night tone with an electronic beat ramp.",
    promptCounter: "Natural-language control, up to 5000 characters",
    resolution: "Resolution",
    duration: "Duration",
    aspectRatio: "Aspect Ratio",
    advanced: "Advanced",
    generate: "Generate",
    queueTitle: "Pre-flight check",
    queueEta: "Current asset state",
    queueHint: "Use this area to confirm that each reference has a clear job before you generate. Stable outputs usually come from clearer responsibilities, not longer prompts.",
    queueBullets: [
      "Use images to lock identity, scene layout, and keyframes before pushing motion further.",
      "Use reference clips for body movement, camera travel, and pacing rather than trying to describe all motion in text alone.",
      "Use audio for beat and mood cues, not as the only structural input.",
      "The clearest results usually come from assigning one role to each reference type.",
    ],
    previewTitle: "Output Preview",
    previewSubtitle: "Let the output become the focus and the interface recede.",
    stats: [
      { label: "Input Modes", value: "Image / Video / Audio / Text" },
      { label: "Control Layers", value: "References + Prompt + Progress" },
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
      image: "Character & keyframes",
      video: "Motion & camera",
      audio: "Audio & timing",
    },
    laneHint: {
      image: "identity, opening frame, scene, end frame",
      video: "motion, camera, pacing, continuity",
      audio: "beat, atmosphere, cue timing",
    },
    laneAction: {
      image: "Upload images",
      video: "Upload videos",
      audio: "Upload audio",
    },
    laneEmptyMeta: {
      image: "Up to 9 files",
      video: "Up to 3 clips / 15s total",
      audio: "Up to 3 clips / 15s total",
    },
    estimatedCredits: "Estimated Cost",
    noAssets: "No reference assets added yet",
  },
};

const RESOLUTIONS = KIE_SEEDANCE_SUPPORTED_RESOLUTIONS;
const DURATIONS = KIE_SEEDANCE_SUPPORTED_DURATIONS;
const RATIOS = KIE_SEEDANCE_SUPPORTED_RATIOS;
const VIDEO_MODEL_OPTIONS: VideoModelId[] = ["bytedance/seedance-2", "bytedance/seedance-2-fast"];

const VIDEO_MODEL_META: Record<string, Record<VideoModelId, { name: string; description: string; badges: string[] }>> = {
  zh: {
    "bytedance/seedance-2": {
      name: "Seedance 2.0",
      description: "标准质量模型，更适合角色稳定性、镜头层次和更完整的多参考视频生成。",
      badges: ["高质量", "多参考", "镜头稳定"],
    },
    "bytedance/seedance-2-fast": {
      name: "Seedance 2 Fast",
      description: "更适合快速验证方向、快速试错和先把镜头节奏跑通，再决定是否切回标准模型。",
      badges: ["更快出片", "概念验证", "快速迭代"],
    },
  },
  en: {
    "bytedance/seedance-2": {
      name: "Seedance 2.0",
      description: "The quality-first model for stronger identity consistency, richer shot design, and deeper multi-reference generation.",
      badges: ["Higher quality", "Multi-reference", "Stable shots"],
    },
    "bytedance/seedance-2-fast": {
      name: "Seedance 2 Fast",
      description: "Optimized for faster iteration when you want to validate direction, pacing, and camera ideas before committing to the standard model.",
      badges: ["Faster output", "Concept testing", "Rapid iteration"],
    },
  },
};

const PREVIEW_REELS: Record<VideoGenerationMode, { src: string; label: string; headlineZh: string; headlineEn: string; bodyZh: string; bodyEn: string }> = {
  multi_modal_video: {
    src: "/videos/gallery/seedance-autumn-duel.mp4",
    label: "Cinematic action sample",
    headlineZh: "让角色、动作和运镜在同一个镜头里配合起来。",
    headlineEn: "Let identity, movement, and camera travel work together in one shot.",
    bodyZh: "这类完整动作样片更适合展示多参考工作流的价值：主体需要稳定，动作需要有节奏，镜头也要沿着同一个意图推进。",
    bodyEn: "A full action sample shows the value of the multi-reference workflow more clearly: the subject stays stable, the motion keeps its rhythm, and the camera move follows one consistent intent.",
  },
  image_to_video: {
    src: "/videos/gallery/seedance-hero-4.mp4",
    label: "Balance beam sample",
    headlineZh: "先锁定起始画面，再把动作慢慢推出来。",
    headlineEn: "Lock the opening frame first, then let the motion build from it.",
    bodyZh: "这条体操样片更适合说明图生视频的典型做法：角色与场景先稳定住，再用镜头和节奏把静帧推进成连续动作。",
    bodyEn: "This gymnastics sample shows the core image-to-video pattern more clearly: stabilize the subject and scene first, then build movement and pacing on top of that still frame.",
  },
  text_to_video: {
    src: "/videos/gallery/seedance-hero-6.mp4",
    label: "Narrative rush sample",
    headlineZh: "先把戏剧张力写清楚，再让镜头自己长出来。",
    headlineEn: "Write the urgency first, then let the shot language grow from it.",
    bodyZh: "这条街头奔跑样片更像文本转视频的真实起点：先描述情境、冲突和推进感，再决定后续是否补参考素材。",
    bodyEn: "This street-running sample is closer to how text-to-video usually starts in practice: describe the situation, tension, and forward drive first, then decide whether references are needed later.",
  },
  video_extension: {
    src: "/videos/gallery/video-extension.mp4",
    label: "Extension sample",
    headlineZh: "沿着已有镜头，把叙事继续下去。",
    headlineEn: "Continue the shot without breaking the scene logic.",
    bodyZh: "更适合扩写现有片段、延续角色动作和保留空间关系，让生成结果更像真正的接续镜头。",
    bodyEn: "Ideal for continuing an existing clip while preserving movement, identity, and spatial continuity.",
  },
};

export function MultiModalWorkspace({ locale }: Props) {
  const copy = COPY[locale] ?? COPY.en;
  const videoModelMeta = VIDEO_MODEL_META[locale] ?? VIDEO_MODEL_META.en;
  const {
    videoModel,
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
    isSubmitting,
    activeGenerationId,
    activeGenerationStatus,
    actions,
  } = useMultiModalWorkspace();
  const { toast } = useToast();
  const { user } = useUser();

  const promptLength = useMemo(() => prompt.length, [prompt]);
  const activePreview = PREVIEW_REELS[mode];
  const activeModel = videoModelMeta[videoModel];
  const localizedNotice = useMemo(() => formatWorkspaceNotice(notice, locale), [notice, locale]);
  const imageLimit = getAssetLimitForMode(mode, "image");
  const videoLimit = getAssetLimitForMode(mode, "video");
  const audioLimit = getAssetLimitForMode(mode, "audio");
  const currentUploadTitle =
    mode === "text_to_video"
      ? locale === "zh"
        ? "这个模式只需要一段清晰的文字描述"
        : "This mode starts with a clear text prompt"
      : mode === "image_to_video"
        ? locale === "zh"
          ? "上传 1 到 2 张关键帧图片"
          : "Upload 1 to 2 keyframe images"
        : copy.uploadTitle;
  const currentUploadHint =
    mode === "text_to_video"
      ? locale === "zh"
        ? "这个工作流先以提示词为主。先把主体、镜头运动、节奏和氛围说清楚，再进入生成。"
        : "This workflow starts prompt-first. Describe the subject, camera motion, pacing, and atmosphere clearly before you generate."
      : mode === "image_to_video"
        ? locale === "zh"
          ? "图生视频适合使用首帧 / 尾帧图片工作流。第一张图负责起始画面，第二张图可作为尾帧目标。"
          : "Image-to-video works best with a first-frame / last-frame workflow. The first image starts the shot, and the optional second image becomes the target ending frame."
        : copy.uploadHint;
  const showImageLane = imageLimit > 0;
  const showVideoLane = videoLimit > 0;
  const showAudioLane = audioLimit > 0;
  const showLastFrameToggle = mode !== "text_to_video";

  async function handleGenerate() {
    if (!user) {
      toast({
        title: locale === "zh" ? "请先登录" : "Sign in required",
        description:
          locale === "zh"
            ? "登录后才能创建视频任务并记录积分消耗。"
            : "Sign in before creating a generation job and tracking credits.",
      });
      return;
    }

    const result = await actions.submitGeneration();
    if (result.ok) {
      toast({
        title: locale === "zh" ? "任务已进入队列" : "Generation queued",
        description:
          locale === "zh"
            ? "视频请求已经提交。你可以继续整理素材，或前往控制台查看进度。"
            : "Your video request has been submitted. You can keep editing or track progress in the dashboard.",
      });
      return;
    }

    toast({
      title: locale === "zh" ? "生成未启动" : "Generation not started",
      description:
        result.error === "missing_prompt"
          ? locale === "zh"
            ? "先补充 Prompt 再发起生成。"
            : "Add a prompt before starting generation."
          : result.error === "missing_image_keyframe"
            ? locale === "zh"
              ? "图生视频模式下，请至少上传一张关键帧图片。"
              : "Upload at least one keyframe image in image-to-video mode."
          : result.error === "missing_references"
            ? locale === "zh"
              ? "至少准备一个图像或视频参考。"
              : "Prepare at least one image or video reference."
            : result.error === "uploads_in_progress"
              ? locale === "zh"
                ? "还有素材在上传中，等上传完成后再生成。"
                : "Some assets are still uploading. Wait for them to finish first."
              : locale === "zh"
                ? "创建任务时出错，请稍后再试。"
                : "Something went wrong while creating the generation.",
      variant: "destructive",
    });
  }

  return (
    <div id="workspace" className="mx-auto max-w-7xl rounded-[30px] border border-white/10 bg-[#181a1f]/96 p-4 shadow-[0_34px_90px_-44px_rgba(0,0,0,0.8)] backdrop-blur-xl md:p-5">
      <div className="grid gap-5 xl:grid-cols-[390px_minmax(0,1fr)]">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="rounded-[22px] border border-white/8 bg-[#24252c] p-4 xl:sticky xl:top-24 xl:self-start"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-2">
            {copy.tabs.map((tab) => (
              <button
                key={tab.mode}
                type="button"
                onClick={() => actions.setMode(tab.mode)}
                className={cn(
                  "rounded-lg border px-3 py-2 text-xs font-medium transition-all",
                  mode === tab.mode
                    ? "border-white/20 bg-white text-black"
                    : "border-white/10 bg-[#2a2b33] text-white/82 hover:border-white/16 hover:bg-white/[0.05]"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="space-y-3 rounded-[18px] border border-white/8 bg-[#1c1f26] p-3.5">
            <div className="text-[11px] uppercase tracking-[0.18em] text-white/38">{copy.modelLabel}</div>
            <div className="rounded-[14px] border border-white/10 bg-[linear-gradient(180deg,#2a2d36_0%,#242730_100%)] p-3.5">
              <div className="flex items-start gap-3">
                <span className="mt-3 h-3 w-3 shrink-0 rounded-full bg-[linear-gradient(135deg,#5ad7ff,#7d57ff)] shadow-[0_0_18px_rgba(93,103,255,0.55)]" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <div className="truncate text-sm font-medium text-white">{activeModel.name}</div>
                    <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.14em] text-emerald-200">
                      {locale === "zh" ? "已启用" : "Active"}
                    </span>
                  </div>
                  <div className="mt-3">
                    <Select value={videoModel} onValueChange={(value) => actions.setVideoModel(value as VideoModelId)}>
                      <SelectTrigger className="h-11 rounded-[12px] border-white/10 bg-[#171920] text-left text-sm text-white focus:ring-[#2563ff]/35 focus:ring-offset-0">
                        <SelectValue placeholder={locale === "zh" ? "选择视频模型" : "Choose a video model"} />
                      </SelectTrigger>
                      <SelectContent className="border-white/10 bg-[#171920] text-white">
                        {VIDEO_MODEL_OPTIONS.map((modelOptionKey) => {
                          const modelOption = videoModelMeta[modelOptionKey];
                          return (
                          <SelectItem
                            key={modelOptionKey}
                            value={modelOptionKey}
                            className="rounded-[10px] py-2.5 pl-8 pr-3 text-sm text-white focus:bg-white/[0.08] focus:text-white"
                          >
                            {modelOption.name}
                          </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="mt-3 text-xs leading-5 text-white/46">{activeModel.description}</div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {activeModel.badges.map((badge) => (
                      <span key={badge} className="rounded-full border border-white/8 bg-white/[0.05] px-2.5 py-1 text-[11px] text-white/68">
                        {badge}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {localizedNotice ? (
            <div className="flex items-center gap-3 rounded-[14px] border border-amber-300/15 bg-amber-300/8 px-4 py-3 text-sm text-amber-100/90">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span className="flex-1">{localizedNotice}</span>
              <button type="button" onClick={actions.clearNotice} className="text-white/50 hover:text-white">
                ×
              </button>
            </div>
          ) : null}

          <div className="rounded-[16px] border border-white/8 bg-[#1d1f26] p-4">
            <div className="text-sm font-medium text-white">{currentUploadTitle}</div>
            <p className="mt-2 text-sm leading-7 text-white/56">{currentUploadHint}</p>
          </div>

          {showImageLane || showVideoLane || showAudioLane ? (
            <div className="space-y-3">
              {showImageLane ? (
                <UploadLane
                  locale={locale}
                  kind="image"
                  title={copy.laneTitle.image}
                  hint={copy.laneHint.image}
                  actionLabel={copy.laneAction.image}
                  limitLabel={imageLimit === 2 ? (locale === "zh" ? "最多 2 张 / 首帧 + 尾帧" : "Up to 2 images / first + last frame") : copy.laneEmptyMeta.image}
                  assets={assets.image}
                  onAddFiles={actions.addFiles}
                  onMove={actions.moveAsset}
                  onRemove={actions.removeAsset}
                  emptyLabel={copy.noAssets}
                />
              ) : null}
              {showVideoLane ? (
                <UploadLane locale={locale} kind="video" title={copy.laneTitle.video} hint={copy.laneHint.video} actionLabel={copy.laneAction.video} limitLabel={copy.laneEmptyMeta.video} assets={assets.video} onAddFiles={actions.addFiles} onMove={actions.moveAsset} onRemove={actions.removeAsset} emptyLabel={copy.noAssets} />
              ) : null}
              {showAudioLane ? (
                <UploadLane locale={locale} kind="audio" title={copy.laneTitle.audio} hint={copy.laneHint.audio} actionLabel={copy.laneAction.audio} limitLabel={copy.laneEmptyMeta.audio} assets={assets.audio} onAddFiles={actions.addFiles} onMove={actions.moveAsset} onRemove={actions.removeAsset} emptyLabel={copy.noAssets} />
              ) : null}
            </div>
          ) : (
            <div className="rounded-[16px] border border-dashed border-white/10 bg-[#1c1f26] px-4 py-5 text-sm leading-7 text-white/54">
              {locale === "zh"
                ? "这个模式当前不需要上传参考素材。直接把主体、镜头、节奏和氛围写清楚，就可以发起生成。"
                : "This mode does not need reference uploads right now. Describe the subject, camera move, pacing, and atmosphere clearly, then generate."}
            </div>
          )}

          <div className="rounded-[16px] border border-white/8 bg-[#1d1f26] p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <Label>{copy.promptLabel}</Label>
              <span className="text-[11px] text-white/36">{promptLength}/5000</span>
            </div>
            <Textarea
              value={prompt}
              onChange={(event) => actions.setPrompt(event.target.value)}
              placeholder={copy.promptPlaceholder}
              className="min-h-[110px] resize-none rounded-[12px] border-white/10 bg-[#111318] text-sm leading-7 text-white placeholder:text-white/32 focus-visible:ring-[#2563ff]/40"
            />
            <div className="mt-3 text-xs text-white/42">{copy.promptCounter}</div>
          </div>

          <details className="group rounded-[16px] border border-white/8 bg-[#1d1f26] p-4">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-medium text-white">
              <span>{copy.advanced}</span>
              <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-1 text-[11px] text-white/56 transition-colors group-open:bg-[#2563ff]/15 group-open:text-[#bfdbfe]">
                {locale === "zh" ? "比例 / 时长 / 安全选项" : "ratio / duration / safety"}
              </span>
            </summary>
            <div className="mt-4 space-y-3">
              <div className="space-y-2.5">
                <TogglePill
                  active={containsRealPeople}
                  onClick={actions.toggleContainsRealPeople}
                  label={copy.containsRealPeople}
                  hint={copy.containsRealPeopleHint}
                />
                {showLastFrameToggle ? (
                  <TogglePill
                    active={returnLastFrame}
                    onClick={actions.toggleReturnLastFrame}
                    label={copy.returnLastFrame}
                    hint={copy.returnLastFrameHint}
                  />
                ) : null}
              </div>
              <OptionGroup
                title={copy.resolution}
                options={RESOLUTIONS}
                value={resolution}
                onChange={(next) => actions.setResolution(next as typeof resolution)}
              />
              <DurationSlider
                title={copy.duration}
                options={DURATIONS}
                value={durationSeconds}
                onChange={(next) => actions.setDurationSeconds(next as typeof durationSeconds)}
              />
              <OptionGroup
                title={copy.aspectRatio}
                options={RATIOS}
                value={aspectRatio}
                onChange={(next) => actions.setAspectRatio(next as typeof aspectRatio)}
              />
            </div>
          </details>

          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <div className="rounded-lg border border-white/10 bg-[#1d1f26] px-4 py-2 text-sm text-white/78">
                {copy.estimatedCredits}: <span className="font-semibold text-white">{estimatedCredits} credits</span>
              </div>
              {activeGenerationId ? (
                <div className="rounded-lg border border-[#2563ff]/20 bg-[#2563ff]/10 px-4 py-2 text-sm text-white">
                  {locale === "zh" ? "任务" : "Job"} {activeGenerationStatus ?? "pending"} · {activeGenerationId.slice(0, 8)}
                </div>
              ) : null}
            </div>
            <Button
              onClick={() => void handleGenerate()}
              disabled={isSubmitting}
              className="h-12 w-full rounded-[12px] bg-[linear-gradient(90deg,#8b8b95,#6d28d9)] text-sm font-medium text-white hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <WandSparkles className="mr-2 h-4 w-4" />
              {isSubmitting ? (locale === "zh" ? "提交中" : "Submitting") : copy.generate}
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
        <div className="rounded-[22px] border border-white/8 bg-[#24252c] p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-white/38">{copy.previewTitle}</p>
              <h3 className="mt-2 text-xl font-semibold text-white">{copy.previewSubtitle}</h3>
            </div>
            <PlayCircle className="h-6 w-6 text-white/66" />
          </div>

          <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.25fr)_320px]">
            <div className="rounded-[18px] border border-white/8 bg-[#1d1f26] p-3">
              <div className="flex items-center justify-between px-1 pb-3 pt-1 text-[11px] uppercase tracking-[0.16em] text-white/40">
                <span>{activePreview.label}</span>
                <span>{resolution} · {durationSeconds}s · {aspectRatio}</span>
              </div>
              <div className="overflow-hidden rounded-[16px] border border-white/6 bg-black">
                <video
                  key={activePreview.src}
                  src={activePreview.src}
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="metadata"
                  controls
                  className="aspect-[16/10] w-full object-contain"
                />
              </div>
            </div>

            <div className="space-y-4 rounded-[18px] border border-white/8 bg-[#1d1f26] p-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.07] px-3 py-1 text-xs text-white/92">
                <CheckCircle2 className="h-3.5 w-3.5" />
                {locale === "zh" ? "样例预览已就位" : "Preview reel loaded"}
              </div>
              <div className="text-2xl font-semibold tracking-tight text-white">
                {locale === "zh" ? activePreview.headlineZh : activePreview.headlineEn}
              </div>
              <p className="text-sm leading-7 text-white/74">
                {locale === "zh" ? activePreview.bodyZh : activePreview.bodyEn}
              </p>
              <div className="grid gap-3">
                {copy.stats.map((stat) => (
                  <div key={stat.label} className="rounded-[14px] border border-white/8 bg-[#14161c] p-4">
                    <div className="text-[11px] uppercase tracking-[0.16em] text-white/36">{stat.label}</div>
                    <div className="mt-2 text-sm font-medium text-white">{stat.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="rounded-[22px] border border-white/8 bg-[#24252c] p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-white/38">{copy.queueTitle}</p>
                <h3 className="mt-2 text-base font-semibold text-white">{locale === "zh" ? "让每一类参考素材都承担自己最擅长的工作。" : "Let each reference type carry the part it handles best."}</h3>
              </div>
              <MonitorPlay className="h-5 w-5 text-white/40" />
            </div>
            <div className="mt-4 rounded-[14px] border border-white/8 bg-[#1d1f26] p-4 text-sm leading-7 text-white/74">
              <p>{copy.queueHint}</p>
              <ul className="mt-3 space-y-2">
                {copy.queueBullets.map((item) => (
                  <li key={item} className="flex gap-3">
                    <Check className="mt-1 h-4 w-4 shrink-0 text-cyan-300" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-4 space-y-3">
              <QueueItem title={copy.laneTitle.image} detail={locale === "zh" ? `${assets.image.length} 个图像素材用于角色与关键帧` : `${assets.image.length} image assets for identity and keyframes`} progress={assets.image.length > 0 ? "done" : "idle"} />
              <QueueItem title={copy.laneTitle.video} detail={locale === "zh" ? `${assets.video.length} 个视频素材用于动作与运镜` : `${assets.video.length} motion clips for movement and camera`} progress={assets.video.length > 0 ? "active" : "idle"} />
              <QueueItem title={copy.laneTitle.audio} detail={locale === "zh" ? `${assets.audio.length} 个音频素材用于节奏与氛围` : `${assets.audio.length} audio cues for rhythm and timing`} progress={assets.audio.length > 0 ? "done" : "idle"} />
              {activeGenerationId ? (
                <QueueItem
                  title={locale === "zh" ? "当前任务" : "Current task"}
                  detail={
                    locale === "zh"
                      ? `任务 ${activeGenerationId.slice(0, 8)} 当前状态：${activeGenerationStatus ?? "pending"}`
                      : `Job ${activeGenerationId.slice(0, 8)} is currently ${activeGenerationStatus ?? "pending"}`
                  }
                  progress="active"
                />
              ) : null}
            </div>
          </div>

          <div className="rounded-[22px] border border-white/8 bg-[#24252c] p-4">
            <Label>{copy.quickPresetsTitle}</Label>
            <div className="mt-4 space-y-3">
              {copy.presets.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => actions.loadPreset(preset.prompt, preset.mode)}
                  className="w-full rounded-[14px] border border-white/6 bg-[#151518] p-4 text-left transition-colors hover:border-white/14 hover:bg-white/[0.04]"
                >
                  <div className="flex items-center gap-2 text-sm font-medium text-white">
                    <Sparkles className="h-4 w-4 text-white/70" />
                    {preset.name}
                  </div>
                  <p className="mt-2 text-sm leading-6 text-white/52">{preset.prompt}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
      </div>
    </div>
  );
}

function UploadLane({
  locale,
  kind,
  title,
  hint,
  actionLabel,
  limitLabel,
  assets,
  emptyLabel,
  onAddFiles,
  onMove,
  onRemove,
}: {
  kind: WorkspaceAssetKind;
  locale: string;
  title: string;
  hint: string;
  actionLabel: string;
  limitLabel: string;
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
    <div className="rounded-[16px] border border-white/8 bg-[#1d1f26] p-3.5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-medium text-white">{title}</div>
          <div className="mt-1 text-xs text-white/44">{hint}</div>
        </div>
        <div className="space-y-1 text-right">
          <div className="rounded-full border border-white/8 bg-white/[0.03] px-2.5 py-1 text-[11px] uppercase tracking-[0.14em] text-white/42">
            {assets.length}
          </div>
          <div className="text-[11px] text-white/30">{limitLabel}</div>
        </div>
      </div>

      <div
        {...getRootProps()}
        className={cn(
          "mt-3 rounded-[14px] border border-dashed px-4 py-5 text-center transition-colors",
          isDragActive ? "border-[#2563ff]/50 bg-[#2563ff]/8" : "border-white/12 bg-[#121318]"
        )}
        >
        <input {...getInputProps()} />
        <UploadCloud className="mx-auto h-5 w-5 text-[#76a3ff]" />
        <div className="mt-3 text-sm font-medium text-white/86">{actionLabel}</div>
        <div className="mt-1 text-xs text-white/36">{limitLabel}</div>
      </div>

      <div className="mt-4 space-y-3">
        {assets.length === 0 ? <div className="text-sm text-white/38">{emptyLabel}</div> : null}
        {assets.map((asset, index) => (
          <AssetRow
            key={asset.id}
            asset={asset}
            locale={locale}
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
  locale,
  canMoveUp,
  canMoveDown,
  onMove,
  onRemove,
}: {
  asset: WorkspaceAsset;
  locale: string;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onMove: (direction: "up" | "down") => void;
  onRemove: () => void;
}) {
  const icon =
    asset.kind === "image" ? ImagePlus : asset.kind === "video" ? Film : Mic2;

  return (
    <div className="rounded-[12px] border border-white/8 bg-[#15171d] p-3">
      <div className="flex gap-3">
        <AssetThumb asset={asset} icon={icon} />
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-medium text-white">{asset.name}</div>
          <div className="mt-1 text-xs uppercase tracking-[0.18em] text-white/36">
            {asset.kind} · {asset.sizeLabel}
          </div>
          <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-[linear-gradient(90deg,#2563ff,#8b5cf6)] transition-all"
              style={{ width: `${asset.progress}%` }}
            />
          </div>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <div className="text-xs text-white/44">
          {asset.status === "ready"
            ? locale === "zh"
              ? "已准备好生成"
              : "Ready to generate"
            : asset.status === "error"
              ? formatWorkspaceNotice(asset.error || "Upload failed", locale)
              : locale === "zh"
                ? `已上传 ${asset.progress}%`
                : `${asset.progress}% uploaded`}
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
        preload="metadata"
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
  return <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-white/46">{children}</div>;
}

function TogglePill({
  active,
  onClick,
  label,
  hint,
}: {
  active: boolean;
  onClick: () => void;
  label: ReactNode;
  hint: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center justify-between rounded-[14px] border px-4 py-3.5 text-sm transition-all",
        active
          ? "border-cyan-300/28 bg-[linear-gradient(180deg,rgba(93,211,255,0.12),rgba(255,255,255,0.04))] text-white"
          : "border-white/10 bg-[#1d1f26] text-white/82 hover:border-white/16"
      )}
    >
      <span className="min-w-0 pr-4 text-left">
        <span className="block text-sm font-medium text-white">{label}</span>
        <span className="mt-1 block text-xs leading-5 text-white/50">{hint}</span>
      </span>
      <span className={cn("flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition-colors", active ? "bg-cyan-300/30" : "bg-white/8")}>
        <span className={cn("flex h-5 w-5 items-center justify-center rounded-full transition-transform", active ? "translate-x-5 bg-white text-slate-950" : "translate-x-0 bg-white/65 text-transparent")}>
          <Check className="h-3 w-3" />
        </span>
      </span>
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
  if (options.length <= 1) {
    return (
      <div className="rounded-[16px] border border-white/8 bg-[#1d1f26] p-4">
        <Label>{title}</Label>
        <div className="mt-3 inline-flex rounded-xl border border-white/10 bg-[#15171d] px-3.5 py-2 text-sm text-white/76">
          {options[0]}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[16px] border border-white/8 bg-[#1d1f26] p-4">
      <Label>{title}</Label>
      <div className="mt-3 flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={cn(
              title.toLowerCase().includes("aspect") || title.includes("画幅")
                ? "flex h-14 w-14 flex-col items-center justify-center rounded-xl border text-[11px] transition-colors"
                : "rounded-xl border px-3.5 py-2 text-sm transition-colors",
              value === option
                ? "border-cyan-300/30 bg-white text-slate-950 shadow-[0_6px_20px_-10px_rgba(255,255,255,0.85)]"
                : "border-white/10 bg-[#15171d] text-white/76 hover:border-white/16 hover:bg-white/[0.05]"
            )}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

function DurationSlider({
  title,
  options,
  value,
  onChange,
}: {
  title: string;
  options: readonly number[];
  value: number;
  onChange: (next: number) => void;
}) {
  if (options.length <= 1) {
    return (
      <div className="rounded-[16px] border border-white/8 bg-[#1d1f26] p-4">
        <div className="flex items-center justify-between">
          <Label>{title}</Label>
          <span className="text-sm text-white">{value}s</span>
        </div>
        <div className="mt-3 rounded-xl border border-white/10 bg-[#15171d] px-3.5 py-3 text-sm text-white/68">
          {title.includes("时长") ? `${value}s · 当前按 Kie 支持能力展示` : `${value}s · Shown from the current Kie-supported set`}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[16px] border border-white/8 bg-[#1d1f26] p-4">
      <div className="flex items-center justify-between">
        <Label>{title}</Label>
        <span className="text-sm text-white">{value}s</span>
      </div>
      <input
        type="range"
        min={Math.min(...options)}
        max={Math.max(...options)}
        step={options.length > 1 ? options[1] - options[0] : 1}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="mt-4 h-2 w-full accent-[#5da3ff]"
      />
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
    <div className="flex items-start gap-3 rounded-[12px] border border-white/8 bg-[#1d1f26] p-4">
      <span className={cn("mt-1 h-2.5 w-2.5 rounded-full", dotClass)} />
      <div>
        <div className="font-medium text-white">{title}</div>
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
      className="rounded-lg border border-white/8 bg-white/[0.03] p-2 text-white/54 transition-colors hover:bg-white/[0.07] hover:text-white disabled:cursor-not-allowed disabled:opacity-35"
    >
      {children}
    </button>
  );
}

function formatWorkspaceNotice(notice: string | null, locale: string) {
  if (!notice || locale !== "zh") return notice;

  const directMap: Record<string, string> = {
    "Prompt is required before generating.": "开始生成前请先补充提示词。",
    "Upload at least one keyframe image before generating.": "图生视频模式下，请至少上传一张关键帧图片。",
    "Upload at least one image or video reference before generating.": "开始生成前请至少准备一个图像或视频参考。",
    "Please wait until all uploads finish before generating.": "请先等待所有素材上传完成，再开始生成。",
    "Generation queued. You can continue editing or monitor progress in the dashboard.": "视频请求已经提交，你可以继续整理素材，或前往控制台查看进度。",
    "Failed to create generation": "创建生成任务失败，请稍后再试。",
    "Upload failed": "素材上传失败，请稍后重试。",
    "Failed to prepare upload": "准备上传失败，请稍后重试。",
    "Network error during upload": "上传过程中发生网络错误，请稍后重试。",
    "This mode does not accept image references.": "当前模式不接受图片参考素材。",
    "This mode does not accept video references.": "当前模式不接受视频参考素材。",
    "This mode does not accept audio references.": "当前模式不接受音频参考素材。",
  };

  if (directMap[notice]) return directMap[notice];

  const laneLimitMatch = notice.match(/^Only (\d+) (\w+)s? allowed in this lane\.$/);
  if (laneLimitMatch) {
    return `这里最多只能添加 ${laneLimitMatch[1]} 个素材。`;
  }

  const addedMatch = notice.match(/^Added (\d+) (\w+)s?\. (\d+) exceeded the lane limit\.$/);
  if (addedMatch) {
    return `已加入 ${addedMatch[1]} 个素材，另外 ${addedMatch[3]} 个超过了当前上限。`;
  }

  const uploadStatusMatch = notice.match(/^Upload failed with status (\d+)$/);
  if (uploadStatusMatch) {
    return `素材上传失败，服务器返回状态 ${uploadStatusMatch[1]}。`;
  }

  return notice;
}
