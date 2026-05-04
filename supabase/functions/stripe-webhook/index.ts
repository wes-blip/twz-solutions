// Setup type definitions for built-in Supabase Runtime APIs
import "@supabase/functions-js/edge-runtime.d.ts"

import Stripe from "https://esm.sh/stripe@14.14.0?target=deno"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3"

Deno.serve(async (req) => {
  const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY")
  const endpointSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET")
  const supabaseUrl = Deno.env.get("SUPABASE_URL")
  const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")

  if (!stripeSecretKey || !endpointSecret || !supabaseUrl || !supabaseServiceRoleKey) {
    console.error("Missing STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, SUPABASE_URL, or SUPABASE_SERVICE_ROLE_KEY")
    return new Response(JSON.stringify({ error: "Server configuration error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }

  const stripe = new Stripe(stripeSecretKey, {
    apiVersion: "2023-10-16",
  })
  const cryptoProvider = Stripe.createSubtleCryptoProvider()

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  const body = await req.text()
  const signature = req.headers.get("stripe-signature") ?? ""

  let event: Stripe.Event
  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      endpointSecret,
      undefined,
      cryptoProvider,
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    console.error("Webhook signature verification failed:", message)
    return new Response(`Webhook Error: ${message}`, { status: 400 })
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session
      const clerkId = session.client_reference_id
      if (clerkId) {
        const customer = session.customer
        const stripeCustomerId =
          typeof customer === "string"
            ? customer
            : customer && typeof customer === "object" && !("deleted" in customer && customer.deleted)
              ? customer.id
              : null

        const updatePayload: any = {
          credits: 1,
          has_active_subscription: true,
        }
        if (stripeCustomerId) {
          updatePayload.stripe_customer_id = stripeCustomerId
        }

        const { error: dbError } = await supabaseAdmin
          .from("clients")
          .update(updatePayload)
          .eq("clerk_id", clerkId)

        if (dbError) {
          console.error("Database Update Error:", dbError)
          throw new Error(`DB Error: ${dbError.message} | Details: ${dbError.details}`)
        }
      }
      break
    }
    case "invoice.paid": {
      const invoice = event.data.object as Stripe.Invoice
      if (invoice.billing_reason === "subscription_cycle") {
        const customerId =
          typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id
        if (customerId) {
          const { error: dbError } = await supabaseAdmin
            .from("clients")
            .update({ credits: 1, has_active_subscription: true })
            .eq("stripe_customer_id", customerId)

          if (dbError) {
            console.error("Database Update Error:", dbError)
            throw new Error(`DB Error: ${dbError.message} | Details: ${dbError.details}`)
          }
          console.log(
            `Subscription renewal: updated credits and has_active_subscription for Stripe customer ${customerId}`,
          )
        }
      }
      break
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  })
})
