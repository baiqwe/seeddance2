export type WorkflowNavigationItem = {
  id: string;
  slug: string;
  href: string;
  label: string;
  labelZh: string;
  description: string;
  descriptionZh: string;
};

export type WorkflowNavigationGroup = {
  id: string;
  eyebrow: string;
  eyebrowZh: string;
  title: string;
  titleZh: string;
  description: string;
  descriptionZh: string;
  items: WorkflowNavigationItem[];
};

export const workflowNavigationGroups: WorkflowNavigationGroup[] = [
  {
    id: "core",
    eyebrow: "Core workflows",
    eyebrowZh: "核心工作流",
    title: "Start from an input",
    titleZh: "从素材开始",
    description:
      "Turn a prompt, still frame, reference clip, or soundtrack cue into a controlled video task.",
    descriptionZh:
      "把 Prompt、静帧、参考视频或音频线索转成可控的视频生成任务。",
    items: [
      {
        id: "image-to-video",
        slug: "image-to-video",
        href: "/image-to-video",
        label: "Image to Video",
        labelZh: "图生视频",
        description: "Animate one keyframe while preserving subject and scene intent.",
        descriptionZh: "从一张关键帧起步，保留主体和场景意图再推进镜头。",
      },
      {
        id: "reference-video",
        slug: "ai-video-generator-with-reference-video",
        href: "/ai-video-generator-with-reference-video",
        label: "Reference Video",
        labelZh: "参考视频",
        description: "Use motion, camera, or pacing from an existing clip.",
        descriptionZh: "借用已有视频里的动作、运镜或节奏。",
      },
      {
        id: "audio-sync",
        slug: "ai-video-generator-with-audio-sync",
        href: "/ai-video-generator-with-audio-sync",
        label: "Audio Sync",
        labelZh: "音频同步",
        description: "Plan video around beat, ambience, narration, or sound effects.",
        descriptionZh: "围绕节拍、氛围、旁白或音效组织视频节奏。",
      },
    ],
  },
  {
    id: "control",
    eyebrow: "Control layer",
    eyebrowZh: "控制能力",
    title: "Keep the shot stable",
    titleZh: "稳定角色与镜头",
    description:
      "Use pages that explain consistency, motion transfer, and extension before opening the full workspace.",
    descriptionZh:
      "先理解一致性、动作迁移和视频延展，再进入完整工作台。",
    items: [
      {
        id: "motion-control",
        slug: "motion-control-ai-video-generator",
        href: "/motion-control-ai-video-generator",
        label: "Motion Control",
        labelZh: "运动控制",
        description: "Separate camera motion, subject motion, and pacing.",
        descriptionZh: "拆分运镜、主体动作和节奏控制。",
      },
      {
        id: "consistent-character",
        slug: "consistent-character-ai-video-generator",
        href: "/consistent-character-ai-video-generator",
        label: "Consistent Character",
        labelZh: "角色一致性",
        description: "Keep face, wardrobe, silhouette, and role stable.",
        descriptionZh: "保持脸、服装、轮廓和角色身份稳定。",
      },
      {
        id: "video-extension",
        slug: "video-extension",
        href: "/video-extension",
        label: "Video Extension",
        labelZh: "视频延展",
        description: "Continue a source clip without restarting the scene.",
        descriptionZh: "沿着原视频的镜头惯性继续生成。",
      },
    ],
  },
  {
    id: "commercial",
    eyebrow: "Commercial use",
    eyebrowZh: "商业场景",
    title: "Make production assets",
    titleZh: "制作可交付素材",
    description:
      "Commercial pages focus on product reveals, ecommerce testing, and faster pitch-ready shots.",
    descriptionZh:
      "商业页聚焦产品揭幕、电商测试和更快可提案的镜头。",
    items: [
      {
        id: "product-ad-video",
        slug: "product-ad-ai-video-generator",
        href: "/product-ad-ai-video-generator",
        label: "Product Ads",
        labelZh: "产品广告",
        description: "Build campaign shots from product stills and reveal references.",
        descriptionZh: "用产品图和揭幕参考做广告镜头。",
      },
      {
        id: "product-reveal",
        slug: "cinematic-product-reveal-generator",
        href: "/cinematic-product-reveal-generator",
        label: "Cinematic Reveal",
        labelZh: "电影感揭幕",
        description: "Plan luxury lighting, material sweeps, and camera push-ins.",
        descriptionZh: "规划高级灯光、材质扫光和推进镜头。",
      },
      {
        id: "fast-model",
        slug: "seedance-2-fast",
        href: "/seedance-2-fast",
        label: "Seedance 2 Fast",
        labelZh: "Seedance 2 Fast",
        description: "Use the faster model for early direction and rhythm checks.",
        descriptionZh: "用 Fast 模型快速验证方向和节奏。",
      },
    ],
  },
];

export function getLocalizedWorkflowGroups(locale: string) {
  const isZh = locale === "zh";

  return workflowNavigationGroups.map((group) => ({
    ...group,
    eyebrowLabel: isZh ? group.eyebrowZh : group.eyebrow,
    titleLabel: isZh ? group.titleZh : group.title,
    descriptionLabel: isZh ? group.descriptionZh : group.description,
    items: group.items.map((item) => ({
      ...item,
      labelText: isZh ? item.labelZh : item.label,
      descriptionText: isZh ? item.descriptionZh : item.description,
    })),
  }));
}

export function getWorkflowGroupForSlug(slug: string) {
  return workflowNavigationGroups.find((group) =>
    group.items.some((item) => item.slug === slug),
  );
}

