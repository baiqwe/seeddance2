"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Check, Clipboard, Play } from "lucide-react";
import type { VideoGenerationMode } from "@/utils/video-generation";

type PromptTemplate = {
  id: string;
  category: string;
  categoryZh: string;
  title: string;
  titleZh: string;
  prompt: string;
  promptZh: string;
  mode: VideoGenerationMode;
  ratio: string;
  duration: string;
  resolution: string;
};

const promptTemplates: PromptTemplate[] = [
  {
    id: "reference-camera-copy",
    category: "Reference Video",
    categoryZh: "参考视频",
    title: "Copy a dolly-in camera move",
    titleZh: "复刻推进镜头",
    prompt:
      "Use @Video1 only for camera movement and pacing. Replace the subject with [new subject], keep a slow dolly-in, preserve warm side light, and end on a stable medium close-up. Do not copy the original location.",
    promptZh:
      "使用 @Video1 只参考运镜和节奏。把主体替换为 [新主体]，保持缓慢推进、暖色侧光，并在稳定的中近景结束。不要复制原视频地点。",
    mode: "multi_modal_video",
    ratio: "16:9",
    duration: "15s",
    resolution: "720p",
  },
  {
    id: "product-reveal",
    category: "Product Ads",
    categoryZh: "产品广告",
    title: "Premium product reveal",
    titleZh: "高级产品揭幕",
    prompt:
      "Use @Image1 as the locked product identity. Place the product on a dark reflective surface, add one slow push-in, a narrow light sweep across the material, and end with the label facing camera. Keep the product shape stable.",
    promptZh:
      "使用 @Image1 锁定产品身份。把产品放在深色反光桌面上，加入一次缓慢推进，一道窄高光扫过材质，结尾让标签正对镜头。保持产品形状稳定。",
    mode: "image_to_video",
    ratio: "16:9",
    duration: "15s",
    resolution: "720p",
  },
  {
    id: "audio-beat-sync",
    category: "Audio Sync",
    categoryZh: "音频同步",
    title: "Beat-drop transition",
    titleZh: "重拍转场",
    prompt:
      "Use @Audio1 for timing only. Hold a quiet opening shot for the first beat, then increase camera energy at the beat drop with a clean transition into [scene]. Keep motion smooth and avoid rapid random cuts.",
    promptZh:
      "使用 @Audio1 只控制时机。开头第一个节拍保持安静镜头，在重拍处提升镜头能量并干净转入 [场景]。保持运动顺滑，避免随机快速切镜。",
    mode: "multi_modal_video",
    ratio: "16:9",
    duration: "15s",
    resolution: "720p",
  },
  {
    id: "consistent-character",
    category: "Character Consistency",
    categoryZh: "角色一致性",
    title: "Keep a character stable",
    titleZh: "保持角色稳定",
    prompt:
      "Use @Image1 and @Image2 to lock the character face, wardrobe, silhouette, and proportions. Add a gentle walking motion and a slow orbit camera. Do not change outfit, hairstyle, body scale, or facial identity.",
    promptZh:
      "使用 @Image1 和 @Image2 锁定角色脸部、服装、轮廓和比例。加入轻微行走动作和缓慢环绕镜头。不要改变服装、发型、身体比例或脸部身份。",
    mode: "multi_modal_video",
    ratio: "9:16",
    duration: "15s",
    resolution: "720p",
  },
  {
    id: "video-extension-end-frame",
    category: "Video Extension",
    categoryZh: "视频延展",
    title: "Extend toward an end frame",
    titleZh: "按尾帧延展",
    prompt:
      "Continue @Video1 with the same lighting, subject state, and camera momentum. Use @Image1 as the end-frame target. The extension should feel like the next seconds of the same shot, not a new scene.",
    promptZh:
      "延续 @Video1 的光线、主体状态和镜头惯性。使用 @Image1 作为尾帧目标。扩展结果应该像同一镜头的后几秒，而不是新场景。",
    mode: "video_extension",
    ratio: "16:9",
    duration: "15s",
    resolution: "720p",
  },
  {
    id: "motion-control",
    category: "Camera Movement",
    categoryZh: "运镜控制",
    title: "Controlled orbit shot",
    titleZh: "可控环绕镜头",
    prompt:
      "Create one controlled orbit shot around [subject]. The camera moves from front-left to side profile at slow speed, the subject remains centered, background parallax stays subtle, and the shot ends without a cut.",
    promptZh:
      "围绕 [主体] 生成一个可控环绕镜头。镜头从左前方缓慢移动到侧面，主体始终居中，背景视差保持轻微，镜头不中断并自然结束。",
    mode: "text_to_video",
    ratio: "16:9",
    duration: "15s",
    resolution: "720p",
  },
];

