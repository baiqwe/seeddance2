import { site } from "@/config/site";
import { getLocalizedGalleryItems } from "@/config/gallery";
import type { AnimeStyleId } from "@/config/landing-pages";

export function ImageGallerySchema({
  locale,
  style,
}: {
  locale: string;
  style?: AnimeStyleId;
}) {
  const items = getLocalizedGalleryItems(locale, style);

  const schema = {
    "@context": "https://schema.org",
    "@type": "ImageGallery",
    name: locale === "zh" ? "照片转二次元灵感画廊" : "Photo to Anime Inspiration Gallery",
    associatedMedia: items.map((item) => ({
      "@type": "ImageObject",
      contentUrl: new URL(item.afterImage, site.siteUrl).toString(),
      thumbnailUrl: new URL(item.beforeThumb, site.siteUrl).toString(),
      caption: item.altLabel,
      description: item.descriptionLabel,
    })),
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />;
}
