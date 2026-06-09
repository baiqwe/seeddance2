import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import {
  landingPageSlugs,
  getLocalizedLandingPage,
  landingPages,
  getLandingPageInsights,
} from "@/config/landing-pages";
import { site } from "@/config/site";
import { locales } from "@/i18n/routing";
import Link from "next/link";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { FAQSchema, HowToSchema } from "@/components/breadcrumb-schema";
import { buildLocaleAlternates } from "@/utils/seo/metadata";
import { InspirationGallery } from "@/components/gallery/InspirationGallery";
import { ImageGallerySchema } from "@/components/gallery/ImageGallerySchema";
import { LandingPromptBar } from "@/components/landing/LandingPromptBar";
import { getLocalizedWorkflowGroups } from "@/config/workflow-navigation";

function getCreationCenterHref(locale: string, mode: string, model?: string) {
  const params = new URLSearchParams();
  params.set("mode", mode);
  if (model) {
    params.set("model", model);
  }
  return `/${locale}/creative-center?${params.toString()}`;
}

const relatedPrioritySlugs = [
  "seedance-2-ai-video-generator",
  "seedance-video-to-video",
  "ai-video-generator-with-reference-video",
  "ai-video-generator-with-audio-sync",
  "image-to-video",
  "seedance-2-fast",
  "seedance-2-pro-ai-video-generator",
  "motion-control-ai-video-generator",
  "consistent-character-ai-video-generator",
  "product-ad-ai-video-generator",
  "ai-video-extension",
  "video-extension",
  "reference-video-generator",
];

export async function generateStaticParams() {
  return locales.flatMap((locale) =>
    landingPageSlugs.map((slug) => ({
      locale,
      slug,
    })),
  );
}

