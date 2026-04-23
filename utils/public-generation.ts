import { createServiceRoleClient } from "@/utils/supabase/service-role";
import { getProjectId } from "@/utils/supabase/project";
import { toDeliveredVideoUrl } from "@/utils/video-delivery";

export type PublicGeneration = {
  id: string;
  prompt: string;
  status: string;
  status_detail: string | null;
  created_at: string;
  credits_cost: number;
  resolution: string | null;
  duration_seconds: number | null;
  aspect_ratio: string | null;
  generation_type: string | null;
  output_video_url: string;
  thumbnail_url: string | null;
  image_url: string | null;
  metadata: Record<string, any> | null;
  input_images: Array<{ id?: string; url?: string }> | null;
  input_videos: Array<{ id?: string; url?: string }> | null;
  input_audios: Array<{ id?: string; url?: string }> | null;
};

function pickThumbnail(generation: {
  metadata?: Record<string, any> | null;
  image_url?: string | null;
  input_images?: Array<{ url?: string }> | null;
}) {
  const metadata = generation.metadata || {};
  const candidates = [
    metadata.thumbnailUrl,
    metadata.thumbnail_url,
    metadata.posterUrl,
    metadata.poster_url,
    generation.image_url,
    generation.input_images?.[0]?.url,
  ];

  return candidates.find((candidate) => typeof candidate === "string" && candidate.trim()) || null;
}

export async function getPublicGenerationById(id: string): Promise<PublicGeneration | null> {
  const supabase = createServiceRoleClient();
  const projectId = await getProjectId(supabase);

  const { data, error } = await supabase
    .from("generations")
    .select(
      "id, prompt, status, status_detail, created_at, credits_cost, resolution, duration_seconds, aspect_ratio, generation_type, output_video_url, image_url, metadata, input_images, input_videos, input_audios"
    )
    .eq("project_id", projectId)
    .eq("id", id)
    .single();

  if (error || !data?.output_video_url) {
    return null;
  }

  if (!["succeeded", "completed"].includes(data.status)) {
    return null;
  }

  const metadata = (data.metadata || {}) as Record<string, any>;
  if (metadata.sharePublic === false) {
    return null;
  }

  return {
    ...data,
    output_video_url: toDeliveredVideoUrl(data.output_video_url) || data.output_video_url,
    thumbnail_url: pickThumbnail(data),
  };
}
