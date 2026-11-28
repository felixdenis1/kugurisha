import { useEffect, useMemo, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"

/* ──────────────────────────────────────────────────────────────────────────
   TYPES
   ────────────────────────────────────────────────────────────────────────── */
export type MarketplaceListing = {
  id: string
  title: string
  description: string | null
  price: number | null
  currency: string
  condition: string | null
  listing_type: string
  created_at: string
  category: { name: string } | null
  location: {
    province: string
    district: string | null
    sector: string | null
  } | null
}

type IconName =
  | "map-pin"
  | "arrow-right"
  | "plus"
  | "search"
  | "phone"
  | "spark"
  | "shield"
  | "globe"
  | "users"
  | "cart"

function Icon({
  name,
  size = 18,
  className = "",
}: {
  name: IconName
  size?: number
  className?: string
}) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
    "aria-hidden": true as const,
  }

  switch (name) {
    case "search":
      return <svg {...common}><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></svg>
    case "map-pin":
      return <svg {...common}><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></svg>
    case "arrow-right":
      return <svg {...common}><path d="M5 12h14m-6-6 6 6-6 6" /></svg>
    case "plus":
      return <svg {...common}><path d="M12 5v14M5 12h14" /></svg>
    case "phone":
      return <svg {...common}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
    case "spark":
      return <svg {...common}><path d="m12 3 1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5L12 3Z" /><path d="m19 16 .7 2.3L22 19l-2.3.7L19 22l-.7-2.3L16 19l2.3-.7L19 16Z" /></svg>
    case "shield":
      return <svg {...common}><path d="M12 21s8-3.5 8-10V5l-8-3-8 3v6c0 6.5 8 10 8 10Z" /><path d="m9 12 2 2 4-4" /></svg>
    case "globe":
      return <svg {...common}><circle cx="12" cy="12" r="10" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /><path d="M2 12h20" /></svg>
    case "users":
      return <svg {...common}><circle cx="9" cy="8" r="3" /><path d="M3 20a6 6 0 0 1 12 0M16 5a3 3 0 0 1 0 6M18 20a5 5 0 0 0-3-4.6" /></svg>
    case "cart":
      return <svg {...common}><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" /></svg>
    default:
      return null
  }
}

function formatPrice(listing: MarketplaceListing) {
  if (listing.listing_type === "free") return "Ubuntu"
  if (listing.price === null || listing.price === undefined) {
    return "Twandikire ku giciro"
  }
  return `FRW ${Number(listing.price).toLocaleString("en-US")}`
}

function formatLocation(listing: MarketplaceListing) {
  if (!listing.location) return "Rwanda"
  return [
    listing.location.sector,
    listing.location.district,
    listing.location.province,
  ].filter(Boolean).join(", ")
}

/* ──────────────────────────────────────────────────────────────────────────
   HIGH-LEVEL ANIMATION COMPONENTS
   ────────────────────────────────────────────────────────────────────────── */

function TypewriterText() {
  const phrases = [
    "Gura ibicuruzwa bishya ku isoko. Byose birizewe.",
    "Hamagara nyir'igicuruzwa ako kanya, utekanye.",
    "Reba aho ibintu biherereye mu Rwanda hose.",
    "Isoko ryuzuye amahirwe, ryubakiwe abanyarwanda."
  ]
  const [index, setIndex] = useState(0)
  const [subIndex, setSubIndex] = useState(0)
  const [reverse, setReverse] = useState(false)

  useEffect(() => {
    if (subIndex === phrases[index].length + 1 && !reverse) {
      const timeout = setTimeout(() => setReverse(true), 2000)
      return () => clearTimeout(timeout)
    }
    if (subIndex === 0 && reverse) {
      setReverse(false)
      setIndex((prev) => (prev + 1) % phrases.length)
      return
    }
    const timeout = setTimeout(() => {
      setSubIndex((prev) => prev + (reverse ? -1 : 1))
    }, reverse ? 30 : 60)
    return () => clearTimeout(timeout)
  }, [subIndex, index, reverse, phrases])

  return (
    <p className="mt-2 text-sm font-medium text-slate-600 dark:text-slate-300 max-w-md min-h-[40px] transition-colors duration-500">
      {phrases[index].substring(0, subIndex)}
      <span className="inline-block w-1 h-4 ml-1 bg-[#FF5D00] animate-pulse align-middle" />
    </p>
  )
}

