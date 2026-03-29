# Photo to Anime AI (Template)

This repo is a Next.js (App Router) + Supabase + Tailwind + next-intl template refactored into an **Anime-first** micro‑SaaS:

- **Homepage keyword focus:** Photo to Anime AI
- **pSEO hub & spoke:** `app/(main)/[locale]/[slug]/page.tsx` driven by `config/landing-pages.ts`
- **Anime generator UI:** `components/feature/anime-image-editor.tsx`
- **AI generation API:** `app/api/ai/generate/route.ts` (requires login + credits)

## Getting Started

1. Copy `.env.example` to `.env` and fill required keys.
2. Install and run:

```bash
npm i
npm run dev
```

## Configure

- **Brand & domain:** `NEXT_PUBLIC_SITE_NAME`, `NEXT_PUBLIC_APP_URL`
- **Landing pages:** `config/landing-pages.ts`

