import {
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton,
  useUser,
} from '@clerk/clerk-react'
import { Loader2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'

import { useSupabase } from '../lib/supabase'

function HamburgerIcon({ open }: { open: boolean }) {
  return (
    <svg
      className="h-5 w-5 shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden
    >
      {open ? (
        <>
          <path d="M18 6L6 18M6 6l12 12" />
        </>
      ) : (
        <>
          <path d="M4 7h16M4 12h16M4 17h16" />
        </>
      )}
    </svg>
  )
}

export function NavigationHeader() {
  const { pathname } = useLocation()
  const isDashboard = pathname === '/dashboard'
  const supabase = useSupabase()
  const { user, isLoaded } = useUser()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [hasActiveSubscription, setHasActiveSubscription] = useState<
    boolean | null
  >(null)
  const [stripeCustomerId, setStripeCustomerId] = useState<string | null>(null)
  const [portalLoading, setPortalLoading] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isLoaded || !user) {
      setHasActiveSubscription(null)
      setStripeCustomerId(null)
      return
    }

    const clerkId = user.id
    let cancelled = false

    async function loadSubscriptionFlag() {
      const { data, error } = await supabase
        .from('clients')
        .select('has_active_subscription, stripe_customer_id')
        .eq('clerk_id', clerkId)
        .maybeSingle()

      if (cancelled) {
        return
      }

      if (error) {
        console.error('Supabase clients query failed:', error)
        setHasActiveSubscription(false)
        setStripeCustomerId(null)
        return
      }

      setHasActiveSubscription(Boolean(data?.has_active_subscription))
      const sid =
        typeof data?.stripe_customer_id === 'string'
          ? data.stripe_customer_id.trim()
          : ''
      setStripeCustomerId(sid ? sid : null)
    }

    void loadSubscriptionFlag()

    return () => {
      cancelled = true
    }
  }, [isLoaded, user, supabase])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false)
      }
    }

    if (!isMenuOpen) return

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isMenuOpen])

  const closeMenu = () => setIsMenuOpen(false)

  async function handleManageSubscriptionClick() {
    if (!stripeCustomerId || portalLoading) {
      return
    }
    setPortalLoading(true)
    try {
      const { data, error } = await supabase.functions.invoke<{
        url?: string
      }>('create-portal-session', {
        body: {
          stripe_customer_id: stripeCustomerId,
          return_url: `${window.location.origin}/dashboard`,
        },
      })
      if (error) {
        console.error('create-portal-session invoke failed:', error)
        return
      }
      const url = data?.url
      if (typeof url === 'string' && url.length > 0) {
        window.location.href = url
        return
      }
      console.error('create-portal-session returned no url:', data)
    } finally {
      setPortalLoading(false)
    }
  }

  return (
    <header
      className={
        isDashboard
          ? 'sticky top-0 z-50 border-b border-white/10 bg-neutral-950'
          : 'sticky top-0 z-50 border-b border-border bg-surface'
      }
      role="banner"
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:gap-6 sm:px-6 lg:px-8">
        <Link
          to="/"
          className={
            isDashboard
              ? '-ml-0.5 shrink-0 text-[1.125rem] font-bold tracking-[-0.04em] text-white transition-colors hover:text-neutral-200 focus-visible:rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white/40 sm:text-xl'
              : '-ml-0.5 shrink-0 text-[1.125rem] font-bold tracking-[-0.04em] text-ink-strong transition-colors hover:text-ink focus-visible:rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink-strong sm:text-xl'
          }
        >
          TWZ Solutions
        </Link>

        <div
          ref={menuRef}
          className="relative flex min-w-0 flex-1 justify-center"
        >
          <button
            type="button"
            onClick={() => setIsMenuOpen((o) => !o)}
            aria-expanded={isMenuOpen}
            aria-haspopup="true"
            aria-controls="nav-dropdown"
            id="nav-menu-button"
            className={
              isDashboard
                ? 'inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-4 py-2.5 text-sm font-semibold text-neutral-100 shadow-sm ring-1 ring-white/10 transition-all hover:border-white/30 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/40'
                : 'inline-flex items-center gap-2 rounded-xl border border-slate-300/90 bg-surface px-4 py-2.5 text-sm font-semibold text-ink-strong shadow-sm ring-1 ring-slate-900/[0.06] transition-all hover:border-slate-400 hover:bg-slate-200/45 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink-strong'
            }
          >
            <HamburgerIcon open={isMenuOpen} />
            <span>Menu</span>
          </button>

          {isMenuOpen ? (
            <div
              id="nav-dropdown"
              role="menu"
              aria-labelledby="nav-menu-button"
              className="absolute left-1/2 top-full z-50 mt-3 w-[min(18rem,calc(100vw-2rem))] -translate-x-1/2 overflow-hidden rounded-2xl border border-black/5 bg-white p-2 shadow-lg ring-1 ring-black/5"
            >
              <div className="flex flex-col gap-0.5">
                <NavLink
                  to="/"
                  end
                  role="menuitem"
                  onClick={closeMenu}
                  className={({ isActive }) =>
                    [
                      'rounded-lg px-4 py-3 text-sm font-semibold transition-colors',
                      isActive
                        ? 'bg-accent/12 text-accent'
                        : 'text-ink-strong hover:bg-stone-100/80',
                    ].join(' ')
                  }
                >
                  Home
                </NavLink>
                <NavLink
                  to="/start"
                  role="menuitem"
                  onClick={closeMenu}
                  className={({ isActive }) =>
                    [
                      'rounded-lg px-4 py-3 text-sm font-semibold transition-colors',
                      isActive
                        ? 'bg-accent/12 text-accent'
                        : 'text-ink-strong hover:bg-stone-100/80',
                    ].join(' ')
                  }
                >
                  Services & Pricing
                </NavLink>
                <NavLink
                  to="/builds"
                  role="menuitem"
                  onClick={closeMenu}
                  className={({ isActive }) =>
                    [
                      'rounded-lg px-4 py-3 text-sm font-semibold transition-colors',
                      isActive
                        ? 'bg-accent/12 text-accent'
                        : 'text-ink-strong hover:bg-stone-100/80',
                    ].join(' ')
                  }
                >
                  Success Stories
                </NavLink>
                <SignedIn>
                  <NavLink
                    to="/dashboard"
                    role="menuitem"
                    onClick={closeMenu}
                    className={({ isActive }) =>
                      [
                        'rounded-lg px-4 py-3 text-sm font-semibold transition-colors',
                        isActive
                          ? 'bg-accent/12 text-accent'
                          : 'text-ink-strong hover:bg-stone-100/80',
                      ].join(' ')
                    }
                  >
                    Dashboard
                  </NavLink>
                  {hasActiveSubscription === true ? (
                    <button
                      type="button"
                      role="menuitem"
                      disabled={portalLoading || !stripeCustomerId}
                      title={
                        !stripeCustomerId
                          ? 'Billing account not linked yet'
                          : undefined
                      }
                      onClick={() => void handleManageSubscriptionClick()}
                      className={[
                        'flex w-full items-center gap-2 rounded-lg px-4 py-3 text-left text-sm font-semibold transition-colors',
                        portalLoading || !stripeCustomerId
                          ? 'cursor-not-allowed text-neutral-400'
                          : 'text-ink-strong hover:bg-stone-100/80',
                      ].join(' ')}
                    >
                      {portalLoading ? (
                        <>
                          <Loader2
                            className="size-4 shrink-0 animate-spin text-accent"
                            aria-hidden
                          />
                          <span>Loading…</span>
                        </>
                      ) : (
                        'Manage Subscription'
                      )}
                    </button>
                  ) : null}
                </SignedIn>
              </div>
            </div>
          ) : null}
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <SignedOut>
            <SignInButton mode="modal">
              <button
                type="button"
                className={
                  isDashboard
                    ? 'cursor-pointer rounded-lg border border-white/25 bg-white/10 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-white/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/40'
                    : 'cursor-pointer rounded-lg border border-accent/40 bg-accent/10 px-4 py-2 text-sm font-semibold text-accent shadow-sm transition-colors hover:bg-accent/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent'
                }
              >
                Client Login
              </button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <span
              className={
                isDashboard
                  ? 'max-w-[9rem] truncate text-sm font-semibold text-neutral-300 sm:max-w-[14rem]'
                  : 'max-w-[9rem] truncate text-sm font-semibold text-ink-strong sm:max-w-[14rem]'
              }
            >
              {user?.firstName ? `Hi, ${user.firstName}!` : 'Hi there!'}
            </span>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: isDashboard
                    ? 'h-9 w-9 ring-2 ring-white/25'
                    : 'h-9 w-9 ring-2 ring-white/60',
                },
              }}
            />
          </SignedIn>
        </div>
      </div>
    </header>
  )
}
