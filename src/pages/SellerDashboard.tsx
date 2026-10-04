import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { supabase } from "../services/supabase"

type Listing = {
  id: string
  title: string
  description: string | null
  price: number | null
  currency: string
  status: string
  listing_type: string
  created_at: string
  category: {
    name: string
  }[] | null
}

function SellerDashboard() {
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState("")
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    loadListings()
  }, [])

  async function loadListings() {
    try {
      setLoading(true)
      setMessage("")

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        window.location.href = "/login"
        return
      }

      const { data, error } = await supabase
        .from("listings")
        .select(`
          id,
          title,
          description,
          price,
          currency,
          status,
          listing_type,
          created_at,
          category:categories (
            name
          )
        `)
        .eq("seller_id", user.id)
        .order("created_at", {
          ascending: false,
        })

      if (error) {
        console.error(error)
        setMessage(error.message)
        return
      }

      setListings(data || [])
    } catch (error) {
      console.error(error)

      setMessage(
        "Habaye ikibazo mu kuzana listings zawe.",
      )
    } finally {
      setLoading(false)
    }
  }

  async function updateStatus(
    listingId: string,
    status: "active" | "paused" | "sold",
  ) {
    setUpdatingId(listingId)

    const { error } = await supabase
      .from("listings")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", listingId)

    if (error) {
      console.error(error)
      alert(error.message)
      setUpdatingId(null)
      return
    }

    setListings((current) =>
      current.map((listing) =>
        listing.id === listingId
          ? {
              ...listing,
              status,
            }
          : listing,
      ),
    )

    setUpdatingId(null)
  }

  async function deleteListing(listingId: string) {
    const confirmed = window.confirm(
      "Urashaka koko gusiba iyi listing?",
    )

    if (!confirmed) return

    setDeletingId(listingId)

    const { error } = await supabase
      .from("listings")
      .delete()
      .eq("id", listingId)

    if (error) {
      console.error(error)
      alert(error.message)
      setDeletingId(null)
      return
    }

    setListings((current) =>
      current.filter(
        (listing) => listing.id !== listingId,
      ),
    )

    setDeletingId(null)
  }

  function formatPrice(listing: Listing) {
    if (listing.listing_type === "free") {
      return "Ubuntu"
    }

    if (listing.price === null) {
      return "Twandikire ku giciro"
    }

    return `${Number(
      listing.price,
    ).toLocaleString("en-US")} Frw`
  }

  function statusLabel(status: string) {
    switch (status) {
      case "active":
        return "Biraboneka"

      case "paused":
        return "Byahagaritswe"

      case "sold":
        return "Byagurishijwe"

      case "pending":
        return "Birategereje"

      case "rejected":
        return "Byanzwe"

      case "draft":
        return "Draft"

      case "expired":
        return "Byarangiye"

      default:
        return status
    }
  }

  function statusClass(status: string) {
    switch (status) {
      case "active":
        return "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"

      case "sold":
        return "border-blue-500/20 bg-blue-500/10 text-blue-400"

      case "paused":
        return "border-amber-500/20 bg-amber-500/10 text-amber-400"

      case "rejected":
        return "border-red-500/20 bg-red-500/10 text-red-400"

      default:
        return "kg-border kg-soft kg-text-secondary"
    }
  }

  const activeCount = listings.filter(
    (listing) => listing.status === "active",
  ).length

  const soldCount = listings.filter(
    (listing) => listing.status === "sold",
  ).length

  const pausedCount = listings.filter(
    (listing) => listing.status === "paused",
  ).length

  return (
    <main className="kg-bg kg-text min-h-screen transition-colors duration-200">
      {/* Header */}
      <header className="kg-surface sticky top-0 z-40 border-b kg-border backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link
            to="/"
            className="text-xl font-black tracking-tight sm:text-2xl"
          >
            KUGURISHA
            <span className="text-blue-600">
              .COM
            </span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/"
              className="kg-text-secondary kg-soft rounded-xl px-3 py-2 text-sm font-bold transition sm:block"
            >
              Ahabanza
            </Link>

            <Link
              to="/favorites"
              className="kg-text-secondary kg-soft hidden rounded-xl px-3 py-2 text-sm font-bold transition sm:block"
            >
              Ibyo Nakunze
            </Link>

            <Link
              to="/create-listing"
              className="rounded-xl bg-[var(--inverse-bg)] px-4 py-2.5 text-sm font-black text-[var(--inverse-text)] shadow-sm transition hover:bg-blue-600 hover:text-white"
            >
              <span className="sm:hidden">
                + Gurisha
              </span>

              <span className="hidden sm:inline">
                + Shyiraho itangazo
              </span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        {/* Hero */}
        <section className="relative overflow-hidden rounded-[32px] bg-[#09090b] px-6 py-8 text-white shadow-xl sm:px-10 sm:py-10">
          <div className="pointer-events-none absolute -right-24 -top-28 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />

          <div className="pointer-events-none absolute -bottom-32 left-1/3 h-80 w-80 rounded-full bg-indigo-500/10 blur-3xl" />

          <div className="relative flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-bold text-slate-300 backdrop-blur">
                <span className="h-2 w-2 rounded-full bg-blue-400" />
                Seller Dashboard
              </div>

              <h1 className="text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
                Ibyo nagurisha
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
                Reba, hindura kandi ucunge
                amatangazo yawe yose ahantu hamwe.
              </p>
            </div>

            <Link
              to="/create-listing"
              className="relative inline-flex items-center justify-center rounded-2xl bg-white px-5 py-3.5 text-sm font-black text-slate-950 shadow-lg transition hover:-translate-y-0.5 hover:bg-blue-50"
            >
              + Shyiraho ikindi
            </Link>
          </div>
        </section>

        {/* Stats */}
        <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="kg-surface kg-border rounded-[24px] border p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="kg-text-secondary text-sm font-bold">
                Listings zose
              </p>

              <span className="kg-soft flex h-10 w-10 items-center justify-center rounded-xl text-lg">
                ◈
              </span>
            </div>

            <p className="kg-text mt-4 text-3xl font-black tracking-tight">
              {listings.length}
            </p>

            <p className="kg-text-muted mt-1 text-xs font-medium">
              Amatangazo yose ufite
            </p>
          </div>

          <div className="kg-surface kg-border rounded-[24px] border p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="kg-text-secondary text-sm font-bold">
                Ziracyaboneka
              </p>

              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
                ✓
              </span>
            </div>

            <p className="mt-4 text-3xl font-black tracking-tight text-emerald-500">
              {activeCount}
            </p>

            <p className="kg-text-muted mt-1 text-xs font-medium">
              Ziri ku isoko ubu
            </p>
          </div>

          <div className="kg-surface kg-border rounded-[24px] border p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="kg-text-secondary text-sm font-bold">
                Byagurishijwe
              </p>

              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
                ✓
              </span>
            </div>

            <p className="mt-4 text-3xl font-black tracking-tight text-blue-500">
              {soldCount}
            </p>

            <p className="kg-text-muted mt-1 text-xs font-medium">
              Byamaze kubona umuguzi
            </p>
          </div>

          <div className="kg-surface kg-border rounded-[24px] border p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="kg-text-secondary text-sm font-bold">
                Byahagaritswe
              </p>

              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
                II
              </span>
            </div>

            <p className="mt-4 text-3xl font-black tracking-tight text-amber-500">
              {pausedCount}
            </p>

            <p className="kg-text-muted mt-1 text-xs font-medium">
              Zitarimo kugaragara
            </p>
          </div>
        </section>

        {/* Error */}
        {!loading && message && (
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-red-400">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-500/10 font-black">
              !
            </div>

            <div>
              <p className="font-black">
                Habaye ikibazo
              </p>

              <p className="mt-1 text-sm leading-5 text-red-400">
                {message}
              </p>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <section className="mt-8 space-y-4">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="kg-surface kg-border animate-pulse overflow-hidden rounded-[28px] border p-5"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex-1">
                    <div className="kg-soft h-6 w-28 rounded-full" />

                    <div className="kg-soft mt-4 h-6 w-2/3 rounded-lg" />

                    <div className="kg-soft mt-3 h-5 w-40 rounded-lg" />

                    <div className="kg-soft mt-3 h-4 max-w-xl rounded" />
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <div className="kg-soft h-11 w-20 rounded-xl" />
                    <div className="kg-soft h-11 w-24 rounded-xl" />
                    <div className="kg-soft h-11 w-24 rounded-xl" />
                  </div>
                </div>
              </div>
            ))}
          </section>
        )}

        {/* Empty */}
        {!loading &&
          !message &&
          listings.length === 0 && (
            <section className="kg-surface kg-border mt-8 overflow-hidden rounded-[32px] border shadow-sm">
              <div className="flex min-h-[430px] flex-col items-center justify-center px-6 py-16 text-center">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-blue-500/10 text-4xl text-blue-500">
                  +
                </div>

                <h2 className="kg-text mt-7 text-2xl font-black tracking-tight sm:text-3xl">
                  Nta listing ufite
                </h2>

                <p className="kg-text-secondary mx-auto mt-3 max-w-md text-sm leading-6 sm:text-base">
                  Tangira ushyire ikintu cyawe ku
                  isoko rya KUGURISHA.COM.
                </p>

                <Link
                  to="/create-listing"
                  className="mt-8 inline-flex items-center justify-center rounded-2xl bg-blue-600 px-6 py-3.5 text-sm font-black text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700"
                >
                  Shyiraho listing
                </Link>
              </div>
            </section>
          )}

        {/* Listings */}
        {!loading && listings.length > 0 && (
          <section className="mt-8">
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <p className="kg-text-secondary text-sm font-bold">
                  Imicungire y'amatangazo
                </p>

                <h2 className="kg-text mt-1 text-2xl font-black tracking-tight">
                  Amatangazo yawe
                </h2>
              </div>

              <span className="kg-surface kg-border kg-text-secondary rounded-full border px-3 py-1.5 text-xs font-bold shadow-sm">
                {listings.length}{" "}
                {listings.length === 1
                  ? "itangazo"
                  : "amatangazo"}
              </span>
            </div>

            <div className="space-y-4">
              {listings.map((listing) => {
                const isUpdating =
                  updatingId === listing.id

                const isDeleting =
                  deletingId === listing.id

                return (
                  <article
                    key={listing.id}
                    className="kg-surface kg-border group overflow-hidden rounded-[28px] border shadow-sm transition duration-300 hover:shadow-xl"
                  >
                    <div className="p-5 sm:p-6">
                      <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
                        {/* Listing info */}
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`rounded-full border px-3 py-1.5 text-xs font-black ${statusClass(
                                listing.status,
                              )}`}
                            >
                              {statusLabel(
                                listing.status,
                              )}
                            </span>

                            <span className="kg-soft kg-text-secondary rounded-full px-3 py-1.5 text-xs font-bold">
                              {listing.category?.[0]
                                ?.name || "Ibindi"}
                            </span>

                            {listing.listing_type ===
                              "free" && (
                              <span className="rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-1.5 text-xs font-black text-purple-400">
                                Ubuntu
                              </span>
                            )}
                          </div>

                          <Link
                            to={`/listing/${listing.id}`}
                            className="kg-text mt-4 block truncate text-xl font-black tracking-tight transition hover:text-blue-500 sm:text-2xl"
                          >
                            {listing.title}
                          </Link>

                          <p className="mt-2 text-xl font-black text-blue-500">
                            {formatPrice(listing)}
                          </p>

                          {listing.description && (
                            <p className="kg-text-secondary mt-3 line-clamp-2 max-w-3xl text-sm leading-6">
                              {listing.description}
                            </p>
                          )}

                          <p className="kg-text-muted mt-4 text-xs font-medium">
                            Yashyizweho{" "}
                            {new Date(
                              listing.created_at,
                            ).toLocaleDateString(
                              "rw-RW",
                            )}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="kg-border flex flex-wrap gap-2 border-t pt-5 xl:max-w-[520px] xl:justify-end xl:border-l xl:border-t-0 xl:pl-6 xl:pt-0">
                          <Link
                            to={`/listing/${listing.id}`}
                            className="kg-surface kg-border kg-text-secondary rounded-xl border px-4 py-2.5 text-sm font-black transition hover:bg-[var(--surface-hover)]"
                          >
                            Reba
                          </Link>

                          <Link
                            to={`/edit-listing/${listing.id}`}
                            className="rounded-xl border border-blue-500/20 bg-blue-500/10 px-4 py-2.5 text-sm font-black text-blue-500 transition hover:bg-blue-500/20"
                          >
                            ✎ Hindura
                          </Link>

                          {listing.status ===
                            "active" && (
                            <>
                              <button
                                type="button"
                                disabled={isUpdating}
                                onClick={() =>
                                  updateStatus(
                                    listing.id,
                                    "paused",
                                  )
                                }
                                className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-2.5 text-sm font-black text-amber-500 transition hover:bg-amber-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {isUpdating
                                  ? "..."
                                  : "Hagarika"}
                              </button>

                              <button
                                type="button"
                                disabled={isUpdating}
                                onClick={() =>
                                  updateStatus(
                                    listing.id,
                                    "sold",
                                  )
                                }
                                className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-2.5 text-sm font-black text-emerald-500 transition hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {isUpdating
                                  ? "..."
                                  : "Byagurishijwe"}
                              </button>
                            </>
                          )}

                          {listing.status ===
                            "paused" && (
                            <button
                              type="button"
                              disabled={isUpdating}
                              onClick={() =>
                                updateStatus(
                                  listing.id,
                                  "active",
                                )
                              }
                              className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-2.5 text-sm font-black text-emerald-500 transition hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {isUpdating
                                ? "..."
                                : "Ongera ushyire ku isoko"}
                            </button>
                          )}

                          {listing.status ===
                            "sold" && (
                            <button
                              type="button"
                              disabled={isUpdating}
                              onClick={() =>
                                updateStatus(
                                  listing.id,
                                  "active",
                                )
                              }
                              className="rounded-xl border border-blue-500/20 bg-blue-500/10 px-4 py-2.5 text-sm font-black text-blue-500 transition hover:bg-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {isUpdating
                                ? "..."
                                : "Ongera ubishyire ku isoko"}
                            </button>
                          )}

                          <button
                            type="button"
                            disabled={isDeleting}
                            onClick={() =>
                              deleteListing(
                                listing.id,
                              )
                            }
                            className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm font-black text-red-500 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {isDeleting
                              ? "Irimo gusibwa..."
                              : "Siba"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          </section>
        )}
      </div>

      {/* Footer */}
      <footer className="kg-surface kg-border mt-16 border-t">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 px-4 py-8 sm:flex-row sm:items-center sm:px-6 lg:px-8">
          <div>
            <p className="kg-text font-black tracking-tight">
              KUGURISHA
              <span className="text-blue-600">
                .COM
              </span>
            </p>

            <p className="kg-text-muted mt-1 text-xs">
              Isoko ryawe ryo mu Rwanda.
            </p>
          </div>

          <p className="kg-text-secondary text-sm font-medium">
            Gura icyo ushaka. Gurisha icyo ufite.
          </p>
        </div>
      </footer>
    </main>
  )
}

export default SellerDashboard