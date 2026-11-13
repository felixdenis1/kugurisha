import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Link } from "react-router-dom"

/* ═════════════════════════════════════════════════════════
   HOOKS
   ═════════════════════════════════════════════════════════ */

/** One-shot reveal, reduced-motion aware */
function useReveal<T extends HTMLElement>(threshold = 0.18) {
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

/** Magnetic pull for a button — reduced-motion + touch + keyboard safe */
function useMagnetic<T extends HTMLElement>(strength = 6, radius = 120) {
  const ref = useRef<T | null>(null)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const raf = useRef(0)
  const pointer = useRef<{ x: number; y: number } | null>(null)
  const focused = useRef(false)

  const enabled = useCallback(() => {
    if (typeof window === "undefined") return false
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false
    if (window.matchMedia("(pointer: coarse)").matches) return false
    return true
  }, [])

  const tick = useCallback(() => {
    const el = ref.current
    const p = pointer.current
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
      pointer.current = { x: e.clientX, y: e.clientY }
      cancelAnimationFrame(raf.current)
      raf.current = requestAnimationFrame(tick)
    },
    [enabled, tick],
  )

  const onLeave = useCallback(() => {
    pointer.current = null
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

/* ═════════════════════════════════════════════════════════
   SCENE
   ═════════════════════════════════════════════════════════ */
function Scene({ visible }: { visible: boolean }) {
  const shellRef = useRef<HTMLDivElement | null>(null)
  const [parallax, setParallax] = useState({ x: 0, y: 0 })
  const raf = useRef(0)
  const target = useRef<{ x: number; y: number } | null>(null)

  const reduced = useMemo(() => {
    if (typeof window === "undefined") return false
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches
  }, [])

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reduced) return
    if (window.matchMedia("(pointer: coarse)").matches) return
    const el = shellRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    target.current = {
      x: (e.clientX - r.left) / r.width - 0.5,
      y: (e.clientY - r.top) / r.height - 0.5,
    }
    cancelAnimationFrame(raf.current)
    raf.current = requestAnimationFrame(() => {
      const t = target.current
      if (!t) return
      setParallax({ x: t.x * 16, y: t.y * 10 }) // ±8px, ±5px
    })
  }
  const onLeave = () => {
    cancelAnimationFrame(raf.current)
    target.current = null
    setParallax({ x: 0, y: 0 })
  }

  /* Per-layer depth multipliers (deeper = moves more) */
  const deep = (m: number) => ({
    transform: `translate3d(${parallax.x * m}px, ${parallax.y * m}px, 0)`,
    transition: "transform 700ms cubic-bezier(0.16, 1, 0.3, 1)",
    willChange: "transform",
  })

  return (
    <div
      ref={shellRef}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className="relative"
    >
      {/* ── Ambient time-of-day wash (slow 72s arc) ─────── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-8 rounded-[3rem] motion-reduce:hidden sm:-inset-12"
        style={{
          background:
            "radial-gradient(70% 60% at 65% 40%, var(--glow-color) 0%, transparent 70%)",
          filter: "blur(40px)",
          opacity: 0.7,
          animation: "kgWash 72s ease-in-out infinite",
        }}
      />

      {/* ── Illustration wrapper (reveals last) ─────────── */}
      <div
        className={`relative mx-auto w-full max-w-[580px] origin-center will-change-transform transition-all duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none ${
          visible ? "scale-100 opacity-100" : "scale-[1.015] opacity-0"
        }`}
        style={deep(1)}
      >
        <svg
          viewBox="0 0 480 300"
          className="block h-auto w-full overflow-visible"
          role="img"
          aria-label="Umuntu uri kwimuka, afite ibikoresho, akoresha telefoni kugira ngo abishyire ku isoko"
        >
          {/* Ground shadow — pulses with person */}
          <ellipse
            cx="240"
            cy="269"
            rx="194"
            ry="13"
            fill="#8bb5d1"
            opacity=".13"
            className="kg-moving-ground"
          />

          {/* ── Boxes (back layer) ──────────────────────── */}
          <g style={deep(0.35)} aria-hidden="true">
            <g
              className={`kg-reveal ${visible ? "is-in" : ""}`}
              style={{ transitionDelay: visible ? "240ms" : "0ms" }}
            >
              <rect x="48" y="174" width="103" height="84" rx="7" fill="#c99a67" />
              <path d="M48 195H151M99 174V258" stroke="#9d7148" strokeWidth="3" />
              <rect x="65" y="211" width="35" height="22" rx="3" fill="#f0d4a9" />
            </g>
            <g
              className={`kg-reveal ${visible ? "is-in" : ""}`}
              style={{ transitionDelay: visible ? "320ms" : "0ms" }}
            >
              <rect x="128" y="209" width="91" height="49" rx="6" fill="#ddb17f" />
              <path d="M128 224H219M173 209V258" stroke="#ac8052" strokeWidth="3" />
            </g>
          </g>

          {/* ── Person (mid layer, breath motion) ───────── */}
          <g
            style={deep(0.6)}
            className={`kg-reveal ${visible ? "is-in" : ""}`}
          >
            <g className="kg-moving-person">
              <path d="M267 158L254 252" stroke="#354b67" strokeWidth="17" strokeLinecap="round" />
              <path d="M302 158L323 252" stroke="#354b67" strokeWidth="17" strokeLinecap="round" />
              <path d="M246 252H267M313 252H337" stroke="#22364c" strokeWidth="10" strokeLinecap="round" />
              <path d="M260 95Q281 83 303 97L317 173H247Z" fill="#347cb1" />
              <path d="M259 111L232 150L208 139" fill="none" stroke="#e5ad85" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M305 111L331 146L346 128" fill="none" stroke="#e5ad85" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
              <rect x="338" y="104" width="24" height="39" rx="5" fill="#253b52" transform="rotate(12 350 123)" />
              <rect x="342" y="109" width="16" height="26" rx="2" fill="#a5dcf4" transform="rotate(12 350 123)" />
              <circle cx="281" cy="66" r="28" fill="#e9b48e" />
              <path d="M254 65Q248 29 280 32Q311 31 309 66L298 49Q274 58 254 65Z" fill="#263b50" />
              <circle cx="272" cy="68" r="2" fill="#263b50" />
              <circle cx="292" cy="68" r="2" fill="#263b50" />
              <path d="M276 81Q282 77 288 81" stroke="#8f5e4a" strokeWidth="2" fill="none" strokeLinecap="round" />
            </g>
          </g>

          {/* ── Question bubble (front-mid) ─────────────── */}
          <g
            style={deep(0.9)}
            className={`kg-reveal ${visible ? "is-in" : ""} kg-moving-question`}
          >
            <circle cx="191" cy="63" r="25" fill="#e7f3fb" />
            <text x="191" y="73" textAnchor="middle" fontSize="28" fontWeight="800" fill="#347cb1">
              ?
            </text>
          </g>

          {/* ── Listing card (front, "story resolution") ── */}
          <g
            style={deep(1.3)}
            className={`kg-reveal ${visible ? "is-in" : ""}`}
          >
            <g className="kg-moving-listing">
              <rect x="361" y="160" width="99" height="92" rx="12" fill="#f0f8ff" stroke="#a7cfe8" strokeWidth="2" />
              <rect x="373" y="172" width="75" height="43" rx="6" fill="#b6d9ec" />
              <path d="M380 208L397 191L408 201L423 183L442 208" fill="none" stroke="#4e96bc" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M376 225H436M376 235H416" stroke="#7ca9c2" strokeWidth="4" strokeLinecap="round" />
              <circle cx="449" cy="162" r="12" fill="#22c55e" />
              <path d="M444 162L448 166L455 158" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </g>
          </g>

          {/* ── Spark (back to ambient) ─────────────────── */}
          <g
            style={deep(0.5)}
            className={`kg-reveal ${visible ? "is-in" : ""}`}
            aria-hidden="true"
          >
            <g className="kg-moving-spark">
              <path d="M370 130L390 115M370 115L390 130" stroke="#48a5d2" strokeWidth="3" strokeLinecap="round" />
            </g>
          </g>
        </svg>
      </div>

      {/* ── Screen-reader narration of the reveal ──────── */}
      <ol className="sr-only">
        <li>Intambwe ya mbere: umuntu afite ibintu byo kwimuka.</li>
        <li>Intambwe ya kabiri: yibaza uko yabigurisha.</li>
        <li>Intambwe ya gatatu: yashyize ibicuruzwa ku isoko, byemejwe.</li>
      </ol>

      <style>{`
        @keyframes kgWash {
          0%, 100% { opacity: .55; filter: blur(40px) hue-rotate(0deg); }
          50%      { opacity: .80; filter: blur(40px) hue-rotate(-8deg); }
        }
        @keyframes kgMovingFloat {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(-4px); }
        }
        @keyframes kgMovingThink {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(-5px); }
        }
        @keyframes kgMovingAppear {
          0%, 20%  { opacity: 0; transform: translateY(8px); }
          45%, 88% { opacity: 1; transform: translateY(0); }
          100%     { opacity: 0; transform: translateY(4px); }
        }
        @keyframes kgMovingGround {
          0%, 100% { opacity: .13; transform: scaleX(1); }
          50%      { opacity: .10; transform: scaleX(.97); }
        }
        @keyframes kgMovingCheckPulse {
          0%, 55%, 100% { transform: scale(1); transform-origin: 449px 162px; }
          65%           { transform: scale(1.18); transform-origin: 449px 162px; }
          75%           { transform: scale(1); transform-origin: 449px 162px; }
        }

        .kg-reveal {
          opacity: 0;
          transform: translateY(10px);
          transition: opacity 700ms cubic-bezier(0.16, 1, 0.3, 1),
                      transform 700ms cubic-bezier(0.16, 1, 0.3, 1);
        }
        .kg-reveal.is-in {
          opacity: 1;
          transform: translateY(0);
        }

        .kg-moving-person {
          animation: kgMovingFloat 6s ease-in-out infinite;
          transform-origin: center bottom;
        }
        .kg-moving-question {
          animation: kgMovingThink 4.5s ease-in-out infinite;
          transform-origin: 191px 63px;
        }
        .kg-moving-listing {
          animation: kgMovingAppear 8s ease-in-out infinite;
        }
        .kg-moving-listing > :is(circle, path):last-child {
          animation: kgMovingCheckPulse 8s ease-in-out infinite;
          transform-box: fill-box;
        }
        .kg-moving-spark {
          animation: kgMovingAppear 8s ease-in-out .5s infinite;
        }
        .kg-moving-ground {
          transform-box: fill-box;
          transform-origin: center;
          animation: kgMovingGround 6s ease-in-out infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .kg-moving-person,
          .kg-moving-question,
          .kg-moving-listing,
          .kg-moving-listing > *,
          .kg-moving-spark,
          .kg-moving-ground {
            animation: none !important;
          }
          .kg-reveal {
            opacity: 1 !important;
            transform: none !important;
            transition: none !important;
          }
        }
      `}</style>
    </div>
  )
}

/* ═════════════════════════════════════════════════════════
   MAIN
   ═════════════════════════════════════════════════════════ */
export default function MovingStory() {
  const { ref, visible } = useReveal<HTMLElement>(0.2)
  const cta = useMagnetic<HTMLAnchorElement>(6, 120)

  return (
    <section
      ref={ref}
      aria-labelledby="moving-story-title"
      className="relative overflow-x-clip bg-[var(--bg)]"
    >
      <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-24 lg:py-28">
        <div className="grid items-center gap-12 md:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)] md:gap-16 lg:gap-24">
          {/* ── Message ──────────────────────────────────── */}
          <div className="max-w-[46ch]">
            {/* Eyebrow with breathing rule */}
            <div
              className={`mb-6 flex items-center gap-3 transition-all duration-700 ease-out motion-reduce:transition-none ${
                visible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
              }`}
            >
              <span
                aria-hidden="true"
                className="h-px w-8 bg-[var(--primary)] motion-safe:animate-[kgBreathe_4.5s_ease-in-out_infinite] motion-reduce:animate-none"
              />
              <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--text-muted)]">
                KUGURISHA.COM · Uburyo bworoshye
              </span>
            </div>

            {/* Headline — word-reveal, italic accent */}
            <h2
              id="moving-story-title"
              className="font-display font-bold text-[var(--text)] [font-size:clamp(1.9rem,4.5vw,3rem)] leading-[1.06] tracking-[-0.045em]"
            >
              {["Ese", "ufite", "gahunda", "yo"].map((w, i) => (
                <span
                  key={w}
                  className={`inline-block transition-all duration-700 ease-out motion-reduce:transition-none ${
                    visible
                      ? "translate-y-0 opacity-100"
                      : "translate-y-3 opacity-0"
                  }`}
                  style={{ transitionDelay: visible ? `${i * 70}ms` : "0ms" }}
                >
                  {w}
                  &nbsp;
                </span>
              ))}
              <span
                className={`inline-block transition-all duration-700 ease-out motion-reduce:transition-none ${
                  visible
                    ? "translate-y-0 opacity-100"
                    : "translate-y-3 opacity-0"
                }`}
                style={{ transitionDelay: visible ? "280ms" : "0ms" }}
              >
                <em className="[font-style:italic] tracking-[-0.02em] text-[var(--primary)] [font-variation-settings:'wght'_500]">
                  kwimuka?
                </em>
              </span>
            </h2>

            {/* Body beats */}
            <p
              className={`mt-6 text-[var(--text-secondary)] [font-size:clamp(1rem,1.4vw,1.1875rem)] leading-[1.7] transition-all duration-700 ease-out motion-reduce:transition-none ${
                visible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
              }`}
              style={{ transitionDelay: visible ? "420ms" : "0ms" }}
            >
              Ese ugize gahunda yo kwimuka, ariko ukaba udafite gahunda yo
              kwimukana ibintu byose?
            </p>
            <p
              className={`mt-4 text-base leading-[1.75] text-[var(--text-secondary)]/90 transition-all duration-700 ease-out motion-reduce:transition-none ${
                visible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
              }`}
              style={{ transitionDelay: visible ? "520ms" : "0ms" }}
            >
              Erekana ibyo udashaka kwimukana hano, ubone ababikeneye, muvugane
              babigure.
            </p>

            {/* CTA row — magnetic primary, hand-drawn secondary */}
            <div
              className={`mt-9 flex flex-wrap items-center gap-x-7 gap-y-4 transition-all duration-700 ease-out motion-reduce:transition-none ${
                visible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
              }`}
              style={{ transitionDelay: visible ? "640ms" : "0ms" }}
            >
              <Link
                to="/create-listing"
                ref={cta.ref}
                {...cta.handlers}
                style={{
                  transform: `translate3d(${cta.offset.x}px, ${cta.offset.y}px, 0)`,
                  transition:
                    "transform 320ms cubic-bezier(0.16, 1, 0.3, 1), background-color 200ms ease, box-shadow 300ms ease",
                }}
                className="group inline-flex items-center gap-2.5 rounded-full bg-[var(--primary)] px-6 py-3 text-sm font-bold tracking-tight text-white shadow-[0_10px_28px_-12px_rgba(198,109,55,0.55)] transition-colors duration-200 hover:bg-[var(--primary-hover)] hover:shadow-[0_16px_38px_-14px_rgba(198,109,55,0.72)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--primary)] motion-reduce:transform-none"
              >
                Erekana ibyo ushaka kugurisha
                <span
                  aria-hidden="true"
                  className="inline-flex h-5 w-5 items-center justify-center transition-transform duration-300 group-hover:translate-x-1 group-hover:rotate-[6deg] motion-reduce:group-hover:translate-x-0 motion-reduce:group-hover:rotate-0"
                >
                  →
                </span>
              </Link>

              <Link
                to="/how-it-works"
                className="group relative inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--text)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--primary)]"
              >
                <span className="relative pb-0.5">
                  Reba uko bikora
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-[var(--text)] transition-transform duration-500 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100 motion-reduce:transition-none"
                  />
                </span>
                <span
                  aria-hidden="true"
                  className="transition-transform duration-300 group-hover:translate-x-0.5"
                >
                  →
                </span>
              </Link>
            </div>
          </div>

          {/* ── Scene (breaks grid on lg+) ───────────────── */}
          <div className="lg:ml-0 lg:mr-[-3vw]">
            <Scene visible={visible} />
          </div>
        </div>
      </div>

      {/* Breathing rule keyframe (shared) */}
      <style>{`
        @keyframes kgBreathe {
          0%, 100% { opacity: 1; transform: scaleX(1); }
          50%      { opacity: .55; transform: scaleX(.82); }
        }
      `}</style>
    </section>
  )
}