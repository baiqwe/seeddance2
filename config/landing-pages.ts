import rawLandingPages from "./landing-pages.json";
import type { VideoGenerationMode, VideoModelId } from "@/utils/video-generation";

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
  model?: VideoModelId;
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
  "ai-video-generator-with-reference-video": {
    bestFor: [
      "Teams that can show the motion they want more clearly than they can describe it",
      "Camera-copy, choreography, action, and effects-timing workflows",
      "Creators who need a new subject to inherit a known rhythm or lens behavior",
    ],
    inputChecklist: [
      "One primary reference video with clear motion and few cuts",
      "A prompt that states what the reference controls and what should change",
      "Optional image keyframes when identity or composition must stay locked",
    ],
    commonPitfalls: [
      "Using a long edit with many unrelated cuts as the primary reference",
      "Expecting the reference to control everything without prompt boundaries",
      "Borrowing clips without checking rights or usage permission",
    ],
    outputNotes: [
      "Motion fidelity matters more than one attractive still frame",
      "Short, readable references usually outperform complex montages",
      "Review whether the generated clip follows the motion role you assigned",
    ],
  },
  "ai-video-generator-with-audio-sync": {
    bestFor: [
      "Music videos, beat-led social clips, narration-led edits, and ad impact moments",
      "Creators who need timing cues to drive visual energy",
      "Teams testing how sound changes pacing before final production",
    ],
    inputChecklist: [
      "A short audio cue, beat section, narration moment, or sound effect pattern",
      "Prompt notes that name the visual action around timing points",
      "Optional visual references for identity, world, and composition",
    ],
    commonPitfalls: [
      "Uploading audio without explaining which moments matter",
      "Expecting every beat to become a cut in a short video",
      "Judging visual polish before checking whether the timing works",
    ],
    outputNotes: [
      "Audio-led work should be reviewed by rhythm first, then image quality",
      "A few clear timing targets are more useful than a full track with no notes",
      "This workflow is strongest when sound has a visible job",
    ],
  },
  "ai-video-extension": {
    bestFor: [
      "Continuing existing shots without changing the creative direction",
      "Adding endings, exits, transition tails, or smoother scene continuation",
      "Teams that already have a useful source clip and need more usable duration",
    ],
    inputChecklist: [
      "A source clip with stable geography and readable camera momentum",
      "Continuity notes for subject state, lighting, and scene logic",
      "An optional end frame if the extension must land on a specific composition",
    ],
    commonPitfalls: [
      "Trying to turn an extension into an entirely new scene",
      "Using a source clip with unclear motion and expecting a clean continuation",
      "Forgetting to specify what must remain unchanged",
    ],
    outputNotes: [
      "A good extension should feel like the next few seconds of the same shot",
      "End-frame targets help when the final composition matters",
      "Review lighting and camera momentum before judging extra detail",
    ],
  },
  "seedance-2-fast": {
    bestFor: [
      "Early prompt scouting and fast direction tests",
      "Teams comparing multiple camera or pacing ideas before final rendering",
      "Creators who need a cheaper first read on motion logic",
    ],
    inputChecklist: [
      "A prompt close enough to the final idea to make the test meaningful",
      "Only the references needed to validate the direction",
      "A clear rule for when to graduate the idea to the standard model",
    ],
    commonPitfalls: [
      "Treating a scouting pass as final client-facing output",
      "Testing with loose prompts that will never be used in production",
      "Using Fast for identity-critical or detail-heavy work without a review pass",
    ],
    outputNotes: [
      "Fast is most valuable when it saves expensive final-model attempts",
      "The test should answer whether direction, motion, and pacing are viable",
      "Switch models after the workflow is stable, not before the idea is clear",
    ],
  },
  "motion-control-ai-video-generator": {
    bestFor: [
      "Shots where camera path, speed, and subject movement matter more than style words",
      "Reference-led dolly, orbit, push-in, transition, and action workflows",
      "Teams reviewing motion as a production variable",
    ],
    inputChecklist: [
      "Separate instructions for subject action, camera path, pacing, and end state",
      "Reference clips when the motion is easier to show than write",
      "A simple scene objective so motion serves the shot",
    ],
    commonPitfalls: [
      "Writing cinematic movement without saying what moves",
      "Stacking multiple camera moves into one short clip",
      "Judging only beauty instead of whether motion communicates the intended idea",
    ],
    outputNotes: [
      "Motion control should make the shot more legible, not simply busier",
      "One clear camera action often beats several competing movements",
      "The best review question is: did the motion do the job?",
    ],
  },
  "consistent-character-ai-video-generator": {
    bestFor: [
      "Character-driven clips where identity must remain recognizable",
      "Digital human, mascot, avatar, and narrative continuity workflows",
      "Teams separating identity references from motion references",
    ],
    inputChecklist: [
      "Clean character references for face, wardrobe, silhouette, and proportions",
      "Prompt notes naming which traits must remain fixed",
      "Motion or camera references only after the identity is well anchored",
    ],
    commonPitfalls: [
      "Adding strong motion before the character is visually anchored",
      "Using conflicting references that describe different versions of the character",
      "Overloading the prompt with style changes that fight identity stability",
    ],
    outputNotes: [
      "Review identity before reviewing effects or environment detail",
      "Wardrobe and silhouette are often as important as the face",
      "Consistency improves when each input has a separate responsibility",
    ],
  },
  "product-ad-ai-video-generator": {
    bestFor: [
      "Paid-social product shots, launch tests, and campaign concepting",
      "Teams turning still product imagery into commercial motion",
      "Products where materials, labels, lighting, and final frame clarity matter",
    ],
    inputChecklist: [
      "A clean product still with readable shape, label, and material",
      "One advertising motion idea, such as push-in, orbit, reveal, or light sweep",
      "Optional camera references when a specific commercial rhythm matters",
    ],
    commonPitfalls: [
      "Starting from weak product photography and expecting premium output",
      "Adding too many sales ideas into one short shot",
      "Letting motion hide the product instead of selling it",
    ],
    outputNotes: [
      "Product readability is the first approval gate",
      "Material language beats generic premium adjectives",
      "The final frame should still work as a product image",
    ],
  },
};

