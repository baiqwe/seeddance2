"use client";

import { signOutAction } from "@/app/actions";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Logo } from "./logo";
import { usePathname } from "next/navigation";
import { MobileNav } from "./mobile-nav";
import { useTranslations } from "next-intl";
import { useUser } from "@/hooks/use-user";
import { getLocaleFromPathname, Link, stripLocalePrefix } from "@/i18n/routing";
import { Skeleton } from "./ui/skeleton";
import { ChevronDown } from "lucide-react";

interface NavItem {
  id: string;
  label: string;
  href: string;
}

export default function Header() {
  const pathname = usePathname();
  const t = useTranslations('nav');
  const isDashboard = /^\/(?:en|zh)?\/?dashboard(?:\/|$)/.test(pathname || "");
  const { user, loading } = useUser();
  const currentLocale = getLocaleFromPathname(pathname);
  const pathWithoutLocale = stripLocalePrefix(pathname);

  // Main navigation items
  const mainNavItems: NavItem[] = [
    { id: "creative-center", label: currentLocale === "zh" ? "创作中心" : "Creation Center", href: '/creative-center' },
    { id: "guide", label: currentLocale === "zh" ? "指南" : "Guides", href: '/guides' },
    { id: "about", label: currentLocale === "zh" ? "关于" : "About", href: '/about' },
    { id: "pricing", label: t('pricing'), href: '/pricing' },
  ];
  const workflowNavItems: NavItem[] = [
    { id: "image-to-video", label: currentLocale === "zh" ? "图生视频" : "Image to Video", href: "/image-to-video" },
    { id: "reference-video", label: currentLocale === "zh" ? "参考视频" : "Reference Video", href: "/ai-video-generator-with-reference-video" },
    { id: "audio-sync", label: currentLocale === "zh" ? "音频同步" : "Audio Sync", href: "/ai-video-generator-with-audio-sync" },
    { id: "motion-control", label: currentLocale === "zh" ? "运动控制" : "Motion Control", href: "/motion-control-ai-video-generator" },
    { id: "character", label: currentLocale === "zh" ? "角色一致性" : "Consistent Character", href: "/consistent-character-ai-video-generator" },
    { id: "fast", label: currentLocale === "zh" ? "Seedance 2 Fast" : "Seedance 2 Fast", href: "/seedance-2-fast" },
  ];

  // Dashboard items
  const dashboardItems: NavItem[] = [];
  const navItems = isDashboard ? dashboardItems : mainNavItems;
  const mobileNavItems = isDashboard
    ? navItems
    : [
        ...mainNavItems,
        ...workflowNavItems.map((item) => ({
          ...item,
          label: `${currentLocale === "zh" ? "工作流 · " : "Workflow · "}${item.label}`,
        })),
      ];

  return (
    <header className="sticky top-0 z-[100] w-full border-b border-white/6 bg-black/70 backdrop-blur-xl supports-[backdrop-filter]:bg-black/55">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center">
          <Logo />
        </div>

        {/* Centered Navigation */}
        <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-5 md:flex">
          {!isDashboard ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="inline-flex items-center gap-1 text-sm font-medium text-white/66 transition-colors hover:text-white">
                {currentLocale === "zh" ? "工作流" : "Workflows"}
                <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-64 border-white/10 bg-[#0b1020]/95 text-white shadow-2xl shadow-black/50 backdrop-blur-xl">
                <DropdownMenuLabel className="text-xs font-medium uppercase tracking-[0.2em] text-white/46">
                  {currentLocale === "zh" ? "核心内页" : "Core pages"}
                </DropdownMenuLabel>
                {workflowNavItems.map((item) => (
                  <DropdownMenuItem key={item.id} asChild className="cursor-pointer text-white/72 focus:bg-white/[0.06] focus:text-white">
                    <Link href={item.href}>{item.label}</Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}
          {navItems.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className="text-sm font-medium text-white/66 transition-colors hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {/* Pass locale-free href to the locale-aware Link component. */}
          <div className="mr-2 hidden items-center gap-1 rounded-full border border-white/8 bg-white/[0.03] p-1 md:flex">
            <Link
              href={pathWithoutLocale}
              locale="en"
              className={`rounded-full px-3 py-1.5 text-sm transition-colors ${currentLocale === 'en'
                ? 'bg-white text-black shadow-sm'
                : 'text-white/50 hover:bg-white/[0.06] hover:text-white'
                }`}
            >
              EN
            </Link>
            <Link
              href={pathWithoutLocale}
              locale="zh"
              className={`rounded-full px-3 py-1.5 text-sm transition-colors ${currentLocale === 'zh'
                ? 'bg-white text-black shadow-sm'
                : 'text-white/50 hover:bg-white/[0.06] hover:text-white'
                }`}
            >
              中文
            </Link>
          </div>

          {loading ? (
            <div className="hidden md:flex gap-2">
              <Skeleton className="h-9 w-20" />
              <Skeleton className="h-9 w-24" />
            </div>
          ) : user ? (
            <div className="hidden md:flex items-center gap-2">
              <Button asChild size="sm" variant="ghost">
                <Link href="/dashboard">
                  {currentLocale === 'zh' ? '控制台' : 'Dashboard'}
                </Link>
              </Button>
              <form action={signOutAction}>
                <Button type="submit" variant="outline" size="sm">
                  {t('sign_out')}
                </Button>
              </form>
            </div>
          ) : (
            <div className="hidden md:flex gap-2">
              <Button asChild size="sm" variant="outline" className="rounded-lg border-white/10 bg-transparent text-white hover:bg-white/[0.04]">
                <Link href="/sign-in">{t('sign_in')}</Link>
              </Button>
              <Button asChild size="sm" className="rounded-lg bg-[#2563ff] text-white hover:bg-[#3b72ff]">
                <Link href="/sign-up">{t('sign_up')}</Link>
              </Button>
            </div>
          )}
          <MobileNav items={mobileNavItems} user={user} loading={loading} isDashboard={isDashboard} currentLocale={currentLocale} />
        </div>
      </div>
    </header>
  );
}
