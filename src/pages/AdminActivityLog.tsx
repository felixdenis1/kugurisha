import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "../services/supabase"

type Activity = {
  id: string
  admin_id: string | null
  admin_name: string | null
  action: string
  entity_type: string
  entity_id: string | null
  entity_label: string | null
  details: Record<string, any> | null
  created_at: string
}

const ACTION_META: Record<string, { label: string; icon: string; color: string; group: string }> = {
  "user.suspend": { label: "Yahagaritse umukoresha", icon: "🚫", color: "rose", group: "user" },
  "user.unsuspend": { label: "Yongeye gufungura umukoresha", icon: "✅", color: "emerald", group: "user" },
  "user.role_change": { label: "Yahinduye role y'umukoresha", icon: "🛡️", color: "purple", group: "user" },
  "listing.pause": { label: "Yahagaritse listing", icon: "⏸️", color: "amber", group: "listing" },
  "listing.active": { label: "Yongeye gufungura listing", icon: "▶️", color: "emerald", group: "listing" },
  "listing.delete": { label: "Yasibye listing", icon: "🗑️", color: "rose", group: "listing" },
  "report.resolve": { label: "Yakemuye report", icon: "✓", color: "emerald", group: "report" },
  "report.bulk_delete": { label: "Yasibye reports nyinshi", icon: "🗑️", color: "rose", group: "report" },
  "category.create": { label: "Yongeyeho category", icon: "➕", color: "emerald", group: "category" },
  "category.update": { label: "Yahinduye category", icon: "✏️", color: "blue", group: "category" },
  "category.delete": { label: "Yasibye category", icon: "🗑️", color: "rose", group: "category" },
  "conversation.admin_reply": { label: "Yasubije mu kiganiro", icon: "💬", color: "purple", group: "conversation" },
  "conversation.delete": { label: "Yasibye ikiganiro", icon: "🗑️", color: "rose", group: "conversation" },
}

const COLOR_MAP: Record<string, string> = {
  rose: "bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:ring-rose-500/20",
  emerald: "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20",
  purple: "bg-purple-50 text-purple-700 ring-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:ring-purple-500/20",
  amber: "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-500/20",
  blue: "bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:ring-blue-500/20",
  slate: "bg-slate-50 text-slate-600 ring-slate-200 dark:bg-white/5 dark:text-slate-300 dark:ring-white/10",
}

