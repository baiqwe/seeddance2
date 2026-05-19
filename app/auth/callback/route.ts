import { encode } from "@auth/core/jwt";
import { NextResponse } from "next/server";
import { getRuntimeEnvValue } from "@/utils/cloudflare/context";
import { upsertOAuthUser } from "@/utils/d1/auth-users";
import { provisionCustomerIfMissing } from "@/utils/d1/customers";
import { getRequestOrigin } from "@/utils/request";
import { getLocalePath, normalizeLocale } from "@/utils/utils";

export const runtime = "nodejs";

const GOOGLE_OAUTH_STATE_COOKIE = "seedance_google_oauth_state";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://openidconnect.googleapis.com/v1/userinfo";
const SESSION_MAX_AGE = 30 * 24 * 60 * 60;

type OAuthState = {
  state: string;
  locale: string;
  nextPath: string;
};

type GoogleTokenResponse = {
  access_token?: string;
  expires_in?: number;
  id_token?: string;
  scope?: string;
  token_type?: string;
  error?: string;
  error_description?: string;
};

type GoogleProfile = {
  sub?: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
};

function parseCookie(header: string | null, name: string) {
  if (!header) return null;
  const cookies = header.split(";").map((part) => part.trim());
  const target = cookies.find((part) => part.startsWith(`${name}=`));
  if (!target) return null;
  return decodeURIComponent(target.slice(name.length + 1));
}

function parseOAuthState(value: string | null): OAuthState | null {
  if (!value) return null;

  try {
    const parsed = JSON.parse(value) as Partial<OAuthState>;
    if (!parsed.state || !parsed.nextPath) return null;
    return {
      state: parsed.state,
      locale: normalizeLocale(parsed.locale),
      nextPath: resolveSafeNextPath(parsed.nextPath, parsed.locale),
    };
  } catch {
    return null;
  }
}

function resolveSafeNextPath(nextPath: string | null | undefined, locale: string | null | undefined) {
  const normalizedLocale = normalizeLocale(locale);
  if (!nextPath) return getLocalePath("/dashboard", normalizedLocale);
  if (/^https?:\/\//i.test(nextPath)) return getLocalePath("/dashboard", normalizedLocale);
  if (!/^\/(en|zh)(\/|$)/.test(nextPath)) return getLocalePath("/dashboard", normalizedLocale);
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

function redirectToSignIn(origin: string, locale: string, error: string) {
  return NextResponse.redirect(new URL(`${getLocalePath("/sign-in", locale)}?error=${encodeURIComponent(error)}`, origin));
}

async function exchangeCodeForToken(input: {
  code: string;
  origin: string;
  clientId: string;
  clientSecret: string;
}) {
  const body = new URLSearchParams({
    code: input.code,
    client_id: input.clientId,
    client_secret: input.clientSecret,
    redirect_uri: new URL("/auth/callback", input.origin).toString(),
    grant_type: "authorization_code",
  });

  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
    },
    body,
  });

  const payload = (await response.json()) as GoogleTokenResponse;
  if (!response.ok || !payload.access_token) {
    throw new Error(payload.error_description || payload.error || "Google token exchange failed");
  }

  return payload;
}

async function fetchGoogleProfile(accessToken: string) {
  const response = await fetch(GOOGLE_USERINFO_URL, {
    headers: {
      authorization: `Bearer ${accessToken}`,
    },
  });

  const profile = (await response.json()) as GoogleProfile;
  if (!response.ok || !profile.sub || !profile.email) {
    throw new Error("Google profile fetch failed");
  }

  return profile;
}

async function createAuthSessionCookie(input: {
  origin: string;
  userId: string;
  email: string;
  name: string | null;
  image: string | null;
}) {
  const secret = getRuntimeEnvValue("AUTH_SECRET");
  if (!secret) {
    throw new Error("AUTH_SECRET is missing");
  }

  const secure = input.origin.startsWith("https://");
  const cookieName = secure ? "__Secure-authjs.session-token" : "authjs.session-token";
  const token = await encode({
    secret,
    salt: cookieName,
    maxAge: SESSION_MAX_AGE,
    token: {
      id: input.userId,
      sub: input.userId,
      email: input.email,
      name: input.name,
      picture: input.image,
    },
  });

  return { cookieName, secure, token };
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const requestOrigin = await getRequestOrigin();
  const origin = resolveCanonicalOrigin(requestOrigin);
  const stateCookie = parseOAuthState(parseCookie(request.headers.get("cookie"), GOOGLE_OAUTH_STATE_COOKIE));
  const locale = normalizeLocale(stateCookie?.locale || requestUrl.searchParams.get("locale"));

  try {
    const returnedState = requestUrl.searchParams.get("state");
    const code = requestUrl.searchParams.get("code");
    const oauthError = requestUrl.searchParams.get("error");

    if (oauthError) {
      return redirectToSignIn(origin, locale, oauthError);
    }

    if (!stateCookie || !returnedState || stateCookie.state !== returnedState) {
      return redirectToSignIn(origin, locale, "google_state_invalid");
    }

    if (!code) {
      return redirectToSignIn(origin, locale, "google_code_missing");
    }

    const clientId = getRuntimeEnvValue("AUTH_GOOGLE_ID");
    const clientSecret = getRuntimeEnvValue("AUTH_GOOGLE_SECRET");
    if (!clientId || !clientSecret) {
      return redirectToSignIn(origin, locale, "google_not_configured");
    }

    const token = await exchangeCodeForToken({
      code,
      origin,
      clientId,
      clientSecret,
    });
    const profile = await fetchGoogleProfile(token.access_token!);
    const expiresAt = token.expires_in ? Math.floor(Date.now() / 1000) + token.expires_in : null;
    const user = await upsertOAuthUser({
      email: profile.email!,
      name: profile.name ?? null,
      image: profile.picture ?? null,
      provider: "google",
      providerAccountId: profile.sub!,
      emailVerified: profile.email_verified,
      accessToken: token.access_token ?? null,
      idToken: token.id_token ?? null,
      tokenType: token.token_type ?? null,
      scope: token.scope ?? null,
      expiresAt,
    });

    if (!user) {
      return redirectToSignIn(origin, locale, "google_user_failed");
    }

    try {
      await provisionCustomerIfMissing({
        userId: user.id,
        email: user.email,
        name: user.name,
      });
    } catch (error) {
      console.error("Google OAuth customer provisioning failed", error);
    }

    const sessionCookie = await createAuthSessionCookie({
      origin,
      userId: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
    });

    const response = NextResponse.redirect(new URL(resolveSafeNextPath(stateCookie.nextPath, locale), origin));
    response.cookies.set(sessionCookie.cookieName, sessionCookie.token, {
      httpOnly: true,
      secure: sessionCookie.secure,
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE,
    });
    response.cookies.set(GOOGLE_OAUTH_STATE_COOKIE, "", {
      httpOnly: true,
      secure: origin.startsWith("https://"),
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });

    return response;
  } catch (error) {
    console.error("Google OAuth callback failed", {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return redirectToSignIn(origin, locale, "google_oauth_failed");
  }
}
