// src/components/Navbar.tsx

import { useEffect, useRef, useState, useCallback, useMemo } from "react"
import { Link, NavLink, useLocation } from "react-router-dom"
import { supabase } from "../services/supabase"

/* ─────────────────────────────────────────────────────────
   Nav links — single source of truth
   ───────────────────────────────────────────────────────── */
const primaryLinks = [
  { to: "/", label: "Ahabanza" },
  { to: "/about", label: "Abo Turi Bo" },
] as const

/* ─────────────────────────────────────────────────────────
   Auth state machine
   ───────────────────────────────────────────────────────── */
type AuthState = "loading" | "authed" | "anon"

/* ─────────────────────────────────────────────────────────
   Magnetic hover — reduced-motion + touch + focus safe
   ───────────────────────────────────────────────────────── */
function useMagnetic<T extends HTMLElement>(strength = 4, radius = 100) {
  const ref = useRef<T | null>(null)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const raf = useRef(0)
  const point = useRef<{ x: number; y: number } | null>(null)
  const focused = useRef(false)

  const enabled = useCallback(() => {
    if (typeof window === "undefined") return false
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false
    if (window.matchMedia("(pointer: coarse)").matches) return false
    return true
  }, [])

  const tick = useCallback(() => {
    const el = ref.current
    const p = point.current
    if (!el || !p) return
    const r = el.getBoundingClientRect()
    const cx = r.left + r.width / 2
    const cy = r.top + r.height / 2
    const dx = p.x - cx
    const dy = p.y - cy
    const dist = Math.hypot(dx, dy)
    if (dist > radius + Math.max(r.width, r.height) / 2) {
      setOffset({ x: 0, y: 0 })
      return
    }
    const mag = Math.min(1, strength / Math.max(1, dist))
    setOffset({ x: dx * mag * 0.06, y: dy * mag * 0.06 })
  }, [radius, strength])

  const onMove = useCallback(
    (e: React.MouseEvent) => {
      if (!enabled() || focused.current) return
      point.current = { x: e.clientX, y: e.clientY }
      cancelAnimationFrame(raf.current)
      raf.current = requestAnimationFrame(tick)
    },
    [enabled, tick],
  )

  const onLeave = useCallback(() => {
    point.current = null
    cancelAnimationFrame(raf.current)
    setOffset({ x: 0, y: 0 })
  }, [])

  const onFocus = useCallback(() => {
    focused.current = true
    setOffset({ x: 0, y: 0 })
  }, [])
  const onBlur = useCallback(() => {
    focused.current = false
  }, [])

  return {
    ref,
    offset,
    handlers: { onMouseMove: onMove, onMouseLeave: onLeave, onFocus, onBlur },
  }
}

/* ─────────────────────────────────────────────────────────
   Brand lockup — logo ring + wordmark
   ───────────────────────────────────────────────────────── */
function BrandMark() {
  return (
    <Link
      to="/"
      aria-label="KUGURISHA.COM — Ahabanza"
      className="group inline-flex items-center gap-3 rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--primary)]"
    >
      {/* Logo with slow conic ring on hover/focus */}
      <span className="relative inline-flex h-11 w-11 shrink-0 items-center justify-center">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-full opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-visible:opacity-100 motion-safe:group-hover:[animation:navbar-orbit_24s_linear_infinite] motion-reduce:hidden"
          style={{
            background:
              "conic-gradient(from 0deg, #FF5D00, #FF7A29, #427c94, #569ab5, #FF5D00)",
            padding: 1.5,
            WebkitMask:
              "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
            WebkitMaskComposite: "xor",
            maskComposite: "exclude",
          }}
        />
        <img
          src="/favicon.svg"
          alt=""
          className="relative h-9 w-9 rounded-full object-contain transition-transform duration-300 group-hover:rotate-[-6deg] group-hover:scale-105 motion-reduce:group-hover:rotate-0 motion-reduce:group-hover:scale-100"
        />
      </span>

      <span className="font-display text-lg font-extrabold tracking-[-0.055em] text-[var(--text)] sm:text-xl">
        KUGURISHA
        <span className="bg-[linear-gradient(110deg,#FF5D00,#FF7A29,#427c94,#569ab5)] bg-[size:200%_100%] bg-clip-text text-transparent [animation:navbar-shimmer_6s_ease-in-out_infinite] motion-reduce:animate-none">
          .COM
        </span>
      </span>
    </Link>
  )
}

