import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import { getRequestOrigin } from "@/utils/request";
import { getAppKey } from "@/utils/supabase/project";
import { getLocalePath, normalizeLocale } from "@/utils/utils";

export const runtime = "edge";

function parseCookies(cookieHeader: string): { name: string; value: string }[] {
  if (!cookieHeader) return [];

  return cookieHeader
    .split(";")
    .map((cookie) => {
      const [name, ...rest] = cookie.trim().split("=");
      return { name: name || "", value: rest.join("=") };
    })
    .filter((cookie) => cookie.name);
}

function buildErrorRedirect(origin: string, locale: string, mode: string, message: string) {
  const authPath = mode === "sign-up" ? "/sign-up" : "/sign-in";
  const url = new URL(getLocalePath(authPath, locale), origin);
  url.searchParams.set("error", message);
  return NextResponse.redirect(url);
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const locale = normalizeLocale(requestUrl.searchParams.get("locale"));
  const mode = requestUrl.searchParams.get("mode") || "sign-in";
  const origin = await getRequestOrigin();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return buildErrorRedirect(origin, locale, mode, "config_error");
  }

  const cookies = parseCookies(request.headers.get("cookie") || "");
  const cookiesToSet: { name: string; value: string; options?: any }[] = [];

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    global: {
      headers: {
        "x-app-key": getAppKey(),
      },
    },
    cookies: {
      getAll() {
        return cookies;
      },
      setAll(newCookies) {
        cookiesToSet.push(...newCookies);
      },
    },
  });

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback`,
      queryParams: {
        access_type: "offline",
        prompt: "select_account",
      },
    },
  });

  if (error || !data?.url) {
    return buildErrorRedirect(
      origin,
      locale,
      mode,
      error?.message || "oauth_init_failed",
    );
  }

  const response = NextResponse.redirect(data.url);

  for (const cookie of cookiesToSet) {
    response.cookies.set(cookie.name, cookie.value, cookie.options);
  }

  return response;
}
