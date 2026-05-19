'use client';

import { useState, type ReactNode } from 'react';
import HomeInteractive from './HomeInteractive';
import { useUser } from '@/hooks/use-user';

interface HomeClientWrapperProps {
    heroHeading: ReactNode;
    heroSupport: ReactNode;
    staticContent: ReactNode;
}

export default function HomeClientWrapper({ heroHeading, heroSupport, staticContent }: HomeClientWrapperProps) {
    const [showStaticContent, setShowStaticContent] = useState(true);
    const { user } = useUser();

    return (
        <div className="min-h-screen bg-background">
            <section
                id="creation-workspace"
                className="relative overflow-hidden border-b border-white/6 pb-14 pt-10 lg:min-h-screen lg:pb-20 lg:pt-20"
            >
                <div className="pointer-events-none absolute inset-0">
                    <video
                        autoPlay
                        muted
                        loop
                        playsInline
                        preload="metadata"
                        className="h-full w-full object-cover opacity-34"
                        poster="/images/gallery/custom/seedance-hero-w8ki0.png"
                    >
                        <source src="/videos/hero/seedance-hero-w8ki0.mp4" type="video/mp4" />
                    </video>
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,7,14,0.46)_0%,rgba(6,9,16,0.52)_16%,rgba(8,11,18,0.66)_44%,rgba(7,9,14,0.90)_100%)]" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_22%,rgba(92,156,255,0.22),transparent_26%),radial-gradient(circle_at_18%_18%,rgba(58,202,225,0.10),transparent_18%),radial-gradient(circle_at_82%_14%,rgba(118,92,255,0.10),transparent_20%)]" />
                </div>
                <div className="relative z-10 container px-4 md:px-6">
                    <div className="mx-auto flex max-w-6xl flex-col justify-center space-y-10 lg:min-h-[calc(100vh-11rem)] lg:space-y-14">
                        {heroHeading}
                        <HomeInteractive onShowStaticContent={setShowStaticContent} user={user} />
                        {heroSupport}
                    </div>
                </div>
            </section>

            {/* Static content appears below the quick generator. */}
            {showStaticContent && staticContent}
        </div>
    );
}
