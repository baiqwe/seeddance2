
import { createClient } from "@/utils/supabase/server";
import { getProjectId } from "@/utils/supabase/project";
import { NextResponse } from "next/server";

export const runtime = 'edge';

function jsonWithCache(body: unknown, init?: ResponseInit) {
    const response = NextResponse.json(body, init);
    response.headers.set("Cache-Control", "private, max-age=20, stale-while-revalidate=60");
    return response;
}

export async function GET(request: Request) {
    try {
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
        const supabase = await createClient();
        const projectId = await getProjectId(supabase);
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
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