export default function AdminActivityLog() {
  const navigate = useNavigate()

  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const [search, setSearch] = useState("")
  const [groupFilter, setGroupFilter] = useState<string>("all")
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    loadActivities()
  }, [])

  async function loadActivities(isRefresh = false) {
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

      const { data, error } = await supabase
        .from("admin_activity_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(500)

      if (error) throw error
      setActivities((data || []) as Activity[])
      setSelectedIds(new Set())
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : "Activity log ntiyashoboye gufunguka.")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleSelectAll() {
    if (selectedIds.size === filteredActivities.length && filteredActivities.length > 0) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filteredActivities.map((a) => a.id)))
    }
  }

  async function deleteSelected() {
    if (selectedIds.size === 0) return
    const confirmed = window.confirm(
      `Urabyemeza ko ushaka gusiba entries ${selectedIds.size} muri activity log?\n\nIki gikorwa ntikizagaruka.`
    )
    if (!confirmed) return

    setDeleting(true)
    setError("")

    try {
      const ids = Array.from(selectedIds)
      const { error } = await supabase.from("admin_activity_log").delete().in("id", ids)
      if (error) throw error

      setActivities((curr) => curr.filter((a) => !selectedIds.has(a.id)))
      setSelectedIds(new Set())
      setSuccess(`${ids.length} entries zasibwe.`)
      setTimeout(() => setSuccess(""), 3000)
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : "Ntibyashobotse gusiba entries.")
    } finally {
      setDeleting(false)
    }
  }

  function formatDate(date: string) {
    const d = new Date(date)
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const mins = Math.floor(diffMs / 60000)
    const hours = Math.floor(diffMs / 3600000)
    const days = Math.floor(diffMs / 86400000)

    if (mins < 1) return "Ubu"
    if (mins < 60) return `${mins}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return d.toLocaleString("rw-RW", { dateStyle: "medium", timeStyle: "short" })
  }

  const filteredActivities = useMemo(() => {
    const q = search.trim().toLowerCase()
    return activities.filter((a) => {
      const meta = ACTION_META[a.action]
      const matchesGroup = groupFilter === "all" || meta?.group === groupFilter
      if (!matchesGroup) return false
      if (!q) return true

      return (
        (a.admin_name || "").toLowerCase().includes(q) ||
        (a.entity_label || "").toLowerCase().includes(q) ||
        (meta?.label || a.action).toLowerCase().includes(q) ||
        a.entity_type.toLowerCase().includes(q)
      )
    })
  }, [activities, search, groupFilter])

  const groups = [
    { key: "all", label: "Zose", icon: "📋" },
    { key: "user", label: "Users", icon: "👥" },
    { key: "listing", label: "Listings", icon: "🏷️" },
    { key: "report", label: "Reports", icon: "🚩" },
    { key: "category", label: "Categories", icon: "📂" },
    { key: "conversation", label: "Conversations", icon: "💬" },
  ]

  const allSelected =
    filteredActivities.length > 0 && filteredActivities.every((a) => selectedIds.has(a.id))

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      {/* HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-600 to-slate-800 text-xl text-white shadow-lg shadow-slate-600/30">
            📋
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white sm:text-3xl">
              Activity Log
            </h1>
            <p className="mt-0.5 text-sm font-medium text-slate-500 dark:text-slate-400">
              Ibyakozwe n'abayobozi muri system.
            </p>
          </div>
        </div>
        <button
          onClick={() => loadActivities(true)}
          disabled={refreshing}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
        >
          <svg className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
          {refreshing ? "Biravugurura..." : "Refresh"}
        </button>
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
            <p className="mt-1 break-words">{error}</p>
          </div>
          <button onClick={() => setError("")} className="opacity-70 hover:opacity-100">×</button>
        </div>
      )}

      {/* FILTER BAR */}
      {!loading && !error && (
        <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-3 shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-white/[0.03]">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <svg className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Shakisha admin, action, cyangwa entity..."
                className="w-full rounded-xl border border-slate-200/80 bg-slate-50/50 py-2.5 pl-11 pr-4 text-sm font-semibold outline-none transition focus:border-[#10b981] focus:bg-white focus:ring-4 focus:ring-[#10b981]/10 dark:border-white/10 dark:bg-white/[0.04] dark:text-white"
              />
            </div>
            <div className="flex gap-1.5 overflow-x-auto rounded-xl bg-slate-100/80 p-1 dark:bg-white/5">
              {groups.map((g) => (
                <button
                  key={g.key}
                  onClick={() => setGroupFilter(g.key)}
                  className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                    groupFilter === g.key
                      ? "bg-white text-slate-900 shadow-sm dark:bg-[#10b981] dark:text-white"
                      : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white"
                  }`}
                >
                  <span>{g.icon}</span>
                  {g.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* BULK DELETE BAR */}
      {!loading && !error && filteredActivities.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200/80 bg-white/80 px-4 py-3 shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-white/[0.03]">
          <label className="flex cursor-pointer items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400">
            <input
              type="checkbox"
              checked={allSelected}
              ref={(el) => {
                if (el) el.indeterminate = selectedIds.size > 0 && !allSelected
              }}
              onChange={toggleSelectAll}
              className="h-4 w-4 rounded border-slate-300 accent-[#10b981]"
            />
            Select all ({filteredActivities.length})
          </label>

          {selectedIds.size > 0 && (
            <>
              <span className="rounded-lg bg-[#10b981] px-3 py-1 text-xs font-bold text-white">
                {selectedIds.size} selected
              </span>
              <button
                onClick={() => setSelectedIds(new Set())}
                className="text-xs font-bold text-slate-500 hover:text-slate-700 dark:text-slate-400"
              >
                Clear
              </button>
              <button
                onClick={deleteSelected}
                disabled={deleting}
                className="ml-auto inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-rose-700 disabled:opacity-60"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
                {deleting ? "Birasiba..." : `Delete (${selectedIds.size})`}
              </button>
            </>
          )}
        </div>
      )}

      {/* LIST */}
      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-2xl bg-white dark:bg-white/5" />
          ))}
        </div>
      ) : filteredActivities.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white/50 py-20 text-center dark:border-white/10 dark:bg-white/[0.02]">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 text-4xl dark:from-slate-500/20 dark:to-slate-500/10">
            📋
          </div>
          <h3 className="mt-5 text-lg font-black text-slate-900 dark:text-white">Nta activity</h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">
            Nta bikorwa byanditswe birahari. Ibyo abayobozi bakora bizagaragara hano.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredActivities.map((activity) => {
            const meta = ACTION_META[activity.action] || {
              label: activity.action,
              icon: "•",
              color: "slate",
              group: "system",
            }
            const isSelected = selectedIds.has(activity.id)

            return (
              <div
                key={activity.id}
                className={`flex items-start gap-3 rounded-2xl border bg-white p-4 shadow-sm transition hover:shadow-md dark:bg-[#0f1716]/80 ${
                  isSelected
                    ? "border-[#10b981] ring-2 ring-[#10b981]/20"
                    : "border-slate-200/80 dark:border-white/10"
                }`}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleSelect(activity.id)}
                  className="mt-1 h-4 w-4 shrink-0 cursor-pointer rounded border-slate-300 accent-[#10b981]"
                />

                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg ring-1 ${COLOR_MAP[meta.color]}`}>
                  {meta.icon}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{meta.label}</p>
                    <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-slate-600 dark:bg-white/10 dark:text-slate-300">
                      {activity.entity_type}
                    </span>
                  </div>

                  {activity.entity_label && (
                    <p className="mt-0.5 truncate text-xs font-semibold text-slate-600 dark:text-slate-300">
                      <span className="text-slate-400">Target:</span> {activity.entity_label}
                    </p>
                  )}

                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] font-medium text-slate-400">
                    <span>👤 {activity.admin_name || "Admin"}</span>
                    <span>•</span>
                    <span>{formatDate(activity.created_at)}</span>
                    {activity.details && Object.keys(activity.details).length > 0 && (
                      <details className="cursor-pointer">
                        <summary className="inline text-[11px] font-bold text-[#059669] hover:underline dark:text-[#34d399]">
                          details
                        </summary>
                        <pre className="mt-1 max-w-full overflow-x-auto rounded-lg bg-slate-50 p-2 text-[10px] font-mono text-slate-600 dark:bg-white/5 dark:text-slate-300">
                          {JSON.stringify(activity.details, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {!loading && !error && filteredActivities.length > 0 && (
        <p className="text-center text-xs font-bold text-slate-400">
          Showing {filteredActivities.length} of {activities.length} entries
        </p>
      )}
    </div>
  )
}