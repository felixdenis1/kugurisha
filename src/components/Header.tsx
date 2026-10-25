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
}: {
  name: IconName
  size?: number
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

  const search = searchValue ?? internalSearch

  function closeMenus() {
    setMobileOpen(false)
    setAccountOpen(false)
    setSearchOpen(false)
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
    "kg-h-action relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"

  return (
    <div
      ref={headerRef}
      className={`kg-h-root sticky top-0 z-[100] w-full ${
        scrolled ? "kg-h-scrolled" : ""
      }`}
    >
      <header
        className={`transition-[padding] duration-300 ${
          scrolled ? "py-2.5" : "py-3.5"
        }`}
      >
        <div className="mx-auto max-w-[1520px] px-3 sm:px-6 lg:px-8">
          <div className="kg-h-panel relative flex min-h-[76px] items-center justify-between gap-3 rounded-full px-4 sm:px-7 shadow-lg backdrop-blur-md">
            {/* BRAND */}
            <Link
              to="/"
              onClick={closeMenus}
              className="kg-h-brand flex shrink-0 items-center gap-3"
              aria-label="KUGURISHA - Ahabanza"
            >
              <span className="kg-h-logo flex h-12 w-12 shrink-0 items-center justify-center">
                <img
                  src="/favicon.svg"
                  alt=""
                  className="h-full w-full object-contain"
                />
              </span>

              <span className="flex min-w-0 flex-col">
                <span className="kg-h-wordmark text-2xl sm:text-[32px] font-extrabold tracking-tight leading-none" style={{ fontFamily: 'Instagram Sans, sans-serif', letterSpacing: '-0.02em', textTransform: 'none' }}>
                  kugurisha
                  <span className="kg-h-brand-dot text-[var(--primary)]">.</span>
                </span>
               
              </span>
            </Link>

            {/* DESKTOP NAVIGATION */}
            <nav
              className="kg-h-nav hidden items-center gap-1 xl:flex mx-auto"
              aria-label="Menu nyamukuru"
            >
              {navigation.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/"}
                  className={({ isActive }) =>
                    `kg-h-navlink px-3.5 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${isActive ? "is-active font-semibold" : ""}`
                  }
                >
                  {item.label}
                </NavLink>
              ))}

              <NavLink
                to="/ai-search"
                className={({ isActive }) =>
                  `kg-h-navlink kg-h-ai px-3.5 py-2 rounded-full text-sm font-medium flex items-center gap-2 transition-colors whitespace-nowrap ${
                    isActive ? "is-active font-semibold" : ""
                  }`
                }
              >
                <Icon name="spark" size={15} />
                Baza AI
              </NavLink>
            </nav>

            {/* ACTIONS */}
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                className={actionClass}
                onClick={() => {
                  setSearchOpen((previous) => !previous)
                  setAccountOpen(false)
                  setMobileOpen(false)
                }}
                aria-label={searchOpen ? "Funga ishakisha" : "Shakisha"}
                aria-expanded={searchOpen}
                title="Shakisha"
              >
                <Icon name={searchOpen ? "close" : "search"} size={19} />
              </button>

              <button
                type="button"
                className={`${actionClass} hidden sm:flex`}
                onClick={toggleTheme}
                aria-label={
                  theme === "dark"
                    ? "Koresha light mode"
                    : "Koresha dark mode"
                }
                title={theme === "dark" ? "Light mode" : "Dark mode"}
              >
                <Icon
                  name={theme === "dark" ? "sun" : "moon"}
                  size={19}
                />
              </button>

              {userId && (
                <Link
                  to="/notifications"
                  onClick={closeMenus}
                  className={actionClass}
                  aria-label={`Imenyesha: ${unreadCount} utarasoma`}
                >
                  <Icon name="bell" size={19} />
                  {unreadCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </Link>
              )}

              {userId ? (
                <div ref={accountRef} className="relative hidden sm:block">
                  <button
                    type="button"
                    className={`${actionClass} gap-1.5 px-3 sm:w-auto rounded-full`}
                    onClick={() => {
                      setAccountOpen((previous) => !previous)
                      setSearchOpen(false)
                      setMobileOpen(false)
                    }}
                    aria-expanded={accountOpen}
                    aria-label="Fungura konti"
                  >
                    <Icon name="user" size={18} />
                    <span className="hidden text-xs font-bold lg:inline">
                      Konti
                    </span>
                    <Icon name="chevron" size={13} />
                  </button>

                  {accountOpen && (
                    <div className="kg-h-dropdown absolute right-0 top-[calc(100%+15px)] z-[110] w-64 rounded-3xl p-2.5 shadow-2xl">
                      <p className="px-3 py-2.5 text-xs font-extrabold">
                        Konti yanjye
                      </p>

                      {accountLinks.map((item) => (
                        <Link
                          key={item.to}
                          to={item.to}
                          onClick={closeMenus}
                          className="kg-h-menuitem flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold transition-colors"
                        >
                          <Icon name={item.icon} size={17} />
                          {item.label}
                          {item.to === "/notifications" &&
                            unreadCount > 0 && (
                              <span className="ml-auto text-xs font-bold text-[var(--primary)]">
                                {unreadCount}
                              </span>
                            )}
                        </Link>
                      ))}

                      <div className="kg-h-divider my-2" />

                      <button
                        type="button"
                        onClick={() => void logout()}
                        disabled={loggingOut}
                        className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-bold text-red-500 transition-colors hover:bg-red-500/10 disabled:opacity-50"
                      >
                        <Icon name="logout" size={17} />
                        {loggingOut ? "Turimo gusohoka..." : "Sohoka"}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to="/login"
                  onClick={closeMenus}
                  className="kg-h-login hidden rounded-full px-4.5 py-2.5 text-xs font-bold sm:inline-flex items-center transition-all whitespace-nowrap"
                >
                  Injira
                </Link>
              )}

              <Link
                to="/create-listing"
                onClick={closeMenus}
                className="kg-h-sell hidden h-10 items-center gap-2 rounded-full px-5 text-xs font-extrabold sm:flex shadow-sm transition-all whitespace-nowrap shrink-0"
              >
                <Icon name="plus" size={17} />
                Gurisha
              </Link>

              <button
                type="button"
                onClick={() => {
                  setMobileOpen((previous) => !previous)
                  setSearchOpen(false)
                  setAccountOpen(false)
                }}
                className={`${actionClass} xl:hidden`}
                aria-label={mobileOpen ? "Funga menu" : "Fungura menu"}
                aria-expanded={mobileOpen}
              >
                <Icon
                  name={mobileOpen ? "close" : "menu"}
                  size={21}
                />
              </button>
            </div>
          </div>

          {/* SEARCH PANEL */}
          {searchOpen && (
            <form
              onSubmit={submitSearch}
              role="search"
              className="kg-h-dropdown mx-auto mt-3 flex max-w-xl items-center gap-3 rounded-full p-2.5 shadow-2xl"
            >
              <span className="pl-3 text-[var(--primary)]">
                <Icon name="search" size={19} />
              </span>

              <input
                ref={searchInputRef}
                type="search"
                value={search}
                onChange={(event) => updateSearch(event.target.value)}
                placeholder="Urashaka iki? iPhone, inzu, laptop..."
                className="kg-h-input min-w-0 flex-1 bg-transparent px-2 py-2 text-sm outline-none"
              />

              <button
                type="submit"
                className="kg-h-sell rounded-full px-4.5 py-2 text-xs font-bold shadow-sm"
              >
                Shakisha
              </button>
            </form>
          )}

          {/* MOBILE / TABLET MENU */}
          {mobileOpen && (
            <div className="kg-h-dropdown mt-3 rounded-[32px] p-4 xl:hidden shadow-2xl">
              <nav
                className="grid gap-1.5"
                aria-label="Menu ya telefoni"
              >
                {navigation.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === "/"}
                    onClick={closeMenus}
                    className={({ isActive }) =>
                      `kg-h-mobilelink rounded-2xl px-4 py-3 flex items-center justify-between text-sm transition-colors ${
                        isActive ? "is-active font-semibold" : ""
                      }`
                    }
                  >
                    <span>{item.label}</span>
                    <Icon name="arrow" size={16} />
                  </NavLink>
                ))}

                <NavLink
                  to="/ai-search"
                  onClick={closeMenus}
                  className={({ isActive }) =>
                    `kg-h-mobilelink rounded-2xl px-4 py-3 flex items-center justify-between text-sm transition-colors ${
                      isActive ? "is-active font-semibold" : ""
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
                    <div className="kg-h-divider my-2" />
                    {accountLinks.map((item) => (
                      <Link
                        key={item.to}
                        to={item.to}
                        onClick={closeMenus}
                        className="kg-h-mobilelink rounded-2xl px-4 py-3 flex items-center justify-between text-sm transition-colors"
                      >
                        <span className="flex items-center gap-3">
                          <Icon name={item.icon} size={17} />
                          {item.label}
                        </span>
                        <Icon name="arrow" size={16} />
                      </Link>
                    ))}
                  </>
                )}

                <div className="kg-h-divider my-2" />

                <button
                  type="button"
                  onClick={toggleTheme}
                  className="kg-h-mobilelink text-left sm:hidden rounded-2xl px-4 py-3 flex items-center text-sm transition-colors"
                >
                  <span className="flex items-center gap-3">
                    <Icon
                      name={theme === "dark" ? "sun" : "moon"}
                      size={18}
                    />
                    {theme === "dark" ? "Light mode" : "Dark mode"}
                  </span>
                </button>

                <Link
                  to="/create-listing"
                  onClick={closeMenus}
                  className="kg-h-sell mt-2 flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-extrabold shadow-sm"
                >
                  <Icon name="plus" size={18} />
                  Gurisha ikintu
                </Link>

                {!userId ? (
                  <Link
                    to="/login"
                    onClick={closeMenus}
                    className="kg-h-mobilelink justify-center sm:hidden rounded-2xl py-3 text-center text-sm font-bold"
                  >
                    Injira mu konti
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => void logout()}
                    disabled={loggingOut}
                    className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold text-red-500 disabled:opacity-50 transition-colors hover:bg-red-500/10"
                  >
                    <Icon name="logout" size={18} />
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