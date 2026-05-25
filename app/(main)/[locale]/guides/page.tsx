import Link from "next/link";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { BookOpenText, Clapperboard, ShieldCheck, Sparkles, Waypoints } from "lucide-react";
import { site } from "@/config/site";
import { buildLocaleAlternates } from "@/utils/seo/metadata";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { FAQSchema } from "@/components/breadcrumb-schema";
import { PromptTemplateLibrary } from "@/components/guides/PromptTemplateLibrary";

export async function generateMetadata(props: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const params = await props.params;
  const { locale } = params;
  const isZh = locale === "zh";
  const title = isZh
    ? `Seedance 2 Prompt 模板与使用指南 | ${site.siteName}`
    : `Seedance 2 Prompt Guide and Templates | ${site.siteName}`;
  const description = isZh
    ? "浏览 Seedance 2 Prompt 模板库和使用指南，复制图生视频、参考视频、音频同步、角色一致性和视频延展的可复用提示词。"
    : "Browse Seedance 2 prompt templates and workflow guides for image to video, reference video, audio sync, character consistency, and video extension.";

  return {
    title: { absolute: title },
    description,
    alternates: buildLocaleAlternates(`/${locale}/guides`),
    openGraph: {
      title,
      description,
      type: "website",
      url: new URL(`/${locale}/guides`, site.siteUrl).toString(),
      siteName: site.siteName,
      images: [{ url: new URL(site.ogImagePath, site.siteUrl).toString(), width: 512, height: 512, alt: site.siteName }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [new URL(site.ogImagePath, site.siteUrl).toString()],
    },
  };
}

export default async function GuidesPage(props: { params: Promise<{ locale: string }> }) {
  const params = await props.params;
  const { locale } = params;
  const isZh = locale === "zh";
  const localePrefix = `/${locale}`;
  const guideModules = [
    {
      title: isZh ? "如何写更像镜头语言的 Prompt" : "How to write prompts that behave like shot direction",
      description: isZh
        ? "先写主体、镜头运动、节奏和氛围，再决定是否要补视觉参考，而不是一开始就堆很多修饰词。"
        : "Start with subject, camera movement, pacing, and atmosphere first, then decide whether visual references are needed instead of stacking vague adjectives.",
      href: `${localePrefix}/creative-center?mode=text-to-video&model=bytedance/seedance-2`,
    },
    {
      title: isZh ? "如何准备图像关键帧" : "How to prepare image keyframes",
      description: isZh
        ? "图生视频最关键的是起始关键帧是否干净、主体是否明确，以及尾帧目标是否真的有必要。"
        : "The key to image-to-video is whether the starting keyframe is clean, the subject is unambiguous, and the end-frame target is actually necessary.",
      href: `${localePrefix}/image-to-video`,
    },
    {
      title: isZh ? "如何使用动作与镜头参考" : "How to use motion and camera references",
      description: isZh
        ? "参考视频不是拿来堆数量的，而是拿来说明动作路径、镜头节奏和段落推进。"
        : "Reference clips are not useful because there are many of them, but because they clarify motion paths, camera rhythm, and sequence intent.",
      href: `${localePrefix}/reference-video-generator`,
    },
    {
      title: isZh ? "如何保持角色一致性" : "How to keep character identity consistent",
      description: isZh
        ? "优先锁定角色图、服装、轮廓和开场构图，再决定动作该怎么迁移，而不是反过来。"
        : "Lock the character still, wardrobe, silhouette, and opening composition first, then decide how motion should transfer instead of doing it in reverse.",
      href: `${localePrefix}/dance-motion-transfer`,
    },
    {
      title: isZh ? "什么时候该用 Seedance 2 Fast" : "When to use Seedance 2 Fast",
      description: isZh
        ? "Fast 更适合快速试方向、试节奏和试镜头，不是每一条视频都应该先跑高质量标准模型。"
        : "Fast is best for testing direction, pacing, and camera ideas quickly instead of sending every experiment straight to the higher-quality model.",
      href: `${localePrefix}/creative-center?model=bytedance/seedance-2-fast`,
    },
    {
      title: isZh ? "如何做平滑的视频延展" : "How to extend a shot smoothly",
      description: isZh
        ? "延展不是重新开始一个新镜头，而是尊重已有片段的动势、光线和空间关系，再往前续写。"
        : "Extension is not about inventing a new shot from zero. It works best when it respects the momentum, lighting, and spatial logic already present in the clip.",
      href: `${localePrefix}/video-extension`,
    },
  ];

  const faqs = [
    {
      question: isZh ? "首页和创作中心有什么区别？" : "What is the difference between the homepage and the creation center?",
      answer: isZh
        ? "首页更像一个快速入口：先把想法写出来。创作中心则保留完整多模态工作台，用于真正上传图片、视频、音频参考并配置更细的生成参数。"
        : "The homepage is a quick entry point for expressing the idea. The creation center keeps the full multi-modal workspace for real image, video, and audio references plus deeper controls.",
    },
    {
      question: isZh ? "什么样的素材最适合做参考？" : "What makes a good reference asset?",
      answer: isZh
        ? "清晰、单一目标、镜头语言明确的素材效果最好。图片更适合角色和构图，视频更适合动作和运镜，音频更适合节奏和氛围。"
        : "Clear, single-purpose references with legible framing work best. Images are strongest for subject and composition, videos for motion and camera language, and audio for rhythm and atmosphere.",
    },
    {
      question: isZh ? "怎么判断结果是不是可用？" : "How should teams evaluate whether an output is usable?",
      answer: isZh
        ? "不要只看第一眼是否惊艳，更要看角色一致性、动作是否断裂、镜头节奏是否稳定、产品信息是否清楚，以及后续是否能重复生成同类结果。"
        : "Do not judge only by first-frame wow factor. Review character consistency, motion breaks, pacing stability, product legibility, and whether the workflow can be repeated reliably.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <FAQSchema items={faqs} />

      <div className="container px-4 py-12 md:px-6 md:py-16">
        <div className="mx-auto max-w-6xl space-y-10">
          <Breadcrumbs
            items={[
              { name: isZh ? "首页" : "Home", href: `${localePrefix}` },
              { name: isZh ? "使用指南" : "Guides", href: `${localePrefix}/guides` },
            ]}
          />

          <section className="space-y-5 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/78">
              <BookOpenText className="h-4 w-4" />
              {isZh ? "Seedance 2 使用指南" : "Seedance 2 Guides"}
            </div>
            <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              {isZh
                ? "Seedance 2 Prompt 模板库：先复制，再进入工作流。"
                : "Seedance 2 Prompt Guide: copy templates, then enter the workflow."}
            </h1>
            <p className="mx-auto max-w-3xl text-base leading-8 text-white/66 sm:text-lg">
              {isZh
                ? "这里不是说明书堆叠，而是可复用的工作流武器库：复制 Prompt，替换变量，带入创作中心，再补图片、视频或音频参考。"
                : "This is not a pile of documentation. It is a reusable workflow library: copy a prompt, replace the variables, open the creation center, then add image, video, or audio references."}
            </p>
          </section>

          <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            <GuideCard
              icon={<Sparkles className="h-5 w-5 text-cyan-300" />}
              title={isZh ? "从一句话开始" : "Start from one sentence"}
              description={isZh ? "首页的简化生成器只负责快速进入，先把场景意图说清楚，再决定要不要补充参考素材。" : "The homepage generator is intentionally lightweight. Clarify the scene intent first, then decide whether references are needed."}
            />
            <GuideCard
              icon={<Waypoints className="h-5 w-5 text-violet-300" />}
              title={isZh ? "多模态不是堆素材" : "Multi-modal is not asset dumping"}
              description={isZh ? "图片、视频、音频要各自承担角色：角色、动作、节奏。把参考职责拆清楚，比一股脑全丢进去更有效。" : "Images, videos, and audio should each do a job: subject, motion, or rhythm. Split responsibilities instead of throwing everything in at once."}
            />
            <GuideCard
              icon={<Clapperboard className="h-5 w-5 text-amber-300" />}
              title={isZh ? "看连续性，不只看单帧" : "Review continuity, not just frames"}
              description={isZh ? "真正可用的视频要看镜头连接、动作完整性和时序稳定性，而不是只看截图好不好看。" : "Usable video depends on shot transitions, motion continuity, and timing stability, not just whether a screenshot looks impressive."}
            />
            <GuideCard
              icon={<ShieldCheck className="h-5 w-5 text-emerald-300" />}
              title={isZh ? "注意权限与边界" : "Respect rights and boundaries"}
              description={isZh ? "如果你在上传真人、产品或客户素材，要先确认权利归属、商用范围和数据处理方式。" : "If you upload human, product, or client material, confirm rights, commercial usage scope, and data handling expectations first."}
            />
          </section>

          <PromptTemplateLibrary locale={locale} />

          <section className="space-y-6">
            <div className="max-w-4xl">
              <div className="section-kicker">{isZh ? "Help Center Library" : "Help Center Library"}</div>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                {isZh ? "先选一个你最常遇到的问题，再进入对应工作流。" : "Start from the problem you hit most often, then move into the matching workflow."}
              </h2>
              <p className="mt-4 text-base leading-8 text-white/66 sm:text-lg">
                {isZh
                  ? "这一层的目标不是把所有文档写成长篇说明，而是把最容易踩坑的节点拆开，让团队知道下一步该看哪一页、该点哪个入口。"
                  : "The point of this layer is not to bury teams in long documentation, but to separate the highest-friction problems so people know which page to read and which entry point to use next."}
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {guideModules.map((module) => (
                <Link
                  key={module.title}
                  href={module.href}
                  className="surface-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/30"
                >
                  <div className="text-lg font-semibold text-white">{module.title}</div>
                  <p className="mt-3 text-sm leading-7 text-white/64">{module.description}</p>
                </Link>
              ))}
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="surface-panel px-6 py-7 md:px-8">
              <div className="section-kicker">{isZh ? "Workflow Principles" : "Workflow Principles"}</div>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white">
                {isZh ? "Seedance 2 最适合哪些工作方式" : "How Seedance 2 works best in practice"}
              </h2>
              <div className="mt-5 space-y-4 text-sm leading-8 text-white/66">
                <p>
                  {isZh
                    ? "如果你的团队已经在用参考图、镜头板、产品图、动作视频或音乐节奏做创意沟通，那么 Seedance 2 的价值就不只是“生成视频”，而是把这些分散的参考语言整理成一个可复用的工作流。"
                    : "If your team already relies on reference images, shot boards, product stills, motion clips, or music timing in production conversations, Seedance 2 is valuable not merely because it generates video, but because it turns those scattered reference languages into a reusable workflow."}
                </p>
                <p>
                  {isZh
                    ? "因此首页只保留简化生成器，负责品牌入口与快速试用；真正的深度生成、上传 staging 和参数控制应该进入创作中心完成。"
                    : "That is why the homepage now keeps only a simplified generator for brand entry and low-friction testing, while deeper generation, asset staging, and parameter control live in the creation center."}
                </p>
              </div>
            </div>

            <div className="surface-panel px-6 py-7 md:px-8">
              <div className="section-kicker">{isZh ? "Review Checklist" : "Review Checklist"}</div>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white">
                {isZh ? "团队评估结果时，至少看这 5 件事" : "Five things teams should review before approving an output"}
              </h2>
              <ul className="mt-5 space-y-3 text-sm leading-7 text-white/66">
                {[
                  isZh ? "角色和主体是否稳定，没有突然漂移或换脸感。" : "Subject and character stability without drift or identity breaks.",
                  isZh ? "动作和镜头有没有断裂，尤其是起承转合处。" : "Motion and camera flow without obvious breaks, especially at transitions.",
                  isZh ? "产品、服装、道具等关键信息是否始终清楚可辨。" : "Product, wardrobe, or prop details stay legible throughout the clip.",
                  isZh ? "节奏是否符合预期，而不是机械或失控地拉扯。" : "Pacing matches the intended rhythm instead of feeling mechanical or erratic.",
                  isZh ? "这套输入和提示能不能复用，还是只能碰运气出一次。" : "The workflow can be repeated reliably instead of producing a one-off lucky result.",
                ].map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary/80" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="surface-panel px-6 py-7 md:px-8">
              <div className="section-kicker">{isZh ? "Usage Boundaries" : "Usage Boundaries"}</div>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white">
                {isZh ? "哪些内容需要额外谨慎" : "Where teams should slow down and check carefully"}
              </h2>
              <div className="mt-5 space-y-4 text-sm leading-8 text-white/66">
                <p>
                  {isZh
                    ? "如果素材涉及真人肖像、客户产品、品牌元素、商业音乐或第三方受保护内容，就应该先确认许可范围，再决定是否上传和生成。"
                    : "If the workflow touches real faces, client products, brand assets, commercial music, or other protected material, teams should confirm permissions before uploading or generating anything."}
                </p>
                <p>
                  {isZh
                    ? "这也是为什么隐私政策、服务条款和关于我们页面值得在开始商用前先读一遍。"
                    : "That is also why Privacy, Terms, and About are worth reading before a team moves into serious commercial use."}
                </p>
              </div>
            </div>

            <div className="surface-panel px-6 py-7 md:px-8">
              <div className="section-kicker">{isZh ? "Next Steps" : "Next Steps"}</div>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white">
                {isZh ? "从这里进入正确的入口" : "Enter through the right door"}
              </h2>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href={`${localePrefix}/creative-center`}
                  className="rounded-lg bg-[#2563ff] px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-[#3b72ff]"
                >
                  {isZh ? "进入创作中心" : "Open Creation Center"}
                </Link>
                <Link
                  href={`${localePrefix}/about`}
                  className="rounded-lg border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-white/[0.08]"
                >
                  {isZh ? "了解团队与方法" : "Read About & Method"}
                </Link>
                <Link
                  href={`${localePrefix}/pricing`}
                  className="rounded-lg border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-white/[0.08]"
                >
                  {isZh ? "查看定价逻辑" : "See Pricing Logic"}
                </Link>
              </div>
            </div>
          </section>

          <section className="surface-panel px-6 py-7 md:px-8">
            <div className="section-kicker">{isZh ? "Help Center FAQ" : "Help Center FAQ"}</div>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white">
              {isZh ? "最常见的 3 个判断题" : "Three of the most common evaluation questions"}
            </h2>
            <div className="mt-6 grid gap-4">
              {faqs.map((faq) => (
                <div key={faq.question} className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-4">
                  <div className="text-sm font-semibold text-white">{faq.question}</div>
                  <p className="mt-2 text-sm leading-7 text-white/64">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-2">
            <div className="surface-panel px-6 py-7 md:px-8">
              <div className="section-kicker">{isZh ? "Model Choice" : "Model Choice"}</div>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white">
                {isZh ? "先选模型，再看素材怎么准备。" : "Choose the model first, then decide how deep the asset prep should go."}
              </h2>
              <div className="mt-5 space-y-4 text-sm leading-8 text-white/66">
                <p>
                  {isZh
                    ? "Seedance 2 更适合角色一致性、产品材质和多参考素材协同；Seedance 2 Fast 更适合先试方向、试镜头和试节奏。"
                    : "Seedance 2 is stronger for identity consistency, product detail, and multi-reference coordination, while Seedance 2 Fast is stronger for trying direction, shot language, and pacing quickly."}
                </p>
                <p>
                  {isZh
                    ? "如果团队还在找视觉方向，就先用 Fast 跑通概念；如果已经接近成片逻辑，再切回标准模型会更合理。"
                    : "If the team is still exploring visual direction, use Fast to validate the concept first. Once the shot logic is close, moving back to the standard model usually makes more sense."}
                </p>
              </div>
            </div>

            <div className="surface-panel px-6 py-7 md:px-8">
              <div className="section-kicker">{isZh ? "Where To Go Next" : "Where To Go Next"}</div>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white">
                {isZh ? "Help Center 看完以后，最好回到这两个入口。" : "After the help center, most teams should go back to these two entry points."}
              </h2>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link href={`${localePrefix}/creative-center`} className="rounded-lg bg-[#2563ff] px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-[#3b72ff]">
                  {isZh ? "进入创作中心" : "Open Creation Center"}
                </Link>
                <Link href={`${localePrefix}/pricing`} className="rounded-lg border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-white/[0.08]">
                  {isZh ? "查看定价与积分" : "See Pricing & Credits"}
                </Link>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function GuideCard({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="surface-card p-6">
      <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
        {icon}
      </div>
      <div className="text-lg font-semibold text-white">{title}</div>
      <p className="mt-3 text-sm leading-7 text-white/64">{description}</p>
    </div>
  );
}
