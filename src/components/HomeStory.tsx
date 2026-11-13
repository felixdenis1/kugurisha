import { useEffect, useRef, useState, type MouseEvent } from "react"
import { Link } from "react-router-dom"

type Step = {
  number: string
  badge: string
  title: string
  description: string
  accent: string
  scene: "camera" | "listing" | "chat"
}

const steps: Step[] = [
  {
    number: "01",
    badge: "Intambwe ya 1",
    title: "Fata amafoto",
    description:
      "Fata amafoto agaragaza neza icyo ushaka kugurisha, wandike amakuru yacyo n'igiciro.",
    accent: "#FF5D00",
    scene: "camera",
  },
  {
    number: "02",
    badge: "Intambwe ya 2",
    title: "Gishyire ku isoko",
    description:
      "Shyira igicuruzwa cyawe kuri KUGURISHA.COM kugira ngo abaguzi babashe kukibona.",
    accent: "#427c94",
    scene: "listing",
  },
  {
    number: "03",
    badge: "Intambwe ya 3",
    title: "Vugana n'umuguzi",
    description:
      "Ushaka kukigura ashobora kugukorera ubutumwa, mukaganira mukumvikana.",
    accent: "#569ab5",
    scene: "chat",
  },
]

/* ═══════════════════════════════════════════════════════════
   3D SCENE — wrapped in interactive depth stage
   ═══════════════════════════════════════════════════════════ */
