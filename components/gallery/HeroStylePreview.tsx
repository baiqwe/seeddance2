"use client";

import Image from "next/image";
import { mediaAsset } from "@/config/media";

type HeroStylePreviewProps = {
  locale: string;
  className?: string;
};

const previewItems = [
  {
    id: "ghibli",
    image: mediaAsset("/images/gallery/generated/ghibli.jpg"),
    labelEn: "Ghibli",
    labelZh: "吉卜力风",
  },
  {
    id: "webtoon",
    image: mediaAsset("/images/gallery/generated/webtoon.jpg"),
    labelEn: "Webtoon",
    labelZh: "韩漫风",
  },
  {
    id: "retro",
    image: mediaAsset("/images/gallery/generated/retro_90s.jpg"),
    labelEn: "90s Retro",
    labelZh: "90年代复古",
  },
  {
    id: "cyberpunk",
    image: mediaAsset("/images/gallery/generated/cyberpunk.jpg"),
    labelEn: "Cyberpunk",
    labelZh: "赛博朋克",
  },
];

export function HeroStylePreview({ locale, className = "" }: HeroStylePreviewProps) {
  return (
    <div className={`surface-panel p-5 md:p-6 ${className}`}>
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="section-kicker">
            {locale === "zh" ? "风格预览" : "Style Preview"}
          </div>
          <h2 className="text-2xl font-bold tracking-tight">
            {locale === "zh" ? "同一份参考素材，预览不同视频方向" : "Preview multiple video directions from one reference"}
          </h2>
          <p className="text-sm leading-7 text-foreground/72">
            {locale === "zh"
              ? "先快速感受同一素材在不同视觉方向下的差异，再上传你的参考素材开始创作。"
              : "See how the same reference changes across different visual directions before uploading your own asset."}
          </p>
        </div>

        <div className="relative mx-auto max-w-[700px]">
          <div className="grid grid-cols-2 gap-4">
            {previewItems.map((item) => (
              <div
                key={item.id}
                className="group relative overflow-hidden rounded-[24px] border border-white/[0.55] bg-muted/[0.16] shadow-[0_18px_52px_-30px_rgba(15,23,42,0.2)] transition-transform duration-300 hover:-translate-y-1"
              >
                <div className="relative aspect-[1.08/1]">
                  <Image
                  src={item.image}
                  alt={locale === "zh" ? `${item.labelZh} 预览` : `${item.labelEn} preview`}
                  fill
                  sizes="(max-width: 1024px) 50vw, 280px"
                  priority={item.id === previewItems[0].id}
                  className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.045]"
                />
                </div>
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-4 pb-4 pt-10 text-sm font-semibold text-white">
                  {locale === "zh" ? item.labelZh : item.labelEn}
                </div>
              </div>
            ))}
          </div>

          <div className="pointer-events-none absolute left-1/2 top-1/2 w-[120px] -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-background bg-background/[0.92] p-1 shadow-[0_22px_60px_-20px_rgba(255,102,147,0.28)] md:w-[148px]">
            <div className="relative aspect-square overflow-hidden rounded-full">
              <Image
              src={mediaAsset("/images/gallery/hero-before.png")}
              alt={locale === "zh" ? "原图示例" : "Original sample image"}
              fill
              sizes="148px"
              priority
              className="object-cover"
            />
            </div>
            <div className="absolute inset-x-3 bottom-2 rounded-full bg-black/55 px-3 py-1 text-center text-xs font-medium text-white backdrop-blur-sm">
              {locale === "zh" ? "原图" : "Original"}
            </div>
          </div>
        </div>

        <div className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
          <div className="rounded-xl border border-border/80 bg-background/[0.96] px-4 py-3 text-foreground/68">
            {locale === "zh"
              ? "用同一份参考素材做多方向展示，帮助你一眼看出不同镜头语言之间的差异。"
              : "The same source reference is reused so you can instantly compare how each direction changes the final result."}
          </div>
          <div className="rounded-xl border border-border/80 bg-background/[0.96] px-4 py-3 text-foreground/68">
            {locale === "zh"
              ? "上传后生成的会基于你的素材和提示词，而不是固定模板。"
              : "When you upload, the result is based on your reference and prompt rather than a fixed template."}
          </div>
        </div>
      </div>
    </div>
  );
}
