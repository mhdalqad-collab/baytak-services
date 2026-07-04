# Baytak Services

Baytak Services is a full-stack home maintenance marketplace for Oman. It includes customer registration, service requests, provider onboarding and approval, provider work queues, admin operations, payment-gateway preparation, and PostgreSQL persistence.

## What Is Included

- React + Vite frontend
- Node API in `server/app.js`
- PostgreSQL production database support
- Docker Compose PostgreSQL for local product testing
- Role-aware customer, provider, and admin workspaces
- Registration with OTP currently paused by configuration
- Provider approval workflow before providers can receive work
- Customer request creation and tracking
- Provider accept/reject workflow for real provider responses
- Payment gateway adapter held until bank credentials are available
- Account settings and account deletion
- English/Arabic language selector with RTL layout support
- Admin dashboard with real database stats, provider approval, categories, payments, reviews, and requests
- Production readiness documentation

## Run Locally With PostgreSQL

```bash
npm install
npm run postgres:up
npm run db:init:postgres
npm run api:prod-db
npm run dev
```

Open:

```bash
http://localhost:5173
```

## Build

```bash
npm run build
```

## Verify

```bash
npm run lint
npm run build
npm run test:integrity
```

## Folder Structure

```text
src/
  api/              Frontend API client
  components/       Reusable cards, badges, shell, timeline, stats
  data/             Service categories, locations, status labels
  pages/            Landing, auth, customer, request, matching, offers, tracking, rating, provider, admin
  utils/            Frontend marketplace helpers
server/
  app.js            API server
  db.js             PostgreSQL database adapter
  db-init.js        Database initialization command
  marketplace.js    Pricing and issue-detection helpers
  otpService.js     OTP adapter, currently paused by config
  paymentService.js Payment gateway adapter, held until bank credentials are ready
  seed.js           Clean production seed with no fake users/providers/requests
```

## Current Production Boundary

The platform starts clean with no fake users, providers, requests, offers, payments, or ads.

Remaining external services before public launch:

- Official OTP provider credentials
- Bank/payment gateway credentials
- Managed image/file storage
- HTTPS hosting, backups, monitoring, and legal policies

See `DATABASE.md`, `PRODUCTION_BETA.md`, and `LAUNCH_PLAN.md` for setup and launch details.
