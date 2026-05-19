import Link from "next/link";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { site } from "@/config/site";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Mail, MessageCircleHeart } from "lucide-react";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { buildLocaleAlternates } from "@/utils/seo/metadata";

export async function generateMetadata(props: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const params = await props.params;
  const { locale } = params;
  const t = await getTranslations({ locale, namespace: "Contact" });
  const title = t("meta_title");
  const description = t("meta_desc");
  const ogImage = new URL(site.ogImagePath, site.siteUrl).toString();

  return {
    title,
    description,
    alternates: buildLocaleAlternates(`/${locale}/contact`),
    openGraph: {
      title,
      description,
      type: "website",
      url: new URL(`/${locale}/contact`, site.siteUrl).toString(),
      siteName: site.siteName,
      images: [{ url: ogImage, width: 512, height: 512, alt: site.siteName }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function ContactPage(props: { params: Promise<{ locale: string }> }) {
  const params = await props.params;
  const { locale } = params;
  const localePrefix = `/${locale}`;
  const t = await getTranslations({ locale, namespace: "Contact" });

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container px-4 py-4 md:px-6">
          <Button asChild variant="ghost" size="sm" className="gap-2">
            <Link href={localePrefix}>
              <ArrowLeft className="h-4 w-4" />
              {t("home")}
            </Link>
          </Button>
        </div>
      </div>

      <div className="container px-4 py-16 md:px-6">
        <div className="mx-auto max-w-4xl space-y-8">
          <Breadcrumbs
            items={[
              { name: t("home"), href: localePrefix },
              { name: t("title"), href: `${localePrefix}/contact` },
            ]}
          />

          <div className="space-y-3 text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">{t("title")}</h1>
            <p className="mx-auto max-w-3xl text-muted-foreground">{t("p1")}</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" />
                {t("support_title")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm leading-relaxed text-muted-foreground">
              <p>{t("support_desc")}</p>
              <a href={`mailto:${site.supportEmail}`} className="text-lg font-semibold text-primary hover:underline">
                {site.supportEmail}
              </a>
              <p>{t("p2")}</p>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>{locale === "zh" ? "适合通过邮件处理的问题" : "Best Topics for Email Support"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm leading-relaxed text-muted-foreground">
                <p>
                  {locale === "zh"
                    ? "包括支付失败、退款说明、账号访问、生成失败、隐私请求、删除请求、积分异常、版权或商用说明。"
                    : "This includes failed payments, refund requests, account access, generation failures, privacy requests, deletion requests, credit issues, and rights or commercial-use questions."}
                </p>
                <p>
                  {locale === "zh"
                    ? "如果你在邮件中附上注册邮箱、订单编号、任务 ID 或出错时间，我们通常能更快定位问题。"
                    : "If you include your account email, order number, job ID, or timestamp, we can usually diagnose the issue faster."}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{locale === "zh" ? "商务与合作" : "Business and Partnerships"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm leading-relaxed text-muted-foreground">
                <p>
                  {locale === "zh"
                    ? "如果你希望讨论团队采购、渠道合作、视频工作流定制、品牌内容生产或媒体合作，也可以通过同一邮箱联系。"
                    : "If you want to discuss team purchasing, partnerships, custom video workflows, branded production, or media inquiries, you can use the same contact address."}
                </p>
                <p>
                  {locale === "zh"
                    ? "我们会优先根据主题把邮件分发到支持、商务或合规相关流程。"
                    : "We route messages into support, business, or compliance flows based on the topic of your request."}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="rounded-[28px] border border-border/70 bg-card/90 p-6 shadow-[0_16px_40px_-24px_rgba(15,23,42,0.18)]">
            <div className="flex items-start gap-3">
              <MessageCircleHeart className="mt-0.5 h-5 w-5 text-primary" />
              <p className="text-sm leading-relaxed text-muted-foreground">{t("p3")}</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Link href={`${localePrefix}/guides`} className="rounded-2xl border border-border/70 bg-card/80 px-5 py-5 text-sm text-muted-foreground transition-colors hover:bg-card">
              {locale === "zh" ? "先看使用指南，很多“报错”其实是素材准备或工作流问题。" : "Read the guides first—many apparent errors are really asset prep or workflow issues."}
            </Link>
            <Link href={`${localePrefix}/creative-center`} className="rounded-2xl border border-border/70 bg-card/80 px-5 py-5 text-sm text-muted-foreground transition-colors hover:bg-card">
              {locale === "zh" ? "如果你已经知道要生成什么，直接去创作中心继续。" : "If you already know the task, jump back into the creation center."}
            </Link>
            <Link href={`${localePrefix}/pricing`} className="rounded-2xl border border-border/70 bg-card/80 px-5 py-5 text-sm text-muted-foreground transition-colors hover:bg-card">
              {locale === "zh" ? "支付、订阅和积分相关问题，建议一并附上订单号和账号邮箱。" : "For billing, subscriptions, and credits, include the order ID and account email in the same message."}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
