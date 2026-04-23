import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, Clapperboard, Disc3, PlayCircle, Sparkles, WandSparkles } from "lucide-react";
import { buildLocaleAlternates } from "@/utils/seo/metadata";
import { getPublicGenerationById } from "@/utils/public-generation";
import { site } from "@/config/site";

type Props = {
  params: Promise<{
    locale: string;
    id: string;
  }>;
};

function formatDate(value: string, locale: string) {
  return new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : "en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

function formatMode(mode?: string | null, locale = "en") {
  const map: Record<string, { en: string; zh: string }> = {
    multi_modal_video: { en: "Multi-modal Video", zh: "多模态视频生成" },
    image_to_video: { en: "Image to Video", zh: "图像转视频" },
    text_to_video: { en: "Text to Video", zh: "文本转视频" },
    video_extension: { en: "Video Extension", zh: "视频扩写" },
  };

  const resolved = mode ? map[mode] : null;
  return locale === "zh" ? resolved?.zh || "Seedance Job" : resolved?.en || "Seedance Job";
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, id } = await params;
  const generation = await getPublicGenerationById(id);

  if (!generation) {
    return {
      title: locale === "zh" ? "视频不存在" : "Video not found",
      robots: { index: false, follow: false },
    };
  }

  const canonical = `/${locale}/video/${generation.id}`;
  const thumbnailUrl = generation.thumbnail_url
    ? new URL(generation.thumbnail_url, site.siteUrl).toString()
    : new URL(site.ogImagePath, site.siteUrl).toString();
  const title =
    locale === "zh"
      ? `Seedance 2.0 生成视频 ${generation.id.slice(0, 8)}`
      : `Seedance 2.0 generated video ${generation.id.slice(0, 8)}`;
  const description =
    locale === "zh"
      ? generation.prompt || "查看这条由 Seedance 2.0 生成的公开视频。"
      : generation.prompt || "Watch this public video created with Seedance 2.0.";

  return {
    title,
    description,
    alternates: buildLocaleAlternates(canonical),
    openGraph: {
      title,
      description,
      type: "video.other",
      url: new URL(canonical, site.siteUrl).toString(),
      siteName: site.siteName,
      images: [{ url: thumbnailUrl, width: 1280, height: 720, alt: title }],
      videos: [
        {
          url: generation.output_video_url,
          width: generation.aspect_ratio === "9:16" ? 1080 : 1920,
          height: generation.aspect_ratio === "9:16" ? 1920 : 1080,
          type: "video/mp4",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [thumbnailUrl],
    },
    robots: { index: true, follow: true },
    other: {
      "og:video": generation.output_video_url,
      "og:video:type": "video/mp4",
      "og:image": thumbnailUrl,
    },
  };
}

export default async function PublicVideoPage({ params }: Props) {
  const { locale, id } = await params;
  const generation = await getPublicGenerationById(id);

  if (!generation) {
    notFound();
  }

  const isZh = locale === "zh";
  const title = isZh ? "公开视频详情" : "Public video details";
  const thumbnailUrl = generation.thumbnail_url
    ? new URL(generation.thumbnail_url, site.siteUrl).toString()
    : undefined;
  const schema = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: `${site.siteName} video ${generation.id.slice(0, 8)}`,
    description: generation.prompt,
    thumbnailUrl: thumbnailUrl ? [thumbnailUrl] : undefined,
    contentUrl: generation.output_video_url,
    embedUrl: new URL(`/${locale}/video/${generation.id}`, site.siteUrl).toString(),
    uploadDate: generation.created_at,
    duration:
      generation.duration_seconds && generation.duration_seconds > 0
        ? `PT${generation.duration_seconds}S`
        : undefined,
    publisher: {
      "@type": "Organization",
      name: site.siteName,
    },
  };

  return (
    <div className="relative overflow-hidden bg-[linear-gradient(180deg,#03050a_0%,#07101f_46%,#050710_100%)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(125,211,252,0.14),transparent_30%),radial-gradient(circle_at_80%_10%,rgba(244,114,182,0.12),transparent_24%),linear-gradient(180deg,rgba(255,255,255,0.03),transparent_26%)]" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      <section className="relative container px-4 py-12 md:px-6 md:py-16">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 flex flex-wrap items-center gap-3 text-sm text-white/54">
            <Link href={`/${locale}`} className="transition-colors hover:text-white">
              {isZh ? "首页" : "Home"}
            </Link>
            <span>/</span>
            <span className="text-white/80">{title}</span>
          </div>

          <div className="grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
            <div className="overflow-hidden rounded-[30px] border border-white/10 bg-black/30 shadow-[0_40px_120px_rgba(0,0,0,0.5)] backdrop-blur-xl">
              <div className="border-b border-white/8 px-5 py-4 text-xs uppercase tracking-[0.24em] text-white/45">
                {isZh ? "Shareable playback" : "Shareable playback"}
              </div>
              <div className="relative aspect-video bg-[radial-gradient(circle_at_20%_10%,rgba(125,211,252,0.18),transparent_22%),linear-gradient(180deg,#04070d_0%,#0b1220_100%)]">
                <video
                  src={generation.output_video_url}
                  poster={thumbnailUrl}
                  controls
                  playsInline
                  preload="metadata"
                  className="h-full w-full object-cover"
                />
                <div className="pointer-events-none absolute left-4 top-4 inline-flex items-center gap-2 rounded-full border border-white/12 bg-black/35 px-3 py-1 text-xs uppercase tracking-[0.24em] text-white/72 backdrop-blur-md">
                  <PlayCircle className="h-3.5 w-3.5" />
                  {isZh ? "可分享视频" : "Share-ready"}
                </div>
              </div>
            </div>

            <div className="space-y-5">
              <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/15 bg-cyan-300/10 px-3 py-1 text-xs uppercase tracking-[0.24em] text-cyan-50">
                  <Sparkles className="h-3.5 w-3.5" />
                  {formatMode(generation.generation_type, locale)}
                </div>

                <h1 className="mt-5 max-w-xl text-4xl font-black tracking-tight text-white">
                  {isZh ? "这条视频可以直接分享出去。" : "This generation is ready to travel on its own."}
                </h1>
                <p className="mt-4 text-base leading-8 text-white/62">
                  {isZh
                    ? "这不是一个普通结果页，而是一个能承接外链传播、搜索抓取和社媒预览的公开详情页。"
                    : "This is a public destination built for outbound sharing, search discovery, and social previews."}
                </p>

                <div className="mt-6 flex flex-wrap gap-2">
                  <MetaPill label={isZh ? "分辨率" : "Resolution"} value={generation.resolution || "1080p"} />
                  <MetaPill label={isZh ? "时长" : "Duration"} value={`${generation.duration_seconds || 5}s`} />
                  <MetaPill label={isZh ? "画幅" : "Aspect"} value={generation.aspect_ratio || "16:9"} />
                  <MetaPill label={isZh ? "积分" : "Credits"} value={`${generation.credits_cost}`} />
                </div>
              </div>

              <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-6 backdrop-blur-xl">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-white/44">
                  <Clapperboard className="h-4 w-4" />
                  {isZh ? "Prompt" : "Prompt"}
                </div>
                <p className="mt-4 text-sm leading-8 text-white/72">
                  {generation.prompt || (isZh ? "没有附加说明。" : "No prompt was attached.")}
                </p>
              </div>

              <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-white/44">
                  <Disc3 className="h-4 w-4" />
                  {isZh ? "发布信息" : "Publishing context"}
                </div>
                <div className="mt-4 space-y-3 text-sm text-white/66">
                  <div>{isZh ? "生成时间" : "Generated"}: {formatDate(generation.created_at, locale)}</div>
                  <div>{isZh ? "公开链接" : "Public URL"}: /{locale}/video/{generation.id}</div>
                  <div>{isZh ? "媒体直链已适配交付层" : "Media URL is delivery-layer ready"}.</div>
                </div>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    href={`/${locale}#workspace`}
                    className="inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition-colors hover:bg-cyan-100"
                  >
                    <WandSparkles className="mr-2 h-4 w-4" />
                    {isZh ? "开始创建自己的版本" : "Create your own version"}
                  </Link>
                  <a
                    href={generation.output_video_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center rounded-full border border-white/12 bg-white/[0.03] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/[0.08]"
                  >
                    {isZh ? "打开原视频" : "Open raw video"}
                    <ArrowUpRight className="ml-2 h-4 w-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function MetaPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-full border border-white/10 bg-black/20 px-4 py-2 text-sm text-white/76">
      <span className="text-white/42">{label}</span> · <span className="font-medium text-white">{value}</span>
    </div>
  );
}
