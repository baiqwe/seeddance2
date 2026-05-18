import NextAuth, { type NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { D1Adapter } from "@auth/d1-adapter";
import { z } from "zod";
import { getOptionalCloudflareEnv, getRuntimeEnvValue } from "@/utils/cloudflare/context";
import { verifyCredentialsPassword } from "@/utils/d1/auth-users";
import { provisionCustomerIfMissing } from "@/utils/d1/customers";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

function buildAuthConfig(): NextAuthConfig {
  const env = getOptionalCloudflareEnv();
  const hasD1 = Boolean(env?.DB);
  const authSecret = getRuntimeEnvValue("AUTH_SECRET");
  const authTrustHost = getRuntimeEnvValue("AUTH_TRUST_HOST") === "true";
  const googleClientId = getRuntimeEnvValue("AUTH_GOOGLE_ID");
  const googleClientSecret = getRuntimeEnvValue("AUTH_GOOGLE_SECRET");
  const hasGoogle = Boolean(googleClientId && googleClientSecret);
  const isCloudflareRuntime = Boolean(env);

  return {
    basePath: "/api/auth",
    adapter: hasD1 ? D1Adapter(env!.DB) : undefined,
    session: {
      // Credentials provider in Auth.js requires JWT sessions.
      // We still keep the adapter for users/accounts persistence.
      strategy: "jwt",
    },
    secret: authSecret || undefined,
    // Cloudflare custom domains/proxies can omit AUTH_TRUST_HOST from the
    // runtime env even when it's configured in the dashboard. When we're
    // inside the Cloudflare runtime, trust the forwarded host explicitly.
    trustHost: authTrustHost || isCloudflareRuntime,
    providers: [
      ...(hasGoogle
        ? [
            Google({
              clientId: googleClientId,
              clientSecret: googleClientSecret,
              authorization: {
                url: "https://accounts.google.com/o/oauth2/v2/auth",
                params: {
                  scope: "openid email profile",
                  response_type: "code",
                  prompt: "select_account",
                },
              },
              token: "https://oauth2.googleapis.com/token",
              userinfo: "https://openidconnect.googleapis.com/v1/userinfo",
              checks: ["pkce", "state"],
              allowDangerousEmailAccountLinking: true,
            }),
          ]
        : []),
      Credentials({
        id: "credentials",
        name: "Email and Password",
        credentials: {
          email: { label: "Email", type: "email" },
          password: { label: "Password", type: "password" },
        },
        async authorize(rawCredentials) {
          if (!hasD1) {
            return null;
          }

          const parsed = credentialsSchema.safeParse(rawCredentials);
          if (!parsed.success) {
            return null;
          }

          const user = await verifyCredentialsPassword(parsed.data.email, parsed.data.password);
          if (!user) {
            return null;
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
          };
        },
      }),
    ],
    callbacks: {
      async jwt({ token, user }) {
        if (user?.id) {
          token.id = user.id;
        }
        return token;
      },
      async session({ session, user, token }) {
        if (session.user) {
          session.user.id =
            (typeof token?.id === "string" && token.id) ||
            user?.id ||
            session.user.id;
        }
        return session;
      },
      async signIn({ user }) {
        if (hasD1 && user?.id && user.email) {
          try {
            // Customer provisioning should not block the OAuth handshake.
            await provisionCustomerIfMissing({
              userId: user.id,
              email: user.email,
              name: user.name,
            });
          } catch (error) {
            console.error("Auth signIn provisioning failed", error);
          }
        }
        return true;
      },
    },
    logger: {
      error(error) {
        console.error("NextAuth error", {
          name: error.name,
          type: "type" in error ? error.type : undefined,
          message: error.message,
          cause: "cause" in error ? error.cause : undefined,
          stack: error.stack,
        });
      },
      warn(code) {
        console.warn("NextAuth warning", code);
      },
    },
  };
}

export const { handlers, auth, signIn, signOut } = NextAuth(() => buildAuthConfig());