function SmartLighting() {
  const colors = ["bg-[#2563eb]/20", "bg-emerald-500/20", "bg-purple-500/20", "bg-[#FF5D00]/20"]
  const [colorIndex, setColorIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setColorIndex((prev) => (prev + 1) % colors.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [colors.length])

  return (
    <div className={`absolute -left-10 -top-10 h-72 w-72 rounded-full blur-[80px] transition-all duration-1000 ease-in-out pointer-events-none ${colors[colorIndex]}`} />
  )
}

/* ──────────────────────────────────────────────────────────────────────────
   PROPS
   ────────────────────────────────────────────────────────────────────────── */
type MarketplaceStreamProps = {
  listings: MarketplaceListing[]
  images: Record<string, string>
  loading?: boolean
  search?: string
}

export default function MarketplaceStream({
  listings,
  images,
  loading = false,
  search = "",
}: MarketplaceStreamProps) {
  const navigate = useNavigate()
  const scrollRef = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)

  const filteredListings = useMemo(() => {
    const query = search.toLowerCase().trim()
    if (!query) return listings

    return listings.filter((listing) =>
      listing.title.toLowerCase().includes(query) ||
      listing.description?.toLowerCase().includes(query) ||
      listing.category?.name.toLowerCase().includes(query) ||
      formatLocation(listing).toLowerCase().includes(query)
    )
  }, [listings, search])

  useEffect(() => {
    if (isHovered || loading || filteredListings.length <= 1) return
    const interval = setInterval(() => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
        if (scrollLeft + clientWidth >= scrollWidth - 10) {
          scrollRef.current.scrollTo({ left: 0, behavior: "smooth" })
        } else {
          scrollRef.current.scrollBy({ left: 280, behavior: "smooth" })
        }
      }
    }, 3000)
    return () => clearInterval(interval)
  }, [isHovered, loading, filteredListings.length])

  const scrollLeft = () => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: -300, behavior: "smooth" })
  }

  const scrollRight = () => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: 300, behavior: "smooth" })
  }

  return (
    /* ── DEEP VISIBLE GRAY BACKGROUND (Professional Studio Look) ── */
    <div className="relative w-full overflow-hidden bg-[#e2e8f0] py-16 transition-colors duration-300 dark:bg-[#070d14] sm:py-24">
      
      {/* ── HIGH-END STUDIO LIGHTING & MESH ── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-[600px] w-[600px] rounded-full bg-white/60 blur-[120px] dark:bg-white/5" />
        <div className="absolute -bottom-40 right-0 h-[500px] w-[500px] rounded-full bg-slate-400/40 blur-[140px] dark:bg-[#102436]/60" />
        <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#82c4e0]/20 blur-[100px] dark:bg-[#82c4e0]/10" />
        <div className="absolute inset-0 opacity-[0.04] bg-[linear-gradient(black_1px,transparent_1px),linear-gradient(90deg,black_1px,transparent_1px)] bg-[size:40px_40px] dark:opacity-[0.02] dark:bg-[linear-gradient(white_1px,transparent_1px),linear-gradient(90deg,white_1px,transparent_1px)]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* ── HIGH-LEVEL UNPREDICTABLE HEADER ── */}
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-8 sm:mb-12 z-10">
          
          {/* Ambient Smart Light behind the header */}
          <SmartLighting />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-300/80 bg-white/60 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-slate-800 shadow-[0_0_15px_rgba(0,0,0,0.05)] backdrop-blur-xl transition-all duration-500 hover:scale-105 hover:bg-white dark:border-white/20 dark:bg-white/10 dark:text-white dark:hover:bg-white/20 mb-3">
              <span className="relative flex h-2 w-2">
                <span className="absolute inset-0 animate-ping rounded-full bg-[#FF5D00] opacity-75" />
                <span className="relative flex h-2 w-2 rounded-full bg-[#FF5D00]" />
              </span>
              Isoko Rishya
            </div>
            
            <h2 className="group/title text-3xl font-black tracking-tight text-slate-900 dark:text-white sm:text-5xl drop-shadow-sm cursor-default">
              <span className="inline-block transition-transform duration-500 group-hover/title:-translate-y-1">
                Ibyashyizwe
              </span>{" "}
              <span className="inline-block bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-500 dark:from-white dark:to-slate-400 transition-all duration-500 group-hover/title:-translate-y-1 group-hover/title:from-[#2563eb] group-hover/title:to-[#82c4e0] dark:group-hover/title:from-[#82c4e0] dark:group-hover/title:to-white">
                vuba
              </span>
            </h2>

            <TypewriterText />
          </div>
          
          <div className="relative z-10 flex items-center gap-3">
            <button 
              onClick={scrollLeft} 
              className="group flex h-12 w-12 items-center justify-center rounded-full border border-slate-300 bg-white/80 text-slate-700 shadow-sm backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:bg-slate-900 hover:text-white hover:shadow-xl hover:shadow-slate-900/20 active:scale-95 dark:border-white/20 dark:bg-white/10 dark:text-white dark:hover:bg-white dark:hover:text-slate-900" 
              aria-label="Previous"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-300 group-hover:-translate-x-1"><path d="m15 18-6-6 6-6"/></svg>
            </button>
            <button 
              onClick={scrollRight} 
              className="group flex h-12 w-12 items-center justify-center rounded-full border border-slate-300 bg-white/80 text-slate-700 shadow-sm backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:bg-slate-900 hover:text-white hover:shadow-xl hover:shadow-slate-900/20 active:scale-95 dark:border-white/20 dark:bg-white/10 dark:text-white dark:hover:bg-white dark:hover:text-slate-900" 
              aria-label="Next"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-300 group-hover:translate-x-1"><path d="m9 18 6-6-6-6"/></svg>
            </button>
            <button
              onClick={() => navigate("/Listings")}
              className="group relative hidden sm:flex items-center gap-2 overflow-hidden rounded-full bg-slate-900 px-6 py-3 text-sm font-bold text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:bg-white dark:text-slate-900"
            >
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full dark:via-black/10" />
              Reba byose
              <Icon name="arrow-right" size={16} className="transition-transform duration-300 group-hover:translate-x-1.5" />
            </button>
          </div>
        </div>

        {/* ── REDUCED SIZE HORIZONTAL PRODUCT CARDS ── */}
        {loading ? (
          <div className="flex gap-4 overflow-hidden">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="w-[240px] h-[340px] rounded-[1.25rem] bg-slate-300/50 dark:bg-white/5 animate-pulse border border-slate-300 dark:border-white/10" />
            ))}
          </div>
        ) : filteredListings.length > 0 ? (
          <div 
            ref={scrollRef}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="flex gap-5 overflow-x-auto snap-x snap-mandatory pb-8 pt-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          >
            {filteredListings.map((listing) => {
              const image = images[listing.id]

              return (
                <div 
                  key={listing.id} 
                  className="group relative flex w-[240px] shrink-0 snap-start flex-col overflow-hidden rounded-[1.25rem] border border-slate-200 bg-white p-3.5 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl dark:border-white/10 dark:bg-[#132433] dark:shadow-black/50"
                >
                  <div className="relative mb-3 aspect-square w-full overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800">
                    {image ? (
                      <img src={image} alt={listing.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-slate-300 dark:text-slate-600">
                        <Icon name="search" size={28} />
                      </div>
                    )}
                  </div>

                  <h3 className="mb-1 line-clamp-2 text-sm font-bold text-slate-900 dark:text-white leading-tight">
                    {listing.title}
                  </h3>

                  <p className="mb-2 text-lg font-black text-slate-900 dark:text-white">
                    {formatPrice(listing)}
                  </p>

                  <div className="mb-3 inline-flex w-fit items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-600 dark:bg-white/5 dark:text-slate-300">
                    <Icon name="map-pin" size={10} className="text-[#FF5D00]" />
                    <span className="truncate max-w-[150px]">{formatLocation(listing)}</span>
                  </div>

                  <div className="mt-auto flex items-center justify-end gap-2 border-t border-slate-100 pt-3 dark:border-white/10">
                    <button 
                      onClick={() => navigate(`/listing/${listing.id}`)}
                      className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition-colors hover:bg-slate-200 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
                    >
                      <Icon name="cart" size={16} />
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation()
                        alert("Hamagara nyir'igicuruzwa")
                      }}
                      className="flex h-9 w-11 items-center justify-center rounded-lg bg-emerald-500 text-white shadow-sm transition-all hover:bg-emerald-600 hover:scale-105 active:scale-95 dark:bg-emerald-600 dark:hover:bg-emerald-500"
                    >
                      <Icon name="phone" size={16} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-slate-300 bg-white/50 py-16 text-center backdrop-blur-md dark:border-white/10 dark:bg-white/5">
            <Icon name="search" size={40} className="mb-4 text-slate-400 dark:text-slate-500" />
            <h4 className="text-lg font-bold text-slate-900 dark:text-white">Nta bintu bibonetse</h4>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Nta bicuruzwa bihuye n'ibyo ushakisha ubu.</p>
          </div>
        )}

        {/* ── FEATURE CARDS (Fixed Dark/Light Mode & Animations) ── */}
        <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-3">
          
          {/* Card 1: Trust */}
          <div className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl dark:border-white/10 dark:bg-[#132433]">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-blue-100 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-blue-600 dark:bg-blue-500/20 dark:text-blue-300">Beta</div>
            <div>
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-[#2563eb] dark:bg-blue-500/10 dark:text-blue-400 transition-transform duration-500 group-hover:scale-110">
                <Icon name="shield" size={32} />
              </div>
              <h4 className="mb-2 text-lg font-black text-slate-900 dark:text-white">Umutekano 100%</h4>
              <p className="text-xs font-medium leading-relaxed text-slate-600 dark:text-slate-400">
                Abagurisha bose bagenzurwa. Gura ibintu byizewe utekanye nk'uko uri mu Rwanda rwawe.
              </p>
            </div>
            <button onClick={() => navigate("/how-it-works")} className="mt-6 flex items-center gap-1 text-xs font-bold text-slate-900 hover:underline dark:text-white transition-colors group-hover:text-blue-600 dark:group-hover:text-blue-400">
              Menya byinshi <Icon name="arrow-right" size={12} className="transition-transform group-hover:translate-x-1" />
            </button>
          </div>

          {/* Card 2: Baza AI (Perfect Dark/Light Adaptation) */}
          <div className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-[#1e3a5f] bg-[#102436] p-6 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl dark:border-white/10 dark:bg-[#0d1c2c]">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#FFB020] px-3 py-1 text-[10px] font-black uppercase tracking-wider text-black">Nshya</div>
            <div>
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/20 text-[#82bfd4] transition-transform duration-500 group-hover:scale-110">
                <Icon name="spark" size={32} />
              </div>
              <h4 className="mb-2 text-lg font-black text-white">Baza AI</h4>
              <p className="text-xs font-medium leading-relaxed text-slate-300">
                Shakisha ibyo ushaka mu buryo bworoshye. AI irahuza n'ibicuruzwa biboneye mu buryo buhuse.
              </p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                <span className="rounded-full border border-blue-400/30 bg-blue-500/10 px-2 py-1 text-[9px] font-bold text-blue-300 transition-colors group-hover:bg-blue-500/20">UBWENGE</span>
                <span className="rounded-full border border-blue-400/30 bg-blue-500/10 px-2 py-1 text-[9px] font-bold text-blue-300 transition-colors group-hover:bg-blue-500/20">VUBA</span>
                <span className="rounded-full border border-blue-400/30 bg-blue-500/10 px-2 py-1 text-[9px] font-bold text-blue-300 transition-colors group-hover:bg-blue-500/20">BYOROSHYE</span>
              </div>
            </div>
            <button onClick={() => navigate("/ai-search")} className="mt-6 flex items-center gap-1 text-xs font-bold text-white hover:underline transition-colors group-hover:text-[#82bfd4]">
              Koresha AI <Icon name="arrow-right" size={12} className="transition-transform group-hover:translate-x-1" />
            </button>
          </div>

          {/* Card 3: Global Reach */}
          <div className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-sky-200 bg-sky-50 p-6 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl dark:border-white/10 dark:bg-sky-900/20">
            <div className="absolute top-4 right-4 h-20 w-20 opacity-20 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12">
              <Icon name="globe" size={80} className="text-sky-600 dark:text-sky-400" />
            </div>
            <div>
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-sky-600 shadow-sm dark:bg-white/10 dark:text-sky-400 transition-transform duration-500 group-hover:scale-110">
                <Icon name="users" size={32} />
              </div>
              <h4 className="mb-2 text-lg font-black text-sky-900 dark:text-sky-100">Ugere ku Isi</h4>
              <p className="text-xs font-medium leading-relaxed text-sky-800/80 dark:text-sky-200/70">
                Gurisha ibintu byawe ku isoko rikomeye. Huza n'abaguzi benshi mu Rwanda no hanze yarwo.
              </p>
            </div>
            <button onClick={() => navigate("/create-listing")} className="mt-6 flex items-center gap-1 text-xs font-bold text-sky-900 hover:underline dark:text-sky-100 transition-colors group-hover:text-sky-600 dark:group-hover:text-sky-300">
              Tangira ubu <Icon name="arrow-right" size={12} className="transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>

        {/* ── FULL RADIUS AUTH CTA (Kinyarwanda & High-End Design) ── */}
        <div className="mt-20 flex w-full flex-col items-center justify-center">
          <div className="w-full max-w-md rounded-[2.5rem] border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/50 dark:border-white/10 dark:bg-[#132433] dark:shadow-black/50 sm:p-10">
            
            <div className="text-center mb-8">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">Tangira ubu buryo bworoshye</h3>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Fungura konti yawe ku buntu, utangire kugura cyangwa kugurisha ibintu byawe aha.
              </p>
            </div>

            <div className="flex flex-col gap-4">
              {/* Injira - Using your classic deep blue, pill shape */}
              <button 
                onClick={() => navigate("/login")} 
                className="group relative flex w-full items-center justify-center overflow-hidden rounded-full border-2 border-[#2563eb] bg-transparent py-4 text-base font-bold text-[#2563eb] transition-all duration-300 hover:bg-[#2563eb] hover:text-white hover:shadow-lg hover:shadow-blue-500/30 active:scale-[0.98] dark:border-blue-500 dark:text-blue-400 dark:hover:bg-blue-500 dark:hover:text-white"
              >
                Injira
              </button>

              <div className="relative flex items-center py-2">
                <div className="flex-grow border-t border-slate-200 dark:border-white/10"></div>
                <span className="flex-shrink-0 px-4 text-xs font-bold text-slate-400 uppercase">cyangwa</span>
                <div className="flex-grow border-t border-slate-200 dark:border-white/10"></div>
              </div>

              {/* Kora Konti - Solid Deep Navy, pill shape */}
              <button 
                onClick={() => navigate("/register")} 
                className="group relative flex w-full items-center justify-center overflow-hidden rounded-full bg-[#102436] py-4 text-base font-bold text-white shadow-md transition-all duration-300 hover:bg-[#1a344d] hover:shadow-xl hover:shadow-slate-900/20 active:scale-[0.98] dark:bg-white dark:text-[#102436] dark:hover:bg-slate-200"
              >
                Kora Konti
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  )
}