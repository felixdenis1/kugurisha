import { useCallback, useEffect, useRef, useState } from "react"
import { supabase } from "../services/supabase"

type DailyBucket = {
  key: string
  label: string
  count: number
  cumulative: number
}

type CategorySlice = {
  name: string
  count: number
  pct: number
}

type Stats = {
  activeListings: number
  totalUsers: number
  newToday: number
  newThisWeek: number
  deletedListings: number
  dailyBuckets: DailyBucket[]
  categoryShare: CategorySlice[]
  loading: boolean
  refreshing: boolean
  error: string | null
  lastUpdated: number
}

const DAY_MS = 24 * 60 * 60 * 1000
const CHART_COLORS = ["#22d3ee", "#569ab5", "#39778f", "#FF7A29"]

function dayKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`
}

function parseDayKey(key: string) {
  const [y, m, day] = key.split("-").map(Number)
  return new Date(y, (m || 1) - 1, day || 1)
}

function shortDay(d: Date) {
  return d.toLocaleDateString("en-US", { weekday: "short" })
}

function timeAgo(ts: number, now: number): string {
  if (!ts) return ""
  const diff = Math.max(0, Math.floor((now - ts) / 1000))
  if (diff < 5) return "just now"
  if (diff < 60) return `${diff}s ago`
  const min = Math.floor(diff / 60)
  if (min < 60) return `${min}m ago`
  const hr = Math.floor(min / 60)
  return `${hr}h ago`
}

export default function SystemAnalyticsCard() {
  const [stats, setStats] = useState<Stats>({
    activeListings: 0,
    totalUsers: 0,
    newToday: 0,
    newThisWeek: 0,
    deletedListings: 0,
    dailyBuckets: [],
    categoryShare: [],
    loading: true,
    refreshing: false,
    error: null,
    lastUpdated: 0,
  })

  const [hoveredBarIdx, setHoveredBarIdx] = useState<number | null>(null)
  const [hoveredCatIdx, setHoveredCatIdx] = useState<number | null>(null)
  const [nowTick, setNowTick] = useState(() => Date.now())

  const listingsChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)
  const profilesChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)

  const loadStats = useCallback(async (manual = false) => {
    setStats((prev) => ({
      ...prev,
      loading: prev.lastUpdated === 0,
      refreshing: manual,
      error: null,
    }))

    try {
      const now = new Date()
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const weekAgo = new Date(now.getTime() - 7 * DAY_MS)

      const [
        activeRes,
        usersRes,
        todayRes,
        weekCountRes,
        soldRes,
        weekRowsRes,
        catRowsRes,
      ] = await Promise.all([
        supabase
          .from("listings")
          .select("*", { count: "exact", head: true })
          .eq("status", "active")
          .is("deleted_at", null),
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase
          .from("listings")
          .select("*", { count: "exact", head: true })
          .gte("created_at", startOfDay.toISOString())
          .is("deleted_at", null),
        supabase
          .from("listings")
          .select("*", { count: "exact", head: true })
          .gte("created_at", weekAgo.toISOString())
          .is("deleted_at", null),
        supabase
          .from("listings")
          .select("*", { count: "exact", head: true })
          .or("status.eq.sold,deleted_at.not.is.null"),
        supabase
          .from("listings")
          .select("created_at")
          .gte("created_at", weekAgo.toISOString())
          .is("deleted_at", null),
        supabase
          .from("listings")
          .select("categories(name)")
          .eq("status", "active")
          .is("deleted_at", null)
          .limit(500),
      ])

      if (activeRes.error) throw activeRes.error
      if (usersRes.error) throw usersRes.error

      const bucketMap = new Map<string, number>()
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now.getTime() - i * DAY_MS)
        bucketMap.set(dayKey(d), 0)
      }

      ;(weekRowsRes.data || []).forEach((row: { created_at: string }) => {
        const k = dayKey(new Date(row.created_at))
        if (bucketMap.has(k)) {
          bucketMap.set(k, (bucketMap.get(k) || 0) + 1)
        }
      })

      let runningSum = 0
      const dailyBuckets: DailyBucket[] = Array.from(bucketMap.entries()).map(
        ([key, count]) => {
          runningSum += count
          return {
            key,
            label: shortDay(parseDayKey(key)),
            count,
            cumulative: runningSum,
          }
        },
      )

      const catMap = new Map<string, number>()
      ;(catRowsRes.data || []).forEach((row: any) => {
        const name =
          (Array.isArray(row.categories)
            ? row.categories[0]?.name
            : row.categories?.name) || "Ibindi"
        catMap.set(name, (catMap.get(name) || 0) + 1)
      })

      const sortedCats = Array.from(catMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 4)

      const topTotal = sortedCats.reduce((sum, [, c]) => sum + c, 0) || 1
      const categoryShare: CategorySlice[] = sortedCats.map(([name, count]) => ({
        name,
        count,
        pct: Math.round((count / topTotal) * 100),
      }))

      setStats({
        activeListings: activeRes.count ?? 0,
        totalUsers: usersRes.count ?? 0,
        newToday: todayRes.count ?? 0,
        newThisWeek: weekCountRes.count ?? 0,
        deletedListings: soldRes.count ?? 0,
        dailyBuckets,
        categoryShare,
        loading: false,
        refreshing: false,
        error: null,
        lastUpdated: Date.now(),
      })
    } catch (err: unknown) {
      console.error("Analytics load failed:", err)
      setStats((prev) => ({
        ...prev,
        loading: false,
        refreshing: false,
        error: err instanceof Error ? err.message : "Failed to load analytics",
      }))
    }
  }, [])

  useEffect(() => {
    void loadStats(false)

    const listingsCh = supabase
      .channel("analytics-listings-stream")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "listings" },
        () => {
          void loadStats(false)
        },
      )
      .subscribe()

    const profilesCh = supabase
      .channel("analytics-profiles-stream")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "profiles" },
        () => {
          void loadStats(false)
        },
      )
      .subscribe()

    listingsChannelRef.current = listingsCh
    profilesChannelRef.current = profilesCh

    const pollInterval = setInterval(() => void loadStats(false), 60_000)
    const tickInterval = setInterval(() => setNowTick(Date.now()), 1_000)

    return () => {
      clearInterval(pollInterval)
      clearInterval(tickInterval)
      if (listingsChannelRef.current) {
        void supabase.removeChannel(listingsChannelRef.current)
      }
      if (profilesChannelRef.current) {
        void supabase.removeChannel(profilesChannelRef.current)
      }
    }
  }, [loadStats])

  /* ── Chart Calculations ── */
  const maxDaily = Math.max(1, ...stats.dailyBuckets.map((b) => b.count))
  const maxCumulative = Math.max(
    1,
    ...stats.dailyBuckets.map((b) => b.cumulative),
  )

  const selectedDay =
    hoveredBarIdx !== null && stats.dailyBuckets[hoveredBarIdx]
      ? stats.dailyBuckets[hoveredBarIdx]
      : stats.dailyBuckets[stats.dailyBuckets.length - 1] || null

  const lineW = 180
  const lineH = 76
  const linePoints = stats.dailyBuckets.map((b, i) => {
    const x =
      stats.dailyBuckets.length <= 1
        ? lineW / 2
        : 8 + (i / (stats.dailyBuckets.length - 1)) * (lineW - 16)
    const y =
      lineH - 10 - (b.cumulative / maxCumulative) * (lineH - 20)
    return { x, y, ...b }
  })

  const indexPolyline = linePoints
    .map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`)
    .join(" ")

  const indexAreaPath =
    linePoints.length > 0
      ? `M${linePoints[0].x.toFixed(1)},${lineH - 8} ` +
        linePoints
          .map((p) => `L${p.x.toFixed(1)},${p.y.toFixed(1)}`)
          .join(" ") +
        ` L${linePoints[linePoints.length - 1].x.toFixed(1)},${lineH - 8} Z`
      : ""

  const barMetrics = [
    {
      label: "Active Listings",
      value: stats.activeListings,
      color: "#22d3ee",
    },
    {
      label: "DB Users",
      value: stats.totalUsers,
      color: "#569ab5",
    },
    {
      label: "New Today",
      value: stats.newToday,
      color: "#FF7A29",
    },
    {
      label: "Sold / Removed",
      value: stats.deletedListings,
      color: "#39778f",
    },
  ]
  const maxBarMetric = Math.max(1, ...barMetrics.map((m) => m.value))

  const totalCatCount = stats.categoryShare.reduce((s, c) => s + c.count, 0)
  const activeCat =
    hoveredCatIdx !== null && stats.categoryShare[hoveredCatIdx]
      ? {
          ...stats.categoryShare[hoveredCatIdx],
          color: CHART_COLORS[hoveredCatIdx % CHART_COLORS.length],
        }
      : null

  return (
    <div className="relative flex flex-col overflow-hidden rounded-[2rem] border border-slate-200/80 bg-[#f3f4f6] antialiased shadow-[0_24px_60px_-20px_rgba(16,36,54,0.16)] dark:border-cyan-400/15 dark:bg-[#07111c] dark:shadow-black/70">
      {/* Smooth ambient glow */}
      <div
        className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full"
        style={{
          background:
            "radial-gradient(circle at center, rgba(34,211,238,0.14) 0%, rgba(86,154,181,0.04) 48%, transparent 72%)",
        }}
      />
      <div
        className="pointer-events-none absolute -bottom-24 -left-24 h-60 w-60 rounded-full"
        style={{
          background:
            "radial-gradient(circle at center, rgba(255,122,41,0.10) 0%, transparent 70%)",
        }}
      />

      {/* Subtle telemetry grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035] dark:opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(34,211,238,.45) 1px,transparent 1px),linear-gradient(90deg,rgba(34,211,238,.45) 1px,transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      <div className="relative z-10 flex flex-col p-4 sm:p-5">
        {/* ───────── TOP BAR ───────── */}
        <div className="flex items-center justify-between gap-2 border-b border-slate-200/90 pb-3 dark:border-cyan-400/15">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inset-0 animate-ping rounded-full bg-cyan-400 opacity-75" />
              <span className="relative flex h-2 w-2 rounded-full bg-cyan-400" />
            </span>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#39778f] dark:text-cyan-300">
              Uko Ruhagaze
            </p>
            <span className="rounded bg-cyan-500/10 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider text-cyan-700 ring-1 ring-cyan-500/25 dark:text-cyan-300">
              Live
            </span>
          </div>

          <button
            type="button"
            onClick={() => void loadStats(true)}
            disabled={stats.refreshing}
            aria-label="Refresh analytics"
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-300/80 bg-white/80 text-slate-600 transition-colors hover:border-cyan-400/60 hover:text-cyan-600 disabled:opacity-50 dark:border-cyan-400/20 dark:bg-[#0b1b2b] dark:text-cyan-200"
          >
            <svg
              className={`h-3.5 w-3.5 ${stats.refreshing ? "animate-spin" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.5 12a7.5 7.5 0 0013.06 5.1m1.44-5.1a7.5 7.5 0 00-13.06-5.1M4.5 4.5V9h4.5M19.5 19.5V15H15"
              />
            </svg>
          </button>
        </div>

        {stats.error && (
          <div className="mt-3 flex items-center justify-between gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-[10px] font-bold text-rose-700 dark:text-rose-300">
            <span className="truncate">{stats.error}</span>
            <button
              type="button"
              onClick={() => void loadStats(true)}
              className="rounded bg-rose-600 px-2 py-0.5 text-[9px] text-white"
            >
              Retry
            </button>
          </div>
        )}

        {/* ───────── PRIMARY KPI STRIP (Listings + DB Users + Today + Sold) ───────── */}
        <div className="mt-3.5 grid grid-cols-2 gap-2">
          <StatBox
            label="Ibicuruzwa biriho"
            sub="Available listings"
            value={stats.loading ? "—" : stats.activeListings.toLocaleString()}
            accentColor="#22d3ee"
          />
          <StatBox
            label="Abakoresha"
            sub="Users in database"
            value={stats.loading ? "—" : stats.totalUsers.toLocaleString()}
            accentColor="#569ab5"
          />
          <StatBox
            label="Bishya uyu munsi"
            sub="Added today"
            value={stats.loading ? "—" : `+${stats.newToday}`}
            accentColor="#FF7A29"
          />
          <StatBox
            label="Byagurishijwe"
            sub="Sold / removed"
            value={stats.loading ? "—" : stats.deletedListings.toLocaleString()}
            accentColor="#39778f"
          />
        </div>

        {/* ───────── TOP DIAGRAM ROW: COLUMN BARS + CUMULATIVE LINE ───────── */}
        <div className="mt-3.5 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {/* Daily Column Chart */}
          <div
            className="rounded-xl border border-slate-200/90 bg-white/80 p-3 dark:border-cyan-400/15 dark:bg-[#091624]"
            onMouseLeave={() => setHoveredBarIdx(null)}
          >
            <div className="flex items-baseline justify-between">
              <span className="text-[9px] font-black uppercase tracking-wider text-slate-500 dark:text-cyan-300/80">
                Daily Posts (7d)
              </span>
              <span className="text-[10px] font-black tabular-nums text-cyan-600 dark:text-cyan-300">
                {selectedDay ? `${selectedDay.label}: ${selectedDay.count}` : "0"}
              </span>
            </div>

            {stats.loading ? (
              <div className="mt-2 h-[76px] animate-pulse rounded bg-slate-200 dark:bg-white/10" />
            ) : (
              <div className="mt-2">
                <div className="flex h-[64px] items-end gap-1.5 border-b border-l border-slate-300/80 pl-1.5 pt-1 dark:border-cyan-400/25">
                  {stats.dailyBuckets.map((b, i) => {
                    const heightPct = Math.max(8, (b.count / maxDaily) * 100)
                    const isHovered = hoveredBarIdx === i
                    return (
                      <button
                        key={b.key}
                        type="button"
                        onMouseEnter={() => setHoveredBarIdx(i)}
                        onClick={() => setHoveredBarIdx(i)}
                        className="group flex h-full flex-1 items-end"
                        title={`${b.label}: ${b.count}`}
                      >
                        <span
                          className="w-full rounded-t-[2px] transition-all duration-200"
                          style={{
                            height: `${heightPct}%`,
                            backgroundColor: isHovered ? "#FF7A29" : "#22d3ee",
                            opacity:
                              hoveredBarIdx === null || isHovered ? 0.92 : 0.45,
                          }}
                        />
                      </button>
                    )
                  })}
                </div>
                <div className="mt-1 flex justify-between pl-1.5 text-[8px] font-bold text-slate-400 dark:text-slate-400">
                  {stats.dailyBuckets.map((b) => (
                    <span key={b.key}>{b.label.slice(0, 2)}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 7-Day Index Line Chart */}
          <div className="rounded-xl border border-slate-200/90 bg-white/80 p-3 dark:border-cyan-400/15 dark:bg-[#091624]">
            <div className="flex items-baseline justify-between">
              <span className="text-[9px] font-black uppercase tracking-wider text-slate-500 dark:text-cyan-300/80">
                7d Volume Index
              </span>
              <span className="text-[10px] font-black tabular-nums text-slate-900 dark:text-white">
                {stats.newThisWeek}
              </span>
            </div>

            {stats.loading ? (
              <div className="mt-2 h-[76px] animate-pulse rounded bg-slate-200 dark:bg-white/10" />
            ) : (
              <div className="mt-2">
                <svg
                  viewBox={`0 0 ${lineW} ${lineH}`}
                  className="h-[76px] w-full overflow-visible"
                  role="img"
                  aria-label="7-day cumulative listings line chart"
                >
                  <defs>
                    <linearGradient id="kgCyanFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.28" />
                      <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <line
                    x1="8"
                    x2={lineW - 4}
                    y1={lineH - 8}
                    y2={lineH - 8}
                    stroke="currentColor"
                    strokeWidth="0.8"
                    className="text-slate-300 dark:text-cyan-400/25"
                  />
                  <line
                    x1="8"
                    x2="8"
                    y1="6"
                    y2={lineH - 8}
                    stroke="currentColor"
                    strokeWidth="0.8"
                    className="text-slate-300 dark:text-cyan-400/25"
                  />
                  {indexAreaPath && (
                    <path d={indexAreaPath} fill="url(#kgCyanFill)" />
                  )}
                  {indexPolyline && (
                    <polyline
                      fill="none"
                      stroke="#22d3ee"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      points={indexPolyline}
                    />
                  )}
                  {linePoints.map((p, i) => (
                    <circle
                      key={p.key}
                      cx={p.x}
                      cy={p.y}
                      r={i === linePoints.length - 1 ? 2.8 : 1.8}
                      fill={i === linePoints.length - 1 ? "#FF7A29" : "#22d3ee"}
                    />
                  ))}
                </svg>
              </div>
            )}
          </div>
        </div>

        {/* ───────── MIDDLE DIAGRAM: HORIZONTAL TELEMETRY BARS ───────── */}
        <div className="mt-2.5 rounded-xl border border-slate-200/90 bg-white/80 p-3 dark:border-cyan-400/15 dark:bg-[#091624]">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[9px] font-black uppercase tracking-wider text-slate-500 dark:text-cyan-300/80">
              Platform Metrics Comparison
            </span>
            <span className="text-[9px] font-bold text-slate-400">Live Counts</span>
          </div>

          <div className="space-y-2">
            {barMetrics.map((m) => {
              const widthPct = Math.max(4, (m.value / maxBarMetric) * 100)
              return (
                <div key={m.label} className="space-y-0.5">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-bold text-slate-700 dark:text-slate-200">
                      {m.label}
                    </span>
                    <span className="font-black tabular-nums text-slate-900 dark:text-cyan-200">
                      {stats.loading ? "—" : m.value.toLocaleString()}
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-sm bg-slate-200/80 dark:bg-cyan-950">
                    <div
                      className="h-full rounded-sm transition-all duration-500"
                      style={{
                        width: `${stats.loading ? 15 : widthPct}%`,
                        backgroundColor: m.color,
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* ───────── BOTTOM DIAGRAM: CATEGORY PIE / DONUT BREAKDOWN ───────── */}
        <div className="mt-2.5 rounded-xl border border-slate-200/90 bg-white/80 p-3 dark:border-cyan-400/15 dark:bg-[#091624]">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-black uppercase tracking-wider text-slate-500 dark:text-cyan-300/80">
              Ibicuruzwa ku byiciro
            </span>
            <span className="text-[9px] font-bold text-slate-400">
              {activeCat ? `${activeCat.count} items` : `Top ${stats.categoryShare.length}`}
            </span>
          </div>

          {stats.categoryShare.length > 0 ? (
            <div
              className="mt-2.5 flex items-center gap-3.5"
              onMouseLeave={() => setHoveredCatIdx(null)}
            >
              <div className="relative h-16 w-16 shrink-0">
                <svg
                  viewBox="0 0 36 36"
                  className="h-full w-full -rotate-90"
                  role="img"
                  aria-label="Category share chart"
                >
                  <circle
                    cx="18"
                    cy="18"
                    r="13"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="5"
                    className="text-slate-200 dark:text-white/10"
                  />
                  {(() => {
                    const denom = totalCatCount || 1
                    const r = 13
                    const c = 2 * Math.PI * r
                    let offset = 0
                    return stats.categoryShare.map((slice, idx) => {
                      const len = (slice.count / denom) * c
                      const selected = hoveredCatIdx === idx
                      const el = (
                        <circle
                          key={slice.name}
                          cx="18"
                          cy="18"
                          r={r}
                          fill="none"
                          stroke={CHART_COLORS[idx % CHART_COLORS.length]}
                          strokeWidth={selected ? 6.2 : 5}
                          strokeDasharray={`${len} ${c - len}`}
                          strokeDashoffset={-offset}
                          className="cursor-pointer transition-all duration-200"
                          opacity={hoveredCatIdx === null || selected ? 1 : 0.45}
                          onMouseEnter={() => setHoveredCatIdx(idx)}
                          onClick={() =>
                            setHoveredCatIdx((prev) => (prev === idx ? null : idx))
                          }
                        />
                      )
                      offset += len
                      return el
                    })
                  })()}
                </svg>
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-[9px] font-black tabular-nums text-slate-900 dark:text-white">
                  {activeCat ? `${activeCat.pct}%` : totalCatCount}
                </div>
              </div>

              <div className="min-w-0 flex-1 grid grid-cols-2 gap-1.5">
                {stats.categoryShare.map((slice, idx) => {
                  const color = CHART_COLORS[idx % CHART_COLORS.length]
                  const selected = hoveredCatIdx === idx
                  return (
                    <button
                      key={slice.name}
                      type="button"
                      onMouseEnter={() => setHoveredCatIdx(idx)}
                      onClick={() =>
                        setHoveredCatIdx((prev) => (prev === idx ? null : idx))
                      }
                      className={`flex items-center gap-1.5 rounded px-1.5 py-1 text-left transition-colors ${
                        selected
                          ? "bg-slate-200/80 dark:bg-cyan-400/15"
                          : "hover:bg-slate-100 dark:hover:bg-white/[0.04]"
                      }`}
                    >
                      <span
                        className="h-2 w-2 shrink-0 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                      <span className="truncate text-[10px] font-bold text-slate-700 dark:text-slate-200">
                        {slice.name}
                      </span>
                      <span className="ml-auto text-[9px] font-black tabular-nums text-slate-500 dark:text-cyan-300/80">
                        {slice.pct}%
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          ) : (
            <p className="mt-2 text-xs text-slate-400">Nta makuru arahari</p>
          )}
        </div>

        {/* ───────── FOOTER ───────── */}
        <div className="mt-3 flex items-center justify-between border-t border-slate-200/90 pt-2.5 text-[9px] font-bold text-slate-500 dark:border-cyan-400/15 dark:text-slate-400">
          <span className="tabular-nums">
            {stats.lastUpdated
              ? `Updated ${timeAgo(stats.lastUpdated, nowTick)}`
              : "Syncing..."}
          </span>
          <span className="uppercase tracking-wider text-cyan-700 dark:text-cyan-300">
            Real-time DB
          </span>
        </div>
      </div>
    </div>
  )
}

function StatBox({
  label,
  sub,
  value,
  accentColor,
}: {
  label: string
  sub: string
  value: string
  accentColor: string
}) {
  return (
    <div className="rounded-xl border border-slate-200/90 bg-white/85 px-3 py-2 dark:border-cyan-400/15 dark:bg-[#091624]">
      <div className="flex items-center justify-between gap-1">
        <span className="truncate text-[9px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-300">
          {label}
        </span>
        <span
          className="h-1.5 w-1.5 shrink-0 rounded-full"
          style={{ backgroundColor: accentColor }}
        />
      </div>
      <p className="truncate text-[8px] font-medium text-slate-400 dark:text-slate-500">
        {sub}
      </p>
      <p className="mt-1 text-base font-black tabular-nums leading-tight text-slate-900 dark:text-white">
        {value}
      </p>
    </div>
  )
}