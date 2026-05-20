import rawLandingPages from "./landing-pages.json";
import type { VideoGenerationMode } from "@/utils/video-generation";

// Legacy compatibility for still-present image editor components that are no longer mounted.
export type AnimeStyleId = "standard" | "ghibli" | "cyberpunk" | "retro_90s" | "webtoon" | "cosplay";

export type LandingPageFaq = { question: string; answer: string };
export type LandingPageInsightBlock = {
  bestFor: string[];
  inputChecklist: string[];
  commonPitfalls: string[];
  outputNotes: string[];
};

export type LandingPageConfig = {
  slug: string;
  targetKeyword: string;
  title: string;
  description: string;
  h1: string;
  subtitle: string;
  workflowSummary: string;
  lastUpdated: string;
  executionSteps: string[];
  ctaText: string;
  mode: VideoGenerationMode;
  faqs: LandingPageFaq[];
};

type LandingPageLocalizedCopy = {
  titleZh: string;
  descriptionZh: string;
  h1Zh: string;
  subtitleZh: string;
  workflowSummaryZh: string;
  executionStepsZh: string[];
  ctaTextZh: string;
  faqsZh: LandingPageFaq[];
};

const landingPageInsights: Record<LandingPageSlug, LandingPageInsightBlock> = {
  "image-to-video": {
    bestFor: [
      "Character stills that need controlled camera motion",
      "Mood frames, concept art, and product key visuals",
      "Opening shots where continuity begins from a strong first frame",
    ],
    inputChecklist: [
      "A clear starting image with stable composition",
      "A short prompt that defines motion, lens feeling, and pacing",
      "An optional reference clip if the camera move needs to feel specific",
    ],
    commonPitfalls: [
      "Using a cluttered image with too many competing focal points",
      "Asking for large motion without defining where the camera should travel",
      "Ignoring subject continuity when extending past the first shot",
    ],
    outputNotes: [
      "This workflow is strongest when the first frame is visually confident",
      "Image to video works best as a shot-building workflow, not a random animation trick",
      "Teams usually review motion direction before they scale duration or resolution",
    ],
  },
  "reference-video-generator": {
    bestFor: [
      "Teams with existing visual references, previous edits, or shot boards",
      "Campaign work where taste and pacing must match an established style",
      "Multi-modal workflows that combine stills, clips, and soundtrack cues",
    ],
    inputChecklist: [
      "Still references that lock subject, art direction, or scene tone",
      "Reference clips that demonstrate motion, edit rhythm, or lens behavior",
      "Prompt text explaining what should stay fixed and what may vary",
    ],
    commonPitfalls: [
      "Uploading references that disagree with each other stylistically",
      "Expecting text alone to override stronger visual reference signals",
      "Mixing too many clips without clarifying which reference is primary",
    ],
    outputNotes: [
      "Reference-driven video generation is ideal when brand language already exists",
      "The best results usually come from a clear primary reference and one or two supporting references",
      "This workflow often produces more stable tone than starting from text alone",
    ],
  },
  "dance-motion-transfer": {
    bestFor: [
      "Dance and choreography experiments",
      "Avatar or digital human workflows that need performance transfer",
      "Music-driven outputs where body timing is more important than environment complexity",
    ],
    inputChecklist: [
      "A readable full-body motion clip with clear timing",
      "A strong character still or multiple identity references",
      "Short notes about what must stay locked: face, costume, silhouette, or staging",
    ],
    commonPitfalls: [
      "Using source footage with rapid cuts or obstructed limbs",
      "Ignoring the difference between motion energy and identity consistency",
      "Overloading the prompt with extra cinematic changes while expecting faithful choreography",
    ],
    outputNotes: [
      "Motion transfer works best when the model can read the entire body path clearly",
      "Identity references should usually be simpler and cleaner than the dance clip itself",
      "Reviewing hands, feet, and rhythm alignment matters more than judging one key frame",
    ],
  },
  "product-ad-generator": {
    bestFor: [
      "Commerce launches, campaign tests, and paid social creatives",
      "Product reveal shots, premium material sweeps, and hero loops",
      "Teams that already know the brand mood they want to mimic",
    ],
    inputChecklist: [
      "A polished product still or several angle references",
      "Optional motion references for the reveal, orbit, or dolly style",
      "Prompt notes describing materials, lighting changes, and commercial tone",
    ],
    commonPitfalls: [
      "Using low-quality packshots and expecting luxury ad behavior",
      "Forgetting to specify how reflections or highlights should move",
      "Combining conflicting brand moods in a single short clip",
    ],
    outputNotes: [
      "Shorter shots with one clear camera action often outperform overly ambitious scripts",
      "Product video prompts benefit from material language: chrome, glass, matte, translucent, soft touch",
      "Teams usually validate motion style first, then scale into full campaign systems",
    ],
  },
  "storyboard-to-video": {
    bestFor: [
      "Previs, pitch decks, and director alignment before production",
      "Blocking, timing, and lens exploration from still frames",
      "Studios that want quick motion studies before investing in final footage",
    ],
    inputChecklist: [
      "One or more storyboard frames with readable composition",
      "Prompt text describing the purpose of the shot, not just the visual objects",
      "Optional clip references if the previs should imitate a known camera move",
    ],
    commonPitfalls: [
      "Treating previs outputs as final broadcast-ready footage",
      "Supplying disconnected frames without clarifying shot order or continuity",
      "Leaving scene geography undefined when multiple characters are present",
    ],
    outputNotes: [
      "This workflow shines when creative alignment matters more than perfect realism",
      "Storyboard to video is usually about camera logic and pacing, not polished finishing",
      "Adding two or three key moments often produces better continuity than relying on one still alone",
    ],
  },
  "video-extension": {
    bestFor: [
      "Continuing existing shots instead of restarting them",
      "Adding tail moments, exits, or resolution beats to a finished clip",
      "Preserving scene logic when you only need more time, not a new concept",
    ],
    inputChecklist: [
      "A source clip with readable motion direction and stable scene geography",
      "An optional end-frame target if you need a specific landing point",
      "Prompt notes about what continuity must survive into the extension",
    ],
    commonPitfalls: [
      "Trying to change scene identity too aggressively during the extension",
      "Extending clips whose source motion is already ambiguous or unstable",
      "Ignoring lighting continuity and camera momentum from the source material",
    ],
    outputNotes: [
      "Extension behaves best when it respects the momentum already present in the source",
      "End-frame guidance usually improves control more than adding extra adjectives to the prompt",
      "Teams often use video extension to prototype alternative endings or smoother transitions",
    ],
  },
  "ai-music-video-generator": {
    bestFor: [
      "Music-led short-form content and rhythm-driven visual experiments",
      "Teams already working with soundtrack cues, motion references, and mood boards",
      "Creators who care more about pacing and energy than about a single static frame",
    ],
    inputChecklist: [
      "A short prompt describing subject, mood, and camera behavior",
      "Optional still references for styling or identity",
      "Motion and audio cues if rhythm alignment matters",
    ],
    commonPitfalls: [
      "Adding too many unrelated references without clarifying the dominant rhythm",
      "Letting style references overpower the motion structure",
      "Trying to force too many visual ideas into one short beat-driven shot",
    ],
    outputNotes: [
      "The best music-video-style outputs usually feel disciplined, not overloaded",
      "Beat clarity and movement timing matter more than ornamental prompt language",
      "Teams often validate rhythm first, then refine subject detail and scene design",
    ],
  },
  "ecommerce-product-video-ai": {
    bestFor: [
      "Product launches, ecommerce campaign tests, and paid social edits",
      "Teams that need polished motion from still product photography",
      "Commerce workflows where material detail and lighting control matter",
    ],
    inputChecklist: [
      "A clean hero product image with visible detail",
      "Optional reveal or orbit references for camera behavior",
      "Prompt notes covering materials, light sweeps, and selling angle",
    ],
    commonPitfalls: [
      "Using weak product stills and expecting premium motion output",
      "Ignoring how highlights, reflections, or labels should behave during motion",
      "Over-directing too many sales ideas in one short clip",
    ],
    outputNotes: [
      "A commercial product shot usually works best with one strong movement idea",
      "Material language improves output stability more than generic hype adjectives",
      "Teams often approve product legibility before they judge spectacle",
    ],
  },
  "ai-short-drama-maker": {
    bestFor: [
      "Short-form narrative previs and scene blocking tests",
      "Studios exploring emotion, continuity, and staging before production",
      "Creators who want to turn still story moments into camera logic",
    ],
    inputChecklist: [
      "One strong storyboard or emotional keyframe",
      "Prompt notes describing scene objective, pacing, and visual continuity",
      "Optional references if the shot should echo a known camera style",
    ],
    commonPitfalls: [
      "Expecting a previs workflow to behave like a polished final episodic edit",
      "Leaving emotional tone or staging purpose undefined",
      "Using disconnected frames without clarifying what beat the shot should carry",
    ],
    outputNotes: [
      "The value here is usually alignment and shot testing, not final finishing",
      "A single clear dramatic beat often works better than a whole scene synopsis",
      "Teams should review geography, continuity, and emotional pacing together",
    ],
  },
  "cinematic-product-reveal-generator": {
    bestFor: [
      "Premium launch visuals and brand-led reveal sequences",
      "Teams that want stronger shot design than generic ecommerce motion",
      "Products where lighting, reflection, and pacing define perceived quality",
    ],
    inputChecklist: [
      "A polished still or several controlled product angles",
      "Optional camera references for the reveal style",
      "Prompt notes describing surface response, lighting, and final emotional tone",
    ],
    commonPitfalls: [
      "Overcomplicating the reveal with too many movement ideas",
      "Failing to define where attention should land by the end of the shot",
      "Confusing dramatic lighting with random high-contrast effects",
    ],
    outputNotes: [
      "Premium reveal work depends on restraint as much as flair",
      "Light sweeps and push-ins usually outperform chaotic multi-step camera motion",
      "The final frame should still sell the product clearly, not just the effect",
    ],
  },
};

