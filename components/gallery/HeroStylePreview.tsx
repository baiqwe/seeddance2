"use client";

import Image from "next/image";

type HeroStylePreviewProps = {
  locale: string;
  className?: string;
};

const previewItems = [
  {
    id: "ghibli",
    image: "/images/gallery/generated/ghibli.jpg",
    labelEn: "Ghibli",
    labelZh: "吉卜力风",
  },
  {
    id: "webtoon",
    image: "/images/gallery/generated/webtoon.jpg",
    labelEn: "Webtoon",
    labelZh: "韩漫风",
  },
  {
    id: "retro",
    image: "/images/gallery/generated/retro_90s.jpg",
    labelEn: "90s Retro",
    labelZh: "90年代复古",
  },
  {
    id: "cyberpunk",
    image: "/images/gallery/generated/cyberpunk.jpg",
    labelEn: "Cyberpunk",
    labelZh: "赛博朋克",
  },
];

export function HeroStylePreview({ locale, className = "" }: HeroStylePreviewProps) {
  return (
    <div className={`rounded-[28px] border border-border bg-card/80 p-5 shadow-sm md:p-6 ${className}`}>
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            {locale === "zh" ? "风格预览" : "Style Preview"}
          </div>
          <h2 className="text-2xl font-bold tracking-tight">
            {locale === "zh" ? "同一张原图，预览不同动漫风格" : "Preview multiple anime styles from one source image"}
          </h2>
          <p className="text-sm leading-7 text-muted-foreground">
            {locale === "zh"
              ? "先快速感受同一张图在不同风格下的画面变化，再上传你自己的照片开始生成。"
              : "See how the same reference image changes across different anime directions before uploading your own photo."}
          </p>
        </div>

        <div className="relative mx-auto max-w-[700px]">
          <div className="grid grid-cols-2 gap-4">
            {previewItems.map((item) => (
              <div
                key={item.id}
                className="group relative overflow-hidden rounded-[24px] border border-border/80 bg-muted/20 shadow-[0_12px_40px_rgba(15,23,42,0.08)]"
              >
                <div className="relative aspect-[1.08/1]">
                  <Image
                    src={item.image}
                    alt={locale === "zh" ? `${item.labelZh} 预览` : `${item.labelEn} preview`}
                    fill
                    sizes="(max-width: 1024px) 50vw, 280px"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                </div>
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-4 pb-4 pt-10 text-sm font-semibold text-white">
                  {locale === "zh" ? item.labelZh : item.labelEn}
                </div>
              </div>
            ))}
          </div>

          <div className="pointer-events-none absolute left-1/2 top-1/2 w-[120px] -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-background bg-background/90 p-1 shadow-2xl md:w-[148px]">
            <div className="relative aspect-square overflow-hidden rounded-full">
              <Image
                src="/images/gallery/hero-before.jpg"
                alt={locale === "zh" ? "原图示例" : "Original sample image"}
                fill
                sizes="148px"
                className="object-cover"
              />
            </div>
            <div className="absolute inset-x-3 bottom-2 rounded-full bg-black/55 px-3 py-1 text-center text-xs font-medium text-white backdrop-blur-sm">
              {locale === "zh" ? "原图" : "Original"}
            </div>
          </div>
        </div>

        <div className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
          <div className="rounded-xl border border-border bg-background/80 px-4 py-3">
            {locale === "zh"
              ? "用同一张参考图做多风格展示，帮助用户一眼看出不同风格之间的结果差异。"
              : "The same source image is reused so visitors can instantly compare how each style changes the final result."}
          </div>
          <div className="rounded-xl border border-border bg-background/80 px-4 py-3">
            {locale === "zh"
              ? "上传后生成的仍然是用户自己的照片，不是固定模板头像。"
              : "When users upload, the result is still generated from their own photo rather than a fixed template avatar."}
          </div>
        </div>
      </div>
    </div>
  );
}
