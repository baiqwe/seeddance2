import { getLocalizedGalleryItems } from "@/config/gallery";
import { landingPages, type LandingPageSlug } from "@/config/landing-pages";
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
  const primaryItems = getLocalizedGalleryItems(locale, useCase);
  const fallbackItems = useCase
    ? getLocalizedGalleryItems(locale).filter(
        (item) => !primaryItems.some((primary) => primary.id === item.id),
      )
    : [];
  const items = [...primaryItems, ...fallbackItems].slice(0, maxItems);

  return (
    <section id="showcase" className="py-4">
      <div className="container px-4 md:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {items.map((item) => {
              const params = new URLSearchParams();
              params.set(
                "mode",
                landingPages[item.useCase]?.mode ?? "multi_modal_video",
              );
              params.set("preset", item.id);
              const href = anchorHrefPrefix
                ? `${anchorHrefPrefix}#creation-workspace`
                : `/${locale}/creative-center?${params.toString()}#creation-workspace`;

              return (
                <GalleryVideoCard
                  key={item.id}
                  locale={locale}
                  href={href}
                  item={item}
                />
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
