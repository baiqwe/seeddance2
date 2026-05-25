import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Clapperboard, Layers3, Sparkles } from "lucide-react";
import { InspirationGallery } from "@/components/gallery/InspirationGallery";
import { PricingSection } from "@/components/marketing/pricing-section";
import { FAQSchema } from "@/components/breadcrumb-schema";

type Props = { locale: string };

export default async function HomeStaticContent({ locale }: Props) {
  const isZh = locale === "zh";
  const t = await getTranslations({ locale, namespace: "home_static" });
  const localePrefix = `/${locale}`;

  const workflowLinks = [
    {
      href: `${localePrefix}/image-to-video`,
      title: isZh ? "图生视频工作流" : "Image to Video Workflow",
      description: isZh
        ? "从一张静帧、角色设定图或产品主视觉开始，把画面推成更稳定的连续镜头。"
        : "Start from a still, a character sheet, or a product hero frame and push it into a more stable moving shot.",
    },
    {
      href: `${localePrefix}/reference-video-generator`,
      title: isZh ? "参考视频工作流" : "Reference Video Workflow",
      description: isZh
        ? "用已有片段锁定动作、运镜和节奏，让新视频更接近你脑海里的镜头语言。"
        : "Use existing clips to lock motion, camera behavior, and pacing so the new output stays closer to your intended shot language.",
    },
    {
      href: `${localePrefix}/ai-video-generator-with-reference-video`,
      title: isZh ? "参考视频 AI 生成器" : "AI Video with Reference Video",
      description: isZh
        ? "把参考视频里的动作、镜头路径或节奏迁移到新的主体上，适合需要精准控流的镜头。"
        : "Transfer motion, camera path, or pacing from a reference clip into a new subject when control matters.",
    },
    {
      href: `${localePrefix}/ai-video-generator-with-audio-sync`,
      title: isZh ? "音频同步视频生成" : "Audio Sync Video Generator",
      description: isZh
        ? "用音乐、节拍或音效提示控制镜头节奏，适合短视频、MV 和广告节奏验证。"
        : "Use music, beat, or sound cues to guide video pacing for shorts, music videos, and campaign tests.",
    },
    {
      href: `${localePrefix}/dance-motion-transfer`,
      title: isZh ? "动作迁移工作流" : "Motion Transfer Workflow",
      description: isZh
        ? "把参考动作迁移到新的角色或数字人，同时尽量守住身份和造型一致性。"
        : "Transfer choreography into a new character or avatar while keeping identity and styling more consistent.",
    },
    {
      href: `${localePrefix}/storyboard-to-video`,
      title: isZh ? "分镜转视频工作流" : "Storyboard to Video Workflow",
      description: isZh
        ? "把分镜稿、关键帧和镜头说明扩成预演视频，先验证走位和节奏。"
        : "Turn boards, keyframes, and shot notes into previs clips so teams can validate timing and blocking early.",
    },
    {
      href: `${localePrefix}/video-extension`,
      title: isZh ? "视频延展工作流" : "Video Extension Workflow",
      description: isZh
        ? "沿着原始片段的节奏与空间关系继续写下去，不必从头重来。"
        : "Continue a source clip along its existing momentum and scene logic instead of restarting from zero.",
    },
    {
      href: `${localePrefix}/product-ad-generator`,
      title: isZh ? "产品广告工作流" : "Product Ad Workflow",
      description: isZh
        ? "适合产品揭幕、材质展示、发售预热和 campaign 测试片段。"
        : "Useful for product reveals, material sweeps, launch teasers, and campaign test edits.",
    },
    {
      href: `${localePrefix}/seedance-2-fast`,
      title: isZh ? "Seedance 2 Fast 工作流" : "Seedance 2 Fast Workflow",
      description: isZh
        ? "先用 Fast 快速试方向、看节奏，再把稳定方案切到标准模型做正式生成。"
        : "Use Fast to test direction and rhythm before moving stable ideas into the standard model.",
    },
    {
      href: `${localePrefix}/motion-control-ai-video-generator`,
      title: isZh ? "运动控制视频生成" : "Motion Control Video Generator",
      description: isZh
        ? "把主体动作、镜头路径、速度和结尾状态写清楚，让运动成为可审查的生产变量。"
        : "Define subject motion, camera path, speed, and end state so movement becomes reviewable.",
    },
    {
      href: `${localePrefix}/consistent-character-ai-video-generator`,
      title: isZh ? "角色一致性视频生成" : "Consistent Character Video",
      description: isZh
        ? "把身份参考和动作参考拆开，适合虚拟人、吉祥物和连续叙事镜头。"
        : "Separate identity references from motion references for avatars, mascots, and narrative continuity.",
    },
  ];

  const whySeedance = [
    {
      title: isZh ? "把角色、动作和节奏拆开控制" : "Separate identity, motion, and rhythm",
      body: isZh
        ? "很多生成结果不稳定，不是模型不会生成，而是所有输入都在抢同一个控制权。Seedance 2 的价值在于把这些职责拆开。"
        : "Many unstable outputs are not caused by weak generation alone, but by too many inputs fighting for the same control layer. Seedance 2 is strongest when those roles are separated.",
    },
    {
      title: isZh ? "从试方向到做流程" : "Move from exploration to workflow",
      body: isZh
        ? "首页可以先试一句话，创作中心再处理关键帧、动作参考和节奏控制，这比一上来堆完整参数更适合真实使用。"
        : "The homepage lets teams test direction with one sentence first, while the creation center handles keyframes, motion references, and timing. That is more realistic than exposing every setting immediately.",
    },
    {
      title: isZh ? "适合可以复用的团队方法" : "Built for repeatable team methods",
      body: isZh
        ? "真正重要的不是偶尔出一条惊艳样片，而是同一套输入、镜头语言和素材准备方式能不能被稳定复用。"
        : "The real benchmark is not whether the model can occasionally produce one impressive clip, but whether the same references, shot language, and preparation method can be reused reliably.",
    },
  ];

  const helpCenterLinks = [
    {
      href: `${localePrefix}/guides`,
      title: isZh ? "Prompt 与工作流指南" : "Prompt and workflow guides",
      description: isZh ? "先看怎么准备素材、怎么组织参考、怎么评估成片。" : "Start with how to prepare assets, organize references, and review outputs.",
    },
    {
      href: `${localePrefix}/creative-center`,
      title: isZh ? "进入创作中心" : "Open the creation center",
      description: isZh ? "当你已经知道要做哪类任务，就直接进入完整工作台。" : "When you already know the task, jump straight into the full workspace.",
    },
    {
      href: `${localePrefix}/about`,
      title: isZh ? "了解团队方法" : "Read the product method",
      description: isZh ? "看看我们如何理解可控性、可复用性和边界说明。" : "See how we think about controllability, repeatability, and usage boundaries.",
    },
  ];

  const trustLinks = [
    { href: `${localePrefix}/about`, label: isZh ? "了解团队方法" : "About the team" },
    { href: `${localePrefix}/guides`, label: isZh ? "查看使用指南" : "Read the guides" },
    { href: `${localePrefix}/privacy`, label: isZh ? "查看隐私政策" : "Privacy policy" },
    { href: `${localePrefix}/terms`, label: isZh ? "查看服务条款" : "Terms of service" },
    { href: `${localePrefix}/contact`, label: isZh ? "联系支持" : "Contact support" },
  ];

  const buyerFaqs = [
    {
      question: isZh ? "Seedance 2 更适合谁先用起来？" : "Who should start with Seedance 2 first?",
      answer: isZh
        ? "最适合广告与营销团队、短视频工作室、影视预演团队，以及已经习惯用参考图、参考片段和音乐节奏做创意沟通的人。"
        : "It is strongest for ad and marketing teams, short-form studios, previs teams, and creators who already communicate through references, clip examples, and rhythm cues.",
    },
    {
      question: isZh ? "首页为什么只有简化版生成器？" : "Why is the homepage generator intentionally simplified?",
      answer: isZh
        ? "首页的任务是让你先写下一个清楚的想法，再决定要不要进入创作中心补参考素材和高级控制。这样更接近真实创作顺序。"
        : "The homepage is designed to help you express one clear idea first, then move into the creation center only when you need references and deeper controls. That matches how real projects usually start.",
    },
    {
      question: isZh ? "什么时候一定要用参考素材？" : "When do references become essential?",
      answer: isZh
        ? "当你关心角色一致性、具体动作、镜头节奏、产品材质表现或多镜头连续性时，参考图和参考视频通常比继续加长 prompt 更有效。"
        : "When character consistency, exact movement, camera rhythm, product materials, or continuity across shots really matter, reference images and clips usually help more than writing a longer prompt.",
    },
    {
      question: isZh ? "怎么判断这是不是适合团队的工作流？" : "How can a team tell whether the workflow fits?",
      answer: isZh
        ? "看它能不能让同一套素材被反复利用，能不能把结果讲清楚给同事看，能不能在失败时快速重做，而不是只看第一次生成是否惊艳。"
        : "Judge it by whether the same inputs can be reused, whether the result can be communicated clearly to teammates, and whether the workflow is easy to retry after failure, not just by first-use wow factor.",
    },
  ];

  return (
    <>
      <FAQSchema items={buyerFaqs} />

      <section className="border-t border-white/6 bg-[linear-gradient(180deg,#060918_0%,#0b1026_100%)] py-20">
        <div className="container px-4 md:px-6">
          <div className="mx-auto max-w-5xl text-center">
            <h2 className="bg-[linear-gradient(90deg,#8b5cf6,#2563ff)] bg-clip-text text-4xl font-semibold tracking-tight text-transparent sm:text-5xl">
              {isZh ? "Get Inspired" : "Get Inspired"}
            </h2>
            <p className="mx-auto mt-5 max-w-3xl text-base leading-8 text-white/68 sm:text-lg">
              {isZh
                ? "看一组真正像 Seedance 2 工作流会产出的示例：有的靠静帧起镜头，有的靠参考片段带动作，有的直接从产品图或分镜稿出发。"
                : "Explore examples that feel closer to real Seedance 2 usage: some begin from still frames, some borrow motion from reference clips, and others grow from product images or storyboard frames."}
            </p>
          </div>
        </div>
        <div className="mt-12">
          <InspirationGallery locale={locale} maxItems={8} />
        </div>
      </section>

      <section id="guide" className="py-20">
        <div className="container px-4 md:px-6">
          <div className="mx-auto max-w-6xl space-y-16">
            <div className="mx-auto max-w-4xl text-center">
              <div className="section-kicker">{isZh ? "Why Seedance 2 Feels Different" : "Why Seedance 2 Feels Different"}</div>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                {isZh ? "它不是把所有事情都交给一句 prompt，而是把控制权拆回真实工作流。" : "It does not leave everything to one prompt. It breaks control back into a workflow creators already understand."}
              </h2>
              <p className="mt-5 text-base leading-8 text-white/66 sm:text-lg">
                {isZh
                  ? "Seedance 2 的核心不是“随便生成一条视频”，而是让图片、视频、音频和文字各自承担不同职责：有人负责角色，有人负责动作，有人负责节奏。"
                  : "The real value of Seedance 2 is not random generation. It is the ability to let images, clips, audio, and text each carry a different job: subject, motion, rhythm, or direction."}
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              <FeatureCard
                icon={<Layers3 className="h-5 w-5 text-[#6ea8ff]" />}
                title={isZh ? "素材职责清楚" : "Clear jobs for each input"}
                desc={isZh ? "图片负责角色和构图，视频负责动作和运镜，音频负责节奏和氛围，避免所有输入互相打架。" : "Images carry subject and composition, video carries motion and camera, and audio carries rhythm so the inputs do not fight each other."}
              />
              <FeatureCard
                icon={<Clapperboard className="h-5 w-5 text-[#8b5cf6]" />}
                title={isZh ? "先看成片，不先看表单" : "Preview-first, not form-first"}
                desc={isZh ? "界面应该把注意力给结果，而不是让用户先在一排设置里迷路。" : "The interface keeps the result visually central instead of asking users to decode a wall of settings first."}
              />
              <FeatureCard
                icon={<Sparkles className="h-5 w-5 text-[#5eead4]" />}
                title={isZh ? "从轻试用到深创作" : "Fast start, deeper control later"}
                desc={isZh ? "首页先用一句话开始，真正需要上传和精细控制时，再进入创作中心继续做完。" : "The homepage starts with one simple idea, while the creation center takes over when you need uploads and deeper controls."}
              />
            </div>

            <div className="space-y-6">
              <div className="max-w-4xl">
                <div className="section-kicker">{isZh ? "Why Seedance 2" : "Why Seedance 2"}</div>
                <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                  {isZh ? "Seedance 2 的价值，不在于“多一个模型”，而在于把视频生成重新整理成工作流。" : "Seedance 2 is valuable not because it is one more model, but because it reorganizes video generation into a workflow."}
                </h2>
                <p className="mt-4 text-base leading-8 text-white/66 sm:text-lg">
                  {isZh
                    ? "如果一个团队已经在用参考图、分镜、动作片段和节奏 cue 做沟通，那么 Seedance 2 更像一个把这些信息重新接起来的工作台。"
                    : "If a team already communicates through reference stills, boards, motion clips, and timing cues, Seedance 2 becomes a workspace that reconnects those inputs instead of flattening them into one prompt."}
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                {whySeedance.map((item) => (
                  <div key={item.title} className="surface-card p-6">
                    <div className="text-lg font-semibold text-white">{item.title}</div>
                    <p className="mt-3 text-sm leading-7 text-white/64">{item.body}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
              <div className="surface-panel px-6 py-7 md:px-8">
                <div className="section-kicker">{isZh ? "What You Can Make" : "What You Can Make"}</div>
                <h3 className="mt-4 text-2xl font-semibold text-white">
                  {isZh ? "Seedance 2 最适合那些“已经知道自己想控制什么”的场景。" : "Seedance 2 is strongest when you already know what needs to stay under control."}
                </h3>
                <div className="mt-5 space-y-4 text-sm leading-8 text-white/68">
                  <p>
                    {isZh
                      ? "如果你要做广告短片、产品展示、角色一致性内容、影视预演、舞蹈动作迁移，或者需要把多个素材拼成一个完整镜头，Seedance 2 会比单纯文生视频更好用。"
                      : "If you are producing ad edits, product showcases, character-consistent content, previs, dance motion transfer, or any shot that depends on combining multiple references, Seedance 2 is usually more useful than text-only generation."}
                  </p>
                  <p>
                    {isZh
                      ? "真正重要的不是“它支不支持很多模态”，而是这些模态能不能各司其职，最终让结果更稳定。"
                      : "What matters is not that the product supports many modalities, but that each modality can do a specific job and make the result more stable."}
                  </p>
                </div>
              </div>

              <div className="surface-panel px-6 py-7 md:px-8">
                <div className="section-kicker">{isZh ? "Where To Go Next" : "Where To Go Next"}</div>
                <h3 className="mt-4 text-2xl font-semibold text-white">
                  {isZh ? "如果你已经有明确任务，直接进入对应工作流。" : "If you already know the task, jump straight into the matching workflow."}
                </h3>
                <div className="mt-5 flex flex-wrap gap-2">
                  {trustLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-white/72 transition-colors hover:bg-white/[0.08] hover:text-white"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
                <p className="mt-5 text-sm leading-8 text-white/68">
                  {isZh
                    ? "首页只负责快速进入和建立直觉；更细的上传方式、参数选择、素材准备建议和使用边界，都可以在创作中心和帮助中心继续看。"
                    : "The homepage is meant to establish direction quickly. Detailed upload behavior, settings, preparation advice, and usage boundaries continue in the creation center and help center."}
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="max-w-4xl">
                <div className="section-kicker">{isZh ? "Workflow Library" : "Workflow Library"}</div>
                <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                  {isZh ? "从 Seedance 2 首页继续走，下一步应该进入这些具体工作流。" : "After the Seedance 2 homepage, these are the workflows most teams reach for next."}
                </h2>
                <p className="mt-4 text-base leading-8 text-white/66 sm:text-lg">
                  {isZh
                    ? "每一页都围绕一个具体任务展开：图生视频、参考驱动生成、动作迁移、分镜预演、视频延展或产品广告。"
                    : "Each page is organized around one concrete task: image to video, reference-led generation, motion transfer, storyboard previs, video extension, or product advertising."}
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {workflowLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="surface-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/30"
                  >
                    <div className="text-lg font-semibold text-white">{link.title}</div>
                    <p className="mt-3 text-sm leading-7 text-white/64">{link.description}</p>
                  </Link>
                ))}
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
              <div className="surface-panel px-6 py-7 md:px-8">
                <div className="section-kicker">{isZh ? "How Teams Usually Work" : "How Teams Usually Work"}</div>
                <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white">
                  {isZh ? "真实团队不是靠运气出片，而是靠重复利用同一套参考方法。" : "Real teams do not scale with lucky prompts. They scale with repeatable reference logic."}
                </h2>
                <div className="mt-5 space-y-4 text-sm leading-8 text-white/66">
                  <p>
                    {isZh
                      ? "很多团队会先在首页写一句核心想法，确认方向没问题，再进入创作中心上传图像、动作参考或节奏素材。"
                      : "Many teams start on the homepage with one clear direction, then move into the creation center once they know they need image, motion, or timing references."}
                  </p>
                  <p>
                    {isZh
                      ? "等流程稳定下来之后，同一套素材和提示会被不断复用，只替换角色、产品、镜头或节奏要求。"
                      : "Once the workflow settles, the same references and prompt structure can be reused while swapping only the character, product, camera treatment, or rhythm target."}
                  </p>
                </div>
              </div>

              <div className="surface-panel px-6 py-7 md:px-8">
                <div className="section-kicker">{isZh ? "Buyer FAQ" : "Buyer FAQ"}</div>
                <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white">
                  {isZh ? "第一次评估 Seedance 2 时，通常会先问这几个问题。" : "These are the questions buyers usually ask when evaluating Seedance 2 for the first time."}
                </h2>
                <div className="mt-5 space-y-4">
                  {buyerFaqs.map((faq) => (
                    <div key={faq.question} className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-4">
                      <div className="text-sm font-semibold text-white">{faq.question}</div>
                      <p className="mt-2 text-sm leading-7 text-white/64">{faq.answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {helpCenterLinks.map((link) => (
                <Link key={link.href} href={link.href} className="surface-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/30">
                  <div className="text-lg font-semibold text-white">{link.title}</div>
                  <p className="mt-3 text-sm leading-7 text-white/64">{link.description}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <PricingSection locale={locale} />

      <section className="border-t border-white/6 py-20">
        <div className="container px-4 md:px-6">
          <div className="surface-panel mx-auto max-w-4xl px-6 py-10 text-center md:px-10">
            <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">{t("cta_title")}</h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-white/64">{t("cta_subtitle")}</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                href={`${localePrefix}/sign-up`}
                className="rounded-lg bg-[#2563ff] px-8 py-3.5 text-sm font-medium text-white transition-colors hover:bg-[#3b72ff]"
              >
                {t("cta_signup")}
              </Link>
              <Link
                href={`${localePrefix}/pricing`}
                className="rounded-lg border border-white/10 bg-white/[0.03] px-8 py-3.5 text-sm font-medium text-white transition-colors hover:bg-white/[0.06]"
              >
                {t("cta_pricing")}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function FeatureCard({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="surface-card p-6">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.04]">
        {icon}
      </div>
      <h3 className="mt-5 text-xl font-semibold text-white">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-white/62">{desc}</p>
    </div>
  );
}
