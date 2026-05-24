
import { createClient } from "@/utils/supabase/server";
import { getProjectId } from "@/utils/supabase/project";
import { NextResponse } from "next/server";
import { estimateGenerationCredits } from "@/utils/video-generation";
import { isCloudflareDataBackend } from "@/utils/backend/runtime";
import { requireSessionUser } from "@/utils/backend/auth";
import { getCreditsViewForUser, spendUserCredits } from "@/utils/d1/credits";
import { provisionCustomerIfMissing } from "@/utils/d1/customers";

export const runtime = "nodejs";

function jsonWithCache(body: unknown, init?: ResponseInit) {
    const response = NextResponse.json(body, init);
    response.headers.set("Cache-Control", "private, max-age=20, stale-while-revalidate=60");
    return response;
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        if (searchParams.get("estimate") === "1") {
            const resolution = (searchParams.get("resolution") || "1080p") as "480p" | "720p" | "1080p";
            const durationSeconds = Number(searchParams.get("durationSeconds") || "5") as 5 | 10 | 15;
            const mode = (searchParams.get("mode") || "multi_modal_video") as "multi_modal_video" | "image_to_video" | "text_to_video" | "video_extension";
            const audioCount = Number(searchParams.get("audioCount") || "0");
            const videoCount = Number(searchParams.get("videoCount") || "0");

            return jsonWithCache({
                estimate: estimateGenerationCredits({
                    mode,
                    resolution,
                    durationSeconds,
                    videos: Array.from({ length: videoCount }, (_, index) => ({
                        id: `video-${index + 1}`,
                        kind: "video" as const,
                        url: `placeholder://${index + 1}`,
                    })),
                    audios: Array.from({ length: audioCount }, (_, index) => ({
                        id: `audio-${index + 1}`,
                        kind: "audio" as const,
                        url: `placeholder://${index + 1}`,
                    })),
                }),
            });
        }

        if (isCloudflareDataBackend()) {
            const user = await requireSessionUser();
            if (!user) {
                return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
            }

            await provisionCustomerIfMissing({
                userId: user.id,
                email: user.email,
                name: user.name,
            });

            const credits = await getCreditsViewForUser(user.id);
            return jsonWithCache({ credits });
        }

        const supabase = await createClient();
        const projectId = await getProjectId(supabase);
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { data: customer, error: fetchError } = await supabase
            .from("customers")
            .select("id, user_id, credits, created_at, updated_at")
            .eq("project_id", projectId)
            .eq("user_id", user.id)
            .single();

        if (fetchError) {
            console.error("Error fetching customer:", fetchError);
            return NextResponse.json({ error: "Failed to fetch credits" }, { status: 500 });
        }

        // Map DB structure to Frontend interface
        const creditsData = {
            id: customer.id,
            user_id: customer.user_id,
            total_credits: customer.credits, // Assuming current balance is total for now, or maybe we don't track historical total
            remaining_credits: customer.credits,
            created_at: customer.created_at,
            updated_at: customer.updated_at
        };

        return jsonWithCache({ credits: creditsData });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        type SpendCreditsRequest = {
            amount?: number;
            operation?: string;
        };

        if (isCloudflareDataBackend()) {
            const user = await requireSessionUser();
            if (!user) {
                return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
            }

            const body = (await request.json()) as SpendCreditsRequest;
            const { amount, operation } = body;

            if (!amount || amount <= 0) {
                return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
            }

            const result = await spendUserCredits({
                userId: user.id,
                amount,
                operation: operation || "api_spend",
            });

            if (!result.ok) {
                return NextResponse.json({ error: "Insufficient credits" }, { status: 402 });
            }

            const credits = await getCreditsViewForUser(user.id);
            return NextResponse.json({ credits });
        }

        const supabase = await createClient();
        const projectId = await getProjectId(supabase);
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = (await request.json()) as SpendCreditsRequest;
        const { amount, operation } = body;

        if (!amount || amount <= 0) {
            return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
        }

        // Use the RPC for atomic update
        const { data: success, error: rpcError } = await supabase.rpc('decrease_credits', {
            p_user_id: user.id,
            p_amount: amount,
            p_description: operation || 'api_spend'
        });

        if (rpcError) {
            console.error("Error spending credits:", rpcError);
            return NextResponse.json({ error: "Transaction failed" }, { status: 500 });
        }

        if (!success) {
            return NextResponse.json({ error: "Insufficient credits" }, { status: 402 });
        }

        // Fetch updated balance to return
        const { data: customer } = await supabase
            .from("customers")
            .select("*")
            .eq("project_id", projectId)
            .eq("user_id", user.id)
            .single();

        const creditsData = {
            id: customer.id,
            user_id: customer.user_id,
            total_credits: customer.credits,
            remaining_credits: customer.credits,
            created_at: customer.created_at,
            updated_at: customer.updated_at
        };

        return NextResponse.json({ credits: creditsData });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
