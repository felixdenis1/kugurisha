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
          <path d="M3 10a3 3 0 0 0 5 0 3 3 0 0 0 5 0 3 3 0 0 0 5 0 3 3 0 0 0 3 0" />
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

export default function AllListings() {
  const [listings, setListings] = useState<Listing[]>([])
  const [images, setImages] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [searchParams] = useSearchParams()
  const [search, setSearch] = useState(() => searchParams.get("category") ?? "")

  useEffect(() => {
    loadAllListings()
  }, [])

  async function loadAllListings() {
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
          category:categories ( name ),
          location:locations ( province, district, sector )
        `)
        .eq("status", "active")
        .order("created_at", { ascending: false })

      if (listingError) {
        console.error(listingError)
        return
      }

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
            if (!imageMap[img.listing_id]) {
              imageMap[img.listing_id] = img.image_url
            }
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

  const filteredListings = useMemo(() => {
    const query = search.toLowerCase().trim()
    if (!query) return listings
    return listings.filter((listing) => {
      return (
        listing.title.toLowerCase().includes(query) ||
        listing.description?.toLowerCase().includes(query) ||
        listing.category?.name.toLowerCase().includes(query) ||
        formatLocation(listing).toLowerCase().includes(query)
      )
    })
  }, [listings, search])

  return (
    <main className="min-h-screen overflow-x-hidden kg-bg kg-text transition-colors duration-300">
      <Header
        searchValue={search}
        onSearchChange={setSearch}
        onSearchSubmit={() => {}}
      />

      <section className="relative overflow-hidden border-b kg-border kg-bg-secondary py-12 sm:py-16">
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#427c94] dark:text-[#73afc9]">
                Isoko Rusange
              </p>
              <h1 className="mt-2 text-3xl font-black tracking-[-0.04em] kg-text sm:text-4xl">
                Ibicuruzwa Byose
              </h1>
              {search && (
                <p className="mt-2 text-sm kg-text-secondary">
                  Ibisubizo bya:{" "}
                  <span className="font-bold kg-text bg-[#569ab5]/10 px-2 py-0.5 rounded-md text-[#427c94] dark:text-[#569ab5]">
                    {search}
                  </span>
                </p>
              )}
            </div>

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="flex items-center gap-2 self-start rounded-xl border kg-border kg-surface px-4.5 py-2.5 text-sm font-bold kg-text-secondary shadow-sm backdrop-blur-sm transition hover:-translate-y-0.5 hover:text-[#427c94] dark:hover:text-[#569ab5] sm:self-auto"
              >
                <Icon name="close" size={15} />
                Siba search
              </button>
            )}
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <div key={n} className="h-72 rounded-3xl kg-surface animate-pulse border kg-border" />
              ))}
            </div>
          ) : filteredListings.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredListings.map((listing) => (
                <Link
                  key={listing.id}
                  to={`/listing/${listing.id}`}
                  className="group block overflow-hidden rounded-3xl border kg-border kg-surface shadow-md backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:border-[#569ab5]/50 hover:shadow-xl"
                >
                  <div className="relative h-48 overflow-hidden kg-bg-secondary">
                    {images[listing.id] ? (
                      <img
                        src={images[listing.id]}
                        alt={listing.title}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center kg-bg-secondary">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl kg-surface kg-text-muted shadow-sm">
                          <Icon name="shopping-bag" size={24} />
                        </div>
                      </div>
                    )}
                    <div className="absolute left-3.5 top-3.5 rounded-full border border-white/20 bg-black/50 px-3.5 py-1.5 text-[10px] font-black text-white shadow-md backdrop-blur-md">
                      {listing.category?.name || "Ibindi"}
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="line-clamp-2 min-h-[2.75rem] text-sm font-black leading-5 kg-text transition-colors group-hover:text-[#427c94] dark:group-hover:text-[#73afc9]">
                      {listing.title}
                    </h3>
                    <p className="mt-3 bg-gradient-to-r from-blue-600 via-[#569ab5] to-[#36677b] dark:from-white dark:via-[#73afc9] dark:to-slate-200 bg-clip-text text-lg font-black text-transparent">
                      {formatPrice(listing)}
                    </p>
                    <p className="mt-2.5 flex items-center gap-1.5 truncate text-xs font-semibold kg-text-secondary">
                      <Icon name="map-pin" size={14} className="text-[#427c94] dark:text-[#73afc9] shrink-0" />
                      {formatLocation(listing)}
                    </p>
                    <div className="mt-4 flex items-center justify-between border-t border-slate-200/50 dark:border-slate-800/50 pt-3.5">
                      <span className="text-[11px] font-bold kg-text-muted">Reba ibisobanuro</span>
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#569ab5]/20 text-[#427c94] dark:text-[#73afc9] transition-transform duration-300 group-hover:translate-x-1 group-hover:bg-[#569ab5] group-hover:text-white">
                        <Icon name="arrow-right" size={14} />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border kg-border kg-surface px-6 py-20 text-center shadow-sm backdrop-blur-md">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#569ab5]/10 text-[#427c94] dark:text-[#73afc9] shadow-inner">
                <Icon name="search" size={26} />
              </div>
              <h3 className="mt-5 text-xl font-black kg-text">Nta bicuruzwa byabonetse</h3>
              <p className="mt-2 text-sm kg-text-secondary">Nta bicuruzwa bihuje n'ayo makuru byabonetse kuri uyu mwanya.</p>
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="mt-6 rounded-xl bg-gradient-to-r from-[#427c94] via-[#569ab5] to-[#36677b] px-6 py-3 text-xs font-black text-white shadow-md transition hover:opacity-90"
                >
                  Kura ho ibyo washakishaga
                </button>
              )}
            </div>
          )}
        </div>
      </section>

      <SellCTA />
      <HomeFooter />
    </main>
  )
}