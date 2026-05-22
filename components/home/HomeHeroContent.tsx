type Props = { locale: string };

export default async function HomeHeroContent({ locale }: Props) {
  const isZh = locale === "zh";

  return (
    <div className="mx-auto flex max-w-4xl flex-col items-center space-y-5 text-center">
      <div className="inline-flex items-center gap-2 rounded-full border border-white/14 bg-black/24 px-4 py-2 text-sm text-white/80 shadow-[0_12px_40px_-24px_rgba(0,0,0,0.7)] backdrop-blur-xl">
        <span className="inline-flex h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_18px_rgba(103,232,249,0.75)]" />
        {isZh ? "Seedance 2 视频创作入口" : "Seedance 2 video creation"}
      </div>

      <div className="space-y-4">
        <h1 className="text-5xl font-semibold tracking-tight text-white sm:text-6xl lg:text-7xl">
          <span className="text-white">Seedance 2</span>
          <span className="block text-white/88">
            {isZh ? "AI 视频生成器" : "AI Video Generator"}
          </span>
        </h1>

        <p className="mx-auto max-w-2xl text-lg leading-8 text-white/78 sm:text-xl">
          {isZh
            ? "一句话起步，需要时再补充图片、视频或音频参考，把想法带入可控的视频工作流。"
            : "Start with one prompt, add image, video, or audio references when they help, and move into a controllable video workflow."}
        </p>
      </div>
    </div>
  );
}

export async function HomeHeroSupport({ locale }: Props) {
  const isZh = locale === "zh";

  return (
    <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-center gap-2 text-center text-xs text-white/62 sm:text-sm">
      <span className="rounded-full border border-white/10 bg-black/18 px-3 py-1.5 backdrop-blur-md">
        {isZh ? "图生视频" : "Image to video"}
      </span>
      <span className="rounded-full border border-white/10 bg-black/18 px-3 py-1.5 backdrop-blur-md">
        {isZh ? "文生视频" : "Text to video"}
      </span>
      <span className="rounded-full border border-white/10 bg-black/18 px-3 py-1.5 backdrop-blur-md">
        {isZh ? "参考动作" : "Reference motion"}
      </span>
      <span className="rounded-full border border-white/10 bg-black/18 px-3 py-1.5 backdrop-blur-md">
        {isZh ? "视频延展" : "Video extension"}
      </span>
    </div>
  );
}
