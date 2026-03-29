import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { landingPageSlugs, getLandingPage } from "@/config/landing-pages";
import { AnimeImageEditor } from "@/components/feature/anime-image-editor";
import { site } from "@/config/site";
import { locales } from "@/i18n/routing";

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

  const page = getLandingPage(slug);
  if (!page) return {};

  const canonical = `/${locale}/${page.slug}`;
  const ogImage = new URL(site.ogImagePath, site.siteUrl).toString();

  return {
    title: page.title,
    description: page.description,
    keywords: [page.targetKeyword, "photo to anime", "anime filter", "ai anime converter"],
    alternates: {
      canonical,
      languages: {
        en: `/en/${page.slug}`,
        zh: `/zh/${page.slug}`,
        "x-default": `/en/${page.slug}`,
      },
    },
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
  };
}

export default async function LandingPage(props: { params: Promise<{ locale: string; slug: string }> }) {
  const params = await props.params;
  const { locale, slug } = params;

  const page = getLandingPage(slug);
  if (!page) notFound();

  const t = await getTranslations({ locale, namespace: "landing" });

  return (
    <div className="bg-background">
      <section className="py-10 lg:py-16 bg-gradient-to-b from-muted/20 to-background">
        <div className="container px-4 md:px-6">
          <AnimeImageEditor
            locale={locale}
            title={page.h1}
            subtitle={page.subtitle}
            defaultStyle={page.defaultStyle}
            hideStyleSelector={!!page.hideStyleSelector}
          />
        </div>
      </section>

      <section className="py-14 border-t bg-background">
        <div className="container px-4 md:px-6">
          <div className="max-w-4xl mx-auto space-y-10">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold tracking-tight">{t("how_title", { keyword: page.targetKeyword })}</h2>
              <ol className="grid gap-3 text-muted-foreground list-decimal pl-5">
                <li>{t("how_step1")}</li>
                <li>{t("how_step2")}</li>
                <li>{t("how_step3")}</li>
              </ol>
            </div>

            <div className="space-y-4">
              <h2 className="text-3xl font-bold tracking-tight">{t("faq_title")}</h2>
              <div className="grid gap-6">
                {page.faqs.map((faq, idx) => (
                  <div key={idx} className="rounded-xl border border-border p-6 bg-muted/10">
                    <div className="text-lg font-bold">{faq.question}</div>
                    <div className="mt-2 text-muted-foreground leading-relaxed">{faq.answer}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
