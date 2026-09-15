# CoolWave Stripe Setup & Integration Guide

This guide explains step-by-step how to configure Stripe for CoolWave once you create or log into your Stripe account.

> [!NOTE]
> The codebase is built with full graceful degradation. Until you configure the keys below, CoolWave will start normally in Free-first mode and inform visitors that billing is in standby without crashing or throwing errors.

---

## 1. Retrieve Your API Keys

1. Open the [Stripe Dashboard](https://dashboard.stripe.com/).
2. Navigate to **Developers &rarr; API keys**.
3. Locate:
   * **Publishable key**: Starts with `pk_test_...` (for testing) or `pk_live_...` (for production).
   * **Secret key**: Starts with `sk_test_...` (for testing) or `sk_live_...` (for production).

---

## 2. Create the Pro Subscription Product & Price

1. In the Stripe Dashboard, navigate to **Product catalog** (`/products`).
2. Click **+ Add product**:
   * **Name**: `CoolWave Pro`
   * **Description**: `Unbegrenzte Konvertierungen, 500 MB Dateigröße, Werbefreiheit & Prioritäts-Engine`
3. Under **Price information**:
   * **Pricing model**: Standard pricing
   * **Price**: `€4,99` (or your desired price in EUR)
   * **Billing period**: Monthly (Recurring)
4. Click **Save product**.
5. Copy the newly created **Price ID** (starts with `price_...`).

---

## 3. Configure Webhooks

Stripe relies on signed webhook events to reliably synchronize subscriptions, plan upgrades, and cancellations to CoolWave's PostgreSQL database.

### Required Webhook Events

Ensure your webhook endpoint listens for the following 6 events:

| Event Name | CoolWave Action |
| :--- | :--- |
| `checkout.session.completed` | Activates initial Pro subscription and links Stripe customer ID to user |
| `customer.subscription.created` | Initializes subscription record in database |
| `customer.subscription.updated` | Updates renewal dates, plan tier, or `cancelAtPeriodEnd` flags |
| `customer.subscription.deleted` | Reverts user plan to `free` immediately upon cancellation/expiry |
| `invoice.paid` | Confirms successful renewal and extends active period |
| `invoice.payment_failed` | Marks subscription as `PAST_DUE` for user intervention |

---

## 4. Local Testing with Stripe CLI

To test the entire checkout and webhook lifecycle on your local machine:

1. Install the [Stripe CLI](https://docs.stripe.com/stripe-cli):
   ```bash
   scoop install stripe  # Windows (or download official .exe)
   ```
2. Authenticate:
   ```bash
   stripe login
   ```
3. Forward webhook events to your local CoolWave server:
   ```bash
   stripe listen --forward-to localhost:3000/api/v1/stripe/webhook
   ```
4. The CLI will print a local webhook signing secret:
   ```text
   > Ready! Your webhook signing secret is whsec_xxxxxxxxxxxxxxxxxxxxxxxx
   ```
5. Set `STRIPE_WEBHOOK_SECRET="whsec_..."` in your local `.env`.

---

## 5. Production Webhook Configuration

1. In the Stripe Dashboard, go to **Developers &rarr; Webhooks**.
2. Click **+ Add endpoint**.
3. **Endpoint URL**: `https://coolwave.cool/api/v1/stripe/webhook` (or your production domain).
4. **Events to send**: Select the 6 events listed in Section 3.
5. Click **Add endpoint**.
6. Reveal the **Signing secret** (`whsec_...`) and configure it as `STRIPE_WEBHOOK_SECRET` on your server.

---

## 6. Environment Variables Checklist

Add these variables to your production `.env` (or host environment manager):

```env
# Stripe Live Keys
STRIPE_SECRET_KEY="sk_live_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_PRO_PRICE_ID="price_..."
```

---

## 7. How to Verify Live Subscription Creation

1. Register or log in to a test user account at `/de/register`.
2. Visit `/de/preise` and click **Jetzt Pro starten**.
3. Complete the checkout flow on Stripe's hosted checkout page.
4. Verify the user is redirected back to `/de/konto`.
5. Check:
   * The user tier shows **Pro aktiv**.
   * Max file size limit updates from 50 MB to 500 MB.
   * In the Administrator Panel (`/de/admin`), open the **Abos** tab to see the active Stripe subscription synchronized in real time.
