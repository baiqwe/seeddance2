"use client";

import Link from "next/link";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  Loader2,
  RefreshCw,
  Video,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProcessingGeneration, useProcessingGenerations } from "@/hooks/use-processing-generations";

const ACTIVE_STATUSES = new Set(["pending", "queued", "processing", "awaiting_provider"]);
const SUCCESS_STATUSES = new Set(["succeeded", "completed"]);
const FAILED_STATUSES = new Set(["failed", "error"]);

function formatGenerationMode(mode: string | null, isZh: boolean) {
  const labels: Record<string, { en: string; zh: string }> = {
    multi_modal_video: { en: "Multi-reference Video", zh: "多参考视频" },
    image_to_video: { en: "Image to Video", zh: "图生视频" },
    text_to_video: { en: "Text to Video", zh: "文生视频" },
    video_extension: { en: "Video Extension", zh: "视频延展" },
  };

  if (!mode) return isZh ? "视频生成" : "Video Generation";
  return isZh ? labels[mode]?.zh ?? mode : labels[mode]?.en ?? mode;
}

function formatGenerationDate(value: string, locale: string) {
  try {
    return new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : "en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function formatStatus(generation: ProcessingGeneration, isZh: boolean) {
  const status = generation.status;
  if (SUCCESS_STATUSES.has(status)) return isZh ? "已完成" : "Succeeded";
  if (FAILED_STATUSES.has(status)) return isZh ? "失败" : "Failed";
  if (status === "pending" || status === "queued") return isZh ? "排队中" : "Queued";
  if (status === "awaiting_provider") return isZh ? "等待服务商" : "Awaiting provider";
  if (status === "processing") return isZh ? "生成中" : "Processing";
  return generation.status_detail || status;
}

function getStatusTone(status: string) {
  if (SUCCESS_STATUSES.has(status)) {
    return "border-emerald-400/25 bg-emerald-400/10 text-emerald-300";
  }

  if (FAILED_STATUSES.has(status)) {
    return "border-destructive/30 bg-destructive/10 text-destructive";
  }

  return "border-primary/30 bg-primary/10 text-primary";
}

export function ProcessingGenerationsCard({ locale = "en" }: { locale?: string }) {
  const { generations, loading, pagination, page, setPage, refetch } = useProcessingGenerations();
  const isZh = locale === "zh";
  const activeCount = generations.filter((generation) =>
    ACTIVE_STATUSES.has(generation.status)
  ).length;
  const canGoPrevious = page > 1;
  const canGoNext = page < pagination.totalPages;

  return (
    <div className="overflow-hidden rounded-[26px] border border-border/70 bg-card">
      <div className="flex flex-col gap-4 border-b border-border/70 px-5 py-5 sm:flex-row sm:items-start sm:justify-between sm:px-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-primary/10 p-2.5">
              <Video className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold tracking-tight">
                {isZh ? "生成历史" : "Generation History"}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {isZh
                  ? `当前 ${activeCount} 个任务仍在生成中，共 ${pagination.total} 条记录。`
                  : `${activeCount} active jobs, ${pagination.total} total records.`}
              </p>
            </div>
          </div>
        </div>
        <Button variant="outline" size="sm" className="self-start" onClick={() => void refetch()}>
          <RefreshCw className="mr-2 h-4 w-4" />
          {isZh ? "刷新" : "Refresh"}
        </Button>
      </div>

      <div className="overflow-x-auto">
        {loading ? (
          <div className="flex items-center gap-2 px-6 py-10 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            {isZh ? "正在同步任务…" : "Syncing jobs..."}
          </div>
        ) : generations.length === 0 ? (
          <div className="px-6 py-12 text-sm text-muted-foreground">
            {isZh
              ? "还没有生成任务。进入创作中心提交第一条视频后，这里会显示生成状态和下载入口。"
              : "No generation jobs yet. Submit your first video from the creation center, then return here for status, previews, and downloads."}
          </div>
        ) : (
          <table className="min-w-[980px] text-left text-sm">
            <thead>
              <tr className="border-b border-border/70 bg-muted/25 text-xs uppercase tracking-[0.22em] text-muted-foreground">
                <th className="w-[30%] px-6 py-4 font-semibold">{isZh ? "Prompt" : "Prompt"}</th>
                <th className="px-4 py-4 font-semibold">{isZh ? "创建时间" : "Created"}</th>
                <th className="px-4 py-4 font-semibold">{isZh ? "状态" : "Status"}</th>
                <th className="px-4 py-4 font-semibold">{isZh ? "模式" : "Mode"}</th>
                <th className="px-4 py-4 font-semibold">{isZh ? "画幅 / 清晰度" : "Aspect / Resolution"}</th>
                <th className="px-4 py-4 font-semibold">{isZh ? "积分" : "Credits"}</th>
                <th className="px-6 py-4 font-semibold">{isZh ? "操作" : "Actions"}</th>
              </tr>
            </thead>
            <tbody>
              {generations.map((generation) => {
                const hasOutput = Boolean(generation.output_video_url);
                return (
                  <tr key={generation.id} className="border-b border-border/60 last:border-b-0">
                    <td className="px-6 py-5">
                      <div className="line-clamp-2 max-w-[38ch] text-foreground">
                        {generation.prompt || (isZh ? "未命名任务" : "Untitled job")}
                      </div>
                      <div className="mt-1 font-mono text-[11px] text-muted-foreground">
                        {generation.id.slice(0, 8)}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-5 text-muted-foreground">
                      {formatGenerationDate(generation.created_at, locale)}
                    </td>
                    <td className="px-4 py-5">
                      <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs ${getStatusTone(generation.status)}`}>
                        {SUCCESS_STATUSES.has(generation.status) ? (
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        ) : FAILED_STATUSES.has(generation.status) ? (
                          <XCircle className="h-3.5 w-3.5" />
                        ) : (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        )}
                        {formatStatus(generation, isZh)}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-5 text-muted-foreground">
                      {formatGenerationMode(generation.generation_type, isZh)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-5 text-muted-foreground">
                      {generation.aspect_ratio || "16:9"} / {generation.resolution || "720p"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-5 text-muted-foreground">
                      {generation.credits_cost}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-wrap gap-2">
                        {hasOutput ? (
                          <>
                            <Link
                              href={`/${locale}/video/${generation.id}`}
                              className="inline-flex items-center rounded-full border border-border bg-background px-3 py-2 text-xs font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary"
                            >
                              <Eye className="mr-1.5 h-3.5 w-3.5" />
                              {isZh ? "预览" : "Preview"}
                            </Link>
                            <a
                              href={generation.output_video_url ?? "#"}
                              download
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center rounded-full bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                            >
                              <Download className="mr-1.5 h-3.5 w-3.5" />
                              {isZh ? "下载" : "Download"}
                            </a>
                          </>
                        ) : (
                          <span className="inline-flex items-center rounded-full border border-border/70 bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
                            {ACTIVE_STATUSES.has(generation.status)
                              ? isZh ? "生成中" : "Rendering"
                              : isZh ? "暂无结果" : "No output"}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {pagination.total > pagination.limit ? (
        <div className="flex flex-col gap-3 border-t border-border/70 px-5 py-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            {isZh
              ? `第 ${pagination.page} / ${pagination.totalPages} 页，共 ${pagination.total} 条`
              : `Page ${pagination.page} of ${pagination.totalPages}, ${pagination.total} total`}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!canGoPrevious}
              onClick={() => setPage(Math.max(1, page - 1))}
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              {isZh ? "上一页" : "Previous"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!canGoNext}
              onClick={() => setPage(Math.min(pagination.totalPages, page + 1))}
            >
              {isZh ? "下一页" : "Next"}
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
