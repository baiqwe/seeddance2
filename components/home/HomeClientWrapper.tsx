'use client';

import { useState, type ReactNode } from 'react';
import HomeInteractive from './HomeInteractive';
import { useUser } from '@/hooks/use-user';

interface HomeClientWrapperProps {
    staticContent: ReactNode;
}

export default function HomeClientWrapper({ staticContent }: HomeClientWrapperProps) {
    const [showStaticContent, setShowStaticContent] = useState(true);
    const { user } = useUser();

    return (
        <div className="min-h-screen bg-background">
            {/* Hero + Interactive Upload Section */}
            <HomeInteractive onShowStaticContent={setShowStaticContent} user={user} />

            {/* Static Content - only shown when no image is uploaded */}
            {showStaticContent && staticContent}
        </div>
    );
}
