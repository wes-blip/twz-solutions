// Setup type definitions for built-in Supabase Runtime APIs
import "@supabase/functions-js/edge-runtime.d.ts"

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3"
import * as jose from "https://deno.land/x/jose@v5.9.6/index.ts"

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS, GET",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
}

const DRIVE_READONLY_SCOPE = "https://www.googleapis.com/auth/drive.readonly"
const GOOGLE_TOKEN_AUDIENCE = "https://oauth2.googleapis.com/token"

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  })
}

type ServiceAccountCredentials = {
  client_email: string
  private_key: string
}

async function getAccessTokenFromServiceAccount(
  creds: ServiceAccountCredentials,
): Promise<string> {
  const privateKey = await jose.importPKCS8(creds.private_key.trim(), "RS256")

  const assertion = await new jose.SignJWT({
    scope: DRIVE_READONLY_SCOPE,
  })
    .setProtectedHeader({ alg: "RS256", typ: "JWT" })
    .setIssuedAt()
    .setExpirationTime("1h")
    .setIssuer(creds.client_email)
    .setAudience(GOOGLE_TOKEN_AUDIENCE)
    .sign(privateKey)

  const tokenRes = await fetch(GOOGLE_TOKEN_AUDIENCE, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  })

  const tokenJson = (await tokenRes.json()) as {
    access_token?: string
    error?: string
    error_description?: string
  }

  if (!tokenRes.ok || typeof tokenJson.access_token !== "string") {
    const msg =
      tokenJson.error_description ??
      tokenJson.error ??
      tokenRes.statusText
    throw new Error(`OAuth token exchange failed: ${msg}`)
  }

  return tokenJson.access_token
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders })
  }

  if (req.method !== "POST" && req.method !== "GET") {
    return jsonResponse({ error: "Method not allowed" }, 405)
  }

  const authHeader = req.headers.get("Authorization")?.trim() ?? ""
  if (!authHeader.toLowerCase().startsWith("bearer ")) {
    return jsonResponse({ error: "Missing or invalid Authorization header" }, 401)
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("Missing SUPABASE_URL or SUPABASE_ANON_KEY")
      return jsonResponse({ error: "Server configuration error" }, 500)
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
      auth: { autoRefreshToken: false, persistSession: false },
    })

    const { data, error } = await supabase
      .from("clients")
      .select("google_drive_folder_id")
      .single()

    if (error || data?.google_drive_folder_id == null) {
      if (error) {
        console.error("clients select failed:", error.message)
      }
      return jsonResponse({ files: [] }, 200)
    }

    const folderId =
      typeof data.google_drive_folder_id === "string"
        ? data.google_drive_folder_id.trim()
        : ""

    if (!folderId) {
      return jsonResponse({ files: [] }, 200)
    }

    const serviceAccountJson = Deno.env.get("GOOGLE_SERVICE_ACCOUNT_JSON")
    if (!serviceAccountJson) {
      console.error("Missing GOOGLE_SERVICE_ACCOUNT_JSON")
      return jsonResponse({ error: "Server configuration error" }, 500)
    }

    const parsed = JSON.parse(serviceAccountJson) as ServiceAccountCredentials
    if (
      typeof parsed.client_email !== "string" ||
      typeof parsed.private_key !== "string"
    ) {
      throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON invalid shape: expected client_email and private_key strings")
    }
    const creds: ServiceAccountCredentials = {
      ...parsed,
      private_key: parsed.private_key.replace(/\\n/g, "\n"),
    }

    const accessToken = await getAccessTokenFromServiceAccount(creds)

    const q = `'${folderId.replace(/'/g, "\\'")}' in parents and trashed=false`
    const driveUrl = new URL("https://www.googleapis.com/drive/v3/files")
    driveUrl.searchParams.set("q", q)
    driveUrl.searchParams.set("fields", "files(id,name,mimeType,webViewLink)")

    const driveRes = await fetch(driveUrl.toString(), {
      headers: { Authorization: `Bearer ${accessToken}` },
    })

    const driveJson = (await driveRes.json()) as {
      files?: Array<{
        id?: string
        name?: string
        mimeType?: string
        webViewLink?: string
      }>
      error?: { message?: string }
    }

    if (!driveRes.ok) {
      const msg = driveJson.error?.message ?? driveRes.statusText
      console.error("Drive API error:", msg)
      return jsonResponse({ error: "Drive API request failed" }, 502)
    }

    const rawFiles = driveJson.files ?? []
    const files = rawFiles
      .filter(
        (f): f is { id: string; name: string; mimeType: string; webViewLink: string } =>
          typeof f.id === "string" &&
          typeof f.name === "string" &&
          typeof f.mimeType === "string" &&
          typeof f.webViewLink === "string",
      )
      .map((f) => ({
        id: f.id,
        name: f.name,
        mimeType: f.mimeType,
        webViewLink: f.webViewLink,
      }))

    return jsonResponse({ files }, 200)
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: "CRASH",
        message: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : "",
      }),
      { status: 500, headers: corsHeaders },
    )
  }
})
