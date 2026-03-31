import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import Header from "@/components/header";
import { Footer } from "@/components/footer";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/toaster";
import { SoftwareApplicationSchema } from "@/components/json-ld-schema";
import { GoogleAnalytics } from "@/components/google-analytics";
import { ClarityAnalytics } from "@/components/clarity-analytics";
import { site } from "@/config/site";

export function generateStaticParams() {
    return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata(props: { params: Promise<{ locale: string }> }) {
    const params = await props.params;
    const { locale } = params;
    const messages = await getMessages({ locale }) as any;

    return {
        // ✅ SEO 核心: metadataBase 用于生成绝对 URL
        metadataBase: new URL(site.siteUrl),

        title: {
            default: messages.metadata.title,
            template: `%s | ${site.siteName}`
        },
        description: messages.metadata.description,
        keywords: messages.metadata.keywords,

        // ✅ 作者和站点信息
        authors: [{ name: site.siteName }],
        creator: site.siteName,
        publisher: site.siteName,

        // ✅ Open Graph - 添加图片
        openGraph: {
            title: messages.metadata.title,
            description: messages.metadata.description,
            type: "website",
            locale: locale === 'zh' ? 'zh_CN' : 'en_US',
            url: `${site.siteUrl}/${locale}`,
            siteName: site.siteName,
            images: [
                {
                    url: new URL(site.ogImagePath, site.siteUrl).toString(),
                    width: 512,
                    height: 512,
                    alt: site.siteName,
                },
            ],
        },

        // ✅ Twitter Card - 添加图片
        twitter: {
            card: "summary_large_image",
            title: messages.metadata.title,
            description: messages.metadata.description,
            images: [new URL(site.ogImagePath, site.siteUrl).toString()],
        },

        // ✅ Canonical & 多语言 alternates
        alternates: {
            canonical: `/${locale}`,
            languages: {
                'en': '/en',
                'zh': '/zh',
                'x-default': '/en',
            },
        },

        // ✅ Robots 配置 - 允许索引
        robots: {
            index: true,
            follow: true,
            googleBot: {
                index: true,
                follow: true,
                'max-video-preview': -1,
                'max-image-preview': 'large',
                'max-snippet': -1,
            },
        },

        // ✅ Favicon 和图标配置 - 匹配实际文件
        icons: {
            icon: [
                { url: '/favicon.ico', sizes: 'any' },
                { url: '/favicon.svg', type: 'image/svg+xml' },
                { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
            ],
            apple: [
                { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
            ],
            other: [
                { rel: 'mask-icon', url: '/favicon.svg', color: '#000000' },
            ],
        },

        // ✅ Web App Manifest
        manifest: '/site.webmanifest',

        // ✅ 其他 SEO 相关
        category: 'technology',
        classification: 'Image Processing Tool',
    };
}

export default async function LocaleLayout(props: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}) {
    const params = await props.params;
    const { locale } = params;
    const { children } = props;

    // Validate locale
    if (!routing.locales.includes(locale as any)) {
        notFound();
    }

    const messages = await getMessages({ locale });

    return (
        <>
            <GoogleAnalytics />
            <ClarityAnalytics />
            <SoftwareApplicationSchema locale={locale} />
            <NextIntlClientProvider messages={messages} locale={locale}>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                >
                    <div className="relative min-h-screen flex flex-col">
                        <Header />
                        <main className="flex-1">{children}</main>
                        <Footer />
                    </div>
                    <Toaster />
                </ThemeProvider>
            </NextIntlClientProvider>
        </>
    );
}
