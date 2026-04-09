"use client";

import CompareSlider from "@/components/feature/compare-slider";

type StaticShowcaseProps = {
  beforeImage: string;
  afterImage: string;
  locale: string;
  className?: string;
};

export function StaticShowcase({ beforeImage, afterImage, locale, className = "" }: StaticShowcaseProps) {
  return (
    <div className={className}>
      <CompareSlider beforeImage={beforeImage} afterImage={afterImage} autoSlide autoSlideDelay={700} />
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
        <span>
          {locale === "zh"
            ? "滑动查看：原始参考图如何被重绘成更完整的动漫视觉。"
            : "Slide to see how the original reference is transformed into a more finished anime look."}
        </span>
        <span className="rounded-full border border-border bg-background px-3 py-1">
          {locale === "zh" ? "真实前后反差" : "Real before / after"}
        </span>
      </div>
    </div>
  );
}
