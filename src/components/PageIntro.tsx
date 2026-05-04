type PageIntroProps = {
  /** Optional kicker above the title (e.g. “How It Works”). */
  eyebrow?: string
  title: string
  description: string
  /** Omit bottom border (e.g. when the page has no divider below the intro). */
  hideBottomBorder?: boolean
}

export function PageIntro({
  eyebrow,
  title,
  description,
  hideBottomBorder = false,
}: PageIntroProps) {
  return (
    <div
      className={
        hideBottomBorder
          ? 'bg-white px-4 pb-10 pt-16 text-center sm:px-6 sm:pb-12 sm:pt-20 lg:px-8'
          : 'border-b border-border bg-white px-4 pb-12 pt-16 sm:px-6 sm:pb-14 sm:pt-20 lg:px-8'
      }
    >
      <div className="mx-auto max-w-6xl">
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-secondary">
            {eyebrow}
          </p>
        ) : null}
        <h1
          className={
            eyebrow
              ? 'mt-3 text-3xl font-semibold tracking-tight text-ink-strong sm:text-4xl'
              : 'text-3xl font-semibold tracking-tight text-ink-strong sm:text-4xl'
          }
        >
          {title}
        </h1>
        <p
          className={
            hideBottomBorder
              ? 'mx-auto mt-3 max-w-2xl text-lg text-ink-secondary'
              : 'mt-3 max-w-2xl text-lg text-ink-secondary'
          }
        >
          {description}
        </p>
      </div>
    </div>
  )
}
