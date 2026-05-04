import { getCalApi } from '@calcom/embed-react'
import { useUser } from '@clerk/clerk-react'
import { Calendar, Folder, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { useSupabase } from '../lib/supabase'

function welcomeName(user: ReturnType<typeof useUser>['user']) {
  if (!user) return null
  const name = [user.firstName, user.lastName].filter(Boolean).join(' ')
  if (name.trim()) return name.split(' ')[0] ?? name
  return user.primaryEmailAddress?.emailAddress ?? 'there'
}

export function DashboardPage() {
  const supabase = useSupabase()
  const { user, isLoaded } = useUser()
  const [credits, setCredits] = useState<number | null>(null)
  const [hasActiveSubscription, setHasActiveSubscription] = useState<
    boolean | null
  >(null)
  const [driveUrl, setDriveUrl] = useState<string | null>(null)
  const [stripeCustomerId, setStripeCustomerId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [portalLoading, setPortalLoading] = useState(false)

  useEffect(() => {
    if (!isLoaded || !user) {
      return
    }

    const clerkId = user.id
    const email = user.primaryEmailAddress?.emailAddress ?? null

    let cancelled = false

    async function loadClient() {
      setLoading(true)
      setDriveUrl(null)
      setStripeCustomerId(null)
      const { data, error } = await supabase
        .from('clients')
        .select('credits, has_active_subscription, drive_url, stripe_customer_id')
        .eq('clerk_id', clerkId)
        .maybeSingle()

      if (cancelled) {
        return
      }

      if (error) {
        console.error('Supabase clients query failed:', error)
        setDriveUrl(null)
        setStripeCustomerId(null)
        setLoading(false)
        return
      }

      if (data) {
        setCredits(data.credits)
        setHasActiveSubscription(Boolean(data.has_active_subscription))
        const sid = data.stripe_customer_id
        setStripeCustomerId(
          typeof sid === 'string' && sid.trim() ? sid.trim() : null,
        )
        const url = data.drive_url
        setDriveUrl(
          typeof url === 'string' && url.trim() ? url.trim() : null,
        )
        setLoading(false)
        return
      }

      const { error: insertError } = await supabase.from('clients').insert({
        clerk_id: clerkId,
        email,
        credits: 1,
      })

      if (cancelled) {
        return
      }

      if (insertError) {
        // Another writer (e.g. Stripe webhook upsert) may have created the row first.
        if (insertError.code === '23505') {
          const { data: afterRace, error: raceError } = await supabase
            .from('clients')
            .select(
              'credits, has_active_subscription, drive_url, stripe_customer_id',
            )
            .eq('clerk_id', clerkId)
            .maybeSingle()

          if (cancelled) {
            return
          }

          if (!raceError && afterRace) {
            setCredits(afterRace.credits)
            setHasActiveSubscription(
              Boolean(afterRace.has_active_subscription),
            )
            const sidRace = afterRace.stripe_customer_id
            setStripeCustomerId(
              typeof sidRace === 'string' && sidRace.trim()
                ? sidRace.trim()
                : null,
            )
            const url = afterRace.drive_url
            setDriveUrl(
              typeof url === 'string' && url.trim() ? url.trim() : null,
            )
            setLoading(false)
            return
          }
        }

        console.error('Supabase clients insert failed:', insertError)
        setDriveUrl(null)
        setStripeCustomerId(null)
        setLoading(false)
        return
      }

      setCredits(1)
      setHasActiveSubscription(false)
      setStripeCustomerId(null)
      setDriveUrl(null)
      setLoading(false)
    }

    void loadClient()

    return () => {
      cancelled = true
    }
  }, [isLoaded, user, supabase])

  useEffect(() => {
    void (async function () {
      const cal = await getCalApi()
      cal('ui', {
        styles: { branding: { brandColor: '#ffffff' } },
        hideEventTypeDetails: false,
        layout: 'month_view',
      })
    })()
  }, [])

  const showModule =
    isLoaded && user && !loading && credits !== null && hasActiveSubscription !== null
  const displayName = welcomeName(user)

  async function openCustomerPortal() {
    if (!stripeCustomerId?.trim()) {
      return
    }
    setPortalLoading(true)
    try {
      const { data, error } = await supabase.functions.invoke(
        'create-portal-session',
        {
          body: {
            stripe_customer_id: stripeCustomerId.trim(),
            return_url: `${window.location.origin}/dashboard`,
          },
        },
      )
      if (error) {
        console.error('create-portal-session failed:', error)
        return
      }
      const payload = data as { url?: string; error?: string } | null
      if (payload?.error) {
        console.error('create-portal-session:', payload.error)
        return
      }
      const url = payload?.url
      if (typeof url === 'string' && url) {
        window.location.href = url
        return
      }
      console.error('create-portal-session: missing url in response')
    } finally {
      setPortalLoading(false)
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-neutral-950 text-white">
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <header className="text-center sm:text-left">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-sky-400/90">
            Client portal
          </p>
          <h1 className="mt-4 text-balance text-3xl font-bold tracking-tight text-white sm:text-4xl">
            {isLoaded && user
              ? `Welcome back${displayName ? `, ${displayName}` : ''}.`
              : 'Welcome.'}
          </h1>
          <p className="mt-3 max-w-xl text-pretty text-lg text-neutral-400">
            Your dashboard for strategy calls, tasks, and subscription details.
          </p>
        </header>

        <section
          className="mt-12"
          aria-labelledby="strategy-calls-heading"
          data-has-active-subscription={
            hasActiveSubscription === null
              ? 'unknown'
              : hasActiveSubscription
                ? 'true'
                : 'false'
          }
        >
          <div className="rounded-2xl border border-white/10 bg-neutral-900 p-6 text-left shadow-xl shadow-black/40 sm:p-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex gap-4">
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/5 ring-1 ring-white/10"
                  aria-hidden
                >
                  <Calendar
                    strokeWidth={1.35}
                    className="h-6 w-6 text-emerald-400"
                  />
                </div>
                <div>
                  <h2
                    id="strategy-calls-heading"
                    className="text-sm font-semibold uppercase tracking-wider text-neutral-400"
                  >
                    Strategy Calls
                  </h2>
                  <p className="mt-2 text-lg font-semibold text-white">
                    Book time with your consultant
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-neutral-400">
                    Use your credits to schedule a focused strategy session.
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 flex-col items-stretch gap-2 sm:items-end">
                {!isLoaded || !user || loading ? (
                  <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2">
                    <Loader2
                      className="size-4 shrink-0 animate-spin text-emerald-400"
                      aria-hidden
                    />
                    <span className="text-sm font-medium text-neutral-300">
                      Loading credits…
                    </span>
                  </div>
                ) : showModule ? (
                  <div className="flex w-full flex-col items-stretch gap-2 sm:w-auto sm:items-end">
                    <span className="inline-flex w-fit items-center rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-sm font-semibold text-emerald-300 ring-1 ring-emerald-400/20">
                      Available Credits: {credits}
                    </span>
                    {hasActiveSubscription && stripeCustomerId ? (
                      <button
                        type="button"
                        onClick={() => void openCustomerPortal()}
                        disabled={portalLoading}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                      >
                        {portalLoading ? (
                          <>
                            <Loader2
                              className="size-4 shrink-0 animate-spin"
                              aria-hidden
                            />
                            Loading…
                          </>
                        ) : (
                          'Manage Subscription'
                        )}
                      </button>
                    ) : null}
                  </div>
                ) : (
                  <span className="inline-flex w-fit items-center rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm font-medium text-neutral-400">
                    Credits unavailable
                  </span>
                )}
              </div>
            </div>

            <div className="mt-8 border-t border-white/5 pt-8">
              {(() => {
                if (!isLoaded || !user || loading) {
                  return (
                    <div className="flex min-h-[44px] items-center justify-center rounded-xl border border-white/5 bg-white/[0.02] py-4">
                      <Loader2
                        className="size-6 animate-spin text-neutral-500"
                        aria-hidden
                      />
                    </div>
                  )
                }
                if (!showModule) {
                  return null
                }
                if (!hasActiveSubscription) {
                  return (
                    <div className="flex flex-col gap-3">
                      <Link
                        to="/subscription"
                        className="inline-flex w-full items-center justify-center rounded-xl bg-white px-5 py-3.5 text-center text-sm font-semibold text-neutral-950 shadow-lg shadow-black/20 transition-colors hover:bg-neutral-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:w-auto sm:min-w-[200px]"
                      >
                        Subscribe to schedule your call
                      </Link>
                    </div>
                  )
                }
                if (credits > 0) {
                  return (
                    <div className="flex flex-col gap-3">
                      <button
                        type="button"
                        data-cal-link="https://cal.com/wes-zimmerman-2xa6tz/problem-solver-strategy-call"
                        data-cal-config={JSON.stringify({
                          layout: 'month_view',
                          email: user.primaryEmailAddress?.emailAddress,
                          name:
                            user.fullName?.trim() ||
                            [user.firstName, user.lastName]
                              .filter(Boolean)
                              .join(' ')
                              .trim() ||
                            undefined,
                        })}
                        className="inline-flex w-full items-center justify-center rounded-xl bg-white px-5 py-3.5 text-center text-sm font-semibold text-neutral-950 shadow-lg shadow-black/20 transition-colors hover:bg-neutral-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:w-auto sm:min-w-[200px]"
                      >
                        Schedule Call
                      </button>
                      <p className="text-sm text-neutral-400">
                        You have a strategy call ready to be booked.
                      </p>
                    </div>
                  )
                }
                if (credits === 0) {
                  return (
                    <div className="flex flex-col gap-3">
                      <button
                        type="button"
                        disabled
                        className="inline-flex w-full cursor-not-allowed items-center justify-center rounded-xl border border-white/10 bg-white/5 px-5 py-3.5 text-center text-sm font-semibold text-neutral-500 sm:w-auto sm:min-w-[200px]"
                      >
                        No Credits Available
                      </button>
                      <p className="text-sm text-neutral-400">
                        You&apos;ve used your included strategy call, another
                        credit will be generated on your next billing cycle.
                      </p>
                    </div>
                  )
                }
                return null
              })()}
            </div>
          </div>
        </section>

        <section
          className="mt-8"
          aria-labelledby="project-files-heading"
        >
          <div className="rounded-2xl border border-white/10 bg-neutral-900 p-6 text-left shadow-xl shadow-black/40 sm:p-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
              <div className="flex gap-4">
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/5 ring-1 ring-white/10"
                  aria-hidden
                >
                  <Folder
                    strokeWidth={1.35}
                    className="h-6 w-6 text-sky-400"
                  />
                </div>
                <div>
                  <h2
                    id="project-files-heading"
                    className="text-sm font-semibold uppercase tracking-wider text-neutral-400"
                  >
                    Project Files
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-neutral-400">
                    Access your dedicated workspace to upload assets, share
                    credentials safely, and review deliverables.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 border-t border-white/5 pt-8">
              {!isLoaded || !user || loading ? (
                <div className="flex min-h-[44px] items-center justify-center rounded-xl border border-white/5 bg-white/[0.02] py-4">
                  <Loader2
                    className="size-6 animate-spin text-neutral-500"
                    aria-hidden
                  />
                </div>
              ) : driveUrl ? (
                <a
                  href={driveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-full items-center justify-center rounded-xl bg-white px-5 py-3.5 text-center text-sm font-semibold text-neutral-950 shadow-lg shadow-black/20 transition-colors hover:bg-neutral-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:w-auto sm:min-w-[200px]"
                >
                  Open Google Drive
                </a>
              ) : (
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    disabled
                    className="inline-flex w-full cursor-not-allowed items-center justify-center rounded-xl border border-white/10 bg-white/5 px-5 py-3.5 text-center text-sm font-semibold text-neutral-500 sm:w-auto sm:min-w-[200px]"
                  >
                    Workspace Pending
                  </button>
                  <p className="text-sm text-neutral-400">
                    We are provisioning your secure folder. Check back soon.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