export async function generateMetadata(props: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  const { locale, slug } = params;

  const page = getLocalizedLandingPage(slug, locale);
  if (!page) return {};

  const canonical = `/${locale}/${page.slug}`;
  const ogImage = new URL(site.ogImagePath, site.siteUrl).toString();
  return {
    title: { absolute: page.title },
    description: page.description,
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

export default async function LandingPage(props: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const params = await props.params;
  const { locale, slug } = params;

  const page = getLocalizedLandingPage(slug, locale);
  if (!page) notFound();

  const t = await getTranslations({ locale, namespace: "landing" });
  const localePrefix = `/${locale}`;
  const relatedPages = relatedPrioritySlugs
    .map((relatedSlug) => landingPages[relatedSlug])
    .filter((item): item is NonNullable<(typeof landingPages)[string]> =>
      Boolean(item) && item.slug !== page.slug,
    )
    .slice(0, 3)
    .map((item) => getLocalizedLandingPage(item.slug, locale))
    .filter((item): item is NonNullable<typeof item> => Boolean(item));
  const workflowGroups = getLocalizedWorkflowGroups(locale);
  const currentWorkflowGroup = workflowGroups.find((group) =>
    group.items.some((item) => item.slug === page.slug),
  );
  const currentWorkflowItems =
    currentWorkflowGroup?.items.filter((item) => item.slug !== page.slug) ?? [];
  const breadcrumbItems = [
    { name: locale === "zh" ? "首页" : "Home", href: `${localePrefix}` },
    { name: page.h1, href: `${localePrefix}/${page.slug}` },
  ];
  const howToSteps = page.executionSteps.map((step) => ({
    name: step,
    text: step,
  }));
  const insightBlock = getLandingPageInsights(page.slug, locale);
  const creationCenterHref = getCreationCenterHref(
    locale,
    page.mode,
    page.model,
  );
  const updatedLabel = new Intl.DateTimeFormat(
    locale === "zh" ? "zh-CN" : "en-US",
    {
      dateStyle: "medium",
      timeZone: "UTC",
    },
  ).format(new Date(page.lastUpdated));
  const taskCards = [
    {
      title: locale === "zh" ? "这个页面解决什么任务" : "What this workflow solves",
      body: page.workflowSummary,
    },
    {
      title: locale === "zh" ? "开始前先准备什么" : "What to prepare first",
      body:
        insightBlock?.inputChecklist[0] ||
        page.executionSteps[0] ||
        page.subtitle,
    },
    {
      title: locale === "zh" ? "常见失败点" : "Common failure point",
      body:
        insightBlock?.commonPitfalls[0] ||
        page.executionSteps[1] ||
        page.subtitle,
    },
  ];
  const taskPlaybookNote =
    insightBlock?.outputNotes[0] ||
    insightBlock?.commonPitfalls[0] ||
    page.workflowSummary;

  return (
    <div className="bg-background">
      <section
        id="creation-workspace"
        className="relative overflow-hidden py-12 lg:py-20"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(58,92,255,0.08),transparent_22%),linear-gradient(180deg,rgba(14,14,18,0.28),rgba(17,17,22,0.14))]" />
        <div className="relative z-10 container px-4 md:px-6">
          <Breadcrumbs items={breadcrumbItems} className="mb-6" />
          <FAQSchema items={page.faqs} />
          <HowToSchema
            name={page.h1}
            description={page.description}
            steps={howToSteps}
          />
          <ImageGallerySchema locale={locale} useCase={page.slug} />
          <div className="mb-10 max-w-4xl space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <div className="section-kicker">
                {locale === "zh"
                  ? "独立工作流 · Powered by Seedance 2"
                  : "Independent workflow · Powered by Seedance 2"}
              </div>
              <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-white/52">
                {locale === "zh"
                  ? `更新于 ${updatedLabel}`
                  : `Updated ${updatedLabel}`}
              </div>
            </div>
            <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl">
              {page.h1}
            </h1>
            <p className="max-w-3xl text-lg leading-8 text-white/76">
              {page.subtitle}
            </p>
            <p className="max-w-3xl text-sm leading-7 text-white/54">
              {locale === "zh"
                ? `${page.workflowSummary} 本页先帮你判断素材、参数和成本是否适合这个任务，再进入创作中心生成。`
                : `${page.workflowSummary} Use this page to judge whether the assets, settings, and cost fit the task before moving into the creation center.`}
            </p>
          </div>
          <LandingPromptBar
            locale={locale}
            mode={page.mode}
            model={page.model}
            title={page.h1}
            summary={page.workflowSummary}
          />
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {taskCards.map((item) => (
              <div
                key={item.title}
                className="rounded-[20px] bg-[#0b1020] p-5 ring-1 ring-[#232938]/65"
              >
                <h2 className="text-base font-semibold text-white">
                  {item.title}
                </h2>
                <p className="mt-3 text-sm leading-7 text-white/58">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <InspirationGallery
        locale={locale}
        useCase={page.slug}
        anchorHrefPrefix={creationCenterHref}
        maxItems={6}
      />

      <section className="border-t border-white/8 bg-[linear-gradient(180deg,#101117_0%,#0d1018_100%)] py-20">
        <div className="container px-4 md:px-6">
          <div className="max-w-4xl mx-auto space-y-10">
            <div className="space-y-4">
              <div className="section-kicker">
                {locale === "zh" ? "执行路径" : "Execution Flow"}
              </div>
              <h2 className="text-3xl font-bold tracking-tight">
                {t("how_title", { keyword: page.targetKeyword })}
              </h2>
              <ol className="grid gap-3 list-decimal pl-5 text-white/72">
                {page.executionSteps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
              <div className="surface-card border-white/8 bg-[#1d1f26] p-6 text-sm leading-8 text-white/70">
                <p>
                  {locale === "zh"
                    ? taskPlaybookNote
                    : taskPlaybookNote}
                </p>
                <p className="mt-3">
                  {locale === "zh"
                    ? `建议按本页的 ${page.targetKeyword} 任务来准备素材，而不是把所有需求塞进一个超长 Prompt。`
                    : `Use this ${page.targetKeyword} page as a task checklist instead of forcing every requirement into one oversized prompt.`}
                </p>
              </div>
            </div>

            {insightBlock ? (
              <div className="grid gap-6 md:grid-cols-2">
                <div className="surface-card border-white/8 bg-[#1d1f26] p-6">
                  <div className="section-kicker">
                    {locale === "zh" ? "Best For" : "Best For"}
                  </div>
                  <h2 className="mt-3 text-2xl font-bold tracking-tight">
                    {locale === "zh"
                      ? "哪些团队和场景最适合这条工作流"
                      : "Which teams and scenarios this workflow fits best"}
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
                  <div className="section-kicker">
                    {locale === "zh" ? "Input Checklist" : "Input Checklist"}
                  </div>
                  <h2 className="mt-3 text-2xl font-bold tracking-tight">
                    {locale === "zh"
                      ? "开始生成前建议先准备这些素材"
                      : "Prepare these inputs before you start generating"}
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
                  <div className="section-kicker">
                    {locale === "zh" ? "Common Pitfalls" : "Common Pitfalls"}
                  </div>
                  <h2 className="mt-3 text-2xl font-bold tracking-tight">
                    {locale === "zh"
                      ? "为什么很多结果会看起来“不像想要的那个视频”"
                      : "Why outputs often miss the video you had in mind"}
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
                  <div className="section-kicker">
                    {locale === "zh" ? "Output Notes" : "Output Notes"}
                  </div>
                  <h2 className="mt-3 text-2xl font-bold tracking-tight">
                    {locale === "zh"
                      ? "更像真实团队在评估结果时会关注的点"
                      : "What real teams usually watch for when reviewing outputs"}
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

            {currentWorkflowGroup ? (
              <div className="surface-card border-white/8 bg-[#151923] p-6">
                <div className="section-kicker">
                  {currentWorkflowGroup.eyebrowLabel}
                </div>
                <div className="mt-3 grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight text-white">
                      {currentWorkflowGroup.titleLabel}
                    </h2>
                    <p className="mt-3 text-sm leading-7 text-white/64">
                      {currentWorkflowGroup.descriptionLabel}
                    </p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {currentWorkflowItems.map((item) => (
                      <Link
                        key={item.id}
                        href={`${localePrefix}/${item.slug}`}
                        className="rounded-[18px] border border-white/8 bg-white/[0.035] p-4 transition-colors hover:border-cyan-200/30 hover:bg-white/[0.06]"
                      >
                        <div className="text-sm font-semibold text-white">
                          {item.labelText}
                        </div>
                        <p className="mt-2 text-xs leading-6 text-white/56">
                          {item.descriptionText}
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}

            <div className="surface-card border-white/8 bg-[#1d1f26] p-6">
              <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
                <div>
                  <div className="section-kicker">
                    {locale === "zh" ? "准备开始" : "Ready to try it"}
                  </div>
                  <h2 className="mt-3 text-2xl font-bold tracking-tight">
                    {locale === "zh"
                      ? "把这条任务带进创作中心，而不是在文章页里硬学完整面板。"
                      : "Bring this task into the creation center instead of learning a full panel inside an article page."}
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-white/66">
                    {locale === "zh"
                      ? "场景页负责帮你理清输入、风险和评估方式；真正上传素材和生成结果，交给创作中心完成。"
                      : "This page helps you understand inputs, pitfalls, and review criteria. Uploading references and generating results belongs in the creation center."}
                  </p>
                </div>
                <Link
                  href={creationCenterHref}
                  className="inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition-colors hover:bg-cyan-100"
                >
                  {page.ctaText}
                </Link>
              </div>
            </div>

            <div className="space-y-4">
              <div className="section-kicker">FAQ</div>
              <h2 className="text-3xl font-bold tracking-tight">
                {t("faq_title")}
              </h2>
              <div className="grid gap-6">
                {page.faqs.map((faq, idx) => (
                  <div
                    key={idx}
                    className="surface-card border-white/8 bg-[#1d1f26] p-6"
                  >
                    <div className="text-lg font-bold">{faq.question}</div>
                    <div className="mt-2 leading-8 text-white/68">
                      {faq.answer}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="surface-card border-white/8 bg-[#1d1f26] p-5">
                <p className="text-sm leading-7 text-white/68">
                  {locale === "zh"
                    ? "如果你已经准备好开始做自己的版本，"
                    : "If you are ready to build your own version, "}{" "}
                  <Link
                    href={`${localePrefix}`}
                    className="font-medium text-primary hover:underline"
                  >
                    {locale === "zh"
                      ? "先回到 Seedance 2 首页"
                      : "go back to the Seedance 2 homepage"}
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
                    <div className="mt-2 text-sm leading-7 text-white/64">
                      {related.subtitle}
                    </div>
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
