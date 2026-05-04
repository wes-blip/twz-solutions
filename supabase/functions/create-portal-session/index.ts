// Setup type definitions for built-in Supabase Runtime APIs
import "@supabase/functions-js/edge-runtime.d.ts"

import Stripe from "https://esm.sh/stripe@14.14.0?target=deno"

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
}

function jsonResponse(
  body: unknown,
  status: number,
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  })
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders })
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405)
  }

  const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY")
  if (!stripeSecretKey) {
    console.error("Missing STRIPE_SECRET_KEY")
    return jsonResponse({ error: "Server configuration error" }, 500)
  }

  let body: { stripe_customer_id?: string; return_url?: string }
  try {
    body = await req.json()
  } catch {
    return jsonResponse({ error: "Invalid JSON body" }, 400)
  }

  const stripeCustomerId =
    typeof body.stripe_customer_id === "string"
      ? body.stripe_customer_id.trim()
      : ""
  if (!stripeCustomerId) {
    return jsonResponse({ error: "stripe_customer_id is required" }, 400)
  }

  const origin = req.headers.get("origin")?.trim() ?? ""
  const returnUrlFromBody =
    typeof body.return_url === "string" ? body.return_url.trim() : ""
  const returnUrl = returnUrlFromBody || origin || null

  if (!returnUrl) {
    return jsonResponse(
      {
        error:
          "return_url is required in the JSON body, or send an Origin header",
      },
      400,
    )
  }

  const stripe = new Stripe(stripeSecretKey, {
    apiVersion: "2023-10-16",
  })

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: returnUrl,
    })

    if (!session.url) {
      console.error("Stripe portal session missing url")
      return jsonResponse({ error: "Portal session did not return a URL" }, 502)
    }

    return jsonResponse({ url: session.url }, 200)
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    console.error("Stripe billingPortal.sessions.create failed:", message)
    return jsonResponse({ error: message }, 502)
  }
})
