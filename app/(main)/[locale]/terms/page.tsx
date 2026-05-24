import Link from "next/link";
import type { Metadata } from "next";
import { site } from "@/config/site";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Scale, AlertTriangle, CreditCard, Image as ImageIcon } from "lucide-react";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { buildLocaleAlternates } from "@/utils/seo/metadata";

export async function generateMetadata(props: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const params = await props.params;
  const { locale } = params;
  const isZh = locale === "zh";

  const title = isZh ? `服务条款 | ${site.siteName}` : `Terms of Service | ${site.siteName}`;
  const description = isZh
    ? "使用 Seedance 2 前请阅读条款，包括账号、上传内容、AI 视频结果、积分计费、订阅与禁止用途。"
    : "Read the terms before using Seedance 2, including accounts, uploads, AI video outputs, credits billing, subscriptions, and prohibited use.";

  const ogImage = new URL(site.ogImagePath, site.siteUrl).toString();

  return {
    title: { absolute: title },
    description,
    robots: {
      index: false,
      follow: true,
    },
    alternates: buildLocaleAlternates(`/${locale}/terms`),
    openGraph: {
      title,
      description,
      type: "website",
      url: new URL(`/${locale}/terms`, site.siteUrl).toString(),
      siteName: site.siteName,
      images: [{ url: ogImage, width: 512, height: 512, alt: site.siteName }],
    },
    twitter: { card: "summary_large_image", title, description, images: [ogImage] },
  };
}

export default async function TermsPage(props: { params: Promise<{ locale: string }> }) {
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
              { name: isZh ? "服务条款" : "Terms of Service", href: `${localePrefix}/terms` },
            ]}
          />
          <div className="text-center space-y-3">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">{isZh ? "服务条款" : "Terms of Service"}</h1>
            <p className="text-muted-foreground">
              {isZh
                ? `使用 ${site.siteName} 前，请先阅读以下规则。访问或使用本服务，即表示你同意按这些条款使用本网站。`
                : `Please read these terms before using ${site.siteName}. By accessing or using the service, you agree to use the site under these terms.`}
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-primary" />
                {isZh ? "你上传的内容" : "Your Uploads"}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground leading-relaxed space-y-3">
              <p>
                {isZh
                  ? "你必须拥有上传图片、视频、音频和其他参考素材的合法权利，并确保内容不侵犯他人权利。"
                  : "You must have the legal right to upload images, videos, audio files, and other references, and those materials must not infringe the rights of others."}
              </p>
              <p>
                {isZh
                  ? "禁止上传违法、侵权、包含敏感个人信息、未经授权的肖像、或任何你无权处理的内容。"
                  : "Do not upload illegal, infringing, sensitive personal information, unauthorized likenesses, or any content you do not have permission to process."}
              </p>
              <p>
                {isZh
                  ? "如果你代表客户、品牌或团队使用本服务，你应确保自己有足够授权。"
                  : "If you use the service on behalf of a client, brand, or team, you are responsible for having sufficient permission to do so."}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-primary" />
                {isZh ? "生成内容" : "Generated Content"}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground leading-relaxed space-y-3">
              <p>
                {isZh
                  ? "Seedance 2 输出的是 AI 自动生成的视频或相关媒体结果，可能不准确、不连续、不可商用，或者不符合你的预期。"
                  : "Seedance 2 produces AI-generated video or related media outputs that may be inaccurate, inconsistent, unsuitable for commercial use, or otherwise different from your expectations."}
              </p>
              <p>
                {isZh
                  ? "我们不保证生成结果一定可用于商业用途、品牌投放、人物代言、政治传播或其他高风险场景；你应自行核实权利、事实、许可和合规要求。"
                  : "We do not guarantee that outputs are fit for commercial use, advertising, likeness-driven endorsements, political messaging, or any other high-risk setting. You are responsible for rights, facts, permissions, and compliance."}
              </p>
              <p>
                {isZh
                  ? "你应对自己下载、发布、再编辑或商用生成内容的方式负责。"
                  : "You are responsible for how you download, publish, edit, or commercially use generated outputs."}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" />
                {isZh ? "积分与付费" : "Credits & Payments"}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground leading-relaxed space-y-3">
              <p>
                {isZh
                  ? "生成视频会消耗积分。消耗额度可能与分辨率、时长、输入模态和排队优先级有关。免费额度、买断包和订阅价格都可能调整。"
                  : "Video generation consumes credits. Usage may vary by resolution, duration, input modalities, and queue priority. Free allowances, one-time packs, and subscription pricing may all change over time."}
              </p>
              <p>
                {isZh
                  ? "付款、续费和退款流程可能由第三方支付服务商处理。若发生支付问题，请优先联系支付服务商或我们的支持渠道。"
                  : "Payments, renewals, and refund flows may be handled by third-party billing providers. Contact them or our support channel if a billing issue occurs."}
              </p>
              <p>
                {isZh
                  ? `如需取消订阅、申请账单协助或了解退款政策，请联系 ${site.supportEmail}。`
                  : `For subscription cancellation, billing help, or refund questions, contact ${site.supportEmail}.`}
              </p>
              <p>
                {isZh
                  ? "除非付款页面、活动规则或书面支持说明另有规定，已消耗的积分通常不支持退回。"
                  : "Unless otherwise stated on the checkout page, in a promotion, or in written support, consumed credits are generally non-refundable."}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-primary" />
                {isZh ? "账号、限制与暂停" : "Accounts, Limits, and Suspension"}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground leading-relaxed space-y-3">
              <p>
                {isZh
                  ? "你应妥善保管账号登录信息，并对账号下发生的上传、生成、购买和其他活动负责。"
                  : "You are responsible for safeguarding your account credentials and for activity carried out through your account, including uploads, generations, and purchases."}
              </p>
              <p>
                {isZh
                  ? "如果我们合理判断某个账号存在滥用、刷量、侵权、欺诈、支付风险或安全风险，我们可以限制、暂停或终止相关服务。"
                  : "If we reasonably believe an account is involved in abuse, credit manipulation, infringement, fraud, payment risk, or security risk, we may limit, suspend, or terminate related access."}
              </p>
              <p>
                {isZh
                  ? "你不得试图绕过额度限制、并发限制、上传限制、访问控制或其他技术保护措施。"
                  : "You may not attempt to bypass credit limits, concurrency limits, upload restrictions, access controls, or other technical safeguards."}
              </p>
            </CardContent>
          </Card>

          <div className="rounded-xl border border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-100 p-5 flex gap-3">
            <AlertTriangle className="w-5 h-5 mt-0.5" />
            <div className="text-sm leading-relaxed">
              {isZh
                ? "本服务按“现状”提供。我们可能随时更新或停止某些功能。"
                : "The service is provided “as is”. We may update or discontinue features at any time."}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
