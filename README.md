# LiquidIQ

Enterprise treasury and cash flow command center built with Next.js 16, Supabase, and Vercel.

## Local

1. Create a Supabase project and run the SQL in [`supabase/migrations/0001_liquidiq_init.sql`](/var/www/html/aiproject/supabase/migrations/0001_liquidiq_init.sql).
2. Seed demo data with [`supabase/seed.sql`](/var/www/html/aiproject/supabase/seed.sql).
3. Copy env values into [`.env.local.example`](/var/www/html/aiproject/.env.local.example) and then set them in [`.env.local`](/var/www/html/aiproject/.env.local).
4. Install dependencies with `npm install`.
5. Start the app with `npm run dev`.

## Production Verification

Run these before deployment:

```bash
npm run lint
npm run type-check
npm run test:run
npm run build
```

## Vercel Deployment

Set these project environment variables in Vercel:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

Use the same values as local `.env.local`.

## Supabase Auth URLs

In Supabase Auth URL configuration, add:

- Your Vercel production URL
- Your Vercel preview URL pattern if you plan to test previews
- `http://localhost:3000`

## Notes

- The app uses server-side Supabase auth and route protection through [`proxy.ts`](/var/www/html/aiproject/proxy.ts).
- The production build is network-independent for fonts; it does not rely on Google Fonts at build time.
- Do not commit live secrets from [`.env.local`](/var/www/html/aiproject/.env.local).
# AI-Kurukshetra-LiquidIQ
