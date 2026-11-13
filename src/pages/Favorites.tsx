import { useEffect, useMemo, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { supabase } from "../services/supabase"

type FavoriteListing = {
  id: string
  title: string
  description: string | null
  price: number | null
  currency: string
  condition: string | null
  listing_type: string
  status: string
  created_at: string
  categories?: { name: string }[] | null
  locations?: {
    province: string
    district: string | null
    sector: string | null
  }[] | null
}

type Favorite = {
  user_id: string
  listing_id: string
  created_at: string
  listings: FavoriteListing | FavoriteListing[] | null
}

type ListingImage = {
  listing_id: string
  image_url: string
  sort_order?: number
}

/* ──────────────────────────────────────────────────────────────────────────
   ICON SYSTEM
   ────────────────────────────────────────────────────────────────────────── */
type IconProps = { className?: string }
const Icon = {
  ArrowLeft: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
    </svg>
  ),
  ArrowRight: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
    </svg>
  ),
  Heart: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
    </svg>
  ),
  HeartFilled: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
    </svg>
  ),
  Tag: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
    </svg>
  ),
  Pin: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
    </svg>
  ),
  Clock: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Check: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.4} d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  ),
  Alert: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
    </svg>
  ),
  Shield: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  ),
  Bolt: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
    </svg>
  ),
  Sparkles: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
    </svg>
  ),
  Image: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25z" />
    </svg>
  ),
  Trash: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
  ),
  Grid: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
    </svg>
  ),
  List: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
  ),
  Sort: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 7.5L7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5" />
    </svg>
  ),
  Chevron: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </svg>
  ),
  Plus: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  ),
  User: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  ),
  Dashboard: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
    </svg>
  ),
}

/* Animated counter */
function useCountUp(target: number, duration = 800) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    let raf = 0
    const start = performance.now()
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - t, 3)
      setValue(Math.round(target * eased))
      if (t < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [target, duration])
  return value
}

type ViewMode = "grid" | "list"
type SortKey = "recent" | "oldest" | "price-low" | "price-high"

/* ──────────────────────────────────────────────────────────────────────────
   COMPONENT
   ────────────────────────────────────────────────────────────────────────── */
