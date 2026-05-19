import { getLocalizedGalleryItems } from "@/config/gallery";
import type { LandingPageSlug } from "@/config/landing-pages";
import { GalleryVideoCard } from "@/components/gallery/GalleryVideoCard";

type InspirationGalleryProps = {
  locale: string;
  useCase?: LandingPageSlug;
  anchorHrefPrefix?: string;
  maxItems?: number;
};

export function InspirationGallery({
  locale,
  useCase,
  anchorHrefPrefix,
  maxItems = 6,
}: InspirationGalleryProps) {
  const items = getLocalizedGalleryItems(locale, useCase).slice(0, maxItems);

  return (
    <section id="showcase" className="py-4">
      <div className="container px-4 md:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {items.map((item) => {
              const href = anchorHrefPrefix
                ? `${anchorHrefPrefix}#creation-workspace`
                : `/${locale}/${item.slug}#creation-workspace`;

              return <GalleryVideoCard key={item.id} locale={locale} href={href} item={item} />;
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
