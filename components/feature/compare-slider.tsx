"use client";

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import ReactCompareImage from 'react-compare-image';
import { Loader2 } from 'lucide-react';

interface CompareSliderProps {
    beforeImage: string;
    afterImage: string;
    className?: string;
    isLoading?: boolean;
    autoSlide?: boolean; // 是否自动滑动到最终效果
    autoSlideDelay?: number; // 自动滑动延迟（ms）
}

export default function CompareSlider({ 
    beforeImage, 
    afterImage, 
    className = '',
    isLoading = false,
    autoSlide = false,
    autoSlideDelay = 500
}: CompareSliderProps) {
    const t = useTranslations('anime_editor');
    const [isAutoSliding, setIsAutoSliding] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // 自动滑动效果
    useEffect(() => {
        if (autoSlide && !isLoading && afterImage && afterImage !== beforeImage && containerRef.current) {
            setIsAutoSliding(true);
            
            // 延迟后开始滑动
            const slideTimer = setTimeout(() => {
                // 查找 react-compare-image 生成的滑块元素
                // react-compare-image 会在容器内创建一个滑块 div
                const sliderHandle = containerRef.current?.querySelector('.rcis-handle') as HTMLElement;
                const sliderContainer = containerRef.current?.querySelector('.rcis-container') as HTMLElement;
                
                if (sliderHandle && sliderContainer) {
                    const duration = 1200; // 1.2秒动画
                    const startTime = Date.now();
                    const startPosition = 50; // 从中间开始
                    const endPosition = 100; // 滑动到右侧（完全显示 After）

                    const animate = () => {
                        const elapsed = Date.now() - startTime;
                        const progress = Math.min(elapsed / duration, 1);
                        
                        // 使用 ease-out 缓动函数
                        const easeOut = 1 - Math.pow(1 - progress, 3);
                        const currentPosition = startPosition + (endPosition - startPosition) * easeOut;
                        
                        // react-compare-image 使用 left 百分比来控制滑块位置
                        // 我们需要设置滑块的 left 样式
                        sliderHandle.style.left = `${currentPosition}%`;
                        
                        // 同时需要更新容器的遮罩层位置
                        const sliderLine = containerRef.current?.querySelector('.rcis-slider-line') as HTMLElement;
                        if (sliderLine) {
                            sliderLine.style.left = `${currentPosition}%`;
                        }

                        if (progress < 1) {
                            requestAnimationFrame(animate);
                        } else {
                            // 动画完成后，等待一小段时间再隐藏指示器
                            setTimeout(() => {
                                setIsAutoSliding(false);
                            }, 1500);
                        }
                    };

                    requestAnimationFrame(animate);
                } else {
                    // 如果找不到元素，延迟重试一次
                    setTimeout(() => {
                        const retryHandle = containerRef.current?.querySelector('.rcis-handle') as HTMLElement;
                        if (retryHandle) {
                            retryHandle.style.left = '100%';
                            const retryLine = containerRef.current?.querySelector('.rcis-slider-line') as HTMLElement;
                            if (retryLine) {
                                retryLine.style.left = '100%';
                            }
                        }
                        setTimeout(() => setIsAutoSliding(false), 1500);
                    }, 200);
                }
            }, autoSlideDelay);

            return () => clearTimeout(slideTimer);
        }
    }, [autoSlide, isLoading, afterImage, beforeImage, autoSlideDelay]);

    return (
        <div className={`relative ${className}`} ref={containerRef}>
            <div className="rounded-lg overflow-hidden border border-border shadow-lg relative">
                {/* Loading Overlay */}
                {isLoading && (
                    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-center">
                        <div className="text-center space-y-4">
                            <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
                            <p className="text-sm font-medium text-muted-foreground">
                                {t('processing') || 'Processing...'}
                            </p>
                        </div>
                    </div>
                )}

                {/* Auto-sliding indicator */}
                {isAutoSliding && !isLoading && (
                    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-primary/90 text-primary-foreground px-4 py-2 rounded-full text-sm font-medium z-20 animate-pulse shadow-lg">
                        {t('preview_after') || 'After'} ✨
                    </div>
                )}

                <ReactCompareImage
                    leftImage={beforeImage}
                    rightImage={afterImage}
                    leftImageLabel={t('preview_before')}
                    rightImageLabel={t('preview_after')}
                    sliderLineColor="#ffffff"
                    sliderLineWidth={2}
                    handleSize={40}
                    hover
                />
            </div>

            {/* Labels - 只在非自动滑动时显示 */}
            {!isAutoSliding && (
                <>
                    <div className="absolute top-4 left-4 bg-background/90 backdrop-blur-sm px-3 py-1 rounded-md text-sm font-medium border border-border">
                        {t('preview_before')}
                    </div>
                    <div className="absolute top-4 right-4 bg-background/90 backdrop-blur-sm px-3 py-1 rounded-md text-sm font-medium border border-border">
                        {t('preview_after')}
                    </div>
                </>
            )}
        </div>
    );
}
