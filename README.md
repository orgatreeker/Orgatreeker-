# Shadcn/ui theming

*Automatically synced with your [v0.app](https://v0.app) deployments*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/gopalhalderfamily-1392s-projects/v0-shadcn-ui-theming)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app/chat/projects/PdFNmcSSo3X)

## Overview

This repository will stay in sync with your deployed chats on [v0.app](https://v0.app).
Any changes you make to your deployed app will be automatically pushed to this repository from [v0.app](https://v0.app).

## Deployment

Your project is live at:

**[https://vercel.com/gopalhalderfamily-1392s-projects/v0-shadcn-ui-theming](https://vercel.com/gopalhalderfamily-1392s-projects/v0-shadcn-ui-theming)**

## Build your app

Continue building your app on:

**[https://v0.app/chat/projects/PdFNmcSSo3X](https://v0.app/chat/projects/PdFNmcSSo3X)**

## How It Works

1. Create and modify your project using [v0.app](https://v0.app)
2. Deploy your chats from the v0 interface
3. Changes are automatically pushed to this repository
4. Vercel deploys the latest version from this repository

## BillingSDK + Dodo Payments Integration

This project now includes a pricing page and end-to-end checkout via Dodo Payments.

Key files:
- Pricing UI: [`app/pricing/page.tsx`](app/pricing/page.tsx)
- Checkout API (creates Checkout Sessions): [`app/api/checkout/route.ts`](app/api/checkout/route.ts)
- Dodo client init (server-only): [`lib/dodo.ts`](lib/dodo.ts)
- Webhook endpoint scaffold: [`app/api/webhooks/dodo/route.ts`](app/api/webhooks/dodo/route.ts)
- Example env file: [`.env.local.example`](.env.local.example)

What’s included
- A 3-tier pricing table with Buy buttons that POST to `/api/checkout` and redirect to Dodo hosted checkout.
- API route that uses the Dodo TypeScript SDK (`dodopayments`) to create a Checkout Session and returns `checkout_url`.
- Webhook scaffold for event handling with signature verification placeholder.

Environment variables
Copy `.env.local.example` to `.env.local` and set values:
- `DODO_BEARER_TOKEN` — your Dodo Payments API token
- `DEFAULT_RETURN_URL` — where users are sent after checkout
  - Local: `http://localhost:3000/success`
  - Production: `https://app.orgatreeker.com/success`
- `NEXT_PUBLIC_DODO_PRODUCT_MONTHLY` — Product ID for Monthly plan
- `NEXT_PUBLIC_DODO_PRODUCT_YEARLY` — Product ID for Yearly plan

Local testing
1) Install dependencies if needed:
   npm install
2) Create `.env.local` using `.env.local.example` as a template.
3) Start dev server:
   npm run dev
4) Visit http://localhost:3000/pricing
5) Click a plan’s button:
   - The app calls [`/api/checkout`](app/api/checkout/route.ts) to create a Dodo Checkout Session.
   - The API returns `checkout_url`, and the browser redirects to Dodo hosted checkout.

Webhook setup (recommended)
- Endpoint path: POST /api/webhooks/dodo (see [`app/api/webhooks/dodo/route.ts`](app/api/webhooks/dodo/route.ts))
- Add your webhook URL in Dodo dashboard and filter event types as needed (e.g. `payment.succeeded`, `subscription.active`, etc.)
- Signature verification:
  - Set `DODO_WEBHOOK_SECRET` in your environment.
  - Replace the placeholder verification logic in the webhook route with the official signing algorithm and header names from Dodo docs.
  - Keep handler fast and idempotent; dedupe using event IDs if present and return 200 after enqueueing work.

Security and production notes
- Keep `DODO_BEARER_TOKEN` and webhook secrets server-side only (never expose in client).
- Validate user state and business logic only on the server.
- Use proper error handling and logging in API routes.
- Add retry logic and idempotency keys for downstream operations triggered by webhooks.
- Restrict allowed payment method types (we include `["credit","debit"]` as a baseline in [`app/api/checkout/route.ts`](app/api/checkout/route.ts)).

Adapting plans
- Update plan names/prices/features in [`app/pricing/page.tsx`](app/pricing/page.tsx) and set real `product_id`s via env.
- For subscriptions or usage-based pricing, adjust `client.checkoutSessions.create(...)` or use `client.subscriptions.create(...)` on the server per Dodo docs.

References
- Dodo Payments SDK TypeScript: Checkout Sessions Create, Payments, Products, Subscriptions (queried via the DodoPayments MCP docs)
- Event types supported by webhooks include: `payment.succeeded`, `subscription.active`, `refund.succeeded`, disputes, license key created, etc.
