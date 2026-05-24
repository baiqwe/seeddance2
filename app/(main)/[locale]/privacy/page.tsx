import Link from "next/link";
import type { Metadata } from "next";
import { site } from "@/config/site";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Shield, AlertTriangle, Database, Share2 } from "lucide-react";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { buildLocaleAlternates } from "@/utils/seo/metadata";

export async function generateMetadata(props: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const params = await props.params;
  const { locale } = params;
  const isZh = locale === "zh";

  const title = isZh ? `隐私政策 | ${site.siteName}` : `Privacy Policy | ${site.siteName}`;
  const description = isZh
    ? "了解 Seedance 2 如何处理参考图片、视频、音频、生成结果、账号数据、支付信息和分析数据。"
    : "Learn how Seedance 2 handles reference images, videos, audio uploads, generated outputs, account data, billing data, and analytics.";

  const ogImage = new URL(site.ogImagePath, site.siteUrl).toString();

  return {
    title: { absolute: title },
    description,
    robots: {
      index: false,
      follow: true,
    },
    alternates: buildLocaleAlternates(`/${locale}/privacy`),
    openGraph: {
      title,
      description,
      type: "website",
      url: new URL(`/${locale}/privacy`, site.siteUrl).toString(),
      siteName: site.siteName,
      images: [{ url: ogImage, width: 512, height: 512, alt: site.siteName }],
    },
    twitter: { card: "summary_large_image", title, description, images: [ogImage] },
  };
}

