import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "../services/supabase"
import { logActivity } from "../services/activityLog"

type NotificationRow = {
  id: string
  user_id: string
  type: string
  title: string
  body: string
  listing_id: string | null
  is_read: boolean
  sender_id: string | null
  conversation_id: string | null
  created_at: string
}

type Profile = { id: string; full_name: string | null; role: string }

const TYPE_META: Record<string, { label: string; icon: string; color: string; bg: string }> = {
  info: { label: "Info", icon: "ℹ️", color: "text-blue-700 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-500/10 ring-blue-200 dark:ring-blue-500/20" },
  warning: { label: "Warning", icon: "⚠️", color: "text-amber-700 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-500/10 ring-amber-200 dark:ring-amber-500/20" },
  success: { label: "Success", icon: "✅", color: "text-emerald-700 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-500/10 ring-emerald-200 dark:ring-emerald-500/20" },
  alert: { label: "Alert", icon: "🚨", color: "text-rose-700 dark:text-rose-400", bg: "bg-rose-50 dark:bg-rose-500/10 ring-rose-200 dark:ring-rose-500/20" },
  system: { label: "System", icon: "🔔", color: "text-purple-700 dark:text-purple-400", bg: "bg-purple-50 dark:bg-purple-500/10 ring-purple-200 dark:ring-purple-500/20" },
}

