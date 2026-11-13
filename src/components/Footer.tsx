// src/components/Footer.tsx

import { useEffect, useRef, useState, useCallback, useMemo } from "react"
import { Link } from "react-router-dom"

/* ═══════════════════════════════════════════════════════
   Data
   ═══════════════════════════════════════════════════════ */
const footerGroups = [
  {
    id: "urubuga",
    title: "Urubuga",
    links: [
      { label: "Ahabanza", to: "/" },
      { label: "Ibyiciro", to: "/categories" },
      { label: "Shakisha ukoresheje AI", to: "/ai-search" },
      { label: "Gurisha", to: "/create-listing" },
    ],
  },
  {
    id: "menyera",
    title: "Aho wamenyera byinshi",
    links: [
      { label: "Ibyo dukora", to: "/about" },
      { label: "Uko urubuga rukora", to: "/how-it-works" },
      { label: "Konti yanjye", to: "/profile" },
      { label: "Injira", to: "/login" },
    ],
  },
] as const

const legalLinks = [
  { label: "Ubuzima bwite", to: "/privacy" },
  { label: "Amabwiriza", to: "/terms" },
  { label: "Cookies", to: "/cookies" },
] as const

const trustChips = [
  { label: "Isoko rya Rwanda" },
  { label: "Ikoranabuhanga rya AI" },
  { label: "Abagurisha bemejwe" },
] as const

const CURRENT_YEAR = new Date().getFullYear()
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

/* ═══════════════════════════════════════════════════════
   Reveal
   ═══════════════════════════════════════════════════════ */
function useReveal<T extends HTMLElement>(threshold = 0.12) {
  const ref = useRef<T | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (reduced || !("IntersectionObserver" in window)) {
      setVisible(true)
      return
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true)
          io.disconnect()
        }
      },
      { threshold },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [threshold])

  return { ref, visible }
}

/* ═══════════════════════════════════════════════════════
   Back-to-top (progress ring)
   ═══════════════════════════════════════════════════════ */
