"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useUser } from "@/hooks/use-user";

export type ProcessingGeneration = {
  id: string;
  status: string;
  status_detail: string | null;
  created_at: string;
  prompt: string;
  credits_cost: number;
  resolution: string | null;
  duration_seconds: number | null;
  aspect_ratio: string | null;
  generation_type: string | null;
  provider_job_id: string | null;
  output_video_url: string | null;
  metadata?: Record<string, unknown> | null;
};

export type GenerationHistoryPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

const ACTIVE_STATUSES = new Set(["pending", "queued", "processing", "awaiting_provider"]);
const PAGE_SIZE = 8;

export function useProcessingGenerations() {
  const { user } = useUser();
  const [generations, setGenerations] = useState<ProcessingGeneration[]>([]);
  const [pagination, setPagination] = useState<GenerationHistoryPagination>({
    page: 1,
    limit: PAGE_SIZE,
    total: 0,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const pollAttemptRef = useRef(0);

  const fetchGenerations = useCallback(async () => {
    type ProcessingGenerationsResponse = {
      generations?: ProcessingGeneration[];
      pagination?: GenerationHistoryPagination;
    };

    if (!user) {
      setGenerations([]);
      setPagination({
        page: 1,
        limit: PAGE_SIZE,
        total: 0,
        totalPages: 1,
      });
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/ai/generate?limit=${PAGE_SIZE}&page=${page}`, { cache: "no-store" });
      const data = (await response.json()) as ProcessingGenerationsResponse;
      if (response.ok) {
        const generations = data.generations ?? [];
        setGenerations(generations);
        setPagination(data.pagination ?? {
          page,
          limit: PAGE_SIZE,
          total: generations.length,
          totalPages: 1,
        });
        const activeCount = generations.filter((generation) =>
          ACTIVE_STATUSES.has(generation.status)
        ).length;
        pollAttemptRef.current = Math.min(
          activeCount > 0 ? pollAttemptRef.current + 1 : 0,
          12
        );
      }
    } finally {
      setLoading(false);
    }
  }, [page, user]);

  useEffect(() => {
    void fetchGenerations();
    if (!user) return;
    let cancelled = false;
    let timer: number | null = null;

    const scheduleNextPoll = () => {
      if (cancelled) return;
      const activeCount = generations.filter((generation) =>
        ACTIVE_STATUSES.has(generation.status)
      ).length;
      const attempt = pollAttemptRef.current;
      const delay =
        document.visibilityState === "hidden"
          ? 15000
          : activeCount === 0
            ? 12000
            : attempt < 3
              ? 3000
              : attempt < 8
                ? 5000
                : 10000;

      timer = window.setTimeout(() => {
        void fetchGenerations().finally(scheduleNextPoll);
      }, delay);
    };

    scheduleNextPoll();

    return () => {
      cancelled = true;
      if (timer) {
        window.clearTimeout(timer);
      }
    };
  }, [fetchGenerations, generations.length, user]);

  return {
    generations,
    pagination,
    loading,
    page,
    setPage,
    refetch: fetchGenerations,
  };
}