export default function AdminNotifications() {
  const navigate = useNavigate()

  const [notifications, setNotifications] = useState<NotificationRow[]>([])
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const [showComposer, setShowComposer] = useState(false)
  const [sending, setSending] = useState(false)

  // Composer state
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [type, setType] = useState("info")
  const [targetMode, setTargetMode] = useState<"all" | "buyers" | "sellers" | "admins" | "specific">("all")
  const [specificUserId, setSpecificUserId] = useState("")

  // Filters
  const [search, setSearch] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const [filterRead, setFilterRead] = useState<"all" | "read" | "unread">("all")

  useEffect(() => {
    loadData()
  }, [])

  async function loadData(isRefresh = false) {
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

      const [nRes, pRes] = await Promise.all([
        supabase.from("notifications").select("*").order("created_at", { ascending: false }).limit(500),
        supabase.from("profiles").select("id, full_name, role").limit(1000),
      ])

      if (nRes.error) throw nRes.error
      setNotifications((nRes.data || []) as NotificationRow[])
      setProfiles(pRes.data || [])
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : "Notifications ntizashoboye gufunguka.")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  function resetComposer() {
    setTitle("")
    setBody("")
    setType("info")
    setTargetMode("all")
    setSpecificUserId("")
  }

  function openComposer() {
    resetComposer()
    setShowComposer(true)
  }

  function closeComposer() {
    if (sending) return
    setShowComposer(false)
    resetComposer()
  }

  async function sendNotification() {
    if (!title.trim() || !body.trim()) {
      setError("Uzuza title na body.")
      return
    }

    setSending(true)
    setError("")

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Ntabwo winjiye.")

      // Determine recipients
      let recipients: string[] = []

      if (targetMode === "specific") {
        if (!specificUserId) throw new Error("Hitamo umukoresha.")
        recipients = [specificUserId]
      } else if (targetMode === "all") {
        recipients = profiles.map((p) => p.id)
      } else {
        recipients = profiles.filter((p) => p.role === targetMode).map((p) => p.id)
      }

      if (recipients.length === 0) throw new Error("Nta bakoresha babonetse muri iyi groupe.")

      // Confirm if sending to many
      if (recipients.length > 5) {
        const ok = window.confirm(
          `Ugiye kohereza notification kuri abakoresha ${recipients.length}.\n\nEmeza?`
        )
        if (!ok) { setSending(false); return }
      }

      // Insert one row per recipient
      const rows = recipients.map((uid) => ({
        user_id: uid,
        type,
        title: title.trim(),
        body: body.trim(),
        is_read: false,
        sender_id: user.id,
      }))

      const { error: insErr } = await supabase.from("notifications").insert(rows)
      if (insErr) throw insErr

      await logActivity({
        action: "notification.broadcast",
        entity_type: "system",
        entity_label: `${title.trim()} → ${recipients.length} user(s)`,
        details: { type, targetMode, recipients: recipients.length },
      })

      await loadData()
      setShowComposer(false)
      resetComposer()
      setSuccess(`Notification yoherejwe kuri abakoresha ${recipients.length}.`)
      setTimeout(() => setSuccess(""), 4000)
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : "Ntibyashobotse kohereza notification.")
    } finally {
      setSending(false)
    }
  }

  async function deleteNotification(n: NotificationRow) {
    const confirmed = window.confirm(`Siba notification "${n.title}"?`)
    if (!confirmed) return

    setError("")
    const { error } = await supabase.from("notifications").delete().eq("id", n.id)
    if (error) {
      setError(error.message)
      return
    }

    setNotifications((curr) => curr.filter((x) => x.id !== n.id))
    await logActivity({
      action: "notification.delete",
      entity_type: "system",
      entity_id: n.id,
      entity_label: n.title,
    })
    setSuccess("Notification yasibwe.")
    setTimeout(() => setSuccess(""), 3000)
  }

  function formatDate(date: string) {
    const d = new Date(date)
    const now = new Date()
    const mins = Math.floor((now.getTime() - d.getTime()) / 60000)
    if (mins < 1) return "Ubu"
    if (mins < 60) return `${mins}m ago`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    if (days < 7) return `${days}d ago`
    return d.toLocaleString("rw-RW", { dateStyle: "medium", timeStyle: "short" })
  }

  function getUserName(id: string) {
    return profiles.find((p) => p.id === id)?.full_name || `User ${id.slice(0, 6)}`
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return notifications.filter((n) => {
      if (filterType !== "all" && n.type !== filterType) return false
      if (filterRead === "read" && !n.is_read) return false
      if (filterRead === "unread" && n.is_read) return false
      if (!q) return true
      return (
        n.title.toLowerCase().includes(q) ||
        n.body.toLowerCase().includes(q) ||
        getUserName(n.user_id).toLowerCase().includes(q)
      )
    })
  }, [notifications, search, filterType, filterRead, profiles])

  const unreadCount = notifications.filter((n) => !n.is_read).length

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      {/* HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 text-xl text-white shadow-lg shadow-pink-500/30">
            🔔
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white sm:text-3xl">
              Notifications
            </h1>
            <p className="mt-0.5 text-sm font-medium text-slate-500 dark:text-slate-400">
              Ohereza ubutumwa ku bakoresha — {notifications.length} zose, {unreadCount} zitasomwe.
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => loadData(true)}
            disabled={refreshing}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
          >
            <svg className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
            {refreshing ? "..." : "Refresh"}
          </button>
          <button
            onClick={openComposer}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#10b981] px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#059669]"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            New Notification
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
                placeholder="Shakisha title, body, cyangwa user..."
                className="w-full rounded-xl border border-slate-200/80 bg-slate-50/50 py-2.5 pl-11 pr-4 text-sm font-semibold outline-none transition focus:border-[#10b981] focus:bg-white focus:ring-4 focus:ring-[#10b981]/10 dark:border-white/10 dark:bg-white/[0.04] dark:text-white"
              />
            </div>
            <div className="flex flex-wrap gap-1.5 rounded-xl bg-slate-100/80 p-1 dark:bg-white/5">
              {["all", "info", "warning", "success", "alert", "system"].map((t) => (
                <button
                  key={t}
                  onClick={() => setFilterType(t)}
                  className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                    filterType === t
                      ? "bg-white text-slate-900 shadow-sm dark:bg-[#10b981] dark:text-white"
                      : "text-slate-500 hover:text-slate-700 dark:text-slate-400"
                  }`}
                >
                  {t === "all" ? "All" : TYPE_META[t]?.icon + " " + TYPE_META[t]?.label}
                </button>
              ))}
            </div>
            <div className="flex gap-1.5 rounded-xl bg-slate-100/80 p-1 dark:bg-white/5">
              {(["all", "read", "unread"] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setFilterRead(r)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold capitalize transition ${
                    filterRead === r
                      ? "bg-white text-slate-900 shadow-sm dark:bg-[#10b981] dark:text-white"
                      : "text-slate-500 hover:text-slate-700 dark:text-slate-400"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* LIST */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-white dark:bg-white/5" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white/50 py-20 text-center dark:border-white/10 dark:bg-white/[0.02]">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-100 to-rose-200 text-4xl dark:from-pink-500/20 dark:to-rose-500/20">
            🔔
          </div>
          <h3 className="mt-5 text-lg font-black text-slate-900 dark:text-white">Nta notifications</h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">
            Kanda "New Notification" kugira ngo utangire kohereza ubutumwa.
          </p>
          <button
            onClick={openComposer}
            className="mt-5 rounded-xl bg-[#10b981] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#059669]"
          >
            + New Notification
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((n) => {
            const meta = TYPE_META[n.type] || TYPE_META.system
            return (
              <div
                key={n.id}
                className={`rounded-2xl border bg-white p-4 shadow-sm transition hover:shadow-md dark:bg-[#0f1716]/80 ${
                  n.is_read ? "border-slate-200/80 dark:border-white/10" : "border-emerald-200 dark:border-emerald-500/30"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1 ${meta.bg} text-lg`}>
                    {meta.icon}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-black text-slate-900 dark:text-white">{n.title}</h3>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ring-1 ${meta.bg} ${meta.color}`}>
                        {meta.label}
                      </span>
                      {!n.is_read && (
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400">
                          Unread
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">{n.body}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-medium text-slate-400">
                      <span>👤 To: {getUserName(n.user_id)}</span>
                      <span>•</span>
                      <span>📅 {formatDate(n.created_at)}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => deleteNotification(n)}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-rose-200 bg-rose-50 text-rose-500 transition hover:bg-rose-100 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-400"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <p className="text-center text-xs font-bold text-slate-400">
          Showing {filtered.length} of {notifications.length} notifications
        </p>
      )}

      {/* COMPOSER MODAL */}
      {showComposer && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-slate-950/60 p-0 backdrop-blur-sm sm:items-center sm:p-4">
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl bg-white shadow-2xl dark:bg-[#0f1716] sm:rounded-3xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white/95 px-6 py-4 backdrop-blur-md dark:border-white/10 dark:bg-[#0f1716]/95">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#10b981]">Send Notification</p>
                <h2 className="text-lg font-black text-slate-900 dark:text-white">New Notification</h2>
              </div>
              <button onClick={closeComposer} className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-white/5 dark:text-slate-400 dark:hover:bg-white/10">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-5 p-6">
              {/* Type */}
              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">Type</label>
                <div className="grid grid-cols-5 gap-2">
                  {(["info", "warning", "success", "alert", "system"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setType(t)}
                      className={`flex flex-col items-center gap-1 rounded-xl border p-2.5 text-[11px] font-bold transition ${
                        type === t
                          ? "border-[#10b981] bg-emerald-50 ring-2 ring-emerald-100 dark:bg-emerald-500/10 dark:ring-emerald-500/20"
                          : "border-slate-200 bg-white hover:bg-slate-50 dark:border-white/10 dark:bg-white/5"
                      }`}
                    >
                      <span className="text-lg">{TYPE_META[t].icon}</span>
                      {TYPE_META[t].label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Target */}
              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">Send to</label>
                <select
                  value={targetMode}
                  onChange={(e) => setTargetMode(e.target.value as any)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-semibold outline-none focus:border-[#10b981] focus:bg-white focus:ring-4 focus:ring-[#10b981]/10 dark:border-white/10 dark:bg-[#0f1716] dark:text-white"
                >
                  <option value="all">Everyone ({profiles.length})</option>
                  <option value="buyers">Buyers only ({profiles.filter((p) => p.role === "buyer").length})</option>
                  <option value="sellers">Sellers only ({profiles.filter((p) => p.role === "seller").length})</option>
                  <option value="admins">Admins only ({profiles.filter((p) => p.role === "admin").length})</option>
                  <option value="specific">Specific user</option>
                </select>
              </div>

              {targetMode === "specific" && (
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">User</label>
                  <select
                    value={specificUserId}
                    onChange={(e) => setSpecificUserId(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-semibold outline-none focus:border-[#10b981] focus:bg-white focus:ring-4 focus:ring-[#10b981]/10 dark:border-white/10 dark:bg-[#0f1716] dark:text-white"
                  >
                    <option value="">— Hitamo umukoresha —</option>
                    {profiles.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.full_name || p.id.slice(0, 8)} ({p.role})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Title */}
              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">Title</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Urugero: New feature available"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-semibold outline-none focus:border-[#10b981] focus:bg-white focus:ring-4 focus:ring-[#10b981]/10 dark:border-white/10 dark:bg-white/[0.04] dark:text-white"
                />
              </div>

              {/* Body */}
              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">Message</label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={4}
                  placeholder="Andika ubutumwa..."
                  className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-medium outline-none focus:border-[#10b981] focus:bg-white focus:ring-4 focus:ring-[#10b981]/10 dark:border-white/10 dark:bg-white/[0.04] dark:text-white"
                />
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  onClick={closeComposer}
                  disabled={sending}
                  className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  onClick={sendNotification}
                  disabled={sending || !title.trim() || !body.trim()}
                  className="flex-1 rounded-xl bg-[#10b981] px-4 py-3 text-sm font-bold text-white hover:bg-[#059669] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {sending ? "Birohereza..." : "Send Notification"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}