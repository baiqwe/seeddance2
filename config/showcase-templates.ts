import { mediaAsset } from "@/config/media";
import type { VideoGenerationMode, VideoModelId } from "@/utils/video-generation";

export type ShowcaseReference = {
  type: "image" | "video" | "audio";
  label: string;
  labelZh: string;
  role: string;
  roleZh: string;
  thumbnail?: string;
};

export type ShowcaseTemplate = {
  id: string;
  mode: VideoGenerationMode;
  model: VideoModelId;
  title: string;
  titleZh: string;
  subtitle: string;
  subtitleZh: string;
  prompt: string;
  promptZh: string;
  ratio: string;
  duration: string;
  resolution: string;
  outputVideo?: string;
  poster: string;
  references: ShowcaseReference[];
  intent: string;
  intentZh: string;
  resultNotes: string[];
  resultNotesZh: string[];
};

export const showcaseTemplates: ShowcaseTemplate[] = [
  {
    id: "product-reveal",
    mode: "image_to_video",
    model: "bytedance/seedance-2",
    title: "Cinematic Product Reveal",
    titleZh: "电影感产品揭幕",
    subtitle: "A still product frame becomes a polished campaign shot.",
    subtitleZh: "用一张产品图搭出可付费广告镜头的质感。",
    prompt:
      "Use the product image as the locked hero subject. Place it on a black reflective table, add a slow cinematic push-in, a subtle specular sweep across the surface, and soft blue edge lighting. Keep the product shape stable and make the reveal feel premium, controlled, and campaign-ready.",
    promptZh:
      "以产品图作为锁定主体，把产品放在黑色镜面桌面上，镜头缓慢推进，表面有轻微高光扫过，边缘带冷蓝色补光。保持产品形状稳定，让揭幕感高级、克制、适合广告投放。",
    ratio: "16:9",
    duration: "15s",
    resolution: "720p",
    outputVideo: mediaAsset("/videos/gallery/kie/kie-seedance-09.mp4"),
    poster: mediaAsset("/images/gallery/kie/kie-seedance-09.jpg"),
    references: [
      {
        type: "image",
        label: "Product keyframe",
        labelZh: "产品关键帧",
        role: "Locks subject shape, materials, and hero composition.",
        roleZh: "锁定产品形状、材质和主视觉构图。",
        thumbnail: mediaAsset("/images/gallery/kie/kie-seedance-09.jpg"),
      },
    ],
    intent:
      "The image owns product identity. The prompt owns table material, lighting, camera push, and premium pacing.",
    intentZh:
      "图片负责产品身份和构图，Prompt 负责桌面材质、灯光、推进镜头和高级节奏。",
    resultNotes: ["Stable product silhouette", "Slow camera push", "Premium lighting sweep"],
    resultNotesZh: ["产品轮廓稳定", "镜头缓慢推进", "高光扫过更像广告片"],
  },
  {
    id: "character-consistency",
    mode: "image_to_video",
    model: "bytedance/seedance-2",
    title: "Character Consistency Shot",
    titleZh: "角色一致性镜头",
    subtitle: "A portrait keyframe controls identity while the prompt controls motion.",
    subtitleZh: "让角色图负责身份，Prompt 负责镜头和情绪。",
    prompt:
      "Use the portrait as the character identity reference. Keep the same hairstyle, face structure, wardrobe color, and soft studio lighting. Animate a slow head turn and a gentle camera drift from medium close-up to close-up, with floating dust particles and a quiet cinematic mood.",
    promptZh:
      "使用这张角色图作为身份参考，保持发型、面部结构、服装颜色和柔和棚拍光线一致。让角色缓慢转头，镜头从中近景轻微漂移到近景，空气中有细微尘埃粒子，整体氛围安静、电影感。",
    ratio: "9:16",
    duration: "15s",
    resolution: "720p",
    outputVideo: mediaAsset("/videos/gallery/kie/kie-seedance-05.mp4"),
    poster: mediaAsset("/images/gallery/kie/kie-seedance-05.jpg"),
    references: [
      {
        type: "image",
        label: "Character portrait",
        labelZh: "角色肖像",
        role: "Controls face, hairstyle, wardrobe, and opening frame.",
        roleZh: "控制脸部、发型、服装和起始画面。",
        thumbnail: mediaAsset("/images/gallery/kie/kie-seedance-05.jpg"),
      },
    ],
    intent:
      "The reference image prevents identity drift. The prompt adds camera drift, expression change, and atmosphere.",
    intentZh:
      "参考图减少身份漂移，Prompt 补充镜头漂移、表情变化和环境氛围。",
    resultNotes: ["Identity remains readable", "Portrait becomes motion", "Useful for creators and avatars"],
    resultNotesZh: ["身份特征清晰", "静态肖像被推进成动态镜头", "适合角色号和虚拟形象"],
  },
  {
    id: "motion-transfer",
    mode: "multi_modal_video",
    model: "bytedance/seedance-2",
    title: "Dance Motion Transfer",
    titleZh: "舞蹈动作迁移",
    subtitle: "Split identity and motion into separate references.",
    subtitleZh: "把角色和动作拆成两个输入，结果更容易理解。",
    prompt:
      "Keep the character styling from the image reference, but follow the timing, body rhythm, and camera energy from the dance reference clip. Generate a vertical short-form video with clean silhouettes, confident movement, and a punchy social-media pacing.",
    promptZh:
      "保留图片参考里的角色造型，但沿用舞蹈参考视频的动作节奏、身体律动和镜头能量。生成一个竖版短视频，人物轮廓清晰，动作自信，节奏适合社交媒体传播。",
    ratio: "9:16",
    duration: "15s",
    resolution: "720p",
    outputVideo: mediaAsset("/videos/gallery/kie/kie-seedance-02.mp4"),
    poster: mediaAsset("/images/gallery/kie/kie-seedance-02.jpg"),
    references: [
      {
        type: "image",
        label: "Character style",
        labelZh: "角色造型",
        role: "Keeps outfit, body type, and visual identity stable.",
        roleZh: "保持服装、体型和视觉身份稳定。",
        thumbnail: mediaAsset("/images/gallery/kie/kie-seedance-05.jpg"),
      },
      {
        type: "video",
        label: "Motion reference",
        labelZh: "动作参考",
        role: "Provides choreography timing, pose rhythm, and camera energy.",
        roleZh: "提供舞蹈节奏、姿态变化和镜头能量。",
        thumbnail: mediaAsset("/images/gallery/kie/kie-seedance-02.jpg"),
      },
    ],
    intent:
      "Image controls identity. Video controls motion. Prompt defines short-form pacing and output style.",
    intentZh:
      "图片控制身份，视频控制动作，Prompt 定义短视频节奏和最终风格。",
    resultNotes: ["Clear input separation", "Better motion readability", "Strong short-video use case"],
    resultNotesZh: ["输入职责清晰", "动作更容易被理解", "适合短视频批量创作"],
  },
  {
    id: "storyboard-previs",
    mode: "multi_modal_video",
    model: "bytedance/seedance-2",
    title: "Storyboard to Previs",
    titleZh: "分镜到影视预演",
    subtitle: "Use keyframes and camera notes to test a scene before production.",
    subtitleZh: "用关键帧和镜头说明先验证场面调度。",
    prompt:
      "Turn the storyboard frame into a continuous cinematic previs shot. Keep the autumn forest setting, preserve the character blocking, and use the reference clip only for camera travel and action timing. Make the movement readable, not chaotic, with a clean beginning, middle, and ending beat.",
    promptZh:
      "把这张分镜帧扩展成连续的电影预演镜头。保持秋林场景和角色站位，只把参考视频用于运镜和动作节奏。动作要清晰可读，不要混乱，并且有明确的起、承、收节拍。",
    ratio: "16:9",
    duration: "15s",
    resolution: "720p",
    outputVideo: mediaAsset("/videos/gallery/kie/kie-seedance-07.mp4"),
    poster: mediaAsset("/images/gallery/kie/kie-seedance-07.jpg"),
    references: [
      {
        type: "image",
        label: "Storyboard frame",
        labelZh: "分镜关键帧",
        role: "Defines scene geography, subject placement, and opening composition.",
        roleZh: "定义场景空间、人物位置和起始构图。",
        thumbnail: mediaAsset("/images/gallery/kie/kie-seedance-07.jpg"),
      },
      {
        type: "video",
        label: "Camera rhythm",
        labelZh: "镜头节奏",
        role: "Guides camera travel and action pacing without replacing the scene.",
        roleZh: "引导镜头推进和动作节奏，但不替代场景设定。",
        thumbnail: mediaAsset("/images/gallery/kie/kie-seedance-11.jpg"),
      },
    ],
    intent:
      "The storyboard owns space and blocking. The motion reference owns rhythm. The prompt keeps the shot readable.",
    intentZh:
      "分镜负责空间和站位，视频参考负责节奏，Prompt 保证镜头可读性。",
    resultNotes: ["Useful before production", "Camera logic is visible", "Good for short-drama teams"],
    resultNotesZh: ["适合拍摄前预演", "运镜逻辑可见", "短剧和广告团队容易理解"],
  },
  {
    id: "text-concept",
    mode: "text_to_video",
    model: "bytedance/seedance-2-fast",
    title: "Text Concept Test",
    titleZh: "文本概念验证",
    subtitle: "Start with only a sentence before adding expensive references.",
    subtitleZh: "先用一句话判断方向，再决定是否补参考。",
    prompt:
      "A futuristic courier runs through a neon city street at night in light rain. Low-angle tracking shot, reflective pavement, clean cinematic frame, tense but elegant pacing, blue and amber color contrast, no chaotic camera shake.",
    promptZh:
      "一名未来城市快递员在雨夜穿过霓虹街道。低角度跟拍，地面有反光，画面干净有电影感，节奏紧张但优雅，蓝色和琥珀色形成对比，不要混乱的镜头抖动。",
    ratio: "16:9",
    duration: "15s",
    resolution: "720p",
    outputVideo: mediaAsset("/videos/gallery/kie/kie-seedance-06.mp4"),
    poster: mediaAsset("/images/gallery/kie/kie-seedance-06.jpg"),
    references: [],
    intent:
      "No references are used. The prompt must carry subject, camera, lighting, pacing, and negative direction.",
    intentZh:
      "不使用参考素材，Prompt 需要同时承担主体、镜头、光线、节奏和负向约束。",
    resultNotes: ["Lowest setup cost", "Good for concept validation", "Add references later if needed"],
    resultNotesZh: ["准备成本最低", "适合先验证概念", "方向对了再补参考素材"],
  },
];
