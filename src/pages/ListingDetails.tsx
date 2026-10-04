import { useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { supabase } from "../services/supabase"

type Listing = {
  id: string
  seller_id: string
  title: string
  description: string | null
  price: number | null
  currency: string
  condition: string | null
  status: string
  listing_type: string
  contact_phone: boolean
  contact_chat: boolean
  created_at: string
  categories: {
    name: string
  } | null
  locations: {
    province: string
    district: string | null
    sector: string | null
    cell: string | null
    village: string | null
  } | null
}

type ListingImage = {
  id: string
  image_url: string
  sort_order: number
}

function ListingDetails() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [listing, setListing] = useState<Listing | null>(null)
  const [images, setImages] = useState<ListingImage[]>([])
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [favorite, setFavorite] = useState(false)
  const [favoriteLoading, setFavoriteLoading] = useState(false)
  const [contactLoading, setContactLoading] = useState(false)
  const [reportLoading, setReportLoading] = useState(false)

  useEffect(() => {
    if (!id) return
    loadListing()
  }, [id])

  useEffect(() => {
    if (!id) return
    checkFavorite()
  }, [id])

  async function loadListing() {
    try {
      setLoading(true)
      setError("")

      const { data, error } = await supabase
        .from("listings")
        .select(`
          id,
          seller_id,
          title,
          description,
          price,
          currency,
          condition,
          status,
          listing_type,
          contact_phone,
          contact_chat,
          created_at,
          categories (
            name
          ),
          locations (
            province,
            district,
            sector,
            cell,
            village
          )
        `)
        .eq("id", id)
        .maybeSingle()

      if (error) throw error

      if (!data) {
        setError("Iyi listing ntibonetse.")
        return
      }

      const normalizedListing: Listing = {
        ...data,
        categories: Array.isArray(data.categories)
          ? data.categories[0] ?? null
          : data.categories,
        locations: Array.isArray(data.locations)
          ? data.locations[0] ?? null
          : data.locations,
      }

      setListing(normalizedListing)

      const { data: imageData, error: imageError } = await supabase
        .from("listing_images")
        .select("id, image_url, sort_order")
        .eq("listing_id", id)
        .order("sort_order", { ascending: true })

      if (imageError) throw imageError

      const loadedImages = (imageData || []) as ListingImage[]

      setImages(loadedImages)

      if (loadedImages.length > 0) {
        setSelectedImage(loadedImages[0].image_url)
      }
    } catch (err) {
      console.error(err)
      setError("Habaye ikibazo mu kuzana listing.")
    } finally {
      setLoading(false)
    }
  }

  async function checkFavorite() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user || !id) return

      const { data, error } = await supabase
        .from("favorites")
        .select("listing_id")
        .eq("user_id", user.id)
        .eq("listing_id", id)
        .maybeSingle()

      if (error) {
        console.error(error)
        return
      }

      setFavorite(!!data)
    } catch (err) {
      console.error(err)
    }
  }

  async function toggleFavorite() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        navigate("/login")
        return
      }

      if (!id) return

      setFavoriteLoading(true)

      if (favorite) {
        const { error } = await supabase
          .from("favorites")
          .delete()
          .eq("user_id", user.id)
          .eq("listing_id", id)

        if (error) throw error

        setFavorite(false)
      } else {
        const { error } = await supabase
          .from("favorites")
          .insert({
            user_id: user.id,
            listing_id: id,
          })

        if (error) throw error

        setFavorite(true)
      }
    } catch (err) {
      console.error(err)
      alert("Habaye ikibazo. Ongera ugerageze.")
    } finally {
      setFavoriteLoading(false)
    }
  }

  async function handleContactSeller() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        navigate("/login")
        return
      }

      if (!listing) return

      if (user.id === listing.seller_id) {
        alert("Ntushobora kwandikira wowe ubwawe.")
        return
      }

      if (!listing.contact_chat) {
        alert("Uyu mucuruzi ntabwo yemeye ubutumwa.")
        return
      }

      setContactLoading(true)

      const { data: existingConversation, error: existingError } =
        await supabase
          .from("conversations")
          .select("id")
          .eq("listing_id", listing.id)
          .eq("buyer_id", user.id)
          .eq("seller_id", listing.seller_id)
          .maybeSingle()

      if (existingError) throw existingError

      if (existingConversation) {
        navigate(`/messages/${existingConversation.id}`)
        return
      }

      const { data: newConversation, error: createError } = await supabase
        .from("conversations")
        .insert({
          listing_id: listing.id,
          buyer_id: user.id,
          seller_id: listing.seller_id,
        })
        .select("id")
        .single()

      if (createError) throw createError

      navigate(`/messages/${newConversation.id}`)
    } catch (err) {
      console.error(err)
      alert("Ntibyakunze gutangiza conversation. Ongera ugerageze.")
    } finally {
      setContactLoading(false)
    }
  }

  async function handleReport() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        navigate("/login")
        return
      }

      if (!listing) return

      const reason = window.prompt(
        "Ni iki kibazo wabonye kuri iyi listing?"
      )

      if (!reason || !reason.trim()) return

      setReportLoading(true)

      const { error } = await supabase.from("reports").insert({
        reporter_id: user.id,
        listing_id: listing.id,
        reason: reason.trim(),
      })

      if (error) throw error

      alert("Raporo yawe yakiriwe. Murakoze.")
    } catch (err) {
      console.error(err)
      alert("Raporo ntiyoherejwe. Ongera ugerageze.")
    } finally {
      setReportLoading(false)
    }
  }

  function formatPrice(price: number | null, listingType: string) {
    if (listingType === "free") {
      return "Ubuntu"
    }

    if (price === null || price === undefined) {
      return "Vugana n'ugurisha"
    }

    return `${new Intl.NumberFormat("en-US").format(price)} RWF`
  }

  function conditionLabel(condition: string | null) {
    switch (condition) {
      case "new":
        return "Gishya"
      case "used":
        return "Cyakoreshejwe"
      case "refurbished":
        return "Cyasanwe neza"
      case "not_applicable":
        return "Ntabwo bireba"
      default:
        return "Ntabwo byavuzwe"
    }
  }

  function listingTypeLabel(type: string) {
    switch (type) {
      case "sale":
        return "Kugurisha"
      case "rent":
        return "Gukodesha"
      case "free":
        return "Ubuntu"
      case "wanted":
        return "Ndabishaka"
      default:
        return type
    }
  }

  function locationText() {
    if (!listing?.locations) {
      return "Aho biherereye ntihavuzwe"
    }

    const location = listing.locations

    return [
      location.village,
      location.cell,
      location.sector,
      location.district,
      location.province,
    ]
      .filter(Boolean)
      .join(", ")
  }

  function formatDate(date: string) {
    return new Intl.DateTimeFormat("rw-RW", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(date))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f8fa]">
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex h-16 max-w-7xl items-center px-4 sm:px-6">
            <Link
              to="/"
              className="text-xl font-black tracking-tight text-slate-950"
            >
              KUGURISHA<span className="text-blue-600">.COM</span>
            </Link>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
          <div className="grid gap-8 lg:grid-cols-2">
            <div className="aspect-square animate-pulse rounded-3xl bg-slate-200" />

            <div className="space-y-5">
              <div className="h-5 w-32 animate-pulse rounded bg-slate-200" />
              <div className="h-10 w-4/5 animate-pulse rounded bg-slate-200" />
              <div className="h-12 w-2/5 animate-pulse rounded bg-slate-200" />
              <div className="grid grid-cols-2 gap-3">
                <div className="h-24 animate-pulse rounded-2xl bg-slate-200" />
                <div className="h-24 animate-pulse rounded-2xl bg-slate-200" />
              </div>
              <div className="h-32 animate-pulse rounded-2xl bg-slate-200" />
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen bg-[#f7f8fa]">
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6">
            <Link
              to="/"
              className="text-xl font-black tracking-tight text-slate-950"
            >
              KUGURISHA<span className="text-blue-600">.COM</span>
            </Link>
          </div>
        </header>

        <main className="mx-auto flex min-h-[70vh] max-w-4xl items-center justify-center px-4 py-16">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-2xl">
              🔎
            </div>

            <h1 className="mt-5 text-2xl font-black text-slate-950">
              Listing ntiyabonetse
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              {error || "Iyi listing ntabwo ikiboneka."}
            </p>

            <Link
              to="/"
              className="mt-6 inline-flex rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
            >
              ← Subira kuri Home
            </Link>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-slate-900">
      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link
            to="/"
            className="shrink-0 text-lg font-black tracking-tight text-slate-950 sm:text-xl"
          >
            KUGURISHA<span className="text-blue-600">.COM</span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/"
              className="hidden rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 sm:block"
            >
              Ahabanza
            </Link>

            <Link
              to="/favorites"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-lg transition hover:border-slate-300 hover:bg-slate-50"
              title="Ibyakunzwe"
            >
              {favorite ? "❤️" : "♡"}
            </Link>

            <Link
              to="/create-listing"
              className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800"
            >
              Gurisha
            </Link>
          </div>
        </div>
      </header>

      {/* CONTENT */}
      <main className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-8">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center justify-between gap-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-slate-950"
          >
            <span>←</span>
            Subira kuri listings
          </Link>

          <button
            onClick={handleReport}
            disabled={reportLoading}
            className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
          >
            🚩 {reportLoading ? "Kohereza..." : "Report"}
          </button>
        </div>

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(380px,0.9fr)] lg:gap-10">
          {/* IMAGE GALLERY */}
          <section className="lg:sticky lg:top-24">
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="relative aspect-square bg-slate-100">
                {selectedImage ? (
                  <img
                    src={selectedImage}
                    alt={listing.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <div className="text-center">
                      <div className="text-6xl">📷</div>
                      <p className="mt-3 text-sm font-medium text-slate-400">
                        Nta foto iriho
                      </p>
                    </div>
                  </div>
                )}

                {listing.categories && (
                  <div className="absolute left-4 top-4 rounded-full border border-white/60 bg-white/90 px-3 py-1.5 text-xs font-bold text-slate-800 shadow-sm backdrop-blur">
                    {listing.categories.name}
                  </div>
                )}
              </div>
            </div>

            {images.length > 0 && (
              <div className="mt-3 grid grid-cols-5 gap-2 sm:grid-cols-6">
                {images.map((image) => (
                  <button
                    key={image.id}
                    onClick={() => setSelectedImage(image.image_url)}
                    className={`aspect-square overflow-hidden rounded-xl border-2 bg-white transition ${
                      selectedImage === image.image_url
                        ? "border-blue-600 ring-2 ring-blue-100"
                        : "border-transparent hover:border-slate-300"
                    }`}
                  >
                    <img
                      src={image.image_url}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </section>

          {/* DETAILS */}
          <section>
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
              {/* Category + Favorite */}
              <div className="flex items-start justify-between gap-5">
                <div>
                  {listing.categories && (
                    <p className="mb-3 text-sm font-bold text-blue-600">
                      {listing.categories.name}
                    </p>
                  )}

                  <h1 className="text-2xl font-black leading-tight tracking-tight text-slate-950 sm:text-4xl">
                    {listing.title}
                  </h1>
                </div>

                <button
                  onClick={toggleFavorite}
                  disabled={favoriteLoading}
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-xl transition hover:bg-slate-50 disabled:opacity-50"
                  title="Bika muri favorites"
                >
                  {favorite ? "❤️" : "♡"}
                </button>
              </div>

              {/* Price */}
              <div className="mt-7">
                <p className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                  {formatPrice(listing.price, listing.listing_type)}
                </p>

                <p className="mt-1 text-sm text-slate-400">
                  {listingTypeLabel(listing.listing_type)}
                </p>
              </div>

              {/* Meta */}
              <div className="mt-7 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Ubwoko
                  </p>
                  <p className="mt-1.5 font-bold text-slate-900">
                    {listingTypeLabel(listing.listing_type)}
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Imiterere
                  </p>
                  <p className="mt-1.5 font-bold text-slate-900">
                    {conditionLabel(listing.condition)}
                  </p>
                </div>
              </div>

              {/* Location */}
              <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Aho biherereye
                </p>

                <p className="mt-2 flex items-start gap-2 font-semibold leading-6 text-slate-900">
                  <span>📍</span>
                  <span>{locationText()}</span>
                </p>
              </div>

              {/* Description */}
              <div className="mt-8 border-t border-slate-100 pt-7">
                <h2 className="text-lg font-black text-slate-950">
                  Ibisobanuro
                </h2>

                <p className="mt-3 whitespace-pre-wrap text-[15px] leading-7 text-slate-600">
                  {listing.description ||
                    "Nta bisobanuro byashyizweho kuri iyi listing."}
                </p>
              </div>

              {/* Date */}
              <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-5 text-sm">
                <span className="text-slate-400">
                  Yashyizweho
                </span>

                <span className="font-semibold text-slate-600">
                  {formatDate(listing.created_at)}
                </span>
              </div>

              {/* ACTIONS */}
              <div className="mt-7 space-y-3">
                {listing.contact_chat && (
                  <button
                    onClick={handleContactSeller}
                    disabled={contactLoading}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-4 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <span>💬</span>
                    {contactLoading
                      ? "Birategurwa..."
                      : "Vugisha ugurisha"}
                  </button>
                )}

                {listing.contact_phone && (
                  <button
                    onClick={() =>
                      alert(
                        "Contact ya seller izashyirwa hano nyuma."
                      )
                    }
                    className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm font-bold text-slate-900 transition hover:bg-slate-50"
                  >
                    <span>📞</span>
                    Hamagara ugurisha
                  </button>
                )}
              </div>
            </div>

            {/* SAFETY */}
            <div className="mt-5 rounded-3xl border border-amber-200 bg-amber-50 p-5 sm:p-6">
              <div className="flex gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white">
                  ⚠️
                </div>

                <div>
                  <h2 className="font-black text-amber-950">
                    Umutekano wawe ni ingenzi
                  </h2>

                  <ul className="mt-3 space-y-2 text-sm leading-6 text-amber-900">
                    <li>
                      • Ntukohereze amafaranga mbere yo kubona
                      icyo ugura.
                    </li>
                    <li>
                      • Niba bishoboka, bonanira ahantu hizewe.
                    </li>
                    <li>
                      • Reba neza ibintu n'inyandiko mbere yo
                      kwishyura.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="mt-12 border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-black tracking-tight text-slate-950">
              KUGURISHA<span className="text-blue-600">.COM</span>
            </p>

            <p className="text-sm text-slate-400">
              Gura icyo ushaka. Gurisha icyo ufite.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default ListingDetails