'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ArrowRight, CreditCard, FileText, Paperclip, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HomeInteractiveProps {
    onShowStaticContent: (show: boolean) => void;
}

const MODE_TABS = {
    zh: [
        { key: 'multi_modal_video', label: '多参考视频', shortLabel: '多参考' },
        { key: 'image_to_video', label: '图生视频', shortLabel: '图生视频' },
        { key: 'text_to_video', label: '文生视频', shortLabel: '文生视频' },
    ],
    en: [
        { key: 'multi_modal_video', label: 'Multi-Reference Video', shortLabel: 'Multi-ref' },
        { key: 'image_to_video', label: 'Image to Video', shortLabel: 'Image' },
        { key: 'text_to_video', label: 'Text to Video', shortLabel: 'Text' },
    ],
} as const;

const MODE_COPY = {
    zh: {
        multi_modal_video: {
            eyebrow: 'Prompt 预览器',
            title: '先整理创意，再进入真实创作流程',
            placeholder: '例如：用一张产品图作为主体，参考一段慢推镜头，生成 15 秒黑色镜面桌面的广告揭幕视频...',
            helper: '首页只负责帮你把想法组织成任务草稿。创建账号并选择套餐后，再进入创作中心上传参考素材和生成视频。',
            previewTitle: '多参考视频草稿',
            previewBody: '适合需要同时控制角色、动作、镜头和节奏的项目。',
            primaryCta: '创建账号并继续',
            secondaryCta: '查看价格方案',
        },
        image_to_video: {
            eyebrow: 'Prompt 预览器',
            title: '把关键帧变成可执行的视频任务',
            placeholder: '例如：让这张人物关键帧从中景缓慢推进到近景，保持服装一致，背景是冷色霓虹夜景...',
            helper: '先写清楚画面如何动起来。进入创作中心后，再补充首帧、尾帧或参考素材。',
            previewTitle: '图生视频草稿',
            previewBody: '适合产品图、角色图、分镜图和关键帧延展。',
            primaryCta: '创建账号并继续',
            secondaryCta: '查看价格方案',
        },
        text_to_video: {
            eyebrow: 'Prompt 预览器',
            title: '先用一句话验证镜头方向',
            placeholder: '例如：一名未来城市快递员在雨夜穿过霓虹街道，镜头低角度跟拍，节奏紧张但画面干净...',
            helper: '文生视频适合先验证概念。后续如果需要角色一致性或动作复刻，再进入创作中心补参考素材。',
            previewTitle: '文生视频草稿',
            previewBody: '适合先测试主体、镜头运动、氛围和故事节奏。',
            primaryCta: '创建账号并继续',
            secondaryCta: '查看价格方案',
        },
    },
    en: {
        multi_modal_video: {
            eyebrow: 'Prompt previewer',
            title: 'Shape the idea first, then move into real production',
            placeholder: 'Example: use a product image as the subject, borrow a slow push-in reference shot, and create a 15-second black reflective tabletop reveal...',
            helper: 'The homepage organizes your idea into a task draft. Create an account and choose a plan before uploading references and generating in the creation center.',
            previewTitle: 'Multi-reference draft',
            previewBody: 'Best when identity, motion, camera, and rhythm all need separate control.',
            primaryCta: 'Create account to continue',
            secondaryCta: 'View pricing',
        },
        image_to_video: {
            eyebrow: 'Prompt previewer',
            title: 'Turn a keyframe into a production-ready video task',
            placeholder: 'Example: animate this character keyframe from medium shot to close-up, keep the wardrobe consistent, and use a cold neon night background...',
            helper: 'Describe how the still frame should move first. In the creation center, you can add the first frame, end frame, or other references.',
            previewTitle: 'Image-to-video draft',
            previewBody: 'Useful for product images, character frames, storyboard panels, and keyframe extension.',
            primaryCta: 'Create account to continue',
            secondaryCta: 'View pricing',
        },
        text_to_video: {
            eyebrow: 'Prompt previewer',
            title: 'Validate the shot direction with one clear sentence',
            placeholder: 'Example: a futuristic courier crosses a neon street in the rain, low-angle tracking shot, tense pacing, clean cinematic frame...',
            helper: 'Text-to-video is best for validating a concept. Add references later if identity consistency or motion transfer matters.',
            previewTitle: 'Text-to-video draft',
            previewBody: 'Good for testing subject, camera movement, atmosphere, and narrative rhythm.',
            primaryCta: 'Create account to continue',
            secondaryCta: 'View pricing',
        },
    },
} as const;

