import { useAuth } from '@clerk/clerk-react'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { useMemo } from 'react'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !anonKey) {
  throw new Error(
    'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Add them to .env.local and restart the dev server.',
  )
}

export function useSupabase(): SupabaseClient {
  const { getToken } = useAuth()

  return useMemo(
    () =>
      createClient(url, anonKey, {
        global: {
          fetch: async (input, init) => {
            const token = await getToken({ template: 'supabase' })
            const headers = new Headers(init?.headers ?? undefined)
            if (token) {
              headers.set('Authorization', `Bearer ${token}`)
            }
            return globalThis.fetch(input, { ...init, headers })
          },
        },
      }),
    [getToken],
  )
}
