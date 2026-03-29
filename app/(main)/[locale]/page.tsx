import HomeClientWrapper from '@/components/home/HomeClientWrapper';
import HomeStaticContent from '@/components/home/HomeStaticContent';

// ✅ This is now a Server Component (no 'use client')
// Hero/Interactive content is client-side, static content is server-rendered for SEO

export default async function HomePage(props: { params: Promise<{ locale: string }> }) {
    const params = await props.params;
    const { locale } = params;

    // Server-rendered static content for better LCP and SEO
    const staticContent = await HomeStaticContent({ locale });

    return (
        <HomeClientWrapper staticContent={staticContent} />
    );
}
