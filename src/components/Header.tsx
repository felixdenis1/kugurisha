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
  | "check"

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
    check: <path d="M4.5 12.75l6 6 9-13.5" />,
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

type MiniNotification = {
  id: string
  title: string
  body: string | null
  is_read: boolean
  created_at: string
  type: string
}

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
  const [mobileAccountOpen, setMobileAccountOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  
  // NOTIFICATION DROPDOWN STATES
  const [notifOpen, setNotifOpen] = useState(false)
  const [miniNotifs, setMiniNotifs] = useState<MiniNotification[]>([])
  const [loadingNotifs, setLoadingNotifs] = useState(false)

  const [internalSearch, setInternalSearch] = useState("")
  const [loggingOut, setLoggingOut] = useState(false)
  const [openNav, setOpenNav] = useState<string | null>(null)
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null)
  
  // Ambient Dynamic Color State
  const [glowIndex, setGlowIndex] = useState(0)
  const glowColors = [
    "from-[#FF5D00]/20 to-purple-500/20",
    "from-blue-500/20 to-emerald-500/20",
    "from-emerald-500/20 to-[#FF5D00]/20",
    "from-purple-500/20 to-blue-500/20",
  ]

  const { theme, toggleTheme } = useTheme()
  const location = useLocation()
  const navigate = useNavigate()
  const accountRef = useRef<HTMLDivElement>(null)
  const mobileAccountRef = useRef<HTMLDivElement>(null)
  const notifRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const navRefs = useRef<Record<string, HTMLDivElement | null>>({})

  const hoverOpenTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hoverCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const search = searchValue ?? internalSearch

  // Rotate the ambient header glow
  useEffect(() => {
    const timer = setInterval(() => {
      setGlowIndex((prev) => (prev + 1) % glowColors.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [glowColors.length])

  function closeMenus() {
    setMobileOpen(false)
    setAccountOpen(false)
    setMobileAccountOpen(false)
    setSearchOpen(false)
    setNotifOpen(false)
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

  // --- Dropdown Hover Logic ---
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
      setNotifOpen(false)
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
      setMobileAccountOpen(false)
      setSearchOpen(false)
      setMobileOpen(false)
      setNotifOpen(false)
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
      if (mobileAccountRef.current && !mobileAccountRef.current.contains(target)) {
        setMobileAccountOpen(false)
      }
      if (notifRef.current && !notifRef.current.contains(target)) {
        setNotifOpen(false)
      }
      if (openNav) {
        const el = navRefs.current[openNav]
        if (el && !el.contains(target)) setOpenNav(null)
      }
      if (headerRef.current && !headerRef.current.contains(target)) {
        setSearchOpen(false)
        setMobileOpen(false)
        setMobileAccountOpen(false)
        setNotifOpen(false)
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

  // --- AUTH & NOTIFICATIONS ---
  useEffect(() => {
    let active = true

    void supabase.auth.getUser().then(({ data }) => {
      if (active) setUserId(data.user?.id ?? null)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
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
      setMiniNotifs([])
      return
    }

    let active = true

    async function refreshCountAndData() {
      if (active) setLoadingNotifs(true)

      try {
        // Get Count
        const { count, error } = await supabase
          .from("notifications")
          .select("id", { count: "exact", head: true })
          .eq("user_id", userId)
          .eq("is_read", false)

        if (active && !error) setUnreadCount(count ?? 0)

        // Get Latest 5 for Dropdown
        const { data, error: dataError } = await supabase
          .from("notifications")
          .select("id, title, body, is_read, created_at, type")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(5)

        if (active && !dataError) {
          setMiniNotifs(data || [])
        }
      } finally {
        if (active) setLoadingNotifs(false)
      }
    }

    void refreshCountAndData()

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
        () => void refreshCountAndData(),
      )
      .subscribe()

    return () => {
      active = false
      void supabase.removeChannel(channel)
    }
  }, [userId])

  async function markMiniNotifsAsRead() {
    if (unreadCount === 0) return
    const unreadIds = miniNotifs.filter(n => !n.is_read).map(n => n.id)
    if (unreadIds.length === 0) return

    // Optimistic UI update
    setMiniNotifs(curr => curr.map(n => ({ ...n, is_read: true })))
    setUnreadCount(0)

    await supabase.from("notifications").update({ is_read: true }).in("id", unreadIds)
  }

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
      if (location.pathname !== "/") navigate(`/?search=${encodeURIComponent(query)}`)
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
      c.to === "/" ? location.pathname === "/" : location.pathname.startsWith(c.to)
    )
  }

  return (
    <div
      ref={headerRef}
      className="fixed top-0 z-[100] w-full transition-all duration-500 py-3 sm:py-5"
    >
      <header>
        <div className="mx-auto max-w-[1520px] px-2 sm:px-4 lg:px-6">
          
          {/* PREMIUM GLASS BAR */}
          <div 
            className={`relative flex items-center justify-between gap-3 rounded-full px-4 sm:px-5 min-h-[76px] sm:min-h-[84px] transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              scrolled
                ? "bg-white/80 dark:bg-[#0a1017]/80 backdrop-blur-[40px] border border-slate-200/50 dark:border-white/10 shadow-[0_20px_40px_-20px_rgba(0,0,0,0.1)] scale-[0.99]"
                : "bg-white/60 dark:bg-slate-900/60 backdrop-blur-[20px] border border-slate-200/40 dark:border-white/5 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.05)]"
            }`}
          >
            {/* Dynamic Ambient Background Glow */}
            <div className={`pointer-events-none absolute inset-0 -z-10 rounded-full bg-gradient-to-r opacity-50 blur-2xl transition-all duration-1000 ease-in-out ${glowColors[glowIndex]}`} />

            {/* BRAND */}
            <Link
              to="/"
              onClick={closeMenus}
              className="group flex shrink-0 items-center gap-0 relative z-10"
            >
              <span className="flex shrink-0 items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-[-8deg] drop-shadow-md">
                <img src="/favicon.svg" alt="" className="h-14 w-14 sm:h-16 sm:w-16 object-contain" />
              </span>
            </Link>

            {/* DESKTOP NAV */}
            <nav className="hidden items-center gap-1 xl:flex mx-auto relative z-10">
              <Link
                to="/"
                onClick={closeMenus}
                className={`group relative flex items-center gap-2 rounded-full px-5 py-2.5 transition-all duration-300 ${
                  location.pathname === "/"
                    ? "text-slate-900 dark:text-white bg-white/80 dark:bg-white/10 shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/5"
                }`}
              >
                <span className="text-[16px] font-extrabold tracking-[-0.01em]" style={{ fontFamily: '"Outfit", "Space Grotesk", sans-serif' }}>
                  Ahabanza
                </span>
              </Link>

              {primaryNav.map((parent) => {
                const isOpen = openNav === parent.label
                const parentActive = isParentActive(parent)

                return (
                  <div
                    key={parent.label}
                    ref={(el) => { navRefs.current[parent.label] = el }}
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
                        setNotifOpen(false)
                      }}
                      className={`group relative flex items-center gap-2 rounded-full px-5 py-2.5 transition-all duration-300 cursor-pointer ${
                        parentActive || isOpen
                          ? "text-slate-900 dark:text-white bg-white/80 dark:bg-white/10 shadow-sm"
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/5"
                      }`}
                    >
                      <span className="text-[16px] font-extrabold tracking-[-0.01em]" style={{ fontFamily: '"Outfit", "Space Grotesk", sans-serif' }}>
                        {parent.label}
                      </span>
                      <Icon name="chevron" size={14} strokeWidth={3} className={`transition-transform duration-300 opacity-60 ${isOpen ? "rotate-180 text-[#FF5D00]" : ""}`} />
                    </button>

                    {isOpen && (
                      <div
                        role="menu"
                        className="absolute left-1/2 top-[calc(100%+16px)] w-[340px] -translate-x-1/2 rounded-[28px] p-3 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.2)] border border-slate-200/60 dark:border-white/10 bg-white/90 dark:bg-[#0a1017]/90 backdrop-blur-[50px] animate-in fade-in zoom-in-95 duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
                        onMouseEnter={() => {
                          if (hoverCloseTimer.current) {
                            clearTimeout(hoverCloseTimer.current)
                            hoverCloseTimer.current = null
                          }
                        }}
                      >
                        <span aria-hidden="true" className="absolute -top-5 left-0 right-0 h-5" />
                        {parent.children.map((child) => (
                          <Link
                            key={child.to}
                            to={child.to}
                            onClick={closeMenus}
                            className={`group/item flex items-start gap-4 rounded-[20px] p-3.5 transition-all duration-300 ${
                              location.pathname.startsWith(child.to)
                                ? "bg-[#FF5D00]/10 dark:bg-[#FF5D00]/15"
                                : "hover:bg-slate-100/50 dark:hover:bg-white/5"
                            }`}
                          >
                            <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-all duration-500 group-hover/item:scale-110 group-hover/item:rotate-3 ${
                              child.highlight
                                ? "bg-gradient-to-br from-[#FF5D00] to-[#FF8533] text-white shadow-lg shadow-[#FF5D00]/30"
                                : "bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400"
                            }`}>
                              <Icon name={child.icon} size={20} strokeWidth={2.5} />
                            </span>
                            <span className="min-w-0 flex-1 pt-0.5">
                              <span className={`flex items-center gap-2 text-[15px] font-bold ${
                                child.highlight ? "text-[#FF5D00]" : "text-slate-900 dark:text-white group-hover/item:text-[#FF5D00] dark:group-hover/item:text-[#FF5D00]"
                              }`}>
                                {child.label}
                                {child.badge && (
                                  <span className="rounded-full bg-[#FF5D00] px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-white shadow-sm">
                                    {child.badge}
                                  </span>
                                )}
                              </span>
                              <span className="mt-1 block text-[12px] font-medium leading-snug text-slate-500 dark:text-slate-400">
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
            </nav>

            {/* ACTIONS */}
            <div className="flex shrink-0 items-center gap-1 sm:gap-2 pr-1 sm:pr-2 relative z-10">
              
              {/* SEARCH BUTTON */}
              <button
                type="button"
                className="group relative flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full text-slate-600 dark:text-slate-300 transition-all duration-300 hover:bg-slate-200/50 dark:hover:bg-white/10 hover:scale-110 active:scale-95"
                onClick={() => {
                  setSearchOpen((p) => !p)
                  setAccountOpen(false)
                  setMobileAccountOpen(false)
                  setMobileOpen(false)
                  setNotifOpen(false)
                  setOpenNav(null)
                }}
              >
                <Icon name={searchOpen ? "close" : "search"} size={22} strokeWidth={2.5} />
              </button>

              {/* THEME BUTTON */}
              <button
                type="button"
                className="group flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full text-slate-600 dark:text-slate-300 transition-all duration-300 hover:bg-slate-200/50 dark:hover:bg-white/10 hover:scale-110 active:scale-95"
                onClick={toggleTheme}
              >
                <Icon name={theme === "dark" ? "sun" : "moon"} size={22} strokeWidth={2.5} />
              </button>

              {/* ═════════ NOTIFICATIONS DROPDOWN ═════════ */}
              {userId && (
                <div ref={notifRef} className="relative hidden sm:block">
                  <button
                    type="button"
                    onClick={() => {
                      setNotifOpen((p) => !p)
                      setAccountOpen(false)
                      setSearchOpen(false)
                      setMobileOpen(false)
                      setOpenNav(null)
                    }}
                    className={`group relative flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full transition-all duration-300 hover:bg-slate-200/50 dark:hover:bg-white/10 hover:scale-110 active:scale-95 ${
                      notifOpen ? "bg-slate-200/50 dark:bg-white/10" : "text-slate-600 dark:text-slate-300"
                    }`}
                  >
                    <Icon name="bell" size={22} strokeWidth={2.5} />
                    {unreadCount > 0 && (
                      <span className="absolute right-2 top-2 flex min-h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#FF5D00] px-1 text-[10px] font-black text-white ring-2 ring-white dark:ring-[#0a1017] shadow-lg animate-pulse">
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </span>
                    )}
                  </button>

                  {/* THE NOTIFICATION PANEL */}
                  {notifOpen && (
                    <div className="absolute right-0 top-[calc(100%+16px)] w-[360px] overflow-hidden rounded-[24px] border border-slate-200/60 bg-white/95 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.2)] backdrop-blur-[50px] dark:border-white/10 dark:bg-[#0a1017]/95 animate-in fade-in slide-in-from-top-4 duration-300 z-[9999]">
                      
                      {/* Panel Header */}
                      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-white/5">
                        <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400">Imenyesha</h3>
                        {unreadCount > 0 && (
                          <button 
                            onClick={markMiniNotifsAsRead}
                            className="text-[10px] font-bold text-[#FF5D00] hover:underline flex items-center gap-1"
                          >
                            <Icon name="check" size={12} strokeWidth={3} />
                            Soma zose
                          </button>
                        )}
                      </div>

                      {/* Panel Body */}
                      <div className="max-h-[360px] overflow-y-auto">
                        {loadingNotifs ? (
                           <div className="flex flex-col items-center justify-center py-10">
                             <span className="h-6 w-6 animate-spin rounded-full border-2 border-[#FF5D00]/30 border-t-[#FF5D00]" />
                           </div>
                        ) : miniNotifs.length === 0 ? (
                          <div className="px-6 py-10 text-center">
                            <Icon name="bell" size={32} className="mx-auto mb-3 text-slate-300 dark:text-slate-600" />
                            <p className="text-sm font-bold text-slate-600 dark:text-slate-300">Nta menyesha ufite</p>
                          </div>
                        ) : (
                          <div className="flex flex-col">
                            {miniNotifs.map(notif => (
                              <button
                                key={notif.id}
                                onClick={async () => {
                                  if (!notif.is_read) {
                                    await supabase.from("notifications").update({ is_read: true }).eq("id", notif.id)
                                    setMiniNotifs(curr => curr.map(n => n.id === notif.id ? { ...n, is_read: true } : n))
                                    setUnreadCount(prev => Math.max(0, prev - 1))
                                  }
                                  closeMenus()
                                  navigate("/notifications")
                                }}
                                className={`flex w-full items-start gap-3 border-b border-slate-50 p-4 text-left transition-colors last:border-0 hover:bg-slate-50 dark:border-white/5 dark:hover:bg-white/[0.03] ${
                                  !notif.is_read ? "bg-orange-50/30 dark:bg-[#FF5D00]/5" : ""
                                }`}
                              >
                                <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                                  notif.type === "new_message" ? "bg-blue-100 text-blue-600" 
                                  : notif.type.includes("listing") ? "bg-amber-100 text-amber-600"
                                  : "bg-slate-100 text-slate-500"
                                }`}>
                                  <Icon name={notif.type === "new_message" ? "message" : notif.type.includes("listing") ? "store" : "bell"} size={14} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className={`text-sm line-clamp-1 ${!notif.is_read ? "font-black text-slate-900 dark:text-white" : "font-semibold text-slate-600 dark:text-slate-300"}`}>
                                    {notif.title}
                                  </p>
                                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                                    {notif.body || "Kanda urebe byose..."}
                                  </p>
                                  <p className="mt-1 text-[10px] font-bold text-slate-400">
                                    {new Date(notif.created_at).toLocaleDateString("rw-RW", { month: "short", day: "numeric" })}
                                  </p>
                                </div>
                                {!notif.is_read && (
                                  <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#FF5D00]" />
                                )}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Panel Footer */}
                      <button
                        onClick={() => {
                          closeMenus()
                          navigate("/notifications")
                        }}
                        className="flex w-full items-center justify-center bg-slate-50 py-3 text-xs font-black text-slate-700 transition hover:bg-slate-100 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
                      >
                        Reba byose
                        <Icon name="arrow" size={14} className="ml-1.5" />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* USER ACCOUNT */}
              {userId ? (
                <>
                  {/* MOBILE ACCOUNT */}
                  <div ref={mobileAccountRef} className="relative flex sm:hidden">
                    <button
                      type="button"
                      className={`group relative flex h-11 w-11 items-center justify-center rounded-full transition-all duration-300 hover:bg-slate-200/50 dark:hover:bg-white/10 active:scale-95 ${mobileAccountOpen ? "bg-slate-200/50 dark:bg-white/10" : ""}`}
                      onClick={() => {
                        setMobileAccountOpen((p) => !p)
                        setAccountOpen(false)
                        setSearchOpen(false)
                        setMobileOpen(false)
                        setNotifOpen(false)
                        setOpenNav(null)
                      }}
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#102436] dark:bg-white text-white dark:text-[#102436] shadow-sm">
                        <Icon name="user" size={16} strokeWidth={2.5} />
                      </span>
                      {unreadCount > 0 && (
                        <span className="absolute right-1.5 top-1.5 flex min-h-[16px] min-w-[16px] items-center justify-center rounded-full bg-[#FF5D00] px-1 text-[9px] font-black text-white ring-2 ring-white dark:ring-[#0a1017]">
                          {unreadCount > 99 ? "99+" : unreadCount}
                        </span>
                      )}
                    </button>

                    {mobileAccountOpen && (
                      <div className="absolute right-0 top-[calc(100%+12px)] w-[calc(100vw-2rem)] max-w-[320px] rounded-[24px] p-2.5 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.2)] border border-slate-200/60 dark:border-white/10 bg-white/95 dark:bg-[#0a1017]/95 backdrop-blur-[50px] animate-in fade-in zoom-in-95 duration-300 z-[9999]">
                        <p className="px-3.5 py-3 text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">Konti yanjye</p>
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

                  {/* DESKTOP ACCOUNT */}
                  <div
                    ref={accountRef}
                    className="relative hidden sm:block"
                    onMouseEnter={handleAccountEnter}
                    onMouseLeave={handleAccountLeave}
                  >
                    <button
                      type="button"
                      className={`group flex h-11 sm:h-12 items-center gap-2 rounded-full px-2.5 pr-4 transition-all duration-300 hover:bg-slate-200/50 dark:hover:bg-white/10 ${
                        accountOpen ? "bg-slate-200/50 dark:bg-white/10" : ""
                      }`}
                      onClick={() => {
                        clearHoverTimers()
                        setAccountOpen((p) => !p)
                        setMobileAccountOpen(false)
                        setSearchOpen(false)
                        setMobileOpen(false)
                        setNotifOpen(false)
                        setOpenNav(null)
                      }}
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#102436] dark:bg-white text-white dark:text-[#102436] shadow-sm transition-transform duration-300 group-hover:scale-105">
                        <Icon name="user" size={16} strokeWidth={2.5} />
                      </span>
                      <span className="hidden text-[14px] font-bold tracking-tight text-slate-700 dark:text-slate-200 lg:inline">
                        Konti
                      </span>
                      <Icon name="chevron" size={14} strokeWidth={3} className={`text-slate-400 transition-transform duration-300 ${accountOpen ? "rotate-180 text-[#FF5D00]" : ""}`} />
                    </button>

                    {accountOpen && (
                      <div className="absolute right-0 top-[calc(100%+16px)] w-72 rounded-[24px] p-2.5 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.2)] border border-slate-200/60 dark:border-white/10 bg-white/95 dark:bg-[#0a1017]/95 backdrop-blur-[50px] animate-in fade-in zoom-in-95 duration-300 z-[9999]">
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
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={closeMenus}
                  className="hidden h-11 sm:h-12 items-center rounded-full px-5 text-[14px] font-bold text-slate-700 dark:text-slate-200 transition-all duration-300 hover:bg-slate-200/50 dark:hover:bg-white/10 sm:inline-flex"
                >
                  Injira
                </Link>
              )}

              {/* SELL CTA */}
              <Link
                to="/create-listing"
                onClick={closeMenus}
                className="group relative hidden h-11 sm:h-12 items-center gap-2 overflow-hidden rounded-full bg-[#102436] px-6 text-[15px] font-black tracking-tight text-white shadow-[0_8px_20px_-6px_rgba(15,23,42,0.4)] transition-all duration-300 hover:bg-[#FF5D00] hover:scale-[1.02] hover:shadow-[0_12px_24px_-8px_rgba(255,93,0,0.5)] active:scale-95 sm:flex dark:bg-white dark:text-[#102436] dark:hover:bg-[#FF5D00] dark:hover:text-white"
              >
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full dark:via-black/10" />
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20 transition-transform duration-500 group-hover:rotate-90 dark:bg-black/10">
                  <Icon name="plus" size={13} strokeWidth={3} />
                </span>
                <span className="whitespace-nowrap relative z-10">Gurisha</span>
              </Link>

              {/* MOBILE MENU TOGGLE */}
              <button
                type="button"
                onClick={() => {
                  setMobileOpen((p) => !p)
                  setSearchOpen(false)
                  setAccountOpen(false)
                  setMobileAccountOpen(false)
                  setNotifOpen(false)
                  setOpenNav(null)
                }}
                className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full text-slate-600 dark:text-slate-300 transition-all duration-300 hover:bg-slate-200/50 dark:hover:bg-white/10 active:scale-95 xl:hidden"
              >
                <Icon name={mobileOpen ? "close" : "menu"} size={24} strokeWidth={2.5} />
              </button>
            </div>
          </div>

          {/* SEARCH PANEL */}
          {searchOpen && (
            <div className="absolute left-0 right-0 top-full mt-4 flex justify-center px-4 animate-in slide-in-from-top-4 duration-300 z-[150]">
              <form
                onSubmit={submitSearch}
                className="flex w-full max-w-3xl items-center gap-3 rounded-full border border-slate-200/50 bg-white/90 dark:bg-[#0a1017]/90 px-6 py-2 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] backdrop-blur-[40px] transition-all duration-300 focus-within:border-[#FF5D00] focus-within:shadow-[0_20px_40px_-15px_rgba(255,93,0,0.2)] dark:border-white/10"
              >
                <span className="text-slate-500 dark:text-slate-400">
                  <Icon name="search" size={24} strokeWidth={2.5} />
                </span>
                <input
                  ref={searchInputRef}
                  type="search"
                  value={search}
                  onChange={(event) => updateSearch(event.target.value)}
                  placeholder="Shakisha igicuruzwa hano..."
                  className="min-w-0 flex-1 bg-transparent py-3 text-[17px] font-medium text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 outline-none"
                />
                <button
                  type="submit"
                  className="rounded-full bg-[#FF5D00] px-8 py-3 text-[15px] font-black text-white shadow-md transition-all duration-200 hover:bg-[#FF8533] hover:scale-105 active:scale-95"
                >
                  Shakisha
                </button>
              </form>
            </div>
          )}

          {/* MOBILE MENU */}
          {mobileOpen && (
            <div className="absolute left-2 right-2 sm:left-4 sm:right-4 top-full mt-3 max-h-[calc(100dvh-120px)] overflow-y-auto rounded-[32px] p-4 xl:hidden shadow-2xl border border-slate-200/60 dark:border-white/10 bg-white/95 dark:bg-[#0a1017]/95 backdrop-blur-[50px] animate-in slide-in-from-top-4 duration-300 z-[150]">
              <nav className="grid gap-1">
                <Link
                  to="/"
                  onClick={closeMenus}
                  className={`flex w-full items-center rounded-2xl px-4 py-4 text-[17px] font-extrabold transition-all ${
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
                        className={`flex w-full items-center justify-between rounded-2xl px-4 py-4 text-[17px] font-extrabold transition-all ${
                          parentActive || isExpanded
                            ? "bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white"
                            : "text-slate-600 dark:text-slate-300"
                        }`}
                      >
                        <span>{parent.label}</span>
                        <Icon name="chevron" size={18} strokeWidth={2.5} className={`transition-transform duration-300 opacity-50 ${isExpanded ? "rotate-180" : ""}`} />
                      </button>

                      {isExpanded && (
                        <div className="mt-1 ml-4 space-y-1 border-l-2 border-slate-200 dark:border-white/10 pl-3 animate-in slide-in-from-top-2 duration-200">
                          {parent.children.map((child) => (
                            <Link
                              key={child.to}
                              to={child.to}
                              onClick={closeMenus}
                              className={`flex items-start gap-3 rounded-xl p-3 transition-all ${
                                location.pathname.startsWith(child.to) ? "bg-slate-100/50 dark:bg-white/5" : ""
                              }`}
                            >
                              <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                                child.highlight
                                  ? "bg-gradient-to-br from-[#FF5D00] to-[#FF8533] text-white"
                                  : "bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 shadow-sm border border-slate-100 dark:border-white/5"
                              }`}>
                                <Icon name={child.icon} size={16} strokeWidth={2.2} />
                              </span>
                              <span className="min-w-0 flex-1 pt-0.5">
                                <span className={`flex items-center gap-2 text-[15px] font-bold ${
                                  child.highlight ? "text-[#FF5D00]" : "text-slate-900 dark:text-white"
                                }`}>
                                  {child.label}
                                  {child.badge && (
                                    <span className="rounded-full bg-[#FF5D00] px-1.5 py-0.5 text-[9px] font-black text-white">
                                      {child.badge}
                                    </span>
                                  )}
                                </span>
                                <span className="mt-0.5 block text-[12px] font-medium leading-snug text-slate-500 dark:text-slate-400">
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
                  className="mt-1 flex items-center justify-center gap-2 rounded-full bg-[#102436] px-5 py-4 text-[16px] font-black text-white shadow-lg shadow-slate-900/20 dark:bg-white dark:text-[#102436]"
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