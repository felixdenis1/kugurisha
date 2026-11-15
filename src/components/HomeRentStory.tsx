import { useEffect, useRef, useState, type MouseEvent } from "react"
import { Link } from "react-router-dom"

type Step = {
  number: string
  badge: string
  title: string
  description: string
  accent: string
  scene: "house" | "list" | "keys"
}

const steps: Step[] = [
  {
    number: "01",
    badge: "Intambwe ya 1",
    title: "Fata amafoto y'inzu",
    description:
      "Fata amafoto meza y'inzu cyangwa amazu yawe, werekane ibyumba, uruganiriro n'ahantu heza.",
    accent: "#39778f",
    scene: "house",
  },
  {
    number: "02",
    badge: "Intambwe ya 2",
    title: "Yishyire ku isoko",
    description:
      "Shyira inzu yawe kuri KUGURISHA.COM kugira ngo abashaka gukodesha cyangwa kugura bayibone.",
    accent: "#427c94",
    scene: "list",
  },
  {
    number: "03",
    badge: "Intambwe ya 3",
    title: "Hura n'ukeneye",
    description:
      "Abashaka gukodesha cyangwa kugura inzu yawe bazaguhamagara,bazakoherereza ubutumwa, mwumvikane ku giciro.",
    accent: "#569ab5",
    scene: "keys",
  },
]

/* ═══════════════════════════════════════════════════════════
   3D SCENE — house / listing / keys variants
   ═══════════════════════════════════════════════════════════ */
