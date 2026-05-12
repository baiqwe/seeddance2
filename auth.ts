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

  return {
    adapter: hasD1 ? D1Adapter(env!.DB) : undefined,
    session: {
      strategy: hasD1 ? "database" : "jwt",
    },
    secret: authSecret || undefined,
    trustHost: authTrustHost,
    providers: [
      ...(hasGoogle
        ? [
            Google({
              clientId: googleClientId,
              clientSecret: googleClientSecret,
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
      async session({ session, user }) {
        if (session.user && user?.id) {
          session.user.id = user.id;
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
        console.error("NextAuth error", error);
      },
      warn(code) {
        console.warn("NextAuth warning", code);
      },
    },
  };
}

export const { handlers, auth, signIn, signOut } = NextAuth(() => buildAuthConfig());