function Scene({ type, isActive }: { type: Step["scene"]; isActive: boolean }) {
  return (
    <div
      className={`kg-scene3d relative mx-auto transition-transform duration-700 ease-out ${
        isActive ? "scale-105 -translate-y-1" : "group-hover:scale-105 group-hover:-translate-y-1"
      }`}
      aria-hidden="true"
    >
      {/* Dynamic multi-layered ambient aura */}
      <div className="kg-scene3d__glow" />
      <div
        className={`pointer-events-none absolute inset-4 rounded-full blur-2xl transition-opacity duration-700 ${
          isActive ? "opacity-55" : "opacity-20 group-hover:opacity-50"
        }`}
        style={{
          background:
            type === "camera"
              ? "radial-gradient(circle, rgba(255,93,0,0.45) 0%, transparent 70%)"
              : type === "listing"
                ? "radial-gradient(circle, rgba(66,124,148,0.5) 0%, transparent 70%)"
                : "radial-gradient(circle, rgba(86,154,181,0.5) 0%, transparent 70%)",
        }}
      />

      {type === "camera" && (
        <div className="kg-scene3d__stage">
          <div className="kg-3d-phone">
            <div className="kg-3d-phone__screen">
              <div className="kg-3d-phone__landscape" />
              <div className="kg-3d-phone__sun" />
              <div className="kg-3d-phone__hill" />
            </div>
            <div className="kg-3d-phone__notch" />
            <div className="kg-3d-phone__home" />
          </div>

          <div className="kg-3d-camera">
            <div className="kg-3d-camera__body">
              <div className="kg-3d-camera__lens">
                <div className="kg-3d-camera__lens-inner" />
              </div>
              <div className="kg-3d-camera__flash" />
            </div>
          </div>

          <div className="kg-3d-badge">
            <span>+</span>
          </div>
        </div>
      )}

      {type === "listing" && (
        <div className="kg-scene3d__stage">
          <div className="kg-3d-card">
            <div className="kg-3d-card__img">
              <div className="kg-3d-card__mount" />
              <div className="kg-3d-card__sun" />
            </div>
            <div className="kg-3d-card__line kg-3d-card__line--lg" />
            <div className="kg-3d-card__line kg-3d-card__line--md" />
            <div className="kg-3d-card__line kg-3d-card__line--sm" />
          </div>

          <div className="kg-3d-arrow">
            <span>→</span>
          </div>

          <div className="kg-3d-bag">
            <div className="kg-3d-bag__handle" />
            <div className="kg-3d-bag__body">
              <div className="kg-3d-bag__shine" />
            </div>
          </div>

          <div className="kg-3d-check">
            <span>✓</span>
          </div>
        </div>
      )}

      {type === "chat" && (
        <div className="kg-scene3d__stage">
          <div className="kg-3d-chat kg-3d-chat--left">
            <div className="kg-3d-chat__avatar kg-3d-chat__avatar--user" />
            <div className="kg-3d-chat__bubble kg-3d-chat__bubble--light">
              <div className="kg-3d-chat__line kg-3d-chat__line--lg" />
              <div className="kg-3d-chat__line kg-3d-chat__line--sm" />
            </div>
          </div>

          <div className="kg-3d-arrow kg-3d-arrow--chat">
            <span>→</span>
          </div>

          <div className="kg-3d-chat kg-3d-chat--right">
            <div className="kg-3d-chat__avatar kg-3d-chat__avatar--seller" />
            <div className="kg-3d-chat__bubble kg-3d-chat__bubble--dark">
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
   INTERACTIVE 3D TILT + SPOTLIGHT STEP CARD
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

  const handleMouseMove = (e: MouseEvent<HTMLElement>) => {
    const el = cardRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const px = x / rect.width
    const py = y / rect.height

    setTilt({
      rx: (0.5 - py) * 10, // subtle 3D pitch
      ry: (px - 0.5) * 10, // subtle 3D yaw
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
      className={`kg-story-step group relative flex flex-col justify-between overflow-hidden rounded-[2rem] border p-7 text-center backdrop-blur-xl transition-all duration-500 ease-out sm:p-9 ${
        visible ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
      } ${
        isActive
          ? "border-[#FF5D00]/45 bg-[var(--glass-soft-bg)] shadow-[0_24px_60px_-15px_rgba(255,93,0,0.18),0_0_0_1px_rgba(255,93,0,0.12)]"
          : "border-[var(--glass-border)] bg-[var(--glass-soft-bg)]/65 shadow-[0_12px_40px_-15px_rgba(16,36,54,0.08)] hover:border-[var(--primary)]/50 hover:shadow-[0_24px_60px_-15px_rgba(66,124,148,0.22)]"
      }`}
    >
      {/* Cursor-following radial spotlight */}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-500"
        style={{
          opacity: tilt.hovering ? 1 : 0,
          background: `radial-gradient(420px circle at ${tilt.mx}% ${tilt.my}%, rgba(255, 93, 0, 0.12), rgba(86, 154, 181, 0.08) 45%, transparent 75%)`,
        }}
      />

      {/* Top rim light highlight */}
      <div
        className={`pointer-events-none absolute inset-x-8 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#FF5D00]/70 to-transparent transition-opacity duration-500 ${
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
      <div className="relative z-10 mb-4 flex items-center justify-between">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider transition-colors duration-300 ${
            isActive
              ? "bg-[#FF5D00]/12 text-[#FF5D00]"
              : "bg-[var(--primary)]/10 text-[var(--primary)]"
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              isActive ? "animate-pulse bg-[#FF5D00]" : "bg-[var(--primary)]"
            }`}
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
        <h3 className="text-xl font-black tracking-tight text-[var(--text)] transition-colors duration-300 group-hover:text-[var(--primary)] sm:text-2xl">
          {step.title}
        </h3>
        <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">
          {step.description}
        </p>
      </div>

      {/* Bottom active progress bar */}
      <div className="relative z-10 mt-7 h-1 w-full overflow-hidden rounded-full bg-[var(--glass-border)]/50">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#FF5D00] via-[#FF7A29] to-[#569ab5] transition-all duration-700 ease-out"
          style={{
            width: isActive ? "100%" : tilt.hovering ? "65%" : "22%",
          }}
        />
      </div>
    </article>
  )
}

/* ═══════════════════════════════════════════════════════════
   HOME STORY
   ═══════════════════════════════════════════════════════════ */
export default function HomeStory() {
  const sectionRef = useRef<HTMLElement | null>(null)
  const [visible, setVisible] = useState(false)
  const [activeStep, setActiveStep] = useState(0)
  const [paused, setPaused] = useState(false)

  // Reveal section on scroll
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

  // Auto-cycle active step spotlight every 3.5s unless user is hovering/interacting
  useEffect(() => {
    if (!visible || paused) return
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length)
    }, 3500)
    return () => clearInterval(timer)
  }, [visible, paused])

  return (
    <section
      ref={sectionRef}
      aria-labelledby="home-story-title"
      className="kg-story-section relative overflow-x-clip bg-[var(--bg)] px-4 py-24 sm:px-6 sm:py-32"
    >
      {/* Architectural ambient light mesh & subtle grid */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />
        <div className="absolute -left-40 top-16 h-[520px] w-[520px] rounded-full bg-[var(--glow-color)] opacity-45 blur-[130px]" />
        <div className="absolute left-1/2 top-1/3 h-[360px] w-[360px] -translate-x-1/2 rounded-full bg-[#FF5D00]/10 blur-[140px]" />
        <div className="absolute -right-32 bottom-16 h-[460px] w-[460px] rounded-full bg-[#569ab5]/15 blur-[130px]" />
      </div>

      <div className="relative mx-auto max-w-7xl">
        {/* Editorial Header */}
        <div
          className={`mx-auto max-w-3xl text-center transition-all duration-1000 ease-out motion-reduce:transform-none motion-reduce:transition-none ${
            visible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
        >
          <span className="inline-flex items-center gap-2.5 rounded-full border border-[var(--glass-border)] bg-[var(--glass-soft-bg)] px-4 py-2 text-[11px] font-extrabold uppercase tracking-[0.22em] text-[var(--primary-hover)] shadow-sm backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="absolute inset-0 animate-ping rounded-full bg-[#FF5D00] opacity-75" />
              <span className="relative flex h-2 w-2 rounded-full bg-[#FF5D00]" />
            </span>
            Amahirwe yo kugurisha
          </span>

          <h2
            id="home-story-title"
            className="mt-7 text-4xl font-black leading-[1.03] tracking-[-0.045em] text-[var(--text)] sm:text-5xl lg:text-[3.75rem]"
          >
            Ufite icyo ushaka kugurisha, ariko{" "}
            <span className="relative inline-block">
              <span className="bg-[linear-gradient(110deg,#FF5D00_0%,#FF7A29_45%,#39778f_85%,#569ab5_100%)] bg-[size:200%_100%] bg-clip-text text-transparent [animation:kg-shimmer_7s_ease-in-out_infinite]">
                ukabura umuguzi?
              </span>
              <span className="absolute -bottom-1.5 left-0 right-0 h-[4px] rounded-full bg-gradient-to-r from-[#FF5D00] via-[#FF7A29] to-[#569ab5] opacity-75" />
            </span>
          </h2>

          <p className="mx-auto mt-7 max-w-2xl text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
            Hari igihe ukenera amafaranga byihutirwa, kandi ufite ikintu ushobora
            kugurisha ariko ukabura aho uhera ushaka umuguzi.{" "}
            <span className="font-extrabold text-[var(--text)]">KUGURISHA.COM</span>{" "}
            iguha aho werekanira icyo ufite kugira ngo abakigukeneye babashe
            kukibona.
          </p>

          {/* Interactive category pills */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            {[
              "Telefoni",
              "Mudasobwa",
              "Ibikoresho byo mu rugo",
              "Imodoka",
              "Inzu n'ubutaka",
            ].map((item) => (
              <span
                key={item}
                className="rounded-full border border-[var(--glass-border)] bg-[var(--glass-soft-bg)]/80 px-3.5 py-1 text-xs font-semibold text-[var(--text-muted)] backdrop-blur-sm transition-colors hover:border-[#FF5D00]/40 hover:text-[var(--text)]"
              >
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* 3D Interactive Cards Grid + Desktop Energy Connector */}
        <div
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          className="relative mt-20"
        >
          {/* Glowing horizontal energy pipeline connecting cards on desktop */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-[16%] right-[16%] top-1/2 hidden -translate-y-1/2 md:block"
          >
            <div className="h-[2px] w-full rounded-full bg-[var(--glass-border)]/70" />
            <div
              className="h-[2px] -translate-y-[2px] rounded-full bg-gradient-to-r from-[#FF5D00] via-[#FF7A29] to-[#569ab5] shadow-[0_0_16px_rgba(255,93,0,0.6)] transition-all duration-700 ease-out"
              style={{
                width:
                  activeStep === 0 ? "18%" : activeStep === 1 ? "55%" : "100%",
              }}
            />
          </div>

          <div className="relative z-10 grid gap-8 md:grid-cols-3 lg:gap-10">
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

        {/* High-Craft Bottom CTA */}
        <div
          className={`mt-20 flex flex-col items-center gap-6 text-center transition-all delay-300 duration-1000 ${
            visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          <p className="max-w-xl text-sm font-semibold leading-7 text-[var(--text-secondary)] sm:text-base">
            Ntugomba kuba ufite iduka kugira ngo werekane icyo ugurisha.{" "}
            <span className="text-[var(--text)] font-bold">
              Tangira n'icyo ufite uyu munsi.
            </span>
          </p>

          <Link
            to="/create-listing"
            className="group relative inline-flex min-h-14 items-center justify-center overflow-hidden rounded-full bg-gradient-to-r from-[#FF5D00] via-[#FF6E1A] to-[#427c94] p-[2px] shadow-[0_14px_40px_-10px_rgba(255,93,0,0.5)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_50px_-10px_rgba(255,93,0,0.7)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#FF5D00]"
          >
            <span className="relative flex h-full w-full items-center justify-center rounded-full bg-[#102436] px-9 py-3.5 text-sm font-black tracking-wide text-white transition-colors duration-300 group-hover:bg-[#102436]/90 sm:text-base">
              {/* Shimmer sweep */}
              <span className="pointer-events-none absolute inset-0 -translate-x-full bg-[linear-gradient(115deg,transparent_35%,rgba(255,255,255,0.28)_50%,transparent_65%)] transition-transform duration-700 group-hover:translate-x-full" />
              <span className="relative">Shyiraho icyo ushaka kugurisha</span>
              <span
                aria-hidden="true"
                className="relative ml-2.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#FF5D00] text-xs text-white transition-transform duration-300 group-hover:translate-x-1"
              >
                →
              </span>
            </span>
          </Link>
        </div>
      </div>
    </section>
  )
}