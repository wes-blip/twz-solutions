/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CLERK_PUBLISHABLE_KEY: string
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_STRIPE_PUBLISHABLE_KEY?: string
  readonly VITE_STRIPE_PRICE_ID?: string
  readonly VITE_STRIPE_PAYMENT_LINK_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
