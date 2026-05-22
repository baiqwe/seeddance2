import type { LandingPageSlug } from "@/config/landing-pages";
import { mediaAsset } from "@/config/media";
import { showcaseTemplates } from "@/config/showcase-templates";

export type GalleryItem = {
  id: string;
  useCase: LandingPageSlug;
  slug: string;
  category: string;
  title: string;
  titleZh: string;
  description: string;
  descriptionZh: string;
  alt: string;
  altZh: string;
  afterImage: string;
  beforeThumb: string;
  videoUrl: string;
  durationLabel: string;
  aspectRatioLabel: string;
  promptLabel: string;
  resolutionLabel?: string;
  uploadDate?: string;
};

const SHARED_AFTER = mediaAsset("/images/gallery/hero-after.png");
const SHARED_BEFORE = mediaAsset("/images/gallery/hero-before.png");

const showcaseUseCaseById: Record<string, LandingPageSlug> = {
  "product-reveal": "product-ad-generator",
  "character-consistency": "image-to-video",
  "motion-transfer": "dance-motion-transfer",
  "storyboard-previs": "storyboard-to-video",
  "text-concept": "ai-short-drama-maker",
};

const showcaseCategoryById: Record<string, string> = {
  "product-reveal": "Commercial",
  "character-consistency": "Identity",
  "motion-transfer": "Motion",
  "storyboard-previs": "Previs",
  "text-concept": "Concept",
};

const showcaseGalleryItems: GalleryItem[] = showcaseTemplates.map(
  (template, index) => {
    const useCase =
      showcaseUseCaseById[template.id] ?? "reference-video-generator";

    return {
      id: `showcase-${template.id}`,
      useCase,
      slug: useCase,
      category: showcaseCategoryById[template.id] ?? "Workflow",
      title: template.title,
      titleZh: template.titleZh,
      description: template.subtitle,
      descriptionZh: template.subtitleZh,
      alt: `${template.title} Seedance 2 preview template result.`,
      altZh: `${template.titleZh} Seedance 2 预览模板结果。`,
      afterImage: template.poster,
      beforeThumb: template.references[0]?.thumbnail ?? SHARED_BEFORE,
      videoUrl: template.outputVideo ?? "",
      durationLabel: template.duration,
      aspectRatioLabel: template.ratio,
      promptLabel:
        template.references.length > 0 ? "Prompt + refs" : "Prompt only",
      resolutionLabel: template.resolution,
      uploadDate: `2026-05-${String(9 + index).padStart(2, "0")}T10:00:00+08:00`,
    };
  },
);

const showcaseVideoUrls = new Set(
  showcaseGalleryItems.map((item) => item.videoUrl).filter(Boolean),
);

