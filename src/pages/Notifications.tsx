import { useEffect, useMemo, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { supabase } from "../services/supabase"

type Notification = {
  id: string
  user_id: string
  type: string
  title: string
  body: string | null
  listing_id: string | null
  sender_id: string | null
  conversation_id: string | null
  is_read: boolean
  created_at: string
}

type Profile = { id: string; full_name: string | null }

/* ──────────────────────────────────────────────────────────────────────────
   ICON SYSTEM
   ────────────────────────────────────────────────────────────────────────── */
type IconProps = { className?: string }
const Icon = {
  ArrowLeft: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
    </svg>
  ),
  ArrowRight: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
    </svg>
  ),
  Bell: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
    </svg>
  ),
  Chat: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
    </svg>
  ),
  Heart: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
    </svg>
  ),
  Tag: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
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
  CheckDouble: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.3} d="M4.5 12.75l4 4L16 9.25M12 16.75l2 2 8.5-9.5" />
    </svg>
  ),
  Close: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  Alert: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
    </svg>
  ),
  Sparkles: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
    </svg>
  ),
  Shield: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  ),
}

function Notifications() {
  const navigate = useNavigate()

  const [notifications, setNotifications] = useState<Notification[]>([])
  const [profiles, setProfiles] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [markingAll, setMarkingAll] = useState(false)
  const [selected, setSelected] = useState<Notification | null>(null)

  useEffect(() => {
    void loadNotifications()

    const channel = supabase
      .channel("notifications-page")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications" },
        async (payload) => {
          const newNotification = payload.new as Notification
          const { data: { user } } = await supabase.auth.getUser()
          if (!user || newNotification.user_id !== user.id) return

          setNotifications((current) => {
            if (current.some((item) => item.id === newNotification.id)) return current
            return [newNotification, ...current].slice(0, 50)
          })

          if (newNotification.sender_id) void loadSenderProfile(newNotification.sender_id)
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "notifications" },
        (payload) => {
          const updated = payload.new as Notification
          setNotifications((current) => current.map((n) => (n.id === updated.id ? { ...n, ...updated } : n)))
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  useEffect(() => {
    const handler = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") setSelected(null)
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [])

  async function loadNotifications() {
    try {
      setLoading(true); setError("")
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { navigate("/login"); return }

      const { data, error: notificationsError } = await supabase
        .from("notifications")
        .select(`id, user_id, type, title, body, listing_id, sender_id, conversation_id, is_read, created_at`)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50)

      if (notificationsError) throw notificationsError

      const notificationData = (data || []) as Notification[]
      setNotifications(notificationData)

      const senderIds = Array.from(
        new Set(notificationData.map((item) => item.sender_id).filter((id): id is string => Boolean(id)))
      )

      if (senderIds.length > 0) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", senderIds)

        if (profileData) {
          const profileMap: Record<string, string> = {}
          ;(profileData as Profile[]).forEach((profile) => {
            profileMap[profile.id] = profile.full_name?.trim() || "Umukoresha"
          })
          setProfiles(profileMap)
        }
      }
    } catch (err) {
      console.error("Notifications error:", err)
      setError("Habaye ikibazo mu kuzana notifications.")
    } finally {
      setLoading(false)
    }
  }

  async function loadSenderProfile(senderId: string) {
    if (profiles[senderId]) return
    const { data, error } = await supabase.from("profiles").select("id, full_name").eq("id", senderId).maybeSingle()
    if (error || !data) return
    setProfiles((current) => ({
      ...current,
      [senderId]: data.full_name?.trim() || "Umukoresha",
    }))
  }

  const unreadCount = useMemo(() => notifications.filter((item) => !item.is_read).length, [notifications])

  async function openNotification(notification: Notification) {
    // 1) Mark as read instantly
    if (!notification.is_read) {
      setNotifications((current) => current.map((n) => (n.id === notification.id ? { ...n, is_read: true } : n)))
      await supabase.from("notifications").update({ is_read: true }).eq("id", notification.id)
    }

    // 2) Route logic
    if (notification.type === "new_message") {
      if (notification.conversation_id) navigate(`/messages/${notification.conversation_id}`)
      else navigate("/messages")
      return
    }

    if (notification.listing_id) {
      navigate(`/listing/${notification.listing_id}`)
      return
    }

    // 3) System/Admin broadcasts open the modal
    setSelected(notification)
  }

  async function markAllAsRead() {
    const unreadIds = notifications.filter((item) => !item.is_read).map((item) => item.id)
    if (unreadIds.length === 0) return
    setMarkingAll(true)
    const { error } = await supabase.from("notifications").update({ is_read: true }).in("id", unreadIds)
    setMarkingAll(false)
    if (error) { console.error(error); return }
    setNotifications((current) => current.map((item) => ({ ...item, is_read: true })))
  }

  function formatDate(date: string) {
    const value = new Date(date)
    const now = new Date()
    if (value.toDateString() === now.toDateString()) {
      return value.toLocaleTimeString("rw-RW", { hour: "2-digit", minute: "2-digit" })
    }
    const diff = now.getTime() - value.getTime()
    const oneDay = 24 * 60 * 60 * 1000
    if (diff < 7 * oneDay) return value.toLocaleDateString("rw-RW", { weekday: "short" })
    return value.toLocaleDateString("rw-RW", { day: "2-digit", month: "short" })
  }

  function getIconComponent(type: string): React.ComponentType<IconProps> {
    if (type === "new_message") return Icon.Chat
    if (type.includes("favorite")) return Icon.Heart
    if (type.includes("listing")) return Icon.Tag
    if (type === "alert" || type === "warning") return Icon.Alert
    if (type === "success") return Icon.Check
    if (type === "system") return Icon.Shield
    if (type === "info") return Icon.Sparkles
    return Icon.Bell
  }

  function getTone(type: string) {
    if (type === "new_message") return { bg: "bg-blue-50 text-blue-600 border-blue-100", iconBg: "bg-blue-100 text-blue-600" }
    if (type.includes("favorite")) return { bg: "bg-rose-50 text-rose-600 border-rose-100", iconBg: "bg-rose-100 text-rose-600" }
    if (type.includes("listing")) return { bg: "bg-amber-50 text-amber-600 border-amber-100", iconBg: "bg-amber-100 text-amber-600" }
    if (type === "alert" || type === "warning") return { bg: "bg-red-50 text-red-600 border-red-100", iconBg: "bg-red-100 text-red-600" }
    if (type === "success") return { bg: "bg-emerald-50 text-emerald-600 border-emerald-100", iconBg: "bg-emerald-100 text-emerald-600" }
    return { bg: "bg-slate-50 text-slate-600 border-slate-200", iconBg: "bg-slate-100 text-slate-600" }
  }

  return (
    /* Deep Gray Background */
    <main className="relative min-h-screen bg-[#f4f7f9] dark:bg-[#0a1017] transition-colors duration-300">
      
      {/* HEADER (Like BK Top Bar) */}
      <header className="sticky top-0 z-40 bg-white dark:bg-[#132433] border-b border-slate-200 dark:border-white/10 shadow-sm">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2 group">
              <img src="/favicon.svg" alt="KUGURISHA" className="h-8 w-8 object-contain" />
              <span className="hidden sm:block text-lg font-black tracking-tight text-slate-900 dark:text-white">
                KUGURISHA<span className="text-[#FF5D00]">.COM</span>
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                disabled={markingAll}
                className="hidden sm:flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-white"
              >
                {markingAll ? (
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-slate-400 border-t-slate-600" />
                ) : (
                  <Icon.CheckDouble className="w-3.5 h-3.5" />
                )}
                Soma zose
              </button>
            )}
            <Link
              to="/"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-slate-200 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
              title="Subira ahabanza"
            >
              <Icon.ArrowLeft className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        
        {/* Title & Subtitle */}
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">Imenyesha</h1>
            <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">
              Reba ibikorwa byose byabereye kuri konti yawe.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-5 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-600 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-400">
            <Icon.Alert className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {/* LIST / LOADING / EMPTY STATES */}
        <section className="overflow-hidden rounded-2xl bg-white shadow-sm border border-slate-200 dark:border-white/10 dark:bg-[#132433]">
          
          {loading ? (
            <div className="divide-y divide-slate-100 dark:divide-white/5">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4 p-4 sm:p-5">
                  <div className="h-12 w-12 animate-pulse rounded-full bg-slate-100 dark:bg-white/5" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-1/3 animate-pulse rounded bg-slate-100 dark:bg-white/5" />
                    <div className="h-3 w-2/3 animate-pulse rounded bg-slate-50 dark:bg-white/5" />
                  </div>
                </div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-50 dark:bg-white/5">
                <Icon.Bell className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">Nta menyesha ufite</h3>
              <p className="mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">
                Iyo umuntu akwoherereje ubutumwa cyangwa hari ikindi gikorwa, bizagaragara hano.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-white/5">
              {notifications.map((notification) => {
                const isUnread = !notification.is_read
                const NotificationIcon = getIconComponent(notification.type)
                const tone = getTone(notification.type)
                const displayTitle = notification.type === "new_message" && notification.sender_id
                  ? (profiles[notification.sender_id] || "Umukoresha")
                  : notification.title

                return (
                  <button
                    key={notification.id}
                    type="button"
                    onClick={() => openNotification(notification)}
                    className={`group relative flex w-full items-start gap-4 p-4 text-left transition-all hover:bg-slate-50 dark:hover:bg-white/[0.02] sm:gap-5 sm:p-5 ${
                      isUnread ? "bg-orange-50/30 dark:bg-[#FF5D00]/5" : "bg-transparent"
                    }`}
                  >
                    {/* Unread indicator dot */}
                    {isUnread && (
                      <span className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-[#FF5D00]" />
                    )}

                    {/* Icon */}
                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full border shadow-sm transition-transform group-hover:scale-105 ${tone.iconBg} ${tone.bg}`}>
                      <NotificationIcon className="h-5 w-5" />
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1 pt-0.5">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-4">
                        <h3 className={`truncate text-sm sm:text-base ${isUnread ? "font-black text-slate-900 dark:text-white" : "font-semibold text-slate-700 dark:text-slate-200"}`}>
                          {displayTitle}
                        </h3>
                        <span className={`shrink-0 text-[11px] font-bold ${isUnread ? "text-[#FF5D00]" : "text-slate-400"}`}>
                          {formatDate(notification.created_at)}
                        </span>
                      </div>
                      {notification.body && (
                        <p className={`mt-1 line-clamp-2 text-xs sm:text-sm ${isUnread ? "font-medium text-slate-600 dark:text-slate-300" : "font-normal text-slate-500 dark:text-slate-400"}`}>
                          {notification.type === "new_message" ? "Yakohereje ubutumwa bushya." : notification.body}
                        </p>
                      )}
                    </div>

                    {/* Arrow */}
                    <div className="hidden sm:flex h-8 w-8 shrink-0 items-center justify-center self-center rounded-full text-slate-300 transition-all group-hover:bg-white group-hover:text-[#FF5D00] group-hover:shadow-sm dark:text-slate-600 dark:group-hover:bg-white/10">
                      <Icon.ArrowRight className="h-4 w-4" />
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </section>

        {/* FOOTER (Like the "View All" in your image) */}
        {!loading && notifications.length > 0 && (
          <div className="mt-8 flex justify-center">
            <Link
              to="/"
              className="flex w-full max-w-sm items-center justify-center rounded-xl bg-[#102436] py-3.5 text-sm font-bold text-white shadow-md transition-all hover:bg-[#1a344d] hover:-translate-y-0.5 dark:bg-[#FF5D00] dark:hover:bg-[#FF7424]"
            >
              Subira ku Isoko
            </Link>
          </div>
        )}

      </div>

      {/* MODAL FOR SYSTEM NOTIFICATIONS */}
      {selected && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setSelected(null)}
        >
          <div
            className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-[#132433] animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-4">
                  <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${getTone(selected.type).iconBg}`}>
                    {(() => {
                      const MIcon = getIconComponent(selected.type)
                      return <MIcon className="w-6 h-6" />
                    })()}
                  </span>
                  <div className="min-w-0 pt-1">
                    <h3 className="text-lg font-black leading-snug text-slate-900 dark:text-white">
                      {selected.title}
                    </h3>
                    <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mt-1">
                      <Icon.Clock className="w-3.5 h-3.5" />
                      {formatDate(selected.created_at)}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 dark:hover:bg-white/[0.06]"
                >
                  <Icon.Close className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-6 max-h-[50vh] overflow-y-auto whitespace-pre-wrap rounded-2xl bg-slate-50 p-5 text-sm leading-relaxed text-slate-700 dark:bg-white/[0.03] dark:text-slate-200">
                {selected.body || "Nta bisobanuro byongewe kuri iyi menyesha."}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="rounded-full bg-slate-900 px-6 py-2.5 text-sm font-bold text-white shadow-md transition hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
                >
                  Funga
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </main>
  )
}

export default Notifications