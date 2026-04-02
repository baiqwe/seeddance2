import { NextRequest, NextResponse } from "next/server";
import Replicate from "replicate";
import { createClient } from "@/utils/supabase/server";
import { getProjectId } from "@/utils/supabase/project";
import { CREDITS_PER_GENERATION } from "@/config/credit-packs";
import type { AnimeStyleId } from "@/config/landing-pages";

export const runtime = "nodejs";
export const maxDuration = 60; // 1 minute timeout

// Replicate official Stable Diffusion img2img.
// We keep the current product flow (photo -> anime redraw) and reuse the
// Animagine/Pony-style prompt matrix against an img2img-capable backend.
const REPLICATE_MODEL =
    "stability-ai/stable-diffusion-img2img:15a3689ee13b0d2616e98820eca31d4c3abcd36672df6afce5cb6feb1d66087d";

type Intensity = "low" | "medium" | "high";

const PONY_PREFIX =
    "score_9, score_8_up, score_7_up, source_anime, masterpiece, best quality, very aesthetic";
const PONY_NEGATIVE_PREFIX =
    "score_6, score_5, score_4, worst quality, low quality, 3d, realistic, photorealistic, lowres";

const STYLE_PRESETS: Record<AnimeStyleId, { prompt: string; negative: string; denoising: number }> = {
    standard: {
        prompt:
            "anime artwork, 2d illustration, flat shading, high contrast, vibrant colors, clean lines, stunning visual, highly detailed face, official anime art",
        negative: "blurry, muddy colors, bad anatomy",
        denoising: 0.58,
    },
    ghibli: {
        prompt:
            "studio ghibli style, traditional animation, watercolor background, lush nature, soft lighting, spirited away style, flat colors, nostalgic vibe",
        negative: "cyberpunk, dark, neon, 3d render, modern digital art, sharp edges",
        denoising: 0.63,
    },
    cyberpunk: {
        prompt:
            "cyberpunk style, cyberpunk edgerunners, neon lights, glowing accents, night city, high tech, dramatic lighting, dark background, vivid colors",
        negative: "daytime, soft lighting, nature, watercolor, pale colors",
        denoising: 0.65,
    },
    retro_90s: {
        prompt:
            "1990s style, retro anime, vintage anime, classic anime, cel shading, vhs artifacts, soft pastel colors, old anime style, nostalgic",
        negative: "modern anime, high resolution, ultra sharp, glossy skin, 3d",
        denoising: 0.55,
    },
    webtoon: {
        prompt:
            "korean webtoon style, manhwa style, solo leveling style, sharp features, aesthetic, detailed eyes, glossy hair, modern web comic",
        negative: "chibi, cute, 90s style, thick lines",
        denoising: 0.52,
    },
    cosplay: {
        prompt:
            "anime redraw of a cosplay photo, preserve outfit identity and key colors, polished 2d illustration look, clean linework, official anime art, vibrant colors",
        negative: "photorealistic costume texture, messy linework, muddy colors, blurry",
        denoising: 0.56,
    },
};

function clamp(value: number, min: number, max: number) {
    return Math.min(max, Math.max(min, value));
}

function resolvePromptStrength(base: number, intensity: Intensity) {
    if (intensity === "low") return clamp(base - 0.08, 0.35, 0.8);
    if (intensity === "high") return clamp(base + 0.08, 0.35, 0.8);
    return clamp(base, 0.35, 0.8);
}

function buildPromptParts(opts: {
    style: AnimeStyleId;
    intensity: Intensity;
    keepEyeColor: boolean;
    keepHairColor: boolean;
    userPrompt?: string;
}) {
    const stylePreset = STYLE_PRESETS[opts.style] ?? STYLE_PRESETS.standard;
    const intensityTags =
        opts.intensity === "low"
            ? "subtle stylization, preserve original facial structure, preserve original proportions"
            : opts.intensity === "high"
                ? "strong anime stylization, expressive 2d redraw, bold lineart, stylized features while keeping identity recognizable"
                : "balanced stylization, recognizable identity, clean anime redraw";

    const keepTags: string[] = [];
    if (opts.keepEyeColor) keepTags.push("preserve eye color");
    if (opts.keepHairColor) keepTags.push("preserve hair color");

    const userTags = opts.userPrompt?.trim() ? opts.userPrompt.trim() : "";

    return {
        positive: [
            PONY_PREFIX,
            stylePreset.prompt,
            intensityTags,
            keepTags.join(", "),
            userTags,
        ]
            .filter(Boolean)
            .join(", "),
        negative: [
            PONY_NEGATIVE_PREFIX,
            stylePreset.negative,
            "text, watermark, logo, caption, signature, jpeg artifacts, extra fingers, extra digits, bad hands, bad anatomy, blurry",
        ]
            .filter(Boolean)
            .join(", "),
        promptStrength: resolvePromptStrength(stylePreset.denoising, opts.intensity),
    };
}

function normalizeImageInput(image: string) {
    if (image.startsWith("data:")) {
        return image;
    }

    if (/^https?:\/\//.test(image)) {
        return image;
    }

    return `data:image/png;base64,${image}`;
}

