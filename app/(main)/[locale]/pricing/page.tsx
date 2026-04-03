import { PricingSection } from "@/components/marketing/pricing-section";
import { setRequestLocale } from 'next-intl/server';
import { Metadata } from "next";
import { site } from "@/config/site";
import { buildLocaleAlternates } from "@/utils/seo/metadata";

export async function generateMetadata(props: Props): Promise<Metadata> {
    const { locale } = await props.params;

    return {
        title: "Pricing",
        description: "Pricing plans for Photo to Anime AI credits and subscriptions.",
        alternates: buildLocaleAlternates(`/${locale}/pricing`),
        openGraph: {
            url: new URL(`/${locale}/pricing`, site.siteUrl).toString(),
        },
    };
}

type Props = {
    params: Promise<{ locale: string }>;
}

export default async function PricingPage({ params }: Props) {
    const { locale } = await params;
    setRequestLocale(locale);

    return (
        <div className="bg-background min-h-screen pt-20">
            <PricingSection locale={locale} />
        </div>
    );
}
