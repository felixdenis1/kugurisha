import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { supabase } from "../services/supabase"

type Stats = {
  users: number
  listings: number
  activeListings: number
  pausedListings: number
  soldListings: number
  pendingReports: number
  conversations: number
  websiteViews: number
}

function StatCard({
  icon,
  label,
  value,
  description,
  alert = false,
  gradient = "from-slate-100 to-slate-200",
}: {
  icon: string
  label: string
  value: number
  description: string
  alert?: boolean
  gradient?: string
}) {
  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border bg-white/80 p-5 shadow-sm backdrop-blur-sm transition-all hover:-translate-y-1 hover:shadow-md dark:bg-[#0f1716]/80 ${
        alert && value > 0
          ? "border-rose-200 dark:border-rose-500/30"
          : "border-slate-200/80 dark:border-white/10"
      }`}
    >
      {alert && value > 0 && (
        <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-rose-500/10 blur-xl" />
      )}

      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {label}
          </p>
          <p
            className={`mt-2 text-3xl font-black tracking-tight ${
              alert && value > 0
                ? "text-rose-600 dark:text-rose-400"
                : "text-slate-900 dark:text-white"
            }`}
          >
            {value.toLocaleString()}
          </p>
          <p className="mt-1 truncate text-[11px] font-medium text-slate-400">{description}</p>
        </div>
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} text-xl shadow-sm ring-1 ring-white/50 dark:ring-white/10`}
        >
          {icon}
        </div>
      </div>
    </div>
  )
}

