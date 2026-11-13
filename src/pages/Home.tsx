import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { useNavigate } from "react-router-dom"
import HomeStory from "../components/HomeStory"
import MovingStory from "../components/MovingStory"
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
  category: { name: string } | null
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

type HomeStats = {
  users: number
  sellers: number
  listings: number
  sold: number
}

type IconName =
  | "search"
  | "check"
  | "plus"
  | "spark"
  | "shield"
  | "users"
  | "shop"
  | "map-pin"
  | "shopping-bag"
  | "arrow-right"
  | "tag"
  | "refresh"
  | "chevron-right"
  | "message"
  | "clock"
  | "heart"
  | "zap"
  | "flame"
  | "activity"

/* ──────────────────────────────────────────────────────────────────────────
   MODULE-LEVEL CACHE — persists across component remounts
   ────────────────────────────────────────────────────────────────────────── */
type HomeCache = {
  loaded: boolean
  listings: Listing[]
  images: Record<string, string>
}

const homeCache: HomeCache = {
  loaded: false,
  listings: [],
  images: {},
}

const SESSION_KEYS = {
  splashShown: "kugurisha_home_splash_shown",
  search: "kugurisha_home_search",
  scroll: "kugurisha_home_scroll",
}

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
    case "check":
      return <svg {...common}><path d="m5 12 4 4L19 6" /></svg>
    case "plus":
      return <svg {...common}><path d="M12 5v14M5 12h14" /></svg>
    case "spark":
      return <svg {...common}><path d="m12 3 1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5L12 3Z" /><path d="m19 16 .7 2.3L22 19l-2.3.7L19 22l-.7-2.3L16 19l2.3-.7L19 16Z" /></svg>
    case "shield":
      return <svg {...common}><path d="M12 21s8-3.5 8-10V5l-8-3-8 3v6c0 6.5 8 10 8 10Z" /><path d="m9 12 2 2 4-4" /></svg>
    case "users":
      return <svg {...common}><circle cx="9" cy="8" r="3" /><path d="M3 20a6 6 0 0 1 12 0M16 5a3 3 0 0 1 0 6M18 20a5 5 0 0 0-3-4.6" /></svg>
    case "shop":
      return <svg {...common}><path d="M3 10h18l-2-6H5l-2 6Z" /><path d="M5 10v10h14V10M9 20v-6h6v6" /><path d="M3 10a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0" /></svg>
    case "map-pin":
      return <svg {...common}><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></svg>
    case "shopping-bag":
      return <svg {...common}><path d="M5 8h14l-1 12H6L5 8Z" /><path d="M9 8a3 3 0 0 1 6 0" /></svg>
    case "arrow-right":
      return <svg {...common}><path d="M5 12h14m-6-6 6 6-6 6" /></svg>
    case "tag":
      return <svg {...common}><path d="M20 13 13 20 4 11V4h7l9 9Z" /><circle cx="8" cy="8" r="1" /></svg>
    case "refresh":
      return <svg {...common}><path d="M20 11a8 8 0 1 0 2 5" /><path d="M20 5v6h-6" /></svg>
    case "chevron-right":
      return <svg {...common}><path d="m9 18 6-6-6-6" /></svg>
    case "message":
      return <svg {...common}><path d="M21 11.5a8.5 8.5 0 0 1-9 8.5 9.5 9.5 0 0 1-4-.9L3 21l1.9-4.5A8.5 8.5 0 1 1 21 11.5Z" /></svg>
    case "clock":
      return <svg {...common}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
    case "heart":
      return <svg {...common}><path d="M20.8 8.7c0 5.2-8.8 10.3-8.8 10.3S3.2 13.9 3.2 8.7A4.7 4.7 0 0 1 12 6.2a4.7 4.7 0 0 1 8.8 2.5Z" /></svg>
    case "zap":
      return <svg {...common}><path d="m13 2-3 9h7l-6 11 2-9H6l7-11Z" /></svg>
    default:
      return null
  }
}

const initialStats: HomeStats = {
  users: 0,
  sellers: 0,
  listings: 0,
  sold: 0,
}

function formatPrice(listing: Listing) {
  if (listing.listing_type === "free") return "Ubuntu"
  if (listing.price === null || listing.price === undefined) {
    return "Twandikire ku giciro"
  }
  return `${Number(listing.price).toLocaleString("en-US")} Frw`
}

function formatLocation(listing: Listing) {
  if (!listing.location) return "Rwanda"

  return [
    listing.location.sector,
    listing.location.district,
    listing.location.province,
  ].filter(Boolean).join(", ")
}

