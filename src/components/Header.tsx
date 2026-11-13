import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react"
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
  | "logout"
  | "menu"
  | "close"
  | "spark"
  | "plus"
  | "chevron"
  | "sun"
  | "moon"
  | "arrow"

function Icon({
  name,
  size = 19,
  className,
}: {
  name: IconName
  size?: number
  className?: string
}) {
  const paths: Record<IconName, ReactNode> = {
    search: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-4-4" />
      </>
    ),
    bell: (
      <>
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
        <path d="M10 21h4" />
      </>
    ),
    user: (
      <>
        <circle cx="12" cy="8" r="3.5" />
        <path d="M5 20a7 7 0 0 1 14 0" />
      </>
    ),
    store: (
      <>
        <path d="M4 10v9h16v-9M3 10l2-6h14l2 6" />
        <path d="M3 10a3 3 0 0 0 5 0 3 3 0 0 0 5 0 3 3 0 0 0 5 0 3 3 0 0 0 3 0" />
      </>
    ),
    heart: (
      <path d="M20.8 8.8c0 5-8.8 10.2-8.8 10.2S3.2 13.8 3.2 8.8A4.8 4.8 0 0 1 12 6.2a4.8 4.8 0 0 1 8.8 2.6Z" />
    ),
    message: (
      <path d="M20 11.5a7 7 0 0 1-7.5 7H8l-4 2v-5.2a7 7 0 1 1 16-3.8Z" />
    ),
    logout: (
      <>
        <path d="m10 17 5-5-5-5M15 12H3M14 4h5v16h-5" />
      </>
    ),
    menu: <path d="M4 7h16M4 12h16M4 17h16" />,
    close: <path d="M6 6l12 12M18 6 6 18" />,
    spark: (
      <>
        <path d="m12 3 1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5L12 3Z" />
        <path d="m19 16 .7 2.3L22 19l-2.3.7L19 22l-.7-2.3L16 19l2.3-.7L19 16Z" />
      </>
    ),
    plus: <path d="M12 5v14M5 12h14" />,
    chevron: <path d="m6 9 6 6 6-6" />,
    sun: (
      <>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" />
      </>
    ),
    moon: (
      <path d="M20.2 15.1A8.5 8.5 0 0 1 8.9 3.8 8.5 8.5 0 1 0 20.2 15.1Z" />
    ),
    arrow: (
      <>
        <path d="M5 12h14" />
        <path d="m13 6 6 6-6 6" />
      </>
    ),
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  )
}

const navigation = [
  { label: "Ahabanza", to: "/" },
  { label: "Ibicuruzwa", to: "/listings" },
  { label: "Ibyiciro", to: "/categories" },
  { label: "Ibyo dukora", to: "/about" },
  { label: "Uko rukora", to: "/how-it-works" },
]

const accountLinks: {
  label: string
  to: string
  icon: IconName
}[] = [
  { label: "Umwirondoro", to: "/profile", icon: "user" },
  { label: "Ibicuruzwa byanjye", to: "/dashboard", icon: "store" },
  { label: "Ibyakunzwe", to: "/favorites", icon: "heart" },
  { label: "Ubutumwa", to: "/messages", icon: "message" },
  { label: "Imenyesha", to: "/notifications", icon: "bell" },
]

/* ── hover intent tuning ────────────────────────────────── */
const HOVER_OPEN_DELAY = 120
const HOVER_CLOSE_DELAY = 180