const DEFAULT_PROMPT = {
    zh: '一段 15 秒的电影感镜头，主体稳定，镜头缓慢推进，光线有层次，节奏清晰。',
    en: 'A 15-second cinematic shot with a stable subject, slow camera push, layered lighting, and clear pacing.',
};

export default function HomeInteractive({ onShowStaticContent }: HomeInteractiveProps) {
    const router = useRouter();
    const pathname = usePathname();
    const pathParts = pathname?.split('/') || [];
    const locale = pathParts[1] === 'zh' ? 'zh' : 'en';
    const isZh = locale === 'zh';
    const tabs = MODE_TABS[isZh ? 'zh' : 'en'];
    const copySet = MODE_COPY[isZh ? 'zh' : 'en'];
    const [activeMode, setActiveMode] = useState<(typeof tabs)[number]['key']>('multi_modal_video');
    const [prompt, setPrompt] = useState('');

    useEffect(() => {
        onShowStaticContent(true);
    }, [onShowStaticContent]);

    const activeCopy = copySet[activeMode];
    const promptDraft = prompt.trim() || DEFAULT_PROMPT[isZh ? 'zh' : 'en'];

    const creationCenterTarget = useMemo(() => {
        const params = new URLSearchParams();
        params.set('mode', activeMode);
        params.set('model', 'bytedance/seedance-2');
        params.set('ratio', '16:9');
        params.set('duration', '15s');
        params.set('resolution', '720p');
        params.set('prompt', promptDraft);
        return `/${locale}/creative-center?${params.toString()}`;
    }, [activeMode, locale, promptDraft]);

    const openSignUp = () => {
        const params = new URLSearchParams();
        params.set('next', creationCenterTarget);
        router.push(`/${locale}/sign-up?${params.toString()}`);
    };

    const openPricing = () => {
        router.push(`/${locale}/pricing`);
    };

    return (
        <div className="mx-auto w-full max-w-5xl">
            <div className="overflow-hidden rounded-[34px] border border-cyan-200/16 bg-[linear-gradient(145deg,rgba(11,24,39,0.88),rgba(7,10,18,0.76))] shadow-[0_36px_120px_-56px_rgba(0,0,0,0.9)] backdrop-blur-[28px]">
                <div className="grid gap-0 lg:grid-cols-[minmax(0,1.12fr)_360px]">
                    <div className="p-4 sm:p-5 lg:p-6">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.045] px-3 py-1.5 text-xs uppercase tracking-[0.18em] text-cyan-100/68">
                                <Sparkles className="h-3.5 w-3.5 text-cyan-200" />
                                {activeCopy.eyebrow}
                            </div>
                            <div className="inline-flex rounded-full border border-white/10 bg-black/24 p-1">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.key}
                                        type="button"
                                        onClick={() => setActiveMode(tab.key)}
                                        className={cn(
                                            'rounded-full px-3 py-1.5 text-xs font-medium transition-all sm:px-4',
                                            activeMode === tab.key
                                                ? 'bg-white text-slate-950 shadow-[0_10px_26px_-16px_rgba(255,255,255,0.9)]'
                                                : 'text-white/62 hover:bg-white/[0.08] hover:text-white'
                                        )}
                                    >
                                        <span className="hidden sm:inline">{tab.label}</span>
                                        <span className="sm:hidden">{tab.shortLabel}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="mt-5">
                            <h2 className="text-left text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                                {activeCopy.title}
                            </h2>
                            <p className="mt-3 max-w-3xl text-sm leading-7 text-white/62 sm:text-base">
                                {activeCopy.helper}
                            </p>
                        </div>

                        <div className="mt-5 rounded-[24px] border border-white/10 bg-black/24 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                            <textarea
                                value={prompt}
                                onChange={(event) => setPrompt(event.target.value)}
                                className="min-h-[132px] w-full resize-none rounded-[18px] border border-transparent bg-transparent px-3 py-3 text-base leading-8 text-white outline-none placeholder:text-white/34 focus:border-cyan-200/18 focus:bg-white/[0.025] sm:text-lg"
                                placeholder={activeCopy.placeholder}
                            />
                            <div className="mt-2 flex flex-wrap items-center justify-between gap-3 border-t border-white/8 px-2 pt-3">
                                <div className="inline-flex items-center gap-2 text-xs text-white/48">
                                    <Paperclip className="h-3.5 w-3.5" />
                                    {isZh ? '参考素材会在创作中心上传' : 'References are uploaded in the creation center'}
                                </div>
                                <div className="inline-flex items-center gap-2 rounded-full border border-amber-200/14 bg-amber-200/[0.06] px-3 py-1.5 text-xs text-amber-100/78">
                                    {isZh ? '当前不提供免登录试用' : 'No anonymous trial right now'}
                                </div>
                            </div>
                        </div>

                        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                            <button
                                type="button"
                                onClick={openSignUp}
                                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(90deg,#2563ff,#6d28d9)] px-5 text-sm font-semibold text-white shadow-[0_18px_36px_-18px_rgba(59,130,246,0.65)] transition-transform hover:scale-[1.01]"
                            >
                                <Sparkles className="h-4 w-4" />
                                {activeCopy.primaryCta}
                            </button>
                            <button
                                type="button"
                                onClick={openPricing}
                                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-white/12 bg-white/[0.055] px-5 text-sm font-medium text-white/82 transition-colors hover:bg-white/[0.1] hover:text-white"
                            >
                                <CreditCard className="h-4 w-4" />
                                {activeCopy.secondaryCta}
                            </button>
                        </div>
                    </div>

                    <aside className="border-t border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.075),rgba(255,255,255,0.025))] p-4 sm:p-5 lg:border-l lg:border-t-0 lg:p-6">
                        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200/14 bg-cyan-200/[0.06] px-3 py-1.5 text-xs text-cyan-100/72">
                            <FileText className="h-3.5 w-3.5" />
                            {isZh ? '任务草稿预览' : 'Task draft preview'}
                        </div>
                        <div className="mt-5 rounded-[22px] border border-white/10 bg-black/24 p-4">
                            <div className="text-sm font-semibold text-white">{activeCopy.previewTitle}</div>
                            <p className="mt-2 text-sm leading-7 text-white/58">{activeCopy.previewBody}</p>
                            <div className="mt-4 rounded-[16px] border border-white/8 bg-white/[0.04] p-3 text-sm leading-7 text-white/72">
                                {promptDraft}
                            </div>
                        </div>
                        <div className="mt-5 space-y-3 text-sm leading-7 text-white/58">
                            <div className="flex gap-3">
                                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-200" />
                                <span>{isZh ? '先保存你的创意方向，避免登录后重复输入。' : 'Keep the creative direction ready so you do not rewrite it after sign-up.'}</span>
                            </div>
                            <div className="flex gap-3">
                                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-300" />
                                <span>{isZh ? '创建账号后进入创作中心，再上传图片、视频或音频参考。' : 'After creating an account, open the creation center and add image, video, or audio references.'}</span>
                            </div>
                            <div className="flex gap-3">
                                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-300" />
                                <span>{isZh ? '选择套餐后再提交真实生成任务，不做误导性的假生成。' : 'Submit real generation jobs only after choosing a plan, with no fake generation step.'}</span>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={openSignUp}
                            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm font-medium text-white/82 transition-colors hover:bg-white/[0.1] hover:text-white"
                        >
                            {isZh ? '继续这个草稿' : 'Continue this draft'}
                            <ArrowRight className="h-4 w-4" />
                        </button>
                    </aside>
                </div>
            </div>
        </div>
    );
}