const kieSeedanceSamples: GalleryItem[] = [
  {
    id: "kie-seedance-01",
    useCase: "reference-video-generator",
    slug: "reference-video-generator",
    category: "Character",
    title: "Silver-haired character close-up",
    titleZh: "银发角色特写",
    description:
      "A tight character shot for testing Seedance 2 identity, lighting, and facial-detail continuity.",
    descriptionZh:
      "用于观察 Seedance 2 在角色身份、光影和面部细节连续性上的表现。",
    alt: "Kie Seedance 2 sample showing a silver-haired character close-up.",
    altZh: "Kie Seedance 2 银发角色特写视频样例。",
    afterImage: mediaAsset("/images/gallery/kie/kie-seedance-01.jpg"),
    beforeThumb: SHARED_BEFORE,
    videoUrl: mediaAsset("/videos/gallery/kie/kie-seedance-01.mp4"),
    durationLabel: "14s",
    aspectRatioLabel: "16:9",
    promptLabel: "Kie sample",
  },
  {
    id: "kie-seedance-02",
    useCase: "dance-motion-transfer",
    slug: "dance-motion-transfer",
    category: "Motion",
    title: "Action replication workflow",
    titleZh: "动作复刻工作流",
    description:
      "A reference-led sample that shows how motion, pose, and character intent can be separated during generation.",
    descriptionZh: "展示如何把动作、姿态和角色意图拆开控制的参考驱动样例。",
    alt: "Kie Seedance 2 sample showing an action replication workflow.",
    altZh: "Kie Seedance 2 动作复刻工作流视频样例。",
    afterImage: mediaAsset("/images/gallery/kie/kie-seedance-02.jpg"),
    beforeThumb: SHARED_BEFORE,
    videoUrl: mediaAsset("/videos/gallery/kie/kie-seedance-02.mp4"),
    durationLabel: "14s",
    aspectRatioLabel: "16:9",
    promptLabel: "Motion ref",
  },
  {
    id: "kie-seedance-03",
    useCase: "dance-motion-transfer",
    slug: "dance-motion-transfer",
    category: "Action",
    title: "Studio fight motion reference",
    titleZh: "棚拍动作参考",
    description:
      "A fast movement clip for evaluating timing, body mechanics, and action continuity.",
    descriptionZh: "适合观察节奏、肢体运动和动作连续性的快速动作样例。",
    alt: "Kie Seedance 2 sample showing a studio fight motion reference.",
    altZh: "Kie Seedance 2 棚拍动作参考视频样例。",
    afterImage: mediaAsset("/images/gallery/kie/kie-seedance-03.jpg"),
    beforeThumb: SHARED_BEFORE,
    videoUrl: mediaAsset("/videos/gallery/kie/kie-seedance-03.mp4"),
    durationLabel: "11s",
    aspectRatioLabel: "16:9",
    promptLabel: "Action ref",
  },
  {
    id: "kie-seedance-04",
    useCase: "storyboard-to-video",
    slug: "storyboard-to-video",
    category: "Sci-fi",
    title: "Sci-fi visor close-up",
    titleZh: "科幻目镜特写",
    description:
      "A cinematic close-up for testing Seedance 2 mood, reflective surfaces, and micro camera movement.",
    descriptionZh:
      "用于测试 Seedance 2 在氛围、反光材质和细微镜头运动上的表现。",
    alt: "Kie Seedance 2 sample showing a sci-fi visor close-up.",
    altZh: "Kie Seedance 2 科幻目镜特写视频样例。",
    afterImage: mediaAsset("/images/gallery/kie/kie-seedance-04.jpg"),
    beforeThumb: SHARED_AFTER,
    videoUrl: mediaAsset("/videos/gallery/kie/kie-seedance-04.mp4"),
    durationLabel: "15s",
    aspectRatioLabel: "16:9",
    promptLabel: "Cinematic",
  },
  {
    id: "kie-seedance-05",
    useCase: "image-to-video",
    slug: "image-to-video",
    category: "Anime",
    title: "Anime portrait motion",
    titleZh: "动漫角色动态特写",
    description:
      "A stylized portrait example for turning a strong still-frame look into a moving Seedance 2 clip.",
    descriptionZh: "适合展示如何把强风格静帧角色推进成动态视频的动漫样例。",
    alt: "Kie Seedance 2 sample showing anime portrait motion.",
    altZh: "Kie Seedance 2 动漫角色动态特写视频样例。",
    afterImage: mediaAsset("/images/gallery/kie/kie-seedance-05.jpg"),
    beforeThumb: SHARED_BEFORE,
    videoUrl: mediaAsset("/videos/gallery/kie/kie-seedance-05.mp4"),
    durationLabel: "15s",
    aspectRatioLabel: "16:9",
    promptLabel: "Image seed",
  },
  {
    id: "kie-seedance-06",
    useCase: "video-extension",
    slug: "video-extension",
    category: "Cinematic",
    title: "Neon city drive",
    titleZh: "霓虹城市车窗镜头",
    description:
      "A moody city shot that works well for extending atmosphere, lighting, and camera direction.",
    descriptionZh: "适合观察氛围、灯光和镜头方向延展能力的城市夜景样例。",
    alt: "Kie Seedance 2 sample showing a neon city drive.",
    altZh: "Kie Seedance 2 霓虹城市车窗镜头视频样例。",
    afterImage: mediaAsset("/images/gallery/kie/kie-seedance-06.jpg"),
    beforeThumb: SHARED_BEFORE,
    videoUrl: mediaAsset("/videos/gallery/kie/kie-seedance-06.mp4"),
    durationLabel: "15s",
    aspectRatioLabel: "16:9",
    promptLabel: "Scene extend",
  },
  {
    id: "kie-seedance-07",
    useCase: "ai-short-drama-maker",
    slug: "ai-short-drama-maker",
    category: "Action",
    title: "Autumn battle chase",
    titleZh: "秋林追逐战斗",
    description:
      "A full action sample for judging blocking, camera travel, and scene momentum.",
    descriptionZh: "适合判断走位、运镜和场景动势的完整动作样例。",
    alt: "Kie Seedance 2 sample showing an autumn battle chase.",
    altZh: "Kie Seedance 2 秋林追逐战斗视频样例。",
    afterImage: mediaAsset("/images/gallery/kie/kie-seedance-07.jpg"),
    beforeThumb: SHARED_BEFORE,
    videoUrl: mediaAsset("/videos/gallery/kie/kie-seedance-07.mp4"),
    durationLabel: "13s",
    aspectRatioLabel: "16:9",
    promptLabel: "Action clip",
  },
  {
    id: "kie-seedance-08",
    useCase: "storyboard-to-video",
    slug: "storyboard-to-video",
    category: "Sci-fi",
    title: "Reflective visor alternate",
    titleZh: "反光目镜变化镜头",
    description:
      "A second sci-fi close-up that is useful for comparing shot consistency and visual texture.",
    descriptionZh: "另一条科幻特写样例，适合对比镜头一致性和画面材质。",
    alt: "Kie Seedance 2 sample showing an alternate reflective visor close-up.",
    altZh: "Kie Seedance 2 反光目镜变化镜头视频样例。",
    afterImage: mediaAsset("/images/gallery/kie/kie-seedance-08.jpg"),
    beforeThumb: SHARED_AFTER,
    videoUrl: mediaAsset("/videos/gallery/kie/kie-seedance-08.mp4"),
    durationLabel: "15s",
    aspectRatioLabel: "16:9",
    promptLabel: "Cinematic",
  },
  {
    id: "kie-seedance-09",
    useCase: "product-ad-generator",
    slug: "product-ad-generator",
    category: "Lifestyle",
    title: "Balcony fabric reveal",
    titleZh: "阳台布料生活镜头",
    description:
      "A soft lifestyle shot for exploring natural light, fabric movement, and product-ad pacing.",
    descriptionZh: "适合探索自然光、布料运动和生活方式广告节奏的柔和样例。",
    alt: "Kie Seedance 2 sample showing a balcony fabric reveal.",
    altZh: "Kie Seedance 2 阳台布料生活镜头视频样例。",
    afterImage: mediaAsset("/images/gallery/kie/kie-seedance-09.jpg"),
    beforeThumb: SHARED_BEFORE,
    videoUrl: mediaAsset("/videos/gallery/kie/kie-seedance-09.mp4"),
    durationLabel: "08s",
    aspectRatioLabel: "16:9",
    promptLabel: "Product mood",
  },
  {
    id: "kie-seedance-10",
    useCase: "storyboard-to-video",
    slug: "storyboard-to-video",
    category: "Storyboard",
    title: "Ink fashion storyboard",
    titleZh: "水墨时装分镜",
    description:
      "A stylized storyboard example for converting illustration language into video direction.",
    descriptionZh: "用于展示如何把插画语言转换成视频镜头方向的风格化分镜样例。",
    alt: "Kie Seedance 2 sample showing an ink fashion storyboard.",
    altZh: "Kie Seedance 2 水墨时装分镜视频样例。",
    afterImage: mediaAsset("/images/gallery/kie/kie-seedance-10.jpg"),
    beforeThumb: SHARED_BEFORE,
    videoUrl: mediaAsset("/videos/gallery/kie/kie-seedance-10.mp4"),
    durationLabel: "10s",
    aspectRatioLabel: "16:9",
    promptLabel: "Storyboard",
  },
  {
    id: "kie-seedance-11",
    useCase: "dance-motion-transfer",
    slug: "dance-motion-transfer",
    category: "Motion",
    title: "Fencing motion transfer",
    titleZh: "击剑动作迁移",
    description:
      "A controlled motion-transfer sample for testing opposing movement, timing, and clear silhouettes.",
    descriptionZh: "用于测试对抗动作、时机和清晰轮廓的受控动作迁移样例。",
    alt: "Kie Seedance 2 sample showing fencing motion transfer.",
    altZh: "Kie Seedance 2 击剑动作迁移视频样例。",
    afterImage: mediaAsset("/images/gallery/kie/kie-seedance-11.jpg"),
    beforeThumb: SHARED_BEFORE,
    videoUrl: mediaAsset("/videos/gallery/kie/kie-seedance-11.mp4"),
    durationLabel: "14s",
    aspectRatioLabel: "16:9",
    promptLabel: "Motion ref",
  },
  {
    id: "kie-seedance-12",
    useCase: "dance-motion-transfer",
    slug: "dance-motion-transfer",
    category: "Motion",
    title: "Fencing timing variation",
    titleZh: "击剑节奏变化",
    description:
      "A timing variation that helps compare how reference motion behaves across similar action setups.",
    descriptionZh: "用于对比相似动作场景下参考动作和节奏变化的样例。",
    alt: "Kie Seedance 2 sample showing a fencing timing variation.",
    altZh: "Kie Seedance 2 击剑节奏变化视频样例。",
    afterImage: mediaAsset("/images/gallery/kie/kie-seedance-12.jpg"),
    beforeThumb: SHARED_BEFORE,
    videoUrl: mediaAsset("/videos/gallery/kie/kie-seedance-12.mp4"),
    durationLabel: "14s",
    aspectRatioLabel: "16:9",
    promptLabel: "Motion ref",
  },
  {
    id: "kie-seedance-13",
    useCase: "ai-short-drama-maker",
    slug: "ai-short-drama-maker",
    category: "Drama",
    title: "Cinematic eye close-up",
    titleZh: "电影感眼部特写",
    description:
      "A dramatic close-up for evaluating mood, focus shifts, and story tension in short-form clips.",
    descriptionZh: "适合观察情绪、焦点变化和短片叙事张力的电影感特写样例。",
    alt: "Kie Seedance 2 sample showing a cinematic eye close-up.",
    altZh: "Kie Seedance 2 电影感眼部特写视频样例。",
    afterImage: mediaAsset("/images/gallery/kie/kie-seedance-13.jpg"),
    beforeThumb: SHARED_AFTER,
    videoUrl: mediaAsset("/videos/gallery/kie/kie-seedance-13.mp4"),
    durationLabel: "15s",
    aspectRatioLabel: "16:9",
    promptLabel: "Drama clip",
  },
];

