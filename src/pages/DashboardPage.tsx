import { getCalApi } from '@calcom/embed-react'
import { useUser } from '@clerk/clerk-react'
import {
  Calendar,
  Cog,
  File,
  FileText,
  Folder,
  Loader2,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'

import { useSupabase } from '../lib/supabase'
import type { ClientDashboardRow } from '../types/clients'

type DriveFileItem = {
  id: string
  name: string
  mimeType: string
  webViewLink: string
}

function driveFileIconForMime(mimeType: string): LucideIcon {
  if (mimeType === 'application/vnd.google-apps.folder') {
    return Folder
  }
  if (mimeType === 'application/vnd.google-apps.document') {
    return FileText
  }
  if (mimeType === 'application/pdf') {
    return File
  }
  return File
}

function driveFileIconClassName(mimeType: string): string {
  if (mimeType === 'application/vnd.google-apps.folder') {
    return 'text-sky-400 group-hover:text-sky-300'
  }
  if (mimeType === 'application/vnd.google-apps.document') {
    return 'text-blue-400 group-hover:text-blue-300'
  }
  if (mimeType === 'application/pdf') {
    return 'text-red-300 group-hover:text-red-200'
  }
  return 'text-neutral-400 group-hover:text-neutral-300'
}

function welcomeName(user: ReturnType<typeof useUser>['user']) {
  if (!user) return null
  const name = [user.firstName, user.lastName].filter(Boolean).join(' ')
  if (name.trim()) return name.split(' ')[0] ?? name
  return user.primaryEmailAddress?.emailAddress ?? 'there'
}

function formatScheduledDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return new Intl.DateTimeFormat(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(d)
}

/** Columns loaded for the client dashboard (keep in sync with `ClientDashboardRow`). */
const CLIENTS_DASHBOARD_SELECT =
  'credits, has_active_subscription, google_drive_folder_id, is_custom_build, next_strategy_call, intake_call_date, current_project' as const

function parseOptionalTrimmedString(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const t = value.trim()
  return t ? t : null
}

export function DashboardPage() {
  const supabase = useSupabase()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user, isLoaded } = useUser()
  const [credits, setCredits] = useState<number | null>(null)
  const [hasActiveSubscription, setHasActiveSubscription] = useState<
    boolean | null
  >(null)
  const [isCustomBuild, setIsCustomBuild] = useState(false)
  const [nextStrategyCall, setNextStrategyCall] = useState<string | null>(
    null,
  )
  /** Subset of `clients` row; column names match Supabase. */
  const [clientData, setClientData] = useState<{
    intake_call_date: string | null
    google_drive_folder_id: string | null
    current_project: string | null
  }>({
    intake_call_date: null,
    google_drive_folder_id: null,
    current_project: null,
  })
  const [driveFiles, setDriveFiles] = useState<DriveFileItem[]>([])
  const [isFilesLoading, setIsFilesLoading] = useState(false)
  const [loading, setLoading] = useState(false)

  const markCustomBuildFromStart =
    searchParams.get('type') === 'custom-build'

  useEffect(() => {
    if (!isLoaded || !user) {
      return
    }

    const clerkId = user.id
    const email = user.primaryEmailAddress?.emailAddress ?? null

    let cancelled = false

    async function loadClient() {
      setLoading(true)
      const { data, error } = await supabase
        .from('clients')
        .select(CLIENTS_DASHBOARD_SELECT)
        .eq('clerk_id', clerkId)
        .maybeSingle()

      if (cancelled) {
        return
      }

      if (error) {
        console.error('Supabase clients query failed:', error)
        setLoading(false)
        return
      }

      function applyRow(row: ClientDashboardRow) {
        setCredits(row.credits)
        setHasActiveSubscription(Boolean(row.has_active_subscription))
        setIsCustomBuild(Boolean(row.is_custom_build))
        const ns = row.next_strategy_call
        setNextStrategyCall(
          typeof ns === 'string' && ns.trim() ? ns.trim() : null,
        )
        const raw = row as unknown as Record<string, unknown>
        setClientData({
          intake_call_date: parseOptionalTrimmedString(
            raw.intake_call_date ?? row.intake_call_date,
          ),
          google_drive_folder_id: parseOptionalTrimmedString(
            raw.google_drive_folder_id ?? row.google_drive_folder_id,
          ),
          current_project: parseOptionalTrimmedString(
            raw.current_project ?? row.current_project,
          ),
        })
      }

      if (data) {
        let row = data as ClientDashboardRow & { is_custom_build?: boolean | null }

        if (markCustomBuildFromStart && !row.is_custom_build) {
          const { error: flagError } = await supabase
            .from('clients')
            .update({ is_custom_build: true })
            .eq('clerk_id', clerkId)

          if (cancelled) {
            return
          }

          if (flagError) {
            console.error('Supabase is_custom_build update failed:', flagError)
          } else {
            row = { ...row, is_custom_build: true }
          }
        }

        applyRow(row)

        if (markCustomBuildFromStart) {
          navigate('/dashboard', { replace: true })
        }

        setLoading(false)
        return
      }

      const { error: insertError } = await supabase.from('clients').insert({
        clerk_id: clerkId,
        email,
        credits: 1,
        is_custom_build: markCustomBuildFromStart,
      })

      if (cancelled) {
        return
      }

      if (insertError) {
        // Another writer (e.g. Stripe webhook upsert) may have created the row first.
        if (insertError.code === '23505') {
          const { data: afterRace, error: raceError } = await supabase
            .from('clients')
            .select(CLIENTS_DASHBOARD_SELECT)
            .eq('clerk_id', clerkId)
            .maybeSingle()

          if (cancelled) {
            return
          }

          if (!raceError && afterRace) {
            let row = afterRace as ClientDashboardRow & {
              is_custom_build?: boolean | null
            }

            if (markCustomBuildFromStart && !row.is_custom_build) {
              const { error: flagError } = await supabase
                .from('clients')
                .update({ is_custom_build: true })
                .eq('clerk_id', clerkId)

              if (cancelled) {
                return
              }

              if (!flagError) {
                row = { ...row, is_custom_build: true }
              } else {
                console.error(
                  'Supabase is_custom_build update failed:',
                  flagError,
                )
              }
            }

            applyRow(row)

            if (markCustomBuildFromStart) {
              navigate('/dashboard', { replace: true })
            }

            setLoading(false)
            return
          }
        }

        console.error('Supabase clients insert failed:', insertError)
        setLoading(false)
        return
      }

      setCredits(1)
      setHasActiveSubscription(false)
      setIsCustomBuild(markCustomBuildFromStart)
      setNextStrategyCall(null)
      setClientData({
        intake_call_date: null,
        google_drive_folder_id: null,
        current_project: null,
      })

      if (markCustomBuildFromStart) {
        navigate('/dashboard', { replace: true })
      }

      setLoading(false)
    }

    void loadClient()

    return () => {
      cancelled = true
    }
  }, [isLoaded, user, supabase, markCustomBuildFromStart, navigate])

  useEffect(() => {
    const folderId = clientData.google_drive_folder_id?.trim() ?? ''
    if (!folderId) {
      setDriveFiles([])
      setIsFilesLoading(false)
      return
    }

    let cancelled = false
    setIsFilesLoading(true)

    void (async () => {
      const { data, error } = await supabase.functions.invoke<{
        files?: DriveFileItem[]
      }>('get-drive-files', { method: 'POST' })

      if (cancelled) {
        return
      }

      if (error) {
        console.error('get-drive-files invoke failed:', error)
        setDriveFiles([])
      } else {
        const raw = data?.files
        const list = Array.isArray(raw) ? raw : []
        const normalized: DriveFileItem[] = list.filter(
          (f): f is DriveFileItem =>
            typeof f.id === 'string' &&
            typeof f.name === 'string' &&
            typeof f.mimeType === 'string' &&
            typeof f.webViewLink === 'string',
        )
        setDriveFiles(normalized)
      }
      setIsFilesLoading(false)
    })()

    return () => {
      cancelled = true
    }
  }, [clientData.google_drive_folder_id, supabase])

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
          <div className="rounded-2xl border border-emerald-500/20 bg-neutral-900 p-6 text-left shadow-xl shadow-black/40 ring-1 ring-emerald-500/10 sm:p-8">
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
                if (nextStrategyCall) {
                  return (
                    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-stretch">
                      <p className="inline-flex w-fit max-w-full flex-col gap-1 rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-200 ring-1 ring-emerald-400/20 sm:flex-row sm:items-center sm:gap-2">
                        <span className="shrink-0 font-semibold text-emerald-300/95">
                          Strategy call scheduled for
                        </span>
                        <span className="text-emerald-100/95">
                          {formatScheduledDate(nextStrategyCall)}
                        </span>
                      </p>
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

        {isLoaded &&
        user &&
        (isCustomBuild || markCustomBuildFromStart) &&
        (markCustomBuildFromStart || !loading) ? (
          <section
            className="mt-8"
            aria-labelledby="custom-build-heading"
          >
            <div className="rounded-2xl border border-violet-500/25 bg-neutral-900 p-6 text-left shadow-xl shadow-black/40 ring-1 ring-violet-400/15 sm:p-8">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex gap-4">
                  <div
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/5 ring-1 ring-white/10"
                    aria-hidden
                  >
                    <Cog
                      strokeWidth={1.35}
                      className="h-6 w-6 text-violet-300"
                    />
                  </div>
                  <div>
                    <h2
                      id="custom-build-heading"
                      className="text-sm font-semibold uppercase tracking-wider text-neutral-400"
                    >
                      Custom Build
                    </h2>
                    <p className="mt-2 text-lg font-semibold text-white">
                      Your scoped build is underway
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-neutral-400">
                      Book a dedicated intake call to align on scope, timeline,
                      and deliverables. It does not use your strategy-call
                      credits.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 border-t border-white/5 pt-8">
                {loading ? (
                  <div className="flex min-h-[44px] items-center justify-center rounded-xl border border-white/5 bg-white/[0.02] py-4">
                    <Loader2
                      className="size-6 animate-spin text-violet-400"
                      aria-hidden
                    />
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {clientData.intake_call_date ||
                    clientData.current_project ? (
                      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-stretch">
                        {clientData.intake_call_date ? (
                          <p className="inline-flex w-fit max-w-full flex-col gap-1 rounded-xl border border-violet-500/25 bg-violet-500/10 px-4 py-3 text-sm font-medium text-violet-200 ring-1 ring-violet-400/20 sm:flex-row sm:items-center sm:gap-2">
                            <span className="shrink-0 font-semibold text-violet-300/95">
                              Intake scheduled for
                            </span>
                            <span className="text-violet-100/95">
                              {formatScheduledDate(
                                clientData.intake_call_date,
                              )}
                            </span>
                          </p>
                        ) : null}
                        {clientData.current_project ? (
                          <p className="inline-flex w-fit max-w-full flex-col gap-1 rounded-xl border border-violet-500/25 bg-violet-500/10 px-4 py-3 text-sm font-medium text-violet-200 ring-1 ring-violet-400/20 sm:flex-row sm:items-center sm:gap-2">
                            <span className="shrink-0 font-semibold text-violet-300/95">
                              Current Project:
                            </span>
                            <span className="text-violet-100/95">
                              {clientData.current_project}
                            </span>
                          </p>
                        ) : null}
                      </div>
                    ) : null}
                    {!clientData.intake_call_date ? (
                      <Link
                        to="/booking?flow=custom-build-intake"
                        className="inline-flex w-full items-center justify-center rounded-xl bg-violet-500 px-5 py-3.5 text-center text-sm font-semibold text-white shadow-lg shadow-black/20 transition-colors hover:bg-violet-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-300 sm:w-auto sm:min-w-[220px]"
                      >
                        Schedule Intake Call
                      </Link>
                    ) : null}
                  </div>
                )}
              </div>
            </div>
          </section>
        ) : null}

        <section
          className="mt-8"
          aria-labelledby="project-files-heading"
        >
          <div className="rounded-2xl border border-blue-500/20 bg-neutral-900 p-6 text-left shadow-xl shadow-black/40 ring-1 ring-blue-500/10 sm:p-8">
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

                const hasDriveFolder =
                  Boolean(clientData.google_drive_folder_id)

                if (!hasDriveFolder) {
                  return (
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
                  )
                }

                if (isFilesLoading) {
                  return (
                    <div className="flex min-h-[44px] items-center justify-center rounded-xl border border-white/5 bg-white/[0.02] py-4">
                      <Loader2
                        className="size-6 animate-spin text-neutral-500"
                        aria-hidden
                      />
                    </div>
                  )
                }

                if (driveFiles.length === 0) {
                  return (
                    <p className="text-sm text-neutral-400">
                      No files uploaded yet.
                    </p>
                  )
                }

                return (
                  <ul className="flex flex-col gap-1">
                    {driveFiles.map((file) => {
                      const Icon = driveFileIconForMime(file.mimeType)
                      return (
                        <li key={file.id}>
                          <a
                            href={file.webViewLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex items-center gap-3 rounded-xl border border-transparent px-3 py-2.5 text-left transition-colors hover:border-white/10 hover:bg-white/[0.04]"
                          >
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/5 ring-1 ring-white/10">
                              <Icon
                                strokeWidth={1.35}
                                className={`size-[18px] ${driveFileIconClassName(file.mimeType)}`}
                                aria-hidden
                              />
                            </span>
                            <span className="min-w-0 flex-1 text-sm font-medium text-white group-hover:text-white">
                              {file.name}
                            </span>
                          </a>
                        </li>
                      )
                    })}
                  </ul>
                )
              })()}
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
