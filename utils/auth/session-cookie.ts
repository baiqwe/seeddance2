import { encode } from "@auth/core/jwt";
import { cookies } from "next/headers";
import { getRuntimeEnvValue } from "@/utils/cloudflare/context";

export const AUTH_SESSION_MAX_AGE = 30 * 24 * 60 * 60;

type SessionCookieInput = {
  userId: string;
  email: string;
  name: string | null;
  image: string | null;
  secure?: boolean;
};

function getAuthSessionCookieName(secure = true) {
  return secure ? "__Secure-authjs.session-token" : "authjs.session-token";
}

export async function createAuthSessionCookie(input: SessionCookieInput) {
  const secret = getRuntimeEnvValue("AUTH_SECRET");
  if (!secret) {
    throw new Error("AUTH_SECRET is missing");
  }

  const cookieName = getAuthSessionCookieName(input.secure ?? true);
  const token = await encode({
    secret,
    salt: cookieName,
    maxAge: AUTH_SESSION_MAX_AGE,
    token: {
      id: input.userId,
      sub: input.userId,
      email: input.email,
      name: input.name,
      picture: input.image,
    },
  });

  return {
    name: cookieName,
    value: token,
    options: {
      httpOnly: true,
      secure: input.secure ?? true,
      sameSite: "lax" as const,
      path: "/",
      maxAge: AUTH_SESSION_MAX_AGE,
    },
  };
}

export async function setAuthSessionCookie(input: SessionCookieInput) {
  const cookieStore = await cookies();
  const sessionCookie = await createAuthSessionCookie(input);
  cookieStore.set(sessionCookie.name, sessionCookie.value, sessionCookie.options);
}

export async function clearAuthSessionCookies() {
  const cookieStore = await cookies();

  for (const name of [getAuthSessionCookieName(true), getAuthSessionCookieName(false)]) {
    cookieStore.set(name, "", {
      httpOnly: true,
      secure: name.startsWith("__Secure-"),
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });
  }
}