/* ─────────────────────────────────────────────────────────
   Desktop nav link — gradient underline + dot
   ───────────────────────────────────────────────────────── */
function NavItem({
  to,
  label,
  active,
}: {
  to: string
  label: string
  active: boolean
}) {
  return (
    <NavLink
      to={to}
      end={to === "/"}
      aria-current={active ? "page" : undefined}
      className={({ isActive }) =>
        `group relative inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-semibold transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)] ${
          isActive
            ? "text-[var(--text)]"
            : "text-[var(--text-secondary)] hover:text-[var(--text)]"
        }`
      }
    >
      {/* Active dot */}
      <span
        aria-hidden="true"
        className={`h-1 w-1 rounded-full bg-[var(--primary)] transition-all duration-300 ${
          active ? "scale-100 opacity-100" : "scale-0 opacity-0"
        }`}
      />
      <span className="relative">
        {label}
        {/* Underline sweep */}
        <span
          aria-hidden="true"
          className={`absolute -bottom-1 left-0 h-[2px] rounded-full bg-gradient-to-r from-[#FF5D00] via-[#FF7A29] to-[#569ab5] transition-all duration-300 ${
            active ? "w-full opacity-90" : "w-0 opacity-0 group-hover:w-full group-hover:opacity-70"
          }`}
        />
      </span>
    </NavLink>
  )
}

/* ─────────────────────────────────────────────────────────
   Mobile drawer
   ───────────────────────────────────────────────────────── */