function Favorites() {
  const navigate = useNavigate()

  const [favorites, setFavorites] = useState<Favorite[]>([])
  const [images, setImages] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [removingId, setRemovingId] = useState<string | null>(null)
  const [view, setView] = useState<ViewMode>("grid")
  const [sort, setSort] = useState<SortKey>("recent")

  useEffect(() => { void loadFavorites() }, [])

  async function loadFavorites() {
    setLoading(true); setError("")
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { navigate("/login"); return }

    const { data, error } = await supabase
      .from("favorites")
      .select(`
        user_id, listing_id, created_at,
        listings (
          id, title, description, price, currency, condition, listing_type, status, created_at,
          categories ( name ),
          locations ( province, district, sector )
        )
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error) { console.error(error); setError(error.message); setLoading(false); return }

    const favoriteData = (data || []) as Favorite[]
    setFavorites(favoriteData)

    const listingIds = favoriteData.map((f) => f.listing_id).filter(Boolean)
    if (listingIds.length > 0) {
      const { data: imageData, error: imageError } = await supabase
        .from("listing_images")
        .select("listing_id, image_url, sort_order")
        .in("listing_id", listingIds)
        .order("sort_order", { ascending: true })

      if (imageError) console.error(imageError)

      const imageMap: Record<string, string> = {}
      ;((imageData || []) as ListingImage[]).forEach((image) => {
        if (!imageMap[image.listing_id]) imageMap[image.listing_id] = image.image_url
      })
      setImages(imageMap)
    } else {
      setImages({})
    }

    setLoading(false)
  }

  async function removeFavorite(listingId: string) {
    setRemovingId(listingId)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { navigate("/login"); return }

    const { error } = await supabase.from("favorites").delete()
      .eq("user_id", user.id).eq("listing_id", listingId)

    if (error) { alert(error.message); setRemovingId(null); return }

    setFavorites((current) => current.filter((f) => f.listing_id !== listingId))
    setImages((current) => {
      const updated = { ...current }
      delete updated[listingId]
      return updated
    })
    setRemovingId(null)
  }

  function formatPrice(price: number | null, currency: string) {
    if (price === null) return "Baza igiciro"
    return `${new Intl.NumberFormat("en-US").format(price)} ${currency}`
  }

  function getListing(listing: FavoriteListing | FavoriteListing[] | null) {
    if (!listing) return null
    return Array.isArray(listing) ? listing[0] || null : listing
  }

  function getConditionLabel(condition: string | null) {
    switch (condition) {
      case "new": return "Gishya"
      case "used": return "Cyakoreshejwe"
      case "refurbished": return "Cyasanwe"
      case "not_applicable": return "Ntabwo bireba"
      default: return null
    }
  }

  function getStatusLabel(status: string) {
    switch (status) {
      case "active": return "Kiracyaboneka"
      case "sold": return "Cyagurishijwe"
      case "paused": return "Cyahagaritswe"
      case "pending": return "Kirimo gutegurwa"
      default: return status
    }
  }

  const sortedFavorites = useMemo(() => {
    const arr = [...favorites]
    switch (sort) {
      case "recent":
        return arr.sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at))
      case "oldest":
        return arr.sort((a, b) => +new Date(a.created_at) - +new Date(b.created_at))
      case "price-low":
        return arr.sort((a, b) => {
          const pa = getListing(a.listings)?.price ?? 0
          const pb = getListing(b.listings)?.price ?? 0
          return pa - pb
        })
      case "price-high":
        return arr.sort((a, b) => {
          const pa = getListing(a.listings)?.price ?? 0
          const pb = getListing(b.listings)?.price ?? 0
          return pb - pa
        })
    }
  }, [favorites, sort])

  const cFavs = useCountUp(favorites.length)
  const activeCount = favorites.filter((f) => getListing(f.listings)?.status === "active").length
  const cActive = useCountUp(activeCount)

  /* ─────────── LOADING ─────────── */
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f4f8fb] dark:bg-[#060f19]">
        <header className="sticky top-0 z-30 border-b border-slate-200/60 bg-white/70 backdrop-blur-2xl dark:border-white/10 dark:bg-[#060f19]/70">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
            <Link to="/" className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg">
                <Icon.Tag className="w-4 h-4" />
              </span>
              <span className="text-sm font-black text-slate-900 dark:text-white">KUGURISHA<span className="text-blue-600 dark:text-blue-400">.COM</span></span>
            </Link>
            <div className="h-9 w-24 animate-pulse rounded-full bg-slate-200 dark:bg-white/10" />
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-6">
            <div className="h-32 rounded-[28px] bg-slate-200 dark:bg-white/10" />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white dark:border-white/10 dark:bg-slate-900/60">
                  <div className="aspect-[4/3] bg-slate-200 dark:bg-white/10" />
                  <div className="space-y-2 p-4">
                    <div className="h-4 w-3/4 rounded bg-slate-200 dark:bg-white/10" />
                    <div className="h-6 w-1/2 rounded bg-slate-200 dark:bg-white/10" />
                    <div className="h-3 w-full rounded bg-slate-100 dark:bg-white/5" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    )
  }

  /* ─────────── MAIN ─────────── */
  return (
    <div className="min-h-screen bg-[#f4f8fb] text-[#102436] dark:bg-[#060f19] dark:text-slate-100">
      {/* Ambient glows */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-blue-500/10 blur-[140px] dark:bg-blue-500/[0.06]" />
        <div className="absolute top-1/3 -right-40 h-[600px] w-[600px] rounded-full bg-[#FF5D00]/10 blur-[140px] dark:bg-[#FF5D00]/[0.06]" />
        <div className="absolute bottom-0 left-1/3 h-[500px] w-[500px] rounded-full bg-indigo-500/10 blur-[140px] dark:bg-indigo-500/[0.04]" />
      </div>

      {/* HEADER */}
      <header className="sticky top-0 z-30 border-b border-slate-200/60 bg-white/70 backdrop-blur-2xl dark:border-white/10 dark:bg-[#060f19]/70">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3.5 sm:px-6 lg:px-8">
          <Link to="/" className="group flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30 transition-transform group-hover:scale-105">
              <Icon.Tag className="w-4 h-4" />
            </span>
            <div>
              <p className="text-sm font-black tracking-tight text-slate-900 dark:text-white">
                KUGURISHA
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-indigo-400">.COM</span>
              </p>
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Ibyakunzwe</p>
            </div>
          </Link>

          <nav className="flex items-center gap-1.5">
            <Link
              to="/"
              className="hidden items-center gap-1.5 rounded-full border border-slate-200/80 bg-white px-3.5 py-2 text-xs font-extrabold text-slate-700 shadow-sm transition hover:border-[#FF5D00] hover:text-[#FF5D00] dark:border-white/10 dark:bg-white/[0.06] dark:text-slate-200 sm:inline-flex"
            >
              <Icon.ArrowLeft className="w-3.5 h-3.5" />
              Ahabanza
            </Link>
            <Link
              to="/dashboard"
              className="hidden items-center gap-1.5 rounded-full border border-slate-200/80 bg-white px-3.5 py-2 text-xs font-extrabold text-slate-700 shadow-sm transition hover:border-[#FF5D00] hover:text-[#FF5D00] dark:border-white/10 dark:bg-white/[0.06] dark:text-slate-200 sm:inline-flex"
            >
              <Icon.Dashboard className="w-3.5 h-3.5" />
              Dashboard
            </Link>
            <Link
              to="/create-listing"
              className="group inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#FF5D00] via-[#FF7424] to-[#e05200] px-3.5 py-2 text-xs font-black text-white shadow-md shadow-[#FF5D00]/30 transition hover:-translate-y-0.5"
            >
              <Icon.Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Shyiraho itangazo</span>
              <span className="sm:hidden">Gurisha</span>
            </Link>
          </nav>
        </div>
      </header>

      {/* MAIN */}
      <main className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {/* HERO */}
        <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#0a0f1e] via-[#0d1526] to-[#0a0f1e] p-6 text-white shadow-[0_30px_80px_-25px_rgba(10,15,30,0.6)] sm:p-8">
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-rose-500/30 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-10 h-52 w-52 rounded-full bg-[#FF5D00]/25 blur-3xl" />
          <div className="pointer-events-none absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "22px 22px" }} />

          <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-slate-300 backdrop-blur">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inset-0 animate-ping rounded-full bg-rose-400 opacity-75" />
                  <span className="relative flex h-2 w-2 rounded-full bg-rose-400" />
                </span>
                <Icon.HeartFilled className="w-3 h-3 text-rose-400" />
                Ibyo wabitse
              </div>

              <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
                Ibyo <span className="bg-gradient-to-r from-rose-400 to-pink-400 bg-clip-text text-transparent">Nakunze</span>
              </h1>

              <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-300">
                Amatangazo wabikiye kugira ngo uzayagarukireho igihe ushakiye.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 backdrop-blur">
                <p className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-rose-400">
                  <Icon.HeartFilled className="w-2.5 h-2.5" />
                  Byose
                </p>
                <p className="mt-0.5 text-2xl font-black text-white">{cFavs}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 backdrop-blur">
                <p className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-emerald-400">
                  <Icon.Check className="w-2.5 h-2.5" />
                  Bihari
                </p>
                <p className="mt-0.5 text-2xl font-black text-white">{cActive}</p>
              </div>
            </div>
          </div>
        </section>

        {/* ERROR */}
        {error && (
          <div className="mt-5 flex items-center gap-2 rounded-2xl border border-rose-500/25 bg-rose-500/10 px-4 py-3 text-sm font-bold text-rose-600 dark:text-rose-400">
            <Icon.Alert className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {/* EMPTY */}
        {favorites.length === 0 ? (
          <section className="mt-6 overflow-hidden rounded-[28px] border border-slate-200/70 bg-white/90 shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-slate-900/60">
            <div className="relative flex min-h-[420px] flex-col items-center justify-center px-6 py-16 text-center">
              <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-rose-500/10 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-pink-500/10 blur-3xl" />
              <div className="relative">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-rose-500/15 to-pink-500/10 text-rose-500">
                  <Icon.Heart className="w-9 h-9" />
                </div>
                <span className="absolute -right-1 -top-1 left-1/2 ml-4 flex h-7 w-7 items-center justify-center rounded-full bg-[#FF5D00] text-white shadow-lg animate-bounce">
                  <Icon.Sparkles className="w-3.5 h-3.5" />
                </span>
              </div>

              <h2 className="mt-7 text-2xl font-black tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                Nta byo wakunze biraboneka
              </h2>
              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
                Iyo ubonye ikintu ushaka kuri KUGURISHA.COM, kanda kuri <Icon.HeartFilled className="inline w-3 h-3 text-rose-500" /> kugira ngo ukibike hano.
              </p>

              <Link
                to="/"
                className="group mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#FF5D00] via-[#FF7424] to-[#e05200] px-6 py-3 text-sm font-black text-white shadow-lg shadow-[#FF5D00]/30 transition hover:-translate-y-0.5"
              >
                Shakisha ibicuruzwa
                <Icon.ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </section>
        ) : (
          <section className="mt-6">
            {/* TOOLBAR */}
            <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-slate-200/70 bg-white/70 p-3.5 backdrop-blur-sm dark:border-white/10 dark:bg-slate-900/60 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                  <Icon.HeartFilled className="w-3 h-3 text-rose-500" />
                  Ibyo wabitse
                </p>
                <h2 className="mt-0.5 text-lg font-black tracking-tight text-slate-900 dark:text-white">
                  Amatangazo yawe
                </h2>
              </div>

              <div className="flex items-center gap-2">
                {/* Sort */}
                <div className="relative">
                  <Icon.Sort className="pointer-events-none absolute left-2.5 top-1/2 w-3 h-3 -translate-y-1/2 text-slate-400" />
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value as SortKey)}
                    className="appearance-none rounded-full border border-slate-200 bg-white pl-8 pr-8 py-1.5 text-[11px] font-bold text-slate-700 outline-none dark:border-white/10 dark:bg-white/[0.06] dark:text-slate-200"
                  >
                    <option value="recent">Byashyizweho vuba</option>
                    <option value="oldest">Bya kera</option>
                    <option value="price-low">Igiciro gito</option>
                    <option value="price-high">Igiciro kinini</option>
                  </select>
                  <Icon.Chevron className="pointer-events-none absolute right-2 top-1/2 w-3 h-3 -translate-y-1/2 text-slate-400" />
                </div>

                {/* View toggle */}
                <div className="flex rounded-full border border-slate-200 bg-white p-0.5 dark:border-white/10 dark:bg-white/[0.06]">
                  {[
                    { key: "grid" as ViewMode, icon: Icon.Grid },
                    { key: "list" as ViewMode, icon: Icon.List },
                  ].map(({ key, icon: VIcon }) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setView(key)}
                      className={`flex h-7 w-7 items-center justify-center rounded-full transition ${
                        view === key ? "bg-[#102436] text-white shadow-sm dark:bg-[#FF5D00]" : "text-slate-500 hover:text-slate-900 dark:text-slate-400"
                      }`}
                    >
                      <VIcon className="w-3.5 h-3.5" />
                    </button>
                  ))}
                </div>

                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-black text-slate-600 dark:bg-white/[0.06] dark:text-slate-300">
                  {favorites.length}
                </span>
              </div>
            </div>

            {/* GRID OR LIST */}
            {view === "grid" ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {sortedFavorites.map((favorite) => {
                  const listing = getListing(favorite.listings)
                  if (!listing) return null

                  const conditionLabel = getConditionLabel(listing.condition)
                  const locationText = [listing.locations?.[0]?.province, listing.locations?.[0]?.district, listing.locations?.[0]?.sector].filter(Boolean).join(", ")
                  const isRemoving = removingId === favorite.listing_id
                  const categoryName = listing.categories?.[0]?.name

                  return (
                    <article
                      key={favorite.listing_id}
                      className="group relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#FF5D00]/40 hover:shadow-xl dark:border-white/10 dark:bg-slate-900/60"
                    >
                      <Link to={`/listing/${listing.id}`} className="block">
                        <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900">
                          {images[listing.id] ? (
                            <img
                              src={images[listing.id]}
                              alt={listing.title}
                              className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-slate-400">
                              <Icon.Image className="w-10 h-10" />
                            </div>
                          )}

                          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/40 to-transparent opacity-60" />

                          {listing.status !== "active" && (
                            <div className="absolute left-3 top-3 rounded-full bg-black/70 px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-white backdrop-blur-md">
                              {getStatusLabel(listing.status)}
                            </div>
                          )}

                          {categoryName && (
                            <div className="absolute bottom-3 left-3 rounded-full bg-white/90 px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-slate-700 backdrop-blur-md dark:bg-black/60 dark:text-white">
                              {categoryName}
                            </div>
                          )}
                        </div>
                      </Link>

                      {/* Remove button */}
                      <button
                        type="button"
                        onClick={() => removeFavorite(favorite.listing_id)}
                        disabled={isRemoving}
                        className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-rose-500 shadow-md backdrop-blur-md transition hover:scale-110 hover:bg-white disabled:opacity-50 dark:bg-black/60"
                        title="Kura mu byo nakunze"
                      >
                        {isRemoving ? (
                          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-rose-300 border-t-rose-500" />
                        ) : (
                          <Icon.HeartFilled className="w-4 h-4" />
                        )}
                      </button>

                      <div className="p-4">
                        <Link
                          to={`/listing/${listing.id}`}
                          className="line-clamp-2 min-h-[2.5rem] text-sm font-black leading-5 text-slate-900 transition hover:text-[#FF5D00] dark:text-white"
                        >
                          {listing.title}
                        </Link>

                        <p className="mt-2 flex items-center gap-1 text-lg font-black text-[#FF5D00]">
                          <Icon.Tag className="w-3.5 h-3.5" />
                          {formatPrice(listing.price, listing.currency)}
                        </p>

                        <div className="mt-2.5 space-y-1 border-t border-slate-100 pt-2.5 dark:border-white/10">
                          {locationText && (
                            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                              <Icon.Pin className="w-3 h-3 shrink-0 text-[#569ab5]" />
                              <span className="truncate">{locationText}</span>
                            </div>
                          )}
                          {conditionLabel && (
                            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                              <Icon.Check className="w-3 h-3 shrink-0 text-[#569ab5]" />
                              <span>{conditionLabel}</span>
                            </div>
                          )}
                        </div>

                        <Link
                          to={`/listing/${listing.id}`}
                          className="mt-3 flex items-center justify-center gap-1.5 rounded-xl bg-[#102436] py-2.5 text-[11px] font-black text-white transition hover:bg-[#1a3350] dark:bg-white/10"
                        >
                          Reba itangazo
                          <Icon.ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                        </Link>
                      </div>
                    </article>
                  )
                })}
              </div>
            ) : (
              <div className="space-y-2.5">
                {sortedFavorites.map((favorite) => {
                  const listing = getListing(favorite.listings)
                  if (!listing) return null

                  const conditionLabel = getConditionLabel(listing.condition)
                  const locationText = [listing.locations?.[0]?.province, listing.locations?.[0]?.district, listing.locations?.[0]?.sector].filter(Boolean).join(", ")
                  const isRemoving = removingId === favorite.listing_id
                  const categoryName = listing.categories?.[0]?.name

                  return (
                    <article
                      key={favorite.listing_id}
                      className="group flex gap-4 overflow-hidden rounded-2xl border border-slate-200/70 bg-white p-3 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#FF5D00]/40 hover:shadow-lg dark:border-white/10 dark:bg-slate-900/60 sm:p-4"
                    >
                      <Link
                        to={`/listing/${listing.id}`}
                        className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 sm:h-24 sm:w-24"
                      >
                        {images[listing.id] ? (
                          <img src={images[listing.id]} alt={listing.title} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full items-center justify-center text-slate-400">
                            <Icon.Image className="w-6 h-6" />
                          </div>
                        )}
                      </Link>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            {categoryName && (
                              <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-slate-600 dark:bg-white/[0.06] dark:text-slate-300">
                                {categoryName}
                              </span>
                            )}
                            <Link
                              to={`/listing/${listing.id}`}
                              className="mt-1 line-clamp-1 text-sm font-black text-slate-900 transition hover:text-[#FF5D00] dark:text-white sm:text-base"
                            >
                              {listing.title}
                            </Link>
                            {locationText && (
                              <p className="mt-0.5 flex items-center gap-1 truncate text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                                <Icon.Pin className="w-3 h-3 shrink-0 text-[#569ab5]" />
                                {locationText}
                              </p>
                            )}
                          </div>

                          <div className="flex shrink-0 flex-col items-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => removeFavorite(favorite.listing_id)}
                              disabled={isRemoving}
                              className="flex h-7 w-7 items-center justify-center rounded-full bg-rose-500/10 text-rose-500 transition hover:bg-rose-500 hover:text-white disabled:opacity-50"
                            >
                              {isRemoving ? (
                                <span className="h-3 w-3 animate-spin rounded-full border-2 border-rose-300 border-t-rose-500" />
                              ) : (
                                <Icon.HeartFilled className="w-3.5 h-3.5" />
                              )}
                            </button>
                            <p className="flex items-center gap-1 text-base font-black text-[#FF5D00]">
                              <Icon.Tag className="w-3 h-3" />
                              {formatPrice(listing.price, listing.currency)}
                            </p>
                          </div>
                        </div>

                        <div className="mt-2 flex items-center justify-between">
                          <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                            {conditionLabel ? (
                              <>
                                <Icon.Check className="w-2.5 h-2.5" />
                                {conditionLabel}
                              </>
                            ) : (
                              <>
                                <Icon.Clock className="w-2.5 h-2.5" />
                                Yabitswe
                              </>
                            )}
                          </span>
                          <Link
                            to={`/listing/${listing.id}`}
                            className="flex items-center gap-1 text-[10px] font-black text-[#FF5D00] transition group-hover:gap-1.5"
                          >
                            Reba
                            <Icon.ArrowRight className="w-3 h-3" />
                          </Link>
                        </div>
                      </div>
                    </article>
                  )
                })}
              </div>
            )}

            {/* Trust footer */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[11px] font-semibold text-slate-400">
              <span className="flex items-center gap-1.5">
                <Icon.Heart className="w-3.5 h-3.5 text-rose-500" />
                {favorites.length} {favorites.length === 1 ? "ikintu" : "ibintu"} wabitse
              </span>
              <span className="flex items-center gap-1.5">
                <Icon.Shield className="w-3.5 h-3.5 text-emerald-500" />
                Bigenzurwa
              </span>
              <span className="flex items-center gap-1.5">
                <Icon.Bolt className="w-3.5 h-3.5 text-[#FF5D00]" />
                Byihuse
              </span>
            </div>
          </section>
        )}
      </main>

      {/* FOOTER */}
      <footer className="relative mt-8 border-t border-slate-200/60 bg-white/70 backdrop-blur-2xl dark:border-white/10 dark:bg-[#060f19]/70">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 px-4 py-8 sm:flex-row sm:items-center sm:px-6 lg:px-8">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md">
              <Icon.Tag className="w-4 h-4" />
            </span>
            <div>
              <p className="text-sm font-black text-slate-900 dark:text-white">
                KUGURISHA<span className="text-blue-600 dark:text-blue-400">.COM</span>
              </p>
              <p className="text-[11px] text-slate-400">Isoko ryawe ryo mu Rwanda</p>
            </div>
          </div>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Gura icyo ushaka. Gurisha icyo ufite.</p>
        </div>
      </footer>
    </div>
  )
}

export default Favorites