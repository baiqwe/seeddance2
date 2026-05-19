"use client";

import { Logo } from "./logo";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { site } from "@/config/site";

export function Footer() {
  const pathname = usePathname();
  const t = useTranslations('footer');
  const isDashboard = /^\/(?:en|zh)?\/?dashboard(?:\/|$)/.test(pathname || "");

  // 检测当前 locale
  const pathParts = pathname?.split('/') || [];
  const currentLocale = (pathParts[1] === 'en' || pathParts[1] === 'zh') ? pathParts[1] : 'en';
  const localePrefix = `/${currentLocale}`;
  const isZh = currentLocale === "zh";

  const toolLinks = [
    { label: isZh ? "创作中心" : "Creation Center", href: `${localePrefix}/creative-center` },
    { label: isZh ? "使用指南" : "Guides", href: `${localePrefix}/guides` },
    { label: isZh ? "价格方案" : "Pricing", href: `${localePrefix}/pricing` },
    { label: isZh ? "控制台" : "Dashboard", href: `${localePrefix}/dashboard` },
  ];

  const styleLinks = [
    { label: isZh ? "图像转视频" : "Image to Video", href: `${localePrefix}/image-to-video`, id: "image-to-video" },
    { label: isZh ? "参考视频生成" : "Reference Video", href: `${localePrefix}/reference-video-generator`, id: "reference-video-generator" },
    { label: isZh ? "动作迁移" : "Motion Transfer", href: `${localePrefix}/dance-motion-transfer`, id: "dance-motion-transfer" },
    { label: isZh ? "视频延展" : "Video Extension", href: `${localePrefix}/video-extension`, id: "video-extension" },
  ];
  const communityLinks = [
    { label: "LinkedIn", href: site.socialLinks.linkedin },
    { label: "Reddit", href: site.socialLinks.reddit },
  ].filter((link): link is { label: string; href: string } => Boolean(link.href));

  const legalLinks = [
    { label: t('link_privacy'), href: `${localePrefix}/privacy` },
    { label: t('link_terms'), href: `${localePrefix}/terms` },
    { label: t('link_about'), href: `${localePrefix}/about` },
    { label: t('link_contact'), href: `${localePrefix}/contact` },
    { label: isZh ? "帮助中心" : "Help Center", href: `${localePrefix}/guides` },
  ];

  if (isDashboard) {
    return (
      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row md:py-0">
          <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
            <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
              {isZh ? "Seedance 2 独立 AI 视频工作流网站" : "Independent Seedance 2 AI video workflow website"}
            </p>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="border-t border-border/70 bg-[linear-gradient(180deg,rgba(7,11,21,0.92),rgba(5,8,18,0.98))]">
      <div className="container px-4 py-14 md:py-20">
        <div className="surface-panel px-6 py-8 md:px-8 md:py-10">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
          {/* Brand */}
          <div className="col-span-full lg:col-span-2">
            <Logo />
            <p className="mt-5 max-w-sm text-sm leading-7 text-muted-foreground">
              {t('tagline')}
            </p>
            <p className="mt-3 inline-flex rounded-full border border-border/80 bg-background/80 px-3 py-1.5 text-xs text-muted-foreground">
              {currentLocale === 'zh'
                ? '上传素材会在你的工作流里保持独立：角色、动作、节奏和结果各自可追踪。'
                : 'Uploads stay separated by role so identity, motion, timing, and outputs remain easier to track.'}
            </p>
            <p className="mt-4 max-w-sm text-sm leading-7 text-muted-foreground">
              {currentLocale === 'zh'
                ? '首页负责理解 Seedance 2，创作中心负责开始生成，Guides 和场景页负责把真实工作流讲清楚。'
                : 'The homepage explains Seedance 2, the creation center starts generation, and guides plus workflow pages explain how the production process actually works.'}
            </p>
            <p className="mt-4 max-w-sm rounded-2xl border border-border/70 bg-background/70 px-4 py-3 text-xs leading-6 text-muted-foreground">
              {currentLocale === 'zh'
                ? 'seedance2video.cc 是独立网站，不隶属于 ByteDance、TikTok、CapCut 或 Google。本站不提供客户端软件下载，也不会索要第三方平台密码。'
                : 'seedance2video.cc is an independent website and is not affiliated with ByteDance, TikTok, CapCut, or Google. We do not offer client software downloads and never ask for third-party platform passwords.'}
            </p>
          </div>

          {/* Tools - 工具内链 */}
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold">
              {currentLocale === 'zh' ? '转换工具' : 'Tools'}
            </h3>
            <nav className="flex flex-col gap-2">
              {toolLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-muted-foreground transition-all hover:translate-x-0.5 hover:text-primary"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Styles */}
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold">
              {currentLocale === 'zh' ? '核心工作流' : 'Core Workflows'}
            </h3>
            <nav className="flex flex-col gap-2">
              {styleLinks.map((link) => (
                <Link
                  key={link.id}
                  href={link.href}
                  className="text-sm text-muted-foreground transition-all hover:translate-x-0.5 hover:text-primary"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Legal */}
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold">{t('legal')}</h3>
            <nav className="flex flex-col gap-2">
              {legalLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-muted-foreground transition-all hover:translate-x-0.5 hover:text-primary"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {communityLinks.length > 0 ? (
            <div className="flex flex-col gap-3">
              <h3 className="text-sm font-semibold">
                {currentLocale === 'zh' ? '社区与外部入口' : 'Community'}
              </h3>
              <nav className="flex flex-col gap-2">
                {communityLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-muted-foreground transition-all hover:translate-x-0.5 hover:text-primary"
                  >
                    {link.label}
                  </a>
                ))}
              </nav>
            </div>
          ) : null}
        </div>

        {/* Bottom */}
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border/70 pt-8 md:flex-row">
          <p className="text-center text-sm text-muted-foreground md:text-left">
            © {new Date().getFullYear()} {t('brand')}. {t('rights')}
          </p>
          <p className="text-center text-sm text-muted-foreground md:text-right">
            {t('built_by')}
          </p>
        </div>
        </div>
      </div>
    </footer>
  );
}
