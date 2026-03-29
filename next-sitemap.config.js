/** @type {import('next-sitemap').IConfig} */
const { landingPageSlugs } = require("./config/landing-pages-slugs");

module.exports = {
    siteUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    generateRobotsTxt: true,
    generateIndexSitemap: false,

    // Exclude pages that shouldn't be indexed
    exclude: [
        '/api/*',           // API routes
        '/_next/*',         // Next.js system files
        '/server-sitemap.xml',
        '/icon.svg',
        '/apple-icon.png',
        '/*/sign-in',       // Auth pages
        '/*/sign-up',
        '/*/forgot-password',
    ],

    // Generate alternate language links
    alternateRefs: [
        {
            href: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/en`,
            hreflang: 'en',
        },
        {
            href: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/zh`,
            hreflang: 'zh',
        },
    ],

    robotsTxtOptions: {
        policies: [
            {
                userAgent: '*',
                allow: '/',
                disallow: [
                    '/api/',
                    '/_next/',
                    '/*/sign-in',
                    '/*/sign-up',
                    '/*/forgot-password',
                ],
            },
        ],
    },

    // ✅ 核心修复：手动添加动态路由路径
    additionalPaths: async (config) => {
        const locales = ['en', 'zh'];
        const staticPages = ['pricing', 'privacy', 'terms', 'about'];
        const result = [];

        // Landing pages (pSEO slugs)
        for (const locale of locales) {
            for (const slug of landingPageSlugs) {
                result.push({
                    loc: `/${locale}/${slug}`,
                    changefreq: 'weekly',
                    priority: 0.9,
                    lastmod: new Date().toISOString(),
                });
            }
        }

        // Add static feature and policy pages
        for (const locale of locales) {
            for (const page of staticPages) {
                const priority = page.includes('privacy') || page.includes('terms') ? 0.5 : 0.7;
                result.push({
                    loc: `/${locale}/${page}`,
                    changefreq: page.includes('privacy') || page.includes('terms') ? 'monthly' : 'weekly',
                    priority: priority,
                    lastmod: new Date().toISOString(),
                });
            }
        }

        return result;
    },

    transform: async (config, path) => {
        // Add priority and changefreq based on page type
        let priority = 0.7;
        let changefreq = 'weekly';

        if (path === '/en' || path === '/zh') {
            // Homepage has highest priority
            priority = 1.0;
            changefreq = 'daily';
        } else if (landingPageSlugs.some((s) => path.endsWith(`/${s}`))) {
            // Landing pages are important pages
            priority = 0.9;
            changefreq = 'weekly';
        }

        return {
            loc: path,
            changefreq,
            priority,
            lastmod: new Date().toISOString(),
        };
    },
};
