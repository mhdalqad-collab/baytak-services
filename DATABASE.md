# Baytak Database Setup

Baytak uses PostgreSQL for beta and production. The local JSON file is only a development fallback and is blocked when `NODE_ENV=production` or `REQUIRE_PRODUCTION_DB=true`.

## Production Settings

Set these environment variables before starting the API:

```powershell
$env:DB_CLIENT="postgres"
$env:DATABASE_URL="postgres://baytak_user:baytak_password_change_me@127.0.0.1:55432/baytak"
$env:DB_POOL_MAX="20"
$env:DB_SSL="false"
```

Use `DB_SSL=true` when your hosted PostgreSQL provider requires TLS. Change the default local password before any shared/staging deployment.

## Local PostgreSQL

Start the project database:

```powershell
npm run postgres:up
```

The included Docker PostgreSQL service listens on `127.0.0.1:55432` to avoid conflicts with any existing PostgreSQL installed on your machine.

## Initialize

```powershell
npm run db:init:postgres
```

This creates the relational PostgreSQL tables and seeds the initial data if the database is empty.

## Run With PostgreSQL

```powershell
npm run api:prod-db
npm run dev
```

## First Admin

No fake admin is shipped with the product. Create the first admin after setting `SETUP_ADMIN_KEY`:

```powershell
$env:SETUP_ADMIN_KEY="replace-with-a-long-random-admin-setup-key"
```

Then call the setup endpoint once:

```powershell
Invoke-RestMethod `
  -Uri "http://127.0.0.1:8787/api/admin/bootstrap" `
  -Method Post `
  -Headers @{ "X-Setup-Key" = $env:SETUP_ADMIN_KEY } `
  -ContentType "application/json" `
  -Body '{"name":"Owner Admin","phone":"+96890000000","email":"owner@example.com","password":"ChangeThisPassword123"}'
```

After the first admin exists, the endpoint refuses to create another admin.

Check the active database:

```powershell
Invoke-RestMethod -Uri "http://127.0.0.1:8787/api/readiness" | ConvertTo-Json -Depth 8
```

The response must show:

```json
{
  "database": {
    "client": "postgres",
    "productionReady": true,
    "relationalSchema": true
  }
}
```

## Publish Gate

Before a beta or production publish, run:

```powershell
$env:REQUIRE_PRODUCTION_DB="true"
npm run test:integrity
```

That command fails if the API is still using the JSON fallback.

## External Services Still Needed

Set these when your vendors are ready:

```powershell
$env:OTP_DELIVERY_MODE="whatsapp_cloud" # or sms_webhook
$env:PAYMENT_GATEWAY_MODE="bank_webhook"
$env:PAYMENT_WEBHOOK_URL="https://bank-or-processor-endpoint"
$env:PAYMENT_MERCHANT_ID="your-merchant-id"
```

Until OTP credentials are configured, keep:

```powershell
$env:OTP_DELIVERY_MODE="paused"
```

In paused mode, users can register and sign in, but their accounts are marked `phoneVerified=false` until official OTP verification is enabled.

Until payment credentials are configured, payment capture returns `503` and does not mark money as received.
