import { useEffect, useMemo, useRef, useState } from "react"
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

type NotificationGroup = {
  id: string
  notifications: Notification[]
  senderName: string
  latest: Notification
  unreadCount: number
  totalCount: number
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
  ArrowUpRight: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
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
  Plus: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  ),
  Home: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75" />
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
  Filter: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
    </svg>
  ),
  Alert: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
    </svg>
  ),
  Shield: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  ),
  Bolt: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
    </svg>
  ),
  Sparkles: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
    </svg>
  ),
  Inbox: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M2.25 13.5h3.86a2.25 2.25 0 012.012 1.244l.256.512a2.25 2.25 0 002.013 1.244h3.218a2.25 2.25 0 002.013-1.244l.256-.512a2.25 2.25 0 012.013-1.244h3.859m-19.5.338V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 00-2.15-1.588H6.911a2.25 2.25 0 00-2.15 1.588L2.35 13.177a2.25 2.25 0 00-.1.661z" />
    </svg>
  ),
  List: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
  ),
  Grid: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
    </svg>
  ),
  Volume: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
    </svg>
  ),
  Keyboard: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M6 12h.008v.008H6V12zm2.25 0h.008v.008h-.008V12zm2.25 0h.008v.008H10.5V12zm2.25 0h.008v.008H12.75V12zm2.25 0h.008v.008H15V12zm2.25 0h.008v.008H17.25V12zM4.5 21h15a2.25 2.25 0 002.25-2.25V5.25A2.25 2.25 0 0019.5 3h-15A2.25 2.25 0 002.25 5.25v13.5A2.25 2.25 0 004.5 21zM6 15.75h12" />
    </svg>
  ),
  Settings: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
}

/* ──────────────────────────────────────────────────────────────────────────
   ANIMATED COUNTERS
   ────────────────────────────────────────────────────────────────────────── */
function useCountUp(target: number, duration = 800) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    let raf = 0
    const start = performance.now()
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - t, 3)
      setValue(Math.round(target * eased))
      if (t < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [target, duration])
  return value
}

/* ──────────────────────────────────────────────────────────────────────────
   ACTIVITY SPARKLINE
   ────────────────────────────────────────────────────────────────────────── */
function ActivityWave({ notifications }: { notifications: Notification[] }) {
  const bins = useMemo(() => {
    const counts = new Array(12).fill(0)
    const now = Date.now()
    notifications.forEach((n) => {
      const hoursAgo = Math.floor((now - new Date(n.created_at).getTime()) / (1000 * 60 * 60))
      if (hoursAgo >= 0 && hoursAgo < 12) counts[11 - hoursAgo] += 1
    })
    return counts
  }, [notifications])

  const max = Math.max(1, ...bins)

  return (
    <div className="flex h-16 items-end gap-1">
      {bins.map((v, i) => (
        <div
          key={i}
          className="relative flex-1 overflow-hidden rounded-full"
          style={{ height: "100%" }}
        >
          <div
            className="absolute inset-x-0 bottom-0 rounded-full bg-gradient-to-t from-[#FF5D00] to-[#FF7424] transition-all duration-700 ease-out"
            style={{ height: `${Math.max(6, (v / max) * 100)}%` }}
          />
        </div>
      ))}
    </div>
  )
}

/* ──────────────────────────────────────────────────────────────────────────
   DONUT
   ────────────────────────────────────────────────────────────────────────── */
function Donut({
  segments,
  size = 132,
  stroke = 14,
}: {
  segments: { value: number; color: string }[]
  size?: number
  stroke?: number
}) {
  const total = segments.reduce((s, x) => s + x.value, 0) || 1
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  let offset = 0
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeWidth={stroke} className="text-slate-200 dark:text-white/10" />
      {segments.map((s, i) => {
        const len = (s.value / total) * c
        const el = (
          <circle
            key={i}
            cx={size / 2} cy={size / 2} r={r}
            fill="none" stroke={s.color} strokeWidth={stroke}
            strokeDasharray={`${len} ${c - len}`} strokeDashoffset={-offset} strokeLinecap="round"
            style={{ transition: "stroke-dasharray 800ms cubic-bezier(0.16,1,0.3,1), stroke-dashoffset 800ms cubic-bezier(0.16,1,0.3,1)" }}
          />
        )
        offset += len
        return el
      })}
    </svg>
  )
}

