export type LegalSectionProps = {
  id: string
  index: string
  title: string
  children: React.ReactNode
}

export default function LegalSection({
  id,
  index,
  title,
  children,
}: LegalSectionProps) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className="group/section scroll-mt-32 border-t border-[var(--glass-border)] pt-10 first:border-t-0 first:pt-0"
    >
      <header className="mb-5 flex items-baseline gap-3">
        <span
          aria-hidden="true"
          className="font-display text-[11px] font-extrabold tracking-[0.22em] text-[var(--primary)]"
        >
          {index}
        </span>
        <h2
          id={`${id}-title`}
          className="font-display text-xl font-bold tracking-[-0.02em] text-[var(--text)] sm:text-2xl"
        >
          {title}
        </h2>
        <a
          href={`#${id}`}
          aria-label={`Kopi umurongo: ${title}`}
          className="ml-auto inline-flex h-7 w-7 items-center justify-center rounded-full text-[var(--text-muted)] opacity-0 transition-opacity duration-200 hover:bg-[var(--soft-bg-hover)] hover:text-[var(--primary)] group-hover/section:opacity-100 focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M10 13a5 5 0 007 0l3-3a5 5 0 00-7-7l-1 1" />
            <path d="M14 11a5 5 0 00-7 0l-3 3a5 5 0 007 7l1-1" />
          </svg>
        </a>
      </header>

      <div className="space-y-4 text-[15px] leading-[1.75] text-[var(--text-secondary)]">
        {children}
      </div>
    </section>
  )
}