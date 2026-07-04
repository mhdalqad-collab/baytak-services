# Baytak Production-Beta Readiness

This build is prepared for clean internal beta use with a real PostgreSQL database and no fake operational data.

## Ready In This Codebase

- Real backend API.
- PostgreSQL relational database adapter.
- Clean production seed with no fake users, providers, requests, offers, payments, or ads.
- Token-based sessions.
- Backend role checks for customer, provider, and admin actions.
- Customer request scoping so customers only see their own requests.
- Provider approval gate before provider marketplace access.
- Registration works while OTP is paused.
- OTP implementation remains available for official activation later.
- Payment gateway adapter is prepared but does not fake successful payments.
- Readiness endpoint: `GET /api/readiness`.
- Environment template: `.env.example`.

## Held Until External Services Are Connected

- OTP delivery through WhatsApp/SMS:
  - current mode: `OTP_DELIVERY_MODE=paused`
  - production choices: `whatsapp_cloud` or `sms_webhook`
- File/photo storage:
  - current beta stores photo metadata/preview only
  - production should use S3, Cloudinary, Supabase Storage, or similar
- Payments:
  - current mode: `PAYMENT_GATEWAY_MODE=held`
  - production should connect bank gateway, refunds, invoices, and payouts

## Before Public Launch

- Set `OTP_SECRET`, `SETUP_ADMIN_KEY`, and real OTP credentials.
- Change default local PostgreSQL password for deployed environments.
- Add HTTPS deployment and secure `CORS_ORIGIN`.
- Add password reset.
- Connect real file storage and payment provider.
- Complete legal pages: terms, privacy, cancellation/refund policy.
- Add managed backups, logs, uptime monitoring, and alerting.
