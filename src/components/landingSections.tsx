import { useState, type FormEvent } from 'react'
import {
  Activity,
  Bot,
  Check,
  Cog,
  Plane,
  Rocket,
  Stethoscope,
  User,
} from 'lucide-react'
import { Link } from 'react-router-dom'

export function Hero() {
  const accentPhrase = 'text-accent'

  return (
    <section
      className="relative flex min-h-0 flex-1 flex-col overflow-hidden"
      aria-labelledby="hero-heading"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-sky-50/90 via-[var(--color-surface)] to-cyan-50/50"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-24 top-1/4 h-72 w-72 rounded-full bg-[color-mix(in_srgb,var(--color-pop)_18%,transparent)] blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-16 bottom-0 h-56 w-56 rounded-full bg-[color-mix(in_srgb,var(--color-accent)_12%,transparent)] blur-3xl"
        aria-hidden
      />
      <div className="relative z-10 flex min-h-0 flex-1 flex-col items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-3xl text-center">
          <h1
            id="hero-heading"
            className="text-[2.125rem] font-semibold leading-[1.12] tracking-[-0.02em] text-ink-strong sm:text-5xl sm:leading-[1.1] lg:text-6xl lg:leading-[1.08]"
          >
            Let&apos;s build that <span className={accentPhrase}>thing</span>{' '}
            you&apos;ve been <span className={accentPhrase}>dreaming about.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg font-normal leading-[1.65] text-ink-secondary sm:text-xl sm:leading-[1.6]">
            Whether it&apos;s a fun passion project you want to launch this
            weekend, or a serious business workflow that needs automating. We
            build beautiful, fully-functional web apps and MVPs in as little as
            24 to 48 hours.
          </p>
          <div className="mt-10 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center sm:justify-center sm:gap-4">
            <Link
              to="/start"
              className="inline-flex cursor-pointer items-center justify-center rounded-xl bg-accent px-7 py-3.5 text-[0.9375rem] font-semibold text-accent-foreground shadow-md shadow-accent/20 transition-[transform,box-shadow,background-color] duration-200 hover:-translate-y-0.5 hover:bg-sky-500 hover:shadow-lg hover:shadow-accent/25 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              Start Building
            </Link>
            <Link
              to="/builds"
              className="inline-flex cursor-pointer items-center justify-center rounded-xl border-2 border-accent bg-transparent px-7 py-3.5 text-[0.9375rem] font-semibold text-accent transition-[transform,background-color,border-color,color] duration-200 hover:-translate-y-0.5 hover:bg-accent/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              See What We&apos;ve Built
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

export function DualPath() {
  const cards = [
    {
      title: 'The Problem Solver Plan',
      icon: Rocket,
      to: '/subscription' as const,
      pricing: (
        <p className="mt-3 text-base font-semibold leading-snug text-ink-strong">
          <span className="line-through text-gray-400">$100/mo</span>{' '}
          <span className="text-accent">$50/mo (Founder&apos;s Deal)</span>
        </p>
      ),
      bullets: [
        'Sign up and set up your active subscription.',
        'Initial kick-off call to map out goals.',
        'Monthly check-ins to build new tools, maintain infrastructure, or iterate on existing apps.',
        'Client portal access to share documents and project details.',
        'Cancel anytime after the first month.',
      ],
    },
    {
      title: 'The Custom Build',
      icon: Cog,
      to: '/operator-booking' as const,
      pricing: (
        <p className="mt-3 text-base font-semibold leading-snug text-ink-strong">
          Micro-projects from{' '}
          <span className="line-through text-gray-400">$200</span>{' '}
          <span className="text-accent">$100</span>. Corporate builds from{' '}
          <span className="text-accent">$2.5k</span>.
        </p>
      ),
      bullets: [
        'Best for scoped-out, specific builds or large corporate workflows.',
        'Projects are priced individually based on a combination of live call strategy and async dev time.',
        'Receive a dedicated project timeline and deliverable schedule.',
        'Client portal access to share documents and project details.',
        'One-off payment structure, no monthly commitment.',
      ],
    },
  ] as const

  return (
    <section
      className="flex flex-1 flex-col justify-center bg-white px-4 pb-16 pt-4 sm:px-6 sm:pb-20 sm:pt-6 lg:px-8"
      aria-label="Choose your adventure"
    >
      <div className="mx-auto w-full max-w-6xl">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
          {cards.map(({ title, icon: Icon, to, pricing, bullets }) => (
            <Link
              key={title}
              to={to}
              className="group flex flex-col rounded-2xl border border-border bg-surface p-6 shadow-sm transition-[transform,box-shadow,border-color,background-color] duration-200 hover:scale-105 hover:border-accent/35 hover:bg-white hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:p-8"
            >
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-white text-accent transition-colors duration-200 group-hover:border-accent/40">
                <Icon className="h-6 w-6" strokeWidth={1.5} aria-hidden />
              </div>
              <h3 className="text-xl font-semibold tracking-tight text-ink-strong">
                {title}
              </h3>
              {pricing}
              <ul
                className="mt-4 flex-1 space-y-2 text-sm leading-relaxed text-ink-secondary"
                role="list"
              >
                {bullets.map((line) => (
                  <li key={line} className="flex gap-2.5">
                    <Check
                      className="mt-0.5 h-4 w-4 shrink-0 text-accent"
                      strokeWidth={2.25}
                      aria-hidden
                    />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

export function FounderBio() {
  return (
    <section
      className="border-b border-border bg-white px-4 py-16 sm:px-6 sm:py-20 lg:px-8"
      aria-labelledby="founder-heading"
    >
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-start lg:gap-12">
          <div className="lg:col-span-7">
            <h2
              id="founder-heading"
              className="text-2xl font-semibold tracking-tight text-ink-strong sm:text-3xl"
            >
              Who is building your system?
            </h2>
            <div className="mt-6 space-y-4 leading-relaxed text-ink-secondary">
              <p>
                <strong className="font-semibold text-ink-strong">
                  Wes Zimmerman
                </strong>{' '}
                is the founder of TWZ Solutions. He bridges enterprise operations
                and product speed: a decade in supply chain and complex workflows
                informs how we scope, automate, and ship—so your build is not
                just fast, but grounded in how real businesses run.
              </p>
              <p>
                Whether we are turning an idea into an MVP in 48 hours or
                replacing brittle manual processes with reliable automation, the
                goal is the same: clear interfaces, maintainable systems, and
                outcomes you can measure.
              </p>
            </div>
          </div>
          <aside className="lg:col-span-5">
            <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm sm:p-8">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-border bg-white text-accent">
                  <User className="h-6 w-6" strokeWidth={1.5} aria-hidden />
                </div>
                <div>
                  <p className="text-lg font-semibold tracking-tight text-ink-strong">
                    Wes Zimmerman
                  </p>
                  <p className="mt-1 text-sm text-ink-secondary">
                    Founder · TWZ Solutions LLC
                  </p>
                </div>
              </div>
              <ul className="mt-6 space-y-3 border-t border-border pt-6 text-sm text-ink-secondary">
                <li className="flex gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                  <span>
                    MVPs, internal tools, and workflow automation for founders and
                    operators.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                  <span>
                    Enterprise-grade discipline without enterprise-grade drag.
                  </span>
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}

export function SelectedProjects() {
  const projects = [
    {
      title: 'Spinescore',
      tag: '48-Hour Build | Health-Tech',
      description:
        "A custom clinical assessment web app built from concept to live in exactly 48 hours. Features a custom webhook integration that pipes complex survey data directly into the client's GoHighLevel (GHL) CRM for instant automated routing.",
      icon: Stethoscope,
    },
    {
      title: 'Twizz Travel (Beta)',
      tag: 'AI Integration | Consumer App',
      description:
        'A fun, AI-driven travel itinerary builder bridging the gap between automated trip planning and direct booking. Currently integrating with Ratehawk to handle end-to-end logistics, hotels, and local activities.',
      icon: Plane,
    },
    {
      title: 'Custom RPA Bots',
      tag: 'Workflow Automation | Enterprise RPA',
      description:
        'Engineered custom Robotic Process Automation (RPA) bots to navigate complex data entry for state-level utility and incentive programs. We replaced hours of mind-numbing manual registrations with a silent, background automation that runs flawlessly. The perfect solution for desk workers and operators who want to automate the boring parts of their day and get their time back.',
      icon: Bot,
    },
  ] as const

  return (
    <section
      className="border-b border-border bg-white px-4 py-16 sm:px-6 sm:py-20 lg:px-8"
      aria-labelledby="projects-heading"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 max-w-2xl lg:mb-12">
          <h2
            id="projects-heading"
            className="text-2xl font-semibold tracking-tight text-ink-strong sm:text-3xl"
          >
            Selected Projects
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
          {projects.map(({ title, tag, description, icon: Icon }) => (
            <article
              key={title}
              className="group flex flex-col rounded-2xl border border-border bg-surface p-6 shadow-sm transition-colors duration-200 hover:border-slate-300 hover:shadow-md sm:p-8"
            >
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-white text-accent transition-colors duration-200 group-hover:border-accent/30">
                <Icon className="h-6 w-6" strokeWidth={1.5} aria-hidden />
              </div>
              <h3 className="text-xl font-semibold tracking-tight text-ink-strong">
                {title}
              </h3>
              <p className="mt-3 text-sm font-medium text-accent">{tag}</p>
              <p className="mt-4 flex-1 leading-relaxed text-ink-secondary">
                {description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function SpineScoreMock() {
  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-border bg-white shadow-lg"
      role="img"
      aria-label="Spine Score interface mock-up: score dashboard for a medical client"
    >
      <div className="flex items-center gap-2 border-b border-border bg-slate-50 px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
        <span className="h-2.5 w-2.5 rounded-full bg-slate-200" />
        <span className="h-2.5 w-2.5 rounded-full bg-slate-200" />
        <span className="ml-2 font-mono text-[10px] uppercase tracking-wider text-ink-secondary">
          spine-score.app / clinical
        </span>
      </div>
      <div className="grid gap-0 lg:grid-cols-5">
        <div className="border-b border-border p-5 lg:col-span-2 lg:border-b-0 lg:border-r">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-ink-secondary">
            Patient snapshot
          </p>
          <p className="mt-3 text-sm font-medium text-ink-strong">Assessment</p>
          <div className="mt-4 space-y-3">
            {['Posture', 'Mobility', 'Load symmetry'].map((label) => (
              <div
                key={label}
                className="flex items-center justify-between border-b border-dashed border-border pb-2 text-xs text-ink-secondary last:border-0"
              >
                <span>{label}</span>
                <span className="font-mono text-ink-strong">—</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-surface p-6 lg:col-span-3">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-accent">
                Spine Score
              </p>
              <p className="mt-1 text-2xl font-semibold tabular-nums tracking-tight text-ink-strong">
                84
                <span className="text-base font-medium text-ink-secondary">
                  /100
                </span>
              </p>
            </div>
            <div className="rounded-lg border border-border bg-white p-2 text-accent">
              <Activity className="h-6 w-6" strokeWidth={1.5} aria-hidden />
            </div>
          </div>
          <div className="mt-8 flex h-28 items-end gap-1.5">
            {[40, 52, 48, 61, 55, 70, 78, 84].map((h, i) => (
              <div
                key={i}
                className="flex-1 rounded-t bg-gradient-to-t from-accent/20 to-accent/60"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
          <p className="mt-4 text-[11px] leading-relaxed text-ink-secondary">
            Read-only prototype · anonymized metrics · built for clinical review
            workflows
          </p>
        </div>
      </div>
    </div>
  )
}

export function CaseStudy() {
  return (
    <section
      className="border-b border-border bg-surface px-4 py-16 sm:px-6 sm:py-20 lg:px-8"
      aria-labelledby="case-heading"
    >
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-12 lg:items-start">
          <div className="lg:col-span-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-3 py-1 text-xs font-medium text-ink-secondary">
              <Stethoscope className="h-3.5 w-3.5 text-accent" aria-hidden />
              Case study
            </div>
            <h2
              id="case-heading"
              className="mt-4 text-2xl font-semibold tracking-tight text-ink-strong sm:text-3xl"
            >
              Spine Score
            </h2>
            <p className="mt-4 leading-relaxed text-ink-secondary">
              A rapid interface prototype for a medical client: clear scoring,
              calm hierarchy, and data shaped for decision-making—not decoration.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-ink-secondary">
              <li className="flex gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                <span>
                  <strong className="font-semibold text-ink-strong">
                    7-day rapid prototype
                  </strong>{' '}
                  — from brief to clickable review surface.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                <span>
                  <strong className="font-semibold text-ink-strong">
                    Medical context
                  </strong>{' '}
                  — clinical tone, restrained motion, audit-friendly layout.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                <span>
                  <strong className="font-semibold text-ink-strong">
                    Performance-first
                  </strong>{' '}
                  — lean bundle, sharp type, zero gimmicks.
                </span>
              </li>
            </ul>
          </div>
          <div className="lg:col-span-7">
            <SpineScoreMock />
          </div>
        </div>
      </div>
    </section>
  )
}

export function LeadForm() {
  const [sent, setSent] = useState(false)

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSent(true)
  }

  return (
    <section
      className="bg-white px-4 py-16 sm:px-6 sm:py-20 lg:px-8"
      aria-labelledby="contact-heading"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-xl">
          <h2
            id="contact-heading"
            className="text-center text-2xl font-semibold tracking-tight text-ink-strong sm:text-3xl"
          >
            Start the conversation
          </h2>
          <p className="mt-3 text-center text-ink-secondary">
            Tell us what you are building. We respond with clarity—not a sales
            script.
          </p>

          {sent ? (
            <p
              className="mt-10 rounded-2xl border border-border bg-surface px-6 py-8 text-center text-ink-secondary"
              role="status"
            >
              Thank you. If this were live, your details would be on their way
              to our team. For now, connect directly at{' '}
              <a
                href="mailto:hello@twzsolutions.com"
                className="cursor-pointer font-semibold text-accent underline-offset-2 transition-colors duration-200 hover:text-sky-600 hover:underline"
              >
                hello@twzsolutions.com
              </a>
              .
            </p>
          ) : (
            <form
              className="mt-10 space-y-6"
              onSubmit={onSubmit}
              noValidate
            >
              <div className="space-y-2">
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-ink-strong"
                >
                  Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  placeholder="Jordan Lee"
                  className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-ink placeholder:text-slate-400 transition-colors duration-200 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="url"
                  className="block text-sm font-medium text-ink-strong"
                >
                  Current URL{' '}
                  <span className="font-normal text-ink-secondary">(optional)</span>
                </label>
                <input
                  id="url"
                  name="url"
                  type="url"
                  inputMode="url"
                  autoComplete="url"
                  placeholder="https://"
                  className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-ink placeholder:text-slate-400 transition-colors duration-200 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="build"
                  className="block text-sm font-medium text-ink-strong"
                >
                  What are we building?
                </label>
                <textarea
                  id="build"
                  name="build"
                  required
                  rows={4}
                  placeholder="Product, timeline, constraints, success criteria."
                  className="w-full resize-y rounded-lg border border-border bg-surface px-4 py-3 text-ink placeholder:text-slate-400 transition-colors duration-200 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                />
              </div>
              <button
                type="submit"
                className="w-full cursor-pointer rounded-lg bg-accent py-3.5 text-sm font-semibold text-accent-foreground shadow-sm transition-colors duration-200 hover:bg-sky-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                Request a response
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}

export function Footer() {
  return (
    <footer
      className="border-t border-border bg-surface px-4 py-10 sm:px-6 lg:px-8"
      role="contentinfo"
    >
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-center text-sm text-ink-secondary sm:flex-row sm:text-left">
        <p className="font-medium text-ink-strong">TWZ Solutions LLC</p>
        <p>We&apos;re ready to build when you are!</p>
      </div>
    </footer>
  )
}

export function PricingOverview() {
  const tiers = [
    {
      name: 'Sprint MVP',
      price: 'From $2.5k',
      detail: '48–72 hour focused build for validation and demos.',
    },
    {
      name: 'Workflow build',
      price: 'Custom',
      detail: 'Automation, integrations, and internal tools scoped to your ops.',
    },
    {
      name: 'Ongoing partnership',
      price: 'Retainer',
      detail: 'Iteration, support, and roadmap work after launch.',
    },
  ] as const

  return (
    <section
      className="border-b border-border bg-surface px-4 py-16 sm:px-6 sm:py-20 lg:px-8"
      aria-labelledby="pricing-heading"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 max-w-2xl text-center lg:mx-auto lg:mb-12">
          <h2
            id="pricing-heading"
            className="text-2xl font-semibold tracking-tight text-ink-strong sm:text-3xl"
          >
            Pricing &amp; getting started
          </h2>
          <p className="mt-3 text-ink-secondary">
            Every engagement starts with a short scope call. Numbers below are
            starting points; we quote after we understand constraints and
            timeline.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
          {tiers.map(({ name, price, detail }) => (
            <article
              key={name}
              className="flex flex-col rounded-2xl border border-border bg-white p-6 shadow-sm sm:p-8"
            >
              <h3 className="text-lg font-semibold text-ink-strong">{name}</h3>
              <p className="mt-2 text-2xl font-semibold tracking-tight text-accent">
                {price}
              </p>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-secondary">
                {detail}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
