import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"

import { supabase } from "../services/supabase"

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

type Category = {
  id: string
  name: string
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

function Home() {
  const [listings, setListings] = useState<Listing[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [images, setImages] = useState<Record<string, string>>({})

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")

  const [userId, setUserId] = useState<string | null>(null)
  const [unreadCount, setUnreadCount] = useState(0)

  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const [headerScrolled, setHeaderScrolled] = useState(false)

  useEffect(() => {
    loadHome()
    loadUserAndNotifications()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const id = session?.user?.id || null

      setUserId(id)

      if (id) {
        loadUnreadCount(id)
      } else {
        setUnreadCount(0)
        setShowUserMenu(false)
        setShowMobileMenu(false)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setHeaderScrolled(window.scrollY > 12)
    }

    handleScroll()

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    })

    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
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
          setUnreadCount((current) => current + 1)
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
          loadUnreadCount(userId)
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId])

  async function loadUserAndNotifications() {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setUserId(null)
      setUnreadCount(0)
      return
    }

    setUserId(user.id)
    await loadUnreadCount(user.id)
  }

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
      return
    }

    setUnreadCount(count || 0)
  }

  async function handleLogout() {
    try {
      setLoggingOut(true)

      const { error } = await supabase.auth.signOut()

      if (error) {
        console.error("Logout error:", error)
        alert("Ntibyashobotse gusohoka. Ongera ugerageze.")
        return
      }

      setUserId(null)
      setUnreadCount(0)
      setShowUserMenu(false)
      setShowMobileMenu(false)

      window.location.replace("/")
    } catch (error) {
      console.error("Logout error:", error)
      alert("Habaye ikibazo mu gusohoka.")
    } finally {
      setLoggingOut(false)
    }
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

      const {
        data: categoryData,
        error: categoryError,
      } = await supabase
        .from("categories")
        .select("id, name")
        .eq("is_active", true)
        .order("sort_order", {
          ascending: true,
        })

      if (categoryError) {
        console.error(categoryError)
      } else {
        setCategories(categoryData || [])
      }

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

  function formatCondition(condition: string | null) {
    switch (condition) {
      case "new":
        return "Bishya"
      case "used":
        return "Byakoreshejwe"
      case "refurbished":
        return "Byavuguruwe"
      case "not_applicable":
        return ""
      default:
        return ""
    }
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

  
  function closeMenus() {
    setShowUserMenu(false)
    setShowMobileMenu(false)
  }

  function scrollToListings() {
    document
      .getElementById("listings")
      ?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      })
  }

  function scrollToAllListings() {
    document
      .getElementById("all-listings")
      ?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      })
  }

  function selectCategory(categoryName: string) {
    setSearch(categoryName)

    requestAnimationFrame(() => {
      scrollToAllListings()
    })
  }

  return (
    <main
      className="min-h-screen overflow-x-hidden bg-[#f7faff] text-slate-950"
      style={{
        color: "#0f172a",
      }}
    >
      {/* =====================================================
          HEADER
      ===================================================== */}

      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          headerScrolled ? "py-2" : "py-0"
        }`}
      >
        <div
          className={`mx-auto max-w-7xl px-3 transition-all duration-300 sm:px-6 ${
            headerScrolled ? "lg:px-5" : ""
          }`}
        >
          <div
            className="relative flex h-[68px] items-center rounded-[1.35rem] border px-2.5 sm:h-[72px] sm:px-3"
            style={{
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.92), rgba(239,246,255,0.82))",
              borderColor: headerScrolled
                ? "rgba(37,99,235,0.20)"
                : "rgba(148,163,184,0.18)",
              boxShadow: headerScrolled
                ? "0 20px 60px -30px rgba(15,23,42,0.30)"
                : "0 12px 40px -30px rgba(15,23,42,0.18)",
              backdropFilter: "blur(28px)",
              WebkitBackdropFilter: "blur(28px)",
            }}
          >
            <Link
              to="/"
              onClick={closeMenus}
              className="group flex shrink-0 items-center gap-2.5 rounded-xl px-2 py-1.5"
              aria-label="KUGURISHA.COM Ahabanza"
            >
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border transition duration-300 group-hover:scale-[1.04] sm:h-11 sm:w-11"
                style={{
                  background:
                    "linear-gradient(135deg, #eff6ff, #ffffff)",
                  borderColor: "rgba(37,99,235,0.12)",
                  boxShadow:
                    "0 8px 25px -15px rgba(37,99,235,0.45)",
                }}
              >
                <img
                  src="/favicon.svg"
                  alt="KUGURISHA.COM"
                  className="h-[72%] w-[72%] object-contain"
                />
              </span>

              <span className="hidden text-[19px] font-black tracking-[-0.055em] text-slate-950 sm:block lg:text-[21px]">
                KUGURISHA
                <span className="text-blue-600">.COM</span>
              </span>
            </Link>

            <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 lg:flex">
              <Link
                to="/"
                onClick={closeMenus}
                className="rounded-xl bg-blue-50 px-3.5 py-2.5 text-[13px] font-bold text-slate-950"
              >
                Ahabanza
              </Link>

              <a
                href="#categories"
                className="rounded-xl px-3.5 py-2.5 text-[13px] font-semibold text-slate-600 transition hover:bg-blue-50 hover:text-blue-600"
              >
                Ibyiciro
              </a>

              <a
                href="#listings"
                className="rounded-xl px-3.5 py-2.5 text-[13px] font-semibold text-slate-600 transition hover:bg-blue-50 hover:text-blue-600"
              >
                Ibicuruzwa
              </a>

              <a
                href="#about"
                className="rounded-xl px-3.5 py-2.5 text-[13px] font-semibold text-slate-600 transition hover:bg-blue-50 hover:text-blue-600"
              >
                Ibyo dukora
              </a>

              <a
                href="#how-it-works"
                className="rounded-xl px-3.5 py-2.5 text-[13px] font-semibold text-slate-600 transition hover:bg-blue-50 hover:text-blue-600"
              >
                Uko rukora
              </a>

              <Link
                to="/ai-search"
                onClick={closeMenus}
                className="flex items-center gap-1.5 rounded-xl px-3.5 py-2.5 text-[13px] font-semibold text-slate-600 transition hover:bg-blue-50 hover:text-blue-600"
              >
                <Icon name="spark" size={15} />
                <span>AI Search</span>
              </Link>
            </nav>

            <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
              {userId && (
                <Link
                  to="/notifications"
                  onClick={closeMenus}
                  title="Notifications"
                  aria-label="Notifications"
                  className="group relative flex h-10 w-10 items-center justify-center rounded-xl border bg-white/60 text-slate-700 backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-blue-500/30 hover:text-blue-600 sm:h-11 sm:w-11"
                  style={{
                    borderColor:
                      "rgba(148,163,184,0.18)",
                  }}
                >
                  <Icon name="bell" size={18} />

                  {unreadCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex min-h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-black text-white ring-2 ring-white">
                      {unreadCount > 99
                        ? "99+"
                        : unreadCount}
                    </span>
                  )}
                </Link>
              )}

              {!userId ? (
                <Link
                  to="/login"
                  onClick={closeMenus}
                  className="hidden rounded-xl px-3.5 py-2.5 text-[13px] font-bold text-slate-900 transition hover:bg-blue-50 hover:text-blue-600 sm:block"
                >
                  Injira
                </Link>
              ) : (
                <div className="relative hidden sm:block">
                  <button
                    type="button"
                    onClick={() =>
                      setShowUserMenu(
                        (current) => !current,
                      )
                    }
                    aria-expanded={showUserMenu}
                    aria-label="Fungura konti yanjye"
                    className="group flex h-11 items-center gap-2 rounded-xl border bg-white/60 px-1.5 pr-2.5 text-slate-800 backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-blue-500/30"
                    style={{
                      borderColor: showUserMenu
                        ? "rgba(37,99,235,0.35)"
                        : "rgba(148,163,184,0.18)",
                    }}
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500 text-white">
                      <Icon name="user" size={16} />
                    </span>

                    <span className="hidden text-[12px] font-black text-slate-900 md:block">
                      Konti yanjye
                    </span>

                    <span
                      className="ml-0.5 text-slate-400 transition"
                      style={{
                        transform: showUserMenu
                          ? "rotate(180deg)"
                          : "rotate(0deg)",
                      }}
                    >
                      <Icon
                        name="chevron-down"
                        size={13}
                      />
                    </span>
                  </button>

                  {showUserMenu && (
                    <div
                      className="absolute right-0 top-[calc(100%+10px)] w-[292px] overflow-hidden rounded-[1.4rem] border p-2.5 shadow-[0_30px_80px_-30px_rgba(15,23,42,0.30)]"
                      style={{
                        background:
                          "linear-gradient(145deg, rgba(255,255,255,0.96), rgba(239,246,255,0.90))",
                        borderColor:
                          "rgba(37,99,235,0.15)",
                        backdropFilter: "blur(28px)",
                        WebkitBackdropFilter:
                          "blur(28px)",
                      }}
                    >
                      <div className="rounded-xl bg-blue-50/80 px-3.5 py-3.5">
                        <div className="flex items-center gap-3">
                          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white">
                            <Icon name="user" size={17} />
                          </span>

                          <div>
                            <p className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">
                              Konti yanjye
                            </p>

                            <p className="mt-0.5 text-sm font-black text-slate-900">
                              KUGURISHA.COM
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-2 space-y-0.5">
                        <Link
                          to="/profile"
                          onClick={closeMenus}
                          className="flex items-center gap-3 rounded-xl px-3.5 py-3 text-[13px] font-bold text-slate-800 transition hover:bg-blue-50 hover:text-blue-600"
                        >
                          <Icon name="user" size={17} />
                          Profile yanjye
                        </Link>

                        <Link
                          to="/dashboard"
                          onClick={closeMenus}
                          className="flex items-center gap-3 rounded-xl px-3.5 py-3 text-[13px] font-bold text-slate-800 transition hover:bg-blue-50 hover:text-blue-600"
                        >
                          <Icon name="store" size={17} />
                          Dashboard
                        </Link>

                        <Link
                          to="/favorites"
                          onClick={closeMenus}
                          className="flex items-center gap-3 rounded-xl px-3.5 py-3 text-[13px] font-bold text-slate-800 transition hover:bg-blue-50 hover:text-blue-600"
                        >
                          <Icon name="heart" size={17} />
                          Ibyakunzwe
                        </Link>

                        <Link
                          to="/messages"
                          onClick={closeMenus}
                          className="flex items-center gap-3 rounded-xl px-3.5 py-3 text-[13px] font-bold text-slate-800 transition hover:bg-blue-50 hover:text-blue-600"
                        >
                          <Icon name="message" size={17} />
                          Ubutumwa
                        </Link>

                        <Link
                          to="/notifications"
                          onClick={closeMenus}
                          className="flex items-center gap-3 rounded-xl px-3.5 py-3 text-[13px] font-bold text-slate-800 transition hover:bg-blue-50 hover:text-blue-600"
                        >
                          <Icon name="bell" size={17} />
                          Notifications

                          {unreadCount > 0 && (
                            <span className="ml-auto rounded-full bg-red-500 px-2 py-0.5 text-[9px] font-black text-white">
                              {unreadCount > 99
                                ? "99+"
                                : unreadCount}
                            </span>
                          )}
                        </Link>
                      </div>

                      <div className="my-2 border-t border-slate-200/70" />

                      <Link
                        to="/profile"
                        onClick={closeMenus}
                        className="flex items-center gap-3 rounded-xl px-3.5 py-3 text-[13px] font-bold text-slate-800 transition hover:bg-blue-50 hover:text-blue-600"
                      >
                        <Icon name="settings" size={17} />
                        Settings
                      </Link>

                      <div className="my-2 border-t border-slate-200/70" />

                      <button
                        type="button"
                        onClick={handleLogout}
                        disabled={loggingOut}
                        className="flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-left text-[13px] font-black text-red-500 transition hover:bg-red-50 disabled:opacity-60"
                      >
                        <Icon name="logout" size={17} />
                        {loggingOut
                          ? "Turimo gusohoka..."
                          : "Sohoka"}
                      </button>
                    </div>
                  )}
                </div>
              )}

              <Link
                to="/create-listing"
                onClick={closeMenus}
                className="hidden h-11 items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-4 text-[13px] font-black text-white shadow-[0_14px_30px_-15px_rgba(37,99,235,0.9)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_35px_-14px_rgba(37,99,235,0.95)] sm:flex sm:px-5"
              >
                <Icon name="plus" size={16} />
                Gurisha
              </Link>

              <button
                type="button"
                onClick={() =>
                  setShowMobileMenu(
                    (current) => !current,
                  )
                }
                className="flex h-10 w-10 items-center justify-center rounded-xl border bg-white/60 text-slate-700 backdrop-blur-xl transition hover:border-blue-500/30 hover:text-blue-600 sm:hidden"
                style={{
                  borderColor:
                    "rgba(148,163,184,0.18)",
                }}
                aria-label={
                  showMobileMenu
                    ? "Funga menu"
                    : "Fungura menu"
                }
              >
                <Icon
                  name={
                    showMobileMenu
                      ? "close"
                      : "menu"
                  }
                  size={19}
                />
              </button>
            </div>
          </div>
        </div>

        {showMobileMenu && (
          <div className="px-3 pt-2 sm:hidden">
            <div
              className="mx-auto max-w-7xl overflow-hidden rounded-[1.35rem] border p-2.5 shadow-[0_30px_80px_-30px_rgba(15,23,42,0.28)]"
              style={{
                background:
                  "linear-gradient(145deg, rgba(255,255,255,0.96), rgba(239,246,255,0.90))",
                borderColor:
                  "rgba(37,99,235,0.14)",
                backdropFilter: "blur(28px)",
                WebkitBackdropFilter:
                  "blur(28px)",
              }}
            >
              <div className="space-y-0.5">
                {[
                  ["#", "Ahabanza", "grid"],
                  [
                    "#categories",
                    "Ibyiciro",
                    "grid",
                  ],
                  [
                    "#listings",
                    "Ibicuruzwa",
                    "shopping-bag",
                  ],
                  ["#about", "Ibyo dukora", "info"],
                  [
                    "#how-it-works",
                    "Uko rukora",
                    "check",
                  ],
                ].map(([href, label, icon]) => (
                  <a
                    key={label}
                    href={href}
                    onClick={closeMenus}
                    className="flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-bold text-slate-800 transition hover:bg-blue-50 hover:text-blue-600"
                  >
                    <Icon
                      name={icon as IconName}
                      size={18}
                    />
                    {label}
                  </a>
                ))}

                <Link
                  to="/ai-search"
                  onClick={closeMenus}
                  className="flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-bold text-slate-800 transition hover:bg-blue-50 hover:text-blue-600"
                >
                  <Icon name="spark" size={18} />
                  AI Search
                </Link>

                <div className="my-2 border-t border-slate-200/70" />

                <Link
                  to="/create-listing"
                  onClick={closeMenus}
                  className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-3.5 text-sm font-black text-white shadow-[0_14px_30px_-15px_rgba(37,99,235,0.9)] transition hover:-translate-y-0.5"
                >
                  <Icon name="plus" size={17} />
                  Gurisha ikintu
                </Link>

                {!userId ? (
                  <Link
                    to="/login"
                    onClick={closeMenus}
                    className="mt-1 flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-black text-slate-800 transition hover:bg-blue-50 hover:text-blue-600"
                  >
                    <Icon name="user" size={18} />
                    Injira
                  </Link>
                ) : (
                  <>
                    <div className="mt-2 rounded-xl bg-blue-50/80 p-3">
                      <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white">
                          <Icon name="user" size={17} />
                        </span>

                        <div>
                          <p className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">
                            Konti yanjye
                          </p>

                          <p className="mt-0.5 text-sm font-black text-slate-900">
                            KUGURISHA.COM
                          </p>
                        </div>
                      </div>
                    </div>

                    <Link
                      to="/profile"
                      onClick={closeMenus}
                      className="flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-bold text-slate-800 transition hover:bg-blue-50 hover:text-blue-600"
                    >
                      <Icon name="user" size={18} />
                      Profile yanjye
                    </Link>

                    <Link
                      to="/dashboard"
                      onClick={closeMenus}
                      className="flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-bold text-slate-800 transition hover:bg-blue-50 hover:text-blue-600"
                    >
                      <Icon name="store" size={18} />
                      Dashboard
                    </Link>

                    <Link
                      to="/favorites"
                      onClick={closeMenus}
                      className="flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-bold text-slate-800 transition hover:bg-blue-50 hover:text-blue-600"
                    >
                      <Icon name="heart" size={18} />
                      Ibyakunzwe
                    </Link>

                    <Link
                      to="/messages"
                      onClick={closeMenus}
                      className="flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-bold text-slate-800 transition hover:bg-blue-50 hover:text-blue-600"
                    >
                      <Icon name="message" size={18} />
                      Ubutumwa
                    </Link>

                    <Link
                      to="/notifications"
                      onClick={closeMenus}
                      className="flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-bold text-slate-800 transition hover:bg-blue-50 hover:text-blue-600"
                    >
                      <Icon name="bell" size={18} />
                      Notifications

                      {unreadCount > 0 && (
                        <span className="ml-auto rounded-full bg-red-500 px-2 py-0.5 text-[9px] font-black text-white">
                          {unreadCount > 99
                            ? "99+"
                            : unreadCount}
                        </span>
                      )}
                    </Link>

                    <button
                      type="button"
                      onClick={handleLogout}
                      disabled={loggingOut}
                      className="flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-left text-sm font-black text-red-500 transition hover:bg-red-50 disabled:opacity-60"
                    >
                      <Icon name="logout" size={18} />
                      {loggingOut
                        ? "Turimo gusohoka..."
                        : "Sohoka"}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* =====================================================
          SMALL SEARCH — DIRECTLY UNDER HEADER
      ===================================================== */}

      <section className="relative z-30 border-b border-slate-200/60 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6">
          <div className="mx-auto max-w-3xl">
            <div
              className="rounded-2xl border p-1.5 shadow-[0_15px_40px_-28px_rgba(37,99,235,0.35)]"
              style={{
                background:
                  "linear-gradient(135deg, rgba(255,255,255,0.96), rgba(239,246,255,0.88))",
                borderColor:
                  "rgba(37,99,235,0.12)",
                backdropFilter: "blur(22px)",
                WebkitBackdropFilter:
                  "blur(22px)",
              }}
            >
              <div className="flex items-center gap-1.5">
                <div className="relative min-w-0 flex-1">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500">
                    <Icon name="search" size={17} />
                  </span>

                  <input
                    type="text"
                    value={search}
                    onChange={(e) =>
                      setSearch(e.target.value)
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        scrollToListings()
                      }
                    }}
                    placeholder="Urashaka iki? laptop, iPhone, inzu..."
                    className="h-11 w-full rounded-xl border border-slate-200/70 bg-white/80 px-10 pr-3 text-[13px] font-medium text-slate-900 outline-none placeholder:text-slate-400 transition focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
                  />
                </div>

                <button
                  type="button"
                  onClick={scrollToListings}
                  className="flex h-11 shrink-0 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 text-xs font-black text-white shadow-[0_10px_22px_-12px_rgba(37,99,235,0.9)] transition hover:-translate-y-0.5 active:scale-[0.98]"
                >
                  <Icon name="search" size={15} />
                  <span>Shakisha</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          HERO + LISTINGS SLIDER
      ===================================================== */}

      <section
        id="listings"
        className="relative overflow-hidden bg-[#f7faff]"
      >
        <div className="pointer-events-none absolute -left-32 top-10 h-80 w-80 rounded-full bg-blue-500/[0.08] blur-3xl" />

        <div className="pointer-events-none absolute -right-32 top-20 h-96 w-96 rounded-full bg-cyan-400/[0.08] blur-3xl" />

        <div className="pointer-events-none absolute left-1/2 top-0 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-blue-400/[0.045] blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:py-16">
          <div className="grid items-center gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:gap-12">

            {/* LEFT */}

            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/15 bg-white/70 px-3.5 py-2 text-[10px] font-black uppercase tracking-[0.15em] text-blue-600 shadow-sm backdrop-blur-xl">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 text-white">
                  <Icon
                    name="check"
                    size={11}
                    strokeWidth={2.5}
                  />
                </span>

                Isoko ryawe ryo mu Rwanda
              </div>

              <h1 className="mt-6 text-4xl font-black leading-[0.98] tracking-[-0.055em] text-slate-950 sm:text-5xl lg:text-[58px]">
                Gura icyo ushaka.
                <br />
                <span className="bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 bg-clip-text text-transparent">
                  Gurisha icyo ufite.
                </span>
              </h1>

              <p className="mt-5 max-w-lg text-sm leading-7 text-slate-600 sm:text-base">
                KUGURISHA.COM ni urubuga ruhuza
                abaguzi n'abagurisha mu Rwanda,
                ahantu hamwe kandi mu buryo bworoshye.
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <Link
                  to="/create-listing"
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-3 text-sm font-black text-white shadow-[0_14px_30px_-15px_rgba(37,99,235,0.9)] transition hover:-translate-y-0.5"
                >
                  <Icon name="plus" size={16} />
                  Gurisha
                </Link>

                <Link
                  to="/ai-search"
                  className="flex items-center gap-2 rounded-xl border border-blue-500/15 bg-white/70 px-5 py-3 text-sm font-bold text-blue-600 shadow-sm backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-white"
                >
                  <Icon name="spark" size={16} />
                  Baza AI
                </Link>
              </div>

              <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-[11px] font-semibold text-slate-500">
                <span className="flex items-center gap-1.5">
                  <Icon
                    name="shield"
                    size={14}
                    strokeWidth={2}
                  />
                  Byoroshye gukoresha
                </span>

                <span className="flex items-center gap-1.5">
                  <Icon
                    name="users"
                    size={14}
                    strokeWidth={2}
                  />
                  Abaguzi n'abagurisha
                </span>

                <span className="flex items-center gap-1.5">
                  <Icon
                    name="map-pin"
                    size={14}
                    strokeWidth={2}
                  />
                  Mu Rwanda
                </span>
              </div>
            </div>

            {/* RIGHT — SLIDER */}

            <div className="min-w-0">
              <div className="mb-4 flex items-end justify-between gap-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-blue-600">
                    Kugezweho
                  </p>

                  <h2 className="mt-1 text-xl font-black tracking-[-0.025em] text-slate-950 sm:text-2xl">
                    Ibicuruzwa bishya
                  </h2>
                </div>

                <span className="hidden text-xs font-semibold text-slate-400 sm:block">
                  Reba ibiri ku isoko
                </span>
              </div>

              {loading ? (
                <div className="flex gap-4 overflow-hidden">
                  {[1, 2, 3].map((item) => (
                    <div
                      key={item}
                      className="w-[235px] shrink-0 overflow-hidden rounded-[1.45rem] border border-slate-200/70 bg-white/70 shadow-sm"
                    >
                      <div className="h-44 animate-pulse bg-blue-50" />

                      <div className="space-y-3 p-4">
                        <div className="h-4 animate-pulse rounded bg-blue-50" />
                        <div className="h-4 w-2/3 animate-pulse rounded bg-blue-50" />
                        <div className="h-3 w-1/2 animate-pulse rounded bg-blue-50" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredListings.length > 0 ? (
                <div className="flex snap-x gap-4 overflow-x-auto pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {filteredListings
                    .slice(0, 8)
                    .map((listing) => (
                      <Link
                        key={listing.id}
                        to={`/listing/${listing.id}`}
                        className="group w-[235px] shrink-0 snap-start overflow-hidden rounded-[1.45rem] border transition duration-300 hover:-translate-y-1 hover:border-blue-400/30 hover:shadow-[0_25px_55px_-25px_rgba(37,99,235,0.40)] sm:w-[255px]"
                        style={{
                          background:
                            "linear-gradient(145deg, rgba(255,255,255,0.94), rgba(239,246,255,0.72))",
                          borderColor:
                            "rgba(148,163,184,0.18)",
                          backdropFilter: "blur(20px)",
                          WebkitBackdropFilter:
                            "blur(20px)",
                        }}
                      >
                        <div className="relative h-44 overflow-hidden bg-blue-50">
                          {images[listing.id] ? (
                            <img
                              src={images[listing.id]}
                              alt={listing.title}
                              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50">
                              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/80 text-slate-400 shadow-sm">
                                <Icon
                                  name="shopping-bag"
                                  size={24}
                                />
                              </div>
                            </div>
                          )}

                          <div className="absolute left-3 top-3 rounded-full border border-white/70 bg-white/80 px-2.5 py-1 text-[9px] font-black text-slate-800 shadow-sm backdrop-blur-xl">
                            {listing.category?.name ||
                              "Ibindi"}
                          </div>
                        </div>

                        <div className="p-4">
                          <h3 className="line-clamp-2 min-h-[2.75rem] text-sm font-black leading-5 text-slate-900 transition group-hover:text-blue-600">
                            {listing.title}
                          </h3>

                          <p className="mt-2 bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-base font-black text-transparent">
                            {formatPrice(listing)}
                          </p>

                          <p className="mt-2 flex items-center gap-1.5 truncate text-[11px] font-medium text-slate-500">
                            <Icon
                              name="map-pin"
                              size={12}
                            />
                            {formatLocation(listing)}
                          </p>

                          <div className="mt-3 flex items-center justify-between border-t border-slate-200/70 pt-3">
                            <span className="text-[10px] font-bold text-slate-400">
                              Reba ibisobanuro
                            </span>

                            <span className="text-blue-600 transition group-hover:translate-x-1">
                              <Icon
                                name="arrow-right"
                                size={15}
                              />
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}
                </div>
              ) : (
                <div className="flex min-h-[300px] items-center justify-center rounded-[1.6rem] border border-slate-200/70 bg-white/70 p-8 text-center shadow-sm backdrop-blur-xl">
                  <div>
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-slate-400">
                      <Icon
                        name="search"
                        size={23}
                      />
                    </div>

                    <h3 className="mt-4 text-base font-black text-slate-900">
                      Nta bicuruzwa bihari
                    </h3>

                    <p className="mt-1 text-xs text-slate-500">
                      Gerageza irindi jambo ryo gushakisha.
                    </p>

                    {search && (
                      <button
                        type="button"
                        onClick={() => setSearch("")}
                        className="mt-4 rounded-xl bg-blue-600 px-4 py-2 text-xs font-black text-white"
                      >
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

      {/* =====================================================
          CATEGORIES
      ===================================================== */}

      <section
        id="categories"
        className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20"
      >
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-blue-600">
              Shakisha byoroshye
            </p>

            <h2 className="mt-2 text-3xl font-black tracking-[-0.035em] text-slate-950 sm:text-4xl">
              Ibyiciro
            </h2>
          </div>

          <span className="hidden text-sm font-medium text-slate-400 sm:block">
            Hitamo icyo ushaka kureba
          </span>
        </div>

        {categories.length > 0 ? (
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() =>
                  selectCategory(category.name)
                }
                className="group relative overflow-hidden rounded-[1.35rem] border p-5 text-left transition duration-300 hover:-translate-y-1.5 hover:border-blue-400/30 hover:shadow-[0_24px_55px_-25px_rgba(37,99,235,0.40)]"
                style={{
                  background:
                    "linear-gradient(145deg, rgba(255,255,255,0.90), rgba(239,246,255,0.62))",
                  borderColor:
                    "rgba(148,163,184,0.18)",
                  backdropFilter: "blur(20px)",
                  WebkitBackdropFilter:
                    "blur(20px)",
                }}
              >
                <div className="pointer-events-none absolute -right-8 -top-8 h-20 w-20 rounded-full bg-blue-500/[0.05] blur-2xl transition duration-300 group-hover:bg-blue-500/[0.12]" />

                <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-50 to-white text-slate-600 transition duration-300 group-hover:scale-105 group-hover:from-blue-600 group-hover:to-cyan-500 group-hover:text-white">
                  <Icon name="grid" size={19} />
                </div>

                <p className="relative mt-4 line-clamp-2 text-sm font-black text-slate-900">
                  {category.name}
                </p>

                <span className="relative mt-3 inline-flex items-center text-[11px] font-bold text-blue-600 opacity-0 transition group-hover:opacity-100">
                  Reba
                  <Icon
                    name="arrow-right"
                    size={13}
                    className="ml-1"
                  />
                </span>
              </button>
            ))}
          </div>
        ) : (
          <div className="mt-8 rounded-[1.5rem] border border-slate-200/70 bg-white/70 p-8 text-center shadow-sm backdrop-blur-xl">
            <p className="text-sm text-slate-400">
              Nta byiciro bihari ubu.
            </p>
          </div>
        )}
      </section>

      {/* =====================================================
          ABOUT
      ===================================================== */}

      <section
        id="about"
        className="relative overflow-hidden border-y"
        style={{
          background:
            "linear-gradient(180deg, #f1f6ff 0%, #f8fbff 100%)",
          borderColor:
            "rgba(148,163,184,0.18)",
        }}
      >
        <div className="pointer-events-none absolute -left-32 top-20 h-80 w-80 rounded-full bg-blue-500/[0.06] blur-3xl" />

        <div className="pointer-events-none absolute -right-32 bottom-0 h-80 w-80 rounded-full bg-cyan-400/[0.06] blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:py-24">
          <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-blue-600">
                Ibyo dukora
              </p>

              <h2 className="mt-3 text-4xl font-black tracking-[-0.045em] text-slate-950 sm:text-5xl">
                Turahuza.
                <br />
                <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                  Tugafasha.
                </span>
              </h2>

              <p className="mt-6 max-w-xl text-base leading-8 text-slate-600">
                KUGURISHA.COM ni marketplace
                y'u Rwanda igamije koroshya uburyo
                abantu bashakamo, baguramo cyangwa
                bagurishamo ibintu n'imitungo.
              </p>

              <p className="mt-4 max-w-xl text-sm leading-7 text-slate-500">
                Kuva ku bicuruzwa bisanzwe kugeza ku
                bintu binini nk'amazu n'ubutaka, intego
                yacu ni ugutanga ahantu hamwe aho
                umuguzi n'ugurisha bashobora kubonana
                no kuvugana mu buryo bworoshye.
              </p>

              <Link
                to="/ai-search"
                className="mt-7 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-3 text-sm font-black text-white shadow-[0_14px_30px_-15px_rgba(37,99,235,0.9)] transition duration-300 hover:-translate-y-0.5"
              >
                Menya KUGURISHA.COM
                <Icon name="arrow-right" size={16} />
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {[
                {
                  icon: "users" as IconName,
                  title: "Abaguzi n'abagurisha",
                  text: "Duhuza abantu bafite icyo bashaka n'abafite icyo bashaka kugurisha.",
                },
                {
                  icon: "shield" as IconName,
                  title: "Uburyo bworoshye",
                  text: "Shakisha, reba amakuru, hanyuma uvugane n'ugurisha.",
                },
                {
                  icon: "map-pin" as IconName,
                  title: "Yubakiye ku Rwanda",
                  text: "Yubakiwe abantu n'ubucuruzi bwo mu Rwanda.",
                },
                {
                  icon: "spark" as IconName,
                  title: "AI Search",
                  text: "Shakisha ukoresheje AI igihe utazi neza aho watangirira.",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="group relative overflow-hidden rounded-[1.7rem] border p-6 transition duration-300 hover:-translate-y-1 hover:shadow-[0_25px_60px_-30px_rgba(37,99,235,0.35)] sm:p-7"
                  style={{
                    background:
                      "linear-gradient(145deg, rgba(255,255,255,0.90), rgba(239,246,255,0.65))",
                    borderColor:
                      "rgba(148,163,184,0.18)",
                    backdropFilter: "blur(22px)",
                    WebkitBackdropFilter:
                      "blur(22px)",
                  }}
                >
                  <div className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-blue-500/[0.06] blur-2xl transition group-hover:bg-blue-500/[0.12]" />

                  <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-[0_12px_25px_-14px_rgba(37,99,235,0.9)]">
                    <Icon name={item.icon} size={21} />
                  </div>

                  <h3 className="relative mt-5 text-lg font-black text-slate-900">
                    {item.title}
                  </h3>

                  <p className="relative mt-2 text-sm leading-6 text-slate-600">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          HOW IT WORKS
      ===================================================== */}

      <section
        id="how-it-works"
        className="relative overflow-hidden bg-[#f7faff]"
      >
        <div className="pointer-events-none absolute left-1/2 top-24 h-96 w-96 -translate-x-1/2 rounded-full bg-blue-500/[0.045] blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-blue-600">
              Uko urubuga rukora
            </p>

            <h2 className="mt-3 text-4xl font-black tracking-[-0.045em] text-slate-950 sm:text-5xl">
              Biroroshye gutangira.
            </h2>

            <p className="mt-5 text-base leading-7 text-slate-600">
              Waba ushaka kugura cyangwa kugurisha,
              KUGURISHA.COM iguha inzira yoroshye yo
              gutangira.
            </p>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            {/* BUYER */}

            <div
              className="relative overflow-hidden rounded-[2rem] border p-7 shadow-[0_25px_70px_-40px_rgba(15,23,42,0.22)] sm:p-9"
              style={{
                background:
                  "linear-gradient(145deg, rgba(255,255,255,0.92), rgba(239,246,255,0.68))",
                borderColor:
                  "rgba(148,163,184,0.18)",
                backdropFilter: "blur(22px)",
                WebkitBackdropFilter:
                  "blur(22px)",
              }}
            >
              <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-blue-500/[0.06] blur-3xl" />

              <div className="relative flex items-center justify-between gap-4">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.16em] text-blue-600">
                    Ku muguzi
                  </p>

                  <h3 className="mt-2 text-2xl font-black text-slate-950">
                    Shaka icyo ukeneye
                  </h3>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-[0_12px_25px_-14px_rgba(37,99,235,0.9)]">
                  <Icon name="search" size={21} />
                </div>
              </div>

              <div className="relative mt-8 space-y-6">
                {[
                  [
                    "01",
                    "Shakisha",
                    "Andika icyo ushaka cyangwa ukoreshe AI Search.",
                    "search",
                  ],
                  [
                    "02",
                    "Reba amakuru",
                    "Reba amafoto, igiciro, aho giherereye n'ibindi.",
                    "info",
                  ],
                  [
                    "03",
                    "Vugana n'ugurisha",
                    "Ohereza ubutumwa cyangwa ukoreshe contact iri ku gicuruzwa.",
                    "message",
                  ],
                  [
                    "04",
                    "Gura",
                    "Mugirane amasezerano mu buryo mwumvikanyeho.",
                    "check",
                  ],
                ].map(
                  ([
                    number,
                    title,
                    description,
                    icon,
                  ]) => (
                    <div
                      key={number}
                      className="flex gap-4"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 text-xs font-black text-white shadow-[0_10px_20px_-12px_rgba(37,99,235,0.8)]">
                        {number}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-black text-slate-900">
                            {title}
                          </h4>

                          <span className="text-blue-600">
                            <Icon
                              name={icon as IconName}
                              size={14}
                            />
                          </span>
                        </div>

                        <p className="mt-1 text-sm leading-6 text-slate-600">
                          {description}
                        </p>
                      </div>
                    </div>
                  ),
                )}
              </div>
            </div>

            {/* SELLER */}

            <div
              className="relative overflow-hidden rounded-[2rem] border p-7 shadow-[0_25px_70px_-40px_rgba(15,23,42,0.22)] sm:p-9"
              style={{
                background:
                  "linear-gradient(145deg, rgba(255,255,255,0.92), rgba(239,246,255,0.68))",
                borderColor:
                  "rgba(148,163,184,0.18)",
                backdropFilter: "blur(22px)",
                WebkitBackdropFilter:
                  "blur(22px)",
              }}
            >
              <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-cyan-400/[0.07] blur-3xl" />

              <div className="relative flex items-center justify-between gap-4">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.16em] text-blue-600">
                    Ku ugurisha
                  </p>

                  <h3 className="mt-2 text-2xl font-black text-slate-950">
                    Shyira ikintu ku isoko
                  </h3>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-[0_12px_25px_-14px_rgba(37,99,235,0.9)]">
                  <Icon name="store" size={21} />
                </div>
              </div>

              <div className="relative mt-8 space-y-6">
                {[
                  [
                    "01",
                    "Fungura konti",
                    "Injira cyangwa wiyandikishe kuri KUGURISHA.COM.",
                    "user",
                  ],
                  [
                    "02",
                    "Shyiraho ikicuruzwa",
                    "Ongeraho amafoto, igiciro, location n'amakuru yacyo.",
                    "plus",
                  ],
                  [
                    "03",
                    "Abaguzi bakibone",
                    "Ikicuruzwa cyawe kigaragare ku isoko.",
                    "users",
                  ],
                  [
                    "04",
                    "Ganira nabo",
                    "Abaguzi bashobora kukwandikira no kubaza amakuru.",
                    "message",
                  ],
                ].map(
                  ([
                    number,
                    title,
                    description,
                    icon,
                  ]) => (
                    <div
                      key={number}
                      className="flex gap-4"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 text-xs font-black text-white shadow-[0_10px_20px_-12px_rgba(37,99,235,0.8)]">
                        {number}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-black text-slate-900">
                            {title}
                          </h4>

                          <span className="text-blue-600">
                            <Icon
                              name={icon as IconName}
                              size={14}
                            />
                          </span>
                        </div>

                        <p className="mt-1 text-sm leading-6 text-slate-600">
                          {description}
                        </p>
                      </div>
                    </div>
                  ),
                )}
              </div>

              <Link
                to="/create-listing"
                className="relative mt-8 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-3.5 text-sm font-black text-white shadow-[0_14px_30px_-15px_rgba(37,99,235,0.9)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_35px_-14px_rgba(37,99,235,0.9)]"
              >
                Tangira kugurisha
                <Icon name="arrow-right" size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          ALL LISTINGS / SEARCH RESULTS
      ===================================================== */}

      <section
        id="all-listings"
        className="relative overflow-hidden border-y"
        style={{
          background:
            "linear-gradient(180deg, #f1f6ff 0%, #f8fbff 48%, #eef6ff 100%)",
          borderColor:
            "rgba(148,163,184,0.18)",
        }}
      >
        <div className="pointer-events-none absolute -left-32 top-20 h-80 w-80 rounded-full bg-blue-500/[0.06] blur-3xl" />

        <div className="pointer-events-none absolute -right-32 bottom-10 h-96 w-96 rounded-full bg-cyan-400/[0.06] blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-20">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-blue-600">
                Ku isoko ubu
              </p>

              <h2 className="mt-2 text-3xl font-black tracking-[-0.035em] text-slate-950 sm:text-4xl">
                Ibicuruzwa byose
              </h2>

              {search && (
                <p className="mt-2 text-sm text-slate-500">
                  Ibisubizo bya:{" "}
                  <span className="font-bold text-slate-900">
                    {search}
                  </span>
                </p>
              )}
            </div>

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="flex items-center gap-2 self-start rounded-xl bg-white/70 px-4 py-2.5 text-sm font-bold text-slate-600 shadow-sm backdrop-blur-xl transition hover:-translate-y-0.5 hover:text-blue-600 sm:self-auto"
              >
                <Icon name="close" size={14} />
                Siba search
              </button>
            )}
          </div>

          {/* LOADING */}

          {loading && (
            <div className="grid gap-5 pt-9 sm:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="overflow-hidden rounded-[1.6rem] border border-slate-200/70 bg-white/70 shadow-sm backdrop-blur-xl"
                >
                  <div className="h-56 animate-pulse bg-blue-50" />

                  <div className="space-y-3 p-5">
                    <div className="h-5 animate-pulse rounded-lg bg-blue-50" />

                    <div className="h-5 w-2/3 animate-pulse rounded-lg bg-blue-50" />

                    <div className="h-4 w-1/2 animate-pulse rounded-lg bg-blue-50" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ERROR */}

          {error && !loading && (
            <div className="mt-9 rounded-[1.6rem] border border-red-500/20 bg-red-500/10 p-7 backdrop-blur-xl">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 text-red-500">
                  <Icon name="info" size={19} />
                </div>

                <div>
                  <p className="font-black text-red-500">
                    Habaye ikibazo
                  </p>

                  <p className="mt-1 text-sm text-red-400">
                    {error}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={loadHome}
                className="mt-5 flex items-center gap-2 rounded-xl bg-gradient-to-r from-red-500 to-rose-500 px-5 py-2.5 text-sm font-black text-white shadow-[0_12px_25px_-15px_rgba(239,68,68,0.9)] transition hover:-translate-y-0.5"
              >
                <Icon name="refresh" size={15} />
                Ongera ugerageze
              </button>
            </div>
          )}

          {/* EMPTY */}

          {!loading &&
            !error &&
            filteredListings.length === 0 && (
              <div className="mt-9 rounded-[1.6rem] border border-slate-200/70 bg-white/70 px-6 py-16 text-center shadow-sm backdrop-blur-xl">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 text-slate-500">
                  <Icon name="search" size={25} />
                </div>

                <h3 className="mt-5 text-xl font-black text-slate-900">
                  Nta kintu twabonye
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                  Gerageza irindi jambo cyangwa urebe
                  ibyiciro biri hejuru.
                </p>

                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="mt-6 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-2.5 text-sm font-black text-white shadow-[0_12px_25px_-14px_rgba(37,99,235,0.9)] transition hover:-translate-y-0.5"
                  >
                    Reba byose
                  </button>
                )}
              </div>
            )}

          {/* LISTINGS GRID */}

          {!loading &&
            !error &&
            filteredListings.length > 0 && (
              <div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {filteredListings.map((listing) => (
                  <Link
                    key={listing.id}
                    to={`/listing/${listing.id}`}
                    className="group overflow-hidden rounded-[1.6rem] border transition duration-300 hover:-translate-y-1.5 hover:border-blue-400/30 hover:shadow-[0_28px_60px_-28px_rgba(37,99,235,0.38)]"
                    style={{
                      background:
                        "linear-gradient(145deg, rgba(255,255,255,0.94), rgba(239,246,255,0.68))",
                      borderColor:
                        "rgba(148,163,184,0.18)",
                      backdropFilter: "blur(20px)",
                      WebkitBackdropFilter:
                        "blur(20px)",
                    }}
                  >
                    <div className="relative h-56 overflow-hidden bg-blue-50">
                      {images[listing.id] ? (
                        <img
                          src={images[listing.id]}
                          alt={listing.title}
                          loading="lazy"
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50">
                          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/75 text-slate-400 shadow-sm backdrop-blur-xl">
                            <Icon
                              name="shopping-bag"
                              size={27}
                              strokeWidth={1.5}
                            />
                          </div>
                        </div>
                      )}

                      <div
                        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/20 via-transparent to-transparent opacity-60"
                        aria-hidden="true"
                      />

                      <div className="absolute left-3 top-3 rounded-full border border-white/70 bg-white/75 px-3 py-1.5 text-[10px] font-black text-slate-800 shadow-sm backdrop-blur-xl">
                        {listing.category?.name ||
                          "Ibindi"}
                      </div>
                    </div>

                    <div className="p-5">
                      <h3 className="line-clamp-2 min-h-[3rem] text-base font-black leading-6 text-slate-900 transition group-hover:text-blue-600">
                        {listing.title}
                      </h3>

                      <p className="mt-3 bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-lg font-black tracking-tight text-transparent">
                        {formatPrice(listing)}
                      </p>

                      <div className="mt-4 space-y-2">
                        <p className="flex items-center gap-1.5 line-clamp-1 text-xs font-medium text-slate-500">
                          <Icon
                            name="map-pin"
                            size={13}
                          />
                          {formatLocation(listing)}
                        </p>

                        {formatCondition(
                          listing.condition,
                        ) && (
                          <p className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                            <Icon
                              name="tag"
                              size={13}
                            />
                            {formatCondition(
                              listing.condition,
                            )}
                          </p>
                        )}
                      </div>

                      <div className="mt-5 flex items-center justify-between border-t border-slate-200/70 pt-4">
                        <span className="text-xs font-black text-slate-400">
                          Reba ibisobanuro
                        </span>

                        <span className="text-blue-600 transition group-hover:translate-x-1">
                          <Icon
                            name="arrow-right"
                            size={16}
                          />
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
        </div>
      </section>

      {/* =====================================================
          SELL CTA
      ===================================================== */}

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-20">
        <div
          className="relative overflow-hidden rounded-[2rem] border px-7 py-12 shadow-[0_30px_80px_-35px_rgba(37,99,235,0.35)] sm:px-12 lg:px-16"
          style={{
            background:
              "linear-gradient(135deg, rgba(239,246,255,0.98), rgba(224,242,254,0.90), rgba(239,246,255,0.98))",
            borderColor:
              "rgba(96,165,250,0.20)",
          }}
        >
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-blue-500/[0.12] blur-3xl" />

          <div className="pointer-events-none absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-cyan-400/[0.10] blur-3xl" />

          <div className="pointer-events-none absolute left-1/4 top-1/2 h-40 w-40 rounded-full bg-white/80 blur-3xl" />

          <div className="relative flex flex-col justify-between gap-9 md:flex-row md:items-center">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-blue-600">
                Ufite icyo ushaka kugurisha?
              </p>

              <h2 className="mt-3 max-w-2xl text-3xl font-black tracking-[-0.035em] text-slate-950 sm:text-4xl">
                Shyira ikintu cyawe ku isoko.
              </h2>

              <p className="mt-4 max-w-xl text-sm leading-7 text-slate-600 sm:text-base">
                Shyiraho amafoto, igiciro n'aho
                giherereye. Abaguzi bashobore kukibona
                kuri KUGURISHA.COM.
              </p>
            </div>

            <Link
              to="/create-listing"
              className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-7 py-4 text-sm font-black text-white shadow-[0_16px_35px_-16px_rgba(37,99,235,0.9)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_40px_-15px_rgba(37,99,235,0.9)]"
            >
              Tangira kugurisha
              <Icon name="arrow-right" size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer
        className="border-t"
        style={{
          background:
            "linear-gradient(180deg, #f8fbff 0%, #eef5ff 100%)",
          borderColor:
            "rgba(148,163,184,0.18)",
        }}
      >
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <Link
                to="/"
                className="text-xl font-black tracking-[-0.05em] text-slate-950"
              >
                KUGURISHA
                <span className="text-blue-600">
                  .COM
                </span>
              </Link>

              <p className="mt-4 max-w-xs text-sm leading-6 text-slate-600">
                Isoko rihuza abaguzi n'abagurisha
                mu Rwanda.
              </p>
            </div>

            <div>
              <p className="text-xs font-black uppercase tracking-[0.15em] text-slate-900">
                Urubuga
              </p>

              <div className="mt-4 space-y-3">
                <a
                  href="#categories"
                  className="block text-sm text-slate-500 transition hover:text-blue-600"
                >
                  Ibyiciro
                </a>

                <a
                  href="#listings"
                  className="block text-sm text-slate-500 transition hover:text-blue-600"
                >
                  Ibicuruzwa
                </a>

                <a
                  href="#about"
                  className="block text-sm text-slate-500 transition hover:text-blue-600"
                >
                  Ibyo dukora
                </a>

                <a
                  href="#how-it-works"
                  className="block text-sm text-slate-500 transition hover:text-blue-600"
                >
                  Uko urubuga rukora
                </a>
              </div>
            </div>

            <div>
              <p className="text-xs font-black uppercase tracking-[0.15em] text-slate-900">
                Konti
              </p>

              <div className="mt-4 space-y-3">
                <Link
                  to="/login"
                  className="block text-sm text-slate-500 transition hover:text-blue-600"
                >
                  Injira
                </Link>

                <Link
                  to="/register"
                  className="block text-sm text-slate-500 transition hover:text-blue-600"
                >
                  Iyandikishe
                </Link>

                <Link
                  to="/create-listing"
                  className="block text-sm text-slate-500 transition hover:text-blue-600"
                >
                  Gurisha
                </Link>

                <Link
                  to="/ai-search"
                  className="block text-sm text-slate-500 transition hover:text-blue-600"
                >
                  AI Search
                </Link>
              </div>
            </div>

            <div>
              <p className="text-xs font-black uppercase tracking-[0.15em] text-slate-900">
                KUGURISHA.COM
              </p>

              <p className="mt-4 text-sm leading-6 text-slate-600">
                Gura. Gurisha. Bihuze.
              </p>

              <p className="mt-3 text-xs text-slate-400">
                © {new Date().getFullYear()} KUGURISHA.COM
              </p>
            </div>
          </div>

          <div className="mt-10 border-t border-slate-200/70 pt-6">
            <p className="text-xs text-slate-400">
              KUGURISHA.COM — Isoko ryawe ryo mu Rwanda. &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              
              Yakozwe na East African Developers Foundation
            </p>
          </div>
        </div>
      </footer>
    </main>
  )
}

export default Home