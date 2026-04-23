import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createServiceRoleClient } from "@/utils/supabase/service-role";
import { getProjectId } from "@/utils/supabase/project";

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

function sanitizeName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "-").replace(/-+/g, "-");
}

function buildStoragePath(projectId: string, userId: string, kind: UploadKind, fileName: string) {
  const safeName = sanitizeName(fileName);
  const date = new Date().toISOString().slice(0, 10);
  return `${projectId}/${userId}/staged/${date}/${kind}/${crypto.randomUUID()}-${safeName}`;
}

export async function POST(request: NextRequest) {
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

  const body = await request.json();
  const kind = body?.kind as UploadKind;
  const fileName = typeof body?.fileName === "string" ? body.fileName : "";
  const contentType = typeof body?.contentType === "string" ? body.contentType : "";
  const size = Number(body?.size || 0);

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
