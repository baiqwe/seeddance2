const DEFAULT_MEDIA_BASE_URL = "https://media.seedance2video.cc";

export const MEDIA_BASE_URL = (
  process.env.NEXT_PUBLIC_MEDIA_BASE_URL ??
  process.env.R2_PUBLIC_BASE_URL ??
  DEFAULT_MEDIA_BASE_URL
).replace(/\/$/, "");

export function mediaAsset(path: string) {
  if (/^https?:\/\//.test(path)) {
    return path;
  }

  return `${MEDIA_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