type FilterKey = "all" | "unread" | "messages" | "favorites" | "listings"
type ViewMode = "list" | "grid"

function Notifications() {
  const navigate = useNavigate()

  const [notifications, setNotifications] = useState<Notification[]>([])
  const [profiles, setProfiles] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [filter, setFilter] = useState<FilterKey>("all")
  const [view, setView] = useState<ViewMode>("list")
  const [markingAll, setMarkingAll] = useState(false)
  const [showShortcuts, setShowShortcuts] = useState(false)
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null)
  const searchRef = useRef<HTMLInputElement | null>(null)
  const [search, setSearch] = useState("")

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
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        searchRef.current?.focus()
      }
      if (e.key === "/" && document.activeElement?.tagName !== "INPUT" && document.activeElement?.tagName !== "TEXTAREA") {
        e.preventDefault()
        searchRef.current?.focus()
      }
      if (e.key === "Escape") setShowShortcuts(false)
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

  const groupedNotifications = useMemo<NotificationGroup[]>(() => {
    const groups: NotificationGroup[] = []

    notifications.forEach((notification) => {
      const lastGroup = groups[groups.length - 1]
      const sameGroup =
        lastGroup &&
        notification.type === lastGroup.latest.type &&
        notification.sender_id === lastGroup.latest.sender_id &&
        notification.conversation_id === lastGroup.latest.conversation_id

      if (sameGroup) {
        lastGroup.notifications.push(notification)
        lastGroup.totalCount += 1
        if (!notification.is_read) lastGroup.unreadCount += 1
        lastGroup.latest = notification
      } else {
        const senderName = notification.sender_id
          ? profiles[notification.sender_id] || getSenderNameFromBody(notification.body)
          : getSenderNameFromBody(notification.body)

        groups.push({
          id: notification.id,
          notifications: [notification],
          senderName,
          latest: notification,
          unreadCount: notification.is_read ? 0 : 1,
          totalCount: 1,
        })
      }
    })

    return groups.map((group) => ({
      ...group,
      senderName: group.latest.sender_id
        ? profiles[group.latest.sender_id] || group.senderName || "Umukoresha"
        : group.senderName || "Umukoresha",
    }))
  }, [notifications, profiles])

  const filteredGroups = useMemo(() => {
    let arr = groupedNotifications
    if (filter === "unread") arr = arr.filter((g) => g.unreadCount > 0)
    else if (filter === "messages") arr = arr.filter((g) => g.latest.type === "new_message")
    else if (filter === "favorites") arr = arr.filter((g) => g.latest.type.includes("favorite"))
    else if (filter === "listings") arr = arr.filter((g) => g.latest.type.includes("listing") && !g.latest.type.includes("favorite"))

    if (!search.trim()) return arr
    const q = search.trim().toLowerCase()
    return arr.filter((g) => {
      const name = (g.latest.type === "new_message" ? g.senderName : g.latest.title).toLowerCase()
      const body = (g.latest.body || "").toLowerCase()
      return name.includes(q) || body.includes(q)
    })
  }, [groupedNotifications, filter, search])

  const unreadCount = useMemo(() => notifications.filter((item) => !item.is_read).length, [notifications])
  const messageCount = useMemo(() => notifications.filter((n) => n.type === "new_message").length, [notifications])
  const favoriteCount = useMemo(() => notifications.filter((n) => n.type.includes("favorite")).length, [notifications])
  const listingCount = useMemo(() => notifications.filter((n) => n.type.includes("listing") && !n.type.includes("favorite")).length, [notifications])

  const cGroups = useCountUp(groupedNotifications.length)
  const cUnread = useCountUp(unreadCount)
  const cMessages = useCountUp(messageCount)
  const cFavorites = useCountUp(favoriteCount)

  function getSenderNameFromBody(body: string | null) {
    if (!body) return "Umukoresha"
    const suffix = " yakwoherereje ubutumwa."
    if (body.endsWith(suffix)) return body.slice(0, -suffix.length)
    return body
  }

  async function openNotificationGroup(group: NotificationGroup) {
    setSelectedGroupId(group.id)
    const unreadIds = group.notifications.filter((item) => !item.is_read).map((item) => item.id)
    if (unreadIds.length > 0) {
      const { error } = await supabase.from("notifications").update({ is_read: true }).in("id", unreadIds)
      if (!error) setNotifications((current) => current.map((item) => (unreadIds.includes(item.id) ? { ...item, is_read: true } : item)))
    }

    const notification = group.latest
    if (notification.type === "new_message") {
      if (notification.conversation_id) navigate(`/messages/${notification.conversation_id}`)
      else navigate("/messages")
      return
    }
    if (notification.listing_id) navigate(`/listing/${notification.listing_id}`)
  }

  async function markGroupAsRead(group: NotificationGroup, e: React.MouseEvent) {
    e.stopPropagation()
    const unreadIds = group.notifications.filter((item) => !item.is_read).map((item) => item.id)
    if (unreadIds.length === 0) return
    const { error } = await supabase.from("notifications").update({ is_read: true }).in("id", unreadIds)
    if (!error) setNotifications((current) => current.map((item) => (unreadIds.includes(item.id) ? { ...item, is_read: true } : item)))
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
    return Icon.Bell
  }

  function getNotificationLabel(type: string) {
    if (type === "new_message") return "Ubutumwa"
    if (type.includes("favorite")) return "Ibyakunzwe"
    if (type.includes("listing")) return "Listing"
    return "Notification"
  }

  function getTone(type: string) {
    if (type === "new_message") return { bg: "bg-blue-500/15", text: "text-blue-600 dark:text-blue-400", solid: "bg-gradient-to-br from-blue-500 to-indigo-600", hex: "#3b82f6", label: "Message" }
    if (type.includes("favorite")) return { bg: "bg-rose-500/15", text: "text-rose-600 dark:text-rose-400", solid: "bg-gradient-to-br from-rose-500 to-pink-600", hex: "#f43f5e", label: "Favorite" }
    if (type.includes("listing")) return { bg: "bg-amber-500/15", text: "text-amber-600 dark:text-amber-400", solid: "bg-gradient-to-br from-amber-500 to-orange-600", hex: "#f59e0b", label: "Listing" }
    return { bg: "bg-slate-500/15", text: "text-slate-600 dark:text-slate-300", solid: "bg-gradient-to-br from-slate-700 to-slate-900", hex: "#64748b", label: "System" }
  }

  const filterTabs: { key: FilterKey; label: string; count: number; icon: React.ComponentType<IconProps> }[] = [
    { key: "all", label: "Zose", count: groupedNotifications.length, icon: Icon.Inbox },
    { key: "unread", label: "Zitarasomwa", count: unreadCount, icon: Icon.Sparkles },
    { key: "messages", label: "Ubutumwa", count: messageCount, icon: Icon.Chat },
    { key: "favorites", label: "Ibyakunzwe", count: favoriteCount, icon: Icon.Heart },
    { key: "listings", label: "Listings", count: listingCount, icon: Icon.Tag },
  ]

  const donutSegments = [
    { value: messageCount, color: "#3b82f6" },
    { value: favoriteCount, color: "#f43f5e" },
    { value: listingCount, color: "#f59e0b" },
  ]

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f4f8fb] text-[#102436] dark:bg-[#060f19] dark:text-slate-100">
      {/* Ambient glows */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-blue-500/10 blur-[140px] dark:bg-blue-500/[0.06]" />
        <div className="absolute top-1/3 -right-40 h-[600px] w-[600px] rounded-full bg-[#FF5D00]/10 blur-[140px] dark:bg-[#FF5D00]/[0.06]" />
        <div className="absolute bottom-0 left-1/3 h-[500px] w-[500px] rounded-full bg-indigo-500/10 blur-[140px] dark:bg-indigo-500/[0.04]" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200/60 bg-white/70 backdrop-blur-2xl dark:border-white/10 dark:bg-[#060f19]/70">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6 lg:px-8">
          <Link to="/" className="group flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30 transition-transform group-hover:scale-105">
              <Icon.Tag className="w-4 h-4" />
            </span>
            <div>
              <p className="text-sm font-black tracking-tight text-slate-900 dark:text-white">
                KUGURISHA
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">.COM</span>
              </p>
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Notifications</p>
            </div>
          </Link>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setShowShortcuts(true)}
              className="hidden items-center gap-1.5 rounded-full border border-slate-200/80 bg-white px-3 py-2 text-xs font-extrabold text-slate-700 shadow-sm transition hover:border-[#FF5D00] hover:text-[#FF5D00] dark:border-white/10 dark:bg-white/[0.06] dark:text-slate-200 sm:inline-flex"
            >
              <Icon.Keyboard className="w-3.5 h-3.5" />
              Shortcuts
            </button>
            <Link
              to="/messages"
              className="hidden items-center gap-1.5 rounded-full border border-slate-200/80 bg-white px-3.5 py-2 text-xs font-extrabold text-slate-700 shadow-sm transition hover:border-[#FF5D00] hover:text-[#FF5D00] dark:border-white/10 dark:bg-white/[0.06] dark:text-slate-200 sm:inline-flex"
            >
              <Icon.Chat className="w-3.5 h-3.5" />
              Ubutumwa
            </Link>
            <Link
              to="/create-listing"
              className="group inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#FF5D00] via-[#FF7424] to-[#e05200] px-3.5 py-2 text-xs font-black text-white shadow-md shadow-[#FF5D00]/30 transition hover:-translate-y-0.5"
            >
              <Icon.Plus className="w-3.5 h-3.5" />
              Gurisha
            </Link>
          </div>
        </div>
      </header>

      <div className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* HERO SECTION */}
        <section className="mb-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_420px]">
          {/* Left — title + KPIs */}
          <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#0a0f1e] via-[#0d1526] to-[#0a0f1e] p-6 text-white shadow-[0_30px_80px_-25px_rgba(10,15,30,0.6)] sm:p-7">
            <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-blue-500/40 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 -left-10 h-52 w-52 rounded-full bg-[#FF5D00]/25 blur-3xl" />
            <div className="pointer-events-none absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "22px 22px" }} />

            <div className="relative">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-slate-300 backdrop-blur">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative flex h-2 w-2 rounded-full bg-emerald-400" />
                </span>
                <Icon.Bolt className="w-3 h-3" />
                Notification Center
              </div>

              <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
                Amakuru <span className="bg-gradient-to-r from-[#FF5D00] via-[#FF7424] to-[#FFA45C] bg-clip-text text-transparent">yawe</span>
              </h1>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-300">
                Reba ibikorwa byose ku isoko kandi utsinde ibihe.
              </p>

              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { label: "Amatsinda", value: cGroups, icon: Icon.List, color: "#94a3b8" },
                  { label: "Zitarasomwa", value: cUnread, icon: Icon.Sparkles, color: "#FF5D00" },
                  { label: "Ubutumwa", value: cMessages, icon: Icon.Chat, color: "#3b82f6" },
                  { label: "Ibyakunzwe", value: cFavorites, icon: Icon.Heart, color: "#f43f5e" },
                ].map((s) => {
                  const SIcon = s.icon
                  return (
                    <div key={s.label} className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 backdrop-blur">
                      <p className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wider" style={{ color: s.color }}>
                        <SIcon className="w-2.5 h-2.5" />
                        {s.label}
                      </p>
                      <p className="mt-0.5 text-xl font-black text-white">{s.value}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Right — live activity + donut */}
          <div className="rounded-[28px] border border-slate-200/70 bg-white/80 p-5 shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-slate-900/60">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Activity · 12h</p>
                <p className="mt-0.5 text-sm font-black text-slate-900 dark:text-white">Uko bikorwa bigenda</p>
              </div>
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Icon.Volume className="w-4 h-4" />
              </span>
            </div>

            <div className="mt-4">
              <ActivityWave notifications={notifications} />
            </div>

            <div className="mt-4 flex items-center gap-4 border-t border-slate-100 pt-4 dark:border-white/10">
              <div className="relative shrink-0">
                <Donut segments={donutSegments} size={88} stroke={10} />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <p className="text-base font-black text-slate-900 dark:text-white">{notifications.length}</p>
                  <p className="text-[8px] font-black uppercase tracking-wider text-slate-400">Zose</p>
                </div>
              </div>
              <div className="min-w-0 flex-1 space-y-1.5">
                {[
                  { label: "Ubutumwa", value: messageCount, color: "#3b82f6" },
                  { label: "Ibyakunzwe", value: favoriteCount, color: "#f43f5e" },
                  { label: "Listings", value: listingCount, color: "#f59e0b" },
                ].map((s) => (
                  <div key={s.label} className="flex items-center gap-1.5 text-[11px]">
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: s.color }} />
                    <span className="flex-1 truncate font-semibold text-slate-600 dark:text-slate-400">{s.label}</span>
                    <span className="font-black text-slate-900 dark:text-white">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ERROR */}
        {error && (
          <div className="mb-5 flex items-center gap-2 rounded-2xl border border-rose-500/25 bg-rose-500/10 px-4 py-3 text-sm font-bold text-rose-600 dark:text-rose-400">
            <Icon.Alert className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {/* TOOLBAR */}
        {!loading && groupedNotifications.length > 0 && (
          <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-slate-200/70 bg-white/70 p-3.5 backdrop-blur-sm dark:border-white/10 dark:bg-slate-900/60">
            {/* Search row */}
            <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative flex-1">
                <Icon.Filter className="pointer-events-none absolute left-3.5 top-1/2 w-3.5 h-3.5 -translate-y-1/2 text-slate-400" />
                <input
                  ref={searchRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Shakisha notification... (⌘K)"
                  className="w-full rounded-full border border-slate-200/80 bg-slate-50/70 pl-9 pr-9 py-2 text-xs font-bold text-slate-900 outline-none transition-all placeholder:font-semibold placeholder:text-slate-400 focus:border-[#FF5D00] focus:bg-white focus:ring-4 focus:ring-[#FF5D00]/10 dark:border-white/10 dark:bg-white/[0.03] dark:text-white dark:placeholder:text-slate-500"
                />
                {search ? (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="absolute right-2.5 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full bg-slate-200/70 text-slate-500 transition hover:bg-slate-300 dark:bg-white/10 dark:text-slate-300"
                  >
                    <Icon.Close className="w-2.5 h-2.5" />
                  </button>
                ) : (
                  <kbd className="absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-[9px] font-black text-slate-500 dark:border-white/10 dark:bg-white/[0.06] dark:text-slate-400 sm:inline-flex">
                    ⌘K
                  </kbd>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                {/* View toggle */}
                <div className="flex rounded-full border border-slate-200 bg-white p-0.5 dark:border-white/10 dark:bg-white/[0.06]">
                  {[
                    { key: "list" as ViewMode, icon: Icon.List },
                    { key: "grid" as ViewMode, icon: Icon.Grid },
                  ].map(({ key, icon: VIcon }) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setView(key)}
                      className={`flex h-7 w-7 items-center justify-center rounded-full transition ${
                        view === key ? "bg-[#102436] text-white shadow-sm dark:bg-[#FF5D00]" : "text-slate-500 hover:text-slate-900 dark:text-slate-400"
                      }`}
                    >
                      <VIcon className="w-3.5 h-3.5" />
                    </button>
                  ))}
                </div>

                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={markAllAsRead}
                    disabled={markingAll}
                    className="group inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#FF5D00] via-[#FF7424] to-[#e05200] px-3.5 py-1.5 text-[11px] font-black text-white shadow-md shadow-[#FF5D00]/30 transition hover:-translate-y-0.5 disabled:opacity-60"
                  >
                    {markingAll ? (
                      <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    ) : (
                      <Icon.CheckDouble className="w-3 h-3" />
                    )}
                    Soma zose
                  </button>
                )}
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-1.5">
              {filterTabs.map((tab) => {
                const isActive = filter === tab.key
                const TabIcon = tab.icon
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setFilter(tab.key)}
                    className={`group inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-black transition-all ${
                      isActive
                        ? "bg-gradient-to-r from-[#102436] to-[#1a3350] text-white shadow-md dark:from-[#FF5D00] dark:to-[#e05200]"
                        : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/[0.06]"
                    }`}
                  >
                    <TabIcon className="w-3 h-3" />
                    <span>{tab.label}</span>
                    <span className={`rounded-full px-1.5 py-0.5 text-[9px] ${isActive ? "bg-white/20" : "bg-slate-200/70 dark:bg-white/10"}`}>
                      {tab.count}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* LOADING */}
        {loading ? (
          <section className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="rounded-2xl border border-slate-200/70 bg-white/70 p-4 dark:border-white/10 dark:bg-slate-900/60">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 animate-pulse rounded-2xl bg-slate-200 dark:bg-white/10" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-40 animate-pulse rounded-full bg-slate-200 dark:bg-white/10" />
                    <div className="h-3 w-3/4 animate-pulse rounded bg-slate-100 dark:bg-white/5" />
                  </div>
                  <div className="h-3 w-14 animate-pulse rounded bg-slate-100 dark:bg-white/5" />
                </div>
              </div>
            ))}
          </section>
        ) : groupedNotifications.length === 0 ? (
          <section className="relative overflow-hidden rounded-[28px] border border-slate-200/70 bg-white/80 shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-slate-900/60">
            <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl" />
            <div className="relative px-6 py-20 text-center sm:px-10">
              <div className="relative mx-auto">
                <div className="flex h-20 w-20 mx-auto items-center justify-center rounded-3xl bg-gradient-to-br from-blue-500/15 to-indigo-500/10 text-blue-500">
                  <Icon.Bell className="w-9 h-9" />
                </div>
                <span className="absolute -right-1 -top-1 left-1/2 ml-4 flex h-7 w-7 items-center justify-center rounded-full bg-[#FF5D00] text-white shadow-lg animate-bounce">
                  <Icon.Sparkles className="w-3.5 h-3.5" />
                </span>
              </div>
              <p className="mt-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Notifications zawe</p>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                Nta notifications ufite
              </h2>
              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
                Iyo umuntu akwoherereje ubutumwa cyangwa hari ikindi gikorwa kigukorerwaho, amakuru azagaragara hano.
              </p>
              <Link
                to="/"
                className="group mt-7 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#FF5D00] via-[#FF7424] to-[#e05200] px-6 py-3 text-sm font-black text-white shadow-lg shadow-[#FF5D00]/30 transition hover:-translate-y-0.5"
              >
                Reba listings
                <Icon.ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </section>
        ) : filteredGroups.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white/50 py-16 text-center dark:border-white/15 dark:bg-slate-900/40">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-white/[0.05]">
              <Icon.Filter className="w-6 h-6" />
            </div>
            <p className="mt-3 text-sm font-bold text-slate-600 dark:text-slate-300">Nta makuru ari muri iyi filtre cyangwa shakisha</p>
            <button
              type="button"
              onClick={() => { setFilter("all"); setSearch("") }}
              className="mt-3 text-xs font-black text-[#FF5D00] hover:underline"
            >
              Subiza filters
            </button>
          </div>
        ) : view === "grid" ? (
          /* GRID VIEW */
          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {filteredGroups.map((group) => {
              const unread = group.unreadCount > 0
              const notification = group.latest
              const NotificationIcon = getIconComponent(notification.type)
              const tone = getTone(notification.type)
              const isSelected = selectedGroupId === group.id

              return (
                <button
                  key={group.id}
                  type="button"
                  onClick={() => openNotificationGroup(group)}
                  className={`group relative flex flex-col overflow-hidden rounded-2xl border text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                    isSelected
                      ? "border-[#FF5D00]/40 bg-[#FF5D00]/[0.04]"
                      : unread
                      ? "border-slate-200/70 bg-white/90 dark:border-white/10 dark:bg-slate-900/70"
                      : "border-slate-200/70 bg-white/70 dark:border-white/10 dark:bg-slate-900/40"
                  }`}
                >
                  <div className={`h-1 w-full bg-gradient-to-r ${tone.solid.replace("bg-gradient-to-br ", "from-").split(" to-").join(" to-").replace(/from-(\w+)-(\d+)/g, "from-$1-$2").replace(/to-(\w+)-(\d+)/g, "to-$1-$2")}`} style={{ background: `linear-gradient(90deg, ${tone.hex}dd, ${tone.hex}44)` }} />

                  <div className="flex flex-col p-4">
                    <div className="flex items-start justify-between">
                      <div className={`flex h-11 w-11 items-center justify-center rounded-2xl shadow-sm transition-transform group-hover:scale-105 ${
                        unread ? `${tone.solid} text-white` : `bg-slate-100 text-slate-500 dark:bg-white/[0.06] dark:text-slate-400`
                      }`}>
                        <NotificationIcon className="w-5 h-5" />
                      </div>
                      {unread && (
                        <span className="relative flex h-2 w-2">
                          <span className={`absolute inset-0 animate-ping rounded-full ${tone.solid}`} />
                          <span className={`relative flex h-2 w-2 rounded-full ${tone.solid}`} />
                        </span>
                      )}
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-1.5">
                      <span className={`rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${tone.bg} ${tone.text}`}>
                        {getNotificationLabel(notification.type)}
                      </span>
                      {group.totalCount > 1 && (
                        <span className="rounded-full bg-slate-200 px-1.5 py-0.5 text-[9px] font-black text-slate-600 dark:bg-white/[0.08] dark:text-slate-300">
                          +{group.totalCount}
                        </span>
                      )}
                    </div>

                    <h3 className={`mt-2 line-clamp-2 text-sm font-black ${unread ? "text-slate-900 dark:text-white" : "text-slate-700 dark:text-slate-200"}`}>
                      {notification.type === "new_message" ? group.senderName : notification.title}
                    </h3>

                    {notification.body && (
                      <p className={`mt-1 line-clamp-2 text-[11px] leading-5 ${unread ? "font-semibold text-slate-600 dark:text-slate-300" : "font-medium text-slate-500 dark:text-slate-400"}`}>
                        {notification.type === "new_message" ? "Yakohereje ubutumwa" : notification.body}
                      </p>
                    )}

                    <div className="mt-auto flex items-center justify-between pt-3">
                      <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                        <Icon.Clock className="w-2.5 h-2.5" />
                        {formatDate(notification.created_at)}
                      </span>
                      <span className={`flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-slate-400 transition group-hover:bg-[#FF5D00] group-hover:text-white dark:bg-white/[0.06]`}>
                        <Icon.ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </button>
              )
            })}
          </section>
        ) : (
          /* LIST VIEW */
          <section className="overflow-hidden rounded-[28px] border border-slate-200/70 bg-white/80 shadow-[0_30px_80px_-30px_rgba(16,36,54,0.3)] backdrop-blur-sm dark:border-white/10 dark:bg-slate-900/60">
            <div className="divide-y divide-slate-100 dark:divide-white/5">
              {filteredGroups.map((group) => {
                const unread = group.unreadCount > 0
                const notification = group.latest
                const NotificationIcon = getIconComponent(notification.type)
                const tone = getTone(notification.type)
                const isSelected = selectedGroupId === group.id

                return (
                  <button
                    key={group.id}
                    type="button"
                    onClick={() => openNotificationGroup(group)}
                    className={`group relative w-full text-left transition-all duration-200 ${
                      isSelected
                        ? "bg-[#FF5D00]/[0.04]"
                        : unread
                        ? "bg-gradient-to-r from-blue-500/[0.04] to-transparent hover:from-blue-500/[0.08] dark:from-blue-500/[0.06] dark:hover:from-blue-500/[0.1]"
                        : "hover:bg-slate-50/70 dark:hover:bg-white/[0.03]"
                    }`}
                  >
                    {unread && (
                      <span className="absolute inset-y-3 left-0 w-0.5 rounded-full" style={{ background: tone.hex }} />
                    )}

                    <div className="flex gap-3 p-4 sm:gap-4 sm:p-5">
                      <div className="relative shrink-0">
                        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl shadow-sm transition-transform group-hover:scale-105 sm:h-14 sm:w-14 ${
                          unread ? `${tone.solid} text-white` : `bg-slate-100 text-slate-500 dark:bg-white/[0.06] dark:text-slate-400`
                        }`}>
                          <NotificationIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                        </div>
                        {unread && (
                          <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-white dark:border-slate-900" style={{ background: tone.hex }} />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <h3 className={`truncate text-sm font-black sm:text-base ${unread ? "text-slate-900 dark:text-white" : "text-slate-800 dark:text-slate-100"}`}>
                                {notification.type === "new_message" ? group.senderName : notification.title}
                              </h3>
                              <span className={`rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${tone.bg} ${tone.text}`}>
                                {getNotificationLabel(notification.type)}
                              </span>
                              {group.totalCount > 1 && (
                                <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-black ${unread ? `${tone.solid} text-white` : "bg-slate-200 text-slate-600 dark:bg-white/[0.08] dark:text-slate-300"}`}>
                                  +{group.totalCount}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex shrink-0 items-center gap-1">
                            <span className={`text-[10px] font-bold ${unread ? tone.text : "text-slate-400"}`}>
                              {formatDate(notification.created_at)}
                            </span>
                            {unread && (
                              <button
                                type="button"
                                onClick={(e) => markGroupAsRead(group, e)}
                                className="hidden h-7 w-7 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 group-hover:flex dark:hover:bg-white/[0.06] dark:hover:text-slate-200"
                                title="Menyekanisha ko byasomwe"
                              >
                                <Icon.Check className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        {notification.type === "new_message" ? (
                          <p className={`mt-1.5 text-xs leading-5 sm:text-sm ${unread ? "font-semibold text-slate-700 dark:text-slate-200" : "font-medium text-slate-500 dark:text-slate-400"}`}>
                            Yakohereje ubutumwa
                            {group.totalCount > 1 && <span className="ml-1 font-black text-slate-400">· {group.totalCount} bushya</span>}
                          </p>
                        ) : notification.body ? (
                          <p className={`mt-1.5 line-clamp-2 text-xs leading-5 sm:text-sm ${unread ? "font-semibold text-slate-700 dark:text-slate-200" : "font-medium text-slate-500 dark:text-slate-400"}`}>
                            {notification.body}
                          </p>
                        ) : null}

                        <div className="mt-2 flex items-center justify-between gap-3">
                          <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                            <Icon.ArrowRight className="w-2.5 h-2.5" />
                            {notification.type === "new_message" ? "Kanda urebe ubutumwa" : "Kanda urebe byinshi"}
                          </span>
                          <span className="flex items-center text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-[#FF5D00]">
                            <Icon.ArrowRight className="w-4 h-4" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>

            <div className="border-t border-slate-100 bg-white/50 px-4 py-2.5 text-center dark:border-white/10 dark:bg-white/[0.02]">
              <p className="flex items-center justify-center gap-1 text-[10px] font-semibold text-slate-400">
                <Icon.Shield className="w-3 h-3 text-emerald-500" />
                Notifications zawe ziteguye kandi zibikwa neza
              </p>
            </div>
          </section>
        )}
      </div>

      {/* Shortcuts modal */}
      {showShortcuts && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
          onClick={() => setShowShortcuts(false)}
        >
          <div
            className="w-full max-w-md rounded-3xl border border-slate-200/70 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-slate-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#FF5D00]/10 text-[#FF5D00]">
                  <Icon.Keyboard className="w-4 h-4" />
                </span>
                <h3 className="text-sm font-black text-slate-900 dark:text-white">Keyboard shortcuts</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowShortcuts(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 dark:hover:bg-white/[0.06]"
              >
                <Icon.Close className="w-4 h-4" />
              </button>
            </div>
            <div className="mt-4 space-y-2">
              {[
                { keys: ["⌘", "K"], label: "Shakisha" },
                { keys: ["/"], label: "Shakisha (vuba)" },
                { keys: ["Esc"], label: "Funga" },
                { keys: ["⌘", "Enter"], label: "Fungura" },
              ].map((s) => (
                <div key={s.label} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2.5 dark:bg-white/[0.04]">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{s.label}</span>
                  <div className="flex items-center gap-1">
                    {s.keys.map((k) => (
                      <kbd key={k} className="rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-black text-slate-600 shadow-sm dark:border-white/10 dark:bg-white/[0.06] dark:text-slate-300">
                        {k}
                      </kbd>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

export default Notifications