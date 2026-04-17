import "./globals.css";
import { ClarityAnalytics } from "@/components/clarity-analytics";
import { getLocale } from "next-intl/server";

function toHtmlLang(locale: string) {
  if (locale === "zh") {
    return "zh-CN";
  }

  return "en-US";
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();

  return (
    <html lang={toHtmlLang(locale)} suppressHydrationWarning>
      <head>
        <ClarityAnalytics />
      </head>
      <body className="bg-background text-foreground antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