function StatusBar({
  label,
  value,
  total,
  color,
}: {
  label: string
  value: number
  total: number
  color: string
}) {
  const percentage = total > 0 ? Math.min(100, Math.round((value / total) * 100)) : 0

  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="font-bold text-slate-700 dark:text-slate-300">{label}</span>
        <span className="font-black text-slate-900 dark:text-white">
          {value.toLocaleString()}{" "}
          <span className="text-xs font-bold text-slate-400">({percentage}%)</span>
        </span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
        <div
          className={`h-full rounded-full ${color} transition-all duration-1000 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    users: 0,
    listings: 0,
    activeListings: 0,
    pausedListings: 0,
    soldListings: 0,
    pendingReports: 0,
    conversations: 0,
    websiteViews: 0,
  })

  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    checkAdminAndLoad()
  }, [])

  async function checkAdminAndLoad() {
    try {
      setError("")
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError) throw new Error(`Auth error: ${userError.message}`)
      if (!user) {
        window.location.href = "/login"
        return
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id, full_name, role, is_active")
        .eq("id", user.id)
        .maybeSingle()

      if (profileError) throw new Error(`Profile error: ${profileError.message}`)
      if (!profile) throw new Error("Nta profile yabonetse kuri uyu mukoresha.")
      if (profile.role !== "admin")
        throw new Error(`Uyu mukoresha ntabwo ari admin. Role: ${profile.role}`)
      if (profile.is_active === false) throw new Error("Iyi admin account yarahagaritswe.")

      await loadStats()
    } catch (err) {
      console.error("ADMIN DASHBOARD ERROR:", err)
      setError(err instanceof Error ? err.message : "Habaye ikibazo mu gufungura Admin Dashboard.")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  async function loadStats() {
    const [
      usersResult,
      listingsResult,
      activeListingsResult,
      pausedListingsResult,
      soldListingsResult,
      pendingReportsResult,
      conversationsResult,
      pageViewsResult,
    ] = await Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase.from("listings").select("id", { count: "exact", head: true }),
      supabase.from("listings").select("id", { count: "exact", head: true }).eq("status", "active"),
      supabase.from("listings").select("id", { count: "exact", head: true }).eq("status", "paused"),
      supabase.from("listings").select("id", { count: "exact", head: true }).eq("status", "sold"),
      supabase.from("reports").select("id", { count: "exact", head: true }).eq("status", "pending"),
      supabase.from("conversations").select("id", { count: "exact", head: true }),
      // Website views — reads from page_views. If your table differs, change the name here.
      supabase.from("page_views").select("id", { count: "exact", head: true }),
    ])

    const results = [
      { name: "Users", result: usersResult },
      { name: "Listings", result: listingsResult },
      { name: "Active listings", result: activeListingsResult },
      { name: "Paused listings", result: pausedListingsResult },
      { name: "Sold listings", result: soldListingsResult },
      { name: "Pending reports", result: pendingReportsResult },
      { name: "Conversations", result: conversationsResult },
    ]

    const failed = results.find((item) => item.result.error)
    if (failed?.result.error) {
      throw new Error(`${failed.name}: ${failed.result.error.message}`)
    }

    // Page views — fail silently if table doesn't exist
    const websiteViews = !pageViewsResult.error ? pageViewsResult.count ?? 0 : 0
    if (pageViewsResult.error) {
      console.warn("page_views table missing — defaulting to 0", pageViewsResult.error.message)
    }

    setStats({
      users: usersResult.count ?? 0,
      listings: listingsResult.count ?? 0,
      activeListings: activeListingsResult.count ?? 0,
      pausedListings: pausedListingsResult.count ?? 0,
      soldListings: soldListingsResult.count ?? 0,
      pendingReports: pendingReportsResult.count ?? 0,
      conversations: conversationsResult.count ?? 0,
      websiteViews,
    })
  }

  async function handleRefresh() {
    setRefreshing(true)
    try {
      setError("")
      await loadStats()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Stats ntizashoboye kuvugururwa.")
    } finally {
      setRefreshing(false)
    }
  }

  const listingStatusTotal = stats.activeListings + stats.pausedListings + stats.soldListings

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-72 animate-pulse rounded-lg bg-slate-200 dark:bg-white/10" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {[1, 2, 3, 4, 5].map((item) => (
            <div key={item} className="h-32 animate-pulse rounded-2xl bg-white dark:bg-white/5" />
          ))}
        </div>
        <div className="grid gap-6 xl:grid-cols-3">
          <div className="h-72 animate-pulse rounded-2xl bg-white dark:bg-white/5 xl:col-span-2" />
          <div className="h-72 animate-pulse rounded-2xl bg-white dark:bg-white/5" />
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[1500px] space-y-6">
      {/* HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Murakaza neza muri Admin Center 👋
          </h1>
          <p className="mt-2 max-w-2xl text-sm font-medium text-slate-500 dark:text-slate-400">
            Reba uko marketplace ihagaze, ibikorwa by'abakoresha, listings n'ibikeneye moderation.
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
        >
          <svg
            className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
            />
          </svg>
          {refreshing ? "Biravugurura..." : "Refresh Data"}
        </button>
      </div>

      {/* ERROR BANNER */}
      {error && (
        <div className="flex items-start justify-between gap-4 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-400">
          <div className="flex items-start gap-3">
            <svg className="mt-0.5 h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            <div>
              <p className="font-bold">Habaye ikibazo</p>
              <p className="mt-1 break-words">{error}</p>
            </div>
          </div>
          <button
            onClick={handleRefresh}
            className="shrink-0 rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-rose-700 shadow-sm transition hover:bg-rose-100 dark:bg-rose-500/20 dark:text-rose-300"
          >
            Ongera
          </button>
        </div>
      )}

      {/* TOP STATS GRID — 5 cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <StatCard
          icon="👥"
          label="Users"
          value={stats.users}
          description="Abakoresha bose"
          gradient="from-blue-100 to-indigo-200"
        />
        <StatCard
          icon="🏷️"
          label="Listings"
          value={stats.listings}
          description="Amatangazo yose"
          gradient="from-emerald-100 to-teal-200"
        />
        <StatCard
          icon="💬"
          label="Conversations"
          value={stats.conversations}
          description="Ibiganiro byose"
          gradient="from-purple-100 to-fuchsia-200"
        />
        <StatCard
          icon="🚩"
          label="Pending Reports"
          value={stats.pendingReports}
          description="Zitegereje action"
          alert
          gradient="from-rose-100 to-red-200"
        />
        <StatCard
          icon="👁"
          label="Website Views"
          value={stats.websiteViews}
          description="Abasuye urubuga"
          gradient="from-orange-100 to-amber-200"
        />
      </div>

      {/* MIDDLE GRID */}
      <div className="grid gap-5 xl:grid-cols-3">
        {/* LISTINGS OVERVIEW */}
        <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-6 shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-[#0f1716]/80 xl:col-span-2">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">Listings Overview</h3>
              <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">
                Uko listings zihagaze muri system ubu.
              </p>
            </div>
            <div className="rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-black text-slate-600 dark:bg-white/10 dark:text-slate-300">
              {stats.listings.toLocaleString()} total
            </div>
          </div>

          <div className="mt-8 space-y-6">
            <StatusBar label="Active" value={stats.activeListings} total={listingStatusTotal} color="bg-[#10b981]" />
            <StatusBar label="Paused" value={stats.pausedListings} total={listingStatusTotal} color="bg-[#f59e0b]" />
            <StatusBar label="Sold" value={stats.soldListings} total={listingStatusTotal} color="bg-[#475569]" />
          </div>

          <div className="mt-8 grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-white/5 dark:bg-white/[0.02]">
              <p className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Active
              </p>
              <p className="mt-1 text-2xl font-black text-slate-900 dark:text-white">
                {stats.activeListings.toLocaleString()}
              </p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-white/5 dark:bg-white/[0.02]">
              <p className="text-[10px] font-black uppercase tracking-wider text-amber-500">Paused</p>
              <p className="mt-1 text-2xl font-black text-slate-900 dark:text-white">
                {stats.pausedListings.toLocaleString()}
              </p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-white/5 dark:bg-white/[0.02]">
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">Sold</p>
              <p className="mt-1 text-2xl font-black text-slate-900 dark:text-white">
                {stats.soldListings.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* MODERATION */}
        <div
          className={`rounded-2xl border p-6 shadow-sm backdrop-blur-sm ${
            stats.pendingReports > 0
              ? "border-rose-200 bg-rose-50/50 dark:border-rose-500/30 dark:bg-rose-500/5"
              : "border-slate-200/80 bg-white/80 dark:border-white/10 dark:bg-[#0f1716]/80"
          }`}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">Moderation</h3>
              <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">
                Ibikorwa bisaba attention.
              </p>
            </div>
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                stats.pendingReports > 0
                  ? "bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400"
                  : "bg-slate-100 text-slate-400 dark:bg-white/5 dark:text-slate-500"
              }`}
            >
              🚩
            </div>
          </div>

          <div
            className={`mt-6 rounded-2xl border p-5 ${
              stats.pendingReports > 0
                ? "border-rose-100 bg-white dark:border-rose-500/20 dark:bg-[#0f1716]"
                : "border-slate-100 bg-slate-50 dark:border-white/5 dark:bg-white/[0.02]"
            }`}
          >
            <p className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Pending Reports
            </p>
            <p
              className={`mt-2 text-4xl font-black tracking-tight ${
                stats.pendingReports > 0
                  ? "text-rose-600 dark:text-rose-400"
                  : "text-slate-900 dark:text-white"
              }`}
            >
              {stats.pendingReports.toLocaleString()}
            </p>
            <p className="mt-2 text-[11px] font-medium leading-5 text-slate-500">
              {stats.pendingReports > 0
                ? "Hari reports zitegereje gufatirwa icyemezo."
                : "Nta kibazo kirimo. Byose birimo gukora neza."}
            </p>
          </div>

          <Link
            to="/admin/reports"
            className={`mt-5 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-black transition ${
              stats.pendingReports > 0
                ? "bg-rose-600 text-white hover:bg-rose-700"
                : "bg-[#475569] text-white hover:bg-[#334155] dark:bg-[#10b981] dark:hover:bg-[#059669]"
            }`}
          >
            Genda kuri Reports
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>
      </div>

      {/* QUICK ACTIONS */}
      <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-6 shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-[#0f1716]/80">
        <div>
          <h3 className="text-lg font-black text-slate-900 dark:text-white">Quick Actions</h3>
          <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">
            Ahantu h'ingenzi ushobora kujya uhita ugenzura.
          </p>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            to="/admin/users"
            className="group flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 transition-all hover:-translate-y-1 hover:border-[#10b981]/40 hover:shadow-md dark:border-white/10 dark:bg-white/5"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-xl dark:bg-blue-500/20">
              👥
            </div>
            <div className="mt-4">
              <p className="text-sm font-black text-slate-900 dark:text-white">Manage Users</p>
              <p className="mt-0.5 text-xs font-medium text-slate-500">Reba no guhindura roles</p>
            </div>
          </Link>

          <Link
            to="/admin/listings"
            className="group flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 transition-all hover:-translate-y-1 hover:border-[#10b981]/40 hover:shadow-md dark:border-white/10 dark:bg-white/5"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-xl dark:bg-emerald-500/20">
              🏷️
            </div>
            <div className="mt-4">
              <p className="text-sm font-black text-slate-900 dark:text-white">Manage Listings</p>
              <p className="mt-0.5 text-xs font-medium text-slate-500">Genzura amatangazo yose</p>
            </div>
          </Link>

          <Link
            to="/admin/categories"
            className="group flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 transition-all hover:-translate-y-1 hover:border-[#10b981]/40 hover:shadow-md dark:border-white/10 dark:bg-white/5"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-xl dark:bg-amber-500/20">
              📂
            </div>
            <div className="mt-4">
              <p className="text-sm font-black text-slate-900 dark:text-white">Categories</p>
              <p className="mt-0.5 text-xs font-medium text-slate-500">Cunga ibyiciro by'isoko</p>
            </div>
          </Link>

          <Link
            to="/admin/reports"
            className="group flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 transition-all hover:-translate-y-1 hover:border-rose-500/40 hover:shadow-md dark:border-white/10 dark:bg-white/5"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-xl dark:bg-rose-500/20">
              🚩
            </div>
            <div className="mt-4">
              <p className="text-sm font-black text-slate-900 dark:text-white">Manage Reports</p>
              <p className="mt-0.5 text-xs font-medium text-slate-500">Reba ibibazo by'abakoresha</p>
            </div>
          </Link>
        </div>
      </div>

      <footer className="pb-4 text-center text-[10px] font-bold uppercase tracking-wider text-slate-400">
        KUGURISHA.COM · Admin Control Center
      </footer>
    </div>
  )
}