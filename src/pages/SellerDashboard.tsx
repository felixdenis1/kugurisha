import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { supabase } from "../services/supabase"

type Listing = {
  id: string
  title: string
  description: string | null
  price: number | null
  currency: string
  status: string
  listing_type: string
  created_at: string
  category: {
    name: string
  }[] | null
}

/* ──────────────────────────────────────────────────────────────────────────
   ICON SYSTEM
   ────────────────────────────────────────────────────────────────────────── */
type IconProps = { className?: string }

const Icon = {
  Home: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
    </svg>
  ),
  Heart: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
    </svg>
  ),
  Plus: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  ),
  Grid: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
    </svg>
  ),
  List: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
  ),
  Check: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.4} d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  ),
  CheckCircle: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Pause: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.75 5.25v13.5m-7.5-13.5v13.5" />
    </svg>
  ),
  Play: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
    </svg>
  ),
  Trash: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
  ),
  Pencil: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
    </svg>
  ),
  Eye: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  Alert: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
    </svg>
  ),
  Clock: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Tag: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M6 6h.008v.008H6V6z" />
    </svg>
  ),
  Sparkles: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
    </svg>
  ),
  Bolt: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
    </svg>
  ),
  ArrowRight: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
    </svg>
  ),
  Filter: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
    </svg>
  ),
  Inbox: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M2.25 13.5h3.86a2.25 2.25 0 012.012 1.244l.256.512a2.25 2.25 0 002.013 1.244h3.218a2.25 2.25 0 002.013-1.244l.256-.512a2.25 2.25 0 012.013-1.244h3.859m-19.5.338V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 00-2.15-1.588H6.911a2.25 2.25 0 00-2.15 1.588L2.35 13.177a2.25 2.25 0 00-.1.661z" />
    </svg>
  ),
  External: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
    </svg>
  ),
  Search: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
  ),
  Sort: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 7.5L7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5" />
    </svg>
  ),
  TrendUp: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
    </svg>
  ),
  Menu: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
  ),
  Logout: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
    </svg>
  ),
  Settings: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
}

type FilterKey = "all" | "active" | "sold" | "paused"
type ViewMode = "list" | "grid"
type SortKey = "newest" | "oldest" | "price-high" | "price-low"

/* Animated count-up */
function useCountUp(target: number, duration = 900) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    let raf = 0
    const start = performance.now()
    const from = 0
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - t, 3)
      setValue(Math.round(from + (target - from) * eased))
      if (t < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [target, duration])
  return value
}

/* Donut chart */
function DonutChart({
  segments,
  size = 140,
  stroke = 16,
}: {
  segments: { value: number; color: string; label: string }[]
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
        const dash = `${len} ${c - len}`
        const el = (
          <circle
            key={i}
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={s.color}
            strokeWidth={stroke}
            strokeDasharray={dash}
            strokeDashoffset={-offset}
            strokeLinecap="round"
            style={{ transition: "stroke-dasharray 700ms ease, stroke-dashoffset 700ms ease" }}
          />
        )
        offset += len
        return el
      })}
    </svg>
  )
}

/* KPI ring */
function KpiRing({ percent, color, size = 64, stroke = 6 }: { percent: number; color: string; size?: number; stroke?: number }) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const dash = (Math.min(100, Math.max(0, percent)) / 100) * c
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeWidth={stroke} className="text-slate-200 dark:text-white/10" />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeDasharray={`${dash} ${c - dash}`} strokeLinecap="round"
        style={{ transition: "stroke-dasharray 900ms cubic-bezier(0.16,1,0.3,1)" }}
      />
    </svg>
  )
}

