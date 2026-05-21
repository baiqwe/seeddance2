// config/credit-packs.ts

export type PricingPlan = {
    id: string;
    productId: string; // Creem Product ID
    name: string;
    nameZh: string;
    price: number;       // 美元价格
    credits: number;     // 获得的积分
    type: 'one_time' | 'subscription';
    interval?: 'month' | 'year';
    label?: string;      // 营销标签
    labelZh?: string;
    description?: string;
    descriptionZh?: string;
    isPopular?: boolean;
    originalPrice?: number; // 原价（用于展示划线价格或计算折扣）
    badge?: string;
    badgeZh?: string;
};

// Pricing anchor: one production-ready 720p Seedance shot costs about 700 provider credits.
export const CREDITS_PER_GENERATION = 700;

// === 核心定价策略 ===

// 1. Buy-out: Pitch Pack
export const PLAN_MINI: PricingPlan = {
    id: "mini_refill",
    productId: "prod_6YOc0hnaYoimusgXJkh3a2",
    name: "Pitch Pack",
    nameZh: "提案包",
    price: 99,
    credits: 3000,
    type: 'one_time',
    description: "A one-time render budget for a single commercial pitch or client-facing previs test.",
    descriptionZh: "适合单次商业提案、客户比稿或预演测试的一次性渲染额度。",
    originalPrice: 129
};

// 2. Subscription: Studio Monthly
export const PLAN_PRO_MONTHLY: PricingPlan = {
    id: "pro_monthly",
    productId: "prod_4pBVe6NzowRcuNB77DECWu",
    name: "Studio Monthly",
    nameZh: "工作室月卡",
    price: 299,
    credits: 10000,
    type: 'subscription',
    interval: 'month',
    label: "Core Studio Plan",
    labelZh: "核心工作室方案",
    isPopular: true,
    description: "Monthly render capacity for small production teams shipping repeatable previews and campaign shots.",
    descriptionZh: "面向小型制作团队的月度渲染额度，适合持续产出预演镜头和营销试片。",
    originalPrice: 399,
    badge: "~$21 / 720p shot",
    badgeZh: "约 $21 / 720p 镜头"
};

export const PLAN_PRO_YEARLY: PricingPlan = {
    id: "pro_yearly",
    productId: "prod_6Yo0APx53tCUDX0ph4RBWe",
    name: "Agency Annual",
    nameZh: "代理商年卡",
    price: 2888,
    credits: 120000,
    type: 'subscription',
    interval: 'year',
    label: "Agency Value",
    labelZh: "代理商优选",
    isPopular: true,
    description: "Annual production capacity for agencies that need predictable output and upfront budget control.",
    descriptionZh: "面向代理商和高频团队的年度产能方案，用更稳定的预算覆盖持续交付。",
    originalPrice: 3588,
    badge: "Save $700",
    badgeZh: "立省 $700"
};

// Legacy plan retained only for compatibility with older payment records.
export const PLAN_ANCHOR: PricingPlan = {
    id: "lifetime_anchor",
    productId: "prod_74hGM82264trVHdwGAP897",
    name: "Legacy Production Pack",
    nameZh: "旧版制作包",
    price: 199,
    credits: 6000,
    type: 'one_time',
    description: "Legacy one-time pack retained for compatibility with existing checkout products.",
    descriptionZh: "为兼容旧支付产品保留的单次买断包。",
    originalPrice: 249
};

export const ALL_PLANS = [PLAN_MINI, PLAN_PRO_MONTHLY, PLAN_PRO_YEARLY];

// 辅助函数：计算单次生成的成本
export function calculateCostPerGeneration(plan: PricingPlan): number {
    const generations = plan.credits / CREDITS_PER_GENERATION;
    return plan.price / generations;
}

// 获取本地化的包信息
export function getLocalizedPlan(plan: PricingPlan, locale: string) {
    return {
        ...plan,
        displayName: locale === 'zh' ? plan.nameZh : plan.name,
        displayLabel: locale === 'zh' ? plan.labelZh : plan.label,
        displayDescription: locale === 'zh' ? plan.descriptionZh : plan.description,
        displayBadge: locale === 'zh' ? plan.badgeZh : plan.badge,
    };
}
