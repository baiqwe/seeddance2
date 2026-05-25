"use client";

import { signOutAction } from "@/app/actions";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
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
import { ArrowUpRight, ChevronDown } from "lucide-react";
import { getLocalizedWorkflowGroups } from "@/config/workflow-navigation";

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
    ...getLocalizedWorkflowGroups(currentLocale).flatMap((group) =>
      group.items.map((item) => ({
        id: item.id,
        label: item.labelText,
        href: item.href,
      })),
    ),
  ];
  const workflowGroups = getLocalizedWorkflowGroups(currentLocale);

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
    <header className="sticky top-0 z-[200] w-full border-b border-white/6 bg-black/70 backdrop-blur-xl supports-[backdrop-filter]:bg-black/55">
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
              <DropdownMenuContent
                align="center"
                sideOffset={18}
                collisionPadding={16}
                className="z-[260] max-h-[min(72vh,620px)] w-[min(760px,calc(100vw-2rem))] overflow-y-auto rounded-[28px] border-white/10 bg-[#0b1020]/98 p-3 text-white shadow-[0_32px_90px_-38px_rgba(0,0,0,0.9)] backdrop-blur-xl"
              >
                <DropdownMenuLabel className="px-3 pb-2 pt-1 text-xs font-medium uppercase tracking-[0.28em] text-white/42">
                  {currentLocale === "zh" ? "工作流地图" : "Workflow map"}
                </DropdownMenuLabel>
                <div className="grid gap-2 md:grid-cols-3">
                  {workflowGroups.map((group) => (
                    <div
                      key={group.id}
                      className="rounded-[22px] border border-white/8 bg-white/[0.025] p-3"
                    >
                      <div className="px-2">
                        <div className="text-[11px] font-medium uppercase tracking-[0.22em] text-cyan-200/62">
                          {group.eyebrowLabel}
                        </div>
                        <div className="mt-2 text-sm font-semibold text-white">
                          {group.titleLabel}
                        </div>
                        <p className="mt-1 text-xs leading-5 text-white/50">
                          {group.descriptionLabel}
                        </p>
                      </div>
                      <div className="mt-3 space-y-1">
                        {group.items.map((item) => (
                          <Link
                            key={item.id}
                            href={item.href}
                            className="group flex gap-3 rounded-2xl px-2 py-2.5 text-left transition-colors hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/45"
                          >
                            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-white/28 transition-colors group-hover:bg-cyan-200" />
                            <span className="min-w-0">
                              <span className="flex items-center gap-1.5 text-sm font-medium text-white/80 group-hover:text-white">
                                {item.labelText}
                                <ArrowUpRight className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-70" />
                              </span>
                              <span className="mt-1 block text-xs leading-5 text-white/48">
                                {item.descriptionText}
                              </span>
                            </span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
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
