import { site } from "@/config/site";

function trimTrailingSlash(value: string) {
  return value.endsWith("/") ? value.slice(0, -1) : value;
}

export function getVideoDeliveryBaseUrl() {
  const configured =
    process.env.VIDEO_CDN_URL ||
    process.env.NEXT_PUBLIC_VIDEO_CDN_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    "";

  if (!configured) {
    return site.siteUrl;
  }

  return trimTrailingSlash(configured);
}

export function toDeliveredVideoUrl(url?: string | null) {
  if (!url) return null;

  const cdnBase = process.env.VIDEO_CDN_URL || process.env.NEXT_PUBLIC_VIDEO_CDN_URL;
  if (!cdnBase) return url;

  try {
    const original = new URL(url);
    const target = new URL(trimTrailingSlash(cdnBase));
    target.pathname = original.pathname;
    target.search = original.search;
    return target.toString();
  } catch {
    return url;
  }
}