function MobileDrawer({
  open,
  onClose,
  isAuthed,
  authLoading,
}: {
  open: boolean
  onClose: () => void
  isAuthed: boolean
  authLoading: boolean
}) {
  const panelRef = useRef<HTMLDivElement | null>(null)
  const firstFocusRef = useRef<HTMLAnchorElement | null>(null)

  useEffect(() => {
    if (!open) return
    const prevFocus = document.activeElement as HTMLElement | null
    const bodyOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    // Focus first item after mount
    requestAnimationFrame(() => firstFocusRef.current?.focus())

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault()
        onClose()
        return
      }
      if (e.key === "Tab" && panelRef.current) {
        const focusables = panelRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled])',
        )
        if (focusables.length === 0) return
        const first = focusables[0]
        const last = focusables[focusables.length - 1]
        if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        } else if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        }
      }
    }
    window.addEventListener("keydown", onKey)
    return () => {
      window.removeEventListener("keydown", onKey)
      document.body.style.overflow = bodyOverflow
      prevFocus?.focus?.()
    }
  }, [open, onClose])

  return (
    <>
      {/* Scrim */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-[#0a1220]/55 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="mobile-drawer-title"
        aria-hidden={!open}
        className={`fixed inset-y-0 right-0 z-50 flex w-[86%] max-w-sm flex-col border-l border-[var(--glass-border)] bg-[var(--glass-strong-bg)] shadow-[-24px_0_60px_-30px_rgba(0,0,0,0.35)] backdrop-blur-2xl transition-transform duration-500 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] md:hidden ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <h2 id="mobile-drawer-title" className="sr-only">
          Menu nyamukuru
        </h2>

        <div className="flex items-center justify-between border-b border-[var(--glass-border)] px-5 py-4">
          <span className="font-display text-sm font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">
            Menu
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Funga menu"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-[var(--text-secondary)] transition-colors hover:bg-[var(--soft-bg-hover)] hover:text-[var(--text)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <ul role="list" className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {primaryLinks.map((l, i) => (
            <li
              key={l.to}
              style={{ transitionDelay: open ? `${80 + i * 40}ms` : "0ms" }}
              className={`transition-all duration-500 ${
                open ? "translate-x-0 opacity-100" : "translate-x-4 opacity-0"
              }`}
            >
              <NavLink
                ref={i === 0 ? firstFocusRef : undefined}
                to={l.to}
                end={l.to === "/"}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center justify-between rounded-xl px-3.5 py-3 text-sm font-semibold transition-colors ${
                    isActive
                      ? "bg-[var(--primary)]/10 text-[var(--primary)]"
                      : "text-[var(--text-secondary)] hover:bg-[var(--soft-bg-hover)] hover:text-[var(--text)]"
                  }`
                }
              >
                {l.label}
                <span aria-hidden="true" className="text-[var(--text-muted)]">→</span>
              </NavLink>
            </li>
          ))}

          <li className="pt-2">
            <div className="h-px w-full bg-[var(--glass-border)]" />
          </li>

          <li>
            {authLoading ? (
              <div className="mx-1 h-11 animate-pulse rounded-xl bg-[var(--soft-bg)]" />
            ) : isAuthed ? (
              <NavLink
                to="/profile"
                onClick={onClose}
                className="flex items-center justify-between rounded-xl px-3.5 py-3 text-sm font-semibold text-[var(--text-secondary)] hover:bg-[var(--soft-bg-hover)] hover:text-[var(--text)]"
              >
                Akawunti Yange
                <span aria-hidden="true">→</span>
              </NavLink>
            ) : (
              <NavLink
                to="/login"
                onClick={onClose}
                className="flex items-center justify-between rounded-xl px-3.5 py-3 text-sm font-semibold text-[var(--text-secondary)] hover:bg-[var(--soft-bg-hover)] hover:text-[var(--text)]"
              >
                Injira
                <span aria-hidden="true">→</span>
              </NavLink>
            )}
          </li>
        </ul>

        <div className="border-t border-[var(--glass-border)] p-4">
          <Link
            to="/create-listing"
            onClick={onClose}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--primary)] px-5 py-3.5 text-sm font-bold text-white shadow-[0_10px_28px_-12px_rgba(198,109,55,0.55)] transition-colors hover:bg-[var(--primary-hover)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--primary)]"
          >
            Gurisha
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </>
  )
}

/* ─────────────────────────────────────────────────────────
   Navbar
   ───────────────────────────────────────────────────────── */
