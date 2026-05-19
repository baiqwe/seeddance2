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
        <div className="container flex-1 px-4 py-10 md:px-6 lg:py-14">
            <div className="mx-auto max-w-7xl space-y-8">
                <Breadcrumbs items={breadcrumbs} />

                <div className="rounded-[28px] border border-white/10 bg-black/24 p-3 shadow-[0_26px_80px_-46px_rgba(0,0,0,0.82)] backdrop-blur-sm">
                    <WorkspaceQuerySync />
                    <MultiModalWorkspace locale={locale} />
                </div>

                <div className="space-y-4 text-center">
                    <div className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/76">
                        {locale === "zh" ? "Seedance 2 创作中心" : "Seedance 2 Creation Center"}
                    </div>
                    <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                        {locale === "zh" ? "在同一个创作台里把角色、动作和节奏接起来" : "Bring identity, motion, and timing together in one workspace"}
                    </h1>
                    <p className="mx-auto max-w-3xl text-base leading-8 text-white/66 sm:text-lg">
                        {locale === "zh"
                            ? "首页只负责快速进入，创作中心负责真正的生产流程：补参考图、动作视频和音频线索，切换 Seedance 2 / Fast，再把镜头节奏推到可交付的结果。"
                            : "The homepage gets you started quickly. The creation center is where production actually happens: add stills, motion clips, and audio cues, switch between Seedance 2 and Fast, and refine the shot into something you can hand off."}
                    </p>
                </div>

                <div className="grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
                    <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
                        <div className="section-kicker">{locale === "zh" ? "模型与工作方式" : "Models & workflow"}</div>
                        <h2 className="mt-4 text-2xl font-semibold tracking-tight text-white">
                            {locale === "zh" ? "先选工作方式，再决定用标准模型还是 Fast。" : "Choose the workflow first, then decide between the standard model and Fast."}
                        </h2>
                        <div className="mt-5 grid gap-4 md:grid-cols-2">
                            <div className="rounded-2xl border border-white/10 bg-[#141821] p-5">
                                <div className="text-lg font-semibold text-white">Seedance 2</div>
                                <p className="mt-3 text-sm leading-7 text-white/66">
                                    {locale === "zh"
                                        ? "更适合角色一致性、产品质感、镜头层次和需要多参考素材共同配合的生成任务。"
                                        : "Use this when identity consistency, richer shot language, and steadier multi-reference behavior matter more than speed."}
                                </p>
                            </div>
                            <div className="rounded-2xl border border-white/10 bg-[#141821] p-5">
                                <div className="text-lg font-semibold text-white">Seedance 2 Fast</div>
                                <p className="mt-3 text-sm leading-7 text-white/66">
                                    {locale === "zh"
                                        ? "更适合快速试镜头方向、快速看节奏、快速验证概念，然后再决定是否切回标准模型。"
                                        : "Use Fast for direction checks, pacing studies, and rapid concept testing before moving back to the standard model."}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
                        <div className="section-kicker">{locale === "zh" ? "当前参数范围" : "Current supported set"}</div>
                        <h2 className="mt-4 text-2xl font-semibold tracking-tight text-white">
                            {locale === "zh" ? "这里故意只露出当前能稳定跑通的参数。" : "The UI only exposes the settings that are stable and currently runnable."}
                        </h2>
                        <ul className="mt-5 space-y-3 text-sm leading-7 text-white/66">
                            <li>{locale === "zh" ? "当前按 Kie 文档展示 720p / 16:9 / 15s，避免出现“看起来能选、提交后却报错”的假参数。" : "The current surface is limited to 720p / 16:9 / 15s so creators do not waste time on controls that look selectable but are not actually supported yet."}</li>
                            <li>{locale === "zh" ? "文生视频模式只需要 Prompt；图生视频模式按关键帧工作流展示；多参考模式继续承接图像、视频和音频参考。" : "Text-to-video starts from prompt only, image-to-video follows the keyframe workflow, and multi-reference mode keeps image, video, and audio references available."}</li>
                            <li>{locale === "zh" ? "后续如果 Kie 开放更宽的参数区间，这一层界面会跟着扩开，不会让前端先跑在模型前面。" : "If Kie opens a wider parameter range later, the interface can expand with it instead of pretending those controls already exist."}</li>
                        </ul>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    {[
                        {
                            title: locale === "zh" ? "Text to Video" : "Text to Video",
                            body: locale === "zh" ? "先把主体、镜头、节奏和氛围写清楚，再决定后续是否补视觉参考。" : "Describe the subject, camera, pacing, and atmosphere first, then decide later whether references are still needed.",
                        },
                        {
                            title: locale === "zh" ? "Image to Video" : "Image to Video",
                            body: locale === "zh" ? "从一张关键帧起步，重点决定镜头该怎么推进，必要时再补尾帧目标。" : "Anchor the shot with a strong keyframe, then focus on how the camera and motion should grow from it.",
                        },
                        {
                            title: locale === "zh" ? "Multi-Reference Video" : "Multi-Reference Video",
                            body: locale === "zh" ? "当角色、动作、节奏都需要拆开控制时，用这条工作流最接近真实团队的创作方式。" : "When identity, motion, and timing all need their own inputs, this is the workflow that feels closest to real team production.",
                        },
                    ].map((item) => (
                        <div key={item.title} className="rounded-[22px] border border-white/10 bg-[#11161e]/88 p-5">
                            <div className="text-lg font-semibold text-white">{item.title}</div>
                            <p className="mt-3 text-sm leading-7 text-white/64">{item.body}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
