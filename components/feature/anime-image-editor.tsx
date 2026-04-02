"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import ImageUploader from "@/components/feature/image-uploader";
import CompareSlider from "@/components/feature/compare-slider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Download, Loader2, RefreshCw, Wand2 } from "lucide-react";
import type { AnimeStyleId } from "@/config/landing-pages";
import { useUser } from "@/hooks/use-user";

type Intensity = "low" | "medium" | "high";

type AnimeImageEditorProps = {
  locale: string;
  user?: any;
  title: string;
  subtitle?: string;
  defaultStyle: AnimeStyleId;
  hideStyleSelector?: boolean;
  compact?: boolean;
  onImageUploaded?: (uploaded: boolean, imageSrc?: string) => void;
};

const STYLE_OPTIONS: Array<{ id: AnimeStyleId; label: string; desc: string }> = [
  { id: "standard", label: "Standard Anime", desc: "Clean 2D anime portrait look." },
  { id: "ghibli", label: "Ghibli-Inspired", desc: "Warm, hand-drawn storybook feel." },
  { id: "cyberpunk", label: "Cyberpunk Anime", desc: "Neon lights, futuristic mood." },
  { id: "retro_90s", label: "90s Retro Anime", desc: "Cel shading + nostalgic palette." },
  { id: "webtoon", label: "Webtoon", desc: "Crisp lines, modern comic shading." },
  { id: "cosplay", label: "Cosplay Enhancer", desc: "Polished anime redraw for cosplay shots." },
];

function intensityToSliderValue(intensity: Intensity): number {
  switch (intensity) {
    case "low":
      return 0;
    case "medium":
      return 50;
    case "high":
      return 100;
  }
}

function sliderValueToIntensity(value: number): Intensity {
  if (value <= 20) return "low";
  if (value <= 80) return "medium";
  return "high";
}

async function convertHeic(file: File): Promise<string> {
  const heic2any = (await import("heic2any")).default;
  const convertedBlob = await heic2any({ blob: file, toType: "image/png" });
  const blob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;

  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Failed to convert HEIC image"));
    reader.readAsDataURL(blob);
  });
}

