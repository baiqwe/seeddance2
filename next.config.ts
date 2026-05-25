import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n.ts');
const enableCloudflareImageLoader =
  process.env.NEXT_PUBLIC_ENABLE_CF_IMAGE_RESIZING === "true";

const nextConfig: NextConfig = {
  output: "standalone",
  devIndicators: {
    appIsrStatus: false,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },

  images: {
    ...(enableCloudflareImageLoader
      ? {
          loader: "custom" as const,
          loaderFile: "./utils/cloudflare-image-loader.ts",
        }
      : {
          // OpenNext on Cloudflare does not provide the Next.js image optimizer.
          // Enable NEXT_PUBLIC_ENABLE_CF_IMAGE_RESIZING once Cloudflare Image Resizing is turned on.
          unoptimized: true,
        }),
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'replicate.delivery',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.replicate.delivery',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com', // Google Avatar
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'media.seedance2video.cc',
        pathname: '/**',
      },
    ],
  },

  // Configure webpack to ignore the external folder
  webpack: (config: any) => {
    config.watchOptions = {
      ...config.watchOptions,
      ignored: ['**/Chinesename.club/**', '**/node_modules/**'],
    };
    return config;
  },
};

export default withNextIntl(nextConfig);
