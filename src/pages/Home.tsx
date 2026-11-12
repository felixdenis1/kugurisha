
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { useNavigate } from 'react-router-dom';
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
  const [listings, setListings] = useState<Listing[]>([])
  const [images, setImages] = useState<Record<string, string>>({})
 const navigate = useNavigate();
  const [, setStats] = useState<HomeStats>(initialStats)

  const [, setStatsLoading] = useState(true)
  const [loading, setLoading] = useState(true)
  const [showSplash, setShowSplash] = useState(true)

  const [searchParams] = useSearchParams()
  const [search, setSearch] = useState(() => searchParams.get("category") ?? "")
  const [userId, setUserId] = useState<string | null>(null)
  const sliderRef = useRef<HTMLDivElement | null>(null)

  // AUTHENTICATION
  useEffect(() => {
    let active = true

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
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

  // LOAD LISTINGS AND IMAGES
  const loadHome = useCallback(async () => {
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
        category: Array.isArray(listing.category)
          ? listing.category[0] ?? null
          : listing.category ?? null,
        location: Array.isArray(listing.location)
          ? listing.location[0] ?? null
          : listing.location ?? null,
      }))

      setListings(loadedListings)
      setImages({})

      const listingIds = loadedListings.map((listing) => listing.id)

      if (listingIds.length > 0) {
        const { data: imageData, error: imageError } = await supabase
          .from("listing_images")
          .select("listing_id, image_url")
          .in("listing_id", listingIds)
          .order("sort_order", { ascending: true })

        if (imageError) throw imageError

        const imageMap: Record<string, string> = {}

        ;(imageData || []).forEach((image: ListingImage) => {
          if (!imageMap[image.listing_id]) {
            imageMap[image.listing_id] = image.image_url
          }
        })

        setImages(imageMap)
      }
    } catch (error) {
      console.error("KUGURISHA Home loading error:", error)
    } finally {
      setLoading(false)
      window.setTimeout(() => setShowSplash(false), 350)
    }
  }, [])

  // LOAD CATEGORIES
  const loadCategories = useCallback(async () => {
    const { error } = await supabase
      .from("categories")
      .select("id, name")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })

    if (error) {
      console.error("Categories loading error:", error)
      return
    }
  }, [])

  // LOAD REAL DATABASE STATISTICS
  const loadStats = useCallback(async () => {
    try {
      setStatsLoading(true)

      const [usersResult, listingsResult, soldResult, sellersResult] =
        await Promise.all([
          supabase
            .from("profiles")
            .select("id", { count: "exact", head: true })
            .eq("is_active", true),

          supabase
            .from("listings")
            .select("id", { count: "exact", head: true }),

          supabase
            .from("listings")
            .select("id", { count: "exact", head: true })
            .eq("status", "sold"),

          supabase
            .from("listings")
            .select("seller_id")
            .not("seller_id", "is", null),
        ])

      if (usersResult.error) throw usersResult.error
      if (listingsResult.error) throw listingsResult.error
      if (soldResult.error) throw soldResult.error
      if (sellersResult.error) throw sellersResult.error

      const uniqueSellers = new Set(
        (sellersResult.data || []).map((item) => item.seller_id),
      )

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

  // UNREAD NOTIFICATIONS REFRESH
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
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        () => void loadUnreadCount(),
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        () => void loadUnreadCount(),
      )
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [userId])

  // SEARCH FILTER
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

  // AUTOMATIC PRODUCT SLIDER
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

      const atEnd =
        slider.scrollLeft + slider.clientWidth >= slider.scrollWidth - 12

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
    <main className="min-h-screen overflow-hidden bg-white text-slate-900 selection:bg-[#569ab5] selection:text-white dark:bg-[#080f1b] dark:text-slate-100">

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

      {/* SPLASH SCREEN */}
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

         
<section className="relative isolate overflow-hidden bg-[#f5f9fb] dark:bg-[#091522]">

  {/* SOFT DECORATIVE ELEMENTS */}
  <div className="pointer-events-none absolute inset-0 overflow-hidden">
    <div className="absolute -right-40 -top-40 h-[560px] w-[560px] rounded-full bg-[#569ab5]/15 blur-[110px] dark:bg-[#569ab5]/20" />
    <div className="absolute -bottom-40 -left-40 h-[540px] w-[540px] rounded-full bg-cyan-300/15 blur-[110px] dark:bg-cyan-400/10" />
    <div className="absolute left-1/2 top-1/3 h-[380px] w-[380px] -translate-x-1/2 rounded-full bg-[#c66d37]/10 blur-[100px] dark:bg-[#c66d37]/15" />
    <div className="absolute inset-0 bg-[linear-gradient(rgba(86,154,181,.035)_1px,transparent_1px),linear-gradient(90deg,rgba(86,154,181,.035)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_80%)]" />
    <div
      className="absolute inset-0 opacity-[.035] mix-blend-multiply dark:opacity-[.06] dark:mix-blend-screen"
      style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")" }}
    />
  </div>

  <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-10 sm:px-6 sm:pb-20 sm:pt-14 lg:pb-20 lg:pt-16">

    {/* ═════════ MAIN HERO GRID — UNCHANGED ═════════ */}
    <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-14">

      {/* LEFT: BRAND MESSAGE */}
      <div className="kug-reveal relative z-10 lg:sticky lg:top-24">

        {/* BRAND BADGE */}
        <div className="inline-flex items-center gap-2.5 rounded-full border border-[#569ab5]/25 bg-white/80 px-4 py-2.5 shadow-[0_2px_14px_-6px_rgba(86,154,181,.35)] backdrop-blur-xl dark:border-[#83c2dc]/20 dark:bg-slate-900/70">
          <span className="relative flex h-2 w-2">
            <span className="absolute inset-0 animate-ping rounded-full bg-emerald-500 opacity-60" />
            <span className="relative flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          <span className="text-[10px] font-black uppercase tracking-[.2em] text-[#39778f] dark:text-[#83c2dc]">
            Isoko ryawe ryo mu Rwanda
          </span>
        </div>

        {/* HEADLINE */}
        <h1 className="mt-7 max-w-2xl text-[2.8rem] font-black leading-[1.02] tracking-[-.055em] text-[#102436] dark:text-white sm:text-6xl lg:text-[4.2rem]">
          Ibyo ushaka,
          <br />
          <span className="relative inline-block">
            <span className="bg-[linear-gradient(110deg,#39778f_0%,#569ab5_40%,#82bfd4_65%,#39778f_100%)] bg-[size:200%_100%] bg-clip-text text-transparent [animation:kg-shimmer_6s_ease-in-out_infinite]">
              ubisanga hano.
            </span>
            <span className="absolute -bottom-1 left-0 h-[3px] w-24 rounded-full bg-gradient-to-r from-[#39778f] via-[#569ab5] to-transparent opacity-80" />
          </span>
        </h1>

        {/* DESCRIPTION */}
        <p className="mt-6 max-w-xl text-sm font-medium leading-8 text-slate-600 dark:text-slate-300 sm:text-base">
          Gura, gurisha kandi uhure n'abantu bafite ibyo ukeneye.
          Kuva ku bikoresho, imodoka n'imitungo itimukanwa,{" "}
          <span className="font-semibold text-slate-800 dark:text-slate-100">KUGURISHA.COM</span>{" "}
          ni isoko rihuza Abafite ibyo bashaka gutanga nababikeneye.
        </p>

        {/* ACTION BUTTONS */}
        <div className="mt-8 flex flex-wrap items-center gap-2.5">
          <Link
            to="/ai-search"
            className="group relative flex items-center gap-2.5 overflow-hidden rounded-full bg-[#0d2534] px-4 py-2.5 text-white shadow-[0_8px_22px_-12px_rgba(13,37,52,.7)] ring-1 ring-white/[0.08] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-[#0f2c3e] hover:shadow-[0_14px_30px_-14px_rgba(13,37,52,.85)] hover:ring-white/15 active:translate-y-0"
          >
            <span className="pointer-events-none absolute inset-0 -translate-x-full rounded-full bg-[linear-gradient(115deg,transparent_40%,rgba(255,255,255,.15)_50%,transparent_60%)] transition-transform duration-700 ease-out group-hover:translate-x-full" />
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/10 transition-transform duration-300 group-hover:scale-110">
              <Icon name="spark" size={11} />
            </span>
            <span className="text-[12.5px] font-semibold tracking-tight">Baza AI</span>
            <Icon name="arrow-right" size={13} className="ml-0.5 shrink-0 text-white/60 transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-white" />
          </Link>

          <Link
            to="/create-listing"
            className="group relative flex items-center gap-2.5 overflow-hidden rounded-full bg-[#c66d37] px-4 py-2.5 text-white shadow-[0_8px_22px_-10px_rgba(198,109,55,.6)] ring-1 ring-white/10 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-[#b15f2d] hover:shadow-[0_14px_30px_-12px_rgba(198,109,55,.75)] active:translate-y-0"
          >
            <span className="pointer-events-none absolute inset-0 -translate-x-full rounded-full bg-[linear-gradient(115deg,transparent_40%,rgba(255,255,255,.2)_50%,transparent_60%)] transition-transform duration-700 ease-out group-hover:translate-x-full" />
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/20 transition-transform duration-300 group-hover:rotate-90 group-hover:scale-110">
              <Icon name="plus" size={11} />
            </span>
            <span className="text-[12.5px] font-semibold tracking-tight">Gurisha</span>
            <Icon name="arrow-right" size={13} className="ml-0.5 shrink-0 text-white/70 transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-white" />
          </Link>
        </div>

        {/* BRAND PROMISES */}
        <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 border-t border-slate-200/80 pt-6 dark:border-white/10">
          <span className="group flex items-center gap-2 text-xs font-bold text-slate-600 transition-colors hover:text-[#39778f] dark:text-slate-300 dark:hover:text-[#83c2dc]">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#569ab5]/10 text-[#569ab5] transition-transform duration-300 group-hover:scale-110">
              <Icon name="map-pin" size={14} />
            </span>
            Mu Rwanda hose
          </span>
          <span className="group flex items-center gap-2 text-xs font-bold text-slate-600 transition-colors hover:text-[#39778f] dark:text-slate-300 dark:hover:text-[#83c2dc]">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#569ab5]/10 text-[#569ab5] transition-transform duration-300 group-hover:scale-110">
              <Icon name="users" size={14} />
            </span>
            Abaguzi n'abagurisha
          </span>
          <span className="group flex items-center gap-2 text-xs font-bold text-slate-600 transition-colors hover:text-[#39778f] dark:text-slate-300 dark:hover:text-[#83c2dc]">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#569ab5]/10 text-[#569ab5] transition-transform duration-300 group-hover:scale-110">
              <Icon name="zap" size={14} />
            </span>
            Byoroshye gukoresha
          </span>
        </div>
      </div>

      {/* RIGHT: IMAGE — UNCHANGED */}
      <div className="relative mx-auto w-full max-w-[620px] lg:ml-auto">
        <div className="pointer-events-none absolute -inset-8 rounded-[3.5rem] bg-[radial-gradient(ellipse_at_top,rgba(86,154,181,.32),transparent_70%)] blur-2xl" />
        <div className="relative">
          <div className="group relative">
            <div className="pointer-events-none absolute -inset-4 rounded-[3rem] bg-[radial-gradient(ellipse_at_center,rgba(198,109,55,.18),transparent_70%)] blur-2xl" />
            <div className="relative overflow-hidden rounded-[2rem] sm:rounded-[2.5rem]">
              <div className="relative aspect-[4/3] overflow-hidden bg-transparent">
                <img
                  src="/homeimg.png"
                  alt="KUGURISHA.COM - Isoko rihuza Abanyarwanda"
                  className="h-full w-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-[1.05]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0b1e2e]/80 via-[#0b1e2e]/10 to-transparent" />
                <div className="absolute left-4 top-4 h-7 w-7 rounded-tl-lg border-l-2 border-t-2 border-white/50" />
                <div className="absolute right-4 top-4 h-7 w-7 rounded-tr-lg border-r-2 border-t-2 border-white/50" />
                <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-7">
                  <p className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-[.22em] text-white/90 backdrop-blur-md">
                    <span className="h-1 w-1 rounded-full bg-emerald-400" />
                    KUGURISHA.COM
                  </p>
                  <h2 className="mt-2.5 max-w-sm text-2xl font-black leading-[1.05] text-white sm:text-3xl">
                    Isoko ryawe.
                    <br />
                    <span className="text-white/85">Amahirwe yawe.</span>
                  </h2>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* ═════════ REFERENCE-STYLE SECTION ═════════ */}
    <div className="relative mt-16 grid items-start gap-8 lg:mt-20 lg:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)] lg:gap-10">

      {/* ─────────── LEFT: LIVE BUYERS STREAM ─────────── */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white/70 p-6 shadow-xl shadow-slate-900/5 backdrop-blur-2xl dark:border-white/[0.12] dark:bg-white/[0.03] dark:shadow-black/40 sm:p-8">

        {/* Ambient orbs */}
        <div className="pointer-events-none absolute -left-16 -top-16 h-48 w-48 rounded-full bg-[#569ab5]/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -right-16 h-48 w-48 rounded-full bg-[#c66d37]/20 blur-3xl" />

        {/* Headline */}
        <h2 className="mt-2 text-2xl font-black leading-tight tracking-tight text-slate-900 dark:text-slate-50 sm:text-3xl">
          Abaguzi bagenda <br />
          <span className="bg-gradient-to-r from-[#36677b] via-[#569ab5] to-[#c66d37] bg-clip-text text-transparent">
            bahitamo ibintu ubu.
          </span>
        </h2>

        <p className="mt-3 text-xs font-normal leading-relaxed text-slate-600 dark:text-slate-300 sm:text-sm">
          Buri munota, Abanyarwanda bagenda bagura ibintu abandi bakagurisha ibyo bafite kuri{" "}
          <span className="font-bold text-slate-900 underline decoration-[#c66d37]/40 underline-offset-4 dark:text-white">
            KUGURISHA.COM
          </span>{" "}
          — kuva ku bikoresho byo mu rugo, telefoni, imodoka, kugera ku mitungo itimukanwa.
        </p>
      </div>

  {/* ─────────── RIGHT: AUTO-SLIDING PRODUCTS SHOWCASE ─────────── */}
<div className="space-y-4">

  {/* SECTION HEADER */}
  <div className="flex items-center justify-between px-1">
    <div className="flex items-center gap-2">
      <span className="relative flex h-2.5 w-2.5">
        <span className="absolute inset-0 animate-ping rounded-full bg-[#c66d37] opacity-75" />
        <span className="relative flex h-2.5 w-2.5 rounded-full bg-[#c66d37]" />
      </span>
      <h3 className="text-lg font-black tracking-tight text-slate-900 dark:text-white sm:text-xl">
        Ibyashyizweho vuba
      </h3>
    </div>
   <button
  type="button"
  onClick={() => navigate('/Listings')}
  className="group inline-flex items-center gap-1.5 rounded-full bg-green-600 px-4 py-2 text-xs font-semibold text-white shadow-sm shadow-green-600/20 transition-all duration-200 hover:bg-green-700 hover:shadow-md hover:shadow-green-600/30 active:scale-95 dark:bg-green-600 dark:hover:bg-green-500"
>
  <span>Reba byose</span>
  <svg
    className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2.2}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
  </svg>
