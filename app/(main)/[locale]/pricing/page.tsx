import { PricingSection } from "@/components/marketing/pricing-section";
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Metadata } from "next";
import { site } from "@/config/site";
import { buildLocaleAlternates } from "@/utils/seo/metadata";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";

export async function generateMetadata(props: Props): Promise<Metadata> {
    const { locale } = await props.params;
    const t = await getTranslations({ locale, namespace: "Pricing" });
    const title = locale === "zh" ? `价格方案 | ${site.siteName}` : `Pricing Plans | ${site.siteName}`;
    const description =
        locale === "zh"
            ? "查看 Seedance 2 的买断包与订阅方案，比较不同视频工作流下的额度、成本和生产特权。"
            : "Compare Seedance 2 buy-out packs and subscriptions by credits, workflow value, and production privileges.";
    const ogImage = new URL(site.ogImagePath, site.siteUrl).toString();

    return {
        title: { absolute: title },
        description,
        alternates: buildLocaleAlternates(`/${locale}/pricing`),
        openGraph: {
            title,
            description,
            type: "website",
            url: new URL(`/${locale}/pricing`, site.siteUrl).toString(),
            siteName: site.siteName,
            images: [{ url: ogImage, width: 512, height: 512, alt: t("title") }],
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: [ogImage],
        },
    };
}

type Props = {
    params: Promise<{ locale: string }>;
}

export default async function PricingPage({ params }: Props) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "Pricing" });
    setRequestLocale(locale);
    const localePrefix = `/${locale}`;

    return (
        <div className="bg-background min-h-screen pt-20">
            <section className="relative overflow-hidden border-b border-border/60 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.12),transparent_28%),radial-gradient(circle_at_top_right,rgba(244,114,182,0.08),transparent_22%),linear-gradient(180deg,rgba(7,11,21,0.96),rgba(5,8,18,1))]">
                <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
                    <Breadcrumbs
                        items={[
                            { name: locale === "zh" ? "首页" : "Home", href: localePrefix },
                            { name: locale === "zh" ? "价格方案" : "Pricing", href: `${localePrefix}/pricing` },
                        ]}
                        className="mb-8"
                    />
                    <div className="text-center">
                    <span className="section-kicker">{t("eyebrow")}</span>
                    <h1 className="mt-6 text-4xl font-black tracking-tight text-white sm:text-5xl">
                        {t("title")}
                    </h1>
                    <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-white/68">
                        {t("subtitle")}
                    </p>
                    </div>
                </div>
            </section>
            <PricingSection locale={locale} hideIntro />
        </div>
    );
}
