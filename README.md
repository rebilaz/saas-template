# SaaS Template (Next.js + Supabase + Stripe)

Production-ready starter for a subscription SaaS: authentication via Supabase, Stripe Checkout, protected `/saas` area, and a minimal dashboard shell. Swap the name, add your keys, and ship.

## Prerequisites
- Node 18+
- pnpm, npm, or yarn
- Supabase project (URL + anon key)
- Stripe account (publishable key, secret key, webhook secret, price IDs)

## Getting Started
1) Install dependencies
```bash
# choose one
pnpm install
npm install
yarn install
```

2) Configure environment
```bash
cp env.example .env
```
Fill the values:
- `NEXT_PUBLIC_APP_URL` – your site URL (http://localhost:3000 in dev)
- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (optional, if you add server tasks)
- `DATABASE_URL` (optional, if you add Prisma/Postgres access)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` / `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_STRIPE_PRICE_MONTHLY` / `NEXT_PUBLIC_STRIPE_PRICE_YEARLY` (Stripe price IDs used by checkout)

3) Run the app
```bash
pnpm dev   # or npm run dev / yarn dev
```
Visit http://localhost:3000. The landing redirects to `/pricing`, auth flows go through `/auth/callback`, and the gated app lives under `/saas`.

## Supabase Setup
- Create a Supabase project and grab the URL + anon key.
- Enable Email and Google providers (Auth → Providers). Add `http://localhost:3000/auth/callback` and your production URL to Redirect URLs.
- Create a `profiles` table with `id` (uuid, auth.users FK), `email`, `role`, `subscription_status`, `trial_end` to match the template queries.
- Optional: deploy an Edge Function `stripe-actions` that handles checkout/billing portal if you want to keep that flow (or replace with your own API route).

## Stripe Setup
- Create products/prices and use their IDs for `NEXT_PUBLIC_STRIPE_PRICE_MONTHLY` and `NEXT_PUBLIC_STRIPE_PRICE_YEARLY`.
- Get your publishable key, secret key, and webhook secret; add them to `.env`.
- Set the webhook endpoint to your handler (e.g. an Edge Function or Next.js Route Handler) for subscription events. This template assumes `stripe-actions` exists in Supabase; swap in your own endpoint if needed.

## Deployment (Vercel)
1. Push the code to your repo.
2. Create a new Vercel project from the repo.
3. Add the same environment variables in Vercel.
4. Set `NEXT_PUBLIC_APP_URL` to your production URL.
5. Redeploy after updating Stripe webhook URL to the production domain.

## What’s Included
- Next.js App Router + Tailwind base styles
- Supabase client/server helpers and Auth callback route
- Stripe checkout trigger (`/start-checkout`) and pricing UI
- Protected `/saas` area with navigation, account menu, and billing panel scaffold
- Placeholder logos/assets ready to replace with your brand

## Notes
- Optional dependencies for AWS/OpenAI/ffmpeg have been removed; add only what you need.
- Replace placeholder copy and links, and wire billing actions to your Stripe customer portal or backend endpoint.