function makeCreativeCenterHref(locale: string, template: PromptTemplate) {
  const prompt = locale === "zh" ? template.promptZh : template.prompt;
  const params = new URLSearchParams({
    mode: template.mode,
    model: "bytedance/seedance-2",
    ratio: template.ratio,
    duration: template.duration,
    resolution: template.resolution,
    prompt,
  });

  return `/${locale}/creative-center?${params.toString()}#creation-workspace`;
}

export function PromptTemplateLibrary({ locale }: { locale: string }) {
  const isZh = locale === "zh";
  const categories = useMemo(
    () => [
      "All",
      ...Array.from(new Set(promptTemplates.map((item) => item.category))),
    ],
    [],
  );
  const [active, setActive] = useState("All");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const visibleTemplates =
    active === "All"
      ? promptTemplates
      : promptTemplates.filter((item) => item.category === active);

  const copyPrompt = async (template: PromptTemplate) => {
    const text = isZh ? template.promptZh : template.prompt;
    await navigator.clipboard.writeText(text);
    setCopiedId(template.id);
    window.setTimeout(() => setCopiedId(null), 1600);
  };

  return (
    <section className="surface-panel px-5 py-7 md:px-7">
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div className="max-w-3xl">
          <div className="section-kicker">
            {isZh ? "Prompt Template Library" : "Prompt Template Library"}
          </div>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white">
            {isZh
              ? "复制能直接进入创作中心的 Seedance 2 Prompt。"
              : "Copy Seedance 2 prompts that lead straight into the creation center."}
          </h2>
          <p className="mt-4 text-sm leading-7 text-white/64">
            {isZh
              ? "每个模板都围绕一个明确工作流：参考视频、音频同步、产品广告、角色一致性或视频延展。替换方括号里的变量，再带入创作中心补素材。"
              : "Each template is built around one workflow: reference video, audio sync, product ads, character consistency, or video extension. Replace the bracketed variables, then open the creation center with the prompt already staged."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => {
            const label =
              isZh && category !== "All"
                ? promptTemplates.find((item) => item.category === category)
                    ?.categoryZh
                : category;
            const selected = active === category;
            return (
              <button
                key={category}
                type="button"
                onClick={() => setActive(category)}
                className={`rounded-full px-3 py-2 text-xs transition-colors ${
                  selected
                    ? "bg-white text-slate-950"
                    : "bg-white/[0.04] text-white/62 ring-1 ring-white/10 hover:bg-white/[0.08] hover:text-white"
                }`}
              >
                {isZh && category === "All" ? "全部" : label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        {visibleTemplates.map((template) => {
          const prompt = isZh ? template.promptZh : template.prompt;
          const title = isZh ? template.titleZh : template.title;
          const category = isZh ? template.categoryZh : template.category;
          const copied = copiedId === template.id;
          return (
            <article
              key={template.id}
              className="rounded-[24px] bg-[#0b1020] p-5 ring-1 ring-[#232938]/70"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-xs uppercase tracking-[0.18em] text-white/36">
                    {category}
                  </div>
                  <h3 className="mt-2 text-xl font-semibold text-white">
                    {title}
                  </h3>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => copyPrompt(template)}
                    className="inline-flex h-10 items-center gap-2 rounded-full bg-white/[0.04] px-3 text-xs font-medium text-white/72 ring-1 ring-white/10 transition-colors hover:bg-white/[0.08] hover:text-white"
                  >
                    {copied ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Clipboard className="h-4 w-4" />
                    )}
                    {copied
                      ? isZh
                        ? "已复制"
                        : "Copied"
                      : isZh
                        ? "复制"
                        : "Copy"}
                  </button>
                  <Link
                    href={makeCreativeCenterHref(locale, template)}
                    className="inline-flex h-10 items-center gap-2 rounded-full bg-[#dbe7fb] px-3 text-xs font-semibold text-[#07111d] transition-colors hover:bg-[#eef4ff]"
                  >
                    <Play className="h-4 w-4" />
                    {isZh ? "带入" : "Try"}
                  </Link>
                </div>
              </div>

              <p className="mt-5 rounded-[18px] bg-[#070b12] p-4 text-sm leading-7 text-white/70 ring-1 ring-white/[0.05]">
                {prompt}
              </p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs text-white/44">
                <span>{template.ratio}</span>
                <span>{template.duration}</span>
                <span>{template.resolution}</span>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
