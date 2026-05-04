import { Link } from 'react-router-dom'
import { PageIntro } from '../components/PageIntro'

/** Placeholder until retainer checkout is integrated. */
export function CheckoutRetainerPage() {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageIntro
        eyebrow="Checkout"
        title="Monthly dev retainer"
        description="This checkout flow is coming soon. Use the contact options on the main site if you need to reach us in the meantime."
        hideBottomBorder
      />
      <section className="flex flex-1 flex-col bg-white px-4 pb-16 pt-2 sm:px-6 sm:pb-20 sm:pt-4 lg:px-8">
        <div className="mx-auto w-full max-w-2xl text-center">
          <Link
            to="/operator-booking"
            className="inline-flex items-center justify-center rounded-xl border border-border bg-white px-6 py-3 text-sm font-semibold text-ink-strong transition-colors hover:bg-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            Back to booking options
          </Link>
        </div>
      </section>
    </div>
  )
}
