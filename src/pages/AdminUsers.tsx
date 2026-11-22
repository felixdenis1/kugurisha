import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "../services/supabase"

type Profile = {
  id: string
  full_name: string | null
  phone: string | null
  avatar_url: string | null
  role: string
  is_active: boolean
  created_at: string
  updated_at: string
}

type Role = "buyer" | "seller" | "admin"

function AdminUsers() {
  const navigate = useNavigate()

  const [users, setUsers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [filter, setFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [search, setSearch] = useState("")
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [showRoleModal, setShowRoleModal] = useState(false)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [newRole, setNewRole] = useState<Role>("buyer")
  const [actionLoading, setActionLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    checkAdminAndLoad()
  }, [])

  async function checkAdminAndLoad(isRefresh = false) {
    if (isRefresh) setRefreshing(true)
    else setLoading(true)

    setError("")
    setSuccess("")

    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError) throw new Error(`Auth error: ${authError.message}`)
      if (!user) { navigate("/login"); return }

      const { data: adminProfile, error: adminError } = await supabase
        .from("profiles")
        .select("id, role, is_active")
        .eq("id", user.id)
        .maybeSingle()

      if (adminError) throw new Error(`Profile error: ${adminError.message}`)
      if (!adminProfile) throw new Error("Nta profile yabonetse kuri iyi konti.")
      if (adminProfile.role !== "admin")
        throw new Error(`Ntufite uburenganzira bwo kubona iyi page. Role yawe ni "${adminProfile.role}".`)
      if (adminProfile.is_active === false) {
        await supabase.auth.signOut()
        navigate("/login")
        return
      }

      const { data, error: usersError } = await supabase
        .from("profiles")
        .select("id, full_name, phone, avatar_url, role, is_active, created_at, updated_at")
        .order("created_at", { ascending: false })

      if (usersError) throw new Error(`Abakoresha ntibashoboye gufunguka: ${usersError.message}`)
      setUsers(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Habaye ikibazo mu gufungura Users Management.")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  function formatRole(role: string) {
    return { buyer: "Buyer", seller: "Seller", admin: "Admin" }[role] || role
  }

  function roleBadge(role: string) {
    if (role === "admin")
      return "bg-purple-50 text-purple-700 ring-1 ring-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:ring-purple-500/20"
    if (role === "seller")
      return "bg-blue-50 text-blue-700 ring-1 ring-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:ring-blue-500/20"
    return "bg-slate-50 text-slate-600 ring-1 ring-slate-200 dark:bg-white/5 dark:text-slate-300 dark:ring-white/10"
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString("rw-RW", { dateStyle: "medium" })
  }

  function getInitials(name: string | null) {
    if (!name) return "U"
    const parts = name.trim().split(/\s+/)
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
  }

  function openUser(user: Profile) {
    setSelectedUser(user)
    setShowDetails(true)
    setCopied(false)
    setSuccess("")
    setError("")
  }

  function closeDetails() {
    if (actionLoading) return
    setShowDetails(false)
    setSelectedUser(null)
    setCopied(false)
  }

  function openRoleModal(user: Profile) {
    setSelectedUser(user)
    const role: Role = user.role === "seller" || user.role === "admin" ? user.role : "buyer"
    setNewRole(role)
    setShowRoleModal(true)
    setSuccess("")
    setError("")
  }

  function openStatusModal(user: Profile) {
    setSelectedUser(user)
    setShowStatusModal(true)
    setSuccess("")
    setError("")
  }

  function closeActionModals() {
    if (actionLoading) return
    setShowRoleModal(false)
    setShowStatusModal(false)
  }

  async function getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { navigate("/login"); return null }
    return user
  }

  async function changeRole() {
    if (!selectedUser) return
    const currentUser = await getCurrentUser()
    if (!currentUser) return

    if (selectedUser.id === currentUser.id) {
      setError("Ntushobora guhindura role yawe ubwawe.")
      setShowRoleModal(false)
      return
    }
    if (selectedUser.role === newRole) { setShowRoleModal(false); return }

    setActionLoading(true)
    setError("")
    setSuccess("")

    try {
      const { data: updatedProfile, error: updateError } = await supabase.rpc("admin_update_profile", {
        target_user_id: selectedUser.id,
        new_role: newRole,
        new_is_active: null,
      })

      if (updateError) throw new Error(updateError.message)
      if (!updatedProfile) throw new Error("Profile ntiyagarutse nyuma yo guhindurwa.")

      const updatedUser: Profile = {
        ...selectedUser,
        role: updatedProfile.role,
        is_active: updatedProfile.is_active,
        updated_at: updatedProfile.updated_at,
      }

      setUsers((curr) => curr.map((u) => (u.id === selectedUser.id ? updatedUser : u)))
      setSelectedUser(updatedUser)
      setShowRoleModal(false)
      setSuccess(`Role ya ${selectedUser.full_name || "umukoresha"} yahinduwe ibe ${formatRole(updatedProfile.role)}.`)
      setTimeout(() => setSuccess(""), 4000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Role y'umukoresha ntiyahindutse.")
    } finally {
      setActionLoading(false)
    }
  }

  

  async function toggleUserStatus() {
    if (!selectedUser) return
    const currentUser = await getCurrentUser()
    if (!currentUser) return

    if (selectedUser.id === currentUser.id) {
      setError("Ntushobora guhagarika account yawe ubwawe.")
      setShowStatusModal(false)
      return
    }

    const nextStatus = !selectedUser.is_active
    setActionLoading(true)
    setError("")
    setSuccess("")

    try {
      const { data: updatedProfile, error: updateError } = await supabase.rpc("admin_update_profile", {
        target_user_id: selectedUser.id,
        new_role: null,
        new_is_active: nextStatus,
      })

      if (updateError) throw new Error(updateError.message)
      if (!updatedProfile) throw new Error("Profile ntiyagarutse nyuma yo guhindurwa.")

      const updatedUser: Profile = {
        ...selectedUser,
        role: updatedProfile.role,
        is_active: updatedProfile.is_active,
        updated_at: updatedProfile.updated_at,
      }

      setUsers((curr) => curr.map((u) => (u.id === selectedUser.id ? updatedUser : u)))
      setSelectedUser(updatedUser)
      setShowStatusModal(false)
      setSuccess(
        updatedProfile.is_active
          ? `${selectedUser.full_name || "Umukoresha"} yongeye gufungurwa.`
          : `${selectedUser.full_name || "Umukoresha"} yahagaritswe.`
      )
      setTimeout(() => setSuccess(""), 4000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Status y'umukoresha ntiyahindutse.")
    } finally {
      setActionLoading(false)
    }
  }

  async function copyUserId(id: string) {
    try {
      await navigator.clipboard.writeText(id)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch (err) {
      console.error(err)
      setError("User ID ntiyashoboye gukopororwa.")
    }
  }

  const allCount = users.length
  const buyerCount = users.filter((u) => u.role === "buyer").length
  const sellerCount = users.filter((u) => u.role === "seller").length
  const adminCount = users.filter((u) => u.role === "admin").length
  const activeCount = users.filter((u) => u.is_active).length
  const suspendedCount = users.filter((u) => !u.is_active).length

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesRole = filter === "all" || user.role === filter
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && user.is_active) ||
        (statusFilter === "suspended" && !user.is_active)

      const searchText = search.trim().toLowerCase()
      if (!searchText) return matchesRole && matchesStatus

      const matchesSearch =
        user.full_name?.toLowerCase().includes(searchText) ||
        user.phone?.toLowerCase().includes(searchText) ||
        user.id.toLowerCase().includes(searchText)

      return matchesRole && matchesStatus && Boolean(matchesSearch)
    })
  }, [users, filter, statusFilter, search])

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      {/* HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-xl text-white shadow-lg shadow-blue-500/30">
            👥
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white sm:text-3xl">
              Users Management
            </h1>
            <p className="mt-0.5 text-sm font-medium text-slate-500 dark:text-slate-400">
              Genzura abakoresha, roles, na status ya account zabo.
            </p>
          </div>
        </div>
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

      {/* ALERTS */}
      {success && (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-3 text-sm text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400">
          <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="font-bold">{success}</p>
          <button onClick={() => setSuccess("")} className="ml-auto opacity-70 hover:opacity-100">×</button>
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

      {/* ROLE STATS */}
      {!loading && !error && (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { key: "all", label: "All Users", count: allCount, icon: "👥", color: "blue", desc: "Abakoresha bose" },
            { key: "buyer", label: "Buyers", count: buyerCount, icon: "🛒", color: "slate", desc: "Abaguzi" },
            { key: "seller", label: "Sellers", count: sellerCount, icon: "🏪", color: "blue", desc: "Abagurisha" },
            { key: "admin", label: "Admins", count: adminCount, icon: "🛡️", color: "purple", desc: "Abayobozi" },
          ].map((stat) => {
            const isActive = filter === stat.key && statusFilter === "all"
            return (
              <button
                key={stat.key}
                onClick={() => { setFilter(stat.key); setStatusFilter("all") }}
                className={`group rounded-2xl border bg-white p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:bg-white/5 ${
                  isActive
                    ? `border-${stat.color}-300 ring-2 ring-${stat.color}-100 dark:border-${stat.color}-500/40 dark:ring-${stat.color}-500/20`
                    : "border-slate-200/80 dark:border-white/10"
                }`}
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">{stat.label}</p>
                  <span className={`flex h-8 w-8 items-center justify-center rounded-lg bg-${stat.color}-50 dark:bg-${stat.color}-500/20`}>
                    {stat.icon}
                  </span>
                </div>
                <p className="mt-3 text-2xl font-black text-slate-900 dark:text-white">{stat.count}</p>
                <p className="mt-1 text-[11px] font-medium text-slate-400">{stat.desc}</p>
              </button>
            )
          })}
        </div>
      )}

      {/* STATUS TOGGLES */}
      {!loading && !error && (
        <div className="grid gap-3 sm:grid-cols-2">
          <button
            onClick={() => setStatusFilter(statusFilter === "active" ? "all" : "active")}
            className={`flex items-center justify-between rounded-2xl border bg-white px-5 py-4 text-left shadow-sm transition hover:shadow-md dark:bg-white/5 ${
              statusFilter === "active"
                ? "border-emerald-300 ring-2 ring-emerald-100 dark:border-emerald-500/40 dark:ring-emerald-500/20"
                : "border-slate-200/80 dark:border-white/10"
            }`}
          >
            <div>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Active Accounts</p>
              <p className="mt-0.5 text-xs text-slate-400">Accounts zikora</p>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{activeCount}</p>
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
            </div>
          </button>
          <button
            onClick={() => setStatusFilter(statusFilter === "suspended" ? "all" : "suspended")}
            className={`flex items-center justify-between rounded-2xl border bg-white px-5 py-4 text-left shadow-sm transition hover:shadow-md dark:bg-white/5 ${
              statusFilter === "suspended"
                ? "border-rose-300 ring-2 ring-rose-100 dark:border-rose-500/40 dark:ring-rose-500/20"
                : "border-slate-200/80 dark:border-white/10"
            }`}
          >
            <div>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Suspended</p>
              <p className="mt-0.5 text-xs text-slate-400">Accounts zahagaritswe</p>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-black text-rose-600 dark:text-rose-400">{suspendedCount}</p>
              <span className="h-2 w-2 rounded-full bg-rose-500" />
            </div>
          </button>
        </div>
      )}

      {/* SEARCH + FILTERS */}
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
                placeholder="Shakisha izina, phone cyangwa ID..."
                className="w-full rounded-xl border border-slate-200/80 bg-slate-50/50 py-2.5 pl-11 pr-4 text-sm font-semibold outline-none transition focus:border-[#10b981] focus:bg-white focus:ring-4 focus:ring-[#10b981]/10 dark:border-white/10 dark:bg-white/[0.04] dark:text-white"
              />
            </div>
            <div className="flex gap-1.5 overflow-x-auto rounded-xl bg-slate-100/80 p-1 dark:bg-white/5">
              {[["all", "Zose"], ["buyer", "Buyers"], ["seller", "Sellers"], ["admin", "Admins"]].map(([role, label]) => (
                <button
                  key={role}
                  onClick={() => setFilter(role)}
                  className={`whitespace-nowrap rounded-lg px-4 py-1.5 text-xs font-bold transition ${
                    filter === role
                      ? "bg-white text-slate-900 shadow-sm dark:bg-[#10b981] dark:text-white"
                      : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* USER LIST */}
      <div>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-28 animate-pulse rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-white/5" />
            ))}
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white/50 py-20 text-center dark:border-white/10 dark:bg-white/[0.02]">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100 text-4xl dark:from-blue-500/20 dark:to-indigo-500/20">
              👤
            </div>
            <h3 className="mt-5 text-lg font-black text-slate-900 dark:text-white">Nta mukoresha abonetse</h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">
              Nta mukoresha uhuye na filter cyangwa search wahisemo.
            </p>
            {(filter !== "all" || statusFilter !== "all" || search) && (
              <button
                onClick={() => { setFilter("all"); setStatusFilter("all"); setSearch("") }}
                className="mt-5 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white hover:bg-slate-800"
              >
                Reset filters
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className={`group overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:shadow-md dark:bg-[#0f1716]/80 ${
                  user.is_active
                    ? "border-slate-200/80 dark:border-white/10"
                    : "border-rose-200 bg-rose-50/30 dark:border-rose-500/30 dark:bg-rose-500/5"
                }`}
              >
                <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:p-5">
                  {/* AVATAR */}
                  <div className="shrink-0">
                    {user.avatar_url ? (
                      <img src={user.avatar_url} alt={user.full_name || "User"} className="h-14 w-14 rounded-full object-cover ring-4 ring-slate-50 dark:ring-white/5" />
                    ) : (
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-sm font-black text-white ring-4 ring-slate-50 dark:ring-white/5">
                        {getInitials(user.full_name)}
                      </div>
                    )}
                  </div>

                  {/* INFO */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="truncate font-black text-slate-900 dark:text-white">
                        {user.full_name || "Umukoresha"}
                      </h3>
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${roleBadge(user.role)}`}>
                        {formatRole(user.role)}
                      </span>
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                        user.is_active
                          ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20"
                          : "bg-rose-50 text-rose-700 ring-1 ring-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:ring-rose-500/20"
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${user.is_active ? "bg-emerald-500" : "bg-rose-500"}`} />
                        {user.is_active ? "Active" : "Suspended"}
                      </span>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                      <span>📞 {user.phone || "Phone ntaboneka"}</span>
                      <span className="hidden text-slate-300 sm:inline">•</span>
                      <span>📅 Yinjiye {formatDate(user.created_at)}</span>
                    </div>
                    <p className="mt-1.5 truncate text-[11px] font-mono text-slate-400">ID: {user.id}</p>
                  </div>

                  {/* ACTIONS */}
                  <div className="flex shrink-0 flex-wrap items-center gap-2 border-t border-slate-100 pt-3 dark:border-white/5 sm:border-none sm:pt-0">
                    <button
                      onClick={() => openUser(user)}
                      className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
                    >
                      Reba
                    </button>
                    <button
                      onClick={() => openRoleModal(user)}
                      className="rounded-xl border border-purple-200 bg-purple-50 px-3.5 py-2 text-xs font-bold text-purple-700 transition hover:bg-purple-100 dark:border-purple-500/30 dark:bg-purple-500/10 dark:text-purple-400 dark:hover:bg-purple-500/20"
                    >
                      Role
                    </button>
                    <button
                      onClick={() => openStatusModal(user)}
                      className={`rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                        user.is_active
                          ? "border border-rose-200 bg-white text-rose-600 hover:bg-rose-50 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-400 dark:hover:bg-rose-500/20"
                          : "border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500/20"
                      }`}
                    >
                      {user.is_active ? "Suspend" : "Restore"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {!loading && !error && filteredUsers.length > 0 && (
        <p className="text-center text-xs font-bold text-slate-400">
          Showing {filteredUsers.length} of {users.length} users
        </p>
      )}

      {/* USER DETAILS MODAL */}
      {showDetails && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/60 p-0 backdrop-blur-sm sm:items-center sm:p-4">
          <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white shadow-2xl dark:bg-[#0f1716] sm:rounded-3xl">
            {/* Modal Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white/95 px-6 py-4 backdrop-blur-md dark:border-white/10 dark:bg-[#0f1716]/95">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#10b981]">User Details</p>
                <h2 className="text-lg font-black text-slate-900 dark:text-white">Umukoresha</h2>
              </div>
              <button onClick={closeDetails} className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-white/5 dark:text-slate-400 dark:hover:bg-white/10">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6">
              {/* Profile Hero */}
              <div className="flex flex-col items-center text-center">
                {selectedUser.avatar_url ? (
                  <img src={selectedUser.avatar_url} alt={selectedUser.full_name || "User"} className="h-24 w-24 rounded-full object-cover ring-8 ring-slate-50 dark:ring-white/5" />
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-2xl font-black text-white ring-8 ring-slate-50 dark:ring-white/5">
                    {getInitials(selectedUser.full_name)}
                  </div>
                )}
                <h3 className="mt-5 text-xl font-black text-slate-900 dark:text-white">
                  {selectedUser.full_name || "Umukoresha"}
                </h3>
                <div className="mt-2 flex flex-wrap justify-center gap-2">
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${roleBadge(selectedUser.role)}`}>
                    {formatRole(selectedUser.role)}
                  </span>
                  <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${
                    selectedUser.is_active
                      ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20"
                      : "bg-rose-50 text-rose-700 ring-1 ring-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:ring-rose-500/20"
                  }`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${selectedUser.is_active ? "bg-emerald-500" : "bg-rose-500"}`} />
                    {selectedUser.is_active ? "Active" : "Suspended"}
                  </span>
                </div>
              </div>

              {/* Detail rows */}
              <div className="mt-7 space-y-2.5">
                <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-4 dark:border-white/10 dark:bg-white/[0.02]">
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Phone</p>
                  <p className="mt-1 text-sm font-bold text-slate-800 dark:text-slate-200">{selectedUser.phone || "Ntaboneka"}</p>
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-4 dark:border-white/10 dark:bg-white/[0.02]">
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Joined</p>
                    <p className="mt-1 text-sm font-bold text-slate-800 dark:text-slate-200">{formatDate(selectedUser.created_at)}</p>
                  </div>
                  <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-4 dark:border-white/10 dark:bg-white/[0.02]">
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Updated</p>
                    <p className="mt-1 text-sm font-bold text-slate-800 dark:text-slate-200">{formatDate(selectedUser.updated_at)}</p>
                  </div>
                </div>
                <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-4 dark:border-white/10 dark:bg-white/[0.02]">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">User ID</p>
                      <p className="mt-1 truncate font-mono text-xs text-slate-700 dark:text-slate-300">{selectedUser.id}</p>
                    </div>
                    <button
                      onClick={() => copyUserId(selectedUser.id)}
                      className="shrink-0 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-bold text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
                    >
                      {copied ? "✓ Copied" : "Copy"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 grid grid-cols-2 gap-2.5">
                <button
                  onClick={() => { closeDetails(); openRoleModal(selectedUser) }}
                  className="rounded-xl border border-purple-200 bg-purple-50 px-4 py-3 text-sm font-bold text-purple-700 hover:bg-purple-100 dark:border-purple-500/30 dark:bg-purple-500/10 dark:text-purple-400 dark:hover:bg-purple-500/20"
                >
                  🛡️ Change Role
                </button>
                <button
                  onClick={() => { closeDetails(); openStatusModal(selectedUser) }}
                  className={`rounded-xl border px-4 py-3 text-sm font-bold ${
                    selectedUser.is_active
                      ? "border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-400 dark:hover:bg-rose-500/20"
                      : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500/20"
                  }`}
                >
                  {selectedUser.is_active ? "⛔ Suspend" : "✓ Restore"}
                </button>
              </div>
              <button
                onClick={closeDetails}
                className="mt-3 w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ROLE MODAL */}
      {showRoleModal && selectedUser && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-slate-950/60 p-0 backdrop-blur-sm sm:items-center sm:p-4">
          <div className="w-full max-w-md rounded-t-3xl bg-white p-6 shadow-2xl dark:bg-[#0f1716] sm:rounded-3xl">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#10b981]">User Management</p>
                <h2 className="mt-1 text-xl font-black text-slate-900 dark:text-white">Change Role</h2>
              </div>
              <button onClick={closeActionModals} className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-white/5 dark:text-slate-400 dark:hover:bg-white/10">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
              Hindura uruhare rwa <strong className="text-slate-800 dark:text-slate-200">{selectedUser.full_name || "uyu mukoresha"}</strong>.
            </p>

            <div className="mt-5 space-y-2">
              {[
                { value: "buyer" as Role, label: "Buyer", description: "Umuguzi", icon: "🛒" },
                { value: "seller" as Role, label: "Seller", description: "Umugurisha", icon: "🏪" },
                { value: "admin" as Role, label: "Admin", description: "Umuyobozi", icon: "🛡️" },
              ].map((role) => (
                <button
                  key={role.value}
                  onClick={() => setNewRole(role.value)}
                  className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition ${
                    newRole === role.value
                      ? "border-[#10b981] bg-emerald-50 ring-2 ring-emerald-100 dark:bg-emerald-500/10 dark:ring-emerald-500/20"
                      : "border-slate-200 bg-white hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
                  }`}
                >
                  <span className="text-2xl">{role.icon}</span>
                  <span className="flex-1">
                    <span className="block text-sm font-bold text-slate-900 dark:text-white">{role.label}</span>
                    <span className="block text-xs text-slate-500 dark:text-slate-400">{role.description}</span>
                  </span>
                  {newRole === role.value && (
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#10b981] text-xs font-bold text-white">✓</span>
                  )}
                </button>
              ))}
            </div>

            <div className="mt-6 flex gap-2.5">
              <button
                onClick={closeActionModals}
                disabled={actionLoading}
                className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                onClick={changeRole}
                disabled={actionLoading}
                className="flex-1 rounded-xl bg-[#10b981] px-4 py-3 text-sm font-bold text-white hover:bg-[#059669] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {actionLoading ? "Birimo..." : "Save Role"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STATUS MODAL */}
      {showStatusModal && selectedUser && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-slate-950/60 p-0 backdrop-blur-sm sm:items-center sm:p-4">
          <div className="w-full max-w-md rounded-t-3xl bg-white p-6 shadow-2xl dark:bg-[#0f1716] sm:rounded-3xl">
            <div className={`flex h-14 w-14 items-center justify-center rounded-2xl text-2xl ${
              selectedUser.is_active
                ? "bg-rose-50 dark:bg-rose-500/20"
                : "bg-emerald-50 dark:bg-emerald-500/20"
            }`}>
              {selectedUser.is_active ? "⛔" : "✓"}
            </div>

            <h2 className="mt-5 text-xl font-black text-slate-900 dark:text-white">
              {selectedUser.is_active ? "Suspend Account?" : "Restore Account?"}
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
              {selectedUser.is_active
                ? `Ugiye guhagarika account ya ${selectedUser.full_name || "uyu mukoresha"}.`
                : `Ugiye kongera gufungura account ya ${selectedUser.full_name || "uyu mukoresha"}.`}
            </p>

            <div className={`mt-4 rounded-2xl border p-4 ${
              selectedUser.is_active
                ? "border-rose-200 bg-rose-50 dark:border-rose-500/30 dark:bg-rose-500/10"
                : "border-emerald-200 bg-emerald-50 dark:border-emerald-500/30 dark:bg-emerald-500/10"
            }`}>
              <p className={`text-sm leading-6 ${
                selectedUser.is_active
                  ? "text-rose-700 dark:text-rose-400"
                  : "text-emerald-700 dark:text-emerald-400"
              }`}>
                {selectedUser.is_active
                  ? <>Account izajya kuri <strong>Suspended</strong>. Nta destructive deletion iri gukorwa.</>
                  : <>Account izongera kuba <strong>Active</strong>.</>}
              </p>
            </div>

            <div className="mt-6 flex gap-2.5">
              <button
                onClick={closeActionModals}
                disabled={actionLoading}
                className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                onClick={toggleUserStatus}
                disabled={actionLoading}
                className={`flex-1 rounded-xl px-4 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60 ${
                  selectedUser.is_active ? "bg-rose-600 hover:bg-rose-700" : "bg-emerald-600 hover:bg-emerald-700"
                }`}
              >
                {actionLoading ? "Birimo..." : selectedUser.is_active ? "Suspend" : "Restore"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminUsers