import { useEffect, useRef, useState } from "react"
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
  | "zap"
  | "compass"

function Icon({
  name,
  size = 20,
  strokeWidth = 2,
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

    case "zap":
      return (
        <svg {...common}>
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
      )

    case "compass":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="10" />
          <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
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

  const userMenuRef = useRef<HTMLDivElement>(null)
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
    function handleClickOutside(event: MouseEvent) {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setShowUserMenu(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

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
      setHeaderScrolled(window.scrollY > 15)
    }

    handleScroll()
    window.addEventListener("scroll", handleScroll, { passive: true })

    return () => window.removeEventListener("scroll", handleScroll)
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

  function handleSearchSubmit(e?: React.FormEvent) {
    if (e) e.preventDefault()
    closeMenus()
    setSearchOpen(false)

    if (onSearchSubmit) {
      onSearchSubmit()
      return
    }

    if (currentSearchValue.trim()) {
      navigate(`/?search=${encodeURIComponent(currentSearchValue.trim())}`)
    }
  }

  function handleInputChange(val: string) {
    if (onSearchChange) {
      onSearchChange(val)
    } else {
      setInternalSearchValue(val)
    }
  }

  return (
    <div className="kg-header sticky top-0 z-50">
      <header
        className={`w-full transition-all duration-500 ${
          headerScrolled ? "py-2 sm:py-3" : "py-3 sm:py-4"
        }`}
      >
        {/* Slightly reduced container width (max-w-6xl instead of max-w-7xl) */}
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          {/* Floating Pill Dock: h-[76px] increased height + rounded-full 100% radius */}
          <div
            className="group/header relative flex h-[76px] items-center justify-between rounded-full border px-4 sm:px-6 transition-all duration-500"
            style={{
              background: isDark
                ? "rgba(15, 23, 42, 0.82)"
                : "rgba(255, 255, 255, 0.88)",
              borderColor: headerScrolled
                ? isDark
                  ? "rgba(16, 185, 129, 0.35)"
                  : "rgba(16, 185, 129, 0.28)"
                : isDark
                ? "rgba(255, 255, 255, 0.15)"
                : "rgba(0, 0, 0, 0.09)",
              boxShadow: headerScrolled
                ? isDark
                  ? "0 20px 40px -15px rgba(0, 0, 0, 0.6), 0 0 30px rgba(16, 185, 129, 0.2)"
                  : "0 20px 40px -15px rgba(16, 185, 129, 0.2), 0 0 20px rgba(16, 185, 129, 0.1)"
                : "0 10px 30px -10px rgba(0, 0, 0, 0.06)",
              backdropFilter: "blur(28px)",
              WebkitBackdropFilter: "blur(28px)",
            }}
          >
            {/* Ambient Background Glow Accent */}
            <div className="pointer-events-none absolute -inset-0.5 rounded-full bg-gradient-to-r from-slate-500/10 via-emerald-600/20 to-emerald-800/20 opacity-0 blur-xl transition-opacity duration-700 group-hover/header:opacity-100" />

            {/* LEFT: Futuristic Pill Navigation */}
            <nav className="relative z-10 flex items-center gap-1.5">
              <div className="flex items-center gap-1 rounded-full border border-white/10 bg-black/5 dark:bg-white/5 p-1.5 backdrop-blur-md">
                {navigation.map((item) => {
                  const isActive = location.pathname === item.to
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={closeMenus}
                      className={`relative rounded-full px-4.5 py-2 text-xs sm:text-sm font-black transition-all duration-300 ${
                        isActive
                          ? "text-white"
                          : isDark
                          ? "text-slate-300 hover:text-white"
                          : "text-slate-700 hover:text-slate-900"
                      }`}
                    >
                      {isActive && (
                        <span className="absolute inset-0 z-0 rounded-full bg-gradient-to-r from-emerald-600 via-emerald-700 to-emerald-900 shadow-[0_4px_15px_rgba(16,185,129,0.35)]" />
                      )}
                      <span className="relative z-10">{item.label}</span>
                    </NavLink>
                  )
                })}

                <Link
                  to="/ai-search"
                  onClick={closeMenus}
                  className={`relative hidden sm:flex items-center gap-1.5 rounded-full px-4.5 py-2 text-xs sm:text-sm font-black transition-all duration-300 ${
                    location.pathname === "/ai-search"
                      ? "text-white"
                      : isDark
                      ? "text-slate-300 hover:text-white"
                      : "text-slate-700 hover:text-slate-900"
                  }`}
                >
                  {location.pathname === "/ai-search" && (
                    <span className="absolute inset-0 z-0 rounded-full bg-gradient-to-r from-emerald-600 via-emerald-700 to-emerald-900 shadow-[0_4px_15px_rgba(16,185,129,0.35)]" />
                  )}
                  <Icon
                    name="spark"
                    size={16}
                    className={`relative z-10 ${
                      location.pathname === "/ai-search"
                        ? "text-white"
                        : "text-emerald-500"
                    }`}
                  />
                  <span className="relative z-10">AI Search</span>
                </Link>
              </div>
            </nav>

            {/* RIGHT: Quick Action Bar */}
            <div className="relative z-10 flex items-center gap-2.5">
              {/* Reduced/Compact Search Toggle */}
              <button
                type="button"
                onClick={() => {
                  setSearchOpen((prev) => !prev)
                  setShowMobileMenu(false)
                  setShowUserMenu(false)
                }}
                className={`group flex h-11 w-11 items-center justify-center rounded-full border transition-all duration-300 hover:scale-105 active:scale-95 ${
                  searchOpen
                    ? "border-emerald-600 bg-emerald-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.35)]"
                    : isDark
                    ? "border-slate-800 bg-slate-900/80 text-slate-300 hover:border-emerald-500/50 hover:text-white"
                    : "border-slate-200 bg-white/80 text-slate-700 shadow-sm hover:border-emerald-400 hover:text-emerald-700"
                }`}
                aria-label={searchOpen ? "Funga search" : "Shakisha"}
              >
                <Icon name={searchOpen ? "close" : "search"} size={19} />
              </button>

              {/* Theme Toggle Button */}
              <button
                type="button"
                onClick={toggleTheme}
                className={`hidden h-11 w-11 items-center justify-center rounded-full border transition-all duration-300 hover:scale-105 active:scale-95 sm:flex ${
                  isDark
                    ? "border-slate-800 bg-slate-900/80 text-amber-400 hover:border-amber-400/50 hover:bg-slate-800"
                    : "border-slate-200 bg-white/80 text-emerald-700 shadow-sm hover:border-emerald-300 hover:bg-emerald-50/50"
                }`}
                title={isDark ? "Hindura mu Light Mode" : "Hindura mu Dark Mode"}
              >
                <Icon name={isDark ? "sun" : "moon"} size={19} />
              </button>

              {/* Notification Link */}
              {userId && (
                <Link
                  to="/notifications"
                  onClick={closeMenus}
                  className={`relative flex h-11 w-11 items-center justify-center rounded-full border transition-all duration-300 hover:scale-105 active:scale-95 ${
                    isDark
                      ? "border-slate-800 bg-slate-900/80 text-slate-300 hover:border-emerald-500/50 hover:text-white"
                      : "border-slate-200 bg-white/80 text-slate-700 shadow-sm hover:border-emerald-400 hover:text-emerald-700"
                  }`}
                  aria-label="Notifications"
                >
                  <Icon name="bell" size={19} />
                  {unreadCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-4.5 min-w-[18px] items-center justify-center rounded-full bg-gradient-to-r from-red-500 to-rose-600 px-1 text-[10px] font-black text-white ring-2 ring-white dark:ring-slate-900 shadow-md">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </Link>
              )}

              {/* User Account / Auth Button */}
              {!userId ? (
                <Link
                  to="/login"
                  onClick={closeMenus}
                  className="hidden items-center gap-2 rounded-full bg-slate-900/10 dark:bg-white/10 px-5 py-2.5 text-xs font-black kg-text transition-all duration-300 hover:bg-emerald-700 hover:text-white sm:flex"
                >
                  <Icon name="user" size={16} />
                  <span>Injira</span>
                </Link>
              ) : (
                <div className="relative hidden sm:block" ref={userMenuRef}>
                  <button
                    type="button"
                    onClick={() => setShowUserMenu((prev) => !prev)}
                    className={`flex h-11 items-center gap-2.5 rounded-full border px-4 transition-all duration-300 hover:scale-[1.02] active:scale-95 ${
                      showUserMenu
                        ? "border-emerald-600 bg-emerald-600/10 text-emerald-600"
                        : isDark
                        ? "border-slate-800 bg-slate-900/80 text-slate-200 hover:border-slate-700"
                        : "border-slate-200 bg-white/80 text-slate-800 shadow-sm hover:border-emerald-300"
                    }`}
                  >
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-emerald-600 to-emerald-800 text-white shadow-sm">
                      <Icon name="user" size={14} />
                    </span>
                    <span className="text-xs sm:text-sm font-black">Konti</span>
                    <Icon
                      name="chevron-down"
                      size={14}
                      className={`text-slate-400 transition-transform duration-300 ${
                        showUserMenu ? "rotate-180 text-emerald-600" : ""
                      }`}
                    />
                  </button>

                  {/* Dropdown Menu Panel */}
                  {showUserMenu && (
                    <div
                      className={`absolute right-0 top-[calc(100%+14px)] w-72 overflow-hidden rounded-3xl border p-3 shadow-2xl transition-all duration-300 ${
                        isDark
                          ? "border-slate-800 bg-slate-950/90 text-slate-100"
                          : "border-slate-200/90 bg-white/95 text-slate-800"
                      }`}
                      style={{
                        backdropFilter: "blur(28px)",
                        WebkitBackdropFilter: "blur(28px)",
                      }}
                    >
                      <div className="rounded-2xl bg-gradient-to-r from-slate-500/10 via-emerald-600/10 to-emerald-800/10 p-3.5 border border-emerald-500/20">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-600 to-emerald-800 text-white shadow-md">
                            <Icon name="user" size={18} />
                          </div>
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                              Mwaramutse
                            </p>
                            <p className="text-xs font-black truncate max-w-[150px]">
                              KUGURISHA User
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-2 space-y-0.5">
                        <Link
                          to="/profile"
                          onClick={closeMenus}
                          className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-bold transition-all ${
                            isDark
                              ? "text-slate-300 hover:bg-slate-800 hover:text-white"
                              : "text-slate-700 hover:bg-emerald-50 hover:text-emerald-700"
                          }`}
                        >
                          <Icon name="user" size={16} />
                          Profile yanjye
                        </Link>
                        <Link
                          to="/dashboard"
                          onClick={closeMenus}
                          className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-bold transition-all ${
                            isDark
                              ? "text-slate-300 hover:bg-slate-800 hover:text-white"
                              : "text-slate-700 hover:bg-emerald-50 hover:text-emerald-700"
                          }`}
                        >
                          <Icon name="store" size={16} />
                          Dashboard
                        </Link>
                        <Link
                          to="/favorites"
                          onClick={closeMenus}
                          className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-bold transition-all ${
                            isDark
                              ? "text-slate-300 hover:bg-slate-800 hover:text-white"
                              : "text-slate-700 hover:bg-emerald-50 hover:text-emerald-700"
                          }`}
                        >
                          <Icon name="heart" size={16} />
                          Ibyakunzwe
                        </Link>
                        <Link
                          to="/messages"
                          onClick={closeMenus}
                          className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-bold transition-all ${
                            isDark
                              ? "text-slate-300 hover:bg-slate-800 hover:text-white"
                              : "text-slate-700 hover:bg-emerald-50 hover:text-emerald-700"
                          }`}
                        >
                          <Icon name="message" size={16} />
                          Ubutumwa
                        </Link>
                        <Link
                          to="/notifications"
                          onClick={closeMenus}
                          className={`flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-bold transition-all ${
                            isDark
                              ? "text-slate-300 hover:bg-slate-800 hover:text-white"
                              : "text-slate-700 hover:bg-emerald-50 hover:text-emerald-700"
                          }`}
                        >
                          <span className="flex items-center gap-3">
                            <Icon name="bell" size={16} />
                            Notifications
                          </span>
                          {unreadCount > 0 && (
                            <span className="rounded-full bg-red-500 px-2 py-0.5 text-[9px] font-black text-white">
                              {unreadCount}
                            </span>
                          )}
                        </Link>
                      </div>

                      <div className="my-1.5 border-t border-slate-200 dark:border-slate-800" />

                      <button
                        type="button"
                        onClick={handleLogout}
                        disabled={loggingOut}
                        className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-bold text-red-500 transition-all hover:bg-red-500/10 disabled:opacity-50"
                      >
                        <Icon name="logout" size={16} />
                        <span>
                          {loggingOut ? "Turimo gusohoka..." : "Sohoka"}
                        </span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Create Listing Primary CTA Button */}
              <Link
                to="/create-listing"
                onClick={closeMenus}
                className="group/btn relative hidden h-11 items-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-emerald-600 via-emerald-700 to-emerald-900 px-5 text-xs sm:text-sm font-black text-white shadow-lg shadow-emerald-700/25 transition-all duration-300 hover:scale-[1.03] hover:shadow-emerald-700/40 active:scale-95 sm:flex"
              >
                <span className="absolute inset-0 bg-white/20 translate-y-full transition-transform duration-300 group-hover/btn:translate-y-0" />
                <Icon name="plus" size={16} strokeWidth={2.5} className="relative z-10" />
                <span className="relative z-10">Gurisha</span>
              </Link>

              {/* Mobile Navigation Drawer Toggle */}
              <button
                type="button"
                onClick={() => setShowMobileMenu((prev) => !prev)}
                className={`flex h-11 w-11 items-center justify-center rounded-full border transition-all duration-300 lg:hidden ${
                  showMobileMenu
                    ? "border-emerald-600 bg-emerald-600 text-white"
                    : isDark
                    ? "border-slate-800 bg-slate-900/80 text-slate-300"
                    : "border-slate-200 bg-white/80 text-slate-700 shadow-sm"
                }`}
                aria-label="Toggle Menu"
              >
                <Icon name={showMobileMenu ? "close" : "menu"} size={20} />
              </button>
            </div>
          </div>

          {/* Reduced & Compact Search Bar Container */}
          {searchOpen && (
            <div className="mt-2 max-w-md mx-auto">
              <form
                onSubmit={handleSearchSubmit}
                className={`relative flex items-center rounded-full border px-3 py-1.5 shadow-xl backdrop-blur-2xl transition-all ${
                  isDark
                    ? "border-emerald-500/30 bg-slate-950/90"
                    : "border-emerald-500/30 bg-white/95"
                }`}
              >
                <div className="flex flex-1 items-center gap-2.5 px-2">
                  <Icon name="search" size={16} className="text-emerald-600 shrink-0" />
                  <input
                    type="text"
                    value={currentSearchValue}
                    onChange={(e) => handleInputChange(e.target.value)}
                    placeholder="Shakisha ibicuruzwa..."
                    className="w-full bg-transparent py-1 text-xs font-bold kg-text outline-none placeholder:kg-text-muted"
                    autoFocus
                  />
                  {currentSearchValue && (
                    <button
                      type="button"
                      onClick={() => handleInputChange("")}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      <Icon name="close" size={14} />
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  className="rounded-full bg-gradient-to-r from-emerald-600 via-emerald-700 to-emerald-900 px-4 py-1.5 text-xs font-black text-white shadow-md transition-all hover:scale-105 active:scale-95"
                >
                  Shakisha
                </button>
              </form>
            </div>
          )}

          {/* Mobile Navigation Drawer */}
          {showMobileMenu && (
            <div className="mt-2.5 lg:hidden">
              <div
                className={`overflow-hidden rounded-3xl border p-4 shadow-2xl backdrop-blur-3xl transition-all ${
                  isDark
                    ? "border-slate-800 bg-slate-950/95 text-slate-100"
                    : "border-slate-200 bg-white/95 text-slate-800"
                }`}
              >
                <nav className="space-y-1">
                  {navigation.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={closeMenus}
                      className={({ isActive }) =>
                        `flex items-center gap-3 rounded-2xl px-4 py-3 text-xs font-black transition-all ${
                          isActive
                            ? "bg-gradient-to-r from-emerald-600 to-emerald-800 text-white shadow-md"
                            : isDark
                            ? "text-slate-300 hover:bg-slate-900"
                            : "text-slate-700 hover:bg-slate-100"
                        }`
                      }
                    >
                      <span>{item.label}</span>
                    </NavLink>
                  ))}

                  <Link
                    to="/ai-search"
                    onClick={closeMenus}
                    className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-xs font-black transition-all ${
                      location.pathname === "/ai-search"
                        ? "bg-gradient-to-r from-emerald-600 to-emerald-800 text-white shadow-md"
                        : isDark
                        ? "text-slate-300 hover:bg-slate-900"
                        : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <Icon name="spark" size={16} className="text-emerald-400" />
                    <span>AI Search</span>
                  </Link>

                  <div className="my-2 border-t border-slate-200 dark:border-slate-800" />

                  <Link
                    to="/create-listing"
                    onClick={closeMenus}
                    className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-700 to-emerald-900 px-4 py-3 text-xs font-black text-white shadow-lg active:scale-95"
                  >
                    <Icon name="plus" size={16} strokeWidth={2.5} />
                    <span>Gurisha ikintu</span>
                  </Link>

                  {!userId ? (
                    <Link
                      to="/login"
                      onClick={closeMenus}
                      className="mt-2 flex items-center justify-center gap-2 rounded-2xl border border-slate-200 dark:border-slate-800 px-4 py-3 text-xs font-black active:scale-95"
                    >
                      <Icon name="user" size={16} />
                      <span>Injira mu konti</span>
                    </Link>
                  ) : (
                    <div className="mt-3 space-y-1">
                      <div className="my-2 border-t border-slate-200 dark:border-slate-800" />
                      <button
                        type="button"
                        onClick={toggleTheme}
                        className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-xs font-bold transition-all ${
                          isDark
                            ? "text-amber-400 hover:bg-slate-900"
                            : "text-emerald-700 hover:bg-emerald-50"
                        }`}
                      >
                        <Icon name={isDark ? "sun" : "moon"} size={16} />
                        <span>{isDark ? "Light Mode" : "Dark Mode"}</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleLogout}
                        disabled={loggingOut}
                        className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-xs font-bold text-red-500 hover:bg-red-500/10"
                      >
                        <Icon name="logout" size={16} />
                        <span>{loggingOut ? "Gusohoka..." : "Sohoka"}</span>
                      </button>
                    </div>
                  )}
                </nav>
              </div>
            </div>
          )}
        </div>
      </header>
    </div>
  )
}