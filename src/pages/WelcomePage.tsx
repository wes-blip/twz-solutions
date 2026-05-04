import { Link } from 'react-router-dom'
import { CircleCheck } from 'lucide-react'

export function WelcomePage() {
  return (
    <div className="flex min-h-0 flex-1 flex-col bg-neutral-950 text-white">
      <div className="flex min-h-[calc(100dvh-4.5rem)] flex-1 flex-col items-center justify-center px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto flex w-full max-w-3xl flex-col items-center text-center">
          <div
            className="flex h-24 w-24 items-center justify-center rounded-full bg-emerald-500/15 ring-1 ring-emerald-400/30"
            aria-hidden
          >
            <CircleCheck
              strokeWidth={1.35}
              className="h-14 w-14 text-emerald-400 drop-shadow-[0_0_24px_rgba(52,211,153,0.35)] animate-[welcome-pop_0.65s_cubic-bezier(0.22,1,0.36,1)_both]"
            />
          </div>

          <h1 className="mt-10 text-balance text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Payment Successful. Welcome aboard.
          </h1>
          <p className="mt-4 max-w-xl text-pretty text-lg text-neutral-400">
            Your Problem Solver Plan is now active. Let&apos;s get to work.
          </p>

          <div className="mt-12 w-full rounded-2xl border border-white/10 bg-neutral-900 p-6 text-left shadow-xl shadow-black/40 sm:p-8">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-400">
              Your Next Steps
            </h2>
            <ol className="mt-6 flex flex-col gap-6 border-t border-white/5 pt-6">
              <li className="flex gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/5 text-sm font-semibold text-neutral-300 ring-1 ring-white/10">
                  1
                </span>
                <div>
                  <p className="font-semibold text-white">Check your inbox</p>
                  <p className="mt-1 text-sm leading-relaxed text-neutral-400">
                    You&apos;ll receive your Stripe receipt momentarily.
                  </p>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/5 text-sm font-semibold text-neutral-300 ring-1 ring-white/10">
                  2
                </span>
                <div>
                  <p className="font-semibold text-white">Access the Portal</p>
                  <p className="mt-1 text-sm leading-relaxed text-neutral-400">
                    Log in to your dashboard to schedule your kickoff call, submit
                    tasks, and share credentials safely.
                  </p>
                </div>
              </li>
            </ol>
          </div>

          <div className="mt-10 flex w-full max-w-md justify-center">
            <Link
              to="/dashboard"
              className="inline-flex w-full items-center justify-center rounded-xl bg-white px-5 py-3.5 text-center text-sm font-semibold text-neutral-950 transition-colors hover:bg-neutral-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Enter Client Portal
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
