import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3"

/** Must match the Cal.com event URL slug (see Dashboard strategy embed). */
const STRATEGY_EVENT_SLUG = "problem-solver-strategy-call"
type CalWebhookBody = {
  triggerEvent?: string
  payload?: {
    attendees?: Array<{ email?: string }>
    startTime?: string
    eventTypeId?: number
    /** Cal.com uses `type` for the event type slug in BOOKING_CREATED payloads. */
    type?: string
    slug?: string
    eventType?: { id?: number; slug?: string }
    booking?: { startTime?: string }
  }
}

function normalizeEmail(raw: string | undefined): string | null {
  const e = raw?.trim().toLowerCase()
  return e || null
}

function eventSlugFromPayload(payload: NonNullable<CalWebhookBody["payload"]>): string | undefined {
  const p = payload
  let s: string | undefined
  if (typeof p.slug === "string" && p.slug.trim()) s = p.slug.trim()
  else if (typeof p.type === "string" && p.type.trim()) s = p.type.trim()
  else if (typeof p.eventType?.slug === "string" && p.eventType.slug.trim()) {
    s = p.eventType.slug.trim()
  }
  return s ? s.toLowerCase() : undefined
}

function eventTypeIdFromPayload(payload: NonNullable<CalWebhookBody["payload"]>): number | undefined {
  const p = payload
  const direct = p.eventTypeId ?? p.eventType?.id
  return typeof direct === "number" ? direct : undefined
}

function startTimeFromPayload(payload: NonNullable<CalWebhookBody["payload"]>): string | null {
  const raw = payload.startTime ?? payload.booking?.startTime
  if (typeof raw !== "string" || !raw.trim()) return null
  const t = Date.parse(raw.trim())
  if (Number.isNaN(t)) return null
  return new Date(t).toISOString()
}

function envInt(name: string): number | undefined {
  const v = Deno.env.get(name)?.trim()
  if (!v) return undefined
  const n = Number.parseInt(v, 10)
  return Number.isFinite(n) ? n : undefined
}

function classifyBooking(slug: string | undefined, eventTypeId: number | undefined): "strategy" | "intake" | "unknown" {
  const strategyId = envInt("CAL_STRATEGY_EVENT_TYPE_ID")
  const intakeId = envInt("CAL_INTAKE_EVENT_TYPE_ID")

  if ((slug !== undefined && slug.includes("intake")) || (intakeId !== undefined && eventTypeId === intakeId)) {
    return "intake"
  }
  if (slug === STRATEGY_EVENT_SLUG || (strategyId !== undefined && eventTypeId === strategyId)) {
    return "strategy"
  }
  return "unknown"
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

  // Service role bypasses RLS so Edge Functions can write to `clients` (anon key would fail).
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

  const payload = body.payload
  if (!payload) {
    return new Response(JSON.stringify({ received: true, skipped: true, reason: "no_payload" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  }

  console.log("Incoming Slug:", payload.slug || payload.eventType?.slug)
  console.log("Incoming Email:", payload.attendees?.[0]?.email)

  const email = normalizeEmail(payload.attendees?.[0]?.email)
  if (!email) {
    return new Response(JSON.stringify({ received: true, skipped: true, reason: "no_attendee_email" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  }

  const slug = eventSlugFromPayload(payload)
  const eventTypeId = eventTypeIdFromPayload(payload)
  const kind = classifyBooking(slug, eventTypeId)

  if (kind === "unknown") {
    const { data: unknownMatch, error: unknownSelectError } = await supabaseAdmin
      .from("clients")
      .select("id")
      .eq("email", email)
      .order("created_at", { ascending: false })
      .limit(1)

    if (unknownSelectError) {
      console.error("Failed to read client for unknown event type:", unknownSelectError)
      return new Response(JSON.stringify({ error: "Failed to read client record" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      })
    }

    if (unknownMatch?.length) {
      console.log(`Matched user but skipped update due to slug: ${slug ?? "(none)"}`)
    }

    return new Response(
      JSON.stringify({
        received: true,
        skipped: true,
        reason: "unknown_event_type",
        slug,
        eventTypeId,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    )
  }

  const startIso = startTimeFromPayload(payload)
  if (!startIso) {
    return new Response(JSON.stringify({ received: true, skipped: true, reason: "no_start_time" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  }

  const { data, error: selectError } = await supabaseAdmin
    .from("clients")
    .select("id, credits")
    .eq("email", email)
    .order("created_at", { ascending: false })
    .limit(1)

  if (selectError) {
    console.error("Failed to read client credits:", selectError)
    return new Response(JSON.stringify({ error: "Failed to read client record" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }

  if (!data?.length) {
    return new Response(JSON.stringify({ received: true, skipped: true, reason: "client_not_found" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  }

  const client = data[0]

  if (kind === "intake") {
    const { error: updateError } = await supabaseAdmin
      .from("clients")
      .update({ intake_call_date: startIso })
      .eq("id", client.id)

    if (updateError) {
      console.error("Failed to update intake_call_date:", updateError)
      return new Response(JSON.stringify({ error: "Failed to update client record" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      })
    }
  } else {
    const current = typeof client.credits === "number" ? client.credits : 0
    const { error: updateError } = await supabaseAdmin
      .from("clients")
      .update({
        credits: Math.max(0, current - 1),
        next_strategy_call: startIso,
      })
      .eq("id", client.id)

    if (updateError) {
      console.error("Failed to update strategy booking:", updateError)
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
