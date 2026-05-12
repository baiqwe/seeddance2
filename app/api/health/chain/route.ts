import { NextResponse } from "next/server";
import { getPreferredDataBackend } from "@/utils/backend/runtime";
import { getOptionalCloudflareEnv } from "@/utils/cloudflare/context";

export const runtime = "nodejs";

type CheckResult = {
  ok: boolean;
  detail: string;
};

function envPresent(value: string | undefined | null) {
  return Boolean(value && value.trim().length > 0);
}

async function hasTable(name: string) {
  const env = getOptionalCloudflareEnv();
  if (!env?.DB) {
    return false;
  }

  const result = await env.DB.prepare(
    "SELECT name FROM sqlite_master WHERE type = 'table' AND name = ? LIMIT 1"
  )
    .bind(name)
    .first<{ name: string } | null>();

  return Boolean(result?.name);
}

export async function GET(request: Request) {
  const requiredToken = process.env.HEALTHCHECK_TOKEN?.trim();
  if (requiredToken) {
    // Optional protection for production environments.
    // If HEALTHCHECK_TOKEN is configured, clients must pass ?token=...
    // to avoid exposing setup details publicly.
    const requestUrl = new URL(request.url);
    const providedToken = requestUrl.searchParams.get("token")?.trim();
    if (providedToken !== requiredToken) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }
  }

  const backend = getPreferredDataBackend();
  const env = getOptionalCloudflareEnv();

  const checks: Record<string, CheckResult> = {
    data_backend: {
      ok: backend === "cloudflare",
      detail:
        backend === "cloudflare"
          ? "DATA_BACKEND is cloudflare (or D1 binding auto-detected)."
          : "Currently resolved to supabase. Set DATA_BACKEND=cloudflare and ensure D1 binding exists.",
    },
    cloudflare_d1_binding: {
      ok: Boolean(env?.DB),
      detail: env?.DB ? "D1 binding (DB) is present." : "Missing D1 binding: env.DB",
    },
    cloudflare_r2_binding: {
      ok: Boolean(env?.MEDIA_BUCKET),
      detail: env?.MEDIA_BUCKET ? "R2 binding (MEDIA_BUCKET) is present." : "Missing R2 binding: env.MEDIA_BUCKET",
    },
    cloudflare_kv_binding: {
      ok: Boolean(env?.RATE_LIMIT_KV),
      detail: env?.RATE_LIMIT_KV ? "KV binding (RATE_LIMIT_KV) is present." : "Missing KV binding: env.RATE_LIMIT_KV",
    },
    auth_secret: {
      ok: envPresent(process.env.AUTH_SECRET),
      detail: envPresent(process.env.AUTH_SECRET) ? "AUTH_SECRET configured." : "AUTH_SECRET is missing.",
    },
    google_oauth: {
      ok: envPresent(process.env.AUTH_GOOGLE_ID) && envPresent(process.env.AUTH_GOOGLE_SECRET),
      detail:
        envPresent(process.env.AUTH_GOOGLE_ID) && envPresent(process.env.AUTH_GOOGLE_SECRET)
          ? "Google OAuth credentials configured."
          : "AUTH_GOOGLE_ID or AUTH_GOOGLE_SECRET is missing.",
    },
    kie_api: {
      ok: envPresent(process.env.KIE_API_KEY),
      detail: envPresent(process.env.KIE_API_KEY) ? "KIE_API_KEY configured." : "KIE_API_KEY is missing.",
    },
    kie_api_url: {
      ok: envPresent(process.env.KIE_API_URL) || envPresent(process.env.KIE_API_UR),
      detail:
        envPresent(process.env.KIE_API_URL) || envPresent(process.env.KIE_API_UR)
          ? "KIE_API_URL configured."
          : "KIE_API_URL is missing (fallback default will be used: https://api.kie.ai/api/v1).",
    },
    kie_callback_secret: {
      ok: envPresent(process.env.KIE_CALLBACK_SECRET),
      detail: envPresent(process.env.KIE_CALLBACK_SECRET)
        ? "KIE_CALLBACK_SECRET configured."
        : "KIE_CALLBACK_SECRET is missing.",
    },
    creem_api: {
      ok: envPresent(process.env.CREEM_API_KEY),
      detail: envPresent(process.env.CREEM_API_KEY) ? "CREEM_API_KEY configured." : "CREEM_API_KEY is missing.",
    },
    creem_webhook_secret: {
      ok: envPresent(process.env.CREEM_WEBHOOK_SECRET),
      detail: envPresent(process.env.CREEM_WEBHOOK_SECRET)
        ? "CREEM_WEBHOOK_SECRET configured."
        : "CREEM_WEBHOOK_SECRET is missing.",
    },
    resend_api: {
      ok: envPresent(process.env.RESEND_API_KEY),
      detail: envPresent(process.env.RESEND_API_KEY)
        ? "RESEND_API_KEY configured."
        : "RESEND_API_KEY is missing (forgot-password email will not send).",
    },
    r2_signed_upload_env: {
      ok:
        envPresent(process.env.R2_ACCOUNT_ID) &&
        envPresent(process.env.R2_ACCESS_KEY_ID) &&
        envPresent(process.env.R2_SECRET_ACCESS_KEY) &&
        envPresent(process.env.R2_BUCKET_NAME) &&
        envPresent(process.env.R2_PUBLIC_BASE_URL),
      detail:
        envPresent(process.env.R2_ACCOUNT_ID) &&
        envPresent(process.env.R2_ACCESS_KEY_ID) &&
        envPresent(process.env.R2_SECRET_ACCESS_KEY) &&
        envPresent(process.env.R2_BUCKET_NAME) &&
        envPresent(process.env.R2_PUBLIC_BASE_URL)
          ? "R2 signing and public URL env vars are configured."
          : "One or more R2 env vars are missing: R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, R2_PUBLIC_BASE_URL.",
    },
  };

  if (env?.DB) {
    const requiredTables = [
      "users",
      "accounts",
      "sessions",
      "password_reset_tokens",
      "customers",
      "credits_history",
      "subscriptions",
      "generations",
      "generation_assets",
      "webhook_events",
    ];

    const tableChecks = await Promise.all(
      requiredTables.map(async (table) => ({
        table,
        ok: await hasTable(table),
      }))
    );

    const missing = tableChecks.filter((item) => !item.ok).map((item) => item.table);
    checks.d1_schema = {
      ok: missing.length === 0,
      detail:
        missing.length === 0
          ? "All required D1 tables exist."
          : `Missing D1 tables: ${missing.join(", ")}. Run migrations 0001, 0002, 0003.`,
    };
  } else {
    checks.d1_schema = {
      ok: false,
      detail: "D1 binding not available, cannot validate schema.",
    };
  }

  const overall = Object.values(checks).every((check) => check.ok);

  return NextResponse.json({
    ok: overall,
    backend,
    checkedAt: new Date().toISOString(),
    checks,
  });
}