export default function Navbar() {
  const { pathname } = useLocation()
  const [auth, setAuth] = useState<AuthState>("loading")
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const cta = useMagnetic<HTMLAnchorElement>(4, 100)

  /* ── Auth ─────────────────────────────────────────────── */
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!cancelled) setAuth(user ? "authed" : "anon")
    })()

    // Optional: live updates on login/logout
    // const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
    //   setAuth(session?.user ? "authed" : "anon")
    // })
    // return () => sub.subscription.unsubscribe()

    return () => {
      cancelled = true
    }
  }, [])

  /* ── Scroll condense ──────────────────────────────────── */
  useEffect(() => {
    let raf = 0
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        setScrolled(window.scrollY > 24)
      })
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    onScroll()
    return () => {
      window.removeEventListener("scroll", onScroll)
      cancelAnimationFrame(raf)
    }
  }, [])

  /* ── Close drawer on route change ─────────────────────── */
  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  /* ── Derived ──────────────────────────────────────────── */
  const isActive = useMemo(
    () => (to: string) => (to === "/" ? pathname === "/" : pathname.startsWith(to)),
    [pathname],
  )

  return (
    <>
      {/* ── Spacer to offset sticky header ─────────────────── */}
      <div aria-hidden="true" className="h-[72px] sm:h-[76px]" />

      <header
        className="sticky top-0 z-50 w-full transition-[padding] duration-300"
        style={{ paddingTop: scrolled ? 6 : 10, paddingBottom: scrolled ? 6 : 10 }}
      >
        <nav
          aria-label="Main"
          className={`mx-auto flex max-w-7xl items-center justify-between gap-3 rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] px-3.5 py-2 shadow-[0_8px_30px_-20px_rgba(15,23,42,0.35)] backdrop-blur-2xl transition-all duration-300 sm:px-4 ${
            scrolled
              ? "bg-[var(--glass-strong-bg)] shadow-[0_16px_44px_-24px_rgba(0,0,0,0.28)]"
              : ""
          }`}
          style={{
            marginInline: "clamp(12px, 2.2vw, 24px)",
            minHeight: scrolled ? 56 : 64,
          }}
        >
          <BrandMark />

          {/* Desktop links */}
          <ul role="list" className="hidden items-center gap-1 md:flex">
            {primaryLinks.map((l) => (
              <li key={l.to}>
                <NavItem to={l.to} label={l.label} active={isActive(l.to)} />
              </li>
            ))}
          </ul>

          {/* Right cluster */}
          <div className="flex items-center gap-2">
            {/* Auth — desktop only, hidden below md */}
            <div className="hidden md:block">
              {auth === "loading" ? (
                <div
                  aria-hidden="true"
                  className="h-9 w-24 animate-pulse rounded-full bg-[var(--soft-bg)]"
                />
              ) : auth === "authed" ? (
                <Link
                  to="/profile"
                  className="inline-flex items-center gap-1.5 rounded-full border border-[var(--glass-border)] bg-[var(--surface)] px-4 py-2 text-xs font-bold text-[var(--text)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--primary)]/50 hover:shadow-[0_8px_20px_-12px_var(--glow-color)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)] motion-reduce:hover:translate-y-0"
                >
                  Akawunti Yange
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 rounded-full border border-[var(--glass-border)] bg-[var(--surface)] px-4 py-2 text-xs font-bold text-[var(--text)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--primary)]/50 hover:shadow-[0_8px_20px_-12px_var(--glow-color)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)] motion-reduce:hover:translate-y-0"
                >
                  Injira
                </Link>
              )}
            </div>

            {/* Primary CTA — always visible */}
            <Link
              to="/create-listing"
              ref={cta.ref}
              {...cta.handlers}
              style={{
                transform: `translate3d(${cta.offset.x}px, ${cta.offset.y}px, 0)`,
                transition:
                  "transform 320ms cubic-bezier(0.16, 1, 0.3, 1), background-color 200ms ease, box-shadow 300ms ease",
              }}
              className="group inline-flex items-center gap-1.5 rounded-full bg-[var(--primary)] px-4 py-2.5 text-xs font-bold tracking-tight text-white shadow-[0_8px_22px_-12px_rgba(198,109,55,0.6)] transition-colors hover:bg-[var(--primary-hover)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--primary)] motion-reduce:transform-none sm:px-5"
            >
              Gurisha
              <span
                aria-hidden="true"
                className="inline-flex h-4 w-4 items-center justify-center transition-transform duration-300 group-hover:translate-x-0.5 group-hover:rotate-[6deg] motion-reduce:group-hover:translate-x-0 motion-reduce:group-hover:rotate-0"
              >
                →
              </span>
            </Link>

            {/* Mobile toggle */}
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Fungura menu"
              aria-expanded={mobileOpen}
              aria-controls="mobile-drawer"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-[var(--text-secondary)] transition-colors hover:bg-[var(--soft-bg-hover)] hover:text-[var(--text)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)] md:hidden"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            </button>
          </div>
        </nav>
      </header>

      <MobileDrawer
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        isAuthed={auth === "authed"}
        authLoading={auth === "loading"}
      />

      {/* Scoped keyframes */}
      <style>{`
        @keyframes navbar-orbit {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes navbar-shimmer {
          0%, 100% { background-position: 0% 50%; }
          50%      { background-position: 100% 50%; }
        }
        @media (prefers-reduced-motion: reduce) {
          [class*="navbar-orbit"],
          [class*="navbar-shimmer"] {
            animation: none !important;
          }
        }
      `}</style>
    </>
  )
}