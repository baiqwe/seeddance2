import { indexableLandingPageSlugs, landingPages } from "@/config/landing-pages";
import { site } from "@/config/site";
import { locales } from "@/i18n/routing";

const staticPages = ["", "creative-center", "guides", "pricing", "about", "contact"] as const;

const PAGE_LASTMOD: Record<(typeof staticPages)[number], string> = {
  "": "2026-05-09T12:00:00+08:00",
  "creative-center": "2026-05-09T12:00:00+08:00",
  "guides": "2026-05-09T12:00:00+08:00",
  "pricing": "2026-05-02T12:00:00+08:00",
  "about": "2026-05-09T12:00:00+08:00",
  "contact": "2026-05-09T12:00:00+08:00",
};

const LANDING_LASTMOD = "2026-05-09T12:00:00+08:00";

export type SitemapPageEntry = {
  url: string;
  lastModified: string;
  alternates: {
    "en-US": string;
    "zh-CN": string;
  };
};

export function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function getPageSitemapEntries(): SitemapPageEntry[] {
  const staticEntries = locales.flatMap((locale) =>
    staticPages.map((page) => {
      const path = page ? `/${locale}/${page}` : `/${locale}`;
      return {
        url: new URL(path, site.siteUrl).toString(),
        lastModified: PAGE_LASTMOD[page] || LANDING_LASTMOD,
        alternates: {
          "en-US": new URL(page ? `/en/${page}` : "/en", site.siteUrl).toString(),
          "zh-CN": new URL(page ? `/zh/${page}` : "/zh", site.siteUrl).toString(),
        },
      };
    })
  );

  const landingEntries = locales.flatMap((locale) =>
    indexableLandingPageSlugs.map((slug) => {
      const pageLastmod = landingPages[slug]?.lastUpdated || LANDING_LASTMOD;
      return {
        url: new URL(`/${locale}/${slug}`, site.siteUrl).toString(),
        lastModified: pageLastmod,
        alternates: {
          "en-US": new URL(`/en/${slug}`, site.siteUrl).toString(),
          "zh-CN": new URL(`/zh/${slug}`, site.siteUrl).toString(),
        },
      };
    })
  );

  return [...staticEntries, ...landingEntries];
}
