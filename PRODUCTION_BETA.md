# Baytak Production-Beta Readiness

This build is prepared for internal beta use without external service contracts.

## Ready In This Codebase

- Real backend API instead of frontend-only simulation.
- Token-based local sessions.
- Backend role checks for customer, provider, and admin actions.
- Customer request scoping so customers only see their own requests.
- Provider approval gate before provider marketplace access.
- OTP registration flow with hashed OTP storage, expiry, resend cooldown, and max attempts.
- External simulator separated from the customer UI.
- Readiness endpoint: `GET /api/readiness`.
- Environment template: `.env.example`.

## Held Until External Services Are Connected

- OTP delivery through WhatsApp/SMS:
  - local mode: `OTP_DELIVERY_MODE=mock`
  - production choices: `whatsapp_cloud` or `sms_webhook`
- File/photo storage:
  - current local beta stores photo metadata/preview only
  - production should use S3, Cloudinary, Supabase Storage, or similar
- Payments:
  - current local beta models payment state only
  - production should connect a payment gateway, refunds, invoices, and payouts
- Production database:
  - current local beta uses JSON persistence
  - production should move to PostgreSQL/MySQL/Supabase/Firebase

## Before Public Launch

- Set `OTP_SECRET`, `SIM_API_KEY`, and real OTP credentials.
- Move JSON storage to a managed database.
- Add HTTPS deployment and secure CORS origins.
- Add password reset and stricter auth rate limits.
- Connect real file storage and payment provider.
- Complete legal pages: terms, privacy, cancellation/refund policy.