function extractReplicateOutputUrl(output: unknown) {
    if (typeof output === "string") {
        return output;
    }

    if (Array.isArray(output) && output.length > 0) {
        const first = output[0];
        if (typeof first === "string") {
            return first;
        }
        if (first && typeof first === "object" && typeof (first as { url?: () => URL }).url === "function") {
            return (first as { url: () => URL }).url().toString();
        }
        if (first && typeof first === "object" && typeof (first as { toString?: () => string }).toString === "function") {
            return (first as { toString: () => string }).toString();
        }
    }

    if (output && typeof output === "object" && typeof (output as { url?: () => URL }).url === "function") {
        return (output as { url: () => URL }).url().toString();
    }

    return null;
}

export async function POST(request: NextRequest) {
    const supabase = await createClient();
    const projectId = await getProjectId(supabase);

    try {
        const body = await request.json();
        const image: string | undefined = body?.image;
        const style: AnimeStyleId = (body?.style as AnimeStyleId) || "standard";
        const intensity: Intensity = (body?.intensity as Intensity) || "medium";
        const keepEyeColor: boolean = body?.keepEyeColor !== false;
        const keepHairColor: boolean = body?.keepHairColor !== false;
        const prompt: string | undefined = body?.prompt;
        const stylePreset = STYLE_PRESETS[style] ?? STYLE_PRESETS.standard;

        // 1. Authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: "Please sign in to generate.", code: "UNAUTHORIZED" }, { status: 401 });
        }

        // 2. Input Validation
        if (!image) {
            return NextResponse.json({ error: "Missing image", code: "MISSING_IMAGE" }, { status: 400 });
        }

        if (!process.env.REPLICATE_API_TOKEN) {
            console.error("REPLICATE_API_TOKEN is not set");
            return NextResponse.json({ error: "Service configuration error", code: "CONFIG_ERROR" }, { status: 500 });
        }

        // 3. Deduct Credits
        const { data: deductSuccess, error: rpcError } = await supabase.rpc('decrease_credits', {
            p_user_id: user.id,
            p_amount: CREDITS_PER_GENERATION,
            p_description: `AI Generation (${style})`
        });

        if (rpcError) {
            console.error("RPC Error:", rpcError);
            return NextResponse.json({ error: "System busy, please try again", code: "SYSTEM_ERROR" }, { status: 500 });
        }

        if (!deductSuccess) {
            return NextResponse.json({
                error: "Insufficient credits",
                code: "INSUFFICIENT_CREDITS",
                required: CREDITS_PER_GENERATION
            }, { status: 402 });
        }

        // 4. Call Replicate img2img API
        try {
            const { positive, negative, promptStrength } = buildPromptParts({
                style,
                intensity,
                keepEyeColor,
                keepHairColor,
                userPrompt: prompt,
            });

            console.log("=== Calling Replicate img2img ===");
            console.log("Model:", REPLICATE_MODEL);
            console.log("Style:", style);
            console.log("Prompt:", positive);
            console.log("Negative:", negative);
            console.log("Prompt strength:", promptStrength);

            const replicate = new Replicate({
                auth: process.env.REPLICATE_API_TOKEN,
                fileEncodingStrategy: "data-uri",
            });

            const output = await replicate.run(REPLICATE_MODEL, {
                input: {
                    image: normalizeImageInput(image),
                    prompt: positive,
                    negative_prompt: negative,
                    prompt_strength: promptStrength,
                    num_outputs: 1,
                    num_inference_steps: 30,
                    guidance_scale: 6,
                    scheduler: "K_EULER_ANCESTRAL",
                },
                wait: { mode: "poll", interval: 1000 },
            });

            const resultImageUrl = extractReplicateOutputUrl(output);

            if (!resultImageUrl) {
                console.error("Failed to extract image from Replicate output:", output);
                throw new Error("Replicate returned no image");
            }

            console.log("Generated image URL/data length:", resultImageUrl.substring(0, 100) + "...");

            // 5. Log Generation
            await supabase.from("generations").insert({
                project_id: projectId,
                user_id: user.id,
                prompt: positive,
                model_id: "replicate-stable-diffusion-img2img",
                image_url: resultImageUrl,
                input_image_url: image.startsWith("http") ? image : "user_upload",
                status: "succeeded",
                credits_cost: CREDITS_PER_GENERATION,
                metadata: {
                    style,
                    intensity,
                    keepEyeColor,
                    keepHairColor,
                    model: REPLICATE_MODEL,
                    stylePrompt: stylePreset.prompt,
                    styleNegativePrompt: negative,
                    denoisingStrength: promptStrength,
                    promptFramework: "pony-style-preset-matrix",
                    provider: "replicate",
                }
            });

            return NextResponse.json({ url: resultImageUrl, success: true });

        } catch (aiError: any) {
            console.error("AI Service Error:", aiError);
            console.error("AI Error Details:", JSON.stringify({
                message: aiError?.message,
                status: aiError?.status,
                response: aiError?.response,
                name: aiError?.name
            }, null, 2));

            // Refund credits on failure
            await supabase.rpc('decrease_credits', {
                p_user_id: user.id,
                p_amount: -CREDITS_PER_GENERATION,
                p_description: 'Refund: AI Generation Failed'
            });

            return NextResponse.json({
                error: "Generation failed. Credits refunded.",
                code: "AI_FAILED",
                refunded: true,
                details: aiError?.message || "Unknown error"
            }, { status: 500 });
        }

    } catch (error: any) {
        console.error("Route Error:", error);
        return NextResponse.json(
            { error: error.message || "Server error", code: "UNKNOWN_ERROR" },
            { status: 500 }
        );
    }
}