</button>
  </div>

  {loading ? (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="overflow-hidden rounded-2xl border border-slate-200/60 bg-white/60 dark:border-white/10 dark:bg-white/[0.03]">
          <div className="kug-shimmer h-36" />
          <div className="space-y-2 p-3">
            <div className="kug-shimmer h-3 rounded w-3/4" />
            <div className="kug-shimmer h-3 w-1/2 rounded" />
          </div>
        </div>
      ))}
    </div>
  ) : filteredListings.length > 0 ? (
    /* Interactive Scroll Container (Allows touch/mouse drag & scroll back) */
    <div className="no-scrollbar relative w-full overflow-x-auto py-2 touch-pan-x scroll-smooth">
      {/* Auto-sliding Track */}
      <div className="flex w-max animate-infinite-scroll gap-4 hover:[animation-play-state:paused] focus-within:[animation-play-state:paused]">
        {[...filteredListings.slice(0, 12), ...filteredListings.slice(0, 12)].map((listing, index) => (
          <Link
            key={`${listing.id}-${index}`}
            to={`/listing/${listing.id}`}
            className="group relative flex w-44 sm:w-52 flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-white/10 dark:bg-slate-900/80 shrink-0"
          >
            {/* Reduced Compact Image Container */}
            <div className="relative aspect-square w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
              {images?.[listing.id] ? (
                <img
                  src={images[listing.id]}
                  alt={listing.title}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover object-center transform-gpu image-rendering-crisp transition-transform duration-700 ease-out group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-slate-400">
                  <Icon name="shopping-bag" size={26} />
                </div>
              )}

              {/* Floating Badges */}
              <div className="absolute left-2 right-2 top-2 flex items-center justify-between pointer-events-none">
                <span className="rounded-full bg-black/60 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">
                  {listing.category?.name || "Ibindi"}
                </span>
                <span className="rounded-full bg-black/50 px-1.5 py-0.5 text-[9px] font-bold text-white">
                  {listing.condition || "New"}
                </span>
              </div>
            </div>

            {/* Compact Details & Pricing */}
            <div className="flex flex-1 flex-col justify-between p-3 space-y-1.5">
              <div>
                <div className="mb-1 flex items-center gap-1 text-[9px] font-bold text-slate-500 dark:text-slate-400">
                  <span className="rounded bg-slate-100 px-1 py-0.5 dark:bg-slate-800">DOC</span>
                  <span className="text-emerald-600 dark:text-emerald-400">✓ Verified</span>
                </div>

                <h3 className="line-clamp-1 text-xs font-bold text-slate-900 leading-tight transition group-hover:text-[#c66d37] dark:text-white">
                  {listing.title}
                </h3>

                <p className="mt-0.5 flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400">
                  <Icon name="map-pin" size={10} className="text-[#569ab5]" />
                  {formatLocation(listing)}
                </p>
              </div>

              {/* Price Row */}
              <div className="pt-1.5 border-t border-slate-100 dark:border-white/10">
                <span className="text-xs sm:text-sm font-black tracking-tight text-slate-900 dark:text-white">
                  RF {formatPrice(listing)}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  ) : (
    <div className="rounded-3xl border border-dashed border-slate-300 p-8 py-16 text-center dark:border-white/10">
      <Icon name="search" size={40} className="mx-auto mb-3 text-slate-400" />
      <h4 className="font-bold text-slate-800 dark:text-slate-200">Nta bintu bibonetse</h4>
      <p className="mt-1 text-xs text-slate-500">Gerageza guhindura amagambo washakishije cyangwa icyiciro.</p>
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

      {/* EXISTING SECTIONS */}
      <HomeStory />
      <MovingStory />
      <SellCTA />
      <HomeFooter />
    </main>
  )
}
