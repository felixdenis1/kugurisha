import { useEffect, useMemo, useRef, useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import Header from "../components/Header"
import { supabase } from "../services/supabase"
import SellCTA from "../components/SellCTA"
import HomeFooter from "../components/HomeFooter"

type Listing = {
  id: string
  title: string
  description: string | null
  price: number | null
  currency: string
  condition: string | null
  listing_type: string
  created_at: string
  category: {
    name: string
  } | null
  location: {
    province: string
    district: string | null
    sector: string | null
  } | null
}

type ListingImage = {
  listing_id: string
  image_url: string
}

type IconName =
  | "search"
  | "bell"
  | "user"
  | "store"
  | "heart"
  | "message"
  | "settings"
  | "logout"
  | "menu"
  | "close"
  | "arrow-right"
  | "grid"
  | "map-pin"
  | "tag"
  | "spark"
  | "check"
  | "shield"
  | "users"
  | "plus"
  | "shopping-bag"
  | "chevron-down"
  | "info"
  | "refresh"

function Icon({
  name,
  size = 18,
  strokeWidth = 1.8,
  className,
}: {
  name: IconName
  size?: number
  strokeWidth?: number
  className?: string
}) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
    "aria-hidden": true,
  }

  switch (name) {
    case "search":
      return (
        <svg {...common}>
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-4-4" />
        </svg>
      )

    case "bell":
      return (
        <svg {...common}>
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
          <path d="M10 21h4" />
        </svg>
      )

    case "user":
      return (
        <svg {...common}>
          <circle cx="12" cy="8" r="3.5" />
          <path d="M5 20a7 7 0 0 1 14 0" />
        </svg>
      )

    case "store":
      return (
        <svg {...common}>
          <path d="M4 10v9h16v-9" />
          <path d="M3 10 5 4h14l2 6" />
          <path d="M3 10a3 3 0 0 0 5 0 3 3 0 0 0 5 0 3 3 0 0 0 3 0" />
          <path d="M9 19v-5h6v5" />
        </svg>
      )

    case "heart":
      return (
        <svg {...common}>
          <path d="M20.8 8.8c0 5-8.8 10.2-8.8 10.2S3.2 13.8 3.2 8.8A4.8 4.8 0 0 1 12 6.2a4.8 4.8 0 0 1 8.8 2.6Z" />
        </svg>
      )

    case "message":
      return (
        <svg {...common}>
          <path d="M20 11.5a7 7 0 0 1-7.5 7H8l-4 2v-5.2a7 7 0 1 1 16-3.8Z" />
        </svg>
      )

    case "settings":
      return (
        <svg {...common}>
          <path d="M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4Z" />
          <path d="m19.4 15 .1.1a2 2 0 0 1-2.8 2.8l-.1-.1a2 2 0 0 0-3.4 1.4v.2a2 2 0 0 1-4 0v-.2a2 2 0 0 0-3.4-1.4l-.1.1A2 2 0 0 1 3 15.1l.1-.1a2 2 0 0 0-1.4-3.4h-.2a2 2 0 0 1 0-4h.2A2 2 0 0 0 3.1 4.2L3 4.1a2 2 0 0 1 2.8-2.8l.1.1a2 2 0 0 0 3.4-1.4V0" />
        </svg>
      )

    case "logout":
      return (
        <svg {...common}>
          <path d="M10 17l5-5-5-5" />
          <path d="M15 12H3" />
          <path d="M14 4h5v16h-5" />
        </svg>
      )

    case "menu":
      return (
        <svg {...common}>
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      )

    case "close":
      return (
        <svg {...common}>
          <path d="m6 6 12 12M18 6 6 18" />
        </svg>
      )

    case "arrow-right":
      return (
        <svg {...common}>
          <path d="M5 12h14" />
          <path d="m13 6 6 6-6 6" />
        </svg>
      )

    case "grid":
      return (
        <svg {...common}>
          <rect x="4" y="4" width="6" height="6" rx="1" />
          <rect x="14" y="4" width="6" height="6" rx="1" />
          <rect x="4" y="14" width="6" height="6" rx="1" />
          <rect x="14" y="14" width="6" height="6" rx="1" />
        </svg>
      )

    case "map-pin":
      return (
        <svg {...common}>
          <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
          <circle cx="12" cy="10" r="2.5" />
        </svg>
      )

    case "tag":
      return (
        <svg {...common}>
          <path d="M20 13 13 20 4 11V4h7l9 9Z" />
          <circle cx="8" cy="8" r="1" />
        </svg>
      )

    case "spark":
      return (
        <svg {...common}>
          <path d="m12 3 1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5L12 3Z" />
          <path d="m19 16 .7 2.3L22 19l-2.3.7L19 22l-.7-2.3L16 19l2.3-.7L19 16Z" />
        </svg>
      )

    case "check":
      return (
        <svg {...common}>
          <path d="m5 12 4 4L19 6" />
        </svg>
      )

    case "shield":
      return (
        <svg {...common}>
          <path d="M12 21s8-3.5 8-10V5l-8-3-8 3v6c0 6.5 8 10 8 10Z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      )

    case "users":
      return (
        <svg {...common}>
          <circle cx="9" cy="8" r="3" />
          <path d="M3 20a6 6 0 0 1 12 0" />
          <path d="M16 5a3 3 0 0 1 0 6M18 20a5 5 0 0 0-3-4.6" />
        </svg>
      )

    case "plus":
      return (
        <svg {...common}>
          <path d="M12 5v14M5 12h14" />
        </svg>
      )

    case "shopping-bag":
      return (
        <svg {...common}>
          <path d="M5 8h14l-1 12H6L5 8Z" />
          <path d="M9 8a3 3 0 0 1 6 0" />
        </svg>
      )

    case "chevron-down":
      return (
        <svg {...common}>
          <path d="m6 9 6 6 6-6" />
        </svg>
      )

    case "info":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 11v5M12 8h.01" />
        </svg>
      )

    case "refresh":
      return (
        <svg {...common}>
          <path d="M20 11a8 8 0 1 0 2 5" />
          <path d="M20 5v6h-6" />
        </svg>
      )

    default:
      return null
  }
}

