import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
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

type Profile = { id: string; full_name: string | null }
type Listing = { id: string; title: string; status: string }

function AdminReports() {
  const navigate = useNavigate()

  const [reports, setReports] = useState<Report[]>([])
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [filter, setFilter] = useState("all")
  const [actionId, setActionId] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [bulkDeleting, setBulkDeleting] = useState(false)

  useEffect(() => {
    checkAdminAndLoad()
  }, [])

  async function checkAdminAndLoad(isRefresh = false) {
    if (isRefresh) setRefreshing(true)
    else setLoading(true)
    setError("")

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { navigate("/login"); return }

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

      if (reportError) throw reportError

      const reportList = reportData || []
      setReports(reportList)
      setSelectedIds(new Set())

      const userIds = Array.from(
        new Set(reportList.flatMap((r) => [r.reporter_id, r.reported_user_id].filter(Boolean)))
      )
      const listingIds = Array.from(
        new Set(reportList.map((r) => r.listing_id).filter(Boolean))
      )

      if (userIds.length > 0) {
        const { data } = await supabase.from("profiles").select("id, full_name").in("id", userIds)
        setProfiles(data || [])
      } else setProfiles([])

      if (listingIds.length > 0) {
        const { data } = await supabase.from("listings").select("id, title, status").in("id", listingIds)
        setListings(data || [])
      } else setListings([])
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : "Reports ntizashoboye gufunguka.")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  async function pauseListingAndResolve(report: Report) {
    if (!report.listing_id) return

    const confirmed = window.confirm(
      `Urashaka guhagarika iyi listing no gukemura report?\n\nListing "${getListingTitle(report.listing_id)}" izahagarikwa.`
    )
    if (!confirmed) return

    setActionId(report.id)
    setError("")

    try {
      const { error: listingError } = await supabase
        .from("listings")
        .update({ status: "paused", updated_at: new Date().toISOString() })
        .eq("id", report.listing_id)
      if (listingError) throw listingError

      const { error: reportError } = await supabase
        .from("reports")
        .update({ status: "resolved", updated_at: new Date().toISOString() })
        .eq("id", report.id)
      if (reportError) throw reportError

      setReports((curr) =>
        curr.map((r) =>
          r.id === report.id ? { ...r, status: "resolved", updated_at: new Date().toISOString() } : r
        )
      )
      setListings((curr) =>
        curr.map((l) => (l.id === report.listing_id ? { ...l, status: "paused" } : l))
      )

      setSuccess("Listing yahagaritswe kandi report yakemuwe.")
      setTimeout(() => setSuccess(""), 4000)
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : "Action yananiwe.")
    } finally {
      setActionId(null)
    }
  }

  async function resolveReportOnly(reportId: string) {
    setActionId(reportId)
    setError("")
    try {
      const { error } = await supabase
        .from("reports")
        .update({ status: "resolved", updated_at: new Date().toISOString() })
        .eq("id", reportId)
      if (error) throw error

      setReports((curr) =>
        curr.map((r) =>
          r.id === reportId ? { ...r, status: "resolved", updated_at: new Date().toISOString() } : r
        )
      )
      setSuccess("Report yakemuwe.")
      setTimeout(() => setSuccess(""), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ntibyakunze.")
    } finally {
      setActionId(null)
    }
  }

  // ===== SELECTION LOGIC =====

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleSelectAll() {
    const resolvedReports = filteredReports.filter((r) => r.status === "resolved")
    if (resolvedReports.length === 0) return

    const allSelected = resolvedReports.every((r) => selectedIds.has(r.id))
    if (allSelected) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(resolvedReports.map((r) => r.id)))
    }
  }

  function clearSelection() {
    setSelectedIds(new Set())
  }

  // ===== BULK DELETE =====

  async function deleteSelectedReports() {
    const idsToDelete = Array.from(selectedIds)
    if (idsToDelete.length === 0) return

    const confirmed = window.confirm(
      `Urabyemeza ko ushaka gusiba reports ${idsToDelete.length}?\n\nIki gikorwa ntikizagaruka.`
    )
    if (!confirmed) return

    setBulkDeleting(true)
    setError("")
    setSuccess("")

    try {
      const { error } = await supabase.from("reports").delete().in("id", idsToDelete)
      if (error) throw error

      setReports((curr) => curr.filter((r) => !idsToDelete.includes(r.id)))
      setSelectedIds(new Set())
      setSuccess(`Reports ${idsToDelete.length} zasibwe burundu.`)
      setTimeout(() => setSuccess(""), 4000)
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : "Ntibyashobotse gusiba reports.")
    } finally {
      setBulkDeleting(false)
    }
  }

  async function deleteAllSolvedReports() {
    const solvedIds = reports.filter((r) => r.status === "resolved").map((r) => r.id)
    if (solvedIds.length === 0) {
      setError("Nta reports zakemuwe zihari.")
      setTimeout(() => setError(""), 3000)
      return
    }

    const confirmed = window.confirm(
      `Urabyemeza ko ushaka gusiba reports zose zAKEMUWE (${solvedIds.length})?\n\nIki gikorwa ntikizagaruka.`
    )
    if (!confirmed) return

    setBulkDeleting(true)
    setError("")
    setSuccess("")

    try {
      const { error } = await supabase.from("reports").delete().in("id", solvedIds)
      if (error) throw error

      setReports((curr) => curr.filter((r) => !solvedIds.includes(r.id)))
      setSelectedIds(new Set())
      setSuccess(`Reports ${solvedIds.length} zakemuwe zasibwe burundu.`)
      setTimeout(() => setSuccess(""), 4000)
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : "Ntibyashobotse gusiba reports.")
    } finally {
      setBulkDeleting(false)
    }
  }

  // ===== HELPERS =====

  function getProfileName(id: string | null) {
    if (!id) return "Ntabonetse"
    return profiles.find((p) => p.id === id)?.full_name || "Umukoresha"
  }

  function getListingTitle(id: string | null) {
    if (!id) return "Nta listing"
    return listings.find((l) => l.id === id)?.title || "Listing itabonetse"
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
    return { pending: "Pending", reviewed: "Reviewed", resolved: "Resolved" }[status] || status
  }

  function statusStyle(status: string) {
    if (status === "pending")
      return {
        badge: "bg-amber-50 text-amber-700 ring-1 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-500/20",
        dot: "bg-amber-500",
      }
    if (status === "reviewed")
      return {
        badge: "bg-blue-50 text-blue-700 ring-1 ring-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:ring-blue-500/20",
        dot: "bg-blue-500",
      }
    return {
      badge: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20",
      dot: "bg-emerald-500",
    }
  }

  const filteredReports = reports.filter((r) => filter === "all" || r.status === filter)
  const pendingCount = reports.filter((r) => r.status === "pending").length
  const reviewedCount = reports.filter((r) => r.status === "reviewed").length
  const resolvedCount = reports.filter((r) => r.status === "resolved").length

  const resolvedFiltered = filteredReports.filter((r) => r.status === "resolved")
  const allResolvedSelected =
    resolvedFiltered.length > 0 && resolvedFiltered.every((r) => selectedIds.has(r.id))
  const someResolvedSelected = resolvedFiltered.some((r) => selectedIds.has(r.id))

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      {/* HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-red-600 text-xl text-white shadow-lg shadow-rose-500/30">
            🚩
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white sm:text-3xl">
              Moderation Center
            </h1>
            <p className="mt-0.5 text-sm font-medium text-slate-500 dark:text-slate-400">
              Reba no gukemura reports z'abakoresha.
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {resolvedCount > 0 && (
            <button
              onClick={deleteAllSolvedReports}
              disabled={bulkDeleting}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-rose-200 bg-white px-4 py-2.5 text-sm font-bold text-rose-600 shadow-sm transition hover:bg-rose-50 disabled:opacity-60 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-400"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
              Delete All Solved ({resolvedCount})
            </button>
          )}
          <button
            onClick={() => checkAdminAndLoad(true)}
            disabled={refreshing}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
          >
            <svg className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
            {refreshing ? "Biravugurura..." : "Refresh"}
          </button>
        </div>
      </div>

      {/* ALERTS */}
      {success && (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-3 text-sm text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400">
          <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="font-bold">{success}</p>
        </div>
      )}
      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-3 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-400">
          <svg className="mt-0.5 h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          <div className="flex-1">
            <p className="font-bold">Habaye ikibazo</p>
            <p className="mt-1">{error}</p>
          </div>
          <button onClick={() => setError("")} className="opacity-70 hover:opacity-100">×</button>
        </div>
      )}

      {/* STATS */}
      {!loading && !error && (
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { key: "pending", label: "Pending", count: pendingCount, icon: "⏳", accent: "amber", ring: "ring-amber-100 border-amber-300", desc: "Zitegereje action" },
            { key: "reviewed", label: "Reviewed", count: reviewedCount, icon: "🔎", accent: "blue", ring: "ring-blue-100 border-blue-300", desc: "Zagenzuwe" },
            { key: "resolved", label: "Resolved", count: resolvedCount, icon: "✓", accent: "emerald", ring: "ring-emerald-100 border-emerald-300", desc: "Zarakemuwe" },
          ].map((stat) => (
            <button
              key={stat.key}
              onClick={() => setFilter(stat.key)}
              className={`group relative overflow-hidden rounded-2xl border bg-white p-5 text-left shadow-sm transition-all hover:-translate-y-1 hover:shadow-md dark:bg-white/5 ${
                filter === stat.key ? `${stat.ring} ring-2` : "border-slate-200/80 dark:border-white/10"
              }`}
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {stat.label}
                </p>
                <span className={`flex h-9 w-9 items-center justify-center rounded-xl text-base ${
                  stat.accent === "amber" ? "bg-amber-50 dark:bg-amber-500/20" :
                  stat.accent === "blue" ? "bg-blue-50 dark:bg-blue-500/20" :
                  "bg-emerald-50 dark:bg-emerald-500/20"
                }`}>
                  {stat.icon}
                </span>
              </div>
              <p className="mt-4 text-3xl font-black tracking-tight text-slate-900 dark:text-white">{stat.count}</p>
              <p className="mt-1 text-xs font-medium text-slate-400">{stat.desc}</p>
            </button>
          ))}
        </div>
      )}

      {/* FILTER + SELECT ALL BAR */}
      {!loading && !error && (
        <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200/80 bg-white/80 p-2 shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-white/[0.03]">
          <span className="ml-2 text-[10px] font-black uppercase tracking-wider text-slate-400">Filter:</span>
          {["all", "pending", "reviewed", "resolved"].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                filter === status
                  ? "bg-slate-900 text-white shadow-sm dark:bg-white dark:text-slate-900"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/5"
              }`}
            >
              {status === "all" ? "Zose" : statusLabel(status)}
            </button>
          ))}

          {/* SELECT ALL — only visible if there are resolved reports */}
          {resolvedFiltered.length > 0 && (
            <>
              <div className="mx-1 hidden h-6 w-px bg-slate-200 dark:bg-white/10 sm:block" />
              <label className="flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/5">
                <input
                  type="checkbox"
                  checked={allResolvedSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = someResolvedSelected && !allResolvedSelected
                  }}
                  onChange={toggleSelectAll}
                  className="h-4 w-4 rounded border-slate-300 accent-[#10b981]"
                />
                Select all resolved ({resolvedFiltered.length})
              </label>
            </>
          )}

          {selectedIds.size > 0 && (
            <div className="ml-auto flex items-center gap-2">
              <span className="rounded-lg bg-[#10b981] px-3 py-1.5 text-xs font-bold text-white">
                {selectedIds.size} selected
              </span>
              <button
                onClick={clearSelection}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
              >
                Clear
              </button>
              <button
                onClick={deleteSelectedReports}
                disabled={bulkDeleting}
                className="flex items-center gap-1.5 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-rose-700 disabled:opacity-60"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
                {bulkDeleting ? "Birasiba..." : `Delete (${selectedIds.size})`}
              </button>
            </div>
          )}
        </div>
      )}

      {/* CONTENT */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-56 animate-pulse rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-white/5" />
          ))}
        </div>
      ) : filteredReports.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white/50 py-20 text-center dark:border-white/10 dark:bg-white/[0.02]">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-100 text-4xl dark:from-emerald-500/20 dark:to-teal-500/20">
            ✓
          </div>
          <h3 className="mt-5 text-lg font-black text-slate-900 dark:text-white">Nta reports zihari</h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">
            Nta report ihuye na filter wahisemo.
          </p>
          {filter !== "all" && (
            <button
              onClick={() => setFilter("all")}
              className="mt-5 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white hover:bg-slate-800"
            >
              Reba zose
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReports.map((report) => {
            const styles = statusStyle(report.status)
            const isActing = actionId === report.id
            const isResolved = report.status === "resolved"
            const isSelected = selectedIds.has(report.id)

            return (
              <div
                key={report.id}
                className={`group overflow-hidden rounded-2xl border bg-white shadow-sm transition-all hover:shadow-md dark:bg-[#0f1716]/80 ${
                  isSelected
                    ? "border-[#10b981] ring-2 ring-[#10b981]/20"
                    : "border-slate-200/80 dark:border-white/10"
                }`}
              >
                <div className="p-5 sm:p-6">
                  <div className="flex gap-4">
                    {/* CHECKBOX — only for resolved */}
                    {isResolved && (
                      <div className="shrink-0 pt-1">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(report.id)}
                          className="h-5 w-5 cursor-pointer rounded border-slate-300 accent-[#10b981]"
                        />
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      {/* TOP ROW */}
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1 text-xs font-bold text-rose-700 ring-1 ring-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:ring-rose-500/20">
                              🚩 {formatReason(report.reason)}
                            </span>
                            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${styles.badge}`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${styles.dot}`} />
                              {statusLabel(report.status)}
                            </span>
                          </div>
                          <h2 className="mt-3 line-clamp-2 text-lg font-black text-slate-900 dark:text-white sm:text-xl">
                            {getListingTitle(report.listing_id)}
                          </h2>
                          <p className="mt-1 text-xs font-medium text-slate-400">{formatDate(report.created_at)}</p>
                        </div>
                      </div>

                      {/* DESCRIPTION */}
                      {report.description && (
                        <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50/60 p-4 dark:border-white/5 dark:bg-white/[0.02]">
                          <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">{report.description}</p>
                        </div>
                      )}

                      {/* PEOPLE */}
                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white p-3 dark:border-white/5 dark:bg-white/[0.02]">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm dark:bg-blue-500/20">👤</div>
                          <div className="min-w-0">
                            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Reporter</p>
                            <p className="truncate text-sm font-bold text-slate-900 dark:text-white">{getProfileName(report.reporter_id)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white p-3 dark:border-white/5 dark:bg-white/[0.02]">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm dark:bg-white/10">👤</div>
                          <div className="min-w-0">
                            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Reported User</p>
                            <p className="truncate text-sm font-bold text-slate-900 dark:text-white">{getProfileName(report.reported_user_id)}</p>
                          </div>
                        </div>
                      </div>

                      {/* ACTIONS */}
                      <div className="mt-5 flex flex-col gap-2 border-t border-slate-100 pt-4 dark:border-white/5 sm:flex-row sm:flex-wrap">
                        {report.listing_id && (
                          <button
                            onClick={() => navigate(`/listing/${report.listing_id}`)}
                            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
                          >
                            Reba listing
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                            </svg>
                          </button>
                        )}

                        {report.status !== "resolved" && report.listing_id && (
                          <button
                            onClick={() => pauseListingAndResolve(report)}
                            disabled={isActing}
                            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:from-orange-600 hover:to-amber-600 disabled:opacity-60"
                          >
                            {isActing ? (
                              <>
                                <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                                </svg>
                                Birakora...
                              </>
                            ) : (
                              <>⏸ Hagarika & Kemura</>
                            )}
                          </button>
                        )}

                        {report.status !== "resolved" && !report.listing_id && (
                          <button
                            onClick={() => resolveReportOnly(report.id)}
                            disabled={isActing}
                            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-60"
                          >
                            ✓ Kemura Report
                          </button>
                        )}

                        {report.status === "resolved" && (
                          <span className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 px-4 py-2.5 text-sm font-bold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                            ✓ Yakemuwe
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {!loading && !error && filteredReports.length > 0 && (
        <p className="text-center text-xs font-bold text-slate-400">
          Showing {filteredReports.length} of {reports.length} reports
        </p>
      )}
    </div>
  )
}

export default AdminReports