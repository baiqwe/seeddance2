import { site } from "@/config/site";
import { getLocalizedGalleryItems } from "@/config/gallery";
import type { LandingPageSlug } from "@/config/landing-pages";

function toAbsoluteUrl(pathOrUrl: string) {
  try {
    return new URL(pathOrUrl, site.siteUrl).toString();
  } catch (error) {
    console.error("ImageGallerySchema URL normalization failed", { pathOrUrl, siteUrl: site.siteUrl, error });
    return null;
  }
}

export function ImageGallerySchema({
  locale,
  useCase,
}: {
  locale: string;
  useCase?: LandingPageSlug;
}) {
  try {
    const items = getLocalizedGalleryItems(locale, useCase);

    const associatedMedia = items.flatMap((item) => {
      const contentUrl = toAbsoluteUrl(item.afterImage);
      const thumbnailUrl = toAbsoluteUrl(item.beforeThumb);

      if (!contentUrl || !thumbnailUrl) {
        return [];
      }

      return [{
        "@type": "ImageObject",
        contentUrl,
        thumbnailUrl,
        caption: item.altLabel,
        description: item.descriptionLabel,
      }];
    });

    const schema = {
      "@context": "https://schema.org",
      "@type": "ImageGallery",
      name: locale === "zh" ? "Seedance 2 灵感画廊" : "Seedance 2 Inspiration Gallery",
      associatedMedia,
    };

    return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />;
  } catch (error) {
    console.error("ImageGallerySchema failed", error);
    return null;
  }
}
