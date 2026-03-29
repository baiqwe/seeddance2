import { PricingSection } from "@/components/marketing/pricing-section";
import { setRequestLocale } from 'next-intl/server';
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Pricing",
    description: "Pricing plans for Photo to Anime AI credits and subscriptions."
};

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
