import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "../services/supabase"
import { logActivity } from "../services/activityLog"

type Listing = {
  id: string
  seller_id: string
  category_id: string
  location_id: string | null
  title: string
  description: string | null
  price: number | null
  currency: string
  condition: string | null
  status: string
  listing_type: string
  views_count: number
  created_at: string
  updated_at: string
}

type Profile = { id: string; full_name: string | null }
type Category = { id: string; name: string }
type Location = { id: string; province: string; district: string | null; sector: string | null }
type ListingImage = { listing_id: string; image_url: string; sort_order: number }
type ListingFilter = "all" | "active" | "pending" | "paused" | "sold" | "deleted"

function AdminListings() {
  const navigate = useNavigate()

  const [listings, setListings] = useState<Listing[]>([])
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [locations, setLocations] = useState<Location[]>([])
  const [images, setImages] = useState<ListingImage[]>([])

  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const [filter, setFilter] = useState<ListingFilter>("all")
  const [search, setSearch] = useState("")
  const [updatingId, setUpdatingId] = useState<string | null>(null)

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
      if (adminProfile.role !== "admin") throw new Error("Ntufite uburenganzira bwo kubona iyi page.")

      if (!adminProfile.is_active) {
        await supabase.auth.signOut()
        navigate("/login")
        return
      }

      const { data: listingData, error: listingError } = await supabase
        .from("listings")
        .select("*")
        .order("created_at", { ascending: false })

      if (listingError) throw new Error(`Listings error: ${listingError.message}`)

      const listingList = listingData || []
      setListings(listingList)

      const sellerIds = Array.from(new Set(listingList.map(l => l.seller_id).filter(Boolean)))
      const categoryIds = Array.from(new Set(listingList.map(l => l.category_id).filter(Boolean)))
      const locationIds = Array.from(new Set(listingList.map(l => l.location_id).filter(Boolean)))
      const listingIds = listingList.map(l => l.id)

      if (sellerIds.length > 0) {
        const { data } = await supabase.from("profiles").select("id, full_name").in("id", sellerIds)
        setProfiles(data || [])
      }
      if (categoryIds.length > 0) {
        const { data } = await supabase.from("categories").select("id, name").in("id", categoryIds)
        setCategories(data || [])
      }
      if (locationIds.length > 0) {
        const { data } = await supabase.from("locations").select("id, province, district, sector").in("id", locationIds)
        setLocations(data || [])
      }
      if (listingIds.length > 0) {
        const { data } = await supabase
          .from("listing_images")
          .select("listing_id, image_url, sort_order")
          .in("listing_id", listingIds)
          .order("sort_order", { ascending: true })
        setImages(data || [])
      }

      if (isRefresh) setSuccess("Listings zavuguruwe neza.")
    } catch (err) {
      console.error("ADMIN LISTINGS ERROR:", err)
      setError(err instanceof Error ? err.message : "Listings ntizashoboye gufunguka.")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  async function updateListingStatus(id: string, newStatus: string) {
    setUpdatingId(id)
    setError("")

    const target = listings.find((l) => l.id === id)

    const { error } = await supabase
      .from("listings")
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq("id", id)

    if (error) {
      setError(error.message)
    } else {
      setListings(curr => curr.map(l => l.id === id ? { ...l, status: newStatus } : l))
      setSuccess(`Listing yahinduwe kuri status: ${newStatus}`)
      setTimeout(() => setSuccess(""), 3000)

      // ✅ Log activity
      void logActivity({
        action:
          newStatus === "paused"
            ? "listing.pause"
            : newStatus === "active"
            ? "listing.active"
            : `listing.${newStatus}`,
        entity_type: "listing",
        entity_id: id,
        entity_label: target?.title || "Unknown listing",
        details: { new_status: newStatus, previous_status: target?.status },
      })
    }
    setUpdatingId(null)
  }

  async function permanentlyDeleteListing(id: string, title: string) {
    const confirmed = window.confirm(
      `Urabyemeza ko ushaka gusiba burundu iyi listing?\n\n"${title}"\n\nIki gikorwa ntikizagaruka.`
    )
    if (!confirmed) return

    setUpdatingId(id)
    setError("")

    try {
      await supabase.from("listing_images").delete().eq("listing_id", id)
      const { error } = await supabase.from("listings").delete().eq("id", id)
      if (error) throw error

      setListings(curr => curr.filter(l => l.id !== id))
      setSuccess("Listing yasibwe burundu.")
      setTimeout(() => setSuccess(""), 3000)

      // ✅ Log activity
      void logActivity({
        action: "listing.delete",
        entity_type: "listing",
        entity_id: id,
        entity_label: title,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ntibyashobotse gusiba listing.")
    } finally {
      setUpdatingId(null)
    }
  }

  // Helpers
  function getSellerName(id: string) {
    return profiles.find(p => p.id === id)?.full_name || "Umukoresha"
  }
  function getCategoryName(id: string) {
    return categories.find(c => c.id === id)?.name || "Category"
  }
  function getLocationName(id: string | null) {
    if (!id) return "Aho giherereye ntihamenyekanye"
    const loc = locations.find(l => l.id === id)
    if (!loc) return "Aho giherereye ntihamenyekanye"
    return [loc.sector, loc.district, loc.province].filter(Boolean).join(", ")
  }
  function getListingImage(id: string) {
    return images.find(img => img.listing_id === id)?.image_url || null
  }
  function formatPrice(price: number | null, currency: string) {
    if (price === null || price === undefined) return "Igiciro nticyashyizweho"
    return `${new Intl.NumberFormat("en-US").format(price)} ${currency || "RWF"}`
  }
  function formatDate(date: string) {
    return new Date(date).toLocaleDateString("rw-RW", { dateStyle: "medium" })
  }

  function statusLabel(status: string) {
    const labels: Record<string, string> = { active: "Active", paused: "Paused", sold: "Sold", draft: "Pending", deleted: "Deleted" }
    return labels[status] || status
  }
  function statusClasses(status: string) {
    if (status === "active") return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400"
    if (status === "paused") return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400"
    if (status === "sold") return "border-slate-200 bg-slate-50 text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
    if (status === "draft") return "border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-500/30 dark:bg-purple-500/10 dark:text-purple-400"
    if (status === "deleted") return "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-400"
    return "border-slate-200 bg-slate-50 text-slate-600"
  }

  // Counts
  const allCount = listings.length
  const activeCount = listings.filter(l => l.status === "active").length
  const pendingCount = listings.filter(l => l.status === "draft").length
  const pausedCount = listings.filter(l => l.status === "paused").length
  const soldCount = listings.filter(l => l.status === "sold").length
  const deletedCount = listings.filter(l => l.status === "deleted").length

  const filteredListings = useMemo(() => {
    const searchText = search.trim().toLowerCase()
    return listings.filter(listing => {
      let matchesStatus = true
      if (filter === "pending") matchesStatus = listing.status === "draft"
      else if (filter !== "all") matchesStatus = listing.status === filter

      if (!matchesStatus) return false
      if (!searchText) return true

      const matchesSearch =
        listing.title.toLowerCase().includes(searchText) ||
        listing.description?.toLowerCase().includes(searchText) ||
        getSellerName(listing.seller_id).toLowerCase().includes(searchText) ||
        getCategoryName(listing.category_id).toLowerCase().includes(searchText) ||
        listing.id.toLowerCase().includes(searchText)
      return Boolean(matchesSearch)
    })
  }, [listings, filter, search, profiles, categories, locations])

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      {/* PAGE HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Listings Management
          </h1>
          <p className="mt-2 max-w-2xl text-sm font-medium text-slate-500 dark:text-slate-400">
            Reba listings ziri kuri marketplace. Nk'umuyobozi, ushobora guhagarika (Pause) cyangwa ukarura (Restore) listings, cyangwa ukasiba burundu izisibwe n'abagurisha.
          </p>
        </div>
        <button
          onClick={() => checkAdminAndLoad(true)}
          disabled={refreshing}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
        >
          <svg className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
          {refreshing ? "Biravugurura..." : "Refresh Data"}
        </button>
      </div>

      {/* SUCCESS / ERROR */}
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

      {/* STATS FILTERS */}
      {!loading && !error && (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
          {[
            { key: "all", label: "All", count: allCount, icon: "🏷️", color: "border-slate-300 ring-slate-100 text-slate-700 dark:border-white/20 dark:ring-white/10 dark:text-white" },
            { key: "active", label: "Active", count: activeCount, icon: "✓", color: "border-emerald-300 ring-emerald-100 text-emerald-700 dark:border-emerald-500/40 dark:ring-emerald-500/20 dark:text-emerald-400" },
            { key: "pending", label: "Pending", count: pendingCount, icon: "⏳", color: "border-purple-300 ring-purple-100 text-purple-700 dark:border-purple-500/40 dark:ring-purple-500/20 dark:text-purple-400" },
            { key: "paused", label: "Paused", count: pausedCount, icon: "⏸", color: "border-amber-300 ring-amber-100 text-amber-700 dark:border-amber-500/40 dark:ring-amber-500/20 dark:text-amber-400" },
            { key: "sold", label: "Sold", count: soldCount, icon: "💰", color: "border-slate-300 ring-slate-100 text-slate-700 dark:border-white/20 dark:ring-white/10 dark:text-white" },
            { key: "deleted", label: "Deleted", count: deletedCount, icon: "🗑️", color: "border-rose-300 ring-rose-100 text-rose-700 dark:border-rose-500/40 dark:ring-rose-500/20 dark:text-rose-400" },
          ].map((tab) => {
            const isActive = filter === tab.key
            return (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key as ListingFilter)}
                className={`group rounded-2xl border bg-white/80 p-4 text-left shadow-sm backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:bg-white/[0.03] ${
                  isActive ? `ring-2 ${tab.color}` : "border-slate-200/80 dark:border-white/10"
                }`}
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">{tab.label}</p>
                  <span className="text-lg">{tab.icon}</span>
                </div>
                <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">{tab.count}</p>
              </button>
            )
          })}
        </div>
      )}

      {/* SEARCH BAR */}
      {!loading && !error && (
        <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-2 shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-white/[0.03]">
          <div className="relative">
            <svg className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Shakisha listing, umugurisha, cyangwa category..."
              className="w-full rounded-xl border-none bg-transparent py-2.5 pl-11 pr-4 text-sm font-semibold outline-none placeholder:text-slate-400 focus:ring-0 dark:text-white"
            />
          </div>
        </div>
      )}

      {/* CONTENT */}
      <div className="mt-4">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => <div key={i} className="h-40 animate-pulse rounded-2xl bg-white/50 dark:bg-white/5" />)}
          </div>
        ) : filteredListings.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white/50 py-20 text-center dark:border-white/10 dark:bg-white/[0.02]">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-3xl dark:bg-white/5">🏷️</div>
            <h3 className="mt-5 text-lg font-black text-slate-900 dark:text-white">Nta listings zabonetse</h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">Nta listing ihuye na filter cyangwa search wahisemo.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredListings.map((listing) => {
              const image = getListingImage(listing.id)
              const isUpdating = updatingId === listing.id

              return (
                <div key={listing.id} className="group overflow-hidden rounded-2xl border border-slate-200/80 bg-white/80 shadow-sm backdrop-blur-sm transition hover:border-[#10b981]/30 hover:shadow-md dark:border-white/10 dark:bg-[#0f1716]/80">
                  <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:p-5">

                    {/* IMAGE */}
                    <div className="h-40 w-full shrink-0 overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800 sm:h-24 sm:w-32">
                      {image ? (
                        <img src={image} alt={listing.title} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-3xl text-slate-300 dark:text-slate-600">🏷️</div>
                      )}
                    </div>

                    {/* INFO */}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${statusClasses(listing.status)}`}>
                          {statusLabel(listing.status)}
                        </span>
                        <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[10px] font-bold text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                          {getCategoryName(listing.category_id)}
                        </span>
                      </div>
                      <h3 className="mt-2 line-clamp-1 text-base font-black text-slate-900 dark:text-white">{listing.title}</h3>
                      <p className="mt-1 text-sm font-black text-[#059669] dark:text-[#34d399]">{formatPrice(listing.price, listing.currency)}</p>

                      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1">👤 {getSellerName(listing.seller_id)}</span>
                        <span className="flex items-center gap-1">📍 {getLocationName(listing.location_id)}</span>
                        <span className="flex items-center gap-1">👁 {listing.views_count} views</span>
                        <span>•</span>
                        <span>{formatDate(listing.created_at)}</span>
                      </div>
                    </div>

                    {/* ACTIONS */}
                    <div className="flex shrink-0 flex-wrap items-center gap-2 border-t border-slate-100 pt-3 sm:border-none sm:pt-0">
                      <button
                        onClick={() => navigate(`/listing/${listing.id}`)}
                        className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
                      >
                        Reba
                      </button>

                      {/* ADMIN CONTROLS */}
                      {listing.status === "active" && (
                        <button
                          onClick={() => updateListingStatus(listing.id, "paused")}
                          disabled={isUpdating}
                          className="rounded-xl bg-amber-500 px-3.5 py-2 text-xs font-bold text-white transition hover:bg-amber-600 disabled:opacity-50"
                        >
                          {isUpdating ? "..." : "Pause"}
                        </button>
                      )}

                      {listing.status === "paused" && (
                        <button
                          onClick={() => updateListingStatus(listing.id, "active")}
                          disabled={isUpdating}
                          className="rounded-xl bg-[#10b981] px-3.5 py-2 text-xs font-bold text-white transition hover:bg-[#059669] disabled:opacity-50"
                        >
                          {isUpdating ? "..." : "Restore"}
                        </button>
                      )}

                      {/* ONLY SHOW REMOVE BUTTON IF DELETED */}
                      {listing.status === "deleted" && (
                        <button
                          onClick={() => permanentlyDeleteListing(listing.id, listing.title)}
                          disabled={isUpdating}
                          className="rounded-xl bg-rose-600 px-3.5 py-2 text-xs font-bold text-white transition hover:bg-rose-700 disabled:opacity-50"
                        >
                          {isUpdating ? "..." : "Remove"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {!loading && !error && filteredListings.length > 0 && (
        <p className="text-center text-xs font-bold text-slate-400">
          Showing {filteredListings.length} of {listings.length} listings
        </p>
      )}
    </div>
  )
}

export default AdminListings