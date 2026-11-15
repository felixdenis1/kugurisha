import { useEffect, useRef, useState } from "react"
import { supabase } from "../services/supabase"

type Stats = {
  activeListings: number
  totalUsers: number
  newToday: number
  newThisWeek: number
  conversations: number
  deletedListings: number
  dailyBuckets: { label: string; count: number }[]
  categoryShare: { name: string; count: number; pct: number }[]
  loading: boolean
  error: string | null
  lastUpdated: number
}

const DAY_MS = 24 * 60 * 60 * 1000

function dayKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

function shortDay(d: Date) {
  return d.toLocaleDateString("en-US", { weekday: "short" })
}

/* Human-readable "X ago" */
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
    conversations: 0,
    deletedListings: 0,
    dailyBuckets: [],
    categoryShare: [],
    loading: true,
    error: null,
    lastUpdated: 0,
  })

  /* Ticks every second so "updated 3s ago" stays fresh */
  const [nowTick, setNowTick] = useState(Date.now())
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)

  async function loadStats() {
    try {
      const now = new Date()
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const weekAgo = new Date(now.getTime() - 7 * DAY_MS)

      /* 1. Active listings */
      const { count: activeListings, error: e1 } = await supabase
        .from("listings")
        .select("*", { count: "exact", head: true })
        .eq("status", "active")
        .is("deleted_at", null)
      if (e1) throw e1

      /* 2. Total users */
      const { count: totalUsers } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })

      /* 3. New listings today */
      const { count: newToday } = await supabase
        .from("listings")
        .select("*", { count: "exact", head: true })
        .gte("created_at", startOfDay.toISOString())
        .is("deleted_at", null)

      /* 4. New listings this week */
      const { count: newThisWeek } = await supabase
        .from("listings")
        .select("*", { count: "exact", head: true })
        .gte("created_at", weekAgo.toISOString())
        .is("deleted_at", null)

      /* 5. Conversations — COUNT ONLY */
      const { count: conversations } = await supabase
        .from("conversations")
        .select("*", { count: "exact", head: true })

      /* 6. Deleted / sold */
      const { count: deletedListings } = await supabase
        .from("listings")
        .select("*", { count: "exact", head: true })
        .or("status.eq.sold,deleted_at.not.is.null")

      /* 7. Daily buckets — last 7 days */
      const { data: weekRows } = await supabase
        .from("listings")
        .select("created_at")
        .gte("created_at", weekAgo.toISOString())
        .is("deleted_at", null)

      const bucketMap = new Map<string, number>()
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now.getTime() - i * DAY_MS)
        bucketMap.set(dayKey(d), 0)
      }
      ;(weekRows || []).forEach((row: { created_at: string }) => {
        const k = dayKey(new Date(row.created_at))
        if (bucketMap.has(k)) bucketMap.set(k, (bucketMap.get(k) || 0) + 1)
      })
      const dailyBuckets = Array.from(bucketMap.entries()).map(([k, count]) => ({
        label: shortDay(new Date(k)),
        count,
      }))

      /* 8. Category share — top 4 */
      const { data: catRows } = await supabase
        .from("listings")
        .select("categories(name)")
        .eq("status", "active")
        .is("deleted_at", null)
        .limit(500)

      const catMap = new Map<string, number>()
      ;(catRows || []).forEach((row: any) => {
        const name =
          (Array.isArray(row.categories)
            ? row.categories[0]?.name
            : row.categories?.name) || "Ibindi"
        catMap.set(name, (catMap.get(name) || 0) + 1)
      })
      const totalCat = Array.from(catMap.values()).reduce((a, b) => a + b, 0) || 1
      const categoryShare = Array.from(catMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 4)
        .map(([name, count]) => ({
          name,
          count,
          pct: Math.round((count / totalCat) * 100),
        }))

      setStats({
        activeListings: activeListings || 0,
        totalUsers: totalUsers || 0,
        newToday: newToday || 0,
        newThisWeek: newThisWeek || 0,
        conversations: conversations || 0,
        deletedListings: deletedListings || 0,
        dailyBuckets,
        categoryShare,
        loading: false,
        error: null,
        lastUpdated: Date.now(),
      })
    } catch (err: unknown) {
      console.error("Analytics load failed:", err)
      setStats((s) => ({
        ...s,
        loading: false,
        error: err instanceof Error ? err.message : "Failed to load",
      }))
    }
  }

  useEffect(() => {
    void loadStats()

    const channel = supabase
      .channel("analytics-listings")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "listings" },
        () => { void loadStats() },
      )
      .subscribe()

    channelRef.current = channel

    const interval = setInterval(() => void loadStats(), 60_000)
    const tickInterval = setInterval(() => setNowTick(Date.now()), 1_000)

    return () => {
      clearInterval(interval)
      clearInterval(tickInterval)
      if (channelRef.current) supabase.removeChannel(channelRef.current)
    }
  }, [])

  const maxDaily = Math.max(1, ...stats.dailyBuckets.map((b) => b.count))
  const categoryColors = ["#39778f", "#569ab5", "#6ec5c9", "#FF7A29"]

  /* Chart data → SVG path (area chart) */
  const chartW = 300
  const chartH = 90
  const pts = stats.dailyBuckets.map((b, i) => {
    const x = (i / Math.max(1, stats.dailyBuckets.length - 1)) * chartW
    const y = chartH - (b.count / maxDaily) * (chartH - 10) - 5
    return { x, y, ...b }
  })
  const linePath = pts.length > 0
    ? pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ")
    : ""
  const areaPath = pts.length > 0
    ? `${linePath} L${chartW},${chartH} L0,${chartH} Z`
    : ""

  return (
    <div className="relative flex flex-col overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white/85 shadow-[0_24px_60px_-20px_rgba(16,36,54,0.15)] backdrop-blur-2xl dark:border-white/[0.1] dark:bg-[#0a1524]/80 dark:shadow-black/60">

      {/* Ambient glows */}
      <div className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full bg-[#569ab5]/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 -right-16 h-56 w-56 rounded-full bg-[#FF5D00]/15 blur-3xl" />

      {/* Grid texture overlay (very subtle) */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.025] dark:opacity-[0.05]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(57,119,143,.5) 1px,transparent 1px),linear-gradient(90deg,rgba(57,119,143,.5) 1px,transparent 1px)",
          backgroundSize: "32px 32px",
          maskImage: "radial-gradient(ellipse at top left, black 20%, transparent 70%)",
          WebkitMaskImage: "radial-gradient(ellipse at top left, black 20%, transparent 70%)",
        }}
      />

      <div className="relative z-10 flex flex-col p-5 sm:p-6">

        {/* ───────── HEADER ───────── */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            {/* Animated gradient ring around pulsing dot */}
            <div className="relative mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center">
              <span className="absolute inset-0 animate-[spin_8s_linear_infinite] rounded-full bg-[conic-gradient(from_0deg,#39778f,#569ab5,#6ec5c9,#FF5D00,#39778f)] opacity-60 blur-[2px]" />
              <span className="absolute inset-[2px] rounded-full bg-white dark:bg-[#0a1524]" />
              <span className="relative flex h-2 w-2">
                <span className="absolute inset-0 animate-ping rounded-full bg-[#569ab5] opacity-75" />
                <span className="relative flex h-2 w-2 rounded-full bg-[#569ab5]" />
              </span>
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#39778f] dark:text-[#6ec5c9]">
                  Uko Ruhagaze
                </p>
                <span className="rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider text-emerald-600 ring-1 ring-emerald-500/25 dark:text-emerald-400">
                  Live
                </span>
              </div>
            </div>
          </div>

          {/* Refresh button */}
          <button
            type="button"
            onClick={() => void loadStats()}
            aria-label="Refresh analytics"
            className="group flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-200/80 bg-white/70 text-slate-500 shadow-sm transition-all hover:-rotate-12 hover:border-[#FF5D00]/40 hover:text-[#FF5D00] dark:border-white/10 dark:bg-white/[0.05] dark:text-slate-400"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12a7.5 7.5 0 0013.06 5.1m1.44-5.1a7.5 7.5 0 00-13.06-5.1M4.5 4.5V9h4.5M19.5 19.5V15H15" />
            </svg>
          </button>
        </div>

        {/* ───────── KPI ROW (4 tiles) ───────── */}
        <div className="mt-5 grid grid-cols-2 gap-2 sm:gap-2.5">
          <KpiTile
            icon="📦"
            label="Ibicuruzwa biriho"
            value={stats.loading ? "" : stats.activeListings.toLocaleString()}
            tint="#39778f"
            loading={stats.loading}
            trend={stats.newThisWeek > 0 ? `+${stats.newThisWeek} this week` : undefined}
          />
          <KpiTile
            icon="👥"
            label="Abakoresha"
            value={stats.loading ? "" : stats.totalUsers.toLocaleString()}
            tint="#569ab5"
            loading={stats.loading}
          />
          <KpiTile
            icon="🆕"
            label="Bishya uyu munsi"
            value={stats.loading ? "" : `+${stats.newToday}`}
            tint="#FF7A29"
            loading={stats.loading}
            accent
          />
          <KpiTile
            icon="💬"
            label="Ibiganiro"
            value={stats.loading ? "" : stats.conversations.toLocaleString()}
            tint="#6ec5c9"
            loading={stats.loading}
          />
        </div>

        {/* ───────── SOLD (wide hero KPI) ───────── */}
        <div className="mt-2.5">
          <div className="group relative overflow-hidden rounded-2xl border border-emerald-500/25 bg-gradient-to-br from-emerald-500/[0.08] to-emerald-500/[0.02] p-3.5 transition-all hover:border-emerald-500/40 dark:border-emerald-500/30 dark:from-emerald-500/[0.12] dark:to-emerald-500/[0.03]">
            <div className="pointer-events-none absolute -right-4 -top-4 h-16 w-16 rounded-full bg-emerald-500/20 blur-2xl transition-opacity group-hover:opacity-80" />

            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 ring-1 ring-emerald-500/25 dark:text-emerald-400">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.4}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-wider text-emerald-600/80 dark:text-emerald-400/80">
                    Byagurishijwe
                  </p>
                  <p className="text-[10px] font-medium text-emerald-700/60 dark:text-emerald-300/60">
                    Ibyasibwe cyangwa byaguzwe
                  </p>
                </div>
              </div>

              {stats.loading ? (
                <div className="h-7 w-14 animate-pulse rounded-lg bg-emerald-500/20" />
              ) : (
                <p className="text-2xl font-black tracking-tight text-emerald-600 dark:text-emerald-400">
                  {stats.deletedListings.toLocaleString()}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ───────── 7-DAY AREA CHART ───────── */}
        <div className="mt-6">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                Ibicuruzwa bishya
              </p>
              <p className="mt-0.5 text-[10px] font-bold text-slate-400 dark:text-slate-500">
                Iminsi 7 ishize
              </p>
            </div>
            <div className="text-right">
              <p className="text-lg font-black leading-none tracking-tight text-slate-900 dark:text-white">
                {stats.newThisWeek}
              </p>
              <p className="mt-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-400">
                byose
              </p>
            </div>
          </div>

          {stats.loading ? (
            <div className="mt-3 h-[90px] animate-pulse rounded-xl bg-slate-100 dark:bg-white/[0.04]" />
          ) : stats.dailyBuckets.length > 0 ? (
            <div className="relative mt-3">
              <svg
                viewBox={`0 0 ${chartW} ${chartH}`}
                preserveAspectRatio="none"
                className="h-[90px] w-full overflow-visible"
              >
                <defs>
                  <linearGradient id="kgAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#569ab5" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#569ab5" stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id="kgLineGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#39778f" />
                    <stop offset="60%" stopColor="#569ab5" />
                    <stop offset="100%" stopColor="#FF7A29" />
                  </linearGradient>
                </defs>

                {/* Grid lines */}
                {[0, 0.5, 1].map((f) => (
                  <line
                    key={f}
                    x1="0"
                    x2={chartW}
                    y1={chartH * f}
                    y2={chartH * f}
                    stroke="currentColor"
                    strokeWidth="0.5"
                    className="text-slate-200/60 dark:text-white/10"
                    strokeDasharray="2 3"
                  />
                ))}

                {/* Area fill */}
                {areaPath && (
                  <path
                    d={areaPath}
                    fill="url(#kgAreaGrad)"
                    style={{ transition: "d 700ms cubic-bezier(0.16,1,0.3,1)" }}
                  />
                )}

                {/* Line */}
                {linePath && (
                  <path
                    d={linePath}
                    fill="none"
                    stroke="url(#kgLineGrad)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ transition: "d 700ms cubic-bezier(0.16,1,0.3,1)" }}
                  />
                )}

                {/* Data points (with tooltip title) */}
                {pts.map((p, i) => {
                  const isToday = i === pts.length - 1
                  return (
                    <g key={i}>
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r={isToday ? 4 : 2.5}
                        fill={isToday ? "#FF7A29" : "#569ab5"}
                        stroke="white"
                        strokeWidth={isToday ? 2 : 1}
                        className="dark:stroke-[#0a1524]"
                      >
                        <title>{`${p.label}: ${p.count}`}</title>
                      </circle>
                      {isToday && (
                        <circle cx={p.x} cy={p.y} r="8" fill="#FF7A29" opacity="0.2" className="animate-ping" />
                      )}
                    </g>
                  )
                })}
              </svg>

              {/* Day labels */}
              <div className="mt-1.5 flex justify-between px-0.5">
                {stats.dailyBuckets.map((b, i) => {
                  const isToday = i === stats.dailyBuckets.length - 1
                  return (
                    <span
                      key={i}
                      className={`text-[9px] font-bold ${
                        isToday ? "text-[#FF5D00]" : "text-slate-400 dark:text-slate-500"
                      }`}
                    >
                      {b.label}
                    </span>
                  )
                })}
              </div>
            </div>
          ) : (
            <div className="mt-3 flex h-[90px] items-center justify-center rounded-xl border border-dashed border-slate-200 text-xs text-slate-400 dark:border-white/10">
              Nta makuru arahari
            </div>
          )}
        </div>

        {/* ───────── CATEGORY DONUT + LEGEND ───────── */}
        <div className="mt-5 border-t border-slate-200/70 pt-4 dark:border-white/10">
          <div className="flex items-center justify-between">
            <p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
              Ibicuruzwa ku byiciro
            </p>
            <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500">
              Top {stats.categoryShare.length || 0}
            </p>
          </div>

          {stats.categoryShare.length > 0 ? (
            <div className="mt-3 flex items-center gap-4">
              {/* Donut */}
              <div className="relative h-20 w-20 shrink-0">
                <svg viewBox="0 0 40 40" className="h-full w-full -rotate-90">
                  <circle cx="20" cy="20" r="16" fill="none" stroke="currentColor" strokeWidth="5" className="text-slate-200 dark:text-white/10" />
                  {(() => {
                    const total = stats.categoryShare.reduce((s, c) => s + c.count, 0) || 1
                    const C = 2 * Math.PI * 16
                    let off = 0
                    return stats.categoryShare.map((c, i) => {
                      const len = (c.count / total) * C
                      const el = (
                        <circle
                          key={i}
                          cx="20"
                          cy="20"
                          r="16"
                          fill="none"
                          stroke={categoryColors[i % categoryColors.length]}
                          strokeWidth="5"
                          strokeDasharray={`${len} ${C - len}`}
                          strokeDashoffset={-off}
                          strokeLinecap="round"
                          style={{ transition: "stroke-dasharray 700ms ease, stroke-dashoffset 700ms ease" }}
                        />
                      )
                      off += len
                      return el
                    })
                  })()}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <p className="text-sm font-black leading-none text-slate-900 dark:text-white">
                    {stats.categoryShare.reduce((s, c) => s + c.count, 0)}
                  </p>
                  <p className="mt-0.5 text-[8px] font-bold uppercase tracking-wider text-slate-400">
                    byose
                  </p>
                </div>
              </div>

              {/* Legend */}
              <div className="min-w-0 flex-1 space-y-1.5">
                {stats.categoryShare.map((c, i) => (
                  <div key={c.name} className="group flex items-center gap-2">
                    <span
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{ background: categoryColors[i % categoryColors.length] }}
                    />
                    <span className="min-w-0 flex-1 truncate text-[11px] font-bold text-slate-700 dark:text-slate-200">
                      {c.name}
                    </span>
                    <span className="text-[10px] font-black text-slate-500 dark:text-slate-400">
                      {c.pct}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="mt-3 text-xs text-slate-400">Nta makuru arahari</p>
          )}
        </div>

        {/* ───────── FOOTER ───────── */}
        <div className="mt-5 flex items-center justify-between border-t border-slate-200/70 pt-3 dark:border-white/10">
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inset-0 animate-ping rounded-full bg-emerald-500 opacity-75" />
              <span className="relative flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
            </span>
            <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Live
            </span>
            <span className="h-2 w-px bg-slate-300 dark:bg-white/15" />
            <span className="text-[9px] font-medium text-slate-400 dark:text-slate-500">
              {stats.lastUpdated ? `updated ${timeAgo(stats.lastUpdated, nowTick)}` : "loading…"}
            </span>
          </div>
          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
            Auto-update
          </span>
        </div>
      </div>
    </div>
  )
}

/* ──────────────────────────────────────────────────────────────────
   KPI TILE — compact, tinted, sparkline-ready
   ────────────────────────────────────────────────────────────────── */
function KpiTile({
  icon,
  label,
  value,
  tint,
  accent = false,
  loading = false,
  trend,
}: {
  icon: string
  label: string
  value: string
  tint: string
  accent?: boolean
  loading?: boolean
  trend?: string
}) {
  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border p-3 transition-all duration-300 ${
        accent
          ? "border-[#FF5D00]/30 bg-gradient-to-br from-[#FF5D00]/[0.08] to-[#FF5D00]/[0.02] hover:border-[#FF5D00]/50 hover:shadow-[0_8px_24px_-10px_rgba(255,93,0,0.4)]"
          : "border-slate-200/70 bg-white/60 hover:border-slate-300 hover:bg-white dark:border-white/10 dark:bg-white/[0.03] dark:hover:bg-white/[0.06]"
      }`}
    >
      <div
        className="pointer-events-none absolute -right-4 -top-4 h-16 w-16 rounded-full opacity-20 blur-2xl transition-opacity group-hover:opacity-40"
        style={{ background: tint }}
      />

      <div className="relative flex items-center justify-between">
        <span className="text-base leading-none">{icon}</span>
        <span className="h-1.5 w-1.5 rounded-full" style={{ background: tint }} />
      </div>

      <p className="relative mt-2 text-[9px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
        {label}
      </p>

      {loading ? (
        <div className="mt-1 h-5 w-12 animate-pulse rounded bg-slate-200 dark:bg-white/10" />
      ) : (
        <p className="relative mt-0.5 text-lg font-black leading-tight text-slate-900 dark:text-white">
          {value}
        </p>
      )}

      {trend && !loading && (
        <p className="relative mt-0.5 text-[9px] font-bold text-emerald-600 dark:text-emerald-400">
          ↑ {trend}
        </p>
      )}
    </div>
  )
}