function SellerDashboard() {
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState("")
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [filter, setFilter] = useState<FilterKey>("all")
  const [view, setView] = useState<ViewMode>("list")
  const [sort, setSort] = useState<SortKey>("newest")
  const [query, setQuery] = useState("")
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => { void loadListings() }, [])

  async function loadListings() {
    try {
      setLoading(true); setMessage("")
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = "/login"; return }
      const { data, error } = await supabase
        .from("listings")
        .select(`id, title, description, price, currency, status, listing_type, created_at, category:categories (name)`)
        .eq("seller_id", user.id)
        .order("created_at", { ascending: false })
      if (error) { console.error(error); setMessage(error.message); return }
      setListings(data || [])
    } catch (error) {
      console.error(error); setMessage("Habaye ikibazo mu kuzana listings zawe.")
    } finally { setLoading(false) }
  }

  async function updateStatus(listingId: string, status: "active" | "paused" | "sold") {
    setUpdatingId(listingId)
    const { error } = await supabase.from("listings").update({ status, updated_at: new Date().toISOString() }).eq("id", listingId)
    if (error) { alert(error.message); setUpdatingId(null); return }
    setListings((cur) => cur.map((l) => (l.id === listingId ? { ...l, status } : l)))
    setUpdatingId(null)
  }

  async function deleteListing(listingId: string) {
    if (!window.confirm("Urashaka koko gusiba iyi listing?")) return
    setDeletingId(listingId)
    const { error } = await supabase.from("listings").delete().eq("id", listingId)
    if (error) { alert(error.message); setDeletingId(null); return }
    setListings((cur) => cur.filter((l) => l.id !== listingId))
    setDeletingId(null)
  }

  function formatPrice(l: Listing) {
    if (l.listing_type === "free") return "Ubuntu"
    if (l.price === null) return "Twandikire ku giciro"
    return `${Number(l.price).toLocaleString("en-US")} Frw`
  }

  function statusLabel(s: string) {
    return ({ active: "Biraboneka", paused: "Byahagaritswe", sold: "Byagurishijwe", pending: "Birategereje", rejected: "Byanzwe", draft: "Draft", expired: "Byarangiye" } as Record<string, string>)[s] || s
  }

  function statusStyle(status: string) {
    switch (status) {
      case "active": return { chip: "bg-emerald-500/10 text-emerald-600 ring-1 ring-emerald-500/25 dark:text-emerald-400", bar: "from-emerald-500 to-emerald-400", dot: "bg-emerald-500", icon: Icon.CheckCircle, hex: "#10b981" }
      case "sold": return { chip: "bg-blue-500/10 text-blue-600 ring-1 ring-blue-500/25 dark:text-blue-400", bar: "from-blue-500 to-indigo-500", dot: "bg-blue-500", icon: Icon.Check, hex: "#3b82f6" }
      case "paused": return { chip: "bg-amber-500/10 text-amber-600 ring-1 ring-amber-500/25 dark:text-amber-400", bar: "from-amber-500 to-orange-500", dot: "bg-amber-500", icon: Icon.Pause, hex: "#f59e0b" }
      case "rejected": return { chip: "bg-rose-500/10 text-rose-600 ring-1 ring-rose-500/25 dark:text-rose-400", bar: "from-rose-500 to-pink-500", dot: "bg-rose-500", icon: Icon.Alert, hex: "#f43f5e" }
      default: return { chip: "bg-slate-500/10 text-slate-600 ring-1 ring-slate-500/20 dark:text-slate-400", bar: "from-slate-500 to-slate-400", dot: "bg-slate-500", icon: Icon.Clock, hex: "#64748b" }
    }
  }

  const activeCount = listings.filter((l) => l.status === "active").length
  const soldCount = listings.filter((l) => l.status === "sold").length
  const pausedCount = listings.filter((l) => l.status === "paused").length
  const totalValue = listings.reduce((sum, l) => sum + (l.price || 0), 0)

  const filteredListings = useMemo(() => {
    let arr = listings
    if (filter !== "all") arr = arr.filter((l) => l.status === filter)
    if (query.trim()) {
      const q = query.toLowerCase()
      arr = arr.filter((l) => l.title.toLowerCase().includes(q) || (l.description || "").toLowerCase().includes(q))
    }
    const sorted = [...arr]
    switch (sort) {
      case "newest": sorted.sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at)); break
      case "oldest": sorted.sort((a, b) => +new Date(a.created_at) - +new Date(b.created_at)); break
      case "price-high": sorted.sort((a, b) => (b.price || 0) - (a.price || 0)); break
      case "price-low": sorted.sort((a, b) => (a.price || 0) - (b.price || 0)); break
    }
    return sorted
  }, [listings, filter, query, sort])

  const filterTabs: { key: FilterKey; label: string; count: number }[] = [
    { key: "all", label: "Zose", count: listings.length },
    { key: "active", label: "Biraboneka", count: activeCount },
    { key: "sold", label: "Byagurishijwe", count: soldCount },
    { key: "paused", label: "Byahagaritswe", count: pausedCount },
  ]

  // Count-up values
  const cTotal = useCountUp(listings.length)
  const cActive = useCountUp(activeCount)
  const cSold = useCountUp(soldCount)
  const cPaused = useCountUp(pausedCount)
  const cValue = useCountUp(totalValue)

  const navItems = [
    { label: "Ahabanza", href: "/", icon: Icon.Home },
    { label: "Ibyo Nakunze", href: "/favorites", icon: Icon.Heart },
    { label: "Dashboard", href: "/dashboard", icon: Icon.Grid, active: true },
    { label: "Igenamiterere", href: "/settings", icon: Icon.Settings },
  ]

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f4f8fb] text-[#102436] dark:bg-[#060f19] dark:text-slate-100">
      {/* Ambient glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-blue-500/10 blur-[140px] dark:bg-blue-500/[0.08]" />
        <div className="absolute top-1/3 -right-40 h-[600px] w-[600px] rounded-full bg-[#FF5D00]/10 blur-[140px] dark:bg-[#FF5D00]/[0.06]" />
        <div className="absolute bottom-0 left-1/3 h-[500px] w-[500px] rounded-full bg-indigo-500/10 blur-[140px] dark:bg-indigo-500/[0.05]" />
      </div>

      <div className="relative flex">
        {/* ─────────── SIDEBAR (desktop) ─────────── */}
        <aside className={`hidden w-64 shrink-0 border-r border-slate-200/70 bg-white/60 backdrop-blur-xl dark:border-white/10 dark:bg-[#060f19]/60 lg:flex lg:flex-col ${sidebarOpen ? "" : ""}`}>
          <div className="sticky top-0 flex h-screen flex-col">
            <Link to="/" className="group flex items-center gap-2.5 px-6 py-5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30 transition-transform group-hover:scale-105">
                <Icon.Tag className="w-4.5 h-4.5" />
              </span>
              <span className="text-sm font-black tracking-tight">
                KUGURISHA
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">.COM</span>
              </span>
            </Link>

            <nav className="mt-2 flex-1 space-y-1 px-3">
              <p className="px-3 pb-2 text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Menu</p>
              {navItems.map((n) => {
                const NIcon = n.icon
                return (
                  <Link
                    key={n.label}
                    to={n.href}
                    className={`group flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-bold transition-all ${
                      n.active
                        ? "bg-gradient-to-r from-[#102436] to-[#1a3350] text-white shadow-md dark:from-[#FF5D00] dark:to-[#e05200]"
                        : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/[0.05]"
                    }`}
                  >
                    <NIcon className="w-4 h-4" />
                    <span>{n.label}</span>
                    {n.active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-emerald-400" />}
                  </Link>
                )
              })}
            </nav>

            <div className="m-3 rounded-2xl bg-gradient-to-br from-[#102436] to-[#1a3350] p-4 text-white shadow-lg dark:from-[#0d1b2e] dark:to-[#0a1424]">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#FF5D00] shadow-sm">
                  <Icon.Sparkles className="w-3.5 h-3.5" />
                </span>
                <p className="text-[11px] font-black">Shyiraho rindi</p>
              </div>
              <p className="mt-1.5 text-[10px] leading-relaxed text-slate-300">Ongera ibicuruzwa byinshi ku isoko.</p>
              <Link
                to="/create-listing"
                className="mt-3 flex items-center justify-center gap-1 rounded-lg bg-white py-2 text-[11px] font-black text-slate-900 transition hover:bg-[#FF5D00] hover:text-white"
              >
                <Icon.Plus className="w-3 h-3" /> Tangira
              </Link>
            </div>

            <button className="flex items-center gap-2.5 px-6 py-4 text-xs font-bold text-slate-500 transition hover:text-[#FF5D00] dark:text-slate-400">
              <Icon.Logout className="w-4 h-4" /> Sohoka
            </button>
          </div>
        </aside>

        {/* ─────────── MAIN ─────────── */}
        <div className="min-w-0 flex-1">
          {/* Top bar */}
          <header className="sticky top-0 z-40 border-b border-slate-200/60 bg-white/70 backdrop-blur-2xl dark:border-white/10 dark:bg-[#060f19]/70">
            <div className="flex items-center justify-between gap-3 px-4 py-3.5 sm:px-6 lg:px-8">
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setSidebarOpen((v) => !v)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm dark:border-white/10 dark:bg-white/[0.06] dark:text-slate-300 lg:hidden"
                >
                  <Icon.Menu className="w-4 h-4" />
                </button>

                {/* Search */}
                <div className="relative hidden sm:block">
                  <Icon.Search className="pointer-events-none absolute left-3 top-1/2 w-3.5 h-3.5 -translate-y-1/2 text-slate-400" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Shakisha amatangazo..."
                    className="w-56 rounded-full border border-slate-200/80 bg-white/80 pl-9 pr-3 py-2 text-xs font-semibold text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:w-72 focus:border-[#FF5D00] focus:ring-4 focus:ring-[#FF5D00]/10 dark:border-white/10 dark:bg-white/[0.05] dark:text-white lg:w-72"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link to="/create-listing" className="group inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#FF5D00] via-[#FF7424] to-[#e05200] px-3.5 py-2 text-xs font-black text-white shadow-md shadow-[#FF5D00]/30 transition hover:-translate-y-0.5 hover:shadow-lg">
                  <Icon.Plus className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Shyiraho</span>
                </Link>
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 ring-2 ring-white shadow-sm dark:ring-slate-900" />
              </div>
            </div>
          </header>

          <div className="px-4 py-6 sm:px-6 lg:px-8">
            {/* ───── HERO + DASHBOARD INSIGHTS ───── */}
            <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_380px]">
              {/* Left: Hero card */}
              <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#0a0f1e] via-[#0d1526] to-[#0a0f1e] p-6 text-white shadow-[0_30px_80px_-25px_rgba(10,15,30,0.6)] sm:p-8">
                <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-blue-500/40 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-20 -left-10 h-52 w-52 rounded-full bg-[#FF5D00]/20 blur-3xl" />
                <div className="pointer-events-none absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "22px 22px" }} />

                <div className="relative">
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-300 backdrop-blur">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative flex h-2 w-2 rounded-full bg-emerald-400" />
                    </span>
                    Seller Dashboard
                  </div>
                  <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
                    Murakaza neza 👋
                  </h1>
                  <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-300">
                    Dore incamake y'ubucuruzi bwawe. Ugurisha neza kandi wiyubaka.
                  </p>

                  <div className="mt-6 flex flex-wrap items-end gap-6">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Agaciro kose</p>
                      <p className="mt-1 text-2xl font-black tracking-tight text-white sm:text-3xl">
                        {cValue.toLocaleString()} <span className="text-sm text-slate-400">FRW</span>
                      </p>
                    </div>
                    <div className="h-10 w-px bg-white/10" />
                    <div>
                      <p className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-emerald-400">
                        <Icon.TrendUp className="w-3 h-3" /> Biraboneka
                      </p>
                      <p className="mt-1 text-2xl font-black tracking-tight text-white">{cActive}</p>
                    </div>
                  </div>

                  <Link
                    to="/create-listing"
                    className="group mt-6 inline-flex items-center gap-2 overflow-hidden rounded-xl bg-white px-4 py-2.5 text-xs font-black text-slate-950 shadow-lg transition hover:-translate-y-0.5"
                  >
                    <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-blue-200/50 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                    <Icon.Sparkles className="relative w-3.5 h-3.5" />
                    <span className="relative">Shyiraho ikindi</span>
                    <Icon.ArrowRight className="relative w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </div>

              {/* Right: Donut breakdown */}
              <div className="rounded-[28px] border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-slate-900/60">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Igabanywa</p>
                    <h3 className="mt-0.5 text-sm font-black text-slate-900 dark:text-white">Imiterere y'amatangazo</h3>
                  </div>
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-500 dark:bg-white/[0.06] dark:text-slate-400">
                    <Icon.TrendUp className="w-4 h-4" />
                  </span>
                </div>

                <div className="mt-5 flex items-center gap-5">
                  <div className="relative shrink-0">
                    <DonutChart
                      segments={[
                        { value: activeCount, color: "#10b981", label: "Active" },
                        { value: soldCount, color: "#3b82f6", label: "Sold" },
                        { value: pausedCount, color: "#f59e0b", label: "Paused" },
                      ]}
                      size={130}
                      stroke={14}
                    />
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <p className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">{listings.length}</p>
                      <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">Zose</p>
                    </div>
                  </div>

                  <div className="min-w-0 flex-1 space-y-2">
                    {[
                      { label: "Biraboneka", value: activeCount, color: "#10b981" },
                      { label: "Byagurishijwe", value: soldCount, color: "#3b82f6" },
                      { label: "Byahagaritswe", value: pausedCount, color: "#f59e0b" },
                    ].map((s) => (
                      <div key={s.label} className="flex items-center gap-2 text-xs">
                        <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: s.color }} />
                        <span className="flex-1 truncate font-semibold text-slate-600 dark:text-slate-400">{s.label}</span>
                        <span className="font-black text-slate-900 dark:text-white">{s.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* ───── KPI RINGS ───── */}
            <section className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: "Listings zose", value: cTotal, percent: 100, color: "#64748b", hint: "Amatangazo yose ufite", icon: Icon.Grid, bar: "from-slate-500 to-slate-400" },
                { label: "Ziracyaboneka", value: cActive, percent: listings.length ? (activeCount / listings.length) * 100 : 0, color: "#10b981", hint: "Ziri ku isoko ubu", icon: Icon.CheckCircle, bar: "from-emerald-500 to-emerald-400" },
                { label: "Byagurishijwe", value: cSold, percent: listings.length ? (soldCount / listings.length) * 100 : 0, color: "#3b82f6", hint: "Byamaze kubona umuguzi", icon: Icon.Check, bar: "from-blue-500 to-indigo-500" },
                { label: "Byahagaritswe", value: cPaused, percent: listings.length ? (pausedCount / listings.length) * 100 : 0, color: "#f59e0b", hint: "Zitarimo kugaragara", icon: Icon.Pause, bar: "from-amber-500 to-orange-500" },
              ].map((k) => {
                const KIcon = k.icon
                return (
                  <div key={k.label} className="group relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:shadow-lg dark:border-white/10 dark:bg-slate-900/60">
                    <div className={`absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r ${k.bar}`} />
                    <div className="flex items-start justify-between">
                      <div className="min-w-0">
                        <p className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">{k.label}</p>
                        <p className="mt-1.5 text-2xl font-black tracking-tight" style={{ color: k.color }}>{k.value}</p>
                        <p className="mt-0.5 truncate text-[10px] font-medium text-slate-400 dark:text-slate-500">{k.hint}</p>
                      </div>
                      <div className="relative shrink-0">
                        <KpiRing percent={k.percent} color={k.color} size={52} stroke={5} />
                        <span className="absolute inset-0 flex items-center justify-center" style={{ color: k.color }}>
                          <KIcon className="w-4 h-4" />
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </section>

            {/* ───── ERROR ───── */}
            {!loading && message && (
              <div className="mt-5 flex items-start gap-3 rounded-2xl border border-rose-500/25 bg-rose-500/10 p-4 text-rose-600 dark:text-rose-400">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-500/15">
                  <Icon.Alert className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-black">Habaye ikibazo</p>
                  <p className="mt-1 text-sm leading-5">{message}</p>
                </div>
              </div>
            )}

            {/* ───── TOOLBAR ───── */}
            {!loading && listings.length > 0 && (
              <div className="mt-8 flex flex-col gap-4 rounded-2xl border border-slate-200/70 bg-white/70 p-3.5 backdrop-blur-sm dark:border-white/10 dark:bg-slate-900/60 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap gap-1.5">
                  {filterTabs.map((tab) => {
                    const isActive = filter === tab.key
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
                        <span>{tab.label}</span>
                        <span className={`rounded-full px-1.5 py-0.5 text-[9px] ${isActive ? "bg-white/20" : "bg-slate-200/70 dark:bg-white/10"}`}>
                          {tab.count}
                        </span>
                      </button>
                    )
                  })}
                </div>

                <div className="flex items-center gap-2">
                  {/* Sort */}
                  <div className="relative">
                    <Icon.Sort className="pointer-events-none absolute left-2.5 top-1/2 w-3 h-3 -translate-y-1/2 text-slate-400" />
                    <select
                      value={sort}
                      onChange={(e) => setSort(e.target.value as SortKey)}
                      className="appearance-none rounded-full border border-slate-200 bg-white pl-8 pr-8 py-1.5 text-[11px] font-bold text-slate-700 outline-none dark:border-white/10 dark:bg-white/[0.06] dark:text-slate-200"
                    >
                      <option value="newest">Nshya mbere</option>
                      <option value="oldest">Zishaje mbere</option>
                      <option value="price-high">Igiciro kinini</option>
                      <option value="price-low">Igiciro gito</option>
                    </select>
                    <svg className="pointer-events-none absolute right-2.5 top-1/2 w-3 h-3 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  </div>

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
                </div>
              </div>
            )}

            {/* ───── LOADING ───── */}
            {loading && (
              <section className="mt-6 space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white/70 p-5 dark:border-white/10 dark:bg-slate-900/60">
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 animate-pulse rounded-xl bg-slate-200 dark:bg-white/10" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-32 animate-pulse rounded-full bg-slate-200 dark:bg-white/10" />
                        <div className="h-5 w-2/3 animate-pulse rounded-lg bg-slate-200 dark:bg-white/10" />
                        <div className="h-4 w-24 animate-pulse rounded bg-slate-200 dark:bg-white/10" />
                      </div>
                    </div>
                  </div>
                ))}
              </section>
            )}

            {/* ───── EMPTY ───── */}
            {!loading && !message && listings.length === 0 && (
              <section className="mt-8 overflow-hidden rounded-3xl border border-slate-200/70 bg-white/80 shadow-sm dark:border-white/10 dark:bg-slate-900/60">
                <div className="flex min-h-[400px] flex-col items-center justify-center px-6 py-16 text-center">
                  <div className="relative">
                    <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-500/15 to-indigo-500/10 text-blue-500">
                      <Icon.Inbox className="w-10 h-10" />
                    </div>
                    <span className="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full bg-[#FF5D00] text-white shadow-lg animate-bounce">
                      <Icon.Plus className="w-4 h-4" />
                    </span>
                  </div>
                  <h2 className="mt-7 text-2xl font-black tracking-tight sm:text-3xl">Nta listing ufite</h2>
                  <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
                    Tangira ushyire ikintu cyawe ku isoko rya KUGURISHA.COM.
                  </p>
                  <Link to="/create-listing" className="group mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#FF5D00] via-[#FF7424] to-[#e05200] px-6 py-3.5 text-sm font-black text-white shadow-lg shadow-[#FF5D00]/30 transition hover:-translate-y-0.5">
                    <Icon.Plus className="w-4 h-4" />
                    Shyiraho listing
                    <Icon.ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </section>
            )}

            {/* ───── LIST / GRID ───── */}
            {!loading && filteredListings.length > 0 && (
              <section className={`mt-5 ${view === "grid" ? "grid gap-4 sm:grid-cols-2 xl:grid-cols-3" : "space-y-3"}`}>
                {filteredListings.map((listing) => {
                  const isUpdating = updatingId === listing.id
                  const isDeleting = deletingId === listing.id
                  const style = statusStyle(listing.status)
                  const StatusIcon = style.icon
                  const categoryName = listing.category?.[0]?.name || "Ibindi"

                  return view === "grid" ? (
                    /* ─── GRID CARD ─── */
                    <article
                      key={listing.id}
                      className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200/70 bg-white/80 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-white/10 dark:bg-slate-900/60"
                    >
                      <div className="relative h-32 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900">
                        <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${style.bar}`} />
                        <div className="absolute inset-0 flex items-center justify-center opacity-20">
                          <Icon.Tag className="w-14 h-14 text-slate-400" />
                        </div>
                        <span className={`absolute left-3 top-3 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider backdrop-blur ${style.chip}`}>
                          <StatusIcon className="w-2.5 h-2.5" />
                          {statusLabel(listing.status)}
                        </span>
                        {listing.listing_type === "free" && (
                          <span className="absolute right-3 top-3 rounded-full bg-purple-500/90 px-2 py-0.5 text-[9px] font-black text-white shadow-sm">Ubuntu</span>
                        )}
                      </div>
                      <div className="flex flex-1 flex-col p-4">
                        <p className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-slate-400">
                          <Icon.Grid className="w-2.5 h-2.5" /> {categoryName}
                        </p>
                        <Link to={`/listing/${listing.id}`} className="mt-1.5 line-clamp-2 text-sm font-black leading-snug text-slate-900 transition hover:text-[#FF5D00] dark:text-white">
                          {listing.title}
                        </Link>
                        <p className="mt-2 flex items-center gap-1 text-sm font-black" style={{ color: style.hex }}>
                          <Icon.Tag className="w-3 h-3" /> {formatPrice(listing)}
                        </p>
                        <p className="mt-1 flex items-center gap-1 text-[10px] font-medium text-slate-400">
                          <Icon.Clock className="w-2.5 h-2.5" />
                          {new Date(listing.created_at).toLocaleDateString("rw-RW")}
                        </p>

                        <div className="mt-auto flex flex-wrap gap-1.5 pt-3">
                          <Link to={`/listing/${listing.id}`} className="flex-1 rounded-lg border border-slate-200 bg-white py-1.5 text-center text-[10px] font-black text-slate-700 transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200">
                            Reba
                          </Link>
                          <Link to={`/edit-listing/${listing.id}`} className="flex-1 rounded-lg border border-blue-500/25 bg-blue-500/10 py-1.5 text-center text-[10px] font-black text-blue-600 transition hover:bg-blue-500/20 dark:text-blue-400">
                            Hindura
                          </Link>
                          <button
                            type="button"
                            disabled={isDeleting}
                            onClick={() => deleteListing(listing.id)}
                            className="flex h-7 w-7 items-center justify-center rounded-lg border border-rose-500/25 bg-rose-500/10 text-rose-600 transition hover:bg-rose-500/20 disabled:opacity-50 dark:text-rose-400"
                          >
                            {isDeleting ? <span className="h-3 w-3 animate-spin rounded-full border-2 border-rose-500 border-t-transparent" /> : <Icon.Trash className="w-3 h-3" />}
                          </button>
                        </div>
                      </div>
                    </article>
                  ) : (
                    /* ─── LIST ROW ─── */
                    <article
                      key={listing.id}
                      className="group relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white/80 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-xl dark:border-white/10 dark:bg-slate-900/60"
                    >
                      <span className={`absolute inset-y-0 left-0 w-1 bg-gradient-to-b ${style.bar}`} />
                      <div className="p-4 pl-5 sm:p-5 sm:pl-6">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                          {/* thumbnail */}
                          <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900">
                            <Icon.Tag className="w-6 h-6 text-slate-400 opacity-60" />
                            <span className={`absolute bottom-1 right-1 h-2 w-2 rounded-full ring-2 ring-white dark:ring-slate-900 ${style.dot}`} />
                          </div>

                          {/* info */}
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${style.chip}`}>
                                <StatusIcon className="w-2.5 h-2.5" />
                                {statusLabel(listing.status)}
                              </span>
                              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-bold text-slate-600 dark:bg-white/[0.06] dark:text-slate-300">
                                {categoryName}
                              </span>
                              {listing.listing_type === "free" && (
                                <span className="rounded-full bg-purple-500/10 px-2 py-0.5 text-[9px] font-black text-purple-600 ring-1 ring-purple-500/25 dark:text-purple-400">Ubuntu</span>
                              )}
                            </div>
                            <Link to={`/listing/${listing.id}`} className="group/title mt-1.5 flex items-center gap-1.5 text-sm font-black text-slate-900 transition hover:text-[#FF5D00] dark:text-white sm:text-base">
                              <span className="truncate">{listing.title}</span>
                              <Icon.External className="w-3 h-3 shrink-0 opacity-0 transition-opacity group-hover/title:opacity-100" />
                            </Link>
                            <div className="mt-1 flex flex-wrap items-center gap-3 text-xs">
                              <span className="flex items-center gap-1 font-black" style={{ color: style.hex }}>
                                <Icon.Tag className="w-3 h-3" /> {formatPrice(listing)}
                              </span>
                              <span className="flex items-center gap-1 font-medium text-slate-400">
                                <Icon.Clock className="w-3 h-3" />
                                {new Date(listing.created_at).toLocaleDateString("rw-RW")}
                              </span>
                            </div>
                          </div>

                          {/* actions */}
                          <div className="flex flex-wrap gap-1.5 sm:justify-end">
                            <Link to={`/listing/${listing.id}`} className="inline-flex h-8 items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 text-[10px] font-black text-slate-700 transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200">
                              <Icon.Eye className="w-3 h-3" /> Reba
                            </Link>
                            <Link to={`/edit-listing/${listing.id}`} className="inline-flex h-8 items-center gap-1 rounded-lg border border-blue-500/25 bg-blue-500/10 px-2.5 text-[10px] font-black text-blue-600 transition hover:bg-blue-500/20 dark:text-blue-400">
                              <Icon.Pencil className="w-3 h-3" /> Hindura
                            </Link>
                            {listing.status === "active" && (
                              <>
                                <button type="button" disabled={isUpdating} onClick={() => updateStatus(listing.id, "paused")} className="inline-flex h-8 items-center gap-1 rounded-lg border border-amber-500/25 bg-amber-500/10 px-2.5 text-[10px] font-black text-amber-600 transition hover:bg-amber-500/20 disabled:opacity-50 dark:text-amber-400">
                                  {isUpdating ? <span className="h-3 w-3 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" /> : <Icon.Pause className="w-3 h-3" />} Hagarika
                                </button>
                                <button type="button" disabled={isUpdating} onClick={() => updateStatus(listing.id, "sold")} className="inline-flex h-8 items-center gap-1 rounded-lg border border-emerald-500/25 bg-emerald-500/10 px-2.5 text-[10px] font-black text-emerald-600 transition hover:bg-emerald-500/20 disabled:opacity-50 dark:text-emerald-400">
                                  {isUpdating ? <span className="h-3 w-3 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" /> : <Icon.Check className="w-3 h-3" />} Byagurishijwe
                                </button>
                              </>
                            )}
                            {listing.status === "paused" && (
                              <button type="button" disabled={isUpdating} onClick={() => updateStatus(listing.id, "active")} className="inline-flex h-8 items-center gap-1 rounded-lg border border-emerald-500/25 bg-emerald-500/10 px-2.5 text-[10px] font-black text-emerald-600 transition hover:bg-emerald-500/20 disabled:opacity-50 dark:text-emerald-400">
                                {isUpdating ? <span className="h-3 w-3 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" /> : <Icon.Play className="w-3 h-3" />} Shyira ku isoko
                              </button>
                            )}
                            {listing.status === "sold" && (
                              <button type="button" disabled={isUpdating} onClick={() => updateStatus(listing.id, "active")} className="inline-flex h-8 items-center gap-1 rounded-lg border border-blue-500/25 bg-blue-500/10 px-2.5 text-[10px] font-black text-blue-600 transition hover:bg-blue-500/20 disabled:opacity-50 dark:text-blue-400">
                                {isUpdating ? <span className="h-3 w-3 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" /> : <Icon.Play className="w-3 h-3" />} Shyira ku isoko
                              </button>
                            )}
                            <button type="button" disabled={isDeleting} onClick={() => deleteListing(listing.id)} className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-rose-500/25 bg-rose-500/10 text-rose-600 transition hover:bg-rose-500/20 disabled:opacity-50 dark:text-rose-400">
                              {isDeleting ? <span className="h-3 w-3 animate-spin rounded-full border-2 border-rose-500 border-t-transparent" /> : <Icon.Trash className="w-3 h-3" />}
                            </button>
                          </div>
                        </div>
                      </div>
                    </article>
                  )
                })}
              </section>
            )}

            {/* Filter-empty fallback */}
            {!loading && listings.length > 0 && filteredListings.length === 0 && (
              <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white/50 py-16 text-center dark:border-white/15 dark:bg-slate-900/40">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-white/[0.05]">
                  <Icon.Filter className="w-6 h-6" />
                </div>
                <p className="mt-3 text-sm font-bold text-slate-600 dark:text-slate-300">Nta tangazo riri muri iyi filtre cyangwa shakisha</p>
                <button type="button" onClick={() => { setFilter("all"); setQuery("") }} className="mt-3 text-xs font-black text-[#FF5D00] hover:underline">
                  Subiza filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating action button (mobile) */}
      <Link
        to="/create-listing"
        className="fixed bottom-5 right-5 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#FF5D00] to-[#e05200] text-white shadow-2xl shadow-[#FF5D00]/40 transition hover:scale-110 active:scale-95 sm:hidden"
      >
        <Icon.Plus className="w-6 h-6" />
      </Link>
    </main>
  )
}

export default SellerDashboard