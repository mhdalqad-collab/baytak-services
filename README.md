# Baytak Services

Baytak Services is a front-end prototype and simulator for a home maintenance dealer platform in Oman. It shows the full customer journey from requesting a service to provider matching, offers, tracking, completion, and review.

## What is included

- React + Vite front-end only
- Tailwind CSS styling
- Simple routing between customer, provider, and admin views
- Mock JSON-style data in `src/data/mockData.js`
- Local React state only, with no backend, database, or authentication
- Provider matching simulation with provider status changes
- Offer generation simulation with OMR pricing and arrival estimates
- Request tracking timeline with manual simulator controls
- Rating and review flow
- Provider dashboard with accept/reject actions
- Admin dashboard with stats, provider approval, and category management
- English/Arabic language selector with RTL layout support

## Run locally

```bash
npm install
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
  utils/            Small simulation helpers
```

## Demo flow

1. Start on the landing page.
2. Click `Request Service`.
3. Choose a service category.
4. Submit the request form.
5. Watch provider matching statuses update.
6. Open offers and accept one.
7. Advance the tracking timeline until the job is complete.
8. Rate the provider and return to the customer dashboard.

This is intentionally a prototype: all data resets on refresh and all behavior is simulated in the browser.
