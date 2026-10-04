import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { supabase } from "../services/supabase"

type FavoriteListing = {
  id: string
  title: string
  description: string | null
  price: number | null
  currency: string
  condition: string | null
  listing_type: string
  status: string
  created_at: string
  categories?: {
    name: string
  }[] | null
  locations?: {
    province: string
    district: string | null
    sector: string | null
  }[] | null
}

type Favorite = {
  user_id: string
  listing_id: string
  created_at: string
  listings: FavoriteListing | FavoriteListing[] | null
}

type ListingImage = {
  listing_id: string
  image_url: string
  sort_order?: number
}

function Favorites() {
  const navigate = useNavigate()

  const [favorites, setFavorites] = useState<Favorite[]>([])
  const [images, setImages] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [removingId, setRemovingId] = useState<string | null>(null)

  useEffect(() => {
    loadFavorites()
  }, [])

  async function loadFavorites() {
    setLoading(true)
    setError("")

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      navigate("/login")
      return
    }

    const { data, error } = await supabase
      .from("favorites")
      .select(`
        user_id,
        listing_id,
        created_at,
        listings (
          id,
          title,
          description,
          price,
          currency,
          condition,
          listing_type,
          status,
          created_at,
          categories (
            name
          ),
          locations (
            province,
            district,
            sector
          )
        )
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error(error)
      setError(error.message)
      setLoading(false)
      return
    }

    const favoriteData = (data || []) as Favorite[]

    setFavorites(favoriteData)

    const listingIds = favoriteData
      .map((favorite) => favorite.listing_id)
      .filter(Boolean)

    if (listingIds.length > 0) {
      const { data: imageData, error: imageError } = await supabase
        .from("listing_images")
        .select("listing_id, image_url, sort_order")
        .in("listing_id", listingIds)
        .order("sort_order", { ascending: true })

      if (imageError) {
        console.error(imageError)
      }

      const imageMap: Record<string, string> = {}

      ;((imageData || []) as ListingImage[]).forEach((image) => {
        if (!imageMap[image.listing_id]) {
          imageMap[image.listing_id] = image.image_url
        }
      })

      setImages(imageMap)
    } else {
      setImages({})
    }

    setLoading(false)
  }

  async function removeFavorite(listingId: string) {
    setRemovingId(listingId)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      navigate("/login")
      return
    }

    const { error } = await supabase
      .from("favorites")
      .delete()
      .eq("user_id", user.id)
      .eq("listing_id", listingId)

    if (error) {
      alert(error.message)
      setRemovingId(null)
      return
    }

    setFavorites((current) =>
      current.filter(
        (favorite) => favorite.listing_id !== listingId
      )
    )

    setImages((current) => {
      const updated = { ...current }
      delete updated[listingId]
      return updated
    })

    setRemovingId(null)
  }

  function formatPrice(
    price: number | null,
    currency: string
  ) {
    if (price === null) {
      return "Baza igiciro"
    }

    return `${new Intl.NumberFormat("en-US").format(price)} ${currency}`
  }

  function getListing(
    listing: FavoriteListing | FavoriteListing[] | null
  ) {
    if (!listing) {
      return null
    }

    return Array.isArray(listing)
      ? listing[0] || null
      : listing
  }

  function getConditionLabel(
    condition: string | null
  ) {
    switch (condition) {
      case "new":
        return "Gishya"
      case "used":
        return "Cyakoreshejwe"
      case "refurbished":
        return "Cyasanwe"
      case "not_applicable":
        return "Ntabwo bireba"
      default:
        return null
    }
  }

  function getStatusLabel(status: string) {
    switch (status) {
      case "active":
        return "Kiracyaboneka"
      case "sold":
        return "Cyagurishijwe"
      case "paused":
        return "Cyahagaritswe"
      case "pending":
        return "Kirimo gutegurwa"
      default:
        return status
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f6f8fc]">
        <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
            <Link
              to="/"
              className="text-xl font-black tracking-tight text-slate-950 sm:text-2xl"
            >
              KUGURISHA
              <span className="text-blue-600">.COM</span>
            </Link>

            <div className="h-10 w-28 animate-pulse rounded-xl bg-slate-100" />
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-4 w-28 rounded bg-slate-200" />
            <div className="mt-4 h-10 w-64 rounded-xl bg-slate-200" />
            <div className="mt-3 h-5 w-96 max-w-full rounded bg-slate-100" />

            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div
                  key={item}
                  className="overflow-hidden rounded-[28px] border border-slate-200 bg-white"
                >
                  <div className="aspect-[4/3] bg-slate-200" />

                  <div className="space-y-3 p-5">
                    <div className="h-5 w-3/4 rounded bg-slate-200" />
                    <div className="h-7 w-1/2 rounded bg-slate-200" />
                    <div className="h-4 w-full rounded bg-slate-100" />
                    <div className="h-11 w-full rounded-xl bg-slate-100" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f6f8fc] text-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link
            to="/"
            className="text-xl font-black tracking-tight text-slate-950 sm:text-2xl"
          >
            KUGURISHA
            <span className="text-blue-600">.COM</span>
          </Link>

          <nav className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/"
              className="hidden rounded-xl px-3 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 sm:block"
            >
              Ahabanza
            </Link>

            <Link
              to="/dashboard"
              className="hidden rounded-xl px-3 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 sm:block"
            >
              Dashboard
            </Link>

            <Link
              to="/create-listing"
              className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-black text-white shadow-sm transition hover:bg-blue-600"
            >
              <span className="sm:hidden">+ Gurisha</span>
              <span className="hidden sm:inline">
                + Shyiraho itangazo
              </span>
            </Link>
          </nav>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        {/* Hero */}
        <section className="relative overflow-hidden rounded-[32px] border border-slate-200 bg-slate-950 px-6 py-8 text-white shadow-xl shadow-slate-200/40 sm:px-10 sm:py-10">
          <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl" />

          <div className="relative flex flex-col justify-between gap-7 md:flex-row md:items-end">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-bold text-slate-200 backdrop-blur">
                <span className="text-red-400">♥</span>
                Ibyo wabitse
              </div>

              <h1 className="text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
                Ibyo Nakunze
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
                Amatangazo wabikiye kugira ngo uzayagarukireho
                igihe ushakiye.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 backdrop-blur">
                <p className="text-xs font-semibold text-slate-400">
                  Amatangazo
                </p>
                <p className="mt-0.5 text-2xl font-black">
                  {favorites.length}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Error */}
        {error && (
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-100 font-black">
              !
            </div>

            <div>
              <p className="font-black">
                Habaye ikibazo
              </p>

              <p className="mt-1 text-sm leading-5 text-red-600">
                {error}
              </p>
            </div>
          </div>
        )}

        {/* Empty */}
        {favorites.length === 0 ? (
          <section className="mt-8 overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm">
            <div className="flex min-h-[430px] flex-col items-center justify-center px-6 py-16 text-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-red-50 text-5xl shadow-inner">
                ♥
              </div>

              <h2 className="mt-7 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
                Nta byo wakunze biraboneka
              </h2>

              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500 sm:text-base">
                Iyo ubonye ikintu ushaka kuri KUGURISHA.COM,
                kanda kuri ❤️ kugira ngo ukibike hano.
              </p>

              <Link
                to="/"
                className="mt-8 inline-flex items-center justify-center rounded-2xl bg-blue-600 px-6 py-3.5 text-sm font-black text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700"
              >
                Shakisha ibicuruzwa
              </Link>
            </div>
          </section>
        ) : (
          <section className="mt-8">
            {/* Section heading */}
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-slate-500">
                  Ibyo wabitse
                </p>

                <h2 className="mt-1 text-xl font-black tracking-tight text-slate-950 sm:text-2xl">
                  Amatangazo yawe
                </h2>
              </div>

              <span className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-slate-500 shadow-sm ring-1 ring-slate-200">
                {favorites.length}{" "}
                {favorites.length === 1
                  ? "itangazo"
                  : "amatangazo"}
              </span>
            </div>

            {/* Listings */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {favorites.map((favorite) => {
                const listing = getListing(favorite.listings)

                if (!listing) {
                  return null
                }

                const conditionLabel =
                  getConditionLabel(listing.condition)

                const locationText = [
                  listing.locations?.[0]?.province,
                  listing.locations?.[0]?.district,
                  listing.locations?.[0]?.sector,
                ]
                  .filter(Boolean)
                  .join(", ")

                const isRemoving =
                  removingId === favorite.listing_id

                return (
                  <article
                    key={favorite.listing_id}
                    className="group overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-slate-200/70"
                  >
                    {/* Image */}
                    <Link
                      to={`/listing/${listing.id}`}
                      className="block"
                    >
                      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                        {images[listing.id] ? (
                          <img
                            src={images[listing.id]}
                            alt={listing.title}
                            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
                            <span className="text-5xl opacity-40">
                              ▧
                            </span>
                          </div>
                        )}

                        {/* Image overlay */}
                        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/40 to-transparent opacity-60" />

                        {/* Status */}
                        {listing.status !== "active" && (
                          <div className="absolute left-4 top-4 rounded-full border border-white/20 bg-slate-950/80 px-3 py-1.5 text-xs font-black text-white shadow-lg backdrop-blur">
                            {getStatusLabel(listing.status)}
                          </div>
                        )}

                        {/* Favorite badge */}
                        <div className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-white/90 text-lg text-red-500 shadow-lg backdrop-blur">
                          ♥
                        </div>
                      </div>
                    </Link>

                    {/* Content */}
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <Link
                          to={`/listing/${listing.id}`}
                          className="line-clamp-2 text-lg font-black leading-6 tracking-tight text-slate-950 transition hover:text-blue-600"
                        >
                          {listing.title}
                        </Link>

                        <button
                          type="button"
                          onClick={() =>
                            removeFavorite(
                              favorite.listing_id
                            )
                          }
                          disabled={isRemoving}
                          title="Kura mu byo nakunze"
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-lg text-red-500 transition hover:border-red-200 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {isRemoving ? (
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-red-500" />
                          ) : (
                            "♥"
                          )}
                        </button>
                      </div>

                      {/* Price */}
                      <p className="mt-4 text-xl font-black tracking-tight text-blue-600">
                        {formatPrice(
                          listing.price,
                          listing.currency
                        )}
                      </p>

                      {/* Meta */}
                      <div className="mt-4 space-y-2.5 border-t border-slate-100 pt-4">
                        {listing.categories?.[0]?.name && (
                          <div className="flex items-center gap-2 text-sm text-slate-500">
                            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-xs">
                              ◈
                            </span>
                            <span className="truncate">
                              {listing.categories[0].name}
                            </span>
                          </div>
                        )}

                        {locationText && (
                          <div className="flex items-center gap-2 text-sm text-slate-500">
                            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-xs">
                              •
                            </span>
                            <span className="truncate">
                              {locationText}
                            </span>
                          </div>
                        )}

                        {conditionLabel && (
                          <div className="flex items-center gap-2 text-sm text-slate-500">
                            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-xs">
                              □
                            </span>
                            <span>{conditionLabel}</span>
                          </div>
                        )}
                      </div>

                      {/* Action */}
                      <Link
                        to={`/listing/${listing.id}`}
                        className="mt-5 flex items-center justify-center rounded-2xl bg-slate-950 px-4 py-3.5 text-sm font-black text-white transition hover:bg-blue-600"
                      >
                        Reba itangazo
                        <span className="ml-2 transition-transform group-hover:translate-x-1">
                          →
                        </span>
                      </Link>
                    </div>
                  </article>
                )
              })}
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 px-4 py-8 sm:flex-row sm:items-center sm:px-6 lg:px-8">
          <div>
            <p className="font-black tracking-tight text-slate-950">
              KUGURISHA
              <span className="text-blue-600">.COM</span>
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Isoko ryawe ryo mu Rwanda.
            </p>
          </div>

          <p className="text-sm font-medium text-slate-500">
            Gura icyo ushaka. Gurisha icyo ufite.
          </p>
        </div>
      </footer>
    </div>
  )
}

export default Favorites