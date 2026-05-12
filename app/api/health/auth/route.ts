import { NextResponse } from "next/server";
import { getOptionalCloudflareEnv, getRuntimeEnvValue } from "@/utils/cloudflare/context";

export const runtime = "nodejs";

function envPresent(value: string) {
  return value.trim().length > 0;
}

export async function GET(request: Request) {
  const requiredToken = getRuntimeEnvValue("HEALTHCHECK_TOKEN");
  if (requiredToken) {
    const requestUrl = new URL(request.url);
    const providedToken = requestUrl.searchParams.get("token")?.trim();
    if (providedToken !== requiredToken) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }
  }

  const env = getOptionalCloudflareEnv();
  const authSecret = getRuntimeEnvValue("AUTH_SECRET");
  const googleId = getRuntimeEnvValue("AUTH_GOOGLE_ID");
  const googleSecret = getRuntimeEnvValue("AUTH_GOOGLE_SECRET");
  const trustHost = getRuntimeEnvValue("AUTH_TRUST_HOST");

  return NextResponse.json({
    ok: envPresent(authSecret) && envPresent(trustHost),
    checkedAt: new Date().toISOString(),
    checks: {
      cloudflare_context: {
        ok: Boolean(env),
        detail: env ? "Cloudflare request context available." : "Cloudflare request context missing.",
      },
      d1_binding: {
        ok: Boolean(env?.DB),
        detail: env?.DB ? "D1 binding available." : "D1 binding missing in auth runtime.",
      },
      auth_secret: {
        ok: envPresent(authSecret),
        detail: envPresent(authSecret) ? "AUTH_SECRET available to auth runtime." : "AUTH_SECRET missing in auth runtime.",
      },
      auth_trust_host: {
        ok: trustHost === "true",
        detail: trustHost === "true" ? "AUTH_TRUST_HOST=true" : `AUTH_TRUST_HOST is "${trustHost || "(empty)"}".`,
      },
      google_id: {
        ok: envPresent(googleId),
        detail: envPresent(googleId) ? "AUTH_GOOGLE_ID available to auth runtime." : "AUTH_GOOGLE_ID missing in auth runtime.",
      },
      google_secret: {
        ok: envPresent(googleSecret),
        detail: envPresent(googleSecret) ? "AUTH_GOOGLE_SECRET available to auth runtime." : "AUTH_GOOGLE_SECRET missing in auth runtime.",
      },
    },
  });
}
