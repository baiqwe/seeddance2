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
};

// 1 credit = 1 generation (new users start with a small free allowance)
export const CREDITS_PER_GENERATION = 1;

// === 核心定价策略 ===

// 1. 左侧：Mini Refill (尝鲜/救急)
export const PLAN_MINI: PricingPlan = {
    id: "mini_refill",
    productId: "prod_2vuW6yAoOaQGwYdsZESIzS",
    name: "Mini Refill",
    nameZh: "尝鲜包",
    price: 6.90,
    credits: 500, // 50 generations
    type: 'one_time',
    description: "Perfect for trying out",
    descriptionZh: "适合偶尔使用",
    originalPrice: 9.90
};

// 2. 中间：Pro Plan (订阅 - 主推)
export const PLAN_PRO_MONTHLY: PricingPlan = {
    id: "pro_monthly",
    productId: "prod_4spJbgXAny4jZBeRGwyPXw",
    name: "Pro Monthly",
    nameZh: "专业月卡",
    price: 9.90,
    credits: 1000,
    type: 'subscription',
    interval: 'month',
    label: "🔥 Most Popular",
    labelZh: "🔥 最受欢迎",
    isPopular: true,
    description: "Best for creators",
    descriptionZh: "创作者首选"
};

export const PLAN_PRO_YEARLY: PricingPlan = {
    id: "pro_yearly",
    productId: "prod_6prDbAIG5hFUNcoaVz0mFx",
    name: "Pro Yearly",
    nameZh: "专业年卡",
    price: 69.90,
    credits: 12000,
    type: 'subscription',
    interval: 'year',
    label: "Best Value",
    labelZh: "最超值",
    isPopular: true,
    description: "Save 40%",
    descriptionZh: "立省 40%"
};

// 3. 右侧：Lifetime Anchor (价格锚点/一次性大包)
// 这里的策略是：价格比月付贵一倍 ($19.90 vs $9.90)，但积分只有 400 (40 generations)
// 相比之下月付 $9.90 给 1000 积分。
// 这会让用户觉得月付极其划算。
export const PLAN_ANCHOR: PricingPlan = {
    id: "lifetime_anchor",
    productId: "prod_2PrnCb6cs33HlspiB2aEF5",
    name: "Lifetime Pack",
    nameZh: "永久买断包",
    price: 19.90,
    credits: 400, // Only 40 generations!
    type: 'one_time',
    description: "Pay once, keep forever",
    descriptionZh: "一次付费，永久有效",
    // 这里故意设置一个较低的性价比来衬托 Monthly
};

export const ALL_PLANS = [PLAN_MINI, PLAN_PRO_MONTHLY, PLAN_PRO_YEARLY, PLAN_ANCHOR];

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
    };
}
