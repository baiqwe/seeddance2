import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { landingPageSlugs, getLocalizedLandingPage, landingPages, getLandingPageInsights } from "@/config/landing-pages";
import { MultiModalWorkspace } from "@/components/feature/multi-modal-workspace";
import { site } from "@/config/site";
import { locales } from "@/i18n/routing";
import Link from "next/link";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { FAQSchema, HowToSchema } from "@/components/breadcrumb-schema";
import { buildLocaleAlternates } from "@/utils/seo/metadata";
import { InspirationGallery } from "@/components/gallery/InspirationGallery";
import { ImageGallerySchema } from "@/components/gallery/ImageGallerySchema";

function getCreationCenterHref(locale: string, mode: string) {
  const params = new URLSearchParams();
  params.set("mode", mode);
  return `/${locale}/creative-center?${params.toString()}`;
}

export async function generateStaticParams() {
  return locales.flatMap((locale) =>
    landingPageSlugs.map((slug) => ({
      locale,
      slug,
    }))
  );
}

export async function generateMetadata(props: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const params = await props.params;
  const { locale, slug } = params;

  const page = getLocalizedLandingPage(slug, locale);
  if (!page) return {};

  const canonical = `/${locale}/${page.slug}`;
  const ogImage = new URL(site.ogImagePath, site.siteUrl).toString();
  return {
    title: page.title,
    description: page.description,
    keywords:
      locale === "zh"
        ? [page.targetKeyword, `Seedance 2 ${page.h1}`, "Seedance 2"]
        : [page.targetKeyword, `Seedance 2 ${page.h1}`, "seedance 2"],
    alternates: buildLocaleAlternates(canonical),
    openGraph: {
      title: page.title,
      description: page.description,
      type: "website",
      url: new URL(canonical, site.siteUrl).toString(),
      siteName: site.siteName,
      images: [{ url: ogImage, width: 512, height: 512, alt: site.siteName }],
    },
    twitter: {
      card: "summary_large_image",
      title: page.title,
      description: page.description,
      images: [ogImage],
    },
    robots: { index: true, follow: true },
  };
}