export default function Home() {
  const [listings, setListings] = useState<Listing[]>([])
  const [images, setImages] = useState<Record<string, string>>({})

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchParams] = useSearchParams()
  const [search, setSearch] = useState(() => searchParams.get("category") ?? "")
  const [showSplash, setShowSplash] = useState(true)

  const [userId, setUserId] = useState<string | null>(null)
  const sliderRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    let active = true
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user.id ?? null)
    })

    void supabase.auth.getUser().then(({ data: { user } }) => {
      if (active) setUserId(user?.id ?? null)
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    loadHome()
  }, [])

  useEffect(() => {
    if (!userId) return

    const channel = supabase
      .channel(`home-notifications-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        () => {
          void loadUnreadCount(userId)
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        () => {
          void loadUnreadCount(userId)
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId])

  async function loadUnreadCount(id: string) {
    const { count, error } = await supabase
      .from("notifications")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq("user_id", id)
      .eq("is_read", false)

    if (error) {
      console.error("Unread notification error:", error)
      return 0
    }

    return count || 0
  }

  async function loadHome() {
    try {
      setLoading(true)
      setError("")

      const {
        data: listingData,
        error: listingError,
      } = await supabase
        .from("listings")
        .select(`
          id,
          title,
          description,
          price,
          currency,
          condition,
          listing_type,
          created_at,
          category:categories (
            name
          ),
          location:locations (
            province,
            district,
            sector
          )
        `)
        .eq("status", "active")
        .order("created_at", {
          ascending: false,
        })
        .limit(20)

      if (listingError) {
        console.error(listingError)
        setError(listingError.message)
        return
      }

      const loadedListings: Listing[] = (listingData || []).map(
        (listing: any) => ({
          ...listing,
          category: Array.isArray(listing.category)
            ? listing.category[0] ?? null
            : listing.category ?? null,
          location: Array.isArray(listing.location)
            ? listing.location[0] ?? null
            : listing.location ?? null,
        }),
      )

      setListings(loadedListings)

      if (loadedListings.length > 0) {
        const listingIds = loadedListings.map(
          (listing) => listing.id,
        )

        const {
          data: imageData,
          error: imageError,
        } = await supabase
          .from("listing_images")
          .select("listing_id, image_url")
          .in("listing_id", listingIds)
          .order("sort_order", {
            ascending: true,
          })

        if (imageError) {
          console.error(imageError)
        } else {
          const imageMap: Record<string, string> = {}

          ;(imageData || []).forEach(
            (image: ListingImage) => {
              if (!imageMap[image.listing_id]) {
                imageMap[image.listing_id] = image.image_url
              }
            },
          )

          setImages(imageMap)
        }
      }
    } catch (err) {
      console.error(err)
      setError("Habaye ikibazo mu kuzana amakuru.")
    } finally {
      setLoading(false)
      window.setTimeout(() => setShowSplash(false), 650)
    }
  }

  function formatPrice(listing: Listing) {
    if (listing.listing_type === "free") {
      return "Ubuntu"
    }

    if (
      listing.price === null ||
      listing.price === undefined
    ) {
      return "Twandikire ku giciro"
    }

    return `${Number(listing.price).toLocaleString("en-US")} Frw`
  }

  function formatLocation(listing: Listing) {
    if (!listing.location) {
      return "Rwanda"
    }

    return [
      listing.location.sector,
      listing.location.district,
      listing.location.province,
    ]
      .filter(Boolean)
      .join(", ")
  }

  const filteredListings = useMemo(() => {
    const query = search.toLowerCase().trim()

    if (!query) {
      return listings
    }

    return listings.filter((listing) => {
      return (
        listing.title.toLowerCase().includes(query) ||
        listing.description?.toLowerCase().includes(query) ||
        listing.category?.name.toLowerCase().includes(query) ||
        formatLocation(listing).toLowerCase().includes(query)
      )
    })
  }, [listings, search])

  useEffect(() => {
    const slider = sliderRef.current
    if (!slider || loading || filteredListings.length < 2) return

    let paused = false
    const pause = () => { paused = true }
    const resume = () => { paused = false }

    slider.addEventListener("mouseenter", pause)
    slider.addEventListener("mouseleave", resume)
    slider.addEventListener("touchstart", pause, { passive: true })
    slider.addEventListener("touchend", resume, { passive: true })

    const timer = window.setInterval(() => {
      if (paused) return
      const atEnd = slider.scrollLeft + slider.clientWidth >= slider.scrollWidth - 12
      slider.scrollTo({
        left: atEnd ? 0 : slider.scrollLeft + 270,
        behavior: "smooth",
      })
    }, 3800)

    return () => {
      window.clearInterval(timer)
      slider.removeEventListener("mouseenter", pause)
      slider.removeEventListener("mouseleave", resume)
      slider.removeEventListener("touchstart", pause)
      slider.removeEventListener("touchend", resume)
    }
  }, [loading, filteredListings.length])

  function scrollToListings() {
    document
      .getElementById("all-listings")
      ?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      })
  }

  return (
    <main className="min-h-screen overflow-x-hidden kg-bg kg-text transition-colors duration-300">
      <style>{`
        @keyframes kug-float { 0%,100% { transform: translate3d(0,0,0) } 50% { transform: translate3d(0,-8px,0) } }
        @keyframes kug-glow { 0%,100% { opacity:.35; transform:scale(.95) } 50% { opacity:.7; transform:scale(1.05) } }
        @keyframes kug-marquee { from { transform:translateX(0) } to { transform:translateX(-50%) } }
        @keyframes kug-loader { 0% { transform:translateX(-110%) } 100% { transform:translateX(260%) } }
        @keyframes kug-reveal { from { opacity:0; transform:translateY(16px) scale(.98) } to { opacity:1; transform:translateY(0) scale(1) } }
        .kug-marquee-track { animation:kug-marquee 32s linear infinite }
        .kug-marquee:hover .kug-marquee-track { animation-play-state:paused }
        .kug-float { animation:kug-float 6s ease-in-out infinite }
        .kug-glow { animation:kug-glow 4.5s ease-in-out infinite }
        .kug-reveal { animation:kug-reveal .65s cubic-bezier(.16,1,.3,1) both }
        @media (prefers-reduced-motion: reduce) { .kug-marquee-track,.kug-float,.kug-glow,.kug-reveal { animation:none !important } }
      `}</style>

      {showSplash && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden kg-bg transition-opacity duration-700" role="status" aria-label="KUGURISHA irimo gufunguka">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(16,185,129,0.12),transparent_40%),radial-gradient(circle_at_75%_75%,rgba(5,150,105,0.1),transparent_40%)]" />
          <div className="kug-glow absolute h-72 w-72 rounded-full bg-emerald-500/20 blur-3xl sm:h-96 sm:w-96" />
          <div className="kug-reveal relative flex flex-col items-center px-6 text-center">
            <div className="mb-6 flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-slate-500/10 via-emerald-600/15 to-emerald-800/20 p-2 border border-emerald-500/40 shadow-xl sm:h-36 sm:w-36">
              <img src="/favicon.svg" alt="" className="h-full w-full object-contain rounded-full bg-transparent transition-transform duration-300 hover:scale-105" />
            </div>
            <div className="text-3xl font-black tracking-[-0.07em] sm:text-5xl bg-gradient-to-r from-slate-500 via-emerald-700 to-emerald-900 dark:from-slate-300 dark:via-emerald-400 dark:to-emerald-500 bg-clip-text text-transparent">
              KUGURISHA
            </div>
            <p className="mt-2.5 text-[11px] font-black uppercase tracking-[0.3em] text-emerald-700 dark:text-emerald-400">Isoko ryawe ryo mu Rwanda</p>
            <div className="mt-8 h-1.5 w-48 overflow-hidden rounded-full kg-bg-secondary sm:w-56">
              <div className="h-full w-2/5 rounded-full bg-gradient-to-r from-slate-500 via-emerald-600 to-emerald-800 shadow-[0_0_12px_rgba(16,185,129,0.8)]" style={{ animation: "kug-loader 1.1s cubic-bezier(0.4,0,0.2,1) infinite" }} />
            </div>
            <p className="mt-3.5 text-xs font-semibold kg-text-muted">Turimo gutegura isoko ryawe...</p>
          </div>
        </div>
      )}

      <Header
        searchValue={search}
        onSearchChange={setSearch}
        onSearchSubmit={() => {
          scrollToListings()
        }}
      />

      {/* BRAND RIBBON */}
      <div className="kug-marquee relative overflow-hidden border-y kg-border kg-surface py-3 backdrop-blur-2xl shadow-sm" aria-label="KUGURISHA marketplace highlights">
        <div className="kug-marquee-track flex w-max items-center gap-10 whitespace-nowrap text-[10px] font-black uppercase tracking-[0.25em] kg-text-secondary sm:text-[11px]">
          {Array.from({ length: 4 }).map((_, i) => (
            <span key={i} className="flex items-center gap-10">
              <span className="bg-gradient-to-r from-slate-500 via-emerald-700 to-emerald-900 dark:from-slate-300 dark:via-emerald-400 dark:to-emerald-500 bg-clip-text text-transparent font-black">KUGURISHA</span>
              <span>Isoko ryawe ryo mu Rwanda</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">Gura. Gurisha. Bihuze.</span>
              <span className="text-slate-400">✦</span>
            </span>
          ))}
        </div>
      </div>

      {/* HOME PAGE BRAND LOGO SECTION (Placed right under header/ribbon, above hero content) */}
      <section className="relative pt-6 pb-2 px-4 sm:px-6 max-w-7xl mx-auto">
        <Link
          to="/"
          className="group relative inline-flex items-center gap-4 rounded-3xl border kg-border kg-surface px-6 py-4 shadow-sm backdrop-blur-2xl transition-all duration-300 hover:scale-[1.02] hover:border-emerald-500/50 hover:shadow-[0_10px_30px_-10px_rgba(16,185,129,0.2)]"
        >
          {/* Enlarged Circular Professional Logo Mark */}
          <div className="relative flex h-16 w-16 sm:h-20 sm:w-20 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-slate-500/10 via-emerald-600/15 to-emerald-800/20 p-2 border border-emerald-500/35 transition-all duration-500 group-hover:scale-105 group-hover:border-emerald-500/70 group-hover:shadow-[0_0_30px_rgba(16,185,129,0.4)]">
            <img
              src="/favicon.svg"
              alt="KUGURISHA Logo"
              className="h-full w-full object-contain rounded-full bg-transparent transition-transform duration-500 group-hover:rotate-6"
            />
            {/* Live status ping */}
            <span className="absolute right-1 top-1 flex h-4 w-4">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-4 w-4 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900" />
            </span>
          </div>

          {/* Unified Brand Typography */}
          <div className="flex flex-col justify-center">
            <span className="text-3xl sm:text-4xl font-black tracking-[-0.07em] leading-none bg-gradient-to-r from-slate-500 via-emerald-700 to-emerald-900 dark:from-slate-300 dark:via-emerald-400 dark:to-emerald-500 bg-clip-text text-transparent transition-all duration-300 group-hover:brightness-110">
              KUGURISHA
            </span>
            <span className="mt-1 text-[10px] sm:text-xs font-black tracking-[0.3em] text-emerald-700 dark:text-emerald-400 uppercase opacity-95">
              Isoko ryawe ryo mu Rwanda
            </span>
          </div>
        </Link>
      </section>

      {/* HERO + LISTINGS SLIDER SECTION */}
      <section
        id="listings"
        className="relative overflow-hidden kg-bg py-8 sm:py-12"
      >
        <div className="pointer-events-none absolute -left-20 top-1/4 h-96 w-96 rounded-full bg-slate-500/10 blur-[120px]" />
        <div className="pointer-events-none absolute -right-20 bottom-10 h-96 w-96 rounded-full bg-emerald-500/15 blur-[130px]" />
        <div className="pointer-events-none absolute left-1/2 top-10 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-emerald-600/10 blur-[150px]" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid items-stretch gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:gap-8">

            {/* LEFT CONTAINER: Hero Intro */}
            <div className="kug-reveal relative flex flex-col justify-between overflow-hidden rounded-[2.2rem] border kg-border kg-surface p-7 sm:p-9 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.07)] backdrop-blur-3xl">
              <div>
                <div className="inline-flex items-center gap-2.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-[11px] font-black uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-400 shadow-sm backdrop-blur-md">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-emerald-600 to-emerald-800 text-white shadow-sm">
                    <Icon name="check" size={11} strokeWidth={3} />
                  </span>
                  Isoko ryawe ryo mu Rwanda
                </div>

                <h1 className="mt-6 text-4xl font-black leading-[1.06] tracking-[-0.05em] kg-text sm:text-5xl lg:text-[52px]">
                  Gura icyo ushaka.
                  <br />
                  <span className="bg-gradient-to-r from-slate-500 via-emerald-700 to-emerald-900 dark:from-slate-300 dark:via-emerald-400 dark:to-emerald-500 bg-clip-text text-transparent">
                    Gurisha icyo ufite.
                  </span>
                </h1>

                <p className="mt-5 text-sm leading-relaxed kg-text-secondary sm:text-base font-medium">
                  KUGURISHA.COM ni urubuga ruhuza abaguzi n'abagurisha mu Rwanda, ahantu hamwe kandi mu buryo bworoshye.
                </p>

                <div className="mt-8 flex flex-wrap items-center gap-3.5">
                  <Link
                    to="/create-listing"
                    className="group relative inline-flex items-center gap-2.5 overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-700 to-emerald-900 px-6 py-3.5 text-sm font-black text-white shadow-[0_14px_30px_-10px_rgba(16,185,129,0.5)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_35px_-8px_rgba(16,185,129,0.7)]"
                  >
                    <Icon name="plus" size={17} strokeWidth={2.5} />
                    <span>Gurisha</span>
                  </Link>

                  <Link
                    to="/ai-search"
                    className="group flex items-center gap-2.5 rounded-2xl border kg-border kg-surface px-6 py-3.5 text-sm font-bold text-emerald-700 dark:text-emerald-400 shadow-sm backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-500/40 hover:bg-emerald-500/10"
                  >
                    <Icon name="spark" size={17} />
                    <span>Baza AI</span>
                  </Link>
                </div>
              </div>

              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 border-t kg-border pt-6 text-xs font-semibold kg-text-muted">
                <span className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
                    <Icon name="shield" size={13} strokeWidth={2.2} />
                  </span>
                  Byoroshye gukoresha
                </span>
                <span className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-600/10 text-emerald-700">
                    <Icon name="users" size={13} strokeWidth={2.2} />
                  </span>
                  Abaguzi n'abagurisha
                </span>
                <span className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-slate-500/10 text-slate-600 dark:text-slate-300">
                    <Icon name="map-pin" size={13} strokeWidth={2.2} />
                  </span>
                  Mu Rwanda
                </span>
              </div>
            </div>

            {/* RIGHT CONTAINER: Slider Container */}
            <div className="kug-float relative flex flex-col justify-between overflow-hidden rounded-[2.2rem] border kg-border kg-surface p-7 sm:p-9 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.07)] backdrop-blur-3xl min-w-0">
              <div className="mb-5 flex items-end justify-between gap-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">
                    Kugezweho
                  </p>
                  <h2 className="mt-1 text-2xl font-black tracking-[-0.03em] kg-text sm:text-3xl">
                    Ibicuruzwa bishya
                  </h2>
                </div>
                <span className="hidden text-xs font-bold kg-text-muted sm:block">
                  Reba ibiri ku isoko →
                </span>
              </div>

              {loading ? (
                <div className="flex gap-4 overflow-hidden py-2">
                  {[1, 2].map((item) => (
                    <div key={item} className="w-[245px] shrink-0 overflow-hidden rounded-[1.75rem] border kg-border kg-surface p-2 shadow-sm">
                      <div className="h-44 animate-pulse rounded-2xl kg-bg-secondary" />
                      <div className="space-y-3 p-4">
                        <div className="h-4 animate-pulse rounded-lg kg-bg-secondary" />
                        <div className="h-4 w-2/3 animate-pulse rounded-lg kg-bg-secondary" />
                        <div className="h-3 w-1/2 animate-pulse rounded-lg kg-bg-secondary" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredListings.length > 0 ? (
                <div 
                  ref={sliderRef}
                  className="kug-listing-slider flex snap-x gap-4 overflow-x-auto py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                >
                  {filteredListings.slice(0, 8).map((listing) => (
                    <Link
                      key={listing.id}
                      to={`/listing/${listing.id}`}
                      className="group relative w-[235px] shrink-0 snap-start overflow-hidden rounded-[1.75rem] border kg-border kg-surface p-2.5 transition-all duration-300 hover:-translate-y-1.5 hover:border-emerald-500/40 hover:shadow-[0_20px_45px_-15px_rgba(16,185,129,0.25)] sm:w-[255px]"
                    >
                      <div className="relative h-44 overflow-hidden rounded-2xl kg-bg-secondary">
                        {images[listing.id] ? (
                          <img src={images[listing.id]} alt={listing.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                        ) : (
                          <div className="flex h-full items-center justify-center kg-bg-secondary">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl kg-surface kg-text-muted shadow-sm border kg-border">
                              <Icon name="shopping-bag" size={24} />
                            </div>
                          </div>
                        )}
                        <div className="absolute left-3 top-3 rounded-full border border-white/20 bg-black/40 px-3 py-1 text-[9px] font-black text-white shadow-md backdrop-blur-xl">
                          {listing.category?.name || "Ibindi"}
                        </div>
                      </div>

                      <div className="p-3.5">
                        <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-black leading-5 kg-text transition-colors group-hover:text-emerald-600">
                          {listing.title}
                        </h3>
                        <p className="mt-2 bg-gradient-to-r from-slate-500 via-emerald-700 to-emerald-900 dark:from-slate-300 dark:via-emerald-400 dark:to-emerald-500 bg-clip-text text-base font-black text-transparent">
                          {formatPrice(listing)}
                        </p>
                        <p className="mt-2 flex items-center gap-1.5 truncate text-[11px] font-semibold kg-text-secondary">
                          <Icon name="map-pin" size={13} className="text-emerald-600 shrink-0" />
                          {formatLocation(listing)}
                        </p>
                        <div className="mt-3.5 flex items-center justify-between border-t kg-border pt-3">
                          <span className="text-[10px] font-bold kg-text-muted">
                            Reba ibisobanuro
                          </span>
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 transition-transform duration-300 group-hover:translate-x-1 group-hover:bg-emerald-600 group-hover:text-white">
                            <Icon name="arrow-right" size={13} />
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="flex min-h-[300px] items-center justify-center rounded-[1.75rem] border kg-border kg-surface p-8 text-center shadow-inner backdrop-blur-xl">
                  <div>
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl kg-bg-secondary kg-text-muted shadow-inner">
                      <Icon name="search" size={26} />
                    </div>
                    <h3 className="mt-4 text-base font-black kg-text">
                      Nta bicuruzwa bihari
                    </h3>
                    <p className="mt-1 text-xs kg-text-secondary">
                      Gerageza irindi jambo ryo gushakisha.
                    </p>
                    {search && (
                      <button type="button" onClick={() => setSearch("")} className="mt-5 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-black text-white shadow-md transition hover:bg-emerald-700">
                        Reba byose
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* ALL LISTINGS / SEARCH RESULTS */}
      <section
        id="all-listings"
        className="relative overflow-hidden border-y kg-border kg-bg-secondary py-16 sm:py-24"
      >
        <div className="pointer-events-none absolute -left-40 top-20 h-96 w-96 rounded-full bg-slate-500/[0.04] blur-[130px]" />
        <div className="pointer-events-none absolute -right-40 bottom-10 h-[450px] w-[450px] rounded-full bg-emerald-400/[0.04] blur-[150px]" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">
                Ku isoko ubu
              </p>
              <h2 className="mt-2 text-3xl font-black tracking-[-0.04em] kg-text sm:text-4xl">
                Ibicuruzwa byose
              </h2>
              {search && (
                <p className="mt-2 text-sm kg-text-secondary">
                  Ibisubizo bya:{" "}
                  <span className="font-bold kg-text bg-emerald-500/10 px-2 py-0.5 rounded-md text-emerald-600">{search}</span>
                </p>
              )}
            </div>

            {search && (
              <button type="button" onClick={() => setSearch("")} className="flex items-center gap-2 self-start rounded-xl border kg-border kg-surface px-4.5 py-2.5 text-sm font-bold kg-text-secondary shadow-sm backdrop-blur-2xl transition hover:-translate-y-0.5 hover:text-emerald-600 sm:self-auto">
                <Icon name="close" size={15} />
                Siba search
              </button>
            )}
          </div>

          {loading && (
            <div className="grid gap-6 pt-10 sm:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="overflow-hidden rounded-[1.8rem] border kg-border kg-surface shadow-sm backdrop-blur-2xl">
                  <div className="h-60 animate-pulse kg-bg-secondary" />
                  <div className="space-y-3.5 p-6">
                    <div className="h-5 animate-pulse rounded-xl kg-bg-secondary" />
                    <div className="h-5 w-2/3 animate-pulse rounded-xl kg-bg-secondary" />
                    <div className="h-4 w-1/2 animate-pulse rounded-xl kg-bg-secondary" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {error && !loading && (
            <div className="mt-10 rounded-[1.8rem] border border-red-500/25 bg-red-500/10 p-8 backdrop-blur-2xl shadow-lg">
              <div className="flex items-start gap-3.5">
                <div className="mt-0.5 text-red-500">
                  <Icon name="info" size={20} />
                </div>
                <div>
                  <h3 className="text-base font-black text-red-600 dark:text-red-400">
                    Habaye ikibazo
                  </h3>
                  <p className="mt-1 text-sm font-medium text-red-500 dark:text-red-300">
                    {error}
                  </p>
                  <button
                    type="button"
                    onClick={() => void loadHome()}
                    className="mt-4 flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-xs font-black text-white shadow-md transition hover:bg-red-700"
                  >
                    <Icon name="refresh" size={14} />
                    Ongera ugerageze
                  </button>
                </div>
              </div>
            </div>
          )}

          {!loading && !error && filteredListings.length === 0 && (
            <div className="mt-10 flex min-h-[350px] flex-col items-center justify-center rounded-[2.2rem] border kg-border kg-surface p-12 text-center shadow-sm backdrop-blur-3xl">
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl kg-bg-secondary kg-text-muted shadow-inner">
                <Icon name="shopping-bag" size={32} />
              </div>
              <h3 className="mt-6 text-xl font-black kg-text">
                Nta bicuruzwa bihagaze
              </h3>
              <p className="mt-2 max-w-md text-sm font-medium kg-text-secondary">
                Nta gicuruzwa cyaguye ku shakishe yawe. Subira inyuma cyangwa ushyireho igicuruzwa gishya!
              </p>
              {search ? (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="mt-6 rounded-xl bg-emerald-600 px-5 py-3 text-xs font-black text-white shadow-md transition hover:bg-emerald-700"
                >
                  Reba ibicuruzwa byose
                </button>
              ) : (
                <Link
                  to="/create-listing"
                  className="mt-6 rounded-xl bg-emerald-600 px-5 py-3 text-xs font-black text-white shadow-md transition hover:bg-emerald-700"
                >
                  Gurisha icyo ufite ubu
                </Link>
              )}
            </div>
          )}

          {!loading && !error && filteredListings.length > 0 && (
            <div className="grid gap-6 pt-10 sm:grid-cols-2 lg:grid-cols-4">
              {filteredListings.map((listing) => (
                <Link
                  key={listing.id}
                  to={`/listing/${listing.id}`}
                  className="group relative overflow-hidden rounded-[1.8rem] border kg-border kg-surface p-3 transition-all duration-300 hover:-translate-y-1.5 hover:border-emerald-500/40 hover:shadow-[0_20px_45px_-15px_rgba(16,185,129,0.2)] backdrop-blur-2xl"
                >
                  <div className="relative h-60 overflow-hidden rounded-2xl kg-bg-secondary">
                    {images[listing.id] ? (
                      <img src={images[listing.id]} alt={listing.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    ) : (
                      <div className="flex h-full items-center justify-center kg-bg-secondary">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl kg-surface kg-text-muted shadow-sm border kg-border">
                          <Icon name="shopping-bag" size={28} />
                        </div>
                      </div>
                    )}
                    <div className="absolute left-3.5 top-3.5 rounded-full border border-white/20 bg-black/40 px-3.5 py-1 text-[10px] font-black text-white shadow-md backdrop-blur-xl">
                      {listing.category?.name || "Ibindi"}
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="line-clamp-2 min-h-[2.75rem] text-sm font-black leading-5 kg-text transition-colors group-hover:text-emerald-600">
                      {listing.title}
                    </h3>
                    <p className="mt-3 bg-gradient-to-r from-slate-500 via-emerald-700 to-emerald-900 dark:from-slate-300 dark:via-emerald-400 dark:to-emerald-500 bg-clip-text text-lg font-black text-transparent">
                      {formatPrice(listing)}
                    </p>
                    <p className="mt-2.5 flex items-center gap-1.5 truncate text-xs font-semibold kg-text-secondary">
                      <Icon name="map-pin" size={14} className="text-emerald-600 shrink-0" />
                      {formatLocation(listing)}
                    </p>
                    <div className="mt-4 flex items-center justify-between border-t kg-border pt-3.5">
                      <span className="text-[11px] font-bold kg-text-muted">
                        Reba ibisobanuro
                      </span>
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 transition-transform duration-300 group-hover:translate-x-1 group-hover:bg-emerald-600 group-hover:text-white">
                        <Icon name="arrow-right" size={14} />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <SellCTA />
      <HomeFooter />
    </main>
  )
}