export default function Header({
  searchValue,
  onSearchChange,
  onSearchSubmit,
}: HeaderProps) {
  const [userId, setUserId] = useState<string | null>(null)
  const [unreadCount, setUnreadCount] = useState(0)
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [internalSearch, setInternalSearch] = useState("")
  const [loggingOut, setLoggingOut] = useState(false)

  const { theme, toggleTheme } = useTheme()
  const location = useLocation()
  const navigate = useNavigate()
  const accountRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  /* hover intent timers for the account dropdown */
  const hoverOpenTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hoverCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const search = searchValue ?? internalSearch

  function closeMenus() {
    setMobileOpen(false)
    setAccountOpen(false)
    setSearchOpen(false)
  }

  function clearHoverTimers() {
    if (hoverOpenTimer.current) {
      clearTimeout(hoverOpenTimer.current)
      hoverOpenTimer.current = null
    }
    if (hoverCloseTimer.current) {
      clearTimeout(hoverCloseTimer.current)
      hoverCloseTimer.current = null
    }
  }

  function handleAccountEnter() {
    if (hoverCloseTimer.current) {
      clearTimeout(hoverCloseTimer.current)
      hoverCloseTimer.current = null
    }
    if (accountOpen) return
    hoverOpenTimer.current = setTimeout(() => {
      setAccountOpen(true)
      setSearchOpen(false)
      setMobileOpen(false)
    }, HOVER_OPEN_DELAY)
  }

  function handleAccountLeave() {
    if (hoverOpenTimer.current) {
      clearTimeout(hoverOpenTimer.current)
      hoverOpenTimer.current = null
    }
    hoverCloseTimer.current = setTimeout(() => {
      setAccountOpen(false)
    }, HOVER_CLOSE_DELAY)
  }

  useEffect(() => {
    closeMenus()
  }, [location.pathname, location.search])

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 18)
    update()
    window.addEventListener("scroll", update, { passive: true })
    return () => window.removeEventListener("scroll", update)
  }, [])

  useEffect(() => {
    function handleOutside(event: MouseEvent) {
      const target = event.target as Node

      if (accountRef.current && !accountRef.current.contains(target)) {
        setAccountOpen(false)
      }

      if (headerRef.current && !headerRef.current.contains(target)) {
        setSearchOpen(false)
        setMobileOpen(false)
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") closeMenus()
    }

    document.addEventListener("mousedown", handleOutside)
    document.addEventListener("keydown", handleEscape)

    return () => {
      document.removeEventListener("mousedown", handleOutside)
      document.removeEventListener("keydown", handleEscape)
    }
  }, [])

  /* cleanup hover timers on unmount */
  useEffect(() => {
    return () => clearHoverTimers()
  }, [])

  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus()
  }, [searchOpen])

  useEffect(() => {
    let active = true

    void supabase.auth.getUser().then(({ data }) => {
      if (active) setUserId(data.user?.id ?? null)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id ?? null)
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (!userId) {
      setUnreadCount(0)
      return
    }

    let active = true

    async function refreshCount() {
      const { count, error } = await supabase
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("is_read", false)

      if (active && !error) {
        setUnreadCount(count ?? 0)
      }
    }

    void refreshCount()

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
        () => void refreshCount(),
      )
      .subscribe()

    return () => {
      active = false
      void supabase.removeChannel(channel)
    }
  }, [userId])

  function updateSearch(value: string) {
    if (onSearchChange) onSearchChange(value)
    else setInternalSearch(value)
  }

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const query = search.trim()
    if (!query) return

    closeMenus()

    if (onSearchSubmit) {
      onSearchSubmit()
    } else if (onSearchChange) {
      if (location.pathname !== "/") {
        navigate(`/?search=${encodeURIComponent(query)}`)
      }
    } else {
      navigate(`/listings?search=${encodeURIComponent(query)}`)
    }
  }

  async function logout() {
    setLoggingOut(true)

    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error

      setUserId(null)
      setUnreadCount(0)
      closeMenus()
      navigate("/", { replace: true })
    } catch (error) {
      console.error(error)
      alert("Ntibyashobotse gusohoka. Ongera ugerageze.")
    } finally {
      setLoggingOut(false)
    }
  }

  const actionClass =
    "kg-h-action relative flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl transition-all duration-300 hover:scale-105 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"

  return (
    <div
      ref={headerRef}
      className={`kg-h-root sticky top-0 z-[100] w-full transition-all duration-500 ${
        scrolled ? "py-2 shadow-xl backdrop-blur-xl bg-white/70 dark:bg-slate-950/70 border-b border-slate-200/50 dark:border-white/10" : "py-4"
      }`}
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        alignSelf: "stretch",
      }}
    >
      <header className="transition-all duration-300 ease-out">
        <div className="mx-auto max-w-[1520px] px-3 sm:px-6 lg:px-8">
          {/* ============ MAIN CAPSULE PANEL ============ */}
          <div
            className={`kg-h-panel relative flex items-center justify-between gap-3 rounded-full px-3.5 sm:px-6 lg:px-7 border border-white/40 bg-white/80 dark:bg-slate-900/80 dark:border-white/10 shadow-[0_12px_40px_-15px_rgba(16,36,54,0.12)] backdrop-blur-2xl ${
              scrolled ? "min-h-[58px]" : "min-h-[72px]"
            } transition-all duration-500 ease-out`}
          >
            {/* BRAND */}
            <Link
              to="/"
              onClick={closeMenus}
              className="kg-h-brand group flex shrink-0 items-center gap-2.5 sm:gap-3"
              aria-label="KUGURISHA - Ahabanza"
            >
              <span className="kg-h-logo flex h-10 w-10 shrink-0 items-center justify-center sm:h-11 sm:w-11 rounded-2xl bg-gradient-to-br from-[var(--primary)]/15 to-[#FF5D00]/10 p-1.5 transition-transform duration-300 group-hover:scale-105">
                <img
                  src="/favicon.svg"
                  alt=""
                  className="h-full w-full object-contain filter drop-shadow-sm"
                />
              </span>

              <span className="flex min-w-0 flex-col">
                <span
                  className={`kg-h-wordmark text-[20px] sm:text-[24px] lg:text-[27px] font-black leading-none transition-all duration-300 ${
                    scrolled ? "sm:text-[21px] lg:text-[23px]" : ""
                  }`}
                  style={{
                    fontFamily:
                      "Instagram Sans, var(--font-display), sans-serif",
                    letterSpacing: "-0.04em",
                    textTransform: "none",
                  }}
                >
                  kugurisha
                  
                </span>
              </span>
            </Link>

            {/* DESKTOP NAVIGATION */}
            <nav
              className="kg-h-nav hidden items-center gap-1 xl:flex mx-auto bg-slate-100/70 dark:bg-white/[0.04] p-1.5 rounded-full border border-slate-200/60 dark:border-white/10 backdrop-blur-md"
              aria-label="Menu nyamukuru"
            >
              {navigation.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/"}
                  className={({ isActive }) =>
                    `kg-h-navlink rounded-full px-4 py-2 text-[13px] font-bold transition-all duration-300 ${
                      isActive
                        ? "bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-sm is-active"
                        : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/5"
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}

              <span
                className="mx-1 h-4 w-px bg-slate-300 dark:bg-white/15"
                aria-hidden="true"
              />

              <NavLink
                to="/ai-search"
                className={({ isActive }) =>
                  `kg-h-navlink kg-h-ai group rounded-full px-4 py-2 text-[13px] font-extrabold flex items-center gap-2 transition-all duration-300 ${
                    isActive
                      ? "bg-gradient-to-r from-[#FF5D00] to-[#FF8533] text-white shadow-md shadow-[#FF5D00]/25 is-active"
                      : "bg-[#FF5D00]/10 text-[#FF5D00] hover:bg-[#FF5D00]/20"
                  }`
                }
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20 transition-transform duration-300 group-hover:scale-110">
                  <Icon name="spark" size={13} />
                </span>
                Baza AI
              </NavLink>
            </nav>

            {/* ACTIONS */}
            <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
              {/* Search toggle */}
              <button
                type="button"
                className={`${actionClass} relative h-10 w-10 rounded-2xl bg-slate-100/80 dark:bg-white/[0.06] text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-white/15`}
                onClick={() => {
                  setSearchOpen((previous) => !previous)
                  setAccountOpen(false)
                  setMobileOpen(false)
                }}
                aria-label={searchOpen ? "Funga ishakisha" : "Shakisha"}
                aria-expanded={searchOpen}
                title="Shakisha"
              >
                <Icon name={searchOpen ? "close" : "search"} size={18} />
              </button>

              {/* Theme toggle */}
              <button
                type="button"
                className={`${actionClass} hidden h-10 w-10 items-center justify-center rounded-2xl bg-slate-100/80 dark:bg-white/[0.06] text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-white/15 sm:flex`}
                onClick={toggleTheme}
                aria-label={
                  theme === "dark" ? "Koresha light mode" : "Koresha dark mode"
                }
                title={theme === "dark" ? "Light mode" : "Dark mode"}
              >
                <Icon name={theme === "dark" ? "sun" : "moon"} size={18} />
              </button>

              {/* Notifications */}
              {userId && (
                <Link
                  to="/notifications"
                  onClick={closeMenus}
                  className={`${actionClass} relative flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100/80 dark:bg-white/[0.06] text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-white/15`}
                  aria-label={`Imenyesha: ${unreadCount} utarasoma`}
                >
                  <Icon name="bell" size={18} />
                  {unreadCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex min-h-[19px] min-w-[19px] items-center justify-center rounded-full bg-[#FF5D00] px-1 text-[10px] font-black text-white ring-2 ring-white dark:ring-slate-900 shadow-md">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </Link>
              )}

              {/* Account / Login — hover-intent dropdown */}
              {userId ? (
                <div
                  ref={accountRef}
                  className="relative hidden sm:block"
                  onMouseEnter={handleAccountEnter}
                  onMouseLeave={handleAccountLeave}
                >
                  <button
                    type="button"
                    className={`${actionClass} group flex h-10 items-center gap-2 rounded-2xl bg-slate-100/80 dark:bg-white/[0.06] px-3 lg:px-3.5 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-white/15 ${
                      accountOpen ? "ring-2 ring-[#FF5D00]/50" : ""
                    }`}
                    onClick={() => {
                      clearHoverTimers()
                      setAccountOpen((previous) => !previous)
                      setSearchOpen(false)
                      setMobileOpen(false)
                    }}
                    aria-expanded={accountOpen}
                    aria-haspopup="menu"
                    aria-label="Fungura konti"
                  >
                    <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-white dark:bg-white/10 text-[#FF5D00] shadow-sm transition-transform duration-300 group-hover:scale-110">
                      <Icon name="user" size={15} />
                    </span>
                    <span className="hidden text-xs font-bold lg:inline">
                      Konti
                    </span>
                    <Icon
                      name="chevron"
                      size={13}
                      className={`transition-transform duration-300 text-slate-400 ${
                        accountOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {accountOpen && (
                    <div
                      role="menu"
                      className="kg-h-dropdown kg-account-menu absolute right-0 top-[calc(100%+12px)] z-[110] w-64 rounded-[2rem] p-3 shadow-2xl border border-slate-200/80 dark:border-white/15 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-200"
                    >
                      {/* invisible bridge */}
                      <span
                        aria-hidden="true"
                        className="absolute -top-3 left-0 right-0 h-3"
                      />

                      <p className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                        Konti yanjye
                      </p>

                      <div className="space-y-1 mt-1">
                        {accountLinks.map((item) => (
                          <Link
                            key={item.to}
                            to={item.to}
                            onClick={closeMenus}
                            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-700 dark:text-slate-200 transition-all hover:bg-slate-100 dark:hover:bg-white/10 hover:text-[#FF5D00]"
                          >
                            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400">
                              <Icon name={item.icon} size={16} />
                            </span>
                            {item.label}
                            {item.to === "/notifications" &&
                              unreadCount > 0 && (
                                <span className="ml-auto rounded-full bg-[#FF5D00] px-2.5 py-0.5 text-[10px] font-black text-white shadow-sm">
                                  {unreadCount}
                                </span>
                              )}
                          </Link>
                        ))}
                      </div>

                      <div className="my-2 h-[1px] bg-slate-200/80 dark:bg-white/10" />

                      <button
                        type="button"
                        onClick={() => void logout()}
                        disabled={loggingOut}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-red-500 transition-colors hover:bg-red-500/10 disabled:opacity-50"
                      >
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10 text-red-500">
                          <Icon name="logout" size={16} />
                        </span>
                        {loggingOut ? "Turimo gusohoka..." : "Sohoka"}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to="/login"
                  onClick={closeMenus}
                  className="hidden h-10 items-center rounded-2xl px-5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 transition-all sm:inline-flex"
                >
                  Injira
                </Link>
              )}

              {/* Sell CTA — the hero action */}
              <Link
                to="/create-listing"
                onClick={closeMenus}
                className="group relative hidden h-11 items-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-[#FF5D00] via-[#FF7522] to-[#FF5D00] px-5 text-xs font-black text-white shadow-lg shadow-[#FF5D00]/30 transition-all duration-300 hover:scale-[1.03] hover:shadow-xl hover:shadow-[#FF5D00]/40 active:scale-95 sm:flex lg:px-6"
              >
                <span className="pointer-events-none absolute inset-0 -translate-x-full bg-[linear-gradient(115deg,transparent_35%,rgba(255,255,255,0.35)_50%,transparent_65%)] transition-transform duration-700 group-hover:translate-x-full" />
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20 transition-transform duration-300 group-hover:rotate-90">
                  <Icon name="plus" size={13} />
                </span>
                <span className="whitespace-nowrap tracking-tight">Gurisha</span>
              </Link>

              {/* Mobile menu toggle */}
              <button
                type="button"
                onClick={() => {
                  setMobileOpen((previous) => !previous)
                  setSearchOpen(false)
                  setAccountOpen(false)
                }}
                className={`${actionClass} flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100/80 dark:bg-white/[0.06] text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-white/15 xl:hidden`}
                aria-label={mobileOpen ? "Funga menu" : "Fungura menu"}
                aria-expanded={mobileOpen}
              >
                <Icon name={mobileOpen ? "close" : "menu"} size={20} />
              </button>
            </div>
          </div>

          {/* ============ SEARCH PANEL ============ */}
          {searchOpen && (
            <form
              onSubmit={submitSearch}
              role="search"
              className="kg-h-dropdown mx-auto mt-3 flex max-w-2xl items-center gap-2 rounded-full p-2.5 pl-5 shadow-2xl border border-slate-200/80 dark:border-white/15 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl animate-in slide-in-from-top-3 duration-300"
            >
              <span className="text-[#FF5D00]">
                <Icon name="search" size={19} />
              </span>

              <input
                ref={searchInputRef}
                type="search"
                value={search}
                onChange={(event) => updateSearch(event.target.value)}
                placeholder="Urashaka iki? iPhone, inzu, laptop..."
                className="kg-h-input min-w-0 flex-1 bg-transparent px-2 py-1.5 text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 outline-none"
              />

              <button
                type="submit"
                className="rounded-full bg-gradient-to-r from-[#FF5D00] to-[#FF8533] px-6 py-2.5 text-xs font-black text-white shadow-md shadow-[#FF5D00]/30 transition-all hover:scale-105 active:scale-95"
              >
                Shakisha
              </button>
            </form>
          )}

          {/* ============ MOBILE / TABLET MENU ============ */}
          {mobileOpen && (
            <div className="kg-h-dropdown mt-3 max-h-[calc(100dvh-100px)] overflow-y-auto rounded-[2rem] p-4 xl:hidden shadow-2xl border border-slate-200/80 dark:border-white/15 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl animate-in slide-in-from-top-4 duration-300">
              <nav className="grid gap-1.5" aria-label="Menu ya telefoni">
                {navigation.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === "/"}
                    onClick={closeMenus}
                    className={({ isActive }) =>
                      `kg-h-mobilelink rounded-2xl px-4 py-3 flex items-center justify-between text-sm font-bold transition-all ${
                        isActive
                          ? "bg-[#FF5D00]/10 text-[#FF5D00]"
                          : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5"
                      }`
                    }
                  >
                    <span>{item.label}</span>
                    <Icon name="arrow" size={16} className="text-slate-400" />
                  </NavLink>
                ))}

                <NavLink
                  to="/ai-search"
                  onClick={closeMenus}
                  className={({ isActive }) =>
                    `kg-h-mobilelink rounded-2xl px-4 py-3 flex items-center justify-between text-sm font-extrabold transition-all ${
                      isActive
                        ? "bg-gradient-to-r from-[#FF5D00] to-[#FF8533] text-white shadow-md"
                        : "bg-[#FF5D00]/10 text-[#FF5D00]"
                    }`
                  }
                >
                  <span className="flex items-center gap-2.5">
                    <Icon name="spark" size={17} />
                    Baza AI
                  </span>
                  <Icon name="arrow" size={16} />
                </NavLink>

                {userId && (
                  <>
                    <div className="my-2 h-[1px] bg-slate-200/80 dark:bg-white/10" />
                    {accountLinks.map((item) => (
                      <Link
                        key={item.to}
                        to={item.to}
                        onClick={closeMenus}
                        className="kg-h-mobilelink rounded-2xl px-4 py-3 flex items-center justify-between text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5"
                      >
                        <span className="flex items-center gap-3">
                          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400">
                            <Icon name={item.icon} size={16} />
                          </span>
                          {item.label}
                        </span>
                        <Icon name="arrow" size={16} className="text-slate-400" />
                      </Link>
                    ))}
                  </>
                )}

                <div className="my-2 h-[1px] bg-slate-200/80 dark:bg-white/10" />

                <button
                  type="button"
                  onClick={toggleTheme}
                  className="kg-h-mobilelink rounded-2xl px-4 py-3 flex items-center justify-between text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 sm:hidden"
                >
                  <span className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400">
                      <Icon
                        name={theme === "dark" ? "sun" : "moon"}
                        size={17}
                      />
                    </span>
                    {theme === "dark" ? "Light mode" : "Dark mode"}
                  </span>
                </button>

                <Link
                  to="/create-listing"
                  onClick={closeMenus}
                  className="group mt-2 flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#FF5D00] to-[#FF8533] px-5 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-[#FF5D00]/30"
                >
                  <Icon name="plus" size={18} />
                  Gurisha ikintu
                </Link>

                {!userId ? (
                  <Link
                    to="/login"
                    onClick={closeMenus}
                    className="mt-1.5 justify-center rounded-2xl py-3 text-center text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 sm:hidden"
                  >
                    Injira mu konti
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => void logout()}
                    disabled={loggingOut}
                    className="mt-1.5 flex items-center justify-center gap-2.5 rounded-2xl px-4 py-3 text-sm font-bold text-red-500 transition-colors hover:bg-red-500/10 disabled:opacity-50"
                  >
                    <Icon name="logout" size={17} />
                    {loggingOut ? "Turimo gusohoka..." : "Sohoka"}
                  </button>
                )}
              </nav>
            </div>
          )}
        </div>
      </header>
    </div>
  )
}