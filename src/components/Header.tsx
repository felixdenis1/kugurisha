// src/components/Header.tsx

import { useEffect, useState } from "react"
import {
  Link,
  NavLink,
  useLocation,
  useNavigate,
} from "react-router-dom"

import { supabase } from "../services/supabase"
import { useTheme } from "./ThemeProvider"

type HeaderProps = {
  searchValue?: string
  onSearchChange?: (value: string) => void
  onSearchSubmit?: () => void
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
  | "spark"
  | "plus"
  | "shopping-bag"
  | "chevron-down"
  | "info"
  | "grid"
  | "check"
  | "sun"
  | "moon"

function Icon({
  name,
  size = 18,
}: {
  name: IconName
  size?: number
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
    "aria-hidden": true as const,
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
          <circle cx="12" cy="12" r="3" />
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

    case "spark":
      return (
        <svg {...common}>
          <path d="m12 3 1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5L12 3Z" />
          <path d="m19 16 .7 2.3L22 19l-2.3.7L19 22l-.7-2.3L16 19l2.3-.7L19 16Z" />
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

    case "grid":
      return (
        <svg {...common}>
          <rect x="4" y="4" width="6" height="6" rx="1" />
          <rect x="14" y="4" width="6" height="6" rx="1" />
          <rect x="4" y="14" width="6" height="6" rx="1" />
          <rect x="14" y="14" width="6" height="6" rx="1" />
        </svg>
      )

    case "check":
      return (
        <svg {...common}>
          <path d="m5 12 4 4L19 6" />
        </svg>
      )

    case "sun":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" />
        </svg>
      )

    case "moon":
      return (
        <svg {...common}>
          <path d="M20.2 15.1A8.5 8.5 0 0 1 8.9 3.8 8.5 8.5 0 1 0 20.2 15.1Z" />
        </svg>
      )

    default:
      return null
  }
}

const navigation = [
  { label: "Ahabanza", to: "/" },
  { label: "Ibyiciro", to: "/categories" },
  { label: "Ibyo dukora", to: "/about" },
  { label: "Uko rukora", to: "/how-it-works" },
]

export default function Header({
  searchValue,
  onSearchChange,
  onSearchSubmit,
}: HeaderProps) {
  const [userId, setUserId] = useState<string | null>(null)
  const [unreadCount, setUnreadCount] = useState(0)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const [headerScrolled, setHeaderScrolled] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [internalSearchValue, setInternalSearchValue] = useState("")

  const { theme, toggleTheme } = useTheme()
  const location = useLocation()
  const navigate = useNavigate()

  const isDark = theme === "dark"
  const currentSearchValue = searchValue ?? internalSearchValue

  function closeMenus() {
    setShowUserMenu(false)
    setShowMobileMenu(false)
  }

  useEffect(() => {
    let mounted = true

    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!mounted) return

      setUserId(user?.id ?? null)

      if (user?.id) {
        await loadUnreadCount(user.id)
      } else {
        setUnreadCount(0)
      }
    }

    void loadUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const id = session?.user?.id ?? null

      setUserId(id)

      if (id) {
        window.setTimeout(() => {
          void loadUnreadCount(id)
        }, 0)
      } else {
        setUnreadCount(0)
        closeMenus()
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (!userId) return

    const channel = supabase
      .channel(`shared-header-notifications-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
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
      void supabase.removeChannel(channel)
    }
  }, [userId])

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

    setUnreadCount(count ?? 0)
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
      closeMenus()
      navigate("/", { replace: true })
    } catch (error) {
      console.error("Logout error:", error)
      alert("Habaye ikibazo mu gusohoka.")
    } finally {
      setLoggingOut(false)
    }
  }

  function handleSearchSubmit() {
    closeMenus()
    setSearchOpen(false)

    if (onSearchSubmit) {
      onSearchSubmit()
      return
    }

    navigate(`/?search=${encodeURIComponent(currentSearchValue.trim())}`)
  }

  const linkClass = (path: string) =>
    `relative rounded-xl px-3.5 py-2 text-[13px] font-semibold transition-all duration-200 ${
      location.pathname === path
        ? isDark
          ? "bg-blue-500/10 text-blue-400 shadow-sm"
          : "bg-blue-50/80 text-blue-600 shadow-sm"
        : isDark
        ? "text-slate-300 hover:bg-slate-800/60 hover:text-white"
        : "text-slate-600 hover:bg-slate-100/70 hover:text-slate-900"
    }`

  const mobileLinkClass = (path: string) =>
    `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-all duration-200 ${
      location.pathname === path
        ? isDark
          ? "bg-blue-500/15 text-blue-400"
          : "bg-blue-50 text-blue-600"
        : isDark
        ? "text-slate-300 hover:bg-slate-800/50 hover:text-white"
        : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
    }`

  return (
    <div className="relative z-50">
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          headerScrolled ? "py-2 sm:py-2.5" : "py-1 sm:py-2"
        }`}
      >
        <div
          className={`mx-auto max-w-7xl px-3 transition-all duration-300 sm:px-6 ${
            headerScrolled ? "lg:px-5" : ""
          }`}
        >
          <div
            className="relative flex h-[66px] items-center rounded-[1.25rem] border px-3 transition-all duration-300 sm:h-[70px] sm:px-4"
            style={{
              background: isDark
                ? "linear-gradient(135deg, rgba(15,23,42,0.92), rgba(30,41,59,0.88))"
                : "linear-gradient(135deg, rgba(255,255,255,0.94), rgba(248,250,252,0.90))",
              borderColor: isDark
                ? headerScrolled
                  ? "rgba(59,130,246,0.3)"
                  : "rgba(51,65,85,0.5)"
                : headerScrolled
                ? "rgba(37,99,235,0.2)"
                : "rgba(226,232,240,0.8)",
              boxShadow: headerScrolled
                ? isDark
                  ? "0 20px 50px -20px rgba(0,0,0,0.5)"
                  : "0 20px 50px -25px rgba(37,99,235,0.15)"
                : "0 10px 30px -20px rgba(0,0,0,0.08)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
            }}
          >
            {/* Left section: Logo */}
            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                to="/"
                onClick={closeMenus}
                className="group flex shrink-0 items-center gap-2.5 rounded-xl transition-all duration-200 focus:outline-none"
                aria-label="KUGURISHA Ahabanza"
              >
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-transparent border border-transparent transition-all duration-300 group-hover:scale-105 sm:h-10 sm:w-10"
                >
                  <img
                    src="/favicon.svg"
                    alt="KUGURISHA"
                    className="h-full w-full object-contain bg-transparent transition-transform duration-300 group-hover:rotate-3"
                  />
                </span>

                <span
                  className={`hidden text-[20px] font-black tracking-tight sm:block lg:text-[23px] ${
                    isDark ? "text-white" : "text-slate-900"
                  }`}
                >
                  <span>KU</span>
                  <span className="bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-500 bg-clip-text text-transparent">
                    GURISHA
                  </span>
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 lg:flex">
              {navigation.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={closeMenus}
                  className={linkClass(item.to)}
                >
                  {item.label}
                </NavLink>
              ))}

              <a
                href="/#listings"
                className={`rounded-xl px-3.5 py-2 text-[13px] font-semibold transition-all duration-200 ${
                  isDark
                    ? "text-slate-300 hover:bg-slate-800/60 hover:text-white"
                    : "text-slate-600 hover:bg-slate-100/70 hover:text-slate-900"
                }`}
              >
                Ibicuruzwa
              </a>

              <Link
                to="/ai-search"
                onClick={closeMenus}
                className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-[13px] font-semibold transition-all duration-200 ${
                  location.pathname === "/ai-search"
                    ? isDark
                      ? "bg-blue-500/15 text-blue-400 shadow-sm"
                      : "bg-blue-50 text-blue-600 shadow-sm"
                    : isDark
                    ? "text-slate-300 hover:bg-slate-800/60 hover:text-white"
                    : "text-slate-600 hover:bg-slate-100/70 hover:text-slate-900"
                }`}
              >
                <Icon name="spark" size={14} />
                <span>AI Search</span>
              </Link>
            </nav>

            {/* Right section actions */}
            <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
              {/* Search toggle: visible on desktop and mobile */}
              <button
                type="button"
                onClick={() => {
                  setSearchOpen((current) => !current)
                  setShowMobileMenu(false)
                  setShowUserMenu(false)
                }}
                title={searchOpen ? "Funga gushakisha" : "Shakisha"}
                aria-label={searchOpen ? "Funga gushakisha" : "Fungura gushakisha"}
                aria-expanded={searchOpen}
                className={`flex h-9 w-9 items-center justify-center rounded-xl border transition-all duration-200 hover:scale-105 active:scale-95 sm:h-10 sm:w-10 ${
                  isDark
                    ? "border-slate-700 bg-slate-800/70 text-slate-200 hover:border-blue-500 hover:text-blue-300"
                    : "border-slate-200 bg-white/80 text-slate-700 shadow-sm hover:border-blue-300 hover:text-blue-600"
                }`}
              >
                <Icon name={searchOpen ? "close" : "search"} size={18} />
              </button>
              {userId && (
                <Link
                  to="/notifications"
                  onClick={closeMenus}
                  title="Notifications"
                  aria-label="Notifications"
                  className={`group relative flex h-9 w-9 items-center justify-center rounded-xl border transition-all duration-200 hover:scale-105 active:scale-95 sm:h-10 sm:w-10 ${
                    isDark
                      ? "border-slate-700 bg-slate-800/70 text-slate-200 hover:border-slate-600 hover:text-white"
                      : "border-slate-200 bg-white/80 text-slate-700 hover:border-blue-300 hover:text-blue-600 shadow-sm"
                  }`}
                >
                  <Icon name="bell" size={17} />
                  {unreadCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-black text-white ring-2 ring-white dark:ring-slate-900">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </Link>
              )}

              {!userId ? (
                <Link
                  to="/login"
                  onClick={closeMenus}
                  className={`hidden rounded-xl px-4 py-2 text-[13px] font-bold transition-all duration-200 sm:block ${
                    isDark
                      ? "text-slate-200 hover:bg-slate-800 hover:text-white"
                      : "text-slate-800 hover:bg-slate-100 hover:text-blue-600"
                  }`}
                >
                  Injira
                </Link>
              ) : (
                <div className="relative hidden sm:block">
                  <button
                    type="button"
                    onClick={() => setShowUserMenu((current) => !current)}
                    aria-expanded={showUserMenu}
                    aria-label="Fungura konti yanjye"
                    className={`group flex h-10 items-center gap-2 rounded-xl border px-2 pr-3 transition-all duration-200 ${
                      isDark
                        ? "border-slate-700 bg-slate-800/80 text-slate-200 hover:border-slate-600"
                        : "border-slate-200 bg-white/80 text-slate-800 hover:border-blue-300 shadow-sm"
                    }`}
                  >
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-sm">
                      <Icon name="user" size={15} />
                    </span>
                    <span className="hidden text-[12px] font-bold md:block">
                      Konti yanjye
                    </span>
                    <span
                      className="ml-0.5 text-slate-400 transition-transform duration-200"
                      style={{
                        transform: showUserMenu ? "rotate(180deg)" : "rotate(0deg)",
                      }}
                    >
                      <Icon name="chevron-down" size={13} />
                    </span>
                  </button>

                  {showUserMenu && (
                    <div
                      className={`absolute right-0 top-[calc(100%+10px)] w-[280px] overflow-hidden rounded-2xl border p-2 shadow-2xl transition-all duration-200 animate-in fade-in slide-in-from-top-2 ${
                        isDark
                          ? "border-slate-700 bg-slate-900/95 text-slate-100"
                          : "border-slate-200/80 bg-white/95 text-slate-800"
                      }`}
                      style={{
                        backdropFilter: "blur(24px)",
                        WebkitBackdropFilter: "blur(24px)",
                      }}
                    >
                      <div className={`rounded-xl p-3 ${isDark ? "bg-slate-800/60" : "bg-blue-50/70"}`}>
                        <div className="flex items-center gap-3">
                          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white">
                            <Icon name="user" size={16} />
                          </span>
                          <div>
                            <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">
                              Konti yanjye
                            </p>
                            <p className={`mt-0.5 text-xs font-black ${isDark ? "text-white" : "text-slate-900"}`}>
                              KUGURISHA.COM
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Theme Toggle Button inside Konti yanjye menu */}
                      <div className="mt-2">
                        <button
                          type="button"
                          onClick={toggleTheme}
                          className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold transition-all ${
                            isDark
                              ? "text-amber-300 hover:bg-slate-800 hover:text-amber-200"
                              : "text-slate-700 hover:bg-blue-50 hover:text-blue-600"
                          }`}
                        >
                          <Icon name={isDark ? "sun" : "moon"} size={16} />
                          <span>{isDark ? "Light Mode" : "Dark Mode"}</span>
                        </button>
                      </div>

                      <div className={`my-1.5 border-t ${isDark ? "border-slate-800" : "border-slate-200/80"}`} />

                      <div className="space-y-0.5">
                        <Link to="/profile" onClick={closeMenus} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold transition-all ${isDark ? "text-slate-300 hover:bg-slate-800 hover:text-white" : "text-slate-700 hover:bg-blue-50 hover:text-blue-600"}`}>
                          <Icon name="user" size={16} />
                          Profile yanjye
                        </Link>
                        <Link to="/dashboard" onClick={closeMenus} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold transition-all ${isDark ? "text-slate-300 hover:bg-slate-800 hover:text-white" : "text-slate-700 hover:bg-blue-50 hover:text-blue-600"}`}>
                          <Icon name="store" size={16} />
                          Dashboard
                        </Link>
                        <Link to="/favorites" onClick={closeMenus} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold transition-all ${isDark ? "text-slate-300 hover:bg-slate-800 hover:text-white" : "text-slate-700 hover:bg-blue-50 hover:text-blue-600"}`}>
                          <Icon name="heart" size={16} />
                          Ibyakunzwe
                        </Link>
                        <Link to="/messages" onClick={closeMenus} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold transition-all ${isDark ? "text-slate-300 hover:bg-slate-800 hover:text-white" : "text-slate-700 hover:bg-blue-50 hover:text-blue-600"}`}>
                          <Icon name="message" size={16} />
                          Ubutumwa
                        </Link>
                        <Link to="/notifications" onClick={closeMenus} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold transition-all ${isDark ? "text-slate-300 hover:bg-slate-800 hover:text-white" : "text-slate-700 hover:bg-blue-50 hover:text-blue-600"}`}>
                          <Icon name="bell" size={16} />
                          Notifications
                          {unreadCount > 0 && (
                            <span className="ml-auto rounded-full bg-red-500 px-1.5 py-0.5 text-[9px] font-black text-white">
                              {unreadCount > 99 ? "99+" : unreadCount}
                            </span>
                          )}
                        </Link>
                        <Link to="/profile" onClick={closeMenus} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold transition-all ${isDark ? "text-slate-300 hover:bg-slate-800 hover:text-white" : "text-slate-700 hover:bg-blue-50 hover:text-blue-600"}`}>
                          <Icon name="settings" size={16} />
                          Settings
                        </Link>
                      </div>

                      <div className={`my-1.5 border-t ${isDark ? "border-slate-800" : "border-slate-200/80"}`} />

                      <button
                        type="button"
                        onClick={handleLogout}
                        disabled={loggingOut}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs font-bold text-red-500 transition-all hover:bg-red-500/10 disabled:opacity-60"
                      >
                        <Icon name="logout" size={16} />
                        {loggingOut ? "Turimo gusohoka..." : "Sohoka"}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Create Listing Button */}
              <Link
                to="/create-listing"
                onClick={closeMenus}
                className="hidden h-10 items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-4 text-xs font-bold text-white shadow-md shadow-blue-500/20 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg hover:shadow-blue-500/30 active:scale-95 sm:flex"
              >
                <Icon name="plus" size={15} />
                <span>Gurisha</span>
              </Link>

              {/* Mobile Menu Toggle */}
              <button
                type="button"
                onClick={() => setShowMobileMenu((current) => !current)}
                className={`flex h-9 w-9 items-center justify-center rounded-xl border transition-all duration-200 hover:scale-105 active:scale-95 sm:hidden ${
                  isDark
                    ? "border-slate-700 bg-slate-800/70 text-slate-200 hover:border-slate-600"
                    : "border-slate-200 bg-white/80 text-slate-700 hover:border-blue-300 shadow-sm"
                }`}
                aria-label={showMobileMenu ? "Funga menu" : "Fungura menu"}
                aria-expanded={showMobileMenu}
              >
                <Icon name={showMobileMenu ? "close" : "menu"} size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {showMobileMenu && (
          <div className="px-3 pt-2 sm:hidden">
            <div
              className={`mx-auto max-w-7xl overflow-hidden rounded-2xl border p-3 shadow-2xl transition-all duration-200 animate-in fade-in slide-in-from-top-2 ${
                isDark
                  ? "border-slate-700 bg-slate-900/95 text-slate-100"
                  : "border-slate-200/80 bg-white/95 text-slate-800"
              }`}
              style={{
                backdropFilter: "blur(24px)",
                WebkitBackdropFilter: "blur(24px)",
              }}
            >
              <nav className="space-y-1">
                {navigation.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={closeMenus}
                    className={mobileLinkClass(item.to)}
                  >
                    {item.label}
                  </NavLink>
                ))}

                <a
                  href="/#listings"
                  onClick={closeMenus}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-all ${
                    isDark
                      ? "text-slate-300 hover:bg-slate-800"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <Icon name="shopping-bag" size={18} />
                  Ibicuruzwa
                </a>

                <Link
                  to="/ai-search"
                  onClick={closeMenus}
                  className={mobileLinkClass("/ai-search")}
                >
                  <Icon name="spark" size={18} />
                  AI Search
                </Link>

                <div className={`my-2 border-t ${isDark ? "border-slate-800" : "border-slate-200/80"}`} />

                <Link
                  to="/create-listing"
                  onClick={closeMenus}
                  className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-3 text-sm font-bold text-white shadow-md shadow-blue-500/20 active:scale-95"
                >
                  <Icon name="plus" size={16} />
                  Gurisha ikintu
                </Link>

                {!userId ? (
                  <>
                    <div className={`my-1 border-t ${isDark ? "border-slate-800" : "border-slate-200/80"}`} />
                    <button
                      type="button"
                      onClick={toggleTheme}
                      className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-all ${
                        isDark ? "text-amber-300 hover:bg-slate-800" : "text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <Icon name={isDark ? "sun" : "moon"} size={18} />
                      {isDark ? "Light Mode" : "Dark Mode"}
                    </button>
                    <Link
                      to="/login"
                      onClick={closeMenus}
                      className={`mt-1 flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-all ${
                        isDark ? "hover:bg-slate-800" : "hover:bg-slate-100"
                      }`}
                    >
                      <Icon name="user" size={18} />
                      Injira
                    </Link>
                  </>
                ) : (
                  <>
                    <div className={`mt-2 rounded-xl p-3 ${isDark ? "bg-slate-800/60" : "bg-blue-50/70"}`}>
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white">
                          <Icon name="user" size={16} />
                        </span>
                        <div>
                          <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">
                            Konti yanjye
                          </p>
                          <p className={`mt-0.5 text-xs font-black ${isDark ? "text-white" : "text-slate-900"}`}>
                            KUGURISHA.COM
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Theme Toggle Button inside mobile Konti yanjye menu */}
                    <button
                      type="button"
                      onClick={toggleTheme}
                      className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-all ${
                        isDark ? "text-amber-300 hover:bg-slate-800" : "text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <Icon name={isDark ? "sun" : "moon"} size={18} />
                      {isDark ? "Light Mode" : "Dark Mode"}
                    </button>

                    <Link to="/profile" onClick={closeMenus} className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-all ${isDark ? "text-slate-300 hover:bg-slate-800" : "text-slate-700 hover:bg-slate-100"}`}>
                      <Icon name="user" size={18} />
                      Profile yanjye
                    </Link>
                    <Link to="/dashboard" onClick={closeMenus} className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-all ${isDark ? "text-slate-300 hover:bg-slate-800" : "text-slate-700 hover:bg-slate-100"}`}>
                      <Icon name="store" size={18} />
                      Dashboard
                    </Link>
                    <Link to="/favorites" onClick={closeMenus} className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-all ${isDark ? "text-slate-300 hover:bg-slate-800" : "text-slate-700 hover:bg-slate-100"}`}>
                      <Icon name="heart" size={18} />
                      Ibyakunzwe
                    </Link>
                    <Link to="/messages" onClick={closeMenus} className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-all ${isDark ? "text-slate-300 hover:bg-slate-800" : "text-slate-700 hover:bg-slate-100"}`}>
                      <Icon name="message" size={18} />
                      Ubutumwa
                    </Link>
                    <Link to="/notifications" onClick={closeMenus} className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-all ${isDark ? "text-slate-300 hover:bg-slate-800" : "text-slate-700 hover:bg-slate-100"}`}>
                      <Icon name="bell" size={18} />
                      Notifications
                      {unreadCount > 0 && (
                        <span className="ml-auto rounded-full bg-red-500 px-2 py-0.5 text-[9px] font-black text-white">
                          {unreadCount > 99 ? "99+" : unreadCount}
                        </span>
                      )}
                    </Link>
                    <button
                      type="button"
                      onClick={handleLogout}
                      disabled={loggingOut}
                      className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-bold text-red-500 transition-all hover:bg-red-500/10 disabled:opacity-60"
                    >
                      <Icon name="logout" size={18} />
                      {loggingOut ? "Turimo gusohoka..." : "Sohoka"}
                    </button>
                  </>
                )}
              </nav>
            </div>
          </div>
        )}
      </header>

      {/* Floating Expandable Search Bar */}
      {searchOpen && (
        <section className="relative z-30 px-4 py-2 sm:px-6">
          <form
            onSubmit={(event) => {
              event.preventDefault()
              handleSearchSubmit()
            }}
            className={`mx-auto flex max-w-2xl items-center gap-2 rounded-2xl border p-2 shadow-xl ${
              isDark
                ? "border-slate-700 bg-slate-900/95"
                : "border-slate-200 bg-white/95"
            }`}
            style={{
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
            }}
          >
            <span className={`flex h-10 w-10 shrink-0 items-center justify-center ${
              isDark ? "text-blue-300" : "text-blue-600"
            }`}>
              <Icon name="search" size={20} />
            </span>
            <input
              type="search"
              value={currentSearchValue}
              onChange={(event) => {
                const value = event.target.value
                setInternalSearchValue(value)
                onSearchChange?.(value)
              }}
              placeholder="Urashaka iki? Urugero: laptop, iPhone, inzu..."
              aria-label="Shakisha ibicuruzwa"
              autoFocus
              className={`min-w-0 flex-1 bg-transparent px-1 py-2 text-sm outline-none placeholder:text-slate-400 ${
                isDark ? "text-white" : "text-slate-900"
              }`}
            />
            <button
              type="submit"
              className="flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-4 text-sm font-bold text-white shadow-md shadow-blue-500/20 transition hover:brightness-105 active:scale-95"
            >
              <Icon name="search" size={16} />
              <span className="hidden sm:inline">Shakisha</span>
            </button>
          </form>
        </section>
      )}
    </div>
  )
}