import { NextResponse } from "next/server";
import { getRuntimeEnvValue } from "@/utils/cloudflare/context";
import { getRequestOrigin } from "@/utils/request";
import { getLocalePath, normalizeLocale } from "@/utils/utils";

export const runtime = "nodejs";

const GOOGLE_OAUTH_STATE_COOKIE = "seedance_google_oauth_state";
const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";

function resolveSafeNextPath(nextPath: string | null, locale: string) {
  if (!nextPath) return getLocalePath("/dashboard", locale);
  if (/^https?:\/\//i.test(nextPath)) return getLocalePath("/dashboard", locale);
  if (!/^\/(en|zh)(\/|$)/.test(nextPath)) return getLocalePath("/dashboard", locale);
  return nextPath;
}

function resolveCanonicalOrigin(requestOrigin: string) {
  const configured =
    getRuntimeEnvValue("NEXT_PUBLIC_APP_URL") ||
    getRuntimeEnvValue("NEXT_PUBLIC_SITE_URL") ||
    requestOrigin;

  try {
    const url = new URL(configured);
    if (url.hostname === "seedance2video.cc") {
      url.hostname = "www.seedance2video.cc";
    }
    url.protocol = "https:";
    url.port = "";
    return url.origin;
  } catch {
    return requestOrigin;
  }
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const locale = normalizeLocale(requestUrl.searchParams.get("locale"));
  const nextPath = resolveSafeNextPath(requestUrl.searchParams.get("next"), locale);
  const requestOrigin = await getRequestOrigin();
  const origin = resolveCanonicalOrigin(requestOrigin);
  const clientId = getRuntimeEnvValue("AUTH_GOOGLE_ID");

  if (!clientId) {
    return NextResponse.redirect(new URL(`${getLocalePath("/sign-in", locale)}?error=google_not_configured`, origin));
  }

  const state = crypto.randomUUID();
  const authUrl = new URL(GOOGLE_AUTH_URL);
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("redirect_uri", new URL("/auth/callback", origin).toString());
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("scope", "openid email profile");
  authUrl.searchParams.set("state", state);
  authUrl.searchParams.set("prompt", "select_account");

  const response = NextResponse.redirect(authUrl);
  response.cookies.set(
    GOOGLE_OAUTH_STATE_COOKIE,
    JSON.stringify({
      state,
      locale,
      nextPath,
    }),
    {
      httpOnly: true,
      secure: origin.startsWith("https://"),
      sameSite: "lax",
      path: "/",
      maxAge: 10 * 60,
    }
  );

  return response;
}
