-- Seedance 2.0 D1 bootstrap (single-file migration)
-- Use this file when you want a one-command setup in D1.
-- It is idempotent and safe to re-run.

PRAGMA foreign_keys = ON;

-- 0001_auth_and_core.sql
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT,
  email TEXT NOT NULL UNIQUE,
  emailVerified TEXT,
  image TEXT,
  password_hash TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS accounts (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  type TEXT NOT NULL,
  provider TEXT NOT NULL,
  providerAccountId TEXT NOT NULL,
  refresh_token TEXT,
  access_token TEXT,
  expires_at INTEGER,
  token_type TEXT,
  scope TEXT,
  id_token TEXT,
  session_state TEXT,
  oauth_token TEXT,
  oauth_token_secret TEXT,
  UNIQUE (provider, providerAccountId),
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  sessionToken TEXT NOT NULL UNIQUE,
  userId TEXT NOT NULL,
  expires TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  used_at TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS verification_tokens (
  identifier TEXT NOT NULL,
  token TEXT NOT NULL,
  expires TEXT NOT NULL,
  PRIMARY KEY (identifier, token)
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(userId);
CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(userId);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);

-- 0002_business_core.sql
CREATE TABLE IF NOT EXISTS customers (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  email TEXT,
  name TEXT,
  credits INTEGER NOT NULL DEFAULT 0,
  plan_type TEXT,
  subscription_status TEXT,
  creem_customer_id TEXT,
  country TEXT,
  metadata_json TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS credits_history (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  amount INTEGER NOT NULL,
  type TEXT NOT NULL,
  description TEXT,
  creem_order_id TEXT,
  metadata_json TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS subscriptions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  creem_subscription_id TEXT NOT NULL UNIQUE,
  creem_product_id TEXT,
  status TEXT NOT NULL,
  current_period_start TEXT,
  current_period_end TEXT,
  canceled_at TEXT,
  metadata_json TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS generations (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  prompt TEXT NOT NULL,
  model_id TEXT NOT NULL,
  generation_type TEXT NOT NULL,
  status TEXT NOT NULL,
  status_detail TEXT,
  credits_cost INTEGER NOT NULL,
  resolution TEXT,
  duration_seconds INTEGER,
  aspect_ratio TEXT,
  provider TEXT,
  provider_job_id TEXT,
  output_video_url TEXT,
  thumbnail_url TEXT,
  metadata_json TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS generation_assets (
  id TEXT PRIMARY KEY,
  generation_id TEXT NOT NULL,
  asset_kind TEXT NOT NULL,
  asset_role TEXT,
  object_key TEXT NOT NULL,
  public_url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  FOREIGN KEY (generation_id) REFERENCES generations(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS webhook_events (
  id TEXT PRIMARY KEY,
  provider TEXT NOT NULL,
  external_event_id TEXT,
  payload_json TEXT NOT NULL,
  processed_at TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_customers_user_id ON customers(user_id);
CREATE INDEX IF NOT EXISTS idx_credits_history_user_id ON credits_history(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_generations_user_id ON generations(user_id);
CREATE INDEX IF NOT EXISTS idx_generations_status ON generations(status);
CREATE INDEX IF NOT EXISTS idx_generation_assets_generation_id ON generation_assets(generation_id);
CREATE INDEX IF NOT EXISTS idx_webhook_events_provider_external ON webhook_events(provider, external_event_id);

-- 0003_billing_integrity.sql
CREATE UNIQUE INDEX IF NOT EXISTS uq_webhook_events_provider_external
  ON webhook_events(provider, external_event_id)
  WHERE external_event_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_credits_history_add_order
  ON credits_history(user_id, creem_order_id, type)
  WHERE creem_order_id IS NOT NULL AND type = 'add';

CREATE UNIQUE INDEX IF NOT EXISTS uq_customers_creem_customer_id
  ON customers(creem_customer_id)
  WHERE creem_customer_id IS NOT NULL;
