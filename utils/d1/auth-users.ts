import bcrypt from "bcryptjs";
import { getD1, isoNow } from "@/utils/d1/db";

export type D1AuthUser = {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  password_hash: string | null;
  emailVerified: string | null;
};

const DEFAULT_PASSWORD_ROUNDS = 10;

export async function getAuthUserByEmail(email: string) {
  const db = getD1();
  return db
    .prepare("SELECT id, email, name, image, password_hash, emailVerified FROM users WHERE email = ?")
    .bind(email.toLowerCase().trim())
    .first<D1AuthUser | null>();
}

export async function getAuthUserById(userId: string) {
  const db = getD1();
  return db
    .prepare("SELECT id, email, name, image, password_hash, emailVerified FROM users WHERE id = ?")
    .bind(userId)
    .first<D1AuthUser | null>();
}

export async function createCredentialsUser(input: {
  email: string;
  password: string;
  name?: string | null;
}) {
  const db = getD1();
  const email = input.email.toLowerCase().trim();
  const passwordHash = await bcrypt.hash(input.password, DEFAULT_PASSWORD_ROUNDS);
  const userId = crypto.randomUUID();
  const now = isoNow();

  await db.batch([
    db
      .prepare(
        "INSERT INTO users (id, name, email, emailVerified, image, password_hash, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
      )
      .bind(userId, input.name?.trim() || null, email, null, null, passwordHash, now, now),
  ]);

  return getAuthUserById(userId);
}

export async function upsertOAuthUser(input: {
  email: string;
  name?: string | null;
  image?: string | null;
  provider: string;
  providerAccountId: string;
  emailVerified?: boolean;
  accessToken?: string | null;
  idToken?: string | null;
  tokenType?: string | null;
  scope?: string | null;
  expiresAt?: number | null;
}) {
  const db = getD1();
  const email = input.email.toLowerCase().trim();
  const now = isoNow();
  const existing = await getAuthUserByEmail(email);
  const userId = existing?.id ?? crypto.randomUUID();
  const verifiedAt = input.emailVerified ? now : existing?.emailVerified ?? null;
  const name = input.name?.trim() || existing?.name || null;
  const image = input.image || existing?.image || null;

  if (existing) {
    await db
      .prepare(
        "UPDATE users SET name = ?, image = ?, emailVerified = COALESCE(emailVerified, ?), updated_at = ? WHERE id = ?"
      )
      .bind(name, image, verifiedAt, now, userId)
      .run();
  } else {
    await db
      .prepare(
        "INSERT INTO users (id, name, email, emailVerified, image, password_hash, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
      )
      .bind(userId, name, email, verifiedAt, image, null, now, now)
      .run();
  }

  await db
    .prepare(
      `
      INSERT INTO accounts (
        id, userId, type, provider, providerAccountId,
        access_token, expires_at, token_type, scope, id_token
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(provider, providerAccountId) DO UPDATE SET
        userId = excluded.userId,
        access_token = excluded.access_token,
        expires_at = excluded.expires_at,
        token_type = excluded.token_type,
        scope = excluded.scope,
        id_token = excluded.id_token
      `
    )
    .bind(
      crypto.randomUUID(),
      userId,
      "oidc",
      input.provider,
      input.providerAccountId,
      input.accessToken ?? null,
      input.expiresAt ?? null,
      input.tokenType ?? null,
      input.scope ?? null,
      input.idToken ?? null
    )
    .run();

  return getAuthUserById(userId);
}

export async function verifyCredentialsPassword(email: string, password: string) {
  const user = await getAuthUserByEmail(email);
  if (!user?.password_hash) {
    return null;
  }

  const matches = await bcrypt.compare(password, user.password_hash);
  if (!matches) {
    return null;
  }

  return user;
}

export async function updateUserPassword(userId: string, password: string) {
  const db = getD1();
  const passwordHash = await bcrypt.hash(password, DEFAULT_PASSWORD_ROUNDS);

  await db
    .prepare("UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?")
    .bind(passwordHash, isoNow(), userId)
    .run();
}
