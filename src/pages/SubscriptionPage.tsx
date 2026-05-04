import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  SignInButton,
  SignUpButton,
  useUser,
} from '@clerk/clerk-react'
import { CheckCircle2 } from 'lucide-react'

import { buildSubscriptionCheckoutUrl } from '../lib/stripePublic'
import { useSupabase } from '../lib/supabase'

function accountLabel(user: ReturnType<typeof useUser>['user']) {
  if (!user) return null
  const name = [user.firstName, user.lastName].filter(Boolean).join(' ')
  if (name.trim()) return name
  return user.primaryEmailAddress?.emailAddress ?? 'Account'
}

export function SubscriptionPage() {
  const supabase = useSupabase()
  const { user, isLoaded } = useUser()
  const signedIn = Boolean(user)
  const [hasActiveSubscription, setHasActiveSubscription] = useState<
    boolean | null
  >(null)

  useEffect(() => {
    if (!isLoaded || !user) {
      setHasActiveSubscription(null)
      return
    }

    const clerkId = user.id
    let cancelled = false

    async function loadSubscriptionFlag() {
      const { data, error } = await supabase
        .from('clients')
        .select('has_active_subscription')
        .eq('clerk_id', clerkId)
        .maybeSingle()

      if (cancelled) {
        return
      }

      if (error) {
        console.error('Supabase clients query failed:', error)
        setHasActiveSubscription(false)
        return
      }

      setHasActiveSubscription(Boolean(data?.has_active_subscription))
    }

    void loadSubscriptionFlag()

    return () => {
      cancelled = true
    }
  }, [isLoaded, user, supabase])

  const checkoutUrl = user
    ? buildSubscriptionCheckoutUrl(
        user.id,
        user.primaryEmailAddress?.emailAddress || undefined,
      )
    : '#'

  return (
    <div className="flex min-h-screen flex-1 flex-col bg-slate-950 text-white">
      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-4 py-12 sm:px-6 sm:py-16">
        <h1 className="text-center text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          Problem Solver onboarding
        </h1>
        <p className="mt-2 text-center text-sm text-slate-400">
          Two quick steps to activate your plan.
        </p>

        <div className="mt-10 space-y-6">
          <section
            className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl shadow-black/20 backdrop-blur-sm sm:p-8"
            aria-labelledby="step-account"
          >
            {!isLoaded ? (
              <p className="text-sm text-slate-400">Loading…</p>
            ) : signedIn ? (
              <>
                <div className="flex items-start gap-3">
                  <CheckCircle2
                    className="h-6 w-6 shrink-0 text-emerald-400"
                    strokeWidth={2}
                    aria-hidden
                  />
                  <div>
                    <h2
                      id="step-account"
                      className="text-lg font-semibold text-white"
                    >
                      Step 1: Account Verified
                    </h2>
                    <p className="mt-1 text-sm text-slate-400">
                      Signed in as{' '}
                      <span className="font-medium text-slate-200">
                        {accountLabel(user)}
                      </span>
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <>
                <h2
                  id="step-account"
                  className="text-lg font-semibold text-white"
                >
                  Step 1: Create your account
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">
                  Create a free account to manage your subscription and client
                  portal.
                </p>
                <div className="mt-6 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-center">
                  <SignUpButton mode="modal">
                    <button
                      type="button"
                      className="w-full rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-black/30 transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:w-auto"
                    >
                      Create account
                    </button>
                  </SignUpButton>
                </div>
                <p className="mt-4 text-center text-xs text-slate-500">
                  Already have an account?{' '}
                  <SignInButton mode="modal">
                    <button
                      type="button"
                      className="cursor-pointer font-medium text-sky-400 underline-offset-2 hover:text-sky-300 hover:underline"
                    >
                      Sign in
                    </button>
                  </SignInButton>
                </p>
              </>
            )}
          </section>

          <section
            className={`rounded-2xl border p-6 shadow-xl backdrop-blur-sm transition-opacity duration-200 sm:p-8 ${
              signedIn
                ? 'border-sky-500/40 bg-slate-900/90 shadow-sky-950/40 ring-1 ring-sky-500/20'
                : 'pointer-events-none border-slate-800 bg-slate-900/40 opacity-50 select-none'
            }`}
            aria-labelledby="step-subscription"
          >
            <h2
              id="step-subscription"
              className="text-lg font-semibold text-white"
            >
              Step 2: Set Up Subscription
            </h2>
            {signedIn ? (
              hasActiveSubscription === null ? (
                <p className="mt-3 text-sm text-slate-400">Loading…</p>
              ) : hasActiveSubscription ? (
                <>
                  <p className="mt-3 text-sm leading-relaxed text-slate-300">
                    You already have an active Problem Solver Plan.
                  </p>
                  <Link
                    to="/dashboard"
                    className="mt-6 inline-block w-full text-center rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-all"
                  >
                    Enter Client Portal
                  </Link>
                </>
              ) : (
                <>
                  <p className="mt-3 text-sm leading-relaxed text-slate-300">
                    <span className="font-medium text-white">
                      The Problem Solver Plan
                    </span>{' '}
                    — $50/mo (Founder&apos;s Deal)
                  </p>
                  <a
                    href={checkoutUrl}
                    className="mt-6 inline-block w-full text-center rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-all"
                  >
                    Complete Subscription
                  </a>
                </>
              )
            ) : (
              <p className="mt-3 text-sm text-slate-500">
                Sign in to continue with subscription setup.
              </p>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
