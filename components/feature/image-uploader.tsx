"use client";

import { useCallback, useId, useState } from 'react';
import { useDropzone, type FileRejection } from 'react-dropzone';
import { useTranslations } from 'next-intl';
import { Upload } from 'lucide-react';

interface ImageUploaderProps {
    onImageSelect: (imageSrc: string, file: File) => void;
    onHeicConvert?: (file: File) => Promise<string>;
}

export default function ImageUploader({ onImageSelect, onHeicConvert }: ImageUploaderProps) {
    const t = useTranslations('uploader');
    const [error, setError] = useState<string>('');
    const maxSize = 15 * 1024 * 1024; // 15MB
    const titleId = useId();
    const helperId = useId();
    const errorId = useId();
    const fileInputId = useId();

    const getRejectionMessage = useCallback((rejections: FileRejection[]) => {
        const firstError = rejections[0]?.errors[0];

        if (!firstError) {
            return t('error_invalid');
        }

        if (firstError.code === 'file-too-large') {
            return t('error_size');
        }

        if (firstError.code === 'file-invalid-type') {
            return t('error_invalid');
        }

        return firstError.message || t('error_invalid');
    }, [t]);

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        setError('');

        if (acceptedFiles.length === 0) return;

        const file = acceptedFiles[0];

        if (file.size > maxSize) {
            setError(t('error_size'));
            return;
        }

        try {
            // Handle HEIC files
            if (file.type === 'image/heic' || file.name.toLowerCase().endsWith('.heic')) {
                if (onHeicConvert) {
                    const convertedSrc = await onHeicConvert(file);
                    onImageSelect(convertedSrc, file);
                } else {
                    setError('HEIC conversion not supported');
                }
                return;
            }

            // Handle regular image files
            if (!file.type.startsWith('image/')) {
                setError(t('error_invalid'));
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                const result = e.target?.result as string;
                onImageSelect(result, file);
            };
            reader.readAsDataURL(file);
        } catch (err) {
            setError('Failed to load image');
            console.error(err);
        }
    }, [onImageSelect, onHeicConvert, t]);

    const onDropRejected = useCallback((fileRejections: FileRejection[]) => {
        setError(getRejectionMessage(fileRejections));
    }, [getRejectionMessage]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        onDropRejected,
        accept: {
            'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.heic']
        },
        multiple: false,
        maxSize
    });

    const describedBy = error ? `${helperId} ${errorId}` : helperId;

    return (
        <div className="w-full">
            <div
                {...getRootProps({
                    'aria-labelledby': titleId,
                    'aria-describedby': describedBy,
                })}
                className={`
          relative overflow-hidden rounded-[28px] border-2 border-dashed p-12 text-center cursor-pointer
          transition-colors duration-200
          ${isDragActive
                        ? 'border-primary bg-primary/5'
                        : 'border-muted-foreground/25 bg-[linear-gradient(180deg,rgba(255,255,255,0.72),rgba(255,255,255,0.96))] hover:border-primary/50 hover:bg-muted/20'
                    }
        `}
            >
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(227,104,74,0.08),transparent_24%),radial-gradient(circle_at_100%_0%,rgba(27,163,147,0.1),transparent_20%)]" />
                <input
                    {...getInputProps({
                        id: fileInputId,
                        'aria-label': t('title'),
                        'aria-describedby': describedBy,
                        'aria-invalid': error ? true : undefined,
                    })}
                />

                <div className="relative flex flex-col items-center gap-4">
                    <div className={`
            rounded-full p-4 transition-colors
            ${isDragActive ? 'bg-primary/20' : 'bg-background/90 shadow-sm'}
          `}>
                        <Upload className={`w-8 h-8 ${isDragActive ? 'text-primary' : 'text-muted-foreground'}`} aria-hidden="true" />
                    </div>

                    <div className="space-y-2">
                        <p id={titleId} className="text-lg font-medium">
                            {isDragActive ? t('drop_zone').split(',')[0] : t('drop_zone')}
                        </p>
                        <p id={helperId} className="text-sm text-muted-foreground">
                            {t('supported_formats')}
                        </p>
                    </div>

                    <span
                        aria-hidden="true"
                        className="rounded-full bg-primary px-6 py-2 text-primary-foreground shadow-[0_18px_30px_-18px_hsl(var(--primary))] transition-colors hover:bg-primary/90"
                    >
                        {t('browse')}
                    </span>
                </div>
            </div>

            {error && (
                <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-md">
                    <p id={errorId} role="alert" className="text-sm text-destructive">{error}</p>
                </div>
            )}
        </div>
    );
}
