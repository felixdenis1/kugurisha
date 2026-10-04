import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"

import { supabase } from "../services/supabase"
import { useTheme } from "../components/ThemeProvider"

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

function Home() {
  const { theme, toggleTheme } = useTheme()

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

        alert(
          "Ntibyashobotse gusohoka. Ongera ugerageze.",
        )

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

      const loadedListings: Listing[] = (
        listingData || []
      ).map((listing: any) => ({
        ...listing,

        category: Array.isArray(listing.category)
          ? listing.category[0] ?? null
          : listing.category ?? null,

        location: Array.isArray(listing.location)
          ? listing.location[0] ?? null
          : listing.location ?? null,
      }))

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
                imageMap[image.listing_id] =
                  image.image_url
              }
            },
          )

          setImages(imageMap)
        }
      }
    } catch (err) {
      console.error(err)

      setError(
        "Habaye ikibazo mu kuzana amakuru.",
      )
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

    return `${Number(
      listing.price,
    ).toLocaleString("en-US")} Frw`
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

  function formatCondition(
    condition: string | null,
  ) {
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
        listing.title
          .toLowerCase()
          .includes(query) ||
        listing.description
          ?.toLowerCase()
          .includes(query) ||
        listing.category?.name
          .toLowerCase()
          .includes(query) ||
        formatLocation(listing)
          .toLowerCase()
          .includes(query)
      )
    })
  }, [listings, search])

  const featuredListings = useMemo(() => {
    return listings.slice(0, 6)
  }, [listings])

  function closeMenus() {
    setShowUserMenu(false)
    setShowMobileMenu(false)
  }

  function scrollToListings() {
    document
      .getElementById("listings")
      ?.scrollIntoView({
        behavior: "smooth",
      })
  }

  function selectCategory(categoryName: string) {
    setSearch(categoryName)

    requestAnimationFrame(() => {
      document
        .getElementById("listings")
        ?.scrollIntoView({
          behavior: "smooth",
        })
    })
  }

  return (
    <main
      className="min-h-screen transition-colors duration-300"
      style={{
        backgroundColor: "var(--bg)",
        color: "var(--text)",
      }}
    >
      {/* =====================================================
          NAVBAR
      ===================================================== */}

      {/* =====================================================
    KUGURISHA.COM — SIGNATURE HEADER
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
        backgroundColor:
          "color-mix(in srgb, var(--surface) 92%, transparent)",
        borderColor: headerScrolled
          ? "var(--border-strong)"
          : "var(--border)",
        boxShadow: headerScrolled
          ? "0 18px 50px -28px rgba(0,0,0,0.55)"
          : "0 8px 30px -25px rgba(0,0,0,0.3)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
      }}
    >
      {/* =================================================
          BRAND
      ================================================= */}

      <Link
        to="/"
        onClick={closeMenus}
        className="group flex shrink-0 items-center gap-2.5 rounded-xl px-2 py-1.5"
        aria-label="KUGURISHA.COM Ahabanza"
      >
        <span
          className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl transition duration-300 group-hover:scale-[1.04] sm:h-11 sm:w-11"
          style={{
            backgroundColor: "var(--soft-bg)",
            border: "1px solid var(--border)",
          }}
        >
          <img
            src="/favicon.svg"
            alt="KUGURISHA.COM"
            className="h-[72%] w-[72%] object-contain transition duration-300 group-hover:scale-110"
          />
        </span>

        <span
          className="hidden text-[19px] font-black tracking-[-0.055em] sm:block lg:text-[21px]"
          style={{
            color: "var(--text)",
          }}
        >
          KUGURISHA
          <span className="text-blue-600">.COM</span>
        </span>
      </Link>

      {/* =================================================
          DESKTOP NAVIGATION
      ================================================= */}

      <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 lg:flex">
        <Link
          to="/"
          onClick={closeMenus}
          className="group relative rounded-xl px-3.5 py-2.5 text-[13px] font-bold transition"
          style={{
            color: "var(--text)",
          }}
        >
          <span className="relative z-10">
            Ahabanza
          </span>

          <span
            className="absolute inset-0 -z-0 rounded-xl opacity-100"
            style={{
              backgroundColor: "var(--soft-bg)",
            }}
          />

          <span className="absolute bottom-1.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-blue-600" />
        </Link>

        <a
          href="#categories"
          onClick={closeMenus}
          className="rounded-xl px-3.5 py-2.5 text-[13px] font-semibold transition hover:bg-[var(--soft-bg)] hover:text-blue-600"
          style={{
            color: "var(--text-secondary)",
          }}
        >
          Ibyiciro
        </a>

        <a
          href="#listings"
          onClick={closeMenus}
          className="rounded-xl px-3.5 py-2.5 text-[13px] font-semibold transition hover:bg-[var(--soft-bg)] hover:text-blue-600"
          style={{
            color: "var(--text-secondary)",
          }}
        >
          Ibicuruzwa
        </a>

        <Link
          to="/ai-search"
          onClick={closeMenus}
          className="group flex items-center gap-1.5 rounded-xl px-3.5 py-2.5 text-[13px] font-semibold transition hover:bg-[var(--soft-bg)]"
          style={{
            color: "var(--text-secondary)",
          }}
        >
          <span className="text-blue-600 transition group-hover:scale-110">
            ✦
          </span>

          <span className="transition group-hover:text-blue-600">
            AI Search
          </span>
        </Link>
      </nav>

      {/* =================================================
          RIGHT ACTIONS
      ================================================= */}

      <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
        {/* THEME */}

        <button
          type="button"
          onClick={toggleTheme}
          title={
            theme === "dark"
              ? "Jya kuri Light Mode"
              : "Jya kuri Dark Mode"
          }
          aria-label={
            theme === "dark"
              ? "Jya kuri Light Mode"
              : "Jya kuri Dark Mode"
          }
          className="group flex h-10 w-10 items-center justify-center rounded-xl border transition duration-200 hover:-translate-y-0.5 hover:border-blue-500/30 sm:h-11 sm:w-11"
          style={{
            backgroundColor: "var(--soft-bg)",
            borderColor: "var(--border)",
            color: "var(--text)",
          }}
        >
          <span className="text-base transition duration-300 group-hover:rotate-12 sm:text-lg">
            {theme === "dark" ? "☀️" : "🌙"}
          </span>
        </button>

        {/* NOTIFICATIONS */}

        {userId && (
          <Link
            to="/notifications"
            onClick={closeMenus}
            title="Notifications"
            aria-label="Notifications"
            className="group relative flex h-10 w-10 items-center justify-center rounded-xl border transition duration-200 hover:-translate-y-0.5 hover:border-blue-500/30 sm:h-11 sm:w-11"
            style={{
              backgroundColor: "var(--soft-bg)",
              borderColor: "var(--border)",
              color: "var(--text)",
            }}
          >
            <span className="text-[17px] transition duration-200 group-hover:scale-110 sm:text-lg">
              ♧
            </span>

            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex min-h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-black text-white ring-2 ring-[var(--surface)]">
                {unreadCount > 99
                  ? "99+"
                  : unreadCount}
              </span>
            )}
          </Link>
        )}

        {/* LOGIN */}

        {!userId ? (
          <Link
            to="/login"
            onClick={closeMenus}
            className="hidden rounded-xl px-3.5 py-2.5 text-[13px] font-bold transition hover:bg-[var(--soft-bg)] sm:block"
            style={{
              color: "var(--text)",
            }}
          >
            Injira
          </Link>
        ) : (
          /* ACCOUNT */
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
              className="group flex h-11 items-center gap-2 rounded-xl border px-1.5 pr-2.5 transition duration-200 hover:-translate-y-0.5 hover:border-blue-500/30"
              style={{
                backgroundColor: "var(--soft-bg)",
                borderColor: showUserMenu
                  ? "rgba(37,99,235,0.35)"
                  : "var(--border)",
              }}
            >
              <span
                className="flex h-8 w-8 items-center justify-center rounded-lg text-sm transition duration-200 group-hover:scale-105"
                style={{
                  backgroundColor:
                    "var(--inverse-bg)",
                  color: "var(--inverse-text)",
                }}
              >
                👤
              </span>

              <span
                className="hidden text-[12px] font-black md:block"
                style={{
                  color: "var(--text)",
                }}
              >
                Konti yanjye
              </span>

              <span
                className="ml-0.5 text-[9px] transition duration-200"
                style={{
                  color: "var(--text-muted)",
                  transform: showUserMenu
                    ? "rotate(180deg)"
                    : "rotate(0deg)",
                }}
              >
                ▼
              </span>
            </button>

            {/* ACCOUNT MENU */}

            {showUserMenu && (
              <div
                className="absolute right-0 top-[calc(100%+10px)] w-[292px] overflow-hidden rounded-[1.4rem] border p-2.5 shadow-2xl"
                style={{
                  backgroundColor:
                    "color-mix(in srgb, var(--surface) 97%, transparent)",
                  borderColor:
                    "var(--border-strong)",
                  boxShadow:
                    "0 25px 70px -25px rgba(0,0,0,0.55)",
                  backdropFilter: "blur(24px)",
                  WebkitBackdropFilter:
                    "blur(24px)",
                }}
              >
                <div
                  className="rounded-xl px-3.5 py-3.5"
                  style={{
                    backgroundColor:
                      "var(--soft-bg)",
                  }}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="flex h-10 w-10 items-center justify-center rounded-xl text-sm"
                      style={{
                        backgroundColor:
                          "var(--inverse-bg)",
                        color:
                          "var(--inverse-text)",
                      }}
                    >
                      👤
                    </span>

                    <div className="min-w-0">
                      <p
                        className="text-[9px] font-black uppercase tracking-[0.16em]"
                        style={{
                          color:
                            "var(--text-muted)",
                        }}
                      >
                        Konti yanjye
                      </p>

                      <p
                        className="mt-0.5 truncate text-sm font-black"
                        style={{
                          color: "var(--text)",
                        }}
                      >
                        KUGURISHA.COM
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-2 space-y-0.5">
                  <Link
                    to="/profile"
                    onClick={closeMenus}
                    className="flex items-center gap-3 rounded-xl px-3.5 py-3 text-[13px] font-bold transition hover:bg-[var(--soft-bg-hover)]"
                    style={{
                      color: "var(--text)",
                    }}
                  >
                    <span>👤</span>
                    <span>Profile yanjye</span>
                  </Link>

                  <Link
                    to="/dashboard"
                    onClick={closeMenus}
                    className="flex items-center gap-3 rounded-xl px-3.5 py-3 text-[13px] font-bold transition hover:bg-[var(--soft-bg-hover)]"
                    style={{
                      color: "var(--text)",
                    }}
                  >
                    <span>🏪</span>
                    <span>Dashboard</span>
                  </Link>

                  <Link
                    to="/favorites"
                    onClick={closeMenus}
                    className="flex items-center gap-3 rounded-xl px-3.5 py-3 text-[13px] font-bold transition hover:bg-[var(--soft-bg-hover)]"
                    style={{
                      color: "var(--text)",
                    }}
                  >
                    <span>♡</span>
                    <span>Ibyakunzwe</span>
                  </Link>

                  <Link
                    to="/messages"
                    onClick={closeMenus}
                    className="flex items-center gap-3 rounded-xl px-3.5 py-3 text-[13px] font-bold transition hover:bg-[var(--soft-bg-hover)]"
                    style={{
                      color: "var(--text)",
                    }}
                  >
                    <span>💬</span>
                    <span>Ubutumwa</span>
                  </Link>

                  <Link
                    to="/notifications"
                    onClick={closeMenus}
                    className="flex items-center gap-3 rounded-xl px-3.5 py-3 text-[13px] font-bold transition hover:bg-[var(--soft-bg-hover)]"
                    style={{
                      color: "var(--text)",
                    }}
                  >
                    <span>♧</span>
                    <span>Notifications</span>

                    {unreadCount > 0 && (
                      <span className="ml-auto rounded-full bg-red-500 px-2 py-0.5 text-[9px] font-black text-white">
                        {unreadCount > 99
                          ? "99+"
                          : unreadCount}
                      </span>
                    )}
                  </Link>
                </div>

                <div
                  className="my-2 border-t"
                  style={{
                    borderColor:
                      "var(--border)",
                  }}
                />

                <button
                  type="button"
                  onClick={toggleTheme}
                  className="flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-left text-[13px] font-bold transition hover:bg-[var(--soft-bg-hover)]"
                  style={{
                    color: "var(--text)",
                  }}
                >
                  <span>
                    {theme === "dark"
                      ? "☀️"
                      : "🌙"}
                  </span>

                  <span>
                    {theme === "dark"
                      ? "Light Mode"
                      : "Dark Mode"}
                  </span>

                  <span
                    className="ml-auto text-[9px] font-black uppercase"
                    style={{
                      color:
                        "var(--text-muted)",
                    }}
                  >
                    {theme === "dark"
                      ? "Dark"
                      : "Light"}
                  </span>
                </button>

                <Link
                  to="/profile"
                  onClick={closeMenus}
                  className="flex items-center gap-3 rounded-xl px-3.5 py-3 text-[13px] font-bold transition hover:bg-[var(--soft-bg-hover)]"
                  style={{
                    color: "var(--text)",
                  }}
                >
                  <span>⚙️</span>
                  <span>Settings</span>
                </Link>

                <div
                  className="my-2 border-t"
                  style={{
                    borderColor:
                      "var(--border)",
                  }}
                />

                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-left text-[13px] font-black text-red-500 transition hover:bg-red-500/10 disabled:opacity-60"
                >
                  <span>↪</span>
                  <span>
                    {loggingOut
                      ? "Turimo gusohoka..."
                      : "Sohoka"}
                  </span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* SELL CTA */}

        <Link
          to="/create-listing"
          onClick={closeMenus}
          className="group relative hidden h-11 items-center gap-2 overflow-hidden rounded-xl bg-blue-600 px-4 text-[13px] font-black text-white shadow-[0_10px_25px_-12px_rgba(37,99,235,0.9)] transition duration-200 hover:-translate-y-0.5 hover:bg-blue-700 active:translate-y-0 sm:flex sm:px-5"
        >
          <span className="relative z-10">
            Gurisha
          </span>

          <span className="relative z-10 text-sm transition duration-200 group-hover:translate-x-0.5">
            →
          </span>

          <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition duration-700 group-hover:translate-x-full" />
        </Link>

        {/* MOBILE MENU BUTTON */}

        <button
          type="button"
          onClick={() =>
            setShowMobileMenu(
              (current) => !current,
            )
          }
          className="flex h-10 w-10 items-center justify-center rounded-xl border text-base transition duration-200 hover:border-blue-500/30 sm:hidden"
          style={{
            backgroundColor: "var(--soft-bg)",
            borderColor: "var(--border)",
            color: "var(--text)",
          }}
          aria-label={
            showMobileMenu
              ? "Funga menu"
              : "Fungura menu"
          }
          aria-expanded={showMobileMenu}
        >
          <span
            className="transition duration-200"
            style={{
              transform: showMobileMenu
                ? "rotate(90deg)"
                : "rotate(0deg)",
            }}
          >
            {showMobileMenu ? "✕" : "☰"}
          </span>
        </button>
      </div>
    </div>
  </div>

  {/* =================================================
      MOBILE MENU
  ================================================= */}

  {showMobileMenu && (
    <div className="px-3 pt-2 sm:hidden">
      <div
        className="mx-auto max-w-7xl overflow-hidden rounded-[1.35rem] border p-2.5 shadow-2xl"
        style={{
          backgroundColor:
            "color-mix(in srgb, var(--surface) 97%, transparent)",
          borderColor: "var(--border)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
        }}
      >
        <div className="space-y-0.5">
          <Link
            to="/"
            onClick={closeMenus}
            className="flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-black"
            style={{
              backgroundColor:
                "var(--soft-bg)",
              color: "var(--text)",
            }}
          >
            <span className="text-blue-600">
              ●
            </span>
            <span>Ahabanza</span>
          </Link>

          <a
            href="#categories"
            onClick={closeMenus}
            className="flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-bold transition hover:bg-[var(--soft-bg-hover)]"
            style={{
              color: "var(--text)",
            }}
          >
            <span>◈</span>
            <span>Ibyiciro</span>
          </a>

          <a
            href="#listings"
            onClick={closeMenus}
            className="flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-bold transition hover:bg-[var(--soft-bg-hover)]"
            style={{
              color: "var(--text)",
            }}
          >
            <span>▦</span>
            <span>Ibicuruzwa</span>
          </a>

          <Link
            to="/ai-search"
            onClick={closeMenus}
            className="flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-bold transition hover:bg-[var(--soft-bg-hover)]"
            style={{
              color: "var(--text)",
            }}
          >
            <span className="text-blue-600">
              ✦
            </span>
            <span>AI Search</span>
          </Link>

          <div
            className="my-2 border-t"
            style={{
              borderColor: "var(--border)",
            }}
          />

          <Link
            to="/create-listing"
            onClick={closeMenus}
            className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3.5 text-sm font-black text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
          >
            <span>+</span>
            <span>Gurisha ikintu</span>
          </Link>

          {!userId ? (
            <Link
              to="/login"
              onClick={closeMenus}
              className="mt-1 flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-black transition hover:bg-[var(--soft-bg-hover)]"
              style={{
                color: "var(--text)",
              }}
            >
              <span>👤</span>
              <span>Injira</span>
            </Link>
          ) : (
            <>
              <div
                className="mt-2 rounded-xl p-3"
                style={{
                  backgroundColor:
                    "var(--soft-bg)",
                }}
              >
                <div className="flex items-center gap-3">
                  <span
                    className="flex h-10 w-10 items-center justify-center rounded-xl"
                    style={{
                      backgroundColor:
                        "var(--inverse-bg)",
                      color:
                        "var(--inverse-text)",
                    }}
                  >
                    👤
                  </span>

                  <div>
                    <p
                      className="text-[9px] font-black uppercase tracking-[0.15em]"
                      style={{
                        color:
                          "var(--text-muted)",
                      }}
                    >
                      Konti yanjye
                    </p>

                    <p
                      className="mt-0.5 text-sm font-black"
                      style={{
                        color: "var(--text)",
                      }}
                    >
                      KUGURISHA.COM
                    </p>
                  </div>
                </div>
              </div>

              <Link
                to="/profile"
                onClick={closeMenus}
                className="flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-bold transition hover:bg-[var(--soft-bg-hover)]"
                style={{
                  color: "var(--text)",
                }}
              >
                👤
                <span>Profile yanjye</span>
              </Link>

              <Link
                to="/dashboard"
                onClick={closeMenus}
                className="flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-bold transition hover:bg-[var(--soft-bg-hover)]"
                style={{
                  color: "var(--text)",
                }}
              >
                🏪
                <span>Dashboard</span>
              </Link>

              <Link
                to="/favorites"
                onClick={closeMenus}
                className="flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-bold transition hover:bg-[var(--soft-bg-hover)]"
                style={{
                  color: "var(--text)",
                }}
              >
                ♡
                <span>Ibyakunzwe</span>
              </Link>

              <Link
                to="/messages"
                onClick={closeMenus}
                className="flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-bold transition hover:bg-[var(--soft-bg-hover)]"
                style={{
                  color: "var(--text)",
                }}
              >
                💬
                <span>Ubutumwa</span>
              </Link>

              <Link
                to="/notifications"
                onClick={closeMenus}
                className="flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-bold transition hover:bg-[var(--soft-bg-hover)]"
                style={{
                  color: "var(--text)",
                }}
              >
                ♧
                <span>Notifications</span>

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
                onClick={toggleTheme}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-left text-sm font-bold transition hover:bg-[var(--soft-bg-hover)]"
                style={{
                  color: "var(--text)",
                }}
              >
                <span>
                  {theme === "dark"
                    ? "☀️"
                    : "🌙"}
                </span>

                <span>
                  {theme === "dark"
                    ? "Light Mode"
                    : "Dark Mode"}
                </span>
              </button>

              <Link
                to="/profile"
                onClick={closeMenus}
                className="flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-bold transition hover:bg-[var(--soft-bg-hover)]"
                style={{
                  color: "var(--text)",
                }}
              >
                ⚙️
                <span>Settings</span>
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-left text-sm font-black text-red-500 transition hover:bg-red-500/10 disabled:opacity-60"
              >
                ↪
                <span>
                  {loggingOut
                    ? "Turimo gusohoka..."
                    : "Sohoka"}
                </span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )}
</header>

      {/* =====================================================
          HERO
      ===================================================== */}

      <section
        className="relative overflow-hidden"
        style={{
          backgroundColor: "var(--bg)",
        }}
      >
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />

        <div className="absolute left-1/2 top-20 h-72 w-72 -translate-x-1/2 rounded-full bg-blue-500/10 blur-3xl" />

        <div className="mx-auto max-w-7xl px-4 pb-20 pt-14 sm:px-6 sm:pt-24 lg:pb-24">
          <div className="relative mx-auto max-w-4xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-xs font-black uppercase tracking-wider text-blue-600">
              🇷🇼 Isoko ryawe ryo mu Rwanda
            </div>

            <h1
              className="mt-7 text-5xl font-black leading-[0.98] tracking-[-0.055em] sm:text-6xl lg:text-7xl"
              style={{
                color: "var(--text)",
              }}
            >
              Gura icyo ushaka.
              <br />
              <span className="text-blue-600">
                Gurisha icyo ufite.
              </span>
            </h1>

            <p
              className="mx-auto mt-6 max-w-2xl text-base leading-7 sm:text-lg"
              style={{
                color:
                  "var(--text-secondary)",
              }}
            >
              KUGURISHA.COM igufasha kubona no
              kugurisha ibintu bitandukanye mu
              Rwanda, ahantu hamwe kandi mu buryo
              bworoshye.
            </p>

            {/* SEARCH */}

            <div className="mx-auto mt-9 max-w-3xl">
              <div
                className="flex flex-col gap-3 rounded-[1.5rem] border p-2 shadow-[0_20px_60px_-25px_rgba(15,23,42,0.25)] sm:flex-row"
                style={{
                  backgroundColor:
                    "var(--surface)",
                  borderColor:
                    "var(--border)",
                }}
              >
                <div className="relative flex-1">
                  <span
                    className="absolute left-5 top-1/2 -translate-y-1/2 text-lg"
                    style={{
                      color:
                        "var(--text-muted)",
                    }}
                  >
                    🔎
                  </span>

                  <input
                    type="text"
                    value={search}
                    onChange={(e) =>
                      setSearch(e.target.value)
                    }
                    placeholder="Urashaka iki? Urugero: laptop, iPhone, inzu..."
                    className="h-14 w-full rounded-xl border-0 px-12 pr-4 text-sm font-medium outline-none"
                    style={{
                      backgroundColor:
                        "var(--input-bg)",
                      color:
                        "var(--text)",
                    }}
                  />
                </div>

                <button
                  type="button"
                  onClick={scrollToListings}
                  className="h-14 rounded-xl bg-blue-600 px-8 text-sm font-black text-white transition hover:bg-blue-700 active:scale-[0.98]"
                >
                  Shakisha
                </button>
              </div>

              <Link
                to="/ai-search"
                className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-blue-600 transition hover:text-blue-700"
              >
                ✨
                <span>Baza AI icyo ushaka</span>
                <span
                  style={{
                    color:
                      "var(--text-muted)",
                  }}
                >
                  →
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          CATEGORIES
      ===================================================== */}

      <section
        id="categories"
        className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16"
      >
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">
              Browse
            </p>

            <h2
              className="mt-2 text-3xl font-black tracking-tight"
              style={{
                color: "var(--text)",
              }}
            >
              Ibyiciro
            </h2>
          </div>

          <span
            className="hidden text-sm font-medium sm:block"
            style={{
              color:
                "var(--text-muted)",
            }}
          >
            Hitamo icyo ushaka kureba
          </span>
        </div>

        {categories.length > 0 ? (
          <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() =>
                  selectCategory(category.name)
                }
                className="group rounded-2xl border p-5 text-left transition duration-200 hover:-translate-y-0.5 hover:border-blue-500/30 hover:shadow-lg"
                style={{
                  backgroundColor:
                    "var(--surface)",
                  borderColor:
                    "var(--border)",
                }}
              >
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl text-lg"
                  style={{
                    backgroundColor:
                      "var(--soft-bg)",
                  }}
                >
                  🛍️
                </div>

                <p
                  className="mt-4 line-clamp-2 text-sm font-black"
                  style={{
                    color:
                      "var(--text)",
                  }}
                >
                  {category.name}
                </p>
              </button>
            ))}
          </div>
        ) : (
          <div
            className="mt-7 rounded-2xl border p-8 text-center"
            style={{
              backgroundColor:
                "var(--surface)",
              borderColor:
                "var(--border)",
            }}
          >
            <p
              className="text-sm"
              style={{
                color:
                  "var(--text-muted)",
              }}
            >
              Nta byiciro bihari ubu.
            </p>
          </div>
        )}
      </section>

      {/* =====================================================
          FEATURED LISTINGS CAROUSEL
      ===================================================== */}

      {!loading &&
        !error &&
        featuredListings.length > 0 && (
          <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">
                  Featured
                </p>

                <h2
                  className="mt-2 text-2xl font-black tracking-tight sm:text-3xl"
                  style={{
                    color: "var(--text)",
                  }}
                >
                  Reba ibicuruzwa biri ku isoko
                </h2>
              </div>

              <button
                type="button"
                onClick={scrollToListings}
                className="hidden rounded-full border px-4 py-2 text-sm font-bold transition hover:border-blue-500/30 sm:block"
                style={{
                  backgroundColor:
                    "var(--surface)",
                  borderColor:
                    "var(--border)",
                  color:
                    "var(--text)",
                }}
              >
                Reba byose
              </button>
            </div>

            <div className="mt-7 flex snap-x gap-4 overflow-x-auto pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {featuredListings.map(
                (listing) => (
                  <Link
                    key={listing.id}
                    to={`/listing/${listing.id}`}
                    className="group w-[280px] shrink-0 snap-start overflow-hidden rounded-3xl border transition duration-300 hover:-translate-y-1 hover:border-blue-500/30 sm:w-[320px]"
                    style={{
                      backgroundColor:
                        "var(--surface)",
                      borderColor:
                        "var(--border)",
                    }}
                  >
                    <div
                      className="relative h-48 overflow-hidden"
                      style={{
                        backgroundColor:
                          "var(--soft-bg)",
                      }}
                    >
                      {images[listing.id] ? (
                        <img
                          src={images[listing.id]}
                          alt={listing.title}
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-5xl opacity-50">
                          🛍️
                        </div>
                      )}

                      <div
                        className="absolute left-3 top-3 rounded-full border px-3 py-1.5 text-[11px] font-black backdrop-blur"
                        style={{
                          backgroundColor:
                            "color-mix(in srgb, var(--surface) 90%, transparent)",
                          borderColor:
                            "var(--border)",
                          color:
                            "var(--text)",
                        }}
                      >
                        {listing.category
                          ?.name || "Ibindi"}
                      </div>
                    </div>

                    <div className="p-5">
                      <h3
                        className="line-clamp-2 text-base font-black"
                        style={{
                          color:
                            "var(--text)",
                        }}
                      >
                        {listing.title}
                      </h3>

                      <p className="mt-3 text-lg font-black text-blue-600">
                        {formatPrice(
                          listing,
                        )}
                      </p>

                      <p
                        className="mt-2 line-clamp-1 text-xs"
                        style={{
                          color:
                            "var(--text-secondary)",
                        }}
                      >
                        📍{" "}
                        {formatLocation(
                          listing,
                        )}
                      </p>
                    </div>
                  </Link>
                ),
              )}
            </div>
          </section>
        )}

      {/* =====================================================
          LISTINGS
      ===================================================== */}

      <section
        id="listings"
        className="border-y"
        style={{
          backgroundColor:
            "var(--bg-secondary)",
          borderColor:
            "var(--border)",
        }}
      >
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">
                Kugezweho
              </p>

              <h2
                className="mt-2 text-3xl font-black tracking-tight"
                style={{
                  color: "var(--text)",
                }}
              >
                Ibicuruzwa bishya
              </h2>

              {search && (
                <p
                  className="mt-2 text-sm"
                  style={{
                    color:
                      "var(--text-muted)",
                  }}
                >
                  Ibisubizo bya:{" "}
                  <span
                    className="font-bold"
                    style={{
                      color:
                        "var(--text)",
                    }}
                  >
                    {search}
                  </span>
                </p>
              )}
            </div>

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="self-start rounded-full px-4 py-2 text-sm font-bold transition hover:opacity-80 sm:self-auto"
                style={{
                  backgroundColor:
                    "var(--soft-bg)",
                  color:
                    "var(--text-secondary)",
                }}
              >
                Siba search ×
              </button>
            )}
          </div>

          {/* LOADING */}

          {loading && (
            <div className="grid gap-5 pt-9 sm:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="overflow-hidden rounded-3xl border"
                  style={{
                    backgroundColor:
                      "var(--surface)",
                    borderColor:
                      "var(--border)",
                  }}
                >
                  <div
                    className="h-56 animate-pulse"
                    style={{
                      backgroundColor:
                        "var(--soft-bg)",
                    }}
                  />

                  <div className="space-y-3 p-5">
                    <div
                      className="h-5 animate-pulse rounded-lg"
                      style={{
                        backgroundColor:
                          "var(--soft-bg)",
                      }}
                    />

                    <div
                      className="h-5 w-2/3 animate-pulse rounded-lg"
                      style={{
                        backgroundColor:
                          "var(--soft-bg)",
                      }}
                    />

                    <div
                      className="h-4 w-1/2 animate-pulse rounded-lg"
                      style={{
                        backgroundColor:
                          "var(--soft-bg)",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ERROR */}

          {error && !loading && (
            <div className="mt-9 rounded-3xl border border-red-500/20 bg-red-500/10 p-7">
              <p className="font-black text-red-500">
                Habaye ikibazo
              </p>

              <p className="mt-1 text-sm text-red-400">
                {error}
              </p>

              <button
                type="button"
                onClick={loadHome}
                className="mt-5 rounded-full bg-red-500 px-5 py-2.5 text-sm font-black text-white transition hover:bg-red-600"
              >
                Ongera ugerageze
              </button>
            </div>
          )}

          {/* EMPTY */}

          {!loading &&
            !error &&
            filteredListings.length === 0 && (
              <div
                className="mt-9 rounded-3xl border px-6 py-16 text-center"
                style={{
                  backgroundColor:
                    "var(--surface)",
                  borderColor:
                    "var(--border)",
                }}
              >
                <div
                  className="mx-auto flex h-16 w-16 items-center justify-center rounded-full text-2xl"
                  style={{
                    backgroundColor:
                      "var(--soft-bg)",
                  }}
                >
                  🔎
                </div>

                <h3
                  className="mt-5 text-xl font-black"
                  style={{
                    color:
                      "var(--text)",
                  }}
                >
                  Nta kintu twabonye
                </h3>

                <p
                  className="mx-auto mt-2 max-w-md text-sm leading-6"
                  style={{
                    color:
                      "var(--text-secondary)",
                  }}
                >
                  Gerageza irindi jambo cyangwa
                  urebe ibyiciro biri hejuru.
                </p>

                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="mt-6 rounded-full bg-blue-600 px-5 py-2.5 text-sm font-black text-white transition hover:bg-blue-700"
                  >
                    Reba byose
                  </button>
                )}
              </div>
            )}

          {/* LISTINGS */}

          {!loading &&
            !error &&
            filteredListings.length > 0 && (
              <div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {filteredListings.map(
                  (listing) => (
                    <Link
                      key={listing.id}
                      to={`/listing/${listing.id}`}
                      className="group overflow-hidden rounded-3xl border transition duration-300 hover:-translate-y-1 hover:border-blue-500/30 hover:shadow-[0_20px_45px_-20px_rgba(15,23,42,0.25)]"
                      style={{
                        backgroundColor:
                          "var(--surface)",
                        borderColor:
                          "var(--border)",
                      }}
                    >
                      {/* IMAGE */}

                      <div
                        className="relative h-56 overflow-hidden"
                        style={{
                          backgroundColor:
                            "var(--soft-bg)",
                        }}
                      >
                        {images[listing.id] ? (
                          <img
                            src={
                              images[
                                listing.id
                              ]
                            }
                            alt={
                              listing.title
                            }
                            loading="lazy"
                            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <div className="text-center">
                              <div className="text-5xl opacity-50">
                                🛍️
                              </div>

                              <p
                                className="mt-2 text-xs font-semibold"
                                style={{
                                  color:
                                    "var(--text-muted)",
                                }}
                              >
                                Nta foto
                              </p>
                            </div>
                          </div>
                        )}

                        <div
                          className="absolute left-3 top-3 rounded-full border px-3 py-1.5 text-[11px] font-black shadow-sm backdrop-blur"
                          style={{
                            backgroundColor:
                              "color-mix(in srgb, var(--surface) 90%, transparent)",
                            borderColor:
                              "var(--border)",
                            color:
                              "var(--text)",
                          }}
                        >
                          {listing.category
                            ?.name ||
                            "Ibindi"}
                        </div>
                      </div>

                      {/* CONTENT */}

                      <div className="p-5">
                        <h3
                          className="line-clamp-2 min-h-[3rem] text-base font-black leading-6 transition group-hover:text-blue-600"
                          style={{
                            color:
                              "var(--text)",
                          }}
                        >
                          {listing.title}
                        </h3>

                        <p className="mt-3 text-lg font-black tracking-tight text-blue-600">
                          {formatPrice(
                            listing,
                          )}
                        </p>

                        <div className="mt-4 space-y-2">
                          <p
                            className="line-clamp-1 text-xs font-medium"
                            style={{
                              color:
                                "var(--text-secondary)",
                            }}
                          >
                            📍{" "}
                            {formatLocation(
                              listing,
                            )}
                          </p>

                          {formatCondition(
                            listing.condition,
                          ) && (
                            <p
                              className="text-xs font-medium"
                              style={{
                                color:
                                  "var(--text-secondary)",
                              }}
                            >
                              🏷️{" "}
                              {formatCondition(
                                listing.condition,
                              )}
                            </p>
                          )}
                        </div>

                        <div
                          className="mt-5 flex items-center justify-between border-t pt-4"
                          style={{
                            borderColor:
                              "var(--border)",
                          }}
                        >
                          <span
                            className="text-xs font-black"
                            style={{
                              color:
                                "var(--text-muted)",
                            }}
                          >
                            Reba ibisobanuro
                          </span>

                          <span className="text-sm font-black text-blue-600 transition group-hover:translate-x-1">
                            →
                          </span>
                        </div>
                      </div>
                    </Link>
                  ),
                )}
              </div>
            )}
        </div>
      </section>

      {/* =====================================================
          SELLER CTA
      ===================================================== */}

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16">
        <div className="relative overflow-hidden rounded-[2rem] bg-slate-950 px-7 py-12 text-white sm:px-12 lg:px-16">
          <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-blue-600/20 blur-3xl" />

          <div className="absolute -bottom-32 left-1/3 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />

          <div className="relative flex flex-col justify-between gap-9 md:flex-row md:items-center">
            <div>
              <p className="text-sm font-bold text-blue-300">
                Ufite icyo ushaka kugurisha?
              </p>

              <h2 className="mt-3 max-w-2xl text-3xl font-black tracking-tight sm:text-4xl">
                Shyira ikintu cyawe ku isoko.
              </h2>

              <p className="mt-4 max-w-xl text-sm leading-7 text-slate-400 sm:text-base">
                Shyiraho amafoto, igiciro n'aho
                giherereye. Abaguzi bashobore
                kukibona kuri KUGURISHA.COM.
              </p>
            </div>

            <Link
              to="/create-listing"
              className="shrink-0 rounded-full bg-white px-7 py-4 text-center text-sm font-black text-slate-950 transition hover:bg-blue-50"
            >
              Tangira kugurisha →
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
          backgroundColor: "var(--bg)",
          borderColor: "var(--border)",
        }}
      >
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-8 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p
            className="font-bold"
            style={{
              color: "var(--text)",
            }}
          >
            KUGURISHA
            <span className="text-blue-600">
              .COM
            </span>
          </p>

          <p
            style={{
              color:
                "var(--text-muted)",
            }}
          >
            © {new Date().getFullYear()} · Gura.
            Gurisha. Bihuze.
          </p>
        </div>
      </footer>
    </main>
  )
}

export default Home