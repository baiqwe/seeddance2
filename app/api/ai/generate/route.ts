import { NextRequest, NextResponse } from "next/server";
import Replicate from "replicate";
import { createClient } from "@/utils/supabase/server";
import { createServiceRoleClient } from "@/utils/supabase/service-role";
import { getProjectId } from "@/utils/supabase/project";
import { CREDITS_PER_GENERATION } from "@/config/credit-packs";
import type { AnimeStyleId } from "@/config/landing-pages";
import { consumeRateLimit } from "@/utils/rate-limit";

export const runtime = "nodejs";
export const maxDuration = 120;

// Replicate official Nano Banana Pro image editing model.
// Verified input schema uses `prompt` + `image_input[]`.
const REPLICATE_MODEL =
    "google/nano-banana-pro:d71e2df08d6ef4c4fb6d3773e9e557de6312e04444940dbb81fd73366ed83941";
const REPLICATE_WAIT_SECONDS = 45;
const REPLICATE_POLL_INTERVAL_MS = 2500;
const REPLICATE_POLL_ATTEMPTS = 18;
const ACTIVE_GENERATION_WINDOW_MS = 10 * 60 * 1000;
const GENERATIONS_BUCKET = "generations";
const MAX_IMAGE_REQUEST_BYTES = 22 * 1024 * 1024;

type Intensity = "low" | "medium" | "high";

const STYLE_PRESETS: Record<AnimeStyleId, { prompt: string }> = {
    standard: {
        prompt:
            "high-quality modern anime portrait, polished 2D illustration, clean linework, expressive eyes, balanced flat shading, crisp facial rendering, vibrant but natural color palette",
    },
    ghibli: {
        prompt:
            "warm hand-drawn animation inspired by classic Japanese fantasy films, soft watercolor backgrounds, gentle natural lighting, painterly textures, nostalgic atmosphere, simplified facial rendering, storybook charm",
    },
    cyberpunk: {
        prompt:
            "anime portrait in a futuristic cyberpunk world, neon rim lighting, glowing accents, electric signage, high-contrast shadows, saturated magenta and cyan palette, sleek techwear mood, dramatic night-city atmosphere",
    },
    retro_90s: {
        prompt:
            "retro 1990s anime cel look, classic hand-painted cel shading, softened linework, faded pastel palette, VHS-era texture, slightly muted contrast, old-school television anime mood, nostalgic character design",
    },
    webtoon: {
        prompt:
            "clean Korean webtoon illustration, sleek manhwa aesthetics, sharp facial structure, controlled gradients, glossy hair rendering, precise contour lines, elegant modern character styling, vertical-comic polish",
    },
    cosplay: {
        prompt:
            "anime redraw of a cosplay photo, preserve costume identity, preserve signature outfit colors and accessories, polished 2D illustration finish, clean linework, expressive anime rendering, convention-poster quality",
    },
};

function buildPromptParts(opts: {
    style: AnimeStyleId;
    intensity: Intensity;
    keepEyeColor: boolean;
    keepHairColor: boolean;
    userPrompt?: string;
}) {
    const stylePreset = STYLE_PRESETS[opts.style] ?? STYLE_PRESETS.standard;
    const intensityInstruction =
        opts.intensity === "low"
            ? "Use light anime stylization. Keep the person's recognizable facial structure, hairstyle silhouette, pose, and framing close to the original photo."
            : opts.intensity === "high"
                ? "Use strong anime stylization. Push the image confidently toward the target style with more illustrated features, clearer shape design, and a more transformed 2D look while still keeping the same person recognizable."
                : "Use balanced anime stylization. Keep the same person recognizable while clearly shifting the image into the target illustrated style.";

    const keepInstructions: string[] = [];
    if (opts.keepEyeColor) keepInstructions.push("Keep the original eye color if visible in the source image.");
    if (opts.keepHairColor) keepInstructions.push("Keep the original hair color as the dominant hair color.");

    const userInstruction = opts.userPrompt?.trim()
        ? `Also incorporate this extra request if it does not conflict with the target style: ${opts.userPrompt.trim()}`
        : "";

    return {
        positive: [
            "Transform the uploaded portrait into anime-style artwork.",
            "Keep the same person and overall identity from the source image.",
            "Do not create a generic anime face. Preserve the person's distinct face shape, age impression, expression, and key facial traits.",
            `Target visual direction: ${stylePreset.prompt}.`,
            intensityInstruction,
            ...keepInstructions,
            "Avoid photorealistic skin texture, 3D rendering, generic stock-anime features, and unnecessary background distractions.",
            "Render one clean final image with no text, no watermark, and no extra people unless explicitly requested.",
            userInstruction,
        ]
            .filter(Boolean)
            .join(" "),
    };
}

