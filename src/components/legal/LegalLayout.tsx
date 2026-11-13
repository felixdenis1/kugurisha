import { useEffect, useRef, useState } from "react"
import { Link } from "react-router-dom"

export type TocItem = { id: string; label: string }

export type LegalLayoutProps = {
  title: string
  eyebrow: string
  subtitle: string
  lastUpdated: string
  toc: TocItem[]
  children: React.ReactNode
}

export default function LegalLayout({
  title,
  eyebrow,
  subtitle,
  lastUpdated,
  toc,
  children,
}: LegalLayoutProps) {
  const articleRef = useRef<HTMLDivElement | null>(null)
  const [progress, setProgress] = useState(0)
  const [activeId, setActiveId] = useState<string>(toc[0]?.id ?? "")
  const [visible, setVisible] = useState(false)

  /* ── Reading progress ─────────────────────────────────── */
  useEffect(() => {
    const el = articleRef.current
    if (!el) return
    let raf = 0
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect()
        const total = r.height - window.innerHeight * 0.5
        const scrolled = Math.min(
          Math.max(0, -r.top + window.innerHeight * 0.25),
          Math.max(1, total),
        )
        setProgress(Math.min(1, scrolled / Math.max(1, total)))
      })
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    onScroll()
    return () => {
      window.removeEventListener("scroll", onScroll)
      cancelAnimationFrame(raf)
    }
  }, [])

  /* ── Scroll-spy for the TOC ───────────────────────────── */
  useEffect(() => {
    const els = toc
      .map((t) => document.getElementById(t.id))
      .filter((e): e is HTMLElement => Boolean(e))
    if (!els.length || !("IntersectionObserver" in window)) return

    const io = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visibleEntries[0]?.target.id) {
          setActiveId(visibleEntries[0].target.id)
        }
      },
      { rootMargin: "-30% 0px -55% 0px", threshold: [0, 1] },
    )
    els.forEach((e) => io.observe(e))
    return () => io.disconnect()
  }, [toc])

  /* ── Reveal ───────────────────────────────────────────── */
  useEffect(() => {
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (reduced || !("IntersectionObserver" in window)) {
      setVisible(true)
      return
    }
    const el = articleRef.current
    if (!el) return
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true)
          io.disconnect()
        }
      },
      { threshold: 0.05 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <main id="main-content" className="relative bg-[var(--bg)] text-[var(--text)]">
      {/* Skip link */}
      <a
        href="#legal-body"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-[var(--primary)] focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-white"
      >
        Simbukira ku biri mu ngingo
      </a>

      {/* Hero */}
      <header className="relative isolate overflow-hidden border-b border-[var(--glass-border)]">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[var(--glow-color)] opacity-60 blur-[100px]" />
          <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-[#569ab5]/12 blur-[100px]" />
          <div
            className="absolute inset-0 opacity-[0.035]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
              backgroundSize: "32px 32px",
            }}
          />
        </div>

        <div className="relative mx-auto max-w-6xl px-5 pb-12 pt-14 sm:px-8 sm:pb-16 sm:pt-20">
          <div className="flex items-center gap-3">
            <span aria-hidden="true" className="h-px w-8 bg-[var(--primary)] motion-safe:animate-[legal-breathe_4.5s_ease-in-out_infinite]" />
            <span className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-[var(--text-muted)]">
              {eyebrow}
            </span>
          </div>

          <h1 className="mt-4 max-w-3xl font-display text-3xl font-extrabold leading-[1.06] tracking-[-0.045em] sm:text-4xl lg:text-[2.75rem]">
            {title}
          </h1>

          <p className="mt-4 max-w-2xl text-base leading-[1.7] text-[var(--text-secondary)]">
            {subtitle}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-semibold text-[var(--text-muted)]">
            <span className="inline-flex items-center gap-1.5">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <path d="M16 2v4M8 2v4M3 10h18" />
              </svg>
              Byavuguruwe: {lastUpdated}
            </span>
            <span aria-hidden="true">·</span>
            <Link
              to="/"
              className="relative pb-0.5 text-[var(--text-secondary)] transition-colors hover:text-[var(--primary)]"
            >
              Subira ahabanza
            </Link>
          </div>
        </div>

        {/* Reading progress */}
        <div className="absolute inset-x-0 bottom-0 h-[2px] overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#FF5D00] via-[#FF7A29] to-[#569ab5]"
            style={{ width: `${progress * 100}%`, transition: "width 120ms linear" }}
          />
        </div>
      </header>

      {/* Body */}
      <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_240px] lg:gap-16">
          {/* Article */}
          <article
            ref={articleRef}
            id="legal-body"
            className={`min-w-0 transition-all duration-700 ease-out motion-reduce:transition-none ${
              visible ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
            }`}
          >
            <div className="mx-auto max-w-[68ch] space-y-10 text-[15px] leading-[1.75] text-[var(--text-secondary)] sm:text-base">
              {children}
            </div>

            {/* Back to top */}
            <div className="mx-auto mt-14 max-w-[68ch] border-t border-[var(--glass-border)] pt-8">
              <Link
                to="/"
                className="group inline-flex items-center gap-2 rounded-full border border-[var(--glass-border)] bg-[var(--glass-soft-bg)] px-5 py-2.5 text-sm font-bold text-[var(--text)] backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--primary)]/45 hover:shadow-[0_10px_24px_-14px_var(--glow-color)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--primary)] motion-reduce:hover:translate-y-0"
              >
                Subira ahabanza
                <span
                  aria-hidden="true"
                  className="inline-flex transition-transform duration-300 group-hover:translate-x-0.5 group-hover:rotate-[6deg]"
                >
                  →
                </span>
              </Link>
            </div>
          </article>

          {/* TOC */}
          <aside className="hidden lg:block">
            <div className="sticky top-28">
              <p className="mb-3 text-[10px] font-extrabold uppercase tracking-[0.22em] text-[var(--text-muted)]">
                Ibiri muri iyi ngingo
              </p>
              <nav aria-label="Ibirimo" className="border-l border-[var(--glass-border)]">
                <ul className="space-y-0.5">
                  {toc.map((t) => {
                    const active = t.id === activeId
                    return (
                      <li key={t.id}>
                        <a
                          href={`#${t.id}`}
                          aria-current={active ? "location" : undefined}
                          className={`relative block py-1.5 pl-4 pr-2 text-sm transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)] ${
                            active
                              ? "font-bold text-[var(--text)]"
                              : "text-[var(--text-muted)] hover:text-[var(--text)]"
                          }`}
                        >
                          <span
                            aria-hidden="true"
                            className={`absolute inset-y-1 left-0 w-[2px] rounded-full bg-[var(--primary)] transition-all duration-300 ${
                              active ? "opacity-100" : "opacity-0"
                            }`}
                          />
                          {t.label}
                        </a>
                      </li>
                    )
                  })}
                </ul>
              </nav>
            </div>
          </aside>
        </div>
      </div>

      <style>{`
        @keyframes legal-breathe {
          0%, 100% { opacity: 1; transform: scaleX(1); }
          50%      { opacity: .55; transform: scaleX(.82); }
        }
        @media (prefers-reduced-motion: reduce) {
          [class*="legal-breathe"] { animation: none !important; }
        }
      `}</style>
    </main>
  )
}