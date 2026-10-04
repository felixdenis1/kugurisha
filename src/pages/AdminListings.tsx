import { useEffect, useMemo, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { supabase } from "../services/supabase"

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

type Profile = {
  id: string
  full_name: string | null
}

type Category = {
  id: string
  name: string
}

type Location = {
  id: string
  province: string
  district: string | null
  sector: string | null
}

type ListingImage = {
  listing_id: string
  image_url: string
  sort_order: number
}

type ListingFilter =
  | "all"
  | "active"
  | "pending"
  | "paused"
  | "sold"

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

  const [filter, setFilter] =
    useState<ListingFilter>("all")

  const [search, setSearch] = useState("")

  useEffect(() => {
    checkAdminAndLoad()
  }, [])

  async function checkAdminAndLoad(
    isRefresh = false
  ) {
    if (isRefresh) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }

    setError("")
    setSuccess("")

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError) {
        throw new Error(
          `Auth error: ${authError.message}`
        )
      }

      if (!user) {
        navigate("/login")
        return
      }

      const {
        data: adminProfile,
        error: adminError,
      } = await supabase
        .from("profiles")
        .select("id, role, is_active")
        .eq("id", user.id)
        .maybeSingle()

      if (adminError) {
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
          "Ntufite uburenganzira bwo kubona iyi page."
        )
      }

      if (!adminProfile.is_active) {
        await supabase.auth.signOut()
        navigate("/login")
        return
      }

      const {
        data: listingData,
        error: listingError,
      } = await supabase
        .from("listings")
        .select("*")
        .order("created_at", {
          ascending: false,
        })

      if (listingError) {
        throw new Error(
          `Listings error: ${listingError.message}`
        )
      }

      const listingList = listingData || []

      setListings(listingList)

      const sellerIds = Array.from(
        new Set(
          listingList
            .map((listing) => listing.seller_id)
            .filter(Boolean)
        )
      )

      const categoryIds = Array.from(
        new Set(
          listingList
            .map((listing) => listing.category_id)
            .filter(Boolean)
        )
      )

      const locationIds = Array.from(
        new Set(
          listingList
            .map((listing) => listing.location_id)
            .filter(Boolean)
        )
      )

      const listingIds = listingList.map(
        (listing) => listing.id
      )

      // SELLERS
      if (sellerIds.length > 0) {
        const {
          data,
          error,
        } = await supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", sellerIds)

        if (error) {
          console.error(
            "SELLERS ERROR:",
            error
          )
        }

        setProfiles(data || [])
      } else {
        setProfiles([])
      }

      // CATEGORIES
      if (categoryIds.length > 0) {
        const {
          data,
          error,
        } = await supabase
          .from("categories")
          .select("id, name")
          .in("id", categoryIds)

        if (error) {
          console.error(
            "CATEGORIES ERROR:",
            error
          )
        }

        setCategories(data || [])
      } else {
        setCategories([])
      }

      // LOCATIONS
      if (locationIds.length > 0) {
        const {
          data,
          error,
        } = await supabase
          .from("locations")
          .select(
            "id, province, district, sector"
          )
          .in("id", locationIds)

        if (error) {
          console.error(
            "LOCATIONS ERROR:",
            error
          )
        }

        setLocations(data || [])
      } else {
        setLocations([])
      }

      // IMAGES
      if (listingIds.length > 0) {
        const {
          data,
          error,
        } = await supabase
          .from("listing_images")
          .select(
            "listing_id, image_url, sort_order"
          )
          .in("listing_id", listingIds)
          .order("sort_order", {
            ascending: true,
          })

        if (error) {
          console.error(
            "IMAGES ERROR:",
            error
          )
        }

        setImages(data || [])
      } else {
        setImages([])
      }

      if (isRefresh) {
        setSuccess(
          "Listings zavuguruwe neza."
        )
      }
    } catch (err) {
      console.error(
        "ADMIN LISTINGS ERROR:",
        err
      )

      setError(
        err instanceof Error
          ? err.message
          : "Listings ntizashoboye gufunguka."
      )
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  function getSellerName(id: string) {
    const profile = profiles.find(
      (item) => item.id === id
    )

    return (
      profile?.full_name ||
      "Umukoresha"
    )
  }

  function getCategoryName(id: string) {
    const category = categories.find(
      (item) => item.id === id
    )

    return (
      category?.name ||
      "Category"
    )
  }

  function getLocationName(
    id: string | null
  ) {
    if (!id) {
      return "Aho giherereye ntihamenyekanye"
    }

    const location = locations.find(
      (item) => item.id === id
    )

    if (!location) {
      return "Aho giherereye ntihamenyekanye"
    }

    return [
      location.sector,
      location.district,
      location.province,
    ]
      .filter(Boolean)
      .join(", ")
  }

  function getListingImage(id: string) {
    const listingImage = images.find(
      (image) =>
        image.listing_id === id
    )

    return (
      listingImage?.image_url ||
      null
    )
  }

  function formatPrice(
    price: number | null,
    currency: string
  ) {
    if (
      price === null ||
      price === undefined
    ) {
      return "Igiciro nticyashyizweho"
    }

    return `${new Intl.NumberFormat(
      "en-US"
    ).format(price)} ${
      currency || "RWF"
    }`
  }

  function formatDate(date: string) {
    return new Date(
      date
    ).toLocaleDateString("rw-RW", {
      dateStyle: "medium",
    })
  }

  function statusLabel(
    status: string
  ) {
    const labels: Record<
      string,
      string
    > = {
      active: "Active",
      paused: "Paused",
      sold: "Sold",
      draft: "Pending",
    }

    return (
      labels[status] ||
      status
    )
  }

  function statusClasses(
    status: string
  ) {
    if (status === "active") {
      return "border-emerald-200 bg-emerald-50 text-emerald-700"
    }

    if (status === "paused") {
      return "border-amber-200 bg-amber-50 text-amber-700"
    }

    if (status === "sold") {
      return "border-blue-200 bg-blue-50 text-blue-700"
    }

    if (status === "draft") {
      return "border-purple-200 bg-purple-50 text-purple-700"
    }

    return "border-slate-200 bg-slate-50 text-slate-600"
  }

  function listingTypeLabel(
    type: string
  ) {
    const types: Record<
      string,
      string
    > = {
      sale: "Kugurisha",
      rent: "Gukodesha",
      free: "Ubuntu",
    }

    return (
      types[type] ||
      type
    )
  }

  const allCount = listings.length

  const activeCount =
    listings.filter(
      (listing) =>
        listing.status === "active"
    ).length

  const pendingCount =
    listings.filter(
      (listing) =>
        listing.status === "draft"
    ).length

  const pausedCount =
    listings.filter(
      (listing) =>
        listing.status === "paused"
    ).length

  const soldCount =
    listings.filter(
      (listing) =>
        listing.status === "sold"
    ).length

  const filteredListings =
    useMemo(() => {
      const searchText =
        search.trim().toLowerCase()

      return listings.filter(
        (listing) => {
          let matchesStatus = true

          if (
            filter === "pending"
          ) {
            matchesStatus =
              listing.status ===
              "draft"
          } else if (
            filter !== "all"
          ) {
            matchesStatus =
              listing.status ===
              filter
          }

          if (!matchesStatus) {
            return false
          }

          if (!searchText) {
            return true
          }

          const sellerName =
            getSellerName(
              listing.seller_id
            )

          const categoryName =
            getCategoryName(
              listing.category_id
            )

          const locationName =
            getLocationName(
              listing.location_id
            )

          const matchesSearch =
            listing.title
              .toLowerCase()
              .includes(searchText) ||
            listing.description
              ?.toLowerCase()
              .includes(searchText) ||
            sellerName
              .toLowerCase()
              .includes(searchText) ||
            categoryName
              .toLowerCase()
              .includes(searchText) ||
            locationName
              .toLowerCase()
              .includes(searchText) ||
            listing.id
              .toLowerCase()
              .includes(searchText)

          return Boolean(
            matchesSearch
          )
        }
      )
    }, [
      listings,
      filter,
      search,
      profiles,
      categories,
      locations,
    ])

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen">

        {/* SIDEBAR */}
        <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white lg:flex lg:flex-col">
          <div className="border-b border-slate-100 px-6 py-5">
            <Link
              to="/"
              className="block"
            >
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
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
            >
              <span>👥</span>
              Users
            </Link>

            <Link
              to="/admin/listings"
              className="flex items-center justify-between rounded-xl bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700"
            >
              <span className="flex items-center gap-3">
                <span>🏷️</span>
                Listings
              </span>

              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-bold text-blue-700">
                {allCount}
              </span>
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

          {/* HEADER */}
          <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
            <div className="flex items-center justify-between gap-4 px-5 py-4 sm:px-8">

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                  Admin Center
                </p>

                <h1 className="mt-1 text-xl font-bold sm:text-2xl">
                  Listings Management
                </h1>
              </div>

              <div className="flex items-center gap-2">

                <button
                  type="button"
                  onClick={() =>
                    checkAdminAndLoad(
                      true
                    )
                  }
                  disabled={
                    refreshing
                  }
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {refreshing
                    ? "..."
                    : "↻ Refresh"}
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
                  🏷️
                </div>

                <div>
                  <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                    Listings
                  </h2>

                  <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
                    Reba listings ziri kuri
                    marketplace, status zazo,
                    abagurisha, categories n’aho
                    ziherereye.
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
                    onClick={() =>
                      setSuccess("")
                    }
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

                  <span className="text-xl">
                    ⚠️
                  </span>

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
                    onClick={() =>
                      setError("")
                    }
                    className="text-red-600 hover:text-red-800"
                  >
                    ×
                  </button>
                </div>
              </div>
            )}

            {/* STATS */}
            {!loading &&
              !error && (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">

                  {/* ALL */}
                  <button
                    type="button"
                    onClick={() =>
                      setFilter("all")
                    }
                    className={`rounded-2xl border bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
                      filter === "all"
                        ? "border-blue-300 ring-2 ring-blue-100"
                        : "border-slate-200"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-slate-500">
                        All
                      </p>

                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50">
                        🏷️
                      </span>
                    </div>

                    <p className="mt-4 text-3xl font-black">
                      {allCount}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Listings zose
                    </p>
                  </button>

                  {/* ACTIVE */}
                  <button
                    type="button"
                    onClick={() =>
                      setFilter("active")
                    }
                    className={`rounded-2xl border bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
                      filter === "active"
                        ? "border-emerald-300 ring-2 ring-emerald-100"
                        : "border-slate-200"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-slate-500">
                        Active
                      </p>

                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50">
                        ✓
                      </span>
                    </div>

                    <p className="mt-4 text-3xl font-black">
                      {activeCount}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Ziri ku isoko
                    </p>
                  </button>

                  {/* PENDING */}
                  <button
                    type="button"
                    onClick={() =>
                      setFilter("pending")
                    }
                    className={`rounded-2xl border bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
                      filter === "pending"
                        ? "border-purple-300 ring-2 ring-purple-100"
                        : "border-slate-200"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-slate-500">
                        Pending
                      </p>

                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50">
                        ⏳
                      </span>
                    </div>

                    <p className="mt-4 text-3xl font-black">
                      {pendingCount}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Zitegereje
                    </p>
                  </button>

                  {/* PAUSED */}
                  <button
                    type="button"
                    onClick={() =>
                      setFilter("paused")
                    }
                    className={`rounded-2xl border bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
                      filter === "paused"
                        ? "border-amber-300 ring-2 ring-amber-100"
                        : "border-slate-200"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-slate-500">
                        Paused
                      </p>

                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50">
                        ⏸
                      </span>
                    </div>

                    <p className="mt-4 text-3xl font-black">
                      {pausedCount}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Zarahagaritswe
                    </p>
                  </button>

                  {/* SOLD */}
                  <button
                    type="button"
                    onClick={() =>
                      setFilter("sold")
                    }
                    className={`rounded-2xl border bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
                      filter === "sold"
                        ? "border-blue-300 ring-2 ring-blue-100"
                        : "border-slate-200"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-slate-500">
                        Sold
                      </p>

                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50">
                        💰
                      </span>
                    </div>

                    <p className="mt-4 text-3xl font-black">
                      {soldCount}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Byagurishijwe
                    </p>
                  </button>
                </div>
              )}

            {/* SEARCH + FILTER */}
            {!loading &&
              !error && (
                <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                    <div className="relative w-full lg:max-w-md">
                      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                        🔎
                      </span>

                      <input
                        value={search}
                        onChange={(event) =>
                          setSearch(
                            event.target.value
                          )
                        }
                        placeholder="Shakisha listing, seller, category..."
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50"
                      />
                    </div>

                    <div className="flex flex-wrap gap-2">

                      {(
                        [
                          ["all", "Zose"],
                          [
                            "active",
                            "Active",
                          ],
                          [
                            "pending",
                            "Pending",
                          ],
                          [
                            "paused",
                            "Paused",
                          ],
                          [
                            "sold",
                            "Sold",
                          ],
                        ] as [
                          ListingFilter,
                          string
                        ][]
                      ).map(
                        ([value, label]) => (
                          <button
                            key={value}
                            type="button"
                            onClick={() =>
                              setFilter(
                                value
                              )
                            }
                            className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                              filter === value
                                ? "bg-slate-900 text-white"
                                : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                            }`}
                          >
                            {label}
                          </button>
                        )
                      )}
                    </div>
                  </div>
                </div>
              )}

            {/* CONTENT */}
            <div className="mt-6">

              {/* LOADING */}
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4].map(
                    (item) => (
                      <div
                        key={item}
                        className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5"
                      >
                        <div className="flex gap-5">
                          <div className="h-28 w-28 shrink-0 rounded-xl bg-slate-100" />

                          <div className="flex-1">
                            <div className="h-4 w-52 rounded bg-slate-100" />

                            <div className="mt-3 h-6 w-72 rounded bg-slate-100" />

                            <div className="mt-3 h-4 w-full max-w-lg rounded bg-slate-100" />

                            <div className="mt-5 h-4 w-80 rounded bg-slate-100" />
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>
              ) : error ? (

                /* ERROR */
                <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
                  <div className="flex items-start gap-4">

                    <span className="text-2xl">
                      ⚠️
                    </span>

                    <div>
                      <h2 className="font-bold text-red-800">
                        Habaye ikibazo
                      </h2>

                      <p className="mt-1 text-sm leading-6 text-red-700">
                        {error}
                      </p>

                      <button
                        type="button"
                        onClick={() =>
                          checkAdminAndLoad()
                        }
                        className="mt-4 rounded-xl bg-red-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-800"
                      >
                        Ongera ugerageze
                      </button>
                    </div>
                  </div>
                </div>

              ) : filteredListings.length === 0 ? (

                /* EMPTY */
                <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">

                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 text-3xl">
                    🏷️
                  </div>

                  <h2 className="mt-5 text-lg font-bold">
                    Nta listings zabonetse
                  </h2>

                  <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                    Nta listing ihuye na filter
                    cyangwa search wahisemo.
                  </p>

                  {(filter !==
                    "all" ||
                    search) && (
                    <button
                      type="button"
                      onClick={() => {
                        setFilter(
                          "all"
                        )
                        setSearch("")
                      }}
                      className="mt-5 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
                    >
                      Reset filters
                    </button>
                  )}
                </div>

              ) : (

                /* LISTINGS */
                <div className="space-y-4">

                  {filteredListings.map(
                    (listing) => {
                      const image =
                        getListingImage(
                          listing.id
                        )

                      return (
                        <div
                          key={
                            listing.id
                          }
                          className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
                        >
                          <div className="flex flex-col gap-5 p-5 sm:flex-row sm:p-6">

                            {/* IMAGE */}
                            <div className="h-52 w-full shrink-0 overflow-hidden rounded-xl bg-slate-100 sm:h-32 sm:w-40">

                              {image ? (
                                <img
                                  src={
                                    image
                                  }
                                  alt={
                                    listing.title
                                  }
                                  className="h-full w-full object-cover transition duration-300 hover:scale-105"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-4xl text-slate-300">
                                  🏷️
                                </div>
                              )}
                            </div>

                            {/* INFO */}
                            <div className="min-w-0 flex-1">

                              <div className="flex flex-wrap items-center gap-2">

                                <span
                                  className={`rounded-full border px-3 py-1 text-xs font-bold ${statusClasses(
                                    listing.status
                                  )}`}
                                >
                                  {statusLabel(
                                    listing.status
                                  )}
                                </span>

                                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
                                  {getCategoryName(
                                    listing.category_id
                                  )}
                                </span>
                              </div>

                              <h3 className="mt-3 line-clamp-2 text-lg font-bold text-slate-900 sm:text-xl">
                                {
                                  listing.title
                                }
                              </h3>

                              <p className="mt-2 text-lg font-black text-blue-600">
                                {formatPrice(
                                  listing.price,
                                  listing.currency
                                )}
                              </p>

                              {listing.description && (
                                <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
                                  {
                                    listing.description
                                  }
                                </p>
                              )}

                              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-500">

                                <span>
                                  👤{" "}
                                  {getSellerName(
                                    listing.seller_id
                                  )}
                                </span>

                                <span>
                                  📍{" "}
                                  {getLocationName(
                                    listing.location_id
                                  )}
                                </span>
                              </div>

                              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-400">

                                <span>
                                  {listingTypeLabel(
                                    listing.listing_type
                                  )}
                                </span>

                                {listing.condition && (
                                  <>
                                    <span>
                                      •
                                    </span>

                                    <span>
                                      {
                                        listing.condition
                                      }
                                    </span>
                                  </>
                                )}

                                <span>
                                  •
                                </span>

                                <span>
                                  👁{" "}
                                  {
                                    listing.views_count
                                  }{" "}
                                  views
                                </span>

                                <span>
                                  •
                                </span>

                                <span>
                                  {formatDate(
                                    listing.created_at
                                  )}
                                </span>
                              </div>
                            </div>

                            {/* ACTIONS */}
                            <div className="flex shrink-0 items-start sm:pt-1">
                              <button
                                type="button"
                                onClick={() =>
                                  navigate(
                                    `/listing/${listing.id}`
                                  )
                                }
                                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 sm:w-auto"
                              >
                                Reba →
                              </button>
                            </div>
                          </div>
                        </div>
                      )
                    }
                  )}
                </div>
              )}
            </div>

            {/* RESULT COUNT */}
            {!loading &&
              !error &&
              filteredListings.length >
                0 && (
                <div className="mt-5 flex flex-wrap items-center justify-between gap-2 text-sm text-slate-400">
                  <span>
                    Showing{" "}
                    <span className="font-semibold text-slate-600">
                      {
                        filteredListings.length
                      }
                    </span>{" "}
                    of{" "}
                    <span className="font-semibold text-slate-600">
                      {
                        listings.length
                      }
                    </span>{" "}
                    listings
                  </span>

                  {filter !==
                    "all" && (
                    <button
                      type="button"
                      onClick={() =>
                        setFilter(
                          "all"
                        )
                      }
                      className="font-semibold text-blue-600 hover:text-blue-700"
                    >
                      Clear filter
                    </button>
                  )}
                </div>
              )}

            <footer className="mt-10 pb-4 text-center text-xs text-slate-400">
              KUGURISHA.COM · Listings Management
            </footer>
          </div>
        </main>
      </div>
    </div>
  )
}

export default AdminListings