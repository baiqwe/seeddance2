import { PricingSection } from "@/components/marketing/pricing-section";
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Metadata } from "next";
import { site } from "@/config/site";
import { buildLocaleAlternates } from "@/utils/seo/metadata";

export async function generateMetadata(props: Props): Promise<Metadata> {
    const { locale } = await props.params;
    const t = await getTranslations({ locale, namespace: "Pricing" });
    const title = locale === "zh" ? `价格方案 | ${site.siteName}` : `Pricing Plans | ${site.siteName}`;
    const description =
        locale === "zh"
            ? "查看 Animeify 的积分包与专业版订阅方案，对比每张图片成本、生成额度与高级权益，选择最适合你的照片转二次元定价。"
            : "Compare Animeify credit packs and Pro subscriptions by cost per generation, monthly credits, and premium features for your photo-to-anime workflow.";
    const ogImage = new URL(site.ogImagePath, site.siteUrl).toString();

    return {
        title,
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

    return (
        <div className="bg-background min-h-screen pt-20">
            <section className="relative overflow-hidden border-b border-border/60 bg-[radial-gradient(circle_at_top,rgba(227,104,74,0.08),transparent_28%),linear-gradient(180deg,rgba(252,251,248,0.96),rgba(255,255,255,1))]">
                <div className="mx-auto max-w-5xl px-4 py-16 text-center sm:px-6 lg:px-8">
                    <span className="section-kicker">{t("eyebrow")}</span>
                    <h1 className="mt-6 text-4xl font-black tracking-tight text-foreground sm:text-5xl">
                        {t("title")}
                    </h1>
                    <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-muted-foreground">
                        {t("subtitle")}
                    </p>
                </div>
            </section>
            <PricingSection locale={locale} hideIntro />
        </div>
    );
}
