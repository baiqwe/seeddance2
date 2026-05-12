# Seedance 2.0 Login / Register / Generate Runbook (Cloudflare + D1 + R2 + KV)

This runbook is for `seedance2video.cc` with Cloudflare as the runtime.
It is written as a strict checklist so you can run each step and confirm the whole chain is healthy.

## 0. Goal

You should be able to complete this full path:

1. Sign up with email/password
2. Sign in with email/password
3. Sign in with Google OAuth
4. Upload references in the creation center
5. Create a generation task
6. Receive Kie callback and see status updates
7. Complete Creem checkout and credit updates

---

## 1. Pull latest code

```bash
cd /Users/fanqienigehamigua/Documents/seedance/anima
git pull origin main
npm ci
```

---

## 2. Ensure Cloudflare bindings are real

Check `wrangler.jsonc` includes bindings:

- `d1_databases` with `binding: "DB"` and `database_name: "seedance2-prod"`
- `r2_buckets` with `binding: "MEDIA_BUCKET"`
- `kv_namespaces` with `binding: "RATE_LIMIT_KV"`

If any resource does not exist yet:

```bash
npx wrangler d1 create seedance2-prod
npx wrangler kv namespace create RATE_LIMIT_KV
npx wrangler r2 bucket create seedance2-media
```

---

## 3. Apply D1 migrations (must do)

Important:

- Run only files under `migrations/d1`.
- Do not run any SQL under `supabase/migrations` on D1.
- D1 is SQLite, so `public.generations` style SQL will fail.

Recommended (single command):

```bash
npx wrangler d1 execute seedance2-prod --remote --file=./migrations/d1/0000_bootstrap_all.sql
```

Alternative (step-by-step):

```bash
npx wrangler d1 execute seedance2-prod --remote --file=./migrations/d1/0001_auth_and_core.sql
npx wrangler d1 execute seedance2-prod --remote --file=./migrations/d1/0002_business_core.sql
npx wrangler d1 execute seedance2-prod --remote --file=./migrations/d1/0003_billing_integrity.sql
```

Verify tables:

```bash
npx wrangler d1 execute seedance2-prod --remote --command "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;"
```

---

## 4. Set production env vars and secrets

### Required plain variables

- `DATA_BACKEND=cloudflare`
- `NEXT_PUBLIC_SITE_URL=https://seedance2video.cc`
- `NEXT_PUBLIC_APP_URL=https://seedance2video.cc`
- `AUTH_TRUST_HOST=true`
- `HEALTHCHECK_TOKEN=<your-random-token>` (recommended)
- `R2_BUCKET_NAME=seedance2-media`
- `R2_PUBLIC_BASE_URL=<your-r2-public-base-url>`
- `KIE_API_URL=https://api.kie.ai/api/v1`

### Required secrets

- `AUTH_SECRET`
- `AUTH_GOOGLE_ID`
- `AUTH_GOOGLE_SECRET`
- `KIE_API_KEY`
- `KIE_CALLBACK_SECRET`
- `CREEM_API_KEY`
- `CREEM_WEBHOOK_SECRET`
- `RESEND_API_KEY`
- `R2_ACCOUNT_ID`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`

---

## 5. Configure third-party callbacks

### Google OAuth

In Google Cloud Console:

- Authorized redirect URI:
  - `https://seedance2video.cc/api/auth/callback/google`
- Authorized origin:
  - `https://seedance2video.cc`

### Kie callback

Set callback URL to:

- `https://seedance2video.cc/api/webhooks/kie?token=<KIE_CALLBACK_SECRET>`

### Creem webhook

Set webhook URL to:

- `https://seedance2video.cc/api/webhooks/creem`

Enable events:

- `checkout.completed`
- `subscription.active`
- `subscription.paid`
- `subscription.canceled`
- `subscription.expired`
- `subscription.trialing`

---

## 6. Deploy

```bash
npm run build
npx wrangler deploy
```

---

## 7. Use health endpoint first

Open:

- `/api/health/chain`
- Example: `https://seedance2video.cc/api/health/chain`
If `HEALTHCHECK_TOKEN` is configured:
- `https://seedance2video.cc/api/health/chain?token=<HEALTHCHECK_TOKEN>`

Expected:

- `"ok": true`
- `"backend": "cloudflare"`
- no failed checks

If any check fails, fix that item before testing the user flow.

---

## 8. Manual end-to-end validation

### Auth

1. Open `/en/sign-up`
2. Register a new account
3. Confirm redirect to `/en/dashboard`
4. Sign out
5. Sign in again via `/en/sign-in`
6. Test Google sign-in

### Forgot password

1. Open `/en/forgot-password`
2. Submit email
3. Confirm reset email received
4. Open reset link and set new password
5. Sign in with new password

### Generation

1. Open `/en/creative-center`
2. Upload one image in image-to-video mode
3. Submit generation
4. Confirm response includes generation id
5. Confirm `/api/ai/generate/<id>` shows pending/processing
6. After callback, status becomes `succeeded` or `failed` with details

### Billing

1. Open `/en/pricing`
2. Start checkout
3. Complete payment in Creem
4. Confirm webhook received
5. Confirm credits increased in dashboard
6. Open customer portal from dashboard

---

## 9. Common failures and direct fixes

### Error: `KV namespace ... not valid`

Cause: placeholder ID or stale binding.

Fix:

1. Ensure no placeholder IDs remain in `wrangler.jsonc`
2. Re-run `npx wrangler kv namespace create RATE_LIMIT_KV`
3. Re-deploy

### Login works locally but fails in production

Cause: OAuth callback mismatch or missing `AUTH_SECRET`.

Fix:

1. Verify Google callback URL exactly matches production URL
2. Ensure `AUTH_SECRET` is set in Worker secrets

### Upload prepare fails

Cause: missing R2 signing env vars or public URL.

Fix:

1. Set `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`
2. Set `R2_PUBLIC_BASE_URL`

### Generation stays pending forever

Cause: callback not reaching site or wrong token.

Fix:

1. Verify Kie callback URL
2. Verify `KIE_CALLBACK_SECRET` value matches callback query token

---

## 10. Final acceptance criteria

Treat migration as complete only when:

1. `/api/health/chain` returns `ok=true`
2. Auth (email + Google) works
3. Forgot password works
4. Upload and generation submission works
5. Kie callback updates status
6. Creem webhook updates subscription/credits
7. Dashboard shows live credits and generation progress
