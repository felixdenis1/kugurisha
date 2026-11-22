import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react"
import {
  Link,
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
  strokeWidth = 1.8,
}: {
  name: IconName
  size?: number
  className?: string
  strokeWidth?: number
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
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  )
}

/* ── Nav data ───────────────────────────────────────────── */

type NavChild = {
  label: string
  to: string
  description: string
  icon: IconName
  badge?: string
  highlight?: boolean
}

type NavParent = {
  label: string
  children: NavChild[]
}

const primaryNav: NavParent[] = [
  {
    label: "Ibicuruzwa",
    children: [
      {
        label: "Ibicuruzwa bihari",
        to: "/listings",
        description: "Reba ibicuruzwa byose biri ku isoko",
        icon: "store",
      },
      {
        label: "Ibyiciro",
        to: "/categories",
        description: "Shakisha ibicuruzwa ukurikije icyiciro",
        icon: "arrow",
      },
      {
        label: "Baza AI",
        to: "/ai-search",
        description: "Shakisha ibicuruzwa ukoresheje AI",
        icon: "spark",
        badge: "AI",
        highlight: true,
      },
    ],
  },
  {
    label: "Intego yacu",
    children: [
      {
        label: "Ibyo dukora",
        to: "/about",
        description: "Menya intego n'ibyo dukora kuri KUGURISHA",
        icon: "spark",
      },
      {
        label: "Uko rukora",
        to: "/how-it-works",
        description: "Uburyo bwo kugura, kugurisha no kwishyura",
        icon: "arrow",
      },
    ],
  },
]

const accountLinks: { label: string; to: string; icon: IconName }[] = [
  { label: "Umwirondoro", to: "/profile", icon: "user" },
  { label: "Ibicuruzwa byanjye", to: "/dashboard", icon: "store" },
  { label: "Ibyakunzwe", to: "/favorites", icon: "heart" },
  { label: "Ubutumwa", to: "/messages", icon: "message" },
  { label: "Imenyesha", to: "/notifications", icon: "bell" },
]