function Scene({ type, isActive }: { type: Step["scene"]; isActive: boolean }) {
  return (
    <div
      className={`kg-scene3d relative mx-auto transition-transform duration-700 ease-out ${
        isActive
          ? "scale-105 -translate-y-1"
          : "group-hover:scale-105 group-hover:-translate-y-1"
      }`}
      aria-hidden="true"
    >
      {/* Dynamic multi-layered ambient aura — teal-tinted */}
      <div className="kg-scene3d__glow" />
      <div
        className={`pointer-events-none absolute inset-4 rounded-full blur-2xl transition-opacity duration-700 ${
          isActive ? "opacity-55" : "opacity-20 group-hover:opacity-50"
        }`}
        style={{
          background:
            type === "house"
              ? "radial-gradient(circle, rgba(57,119,143,0.5) 0%, transparent 70%)"
              : type === "list"
                ? "radial-gradient(circle, rgba(86,154,181,0.5) 0%, transparent 70%)"
                : "radial-gradient(circle, rgba(110,197,201,0.5) 0%, transparent 70%)",
        }}
      />

      {/* Viewfinder corner brackets — premium framing cue */}
      <span className="pointer-events-none absolute left-1 top-1 h-3 w-3 border-l-2 border-t-2 border-[#569ab5]/40 rounded-tl transition-opacity duration-500 group-hover:opacity-100" />
      <span className="pointer-events-none absolute right-1 top-1 h-3 w-3 border-r-2 border-t-2 border-[#569ab5]/40 rounded-tr transition-opacity duration-500 group-hover:opacity-100" />
      <span className="pointer-events-none absolute bottom-1 left-1 h-3 w-3 border-b-2 border-l-2 border-[#569ab5]/40 rounded-bl transition-opacity duration-500 group-hover:opacity-100" />
      <span className="pointer-events-none absolute bottom-1 right-1 h-3 w-3 border-b-2 border-r-2 border-[#569ab5]/40 rounded-br transition-opacity duration-500 group-hover:opacity-100" />

      {type === "house" && (
        <div className="kg-scene3d__stage">
          {/* 3D House */}
          <div className="kg-3d-house">
            <div className="kg-3d-house__roof" />
            <div className="kg-3d-house__body">
              <div className="kg-3d-house__door" />
              <div className="kg-3d-house__window kg-3d-house__window--l" />
              <div className="kg-3d-house__window kg-3d-house__window--r" />
            </div>
            <div className="kg-3d-house__chimney" />
          </div>

          {/* Floating camera to shoot the house */}
          <div className="kg-3d-camera kg-3d-camera--teal">
            <div className="kg-3d-camera__body">
              <div className="kg-3d-camera__lens">
                <div className="kg-3d-camera__lens-inner" />
              </div>
              <div className="kg-3d-camera__flash" />
            </div>
          </div>

          {/* For-sale / for-rent badge */}
          <div className="kg-3d-badge kg-3d-badge--teal">
            <span>🏠</span>
          </div>
        </div>
      )}

      {type === "list" && (
        <div className="kg-scene3d__stage">
          <div className="kg-3d-card kg-3d-card--teal">
            <div className="kg-3d-card__img kg-3d-card__img--teal">
              <div className="kg-3d-card__mount kg-3d-card__mount--teal" />
              <div className="kg-3d-card__sun kg-3d-card__sun--teal" />
            </div>
            <div className="kg-3d-card__line kg-3d-card__line--lg" />
            <div className="kg-3d-card__line kg-3d-card__line--md" />
            <div className="kg-3d-card__line kg-3d-card__line--sm" />
          </div>

          <div className="kg-3d-arrow kg-3d-arrow--teal">
            <span>→</span>
          </div>

          {/* Key instead of bag */}
          <div className="kg-3d-key">
            <div className="kg-3d-key__ring" />
            <div className="kg-3d-key__shaft" />
            <div className="kg-3d-key__tooth kg-3d-key__tooth--1" />
            <div className="kg-3d-key__tooth kg-3d-key__tooth--2" />
          </div>

          <div className="kg-3d-check kg-3d-check--teal">
            <span>✓</span>
          </div>
        </div>
      )}

      {type === "keys" && (
        <div className="kg-scene3d__stage">
          <div className="kg-3d-chat kg-3d-chat--left">
            <div className="kg-3d-chat__avatar kg-3d-chat__avatar--user" />
            <div className="kg-3d-chat__bubble kg-3d-chat__bubble--light">
              <div className="kg-3d-chat__line kg-3d-chat__line--lg" />
              <div className="kg-3d-chat__line kg-3d-chat__line--sm" />
            </div>
          </div>

          <div className="kg-3d-arrow kg-3d-arrow--chat kg-3d-arrow--teal">
            <span>→</span>
          </div>

          <div className="kg-3d-chat kg-3d-chat--right">
            <div className="kg-3d-chat__avatar kg-3d-chat__avatar--landlord" />
            <div className="kg-3d-chat__bubble kg-3d-chat__bubble--teal">
              <div className="kg-3d-chat__line kg-3d-chat__line--lg" />
              <div className="kg-3d-chat__line kg-3d-chat__line--sm" />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   STEP CARD — tilt/spotlight engine, layered teal accents
   ═══════════════════════════════════════════════════════════ */
function StoryStepCard({
  step,
  index,
  isActive,
  visible,
  onSelect,
}: {
  step: Step
  index: number
  isActive: boolean
  visible: boolean
  onSelect: () => void
}) {
  const cardRef = useRef<HTMLElement | null>(null)
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, mx: 50, my: 50, hovering: false })

  // Layered accent per step — creates a light→deep progression
  const accents = [
    { ring: "rgba(57,119,143,", chip: "#39778f", glow: "rgba(57,119,143,0.22)" },
    { ring: "rgba(66,124,148,", chip: "#427c94", glow: "rgba(66,124,148,0.24)" },
    { ring: "rgba(86,154,181,", chip: "#569ab5", glow: "rgba(86,154,181,0.26)" },
  ][index] ?? { ring: "rgba(57,119,143,", chip: "#39778f", glow: "rgba(57,119,143,0.22)" }

  const handleMouseMove = (e: MouseEvent<HTMLElement>) => {
    const el = cardRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const px = x / rect.width
    const py = y / rect.height

    setTilt({
      rx: (0.5 - py) * 10,
      ry: (px - 0.5) * 10,
      mx: px * 100,
      my: py * 100,
      hovering: true,
    })
  }

  const handleMouseLeave = () => {
    setTilt((prev) => ({ ...prev, rx: 0, ry: 0, hovering: false }))
  }

  return (
    <article
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={onSelect}
      style={{
        transitionDelay: visible ? `${index * 140}ms` : "0ms",
        transform: tilt.hovering
          ? `perspective(1100px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) translateY(-6px)`
          : isActive
            ? "perspective(1100px) translateY(-4px)"
            : "perspective(1100px) translateY(0px)",
      }}
      className={`kg-story-step group relative flex flex-col justify-between overflow-hidden rounded-[2rem] border p-6 text-center backdrop-blur-xl transition-all duration-500 ease-out sm:p-9 ${
        visible ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
      } ${
        isActive
          ? `border-[${accents.chip}]/45 bg-[var(--glass-soft-bg)] shadow-[0_24px_60px_-15px_${accents.glow},0_0_0_1px_${accents.ring}0.14)]`
          : "border-[var(--glass-border)] bg-[var(--glass-soft-bg)]/65 shadow-[0_12px_40px_-15px_rgba(16,36,54,0.08)] hover:border-[var(--primary)]/50 hover:shadow-[0_24px_60px_-15px_rgba(57,119,143,0.22)]"
      }`}
    >
      {/* Cursor-following radial spotlight — teal-centric */}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-500"
        style={{
          opacity: tilt.hovering ? 1 : 0,
          background: `radial-gradient(420px circle at ${tilt.mx}% ${tilt.my}%, rgba(86, 154, 181, 0.14), rgba(57, 119, 143, 0.08) 45%, transparent 75%)`,
        }}
      />

      {/* Top rim light highlight */}
      <div
        className={`pointer-events-none absolute inset-x-8 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#39778f]/70 to-transparent transition-opacity duration-500 ${
          isActive || tilt.hovering ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Giant watermark step number */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-2 -top-4 select-none text-[5.5rem] font-black leading-none tracking-tighter text-[var(--text)] opacity-[0.035] transition-transform duration-500 group-hover:scale-110"
      >
        {step.number}
      </span>

      {/* Top status pill */}
      <div className="relative z-10 mb-4 flex items-center justify-between gap-2">
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider transition-colors duration-300"
          style={
            isActive
              ? { background: `${accents.chip}1f`, color: accents.chip }
              : { background: `${accents.chip}12`, color: accents.chip }
          }
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${isActive ? "animate-pulse" : ""}`}
            style={{ background: accents.chip }}
          />
          {step.badge}
        </span>

        <span className="font-mono text-xs font-black tracking-widest text-[var(--text-muted)]">
          /{step.number}
        </span>
      </div>

      {/* 3D Scene Stage */}
      <div className="relative z-10 my-2">
        <Scene type={step.scene} isActive={isActive} />
      </div>

      {/* Text Content */}
      <div className="relative z-10 mt-6">
        <h3
          className="text-xl font-black tracking-tight text-[var(--text)] transition-colors duration-300 sm:text-2xl"
          style={{ transition: "color .3s" }}
        >
          {step.title}
        </h3>
        <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">
          {step.description}
        </p>
      </div>

      {/* Bottom active progress bar — teal gradient */}
      <div className="relative z-10 mt-7 h-1 w-full overflow-hidden rounded-full bg-[var(--glass-border)]/50">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#39778f] via-[#569ab5] to-[#6ec5c9] transition-all duration-700 ease-out"
          style={{
            width: isActive ? "100%" : tilt.hovering ? "65%" : "22%",
          }}
        />
      </div>
    </article>
  )
}

/* ═══════════════════════════════════════════════════════════
   HOME RENT STORY — property variant (professional polish)
   ═══════════════════════════════════════════════════════════ */
export default function HomeRentStory() {
  const sectionRef = useRef<HTMLElement | null>(null)
  const [visible, setVisible] = useState(false)
  const [activeStep, setActiveStep] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return
    if (!("IntersectionObserver" in window)) {
      setVisible(true)
      return
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 },
    )
    observer.observe(section)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!visible || paused) return
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length)
    }, 3500)
    return () => clearInterval(timer)
  }, [visible, paused])

  const categoryPills = [
    { label: "Inzu yo guturamo", icon: "🏡" },
    { label: "Apartment", icon: "🏢" },
    { label: "Icyumba", icon: "🛏️" },
    { label: "Ubutaka", icon: "🌍" },
  ]

  return (
    <section
      ref={sectionRef}
      aria-labelledby="home-rent-story-title"
      className="kg-story-section relative overflow-x-clip bg-[var(--bg-secondary)] px-4 py-20 sm:px-6 sm:py-28"
    >
      {/* Top fade — smooth transition from previous section */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[var(--bg)] to-transparent" />
      {/* Bottom fade — smooth exit */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[var(--bg)] to-transparent" />

      {/* Architectural ambient light mesh — teal-tinted, subtle grid */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />
        <div className="absolute -left-40 top-16 h-[520px] w-[520px] rounded-full bg-[#569ab5]/20 opacity-45 blur-[130px]" />
        <div className="absolute left-1/2 top-1/3 h-[360px] w-[360px] -translate-x-1/2 rounded-full bg-[#39778f]/12 blur-[140px]" />
        <div className="absolute -right-32 bottom-16 h-[460px] w-[460px] rounded-full bg-[#6ec5c9]/15 blur-[130px]" />
      </div>

      <div className="relative mx-auto max-w-7xl">
        {/* CHAPTER RIBBON — professional editorial marker */}
        <div
          className={`mb-6 flex items-center justify-center transition-all duration-1000 ease-out ${
            visible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
          }`}
        >
          <div className="inline-flex items-center gap-3 rounded-full border border-[var(--glass-border)] bg-[var(--glass-soft-bg)]/90 px-4 py-1.5 backdrop-blur-md">
            <span className="font-mono text-[10px] font-black tracking-[0.3em] text-[#39778f]">
              CHAPTER 02
            </span>
            <span className="h-3 w-px bg-[var(--glass-border)]" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">
              Inzu n'Amazu
            </span>
          </div>
        </div>

        {/* Editorial Header */}
        <div
          className={`mx-auto max-w-3xl text-center transition-all duration-1000 ease-out motion-reduce:transform-none motion-reduce:transition-none ${
            visible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
        >
          <span className="inline-flex items-center gap-2.5 rounded-full border border-[var(--glass-border)] bg-[var(--glass-soft-bg)] px-4 py-2 text-[11px] font-extrabold uppercase tracking-[0.22em] text-[#39778f] shadow-sm backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="absolute inset-0 animate-ping rounded-full bg-[#569ab5] opacity-75" />
              <span className="relative flex h-2 w-2 rounded-full bg-[#569ab5]" />
            </span>
            Inzu cyangwa amazu
          </span>

          <h2
            id="home-rent-story-title"
            className="mt-7 text-4xl font-black leading-[1.03] tracking-[-0.045em] text-[var(--text)] sm:text-5xl lg:text-[3.75rem]"
          >
            Ufite inzu ushaka gukodesha, ariko{" "}
            <span className="relative inline-block">
              <span className="bg-[linear-gradient(110deg,#39778f_0%,#569ab5_45%,#6ec5c9_85%,#FF7A29_100%)] bg-[size:200%_100%] bg-clip-text text-transparent [animation:kg-shimmer_7s_ease-in-out_infinite]">
                ukabura abashaka gukodesha?
              </span>
              {/* Hand-drawn underline */}
              <svg
                className="absolute -bottom-3 left-0 right-0 w-full"
                height="12"
                viewBox="0 0 200 12"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <path
                  d="M2 8 Q 50 2, 100 6 T 198 5"
                  fill="none"
                  stroke="url(#underline-gradient)"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="underline-gradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#39778f" stopOpacity="0.3" />
                    <stop offset="50%" stopColor="#569ab5" stopOpacity="1" />
                    <stop offset="100%" stopColor="#6ec5c9" stopOpacity="0.3" />
                  </linearGradient>
                </defs>
              </svg>
            </span>
          </h2>

          <p className="mx-auto mt-7 max-w-2xl text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
            Hari igihe ufite inzu cyangwa amazu ahari, ariko ukabura
            abayakodesha cyangwa abayagura.{" "}
            <span className="font-extrabold text-[var(--text)]">KUGURISHA.COM</span>{" "}
            iguha aho werekanira inzu yawe kugira ngo abayikeneye babashe
            kuyibona vuba.
          </p>

          {/* Interactive category pills — property-focused with icons */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            {categoryPills.map((item) => (
              <span
                key={item.label}
                className="group inline-flex items-center gap-1.5 rounded-full border border-[var(--glass-border)] bg-[var(--glass-soft-bg)]/80 px-3.5 py-1.5 text-xs font-semibold text-[var(--text-muted)] backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[#39778f]/45 hover:text-[var(--text)] hover:shadow-[0_4px_14px_-6px_rgba(57,119,143,0.35)]"
              >
                <span className="text-sm transition-transform duration-200 group-hover:scale-110">
                  {item.icon}
                </span>
                {item.label}
              </span>
            ))}
          </div>
        </div>

        {/* 3D Interactive Cards Grid + Desktop Energy Connector */}
        <div
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          className="relative mt-16 sm:mt-20"
        >
          {/* Glowing horizontal energy pipeline — teal gradient */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-[16%] right-[16%] top-1/2 hidden -translate-y-1/2 md:block"
          >
            <div className="h-[2px] w-full rounded-full bg-[var(--glass-border)]/70" />
            <div
              className="h-[2px] -translate-y-[2px] rounded-full bg-gradient-to-r from-[#39778f] via-[#569ab5] to-[#6ec5c9] shadow-[0_0_16px_rgba(57,119,143,0.6)] transition-all duration-700 ease-out"
              style={{
                width:
                  activeStep === 0 ? "18%" : activeStep === 1 ? "55%" : "100%",
              }}
            />
          </div>

          <div className="relative z-10 grid gap-6 md:grid-cols-3 md:gap-8 lg:gap-10">
            {steps.map((step, index) => (
              <StoryStepCard
                key={step.number}
                step={step}
                index={index}
                isActive={activeStep === index}
                visible={visible}
                onSelect={() => setActiveStep(index)}
              />
            ))}
          </div>
        </div>

        {/* High-Craft Bottom CTA — dual-action block with trust ribbon */}
        <div
          className={`mt-16 flex flex-col items-center gap-5 text-center transition-all delay-300 duration-1000 sm:mt-20 ${
            visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          <p className="max-w-xl text-sm font-semibold leading-7 text-[var(--text-secondary)] sm:text-base">
            Ntugomba gutegereza ko inzu yawe yangirika ugitegereje uyikodesha.{" "}
            <span className="text-[var(--text)] font-bold">
              Tangira uyu munsi.
            </span>
          </p>

          {/* Dual-action CTA cluster */}
          <div className="flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row sm:gap-4">
            {/* Primary CTA — full gradient with shadow halo */}
            <Link
              to="/create-listing"
              aria-label="Shyiraho inzu yawe kuri KUGURISHA.COM"
              className="group relative inline-flex min-h-14 w-full items-center justify-center overflow-hidden rounded-full bg-gradient-to-r from-[#39778f] via-[#569ab5] to-[#FF7A29] p-[2px] shadow-[0_14px_40px_-10px_rgba(57,119,143,0.55)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_50px_-10px_rgba(57,119,143,0.7)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#39778f] sm:w-auto"
            >
              <span className="relative flex h-full w-full items-center justify-center rounded-full bg-[#102436] px-8 py-3.5 text-sm font-black tracking-wide text-white transition-colors duration-300 group-hover:bg-[#102436]/90 sm:px-9 sm:text-base">
                {/* Shimmer sweep */}
                <span className="pointer-events-none absolute inset-0 -translate-x-full bg-[linear-gradient(115deg,transparent_35%,rgba(255,255,255,0.28)_50%,transparent_65%)] transition-transform duration-700 group-hover:translate-x-full" />
                <span className="relative">Shyiraho inzu yawe</span>
                <span
                  aria-hidden="true"
                  className="relative ml-2.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#569ab5] text-xs text-white transition-transform duration-300 group-hover:translate-x-1"
                >
                  →
                </span>
              </span>
            </Link>

            {/* Secondary ghost CTA */}
            <Link
              to="/listings?category=property"
              aria-label="Reba amazu ari ku isoko"
              className="group inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-full border border-[var(--glass-border)] bg-[var(--glass-soft-bg)]/60 px-6 py-3.5 text-sm font-bold text-[var(--text)] backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-[#39778f]/40 hover:bg-[var(--glass-soft-bg)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#39778f] sm:w-auto"
            >
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#39778f]/15 text-[#39778f] transition-transform duration-300 group-hover:rotate-45">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.4}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </span>
              Reba amazu ari ku isoko
            </Link>
          </div>

          {/* Trust ribbon */}
          <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-[var(--glass-border)] bg-[var(--glass-soft-bg)]/50 px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] backdrop-blur-sm">
            <svg className="h-3 w-3 text-[#39778f]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.4}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
            Kwerekana inzu yawe ni ubuntu
            <span className="h-2 w-px bg-[var(--glass-border)]" />
            Abaguzi babibona vuba
          </div>
        </div>
      </div>
    </section>
  )
}