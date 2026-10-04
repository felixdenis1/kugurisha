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
}

function StatCard({
  icon,
  label,
  value,
  description,
}: {
  icon: string
  label: string
  value: number
  description: string
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>

          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            {value.toLocaleString()}
          </p>

          <p className="mt-1 text-xs text-slate-400">{description}</p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-xl">
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
}: {
  label: string
  value: number
  total: number
}) {
  const percentage =
    total > 0 ? Math.min(100, Math.round((value / total) * 100)) : 0

  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="font-medium text-slate-700">{label}</span>

        <span className="text-slate-500">
          {value.toLocaleString()}{" "}
          <span className="text-xs">({percentage}%)</span>
        </span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-blue-600 transition-all duration-500"
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
  })

  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState("")

  async function checkAdminAndLoad() {
    try {
      setError("")

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError) {
        throw new Error(`Auth error: ${userError.message}`)
      }

      if (!user) {
        window.location.href = "/login"
        return
      }

      console.log("AUTH USER:", {
        id: user.id,
        email: user.email,
      })

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id, full_name, role, is_active")
        .eq("id", user.id)
        .maybeSingle()

      console.log("ADMIN PROFILE:", profile)
      console.log("PROFILE ERROR:", profileError)

      if (profileError) {
        throw new Error(`Profile error: ${profileError.message}`)
      }

      if (!profile) {
        throw new Error("Nta profile yabonetse kuri uyu mukoresha.")
      }

      if (profile.role !== "admin") {
        throw new Error(
          `Uyu mukoresha ntabwo ari admin. Role iri muri database ni: ${profile.role}`
        )
      }

      if (profile.is_active === false) {
        throw new Error("Iyi admin account yarahagaritswe.")
      }

      await loadStats()
    } catch (err) {
      console.error("ADMIN DASHBOARD ERROR:", err)

      setError(
        err instanceof Error
          ? err.message
          : "Habaye ikibazo mu gufungura Admin Dashboard."
      )
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
    ] = await Promise.all([
      supabase
        .from("profiles")
        .select("id", { count: "exact", head: true }),

      supabase
        .from("listings")
        .select("id", { count: "exact", head: true }),

      supabase
        .from("listings")
        .select("id", { count: "exact", head: true })
        .eq("status", "active"),

      supabase
        .from("listings")
        .select("id", { count: "exact", head: true })
        .eq("status", "paused"),

      supabase
        .from("listings")
        .select("id", { count: "exact", head: true })
        .eq("status", "sold"),

      supabase
        .from("reports")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending"),

      supabase
        .from("conversations")
        .select("id", { count: "exact", head: true }),
    ])

    const results = [
      {
        name: "Users",
        result: usersResult,
      },
      {
        name: "Listings",
        result: listingsResult,
      },
      {
        name: "Active listings",
        result: activeListingsResult,
      },
      {
        name: "Paused listings",
        result: pausedListingsResult,
      },
      {
        name: "Sold listings",
        result: soldListingsResult,
      },
      {
        name: "Pending reports",
        result: pendingReportsResult,
      },
      {
        name: "Conversations",
        result: conversationsResult,
      },
    ]

    const failed = results.find((item) => item.result.error)

    if (failed?.result.error) {
      console.error(
        `ADMIN STATS ERROR [${failed.name}]:`,
        failed.result.error
      )

      throw new Error(
        `${failed.name}: ${failed.result.error.message}`
      )
    }

    setStats({
      users: usersResult.count ?? 0,
      listings: listingsResult.count ?? 0,
      activeListings: activeListingsResult.count ?? 0,
      pausedListings: pausedListingsResult.count ?? 0,
      soldListings: soldListingsResult.count ?? 0,
      pendingReports: pendingReportsResult.count ?? 0,
      conversations: conversationsResult.count ?? 0,
    })
  }

  async function handleRefresh() {
    setRefreshing(true)

    try {
      setError("")
      await loadStats()
    } catch (err) {
      console.error("REFRESH ERROR:", err)

      setError(
        err instanceof Error
          ? err.message
          : "Stats ntizashoboye kuvugururwa."
      )
    } finally {
      setRefreshing(false)
    }
  }

  useEffect(() => {
    checkAdminAndLoad()
  }, [])

  const listingStatusTotal =
    stats.activeListings +
    stats.pausedListings +
    stats.soldListings

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="flex min-h-screen">
          <aside className="hidden w-64 border-r border-slate-200 bg-white p-5 lg:block">
            <div className="h-8 w-40 animate-pulse rounded-lg bg-slate-200" />

            <div className="mt-10 space-y-3">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div
                  key={item}
                  className="h-10 animate-pulse rounded-xl bg-slate-100"
                />
              ))}
            </div>
          </aside>

          <main className="flex-1 p-5 sm:p-8">
            <div className="h-10 w-72 animate-pulse rounded-lg bg-slate-200" />

            <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="h-32 animate-pulse rounded-2xl bg-white shadow-sm"
                />
              ))}
            </div>

            <div className="mt-6 grid gap-6 xl:grid-cols-3">
              {[1, 2].map((item) => (
                <div
                  key={item}
                  className="h-72 animate-pulse rounded-2xl bg-white shadow-sm"
                />
              ))}
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen">
        {/* SIDEBAR */}
        <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white lg:flex lg:flex-col">
          <div className="border-b border-slate-100 px-6 py-5">
            <Link to="/" className="block">
              <div className="text-xl font-black tracking-tight text-blue-600">
                KUGURISHA.COM
              </div>

              <div className="mt-1 text-xs font-medium text-slate-400">
                Admin Control Center
              </div>
            </Link>
          </div>

          <nav className="flex-1 space-y-1 px-3 py-5">
            <Link
              to="/admin"
              className="flex items-center gap-3 rounded-xl bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700"
            >
              <span>📊</span>
              <span>Overview</span>
            </Link>

            <div className="mt-5 px-4 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Management
            </div>

            <div className="space-y-1">
              <Link
                to="/admin/users"
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
              >
                <span>👥</span>
                <span>Users</span>
              </Link>

              <Link
                to="/admin/listings"
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
              >
                <span>🏷️</span>
                <span>Listings</span>
              </Link>

              <Link
                to="/admin/categories"
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
              >
                <span>📂</span>
                <span>Categories</span>
              </Link>

              <Link
                to="/admin/reports"
                className="flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
              >
                <span className="flex items-center gap-3">
                  <span>🚩</span>
                  <span>Reports</span>
                </span>

                {stats.pendingReports > 0 && (
                  <span className="rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-bold text-red-600">
                    {stats.pendingReports}
                  </span>
                )}
              </Link>

              <button
                type="button"
                disabled
                className="flex w-full cursor-not-allowed items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-slate-400"
              >
                <span>💬</span>
                <span>Conversations</span>
              </button>

              <button
                type="button"
                disabled
                className="flex w-full cursor-not-allowed items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-slate-400"
              >
                <span>🔔</span>
                <span>Notifications</span>
              </button>
            </div>

            <div className="mt-5 px-4 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Insights
            </div>

            <div className="space-y-1">
              <button
                type="button"
                disabled
                className="flex w-full cursor-not-allowed items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-slate-400"
              >
                <span>📈</span>
                <span>Analytics</span>
              </button>

              <button
                type="button"
                disabled
                className="flex w-full cursor-not-allowed items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-slate-400"
              >
                <span>🧾</span>
                <span>Activity Log</span>
              </button>
            </div>
          </nav>

          <div className="border-t border-slate-100 p-4">
            <Link
              to="/"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
            >
              <span>←</span>
              <span>Subira kuri marketplace</span>
            </Link>
          </div>
        </aside>

        {/* MAIN */}
        <main className="min-w-0 flex-1">
          {/* HEADER */}
          <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
            <div className="flex items-center justify-between gap-4 px-5 py-4 sm:px-8">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                  Admin Center
                </p>

                <h1 className="mt-1 text-xl font-bold tracking-tight sm:text-2xl">
                  Overview
                </h1>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span>{refreshing ? "⟳" : "↻"}</span>

                  <span className="hidden sm:inline">
                    {refreshing ? "Biravugurura..." : "Refresh"}
                  </span>
                </button>

                <Link
                  to="/"
                  className="hidden rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 sm:inline-flex"
                >
                  Marketplace
                </Link>
              </div>
            </div>
          </header>

          <div className="mx-auto max-w-[1500px] p-5 sm:p-8">
            {/* ERROR */}
            {error && (
              <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <span className="text-lg">⚠️</span>

                    <div>
                      <p className="font-bold">
                        Habaye ikibazo
                      </p>

                      <p className="mt-1 break-words">
                        {error}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleRefresh}
                    className="shrink-0 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-red-700 shadow-sm transition hover:bg-red-100"
                  >
                    Ongera
                  </button>
                </div>
              </div>
            )}

            {/* PAGE INTRO */}
            <section className="mb-7">
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Murakaza neza muri Admin Center 👋
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Reba uko marketplace ihagaze, ibikorwa by’abakoresha,
                listings n’ibikeneye moderation.
              </p>
            </section>

            {/* TOP STATS */}
            <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                icon="👥"
                label="Users"
                value={stats.users}
                description="Abakoresha bose"
              />

              <StatCard
                icon="🏷️"
                label="Listings"
                value={stats.listings}
                description="Amatangazo yose"
              />

              <StatCard
                icon="💬"
                label="Conversations"
                value={stats.conversations}
                description="Conversations zose"
              />

              <StatCard
                icon="🚩"
                label="Pending Reports"
                value={stats.pendingReports}
                description="Reports zitegereje action"
              />
            </section>

            {/* OVERVIEW GRID */}
            <section className="mt-6 grid gap-6 xl:grid-cols-3">
              {/* LISTINGS */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold">
                      Listings Overview
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      Uko listings zihagaze muri system.
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-500">
                    {stats.listings.toLocaleString()} total
                  </div>
                </div>

                <div className="mt-7 space-y-6">
                  <StatusBar
                    label="Active"
                    value={stats.activeListings}
                    total={listingStatusTotal}
                  />

                  <StatusBar
                    label="Paused"
                    value={stats.pausedListings}
                    total={listingStatusTotal}
                  />

                  <StatusBar
                    label="Sold"
                    value={stats.soldListings}
                    total={listingStatusTotal}
                  />
                </div>

                <div className="mt-7 grid grid-cols-3 gap-3">
                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs text-slate-500">
                      Active
                    </p>

                    <p className="mt-1 text-xl font-bold text-slate-900">
                      {stats.activeListings.toLocaleString()}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs text-slate-500">
                      Paused
                    </p>

                    <p className="mt-1 text-xl font-bold text-slate-900">
                      {stats.pausedListings.toLocaleString()}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs text-slate-500">
                      Sold
                    </p>

                    <p className="mt-1 text-xl font-bold text-slate-900">
                      {stats.soldListings.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* MODERATION */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold">
                      Moderation
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      Ibikorwa bisaba attention.
                    </p>
                  </div>

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-lg">
                    🚩
                  </div>
                </div>

                <div className="mt-7 rounded-2xl border border-slate-100 bg-slate-50 p-5">
                  <p className="text-sm font-medium text-slate-500">
                    Pending reports
                  </p>

                  <p className="mt-2 text-4xl font-black tracking-tight text-slate-900">
                    {stats.pendingReports.toLocaleString()}
                  </p>

                  <p className="mt-2 text-xs leading-5 text-slate-500">
                    Reports zitarafatwaho action.
                  </p>
                </div>

                <Link
                  to="/admin/reports"
                  className="mt-5 flex w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
                >
                  Genda kuri Reports
                  <span className="ml-2">→</span>
                </Link>
              </div>
            </section>

            {/* QUICK ACTIONS */}
            <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div>
                <h3 className="text-lg font-bold">
                  Quick Actions
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Ahantu h’ingenzi ushobora kujya uhita ugenzura.
                </p>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Link
                  to="/admin/users"
                  className="group rounded-xl border border-slate-200 p-4 transition hover:border-blue-200 hover:bg-blue-50/50"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
                        👥
                      </div>

                      <div>
                        <p className="text-sm font-bold text-slate-900">
                          Manage Users
                        </p>

                        <p className="mt-0.5 text-xs text-slate-500">
                          Reba abakoresha
                        </p>
                      </div>
                    </div>

                    <span className="text-slate-400 transition group-hover:translate-x-1">
                      →
                    </span>
                  </div>
                </Link>

                <Link
                  to="/admin/listings"
                  className="group rounded-xl border border-slate-200 p-4 transition hover:border-blue-200 hover:bg-blue-50/50"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
                        🏷️
                      </div>

                      <div>
                        <p className="text-sm font-bold text-slate-900">
                          Manage Listings
                        </p>

                        <p className="mt-0.5 text-xs text-slate-500">
                          Genzura listings
                        </p>
                      </div>
                    </div>

                    <span className="text-slate-400 transition group-hover:translate-x-1">
                      →
                    </span>
                  </div>
                </Link>

                <Link
                  to="/admin/categories"
                  className="group rounded-xl border border-slate-200 p-4 transition hover:border-blue-200 hover:bg-blue-50/50"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
                        📂
                      </div>

                      <div>
                        <p className="text-sm font-bold text-slate-900">
                          Categories
                        </p>

                        <p className="mt-0.5 text-xs text-slate-500">
                          Cunga categories
                        </p>
                      </div>
                    </div>

                    <span className="text-slate-400 transition group-hover:translate-x-1">
                      →
                    </span>
                  </div>
                </Link>

                <Link
                  to="/admin/reports"
                  className="group rounded-xl border border-slate-200 p-4 transition hover:border-blue-200 hover:bg-blue-50/50"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50"
                      >
                        🚩
                      </div>

                      <div>
                        <p className="text-sm font-bold text-slate-900">
                          Manage Reports
                        </p>

                        <p className="mt-0.5 text-xs text-slate-500">
                          Reba kandi ucunge reports
                        </p>
                      </div>
                    </div>

                    <span className="text-slate-400 transition group-hover:translate-x-1">
                      →
                    </span>
                  </div>
                </Link>
              </div>
            </section>

            {/* FOOTER */}
            <footer className="mt-8 pb-4 text-center text-xs text-slate-400">
              KUGURISHA.COM · Admin Control Center
            </footer>
          </div>
        </main>
      </div>
    </div>
  )
}