export default async function LandingPage(props: { params: Promise<{ locale: string; slug: string }> }) {
  const params = await props.params;
  const { locale, slug } = params;

  const page = getLocalizedLandingPage(slug, locale);
  if (!page) notFound();

  const t = await getTranslations({ locale, namespace: "landing" });
  const localePrefix = `/${locale}`;
  const relatedPages = Object.values(landingPages)
    .filter((item) => item.slug !== page.slug)
    .slice(0, 3)
    .map((item) => getLocalizedLandingPage(item.slug, locale))
    .filter((item): item is NonNullable<typeof item> => Boolean(item));
  const breadcrumbItems = [
    { name: locale === "zh" ? "首页" : "Home", href: `${localePrefix}` },
    { name: page.h1, href: `${localePrefix}/${page.slug}` },
  ];
  const howToSteps = [
    { name: t("how_step1"), text: t("how_step1") },
    { name: t("how_step2"), text: t("how_step2") },
    { name: t("how_step3"), text: t("how_step3") },
  ];
  const insightBlock = getLandingPageInsights(page.slug, locale);
  const creationCenterHref = getCreationCenterHref(locale, page.mode);
  const workflowSummary =
    locale === "zh"
      ? page.mode === "image_to_video"
        ? "这条页面更适合从关键帧出发：先锁定起始画面，再决定镜头如何推进。"
        : page.mode === "text_to_video"
          ? "这条页面更适合先把场景、主体和镜头节奏说清楚，再进入创作中心补控制。"
          : page.mode === "video_extension"
            ? "这条页面更适合从已有片段继续往下写，重点是连续性而不是重新定义创意。"
            : "这条页面更适合把图片、动作参考和节奏提示拆开控制，得到更稳定的多模态结果。"
      : page.mode === "image_to_video"
        ? "This page is best when a keyframe should anchor the shot first and camera evolution comes second."
        : page.mode === "text_to_video"
          ? "This page is best when the scene, subject, and pacing need to be described clearly before deeper controls are added."
          : page.mode === "video_extension"
            ? "This page is best when an existing clip needs continuation and continuity matters more than redefining the concept."
            : "This page is best when images, motion references, and timing cues each need a separate job inside one multi-modal workflow.";

  return (
    <div className="bg-background">
      <section id="creation-workspace" className="relative overflow-hidden py-12 lg:py-20">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(58,92,255,0.08),transparent_22%),linear-gradient(180deg,rgba(14,14,18,0.28),rgba(17,17,22,0.14))]" />
        <div className="relative z-10 container px-4 md:px-6">
          <Breadcrumbs items={breadcrumbItems} className="mb-6" />
          <FAQSchema items={page.faqs} />
          <HowToSchema name={page.h1} description={page.description} steps={howToSteps} />
          <ImageGallerySchema locale={locale} useCase={page.slug} />
          <div className="mb-10 max-w-4xl space-y-4">
            <div className="section-kicker">{locale === "zh" ? "Use Case" : "Use Case"}</div>
            <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl">{page.h1}</h1>
            <p className="max-w-3xl text-lg leading-8 text-white/76">{page.subtitle}</p>
            <div className="inline-flex max-w-3xl rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm leading-7 text-white/66">
              {workflowSummary}
            </div>
          </div>
          <MultiModalWorkspace locale={locale} />
        </div>
      </section>

      <InspirationGallery locale={locale} useCase={page.slug} anchorHrefPrefix={`/${locale}/${page.slug}`} maxItems={3} />

      <section className="border-t border-white/8 bg-[linear-gradient(180deg,#101117_0%,#0d1018_100%)] py-20">
        <div className="container px-4 md:px-6">
          <div className="max-w-4xl mx-auto space-y-10">
            <div className="space-y-4">
              <div className="section-kicker">{locale === "zh" ? "执行路径" : "Execution Flow"}</div>
              <h2 className="text-3xl font-bold tracking-tight">{t("how_title", { keyword: page.targetKeyword })}</h2>
              <ol className="grid gap-3 list-decimal pl-5 text-white/72">
                <li>{t("how_step1")}</li>
                <li>{t("how_step2")}</li>
                <li>{t("how_step3")}</li>
              </ol>
              <div className="surface-card border-white/8 bg-[#1d1f26] p-6 text-sm leading-8 text-white/70">
                <p>
                  {locale === "zh"
                    ? `${page.h1} 的关键不是“能不能生成”，而是能不能把参考素材、镜头方向和节奏目标组织成一套别人也能复用的做法。`
                    : `${page.h1} is not just about getting a result. It is about organizing references, motion direction, and pacing into a process a team can repeat.`}
                </p>
                <p className="mt-3">
                  {locale === "zh"
                    ? "把它当成一个具体任务的工作台说明页会更有帮助：你可以直接照着准备素材、组织镜头，再去创作中心开始生成。"
                    : "It is most useful when treated as a task-specific playbook: prepare the right assets, organize the shot properly, then move into the creation center and generate."}
                </p>
              </div>
            </div>

            {insightBlock ? (
              <div className="grid gap-6 md:grid-cols-2">
                <div className="surface-card border-white/8 bg-[#1d1f26] p-6">
                  <div className="section-kicker">{locale === "zh" ? "Best For" : "Best For"}</div>
                  <h2 className="mt-3 text-2xl font-bold tracking-tight">
                    {locale === "zh" ? "哪些团队和场景最适合这条工作流" : "Which teams and scenarios this workflow fits best"}
                  </h2>
                  <ul className="mt-5 space-y-3 text-sm leading-7 text-white/68">
                    {insightBlock.bestFor.map((item) => (
                      <li key={item} className="flex gap-3">
                        <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary/80" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="surface-card border-white/8 bg-[#1d1f26] p-6">
                  <div className="section-kicker">{locale === "zh" ? "Input Checklist" : "Input Checklist"}</div>
                  <h2 className="mt-3 text-2xl font-bold tracking-tight">
                    {locale === "zh" ? "开始生成前建议先准备这些素材" : "Prepare these inputs before you start generating"}
                  </h2>
                  <ul className="mt-5 space-y-3 text-sm leading-7 text-white/68">
                    {insightBlock.inputChecklist.map((item) => (
                      <li key={item} className="flex gap-3">
                        <span className="mt-2 h-1.5 w-1.5 rounded-full bg-cyan-300/80" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : null}

            {insightBlock ? (
              <div className="grid gap-6 md:grid-cols-2">
                <div className="surface-card border-white/8 bg-[#1d1f26] p-6">
                  <div className="section-kicker">{locale === "zh" ? "Common Pitfalls" : "Common Pitfalls"}</div>
                  <h2 className="mt-3 text-2xl font-bold tracking-tight">
                    {locale === "zh" ? "为什么很多结果会看起来“不像想要的那个视频”" : "Why outputs often miss the video you had in mind"}
                  </h2>
                  <ul className="mt-5 space-y-3 text-sm leading-7 text-white/68">
                    {insightBlock.commonPitfalls.map((item) => (
                      <li key={item} className="flex gap-3">
                        <span className="mt-2 h-1.5 w-1.5 rounded-full bg-amber-300/80" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="surface-card border-white/8 bg-[#1d1f26] p-6">
                  <div className="section-kicker">{locale === "zh" ? "Output Notes" : "Output Notes"}</div>
                  <h2 className="mt-3 text-2xl font-bold tracking-tight">
                    {locale === "zh" ? "更像真实团队在评估结果时会关注的点" : "What real teams usually watch for when reviewing outputs"}
                  </h2>
                  <ul className="mt-5 space-y-3 text-sm leading-7 text-white/68">
                    {insightBlock.outputNotes.map((item) => (
                      <li key={item} className="flex gap-3">
                        <span className="mt-2 h-1.5 w-1.5 rounded-full bg-violet-300/80" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : null}

            <div className="grid gap-6 md:grid-cols-[1.05fr_0.95fr]">
              <div className="surface-card border-white/8 bg-[#1d1f26] p-6">
                <div className="section-kicker">{locale === "zh" ? "Recommended Next Step" : "Recommended Next Step"}</div>
                <h2 className="mt-3 text-2xl font-bold tracking-tight">
                  {locale === "zh" ? "看完这页以后，最好的动作通常是进入对应模式的创作中心。" : "After this page, the best next move is usually to open the creation center in the matching mode."}
                </h2>
                <p className="mt-4 text-sm leading-8 text-white/68">
                  {locale === "zh"
                    ? "首页负责理解 Seedance 2，场景页负责理解任务，创作中心负责真正开始生成。这样分开以后，团队更容易知道下一步该做什么。"
                    : "The homepage explains Seedance 2, the use-case page explains the task, and the creation center is where production begins. That separation makes it easier for teams to know what to do next."}
                </p>
                <div className="mt-6">
                  <Link
                    href={creationCenterHref}
                    className="inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition-colors hover:bg-cyan-100"
                  >
                    {locale === "zh" ? "用这个工作流进入创作中心" : "Open this workflow in the creation center"}
                  </Link>
                </div>
              </div>

              <div className="surface-card border-white/8 bg-[#1d1f26] p-6">
                <div className="section-kicker">{locale === "zh" ? "Related Learning" : "Related Learning"}</div>
                <h2 className="mt-3 text-2xl font-bold tracking-tight">
                  {locale === "zh" ? "如果结果不对，先去看这两个解释层。" : "If the output is off, these are usually the next two layers worth checking."}
                </h2>
                <div className="mt-5 space-y-3">
                  <Link href={`/${locale}/guides`} className="block rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-4 text-sm text-white/72 transition-colors hover:bg-white/[0.06] hover:text-white">
                    {locale === "zh" ? "使用指南：先检查 Prompt、参考素材和评估方式。" : "Guides: review prompt structure, references, and output evaluation first."}
                  </Link>
                  <Link href={`/${locale}/about`} className="block rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-4 text-sm text-white/72 transition-colors hover:bg-white/[0.06] hover:text-white">
                    {locale === "zh" ? "关于我们：理解这套产品为什么强调工作流、边界和团队复用。" : "About: understand why the product emphasizes workflow, boundaries, and team reuse."}
                  </Link>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="section-kicker">FAQ</div>
              <h2 className="text-3xl font-bold tracking-tight">{t("faq_title")}</h2>
              <div className="grid gap-6">
                {page.faqs.map((faq, idx) => (
                  <div key={idx} className="surface-card border-white/8 bg-[#1d1f26] p-6">
                    <div className="text-lg font-bold">{faq.question}</div>
                    <div className="mt-2 leading-8 text-white/68">{faq.answer}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="surface-card border-white/8 bg-[#1d1f26] p-5">
                <p className="text-sm leading-7 text-white/68">
                  {locale === "zh" ? "如果你已经准备好开始做自己的版本，" : "If you are ready to build your own version, "}{" "}
                  <Link href={`${localePrefix}`} className="font-medium text-primary hover:underline">
                    {locale === "zh" ? "先回到 Seedance 2 首页" : "go back to the Seedance 2 homepage"}
                  </Link>
                  {locale === "zh"
                    ? "，再根据任务类型进入创作中心或继续看这个场景页。"
                    : " and then choose between the creation center or this scenario page depending on how much control you need."}
                </p>
              </div>
              <h2 className="text-3xl font-bold tracking-tight">
                {locale === "zh" ? "相关视频工作流" : "Related Video Workflows"}
              </h2>
              <div className="grid gap-4 md:grid-cols-3">
                {relatedPages.map((related) => (
                  <Link
                    key={related.slug}
                    href={`${localePrefix}/${related.slug}`}
                    className="surface-card border-white/8 bg-[#1d1f26] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-primary/30"
                  >
                    <div className="text-lg font-semibold">{related.h1}</div>
                    <div className="mt-2 text-sm leading-7 text-white/64">{related.subtitle}</div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
