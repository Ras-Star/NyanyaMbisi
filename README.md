# Nyanya Mbisi

Nyanya Mbisi is the customer-facing mobile web MVP for QuickStore's hyper-local grocery marketplace in Namilyango, Gwafu, and Njerere.

## Workspace

- `apps/customer-web`: Nuxt 3 SSR/PWA customer app
- `scripts/fetch-product-photos.mjs`: pulls CC-licensed product and marketplace images from the web, converts them to local WebP files, and writes attribution metadata

## Quick Start

1. From the repo root, enable the pinned pnpm version:
   `corepack prepare pnpm@10.6.5 --activate`
2. Install dependencies:
   `corepack pnpm install`
3. Start the customer app:
   `corepack pnpm dev`
4. Open:
   `http://localhost:3000`

If the root command ever gives you trouble, run the app directly instead:

`corepack pnpm --dir apps/customer-web dev`

If you need a different port, run Nuxt directly instead of passing `--port` through the pnpm script:

`corepack pnpm --dir apps/customer-web exec nuxt dev --port 3001`

## Common Commands

- Start dev server: `corepack pnpm dev`
- Build production bundle: `corepack pnpm build`
- Run tests: `corepack pnpm test`
- Run typecheck: `corepack pnpm typecheck`

## Optional Environment

Create `apps/customer-web/.env` if you want Google Maps and/or Supabase:

```bash
NUXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_key_here
NUXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NUXT_PUBLIC_SUPABASE_ANON_KEY=your_public_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_server_only_service_role_key_here
SUPABASE_OTP_DEV_CODE=2468
```

Without the Google Maps key, checkout still works and falls back to the built-in local service-area map.

Without the Supabase values, the app still works with the existing in-memory local mock flow.

To bootstrap the shared Supabase project, create the project in Supabase and run the SQL in `supabase/schema.sql`. That file creates the supplier, product, OTP, verified-customer, and order tables, then seeds the current marketplace catalog.

## What To Expect

- Nuxt should print a local URL, usually `http://localhost:3000`
- The app is the customer mobile web experience, not a game executable
- Marketplace, supplier pages, cart, checkout, payment initiation, and pending order flow are all local and runnable now
- Each `dev` start now clears stale local Nuxt dev cache so old i18n/payload artifacts do not keep breaking supplier routes

## Troubleshooting

### `sh: pnpm: command not found`

This repo now uses `corepack pnpm` inside the root scripts. If you still see this, pull the latest changes or run:

`corepack pnpm --dir apps/customer-web dev`

### `Ignored build scripts: @parcel/watcher, esbuild, sharp`

If the app starts and builds normally, you can ignore that warning.

If dev/build later fails because a native package was skipped, run:

`corepack pnpm approve-builds`

Approve `esbuild` and `sharp`, then rerun:

- `corepack pnpm install`
- `corepack pnpm dev`

## Notes

- Product photos are local `.webp` assets under [apps/customer-web/public/products](/Users/starthelight/Desktop/Web Projects/NyanyaMbisi/apps/customer-web/public/products), with attribution recorded in [apps/customer-web/data/product-image-attribution.json](/Users/starthelight/Desktop/Web Projects/NyanyaMbisi/apps/customer-web/data/product-image-attribution.json).
- Marketplace and supplier hero photos are local `.webp` assets under [apps/customer-web/public/marketplace](/Users/starthelight/Desktop/Web Projects/NyanyaMbisi/apps/customer-web/public/marketplace), with attribution recorded in [apps/customer-web/data/marketplace-image-attribution.json](/Users/starthelight/Desktop/Web Projects/NyanyaMbisi/apps/customer-web/data/marketplace-image-attribution.json).
- The current backend/API behavior is implemented with local Nitro server routes so the customer flow works end-to-end in the Nuxt app.
- If `NUXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set, the Nitro routes will use Supabase for suppliers/products, OTP sessions, verified customer tokens, and orders. If not, they fall back to the existing local in-memory store.
- If `NUXT_PUBLIC_GOOGLE_MAPS_API_KEY` is missing, the checkout page falls back to a local service-area map for pin confirmation.
