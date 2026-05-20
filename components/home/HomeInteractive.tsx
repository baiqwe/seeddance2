'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ArrowRight, ChevronDown, Paperclip, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    KIE_SEEDANCE_SUPPORTED_DURATIONS,
    KIE_SEEDANCE_SUPPORTED_RATIOS,
    type VideoModelId
} from '@/utils/video-generation';

interface HomeInteractiveProps {
    onShowStaticContent: (show: boolean) => void;
}

const MODE_TABS = {
    zh: [
        { key: 'seedance-2', label: 'Seedance 2' },
        { key: 'image-to-video', label: '图生视频' },
        { key: 'text-to-video', label: '文生视频' },
    ],
    en: [
        { key: 'seedance-2', label: 'Seedance 2' },
        { key: 'image-to-video', label: 'Image to Video' },
        { key: 'text-to-video', label: 'Text to Video' },
    ],
} as const;

const RATIO_OPTIONS = KIE_SEEDANCE_SUPPORTED_RATIOS;
const DURATION_OPTIONS = KIE_SEEDANCE_SUPPORTED_DURATIONS.map((value) => `${value}s`) as readonly string[];
const VIDEO_MODELS: Array<{ value: VideoModelId; labelZh: string; labelEn: string }> = [
    { value: 'bytedance/seedance-2', labelZh: 'Seedance 2', labelEn: 'Seedance 2' },
    { value: 'bytedance/seedance-2-fast', labelZh: 'Seedance 2 Fast', labelEn: 'Seedance 2 Fast' },
];

const MODE_COPY = {
    zh: {
        'seedance-2': {
            eyebrow: 'Seedance 2 工作流',
            placeholder: '先写一句镜头描述，再决定是否补图片、视频或音频参考...',
            helper: '先把画面目标说清楚，再进入创作中心细化角色、动作和节奏。',
        },
        'image-to-video': {
            eyebrow: '图生视频',
            placeholder: '描述这张关键帧应该如何动起来，包括镜头、动作、光线和节奏...',
            helper: '适合角色一致性、产品展示和把静帧推进成连续镜头。',
        },
        'text-to-video': {
            eyebrow: '文生视频',
            placeholder: '直接描述一个 Seedance 2 视频场景，写清主体、镜头和氛围...',
            helper: '适合快速验证概念，再决定是否加入参考素材加强可控性。',
        },
    },
    en: {
        'seedance-2': {
            eyebrow: 'Seedance 2 workflow',
            placeholder: 'Start with one clear scene description, then decide whether images, clips, or audio references are needed...',
            helper: 'Describe the goal first, then move into the creation center when identity, motion, and rhythm need tighter control.',
        },
        'image-to-video': {
            eyebrow: 'Image to Video',
            placeholder: 'Describe how this keyframe should evolve with motion, framing, lighting, and timing...',
            helper: 'Great for character consistency, product reveals, and extending still frames into cinematic motion.',
        },
        'text-to-video': {
            eyebrow: 'Text to Video',
            placeholder: 'Describe a Seedance 2 scene with subject, camera movement, pacing, and atmosphere...',
            helper: 'Best for testing the concept first, then adding references only when they improve control.',
        },
    },
} as const;

export default function HomeInteractive({ onShowStaticContent }: HomeInteractiveProps) {
    return (
        <HeroWithUploadSection onShowStaticContent={onShowStaticContent} />
    );
}

