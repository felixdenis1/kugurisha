import { useEffect, useRef, useState, useCallback } from "react"
import { Link } from "react-router-dom"

/* ═══════════════════════════════════════════════════════
   Scroll reveal — reduced-motion aware
   ═══════════════════════════════════════════════════════ */
function useReveal<T extends HTMLElement>(threshold = 0.2) {
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
   Magnetic pull — reduced-motion / touch / focus safe
   ═══════════════════════════════════════════════════════ */
function useMagnetic<T extends HTMLElement>(strength = 5, radius = 120) {
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

/* ═══════════════════════════════════════════════════════
   SellCTA
   ═══════════════════════════════════════════════════════ */
export default function SellCTA() {
  const { ref, visible } = useReveal<HTMLElement>(0.2)
  const cta = useMagnetic<HTMLAnchorElement>(5, 120)

  const reveal = (delay: number) => ({
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0)" : "translateY(8px)",
    transition: `opacity 800ms cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 800ms cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
  })

  return (
    <section
      ref={ref}
      aria-labelledby="sell-cta-title"
      className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:py-20"
    >
      <div
        className={`group relative overflow-hidden rounded-[26px] border border-[var(--glass-border)] bg-[var(--surface)] shadow-[0_18px_50px_-30px_rgba(16,36,54,0.22)] transition-shadow duration-500 hover:shadow-[0_26px_60px_-30px_rgba(16,36,54,0.28)] motion-reduce:transition-none`}
        style={reveal(0)}
      >
        {/* ── Living edge (left conic ribbon) ───────────── */}
        <div
          aria-hidden="true"
          className="absolute inset-y-0 left-0 w-[3px] overflow-hidden"
        >
          <div
            className="absolute inset-0 motion-safe:[animation:sell-edge_18s_linear_infinite]"
            style={{
              background:
                "linear-gradient(180deg, #FF5D00 0%, #FF7A29 30%, #427c94 65%, #569ab5 100%)",
              backgroundSize: "100% 200%",
            }}
          />
          {/* Animated highlight overlay */}
          <div
            aria-hidden="true"
            className="absolute inset-0 motion-safe:[animation:sell-edge-sweep_18s_ease-in-out_infinite] motion-reduce:hidden"
            style={{
              background:
                "linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.7) 50%, transparent 100%)",
              backgroundSize: "100% 40%",
              backgroundRepeat: "no-repeat",
            }}
          />
        </div>

        {/* ── Ambient warm glow (right side) ────────────── */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-24 h-[360px] w-[360px] rounded-full bg-[#FF5D00]/10 blur-[100px] md:block"
        />

        {/* ── Corner sparkle (single dot) ───────────────── */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute right-6 top-6 flex h-2 w-2 motion-safe:[animation:sell-sparkle_3.6s_ease-in-out_infinite] motion-reduce:hidden md:right-8 md:top-8"
        >
          <span className="absolute inset-0 rounded-full bg-[var(--primary)] opacity-60" />
          <span className="absolute inset-0 animate-ping rounded-full bg-[var(--primary)] opacity-40" />
        </span>

        {/* ── Content ───────────────────────────────────── */}
        <div className="flex flex-col gap-8 px-6 py-8 sm:px-9 sm:py-9 lg:flex-row lg:items-center lg:justify-between lg:gap-14 lg:px-12 lg:py-11">
          {/* Text side */}
          <div className="min-w-0 max-w-2xl">
            {/* Editorial eyebrow */}
            <div
              className="mb-4 flex items-center gap-3"
              style={reveal(60)}
            >
              <span
                aria-hidden="true"
                className="h-px w-8 origin-left bg-[var(--primary)] motion-safe:animate-[sell-breathe_4.5s_ease-in-out_infinite] motion-reduce:animate-none"
              />
              <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--text-muted)]">
                Ufite icyo ushaka kugurisha?
              </span>
            </div>

            {/* Headline */}
            <h2
              id="sell-cta-title"
              className="font-display font-bold leading-[1.06] tracking-[-0.045em] text-[var(--text)] [font-size:clamp(1.6rem,3.6vw,2.6rem)]"
              style={reveal(140)}
            >
              Icyo ufite,{" "}
              <span className="relative inline-block">
                <span className="bg-[linear-gradient(110deg,var(--primary)_0%,var(--primary-light)_45%,#39778f_85%,#569ab5_100%)] bg-clip-text text-transparent">
                  hari ugikeneye.
                </span>
              </span>
            </h2>

            {/* Body */}
            <p
              className="mt-4 max-w-[44ch] text-[15px] leading-[1.75] text-[var(--text-secondary)] sm:text-base"
              style={reveal(220)}
            >
              Shyiraho amafoto n&apos;ibisobanuro by&apos;icyo ushaka kugurisha.
              Abaguzi bakibone, mubashe kuvugana no kumvikana.
            </p>
          </div>

          {/* Action side */}
          <div
            className="flex w-full flex-col items-stretch gap-4 sm:flex-row sm:items-center lg:w-auto lg:flex-col lg:items-end xl:flex-row"
            style={reveal(320)}
          >
            {/* Primary — magnetic + shimmer */}
            <Link
              to="/create-listing"
              ref={cta.ref}
              {...cta.handlers}
              style={{
                transform: `translate3d(${cta.offset.x}px, ${cta.offset.y}px, 0)`,
                transition:
                  "transform 320ms cubic-bezier(0.16, 1, 0.3, 1), background-color 200ms ease, box-shadow 300ms ease",
              }}
              className="group/cta relative inline-flex min-h-[52px] items-center justify-center gap-2.5 overflow-hidden rounded-full bg-[var(--primary)] px-7 py-3.5 text-sm font-bold tracking-tight text-white shadow-[0_12px_32px_-14px_rgba(198,109,55,0.6)] transition-colors hover:bg-[var(--primary-hover)] hover:shadow-[0_18px_42px_-14px_rgba(198,109,55,0.75)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--primary)] motion-reduce:transform-none"
            >
              {/* Shimmer sweep */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 -translate-x-full bg-[linear-gradient(115deg,transparent_35%,rgba(255,255,255,0.32)_50%,transparent_65%)] transition-transform duration-700 group-hover/cta:translate-x-full motion-reduce:hidden"
              />
              <span className="relative">Tangira kugurisha</span>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                className="relative transition-transform duration-300 group-hover/cta:translate-x-1 group-hover/cta:rotate-[6deg] motion-reduce:group-hover/cta:translate-x-0 motion-reduce:group-hover/cta:rotate-0"
              >
                <path d="M5 12h14" />
                <path d="m13 6 6 6-6 6" />
              </svg>
            </Link>

            {/* Secondary — quiet door */}
            <Link
              to="/how-it-works"
              className="group/sec inline-flex items-center justify-center gap-1.5 rounded-full px-2 py-1 text-sm font-semibold text-[var(--text-secondary)] transition-colors hover:text-[var(--primary)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--primary)]"
            >
              <span className="relative pb-0.5">
                Reba uko bikora
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-[var(--primary)] transition-transform duration-500 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] group-hover/sec:scale-x-100 motion-reduce:transition-none"
                />
              </span>
              <span
                aria-hidden="true"
                className="transition-transform duration-300 group-hover/sec:translate-x-0.5"
              >
                →
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* ── Scoped keyframes ─────────────────────────────── */}
      <style>{`
        @keyframes sell-edge {
          0%   { background-position: 0% 0%; }
          50%  { background-position: 0% 100%; }
          100% { background-position: 0% 0%; }
        }
        @keyframes sell-edge-sweep {
          0%, 100% { background-position: 0% -40%; }
          50%      { background-position: 0% 140%; }
        }
        @keyframes sell-breathe {
          0%, 100% { opacity: 1; transform: scaleX(1); }
          50%      { opacity: .55; transform: scaleX(.82); }
        }
        @keyframes sell-sparkle {
          0%, 100% { transform: scale(1); opacity: .55; }
          50%      { transform: scale(1.4); opacity: 1; }
        }
        @media (prefers-reduced-motion: reduce) {
          .motion-safe\\:[animation\\:sell-edge_18s_linear_infinite],
          .motion-safe\\:[animation\\:sell-edge-sweep_18s_ease-in-out_infinite],
          .motion-safe\\:[animation\\:sell-breathe_4.5s_ease-in-out_infinite],
          .motion-safe\\:[animation\\:sell-sparkle_3.6s_ease-in-out_infinite] {
            animation: none !important;
          }
        }
      `}</style>
    </section>
  )
}