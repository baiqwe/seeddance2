export type AnimeStyleId = "standard" | "ghibli" | "cyberpunk" | "retro_90s" | "webtoon" | "cosplay";

export type LandingPageFaq = { question: string; answer: string };

export type LandingPageConfig = {
  slug: string;
  targetKeyword: string;
  title: string;
  description: string;
  h1: string;
  subtitle: string;
  defaultStyle: AnimeStyleId;
  hideStyleSelector?: boolean;
  faqs: LandingPageFaq[];
};

export const landingPages: Record<string, LandingPageConfig> = {
  "photo-to-anime": {
    slug: "photo-to-anime",
    targetKeyword: "photo to anime",
    title: "Free Photo to Anime AI Converter Online (No Sign-Up)",
    description: "Upload a photo and turn it into stunning anime-style art with AI. Choose styles like Ghibli, Cyberpunk, and 90s retro. Fast results and high quality.",
    h1: "Free Photo to Anime AI Converter",
    subtitle: "Turn any photo into anime art in seconds. Pick a style, adjust intensity, and generate your new anime look.",
    defaultStyle: "standard",
    hideStyleSelector: false,
    faqs: [
      { question: "Do I need to sign up?", answer: "To generate images you’ll need an account. New accounts get a small free allowance to try it." },
      { question: "Will it look like me?", answer: "Our anime styles aim to preserve key facial features while transforming the overall look into a clean 2D anime aesthetic." },
    ],
  },
  "ghibli-filter": {
    slug: "ghibli-filter",
    targetKeyword: "convert photo to ghibli style",
    title: "Free Ghibli Filter AI: Turn Photo into Studio Ghibli Style",
    description: "Upload your photo and instantly transform it into a Studio Ghibli-inspired anime illustration. Simple, fast, and beautiful.",
    h1: "Studio Ghibli AI Filter",
    subtitle: "Turn any photo into a warm, hand-drawn Ghibli-inspired masterpiece in seconds.",
    defaultStyle: "ghibli",
    hideStyleSelector: true,
    faqs: [
      { question: "Is this a real Studio Ghibli product?", answer: "No. This is a fan-inspired AI style filter and is not affiliated with Studio Ghibli." },
      { question: "What photos work best?", answer: "Clear portraits and well-lit outdoor photos usually produce the best results." },
    ],
  },
  "anime-pfp-generator": {
    slug: "anime-pfp-generator",
    targetKeyword: "anime pfp generator",
    title: "AI Anime PFP Generator: Create Custom Anime Avatars",
    description: "Create an anime profile picture for Discord, Twitch, and gaming. Upload a selfie, choose a style, and generate your anime PFP.",
    h1: "Anime PFP Generator",
    subtitle: "Level up your profile with a custom anime avatar—made from your real photo.",
    defaultStyle: "standard",
    hideStyleSelector: false,
    faqs: [
      { question: "Can I use it for Discord and Twitch?", answer: "Yes. The generated images are perfect for profile pictures on social platforms." },
      { question: "Can I generate multiple variants?", answer: "Yes—try different styles and intensity levels to get your favorite look." },
    ],
  },
  "90s-anime-filter": {
    slug: "90s-anime-filter",
    targetKeyword: "90s anime filter",
    title: "90s Anime Filter AI: Turn Photos into Retro Cel Anime",
    description: "Convert your photo into a 90s retro anime look with cel shading vibes. Great for nostalgic profile pics and edits.",
    h1: "90s Retro Anime Filter",
    subtitle: "A nostalgic cel-shaded anime look inspired by classic 90s animation.",
    defaultStyle: "retro_90s",
    hideStyleSelector: true,
    faqs: [
      { question: "What is a 90s anime style?", answer: "Think clean outlines, cel shading, and slightly softer color palettes typical of 90s animation." },
    ],
  },
  "cyberpunk-anime": {
    slug: "cyberpunk-anime",
    targetKeyword: "cyberpunk anime filter",
    title: "Cyberpunk Anime Filter: Neon Anime Style from Your Photo",
    description: "Turn your photo into a neon cyberpunk anime illustration. Perfect for gamers, streamers, and sci‑fi fans.",
    h1: "Cyberpunk Anime Filter",
    subtitle: "Neon lights, futuristic mood, and bold anime lines—generated from your photo.",
    defaultStyle: "cyberpunk",
    hideStyleSelector: true,
    faqs: [
      { question: "Does it add neon backgrounds?", answer: "Yes, the cyberpunk style tends to add futuristic lighting and mood. You can also add optional notes in the prompt." },
    ],
  },
  "webtoon-ai": {
    slug: "webtoon-ai",
    targetKeyword: "webtoon ai filter",
    title: "Webtoon AI Filter: Convert Photo to Clean Webtoon Style",
    description: "Generate a clean, modern webtoon-inspired look from your photo. Great for avatars and character edits.",
    h1: "Webtoon AI Filter",
    subtitle: "A crisp, modern comic look—simple shapes, clean lines, and readable shading.",
    defaultStyle: "webtoon",
    hideStyleSelector: true,
    faqs: [
      { question: "Is webtoon style different from anime?", answer: "Yes—webtoon styles often favor cleaner shapes and flatter, readable shading compared to traditional anime rendering." },
    ],
  },
  "cosplay-enhancer": {
    slug: "cosplay-enhancer",
    targetKeyword: "cosplay enhancer ai",
    title: "Cosplay Enhancer AI: Turn Cosplay Photos into Anime Art",
    description: "Upload a cosplay photo and generate a polished anime-style illustration that keeps the essence of your costume and character.",
    h1: "Cosplay Enhancer",
    subtitle: "Convert cosplay shots into anime art—great for sharing and profile pics.",
    defaultStyle: "cosplay",
    hideStyleSelector: false,
    faqs: [
      { question: "Will it keep my costume details?", answer: "It tries to preserve key shapes and colors. For best results, use high-quality, well-lit photos." },
    ],
  },
};

export function getLandingPage(slug: string): LandingPageConfig | null {
  return landingPages[slug] || null;
}

export const landingPageSlugs = Object.keys(landingPages);

