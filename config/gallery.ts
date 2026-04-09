import type { AnimeStyleId } from "@/config/landing-pages";

export type GalleryItem = {
  id: string;
  style: AnimeStyleId;
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
};

const SHARED_AFTER = "/images/gallery/hero-after.jpg";
const SHARED_BEFORE = "/images/gallery/hero-before.jpg";

export const galleryItems: GalleryItem[] = [
  {
    id: "ghibli-pet",
    style: "ghibli",
    slug: "ghibli-filter",
    category: "Pet Makeover",
    title: "Warm storybook pet portrait",
    titleZh: "治愈系童话宠物肖像",
    description: "Soft watercolor lighting and a gentler hand-drawn finish make this style feel cozy and cinematic.",
    descriptionZh: "柔和水彩光感加上手绘质感，让结果更像治愈系动画电影镜头。",
    alt: "Before and after AI anime transformation sample featuring a fox illustration turned into a warm storybook-style portrait.",
    altZh: "AI 动漫转换前后案例，展示狐狸插画被转换为温暖童话感动漫肖像。",
    afterImage: "/images/gallery/generated/ghibli.jpg",
    beforeThumb: SHARED_BEFORE,
  },
  {
    id: "webtoon-selfie",
    style: "webtoon",
    slug: "webtoon-ai",
    category: "Daily Selfie",
    title: "Crisp webtoon makeover",
    titleZh: "干净利落的韩漫改造",
    description: "Sharper lines, cleaner face shapes, and glossy rendering create a modern manhwa-style finish.",
    descriptionZh: "更利落的轮廓、更清爽的脸部结构和轻微光泽感，做出更现代的韩漫画风。",
    alt: "AI webtoon style sample showing a fox illustration converted into a cleaner manhwa-inspired portrait.",
    altZh: "AI 韩漫风样例，展示狐狸插画被转换为更利落的韩漫风肖像。",
    afterImage: "/images/gallery/generated/webtoon.jpg",
    beforeThumb: SHARED_BEFORE,
  },
  {
    id: "retro-avatar",
    style: "retro_90s",
    slug: "90s-anime-filter",
    category: "Retro Avatar",
    title: "Nostalgic 90s anime frame",
    titleZh: "90 年代复古动漫定格",
    description: "Muted tones and retro cel-style rendering make the final image feel lifted from old TV anime.",
    descriptionZh: "低饱和配色和复古赛璐璐质感，让结果更像老电视动画定格画面。",
    alt: "Retro anime sample with a fox illustration converted into a vintage 1990s-style anime image.",
    altZh: "复古动漫样例，展示狐狸插画被转换为 90 年代风格的动漫图像。",
    afterImage: "/images/gallery/generated/retro_90s.jpg",
    beforeThumb: SHARED_BEFORE,
  },
  {
    id: "cyberpunk-edit",
    style: "cyberpunk",
    slug: "cyberpunk-anime",
    category: "Night Edit",
    title: "Neon anime transformation",
    titleZh: "霓虹感赛博动漫变身",
    description: "Push the look toward contrast, glow, and night-city energy when you want a bolder anime identity.",
    descriptionZh: "如果你想要更有冲击力的动漫视觉，这种风格会把画面推向更强对比、更强霓虹和夜景氛围。",
    alt: "Cyberpunk anime sample showing a fox illustration edited into a dramatic neon-inspired anime portrait.",
    altZh: "赛博朋克动漫样例，展示狐狸插画被编辑为带有霓虹氛围的动漫肖像。",
    afterImage: "/images/gallery/generated/cyberpunk.jpg",
    beforeThumb: SHARED_BEFORE,
  },
  {
    id: "standard-pfp",
    style: "standard",
    slug: "anime-pfp-generator",
    category: "Profile Picture",
    title: "Clean anime profile look",
    titleZh: "适合头像的标准动漫风",
    description: "A balanced anime finish that keeps the subject readable while making the final result social-ready.",
    descriptionZh: "在保留人物辨识度的同时做出更稳定的动漫化效果，适合直接拿来做头像。",
    alt: "Anime profile picture sample showing a fox illustration converted into a clean modern anime portrait.",
    altZh: "动漫头像样例，展示狐狸插画被转换为干净现代的动漫头像风格。",
    afterImage: "/images/gallery/generated/standard.jpg",
    beforeThumb: SHARED_BEFORE,
  },
  {
    id: "cosplay-redraw",
    style: "cosplay",
    slug: "cosplay-enhancer",
    category: "Cosplay Redraw",
    title: "Poster-like cosplay redraw",
    titleZh: "海报感 Cosplay 重绘",
    description: "Use this direction when you want more costume presence, bolder linework, and a convention-poster finish.",
    descriptionZh: "如果你希望服装存在感更强、线条更明确、结果更像漫展海报，就适合这类重绘方向。",
    alt: "Cosplay redraw sample showing a fox illustration transformed into a polished anime poster composition.",
    altZh: "Cosplay 重绘样例，展示狐狸插画被转换为更像动漫海报的画面。",
    afterImage: "/images/gallery/generated/cosplay.jpg",
    beforeThumb: SHARED_BEFORE,
  },
];

export function getLocalizedGalleryItems(locale: string, style?: AnimeStyleId) {
  const filtered = style ? galleryItems.filter((item) => item.style === style) : galleryItems;

  return filtered.map((item) => ({
    ...item,
    categoryLabel: locale === "zh" ? item.titleZh : item.category,
    titleLabel: locale === "zh" ? item.titleZh : item.title,
    descriptionLabel: locale === "zh" ? item.descriptionZh : item.description,
    altLabel: locale === "zh" ? item.altZh : item.alt,
  }));
}