export const landingPages = rawLandingPages as Record<string, LandingPageConfig>;
export type LandingPageSlug = keyof typeof landingPages;

const landingPagesZh: Record<LandingPageSlug, LandingPageLocalizedCopy> = {
  "image-to-video": {
    titleZh: "图生视频 AI 生成器 | 基于 Seedance 2",
    descriptionZh: "从一张静态图片出发，加入运镜、节奏、主体连续性和画面意图，把关键帧变成更可控的 AI 视频工作流，适合先做镜头验证再进入完整创作。",
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
    descriptionZh: "把图片、视频和音频参考放在一起，让结果跟随真实创作意图、动作节奏和镜头语言，而不是只依赖模糊文字描述。",
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
    descriptionZh: "把参考舞蹈视频里的动作节奏、身体能量和镜头节拍迁移到新的角色或新的视频设定上，同时更容易保持身份与造型控制。",
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
    descriptionZh: "用产品静帧、运镜参考、灯光说明和商业化 Prompt，生成更像 campaign shot 的产品视频片段，适合先验证广告镜头质感。",
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
    descriptionZh: "把分镜稿或关键帧扩成可移动的预演视频，用来测试运镜、走位、节奏和场景连续性，再决定是否进入更完整制作。",
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
    descriptionZh: "沿着原始视频的运动方向、场景逻辑、光线状态和情绪基调，把镜头继续自然延长，而不是重新生成一个新镜头。",
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
    descriptionZh: "用 Seedance 2 把提示词、情绪图、动作参考和节奏 cue 组合成更像音乐视频的镜头序列，让画面跟着节拍和情绪推进。",
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
    descriptionZh: "用 Seedance 2 把产品静图、揭幕参考、材质说明和商业化 Prompt 组织成更适合电商详情页、投放素材和上新预告的产品视频。",
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
    descriptionZh: "用 Seedance 2 探索短剧场景、情绪节点、人物走位和镜头连续性，把静态想法转成可以快速验证的动态预演。",
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
    descriptionZh: "用 Seedance 2 生成更有电影感的产品揭幕镜头，把材质、高光、运镜、最终定格和发售氛围组织得更完整。",
    h1Zh: "电影感产品揭幕生成器",
    subtitleZh: "更适合高质感产品发布、主视觉揭幕和需要精细运镜设计的品牌内容。",
    workflowSummaryZh: "从一张高质感产品图和一个克制揭幕方向开始。需要光线扫过、运镜参考和最终定格时，再进入创作中心。",
    executionStepsZh: ["选择一张高级感产品图，并确保最终画面仍能清楚卖出产品。", "描述克制的揭幕运动、光线变化和注意力落点。", "进入创作中心补参考并生成发布感更强的镜头测试。"],
    ctaTextZh: "打开产品揭幕工作流",
    faqsZh: [
      { question: "什么决定产品揭幕镜头看起来够不够高级？", answer: "运镜克制、材质清晰、高光控制得当，以及注意力能否在镜头结尾稳定落到产品上。" },
      { question: "可以只从一张产品图开始吗？", answer: "可以。一张好的产品图可以锁定主体，再通过参考和 Prompt 去定义镜头如何展开。" }
    ]
  },
  "ai-video-generator-with-reference-video": {
    titleZh: "参考视频 AI 生成器 | 基于 Seedance 2",
    descriptionZh: "用参考视频控制运镜、动作节奏、特效时机和画面能量，再用 Prompt 说明新主体、新场景和必须保留的内容。",
    h1Zh: "参考视频 AI 生成器",
    subtitleZh: "把参考视频里的动作逻辑、镜头节奏和场景推进，迁移到新的生成任务里。",
    workflowSummaryZh: "当你已经知道镜头应该怎么动时，这条工作流比纯文本更稳定。参考视频负责动作、运镜或节奏，Prompt 负责说明要替换什么、保留什么。",
    executionStepsZh: ["选择一段动作、运镜或节奏很清楚的主参考视频。", "在 Prompt 里明确参考视频负责什么，新视频应该替换或保留什么。", "进入创作中心上传参考视频和可选关键帧，再检查生成结果是否跟随目标动作。"],
    ctaTextZh: "打开参考视频工作流",
    faqsZh: [
      { question: "参考视频可以控制哪些内容？", answer: "它可以帮助控制运镜、身体动作、镜头节奏、特效时机和整体能量，但 Prompt 仍然要说明主体和场景如何变化。" },
      { question: "任何视频都能拿来参考吗？", answer: "建议只使用你拥有或有权使用的素材。短、清晰、单一任务的视频通常比多段混剪更好。" }
    ]
  },
  "ai-video-generator-with-audio-sync": {
    titleZh: "音频同步 AI 视频生成器 | 基于 Seedance 2",
    descriptionZh: "围绕音乐节拍、音效、旁白节奏和情绪变化来组织 AI 视频生成，让画面不是随机动，而是跟着声音推进。",
    h1Zh: "音频同步 AI 视频生成器",
    subtitleZh: "用音频线索控制节奏、转场、情绪变化和画面能量。",
    workflowSummaryZh: "当节奏是结果的关键时，用音频来说明画面应该何时增强、停顿、切换或收束，再用图片和 Prompt 锁定主体与世界观。",
    executionStepsZh: ["准备一段短音频、节拍段落、旁白节点或音效节奏。", "说明重要时间点上画面应该发生什么，而不是只写一个泛泛的音乐视频 Prompt。", "进入创作中心组合音频、Prompt 和可选视觉参考，并先检查节奏再看画面精修。"],
    ctaTextZh: "打开音频同步工作流",
    faqsZh: [
      { question: "音频同步在这里指什么？", answer: "它指用节奏、重音、旁白或音效来控制画面推进和转场，而不是简单给视频加背景音乐。" },
      { question: "每条视频都需要音频吗？", answer: "不需要。只有当音乐、音效、舞蹈、旁白或广告节奏是核心时，音频参考才特别重要。" }
    ]
  },
  "ai-video-extension": {
    titleZh: "AI 视频延展工具 | 基于 Seedance 2",
    descriptionZh: "沿着原视频的动作方向、场景连续性、光线和可选尾帧目标继续扩写，让镜头自然延长。",
    h1Zh: "AI 视频延展工具",
    subtitleZh: "把已有片段继续往前推进，同时保留运动、光线和空间逻辑。",
    workflowSummaryZh: "这条工作流适合原片段已经接近目标但时长不够的情况。重点是尊重已有镜头动势，而不是重新生成一个新场景。",
    executionStepsZh: ["选择一段运动方向清楚、空间关系稳定的源视频。", "说明哪些内容必须继续、哪些不能变化，以及是否需要到达某个尾帧目标。", "进入创作中心上传源视频，并检查扩写是否保留光线、主体状态和镜头惯性。"],
    ctaTextZh: "打开视频延展工作流",
    faqsZh: [
      { question: "什么时候该用视频延展？", answer: "当你喜欢现有镜头，只是需要更长时长、更自然结尾或同一场景的继续推进时，就适合用延展。" },
      { question: "尾帧是什么意思？", answer: "尾帧是可选的目标画面，用来告诉模型扩展后的镜头最终应该到达什么构图。" }
    ]
  },
  "seedance-2-fast": {
    titleZh: "Seedance 2 Fast 工作流指南",
    descriptionZh: "了解什么时候用 Seedance 2 Fast 快速试方向、试节奏和试运镜，再决定是否切换到标准模型做高成本生成。",
    h1Zh: "Seedance 2 Fast 工作流指南",
    subtitleZh: "先用 Fast 检查方向、节奏和构图，再把确定的镜头交给标准模型精修。",
    workflowSummaryZh: "Seedance 2 Fast 更像创意侦察阶段。它适合快速验证 Prompt、参考素材和运镜节奏，再把稳定方案切到标准模型。",
    executionStepsZh: ["当你要验证方向而不是最终交付质量时，先用 Fast。", "保持 Prompt 和参考素材接近最终方案，这样测试结果才有参考价值。", "进入创作中心使用 Fast 模型，检查运动和构图，再决定是否切换标准模型。"],
    ctaTextZh: "打开 Seedance 2 Fast 工作流",
    faqsZh: [
      { question: "Seedance 2 Fast 是不是质量更低？", answer: "Fast 更适合快速迭代和方向测试。需要客户可审阅质量时，再切到标准模型。" },
      { question: "什么时候不建议用 Fast？", answer: "细节很多的产品广告、强角色一致性或正式交付镜头，不建议直接把 Fast 当最终版本。" }
    ]
  },
  "motion-control-ai-video-generator": {
    titleZh: "运镜控制 AI 视频生成器 | 基于 Seedance 2",
    descriptionZh: "把 AI 视频生成拆成镜头路径、主体动作、节奏和连续性，让运镜不再只靠模糊 Prompt 猜测。",
    h1Zh: "运镜控制 AI 视频生成器",
    subtitleZh: "明确什么在动、怎么动、镜头怎么跟，以及最后应该落在哪里。",
    workflowSummaryZh: "当一张好看的图还不够时，需要把镜头运动、主体动作、节奏和连续性拆开写清楚，让每一层都可以被检查。",
    executionStepsZh: ["把镜头路径、主体动作和节奏分开描述。", "当某种运动很难用文字说清楚时，再加入参考视频。", "进入创作中心检查运动是否服务于镜头，而不是随机动起来。"],
    ctaTextZh: "打开运镜控制工作流",
    faqsZh: [
      { question: "运镜控制 Prompt 应该怎么写？", answer: "要写清楚主体动作、镜头路径、速度和结尾状态，不要只写“电影感运镜”这种泛词。" },
      { question: "参考视频对运镜控制有帮助吗？", answer: "有，尤其是推进、环绕、舞蹈、转场和其他很难只靠文字描述的节奏。" }
    ]
  },
  "consistent-character-ai-video-generator": {
    titleZh: "角色一致性 AI 视频生成器 | 基于 Seedance 2",
    descriptionZh: "用角色参考、关键帧和 Prompt 提高 AI 视频里的脸、服装、轮廓和身份稳定性。",
    h1Zh: "角色一致性 AI 视频生成器",
    subtitleZh: "在加入动作和运镜之前，先锁定脸、服装、轮廓和角色身份。",
    workflowSummaryZh: "当身份漂移是最大风险时，先用干净角色参考锁定人物，再补动作、镜头和场景指令。",
    executionStepsZh: ["准备一到多张能看清脸、服装和轮廓的角色参考。", "说明哪些身份特征必须保持，哪些动作或镜头可以变化。", "进入创作中心组合角色参考和动作方向，并先检查身份稳定性。"],
    ctaTextZh: "打开角色一致性工作流",
    faqsZh: [
      { question: "为什么角色会漂移？", answer: "常见原因是还没锁定身份，就要求强动作、强风格或复杂镜头变化。" },
      { question: "应该上传几张角色图？", answer: "够说明脸、服装和轮廓即可。不要上传彼此冲突的角色版本。" }
    ]
  },
  "product-ad-ai-video-generator": {
    titleZh: "产品广告 AI 视频生成器 | 基于 Seedance 2",
    descriptionZh: "用产品静图、灯光说明、揭幕参考和广告 Prompt 生成更像商业投放素材的产品视频概念。",
    h1Zh: "产品广告 AI 视频生成器",
    subtitleZh: "把产品静图转成更有材质、灯光和运镜控制的广告视频概念。",
    workflowSummaryZh: "这条工作流不是让产品随便动起来，而是围绕材质、揭幕、卖点和最终定格，做可用于付费投放前验证的镜头。",
    executionStepsZh: ["从一张形状、标签和材质都清楚的产品图开始。", "只定义一个广告镜头动作，例如推进、环绕、揭幕、扫光或使用场景。", "进入创作中心补可选运镜参考，并检查产品在整段视频里是否清楚。"],
    ctaTextZh: "打开产品广告工作流",
    faqsZh: [
      { question: "什么样的产品广告视频才算可用？", answer: "产品要始终清楚，同时灯光、运镜和最终画面都能强化卖点。" },
      { question: "产品广告更适合图片还是视频参考？", answer: "先用产品图锁定商品本身；如果需要特定运镜，再加视频参考。" }
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
  "ai-video-generator-with-reference-video": {
    bestFor: ["能用视频更清楚说明动作和运镜的团队", "镜头复刻、舞蹈动作、动作戏和特效节奏工作流", "希望新主体继承已有镜头节奏的创作者"],
    inputChecklist: ["一段动作清楚、剪辑少的主参考视频", "说明参考视频负责什么、生成结果替换什么的 Prompt", "如果身份或构图必须锁定，再补图片关键帧"],
    commonPitfalls: ["用很长的混剪当主参考", "没有给参考视频划定职责边界", "没有确认参考素材的使用权"],
    outputNotes: ["动作跟随比单帧好看更重要", "短而清楚的参考通常优于复杂混剪", "评估时要看结果是否完成了你分配给参考视频的任务"],
  },
  "ai-video-generator-with-audio-sync": {
    bestFor: ["音乐视频、节拍短片、旁白视频和广告冲击点", "需要声音线索驱动画面能量的创作者", "想先测试声音如何改变视频节奏的团队"],
    inputChecklist: ["短音频、节拍段落、旁白节点或音效模式", "说明重要声音点对应画面动作的 Prompt", "用于锁定主体、世界观和构图的可选视觉参考"],
    commonPitfalls: ["上传音频却不说明哪些节点重要", "期待每个节拍都变成剪辑点", "在确认节奏前先纠结画面精修"],
    outputNotes: ["音频驱动的视频应先审节奏，再审画面", "几个明确时点比一整首无说明的音乐更有用", "声音必须有具体工作，这条流程才有价值"],
  },
  "ai-video-extension": {
    bestFor: ["延长已有镜头而不是重做创意", "补尾段、出场动作、转场尾巴或自然续写", "已有源视频接近可用但时长不够的团队"],
    inputChecklist: ["一段空间和动势都稳定的源视频", "主体状态、光线和场景逻辑的连续性说明", "如果结尾构图很重要，可以准备尾帧目标"],
    commonPitfalls: ["把视频延展当成重新换场景", "源视频动势不清楚却期待自然续写", "没有说明哪些内容不能变"],
    outputNotes: ["好的延展应该像同一镜头的下几秒", "尾帧目标适合用于控制最终构图", "先检查光线和镜头惯性，再看细节"],
  },
  "seedance-2-fast": {
    bestFor: ["早期 Prompt 探索和快速方向测试", "最终渲染前比较多个运镜或节奏方案", "想先低成本判断运动逻辑是否可行的创作者"],
    inputChecklist: ["接近最终方向的 Prompt", "只放验证方向所需的参考素材", "提前定义什么时候切换到标准模型"],
    commonPitfalls: ["把探索结果当正式交付", "用过于松散的 Prompt 做测试", "在身份或细节要求很高时不做标准模型复审"],
    outputNotes: ["Fast 的价值是减少昂贵的最终模型试错", "测试应该回答方向、运动和节奏是否成立", "等工作流稳定后再切换模型"],
  },
  "motion-control-ai-video-generator": {
    bestFor: ["镜头路径、速度和主体动作比风格词更重要的场景", "推进、环绕、转场、动作戏和参考运镜工作流", "把运动当成生产变量审查的团队"],
    inputChecklist: ["分别写清主体动作、镜头路径、节奏和结尾状态", "运动很难文字描述时再加参考视频", "一个清楚的镜头目标，让运动服务表达"],
    commonPitfalls: ["只写电影感运动，却没说明什么在动", "把多个运镜塞进一个短片段", "只看画面好不好看，不看运动是否完成任务"],
    outputNotes: ["运镜控制应该让镜头更清楚，不只是更忙", "一个明确动作通常比多个竞争动作更稳", "最好的审查问题是：运动有没有完成它的工作"],
  },
  "consistent-character-ai-video-generator": {
    bestFor: ["角色身份必须保持可识别的视频", "虚拟人、吉祥物、头像和叙事连续性工作流", "把身份参考和动作参考拆开控制的团队"],
    inputChecklist: ["能看清脸、服装、轮廓和比例的角色参考", "说明哪些身份特征必须固定", "身份锁定后再加入动作或运镜参考"],
    commonPitfalls: ["角色还没锁定就加入强动作", "上传彼此冲突的角色版本", "加入过多风格变化，破坏身份稳定"],
    outputNotes: ["先审身份，再审特效和环境", "服装和轮廓常常和脸一样重要", "每个输入各司其职时，一致性会更稳"],
  },
  "product-ad-ai-video-generator": {
    bestFor: ["付费社媒产品短片、上新测试和广告概念", "把产品静图转成商业化运动镜头的团队", "材质、标签、灯光和最终定格都很重要的产品"],
    inputChecklist: ["一张形状、标签和材质清楚的产品静图", "一个广告镜头动作，例如推进、环绕、揭幕或扫光", "需要特定商业节奏时再加运镜参考"],
    commonPitfalls: ["从很弱的产品图开始，却期待高级广告质感", "在一个短镜头里塞太多卖点", "让运动遮挡产品，而不是销售产品"],
    outputNotes: ["产品是否清楚是第一审批门槛", "材质语言比笼统高级感更有效", "最后一帧应该仍然像一张能卖货的产品图"],
  },
};

export function getLandingPageInsights(slug: string, locale: string): LandingPageInsightBlock | null {
  const typedSlug = slug as LandingPageSlug;
  if (!(typedSlug in landingPageInsights)) return null;
  return locale === "zh" ? landingPageInsightsZh[typedSlug] : landingPageInsights[typedSlug];
}

export const landingPageSlugs = Object.keys(landingPages);
export const indexableLandingPageSlugs = landingPageSlugs;
