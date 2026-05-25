type CloudflareImageLoaderProps = {
  src: string;
  width: number;
  quality?: number;
};

const SITE_ORIGIN = "https://www.seedance2video.cc";

export default function cloudflareImageLoader({
  src,
  width,
  quality,
}: CloudflareImageLoaderProps) {
  if (!src || src.startsWith("data:") || src.endsWith(".svg")) {
    return src;
  }

  const normalizedSrc = src.startsWith("http")
    ? src
    : new URL(src.startsWith("/") ? src : `/${src}`, SITE_ORIGIN).toString();
  const params = `width=${width},quality=${quality || 75},format=auto`;

  return `${SITE_ORIGIN}/cdn-cgi/image/${params}/${normalizedSrc}`;
}
