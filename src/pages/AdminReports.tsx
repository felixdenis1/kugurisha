import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { supabase } from "../services/supabase"

type Report = {
  id: string
  reporter_id: string
  listing_id: string | null
  reported_user_id: string | null
  reason: string
  description: string | null
  status: string
  created_at: string
  updated_at: string
}

type Profile = {
  id: string
  full_name: string | null
}

type Listing = {
  id: string
  title: string
}

function AdminReports() {
  const navigate = useNavigate()

  const [reports, setReports] = useState<Report[]>([])
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [filter, setFilter] = useState("all")

  useEffect(() => {
    checkAdminAndLoad()
  }, [])

  async function checkAdminAndLoad() {
    setLoading(true)
    setError("")

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      navigate("/login")
      return
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    if (profileError || profile?.role !== "admin") {
      setError("Ntufite uburenganzira bwo kubona iyi page.")
      setLoading(false)
      return
    }

    const { data: reportData, error: reportError } = await supabase
      .from("reports")
      .select("*")
      .order("created_at", { ascending: false })

    if (reportError) {
      console.error(reportError)
      setError("Reports ntizashoboye gufunguka.")
      setLoading(false)
      return
    }

    const reportList = reportData || []

    setReports(reportList)

    const userIds = Array.from(
      new Set(
        reportList.flatMap((report) =>
          [report.reporter_id, report.reported_user_id].filter(Boolean)
        )
      )
    )

    const listingIds = Array.from(
      new Set(
        reportList
          .map((report) => report.listing_id)
          .filter(Boolean)
      )
    )

    if (userIds.length > 0) {
      const { data } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", userIds)

      setProfiles(data || [])
    } else {
      setProfiles([])
    }

    if (listingIds.length > 0) {
      const { data } = await supabase
        .from("listings")
        .select("id, title")
        .in("id", listingIds)

      setListings(data || [])
    } else {
      setListings([])
    }

    setLoading(false)
  }

  async function updateStatus(reportId: string, status: string) {
    const { error } = await supabase
      .from("reports")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", reportId)

    if (error) {
      console.error(error)
      alert("Status ntiyahindutse.")
      return
    }

    setReports((current) =>
      current.map((report) =>
        report.id === reportId
          ? {
              ...report,
              status,
              updated_at: new Date().toISOString(),
            }
          : report
      )
    )
  }

  async function pauseListing(report: Report) {
    if (!report.listing_id) return

    const confirmed = window.confirm(
      "Urashaka guhagarika iyi listing? Ntabwo izongera kugaragara nk'active."
    )

    if (!confirmed) return

    const { error: listingError } = await supabase
      .from("listings")
      .update({
        status: "paused",
        updated_at: new Date().toISOString(),
      })
      .eq("id", report.listing_id)

    if (listingError) {
      console.error(listingError)
      alert("Listing ntiyahagaritswe.")
      return
    }

    const { error: reportError } = await supabase
      .from("reports")
      .update({
        status: "resolved",
        updated_at: new Date().toISOString(),
      })
      .eq("id", report.id)

    if (reportError) {
      console.error(reportError)
      alert(
        "Listing yahagaritswe, ariko report status ntiyahindutse."
      )
      return
    }

    setReports((current) =>
      current.map((item) =>
        item.id === report.id
          ? {
              ...item,
              status: "resolved",
              updated_at: new Date().toISOString(),
            }
          : item
      )
    )

    alert("✅ Listing yahagaritswe kandi report yakemuwe.")
  }

  function getProfileName(id: string | null) {
    if (!id) return "Ntabonetse"

    const profile = profiles.find((item) => item.id === id)

    return profile?.full_name || "Umukoresha"
  }

  function getListingTitle(id: string | null) {
    if (!id) return "Nta listing"

    const listing = listings.find((item) => item.id === id)

    return listing?.title || "Listing itabashije kuboneka"
  }

  function formatReason(reason: string) {
    const reasons: Record<string, string> = {
      scam: "Scam / Uburiganya",
      illegal: "Igicuruzwa kitemewe",
      false_information: "Amakuru atari yo",
      duplicate: "Duplicate listing",
      other: "Ibindi",
    }

    return reasons[reason] || reason
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleString("rw-RW", {
      dateStyle: "medium",
      timeStyle: "short",
    })
  }

  function statusLabel(status: string) {
    const labels: Record<string, string> = {
      pending: "Itegereje",
      reviewed: "Yagenzuwe",
      resolved: "Yakemuwe",
    }

    return labels[status] || status
  }

  function statusClasses(status: string) {
    if (status === "pending") {
      return "bg-amber-50 text-amber-700 border-amber-200"
    }

    if (status === "reviewed") {
      return "bg-blue-50 text-blue-700 border-blue-200"
    }

    return "bg-emerald-50 text-emerald-700 border-emerald-200"
  }

  const filteredReports = reports.filter((report) => {
    if (filter === "all") return true
    return report.status === filter
  })

  const pendingCount = reports.filter(
    (report) => report.status === "pending"
  ).length

  const reviewedCount = reports.filter(
    (report) => report.status === "reviewed"
  ).length

  const resolvedCount = reports.filter(
    (report) => report.status === "resolved"
  ).length

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
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
            >
              <span>📊</span>
              Overview
            </Link>

            <div className="mt-5 px-4 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Management
            </div>

            <button
              type="button"
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              <span>👥</span>
              Users
            </button>

            <button
              type="button"
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              <span>🏷️</span>
              Listings
            </button>

            <button
              type="button"
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              <span>📂</span>
              Categories
            </button>

            <Link
              to="/admin/reports"
              className="flex items-center justify-between rounded-xl bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700"
            >
              <span className="flex items-center gap-3">
                <span>🚩</span>
                Reports
              </span>

              {pendingCount > 0 && (
                <span className="rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-bold text-red-600">
                  {pendingCount}
                </span>
              )}
            </Link>

            <button
              type="button"
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              <span>💬</span>
              Conversations
            </button>

            <button
              type="button"
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              <span>🔔</span>
              Notifications
            </button>

            <div className="mt-5 px-4 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Insights
            </div>

            <button
              type="button"
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              <span>📈</span>
              Analytics
            </button>

            <button
              type="button"
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              <span>🧾</span>
              Activity Log
            </button>
          </nav>

          <div className="border-t border-slate-100 p-4">
            <Link
              to="/"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              ← Subira kuri marketplace
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

                <h1 className="mt-1 text-xl font-bold sm:text-2xl">
                  Moderation Center
                </h1>
              </div>

              <Link
                to="/admin"
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
              >
                ← Overview
              </Link>
            </div>
          </header>

          <div className="mx-auto max-w-[1400px] p-5 sm:p-8">
            {/* INTRO */}
            <div className="mb-7">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-2xl">
                  🚩
                </div>

                <div>
                  <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                    Reports
                  </h2>

                  <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
                    Reba reports z’abakoresha kandi ucunge ibikeneye
                    kugenzurwa kuri marketplace.
                  </p>
                </div>
              </div>
            </div>

            {/* STATS */}
            {!loading && !error && (
              <div className="grid gap-4 sm:grid-cols-3">
                <button
                  onClick={() => setFilter("pending")}
                  className={`rounded-2xl border bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
                    filter === "pending"
                      ? "border-amber-300 ring-2 ring-amber-100"
                      : "border-slate-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-500">
                      Pending
                    </p>

                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50">
                      ⏳
                    </span>
                  </div>

                  <p className="mt-4 text-3xl font-black text-slate-900">
                    {pendingCount}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Zitegereje action
                  </p>
                </button>

                <button
                  onClick={() => setFilter("reviewed")}
                  className={`rounded-2xl border bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
                    filter === "reviewed"
                      ? "border-blue-300 ring-2 ring-blue-100"
                      : "border-slate-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-500">
                      Reviewed
                    </p>

                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50">
                      🔎
                    </span>
                  </div>

                  <p className="mt-4 text-3xl font-black text-slate-900">
                    {reviewedCount}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Zagenzuwe
                  </p>
                </button>

                <button
                  onClick={() => setFilter("resolved")}
                  className={`rounded-2xl border bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
                    filter === "resolved"
                      ? "border-emerald-300 ring-2 ring-emerald-100"
                      : "border-slate-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-500">
                      Resolved
                    </p>

                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50">
                      ✓
                    </span>
                  </div>

                  <p className="mt-4 text-3xl font-black text-slate-900">
                    {resolvedCount}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Zarakemuwe
                  </p>
                </button>
              </div>
            )}

            {/* FILTERS */}
            {!loading && !error && (
              <div className="mt-6 flex flex-wrap items-center gap-2">
                <span className="mr-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                  Filter:
                </span>

                {["all", "pending", "reviewed", "resolved"].map(
                  (status) => (
                    <button
                      key={status}
                      onClick={() => setFilter(status)}
                      className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                        filter === status
                          ? "bg-slate-900 text-white shadow-sm"
                          : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {status === "all"
                        ? "Zose"
                        : statusLabel(status)}
                    </button>
                  )
                )}
              </div>
            )}

            {/* CONTENT */}
            <div className="mt-6">
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((item) => (
                    <div
                      key={item}
                      className="animate-pulse rounded-2xl border border-slate-200 bg-white p-6"
                    >
                      <div className="flex gap-4">
                        <div className="h-11 w-11 rounded-xl bg-slate-100" />

                        <div className="flex-1">
                          <div className="h-4 w-40 rounded bg-slate-100" />
                          <div className="mt-4 h-5 w-72 rounded bg-slate-100" />
                          <div className="mt-3 h-4 w-full max-w-xl rounded bg-slate-100" />

                          <div className="mt-6 h-10 w-48 rounded bg-slate-100" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : error ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
                  <div className="flex items-start gap-4">
                    <span className="text-2xl">⚠️</span>

                    <div>
                      <h2 className="font-bold text-red-800">
                        Habaye ikibazo
                      </h2>

                      <p className="mt-1 text-sm text-red-700">
                        {error}
                      </p>
                    </div>
                  </div>
                </div>
              ) : filteredReports.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-3xl">
                    ✓
                  </div>

                  <h2 className="mt-5 text-lg font-bold text-slate-900">
                    Nta reports zihari
                  </h2>

                  <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                    Nta report ihuye na filter wahisemo cyangwa nta report
                    iraboneka.
                  </p>

                  {filter !== "all" && (
                    <button
                      onClick={() => setFilter("all")}
                      className="mt-5 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
                    >
                      Reba reports zose
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredReports.map((report) => (
                    <div
                      key={report.id}
                      className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
                    >
                      <div className="p-5 sm:p-6">
                        {/* REPORT HEADER */}
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700">
                                🚩 {formatReason(report.reason)}
                              </span>

                              <span
                                className={`rounded-full border px-3 py-1.5 text-xs font-bold ${statusClasses(
                                  report.status
                                )}`}
                              >
                                {statusLabel(report.status)}
                              </span>
                            </div>

                            <h2 className="mt-4 truncate text-lg font-bold text-slate-900 sm:text-xl">
                              {getListingTitle(report.listing_id)}
                            </h2>
                          </div>

                          <div className="shrink-0 text-xs text-slate-400">
                            {formatDate(report.created_at)}
                          </div>
                        </div>

                        {/* DESCRIPTION */}
                        {report.description && (
                          <div className="mt-4 rounded-xl bg-slate-50 p-4">
                            <p className="text-sm leading-6 text-slate-600">
                              {report.description}
                            </p>
                          </div>
                        )}

                        {/* PEOPLE */}
                        <div className="mt-5 grid gap-3 sm:grid-cols-2">
                          <div className="rounded-xl border border-slate-100 p-4">
                            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                              Reporter
                            </p>

                            <div className="mt-3 flex items-center gap-3">
                              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-sm">
                                👤
                              </div>

                              <p className="text-sm font-semibold text-slate-900">
                                {getProfileName(report.reporter_id)}
                              </p>
                            </div>
                          </div>

                          <div className="rounded-xl border border-slate-100 p-4">
                            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                              Reported user
                            </p>

                            <div className="mt-3 flex items-center gap-3">
                              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-sm">
                                👤
                              </div>

                              <p className="text-sm font-semibold text-slate-900">
                                {getProfileName(
                                  report.reported_user_id
                                )}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* ACTIONS */}
                        <div className="mt-6 flex flex-col gap-2 border-t border-slate-100 pt-5 sm:flex-row sm:flex-wrap">
                          {report.listing_id && (
                            <button
                              onClick={() =>
                                navigate(
                                  `/listing/${report.listing_id}`
                                )
                              }
                              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                            >
                              Reba listing →
                            </button>
                          )}

                          {report.status === "pending" && (
                            <button
                              onClick={() =>
                                updateStatus(
                                  report.id,
                                  "reviewed"
                                )
                              }
                              className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-700"
                            >
                              Mark reviewed
                            </button>
                          )}

                          {report.status !== "resolved" && (
                            <button
                              onClick={() =>
                                updateStatus(
                                  report.id,
                                  "resolved"
                                )
                              }
                              className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-700"
                            >
                              ✓ Resolve
                            </button>
                          )}

                          {report.listing_id &&
                            report.status !== "resolved" && (
                              <button
                                onClick={() =>
                                  pauseListing(report)
                                }
                                className="rounded-xl border border-orange-200 bg-orange-50 px-4 py-2.5 text-sm font-bold text-orange-700 hover:bg-orange-100"
                              >
                                ⏸ Hagarika listing
                              </button>
                            )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <footer className="mt-10 pb-4 text-center text-xs text-slate-400">
              KUGURISHA.COM · Moderation Center
            </footer>
          </div>
        </main>
      </div>
    </div>
  )
}

export default AdminReports