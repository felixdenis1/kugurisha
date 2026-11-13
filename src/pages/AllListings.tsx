// src/pages/AllListings.tsx

import { useEffect, useMemo, useState } from "react"
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

/* ──────────────────────────────────────────────────────────────────────────
   ICON SYSTEM
   ────────────────────────────────────────────────────────────────────────── */
type IconProps = { className?: string }
const Icon = {
  Search: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
  ),
  Close: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  Pin: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
    </svg>
  ),
  Tag: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
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
  Filter: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
    </svg>
  ),
  Sort: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 7.5L7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5" />
    </svg>
  ),
  Sparkles: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
    </svg>
  ),
  Store: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" />
    </svg>
  ),
  Inbox: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M2.25 13.5h3.86a2.25 2.25 0 012.012 1.244l.256.512a2.25 2.25 0 002.013 1.244h3.218a2.25 2.25 0 002.013-1.244l.256-.512a2.25 2.25 0 012.013-1.244h3.859m-19.5.338V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 00-2.15-1.588H6.911a2.25 2.25 0 00-2.15 1.588L2.35 13.177a2.25 2.25 0 00-.1.661z" />
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
  Image: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
  ),
  Chevron: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </svg>
  ),
}

/* Animated counter */
function useCountUp(target: number, duration = 700) {
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
type SortKey = "newest" | "oldest" | "price-low" | "price-high" | "title"

/* ──────────────────────────────────────────────────────────────────────────
   COMPONENT
   ────────────────────────────────────────────────────────────────────────── */
export default function AllListings() {
  const [listings, setListings] = useState<Listing[]>([])
  const [images, setImages] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [searchParams] = useSearchParams()
  const [search, setSearch] = useState(() => searchParams.get("category") ?? "")
  const [view, setView] = useState<ViewMode>("grid")
  const [sort, setSort] = useState<SortKey>("newest")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [provinceFilter, setProvinceFilter] = useState<string>("all")
  const [wishlist, setWishlist] = useState<Record<string, boolean>>({})
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => { void loadAllListings() }, [])

  async function loadAllListings() {
    try {
      setLoading(true)
      const { data: listingData, error: listingError } = await supabase
        .from("listings")
        .select(`
          id, title, description, price, currency, condition, listing_type, created_at,
          category:categories ( name ),
          location:locations ( province, district, sector )
        `)
        .eq("status", "active")
        .order("created_at", { ascending: false })

      if (listingError) { console.error(listingError); return }

      const loadedListings: Listing[] = (listingData || []).map((listing: any) => ({
        ...listing,
        category: Array.isArray(listing.category) ? listing.category[0] ?? null : listing.category ?? null,
        location: Array.isArray(listing.location) ? listing.location[0] ?? null : listing.location ?? null,
      }))

      setListings(loadedListings)

      if (loadedListings.length > 0) {
        const listingIds = loadedListings.map((l) => l.id)
        const { data: imageData, error: imageError } = await supabase
          .from("listing_images")
          .select("listing_id, image_url")
          .in("listing_id", listingIds)
          .order("sort_order", { ascending: true })

        if (!imageError && imageData) {
          const imageMap: Record<string, string> = {}
          imageData.forEach((img: ListingImage) => {
            if (!imageMap[img.listing_id]) imageMap[img.listing_id] = img.image_url
          })
          setImages(imageMap)
        }
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  function formatPrice(listing: Listing) {
    if (listing.listing_type === "free") return "Ubuntu"
    if (listing.price === null || listing.price === undefined) return "Twandikire ku giciro"
    return `${Number(listing.price).toLocaleString("en-US")} Frw`
  }

  function formatLocation(listing: Listing) {
    if (!listing.location) return "Rwanda"
    return [listing.location.sector, listing.location.district, listing.location.province]
      .filter(Boolean)
      .join(", ")
  }

  function conditionLabel(condition: string | null) {
    if (!condition) return null
    const map: Record<string, string> = {
      new: "Bishya",
      used: "Byakoreshejwe",
      refurbished: "Byavuguruwe",
      not_applicable: null as any,
    }
    return map[condition] || null
  }

  const categories = useMemo(() => {
    const set = new Set<string>()
    listings.forEach((l) => { if (l.category?.name) set.add(l.category.name) })
    return ["all", ...Array.from(set)]
  }, [listings])

  const provinces = useMemo(() => {
    const set = new Set<string>()
    listings.forEach((l) => { if (l.location?.province) set.add(l.location.province) })
    return ["all", ...Array.from(set)]
  }, [listings])

  const filteredListings = useMemo(() => {
    const query = search.toLowerCase().trim()
    let arr = listings

    if (query) {
      arr = arr.filter((listing) =>
        listing.title.toLowerCase().includes(query) ||
        listing.description?.toLowerCase().includes(query) ||
        listing.category?.name.toLowerCase().includes(query) ||
        formatLocation(listing).toLowerCase().includes(query)
      )
    }

    if (categoryFilter !== "all") arr = arr.filter((l) => l.category?.name === categoryFilter)
    if (provinceFilter !== "all") arr = arr.filter((l) => l.location?.province === provinceFilter)

    const sorted = [...arr]
    switch (sort) {
      case "newest": sorted.sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at)); break
      case "oldest": sorted.sort((a, b) => +new Date(a.created_at) - +new Date(b.created_at)); break
      case "price-low": sorted.sort((a, b) => (a.price || 0) - (b.price || 0)); break
      case "price-high": sorted.sort((a, b) => (b.price || 0) - (a.price || 0)); break
      case "title": sorted.sort((a, b) => a.title.localeCompare(b.title)); break
    }
    return sorted
  }, [listings, search, categoryFilter, provinceFilter, sort])

  const cTotal = useCountUp(filteredListings.length)
  const cTotalAll = useCountUp(listings.length)
  const cCategories = useCountUp(Math.max(0, categories.length - 1))
  const cProvinces = useCountUp(Math.max(0, provinces.length - 1))

  const activeFilterCount =
    (categoryFilter !== "all" ? 1 : 0) +
    (provinceFilter !== "all" ? 1 : 0) +
    (search ? 1 : 0)

  function toggleWishlist(id: string, e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    setWishlist((current) => ({ ...current, [id]: !current[id] }))
  }

  function clearAllFilters() {
    setSearch("")
    setCategoryFilter("all")
    setProvinceFilter("all")
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f4f8fb] text-[#102436] dark:bg-[#060f19] dark:text-slate-100">
      <Header
        searchValue={search}
        onSearchChange={setSearch}
        onSearchSubmit={() => {}}
      />

      {/* Ambient glows */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-blue-500/10 blur-[140px] dark:bg-blue-500/[0.05]" />
        <div className="absolute top-1/3 -right-40 h-[600px] w-[600px] rounded-full bg-[#FF5D00]/10 blur-[140px] dark:bg-[#FF5D00]/[0.05]" />
      </div>

      {/* HERO */}
      <section className="relative overflow-hidden border-b border-slate-200/60 bg-white/40 backdrop-blur-sm dark:border-white/10 dark:bg-white/[0.02]">
        <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/70 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-blue-600 backdrop-blur dark:border-white/10 dark:bg-white/[0.06] dark:text-blue-400">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inset-0 animate-ping rounded-full bg-blue-500 opacity-75" />
                  <span className="relative flex h-2 w-2 rounded-full bg-blue-500" />
                </span>
                <Icon.Store className="w-3 h-3" />
                Isoko Rusange
              </div>
              <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white sm:text-4xl lg:text-5xl">
                Ibicuruzwa <span className="bg-gradient-to-r from-[#FF5D00] via-[#FF7424] to-[#e05200] bg-clip-text text-transparent">byose</span>
              </h1>
              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600 dark:text-slate-400 sm:text-base">
                Shakisha ibicuruzwa ku isoko rya KUGURISHA.COM. Ugerageza filtre kugira ubone byihuse.
              </p>

              {search && (
                <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#FF5D00]/30 bg-[#FF5D00]/10 px-3 py-1.5 text-xs font-bold text-[#FF5D00]">
                  <Icon.Search className="w-3 h-3" />
                  Ibisubizo bya: <span className="font-black">{search}</span>
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="ml-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#FF5D00]/20 transition hover:bg-[#FF5D00]/30"
                  >
                    <Icon.Close className="w-2.5 h-2.5" />
                  </button>
                </div>
              )}
            </div>

            {/* STATS */}
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              {[
                { label: "Byose", value: cTotalAll, icon: Icon.Inbox, tone: "slate" },
                { label: "Bihari", value: cTotal, icon: Icon.Bolt, tone: "orange" },
                { label: "Ibyiciro", value: cCategories, icon: Icon.Tag, tone: "blue" },
                { label: "Intara", value: cProvinces, icon: Icon.Pin, tone: "emerald" },
              ].map((s) => {
                const SIcon = s.icon
                const toneMap: Record<string, string> = {
                  slate: "text-slate-600 dark:text-slate-300",
                  orange: "text-[#FF5D00]",
                  blue: "text-blue-600 dark:text-blue-400",
                  emerald: "text-emerald-600 dark:text-emerald-400",
                }
                return (
                  <div key={s.label} className="rounded-2xl border border-slate-200/70 bg-white/80 px-4 py-2.5 shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-900/60">
                    <p className={`flex items-center gap-1 text-[9px] font-black uppercase tracking-wider ${toneMap[s.tone]}`}>
                      <SIcon className="w-2.5 h-2.5" />
                      {s.label}
                    </p>
                    <p className="mt-0.5 text-xl font-black text-slate-900 dark:text-white">{s.value}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* TOOLBAR */}
      <section className="sticky top-16 z-20 border-b border-slate-200/60 bg-white/70 backdrop-blur-2xl dark:border-white/10 dark:bg-[#060f19]/70">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6">
          <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center lg:justify-between">
            {/* Left: filter + category pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0">
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className={`group inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-black transition ${
                  showFilters || activeFilterCount > 0
                    ? "border-[#FF5D00] bg-[#FF5D00]/10 text-[#FF5D00]"
                    : "border-slate-200/80 bg-white text-slate-700 hover:border-slate-300 dark:border-white/10 dark:bg-white/[0.06] dark:text-slate-200"
                }`}
              >
                <Icon.Filter className="w-3.5 h-3.5" />
                Filtre
                {activeFilterCount > 0 && (
                  <span className="flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-[#FF5D00] px-1 text-[9px] font-black text-white">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              <span className="h-5 w-px shrink-0 bg-slate-200 dark:bg-white/10" />

              {categories.slice(0, 6).map((cat) => {
                const isActive = categoryFilter === cat
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategoryFilter(cat)}
                    className={`shrink-0 rounded-full px-3 py-1.5 text-[11px] font-black transition ${
                      isActive
                        ? "bg-[#102436] text-white shadow-md dark:bg-[#FF5D00]"
                        : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/[0.06]"
                    }`}
                  >
                    {cat === "all" ? "Zose" : cat}
                  </button>
                )
              })}
            </div>

            {/* Right: sort + view */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <Icon.Sort className="pointer-events-none absolute left-2.5 top-1/2 w-3 h-3 -translate-y-1/2 text-slate-400" />
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortKey)}
                  className="appearance-none rounded-full border border-slate-200 bg-white pl-8 pr-8 py-1.5 text-[11px] font-bold text-slate-700 outline-none dark:border-white/10 dark:bg-white/[0.06] dark:text-slate-200"
                >
                  <option value="newest">Nshya mbere</option>
                  <option value="oldest">Zishaje mbere</option>
                  <option value="price-low">Igiciro gito</option>
                  <option value="price-high">Igiciro kinini</option>
                  <option value="title">A-Z</option>
                </select>
                <Icon.Chevron className="pointer-events-none absolute right-2 top-1/2 w-3 h-3 -translate-y-1/2 text-slate-400" />
              </div>

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
            </div>
          </div>

          {/* Filter panel (expandable) */}
          {showFilters && (
            <div className="mt-3 grid gap-3 rounded-2xl border border-slate-200/70 bg-white/80 p-3.5 backdrop-blur-sm dark:border-white/10 dark:bg-slate-900/60 sm:grid-cols-2">
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Icyiciro
                </label>
                <div className="relative mt-1.5">
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 outline-none dark:border-white/10 dark:bg-slate-900 dark:text-slate-200"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat === "all" ? "Zose" : cat}</option>
                    ))}
                  </select>
                  <Icon.Chevron className="pointer-events-none absolute right-2.5 top-1/2 w-3 h-3 -translate-y-1/2 text-slate-400" />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Intara
                </label>
                <div className="relative mt-1.5">
                  <select
                    value={provinceFilter}
                    onChange={(e) => setProvinceFilter(e.target.value)}
                    className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 outline-none dark:border-white/10 dark:bg-slate-900 dark:text-slate-200"
                  >
                    {provinces.map((p) => (
                      <option key={p} value={p}>{p === "all" ? "Zose" : p}</option>
                    ))}
                  </select>
                  <Icon.Chevron className="pointer-events-none absolute right-2.5 top-1/2 w-3 h-3 -translate-y-1/2 text-slate-400" />
                </div>
              </div>
              {activeFilterCount > 0 && (
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="col-span-full flex items-center justify-center gap-1.5 rounded-xl border border-rose-500/25 bg-rose-500/10 py-2 text-[11px] font-black text-rose-600 transition hover:bg-rose-500/20 dark:text-rose-400"
                >
                  <Icon.Close className="w-3 h-3" />
                  Kuraho filtre zose ({activeFilterCount})
                </button>
              )}
            </div>
          )}
        </div>
      </section>

      {/* LISTINGS */}
      <section className="relative py-8 sm:py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          {loading ? (
            <div className={`grid gap-4 ${view === "grid" ? "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"}`}>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <div key={n} className={`overflow-hidden rounded-2xl border border-slate-200/70 bg-white/70 dark:border-white/10 dark:bg-slate-900/60 ${view === "grid" ? "h-72" : "h-28"}`}>
                  <div className={view === "grid" ? "h-40 animate-pulse bg-slate-200 dark:bg-white/10" : "h-full animate-pulse bg-slate-200 dark:bg-white/10"} />
                </div>
              ))}
            </div>
          ) : filteredListings.length > 0 ? (
            view === "grid" ? (
              /* GRID VIEW */
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredListings.map((listing) => {
                  const liked = wishlist[listing.id]
                  const condition = conditionLabel(listing.condition)
                  return (
                    <Link
                      key={listing.id}
                      to={`/listing/${listing.id}`}
                      className="group relative block overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#FF5D00]/40 hover:shadow-xl dark:border-white/10 dark:bg-slate-900/60"
                    >
                      {/* Image */}
                      <div className="relative h-44 overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900">
                        {images[listing.id] ? (
                          <img
                            src={images[listing.id]}
                            alt={listing.title}
                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-slate-400">
                            <Icon.Image className="w-10 h-10" />
                          </div>
                        )}

                        {/* Top chips */}
                        <div className="absolute left-3 right-3 top-3 flex items-start justify-between gap-2">
                          <span className="rounded-full bg-black/60 px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-wider text-white backdrop-blur-md">
                            {listing.category?.name || "Ibindi"}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => toggleWishlist(listing.id, e)}
                            className={`flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-md transition ${
                              liked
                                ? "bg-rose-500 text-white shadow-md"
                                : "bg-white/90 text-slate-600 hover:bg-white dark:bg-black/50 dark:text-white"
                            }`}
                            aria-label="Kubika mu byakunzwe"
                          >
                            {liked ? <Icon.HeartFilled className="w-4 h-4" /> : <Icon.Heart className="w-4 h-4" />}
                          </button>
                        </div>

                        {/* Condition badge bottom */}
                        {condition && (
                          <span className="absolute bottom-3 left-3 rounded-full bg-[#FF5D00] px-2 py-0.5 text-[9px] font-black uppercase text-white shadow-sm">
                            {condition}
                          </span>
                        )}
                      </div>

                      {/* Body */}
                      <div className="p-4">
                        <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-black leading-5 text-slate-900 transition group-hover:text-[#FF5D00] dark:text-white">
                          {listing.title}
                        </h3>
                        <p className="mt-2 flex items-center gap-1 text-lg font-black text-[#FF5D00]">
                          <Icon.Tag className="w-3.5 h-3.5" />
                          {formatPrice(listing)}
                        </p>
                        <p className="mt-1.5 flex items-center gap-1 truncate text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                          <Icon.Pin className="w-3 h-3 shrink-0 text-[#569ab5]" />
                          {formatLocation(listing)}
                        </p>
                        <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-white/10">
                          <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                            <Icon.Clock className="w-2.5 h-2.5" />
                            {new Date(listing.created_at).toLocaleDateString("rw-RW", { day: "2-digit", month: "short" })}
                          </span>
                          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#FF5D00]/10 text-[#FF5D00] transition-all group-hover:bg-[#FF5D00] group-hover:text-white">
                            <Icon.ArrowRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            ) : (
              /* LIST VIEW */
              <div className="space-y-2.5">
                {filteredListings.map((listing) => {
                  const liked = wishlist[listing.id]
                  const condition = conditionLabel(listing.condition)
                  return (
                    <Link
                      key={listing.id}
                      to={`/listing/${listing.id}`}
                      className="group flex gap-4 overflow-hidden rounded-2xl border border-slate-200/70 bg-white p-3 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#FF5D00]/40 hover:shadow-lg dark:border-white/10 dark:bg-slate-900/60 sm:p-4"
                    >
                      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 sm:h-24 sm:w-24">
                        {images[listing.id] ? (
                          <img
                            src={images[listing.id]}
                            alt={listing.title}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-slate-400">
                            <Icon.Image className="w-6 h-6" />
                          </div>
                        )}
                        {condition && (
                          <span className="absolute left-1 top-1 rounded bg-[#FF5D00] px-1 py-0.5 text-[8px] font-black uppercase text-white">
                            {condition}
                          </span>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-slate-600 dark:bg-white/[0.06] dark:text-slate-300">
                              {listing.category?.name || "Ibindi"}
                            </span>
                            <h3 className="mt-1 line-clamp-1 text-sm font-black text-slate-900 transition group-hover:text-[#FF5D00] dark:text-white sm:text-base">
                              {listing.title}
                            </h3>
                            <p className="mt-0.5 flex items-center gap-1 truncate text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                              <Icon.Pin className="w-3 h-3 shrink-0 text-[#569ab5]" />
                              {formatLocation(listing)}
                            </p>
                          </div>

                          <div className="flex shrink-0 flex-col items-end gap-1.5">
                            <button
                              type="button"
                              onClick={(e) => toggleWishlist(listing.id, e)}
                              className={`flex h-7 w-7 items-center justify-center rounded-full transition ${
                                liked ? "bg-rose-500 text-white" : "bg-slate-100 text-slate-500 hover:bg-rose-100 hover:text-rose-500 dark:bg-white/[0.06] dark:text-slate-400"
                              }`}
                            >
                              {liked ? <Icon.HeartFilled className="w-3.5 h-3.5" /> : <Icon.Heart className="w-3.5 h-3.5" />}
                            </button>
                            <p className="flex items-center gap-1 text-base font-black text-[#FF5D00]">
                              <Icon.Tag className="w-3 h-3" />
                              {formatPrice(listing)}
                            </p>
                          </div>
                        </div>

                        <p className="mt-1.5 line-clamp-1 text-xs text-slate-500 dark:text-slate-400">
                          {listing.description || "Nta bisobanuro bihari."}
                        </p>

                        <div className="mt-2 flex items-center justify-between">
                          <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                            <Icon.Clock className="w-2.5 h-2.5" />
                            {new Date(listing.created_at).toLocaleDateString("rw-RW", { day: "2-digit", month: "short" })}
                          </span>
                          <span className="flex items-center gap-1 text-[10px] font-black text-[#FF5D00] transition group-hover:gap-1.5">
                            Reba
                            <Icon.ArrowRight className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )
          ) : (
            /* EMPTY */
            <div className="mx-auto max-w-md rounded-3xl border border-slate-200/70 bg-white/80 px-6 py-16 text-center shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-slate-900/60">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-500/15 to-indigo-500/10 text-blue-500">
                <Icon.Search className="w-9 h-9" />
              </div>
              <h3 className="mt-5 text-xl font-black text-slate-900 dark:text-white">Nta bicuruzwa byabonetse</h3>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Nta bicuruzwa bihuje n'amakuru washakishije.
              </p>
              {activeFilterCount > 0 && (
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="group mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#FF5D00] via-[#FF7424] to-[#e05200] px-5 py-2.5 text-xs font-black text-white shadow-lg shadow-[#FF5D00]/30 transition hover:-translate-y-0.5"
                >
                  <Icon.Close className="w-3.5 h-3.5" />
                  Kuraho filtre zose
                </button>
              )}
            </div>
          )}

          {/* Trust footer */}
          {!loading && filteredListings.length > 0 && (
            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[11px] font-semibold text-slate-400">
              <span className="flex items-center gap-1.5">
                <Icon.Shield className="w-3.5 h-3.5 text-emerald-500" />
                Kugurisha mu mutekano
              </span>
              <span className="flex items-center gap-1.5">
                <Icon.Check className="w-3.5 h-3.5 text-emerald-500" />
                Byose bigenzurwa
              </span>
              <span className="flex items-center gap-1.5">
                <Icon.Sparkles className="w-3.5 h-3.5 text-[#FF5D00]" />
                {filteredListings.length} ibicuruzwa bihari
              </span>
            </div>
          )}
        </div>
      </section>

      <SellCTA />
      <HomeFooter />
    </main>
  )
}