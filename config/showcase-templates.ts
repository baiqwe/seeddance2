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
  previewRatio?: string;
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
    title: "Golden-Hour Fabric Lifestyle Shot",
    titleZh: "夕阳布料生活方式镜头",
    subtitle: "A single lifestyle keyframe becomes a warm, slow-moving textile ad.",
    subtitleZh: "用一张生活方式关键帧，生成温暖、缓慢、有布料质感的广告镜头。",
    prompt:
      "Use the provided balcony image as the first frame and preserve the woman in a red dress, the laundry basket, the white linen, and the warm rooftop sunset. Animate a gentle lifestyle shot: the woman slowly lifts and folds the fabric, the hanging sheets move slightly in the breeze, the sunlight flares through the cloth, and the camera holds a calm medium shot with a subtle push-in. Keep the linen texture sharp, keep the orange backlight, no new location, no extra people, no fast cuts.",
    promptZh:
      "使用这张阳台图片作为首帧，保留穿红裙的女性、洗衣篮、白色亚麻布和屋顶夕阳逆光。生成一个柔和的生活方式镜头：女性缓慢拿起并整理布料，晾晒的床单被微风轻轻带动，阳光从布料边缘穿透，镜头保持中景并轻微推进。保持亚麻纹理清晰、橙色逆光稳定，不换场景、不增加人物、不做快速剪辑。",
    ratio: "16:9",
    duration: "08s",
    resolution: "720p",
    outputVideo: mediaAsset("/videos/gallery/kie/kie-seedance-09.mp4"),
    poster: mediaAsset("/images/gallery/kie/kie-seedance-09.jpg"),
    references: [
      {
        type: "image",
        label: "First frame: balcony textile scene",
        labelZh: "首帧：阳台布料场景",
        role: "Locks the woman, linen texture, laundry basket, sunset light, and balcony composition.",
        roleZh: "锁定女性、布料纹理、洗衣篮、夕阳逆光和阳台构图。",
        thumbnail: mediaAsset("/images/gallery/kie/kie-seedance-09.jpg"),
      },
    ],
    intent:
      "The image locks the exact subject, textile props, and sunset color. The prompt only adds cloth movement, gentle hand motion, and a slow advertising-style camera push.",
    intentZh:
      "图片锁定主体、布料道具和夕阳色彩，Prompt 只负责布料运动、自然手部动作和缓慢广告式推进。",
    resultNotes: ["Same balcony and red dress", "Cloth moves from the prompt", "Slow ad-style camera rhythm"],
    resultNotesZh: ["阳台和红裙保持一致", "布料运动来自 Prompt", "镜头节奏偏慢广告片"],
  },
  {
    id: "character-consistency",
    mode: "image_to_video",
    model: "bytedance/seedance-2",
    title: "Character Consistency Shot",
    titleZh: "角色一致性镜头",
    subtitle: "The portrait holds identity while the prompt adds a controlled close-up move.",
    subtitleZh: "肖像图负责身份稳定，Prompt 负责近景运镜和情绪。",
    prompt:
      "Use the portrait image as the identity anchor. Preserve the same face shape, hairstyle, skin tone, clothing color, and soft studio lighting. Create a slow cinematic portrait video: the subject turns the head slightly toward camera, eyes shift gently, hair moves with a light indoor breeze, and the camera drifts from medium close-up to close-up. Keep the background minimal, no outfit change, no face morphing.",
    promptZh:
      "使用这张肖像图作为身份锚点，保持脸型、发型、肤色、服装颜色和柔和棚拍光线一致。生成一个缓慢的电影感肖像视频：角色轻微转头看向镜头，眼神自然移动，头发被室内微风轻轻带动，镜头从中近景漂移到近景。背景保持简洁，不换服装，不让脸部变形。",
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
        role: "Controls face identity, hairstyle, wardrobe color, and the opening close-up.",
        roleZh: "控制脸部身份、发型、服装颜色和起始近景。",
        thumbnail: mediaAsset("/images/gallery/kie/kie-seedance-05.jpg"),
      },
    ],
    intent:
      "The reference image keeps the person recognizable. The prompt adds only the head turn, eye movement, hair motion, and camera drift.",
    intentZh:
      "参考图保证人物可识别，Prompt 只添加转头、眼神、发丝运动和镜头漂移。",
    resultNotes: ["Face stays recognizable", "Motion is intentionally subtle", "Good for character consistency"],
    resultNotesZh: ["脸部身份保持可识别", "运动幅度刻意克制", "适合角色一致性"],
  },
  {
    id: "motion-transfer",
    mode: "multi_modal_video",
    model: "bytedance/seedance-2",
    title: "Dance Motion Transfer",
    titleZh: "舞蹈动作迁移",
    subtitle: "Use one input for the performer look and another for choreography rhythm.",
    subtitleZh: "一个输入负责角色造型，另一个输入负责舞蹈节奏。",
    prompt:
      "Create a short-form dance video by separating identity and motion. Keep the character styling, outfit silhouette, body type, and color palette from the image reference, then follow the choreography timing, pose transitions, and camera energy from the motion clip. Generate confident full-body movement with clean silhouettes, stable framing, and punchy social-media pacing. Do not change the character into the dancer from the reference video.",
    promptZh:
      "把身份和动作拆开生成短视频：保留图片参考里的角色造型、服装轮廓、体型和色彩，再沿用动作视频里的舞蹈节奏、姿态转换和镜头能量。生成自信的全身舞蹈动作，人物轮廓清晰，构图稳定，节奏适合社交媒体传播。不要把角色替换成动作参考视频里的人。",
    ratio: "16:9",
    duration: "15s",
    resolution: "720p",
    outputVideo: mediaAsset("/videos/gallery/kie/kie-seedance-02.mp4"),
    poster: mediaAsset("/images/gallery/kie/kie-seedance-02.jpg"),
    references: [
      {
        type: "image",
        label: "Character style",
        labelZh: "角色造型",
        role: "Locks the new performer identity: outfit, body shape, and color palette.",
        roleZh: "锁定新角色身份：服装、体型和色彩。",
        thumbnail: mediaAsset("/images/gallery/kie/kie-seedance-05.jpg"),
      },
      {
        type: "video",
        label: "Motion reference",
        labelZh: "动作参考",
        role: "Provides choreography timing, pose transitions, and camera energy.",
        roleZh: "提供舞蹈节奏、姿态切换和镜头能量。",
        thumbnail: mediaAsset("/images/gallery/kie/kie-seedance-02.jpg"),
      },
    ],
    intent:
      "The image decides who performs. The video decides how they move. The prompt prevents identity replacement and keeps the clip social-ready.",
    intentZh:
      "图片决定谁来跳，视频决定怎么动，Prompt 防止身份被替换并控制短视频节奏。",
    resultNotes: ["Identity and motion are separated", "Prompt prevents dancer replacement", "Designed for full-frame choreography previews"],
    resultNotesZh: ["身份和动作分开控制", "Prompt 防止角色被替换", "适合完整画幅的动作预览"],
  },
  {
    id: "storyboard-previs",
    mode: "multi_modal_video",
    model: "bytedance/seedance-2",
    title: "Storyboard to Previs",
    titleZh: "分镜到影视预演",
    subtitle: "Use keyframes plus motion rhythm to preview action blocking.",
    subtitleZh: "用关键帧和运动节奏预演动作场面调度。",
    prompt:
      "Use the autumn forest warrior image as the storyboard keyframe. Preserve the orange leaves, the spear-wielding character, the opponent distance, and the wide cinematic composition. Use the reference motion clip only to guide camera travel, attack timing, and action rhythm. Generate a readable previs sequence: the camera pushes forward, the warrior advances into the spear motion, the opponent remains spatially consistent, and the shot has a clear start, impact beat, and ending hold. Avoid chaotic cuts and do not change the forest location.",
    promptZh:
      "使用秋林武士图片作为分镜关键帧，保留橙色树林、持枪角色、对手距离和宽幅电影构图。只用动作参考视频来引导运镜推进、攻击时机和动作节奏。生成一个可读的预演镜头：镜头向前推进，武士进入长枪动作，对手空间位置保持一致，并有清楚的开始、冲击节拍和结束停顿。避免混乱剪辑，不改变森林场景。",
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
        role: "Defines the forest location, warrior position, opponent spacing, and opening composition.",
        roleZh: "定义森林场景、武士位置、对手距离和起始构图。",
        thumbnail: mediaAsset("/images/gallery/kie/kie-seedance-07.jpg"),
      },
      {
        type: "video",
        label: "Camera rhythm",
        labelZh: "镜头节奏",
        role: "Guides camera travel, attack timing, and action pacing without replacing the scene.",
        roleZh: "引导运镜、攻击时机和动作节奏，但不替代场景设定。",
        thumbnail: mediaAsset("/images/gallery/kie/kie-seedance-11.jpg"),
      },
    ],
    intent:
      "The storyboard controls what the scene is. The motion clip controls timing. The prompt tells the model what must remain stable during the action.",
    intentZh:
      "分镜控制场景是什么，动作视频控制节奏，Prompt 明确哪些元素在动作中必须稳定。",
    resultNotes: ["Forest and blocking stay consistent", "Motion reference guides timing", "Previs-style readable action"],
    resultNotesZh: ["森林和站位保持一致", "动作参考引导节奏", "预演式动作更可读"],
  },
  {
    id: "text-concept",
    mode: "text_to_video",
    model: "bytedance/seedance-2-fast",
    title: "Text Concept Test",
    titleZh: "文本概念验证",
    subtitle: "A text-only setup shows what must be specified when there are no references.",
    subtitleZh: "无参考素材时，Prompt 必须把主体、镜头和氛围都写清楚。",
    prompt:
      "A futuristic courier runs through a crowded neon city street at night in light rain. Low-angle handheld tracking shot from behind, reflective wet pavement, blue and amber shop lights, pedestrians passing in motion blur, tense short-drama urgency, clean cinematic framing, no chaotic shake, no sudden scene change, no cartoon style.",
    promptZh:
      "一名未来城市快递员在雨夜穿过拥挤的霓虹街道。低角度手持跟拍，从背后追随角色，潮湿地面有反光，蓝色和琥珀色店铺灯光交错，路人以运动模糊掠过，节奏有短剧追逐的紧张感，画面保持干净电影感，不要混乱抖动，不突然换场景，不要卡通风格。",
    ratio: "16:9",
    duration: "15s",
    resolution: "720p",
    outputVideo: mediaAsset("/videos/gallery/kie/kie-seedance-06.mp4"),
    poster: mediaAsset("/images/gallery/kie/kie-seedance-06.jpg"),
    references: [],
    intent:
      "With no references, every visible choice has to live inside the prompt: subject, camera angle, light color, crowd behavior, and what to avoid.",
    intentZh:
      "没有参考素材时，主体、机位、灯光颜色、人群运动和负向约束都必须写进 Prompt。",
    resultNotes: ["Prompt carries all visible direction", "Useful before adding references", "Good for concept validation"],
    resultNotesZh: ["所有画面方向都由 Prompt 承担", "适合补参考前先验证", "适合概念验证"],
  },
];
