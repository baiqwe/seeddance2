import { ProductTier } from "@/types/subscriptions";

export const SUBSCRIPTION_TIERS: ProductTier[] = [
  {
    name: "Starter",
    id: "tier-hobby",
    productId: "prod_63JTQmsUcQrlZe94IL76fI", // $11 monthly subscription
    priceMonthly: "$11",
    description: "Perfect for creators testing short Seedance 2 video workflows.",
    features: [
      "Starter monthly credit pool",
      "Prompt-to-video experiments",
      "Image-to-video tests",
      "Standard render speed",
      "Personal project history",
      "Basic support",
    ],
    featured: false,
    discountCode: "", // Optional discount code
  },
  {
    name: "Business",
    id: "tier-pro",
    productId: "prod_6rOJtTwlyjsH9AVuSzh8aR", // $29 monthly subscription (测试产品)
    priceMonthly: "$29",
    description: "Ideal for creators and teams producing videos every week.",
    features: [
      "Everything in Starter",
      "More monthly credits",
      "Priority support",
      "Higher-resolution video output",
      "Workflow presets",
      "No-watermark exports",
      "Commercial-friendly usage",
    ],
    featured: true,
    discountCode: "", // Optional discount code - 临时移除
  },
  {
    name: "Enterprise",
    id: "tier-enterprise",
    productId: "prod_3qPYksZMtk94wQsdkgajrJ", // $99 monthly subscription
    priceMonthly: "$99",
    description: "For teams with larger campaigns, repeatable production, and support needs.",
    features: [
      "Everything in Business",
      "Dedicated account manager",
      "Custom workflow support",
      "Higher-volume video budget",
      "Team review guidance",
      "Priority issue handling",
    ],
    featured: false,
    discountCode: "", // Optional discount code
  },
];

export const CREDITS_TIERS: ProductTier[] = [
  {
    name: "Basic Package",
    id: "tier-3-credits",
    productId: "prod_MqcjVo0Bpx0rbYmHVlrh2", // $9 one-time purchase
    priceMonthly: "$9",
    description: "A small credit pack for testing your first Seedance 2 prompts.",
    creditAmount: 3,
    features: [
      "3 credits for video experiments",
      "No expiration date",
      "Access to standard video workflows",
      "Community support"
    ],
    featured: false,
    discountCode: "", // Optional discount code
  },
  {
    name: "Standard Package",
    id: "tier-6-credits",
    productId: "prod_4ICkTovEC6o9QY6UuL3aI0", // $13 one-time purchase
    priceMonthly: "$13",
    description: "A flexible credit pack for a few campaign or storyboard tests.",
    creditAmount: 6,
    features: [
      "6 credits for video experiments",
      "No expiration date",
      "Priority processing",
      "Basic email support"
    ],
    featured: true,
    discountCode: "", // Optional discount code
  },
  {
    name: "Premium Package",
    id: "tier-9-credits",
    productId: "prod_3b3oyQtIJA3eaMIHLNjyCc", // $29 one-time purchase
    priceMonthly: "$29",
    description: "A larger credit pack for more serious video exploration.",
    creditAmount: 9,
    features: [
      "9 credits for video experiments",
      "No expiration date",
      "Premium support",
      "Advanced analytics access"
    ],
    featured: false,
    discountCode: "", // Optional discount code
  },
];
