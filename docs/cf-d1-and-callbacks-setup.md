# Cloudflare D1 执行报错与回调配置（Seedance2）

## 1) D1 执行 `0000` 报错：`Requests without any query are not supported`

这个报错通常不是 SQL 语法错，而是“请求里没有实际 SQL 内容”。最常见原因：

- 在 Cloudflare D1 控制台里只填了文件名/路径，没有粘贴 SQL。
- `wrangler d1 execute` 没有带上 `--file` 或当前目录不对，导致没有读取到文件。

### 正确做法（推荐）

在项目目录执行：

```bash
cd /Users/fanqienigehamigua/Documents/seedance/anima
npm run d1:init
```

等价命令（可直接复制）：

```bash
npx wrangler d1 execute seedance2-prod --remote --config ./wrangler.jsonc --file ./migrations/d1/0000_bootstrap_all.sql
```

执行完成后检查表是否创建成功：

```bash
npm run d1:tables
```

如果你坚持在 Cloudflare Dashboard 的 D1 SQL 控制台执行，请把 `migrations/d1/0000_bootstrap_all.sql` 文件内容完整粘贴进去再执行，不能只写文件路径。

---

## 2) 你当前项目应该配置的回调

## A. Google OAuth 回调（登录）

Google Cloud Console -> OAuth 2.0 Client（Web 应用）：

- Authorized JavaScript origins:
  - `https://www.seedance2video.cc`
  - `http://127.0.0.1:3000`（本地需要时）
- Authorized redirect URIs:
  - `https://www.seedance2video.cc/api/auth/callback/google`
  - `http://127.0.0.1:3000/api/auth/callback/google`（本地需要时）

注意：不要填 `/auth/google`，真正 OAuth 回调是 `/api/auth/callback/google`。

## B. Kie 回调（生成状态回写）

项目会用下面地址作为 callback（由代码自动拼）：

`https://www.seedance2video.cc/api/webhooks/kie?token=<KIE_CALLBACK_SECRET>`

你要做的：

1. Cloudflare 环境变量配置 `KIE_CALLBACK_SECRET`（Secret）。
2. 在 Kie 平台（或任务创建处）确保使用上面的 callback URL。
3. 不需要单独创建名为 “Kie callback” 的环境变量（这种带空格的变量名项目不会读取）。

## C. Creem 回调（支付通知）

Creem Dashboard webhook URL：

`https://www.seedance2video.cc/api/webhooks/creem`

你要做的：

1. 把 Creem 提供的签名密钥配置到 `CREEM_WEBHOOK_SECRET`（Secret）。
2. 不需要创建名为 “Creem webhook” 的变量；那只是备注，不被程序读取。

---

## 3) 环境变量命名注意事项（这次最容易踩坑）

- 正确：`KIE_API_URL`
- 你现在有：`KIE_API_UR`（少了 `L`）

代码已经兼容了这个旧拼写，但仍建议你在 Cloudflare 里补上标准键 `KIE_API_URL`，避免后续混淆。
