# Bala — grocery basket optimiser for South Africa

> **Bala** (isiZulu/isiXhosa *ukubala*, Sesotho/Setswana *bala*: to count). Count on it.

Enter your shopping list once. Bala compares this week's specials at Checkers, Shoprite, Pick n Pay, Woolworths, SPAR and Boxer, applies loyalty-card prices and multibuy rules at your quantities, adds the petrol, and tells you where your basket costs least, and whether a split trip is worth it.

This repository is **Phase 1: the web app**, built so the same API and domain code serve the mobile app in Phase 3. The full system design (control plane, ingestion and serving data planes, AWS architecture for af-south-1) is in [`docs/DESIGN.md`](docs/DESIGN.md).

> **Status:** early development. All prices are **demo data** generated from typical South African shelf prices. No retailer data is ingested yet.

## What works today

- **Home**: paste a list ("2 x milk 2L", "white star 5kg", "3 koo baked beans"); items are matched to the catalogue.
- **My list** (`/list`): search-as-you-type, quantities, "any brand" substitution toggle, location presets or GPS, radius, travel mode, max stops, loyalty cards held.
- **Results** (`/results`): ranked basket options (single store and split trips), the shopping plan per store, every item at every store, and each price against its 90-day typical price.
- **Product pages** (`/p/<slug>`): server-rendered, SEO-friendly price comparison with per-retailer 90-day sparklines. Listed in `sitemap.xml`.
- **Specials** (`/specials`): all current deals by retailer.
- **API**: `GET /api/products?q=`, `GET /api/products/:slug`, `GET /api/stores?lat&lng&radius_km`, `POST /api/recommend`, `GET /api/health`.
- **Domain engine** (`src/lib/domain`): typed promo rules (card price, n-for-R, % off, buy-n-get-m), unit-price normalisation, haversine travel cost, single vs split basket optimiser. Fully unit tested and framework-free.

## Stack

Next.js 16 (App Router, Cache Components) · React 19 · TypeScript · Tailwind CSS 4 · Zod · Vitest. No database yet: a seeded in-memory `DataSource` sits behind the same interface the PostgreSQL implementation will use.

## Run locally

```bash
npm install
npm run dev          # http://localhost:3000
```

Other scripts:

```bash
npm test             # unit tests (vitest)
npm run lint
npm run typecheck
npm run check        # lint + typecheck + test
npm run build && npm start
```

Copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_SITE_URL` when deploying.

## Run in Docker

```bash
docker build -t bala-web --build-arg NEXT_PUBLIC_SITE_URL=https://your.domain .
docker run -p 3000:3000 bala-web
curl localhost:3000/api/health
```

The image uses Next's `standalone` output, runs as a non-root user, and exposes a health check at `/api/health` for ECS/ALB.

## Project layout

```
src/
  app/                 routes (pages + API route handlers)
    api/               products, stores, recommend, health
    p/[slug]/          product price page (SSR, generateStaticParams)
    list/ results/ specials/ how-it-works/ privacy/
  components/          UI (ListBuilder, SettingsPanel, Results, Sparkline, ...)
  lib/
    domain/            pure TS: types, promo, units, geo, recommend (+ tests)
    data/              DataSource interface, in-memory implementation, seed data
    api/               zod request schemas
    client/            localStorage-backed hooks (list, settings)
docs/DESIGN.md         full system design
Dockerfile             production image
.github/workflows/     CI: lint, typecheck, test, build, docker build
```

## Deploying (target architecture)

Per `docs/DESIGN.md` §3 and §8, the web app runs as a container on **ECS Fargate in af-south-1** behind an ALB and **CloudFront + WAF**. The container needs only `PORT` (3000) and `NEXT_PUBLIC_SITE_URL`. Any other container host (Fly, Render, Cloud Run, a VM with Docker) works the same way. Infrastructure as code (CDK) lands in a later milestone.

## Roadmap (next milestones)

1. **PostgreSQL data source**: Drizzle schema from DESIGN.md §7, `DATABASE_URL` switch in `src/lib/data/index.ts`, seed script, docker-compose for local Postgres.
2. **Ingestion pipeline v0**: leaflet PDF → Bedrock extraction → normalise → match → load, for three retailers in one metro; admin review queue.
3. **Accounts and alerts**: Cognito, saved lists, watchlist notifications.
4. **Receipts** (crowdsourced prices) and **WhatsApp** channel.
5. **Mobile app** (Expo) sharing `src/lib/domain` and the API client.

## Contributing

PRs welcome. Run `npm run check` before pushing. Keep `src/lib/domain` free of framework imports so it stays shareable with the mobile app.

## Licence

MIT. Retailer names and loyalty programme names are trademarks of their owners and are used only to identify where prices apply.