function normalizeImageInput(image: string) {
    if (image.startsWith("blob:")) {
        throw new Error("Temporary browser image URLs are not supported. Please re-upload the image.");
    }

    if (image.startsWith("data:")) {
        const matches = image.match(/^data:([^;]+);base64,(.+)$/);
        if (!matches) {
            throw new Error("Invalid image data URL");
        }

        return {
            buffer: Buffer.from(matches[2], "base64"),
            mimeType: matches[1] || "image/png",
        };
    }

    if (/^https?:\/\//.test(image)) {
        return image;
    }

    return {
        buffer: Buffer.from(image, "base64"),
        mimeType: "image/png",
    };
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

function getImageExtension(contentType: string | null, imageUrl: string) {
    if (contentType === "image/png") return "png";
    if (contentType === "image/webp") return "webp";
    if (contentType === "image/jpg" || contentType === "image/jpeg") return "jpg";

    try {
        const pathname = new URL(imageUrl).pathname.toLowerCase();
        if (pathname.endsWith(".png")) return "png";
        if (pathname.endsWith(".webp")) return "webp";
        if (pathname.endsWith(".jpg") || pathname.endsWith(".jpeg")) return "jpg";
    } catch {
        // Ignore URL parsing issues and fall back to jpg.
    }

    return "jpg";
}

async function uploadGeneratedImageToStorage(opts: {
    serviceSupabase: ReturnType<typeof createServiceRoleClient>;
    projectId: string;
    userId: string;
    generationId: string;
    imageUrl: string;
}) {
    const imageResponse = await fetch(opts.imageUrl, {
        method: "GET",
        cache: "no-store",
    });

    if (!imageResponse.ok) {
        throw new Error(`Failed to fetch generated image: ${imageResponse.status}`);
    }

    const contentType = imageResponse.headers.get("content-type");
    const extension = getImageExtension(contentType, opts.imageUrl);
    const storagePath =
        `${opts.projectId}/${opts.userId}/${new Date().toISOString().slice(0, 10)}/` +
        `${opts.generationId}-${crypto.randomUUID()}.${extension}`;
    const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());

    const { error: uploadError } = await opts.serviceSupabase.storage
        .from(GENERATIONS_BUCKET)
        .upload(storagePath, imageBuffer, {
            contentType: contentType || "image/jpeg",
            cacheControl: "31536000",
            upsert: false,
        });

    if (uploadError) {
        throw new Error(uploadError.message);
    }

    const { data: publicUrlData } = opts.serviceSupabase.storage
        .from(GENERATIONS_BUCKET)
        .getPublicUrl(storagePath);

    return {
        finalImageUrl: publicUrlData.publicUrl,
        storagePath,
        contentType: contentType || "image/jpeg",
    };
}

