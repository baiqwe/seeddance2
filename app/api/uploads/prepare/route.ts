import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createServiceRoleClient } from "@/utils/supabase/service-role";
import { getProjectId } from "@/utils/supabase/project";
import { isCloudflareDataBackend } from "@/utils/backend/runtime";
import { requireSessionUser } from "@/utils/backend/auth";
import { buildMediaObjectKey } from "@/utils/r2/server";
import { createR2SignedUploadUrl } from "@/utils/r2/presign";

export const runtime = "nodejs";

const BUCKET = "generation-inputs";

const LIMITS = {
  image: {
    maxBytes: 20 * 1024 * 1024,
    mimePrefixes: ["image/"],
  },
  video: {
    maxBytes: 250 * 1024 * 1024,
    mimePrefixes: ["video/"],
  },
  audio: {
    maxBytes: 50 * 1024 * 1024,
    mimePrefixes: ["audio/"],
  },
} as const;

type UploadKind = keyof typeof LIMITS;
type UploadPrepareBody = {
  kind?: UploadKind;
  fileName?: string;
  contentType?: string;
  size?: number | string;
};

function sanitizeName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "-").replace(/-+/g, "-");
}

function buildStoragePath(projectId: string, userId: string, kind: UploadKind, fileName: string) {
  const safeName = sanitizeName(fileName);
  const date = new Date().toISOString().slice(0, 10);
  return `${projectId}/${userId}/staged/${date}/${kind}/${crypto.randomUUID()}-${safeName}`;
}

function buildR2StoragePath(userId: string, kind: UploadKind, fileName: string) {
  const safeName = sanitizeName(fileName);
  const date = new Date().toISOString().slice(0, 10);
  return buildMediaObjectKey(["inputs", userId, date, kind, `${crypto.randomUUID()}-${safeName}`]);
}

function getR2PublicUrl(objectKey: string) {
  const baseUrl = process.env.R2_PUBLIC_BASE_URL?.trim();
  if (!baseUrl) {
    throw new Error("R2_PUBLIC_BASE_URL is not configured.");
  }

  return `${baseUrl.replace(/\/+$/, "")}/${objectKey}`;
}

export async function POST(request: NextRequest) {
  let body: UploadPrepareBody;

  try {
    body = (await request.json()) as UploadPrepareBody;
  } catch {
    return NextResponse.json({ error: "Invalid upload metadata" }, { status: 400 });
  }

  const kind = body.kind as UploadKind;
  const fileName = typeof body.fileName === "string" ? body.fileName : "";
  const contentType = typeof body.contentType === "string" ? body.contentType : "";
  const size = Number(body.size || 0);

  if (!kind || !LIMITS[kind]) {
    return NextResponse.json({ error: "Invalid upload kind" }, { status: 400 });
  }

  if (!fileName || !contentType || !size) {
    return NextResponse.json({ error: "Missing upload metadata" }, { status: 400 });
  }

  const rules = LIMITS[kind];
  if (size > rules.maxBytes) {
    return NextResponse.json({ error: "File exceeds size limit" }, { status: 413 });
  }

  if (!rules.mimePrefixes.some((prefix) => contentType.startsWith(prefix))) {
    return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
  }

  if (isCloudflareDataBackend()) {
    const user = await requireSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Please sign in before uploading assets." }, { status: 401 });
    }

    try {
      const path = buildR2StoragePath(user.id, kind, fileName);
      const signedUrl = await createR2SignedUploadUrl({
        objectKey: path,
        contentType,
      });

      return NextResponse.json({
        bucket: process.env.R2_BUCKET_NAME || "seedance2-media",
        path,
        signedUrl,
        publicUrl: getR2PublicUrl(path),
      });
    } catch (error: any) {
      return NextResponse.json(
        {
          error: error?.message || "Failed to prepare R2 upload.",
          code: "R2_UPLOAD_PREPARE_FAILED",
        },
        { status: 500 }
      );
    }
  }

  const supabase = await createClient();
  const serviceSupabase = createServiceRoleClient();
  const projectId = await getProjectId(serviceSupabase);

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const path = buildStoragePath(projectId, user.id, kind, fileName);
  const { data, error } = await serviceSupabase.storage.from(BUCKET).createSignedUploadUrl(path);

  if (error || !data) {
    return NextResponse.json({ error: error?.message || "Failed to prepare upload" }, { status: 500 });
  }

  const { data: publicUrlData } = serviceSupabase.storage.from(BUCKET).getPublicUrl(path);

  return NextResponse.json({
    bucket: BUCKET,
    path,
    token: data.token,
    signedUrl: data.signedUrl,
    publicUrl: publicUrlData.publicUrl,
  });
}