export const landingPages = rawLandingPages as Record<string, LandingPageConfig>;
export type LandingPageSlug = keyof typeof landingPages;

const landingPagesZh: Record<LandingPageSlug, LandingPageLocalizedCopy> = {
  "image-to-video": {
    titleZh: "图生视频 AI 生成器 | 基于 Seedance 2",
    descriptionZh: "从一张静态图片出发，加入运镜、节奏和画面意图，把它变成更可控的 AI 视频工作流。",
    h1Zh: "图生视频 AI 生成器",
    subtitleZh: "把静帧推进成有节奏的镜头，而不是随机动起来的短片段。",
    workflowSummaryZh: "先用一张清晰关键帧锁住画面，再描述镜头如何推进。需要补参考图、角色一致性或更细节的镜头控制时，再带入创作中心。",
    executionStepsZh: ["准备一张主体清楚、构图稳定的起始图。", "描述镜头怎么动、哪些元素要保持一致，以及镜头应该停在哪里。", "进入创作中心补关键帧，生成后重点检查运动连续性。"],
    ctaTextZh: "打开图生视频工作流",
    faqsZh: [
      { question: "什么样的图像适合作为起始帧？", answer: "主体清晰、构图明确、空间关系稳定的画面最适合做起始帧。" },
      { question: "为什么要加运镜描述？", answer: "因为真正决定镜头质感的不只是会不会动，而是怎么动、动到哪里、节奏怎么推进。" }
    ]
  },
  "reference-video-generator": {
    titleZh: "参考视频生成器 | 基于 Seedance 2",
    descriptionZh: "把图片、视频和音频参考放在一起，让结果跟随真实创作意图，而不是依赖模糊的文字描述。",
    h1Zh: "参考视频生成器",
    subtitleZh: "把参考图、参考视频和音频节奏一起交给系统，生成更可控的视频结果。",
    workflowSummaryZh: "当一句 Prompt 不够准确时，用一个主参考先定方向，再按需加入图片、视频或音频线索，最后进入创作中心继续细化。",
    executionStepsZh: ["先选择一个主参考，不要一开始就堆太多素材。", "说明每个参考分别负责身份、动作、节奏还是氛围。", "进入创作中心上传素材，保持 Prompt 聚焦后再生成。"],
    ctaTextZh: "打开参考视频工作流",
    faqsZh: [
      { question: "为什么多参考比纯文本更重要？", answer: "因为参考素材能直接压缩镜头语言、画面质感和动作方向，比单句文字更可靠。" },
      { question: "可以混合多种输入吗？", answer: "可以。图片负责身份与场景，视频负责动作和镜头，音频负责节奏提示。" }
    ]
  },
  "dance-motion-transfer": {
    titleZh: "AI 动作迁移 | 基于 Seedance 2",
    descriptionZh: "把参考舞蹈视频里的动作节奏和能量迁移到新的角色或新的视频设定上。",
    h1Zh: "AI 动作迁移",
    subtitleZh: "让动作参考带走节奏和编舞，同时把主体替换成新的角色或造型。",
    workflowSummaryZh: "先准备一段动作清晰的参考视频，再补角色图或造型说明。进入创作中心后，可以把身份、动作和节奏拆开控制。",
    executionStepsZh: ["选择全身清楚、镜头稳定、节奏明确的动作参考。", "再加入角色或风格参考，避免身份和动作互相抢控制权。", "进入创作中心生成，并一起检查节奏、手脚和角色一致性。"],
    ctaTextZh: "打开动作迁移工作流",
    faqsZh: [
      { question: "什么样的参考舞蹈视频最好？", answer: "全身清晰、动作连续、镜头不要切太碎的视频最适合做动作迁移。" },
      { question: "怎么保证角色一致性？", answer: "同时上传角色参考图，并明确哪些服装、脸部和比例必须被锁定。" }
    ]
  },
  "product-ad-generator": {
    titleZh: "产品广告生成器 | 基于 Seedance 2",
    descriptionZh: "用产品静帧、运镜参考和商业化 Prompt，生成更像 campaign shot 的产品视频片段。",
    h1Zh: "产品广告生成器",
    subtitleZh: "从产品静图出发，快速生成揭幕镜头、发售预告和视觉提案片段。",
    workflowSummaryZh: "从一张干净产品图和一个明确商业镜头开始。需要揭幕运镜、材质高光或多角度参考时，再进入创作中心。",
    executionStepsZh: ["准备一张材质、标签和轮廓都清楚的产品图。", "只定义一个商业镜头动作，例如推进、揭幕、环绕或扫光。", "进入创作中心补运镜参考，并先确认产品在运动中仍然清楚。"],
    ctaTextZh: "打开产品广告工作流",
    faqsZh: [
      { question: "产品广告 Prompt 最关键的是什么？", answer: "材质反应、光线变化、镜头路径和品牌气质，这些都要写清楚。" },
      { question: "一定要加参考视频吗？", answer: "强烈建议加。哪怕只是一段短参考，也能显著提高镜头语言的一致性。" }
    ]
  },
  "storyboard-to-video": {
    titleZh: "分镜转视频 AI | 基于 Seedance 2",
    descriptionZh: "把分镜稿或关键帧扩成可移动的预演视频，用来测试运镜、节奏和场景连续性。",
    h1Zh: "分镜转视频 AI",
    subtitleZh: "让静态分镜不再只是平面图，而是可以用于预演和走位验证的动态镜头。",
    workflowSummaryZh: "先把一张分镜变成明确的镜头意图。需要多关键帧、动作参考或连续性控制时，再把任务带入创作中心。",
    executionStepsZh: ["选择一张空间关系和主体位置都清楚的分镜图。", "描述这一镜的戏剧目的、运镜方向和情绪节点。", "进入创作中心测试运动、走位和节奏，再决定是否扩展。"],
    ctaTextZh: "打开分镜转视频工作流",
    faqsZh: [
      { question: "这更适合成片还是预演？", answer: "更适合预演、提案和拍摄前验证，而不是直接替代最终成片。" },
      { question: "只给一张图够吗？", answer: "可以，但如果有多张关键帧，系统会更容易理解连续性和镜头目标。" }
    ]
  },
  "video-extension": {
    titleZh: "视频扩写 | 基于 Seedance 2",
    descriptionZh: "沿着原始视频的运动方向、场景逻辑和情绪基调，把镜头继续自然延长。",
    h1Zh: "视频扩写",
    subtitleZh: "不是重新生成一个新镜头，而是沿着原镜头的逻辑继续往前走。",
    workflowSummaryZh: "这条流程适合继续已有片段，而不是从零重写创意。进入创作中心后，再处理源视频、尾帧目标和连续性要求。",
    executionStepsZh: ["选择一段运动方向清楚、场景逻辑稳定的源视频。", "说明哪些内容必须继续，哪些内容不能被改掉。", "进入创作中心上传源视频和可选尾帧，再生成续写结果。"],
    ctaTextZh: "打开视频扩写工作流",
    faqsZh: [
      { question: "什么决定扩写是否自然？", answer: "运动方向、空间关系、光线延续和主体状态是否前后一致。" },
      { question: "可以加尾帧吗？", answer: "可以。尾帧能给系统一个明确目标，通常会比纯粹续写更稳定。" }
    ]
  },
  "ai-music-video-generator": {
    titleZh: "AI 音乐视频生成器 | 基于 Seedance 2",
    descriptionZh: "用 Seedance 2 把提示词、情绪图、动作参考和节奏 cue 组合成更像音乐视频的镜头序列。",
    h1Zh: "AI 音乐视频生成器",
    subtitleZh: "把节奏、动作和氛围组织起来，让画面不是随机动，而是沿着音乐感推进。",
    workflowSummaryZh: "先写清楚氛围、主体和节奏目标。需要音频线索、动作参考和视觉身份共同工作时，再进入创作中心。",
    executionStepsZh: ["先确定氛围、主体和节奏，不要一开始塞太多视觉想法。", "只有当节拍或动作结构需要更明确时，再加入音频或动作参考。", "进入创作中心组合 Prompt、视觉参考和节奏线索。"],
    ctaTextZh: "打开音乐视频工作流",
    faqsZh: [
      { question: "音乐视频工作流最重要的是什么？", answer: "最重要的是节拍清楚、动作能量明确、主体稳定，以及镜头节奏是否真的跟得上音乐感。" },
      { question: "要不要上传音频参考？", answer: "如果你关心节奏和情绪推进，音频参考会明显有帮助，尤其适合多模态工作流。" }
    ]
  },
  "ecommerce-product-video-ai": {
    titleZh: "电商产品视频生成 | 基于 Seedance 2",
    descriptionZh: "用 Seedance 2 把产品静图、揭幕参考和商业化 Prompt 组织成更适合电商和投放的产品视频。",
    h1Zh: "电商产品视频生成",
    subtitleZh: "把产品主图变成发售片段、展示镜头和更适合销售场景的动态内容。",
    workflowSummaryZh: "先用产品主图明确商品本身，再决定是否加入揭幕参考、材质描述和电商节奏，最后进入创作中心生成。",
    executionStepsZh: ["准备一张干净、细节清楚、背景干扰少的产品主图。", "选择一个销售角度，例如材质、尺寸、使用场景或上新揭幕。", "进入创作中心先生成短镜头测试，并优先检查产品是否清楚。"],
    ctaTextZh: "打开电商视频工作流",
    faqsZh: [
      { question: "电商视频最好的起点素材是什么？", answer: "通常是一张干净的产品主图，材质细节清楚、构图明确、没有多余干扰。" },
      { question: "为什么还要加运镜参考？", answer: "因为 reveal、orbit、push-in 这些商业镜头语言，有参考时会比只靠文字更稳定。" }
    ]
  },
  "ai-short-drama-maker": {
    titleZh: "AI 短剧预演工具 | 基于 Seedance 2",
    descriptionZh: "用 Seedance 2 探索短剧场景、情绪节点和镜头连续性，把静态想法转成可以验证的动态预演。",
    h1Zh: "AI 短剧预演工具",
    subtitleZh: "先把戏剧情绪、镜头节奏和场景连续性跑通，再决定要不要进入更完整的制作流程。",
    workflowSummaryZh: "先从一个明确戏剧节点开始，而不是直接塞完整剧情。需要分镜、运镜和情绪连续性时，再进入创作中心。",
    executionStepsZh: ["先选择一个戏剧节点或关键帧，而不是完整剧情梗概。", "写清楚情绪目标、镜头运动和场景连续性。", "进入创作中心测试节奏和走位，再扩成更长片段。"],
    ctaTextZh: "打开短剧预演工作流",
    faqsZh: [
      { question: "这适合直接生成完整短剧吗？", answer: "更适合做预演、节奏测试、镜头验证和拍摄前对齐，而不是直接替代最终成片。" },
      { question: "短剧团队应该先准备什么？", answer: "先准备一张关键帧或分镜图，再补一句说明情绪目标、镜头目的和节奏推进的 prompt。" }
    ]
  },
  "cinematic-product-reveal-generator": {
    titleZh: "电影感产品揭幕生成器 | 基于 Seedance 2",
    descriptionZh: "用 Seedance 2 生成更有电影感的产品揭幕镜头，把材质、高光、运镜和发售氛围组织得更完整。",
    h1Zh: "电影感产品揭幕生成器",
    subtitleZh: "更适合高质感产品发布、主视觉揭幕和需要精细运镜设计的品牌内容。",
    workflowSummaryZh: "从一张高质感产品图和一个克制揭幕方向开始。需要光线扫过、运镜参考和最终定格时，再进入创作中心。",
    executionStepsZh: ["选择一张高级感产品图，并确保最终画面仍能清楚卖出产品。", "描述克制的揭幕运动、光线变化和注意力落点。", "进入创作中心补参考并生成发布感更强的镜头测试。"],
    ctaTextZh: "打开产品揭幕工作流",
    faqsZh: [
      { question: "什么决定产品揭幕镜头看起来够不够高级？", answer: "运镜克制、材质清晰、高光控制得当，以及注意力能否在镜头结尾稳定落到产品上。" },
      { question: "可以只从一张产品图开始吗？", answer: "可以。一张好的产品图可以锁定主体，再通过参考和 Prompt 去定义镜头如何展开。" }
    ]
  }
};

