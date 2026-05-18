import { requireSessionUser } from "@/utils/backend/auth";
import { isCloudflareDataBackend } from "@/utils/backend/runtime";
import { site } from "@/config/site";
import { getCustomerByUserId } from "@/utils/d1/customers";
import { createClient } from "@/utils/supabase/server";
import { getProjectId } from "@/utils/supabase/project";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type CreemPortalResponse = {
    url?: string;
    customer_portal_url?: string;
    error?: string;
};

export async function GET() {
    try {
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() || process.env.NEXT_PUBLIC_APP_URL?.trim() || site.siteUrl;
        let creemCustomerId: string | null | undefined;

        if (isCloudflareDataBackend()) {
            const user = await requireSessionUser();
            if (!user) {
                return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
            }

            const customerData = await getCustomerByUserId(user.id);
            creemCustomerId = customerData?.creem_customer_id;
        } else {
            // 1. 验证用户登录
            const supabase = await createClient();
            const projectId = await getProjectId(supabase);
            const { data: { user }, error: userError } = await supabase.auth.getUser();

            if (userError || !user) {
                return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
            }

            // 2. 获取用户的 Creem Customer ID
            const { data: customerData } = await supabase
                .from("customers")
                .select("creem_customer_id")
                .eq("project_id", projectId)
                .eq("user_id", user.id)
                .single();

            creemCustomerId = customerData?.creem_customer_id;
        }

        if (!creemCustomerId) {
            return NextResponse.json(
                { error: "No subscription found" },
                { status: 404 }
            );
        }

        // 3. 调用 Creem API 获取 Customer Portal URL
        const response = await fetch(`${process.env.CREEM_API_URL}/v1/customers/billing`, {
            method: "POST",
            headers: {
                "x-api-key": process.env.CREEM_API_KEY!,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                customer_id: creemCustomerId,
                return_url: `${siteUrl}/en/dashboard`,
            }),
        });

        const data = (await response.json()) as CreemPortalResponse;

        if (!response.ok) {
            console.error("Creem API Error:", data);
            return NextResponse.json(
                { error: "Failed to get portal URL", details: data },
                { status: 500 }
            );
        }

        return NextResponse.json({ url: data.url || data.customer_portal_url });

    } catch (error) {
        console.error("Customer portal error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
