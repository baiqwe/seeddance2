'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import { AnimeImageEditor } from '@/components/feature/anime-image-editor';
import type { AnimeStyleId } from '@/config/landing-pages';

interface HomeInteractiveProps {
    onShowStaticContent: (show: boolean) => void;
    user?: any;
}

export default function HomeInteractive({ onShowStaticContent, user }: HomeInteractiveProps) {
    return (
        <HeroWithUploadSection onShowStaticContent={onShowStaticContent} user={user} />
    );
}

function HeroWithUploadSection({
    onShowStaticContent,
    user
}: {
    onShowStaticContent: (show: boolean) => void;
    user?: any;
}) {
    const t = useTranslations('hero');
    const pathname = usePathname();
    const pathParts = pathname?.split('/') || [];
    const locale = (pathParts[1] === 'en' || pathParts[1] === 'zh') ? pathParts[1] : 'en';

    return (
        <section className="relative py-10 lg:py-16 bg-gradient-to-b from-muted/20 to-background">
            <div className="container px-4 md:px-6">
                <div className="max-w-6xl mx-auto space-y-8">
                    <div className="text-center space-y-4">
                        <div className="inline-flex items-center rounded-full px-3 py-1 text-sm bg-primary/10 text-primary">
                            {t('badge')}
                        </div>
                        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
                            {t('title')}{" "}
                            <span className="text-primary">{t('title_highlight')}</span>
                        </h1>
                        <p className="text-lg text-muted-foreground md:text-xl max-w-3xl mx-auto">
                            {t('subtitle')}
                        </p>
                        <div className="flex flex-wrap justify-center items-center gap-6 pt-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                {t('feature_1')}
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                {t('feature_2')}
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                                {t('feature_3')}
                            </div>
                        </div>
                    </div>

                    <AnimeImageEditor
                        locale={locale}
                        user={user}
                        title={t('tool_title')}
                        subtitle={t('tool_subtitle')}
                        defaultStyle={"standard" as AnimeStyleId}
                        hideStyleSelector={false}
                        onImageUploaded={(uploaded) => onShowStaticContent(!uploaded)}
                        compact={false}
                    />
                </div>
            </div>
        </section>
    );
}

// Export visibility control hook for parent component
export function useHomeInteractive() {
    const [showStaticContent, setShowStaticContent] = useState(true);
    return { showStaticContent, setShowStaticContent };
}
