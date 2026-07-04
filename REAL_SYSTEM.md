# Running The Real Local System

The React app no longer needs to create provider offers inside the browser. For local testing, run three separate terminals.

## 1. Start the backend API

```powershell
npm run api
```

API URL:

```text
http://127.0.0.1:8787/api
```

Health check:

```text
http://127.0.0.1:8787/api/health
```

The API persists data in:

```text
server/data/db.json
```

## 2. Start the external test engine

Run once:

```powershell
npm run sim
```

Run continuously:

```powershell
npm run sim:watch
```

Thin supply scenario:

```powershell
npm run sim:slow
```

The external test engine is intentionally outside React and does not write the database file directly. It behaves like outside actors by calling API endpoints:

- `GET /api/bootstrap`
- `POST /api/requests/:id/provider-offers`
- `POST /api/requests/:id/advance`

Scenario files live in:

```text
server/scenarios/
```

Use scenarios to test normal supply, slow provider response, higher prices, and active job tracking without putting fake behavior inside the frontend.

## 3. Start the frontend

```powershell
npm run dev
```

Open:

```text
http://127.0.0.1:5173/
```

## Test flow

1. Start `npm run api`.
2. Start `npm run dev`.
3. Open `/login` and sign in with phone/email plus password, or register as either a client or service provider. Demo accounts use password `demo123`.
4. Choose OTP delivery by SMS or WhatsApp. The backend generates a one-time code, stores only its hash, and sends the code through the configured delivery adapter. In local `mock` mode only, a test outbox is recorded in `server/data/db.json` under `otpMessages`.
5. Verify the OTP code.
6. Client accounts go to the customer system; provider accounts go to the provider system but cannot receive marketplace jobs until admin approval.
7. Create a customer request in the app.
8. The matching page will wait because no frontend simulation creates offers.
9. Run `npm run sim`.
10. Refresh or wait up to five seconds. Offers should appear from backend state.
11. Accept an offer, confirm payment, track the job, complete it, and review it.

## Account settings

Signed-in users can open `/settings` or click their name in the header. Settings includes profile status, sign out, and delete account. Deleting a provider account also removes its provider profile; historical requests are anonymized for operations records.

## OTP delivery configuration

Local development uses:

```powershell
$env:OTP_DELIVERY_MODE="mock"
```

Production should use a real provider:

```powershell
$env:OTP_DELIVERY_MODE="whatsapp_cloud"
$env:WHATSAPP_ACCESS_TOKEN="..."
$env:WHATSAPP_PHONE_NUMBER_ID="..."
$env:WHATSAPP_AUTH_TEMPLATE_NAME="..."
```

or an SMS gateway webhook:

```powershell
$env:OTP_DELIVERY_MODE="sms_webhook"
$env:SMS_WEBHOOK_URL="https://your-sms-provider.example/send"
```

## What is still needed for production

- Replace JSON file storage with PostgreSQL.
- Replace demo sign-in with OTP/password auth and role permissions.
- Add real image/document upload storage.
- Add real payment gateway capture, refund, invoicing, payout, and reconciliation.
- Add SMS/WhatsApp/email notifications.
- Add admin audit log viewer, dispute handling, cancellation policy, and provider suspension.
- Add deployment, backups, monitoring, and security hardening.
