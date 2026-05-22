"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Paperclip, SlidersHorizontal } from "lucide-react";
import type {
  VideoGenerationMode,
  VideoModelId,
} from "@/utils/video-generation";

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

export function LandingPromptBar({
  locale,
  mode,
  title,
  summary,
}: LandingPromptBarProps) {
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

    router.push(
      `/${locale}/creative-center?${params.toString()}#creation-workspace`,
    );
  };

  return (
    <div className="rounded-[28px] bg-[#0b1020] p-3 ring-1 ring-[#232938]/80">
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="rounded-[22px] bg-[#070b12] p-4 ring-1 ring-white/[0.05]">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            {["Seedance 2", "720p", "16:9", "15s"].map((item) => (
              <span
                key={item}
                className="rounded-full bg-[#101726] px-3 py-1 text-xs text-white/62 ring-1 ring-white/[0.05]"
              >
                {item}
              </span>
            ))}
            <span className="rounded-full bg-[#101726] px-3 py-1 text-xs text-cyan-100/74 ring-1 ring-cyan-200/10">
              {title}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-white/38">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            {isZh ? "生成意图" : "Generation intent"}
          </div>
          <textarea
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            className="mt-3 min-h-[132px] w-full resize-none rounded-[16px] border border-[#232938]/70 bg-[#0b1020] px-4 py-3 text-base leading-8 text-white outline-none placeholder:text-white/34 focus:border-cyan-100/25"
            placeholder={getPlaceholder(locale, mode)}
          />

          <p className="mt-3 max-w-3xl text-sm leading-7 text-white/56">
            {summary}
          </p>
        </div>

        <aside className="flex flex-col justify-between rounded-[22px] bg-[#101726] p-4 ring-1 ring-white/[0.05]">
          <div className="space-y-3">
            <div className="text-xs uppercase tracking-[0.18em] text-white/36">
              {isZh ? "进入前会带入" : "Carried into workspace"}
            </div>
            {[
              isZh ? "Prompt 草稿" : "Prompt draft",
              isZh ? "当前模式" : "Selected mode",
              isZh ? "默认 720p / 16:9 / 15s" : "Default 720p / 16:9 / 15s",
              isZh ? "素材上传入口" : "Reference upload lanes",
            ].map((item) => (
              <div
                key={item}
                className="rounded-[14px] bg-[#0b1020] px-3 py-2 text-sm text-white/62 ring-1 ring-white/[0.04]"
              >
                {item}
              </div>
            ))}
          </div>

          <div className="mt-5 grid gap-2">
            <button
              type="button"
              onClick={openCreationCenter}
              className="group flex h-12 items-center justify-center gap-2 rounded-[16px] bg-[#dbe7fb] px-4 text-sm font-semibold text-[#07111d] transition-colors hover:bg-[#eef4ff]"
            >
              {isZh ? "带入创作中心" : "Open Creation Center"}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>
            <button
              type="button"
              onClick={openCreationCenter}
              className="flex h-11 items-center justify-center gap-2 rounded-[16px] bg-[#0b1020] px-4 text-sm font-medium text-white/70 ring-1 ring-white/[0.05] transition-colors hover:text-white"
            >
              <Paperclip className="h-4 w-4" />
              {isZh ? "先补参考素材" : "Add references first"}
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
