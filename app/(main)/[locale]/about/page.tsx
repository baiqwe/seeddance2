import Link from "next/link";
import { Metadata } from "next";
import { site } from "@/config/site";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Sparkles, Shield, Zap } from "lucide-react";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { FAQSchema } from "@/components/breadcrumb-schema";
import { buildLocaleAlternates } from "@/utils/seo/metadata";

export async function generateMetadata(props: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const params = await props.params;
  const { locale } = params;
  const isZh = locale === "zh";

  const title = isZh ? `关于我们 | ${site.siteName}` : `About | ${site.siteName}`;
  const description = isZh
    ? "了解 Seedance 2 背后的产品定位、适用人群、工作流设计原则，以及我们如何把多模态 AI 视频生成做得更可控。"
    : "Learn what Seedance 2 is, who it serves, and how we approach controllable multi-modal AI video generation workflows.";

  const ogImage = new URL(site.ogImagePath, site.siteUrl).toString();

  return {
    title: { absolute: title },
    description,
    alternates: buildLocaleAlternates(`/${locale}/about`),
    openGraph: {
      title,
      description,
      type: "website",
      url: new URL(`/${locale}/about`, site.siteUrl).toString(),
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

export default async function AboutPage(props: { params: Promise<{ locale: string }> }) {
  const params = await props.params;
  const { locale } = params;
  const isZh = locale === "zh";
  const localePrefix = `/${locale}`;
  const teamFaqs = [
    {
      question: isZh ? "Seedance 2 团队最在意什么？" : "What does the Seedance 2 team care about most?",
      answer: isZh
        ? "我们最在意的是可控性、可复用性和可解释性。比起单次 demo 的惊艳感，我们更看重团队能不能稳定复用输入素材、镜头逻辑和节奏判断。"
        : "We care most about controllability, repeatability, and explainability. Instead of chasing one-off demo magic, we prioritize whether teams can reliably reuse references, camera logic, and pacing decisions.",
    },
    {
      question: isZh ? "为什么要做这么多信任和说明页面？" : "Why invest in so many trust and explanation pages?",
      answer: isZh
        ? "因为多模态 AI 视频并不是纯娱乐玩具。只要涉及真人、品牌、客户素材、广告投放或商用内容，团队就会关心数据流、权利边界、支持方式和产品责任。"
        : "Because multi-modal AI video is not just a toy. Once real people, brand assets, client material, ads, or commercial output enter the workflow, teams need clarity around data flow, rights, support, and product responsibility.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <FAQSchema items={teamFaqs} />
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
        <div className="max-w-4xl mx-auto space-y-10">
          <Breadcrumbs
            items={[
              { name: isZh ? "首页" : "Home", href: localePrefix },
              { name: isZh ? "关于我们" : "About", href: `${localePrefix}/about` },
            ]}
          />
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              {isZh ? `关于 ${site.siteName}` : `About ${site.siteName}`}
            </h1>
            <p className="text-lg text-muted-foreground">
              {isZh
                ? "Seedance 2 是一个面向多模态 AI 视频生成的产品站与工作台，核心目标不是“随便生成一条视频”，而是让参考图、参考视频、音频和文字指令能真正组织成一个更可控的生产流程。"
                : "Seedance 2 is a product site and workspace for multi-modal AI video generation. The goal is not to produce any clip at random, but to turn reference images, video clips, audio, and natural-language direction into a more controllable production workflow."}
            </p>
            <p className="text-sm text-muted-foreground">
              {isZh
                ? "我们把它设计成一个更接近视频工作站的系统，而不是一个只展示几句提示词、几个按钮和一张结果图的轻量玩具。"
                : "We are designing it to feel closer to a video workstation than to a lightweight toy that only exposes a prompt box, a few buttons, and a single result frame."}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Sparkles className="w-5 h-5 text-primary" />
                  {isZh ? "参考优先" : "Reference First"}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {isZh ? "让图像、视频、音频和文字共同决定结果，而不是把动作、镜头和连续性交给一句 prompt 的运气。" : "Let images, video, audio, and text guide the output together instead of leaving motion, framing, and continuity to prompt luck alone."}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Zap className="w-5 h-5 text-primary" />
                  {isZh ? "任务流优先" : "Workflow First"}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {isZh ? "从想法、参考素材、积分预估到视频生成与延展，整个流程都围绕持续创作来组织。" : "From idea, references, and credit estimates to video creation and extension, the whole flow is organized around repeatable production."}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Shield className="w-5 h-5 text-primary" />
                  {isZh ? "透明说明" : "Transparent Policy"}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {isZh
                  ? "上传、支付、权限和素材处理都应该被清楚说明。我们会尽量把产品能力、限制、数据使用方式和支持入口写清楚，而不是让用户自己猜。"
                  : "Uploads, billing, permissions, and asset handling should be explained clearly. We aim to document capabilities, limits, data use, and support pathways instead of making users guess."}
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{isZh ? "这套产品适合谁" : "Who Seedance 2 Is For"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm leading-relaxed text-muted-foreground">
                <p>
                  {isZh
                    ? "Seedance 2 适合广告与营销团队、影视预演团队、短视频工作室、品牌内容团队，以及任何需要把参考素材系统化地转成视频结果的人。"
                    : "Seedance 2 is built for ad and marketing teams, previs artists, short-form studios, brand content groups, and anyone who needs to turn references into repeatable video output."}
                </p>
                <p>
                  {isZh
                    ? "如果你的工作依赖镜头参考、角色一致性、动作参考、产品展示或音视频同步，这类多模态工作流会比单一 prompt 模式更有效。"
                    : "If your work depends on shot references, character consistency, motion transfer, product presentation, or audio-aware timing, a multi-modal workflow is usually stronger than a single-prompt setup."}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{isZh ? "我们如何判断内容是否足够好" : "How We Think About Quality"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm leading-relaxed text-muted-foreground">
                <p>
                  {isZh
                    ? "我们更关注可控性、结果连续性、工作流清晰度和团队可复用性，而不只是单次 demo 的“惊艳一帧”。"
                    : "We care more about controllability, temporal continuity, workflow clarity, and reusability than about a single impressive frame from a demo."}
                </p>
                <p>
                  {isZh
                    ? "这也是为什么首页会同时强调 use cases、信任页面、支付说明、FAQ 和公开视频样例，而不是只堆一堆视觉特效。"
                    : "That is also why the site emphasizes use cases, trust pages, billing context, FAQs, and public examples instead of relying only on visual flair."}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{isZh ? "我们如何做内容与方法说明" : "How we explain the product and its methods"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm leading-relaxed text-muted-foreground">
                <p>
                  {isZh
                    ? "我们尽量把首页、场景页、公开视频页、价格页、帮助页和法务页连成一个完整的信息结构，而不是把所有问题都压到一个“试试这个 AI 很酷”的首页里。"
                    : "We try to connect the homepage, scenario pages, public video pages, pricing, help content, and legal pages into one coherent information structure instead of pushing every question into one flashy homepage."}
                </p>
                <p>
                  {isZh
                    ? "这样第一次接触 Seedance 2 的用户才会知道：这是谁做的、为什么这样设计、以及在什么场景下它值得被信任。"
                    : "That gives first-time visitors enough context to understand who built Seedance 2, why it is designed this way, and in which situations it is worth trusting."}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{isZh ? "我们如何看待风险与边界" : "How we think about boundaries and risk"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm leading-relaxed text-muted-foreground">
                <p>
                  {isZh
                    ? "如果工作流涉及真人、品牌、客户资产或商业素材，我们认为产品有责任把上传、权限、支持和商用边界讲清楚，而不是把这些问题都留给用户自己承担。"
                    : "If the workflow involves real people, brand assets, client materials, or commercial media, we believe the product should explain uploads, permissions, support, and usage boundaries instead of pushing all of that ambiguity onto users."}
                </p>
                <p>
                  {isZh
                    ? "因此 Seedance 2 的长期方向不只是“更会生成”，也包括更清晰的文档、更明确的政策和更稳的生产体验。"
                    : "That is why the long-term direction is not only better generation quality, but also clearer documentation, more explicit policy language, and a steadier production experience."}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="rounded-3xl border border-border/70 bg-card/60 p-6 md:p-8">
            <div className="text-sm font-medium text-primary">
              {isZh ? "团队方法论" : "Team methodology"}
            </div>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight">
              {isZh ? "我们宁可把工作流讲清楚，也不想只靠一句宣传语赢得点击。" : "We would rather explain the workflow clearly than win the click with a slogan alone."}
            </h2>
            <div className="mt-4 space-y-4 text-sm leading-8 text-muted-foreground">
              <p>
                {isZh
                  ? "如果一个 AI 视频产品只展示几段很酷的 demo，却没有说明输入边界、适用团队、版权风险、支付逻辑、公开页面和帮助入口，它在真实团队里通常很难长期被采用。"
                  : "If an AI video product only shows impressive demo clips but fails to explain input boundaries, target teams, rights considerations, billing logic, public pages, and help pathways, it usually struggles to earn long-term adoption inside real teams."}
              </p>
              <p>
                {isZh
                  ? `这也是为什么 ${site.siteName} 会把首页、创作中心、价格、关于我们、隐私、条款、联系页和帮助中心一起建设。对用户来说，这能明显降低试错成本。`
                  : `That is why ${site.siteName} is built as a connected system of homepage, creation center, pricing, about, privacy, terms, contact, and help content. For real users, that lowers the cost of trial and error.`}
              </p>
            </div>
          </div>

          <div className="text-center">
            <p className="mb-4 text-sm text-muted-foreground">
              {isZh
                ? `商务、版权或支持问题可联系：${site.supportEmail}`
                : `For support, rights, or business inquiries, contact: ${site.supportEmail}`}
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button asChild size="lg">
                <Link href={`${localePrefix}`}>{isZh ? "返回首页" : "Back to Homepage"}</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href={`${localePrefix}/creative-center`}>{isZh ? "进入创作中心" : "Open Creation Center"}</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