function HeroWithUploadSection({
    onShowStaticContent,
}: {
    onShowStaticContent: (show: boolean) => void;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const pathParts = pathname?.split('/') || [];
    const locale = (pathParts[1] === 'en' || pathParts[1] === 'zh') ? pathParts[1] : 'en';
    const isZh = locale === 'zh';
    const [ratio, setRatio] = useState<(typeof RATIO_OPTIONS)[number]>(RATIO_OPTIONS[0] ?? '16:9');
    const [duration, setDuration] = useState<(typeof DURATION_OPTIONS)[number]>(DURATION_OPTIONS[0] ?? '15s');
    const [activeTab, setActiveTab] = useState<string>('seedance-2');
    const [videoModel, setVideoModel] = useState<VideoModelId>('bytedance/seedance-2');
    const [prompt, setPrompt] = useState('');
    const copy = MODE_COPY[isZh ? 'zh' : 'en'];

    const tabs = useMemo(() => MODE_TABS[isZh ? 'zh' : 'en'], [isZh]);
    const modeCopy = copy[activeTab as keyof typeof copy] ?? copy['seedance-2'];

    useEffect(() => {
        onShowStaticContent(true);
    }, [onShowStaticContent]);

    const buildQuery = () => {
        const params = new URLSearchParams();

        if (prompt.trim()) params.set('prompt', prompt.trim());
        params.set('model', videoModel);
        params.set('mode', activeTab);
        params.set('ratio', ratio);
        params.set('duration', duration);

        return params.toString();
    };

    const openCreationCenter = () => {
        const query = buildQuery();
        const targetPath = `/${locale}/creative-center${query ? `?${query}` : ''}`;

        router.push(targetPath);
    };

    return (
        <div className="space-y-6">
            <div className="mx-auto w-full max-w-5xl">
                <div className="mx-auto mb-5 flex w-fit flex-wrap items-center justify-center gap-2 rounded-full border border-white/12 bg-black/26 p-1.5 shadow-[0_18px_46px_-28px_rgba(0,0,0,0.82)] backdrop-blur-2xl">
                    {tabs.map((tab) => (
                        <button
                            key={tab.key}
                            type="button"
                            onClick={() => setActiveTab(tab.key)}
                            className={cn(
                                'rounded-full px-4 py-2 text-sm font-medium transition-all',
                                activeTab === tab.key
                                    ? 'bg-white text-slate-950 shadow-[0_10px_30px_-16px_rgba(255,255,255,0.9)]'
                                    : 'text-white/74 hover:bg-white/[0.08] hover:text-white'
                            )}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="overflow-hidden rounded-[34px] border border-white/14 bg-[linear-gradient(180deg,rgba(255,255,255,0.16),rgba(255,255,255,0.05))] shadow-[0_36px_120px_-56px_rgba(0,0,0,0.9)] backdrop-blur-[28px]">
                    <div className="border-b border-white/10 px-4 py-3 sm:px-5">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="flex flex-wrap items-center gap-2">
                                <div className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-white/52">
                                    {modeCopy.eyebrow}
                                </div>
                                <div className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] p-1 text-sm font-medium text-white/90">
                                    {VIDEO_MODELS.map((model) => (
                                        <button
                                            key={model.value}
                                            type="button"
                                            onClick={() => setVideoModel(model.value)}
                                            className={cn(
                                                'rounded-full px-3 py-1.5 transition-colors',
                                                videoModel === model.value
                                                    ? 'bg-white text-slate-950'
                                                    : 'text-white/74 hover:bg-white/[0.08] hover:text-white'
                                            )}
                                        >
                                            {isZh ? model.labelZh : model.labelEn}
                                        </button>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={openCreationCenter}
                                        className="ml-1 inline-flex items-center gap-1 rounded-full px-2 py-1.5 text-white/52 hover:text-white/80"
                                        aria-label={isZh ? '进入创作中心查看更多模型与参数' : 'Open the creation center for more model and parameter options'}
                                    >
                                        <ChevronDown className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 text-xs">
                                {RATIO_OPTIONS.length === 1 ? (
                                    <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-white/72">
                                        {RATIO_OPTIONS[0]}
                                    </div>
                                ) : (
                                    RATIO_OPTIONS.map((option) => (
                                        <button
                                            key={option}
                                            type="button"
                                            onClick={() => setRatio(option)}
                                            className={cn(
                                                'rounded-full border px-3 py-1 text-xs transition-colors',
                                                ratio === option
                                                    ? 'border-white/18 bg-white text-slate-950'
                                                    : 'border-white/10 bg-white/[0.04] text-white/72 hover:bg-white/[0.09]'
                                            )}
                                        >
                                            {option}
                                        </button>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="px-5 pt-5 sm:px-6">
                        <div className="mx-auto max-w-3xl text-center text-sm leading-7 text-white/62">
                            {modeCopy.helper}
                        </div>
                    </div>

                    <div className="grid items-stretch gap-0 px-3 pb-3 pt-4 sm:px-4 sm:pb-4 lg:grid-cols-[minmax(0,1fr)_auto]">
                        <div className="rounded-[24px] border border-white/10 bg-black/24 px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] sm:px-5">
                            <textarea
                                value={prompt}
                                onChange={(event) => setPrompt(event.target.value)}
                                className="min-h-[118px] w-full resize-none border-0 bg-transparent text-center text-base leading-8 text-white outline-none placeholder:text-white/34 sm:text-lg"
                                placeholder={modeCopy.placeholder}
                            />
                        </div>

                        <div className="mt-3 flex items-center justify-center gap-2 lg:mt-0 lg:pl-3">
                            <button
                                type="button"
                                onClick={openCreationCenter}
                                className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/12 bg-white/[0.08] text-white/82 transition-colors hover:bg-white/[0.14] hover:text-white"
                                aria-label={isZh ? '上传参考素材并打开创作中心' : 'Open the creation center with reference uploads'}
                            >
                                <Paperclip className="h-5 w-5" />
                            </button>
                            <button
                                type="button"
                                onClick={openCreationCenter}
                                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(90deg,#2563ff,#6d28d9)] px-5 text-sm font-semibold text-white shadow-[0_18px_36px_-18px_rgba(59,130,246,0.65)] transition-transform hover:scale-[1.01]"
                            >
                                <Sparkles className="h-4 w-4" />
                                {isZh ? '带入创作中心' : 'Open Creation Center'}
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 px-4 py-3 sm:px-5">
                        <div className="flex flex-wrap items-center gap-2">
                            <button
                                type="button"
                                onClick={openCreationCenter}
                                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-white/78 transition-colors hover:bg-white/[0.08] hover:text-white"
                            >
                                <Paperclip className="h-3.5 w-3.5" />
                                {isZh ? '图片 / 视频 / 音频参考' : 'Image / Video / Audio references'}
                            </button>
                            <button
                                type="button"
                                onClick={openCreationCenter}
                                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-white/68 transition-colors hover:bg-white/[0.08] hover:text-white"
                            >
                                <ArrowRight className="h-3.5 w-3.5" />
                                {isZh ? '进入创作中心继续细化' : 'Refine inside the creation center'}
                            </button>
                        </div>

                        <div className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-white/62">
                            <span>{isZh ? '时长' : 'Duration'}</span>
                            {DURATION_OPTIONS.length === 1 ? (
                                <span className="rounded-full bg-white px-2 py-0.5 text-slate-950">{DURATION_OPTIONS[0]}</span>
                            ) : (
                                DURATION_OPTIONS.map((option) => (
                                    <button
                                        key={option}
                                        type="button"
                                        onClick={() => setDuration(option)}
                                        className={cn(
                                            'rounded-full px-2 py-0.5 transition-colors',
                                            duration === option
                                                ? 'bg-white text-slate-950'
                                                : 'text-white/72 hover:bg-white/[0.08] hover:text-white'
                                        )}
                                    >
                                        {option}
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