export const galleryItems: GalleryItem[] = [
  ...showcaseGalleryItems,
  {
    id: "seedance-autumn-duel",
    useCase: "storyboard-to-video",
    slug: "storyboard-to-video",
    category: "Action",
    title: "Autumn duel sequence",
    titleZh: "秋林决斗完整片段",
    description:
      "A complete cinematic action sample with stronger blocking, camera travel, and character momentum.",
    descriptionZh:
      "一条完整的动作型样片，镜头调度、走位关系和人物动势都更完整。",
    alt: "Seedance 2 full action video showing a duel in an autumn forest.",
    altZh: "用于展示 Seedance 2 秋林决斗镜头的完整动作视频案例。",
    afterImage: mediaAsset("/images/gallery/custom/seedance-autumn-duel.png"),
    beforeThumb: SHARED_BEFORE,
    videoUrl: mediaAsset("/videos/gallery/seedance-autumn-duel.mp4"),
    durationLabel: "13s",
    aspectRatioLabel: "16:9",
    promptLabel: "Full clip",
  },
  ...kieSeedanceSamples.filter((item) => !showcaseVideoUrls.has(item.videoUrl)),
];

export function getLocalizedGalleryItems(
  locale: string,
  useCase?: LandingPageSlug,
) {
  const filtered = useCase
    ? galleryItems.filter((item) => item.useCase === useCase)
    : galleryItems;
  const resolved = filtered.length > 0 ? filtered : galleryItems;

  return resolved.map((item) => ({
    ...item,
    categoryLabel: locale === "zh" ? item.titleZh : item.category,
    titleLabel: locale === "zh" ? item.titleZh : item.title,
    descriptionLabel: locale === "zh" ? item.descriptionZh : item.description,
    altLabel: locale === "zh" ? item.altZh : item.alt,
  }));
}