export default async function PrivacyPage(props: { params: Promise<{ locale: string }> }) {
  const params = await props.params;
  const { locale } = params;
  const isZh = locale === "zh";
  const localePrefix = `/${locale}`;

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container px-4 md:px-6 py-4">
          <Button asChild variant="ghost" size="sm" className="gap-2">
            <Link href={localePrefix}>
              <ArrowLeft className="h-4 w-4" />
              {isZh ? "返回首页" : "Back to Home"}
            </Link>
          </Button>
        </div>
      </div>

      <div className="container px-4 md:px-6 py-16">
        <div className="max-w-4xl mx-auto space-y-8">
          <Breadcrumbs
            items={[
              { name: isZh ? "首页" : "Home", href: localePrefix },
              { name: isZh ? "隐私政策" : "Privacy Policy", href: `${localePrefix}/privacy` },
            ]}
          />
          <div className="text-center space-y-3">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">{isZh ? "隐私政策" : "Privacy Policy"}</h1>
            <p className="text-muted-foreground">
              {isZh
                ? `${site.siteName} 致力于只收集运行服务所需的最少信息，并尽可能清晰地说明图片、账号与支付数据的处理方式。`
                : `${site.siteName} aims to collect only the minimum information needed to run the service and to explain clearly how uploads, account data, and billing data are handled.`}
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Share2 className="w-5 h-5 text-primary" />
                {isZh ? "图片处理与第三方服务" : "Uploads & Third-Party AI Services"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground leading-relaxed">
              <p>
                {isZh
                  ? "为了完成多模态 AI 视频生成，你上传的参考图片、视频、音频和文本指令可能会被发送到选定的第三方模型或基础设施服务进行处理。"
                  : "To power multi-modal AI video generation, your reference images, videos, audio files, and text instructions may be sent to selected third-party model or infrastructure providers for processing."}
              </p>
              <p>
                {isZh
                  ? "这些服务可能会出于任务执行、反滥用、安全审计、错误排查和服务质量优化的目的处理相关数据。"
                  : "Those providers may process data for task execution, abuse prevention, security review, troubleshooting, and service quality improvements."}
              </p>
              <p>
                {isZh
                  ? "我们会尽量只向这些服务提供完成当前任务所需的最少信息，不会主动把你的参考素材或生成结果用于与本服务无关的公开展示。"
                  : "We aim to send only the minimum information needed for the active job and do not intentionally use your references or outputs for unrelated public display."}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5 text-primary" />
                {isZh ? "我们会保存什么" : "What We Store"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground leading-relaxed">
              <p>
                {isZh
                  ? "我们可能会保存与你的账号相关的基础信息，例如用户 ID、邮箱、订阅或积分状态，以及生成任务记录。"
                  : "We may store basic account identifiers such as user ID, email, subscription or credit status, and job records."}
              </p>
              <p>
                {isZh
                  ? "任务记录通常包括提示词、输入素材引用、分辨率、时长、生成状态、错误日志和结果地址。"
                  : "Job records may include prompt text, references to input assets, resolution, duration, generation status, error logs, and output URLs."}
              </p>
              <p>
                {isZh
                  ? "默认情况下，我们只保留运行服务所需的最少信息，并会根据安全、计费、故障排查和法务义务设置有限保留周期。"
                  : "By default, we keep the minimum information needed to operate the service, with limited retention windows based on security, billing, troubleshooting, and legal obligations."}
              </p>
              <p>
                {isZh
                  ? "这通常包括账号标识、积分与支付状态、生成任务参数、失败日志、分析事件以及必要的反滥用记录。"
                  : "This may include account identifiers, credit and billing status, generation parameters, failure logs, analytics events, and necessary anti-abuse records."}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                {isZh ? "安全与删除" : "Security & Deletion"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground leading-relaxed">
              <p>
                {isZh
                  ? "我们采取合理的技术措施保护数据安全，但无法保证互联网传输与第三方服务绝对安全。"
                  : "We take reasonable measures to protect data, but cannot guarantee absolute security over the internet or third-party services."}
              </p>
              <p>
                {isZh
                  ? "如需访问、纠正、删除账号或数据，或希望了解特定素材的保留方式，请通过站内联系方式联系我们。"
                  : "To request access, correction, or deletion of your account or data, or to ask about retention for specific assets, contact us through the support address below."}
              </p>
              <p>
                {isZh
                  ? `联系邮箱：${site.supportEmail}`
                  : `Support email: ${site.supportEmail}`}
              </p>
              <p>
                {isZh
                  ? "如果你使用支付、登录、上传、生成或分析相关功能，即表示你理解相应数据会在这些业务流程中被处理。"
                  : "If you use billing, authentication, uploads, generation, or analytics features, you understand that related data may be processed in those workflows."}
              </p>
              <p>
                {isZh
                  ? "如果政策发生重大变化，我们会更新本页内容，并以站内公告、邮件或其他合理方式通知。"
                  : "If this policy changes materially, we will update this page and may notify you through the site, email, or another reasonable channel."}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Share2 className="w-5 h-5 text-primary" />
                {isZh ? "支付、统计与第三方工具" : "Billing, Analytics, and Third-Party Tools"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground leading-relaxed">
              <p>
                {isZh
                  ? "支付通常由第三方支付服务商处理。我们不会直接在本网站存储完整的银行卡信息。"
                  : "Payments are typically processed by third-party billing providers. We do not directly store full card details on this site."}
              </p>
              <p>
                {isZh
                  ? "为了理解站点访问、页面表现和用户路径，我们可能会使用分析工具，例如 Google Analytics 4。"
                  : "To understand traffic, page performance, and user journeys, we may use analytics tools such as Google Analytics 4."}
              </p>
              <p>
                {isZh
                  ? "如果你通过外部社区链接访问本站，例如 Reddit、LinkedIn 或其他社媒平台，对方平台也可能根据自己的政策收集点击与跳转数据。"
                  : "If you reach the site from external communities such as Reddit, LinkedIn, or other social platforms, those platforms may also collect click and referral data under their own policies."}
              </p>
            </CardContent>
          </Card>

          <div className="rounded-xl border border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-100 p-5 flex gap-3">
            <AlertTriangle className="w-5 h-5 mt-0.5" />
            <div className="text-sm leading-relaxed">
              {isZh
                ? "请不要上传包含敏感个人信息的图片。你对上传内容拥有权利并对其负责。"
                : "Please do not upload sensitive personal information. You must have rights to the content you upload and are responsible for it."}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
