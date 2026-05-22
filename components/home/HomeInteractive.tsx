'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
    ArrowRight,
    BadgeCheck,
    Clapperboard,
    CreditCard,
    Film,
    Image as ImageIcon,
    LockKeyhole,
    MousePointerClick,
    Music2,
    PlayCircle,
    Settings2,
    Sparkles,
    WandSparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { showcaseTemplates, type ShowcaseReference } from '@/config/showcase-templates';

interface HomeInteractiveProps {
    onShowStaticContent: (show: boolean) => void;
}

const REFERENCE_ICON = {
    image: ImageIcon,
    video: Film,
    audio: Music2,
} satisfies Record<ShowcaseReference['type'], typeof ImageIcon>;

export default function HomeInteractive({ onShowStaticContent }: HomeInteractiveProps) {
    const router = useRouter();
    const pathname = usePathname();
    const previewVideoRef = useRef<HTMLVideoElement | null>(null);
    const pathParts = pathname?.split('/') || [];
    const locale = pathParts[1] === 'zh' ? 'zh' : 'en';
    const isZh = locale === 'zh';
    const [activeTemplateId, setActiveTemplateId] = useState(showcaseTemplates[0]?.id ?? '');

    useEffect(() => {
        onShowStaticContent(true);
    }, [onShowStaticContent]);

    const activeTemplate = useMemo(
        () => showcaseTemplates.find((template) => template.id === activeTemplateId) ?? showcaseTemplates[0],
        [activeTemplateId]
    );

    const creationCenterTarget = useMemo(() => {
        const params = new URLSearchParams();
        params.set('mode', activeTemplate.mode);
        params.set('model', activeTemplate.model);
        params.set('ratio', activeTemplate.ratio);
        params.set('duration', activeTemplate.duration);
        params.set('resolution', activeTemplate.resolution);
        params.set('prompt', isZh ? activeTemplate.promptZh : activeTemplate.prompt);
        return `/${locale}/creative-center?${params.toString()}`;
    }, [activeTemplate, isZh, locale]);

    const openSignUp = () => {
        const params = new URLSearchParams();
        params.set('next', creationCenterTarget);
        router.push(`/${locale}/sign-up?${params.toString()}`);
    };

    const openPricing = () => {
        router.push(`/${locale}/pricing`);
    };

    const title = isZh ? activeTemplate.titleZh : activeTemplate.title;
    const subtitle = isZh ? activeTemplate.subtitleZh : activeTemplate.subtitle;
    const prompt = isZh ? activeTemplate.promptZh : activeTemplate.prompt;
    const intent = isZh ? activeTemplate.intentZh : activeTemplate.intent;
    const resultNotes = isZh ? activeTemplate.resultNotesZh : activeTemplate.resultNotes;
    const previewRatio = activeTemplate.previewRatio ?? activeTemplate.ratio;

    useEffect(() => {
        const video = previewVideoRef.current;
        if (!video || !activeTemplate.outputVideo) return;

        video.currentTime = 0;
        video.muted = true;
        void video.play().catch(() => {
            // Browser autoplay policy can still block in rare cases; controls remain visible as fallback.
        });
    }, [activeTemplate.id, activeTemplate.outputVideo]);

    return (
        <div className="mx-auto w-full max-w-7xl">
            <div className="relative overflow-hidden rounded-[36px] border border-white/12 bg-[#080d17]/95 shadow-[0_42px_120px_-64px_rgba(0,0,0,0.96)]">
                <div className="relative grid gap-0 xl:grid-cols-[320px_minmax(0,1fr)_440px]">
                    <aside className="relative border-b border-white/10 bg-[#0b1220] p-4 xl:border-b-0 xl:border-r xl:p-5">
                        <div className="mb-4 flex items-center justify-between gap-3">
                            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/24 px-3 py-1.5 text-xs uppercase tracking-[0.18em] text-cyan-100/68">
                                <Sparkles className="h-3.5 w-3.5 text-cyan-200" />
                                {isZh ? '01 模板选择' : '01 Template deck'}
                            </div>
                            <div className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] text-white/64">
                                <MousePointerClick className="h-3.5 w-3.5" />
                                {isZh ? '可切换' : 'Switch'}
                            </div>
                        </div>
                        <h2 className="mt-4 text-2xl font-semibold tracking-tight text-white">
                            {isZh ? '先看输入如何影响结果' : 'See how inputs shape the result'}
                        </h2>
                        <p className="mt-3 text-sm leading-7 text-white/56">
                            {isZh
                                ? '视频生成成本高，我们不做免登录试用。这里直接展示 Prompt、参数、参考素材和结果，让你先判断工作流是否值得付费。'
                                : 'Video generation is compute-heavy, so there is no anonymous trial. Instead, inspect the prompt, settings, references, and output before paying.'}
                        </p>

                        <div className="mt-5 space-y-2.5">
                            {showcaseTemplates.map((template, index) => {
                                const active = template.id === activeTemplate.id;
                                return (
                                    <button
                                        key={template.id}
                                        type="button"
                                        aria-pressed={active}
                                        onClick={() => setActiveTemplateId(template.id)}
                                        className={cn(
                                            'group relative w-full overflow-hidden rounded-[22px] border p-3.5 text-left outline-none transition-all duration-300 focus-visible:ring-2 focus-visible:ring-cyan-200/60',
                                            active
                                                ? 'border-cyan-100/36 bg-cyan-950/30 shadow-[0_18px_54px_-42px_rgba(103,232,249,0.75)]'
                                                : 'border-white/9 bg-slate-950/34 hover:-translate-y-0.5 hover:border-white/18 hover:bg-slate-900/64'
                                        )}
                                    >
                                        <div className="flex items-start gap-3">
                                            <span className={cn(
                                                'flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border text-xs font-semibold',
                                                active ? 'border-cyan-200/28 bg-cyan-200/12 text-cyan-100' : 'border-white/10 bg-black/20 text-white/46'
                                            )}>
                                                {String(index + 1).padStart(2, '0')}
                                            </span>
                                            <span className="min-w-0">
                                                <span className="block text-sm font-semibold text-white">
                                                    {isZh ? template.titleZh : template.title}
                                                </span>
                                                <span className="mt-1 line-clamp-2 block text-xs leading-5 text-white/46">
                                                    {isZh ? template.subtitleZh : template.subtitle}
                                                </span>
                                            </span>
                                        </div>
                                        <div className="mt-3 flex items-center justify-between border-t border-white/8 pt-3 text-[11px]">
                                            <span className={cn(
                                                'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1',
                                                active ? 'bg-cyan-200/12 text-cyan-50' : 'bg-white/[0.045] text-white/48 group-hover:text-cyan-50/82'
                                            )}>
                                                <PlayCircle className="h-3.5 w-3.5" />
                                                {active ? (isZh ? '正在预览' : 'Previewing') : (isZh ? '点击切换' : 'Click to preview')}
                                            </span>
                                            <ArrowRight className={cn(
                                                'h-3.5 w-3.5 transition-transform',
                                                active ? 'text-cyan-100' : 'text-white/32 group-hover:translate-x-0.5 group-hover:text-cyan-100'
                                            )} />
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </aside>

                    <section className="relative bg-[#0a101d] p-4 sm:p-5 xl:p-6">
                        <div className="mb-4 flex items-center justify-between gap-3">
                            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/22 px-3 py-1.5 text-xs uppercase tracking-[0.18em] text-white/52">
                                <LockKeyhole className="h-3.5 w-3.5 text-white/62" />
                                {isZh ? '02 只读参数单' : '02 Locked setup'}
                            </div>
                            <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-white/48">
                                {isZh ? '不可编辑 · 用于判断效果' : 'Read-only · effect preview'}
                            </span>
                        </div>
                        <div
                            aria-disabled="true"
                            className="pointer-events-none select-none rounded-[30px] border border-white/10 bg-slate-950/42 p-4 opacity-90 shadow-[inset_0_1px_0_rgba(255,255,255,0.045)] sm:p-5"
                        >
                        <div className="flex flex-wrap items-start justify-between gap-4">
                            <div>
                                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200/14 bg-emerald-200/[0.06] px-3 py-1.5 text-xs text-emerald-100/76">
                                    <BadgeCheck className="h-3.5 w-3.5" />
                                    {isZh ? '可复用生成前置信息' : 'Reusable generation setup'}
                                </div>
                                <h3 className="mt-4 text-3xl font-semibold tracking-tight text-white md:text-4xl">
                                    {title}
                                </h3>
                                <p className="mt-3 max-w-2xl text-sm leading-7 text-white/58 md:text-base">
                                    {subtitle}
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-4 xl:grid-cols-2 2xl:grid-cols-4">
                                <ParamBadge label={isZh ? '模式' : 'Mode'} value={formatMode(activeTemplate.mode, isZh)} />
                                <ParamBadge label={isZh ? '比例' : 'Ratio'} value={activeTemplate.ratio} />
                                <ParamBadge label={isZh ? '时长' : 'Duration'} value={activeTemplate.duration} />
                                <ParamBadge label={isZh ? '清晰度' : 'Resolution'} value={activeTemplate.resolution} />
                            </div>
                        </div>

                        <div className="mt-5 rounded-[24px] border border-white/10 bg-black/24 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)]">
                            <div className="mb-3 flex items-center justify-between gap-3">
                                <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-white/42">
                                    <WandSparkles className="h-3.5 w-3.5 text-cyan-200/80" />
                                    Prompt
                                </div>
                                <span className="rounded-full border border-white/8 bg-white/[0.04] px-2.5 py-1 text-[11px] text-white/44">
                                    {isZh ? '真实任务写法' : 'Production-style prompt'}
                                </span>
                            </div>
                            <p className="text-sm leading-7 text-white/76 md:text-base md:leading-8">
                                {prompt}
                            </p>
                        </div>

                        <div className="mt-4 grid gap-4">
                            <div className="rounded-[24px] border border-white/10 bg-white/[0.035] p-4">
                                <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.18em] text-white/42">
                                    <Clapperboard className="h-3.5 w-3.5 text-blue-200/80" />
                                    {isZh ? '参考素材与职责' : 'References and roles'}
                                </div>
                                <div className="mt-4 grid gap-3">
                                    {activeTemplate.references.length > 0 ? (
                                        activeTemplate.references.map((reference) => (
                                            <ReferenceCard key={`${activeTemplate.id}-${reference.type}-${reference.label}`} reference={reference} isZh={isZh} />
                                        ))
                                    ) : (
                                        <div className="rounded-[18px] border border-dashed border-white/10 bg-black/18 p-4 text-sm leading-7 text-white/52">
                                            {isZh
                                                ? '这个模板不依赖参考素材。它用 Prompt 同时控制主体、镜头、光线、节奏和负向约束。'
                                                : 'This template uses no references. The prompt carries subject, camera, lighting, pacing, and negative direction.'}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="rounded-[24px] border border-white/10 bg-white/[0.035] p-4">
                                <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.18em] text-white/42">
                                    <Settings2 className="h-3.5 w-3.5 text-violet-200/80" />
                                    {isZh ? '生成逻辑' : 'Generation logic'}
                                </div>
                                <p className="mt-4 text-sm leading-7 text-white/64">{intent}</p>
                                <div className="mt-4 space-y-2">
                                    {resultNotes.map((note) => (
                                        <div key={note} className="flex items-start gap-2 rounded-[14px] border border-white/8 bg-black/16 px-3 py-2 text-xs leading-5 text-white/60">
                                            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-200" />
                                            {note}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        </div>
                    </section>

                    <aside className="border-t border-white/10 bg-[#11131c] p-4 sm:p-5 xl:border-l xl:border-t-0 xl:p-6">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <div className="text-xs uppercase tracking-[0.18em] text-white/40">
                                    {isZh ? '03 输出预览' : '03 Output preview'}
                                </div>
                                <div className="mt-1 text-lg font-semibold text-white">
                                    {isZh ? '结果不是盲盒' : 'Not a black box'}
                                </div>
                            </div>
                            <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-xs text-white/60">
                                {activeTemplate.model.includes('fast') ? 'Fast' : 'Seedance 2'}
                            </span>
                        </div>

                        <div className="mt-5 overflow-hidden rounded-[28px] border border-white/10 bg-black shadow-[0_24px_80px_-48px_rgba(0,0,0,0.95)]">
                            {activeTemplate.outputVideo ? (
                                <video
                                    ref={previewVideoRef}
                                    key={activeTemplate.id}
                                    src={activeTemplate.outputVideo}
                                    poster={activeTemplate.poster}
                                    muted
                                    loop
                                    playsInline
                                    autoPlay
                                    controls
                                    preload="auto"
                                    className={cn(getVideoAspectClass(previewRatio), 'w-full bg-black object-contain')}
                                />
                            ) : (
                                <div className={cn(getVideoAspectClass(previewRatio), 'relative w-full overflow-hidden bg-[radial-gradient(circle_at_50%_26%,rgba(103,232,249,0.16),transparent_32%),linear-gradient(180deg,#111827,#020617)]')}>
                                    <img src={activeTemplate.poster} alt="" className="h-full w-full object-cover opacity-42 blur-[1px]" />
                                    <div className="absolute inset-0 flex items-center justify-center p-8 text-center">
                                        <div className="rounded-[24px] border border-white/10 bg-black/36 p-5 backdrop-blur-xl">
                                            <Film className="mx-auto h-8 w-8 text-cyan-100/70" />
                                            <div className="mt-3 text-sm font-semibold text-white">
                                                {isZh ? '视频预览占位' : 'Video preview placeholder'}
                                            </div>
                                            <p className="mt-2 text-xs leading-6 text-white/56">
                                                {isZh ? '后续可替换为对应模板的真实生成结果。' : 'Replace this with the final generated output for this template.'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="mt-5 rounded-[22px] border border-amber-200/14 bg-amber-200/[0.055] p-4">
                            <div className="text-sm font-semibold text-amber-50">
                                {isZh ? '为什么不提供免费试用？' : 'Why no free trial?'}
                            </div>
                            <p className="mt-2 text-sm leading-7 text-amber-50/68">
                                {isZh
                                    ? '视频生成会消耗真实算力。我们把付费前体验放在“可验证案例”上：你能看到输入、参数和结果之间的关系，再决定是否开始。'
                                    : 'Video generation consumes real compute. Before paying, you can inspect how prompt, settings, references, and output connect.'}
                            </p>
                        </div>

                        <div className="mt-5 grid gap-3">
                            <button
                                type="button"
                                onClick={openSignUp}
                                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#2f6df6] px-5 text-sm font-semibold text-white shadow-[0_18px_36px_-22px_rgba(47,109,246,0.75)] transition-colors hover:bg-[#3f7bff]"
                            >
                                <Sparkles className="h-4 w-4" />
                                {isZh ? '用这个模板开始' : 'Start from this template'}
                            </button>
                            <button
                                type="button"
                                onClick={openPricing}
                                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-white/12 bg-white/[0.055] px-5 text-sm font-medium text-white/82 transition-colors hover:bg-white/[0.1] hover:text-white"
                            >
                                <CreditCard className="h-4 w-4" />
                                {isZh ? '查看套餐与成本' : 'View plans and cost'}
                            </button>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
}

function ParamBadge({ label, value }: { label: string; value: string }) {
    return (
        <div className="relative rounded-[16px] border border-white/9 bg-black/28 px-3 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)]">
            <div className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-white/20" />
            <div className="text-[10px] uppercase tracking-[0.16em] text-white/38">{label}</div>
            <div className="mt-1 text-sm font-semibold text-white/82">{value}</div>
        </div>
    );
}

function ReferenceCard({ reference, isZh }: { reference: ShowcaseReference; isZh: boolean }) {
    const Icon = REFERENCE_ICON[reference.type];
    return (
        <div className="grid gap-3 rounded-[18px] border border-white/8 bg-black/18 p-3 md:grid-cols-[72px_minmax(0,1fr)]">
            <div className="flex h-[72px] items-center justify-center overflow-hidden rounded-[14px] border border-white/8 bg-white/[0.04]">
                {reference.thumbnail ? (
                    <img src={reference.thumbnail} alt="" className="h-full w-full object-cover" />
                ) : (
                    <Icon className="h-6 w-6 text-white/50" />
                )}
            </div>
            <div className="min-w-0">
                <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-cyan-100/70" />
                    <div className="truncate text-sm font-semibold text-white">
                        {isZh ? reference.labelZh : reference.label}
                    </div>
                </div>
                <p className="mt-2 text-sm leading-6 text-white/56">
                    {isZh ? reference.roleZh : reference.role}
                </p>
            </div>
        </div>
    );
}

function formatMode(mode: string, isZh: boolean) {
    const labels: Record<string, { zh: string; en: string }> = {
        multi_modal_video: { zh: '多参考', en: 'Multi-ref' },
        image_to_video: { zh: '图生视频', en: 'Image' },
        text_to_video: { zh: '文生视频', en: 'Text' },
        video_extension: { zh: '视频延展', en: 'Extend' },
    };

    const label = labels[mode];
    return label ? (isZh ? label.zh : label.en) : mode;
}

function getVideoAspectClass(ratio: string) {
    if (ratio === '9:16') return 'aspect-[9/16]';
    if (ratio === '1:1') return 'aspect-square';
    if (ratio === '4:3') return 'aspect-[4/3]';
    if (ratio === '3:4') return 'aspect-[3/4]';
    if (ratio === '21:9') return 'aspect-[21/9]';
    return 'aspect-video';
}
