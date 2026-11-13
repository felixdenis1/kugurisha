import { useEffect, useMemo, useRef, useState } from "react"
import { Link, useLocation } from "react-router-dom"

/* ─────────────────────────────────────────────────────────
   DATA
   ───────────────────────────────────────────────────────── */
type FooterLink = {
  label: string
  to: string
  icon: string // SVG path (24x24 stroke)
}

type FooterGroup = {
  id: string
  title: string
  links: FooterLink[]
}

const footerGroups: FooterGroup[] = [
  {
    id: "urubuga",
    title: "Urubuga",
    links: [
      {
        label: "Ibyiciro",
        to: "/categories",
        icon: "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z",
      },
      {
        label: "Ibicuruzwa",
        to: "/#listings",
        icon: "M3 7h18M3 12h18M3 17h18",
      },
      {
        label: "Ibyo dukora",
        to: "/about",
        icon: "M12 2a10 10 0 100 20 10 10 0 000-20zM12 8v4l3 2",
      },
      {
        label: "Uko rukora",
        to: "/how-it-works",
        icon: "M9 6l6 6-6 6",
      },
    ],
  },
  {
    id: "konti",
    title: "Konti",
    links: [
      {
        label: "Injira",
        to: "/login",
        icon: "M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3",
      },
      {
        label: "Iyandikishe",
        to: "/register",
        icon: "M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M22 21v-2a4 4 0 00-3-3.87M9 11a4 4 0 100-8 4 4 0 000 8zM19 8v6M22 11h-6",
      },
      {
        label: "Gurisha",
        to: "/create-listing",
        icon: "M12 5v14M5 12h14",
      },
      {
        label: "AI Search",
        to: "/ai-search",
        icon: "M12 2l2.4 6.9H22l-6 4.4 2.3 7-6.3-4.6L5.7 20l2.3-7-6-4.4h7.6L12 2z",
      },
    ],
  },
]

type SocialLink = {
  name: string
  url: string
  path: string
  brand: string // hover color
}

const socialLinks: SocialLink[] = [
  {
    name: "Instagram",
    url: "https://www.instagram.com/eafricandevelopers/",
    brand: "#E1306C",
    path: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z",
  },
  {
    name: "LinkedIn",
    url: "https://www.linkedin.com/in/east-african-developers-foundation-78505944a/",
    brand: "#0A66C2",
    path: "M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z",
  },
  {
    name: "TikTok",
    url: "https://www.tiktok.com/@felixdenis_",
    brand: "#FE2C55",
    path: "M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z",
  },
  {
    name: "Threads",
    url: "https://www.threads.com/@eafricandevelopers",
    brand: "#000000",
    path: "M12.186 24h-.007C5.495 24 0 18.625 0 11.95 0 5.276 5.495 0 12.179 0h.014c6.677 0 12.08 5.397 12.08 12.057 0 6.634-5.325 12-11.979 12h-.008zm-.014-22C6.586 2 2 6.586 2 12.05 2 17.514 6.586 22 12.172 22h.007c5.514 0 9.98-4.448 9.98-9.943 0-5.514-4.466-9.957-9.979-9.957zm1.758 14.502c-1.127.525-2.527.756-3.877.756-3.69 0-6.195-2.227-6.195-5.992 0-3.64 2.455-5.972 6.075-5.972 3.013 0 5.068 1.764 5.068 4.786 0 2.924-1.579 4.887-3.957 4.965-1.173.039-2.078-.309-2.709-1.025-.568-.642-.876-1.578-.898-2.735-.045-2.14 1.341-3.666 3.196-3.666 1.139 0 1.944.475 2.274 1.363.178.477.262 1.05.262 1.737 0 .809-.136 1.547-.394 2.152-.303.708-.85 1.144-1.616 1.144-.805 0-1.396-.451-1.531-1.218-.112-.633-.146-1.398-.106-2.247.05-1.02.261-1.892.62-2.551.411-.767 1.137-1.196 2.072-1.196 1.418 0 2.378 1.054 2.378 2.96 0 1.332-.249 2.484-.71 3.238-.403.659-.971 1.025-1.67 1.025z",
  },
  {
    name: "X (Twitter)",
    url: "https://x.com/felixdenis_",
    brand: "#000000",
    path: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z",
  },
  {
    name: "Facebook",
    url: "https://web.facebook.com/tuyizere.denys.1",
    brand: "#1877F2",
    path: "M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.376 14.5 5 15.5 5H18V0h-3.808C10.5 0 9 1.5 9 4.615V8z",
  },
]

