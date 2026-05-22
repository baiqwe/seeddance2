import type { Metadata } from "next";
import { getMessages } from "next-intl/server";
import { site } from "@/config/site";
import { buildLocaleAlternates } from "@/utils/seo/metadata";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { MultiModalWorkspace } from "@/components/feature/multi-modal-workspace";
import { WorkspaceQuerySync } from "@/components/feature/workspace-query-sync";

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  const { locale } = params;
  const messages = (await getMessages({ locale })) as {
    metadata: { title: string; description: string; keywords: string };
  };
  const canonical = `/${locale}/creative-center`;

  return {
    title:
      locale === "zh"
        ? `创作中心 | ${messages.metadata.title}`
        : `Creation Center | ${messages.metadata.title}`,
    description:
      locale === "zh"
        ? "进入 Seedance 2 创作中心，使用完整多模态工作台处理图生视频、文生视频、参考动作、音频节奏和视频延展。"
        : "Open the Seedance 2 creation center to use the full multi-modal workspace for image to video, text to video, reference motion, audio-guided pacing, and video extension.",
    alternates: buildLocaleAlternates(canonical),
    openGraph: {
      title:
        locale === "zh" ? "Seedance 2 创作中心" : "Seedance 2 Creation Center",
      description:
        locale === "zh"
          ? "完整多模态工作台，用于处理图片、视频、音频参考和更精细的生成控制。"
          : "The full multi-modal workspace for references, motion control, pacing, and deeper generation controls.",
      url: new URL(canonical, site.siteUrl).toString(),
    },
  };
}

export default async function CreativeCenterPage(props: {
  params: Promise<{ locale: string }>;
}) {
  const params = await props.params;
  const { locale } = params;

  const breadcrumbs = [
    { name: locale === "zh" ? "首页" : "Home", href: `/${locale}` },
    {
      name: locale === "zh" ? "创作中心" : "Creation Center",
      href: `/${locale}/creative-center`,
    },
  ];

  return (
    <div className="relative isolate flex-1 overflow-hidden bg-[#060811] px-3 py-4 md:px-4 lg:py-6">
      <div className="mx-auto max-w-[1500px] space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Breadcrumbs items={breadcrumbs} />
          <div className="rounded-full border border-[#232938] bg-[#0b1020] px-3 py-1.5 text-xs text-white/54">
            {locale === "zh"
              ? "独立创作工作台 · Powered by Seedance 2"
              : "Independent creation workspace · Powered by Seedance 2"}
          </div>
        </div>

        <section>
          <WorkspaceQuerySync />
          <MultiModalWorkspace locale={locale} />
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[22px] bg-[#0b1020] p-6 ring-1 ring-[#232938]/70">
            <div className="text-xs uppercase tracking-[0.2em] text-cyan-200/65">
              {locale === "zh" ? "生成前判断" : "Before You Render"}
            </div>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight text-white">
              {locale === "zh"
                ? "先确认参考素材各自负责什么，再消耗渲染额度。"
                : "Decide what each reference controls before spending render credits."}
            </h2>
            <p className="mt-4 text-sm leading-8 text-white/62">
              {locale === "zh"
                ? "视频生成成本高，创作中心默认把 Prompt、关键帧、动作参考、音频节奏和参数放在同一个流程里，方便你在提交前检查主体、运动、镜头和节奏是否分工清楚。"
                : "Video generation is compute-heavy, so the creation center keeps prompt, keyframes, motion references, audio rhythm, and output parameters in one reviewable flow before submission."}
            </p>
          </div>
          <div className="rounded-[22px] bg-[#0b1020] p-6 ring-1 ring-[#232938]/70">
            <div className="text-xs uppercase tracking-[0.2em] text-white/38">
              {locale === "zh" ? "独立工作流说明" : "Independent Workflow Note"}
            </div>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight text-white">
              {locale === "zh"
                ? "这里不是官方演示页，而是面向交付的 Seedance 2 工作流。"
                : "This is not an official demo page. It is a delivery-focused Seedance 2 workflow."}
            </h2>
            <p className="mt-4 text-sm leading-8 text-white/62">
              {locale === "zh"
                ? "我们把复杂选项收进可复用的工作台，重点帮助广告、产品展示、角色一致性和分镜预演团队更稳定地准备输入、复盘结果和控制成本。"
                : "The workspace is designed for teams preparing ad shots, product reveals, character-consistent scenes, and previs clips who need clearer inputs, review criteria, and cost control."}
            </p>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {[
            {
              title: locale === "zh" ? "结果评估" : "Output Review",
              body:
                locale === "zh"
                  ? "优先检查主体是否稳定、镜头是否按预期推进、关键帧之间是否连贯，再决定是否迭代。"
                  : "Check subject stability, camera movement, and continuity between keyframes before deciding whether to iterate.",
            },
            {
              title: locale === "zh" ? "素材安全" : "Asset Handling",
              body:
                locale === "zh"
                  ? "参考素材只用于本次任务准备与生成链路，不需要公开展示的文件不应出现在画廊或示例页。"
                  : "Reference files are used for the requested generation workflow, and private inputs should not be shown in public galleries.",
            },
            {
              title: locale === "zh" ? "适合场景" : "Best Fit",
              body:
                locale === "zh"
                  ? "适合有明确脚本、产品图、角色设定、动作视频或音频节奏的任务；纯探索想法建议先从首页模板理解效果。"
                  : "Best for clear scripts, product images, character sheets, motion clips, or audio rhythm. For exploration, start with homepage templates first.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-[20px] bg-[#0b1020] p-5 ring-1 ring-[#232938]/60"
            >
              <h3 className="text-base font-semibold text-white">
                {item.title}
              </h3>
              <p className="mt-3 text-sm leading-7 text-white/58">
                {item.body}
              </p>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
