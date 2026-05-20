"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Paperclip, Sparkles } from "lucide-react";
import type { VideoGenerationMode, VideoModelId } from "@/utils/video-generation";

type LandingPromptBarProps = {
  locale: string;
  mode: VideoGenerationMode;
  title: string;
  summary: string;
};

const MODEL: VideoModelId = "bytedance/seedance-2";

function getPlaceholder(locale: string, mode: VideoGenerationMode) {
  const isZh = locale === "zh";

  if (mode === "image_to_video") {
    return isZh
      ? "描述这张关键帧如何动起来：镜头、动作、光线和节奏..."
      : "Describe how the keyframe should move: camera, action, lighting, and pacing...";
  }

  if (mode === "video_extension") {
    return isZh
      ? "描述原视频应该如何继续：动作方向、尾帧目标和连续性..."
      : "Describe how the source clip should continue: motion, end frame, and continuity...";
  }

  if (mode === "text_to_video") {
    return isZh
      ? "描述一个完整视频场景：主体、镜头、氛围和节奏..."
      : "Describe a video scene: subject, camera, atmosphere, and rhythm...";
  }

  return isZh
    ? "先写一句镜头想法，再到创作中心补图片、视频或音频参考..."
    : "Start with one shot idea, then add image, video, or audio references in the creation center...";
}

export function LandingPromptBar({ locale, mode, title, summary }: LandingPromptBarProps) {
  const router = useRouter();
  const isZh = locale === "zh";
  const [prompt, setPrompt] = useState("");

  const openCreationCenter = () => {
    const params = new URLSearchParams();
    params.set("mode", mode);
    params.set("model", MODEL);
    params.set("ratio", "16:9");
    params.set("duration", "15s");
    params.set("resolution", "720p");

    if (prompt.trim()) {
      params.set("prompt", prompt.trim());
    }

    router.push(`/${locale}/creative-center?${params.toString()}#creation-workspace`);
  };

  return (
    <div className="relative overflow-hidden rounded-[34px] border border-white/12 bg-[linear-gradient(145deg,rgba(255,255,255,0.12),rgba(255,255,255,0.035))] p-4 shadow-[0_34px_120px_-68px_rgba(59,130,246,0.95)] backdrop-blur-2xl">
      <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(147,197,253,0.8),transparent)]" />
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-stretch">
        <div className="rounded-[26px] border border-white/10 bg-black/24 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-white/54">
              Seedance 2
            </span>
            <span className="rounded-full border border-cyan-200/15 bg-cyan-200/[0.06] px-3 py-1 text-xs text-cyan-100/78">
              720p · 16:9 · 15s
            </span>
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-white/66">
              {title}
            </span>
          </div>

          <textarea
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            className="min-h-[132px] w-full resize-none border-0 bg-transparent text-lg leading-8 text-white outline-none placeholder:text-white/32"
            placeholder={getPlaceholder(locale, mode)}
          />

          <p className="mt-3 max-w-3xl text-sm leading-7 text-white/58">{summary}</p>
        </div>

        <div className="flex flex-col justify-between gap-3 lg:w-[228px]">
          <button
            type="button"
            onClick={openCreationCenter}
            className="group flex min-h-[88px] items-center justify-between rounded-[24px] border border-white/10 bg-white/[0.06] px-5 py-4 text-left text-sm font-medium text-white/82 transition-colors hover:bg-white/[0.1] hover:text-white"
          >
            <span className="flex items-center gap-3">
              <Paperclip className="h-5 w-5 text-white/58" />
              {isZh ? "添加参考素材" : "Add references"}
            </span>
            <ArrowRight className="h-4 w-4 opacity-50 transition-transform group-hover:translate-x-0.5 group-hover:opacity-80" />
          </button>

          <button
            type="button"
            onClick={openCreationCenter}
            className="flex min-h-[88px] items-center justify-center gap-2 rounded-[24px] bg-[linear-gradient(90deg,#2563ff,#6d28d9)] px-5 py-4 text-sm font-semibold text-white shadow-[0_22px_42px_-22px_rgba(59,130,246,0.75)] transition-transform hover:scale-[1.01]"
          >
            <Sparkles className="h-4 w-4" />
            {isZh ? "带入创作中心" : "Open Creation Center"}
          </button>
        </div>
      </div>
    </div>
  );
}