const legalLinks = [
  { label: "Ubufasha", to: "/help" },
  { label: "Ubuzima bwite", to: "/privacy" },
  { label: "Amabwiriza", to: "/terms" },
  { label: "Cookies", to: "/cookies" },
]



const CURRENT_YEAR = new Date().getFullYear()
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

/* ─────────────────────────────────────────────────────────
   SMALL BUILDING BLOCKS
   ───────────────────────────────────────────────────────── */
function StrokeIcon({
  d,
  className = "h-3.5 w-3.5",
}: {
  d: string
  className?: string
}) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d={d} />
    </svg>
  )
}

function SocialIcon({ social }: { social: SocialLink }) {
  const ref = useRef<HTMLAnchorElement | null>(null)
  const [pos, setPos] = useState({ x: 50, y: 50, active: false })

  return (
    <a
      ref={ref}
      href={social.url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={social.name}
      onMouseMove={(e) => {
        const el = ref.current
        if (!el) return
        const r = el.getBoundingClientRect()
        setPos({
          x: ((e.clientX - r.left) / r.width) * 100,
          y: ((e.clientY - r.top) / r.height) * 100,
          active: true,
        })
      }}
      onMouseLeave={() => setPos((p) => ({ ...p, active: false }))}
      style={{
        // @ts-expect-error CSS var
        "--social-brand": social.brand,
      }}
      className="group relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-transparent text-[var(--text-muted)] transition-all duration-300 hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)] motion-reduce:transition-none motion-reduce:hover:translate-y-0"
    >
      {/* Hover-only brand-tinted gradient border */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: `conic-gradient(from 180deg, ${social.brand}33, transparent 40%, ${social.brand}33)`,
          padding: 1,
          WebkitMask:
            "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
        }}
      />
      {/* Cursor-following spotlight */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: `radial-gradient(60px circle at ${pos.x}% ${pos.y}%, ${social.brand}22, transparent 70%)`,
        }}
      />
      <svg
        aria-hidden="true"
        className="relative h-4 w-4 fill-current transition-transform duration-300 group-hover:scale-110 motion-reduce:group-hover:scale-100"
        viewBox="0 0 24 24"
        style={{ color: "currentColor" }}
      >
        <path d={social.path} />
      </svg>
      {/* Hover colorize */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-full mix-blend-multiply opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:mix-blend-screen"
        style={{ backgroundColor: `${social.brand}0F` }}
      />
    </a>
  )
}

function NewsletterCapture() {
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
      className={`mt-5 ${shake ? "animate-[footer-shake_0.35s_ease-in-out]" : ""}`}
      noValidate
    >
      <label
        htmlFor="footer-email"
        className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[var(--text-muted)]"
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
          className="kg-input h-11 w-full rounded-full border pl-4 pr-14 text-sm placeholder:text-[var(--input-placeholder)]"
        />
        <button
          type="submit"
          aria-label="Iyandikishe ku bata"
          className="absolute right-1 inline-flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#FF5D00] via-[#FF7A29] to-[#427c94] text-white shadow-[0_6px_18px_-8px_rgba(255,93,0,0.6)] transition-all duration-300 hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)] motion-reduce:hover:scale-100"
        >
          {status === "success" ? (
            <StrokeIcon d="M20 6L9 17l-5-5" className="h-4 w-4" />
          ) : (
            <StrokeIcon d="M5 12h14M13 5l7 7-7 7" className="h-4 w-4" />
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

function LanguageToggle() {
  const [lang, setLang] = useState<"rw" | "en">("rw")
  return (
    <div
      role="group"
      aria-label="Guhindura ururimi"
      className="relative inline-flex items-center rounded-full border border-[var(--glass-border)] bg-[var(--glass-soft-bg)] p-0.5 text-[11px] font-extrabold uppercase tracking-wider backdrop-blur-sm"
    >
      {(["rw", "en"] as const).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          className={`relative z-10 rounded-full px-3 py-1 transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)] ${
            lang === l
              ? "text-[var(--primary)]"
              : "text-[var(--text-muted)] hover:text-[var(--text)]"
          }`}
        >
          {l}
        </button>
      ))}
      <span
        aria-hidden="true"
        className="absolute inset-y-0.5 left-0.5 w-[calc(50%-2px)] rounded-full bg-[var(--surface)] shadow-sm transition-transform duration-300 motion-reduce:transition-none"
        style={{
          transform: `translateX(${lang === "rw" ? "0%" : "100%"})`,
        }}
      />
    </div>
  )
}

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

  const dash = 2 * Math.PI * 18 // r=18

  return (
    <button
      type="button"
      aria-label="Subira hejuru"
      tabIndex={visible ? 0 : -1}
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className={`fixed bottom-6 right-5 z-40 inline-flex h-12 w-12 items-center justify-center rounded-full border border-[var(--glass-border)] bg-[var(--glass-strong-bg)] text-[var(--primary)] shadow-[0_10px_30px_-12px_rgba(0,0,0,0.35)] backdrop-blur-md transition-all duration-300 hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)] motion-reduce:transition-none motion-reduce:hover:translate-y-0 ${
        visible
          ? "pointer-events-auto translate-y-0 opacity-100"
          : "pointer-events-none translate-y-4 opacity-0"
      }`}
    >
      <svg
        aria-hidden="true"
        className="absolute inset-0 h-12 w-12 -rotate-90"
        viewBox="0 0 48 48"
        fill="none"
      >
        <circle
          cx="24"
          cy="24"
          r="18"
          stroke="var(--glass-border)"
          strokeWidth="2"
        />
        <circle
          cx="24"
          cy="24"
          r="18"
          stroke="url(#btt-grad)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray={dash}
          strokeDashoffset={dash * (1 - progress)}
        />
        <defs>
          <linearGradient id="btt-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FF5D00" />
            <stop offset="55%" stopColor="#FF7A29" />
            <stop offset="100%" stopColor="#569ab5" />
          </linearGradient>
        </defs>
      </svg>
      <StrokeIcon d="M12 19V5M5 12l7-7 7 7" className="relative h-4 w-4" />
    </button>
  )
}

