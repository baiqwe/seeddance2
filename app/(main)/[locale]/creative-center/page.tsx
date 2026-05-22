import type { Metadata } from "next";
import { getMessages } from "next-intl/server";
import { site } from "@/config/site";
import { buildLocaleAlternates } from "@/utils/seo/metadata";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { MultiModalWorkspace } from "@/components/feature/multi-modal-workspace";
import { WorkspaceQuerySync } from "@/components/feature/workspace-query-sync";

export async function generateMetadata(props: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const params = await props.params;
    const { locale } = params;
    const messages = await getMessages({ locale }) as {
        metadata: { title: string; description: string; keywords: string };
    };
    const canonical = `/${locale}/creative-center`;

    return {
        title: locale === "zh"
            ? `创作中心 | ${messages.metadata.title}`
            : `Creation Center | ${messages.metadata.title}`,
        description: locale === "zh"
            ? "进入 Seedance 2 创作中心，使用完整多模态工作台处理图生视频、文生视频、参考动作、音频节奏和视频延展。"
            : "Open the Seedance 2 creation center to use the full multi-modal workspace for image to video, text to video, reference motion, audio-guided pacing, and video extension.",
        alternates: buildLocaleAlternates(canonical),
        openGraph: {
            title: locale === "zh" ? "Seedance 2 创作中心" : "Seedance 2 Creation Center",
            description: locale === "zh"
                ? "完整多模态工作台，用于处理图片、视频、音频参考和更精细的生成控制。"
                : "The full multi-modal workspace for references, motion control, pacing, and deeper generation controls.",
            url: new URL(canonical, site.siteUrl).toString(),
        },
    };
}

export default async function CreativeCenterPage(props: { params: Promise<{ locale: string }> }) {
    const params = await props.params;
    const { locale } = params;

    const breadcrumbs = [
        { name: locale === "zh" ? "首页" : "Home", href: `/${locale}` },
        { name: locale === "zh" ? "创作中心" : "Creation Center", href: `/${locale}/creative-center` },
    ];

    return (
        <div className="relative isolate flex-1 overflow-hidden bg-[#060811] px-3 py-4 md:px-4 lg:py-6">
            <div className="mx-auto max-w-[1500px] space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <Breadcrumbs items={breadcrumbs} />
                    <div className="rounded-full border border-[#232938] bg-[#0b1020] px-3 py-1.5 text-xs text-white/54">
                        {locale === "zh" ? "独立创作工作台 · Powered by Seedance 2" : "Independent creation workspace · Powered by Seedance 2"}
                    </div>
                </div>

                <section className="rounded-[28px] border border-[#232938] bg-[#060811] p-2">
                    <WorkspaceQuerySync />
                    <MultiModalWorkspace locale={locale} />
                </section>

                <details className="rounded-[18px] border border-[#232938] bg-[#0b1020] p-4 text-sm text-white/56">
                    <summary className="cursor-pointer select-none text-white/72">
                        {locale === "zh" ? "工作流帮助与当前参数说明" : "Workflow help and current parameter notes"}
                    </summary>
                    <div className="mt-4 grid gap-4 md:grid-cols-3">
                        <p className="leading-7">
                            {locale === "zh"
                                ? "Seedance 2 更适合角色一致性、产品质感和多参考协同；Fast 更适合快速试方向、试镜头和试节奏。"
                                : "Seedance 2 is better for identity consistency, product detail, and multi-reference coordination; Fast is better for quick direction and pacing tests."}
                        </p>
                        <p className="leading-7">
                            {locale === "zh"
                                ? "当前界面只开放 720p / 16:9 / 15s，避免展示提交后暂不支持的选项。"
                                : "The current UI only exposes 720p / 16:9 / 15s to avoid options that are not yet supported after submission."}
                        </p>
                        <p className="leading-7">
                            {locale === "zh"
                                ? "如果只是写场景，用文生视频；如果已有关键帧，用图生视频；如果要拆角色、动作和节奏，用多参考模式。"
                                : "Use text-to-video for a scene idea, image-to-video for keyframes, and multi-reference mode when identity, motion, and timing each need their own input."}
                        </p>
                    </div>
                </details>
            </div>
        </div>
    );
}
