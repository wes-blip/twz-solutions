import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3"

type CalWebhookBody = {
  triggerEvent?: string
  payload?: {
    attendees?: Array<{ email?: string }>
  }
}

Deno.serve(async (req) => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")
  const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY")
    return new Response(JSON.stringify({ error: "Server configuration error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  let body: CalWebhookBody
  try {
    body = (await req.json()) as CalWebhookBody
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    })
  }

  if (body.triggerEvent !== "BOOKING_CREATED") {
    return new Response(JSON.stringify({ received: true, skipped: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  }

  const email = body.payload?.attendees?.[0]?.email?.trim()
  if (!email) {
    return new Response(JSON.stringify({ received: true, skipped: true, reason: "no_attendee_email" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  }

  const { data: client, error: selectError } = await supabaseAdmin
    .from("clients")
    .select("credits")
    .eq("email", email)
    .maybeSingle()

  if (selectError) {
    console.error("Failed to read client credits:", selectError)
    return new Response(JSON.stringify({ error: "Failed to read client record" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }

  if (client) {
    const current = typeof client.credits === "number" ? client.credits : 0
    const { error: updateError } = await supabaseAdmin
      .from("clients")
      .update({ credits: Math.max(0, current - 1) })
      .eq("email", email)

    if (updateError) {
      console.error("Failed to update client credits:", updateError)
      return new Response(JSON.stringify({ error: "Failed to update client record" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      })
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  })
})