/* ─────────────────────────────────────────────────────────
   MAIN FOOTER
   ───────────────────────────────────────────────────────── */
export default function HomeFooter() {
  const { pathname } = useLocation()

  const reducedMotion = useMemo(() => {
    if (typeof window === "undefined") return false
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches
  }, [])

  return (
    <>
      <footer
        aria-labelledby="footer-heading"
        className="relative isolate overflow-hidden border-t border-[var(--glass-border)] bg-[var(--surface)] text-[var(--text)]"
      >
        {/* ── Ambient background layers ───────────────── */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          {/* Dot grid — very subtle, slowly drifts on desktop */}
          <div
            className="absolute inset-0 opacity-[0.04] motion-safe:animate-[footer-drift_60s_linear_infinite]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
              backgroundSize: "32px 32px",
            }}
          />
          {/* Glow blobs */}
          <div className="absolute -left-40 -top-32 h-[420px] w-[420px] rounded-full bg-[var(--glow-color)] opacity-50 blur-[130px]" />
          <div className="absolute left-1/3 -bottom-40 h-[380px] w-[380px] rounded-full bg-[#FF5D00]/10 blur-[130px]" />
          <div className="absolute -right-32 -top-10 h-[360px] w-[360px] rounded-full bg-[#569ab5]/15 blur-[120px]" />
          {/* Top hairline */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--primary)]/40 to-transparent" />
        </div>

        <div className="relative mx-auto max-w-7xl px-5 pt-12 pb-8 sm:px-8 lg:pt-14">
          <h2 id="footer-heading" className="sr-only">
            Umugereka w'urubuga
          </h2>

          {/* ── Trust bar ─────────────────────────────── */}
          <div className="mb-10 grid gap-3 rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-soft-bg)] p-2 backdrop-blur-md sm:grid-cols-3">
            
          </div>

          {/* ── Main grid ─────────────────────────────── */}
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr] lg:gap-12">
            {/* Brand column */}
            <div className="relative">
              <Link
                to="/"
                className="group inline-flex items-center gap-2.5 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--primary)]"
              >
                <span className="relative inline-flex">
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 rounded-full bg-[var(--primary)]/25 opacity-0 blur-md transition-opacity duration-300 group-hover:opacity-100 motion-safe:animate-[footer-breathe_4.5s_ease-in-out_infinite]"
                  />
                  <img
                    src="/favicon.svg"
                    alt=""
                    className="relative h-9 w-9 object-contain transition-transform duration-300 group-hover:rotate-[-7deg] group-hover:scale-105 motion-reduce:group-hover:rotate-0 motion-reduce:group-hover:scale-100"
                  />
                </span>
                <span className="font-display text-xl font-extrabold tracking-[-0.055em]">
                  KUGURISHA
                  <span className="relative ml-px inline-block bg-[linear-gradient(110deg,#FF5D00,#FF7A29,#427c94,#569ab5)] bg-[size:200%_100%] bg-clip-text text-transparent [animation:footer-shimmer_6s_ease-in-out_infinite] motion-reduce:animate-none">
                    .COM
                  </span>
                </span>
              </Link>

              <p className="mt-3 max-w-xs text-sm leading-6 text-[var(--text-secondary)]">
                Isoko rihuza abaguzi n'abagurisha mu Rwanda. Gura icyo ukeneye,
                ugurishe icyo ufite.
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-full border border-[var(--glass-border)] bg-[var(--glass-soft-bg)] px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.16em] text-[var(--text-muted)] backdrop-blur-sm">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inset-0 animate-ping rounded-full bg-[var(--success-text)] opacity-70 motion-reduce:hidden" />
                    <span className="relative flex h-1.5 w-1.5 rounded-full bg-[var(--success-text)]" />
                  </span>
                  Sistemu irakora
                </span>
                <LanguageToggle />
              </div>

              <NewsletterCapture />
            </div>

            {/* Link columns */}
            {footerGroups.map((group) => (
              <nav
                key={group.id}
                aria-labelledby={`footer-${group.id}`}
                className="relative"
              >
                <h3
                  id={`footer-${group.id}`}
                  className="font-display text-sm font-bold text-[var(--text)]"
                >
                  {group.title}
                </h3>

                <ul className="mt-4 space-y-1">
                  {group.links.map((link) => {
                    const isListingsAnchor =
                      link.to === "/#listings" && pathname === "/"

                    const handleClick = isListingsAnchor
                      ? (e: React.MouseEvent<HTMLAnchorElement>) => {
                          e.preventDefault()
                          document
                            .getElementById("listings")
                            ?.scrollIntoView({
                              behavior: reducedMotion ? "auto" : "smooth",
                            })
                        }
                      : undefined

                    return (
                      <li key={link.to}>
                        <Link
                          to={link.to}
                          onClick={handleClick}
                          className="group/link relative -mx-2 inline-flex items-center gap-2 rounded-lg px-2 py-2 text-sm text-[var(--text-muted)] transition-colors duration-200 hover:text-[var(--primary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
                        >
                          <span className="text-[var(--text-muted)]/70 transition-colors duration-200 group-hover/link:text-[var(--primary)]">
                            <StrokeIcon d={link.icon} />
                          </span>
                          <span className="relative">
                            {link.label}
                            <span
                              aria-hidden="true"
                              className="absolute -bottom-0.5 left-0 h-px w-0 bg-gradient-to-r from-[#FF5D00] via-[#FF7A29] to-[#569ab5] transition-all duration-300 group-hover/link:w-full motion-reduce:transition-none"
                            />
                          </span>
                          <span
                            aria-hidden="true"
                            className="ml-auto inline-block translate-x-1 rotate-0 text-[var(--primary)] opacity-0 transition-all duration-200 group-hover/link:translate-x-0 group-hover/link:rotate-45 group-hover/link:opacity-100 motion-reduce:transition-none"
                          >
                            →
                          </span>
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </nav>
            ))}
          </div>

          {/* ── Socials + credit row ──────────────────── */}
          <div className="mt-10 flex flex-col gap-6 border-t border-[var(--glass-border)] pt-6 text-xs text-[var(--text-muted)] md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-6">
              <p className="order-2 md:order-1">© {CURRENT_YEAR} KUGURISHA.COM</p>

              <ul
                role="list"
                aria-label="Aho wadusanga ku mbuga nkoranyambaga"
                className="order-1 flex items-center gap-1.5 md:order-2"
              >
                {socialLinks.map((s) => (
                  <li key={s.name}>
                    <SocialIcon social={s} />
                  </li>
                ))}
              </ul>
            </div>

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

              <span className="hidden h-3 w-px bg-[var(--glass-border)] md:inline-block" aria-hidden="true" />

              <p className="flex items-center gap-2">
                Yakozwe na{" "}
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--glass-border)] bg-[var(--glass-soft-bg)] px-2.5 py-1 font-semibold text-[var(--text-secondary)] backdrop-blur-sm">
                  <span
                    aria-hidden="true"
                    className="h-1.5 w-1.5 rounded-full bg-[#569ab5]"
                  />
                  East African Developers Foundation
                </span>
              </p>
            </div>
          </div>
        </div>
      </footer>

      <BackToTop />
    </>
  )
}