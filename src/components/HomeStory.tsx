import { useEffect, useRef, useState } from "react"
import { Link } from "react-router-dom"

type Step = {
  number: string
  title: string
  description: string
  scene: "camera" | "listing" | "chat"
}

const steps: Step[] = [
  {
    number: "01",
    title: "Fata amafoto",
    description: "Fata amafoto agaragaza neza icyo ushaka kugurisha, wandike amakuru yacyo n'igiciro.",
    scene: "camera",
  },
  {
    number: "02",
    title: "Gishyire ku isoko",
    description: "Shyira igicuruzwa cyawe kuri KUGURISHA.COM kugira ngo abaguzi babashe kukibona.",
    scene: "listing",
  },
  {
    number: "03",
    title: "Vugana n'umuguzi",
    description: "Ushaka kukigura ashobora kugukorera ubutumwa, mukaganira mukumvikana.",
    scene: "chat",
  },
]

function Scene({ type }: { type: Step["scene"] }) {
  return (
    <div className="kg-story-scene" aria-hidden="true">
      <svg viewBox="0 0 360 230" className="kg-story-scene-svg" fill="none" role="presentation">
        <rect x="1" y="1" width="358" height="228" rx="24" fill="var(--surface)" fillOpacity=".55" />
        <circle cx="294" cy="49" r="35" fill="#569ab5" fillOpacity=".09" />
        <circle cx="57" cy="184" r="50" fill="#569ab5" fillOpacity=".07" />
        {type === "camera" && (
          <>
            <rect x="123" y="18" width="115" height="196" rx="21" fill="var(--bg-secondary)" stroke="#427c94" strokeWidth="4" />
            <rect x="132" y="39" width="97" height="137" rx="10" fill="#d7e9ee" />
            <rect x="142" y="75" width="77" height="63" rx="10" fill="#a8d1de" />
            <path d="M142 130l21-23 15 13 18-29 23 39" fill="#427c94" fillOpacity=".7" />
            <circle cx="196" cy="91" r="8" fill="#fff" />
            <circle cx="181" cy="194" r="8" stroke="#427c94" strokeWidth="3" />
            <g className="kg-scene-float">
              <rect x="39" y="78" width="100" height="73" rx="14" fill="var(--surface)" stroke="#569ab5" strokeWidth="3" />
              <path d="M56 98h22l7-9h19l7 9h11v34H56V98Z" stroke="#427c94" strokeWidth="3" strokeLinejoin="round" />
              <circle cx="90" cy="114" r="11" stroke="#427c94" strokeWidth="3" />
            </g>
            <g className="kg-scene-pulse"><circle cx="259" cy="100" r="21" fill="#569ab5" fillOpacity=".17" /><path d="M249 100h20m-10-10v20" stroke="#427c94" strokeWidth="3" strokeLinecap="round" /></g>
          </>
        )}
        {type === "listing" && (
          <>
            <g className="kg-scene-float">
              <rect x="56" y="35" width="136" height="161" rx="17" fill="var(--surface)" stroke="#569ab5" strokeWidth="3" />
              <rect x="69" y="49" width="110" height="83" rx="10" fill="#c4e0e8" />
              <path d="M80 121l26-31 18 16 17-22 28 37" fill="#569ab5" fillOpacity=".75" />
              <circle cx="151" cy="75" r="9" fill="white" />
              <rect x="72" y="146" width="77" height="7" rx="3.5" fill="#427c94" fillOpacity=".8" />
              <rect x="72" y="160" width="57" height="6" rx="3" fill="#569ab5" fillOpacity=".4" />
              <rect x="72" y="174" width="92" height="10" rx="5" fill="#427c94" fillOpacity=".2" />
            </g>
            <path d="M192 111h50m-13-13 13 13-13 13" stroke="#427c94" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="kg-scene-arrow" />
            <rect x="244" y="70" width="78" height="85" rx="16" fill="#427c94" />
            <path d="M259 93h48l-4 46h-40l-4-46Z" stroke="white" strokeWidth="3" strokeLinejoin="round" />
            <path d="M271 94v-7a12 12 0 0 1 24 0v7" stroke="white" strokeWidth="3" />
            <circle cx="305" cy="66" r="17" fill="#d6f2e8" stroke="#427c94" strokeWidth="2" />
            <path d="m297 66 5 5 9-10" stroke="#427c94" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </>
        )}
        {type === "chat" && (
          <>
            <g className="kg-scene-float">
              <circle cx="92" cy="75" r="26" fill="#c4e0e8" stroke="#427c94" strokeWidth="3" />
              <circle cx="92" cy="69" r="9" fill="#427c94" />
              <path d="M76 91c4-14 28-14 32 0" fill="#427c94" />
              <rect x="42" y="113" width="148" height="57" rx="17" fill="var(--surface)" stroke="#569ab5" strokeWidth="3" />
              <path d="M58 133h111M58 146h74" stroke="#427c94" strokeOpacity=".7" strokeWidth="5" strokeLinecap="round" />
            </g>
            <g className="kg-scene-chat-reply">
              <circle cx="266" cy="75" r="26" fill="#427c94" />
              <circle cx="266" cy="69" r="9" fill="white" />
              <path d="M250 91c4-14 28-14 32 0" fill="white" />
              <rect x="193" y="135" width="133" height="58" rx="17" fill="#427c94" />
              <path d="M208 154h100M208 168h61" stroke="white" strokeOpacity=".9" strokeWidth="5" strokeLinecap="round" />
            </g>
            <path d="M169 71h45m-12-11 12 11-12 11" stroke="#569ab5" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </>
        )}
      </svg>
    </div>
  )
}

