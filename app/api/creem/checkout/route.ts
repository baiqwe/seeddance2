import { requireSessionUser } from "@/utils/backend/auth";
import { isCloudflareDataBackend } from "@/utils/backend/runtime";
import { site } from "@/config/site";
import { createClient } from "@/utils/supabase/server";
import { getAppKey } from "@/utils/supabase/project";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type CreemCheckoutResponse = {
    checkout_url?: string;
    error?: string;
};

export async function POST(request: Request) {
    try {
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() || process.env.NEXT_PUBLIC_APP_URL?.trim() || site.siteUrl;
        let authUser: { id: string; email?: string | null } | null = null;

        if (isCloudflareDataBackend()) {
            authUser = await requireSessionUser();
            if (!authUser) {
                return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
            }
        } else {
            const supabase = await createClient();
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            if (userError || !user) {
                return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
            }
            authUser = { id: user.id, email: user.email };
        }

        // 2. 获取表单提交的 priceId 和产品类型
        const formData = await request.formData();
        const priceId = formData.get("priceId") as string;
        const productType = formData.get("productType") as string; // 'subscription' or 'credits'
        const credits = formData.get("credits") as string; // 如果是积分包，传入积分数量
        const redirectUrl = formData.get("redirectUrl") as string; // 可选：支付成功后的跳转地址

        if (!priceId) {
            return NextResponse.json(
                { error: "Price ID is required" },
                { status: 400 }
            );
        }

        if (!authUser.email) {
            return NextResponse.json(
                { error: "User email is required to create checkout." },
                { status: 400 }
            );
        }

        // 3. 调用 Creem API 创建 Checkout Session
        const response = await fetch(`${process.env.CREEM_API_URL}/v1/checkouts`, {
            method: "POST",
            headers: {
                "x-api-key": process.env.CREEM_API_KEY!,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                product_id: priceId,
                success_url: redirectUrl || `${siteUrl}/en/dashboard?checkout=success`,
                customer: {
                    email: authUser.email,
                },
                // 🔥 关键：将 User ID 和产品类型传入 metadata，以便 Webhook 识别
                metadata: {
                    user_id: authUser.id,
                    user_email: authUser.email,
                    product_type: productType || "subscription",
                    app_key: getAppKey(),
                    ...(credits && { credits: parseInt(credits) }),
                },
            }),
        });

        const data = (await response.json()) as CreemCheckoutResponse;

        if (!response.ok) {
            console.error("Creem API Error:", data);
            return NextResponse.json(
                { error: "Failed to create checkout session", details: data },
                { status: 500 }
            );
        }

        // 4. 返回 checkout URL
        return NextResponse.json({ checkout_url: data.checkout_url });

    } catch (error) {
        console.error("Checkout error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
