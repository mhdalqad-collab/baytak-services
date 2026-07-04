# Baytak Services Launch Plan

## Current platform status

The platform has been upgraded into a full-stack production-beta codebase:

- Customer, provider, admin, payments, and onboarding workspaces.
- PostgreSQL-backed users, requests, providers, offers, reviews, payments, categories, provider decisions, and notifications.
- Customer service request flow with issue detection, provider responses, offer acceptance, payment status, tracking, completion, and review.
- Provider dashboard connected to real customer requests, active jobs, completed jobs, and provider onboarding.
- Admin dashboard with dynamic request, provider, review, revenue, category, and approval controls.
- Payment gateway adapter is prepared and held until bank credentials are available.
- OTP service is paused until the official provider is activated.

Before public launch, the remaining external work is activating OTP, bank payments, managed file storage, production hosting, monitoring, backups, and legal policies.

## Three-week launch roadmap

### Week 1: Production foundation

- Harden backend API and database for users, roles, providers, requests, offers, payments, reviews, categories, notifications, and audit logs.
- Activate secure phone/email OTP and role-based authorization.
- Add provider application document upload and admin review workflow.
- Add real file storage for request photos and provider compliance documents.
- Add request status history so every operational event is auditable.
- Deploy staging environment with clean production data and real admin setup.

### Week 2: Marketplace operations

- Implement provider dispatch rules by category, location, approval status, rating, availability, and urgency.
- Add provider offer submission, customer offer comparison, and offer expiry.
- Integrate payment gateway for card payment, payment authorization, escrow-like hold, refunds, platform fees, and provider payouts.
- Add SMS/WhatsApp/email notifications for request creation, offer received, provider accepted, arrival, completion, review, and payout.
- Add admin tools for disputes, cancellations, refunds, provider suspension, category pricing, and service coverage.

### Week 3: Launch readiness

- Complete mobile QA for customer, provider, and admin workflows.
- Add analytics events, conversion tracking, service funnel reporting, and operations dashboards.
- Add SEO marketing pages, provider acquisition page, customer FAQ, terms, privacy policy, refund policy, and support contact flow.
- Run load, security, and payment reconciliation tests.
- Prepare Vercel/production deployment, domain, monitoring, backups, and launch checklist.
- Produce first marketing assets: homepage copy, social posts, provider recruitment message, WhatsApp campaign text, and launch offer.

## Suggested production stack

- Frontend: React + Vite, current codebase.
- Backend: Supabase or Node/Express with PostgreSQL.
- Auth: Supabase Auth, Firebase Auth, or custom OTP provider.
- Database: PostgreSQL.
- File storage: Supabase Storage, S3-compatible storage, or Firebase Storage.
- Payments: a payment gateway available for Oman merchant accounts.
- Notifications: SMS/WhatsApp provider plus transactional email.
- Deployment: Vercel for frontend, managed backend/database for API and data.

## Launch acceptance checklist

- Customers can create accounts, submit requests, upload photos, compare offers, pay, track jobs, complete jobs, review providers, and contact support.
- Providers can apply, submit documents, receive jobs, accept/reject requests, send offers, update job status, see earnings, and request payouts.
- Admins can approve providers, manage services, monitor requests, handle disputes/refunds, review payments, suspend users/providers, and export reports.
- Every payment has a matching request, invoice, platform fee, payout status, and reconciliation record.
- Every important state change creates a notification and audit trail.
- The app works cleanly on mobile, supports English/Arabic layout, and has production legal/marketing pages.
