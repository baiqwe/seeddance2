import { build } from "esbuild";
import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const rootDir = process.cwd();
const publicDir = join(rootDir, "public");
const xmlDir = join(publicDir, "xml");

const aliasPlugin = {
  name: "alias-at-root",
  setup(buildContext) {
    buildContext.onResolve({ filter: /^@\// }, (args) => {
      const basePath = join(rootDir, args.path.slice(2));
      const candidates = [
        basePath,
        `${basePath}.ts`,
        `${basePath}.tsx`,
        `${basePath}.js`,
        `${basePath}.mjs`,
        `${basePath}.json`,
        join(basePath, "index.ts"),
        join(basePath, "index.tsx"),
      ];
      const resolvedPath = candidates.find((candidate) => existsSync(candidate));

      return {
        path: resolvedPath || basePath,
      };
    });
  },
};

function escapeXml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function toAbsoluteUrl(pathOrUrl, siteUrl) {
  return new URL(pathOrUrl, siteUrl).toString();
}

function maxIsoDate(values) {
  const timestamps = values
    .map((value) => Date.parse(value))
    .filter((value) => Number.isFinite(value));
  if (!timestamps.length) {
    return new Date().toISOString();
  }
  return new Date(Math.max(...timestamps)).toISOString();
}

function durationLabelToSeconds(label) {
  const match = String(label || "").match(/(\d+)/);
  return match ? Number(match[1]) : 5;
}

function fallbackUploadDate(index) {
  const day = String(Math.min(24, 10 + (index % 15))).padStart(2, "0");
  return `2026-05-${day}T10:00:00+08:00`;
}

async function loadSeoData() {
  const bundled = await build({
    stdin: {
      contents: `
        import { getPageSitemapEntries } from "./utils/seo/sitemap";
        import { galleryItems } from "./config/gallery";
        import { site } from "./config/site";
        import { locales } from "./i18n/routing";

        export const seoData = {
          pages: getPageSitemapEntries(),
          galleryItems,
          site,
          locales,
        };
      `,
      resolveDir: rootDir,
      sourcefile: "seo-data-entry.ts",
      loader: "ts",
    },
    bundle: true,
    platform: "node",
    format: "esm",
    write: false,
    plugins: [aliasPlugin],
  });

  const outputPath = join(tmpdir(), `seedance-seo-data-${Date.now()}.mjs`);
  await writeFile(outputPath, bundled.outputFiles[0].text);
  const module = await import(pathToFileURL(outputPath).href);
  return module.seoData;
}

function buildPageSitemap({ pages }) {
  const urls = pages
    .map((entry) => {
      const alternates = [
        `<xhtml:link rel="alternate" hreflang="en-US" href="${escapeXml(entry.alternates["en-US"])}" />`,
        `<xhtml:link rel="alternate" hreflang="zh-CN" href="${escapeXml(entry.alternates["zh-CN"])}" />`,
        `<xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(entry.alternates["en-US"])}" />`,
      ].join("\n    ");

      return `  <url>
    <loc>${escapeXml(entry.url)}</loc>
    <lastmod>${escapeXml(entry.lastModified)}</lastmod>
    ${alternates}
  </url>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls}
</urlset>
`;
}

function buildVideoSitemap({ galleryItems, locales, site }) {
  const videoItems = galleryItems.filter((item) => item.videoUrl && item.afterImage && item.slug);
  const groupedByPage = new Map();

  locales.forEach((locale) => {
    videoItems.forEach((item, index) => {
      const pageUrl = toAbsoluteUrl(`/${locale}/${item.slug}`, site.siteUrl);
      const thumbnailUrl = toAbsoluteUrl(item.afterImage, site.siteUrl);
      const contentUrl = toAbsoluteUrl(item.videoUrl, site.siteUrl);
      const title = locale === "zh" ? item.titleZh || item.title : item.title;
      const description = locale === "zh" ? item.descriptionZh || item.description : item.description;
      const uploadDate = item.uploadDate || fallbackUploadDate(index);
      const durationSeconds = durationLabelToSeconds(item.durationLabel);

      const videoXml = `    <video:video>
      <video:thumbnail_loc>${escapeXml(thumbnailUrl)}</video:thumbnail_loc>
      <video:title>${escapeXml(title)}</video:title>
      <video:description>${escapeXml(description)}</video:description>
      <video:content_loc>${escapeXml(contentUrl)}</video:content_loc>
      <video:duration>${durationSeconds}</video:duration>
      <video:publication_date>${escapeXml(uploadDate)}</video:publication_date>
      <video:family_friendly>yes</video:family_friendly>
    </video:video>`;

      const existing = groupedByPage.get(pageUrl) || {
        pageUrl,
        dates: [],
        videos: [],
      };
      existing.dates.push(uploadDate);
      existing.videos.push(videoXml);
      groupedByPage.set(pageUrl, existing);
    });
  });

  const urls = Array.from(groupedByPage.values()).map((entry) => `  <url>
    <loc>${escapeXml(entry.pageUrl)}</loc>
    <lastmod>${escapeXml(maxIsoDate(entry.dates))}</lastmod>
${entry.videos.join("\n")}
  </url>`);

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
${urls.join("\n")}
</urlset>
`;
}

function buildSitemapIndex({ site, pageLastmod, videoLastmod }) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${escapeXml(toAbsoluteUrl("/xml/page-sitemap.xml", site.siteUrl))}</loc>
    <lastmod>${escapeXml(pageLastmod)}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${escapeXml(toAbsoluteUrl("/xml/video-sitemap.xml", site.siteUrl))}</loc>
    <lastmod>${escapeXml(videoLastmod)}</lastmod>
  </sitemap>
</sitemapindex>
`;
}

const seoData = await loadSeoData();
const pageSitemap = buildPageSitemap(seoData);
const videoSitemap = buildVideoSitemap(seoData);
const pageLastmod = maxIsoDate(seoData.pages.map((page) => page.lastModified));
const videoLastmod = maxIsoDate(
  seoData.galleryItems.map((item, index) => item.uploadDate || fallbackUploadDate(index))
);
const sitemapIndex = buildSitemapIndex({
  site: seoData.site,
  pageLastmod,
  videoLastmod,
});

await mkdir(xmlDir, { recursive: true });
await writeFile(join(xmlDir, "page-sitemap.xml"), pageSitemap);
await writeFile(join(xmlDir, "video-sitemap.xml"), videoSitemap);
await writeFile(join(xmlDir, "sitemap.xml"), sitemapIndex);
await writeFile(join(publicDir, "sitemap.xml"), sitemapIndex);

console.log("Generated SEO XML files", {
  pages: seoData.pages.length,
  videos: seoData.galleryItems.filter((item) => item.videoUrl && item.afterImage && item.slug).length,
});