async function fetchReplicatePrediction(predictionId: string) {
    const response = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
        method: "GET",
        headers: {
            Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
            "Content-Type": "application/json",
        },
        cache: "no-store",
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Replicate poll failed: ${response.status} - ${errorText}`);
    }

    return response.json();
}

async function waitForReplicateOutput(initialPrediction: any) {
    let prediction = initialPrediction;

    for (let attempt = 0; attempt < REPLICATE_POLL_ATTEMPTS; attempt += 1) {
        const resultImageUrl = extractReplicateOutputUrl(prediction?.output);
        if (resultImageUrl) {
            return { prediction, resultImageUrl };
        }

        if (prediction?.status === "failed" || prediction?.status === "canceled") {
            throw new Error(prediction?.error || `Replicate ${prediction?.status}`);
        }

        if (!prediction?.id) {
            break;
        }

        await new Promise((resolve) => setTimeout(resolve, REPLICATE_POLL_INTERVAL_MS));
        prediction = await fetchReplicatePrediction(prediction.id);
    }

    const finalImageUrl = extractReplicateOutputUrl(prediction?.output);
    if (finalImageUrl) {
        return { prediction, resultImageUrl: finalImageUrl };
    }

    throw new Error(
        prediction?.status === "processing"
            ? "Generation timed out while waiting for the AI provider."
            : prediction?.error || "Replicate returned no image"
    );
}

export async function POST(request: NextRequest) {
    const supabase = await createClient();
    const serviceSupabase = createServiceRoleClient();

    let creditsDeducted = false;
    let generationId: string | null = null;
    let projectId: string | null = null;
    let userId: string | null = null;
    let logContext: Record<string, unknown> = {};

    try {
        const contentLength = Number(request.headers.get("content-length") || "0");
        if (contentLength > MAX_IMAGE_REQUEST_BYTES) {
            return NextResponse.json(
                { error: "Uploaded image payload is too large.", code: "PAYLOAD_TOO_LARGE" },
                { status: 413 }
            );
        }

        projectId = await getProjectId(serviceSupabase);
        const body = await request.json();
        const image: string | undefined = body?.image;
        const style: AnimeStyleId = (body?.style as AnimeStyleId) || "standard";
        const intensity: Intensity = (body?.intensity as Intensity) || "medium";
        const keepEyeColor: boolean = body?.keepEyeColor !== false;
        const keepHairColor: boolean = body?.keepHairColor !== false;
        const prompt: string | undefined = body?.prompt;
        const stylePreset = STYLE_PRESETS[style] ?? STYLE_PRESETS.standard;
        const { positive } = buildPromptParts({
            style,
            intensity,
            keepEyeColor,
            keepHairColor,
            userPrompt: prompt,
        });

        // 1. Authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: "Please sign in to generate.", code: "UNAUTHORIZED" }, { status: 401 });
        }
        userId = user.id;

        const forwardedFor = request.headers.get("x-forwarded-for");
        const ip = forwardedFor?.split(",")[0]?.trim() || "unknown";
        const rateLimit = consumeRateLimit({
            scope: "ai-generate",
            key: `${projectId}:${user.id}:${ip}`,
            limit: 6,
            windowMs: 5 * 60 * 1000,
        });

        if (!rateLimit.allowed) {
            return NextResponse.json(
                {
                    error: "Too many generation attempts. Please wait a few minutes and try again.",
                    code: "RATE_LIMITED",
                },
                {
                    status: 429,
                    headers: {
                        "Retry-After": Math.max(Math.ceil((rateLimit.resetAt - Date.now()) / 1000), 1).toString(),
                    },
                }
            );
        }

        const { data: existingPendingGeneration, error: existingPendingError } = await serviceSupabase
            .from("generations")
            .select("id, created_at, metadata")
            .eq("project_id", projectId)
            .eq("user_id", user.id)
            .eq("status", "pending")
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();

        if (existingPendingError) {
            console.error("Failed to check existing pending generation:", existingPendingError);
            return NextResponse.json({ error: "System busy, please try again", code: "SYSTEM_ERROR" }, { status: 500 });
        }

        if (existingPendingGeneration) {
            const pendingCreatedAt = new Date(existingPendingGeneration.created_at).getTime();
            const pendingAge = Date.now() - pendingCreatedAt;
            const pendingMetadata =
                existingPendingGeneration.metadata &&
                typeof existingPendingGeneration.metadata === "object" &&
                !Array.isArray(existingPendingGeneration.metadata)
                    ? existingPendingGeneration.metadata as Record<string, unknown>
                    : {};

            if (pendingAge < ACTIVE_GENERATION_WINDOW_MS) {
                return NextResponse.json(
                    {
                        error: "A generation is already in progress. Please wait for it to finish.",
                        code: "GENERATION_IN_PROGRESS",
                    },
                    { status: 429 }
                );
            }

            let staleRefunded = false;
            let staleRefundError: string | null = null;
            if (pendingMetadata.creditsDeducted === true && pendingMetadata.refunded !== true) {
                const { error: staleRefundRpcError } = await supabase.rpc("decrease_credits", {
                    p_user_id: user.id,
                    p_amount: -CREDITS_PER_GENERATION,
                    p_description: "Refund: stale AI generation recovered",
                });

                if (staleRefundRpcError) {
                    staleRefundError = staleRefundRpcError.message;
                    console.error("Stale generation refund RPC Error:", staleRefundRpcError);
                } else {
                    staleRefunded = true;
                }
            }

            await serviceSupabase
                .from("generations")
                .update({
                    status: "failed",
                    metadata: {
                        ...pendingMetadata,
                        refunded: staleRefunded || pendingMetadata.refunded === true,
                        refundError: staleRefundError,
                        failureCode: "STALE_PENDING_RECOVERED",
                        failureMessage: "Recovered a stale pending generation before creating a new one.",
                    },
                })
                .eq("id", existingPendingGeneration.id)
                .eq("project_id", projectId);
        }

        // 2. Input Validation
        if (!image) {
            return NextResponse.json({ error: "Missing image", code: "MISSING_IMAGE" }, { status: 400 });
        }

        if (!process.env.REPLICATE_API_TOKEN) {
            console.error("REPLICATE_API_TOKEN is not set");
            return NextResponse.json({ error: "Service configuration error", code: "CONFIG_ERROR" }, { status: 500 });
        }

        logContext = {
            style,
            intensity,
            keepEyeColor,
            keepHairColor,
            model: REPLICATE_MODEL,
            stylePrompt: stylePreset.prompt,
            promptFramework: "nano-banana-style-matrix",
            provider: "replicate",
            inputImageSource: image.startsWith("http") ? "remote_url" : "user_upload",
        };

        // 3. Create pending generation log before billing and inference.
        const { data: generationRow, error: generationInsertError } = await serviceSupabase
            .from("generations")
            .insert({
                project_id: projectId,
                user_id: user.id,
                prompt: positive,
                model_id: "replicate-nano-banana-pro",
                image_url: null,
                input_image_url: image.startsWith("http") ? image : "user_upload",
                status: "pending",
                credits_cost: CREDITS_PER_GENERATION,
                metadata: {
                    ...logContext,
                    creditsDeducted: false,
                },
            })
            .select("id")
            .single();

        if (generationInsertError || !generationRow?.id) {
            if (generationInsertError?.code === "23505") {
                return NextResponse.json(
                    {
                        error: "A generation is already in progress. Please wait for it to finish.",
                        code: "GENERATION_IN_PROGRESS",
                    },
                    { status: 429 }
                );
            }
            console.error("Failed to create pending generation log:", generationInsertError);
            return NextResponse.json({ error: "Could not initialize generation", code: "GENERATION_LOG_FAILED" }, { status: 500 });
        }

        generationId = generationRow.id;

        // 4. Deduct Credits
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
            await serviceSupabase
                .from("generations")
                .update({
                    status: "failed",
                    metadata: {
                        ...logContext,
                        creditsDeducted: false,
                        failureCode: "INSUFFICIENT_CREDITS",
                    },
                })
                .eq("id", generationId)
                .eq("project_id", projectId);

            return NextResponse.json({
                error: "Insufficient credits",
                code: "INSUFFICIENT_CREDITS",
                required: CREDITS_PER_GENERATION
            }, { status: 402 });
        }

        creditsDeducted = true;
        await serviceSupabase
            .from("generations")
            .update({
                metadata: {
                    ...logContext,
                    creditsDeducted: true,
                },
            })
            .eq("id", generationId)
            .eq("project_id", projectId);

        // 5. Call Replicate img2img API
        console.log("=== Calling Replicate Nano Banana Pro ===");
        console.log("Model:", REPLICATE_MODEL);
        console.log("Style:", style);
        console.log("Prompt:", positive);

        const replicate = new Replicate({
            auth: process.env.REPLICATE_API_TOKEN,
            fileEncodingStrategy: "data-uri",
        });

        const normalizedImage = normalizeImageInput(image);
        const replicateImage =
            typeof normalizedImage === "string"
                ? normalizedImage
                : (
                    await replicate.files.create(
                        new Blob([normalizedImage.buffer], { type: normalizedImage.mimeType })
                    )
                ).urls.get;
        console.log("Replicate uploaded image:", replicateImage);

        const predictionResponse = await fetch("https://api.replicate.com/v1/predictions", {
            method: "POST",
            headers: {
                Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
                "Content-Type": "application/json",
                Prefer: `wait=${REPLICATE_WAIT_SECONDS}`,
            },
            body: JSON.stringify({
                version: REPLICATE_MODEL.split(":")[1],
                input: {
                    image_input: [replicateImage],
                    prompt: positive,
                    aspect_ratio: "match_input_image",
                    resolution: "2K",
                    output_format: "jpg",
                    safety_filter_level: "block_only_high",
                },
            }),
        });

        if (!predictionResponse.ok) {
            const predictionErrorText = await predictionResponse.text();
            console.error("Replicate prediction error:", predictionResponse.status, predictionErrorText);
            throw new Error(
                `Replicate prediction failed: ${predictionResponse.status} - ${predictionErrorText}`
            );
        }

        const initialPrediction = await predictionResponse.json();
        const { prediction, resultImageUrl } = await waitForReplicateOutput(initialPrediction);
        let finalImageUrl = resultImageUrl;
        let storageTransferStatus = "replicate_fallback";
        let storageTransferError: string | null = null;
        let storagePath: string | null = null;

        console.log("Generated image URL/data length:", resultImageUrl.substring(0, 100) + "...");

        try {
            const storageUpload = await uploadGeneratedImageToStorage({
                serviceSupabase,
                projectId,
                userId: user.id,
                generationId: generationId!,
                imageUrl: resultImageUrl,
            });
            finalImageUrl = storageUpload.finalImageUrl;
            storageTransferStatus = "uploaded";
            storagePath = storageUpload.storagePath;
        } catch (storageError: any) {
            storageTransferError = storageError?.message || "Unknown storage transfer error";
            console.error("Failed to transfer generated image to Supabase Storage:", storageError);
        }

        const { error: generationUpdateError } = await serviceSupabase
            .from("generations")
            .update({
                image_url: finalImageUrl,
                status: "succeeded",
                metadata: {
                    ...logContext,
                    creditsDeducted: true,
                    predictionId: prediction?.id || initialPrediction?.id || null,
                    predictionStatus: prediction?.status || initialPrediction?.status || "succeeded",
                    storageTransferStatus,
                    storageTransferError,
                    storagePath,
                    sourceImageUrl: resultImageUrl,
                },
            })
            .eq("id", generationId)
            .eq("project_id", projectId);

        if (generationUpdateError) {
            console.error("Failed to update generation log to succeeded:", generationUpdateError);
        }

        return NextResponse.json({ url: finalImageUrl, success: true });

    } catch (error: any) {
        console.error("Route Error:", error);

        let refunded = false;
        let refundErrorMessage: string | null = null;

        if (creditsDeducted && userId) {
            const { error: refundError } = await supabase.rpc('decrease_credits', {
                p_user_id: userId,
                p_amount: -CREDITS_PER_GENERATION,
                p_description: 'Refund: AI Generation Failed'
            });

            if (refundError) {
                refundErrorMessage = refundError.message;
                console.error("Refund RPC Error:", refundError);
            } else {
                refunded = true;
            }
        }

        if (generationId && projectId) {
            const { error: generationError } = await serviceSupabase
                .from("generations")
                .update({
                    status: "failed",
                    metadata: {
                        ...logContext,
                        creditsDeducted,
                        refunded,
                        refundError: refundErrorMessage,
                        failureCode: error?.code || "UNKNOWN_ERROR",
                        failureMessage: error?.message || "Server error",
                    },
                })
                .eq("id", generationId)
                .eq("project_id", projectId);

            if (generationError) {
                console.error("Failed to update generation log to failed:", generationError);
            }
        }

        return NextResponse.json(
            {
                error: creditsDeducted
                    ? refunded
                        ? "Generation failed. Credits refunded."
                        : "Generation failed. We could not confirm the refund automatically."
                    : error.message || "Server error",
                code: error.code || "UNKNOWN_ERROR",
                refunded,
                refundError: refundErrorMessage,
                details: error.message || "Server error",
            },
            { status: 500 }
        );
    }
}