const HOVER_OPEN_DELAY = 100
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
  const [openNav, setOpenNav] = useState<string | null>(null)
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null)

  const { theme, toggleTheme } = useTheme()
  const location = useLocation()
  const navigate = useNavigate()
  const accountRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const navRefs = useRef<Record<string, HTMLDivElement | null>>({})

  const hoverOpenTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hoverCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const search = searchValue ?? internalSearch

  function closeMenus() {
    setMobileOpen(false)
    setAccountOpen(false)
    setSearchOpen(false)
    setOpenNav(null)
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

  function handleNavEnter(label: string) {
    if (hoverCloseTimer.current) {
      clearTimeout(hoverCloseTimer.current)
      hoverCloseTimer.current = null
    }
    if (openNav === label) return
    hoverOpenTimer.current = setTimeout(() => {
      setOpenNav(label)
      setAccountOpen(false)
      setSearchOpen(false)
      setMobileOpen(false)
    }, HOVER_OPEN_DELAY)
  }

  function handleNavLeave() {
    if (hoverOpenTimer.current) {
      clearTimeout(hoverOpenTimer.current)
      hoverOpenTimer.current = null
    }
    hoverCloseTimer.current = setTimeout(() => {
      setOpenNav(null)
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

      if (openNav) {
        const el = navRefs.current[openNav]
        if (el && !el.contains(target)) setOpenNav(null)
      }

      if (headerRef.current && !headerRef.current.contains(target)) {
        setSearchOpen(false)
        setMobileOpen(false)
        setOpenNav(null)
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
  }, [openNav])

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

      if (active && !error) setUnreadCount(count ?? 0)
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
    if (onSearchSubmit) onSearchSubmit()
    else if (onSearchChange) {
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

  function isParentActive(parent: NavParent): boolean {
    return parent.children.some((c) =>
      c.to === "/"
        ? location.pathname === "/"
        : location.pathname.startsWith(c.to)
    )
  }

  return (
    <div
      ref={headerRef}
      className={`fixed top-0 z-[100] w-full transition-all duration-500 py-2 sm:py-3`}
      style={{ alignSelf: "stretch" }}
    >
      <header>
        {/* Container with mx-auto and max-width. */}
        <div className="mx-auto max-w-[1520px] px-2 sm:px-4 lg:px-6">
          
          {/* PILL CONTAINER: rounded-full, grey bg, subtle border, shadow */}
          <div 
            className={`relative flex items-center justify-between gap-3 rounded-full px-3 sm:px-4 min-h-[64px] transition-all duration-500 ${
              scrolled
                ? "bg-slate-100/90 dark:bg-slate-900/90 backdrop-blur-3xl border border-slate-200/60 dark:border-white/10 shadow-[0_8px_30px_-12px_rgba(15,23,42,0.15)]"
                : "bg-transparent border-transparent"
            }`}
          >
            
            {/* BRAND - Logo touches text */}
            <Link
              to="/"
              onClick={closeMenus}
              className="group flex shrink-0 items-center gap-0"
              aria-label="KUGURISHA - Ahabanza"
            >
              <span className="flex shrink-0 items-center justify-center transition-all duration-500 group-hover:scale-105 group-hover:rotate-[-4deg]">
                <img
                  src="/favicon.svg"
                  alt=""
                  className="h-14 w-14 sm:h-16 sm:w-16 object-contain filter drop-shadow-sm"
                />
              </span>
              <span 
                className="text-[24px] sm:text-[26px] font-black leading-none tracking-[-0.04em] text-slate-900 dark:text-white -ml-1 sm:-ml-2"
                style={{ fontFamily: '"Space Grotesk", sans-serif' }}
              >
                kugurisha
              </span>
            </Link>

            {/* DESKTOP NAV */}
            <nav
              className="hidden items-center gap-1 xl:flex mx-auto"
              aria-label="Menu nyamukuru"
            >
              {/* Direct link to Home */}
              <Link
                to="/"
                onClick={closeMenus}
                className={`group relative flex items-center gap-2 rounded-full px-6 py-2.5 transition-all duration-300 ${
                  location.pathname === "/"
                    ? "text-slate-900 dark:text-white bg-white/50 dark:bg-white/10 shadow-sm"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/40 dark:hover:bg-white/5"
                }`}
              >
                <span 
                  className="text-[16px] font-extrabold tracking-[-0.02em]"
                  style={{ fontFamily: '"Outfit", "Space Grotesk", sans-serif' }}
                >
                  Ahabanza
                </span>
              </Link>

              {/* Dropdown Parents */}
              {primaryNav.map((parent) => {
                const isOpen = openNav === parent.label
                const parentActive = isParentActive(parent)

                return (
                  <div
                    key={parent.label}
                    ref={(el) => {
                      navRefs.current[parent.label] = el
                    }}
                    className="relative"
                    style={{ zIndex: isOpen ? 300 : 1 }}
                    onMouseEnter={() => handleNavEnter(parent.label)}
                    onMouseLeave={handleNavLeave}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        clearHoverTimers()
                        setOpenNav(isOpen ? null : parent.label)
                      }}
                      className={`group relative flex items-center gap-2 rounded-full px-6 py-2.5 transition-all duration-300 cursor-pointer ${
                        parentActive || isOpen
                          ? "text-slate-900 dark:text-white bg-white/50 dark:bg-white/10 shadow-sm"
                          : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/40 dark:hover:bg-white/5"
                      }`}
                      aria-haspopup="menu"
                      aria-expanded={isOpen}
                    >
                      <span 
                        className="text-[16px] font-extrabold tracking-[-0.02em]"
                        style={{ fontFamily: '"Outfit", "Space Grotesk", sans-serif' }}
                      >
                        {parent.label}
                      </span>
                      <Icon
                        name="chevron"
                        size={14}
                        strokeWidth={3}
                        className={`transition-transform duration-300 opacity-60 ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {/* DROPDOWN */}
                    {isOpen && (
                      <div
                        role="menu"
                        className="absolute left-1/2 top-[calc(100%+16px)] w-[340px] -translate-x-1/2 rounded-[28px] p-3 shadow-[0_40px_80px_-20px_rgba(15,23,42,0.2)] border border-slate-200/60 dark:border-white/10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-3xl animate-in fade-in zoom-in-95 duration-200"
                        style={{
                          position: "absolute",
                          zIndex: 9999,
                          visibility: "visible",
                          opacity: 1,
                          overflow: "visible",
                        }}
                        onMouseEnter={() => {
                          if (hoverCloseTimer.current) {
                            clearTimeout(hoverCloseTimer.current)
                            hoverCloseTimer.current = null
                          }
                        }}
                      >
                        <span aria-hidden="true" className="absolute -top-5 left-0 right-0 h-5" />
                        {parent.children.map((child) => {
                          const childActive =
                            child.to === "/"
                              ? location.pathname === "/"
                              : location.pathname.startsWith(child.to)
                          return (
                            <Link
                              key={child.to}
                              to={child.to}
                              onClick={closeMenus}
                              className={`group/item flex items-start gap-4 rounded-[20px] p-3.5 transition-all duration-200 ${
                                childActive
                                  ? "bg-[#FF5D00]/8 dark:bg-[#FF5D00]/10"
                                  : "hover:bg-slate-50 dark:hover:bg-white/5"
                              }`}
                            >
                              <span
                                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-all duration-300 group-hover/item:scale-110 ${
                                  child.highlight
                                    ? "bg-gradient-to-br from-[#FF5D00] to-[#FF8533] text-white shadow-lg shadow-[#FF5D00]/30"
                                    : childActive
                                    ? "bg-[#FF5D00]/15 text-[#FF5D00]"
                                    : "bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400"
                                }`}
                              >
                                <Icon name={child.icon} size={20} strokeWidth={2.5} />
                              </span>
                              <span className="min-w-0 flex-1 pt-0.5">
                                <span
                                  className={`flex items-center gap-2 text-[15px] font-bold ${
                                    child.highlight
                                      ? "text-[#FF5D00]"
                                      : "text-slate-900 dark:text-white"
                                  }`}
                                >
                                  {child.label}
                                  {child.badge && (
                                    <span className="rounded-full bg-[#FF5D00] px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-white">
                                      {child.badge}
                                    </span>
                                  )}
                                </span>
                                <span className="mt-1 block text-[12px] font-medium leading-snug text-slate-500 dark:text-slate-400">
                                  {child.description}
                                </span>
                              </span>
                            </Link>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </nav>

            {/* ACTIONS */}
            <div className="flex shrink-0 items-center gap-1.5 sm:gap-2 pr-1 sm:pr-2">
              {/* SEARCH */}
              <button
                type="button"
                className="group relative flex h-11 w-11 items-center justify-center rounded-full text-slate-600 dark:text-slate-300 transition-all duration-300 hover:bg-white/60 dark:hover:bg-white/10 hover:scale-105 active:scale-95"
                onClick={() => {
                  setSearchOpen((p) => !p)
                  setAccountOpen(false)
                  setMobileOpen(false)
                  setOpenNav(null)
                }}
                aria-label={searchOpen ? "Funga ishakisha" : "Shakisha"}
                aria-expanded={searchOpen}
              >
                <Icon name={searchOpen ? "close" : "search"} size={22} strokeWidth={2.2} />
              </button>

              {/* THEME */}
              <button
                type="button"
                className="group hidden h-11 w-11 items-center justify-center rounded-full text-slate-600 dark:text-slate-300 transition-all duration-300 hover:bg-white/60 dark:hover:bg-white/10 hover:scale-105 active:scale-95 sm:flex"
                onClick={toggleTheme}
                aria-label={theme === "dark" ? "Light mode" : "Dark mode"}
              >
                <Icon name={theme === "dark" ? "sun" : "moon"} size={22} strokeWidth={2.2} />
              </button>

              {/* NOTIFICATIONS */}
              {userId && (
                <Link
                  to="/notifications"
                  onClick={closeMenus}
                  className="group relative flex h-11 w-11 items-center justify-center rounded-full text-slate-600 dark:text-slate-300 transition-all duration-300 hover:bg-white/60 dark:hover:bg-white/10 hover:scale-105 active:scale-95"
                  aria-label={`Imenyesha: ${unreadCount} utarasoma`}
                >
                  <Icon name="bell" size={22} strokeWidth={2.2} />
                  {unreadCount > 0 && (
                    <span className="absolute right-1 top-1 flex min-h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#FF5D00] px-1 text-[10px] font-black text-white ring-2 ring-white dark:ring-slate-950 shadow-lg animate-pulse">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </Link>
              )}

              {/* ACCOUNT */}
              {userId ? (
                <div
                  ref={accountRef}
                  className="relative hidden sm:block"
                  onMouseEnter={handleAccountEnter}
                  onMouseLeave={handleAccountLeave}
                >
                  <button
                    type="button"
                    className={`group flex h-11 items-center gap-2 rounded-full px-2.5 pr-4 transition-all duration-300 hover:bg-white/60 dark:hover:bg-white/10 ${
                      accountOpen ? "bg-white/60 dark:bg-white/10" : ""
                    }`}
                    onClick={() => {
                      clearHoverTimers()
                      setAccountOpen((p) => !p)
                      setSearchOpen(false)
                      setMobileOpen(false)
                      setOpenNav(null)
                    }}
                    aria-expanded={accountOpen}
                    aria-haspopup="menu"
                    aria-label="Fungura konti"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm transition-transform duration-300 group-hover:scale-105">
                      <Icon name="user" size={16} strokeWidth={2.5} />
                    </span>
                    <span className="hidden text-[13px] font-bold tracking-tight text-slate-700 dark:text-slate-200 lg:inline">
                      Konti
                    </span>
                    <Icon
                      name="chevron"
                      size={14}
                      strokeWidth={3}
                      className={`text-slate-400 transition-transform duration-300 ${accountOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {accountOpen && (
                    <div
                      role="menu"
                      className="absolute right-0 top-[calc(100%+16px)] w-72 rounded-[24px] p-2.5 shadow-[0_40px_80px_-20px_rgba(15,23,42,0.2)] border border-slate-200/60 dark:border-white/10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-3xl animate-in fade-in zoom-in-95 duration-200"
                      style={{ zIndex: 9999, visibility: "visible", opacity: 1 }}
                    >
                      <span aria-hidden="true" className="absolute -top-5 left-0 right-0 h-5" />

                      <p className="px-3.5 py-3 text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
                        Konti yanjye
                      </p>

                      <div className="space-y-1">
                        {accountLinks.map((item) => (
                          <Link
                            key={item.to}
                            to={item.to}
                            onClick={closeMenus}
                            className="group/menu flex items-center gap-3 rounded-xl px-3 py-3 text-[14px] font-bold text-slate-700 dark:text-slate-200 transition-all duration-200 hover:bg-slate-100 dark:hover:bg-white/5"
                          >
                            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100/80 dark:bg-white/5 text-slate-500 transition-all duration-200 group-hover/menu:bg-[#FF5D00]/10 group-hover/menu:text-[#FF5D00]">
                              <Icon name={item.icon} size={16} strokeWidth={2.2} />
                            </span>
                            {item.label}
                            {item.to === "/notifications" && unreadCount > 0 && (
                              <span className="ml-auto rounded-full bg-[#FF5D00] px-2.5 py-0.5 text-[10px] font-black text-white">
                                {unreadCount}
                              </span>
                            )}
                          </Link>
                        ))}
                      </div>

                      <div className="my-2 h-[1px] bg-slate-200/60 dark:bg-white/5" />

                      <button
                        type="button"
                        onClick={() => void logout()}
                        disabled={loggingOut}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-[14px] font-bold text-red-500 transition-all duration-200 hover:bg-red-50 dark:hover:bg-red-500/10 disabled:opacity-50"
                      >
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10 text-red-500">
                          <Icon name="logout" size={16} strokeWidth={2.2} />
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
                  className="hidden h-11 items-center rounded-full px-5 text-[14px] font-bold text-slate-700 dark:text-slate-200 transition-all duration-300 hover:bg-white/60 dark:hover:bg-white/10 sm:inline-flex"
                >
                  Injira
                </Link>
              )}

              {/* SELL CTA */}
              <Link
                to="/create-listing"
                onClick={closeMenus}
                className="group relative hidden h-11 items-center gap-2 overflow-hidden rounded-full bg-slate-900 px-5 text-[14px] font-black tracking-tight text-white shadow-[0_8px_20px_-6px_rgba(15,23,42,0.4)] transition-all duration-300 hover:bg-[#FF5D00] hover:scale-[1.02] hover:shadow-[0_12px_24px_-8px_rgba(255,93,0,0.5)] active:scale-95 sm:flex"
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20 transition-transform duration-500 group-hover:rotate-90">
                  <Icon name="plus" size={13} strokeWidth={3} />
                </span>
                <span className="whitespace-nowrap">Gurisha</span>
              </Link>

              {/* MOBILE MENU */}
              <button
                type="button"
                onClick={() => {
                  setMobileOpen((p) => !p)
                  setSearchOpen(false)
                  setAccountOpen(false)
                  setOpenNav(null)
                }}
                className="flex h-11 w-11 items-center justify-center rounded-full text-slate-600 dark:text-slate-300 transition-all duration-300 hover:bg-white/60 dark:hover:bg-white/10 active:scale-95 xl:hidden"
                aria-label={mobileOpen ? "Funga menu" : "Fungura menu"}
                aria-expanded={mobileOpen}
              >
                <Icon name={mobileOpen ? "close" : "menu"} size={24} strokeWidth={2.5} />
              </button>
            </div>
          </div>

          {/* SEARCH PANEL */}
          {searchOpen && (
            <form
              onSubmit={submitSearch}
              role="search"
              className="absolute left-1/2 top-full mt-2 flex w-full max-w-2xl -translate-x-1/2 items-center gap-2 rounded-full p-2 pl-6 shadow-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900 animate-in slide-in-from-top-4 duration-300 z-[150]"
            >
              <span className="text-slate-400">
                <Icon name="search" size={22} strokeWidth={2.2} />
              </span>
              <input
                ref={searchInputRef}
                type="search"
                value={search}
                onChange={(event) => updateSearch(event.target.value)}
                placeholder="Urashaka iki? iPhone, inzu, laptop..."
                className="min-w-0 flex-1 bg-transparent px-2 py-3 text-[15px] font-bold text-slate-900 dark:text-white placeholder:text-slate-400 outline-none"
              />
              <button
                type="submit"
                className="rounded-full bg-[#FF5D00] px-8 py-3 text-[14px] font-black text-white shadow-md transition-all duration-200 hover:bg-[#FF8533] hover:scale-105"
              >
                Shakisha
              </button>
            </form>
          )}

          {/* MOBILE MENU */}
          {mobileOpen && (
            <div className="absolute left-2 right-2 sm:left-4 sm:right-4 top-full mt-2 max-h-[calc(100dvh-100px)] overflow-y-auto rounded-3xl p-4 xl:hidden shadow-2xl border border-slate-200/80 dark:border-white/10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-3xl animate-in slide-in-from-top-4 duration-300 z-[150]">
              <nav className="grid gap-1" aria-label="Menu ya telefoni">
                {/* Mobile Home Link */}
                <Link
                  to="/"
                  onClick={closeMenus}
                  className={`flex w-full items-center rounded-2xl px-4 py-4 text-[16px] font-extrabold transition-all ${
                    location.pathname === "/"
                      ? "bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white"
                      : "text-slate-600 dark:text-slate-300"
                  }`}
                >
                  Ahabanza
                </Link>

                {primaryNav.map((parent) => {
                  const isExpanded = mobileExpanded === parent.label
                  const parentActive = isParentActive(parent)

                  return (
                    <div key={parent.label}>
                      <button
                        type="button"
                        onClick={() =>
                          setMobileExpanded(isExpanded ? null : parent.label)
                        }
                        className={`flex w-full items-center justify-between rounded-2xl px-4 py-4 text-[16px] font-extrabold transition-all ${
                          parentActive || isExpanded
                            ? "bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white"
                            : "text-slate-600 dark:text-slate-300"
                        }`}
                        aria-expanded={isExpanded}
                      >
                        <span>{parent.label}</span>
                        <Icon
                          name="chevron"
                          size={18}
                          strokeWidth={2.5}
                          className={`transition-transform duration-300 opacity-50 ${
                            isExpanded ? "rotate-180" : ""
                          }`}
                        />
                      </button>

                      {isExpanded && (
                        <div className="mt-1 ml-4 space-y-1 border-l-2 border-slate-200 dark:border-white/10 pl-3 animate-in slide-in-from-top-2 duration-200">
                          {parent.children.map((child) => (
                            <Link
                              key={child.to}
                              to={child.to}
                              onClick={closeMenus}
                              className={`flex items-start gap-3 rounded-xl p-3 transition-all ${
                                location.pathname.startsWith(child.to)
                                  ? "bg-slate-100/50 dark:bg-white/5"
                                  : ""
                              }`}
                            >
                              <span
                                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                                  child.highlight
                                    ? "bg-gradient-to-br from-[#FF5D00] to-[#FF8533] text-white"
                                    : "bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 shadow-sm border border-slate-100 dark:border-white/5"
                                }`}
                              >
                                <Icon name={child.icon} size={16} strokeWidth={2.2} />
                              </span>
                              <span className="min-w-0 flex-1 pt-0.5">
                                <span
                                  className={`flex items-center gap-2 text-[14px] font-bold ${
                                    child.highlight
                                      ? "text-[#FF5D00]"
                                      : "text-slate-900 dark:text-white"
                                  }`}
                                >
                                  {child.label}
                                  {child.badge && (
                                    <span className="rounded-full bg-[#FF5D00] px-1.5 py-0.5 text-[9px] font-black text-white">
                                      {child.badge}
                                    </span>
                                  )}
                                </span>
                                <span className="mt-0.5 block text-[11px] font-medium leading-snug text-slate-500 dark:text-slate-400">
                                  {child.description}
                                </span>
                              </span>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}

                <div className="my-3 h-[1px] bg-slate-100 dark:bg-white/5" />

                <Link
                  to="/create-listing"
                  onClick={closeMenus}
                  className="mt-1 flex items-center justify-center gap-2 rounded-full bg-[#FF5D00] px-5 py-4 text-[15px] font-black text-white shadow-lg shadow-[#FF5D00]/30"
                >
                  <Icon name="plus" size={20} strokeWidth={2.5} />
                  Gurisha ikintu
                </Link>
              </nav>
            </div>
          )}
        </div>
      </header>
    </div>
  )
}