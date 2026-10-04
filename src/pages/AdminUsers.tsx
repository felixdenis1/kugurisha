import { useEffect, useMemo, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
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
    if (isRefresh) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }

    setError("")
    setSuccess("")

    try {
      // Get current authenticated user
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError) {
        throw new Error(`Auth error: ${authError.message}`)
      }

      if (!user) {
        navigate("/login")
        return
      }

      // Get current user's profile
      const {
        data: adminProfile,
        error: adminError,
      } = await supabase
        .from("profiles")
        .select("id, role, is_active")
        .eq("id", user.id)
        .maybeSingle()

      if (adminError) {
        console.error("ADMIN PROFILE ERROR:", adminError)

        throw new Error(
          `Profile error: ${adminError.message}`
        )
      }

      if (!adminProfile) {
        throw new Error(
          "Nta profile yabonetse kuri iyi konti."
        )
      }

      if (adminProfile.role !== "admin") {
        throw new Error(
          `Ntufite uburenganzira bwo kubona iyi page. Role yawe ni "${adminProfile.role}".`
        )
      }

      if (adminProfile.is_active === false) {
        await supabase.auth.signOut()
        navigate("/login")
        return
      }

      // Load all profiles
      const {
        data,
        error: usersError,
      } = await supabase
        .from("profiles")
        .select(
          "id, full_name, phone, avatar_url, role, is_active, created_at, updated_at"
        )
        .order("created_at", { ascending: false })

      if (usersError) {
        console.error("USERS ERROR:", usersError)

        throw new Error(
          `Abakoresha ntibashoboye gufunguka: ${usersError.message}`
        )
      }

      setUsers(data || [])
    } catch (err) {
      console.error("ADMIN USERS ERROR:", err)

      setError(
        err instanceof Error
          ? err.message
          : "Habaye ikibazo mu gufungura Users Management."
      )
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  function formatRole(role: string) {
    const roles: Record<string, string> = {
      buyer: "Buyer",
      seller: "Seller",
      admin: "Admin",
    }

    return roles[role] || role
  }

  function roleClasses(role: string) {
    if (role === "admin") {
      return "border-purple-200 bg-purple-50 text-purple-700"
    }

    if (role === "seller") {
      return "border-blue-200 bg-blue-50 text-blue-700"
    }

    return "border-slate-200 bg-slate-50 text-slate-600"
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString("rw-RW", {
      dateStyle: "medium",
    })
  }

  function getInitials(name: string | null) {
    if (!name) return "U"

    const parts = name.trim().split(/\s+/)

    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase()
    }

    return (
      parts[0].charAt(0) +
      parts[parts.length - 1].charAt(0)
    ).toUpperCase()
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

    const role: Role =
      user.role === "seller" || user.role === "admin"
        ? user.role
        : "buyer"

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
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      navigate("/login")
      return null
    }

    return user
  }

  async function changeRole() {
    if (!selectedUser) return

    const currentUser = await getCurrentUser()

    if (!currentUser) return

    // Admin ntashobora guhindura role ye ubwe
    if (selectedUser.id === currentUser.id) {
      setError(
        "Ntushobora guhindura role yawe ubwawe."
      )

      setShowRoleModal(false)
      return
    }

    if (selectedUser.role === newRole) {
      setShowRoleModal(false)
      return
    }

    setActionLoading(true)
    setError("")
    setSuccess("")

    try {
      const {
        data: updatedProfile,
        error: updateError,
      } = await supabase.rpc("admin_update_profile", {
        target_user_id: selectedUser.id,
        new_role: newRole,
        new_is_active: null,
      })

      if (updateError) {
        throw new Error(updateError.message)
      }

      if (!updatedProfile) {
        throw new Error(
          "Profile ntiyagarutse nyuma yo guhindurwa."
        )
      }

      const updatedUser: Profile = {
        ...selectedUser,
        role: updatedProfile.role,
        is_active: updatedProfile.is_active,
        updated_at: updatedProfile.updated_at,
      }

      setUsers((current) =>
        current.map((item) =>
          item.id === selectedUser.id
            ? updatedUser
            : item
        )
      )

      setSelectedUser(updatedUser)
      setShowRoleModal(false)

      setSuccess(
        `Role ya ${
          selectedUser.full_name || "umukoresha"
        } yahinduwe ibe ${formatRole(updatedProfile.role)}.`
      )
    } catch (err) {
      console.error("CHANGE ROLE ERROR:", err)

      setError(
        err instanceof Error
          ? err.message
          : "Role y'umukoresha ntiyahindutse."
      )
    } finally {
      setActionLoading(false)
    }
  }

  async function toggleUserStatus() {
    if (!selectedUser) return

    const currentUser = await getCurrentUser()

    if (!currentUser) return

    // Admin ntashobora guhagarika account ye ubwe
    if (selectedUser.id === currentUser.id) {
      setError(
        "Ntushobora guhagarika account yawe ubwawe."
      )

      setShowStatusModal(false)
      return
    }

    const nextStatus = !selectedUser.is_active

    setActionLoading(true)
    setError("")
    setSuccess("")

    try {
      const {
        data: updatedProfile,
        error: updateError,
      } = await supabase.rpc("admin_update_profile", {
        target_user_id: selectedUser.id,
        new_role: null,
        new_is_active: nextStatus,
      })

      if (updateError) {
        throw new Error(updateError.message)
      }

      if (!updatedProfile) {
        throw new Error(
          "Profile ntiyagarutse nyuma yo guhindurwa."
        )
      }

      const updatedUser: Profile = {
        ...selectedUser,
        role: updatedProfile.role,
        is_active: updatedProfile.is_active,
        updated_at: updatedProfile.updated_at,
      }

      setUsers((current) =>
        current.map((item) =>
          item.id === selectedUser.id
            ? updatedUser
            : item
        )
      )

      setSelectedUser(updatedUser)
      setShowStatusModal(false)

      setSuccess(
        updatedProfile.is_active
          ? `${
              selectedUser.full_name || "Umukoresha"
            } yongeye gufungurwa.`
          : `${
              selectedUser.full_name || "Umukoresha"
            } yahagaritswe.`
      )
    } catch (err) {
      console.error("TOGGLE STATUS ERROR:", err)

      setError(
        err instanceof Error
          ? err.message
          : "Status y'umukoresha ntiyahindutse."
      )
    } finally {
      setActionLoading(false)
    }
  }

  async function copyUserId(id: string) {
    try {
      await navigator.clipboard.writeText(id)

      setCopied(true)

      window.setTimeout(() => {
        setCopied(false)
      }, 1800)
    } catch (copyError) {
      console.error(copyError)
      setError("User ID ntiyashoboye gukopororwa.")
    }
  }

  const allCount = users.length

  const buyerCount = users.filter(
    (user) => user.role === "buyer"
  ).length

  const sellerCount = users.filter(
    (user) => user.role === "seller"
  ).length

  const adminCount = users.filter(
    (user) => user.role === "admin"
  ).length

  const activeCount = users.filter(
    (user) => user.is_active
  ).length

  const suspendedCount = users.filter(
    (user) => !user.is_active
  ).length

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesRole =
        filter === "all" || user.role === filter

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && user.is_active) ||
        (statusFilter === "suspended" && !user.is_active)

      const searchText = search.trim().toLowerCase()

      if (!searchText) {
        return matchesRole && matchesStatus
      }

      const matchesSearch =
        user.full_name
          ?.toLowerCase()
          .includes(searchText) ||
        user.phone
          ?.toLowerCase()
          .includes(searchText) ||
        user.id.toLowerCase().includes(searchText)

      return (
        matchesRole &&
        matchesStatus &&
        Boolean(matchesSearch)
      )
    })
  }, [users, filter, statusFilter, search])

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

            <Link
              to="/admin/users"
              className="flex items-center justify-between rounded-xl bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700"
            >
              <span className="flex items-center gap-3">
                <span>👥</span>
                Users
              </span>

              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-bold text-blue-700">
                {allCount}
              </span>
            </Link>

            <Link
              to="/admin/listings"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
            >
              <span>🏷️</span>
              Listings
            </Link>

            <Link
              to="/admin/categories"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
            >
              <span>📂</span>
              Categories
            </Link>

            <Link
              to="/admin/reports"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
            >
              <span>🚩</span>
              Reports
            </Link>

            <button
              type="button"
              disabled
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-slate-400"
            >
              <span>💬</span>
              Conversations
            </button>

            <button
              type="button"
              disabled
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-slate-400"
            >
              <span>🔔</span>
              Notifications
            </button>

            <div className="mt-5 px-4 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Insights
            </div>

            <button
              type="button"
              disabled
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-slate-400"
            >
              <span>📈</span>
              Analytics
            </button>

            <button
              type="button"
              disabled
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-slate-400"
            >
              <span>🧾</span>
              Activity Log
            </button>
          </nav>

          <div className="border-t border-slate-100 p-4">
            <Link
              to="/"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
            >
              ← Subira kuri marketplace
            </Link>
          </div>
        </aside>

        {/* MAIN */}
        <main className="min-w-0 flex-1">
          <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
            <div className="flex items-center justify-between gap-4 px-5 py-4 sm:px-8">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                  Admin Center
                </p>

                <h1 className="mt-1 text-xl font-bold sm:text-2xl">
                  Users Management
                </h1>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => checkAdminAndLoad(true)}
                  disabled={refreshing}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {refreshing ? "..." : "↻ Refresh"}
                </button>

                <Link
                  to="/admin"
                  className="hidden rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 sm:block"
                >
                  ← Overview
                </Link>
              </div>
            </div>
          </header>

          <div className="mx-auto max-w-[1400px] p-5 sm:p-8">

            {/* INTRO */}
            <div className="mb-7">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-2xl">
                  👥
                </div>

                <div>
                  <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                    Users
                  </h2>

                  <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
                    Genzura abakoresha bari kuri KUGURISHA.COM,
                    uruhare bafite ndetse na status ya account zabo.
                  </p>
                </div>
              </div>
            </div>

            {/* SUCCESS */}
            {success && (
              <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100">
                    ✓
                  </span>

                  <p className="text-sm font-semibold text-emerald-800">
                    {success}
                  </p>

                  <button
                    type="button"
                    onClick={() => setSuccess("")}
                    className="ml-auto text-emerald-600 hover:text-emerald-800"
                  >
                    ×
                  </button>
                </div>
              </div>
            )}

            {/* ERROR */}
            {error && (
              <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
                <div className="flex items-start gap-3">
                  <span className="text-xl">⚠️</span>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-red-800">
                      Habaye ikibazo
                    </p>

                    <p className="mt-1 text-sm leading-6 text-red-700">
                      {error}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setError("")}
                    className="text-red-600 hover:text-red-800"
                  >
                    ×
                  </button>
                </div>
              </div>
            )}

            {/* STATS */}
            {!loading && !error && (
              <>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

                  <button
                    type="button"
                    onClick={() => {
                      setFilter("all")
                      setStatusFilter("all")
                    }}
                    className={`rounded-2xl border bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
                      filter === "all" &&
                      statusFilter === "all"
                        ? "border-blue-300 ring-2 ring-blue-100"
                        : "border-slate-200"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-slate-500">
                        All Users
                      </p>

                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50">
                        👥
                      </span>
                    </div>

                    <p className="mt-4 text-3xl font-black">
                      {allCount}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Abakoresha bose
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setFilter("buyer")
                      setStatusFilter("all")
                    }}
                    className="rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-slate-500">
                        Buyers
                      </p>

                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50">
                        🛒
                      </span>
                    </div>

                    <p className="mt-4 text-3xl font-black">
                      {buyerCount}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Abaguzi
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setFilter("seller")
                      setStatusFilter("all")
                    }}
                    className="rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-slate-500">
                        Sellers
                      </p>

                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50">
                        🏪
                      </span>
                    </div>

                    <p className="mt-4 text-3xl font-black">
                      {sellerCount}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Abagurisha
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setFilter("admin")
                      setStatusFilter("all")
                    }}
                    className="rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-slate-500">
                        Admins
                      </p>

                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50">
                        🛡️
                      </span>
                    </div>

                    <p className="mt-4 text-3xl font-black">
                      {adminCount}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Abayobozi
                    </p>
                  </button>
                </div>

                {/* STATUS */}
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setStatusFilter("active")}
                    className={`rounded-2xl border bg-white px-5 py-4 text-left shadow-sm transition hover:shadow-md ${
                      statusFilter === "active"
                        ? "border-emerald-300 ring-2 ring-emerald-100"
                        : "border-slate-200"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-slate-500">
                          Active Accounts
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          Accounts zikora
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-2xl font-black text-emerald-600">
                          {activeCount}
                        </p>

                        <span className="text-xs font-semibold text-emerald-600">
                          ● Active
                        </span>
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStatusFilter("suspended")}
                    className={`rounded-2xl border bg-white px-5 py-4 text-left shadow-sm transition hover:shadow-md ${
                      statusFilter === "suspended"
                        ? "border-red-300 ring-2 ring-red-100"
                        : "border-slate-200"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-slate-500">
                          Suspended
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          Accounts zahagaritswe
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-2xl font-black text-red-600">
                          {suspendedCount}
                        </p>

                        <span className="text-xs font-semibold text-red-600">
                          ● Suspended
                        </span>
                      </div>
                    </div>
                  </button>
                </div>
              </>
            )}

            {/* SEARCH */}
            {!loading && !error && (
              <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex flex-col gap-4">
                  <div className="relative w-full">
                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      🔎
                    </span>

                    <input
                      value={search}
                      onChange={(event) =>
                        setSearch(event.target.value)
                      }
                      placeholder="Shakisha izina, phone cyangwa ID..."
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50"
                    />
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {[
                      ["all", "Zose"],
                      ["buyer", "Buyers"],
                      ["seller", "Sellers"],
                      ["admin", "Admins"],
                    ].map(([role, label]) => (
                      <button
                        key={role}
                        type="button"
                        onClick={() => setFilter(role)}
                        className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                          filter === role
                            ? "bg-slate-900 text-white"
                            : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {label}
                      </button>
                    ))}

                    <div className="mx-1 hidden h-10 w-px bg-slate-200 sm:block" />

                    {[
                      ["all", "Status zose"],
                      ["active", "Active"],
                      ["suspended", "Suspended"],
                    ].map(([status, label]) => (
                      <button
                        key={status}
                        type="button"
                        onClick={() =>
                          setStatusFilter(status)
                        }
                        className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                          statusFilter === status
                            ? status === "suspended"
                              ? "bg-red-600 text-white"
                              : status === "active"
                                ? "bg-emerald-600 text-white"
                                : "bg-slate-900 text-white"
                            : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* CONTENT */}
            <div className="mt-6">
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((item) => (
                    <div
                      key={item}
                      className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-slate-100" />

                        <div className="flex-1">
                          <div className="h-4 w-40 rounded bg-slate-100" />
                          <div className="mt-2 h-3 w-56 rounded bg-slate-100" />
                        </div>

                        <div className="hidden h-8 w-20 rounded-full bg-slate-100 sm:block" />
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

                      <p className="mt-1 text-sm leading-6 text-red-700">
                        {error}
                      </p>

                      <button
                        type="button"
                        onClick={() => checkAdminAndLoad()}
                        className="mt-4 rounded-xl bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800"
                      >
                        Ongera ugerageze
                      </button>
                    </div>
                  </div>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 text-3xl">
                    👤
                  </div>

                  <h2 className="mt-5 text-lg font-bold">
                    Nta mukoresha abonetse
                  </h2>

                  <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                    Nta mukoresha uhuye na filter cyangwa search wahisemo.
                  </p>

                  {(filter !== "all" ||
                    statusFilter !== "all" ||
                    search) && (
                    <button
                      type="button"
                      onClick={() => {
                        setFilter("all")
                        setStatusFilter("all")
                        setSearch("")
                      }}
                      className="mt-5 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
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
                      className={`rounded-2xl border bg-white p-5 shadow-sm transition hover:shadow-md ${
                        user.is_active
                          ? "border-slate-200"
                          : "border-red-200 bg-red-50/20"
                      }`}
                    >
                      <div className="flex flex-col gap-5 lg:flex-row lg:items-center">

                        {/* USER */}
                        <div className="flex min-w-0 flex-1 items-center gap-4">
                          {user.avatar_url ? (
                            <img
                              src={user.avatar_url}
                              alt={user.full_name || "User"}
                              className="h-14 w-14 shrink-0 rounded-full object-cover ring-4 ring-slate-50"
                            />
                          ) : (
                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-black text-blue-700 ring-4 ring-slate-50">
                              {getInitials(user.full_name)}
                            </div>
                          )}

                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="truncate font-bold text-slate-900">
                                {user.full_name || "Umukoresha"}
                              </h3>

                              <span
                                className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-bold ${roleClasses(
                                  user.role
                                )}`}
                              >
                                {formatRole(user.role)}
                              </span>

                              <span
                                className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-bold ${
                                  user.is_active
                                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                    : "border-red-200 bg-red-50 text-red-700"
                                }`}
                              >
                                {user.is_active
                                  ? "● Active"
                                  : "● Suspended"}
                              </span>
                            </div>

                            <div className="mt-1 flex flex-col gap-1 text-sm text-slate-500 sm:flex-row sm:items-center sm:gap-3">
                              <span>
                                {user.phone ||
                                  "Phone ntaboneka"}
                              </span>

                              <span className="hidden text-slate-300 sm:inline">
                                •
                              </span>

                              <span>
                                Yinjiye{" "}
                                {formatDate(user.created_at)}
                              </span>
                            </div>

                            <p className="mt-2 max-w-xl truncate text-xs text-slate-400">
                              ID: {user.id}
                            </p>
                          </div>
                        </div>

                        {/* ACTIONS */}
                        <div className="flex flex-col gap-2 sm:flex-row lg:shrink-0">
                          <button
                            type="button"
                            onClick={() => openUser(user)}
                            className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                          >
                            Reba
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              openRoleModal(user)
                            }
                            disabled={
                              user.id === selectedUser?.id &&
                              actionLoading
                            }
                            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                          >
                            Role
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              openStatusModal(user)
                            }
                            className={`rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
                              user.is_active
                                ? "border-red-200 bg-white text-red-600 hover:bg-red-50"
                                : "border-emerald-200 bg-white text-emerald-700 hover:bg-emerald-50"
                            }`}
                          >
                            {user.is_active
                              ? "Suspend"
                              : "Restore"}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {!loading &&
              !error &&
              filteredUsers.length > 0 && (
                <div className="mt-5 text-sm text-slate-400">
                  Showing{" "}
                  <span className="font-semibold text-slate-600">
                    {filteredUsers.length}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-slate-600">
                    {users.length}
                  </span>{" "}
                  users
                </div>
              )}

            <footer className="mt-10 pb-4 text-center text-xs text-slate-400">
              KUGURISHA.COM · Users Management
            </footer>
          </div>
        </main>
      </div>

      {/* USER DETAILS MODAL */}
      {showDetails && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div
            className="absolute inset-0"
            onClick={closeDetails}
          />

          <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white shadow-2xl">
            <div className="sticky top-0 flex items-center justify-between border-b border-slate-100 bg-white px-6 py-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                  User Details
                </p>

                <h2 className="mt-1 text-lg font-bold">
                  Umukoresha
                </h2>
              </div>

              <button
                type="button"
                onClick={closeDetails}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-xl text-slate-500 hover:bg-slate-200"
              >
                ×
              </button>
            </div>

            <div className="p-6">
              <div className="flex flex-col items-center text-center">
                {selectedUser.avatar_url ? (
                  <img
                    src={selectedUser.avatar_url}
                    alt={selectedUser.full_name || "User"}
                    className="h-24 w-24 rounded-full object-cover ring-8 ring-slate-50"
                  />
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-full bg-blue-50 text-2xl font-black text-blue-700 ring-8 ring-slate-50">
                    {getInitials(selectedUser.full_name)}
                  </div>
                )}

                <h3 className="mt-5 text-xl font-black">
                  {selectedUser.full_name || "Umukoresha"}
                </h3>

                <div className="mt-2 flex flex-wrap justify-center gap-2">
                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-bold ${roleClasses(
                      selectedUser.role
                    )}`}
                  >
                    {formatRole(selectedUser.role)}
                  </span>

                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-bold ${
                      selectedUser.is_active
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-red-200 bg-red-50 text-red-700"
                    }`}
                  >
                    {selectedUser.is_active
                      ? "● Active"
                      : "● Suspended"}
                  </span>
                </div>
              </div>

              <div className="mt-7 space-y-3">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Phone
                  </p>

                  <p className="mt-1 font-semibold text-slate-800">
                    {selectedUser.phone ||
                      "Phone ntaboneka"}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Joined
                  </p>

                  <p className="mt-1 font-semibold text-slate-800">
                    {formatDate(selectedUser.created_at)}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        User ID
                      </p>

                      <p className="mt-1 truncate font-mono text-xs text-slate-700">
                        {selectedUser.id}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        copyUserId(selectedUser.id)
                      }
                      className="shrink-0 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100"
                    >
                      {copied ? "✓ Copied" : "Copy"}
                    </button>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Last Updated
                  </p>

                  <p className="mt-1 font-semibold text-slate-800">
                    {formatDate(selectedUser.updated_at)}
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() =>
                    openRoleModal(selectedUser)
                  }
                  className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
                >
                  🛡️ Change Role
                </button>

                <button
                  type="button"
                  onClick={() =>
                    openStatusModal(selectedUser)
                  }
                  className={`rounded-xl border px-4 py-3 text-sm font-bold ${
                    selectedUser.is_active
                      ? "border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                      : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                  }`}
                >
                  {selectedUser.is_active
                    ? "⛔ Suspend"
                    : "✓ Restore"}
                </button>
              </div>

              <div className="mt-5">
                <button
                  type="button"
                  onClick={closeDetails}
                  className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white hover:bg-slate-800"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ROLE MODAL */}
      {showRoleModal && selectedUser && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="absolute inset-0" />

          <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                  User Management
                </p>

                <h2 className="mt-1 text-xl font-black">
                  Change Role
                </h2>
              </div>

              <button
                type="button"
                onClick={closeActionModals}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-xl text-slate-500"
              >
                ×
              </button>
            </div>

            <p className="mt-4 text-sm leading-6 text-slate-500">
              Hindura uruhare rwa{" "}
              <strong className="text-slate-800">
                {selectedUser.full_name ||
                  "uyu mukoresha"}
              </strong>
              .
            </p>

            <div className="mt-5 space-y-2">
              {[
                {
                  value: "buyer" as Role,
                  label: "Buyer",
                  description: "Umuguzi",
                  icon: "🛒",
                },
                {
                  value: "seller" as Role,
                  label: "Seller",
                  description: "Umugurisha",
                  icon: "🏪",
                },
                {
                  value: "admin" as Role,
                  label: "Admin",
                  description: "Umuyobozi",
                  icon: "🛡️",
                },
              ].map((role) => (
                <button
                  key={role.value}
                  type="button"
                  onClick={() =>
                    setNewRole(role.value)
                  }
                  className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition ${
                    newRole === role.value
                      ? "border-blue-300 bg-blue-50 ring-2 ring-blue-100"
                      : "border-slate-200 bg-white hover:bg-slate-50"
                  }`}
                >
                  <span className="text-2xl">
                    {role.icon}
                  </span>

                  <span className="flex-1">
                    <span className="block font-bold text-slate-900">
                      {role.label}
                    </span>

                    <span className="block text-xs text-slate-500">
                      {role.description}
                    </span>
                  </span>

                  {newRole === role.value && (
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                      ✓
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={closeActionModals}
                disabled={actionLoading}
                className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={changeRole}
                disabled={actionLoading}
                className="flex-1 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {actionLoading
                  ? "Birimo..."
                  : "Save Role"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STATUS MODAL */}
      {showStatusModal && selectedUser && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="absolute inset-0" />

          <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-2xl">
              {selectedUser.is_active ? "⛔" : "✓"}
            </div>

            <h2 className="mt-5 text-xl font-black">
              {selectedUser.is_active
                ? "Suspend Account?"
                : "Restore Account?"}
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              {selectedUser.is_active
                ? `Ugiye guhagarika account ya ${
                    selectedUser.full_name ||
                    "uyu mukoresha"
                  }.`
                : `Ugiye kongera gufungura account ya ${
                    selectedUser.full_name ||
                    "uyu mukoresha"
                  }.`}
            </p>

            {selectedUser.is_active ? (
              <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4">
                <p className="text-sm leading-6 text-red-700">
                  Account izajya kuri{" "}
                  <strong>Suspended</strong>. Nta
                  destructive deletion iri gukorwa.
                </p>
              </div>
            ) : (
              <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                <p className="text-sm leading-6 text-emerald-700">
                  Account izongera kuba{" "}
                  <strong>Active</strong>.
                </p>
              </div>
            )}

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={closeActionModals}
                disabled={actionLoading}
                className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={toggleUserStatus}
                disabled={actionLoading}
                className={`flex-1 rounded-xl px-4 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60 ${
                  selectedUser.is_active
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-emerald-600 hover:bg-emerald-700"
                }`}
              >
                {actionLoading
                  ? "Birimo..."
                  : selectedUser.is_active
                    ? "Suspend"
                    : "Restore"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminUsers