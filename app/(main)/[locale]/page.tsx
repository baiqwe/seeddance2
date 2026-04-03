import HomeClientWrapper from '@/components/home/HomeClientWrapper';
import HomeStaticContent from '@/components/home/HomeStaticContent';
import type { Metadata } from "next";
import { site } from "@/config/site";
import { buildLocaleAlternates } from "@/utils/seo/metadata";

// ✅ This is now a Server Component (no 'use client')
// Hero/Interactive content is client-side, static content is server-rendered for SEO

export async function generateMetadata(props: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const params = await props.params;
    const { locale } = params;

    return {
        alternates: buildLocaleAlternates(`/${locale}`),
        openGraph: {
            url: new URL(`/${locale}`, site.siteUrl).toString(),
        },
    };
}

export default async function HomePage(props: { params: Promise<{ locale: string }> }) {
    const params = await props.params;
    const { locale } = params;

    // Server-rendered static content for better LCP and SEO
    const staticContent = await HomeStaticContent({ locale });

    return (
        <HomeClientWrapper staticContent={staticContent} />
    );
}
