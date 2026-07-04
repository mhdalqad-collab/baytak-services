# Baytak Services

Baytak Services is a local full-stack MVP for a home maintenance dealer platform in Oman. It shows the customer, provider, admin, payment, and tracking journey using a real local API plus an external test simulator for provider responses.

## What is included

- React + Vite front-end MVP
- Local Node API in `server/app.js`
- Persistent JSON datastore in `server/data/db.json`
- External test simulator in `server/simulation-engine.js`
- Tailwind CSS styling
- Simple routing between customer, provider, and admin views
- JSON-style seed data for local development
- Browser cache fallback for the latest API state
- Role-aware sign-in for customer, provider, and admin workspaces
- Provider matching from backend state and external simulator events
- Offer generation from the external simulator/API, not from React
- Payment ledger with escrow and payout status modeling
- Request tracking timeline based on backend status events
- Rating and review flow
- Provider dashboard with real request queue, accept/reject actions, active jobs, completed jobs, and onboarding flow
- Admin dashboard with dynamic stats, provider approval, category management, requests, payments, and review visibility
- English/Arabic language selector with RTL layout support
- AI-style cost estimation, issue detection, and provider match scoring
- Dispatch map display driven by backend request progress
- Emergency request mode and richer provider/admin dashboards

## Launch planning

See `LAUNCH_PLAN.md` for the three-week market launch roadmap, production backend requirements, and launch acceptance checklist.

See `PRODUCTION_BETA.md` for the current production-beta boundary. OTP delivery, payments, managed file storage, and a production database are intentionally held behind configuration until external service accounts are available.

## Real local backend and simulator

See `REAL_SYSTEM.md` for the new API + external simulator workflow. The frontend can now wait for backend-owned provider offers instead of generating every response inside React.

## Run locally

```bash
npm install
npm run api
npm run dev
```

Open the local URL printed by Vite, usually:

```bash
http://localhost:5173
```

## Build

```bash
npm run build
```

## Folder structure

```text
src/
  components/       Reusable cards, badges, shell, timeline, stats
  data/             Mock service, provider, request, and admin data
  pages/            Landing, customer, request, matching, offers, tracking, rating, provider, admin
  utils/            Marketplace helper functions
server/
  app.js            Local API server
  db.js             JSON datastore helpers
  marketplace.js    Backend pricing and offer rules
  simulation-engine.js External test simulator
```

## Local beta flow

1. Start on the landing page.
2. Sign in with a seeded local account or register a new account.
3. Choose a service category.
4. Submit the request form as a signed-in customer.
5. Run `npm run sim` or keep `npm run sim:watch` open to create backend offers.
6. Open offers and accept one.
7. Confirm payment and let backend/simulator status events update the timeline.
8. Rate the provider and return to the customer dashboard.

This is still a local MVP: commercial launch requires PostgreSQL, production authentication, object storage, payment gateway integration, notifications, audit UI, monitoring, backups, and deployment hardening.