function BackToTop() {
  const [visible, setVisible] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let raf = 0
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const h = document.documentElement
        const scrolled = h.scrollTop
        const max = h.scrollHeight - h.clientHeight
        const p = max > 0 ? Math.min(1, scrolled / max) : 0
        setProgress(p)
        setVisible(scrolled > 480)
      })
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    onScroll()
    return () => {
      window.removeEventListener("scroll", onScroll)
      cancelAnimationFrame(raf)
    }
  }, [])

  const dash = 2 * Math.PI * 14 // r=14

  return (
    <button
      type="button"
      aria-label="Subira hejuru"
      tabIndex={visible ? 0 : -1}
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className={`inline-flex items-center gap-2 rounded-full px-1 py-1 text-xs font-semibold text-[var(--text-muted)] transition-all duration-300 hover:text-[var(--primary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)] motion-reduce:transition-none ${
        visible ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      <span className="relative inline-flex h-8 w-8 items-center justify-center">
        <svg
          aria-hidden="true"
          className="absolute inset-0 h-8 w-8 -rotate-90"
          viewBox="0 0 32 32"
          fill="none"
        >
          <circle cx="16" cy="16" r="14" stroke="var(--glass-border)" strokeWidth="1.5" />
          <circle
            cx="16"
            cy="16"
            r="14"
            stroke="url(#btt-grad-footer)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeDasharray={dash}
            strokeDashoffset={dash * (1 - progress)}
          />
          <defs>
            <linearGradient id="btt-grad-footer" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FF5D00" />
              <stop offset="55%" stopColor="#FF7A29" />
              <stop offset="100%" stopColor="#569ab5" />
            </linearGradient>
          </defs>
        </svg>
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="relative h-3.5 w-3.5"
        >
          <path d="M12 19V5M5 12l7-7 7 7" />
        </svg>
      </span>
      <span className="hidden sm:inline">Hejuru</span>
    </button>
  )
}

/* ═══════════════════════════════════════════════════════
   Newsletter
   ═══════════════════════════════════════════════════════ */
function Newsletter() {
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<"idle" | "error" | "success">("idle")
  const [shake, setShake] = useState(false)

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!EMAIL_RE.test(email.trim())) {
      setStatus("error")
      setShake(true)
      setTimeout(() => setShake(false), 380)
      return
    }
    setStatus("success")
    setEmail("")
    setTimeout(() => setStatus("idle"), 2400)
  }

  return (
    <form
      onSubmit={submit}
      noValidate
      className={`mt-5 max-w-sm ${shake ? "motion-safe:animate-[footer-shake_0.35s_ease-in-out]" : ""}`}
    >
      <label
        htmlFor="footer-email"
        className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[var(--text-muted)]"
      >
        Menya ibicuruzwa bishya
      </label>
      <div className="relative mt-2 flex items-center">
        <input
          id="footer-email"
          type="email"
          inputMode="email"
          autoComplete="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            if (status === "error") setStatus("idle")
          }}
          placeholder="imeyili@urugero.rw"
          aria-invalid={status === "error"}
          aria-describedby="footer-email-msg"
          className="kg-input h-10 w-full rounded-full border pl-4 pr-12 text-sm"
        />
        <button
          type="submit"
          aria-label="Iyandikishe ku bata"
          className="absolute right-1 inline-flex h-8 w-8 items-center justify-center rounded-full bg-[var(--primary)] text-white shadow-[0_6px_16px_-8px_rgba(198,109,55,0.7)] transition-all duration-300 hover:scale-105 hover:bg-[var(--primary-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)] motion-reduce:hover:scale-100"
        >
          {status === "success" ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
              <path d="M5 12h14M13 5l7 7-7 7" />
            </svg>
          )}
        </button>
      </div>
      <p
        id="footer-email-msg"
        role="status"
        aria-live="polite"
        className={`mt-2 min-h-[1rem] text-[11px] font-semibold transition-opacity ${
          status === "idle" ? "opacity-0" : "opacity-100"
        } ${status === "error" ? "text-[var(--danger-text)]" : "text-[var(--success-text)]"}`}
      >
        {status === "error"
          ? "Nyamuneka andika imeyili yemewe."
          : status === "success"
            ? "Murakoze! Tuzakumenyesha ibishya."
            : " "}
      </p>
    </form>
  )
}

/* ═══════════════════════════════════════════════════════
   Footer
   ═══════════════════════════════════════════════════════ */
export default function Footer() {
  const { ref, visible } = useReveal<HTMLElement>(0.12)

  const reducedMotion = useMemo(() => {
    if (typeof window === "undefined") return false
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches
  }, [])

  const reveal = useCallback(
    (delay: number) => ({
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(6px)",
      transition: reducedMotion
        ? "none"
        : `opacity 800ms cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 800ms cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
    }),
    [reducedMotion, visible],
  )

  return (
    <footer
      ref={ref}
      aria-labelledby="footer-heading"
      className="relative isolate overflow-x-clip border-t border-[var(--glass-border)] bg-[var(--surface)] text-[var(--text)]"
    >
      {/* ── Ambient background ──────────────────────────── */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        {/* Drifting dot grid */}
        <div
          className="absolute inset-0 opacity-[0.035] motion-safe:animate-[footer-drift_60s_linear_infinite]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />
        {/* Warm glow, cool glow */}
        <div className="absolute -left-40 top-6 h-[420px] w-[420px] rounded-full bg-[var(--glow-color)] opacity-50 blur-[130px]" />
        <div className="absolute -right-32 bottom-0 h-[380px] w-[380px] rounded-full bg-[#569ab5]/15 blur-[120px]" />
        {/* Top hairline */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--primary)]/40 to-transparent" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 pt-12 pb-6 sm:px-6 lg:px-8 lg:pt-16">
        <h2 id="footer-heading" className="sr-only">
          Umugereka w'urubuga
        </h2>

        {/* ── Trust strip ─────────────────────────────── */}
        <div
          className="mb-10 flex flex-wrap items-center gap-2"
          style={reveal(0)}
        >
          {trustChips.map((chip) => (
            <span
              key={chip.label}
              className="inline-flex items-center gap-1.5 rounded-full border border-[var(--glass-border)] bg-[var(--glass-soft-bg)] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--text-muted)] backdrop-blur-sm"
            >
              <span aria-hidden="true" className="h-1 w-1 rounded-full bg-[var(--primary)]" />
              {chip.label}
            </span>
          ))}
        </div>

        {/* ── Grid ────────────────────────────────────── */}
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr] lg:gap-14">
          {/* Brand */}
          <div style={reveal(80)}>
            <Link
              to="/"
              aria-label="KUGURISHA.COM — Ahabanza"
              className="group inline-flex items-center gap-2.5 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--primary)]"
            >
              <img
                src="/favicon.svg"
                alt=""
                className="h-10 w-10 object-contain transition-transform duration-300 group-hover:rotate-[-6deg] group-hover:scale-105 motion-reduce:group-hover:rotate-0 motion-reduce:group-hover:scale-100"
              />
              <span className="font-display text-xl font-extrabold tracking-[-0.055em] text-[var(--text)]">
                KUGURISHA
                <span className="bg-[linear-gradient(110deg,#FF5D00,#FF7A29,#427c94,#569ab5)] bg-[size:200%_100%] bg-clip-text text-transparent [animation:navbar-shimmer_6s_ease-in-out_infinite] motion-reduce:animate-none">
                  .COM
                </span>
              </span>
            </Link>

            <p className="mt-4 max-w-md text-sm leading-7 text-[var(--text-secondary)]">
              Isoko ryawe ryo mu Rwanda. Gura icyo ushaka, ugurishe ibyo ufite
              byoroshye kandi wifashishije ikoranabuhanga.
            </p>

            <Newsletter />
          </div>

          {/* Link groups */}
          {footerGroups.map((group, i) => (
            <nav
              key={group.id}
              aria-labelledby={`footer-${group.id}`}
              style={reveal(160 + i * 60)}
            >
              <h3
                id={`footer-${group.id}`}
                className="font-display text-sm font-bold text-[var(--text)]"
              >
                {group.title}
              </h3>

              <ul className="mt-4 space-y-1">
                {group.links.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="group/link relative -mx-2 inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm text-[var(--text-muted)] transition-colors duration-200 hover:text-[var(--primary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
                    >
                      <span className="relative">
                        {link.label}
                        <span
                          aria-hidden="true"
                          className="absolute -bottom-0.5 left-0 h-px w-0 bg-gradient-to-r from-[#FF5D00] via-[#FF7A29] to-[#569ab5] transition-all duration-300 group-hover/link:w-full motion-reduce:transition-none"
                        />
                      </span>
                      <span
                        aria-hidden="true"
                        className="inline-block translate-x-0 text-[var(--primary)] opacity-0 transition-all duration-200 group-hover/link:translate-x-0.5 group-hover/link:opacity-100 motion-reduce:transition-none"
                      >
                        →
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {/* ── Bottom bar ──────────────────────────────── */}
        <div
          className="mt-12 flex flex-col gap-4 border-t border-[var(--glass-border)] pt-6 text-xs text-[var(--text-muted)] md:flex-row md:items-center md:justify-between"
          style={reveal(360)}
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
            <p>
              © {CURRENT_YEAR} KUGURISHA.COM. Uburenganzira bwose burabitswe.
            </p>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              {legalLinks.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  className="relative text-[var(--text-muted)] transition-colors duration-200 hover:text-[var(--text)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <p className="flex items-center gap-2">
              Yubakiwe Abanyarwanda{" "}
              <span aria-hidden="true">🇷🇼</span>
            </p>
            <BackToTop />
          </div>
        </div>
      </div>

      {/* ── Scoped keyframes ───────────────────────────── */}
      <style>{`
        @keyframes footer-drift {
          from { background-position: 0 0; }
          to   { background-position: 320px 320px; }
        }
        @keyframes navbar-shimmer {
          0%, 100% { background-position: 0% 50%; }
          50%      { background-position: 100% 50%; }
        }
        @keyframes footer-shake {
          0%, 100% { transform: translateX(0); }
          25%      { transform: translateX(-4px); }
          75%      { transform: translateX(4px); }
        }
        @media (prefers-reduced-motion: reduce) {
          .motion-safe\\:animate-\\[footer-drift_60s_linear_infinite\\],
          .motion-safe\\:animate-\\[footer-shake_0\\.35s_ease-in-out\\],
          .\\[animation\\:navbar-shimmer_6s_ease-in-out_infinite\\] {
            animation: none !important;
          }
        }
      `}</style>
    </footer>
  )
}