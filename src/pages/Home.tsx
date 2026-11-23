import { useCallback, useEffect, useMemo, useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { useNavigate } from "react-router-dom"

import HomeStory from "../components/HomeStory"
import HomeRentStory from "../components/HomeRentStory"
import MovingStory from "../components/MovingStory"
import Header from "../components/Header"
import { supabase } from "../services/supabase"
import SellCTA from "../components/SellCTA"
import HomeFooter from "../components/HomeFooter"
import SystemAnalyticsCard from "../components/SystemAnalyticsCard"
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
  const [listings, setListings] = useState<Listing[]>(homeCache.listings)
  const [images, setImages] = useState<Record<string, string>>(homeCache.images)
  const navigate = useNavigate()
  const [, setStats] = useState<HomeStats>(initialStats)
  const [, setStatsLoading] = useState(true)
  const [loading, setLoading] = useState(!homeCache.loaded)

  const [showSplash, setShowSplash] = useState(() => {
    try {
      return sessionStorage.getItem(SESSION_KEYS.splashShown) !== "1"
    } catch {
      return true
    }
  })

  const [searchParams] = useSearchParams()

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
  const [currentSlide, setCurrentSlide] = useState(0)

  const [showSellHeadline, setShowSellHeadline] = useState(true)

  useEffect(() => {
    try {
      sessionStorage.setItem(SESSION_KEYS.search, search)
    } catch { /* ignore */ }
  }, [search])

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(SESSION_KEYS.scroll)
      if (saved) {
        const y = parseInt(saved, 10)
        if (!Number.isNaN(y) && y > 0) {
          requestAnimationFrame(() => window.scrollTo(0, y))
        }
      }
    } catch { /* ignore */ }

    const saveScroll = () => {
      try {
        sessionStorage.setItem(SESSION_KEYS.scroll, String(window.scrollY))
      } catch { /* ignore */ }
    }

    window.addEventListener("scroll", saveScroll, { passive: true })
    return () => window.removeEventListener("scroll", saveScroll)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setShowSellHeadline((prev) => !prev)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

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

  const loadHome = useCallback(async () => {
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

      homeCache.loaded = true
      homeCache.listings = loadedListings
      homeCache.images = imageMap

      setListings(loadedListings)
      setImages(imageMap)
    } catch (error) {
      console.error("KUGURISHA Home loading error:", error)
    } finally {
      setLoading(false)
      try {
        sessionStorage.setItem(SESSION_KEYS.splashShown, "1")
      } catch { /* ignore */ }
      window.setTimeout(() => setShowSplash(false), 350)
    }
  }, [])

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

  /* ───────────────────────────────────────────────────────────────────
     HERO SLIDER LOGIC
     Auto-slides every 4 seconds. Manual controls included.
     ─────────────────────────────────────────────────────────────────── */
  const nextSlide = useCallback(() => {
    if (filteredListings.length === 0) return;
    setCurrentSlide((prev) => (prev + 1) % filteredListings.length);
  }, [filteredListings.length]);

  const prevSlide = useCallback(() => {
    if (filteredListings.length === 0) return;
    setCurrentSlide((prev) => (prev - 1 + filteredListings.length) % filteredListings.length);
  }, [filteredListings.length]);

  useEffect(() => {
    if (loading || filteredListings.length < 2) return;
    const timer = window.setInterval(nextSlide, 4000);
    return () => window.clearInterval(timer);
  }, [loading, filteredListings.length, nextSlide]);

  const currentListing = filteredListings[currentSlide];
  const currentImage = currentListing ? images[currentListing.id] : null;

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
              Kugurisha
            </div>
            <p className="mt-3 text-[10px] font-black uppercase tracking-[0.3em] text-[#569ab5]">
             Gurisha Icyufite
            </p>
            <div className="mt-9 h-1.5 w-52 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
              <div
                className="h-full w-2/5 rounded-full bg-gradient-to-r from-slate-500 via-[#569ab5] to-[#36677b]"
                style={{ animation: "kug-loader 1.1s cubic-bezier(0.4,0,0.2,1) infinite" }}
              />
            </div>
            <p className="mt-4 text-xs font-semibold text-slate-500">
              Turategura...
            </p>
          </div>
        </div>
      )}

      {!showSplash && (
        <Header searchValue={search} onSearchChange={setSearch} />
      )}

      {/* ═════════ ADDED pt-28 sm:pt-36 HERE TO CLEAR THE FIXED HEADER ═════════ */}
    <section className="relative isolate overflow-hidden bg-[#f3f4f6] pt-28 antialiased sm:pt-36 dark:bg-[#07111c]">
  {/* ═════════ CINEMATIC AMBIENT MESH & ARCHITECTURAL GRID ═════════ */}
  <div className="pointer-events-none absolute inset-0 overflow-hidden">
    {/* Smooth, band-free radial gradients (no heavy blur-3xl artifacts in dark mode) */}
    <div
      className="absolute -right-32 -top-36 h-[680px] w-[680px] rounded-full opacity-90 dark:opacity-100"
      style={{
        background:
          "radial-gradient(circle at center, rgba(86,154,181,0.16) 0%, rgba(86,154,181,0.05) 42%, transparent 72%)",
      }}
    />
    <div
      className="absolute -left-36 top-1/4 h-[580px] w-[580px] rounded-full opacity-90 dark:opacity-100"
      style={{
        background:
          "radial-gradient(circle at center, rgba(255,93,0,0.10) 0%, rgba(255,93,0,0.03) 40%, transparent 70%)",
      }}
    />
    <div
      className="absolute -bottom-40 left-1/3 h-[580px] w-[580px] rounded-full"
      style={{
        background:
          "radial-gradient(circle at center, rgba(34,211,238,0.07) 0%, transparent 68%)",
      }}
    />

    {/* Architectural Grid — refined contrast for light and dark mode */}
    <div className="absolute inset-0 bg-[linear-gradient(rgba(57,119,143,.045)_1px,transparent_1px),linear-gradient(90deg,rgba(57,119,143,.045)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_at_50%_30%,black_35%,transparent_82%)] dark:bg-[linear-gradient(rgba(130,191,212,.035)_1px,transparent_1px),linear-gradient(90deg,rgba(130,191,212,.035)_1px,transparent_1px)]" />

    {/* Ultra-fine grain — disabled screen blend in dark mode to prevent pixelated artifacts */}
    <div
      className="absolute inset-0 opacity-[.025] mix-blend-multiply dark:opacity-[.012] dark:mix-blend-overlay"
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
      }}
    />
  </div>

  <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-6 sm:px-6 sm:pb-24 sm:pt-10 lg:pb-28 lg:pt-12">
    {/* ═════════ MAIN HERO GRID ═════════ */}
    <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
      <div className="kug-reveal relative z-10">
        <div className="inline-flex items-center gap-3 rounded-full border border-[#569ab5]/25 bg-[#f3f4f6]/90 px-4 py-2 shadow-[0_8px_24px_-10px_rgba(16,36,54,0.12)] backdrop-blur-xl dark:border-white/10 dark:bg-[#0d1c2c]/90">
          <span className="relative flex h-2 w-2">
            <span className="absolute inset-0 animate-ping rounded-full bg-[#FF5D00] opacity-75" />
            <span className="relative flex h-2 w-2 rounded-full bg-[#FF5D00]" />
          </span>
          <span className="text-[10px] font-black uppercase tracking-[.22em] text-[#39778f] dark:text-[#83c2dc]">
            Isoko ryawe ryo mu Rwanda
          </span>
          <span className="h-3 w-[1px] bg-slate-300 dark:bg-white/15" />
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
                    bigurishirize hano.
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
          Gura,Gurisha,Kodesha kandi uhure n'abantu bafite ibyo ukeneye. Kuva ku
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

        <div className="mt-10 flex flex-wrap gap-x-7 gap-y-3 border-t border-slate-200/90 pt-6 dark:border-white/10">
          <span className="group flex items-center gap-2.5 text-xs font-bold text-slate-600 transition-colors hover:text-[#39778f] dark:text-slate-300 dark:hover:text-[#83c2dc]">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#f3f4f6] shadow-sm ring-1 ring-slate-200/80 text-[#569ab5] transition-transform duration-300 group-hover:scale-110 dark:bg-white/[0.06] dark:ring-white/10">
              <Icon name="map-pin" size={14} />
            </span>
            Mu Rwanda hose
          </span>
          <span className="group flex items-center gap-2.5 text-xs font-bold text-slate-600 transition-colors hover:text-[#FF5D00] dark:text-slate-300 dark:hover:text-[#FF7A29]">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#f3f4f6] shadow-sm ring-1 ring-slate-200/80 text-[#FF5D00] transition-transform duration-300 group-hover:scale-110 dark:bg-white/[0.06] dark:ring-white/10">
              <Icon name="users" size={14} />
            </span>
            Abaguzi n'abagurisha
          </span>
          <span className="group flex items-center gap-2.5 text-xs font-bold text-slate-600 transition-colors hover:text-[#39778f] dark:text-slate-300 dark:hover:text-[#83c2dc]">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#f3f4f6] shadow-sm ring-1 ring-slate-200/80 text-[#569ab5] transition-transform duration-300 group-hover:scale-110 dark:bg-white/[0.06] dark:ring-white/10">
              <Icon name="zap" size={14} />
            </span>
            Byoroshye gukoresha
          </span>
        </div>
      </div>

      <div className="relative mx-auto w-full max-w-[620px] lg:ml-auto">
        <div
          className="pointer-events-none absolute -inset-6 rounded-[3.5rem]"
          style={{
            background:
              "radial-gradient(ellipse at top right, rgba(86,154,181,0.22), transparent 65%)",
          }}
        />
        <div
          className="pointer-events-none absolute -inset-6 rounded-[3.5rem]"
          style={{
            background:
              "radial-gradient(ellipse at bottom left, rgba(255,93,0,0.14), transparent 65%)",
          }}
        />

        <div className="group relative">
          <div className="relative overflow-hidden rounded-[2.25rem] border border-white/70 bg-[#f3f4f6]/60 p-2 shadow-[0_30px_70px_-20px_rgba(16,36,54,0.28)] backdrop-blur-xl dark:border-white/15 dark:bg-white/[0.04] sm:rounded-[2.75rem] sm:p-2.5">
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

    {/* ═════════ INTERACTIVE MARKETPLACE STREAM (UPDATED HERO SLIDER) ═════════ */}
    <div className="relative mt-20 grid min-h-0 items-stretch gap-8 lg:mt-24 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-10">
      {/* ────────── LEFT: HERO LISTING SLIDER ────────── */}
      <div className="flex min-w-0 flex-col gap-6">
        {/* Header row: title + Reba byose */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inset-0 animate-ping rounded-full bg-[#39778f] opacity-75 dark:bg-[#83c2dc]" />
              <span className="relative flex h-2.5 w-2.5 rounded-full bg-[#39778f] dark:bg-[#83c2dc]" />
            </span>
            <h3 className="text-lg font-black tracking-tight text-slate-900 dark:text-white sm:text-xl">
              Ibyashyizweho vuba
            </h3>
          </div>

          <button
            type="button"
            onClick={() => navigate("/Listings")}
            className="group inline-flex items-center gap-1.5 rounded-full bg-[#102436] px-4 py-2 text-xs font-bold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#39778f] hover:shadow-md hover:shadow-[#39778f]/25 active:scale-95 dark:bg-white/10 dark:hover:bg-[#569ab5]"
          >
            <span>Reba byose</span>
            <svg
              className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
              />
            </svg>
          </button>
        </div>

        {/* ────────── THE NEW HERO LISTING SLIDER ────────── */}
        {loading ? (
          <div className="relative overflow-hidden rounded-[2rem] bg-slate-900/10 dark:bg-white/5 min-h-[350px] sm:min-h-[400px] flex items-center justify-center">
            <div className="kug-shimmer h-full w-full absolute inset-0 opacity-20" />
            <p className="relative z-10 text-sm font-bold text-slate-500">Turashakisha ibicuruzwa...</p>
          </div>
        ) : filteredListings.length > 0 && currentListing ? (
          <div className="group relative overflow-hidden rounded-[2rem] bg-slate-900 shadow-2xl min-h-[350px] sm:min-h-[420px] flex items-center justify-center border border-slate-200/50 dark:border-white/10">
            {/* Background Image with smooth transition */}
            <div className="absolute inset-0 z-0">
              {currentImage ? (
                <img
                  key={currentListing.id}
                  src={currentImage}
                  alt={currentListing.title}
                  className="h-full w-full object-cover opacity-80 animate-[fadeIn_0.5s_ease-out]"
                />
              ) : (
                <div className="h-full w-full bg-slate-800" />
              )}
              {/* Cinematic Overlays */}
              <div className="absolute inset-0 bg-black/40" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10" />
            </div>

            {/* Navigation Arrows */}
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 z-20 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-md transition-all hover:bg-black/60 hover:scale-110 active:scale-95 border border-white/10"
              aria-label="Previous listing"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 z-20 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-md transition-all hover:bg-black/60 hover:scale-110 active:scale-95 border border-white/10"
              aria-label="Next listing"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            </button>

            {/* Content Area */}
            <div key={currentListing.id} className="relative z-10 flex flex-col items-center text-center px-8 sm:px-16 animate-[slideUp_0.6s_cubic-bezier(0.16,1,0.3,1)_forwards] w-full max-w-2xl">
              
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white backdrop-blur-md mb-4">
                <span className="h-1.5 w-1.5 rounded-full bg-[#FF5D00] animate-pulse" />
                {currentListing.category?.name || "GENERAL"}
              </div>

              <h2 className="text-2xl sm:text-4xl md:text-5xl font-black leading-tight tracking-tight text-white mb-2 drop-shadow-lg line-clamp-2">
                {currentListing.title}
              </h2>

              <p className="text-xl sm:text-3xl font-black text-[#FF7A29] mb-3 drop-shadow-md">
                {formatPrice(currentListing)}
              </p>

              <div className="flex items-center gap-2 text-xs font-semibold text-white/90 mb-8 bg-black/30 px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/10">
                <Icon name="map-pin" size={14} className="text-[#82c4e0]" />
                <span>{formatLocation(currentListing)}</span>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={() => navigate(`/listing/${currentListing.id}`)}
                  className="flex items-center gap-2 rounded-full bg-[#FF5D00] px-6 py-3 text-sm font-extrabold text-white shadow-lg transition-all hover:bg-[#e05200] hover:scale-105 active:scale-95"
                >
                  Reba byose
                  <Icon name="arrow-right" size={16} />
                </button>
                <button
                  onClick={() => navigate("/create-listing")}
                  className="flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-6 py-3 text-sm font-extrabold text-white backdrop-blur-md transition-all hover:bg-white/20 hover:scale-105 active:scale-95"
                >
                  <Icon name="plus" size={16} />
                  Gurisha ubu
                </button>
              </div>

            </div>
            
            {/* Progress Indicators (Dots) */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
               {filteredListings.slice(0, 5).map((_, idx) => (
                 <button
                   key={idx}
                   onClick={() => setCurrentSlide(idx)}
                   className={`h-1.5 rounded-full transition-all duration-300 ${
                     idx === currentSlide 
                       ? "w-6 bg-[#FF5D00]" 
                       : "w-1.5 bg-white/40 hover:bg-white/70"
                   }`}
                   aria-label={`Go to slide ${idx + 1}`}
                 />
               ))}
            </div>

          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-[#f3f4f6]/70 p-8 py-14 text-center dark:border-white/10 dark:bg-white/[0.02] min-h-[350px] flex flex-col justify-center">
            <Icon name="search" size={36} className="mx-auto mb-3 text-slate-400" />
            <h4 className="font-bold text-slate-800 dark:text-slate-200">
              Nta bintu bibonetse
            </h4>
            <p className="mt-1 text-xs text-slate-500">
              Nta bicuruzwa biri ku isoko ubu.
            </p>
          </div>
        )}

        {/* ────────── SELLER INVITE CONTENT ────────── */}
        <div className="relative mt-4 flex min-h-[152px] flex-col justify-between px-1 sm:flex-row sm:items-center sm:gap-6">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#39778f]/25 bg-[#39778f]/10 px-3 py-1 dark:border-[#83c2dc]/25 dark:bg-[#569ab5]/15">
              <span className="h-1.5 w-1.5 rounded-full bg-[#39778f] dark:bg-[#83c2dc]" />
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#39778f] dark:text-[#83c2dc]">
                Tangira kugurisha
              </span>
            </div>

            <h4 className="mt-3 text-xl font-black leading-snug tracking-tight text-[#102436] dark:text-white sm:text-2xl">
              Haraburiki ngo nawe{" "}
              <span className="relative inline-block pb-2 text-[#39778f] dark:text-[#83c2dc]">
                werekane icyo ufite uhure nabagikeneye?
                <span className="absolute bottom-0 left-0 h-[4px] w-32 rounded-full bg-gradient-to-r from-[#39778f] via-[#569ab5] to-transparent dark:from-[#83c2dc] dark:via-[#569ab5]" />
              </span>
            </h4>

            <p className="mt-3 text-sm font-medium leading-7 text-slate-600 dark:text-slate-300 sm:text-base sm:leading-7">
              Gerageza gusura ururubuga buri munsi maze urebe ibindi bicuruzwa biba
              byashyizweho, harigihe wabona icyo ushaka kuri make, ndetse igihe nawe
              haricyo utagikeneye cyerekana kigurwe.
            </p>
          </div>

          <Link
            to="/create-listing"
            className="group mt-5 inline-flex shrink-0 items-center justify-center gap-2.5 self-start rounded-full bg-gradient-to-r from-[#102436] via-[#28586d] to-[#39778f] px-5 py-3 text-xs font-extrabold tracking-tight text-white shadow-[0_12px_28px_-8px_rgba(16,36,54,0.45)] ring-1 ring-white/20 transition-all duration-300 hover:-translate-y-0.5 hover:from-[#28586d] hover:to-[#569ab5] hover:shadow-[0_18px_36px_-8px_rgba(57,119,143,0.55)] sm:mt-0 sm:self-center"
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/15 transition-transform duration-300 group-hover:rotate-90">
              <Icon name="plus" size={11} />
            </span>
            <span>Shyiraho igicuruzwa</span>
            <Icon
              name="arrow-right"
              size={13}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </Link>
        </div>
      </div>

      {/* ────────── RIGHT column ────────── */}
      <SystemAnalyticsCard />
    </div>
  </div>
</section>
      <HomeStory />
      <HomeRentStory />
      <MovingStory />
      <SellCTA />
      <HomeFooter />
    </main>
  )
}