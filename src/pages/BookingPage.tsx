import Cal, { getCalApi } from '@calcom/embed-react'
import { useUser } from '@clerk/clerk-react'
import { useEffect, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { PageIntro } from '../components/PageIntro'
import { CUSTOM_BUILD_INTAKE_CAL_LINK } from '../lib/bookingLinks'

export function BookingPage() {
  const [searchParams] = useSearchParams()
  const { user, isLoaded } = useUser()
  const isCustomBuildIntake =
    searchParams.get('flow') === 'custom-build-intake'

  const calEmbedConfig = useMemo(() => {
    const base = { layout: 'month_view' as const }
    if (!isLoaded || !user) {
      return base
    }
    const email = user.primaryEmailAddress?.emailAddress
    const name =
      user.fullName?.trim() ||
      [user.firstName, user.lastName].filter(Boolean).join(' ').trim() ||
      undefined
    return {
      ...base,
      ...(email ? { email } : {}),
      ...(name ? { name } : {}),
    }
  }, [isLoaded, user])

  useEffect(() => {
    if (!isCustomBuildIntake) {
      return
    }
    void (async function () {
      const cal = await getCalApi()
      cal('ui', {
        styles: { branding: { brandColor: '#ffffff' } },
        hideEventTypeDetails: false,
        layout: 'month_view',
      })
    })()
  }, [isCustomBuildIntake])

  if (isCustomBuildIntake) {
    return (
      <div className="flex min-h-0 flex-1 flex-col">
        <PageIntro
          title="Schedule Your Custom Build Intake"
          description="Choose a time below. This intake is for Custom Build onboarding only—it does not use your strategy call credits."
          hideBottomBorder
        />
        <section
          className="flex flex-1 flex-col bg-white px-4 pb-16 pt-4 sm:px-6 sm:pb-20 sm:pt-6 lg:px-8"
          aria-label="Custom build intake scheduling"
        >
          <div className="mx-auto w-full max-w-4xl">
            <div className="min-h-[720px] w-full overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
              <Cal
                calLink={CUSTOM_BUILD_INTAKE_CAL_LINK}
                config={calEmbedConfig}
                className="h-full w-full"
              />
            </div>
            <p className="mt-8 text-center text-sm leading-relaxed text-ink-secondary">
              <Link
                to="/dashboard"
                className="font-medium text-accent underline-offset-2 hover:underline"
              >
                Back to dashboard
              </Link>
            </p>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageIntro
        title="Booking & pricing"
        description="Scheduling and pricing details will live here. Check back soon."
      />
    </div>
  )
}
