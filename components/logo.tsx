"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { site } from "@/config/site";

export function Logo() {
  const pathname = usePathname();
  const currentLocale = pathname?.split('/')[1] || 'en';
  const localePrefix = `/${currentLocale}`;

  return (
    <Link
      href={localePrefix}
      className="flex items-center gap-2 hover:opacity-90 transition-opacity"
    >
      <Image
        src="/favicon.svg"
        alt={`${site.siteName} Logo`}
        width={32}
        height={32}
        className="rounded-lg"
      />
      <span className="font-bold text-lg bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
        {site.siteName}
      </span>
    </Link>
  );
}