export default function HomeStory() {
  const sectionRef = useRef<HTMLElement | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return
    if (!("IntersectionObserver" in window)) {
      setVisible(true)
      return
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true)
        observer.disconnect()
      }
    }, { threshold: 0.12 })
    observer.observe(section)
    return () => observer.disconnect()
  }, [])

  return (
    <section ref={sectionRef} aria-labelledby="home-story-title" className="kg-story-section relative bg-[var(--bg)] px-4 py-20 sm:px-6 sm:py-28">
      <div className="mx-auto max-w-7xl">
        {/* Restored original introduction — unchanged wording */}
        <div className={`mx-auto max-w-3xl text-center transition-all duration-700 motion-reduce:transform-none motion-reduce:transition-none ${visible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"}`}>
          <span className="inline-flex rounded-full border border-[var(--glass-border)] bg-[var(--glass-soft-bg)] px-4 py-2 text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--primary-hover)]">Amahirwe yo kugurisha</span>
          <h2 id="home-story-title" className="mt-6 text-3xl font-black leading-tight tracking-tight text-[var(--text)] sm:text-5xl">
            Ufite icyo ushaka kugurisha, ariko <span className="text-[var(--primary)]">ukabura umuguzi?</span>
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
            Hari igihe ukenera amafaranga byihutirwa, kandi ufite ikintu ushobora kugurisha ariko ukabura aho uhera ushaka umuguzi. KUGURISHA.COM iguha aho werekanira icyo ufite kugira ngo abakigukeneye babashe kukibona.
          </p>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-[var(--text-muted)] sm:text-base">
            Yaba telefoni, mudasobwa, ibikoresho byo mu rugo, imodoka, inzu cyangwa ubutaka — shyiraho amafoto n'ibisobanuro, utangire kugera ku bashobora kukigura.
          </p>
        </div>

        <div className="kg-story-stack mt-14 sm:mt-20">
          {steps.map((step, index) => (
            <article key={step.number} className="kg-story-step" style={{ zIndex: index + 1, top: `calc(96px + ${index * 13}px)` }}>
              <div className="kg-story-step-inner">
                {/* Independent left-side text div */}
                <div className="kg-story-copy">
                  <span className="kg-story-number">INTAMBWE {step.number}</span>
                  <h3 className="kg-story-title">{step.title}</h3>
                  <p className="kg-story-description">{step.description}</p>
                </div>
                {/* Independent right-side 2D animation div */}
                <div className="kg-story-visual">
                  <Scene type={step.scene} />
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-center gap-4 text-center">
          <p className="max-w-xl text-sm font-semibold leading-7 text-[var(--text-secondary)]">
            Ntugomba kuba ufite iduka kugira ngo werekane icyo ugurisha. Tangira n'icyo ufite.
          </p>
          <Link to="/create-listing" className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-[#427c94] px-7 py-3 text-sm font-extrabold text-white shadow-lg transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--primary)]">
            Shyiraho icyo ushaka kugurisha <span aria-hidden="true" className="ml-2">→</span>
          </Link>
        </div>
      </div>
    </section>
  )
}