export function AnimeImageEditor({
  locale,
  user: initialUser,
  title,
  subtitle,
  defaultStyle,
  hideStyleSelector = false,
  compact = false,
  onImageUploaded,
}: AnimeImageEditorProps) {
  const t = useTranslations("anime_editor");
  const { user: hookUser } = useUser();
  const user = initialUser ?? hookUser;

  const [originalImage, setOriginalImage] = useState("");
  const [fileName, setFileName] = useState("image");

  const [style, setStyle] = useState<AnimeStyleId>(defaultStyle);
  const [intensity, setIntensity] = useState<Intensity>("medium");
  const [keepEyeColor, setKeepEyeColor] = useState(true);
  const [keepHairColor, setKeepHairColor] = useState(true);
  const [extraPrompt, setExtraPrompt] = useState("");

  const [resultImage, setResultImage] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setStyle(defaultStyle);
  }, [defaultStyle]);

  const localePrefix = useMemo(() => `/${locale}`, [locale]);
  const selectedStyle = useMemo(() => STYLE_OPTIONS.find((s) => s.id === style), [style]);

  const handleImageSelect = (imageSrc: string, file: File) => {
    setOriginalImage(imageSrc);
    setFileName(file.name.replace(/\.[^/.]+$/, "") || "image");
    setResultImage("");
    setError(null);
    onImageUploaded?.(true, imageSrc);
  };

  const handleReset = () => {
    setOriginalImage("");
    setResultImage("");
    setError(null);
    onImageUploaded?.(false, undefined);
  };

  const handleDownload = () => {
    if (!resultImage) return;
    const link = document.createElement("a");
    link.href = resultImage;
    link.download = `${fileName}_anime.png`;
    link.click();
  };

  const handleGenerate = async () => {
    if (!originalImage) return;

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: originalImage,
          style,
          intensity,
          keepEyeColor,
          keepHairColor,
          prompt: extraPrompt,
        }),
      });

      if (response.status === 401) {
        setError(t("error_signin_required"));
        return;
      }

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || t("error_failed"));
      }

      if (!data?.url) {
        throw new Error(t("error_failed"));
      }

      setResultImage(data.url);
    } catch (e: any) {
      setError(e instanceof Error ? e.message : t("error_failed"));
    } finally {
      setIsGenerating(false);
    }
  };

  if (!originalImage) {
    return (
      <div className={compact ? "w-full" : "max-w-5xl mx-auto"}>
        <div className="space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">{title}</h1>
            {subtitle ? <p className="text-muted-foreground text-lg max-w-2xl mx-auto">{subtitle}</p> : null}
          </div>
          <Card className="p-6 md:p-8">
            <ImageUploader onImageSelect={handleImageSelect} onHeicConvert={convertHeic} />
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className={compact ? "w-full" : "max-w-6xl mx-auto"}>
      <div className="grid lg:grid-cols-2 gap-6 lg:gap-10 items-start">
        <div className="space-y-6 p-6 bg-card border border-border rounded-xl lg:sticky lg:top-4">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">{t("panel_title")}</h2>
            <p className="text-sm text-muted-foreground">{t("panel_subtitle")}</p>
          </div>

          {!hideStyleSelector && (
            <div className="space-y-3">
              <Label className="text-base font-semibold">{t("style_label")}</Label>
              <RadioGroup value={style} onValueChange={(v) => setStyle(v as AnimeStyleId)}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {STYLE_OPTIONS.map((s) => (
                    <label
                      key={s.id}
                      htmlFor={`style-${s.id}`}
                      className={`flex items-start gap-3 rounded-lg border p-4 cursor-pointer transition-colors ${
                        style === s.id ? "border-primary bg-primary/5" : "border-border hover:bg-muted/30"
                      }`}
                    >
                      <RadioGroupItem value={s.id} id={`style-${s.id}`} className="mt-1" />
                      <div className="space-y-1">
                        <div className="font-semibold">{s.label}</div>
                        <div className="text-sm text-muted-foreground">{s.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </RadioGroup>
              {selectedStyle ? (
                <p className="text-xs text-muted-foreground">
                  {t("style_hint")}: <span className="font-medium text-foreground">{selectedStyle.label}</span>
                </p>
              ) : null}
            </div>
          )}

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">{t("intensity_label")}</Label>
              <span className="text-sm text-muted-foreground">{t(`intensity_${intensity}`)}</span>
            </div>
            <Slider
              value={[intensityToSliderValue(intensity)]}
              onValueChange={(v) => setIntensity(sliderValueToIntensity(v[0]))}
              min={0}
              max={100}
              step={1}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{t("intensity_low")}</span>
              <span>{t("intensity_high")}</span>
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-base font-semibold">{t("details_label")}</Label>
            <div className="grid gap-3">
              <label className="flex items-center gap-3">
                <Checkbox checked={keepEyeColor} onCheckedChange={(v) => setKeepEyeColor(!!v)} />
                <span className="text-sm">{t("keep_eye_color")}</span>
              </label>
              <label className="flex items-center gap-3">
                <Checkbox checked={keepHairColor} onCheckedChange={(v) => setKeepHairColor(!!v)} />
                <span className="text-sm">{t("keep_hair_color")}</span>
              </label>
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-base font-semibold">{t("prompt_label")}</Label>
            <textarea
              value={extraPrompt}
              onChange={(e) => setExtraPrompt(e.target.value)}
              placeholder={t("prompt_placeholder")}
              className="w-full min-h-[100px] rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          {!user ? (
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-3">
              <p className="text-sm text-foreground">{t("signin_gate_title")}</p>
              <p className="text-sm text-muted-foreground">{t("signin_gate_desc")}</p>
              <div className="flex gap-3">
                <Button asChild className="flex-1">
                  <Link href={`${localePrefix}/sign-up`}>{t("cta_signup")}</Link>
                </Button>
                <Button asChild variant="outline" className="flex-1">
                  <Link href={`${localePrefix}/sign-in`}>{t("cta_signin")}</Link>
                </Button>
              </div>
            </div>
          ) : null}

          <div className="flex gap-3 pt-2">
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !originalImage}
              className="flex-1"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t("generating")}
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4 mr-2" />
                  {t("generate")}
                </>
              )}
            </Button>
            <Button onClick={handleReset} variant="outline" size="lg">
              <RefreshCw className="w-4 h-4 mr-2" />
              {t("reset")}
            </Button>
          </div>

          <div className="flex gap-3">
            <Button onClick={handleDownload} disabled={!resultImage} variant="secondary" className="flex-1">
              <Download className="w-4 h-4 mr-2" />
              {t("download")}
            </Button>
          </div>

          {error ? (
            <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
              {error}
            </div>
          ) : null}
        </div>

        <div className="space-y-4">
          <CompareSlider
            beforeImage={originalImage}
            afterImage={resultImage || originalImage}
            isLoading={isGenerating}
            autoSlide={!!resultImage && !isGenerating}
            autoSlideDelay={250}
            className="w-full"
          />
          <div className="text-xs text-muted-foreground text-center">
            {t("disclaimer")}
          </div>
        </div>
      </div>
    </div>
  );
}