export function getLandingPage(slug: string): LandingPageConfig | null {
  return landingPages[slug] || null;
}

export function getLocalizedLandingPage(slug: string, locale: string): LandingPageConfig | null {
  const page = getLandingPage(slug);
  if (!page) return null;
  if (locale !== "zh") return page;
  const zhCopy = landingPagesZh[slug as LandingPageSlug];
  if (!zhCopy) return page;

  return {
    ...page,
    title: zhCopy.titleZh,
    description: zhCopy.descriptionZh,
    h1: zhCopy.h1Zh,
    subtitle: zhCopy.subtitleZh,
    workflowSummary: zhCopy.workflowSummaryZh,
    executionSteps: zhCopy.executionStepsZh,
    ctaText: zhCopy.ctaTextZh,
    faqs: zhCopy.faqsZh,
  };
}

const landingPageInsightsZh: Record<LandingPageSlug, LandingPageInsightBlock> = {
  "image-to-video": {
    bestFor: [
      "需要稳定运镜的人像、角色立绘和产品主视觉",
      "从强起始帧出发去做镜头推进、景深变化和节奏控制",
      "先锁定一帧，再决定镜头应该怎么动的团队",
    ],
    inputChecklist: [
      "一张构图稳定、主体明确的起始图",
      "一句说明运镜、镜头感和节奏的短 prompt",
      "如果你想让镜头更像某种已知风格，最好再加一段参考视频",
    ],
    commonPitfalls: [
      "起始图过于复杂，画面里没有明确主次",
      "要求大幅运动，却没有定义镜头应该往哪里走",
      "只追求会动，却没有规划后续镜头连续性",
    ],
    outputNotes: [
      "图生视频更适合作为“镜头搭建流程”，不是简单的动画小把戏",
      "起始帧越有把握，后面的镜头可控性通常越高",
      "很多团队会先审运镜，再决定是否拉长时长和提高分辨率",
    ],
  },
  "reference-video-generator": {
    bestFor: [
      "已经有参考视频、旧 campaign、剪辑片段或镜头板的团队",
      "需要输出风格和既有品牌语言保持一致的创意场景",
      "同时用图、视频、音频来约束结果的多模态视频工作流",
    ],
    inputChecklist: [
      "用于锁定主体、场景气质或美术方向的静态参考",
      "用于说明动作、节奏和镜头语言的参考视频",
      "说明哪些元素必须保留、哪些元素可以变化的文字指令",
    ],
    commonPitfalls: [
      "多个参考之间风格冲突，却没有明确主参考",
      "以为文字能完全覆盖更强的视觉参考信号",
      "素材很多，但没有告诉系统哪一个参考优先级最高",
    ],
    outputNotes: [
      "参考驱动的视频生成最适合已经有品牌视觉资产的团队",
      "通常一个主参考加一到两个辅助参考，会比把所有素材一股脑塞进去更稳定",
      "和纯文本起步相比，这种工作流更容易得到稳定的调性与节奏",
    ],
  },
  "dance-motion-transfer": {
    bestFor: [
      "舞蹈、编舞、虚拟人表演和音乐类短视频实验",
      "需要把动作迁移到新角色或数字人上的视频流程",
      "动作节奏比环境复杂度更重要的场景",
    ],
    inputChecklist: [
      "一段全身动作清楚、节奏明确的参考视频",
      "一张强角色图或多张身份参考图",
      "简短说明哪些元素必须锁定，例如脸、服装、轮廓或站位",
    ],
    commonPitfalls: [
      "源视频剪得太碎，四肢经常被遮挡",
      "只关心动作迁移，却忽略角色一致性",
      "既想忠实复刻编舞，又同时加入太多额外镜头变化",
    ],
    outputNotes: [
      "动作迁移最怕模型看不清全身路径，所以干净完整的源视频非常重要",
      "角色参考通常应该比动作视频更干净、更稳定",
      "评估这类结果时，手脚、节奏和重心会比单帧好不好看更关键",
    ],
  },
  "product-ad-generator": {
    bestFor: [
      "电商上新、品牌 campaign、社媒投放和商业提案",
      "产品揭幕镜头、材质扫光、主视觉延展和短广告片测试",
      "对品牌气质有明确要求的内容团队",
    ],
    inputChecklist: [
      "高质量产品主图或多个角度的参考图",
      "如果有理想的 reveal 或 dolly 风格，最好加参考视频",
      "说明材质、光线变化和商业氛围的 prompt",
    ],
    commonPitfalls: [
      "产品素材本身质量不高，却期待高端广告质感",
      "没有说明高光、反射和材质反馈应该怎么动",
      "在同一个短视频里混入彼此冲突的品牌气质",
    ],
    outputNotes: [
      "产品广告更适合一次只做一个明确镜头动作",
      "材质语言非常重要，例如金属、玻璃、半透明、磨砂、柔触感",
      "很多团队会先确认镜头语言，再扩成完整 campaign 体系",
    ],
  },
  "storyboard-to-video": {
    bestFor: [
      "影视预演、提案、导演对齐和拍摄前验证",
      "从静态分镜中探索运镜、节奏和场景连续性",
      "需要在正式拍摄前快速验证镜头逻辑的团队",
    ],
    inputChecklist: [
      "一张或多张构图清晰的分镜图",
      "说明镜头目标和戏剧功能的 prompt，而不只是描述画面物体",
      "如果想模拟某种运镜，最好附上一段参考片段",
    ],
    commonPitfalls: [
      "把预演结果当成最终成片去要求",
      "上传多张分镜，但没有说明顺序和连续性",
      "角色或场景关系复杂，却没有定义空间地理关系",
    ],
    outputNotes: [
      "这一流程最强的价值是创意对齐，而不是画面精修",
      "分镜转视频本质上更接近镜头逻辑验证，不是终稿输出",
      "与其只给一张图，不如给两三张关键帧去帮助系统理解前后关系",
    ],
  },
  "video-extension": {
    bestFor: [
      "把已有镜头继续往下写，而不是重新开始一个新镜头",
      "给已有视频增加尾段、收束动作或情绪延续",
      "你只需要更多时长，而不是重新定义创意方向的场景",
    ],
    inputChecklist: [
      "一段运动方向清楚、空间关系稳定的原始视频",
      "如果你想让镜头落到明确终点，最好提供尾帧目标",
      "说明哪些连续性必须保留，例如光线、主体状态和镜头动势",
    ],
    commonPitfalls: [
      "在扩写时试图强行把场景身份完全改掉",
      "原始素材本身运动不清楚，却还期待自然续写",
      "忽略了原视频里的光线连续性和镜头惯性",
    ],
    outputNotes: [
      "扩写最重要的是尊重原视频已经建立起来的动势",
      "相比堆很多形容词，尾帧目标通常更能提升可控性",
      "很多团队会用这个流程去测试不同结尾或更顺滑的转场",
    ],
  },
  "ai-music-video-generator": {
    bestFor: [
      "音乐驱动的短视频、情绪片段和节奏实验",
      "本来就在用音乐 cue、动作参考和 mood board 沟通创意的团队",
      "比起单帧更关心节奏和能量推进的内容",
    ],
    inputChecklist: [
      "一句说明主体、氛围和镜头的短 prompt",
      "如果你想锁定造型或世界观，可以加静态图参考",
      "如果节奏很重要，最好加动作和音频参考",
    ],
    commonPitfalls: [
      "参考素材很多，但没有明确哪一个负责节奏主导",
      "造型参考太强，反而盖掉了动作和节拍结构",
      "在一个很短的片段里塞太多视觉想法",
    ],
    outputNotes: [
      "音乐视频类结果更怕乱，不怕少",
      "节拍清楚、运动方向清楚，通常比华丽的词更重要",
      "很多团队会先审节奏，再去审主体细节和画面精修",
    ],
  },
  "ecommerce-product-video-ai": {
    bestFor: [
      "电商上新、站内主图动效和投放短片测试",
      "需要把产品静图快速变成可投放镜头的团队",
      "材质细节和卖点展示都很重要的商业内容",
    ],
    inputChecklist: [
      "一张干净的产品主图或几个可控角度",
      "如果你有理想镜头语言，最好加 reveal 参考",
      "说明材质、高光、氛围和销售角度的 prompt",
    ],
    commonPitfalls: [
      "起始产品图本身质量不足，却期待高级商业效果",
      "没有说明标签、材质、反光和高光应该怎么表现",
      "把太多卖点塞进一条很短的镜头里",
    ],
    outputNotes: [
      "电商镜头通常一次只做一个强动作会更稳",
      "材质语言比笼统形容词更重要",
      "很多团队会先看产品是否清楚，再看镜头够不够炫",
    ],
  },
  "ai-short-drama-maker": {
    bestFor: [
      "短剧情绪节点预演和镜头走位测试",
      "需要在拍摄前验证镜头节奏和空间连续性的团队",
      "希望把静态戏剧节点转成动态镜头思考的人",
    ],
    inputChecklist: [
      "一张强关键帧或分镜图",
      "一句说明场景目标、情绪和节奏的 prompt",
      "如果想模拟具体镜头，可再加参考片段",
    ],
    commonPitfalls: [
      "把预演型工作流当成最终剧集成片来要求",
      "戏剧情绪或场景目的定义不清楚",
      "给了很多图，却没有说明这一镜的戏剧功能",
    ],
    outputNotes: [
      "这类工作流最强的价值通常是对齐，不是精修",
      "一个清楚的戏剧节点，往往比一整段剧情摘要更有效",
      "团队评估时要一起看空间关系、连续性和情绪节奏",
    ],
  },
  "cinematic-product-reveal-generator": {
    bestFor: [
      "高质感产品发布、主视觉揭幕和高级 campaign 镜头",
      "不满足于普通电商动效，而是更在意镜头设计的团队",
      "材质、光线和节奏共同定义高级感的产品内容",
    ],
    inputChecklist: [
      "一张高质感产品图或多个可控角度",
      "如果有理想 reveal 风格，最好加镜头参考",
      "说明材质反应、光线变化和最终情绪的 prompt",
    ],
    commonPitfalls: [
      "试图把太多动作都塞到一个 reveal 里",
      "没有定义镜头结尾注意力应该落在哪里",
      "把戏剧光线误当成随意加对比效果",
    ],
    outputNotes: [
      "高级揭幕镜头需要克制，不只是炫技",
      "高光扫过和缓慢推进，通常比过度复杂的镜头更高级",
      "最后一帧必须仍然把产品卖清楚，而不只是效果好看",
    ],
  },
};

export function getLandingPageInsights(slug: string, locale: string): LandingPageInsightBlock | null {
  const typedSlug = slug as LandingPageSlug;
  if (!(typedSlug in landingPageInsights)) return null;
  return locale === "zh" ? landingPageInsightsZh[typedSlug] : landingPageInsights[typedSlug];
}

export const landingPageSlugs = Object.keys(landingPages);
export const indexableLandingPageSlugs = landingPageSlugs;
