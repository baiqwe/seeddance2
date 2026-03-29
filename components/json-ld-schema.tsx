/**
 * JSON-LD Structured Data for SoftwareApplication
 * Helps search engines understand the app as a web application
 * 
 * Note: This is a server component to avoid hydration issues
 */
import { getTranslations } from 'next-intl/server';
import { site } from '@/config/site';

export async function SoftwareApplicationSchema({ locale }: { locale: string }) {
    const t = await getTranslations({ locale, namespace: 'metadata' });

    const schema = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": `${site.siteName} - Photo to Anime AI Converter`,
        "description": t('description'),
        "applicationCategory": "MultimediaApplication",
        "operatingSystem": "Web Browser",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
        },
        "featureList": [
            "Photo to anime AI conversion",
            "Multiple anime styles (Ghibli-inspired, cyberpunk, 90s retro, webtoon)",
            "Adjustable anime intensity",
            "Preserve key colors (eyes/hair)",
            "Download generated images"
        ],
        "screenshot": new URL(site.ogImagePath, site.siteUrl).toString(),
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.8",
            "ratingCount": "1250"
        }
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}
