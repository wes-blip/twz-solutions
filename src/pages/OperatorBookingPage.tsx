import { Link } from 'react-router-dom'
import { PageIntro } from '../components/PageIntro'
import { CUSTOM_BUILD_INTAKE_CALENDAR_HREF } from '../lib/bookingLinks'
import { getStripePaymentLinkBaseUrl } from '../lib/stripePublic'

export function OperatorBookingPage() {
  const stripeSubscribeHref = getStripePaymentLinkBaseUrl()

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageIntro
        title="Automate & Scale."
        description="Choose how we start. Book a free discovery call to scope a custom project, lock in immediate build time, or subscribe to our premium fractional development retainer."
        hideBottomBorder
      />
      <section
        className="flex flex-1 flex-col bg-white px-4 pb-16 pt-4 sm:px-6 sm:pb-20 sm:pt-6 lg:px-8"
        aria-label="Booking options"
      >
        <div className="mx-auto w-full max-w-6xl">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-10">
            <article className="flex flex-col rounded-2xl border-2 border-dashed border-border bg-white p-6 shadow-sm sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-secondary">
                The Safe Route
              </p>
              <h3 className="mt-2 text-xl font-semibold tracking-tight text-ink-strong sm:text-2xl">
                Discovery Call &amp; Scoping
              </h3>
              <div className="mt-3 flex min-h-[2.75rem] items-center">
                <p className="inline-flex w-fit rounded-full border border-accent/35 bg-accent-soft px-3 py-1 text-sm font-semibold text-accent">
                  Free 30-Min Call
                </p>
              </div>
              <p className="mt-5 leading-relaxed text-ink-secondary">
                Need a specific bot, dashboard, or workflow automation built from
                scratch? Let&apos;s map it out and build a custom, flat-rate
                quote.
              </p>
              <ol className="mt-5 flex-1 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-ink-secondary marker:font-semibold marker:text-ink-strong">
                <li>Book your 30-minute discovery slot.</li>
                <li>We discuss your current bottlenecks and legacy systems.</li>
                <li>
                  I provide a transparent quote and timeline for the build.
                </li>
              </ol>
              <a
                href={CUSTOM_BUILD_INTAKE_CALENDAR_HREF}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 inline-flex w-full items-center justify-center rounded-xl border-2 border-accent bg-transparent px-6 py-3.5 text-[0.9375rem] font-semibold text-accent transition-[transform,background-color,border-color,color] hover:-translate-y-0.5 hover:bg-accent/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                Schedule Discovery Call
              </a>
            </article>

            <article className="relative flex flex-col overflow-hidden rounded-2xl border-2 border-accent/40 bg-gradient-to-br from-sky-50/90 via-white to-cyan-50/80 p-6 shadow-lg shadow-accent/10 ring-1 ring-accent/20 sm:p-8">
              <div
                className="pointer-events-none absolute -right-16 top-0 h-40 w-40 rounded-full bg-[color-mix(in_srgb,var(--color-accent)_14%,transparent)] blur-3xl"
                aria-hidden
              />
              <div className="relative flex flex-1 flex-col">
                <p className="text-xs font-semibold uppercase tracking-wide text-accent">
                  The Fast Route
                </p>
                <h3 className="mt-2 text-xl font-semibold tracking-tight text-ink-strong sm:text-2xl">
                  Live Automation Block
                </h3>
                <div className="mt-3 flex min-h-[2.75rem] flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="text-lg font-normal tracking-tight text-ink-secondary line-through">
                    $200/hr
                  </span>
                  <span className="text-lg font-bold tracking-tight text-ink-strong">
                    $100/hr
                  </span>
                </div>
                <p className="mt-5 leading-relaxed text-ink-secondary">
                  Skip the scoping phase. You are buying dedicated time to build
                  or fix your RPA bots and workflows immediately.
                </p>
                <ol className="mt-5 flex-1 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-ink-secondary marker:font-semibold marker:text-ink-strong">
                  <li>Select your 1-2 hour time block.</li>
                  <li>
                    Optional Brain Dump: Upload your process docs or files.
                  </li>
                  <li>Submit payment to lock in the build.*</li>
                  <li>
                    The Handoff: I deliver the working automation. It&apos;s
                    yours.
                  </li>
                </ol>
                <p className="relative mt-4 text-xs italic leading-relaxed text-ink-secondary">
                  *Your payment guarantees a functional, working first version
                  of your build by the end of our session.
                </p>
                <Link
                  to="/checkout"
                  className="relative mt-8 inline-flex w-full items-center justify-center rounded-xl bg-accent px-7 py-3.5 text-center text-[0.9375rem] font-semibold text-accent-foreground shadow-md shadow-accent/25 transition-[transform,box-shadow,background-color] hover:-translate-y-0.5 hover:bg-sky-500 hover:shadow-lg hover:shadow-accent/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  Reserve Dev Block
                </Link>
              </div>
            </article>

            <article className="relative flex flex-col overflow-hidden rounded-2xl border border-zinc-700/90 bg-zinc-950 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_0_48px_-12px_rgba(255,255,255,0.12),0_25px_50px_-12px_rgba(0,0,0,0.55)] ring-1 ring-white/10 sm:p-8">
              <div
                className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-white/[0.06] blur-3xl"
                aria-hidden
              />
              <div className="relative flex flex-1 flex-col">
                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                  The Long-Term Play
                </p>
                <h3 className="mt-2 text-xl font-semibold tracking-tight text-white sm:text-2xl">
                  Problem Solver Plan
                </h3>
                <div className="mt-3 flex min-h-[2.75rem] flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="text-lg font-normal tracking-tight text-zinc-400 line-through">
                    $100/mo
                  </span>
                  <span className="text-lg font-bold tracking-tight text-white">
                    $50/mo
                  </span>
                </div>
                <p className="mt-5 leading-relaxed text-zinc-300">
                  Your dedicated, asynchronous tech partner. Best for businesses
                  with ongoing system maintenance or background automation
                  builds.
                </p>
                <ol className="mt-5 flex-1 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-zinc-300 marker:font-semibold marker:text-white">
                  <li>Subscribe to lock in your monthly dev time.</li>
                  <li>
                    Submit your ongoing task list or operational bottlenecks.
                  </li>
                  <li>
                    I execute the builds asynchronously. Includes a 30-min
                    monthly check-in.
                  </li>
                </ol>
                <a
                  href={stripeSubscribeHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative mt-8 inline-flex w-full items-center justify-center rounded-xl bg-white px-7 py-3.5 text-center text-[0.9375rem] font-semibold text-zinc-950 shadow-lg shadow-black/40 transition-[transform,box-shadow,background-color] hover:-translate-y-0.5 hover:bg-zinc-100 hover:shadow-xl hover:shadow-black/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  Subscribe Now
                </a>
              </div>
            </article>
          </div>
        </div>
      </section>
    </div>
  )
}
