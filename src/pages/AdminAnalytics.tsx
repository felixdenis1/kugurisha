import { useEffect, useMemo, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { supabase } from "../services/supabase"

type Profile = { id: string; created_at: string; role: string }
type Listing = {
  id: string
  created_at: string
  status: string
  category_id: string | null
  seller_id: string
  title: string
}
type Report = { id: string; created_at: string; status: string }
type Conversation = { id: string; created_at: string }
type Message = { id: string; created_at: string }
type Category = { id: string; name: string }
type PageView = { id: string; created_at: string; path: string; session_id: string | null }

type RangeKey = "7d" | "30d" | "90d" | "all"

const RANGE_DAYS: Record<RangeKey, number | null> = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
  all: null,
}

const COLORS = {
  emerald: "#10b981",
  blue: "#3b82f6",
  amber: "#f59e0b",
  rose: "#ef4444",
  purple: "#a855f7",
  orange: "#f97316",
  slate: "#64748b",
}

const PIE_COLORS = ["#10b981", "#f59e0b", "#3b82f6", "#ef4444", "#a855f7", "#64748b"]

export default function AdminAnalytics() {
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState("")
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  const [profiles, setProfiles] = useState<Profile[]>([])
  const [listings, setListings] = useState<Listing[]>([])
  const [reports, setReports] = useState<Report[]>([])
  const [, setConversations] = useState<Conversation[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [pageViews, setPageViews] = useState<PageView[]>([])

  const [range, setRange] = useState<RangeKey>("30d")
  const [chartMetric, setChartMetric] = useState<"users" | "listings" | "messages" | "views">("users")

  const channelRef = useRef<any>(null)

  useEffect(() => {
    loadAnalytics()
  }, [])

  // ---- REAL-TIME SUBSCRIPTION ----
  useEffect(() => {
    // Clean up any existing channel
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current)
    }

    const channel = supabase
      .channel("analytics-realtime")
      // New user
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "profiles" }, (payload) => {
        setProfiles((curr) => [...curr, payload.new as Profile])
        setLastUpdate(new Date())
      })
      // New listing
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "listings" }, (payload) => {
        setListings((curr) => [...curr, payload.new as Listing])
        setLastUpdate(new Date())
      })
      // Listing updated (status change)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "listings" }, (payload) => {
        setListings((curr) =>
          curr.map((l) => (l.id === (payload.new as any).id ? (payload.new as Listing) : l))
        )
        setLastUpdate(new Date())
      })
      // New report
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "reports" }, (payload) => {
        setReports((curr) => [...curr, payload.new as Report])
        setLastUpdate(new Date())
      })
      // New conversation
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "conversations" }, (payload) => {
        setConversations((curr) => [...curr, payload.new as Conversation])
        setLastUpdate(new Date())
      })
      // New message
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, (payload) => {
        setMessages((curr) => [...curr, payload.new as Message])
        setLastUpdate(new Date())
      })
      // New page view
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "page_views" }, (payload) => {
        setPageViews((curr) => [...curr, payload.new as PageView])
        setLastUpdate(new Date())
      })
      .subscribe()

    channelRef.current = channel

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
      }
    }
  }, [])

  async function loadAnalytics(isRefresh = false) {
    if (isRefresh) setRefreshing(true)
    else setLoading(true)
    setError("")

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { navigate("/login"); return }

      const { data: me } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single()

      if (me?.role !== "admin") {
        setError("Ntufite uburenganzira bwo kubona iyi page.")
        setLoading(false)
        return
      }

      // Only fetch page_views for last 90 days to avoid huge payloads
      const ninetyDaysAgo = new Date()
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)

      const [pRes, lRes, rRes, cRes, mRes, catRes, pvRes] = await Promise.all([
        supabase.from("profiles").select("id, created_at, role"),
        supabase.from("listings").select("id, created_at, status, category_id, seller_id, title"),
        supabase.from("reports").select("id, created_at, status"),
        supabase.from("conversations").select("id, created_at"),
        supabase.from("messages").select("id, created_at"),
        supabase.from("categories").select("id, name"),
        supabase
          .from("page_views")
          .select("id, created_at, path, session_id")
          .gte("created_at", ninetyDaysAgo.toISOString())
          .order("created_at", { ascending: false })
          .limit(5000),
      ])

      if (pRes.error) throw new Error(`Profiles: ${pRes.error.message}`)
      if (lRes.error) throw new Error(`Listings: ${lRes.error.message}`)
      if (rRes.error) throw new Error(`Reports: ${rRes.error.message}`)
      if (cRes.error) throw new Error(`Conversations: ${cRes.error.message}`)
      if (mRes.error) throw new Error(`Messages: ${mRes.error.message}`)
      if (catRes.error) throw new Error(`Categories: ${catRes.error.message}`)
      if (pvRes.error) {
        console.warn("page_views error — visitors may not be tracked yet:", pvRes.error.message)
      }

      setProfiles(pRes.data || [])
      setListings(lRes.data || [])
      setReports(rRes.data || [])
      setConversations(cRes.data || [])
      setMessages(mRes.data || [])
      setCategories(catRes.data || [])
      setPageViews((pvRes.data || []) as PageView[])
      setLastUpdate(new Date())
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : "Analytics ntizashoboye gufunguka.")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  // ---- Time range helpers ----
  const rangeStart = useMemo(() => {
    const days = RANGE_DAYS[range]
    if (days === null) return null
    const d = new Date()
    d.setDate(d.getDate() - days)
    return d
  }, [range])

  function withinRange(dateStr: string) {
    if (!rangeStart) return true
    return new Date(dateStr) >= rangeStart
  }

  // ---- Filtered data ----
  const filteredProfiles = profiles.filter((p) => withinRange(p.created_at))
  const filteredListings = listings.filter((l) => withinRange(l.created_at))
  const filteredReports = reports.filter((r) => withinRange(r.created_at))
  const filteredMessages = messages.filter((m) => withinRange(m.created_at))
  const filteredViews = pageViews.filter((v) => withinRange(v.created_at))

  // ---- Stats ----
  const uniqueVisitors = useMemo(() => {
    const set = new Set<string>()
    filteredViews.forEach((v) => {
      if (v.session_id) set.add(v.session_id)
    })
    return set.size
  }, [filteredViews])

  const stats = {
    newUsers: filteredProfiles.length,
    newListings: filteredListings.length,
    newReports: filteredReports.length,
    newMessages: filteredMessages.length,
    totalViews: filteredViews.length,
    uniqueVisitors,
  }

  // ---- Daily chart data ----
  const chartData = useMemo(() => {
    const buckets = new Map<
      string,
      { date: string; users: number; listings: number; messages: number; views: number }
    >()

    const days = RANGE_DAYS[range]
    const totalDays = days ?? 30
    const start = new Date()
    start.setDate(start.getDate() - totalDays + 1)
    start.setHours(0, 0, 0, 0)

    for (let i = 0; i < totalDays; i++) {
      const d = new Date(start)
      d.setDate(start.getDate() + i)
      const key = d.toISOString().slice(0, 10)
      buckets.set(key, {
        date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        users: 0,
        listings: 0,
        messages: 0,
        views: 0,
      })
    }

    const addTo = (dateStr: string, field: "users" | "listings" | "messages" | "views") => {
      const key = new Date(dateStr).toISOString().slice(0, 10)
      const bucket = buckets.get(key)
      if (bucket) bucket[field]++
    }

    filteredProfiles.forEach((p) => addTo(p.created_at, "users"))
    filteredListings.forEach((l) => addTo(l.created_at, "listings"))
    filteredMessages.forEach((m) => addTo(m.created_at, "messages"))
    filteredViews.forEach((v) => addTo(v.created_at, "views"))

    return Array.from(buckets.values())
  }, [filteredProfiles, filteredListings, filteredMessages, filteredViews, range])

  // ---- Top pages ----
  const topPages = useMemo(() => {
    const map = new Map<string, number>()
    filteredViews.forEach((v) => {
      map.set(v.path, (map.get(v.path) || 0) + 1)
    })
    return Array.from(map.entries())
      .map(([path, count]) => ({ path, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
  }, [filteredViews])

  // ---- Top categories ----
  const topCategories = useMemo(() => {
    const map = new Map<string, number>()
    filteredListings.forEach((l) => {
      if (l.category_id) map.set(l.category_id, (map.get(l.category_id) || 0) + 1)
    })
    return Array.from(map.entries())
      .map(([catId, count]) => ({
        name: categories.find((c) => c.id === catId)?.name || "Unknown",
        count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6)
  }, [filteredListings, categories])

  // ---- Top sellers ----
  const topSellers = useMemo(() => {
    const map = new Map<string, number>()
    filteredListings.forEach((l) => {
      map.set(l.seller_id, (map.get(l.seller_id) || 0) + 1)
    })
    return Array.from(map.entries())
      .map(([sellerId, count]) => ({
        name: profiles.find((p) => p.id === sellerId)?.id?.slice(0, 8) || "Unknown",
        sellerId,
        count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
  }, [filteredListings, profiles])

  // ---- Status breakdown ----
  const statusBreakdown = useMemo(() => {
    const counts: Record<string, number> = { active: 0, paused: 0, sold: 0, draft: 0, deleted: 0 }
    filteredListings.forEach((l) => {
      if (counts[l.status] !== undefined) counts[l.status]++
      else counts[l.status] = 1
    })
    return Object.entries(counts)
      .filter(([, v]) => v > 0)
      .map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }))
  }, [filteredListings])

  function formatRelativeTime(date: Date) {
    const diffMs = Date.now() - date.getTime()
    const secs = Math.floor(diffMs / 1000)
    if (secs < 10) return "just now"
    if (secs < 60) return `${secs}s ago`
    const mins = Math.floor(secs / 60)
    if (mins < 60) return `${mins}m ago`
    return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
  }

  const [, forceUpdate] = useState(0)
  useEffect(() => {
    // Re-render every 15s so "last update" time updates
    const t = setInterval(() => forceUpdate((n) => n + 1), 15000)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="mx-auto max-w-[1500px] space-y-6">
      {/* HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 text-xl text-white shadow-lg shadow-violet-500/30">
            📈
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white sm:text-3xl">
              Analytics
            </h1>
            <div className="mt-0.5 flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                Live
              </span>
              <span>Updated {formatRelativeTime(lastUpdate)}</span>
            </div>
          </div>
        </div>
        <button
          onClick={() => loadAnalytics(true)}
          disabled={refreshing}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
        >
          <svg className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
          {refreshing ? "Biravugurura..." : "Refresh"}
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-3 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-400">
          <svg className="mt-0.5 h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          <div className="flex-1">
            <p className="font-bold">Habaye ikibazo</p>
            <p className="mt-1 break-words">{error}</p>
          </div>
        </div>
      )}

      {/* RANGE TABS */}
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200/80 bg-white/80 p-2 shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-white/[0.03]">
        <span className="ml-2 text-[10px] font-black uppercase tracking-wider text-slate-400">
          Time range:
        </span>
        {([
          ["7d", "Last 7 days"],
          ["30d", "Last 30 days"],
          ["90d", "Last 90 days"],
          ["all", "All time"],
        ] as [RangeKey, string][]).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setRange(key)}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
              range === key
                ? "bg-slate-900 text-white shadow-sm dark:bg-white dark:text-slate-900"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/5"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-2xl bg-white dark:bg-white/5" />
          ))}
        </div>
      ) : (
        <>
          {/* STAT CARDS — 6 cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard
              label="Website Views"
              value={stats.totalViews}
              icon="👁"
              gradient="from-orange-100 to-amber-200"
              color="text-orange-600"
            />
            <StatCard
              label="Unique Visitors"
              value={stats.uniqueVisitors}
              icon="🧑"
              gradient="from-pink-100 to-rose-200"
              color="text-pink-600"
            />
            <StatCard
              label="New Users"
              value={stats.newUsers}
              icon="👥"
              gradient="from-blue-100 to-indigo-200"
              color="text-blue-600"
            />
            <StatCard
              label="New Listings"
              value={stats.newListings}
              icon="🏷️"
              gradient="from-emerald-100 to-teal-200"
              color="text-emerald-600"
            />
            <StatCard
              label="New Reports"
              value={stats.newReports}
              icon="🚩"
              gradient="from-rose-100 to-red-200"
              color="text-rose-600"
            />
            <StatCard
              label="New Messages"
              value={stats.newMessages}
              icon="💬"
              gradient="from-purple-100 to-fuchsia-200"
              color="text-purple-600"
            />
          </div>

          {/* MAIN LINE CHART */}
          <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-6 shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-[#0f1716]/80">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Growth Over Time</h3>
                <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">
                  Iterambere — hitamo metric urebe.
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5 rounded-xl bg-slate-100/80 p-1 dark:bg-white/5">
                {([
                  ["views", "Views", COLORS.orange],
                  ["users", "Users", COLORS.blue],
                  ["listings", "Listings", COLORS.emerald],
                  ["messages", "Messages", COLORS.purple],
                ] as ["views" | "users" | "listings" | "messages", string, string][]).map(([key, label, color]) => (
                  <button
                    key={key}
                    onClick={() => setChartMetric(key)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                      chartMetric === key
                        ? "bg-white shadow-sm dark:bg-[#10b981] dark:text-white"
                        : "text-slate-500 hover:text-slate-700 dark:text-slate-400"
                    }`}
                    style={chartMetric === key ? { color: key === "views" ? color : undefined } : undefined}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      background: "#fff",
                      border: "1px solid #e2e8f0",
                      borderRadius: "12px",
                      fontSize: "12px",
                      fontWeight: "bold",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey={chartMetric}
                    stroke={
                      chartMetric === "views"
                        ? COLORS.orange
                        : chartMetric === "users"
                        ? COLORS.blue
                        : chartMetric === "listings"
                        ? COLORS.emerald
                        : COLORS.purple
                    }
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: "#fff", strokeWidth: 2 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* BOTTOM GRID */}
          <div className="grid gap-4 lg:grid-cols-2">
            {/* TOP PAGES */}
            <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-6 shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-[#0f1716]/80">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">Top Pages</h3>
              <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">
                Amapaji asurwa cyane.
              </p>
              <div className="mt-6">
                {topPages.length === 0 ? (
                  <div className="flex h-52 items-center justify-center text-sm text-slate-400">Nta data</div>
                ) : (
                  <div className="space-y-2">
                    {topPages.map((p, i) => {
                      const max = topPages[0]?.count || 1
                      const pct = Math.round((p.count / max) * 100)
                      return (
                        <div key={p.path}>
                          <div className="mb-1 flex items-center justify-between text-xs font-bold">
                            <span className="truncate text-slate-700 dark:text-slate-300">
                              {i + 1}. {p.path}
                            </span>
                            <span className="shrink-0 text-slate-400">{p.count} views</span>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-orange-400 to-amber-500"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* TOP CATEGORIES */}
            <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-6 shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-[#0f1716]/80">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">Top Categories</h3>
              <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">
                Ibyiciro bikoreshwa cyane muri listings.
              </p>
              <div className="mt-6 h-64">
                {topCategories.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-sm text-slate-400">Nta data</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topCategories} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                      <XAxis type="number" tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} allowDecimals={false} />
                      <YAxis
                        type="category"
                        dataKey="name"
                        tick={{ fontSize: 11, fill: "#64748b", fontWeight: 600 }}
                        tickLine={false}
                        axisLine={false}
                        width={100}
                      />
                      <Tooltip
                        contentStyle={{
                          background: "#fff",
                          border: "1px solid #e2e8f0",
                          borderRadius: "12px",
                          fontSize: "12px",
                          fontWeight: "bold",
                        }}
                      />
                      <Bar dataKey="count" fill={COLORS.emerald} radius={[0, 6, 6, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* LISTING STATUS */}
            <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-6 shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-[#0f1716]/80">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">Listing Status</h3>
              <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">
                Uko listings zihagaze mu gihe wahisemo.
              </p>
              <div className="mt-6 h-64">
                {statusBreakdown.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-sm text-slate-400">Nta data</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusBreakdown}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={90}
                        paddingAngle={3}
                      >
                        {statusBreakdown.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          background: "#fff",
                          border: "1px solid #e2e8f0",
                          borderRadius: "12px",
                          fontSize: "12px",
                          fontWeight: "bold",
                        }}
                      />
                      <Legend
                        iconType="circle"
                        wrapperStyle={{ fontSize: "12px", fontWeight: "bold", paddingTop: "12px" }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* TOP SELLERS */}
            <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-6 shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-[#0f1716]/80">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">Top Sellers</h3>
              <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">
                Abagurisha bafite listings nyinshi muri iyi période.
              </p>

              {topSellers.length === 0 ? (
                <div className="mt-6 rounded-xl border border-dashed border-slate-200 py-12 text-center text-sm text-slate-400 dark:border-white/10">
                  Nta data
                </div>
              ) : (
                <div className="mt-6 space-y-3">
                  {topSellers.map((seller, idx) => (
                    <div
                      key={seller.sellerId}
                      className="flex items-center gap-4 rounded-xl border border-slate-100 bg-slate-50/50 p-4 dark:border-white/5 dark:bg-white/[0.02]"
                    >
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-black ${
                          idx === 0
                            ? "bg-amber-100 text-amber-700"
                            : idx === 1
                            ? "bg-slate-200 text-slate-700"
                            : idx === 2
                            ? "bg-orange-100 text-orange-700"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        #{idx + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-slate-900 dark:text-white">
                          Seller {seller.name}
                        </p>
                        <p className="text-[11px] font-medium text-slate-400">ID: {seller.sellerId.slice(0, 8)}…</p>
                      </div>
                      <div className="shrink-0 rounded-lg bg-[#10b981]/10 px-3 py-1.5 text-sm font-black text-[#059669] dark:text-[#34d399]">
                        {seller.count} listings
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function StatCard({
  label,
  value,
  icon,
  gradient,
  color,
}: {
  label: string
  value: number
  icon: string
  gradient: string
  color: string
}) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-5 shadow-sm backdrop-blur-sm transition-all hover:-translate-y-1 hover:shadow-md dark:border-white/10 dark:bg-[#0f1716]/80">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {label}
          </p>
          <p className={`mt-2 text-3xl font-black tracking-tight ${color}`}>
            {value.toLocaleString()}
          </p>
        </div>
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} text-xl shadow-sm ring-1 ring-white/50`}>
          {icon}
        </div>
      </div>
    </div>
  )
}