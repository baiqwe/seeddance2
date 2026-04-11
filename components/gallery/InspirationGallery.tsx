import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getLocalizedGalleryItems } from "@/config/gallery";
import type { AnimeStyleId } from "@/config/landing-pages";

type InspirationGalleryProps = {
  locale: string;
  style?: AnimeStyleId;
  anchorHrefPrefix?: string;
  maxItems?: number;
};

export function InspirationGallery({
  locale,
  style,
  anchorHrefPrefix,
  maxItems = 6,
}: InspirationGalleryProps) {
  const items = getLocalizedGalleryItems(locale, style).slice(0, maxItems);

  return (
    <section className="border-t border-border/70 bg-background/[0.68] py-16">
      <div className="container px-4 md:px-6">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="max-w-3xl space-y-3">
            <div className="section-kicker">
              {locale === "zh" ? "灵感画廊" : "Inspiration Gallery"}
            </div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {locale === "zh" ? "看看不同风格会把画面带到哪里" : "See how each style changes the final look"}
            </h2>
            <p className="text-lg text-foreground/72">
              {locale === "zh"
                ? "我们先用静态精选案例来展示画面走向。后续只需要替换图片素材，这个画廊就能继续扩展。"
                : "This gallery starts with curated static examples so the page feels visual today and stays easy to expand later."}
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {items.map((item) => {
              const href = anchorHrefPrefix
                ? `${anchorHrefPrefix}#anime-uploader`
                : `/${locale}/${item.slug}#anime-uploader`;

              return (
                <article
                  key={item.id}
                  className="group surface-card overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/20 hover:shadow-[0_22px_54px_-34px_rgba(255,102,147,0.18)]"
                >
                  <div className="relative aspect-[4/5] overflow-hidden bg-muted/20">
                    <Image
                      src={item.afterImage}
                      alt={item.altLabel}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                      className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.045]"
                    />
                    <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4">
                      <span className="rounded-full border border-border/80 bg-background/[0.96] px-3 py-1 text-xs font-semibold text-foreground shadow-sm">
                        {item.categoryLabel}
                      </span>
                      <div className="relative h-12 w-12 overflow-hidden rounded-full border-2 border-background shadow-lg">
                        <Image
                          src={item.beforeThumb}
                          alt={locale === "zh" ? "原图缩略预览" : "Original image thumbnail"}
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      </div>
                    </div>
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent p-5 text-white">
                      <div className="text-lg font-semibold">{item.titleLabel}</div>
                      <div className="mt-2 text-sm text-zinc-100">{item.descriptionLabel}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-4 p-5">
                    <div className="text-sm text-foreground/66">
                      {locale === "zh" ? "点击直达上传区，直接试这个风格" : "Jump straight to the uploader and try this style"}
                    </div>
                    <Link
                      href={href}
                      aria-label={
                        locale === "zh"
                          ? `试试${item.titleLabel}风格`
                          : `Try the ${item.titleLabel} style`
                      }
                      className="inline-flex shrink-0 items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-[0_18px_30px_-18px_hsl(var(--primary))] transition-colors hover:bg-primary/90"
                    >
                      {locale === "zh" ? "制作同款" : "Try this style"}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
