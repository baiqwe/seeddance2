"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useUser } from "@/hooks/use-user";
import { createClient } from "@/utils/supabase/client";

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

export function useProcessingGenerations() {
  const { user } = useUser();
  const [generations, setGenerations] = useState<ProcessingGeneration[]>([]);
  const [loading, setLoading] = useState(true);
  const pollAttemptRef = useRef(0);
  const supabase = useMemo(() => createClient(), []);

  const fetchGenerations = useCallback(async () => {
    if (!user) {
      setGenerations([]);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/ai/generate?limit=8", { cache: "no-store" });
      const data = await response.json();
      if (response.ok) {
        setGenerations(data.generations || []);
        pollAttemptRef.current = Math.min(
          data.generations?.length > 0 ? pollAttemptRef.current + 1 : 0,
          12
        );
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void fetchGenerations();
    if (!user) return;
    let cancelled = false;
    let timer: number | null = null;

    const scheduleNextPoll = () => {
      if (cancelled) return;
      const activeCount = generations.length;
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

    const channel = supabase
      .channel(`processing-generations-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "generations",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          pollAttemptRef.current = 0;
          void fetchGenerations();
        }
      )
      .subscribe();

    scheduleNextPoll();

    return () => {
      cancelled = true;
      if (timer) {
        window.clearTimeout(timer);
      }
      void supabase.removeChannel(channel);
    };
  }, [fetchGenerations, generations.length, supabase, user]);

  return {
    generations,
    loading,
    refetch: fetchGenerations,
  };
}
