/**
 * JSON-LD Structured Data for SoftwareApplication
 * Helps search engines understand the app as a web application
 * 
 * Note: This is a server component to avoid hydration issues
 */
import { getTranslations } from 'next-intl/server';
import { site } from '@/config/site';
import { galleryItems } from '@/config/gallery';
import { toSchemaDateTime } from '@/utils/seo/date';
import { parseDurationLabelToSeconds, secondsToIsoDuration } from '@/utils/seo/video';

function toAbsoluteUrl(pathOrUrl: string) {
    try {
        return new URL(pathOrUrl, site.siteUrl).toString();
    } catch (error) {
        console.error("JSON-LD URL normalization failed", { pathOrUrl, siteUrl: site.siteUrl, error });
        return null;
    }
}

export async function SoftwareApplicationSchema({ locale }: { locale: string }) {
    try {
        const t = await getTranslations({ locale, namespace: 'metadata' });
        const sameAs = [site.socialLinks.linkedin, site.socialLinks.reddit].filter(
            (value): value is string => Boolean(value)
        );
        const screenshotUrl = toAbsoluteUrl(site.ogImagePath);

        const organizationSchema = {
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": site.siteName,
            "url": site.siteUrl,
            "email": site.supportEmail,
            ...(sameAs.length ? { sameAs } : {}),
        };

        const websiteSchema = {
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": site.siteName,
            "alternateName": "Seedance 2",
            "url": site.siteUrl,
            "inLanguage": locale === "zh" ? "zh-CN" : "en-US",
            "publisher": {
                "@type": "Organization",
                "name": site.siteName,
                "url": site.siteUrl,
            },
        };

        const appSchema = {
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": `${site.siteName} - Multi-Modal AI Video Workspace`,
            "description": t('description'),
            "applicationCategory": "MultimediaApplication",
            "operatingSystem": "Web Browser",
            "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
            },
            "featureList": [
                "Multi-modal AI video generation workspace",
                "Image, video, audio, and text references",
                "Reference-driven motion and camera control",
                "Async-ready generation queue",
                "Video extension and production workflow planning"
            ],
            ...(screenshotUrl ? { "screenshot": screenshotUrl } : {}),
            "provider": {
                "@type": "Organization",
                "name": site.siteName,
                "url": site.siteUrl
            }
        };

        const videoSchemas = galleryItems.slice(0, 3).flatMap((item) => {
            const durationSeconds = parseDurationLabelToSeconds(item.durationLabel) ?? 5;
            const thumbnailUrl = toAbsoluteUrl(item.afterImage);
            const contentUrl = toAbsoluteUrl(item.videoUrl);
            const embedUrl = toAbsoluteUrl(`/${locale}/${item.slug}#showcase`);

            if (!thumbnailUrl || !contentUrl || !embedUrl) {
                return [];
            }

            return [{
                "@context": "https://schema.org",
                "@type": "VideoObject",
                "name": locale === "zh" ? item.titleZh : item.title,
                "description": locale === "zh" ? item.descriptionZh : item.description,
                "thumbnailUrl": thumbnailUrl,
                "contentUrl": contentUrl,
                "embedUrl": embedUrl,
                "duration": secondsToIsoDuration(durationSeconds),
                "uploadDate": toSchemaDateTime("2026-04-23T00:00:00+08:00"),
                "publisher": {
                    "@type": "Organization",
                    "name": site.siteName
                }
            }];
        });

        const schema = [organizationSchema, websiteSchema, appSchema, ...videoSchemas];

        return (
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
            />
        );
    } catch (error) {
        console.error("SoftwareApplicationSchema failed", error);
        return null;
    }
}