export default function Home() {
  // Restore cached listings instantly if we've already loaded once
  const [listings, setListings] = useState<Listing[]>(homeCache.listings)
  const [images, setImages] = useState<Record<string, string>>(homeCache.images)
  const navigate = useNavigate()
  const [, setStats] = useState<HomeStats>(initialStats)

  const [, setStatsLoading] = useState(true)

  // Start loading=false if cache is already warm — prevents flicker on back nav
  const [loading, setLoading] = useState(!homeCache.loaded)

  // Splash only plays once per session
  const [showSplash, setShowSplash] = useState(() => {
    try {
      return sessionStorage.getItem(SESSION_KEYS.splashShown) !== "1"
    } catch {
      return true
    }
  })

  const [searchParams] = useSearchParams()

  // Restore search from session so back nav keeps the filter
  const [search, setSearch] = useState(() => {
    const urlCategory = searchParams.get("category")
    if (urlCategory) return urlCategory
    try {
      return sessionStorage.getItem(SESSION_KEYS.search) ?? ""
    } catch {
      return ""
    }
  })

  const [userId, setUserId] = useState<string | null>(null)
  const sliderRef = useRef<HTMLDivElement | null>(null)

  const [showSellHeadline, setShowSellHeadline] = useState(true)

  /* Persist search to sessionStorage on change */
  useEffect(() => {
    try {
      sessionStorage.setItem(SESSION_KEYS.search, search)
    } catch {
      // ignore
    }
  }, [search])

  /* Restore scroll position on mount (once) */
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(SESSION_KEYS.scroll)
      if (saved) {
        const y = parseInt(saved, 10)
        if (!Number.isNaN(y) && y > 0) {
          requestAnimationFrame(() => window.scrollTo(0, y))
        }
      }
    } catch {
      // ignore
    }

    const saveScroll = () => {
      try {
        sessionStorage.setItem(SESSION_KEYS.scroll, String(window.scrollY))
      } catch {
        // ignore
      }
    }

    window.addEventListener("scroll", saveScroll, { passive: true })
    return () => window.removeEventListener("scroll", saveScroll)
  }, [])

  /* Rotating headline */
  useEffect(() => {
    const interval = setInterval(() => {
      setShowSellHeadline((prev) => !prev)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  /* AUTH */
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

  /* LOAD LISTINGS — skips network if cache is warm */
  const loadHome = useCallback(async () => {
    // If cache is already warm, restore instantly and skip the fetch
    if (homeCache.loaded) {
      setListings(homeCache.listings)
      setImages(homeCache.images)
      setLoading(false)
      setShowSplash(false)
      return
    }

    try {
      setLoading(true)

      const { data: listingData, error: listingError } = await supabase
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
          category:categories(name),
          location:locations(province, district, sector)
        `)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(20)

      if (listingError) throw listingError

      const loadedListings: Listing[] = (listingData || []).map((listing: any) => ({
        ...listing,
        category: Array.isArray(listing.category) ? listing.category[0] ?? null : listing.category ?? null,
        location: Array.isArray(listing.location) ? listing.location[0] ?? null : listing.location ?? null,
      }))

      const imageMap: Record<string, string> = {}

      const listingIds = loadedListings.map((listing) => listing.id)
      if (listingIds.length > 0) {
        const { data: imageData, error: imageError } = await supabase
          .from("listing_images")
          .select("listing_id, image_url")
          .in("listing_id", listingIds)
          .order("sort_order", { ascending: true })

        if (imageError) throw imageError

        ;(imageData || []).forEach((image: ListingImage) => {
          if (!imageMap[image.listing_id]) imageMap[image.listing_id] = image.image_url
        })
      }

      // Populate cache
      homeCache.loaded = true
      homeCache.listings = loadedListings
      homeCache.images = imageMap

      setListings(loadedListings)
      setImages(imageMap)
    } catch (error) {
      console.error("KUGURISHA Home loading error:", error)
    } finally {
      setLoading(false)
      // Mark splash as shown for this session
      try {
        sessionStorage.setItem(SESSION_KEYS.splashShown, "1")
      } catch {
        // ignore
      }
      window.setTimeout(() => setShowSplash(false), 350)
    }
  }, [])

  /* LOAD CATEGORIES */
  const loadCategories = useCallback(async () => {
    const { error } = await supabase
      .from("categories")
      .select("id, name")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })

    if (error) {
      console.error("Categories loading error:", error)
    }
  }, [])

  /* LOAD STATS */
  const loadStats = useCallback(async () => {
    try {
      setStatsLoading(true)

      const [usersResult, listingsResult, soldResult, sellersResult] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }).eq("is_active", true),
        supabase.from("listings").select("id", { count: "exact", head: true }),
        supabase.from("listings").select("id", { count: "exact", head: true }).eq("status", "sold"),
        supabase.from("listings").select("seller_id").not("seller_id", "is", null),
      ])

      if (usersResult.error) throw usersResult.error
      if (listingsResult.error) throw listingsResult.error
      if (soldResult.error) throw soldResult.error
      if (sellersResult.error) throw sellersResult.error

      const uniqueSellers = new Set((sellersResult.data || []).map((item) => item.seller_id))

      setStats({
        users: usersResult.count || 0,
        sellers: uniqueSellers.size,
        listings: listingsResult.count || 0,
        sold: soldResult.count || 0,
      })
    } catch (error) {
      console.error("Statistics loading error:", error)
    } finally {
      setStatsLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadHome()
    void loadCategories()
    void loadStats()
  }, [loadHome, loadCategories, loadStats])

  /* UNREAD NOTIFICATIONS */
  useEffect(() => {
    if (!userId) return

    const loadUnreadCount = async () => {
      const { error } = await supabase
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("is_read", false)

      if (error) {
        console.error("Unread notification error:", error)
      }
    }

    void loadUnreadCount()

    const channel = supabase
      .channel(`home-notifications-${userId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${userId}` }, () => void loadUnreadCount())
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "notifications", filter: `user_id=eq.${userId}` }, () => void loadUnreadCount())
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [userId])

  /* SEARCH FILTER */
  const filteredListings = useMemo(() => {
    const query = search.toLowerCase().trim()
    if (!query) return listings

    return listings.filter((listing) => (
      listing.title.toLowerCase().includes(query) ||
      listing.description?.toLowerCase().includes(query) ||
      listing.category?.name.toLowerCase().includes(query) ||
      formatLocation(listing).toLowerCase().includes(query)
    ))
  }, [listings, search])

  /* SLIDER AUTOPLAY */
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
        left: atEnd ? 0 : slider.scrollLeft + 280,
        behavior: "smooth",
      })
    }, 4200)

    return () => {
      window.clearInterval(timer)
      slider.removeEventListener("mouseenter", pause)
      slider.removeEventListener("mouseleave", resume)
      slider.removeEventListener("touchstart", pause)
      slider.removeEventListener("touchend", resume)
    }
  }, [loading, filteredListings.length])

  return (
    <main className="min-h-screen overflow-x-clip bg-white text-slate-900 selection:bg-[#569ab5] selection:text-white dark:bg-[#080f1b] dark:text-slate-100">
      <style>{`
        @keyframes kug-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-9px); }
        }
        @keyframes kug-glow {
          0%, 100% { opacity: .35; transform: scale(.95); }
          50% { opacity: .75; transform: scale(1.08); }
        }
        @keyframes kug-loader {
          0% { transform: translateX(-110%); }
          100% { transform: translateX(260%); }
        }
        @keyframes kug-reveal {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes kug-shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .kug-float { animation: kug-float 6s ease-in-out infinite; }
        .kug-glow { animation: kug-glow 4.5s ease-in-out infinite; }
        .kug-reveal { animation: kug-reveal .7s cubic-bezier(.16,1,.3,1) both; }
        .kug-shimmer {
          background: linear-gradient(90deg,rgba(148,163,184,.10),rgba(148,163,184,.25),rgba(148,163,184,.10));
          background-size: 200% 100%;
          animation: kug-shimmer 1.6s linear infinite;
        }
        .kug-slider-fade::before,.kug-slider-fade::after {
          content:""; position:absolute; top:0; bottom:0; width:28px; pointer-events:none; z-index:2;
        }
        .kug-slider-fade::before { left:0; background:linear-gradient(to right,#fff,transparent); }
        .kug-slider-fade::after { right:0; background:linear-gradient(to left,#fff,transparent); }
        .dark .kug-slider-fade::before { background:linear-gradient(to right,#080f1b,transparent); }
        .dark .kug-slider-fade::after { background:linear-gradient(to left,#080f1b,transparent); }
        @media(prefers-reduced-motion:reduce) {
          .kug-float,.kug-glow,.kug-reveal,.kug-shimmer { animation:none!important; }
        }
      `}</style>

      {/* SPLASH — only shows on first visit of the session */}
      {showSplash && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center overflow-hidden bg-white dark:bg-[#080f1b]"
          role="status"
          aria-label="KUGURISHA.COM irimo gufunguka"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(86,154,181,0.16),transparent_45%),radial-gradient(circle_at_75%_75%,rgba(66,124,148,0.12),transparent_45%)]" />
          <div className="kug-glow absolute h-80 w-80 rounded-full bg-[#569ab5]/25 blur-3xl" />

          <div className="kug-reveal relative flex flex-col items-center px-6 text-center">
            <img src="/favicon.svg" alt="KUGURISHA.COM" className="mb-6 h-28 w-28 object-contain sm:h-36 sm:w-36" />
            <div className="bg-gradient-to-r from-slate-700 via-[#569ab5] to-[#36677b] bg-clip-text text-3xl font-black tracking-[0.16em] text-transparent dark:from-slate-200 dark:via-[#83c2dc] dark:to-white sm:text-5xl">
              KUGURISHA
            </div>
            <p className="mt-3 text-[10px] font-black uppercase tracking-[0.3em] text-[#569ab5]">
              Isoko ryawe ryo mu Rwanda
            </p>
            <div className="mt-9 h-1.5 w-52 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
              <div
                className="h-full w-2/5 rounded-full bg-gradient-to-r from-slate-500 via-[#569ab5] to-[#36677b]"
                style={{ animation: "kug-loader 1.1s cubic-bezier(0.4,0,0.2,1) infinite" }}
              />
            </div>
            <p className="mt-4 text-xs font-semibold text-slate-500">
              Turimo gutegura isoko ryawe...
            </p>
          </div>
        </div>
      )}

      {!showSplash && (
        <Header searchValue={search} onSearchChange={setSearch} />
      )}

      <section className="relative isolate overflow-hidden bg-[#f5f9fb] dark:bg-[#07111c]">
        {/* ═════════ CINEMATIC AMBIENT MESH & ARCHITECTURAL GRID ═════════ */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-32 -top-36 h-[620px] w-[620px] rounded-full bg-[radial-gradient(circle,rgba(86,154,181,0.22)_0%,transparent_70%)] blur-3xl dark:bg-[radial-gradient(circle,rgba(86,154,181,0.25)_0%,transparent_70%)]" />
          <div className="absolute -left-36 top-1/4 h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle,rgba(255,93,0,0.12)_0%,transparent_70%)] blur-3xl dark:bg-[radial-gradient(circle,rgba(255,93,0,0.16)_0%,transparent_70%)]" />
          <div className="absolute -bottom-40 left-1/3 h-[540px] w-[540px] rounded-full bg-cyan-400/10 blur-[120px]" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(57,119,143,.045)_1px,transparent_1px),linear-gradient(90deg,rgba(57,119,143,.045)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_at_50%_30%,black_35%,transparent_82%)]" />
          <div
            className="absolute inset-0 opacity-[.03] mix-blend-multiply dark:opacity-[.05] dark:mix-blend-screen"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
            }}
          />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-10 sm:px-6 sm:pb-24 sm:pt-14 lg:pb-28 lg:pt-16">
          {/* ═════════ MAIN HERO GRID ═════════ */}
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="kug-reveal relative z-10">
              <div className="inline-flex items-center gap-3 rounded-full border border-[#569ab5]/25 bg-white/85 px-4 py-2 shadow-[0_8px_24px_-10px_rgba(16,36,54,0.12)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/75">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inset-0 animate-ping rounded-full bg-[#FF5D00] opacity-75" />
                  <span className="relative flex h-2 w-2 rounded-full bg-[#FF5D00]" />
                </span>
                <span className="text-[10px] font-black uppercase tracking-[.22em] text-[#39778f] dark:text-[#83c2dc]">
                  Isoko ryawe ryo mu Rwanda
                </span>
                <span className="h-3 w-[1px] bg-slate-200 dark:bg-white/15" />
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                  {showSellHeadline ? "Gurisha" : "Gura"}
                </span>
              </div>

              <div className="mt-7 min-h-[7.2rem] sm:min-h-[8.8rem] lg:min-h-[9.8rem]">
                <h1
                  key={showSellHeadline ? "sell-mode" : "buy-mode"}
                  className="max-w-2xl text-[2.85rem] font-black leading-[1.01] tracking-[-.055em] text-[#102436] transition-all duration-700 ease-out dark:text-white sm:text-6xl lg:text-[4.35rem]"
                >
                  {showSellHeadline ? (
                    <span className="block animate-[fadeSlideUp_0.55s_cubic-bezier(0.16,1,0.3,1)_forwards]">
                      Ibyo ufite,
                      <br />
                      <span className="relative inline-block">
                        <span className="bg-[linear-gradient(110deg,#FF5D00_0%,#FF7A29_40%,#FFA066_65%,#FF5D00_100%)] bg-[size:200%_100%] bg-clip-text text-transparent [animation:kg-shimmer_6s_ease-in-out_infinite]">
                          bigurishirize aha.
                        </span>
                        <span className="absolute -bottom-1.5 left-0 h-[4px] w-28 rounded-full bg-gradient-to-r from-[#FF5D00] via-[#FF7A29] to-transparent opacity-90" />
                      </span>
                    </span>
                  ) : (
                    <span className="block animate-[fadeSlideUp_0.55s_cubic-bezier(0.16,1,0.3,1)_forwards]">
                      Ibyo ushaka,
                      <br />
                      <span className="relative inline-block">
                        <span className="bg-[linear-gradient(110deg,#39778f_0%,#569ab5_40%,#82bfd4_65%,#39778f_100%)] bg-[size:200%_100%] bg-clip-text text-transparent [animation:kg-shimmer_6s_ease-in-out_infinite]">
                          ubisanga hano.
                        </span>
                        <span className="absolute -bottom-1.5 left-0 h-[4px] w-28 rounded-full bg-gradient-to-r from-[#39778f] via-[#569ab5] to-transparent opacity-90" />
                      </span>
                    </span>
                  )}
                </h1>
              </div>

              <p className="mt-5 max-w-xl text-sm font-medium leading-8 text-slate-600 dark:text-slate-300 sm:text-base">
                Gura, gurisha kandi uhure n'abantu bafite ibyo ukeneye. Kuva ku
                bikoresho, imodoka n'imitungo itimukanwa,{" "}
                <span className="font-bold text-slate-900 dark:text-white">KUGURISHA.COM</span>{" "}
                ni isoko rihuza abafite ibyo bashaka gutanga n'ababikeneye.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3.5">
                <Link
                  to="/create-listing"
                  className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full bg-gradient-to-r from-[#FF5D00] via-[#FF6D1A] to-[#e05200] px-6 py-3.5 text-white shadow-[0_14px_34px_-10px_rgba(255,93,0,0.6)] ring-1 ring-white/20 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-[0_20px_42px_-10px_rgba(255,93,0,0.75)] active:translate-y-0"
                >
                  <span className="pointer-events-none absolute inset-0 -translate-x-full rounded-full bg-[linear-gradient(115deg,transparent_35%,rgba(255,255,255,.3)_50%,transparent_65%)] transition-transform duration-700 ease-out group-hover:translate-x-full" />
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 ring-1 ring-white/25 transition-transform duration-300 group-hover:rotate-90 group-hover:scale-110">
                    <Icon name="plus" size={12} />
                  </span>
                  <span className="text-[13px] font-extrabold tracking-tight">Gurisha ubu</span>
                  <Icon name="arrow-right" size={14} className="ml-0.5 shrink-0 text-white/80 transition-all duration-300 group-hover:translate-x-1 group-hover:text-white" />
                </Link>

                <Link
                  to="/ai-search"
                  className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full border border-slate-300/80 bg-[#102436] px-6 py-3.5 text-white shadow-[0_12px_30px_-12px_rgba(16,36,54,0.65)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-[#569ab5]/50 hover:bg-[#152f46] hover:shadow-[0_18px_36px_-12px_rgba(16,36,54,0.85)] active:translate-y-0 dark:border-white/15"
                >
                  <span className="pointer-events-none absolute inset-0 -translate-x-full rounded-full bg-[linear-gradient(115deg,transparent_35%,rgba(255,255,255,.18)_50%,transparent_65%)] transition-transform duration-700 ease-out group-hover:translate-x-full" />
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#569ab5]/25 text-[#82bfd4] ring-1 ring-[#82bfd4]/30 transition-transform duration-300 group-hover:scale-110">
                    <Icon name="spark" size={12} />
                  </span>
                  <span className="text-[13px] font-extrabold tracking-tight">Baza AI</span>
                  <Icon name="arrow-right" size={14} className="ml-0.5 shrink-0 text-white/60 transition-all duration-300 group-hover:translate-x-1 group-hover:text-white" />
                </Link>
              </div>

              <div className="mt-10 flex flex-wrap gap-x-7 gap-y-3 border-t border-slate-200/80 pt-6 dark:border-white/10">
                <span className="group flex items-center gap-2.5 text-xs font-bold text-slate-600 transition-colors hover:text-[#39778f] dark:text-slate-300 dark:hover:text-[#83c2dc]">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-slate-200/70 text-[#569ab5] transition-transform duration-300 group-hover:scale-110 dark:bg-white/5 dark:ring-white/10">
                    <Icon name="map-pin" size={14} />
                  </span>
                  Mu Rwanda hose
                </span>
                <span className="group flex items-center gap-2.5 text-xs font-bold text-slate-600 transition-colors hover:text-[#FF5D00] dark:text-slate-300 dark:hover:text-[#FF7A29]">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-slate-200/70 text-[#FF5D00] transition-transform duration-300 group-hover:scale-110 dark:bg-white/5 dark:ring-white/10">
                    <Icon name="users" size={14} />
                  </span>
                  Abaguzi n'abagurisha
                </span>
                <span className="group flex items-center gap-2.5 text-xs font-bold text-slate-600 transition-colors hover:text-[#39778f] dark:text-slate-300 dark:hover:text-[#83c2dc]">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-slate-200/70 text-[#569ab5] transition-transform duration-300 group-hover:scale-110 dark:bg-white/5 dark:ring-white/10">
                    <Icon name="zap" size={14} />
                  </span>
                  Byoroshye gukoresha
                </span>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-[620px] lg:ml-auto">
              <div className="pointer-events-none absolute -inset-6 rounded-[3.5rem] bg-[radial-gradient(ellipse_at_top_right,rgba(86,154,181,.35),transparent_65%)] blur-2xl" />
              <div className="pointer-events-none absolute -inset-6 rounded-[3.5rem] bg-[radial-gradient(ellipse_at_bottom_left,rgba(255,93,0,.22),transparent_65%)] blur-2xl" />

              <div className="group relative">
                <div className="relative overflow-hidden rounded-[2.25rem] border border-white/60 bg-white/40 p-2 shadow-[0_30px_70px_-20px_rgba(16,36,54,0.28)] backdrop-blur-xl dark:border-white/15 dark:bg-white/[0.04] sm:rounded-[2.75rem] sm:p-2.5">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-[1.85rem] bg-slate-900 sm:rounded-[2.25rem]">
                    <img
                      src="/homeimg.png"
                      alt="KUGURISHA.COM - Isoko rihuza Abanyarwanda"
                      className="h-full w-full object-cover transition-transform duration-[1600ms] ease-out group-hover:scale-[1.06]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#081724]/90 via-[#081724]/20 to-transparent" />

                    <div className="absolute left-5 top-5 h-7 w-7 rounded-tl-xl border-l-2 border-t-2 border-white/60 transition-all duration-500 group-hover:scale-105 group-hover:border-[#FF5D00]" />
                    <div className="absolute right-5 top-5 h-7 w-7 rounded-tr-xl border-r-2 border-t-2 border-white/60 transition-all duration-500 group-hover:scale-105 group-hover:border-[#82bfd4]" />

                    <div className="absolute right-5 top-5 hidden items-center gap-2 rounded-full border border-white/20 bg-black/45 px-3.5 py-1.5 text-[10px] font-bold text-white backdrop-blur-md sm:flex">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                      <span>Kigali • Musanze • Rubavu • Huye</span>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between gap-4 p-5 sm:p-8">
                      <div>
                        <p className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/15 px-3 py-1 text-[9px] font-black uppercase tracking-[.22em] text-white backdrop-blur-md">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#FF5D00]" />
                          KUGURISHA.COM
                        </p>
                        <h2 className="mt-3 max-w-sm text-2xl font-black leading-[1.04] tracking-tight text-white sm:text-3xl">
                          Isoko ryawe.
                          <br />
                          <span className="bg-gradient-to-r from-white via-white to-[#FFA066] bg-clip-text text-transparent">
                            Amahirwe yawe.
                          </span>
                        </h2>
                      </div>

                      <Link
                        to="/Listings"
                        className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/25 bg-white/15 text-white backdrop-blur-md transition-all duration-300 hover:scale-110 hover:border-[#FF5D00] hover:bg-[#FF5D00] sm:flex"
                        aria-label="Reba ibicuruzwa"
                      >
                        <Icon name="arrow-right" size={18} />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ═════════ INTERACTIVE MARKETPLACE STREAM ═════════ */}
          <div className="relative mt-20 grid items-stretch gap-8 lg:mt-24 lg:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)] lg:gap-10">
            <div className="relative flex flex-col justify-between overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white/80 p-6 shadow-[0_24px_60px_-20px_rgba(16,36,54,0.12)] backdrop-blur-2xl dark:border-white/[0.1] dark:bg-white/[0.035] dark:shadow-black/50 sm:p-8">
              <div className="pointer-events-none absolute -left-16 -top-16 h-52 w-52 rounded-full bg-[#569ab5]/20 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-16 -right-16 h-52 w-52 rounded-full bg-[#FF5D00]/15 blur-3xl" />

              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 rounded-full bg-[#FF5D00]/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-[#FF5D00]">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inset-0 animate-ping rounded-full bg-[#FF5D00] opacity-75" />
                    <span className="relative flex h-2 w-2 rounded-full bg-[#FF5D00]" />
                  </span>
                  Isoko riri gukora ubu
                </div>

                <h2 className="mt-4 text-2xl font-black leading-[1.12] tracking-tight text-slate-900 dark:text-slate-50 sm:text-3xl">
                  Abaguzi bagenda <br />
                  <span className="bg-gradient-to-r from-[#36677b] via-[#569ab5] to-[#FF5D00] bg-clip-text text-transparent">
                    bahitamo ibintu ubu.
                  </span>
                </h2>

                <p className="mt-3.5 text-xs font-medium leading-relaxed text-slate-600 dark:text-slate-300 sm:text-sm">
                  Buri munota, Abanyarwanda bagenda bagura ibintu abandi bakagurisha
                  ibyo bafite kuri{" "}
                  <span className="font-extrabold text-slate-900 underline decoration-[#FF5D00]/50 underline-offset-4 dark:text-white">
                    KUGURISHA.COM
                  </span>{" "}
                  — kuva ku bikoresho byo mu rugo, telefoni, imodoka, kugera ku
                  mitungo itimukanwa.
                </p>
              </div>

              <div className="relative z-10 mt-6 border-t border-slate-200/70 pt-5 dark:border-white/10">
                <p className="mb-2.5 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                  Hitamo icyiciro wihuse:
                </p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: "Byose", value: "" },
                    { label: "Telefoni", value: "Telefoni" },
                    { label: "Imodoka", value: "Imodoka" },
                    { label: "Inzu n'ubutaka", value: "Inzu" },
                    { label: "Ibikoresho", value: "Ibikoresho" },
                  ].map((chip) => {
                    const active = search.toLowerCase() === chip.value.toLowerCase()
                    return (
                      <button
                        key={chip.label}
                        type="button"
                        onClick={() => setSearch(chip.value)}
                        className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-all duration-200 ${
                          active
                            ? "bg-[#102436] text-white shadow-md shadow-slate-900/20 dark:bg-[#FF5D00] dark:text-white"
                            : "border border-slate-200/80 bg-white/70 text-slate-600 hover:border-[#FF5D00]/50 hover:text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:text-white"
                        }`}
                      >
                        {chip.label}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-between space-y-4">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2.5">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="absolute inset-0 animate-ping rounded-full bg-[#FF5D00] opacity-75" />
                    <span className="relative flex h-2.5 w-2.5 rounded-full bg-[#FF5D00]" />
                  </span>
                  <h3 className="text-lg font-black tracking-tight text-slate-900 dark:text-white sm:text-xl">
                    Ibyashyizweho vuba
                  </h3>
                  {search && (
                    <button
                      type="button"
                      onClick={() => setSearch("")}
                      className="rounded-full bg-[#FF5D00]/10 px-2.5 py-0.5 text-[10px] font-bold text-[#FF5D00] hover:bg-[#FF5D00]/20"
                    >
                      {search} ×
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const container = document.getElementById("home-product-slider-track")
                      if (container) container.scrollBy({ left: -240, behavior: "smooth" })
                    }}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-white/10 dark:bg-slate-800 dark:text-slate-200"
                    aria-label="Scroll left"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const container = document.getElementById("home-product-slider-track")
                      if (container) container.scrollBy({ left: 240, behavior: "smooth" })
                    }}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-white/10 dark:bg-slate-800 dark:text-slate-200"
                    aria-label="Scroll right"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate("/Listings")}
                    className="group inline-flex items-center gap-1.5 rounded-full bg-[#102436] px-4 py-2 text-xs font-bold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#FF5D00] hover:shadow-md hover:shadow-[#FF5D00]/25 active:scale-95 dark:bg-white/10 dark:hover:bg-[#FF5D00]"
                  >
                    <span>Reba byose</span>
                    <svg className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="overflow-hidden rounded-2xl border border-slate-200/60 bg-white/60 dark:border-white/10 dark:bg-white/[0.03]">
                      <div className="kug-shimmer h-40" />
                      <div className="space-y-2 p-3.5">
                        <div className="kug-shimmer h-3 w-3/4 rounded" />
                        <div className="kug-shimmer h-3 w-1/2 rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredListings.length > 0 ? (
                <div id="home-product-slider-track" className="no-scrollbar relative w-full overflow-x-auto py-2 touch-pan-x scroll-smooth">
                  <div className="flex w-max animate-infinite-scroll gap-4 hover:[animation-play-state:paused] focus-within:[animation-play-state:paused]">
                    {[...filteredListings.slice(0, 12), ...filteredListings.slice(0, 12)].map(
                      (listing, index) => (
                        <Link
                          key={`${listing.id}-${index}`}
                          to={`/listing/${listing.id}`}
                          className="group relative flex w-48 shrink-0 flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-[#FF5D00]/45 hover:shadow-xl dark:border-white/10 dark:bg-slate-900 sm:w-56"
                        >
                          <div className="relative aspect-[4/5] w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                            {images?.[listing.id] ? (
                              <img
                                src={images[listing.id]}
                                alt={listing.title}
                                loading="lazy"
                                decoding="async"
                                className="h-full w-full object-cover object-center transform-gpu transition-transform duration-700 ease-out group-hover:scale-105"
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center text-slate-400">
                                <Icon name="shopping-bag" size={28} />
                              </div>
                            )}

                            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

                            <div className="absolute left-2.5 right-2.5 top-2.5 flex items-center justify-between">
                              <span className="rounded-full bg-black/60 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">
                                {listing.category?.name || "Ibindi"}
                              </span>
                              <span className="rounded-full bg-[#FF5D00] px-2 py-0.5 text-[9px] font-extrabold text-white shadow-sm">
                                {listing.condition || "New"}
                              </span>
                            </div>

                            <div className="absolute bottom-0 left-0 right-0 p-3.5 space-y-1">
                              <h3 className="line-clamp-1 text-xs font-bold leading-tight text-white transition group-hover:text-[#FF5D00] sm:text-[13px]">
                                {listing.title}
                              </h3>

                              <p className="flex items-center gap-1 text-[10px] text-slate-300">
                                <Icon name="map-pin" size={10} className="shrink-0 text-[#569ab5]" />
                                <span className="truncate">{formatLocation(listing)}</span>
                              </p>

                              <div className="pt-1 flex items-center justify-between">
                                <span className="text-xs sm:text-sm font-black tracking-tight text-white">
                                  {formatPrice(listing)}
                                </span>
                                <span className="text-[10px] font-semibold text-[#FF5D00] opacity-0 transition-opacity group-hover:opacity-100">
                                  Reba →
                                </span>
                              </div>
                            </div>
                          </div>
                        </Link>
                      ),
                    )}
                  </div>
                </div>
              ) : (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-white/50 p-8 py-14 text-center dark:border-white/10 dark:bg-white/[0.02]">
                  <Icon name="search" size={36} className="mx-auto mb-3 text-slate-400" />
                  <h4 className="font-bold text-slate-800 dark:text-slate-200">Nta bintu bibonetse</h4>
                  <p className="mt-1 text-xs text-slate-500">
                    Gerageza guhindura amagambo washakishije cyangwa icyiciro.
                  </p>
                  {search && (
                    <button
                      type="button"
                      onClick={() => setSearch("")}
                      className="mt-4 rounded-full bg-[#FF5D00] px-4 py-1.5 text-xs font-bold text-white"
                    >
                      Erekana byose
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* TRUST AND SAFETY */}
      <section className="bg-white pb-16 dark:bg-[#080f1b] sm:pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="relative isolate overflow-hidden rounded-[2rem] bg-[#102b3e] px-6 py-10 text-white sm:px-10 sm:py-14 lg:px-14">
            <div className="pointer-events-none absolute -right-20 -top-32 h-96 w-96 rounded-full bg-[#569ab5]/25 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-36 left-1/3 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl" />

            <div className="relative grid items-center gap-10 lg:grid-cols-[1.1fr_.9fr]">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[.24em] text-[#9bd3e7]">
                  Umutekano n'icyizere
                </p>
                <h2 className="mt-4 max-w-xl text-3xl font-black leading-tight tracking-tight sm:text-4xl">
                  Ahantu hamwe ho kugura no kugurisha.
                  <span className="text-[#83c2dc]"> Byoroshye.</span>
                </h2>
                <p className="mt-5 max-w-xl text-sm leading-7 text-white/70">
                  Erekana ibyo ufite, shakisha ibyo ukeneye kandi uganire
                  n'abandi bakoresha. Buri gihe genzura igicuruzwa n'amakuru
                  y'umuntu muganira mbere yo kwishyura.
                </p>
                <Link
                  to="/listings"
                  className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-black text-[#17394e] transition hover:-translate-y-0.5 hover:bg-[#e9f5f9]"
                >
                  Tangira gushakisha <Icon name="arrow-right" size={17} />
                </Link>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/[0.07] p-5 backdrop-blur">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-[#9bd3e7]">
                    <Icon name="shield" size={23} />
                  </div>
                  <h3 className="mt-4 font-black">Gira amakenga</h3>
                  <p className="mt-2 text-xs leading-6 text-white/60">
                    Banza ugenzure neza igicuruzwa n'amakuru y'ugurisha.
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.07] p-5 backdrop-blur">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-[#9bd3e7]">
                    <Icon name="message" size={23} />
                  </div>
                  <h3 className="mt-4 font-black">Vugana neza</h3>
                  <p className="mt-2 text-xs leading-6 text-white/60">
                    Banza mwumvikane ku giciro n'uburyo bwo guhererekanya igicuruzwa.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <HomeStory />
      <MovingStory />
      <SellCTA />
      <HomeFooter />
    </main>
  )
}