/**
 * Browser-safe Stripe config (publishable key + Payment Link).
 * Live secret keys and webhooks stay on the server (e.g. Supabase Edge Functions).
 */

function requireEnv(name: string, value: string | undefined): string {
  if (!value?.trim()) {
    throw new Error(
      `Missing ${name}. Add it to .env.local (live Payment Link base URL from Stripe Dashboard → Payment links) and restart the dev server.`,
    )
  }
  return value.trim().replace(/\/$/, '')
}

/** Stripe publishable key (pk_live_… / pk_test_…). Exposed for future Checkout.js / Elements. */
export const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY

/** Subscription Price ID — must match the product used by the Payment Link and backend webhooks. */
export const STRIPE_PRICE_ID = import.meta.env.VITE_STRIPE_PRICE_ID

/** Base `https://buy.stripe.com/…` URL for the live subscription Payment Link (no query string). */
export function getStripePaymentLinkBaseUrl(): string {
  return requireEnv('VITE_STRIPE_PAYMENT_LINK_URL', import.meta.env.VITE_STRIPE_PAYMENT_LINK_URL)
}

/** Checkout URL with Clerk user passthrough for the webhook (`client_reference_id`). */
export function buildSubscriptionCheckoutUrl(
  clerkUserId: string,
  email: string | undefined,
): string {
  const base = getStripePaymentLinkBaseUrl()
  const params = new URLSearchParams()
  params.set('client_reference_id', clerkUserId)
  if (email) {
    params.set('prefilled_email', email)
  }
  return `${base}?${params.toString()}`
}
