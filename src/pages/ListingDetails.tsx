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

      const {
        data,
        error,
      } = await supabase
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

      const {
        data: imageData,
        error: imageError,
      } = await supabase
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

      const {
        data,
        error,
      } = await supabase
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

      const {
        data: existingConversation,
        error: existingError,
      } = await supabase
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

      const {
        data: newConversation,
        error: createError,
      } = await supabase
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
      alert(
        "Ntibyakunze gutangiza conversation. Ongera ugerageze.",
      )
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
        "Ni iki kibazo wabonye kuri iyi listing?",
      )

      if (!reason || !reason.trim()) return

      setReportLoading(true)

      const { error } = await supabase
        .from("reports")
        .insert({
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

  function formatPrice(
    price: number | null,
    listingType: string,
  ) {
    if (listingType === "free") {
      return "Ubuntu"
    }

    if (price === null || price === undefined) {
      return "Vugana n'ugurisha"
    }

    return `${new Intl.NumberFormat("en-US").format(
      price,
    )} RWF`
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
      <div
        className="min-h-screen overflow-hidden text-slate-900 antialiased"
        style={{
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Inter", "Segoe UI", sans-serif',
          background:
            "linear-gradient(135deg, #eff6ff 0%, #f8fafc 38%, #eef2ff 68%, #dbeafe 100%)",
        }}
      >
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute left-1/2 top-[-220px] h-[600px] w-[850px] -translate-x-1/2 rounded-full bg-gradient-to-br from-blue-400/45 via-indigo-300/30 to-cyan-200/10 blur-[120px]" />

          <div className="absolute right-[-180px] top-[25%] h-[500px] w-[500px] rounded-full bg-gradient-to-bl from-blue-400/30 via-indigo-300/20 to-transparent blur-[125px]" />

          <div className="absolute bottom-[-220px] left-[-100px] h-[520px] w-[520px] rounded-full bg-gradient-to-tr from-blue-300/35 via-indigo-200/25 to-transparent blur-[120px]" />
        </div>

        <header className="relative z-20 border-b border-white/70 bg-white/80 backdrop-blur-2xl">
          <div className="mx-auto flex h-[72px] max-w-7xl items-center px-4 sm:px-6">
            <Link
              to="/"
              className="text-xl font-black tracking-[-0.04em] text-slate-950"
            >
              KUGURISHA
              <span className="text-blue-600">.COM</span>
            </Link>
          </div>
        </header>

        <main className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-10">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(380px,0.9fr)]">
            <div className="aspect-square animate-pulse rounded-[36px] border border-white/80 bg-white/60 shadow-sm backdrop-blur-xl" />

            <div className="space-y-5">
              <div className="h-5 w-32 animate-pulse rounded-full bg-white/70" />

              <div className="h-12 w-4/5 animate-pulse rounded-2xl bg-white/70" />

              <div className="h-14 w-2/5 animate-pulse rounded-2xl bg-white/70" />

              <div className="grid grid-cols-2 gap-3">
                <div className="h-24 animate-pulse rounded-[24px] bg-white/70" />
                <div className="h-24 animate-pulse rounded-[24px] bg-white/70" />
              </div>

              <div className="h-32 animate-pulse rounded-[28px] bg-white/70" />
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (error || !listing) {
    return (
      <div
        className="relative min-h-screen overflow-hidden px-5 py-10 text-slate-900 antialiased"
        style={{
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Inter", "Segoe UI", sans-serif',
          background:
            "linear-gradient(135deg, #eff6ff 0%, #f8fafc 40%, #eef2ff 70%, #dbeafe 100%)",
        }}
      >
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute left-1/2 top-[-180px] h-[520px] w-[700px] -translate-x-1/2 rounded-full bg-blue-400/25 blur-[120px]" />
          <div className="absolute bottom-[-180px] right-[-120px] h-[450px] w-[450px] rounded-full bg-indigo-300/25 blur-[120px]" />
        </div>

        <header className="relative z-10 border-b border-white/70 bg-white/75 backdrop-blur-2xl">
          <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6">
            <Link
              to="/"
              className="text-xl font-black tracking-[-0.04em] text-slate-950"
            >
              KUGURISHA
              <span className="text-blue-600">.COM</span>
            </Link>
          </div>
        </header>

        <main className="relative mx-auto flex min-h-[75vh] max-w-4xl items-center justify-center px-4 py-16">
          <div className="relative w-full max-w-md overflow-hidden rounded-[36px] border border-white/80 bg-white/85 p-8 text-center shadow-[0_30px_100px_-45px_rgba(30,64,175,0.45)] backdrop-blur-2xl">
            <div className="pointer-events-none absolute -inset-10 -z-10 rounded-full bg-blue-300/20 blur-[70px]" />

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-2xl shadow-sm">
              🔎
            </div>

            <h1 className="mt-5 text-2xl font-black tracking-[-0.03em] text-slate-950">
              Listing ntiyabonetse
            </h1>

            <p className="mt-2 text-sm font-medium leading-6 text-slate-500">
              {error || "Iyi listing ntabwo ikiboneka."}
            </p>

            <Link
              to="/"
              className="mt-6 inline-flex rounded-full bg-slate-950 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-slate-950/10 transition hover:bg-slate-800 active:scale-[0.98]"
            >
              ← Subira kuri Home
            </Link>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen overflow-hidden text-slate-900 antialiased"
      style={{
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Inter", "Segoe UI", sans-serif',
        background:
          "linear-gradient(135deg, #eff6ff 0%, #f8fafc 38%, #eef2ff 68%, #dbeafe 100%)",
      }}
    >
      {/* BACKGROUND */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-[-260px] h-[680px] w-[920px] -translate-x-1/2 rounded-full bg-gradient-to-br from-blue-400/45 via-indigo-300/30 to-cyan-200/10 blur-[125px]" />

        <div className="absolute right-[-180px] top-[20%] h-[520px] w-[520px] rounded-full bg-gradient-to-bl from-blue-400/30 via-indigo-300/20 to-transparent blur-[125px]" />

        <div className="absolute bottom-[-230px] left-[-100px] h-[560px] w-[560px] rounded-full bg-gradient-to-tr from-blue-300/35 via-indigo-200/25 to-transparent blur-[125px]" />

        <div className="absolute left-[28%] top-[45%] h-[320px] w-[440px] rounded-full bg-blue-300/15 blur-[100px]" />
      </div>

      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-white/70 bg-white/80 backdrop-blur-2xl">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link
            to="/"
            className="shrink-0 text-lg font-black tracking-[-0.04em] text-slate-950 sm:text-xl"
          >
            KUGURISHA
            <span className="text-blue-600">.COM</span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/"
              className="hidden rounded-full px-4 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-white/80 hover:text-slate-950 sm:block"
            >
              Ahabanza
            </Link>

            <Link
              to="/favorites"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200/80 bg-white/80 text-lg shadow-sm transition hover:bg-white hover:shadow-md"
              title="Ibyakunzwe"
            >
              {favorite ? "❤️" : "♡"}
            </Link>

            <Link
              to="/create-listing"
              className="rounded-full bg-slate-950 px-5 py-2.5 text-sm font-bold text-white shadow-[0_10px_30px_-15px_rgba(15,23,42,0.7)] transition hover:bg-slate-800 active:scale-[0.98]"
            >
              Gurisha
            </Link>
          </div>
        </div>
      </header>

      {/* CONTENT */}
      <main className="relative mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-8">
        {/* BREADCRUMB */}
        <div className="mb-6 flex items-center justify-between gap-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-bold text-slate-500 transition hover:bg-white/70 hover:text-slate-950"
          >
            <span>←</span>
            Subira kuri listings
          </Link>

          <button
            onClick={handleReport}
            disabled={reportLoading}
            className="rounded-full px-4 py-2 text-sm font-bold text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
          >
            🚩 {reportLoading ? "Kohereza..." : "Report"}
          </button>
        </div>

        <div className="grid items-start gap-7 lg:grid-cols-[minmax(0,1.1fr)_minmax(380px,0.9fr)] lg:gap-10">
          {/* IMAGE GALLERY */}
          <section className="lg:sticky lg:top-24">
            <div className="relative">
              <div className="pointer-events-none absolute -inset-8 -z-10 rounded-[70px] bg-gradient-to-br from-blue-400/25 via-indigo-300/20 to-cyan-200/10 blur-[70px]" />

              <div className="overflow-hidden rounded-[36px] border border-white/80 bg-white/80 shadow-[0_30px_100px_-45px_rgba(30,64,175,0.45)] backdrop-blur-2xl">
                <div className="relative aspect-square overflow-hidden bg-slate-100">
                  {selectedImage ? (
                    <img
                      src={selectedImage}
                      alt={listing.title}
                      className="h-full w-full object-cover transition duration-500"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <div className="text-center">
                        <div className="text-6xl">📷</div>

                        <p className="mt-3 text-sm font-semibold text-slate-400">
                          Nta foto iriho
                        </p>
                      </div>
                    </div>
                  )}

                  {listing.categories && (
                    <div className="absolute left-5 top-5 rounded-full border border-white/70 bg-white/85 px-4 py-2 text-xs font-bold text-slate-800 shadow-lg shadow-slate-900/5 backdrop-blur-xl">
                      {listing.categories.name}
                    </div>
                  )}

                  <div className="absolute bottom-5 right-5 rounded-full border border-white/70 bg-slate-950/75 px-3 py-1.5 text-[10px] font-bold text-white backdrop-blur-xl">
                    {images.length > 0
                      ? `${images.length} ${images.length === 1 ? "foto" : "amafoto"}`
                      : "Nta foto"}
                  </div>
                </div>
              </div>
            </div>

            {images.length > 0 && (
              <div className="mt-4 grid grid-cols-5 gap-2.5 sm:grid-cols-6">
                {images.map((image) => (
                  <button
                    key={image.id}
                    onClick={() =>
                      setSelectedImage(image.image_url)
                    }
                    className={`group aspect-square overflow-hidden rounded-[18px] border-2 bg-white shadow-sm transition duration-200 ${
                      selectedImage === image.image_url
                        ? "border-blue-600 ring-4 ring-blue-100/80"
                        : "border-transparent hover:border-slate-300"
                    }`}
                  >
                    <img
                      src={image.image_url}
                      alt=""
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                  </button>
                ))}
              </div>
            )}
          </section>

          {/* DETAILS */}
          <section>
            <div className="relative overflow-hidden rounded-[36px] border border-white/80 bg-white/88 p-5 shadow-[0_30px_100px_-45px_rgba(30,64,175,0.45)] backdrop-blur-2xl sm:p-7">
              <div className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-blue-300/15 blur-[70px]" />

              {/* CATEGORY + FAVORITE */}
              <div className="relative flex items-start justify-between gap-5">
                <div className="min-w-0">
                  {listing.categories && (
                    <p className="mb-3 text-sm font-bold tracking-[-0.01em] text-blue-600">
                      {listing.categories.name}
                    </p>
                  )}

                  <h1 className="text-2xl font-black leading-[1.12] tracking-[-0.04em] text-slate-950 sm:text-4xl">
                    {listing.title}
                  </h1>
                </div>

                <button
                  onClick={toggleFavorite}
                  disabled={favoriteLoading}
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-slate-200/90 bg-white text-xl shadow-sm transition hover:-translate-y-0.5 hover:shadow-md disabled:opacity-50"
                  title="Bika muri favorites"
                >
                  {favorite ? "❤️" : "♡"}
                </button>
              </div>

              {/* PRICE */}
              <div className="relative mt-8">
                <p className="text-3xl font-black tracking-[-0.045em] text-slate-950 sm:text-4xl">
                  {formatPrice(
                    listing.price,
                    listing.listing_type,
                  )}
                </p>

                <p className="mt-1.5 text-sm font-semibold text-slate-400">
                  {listingTypeLabel(listing.listing_type)}
                </p>
              </div>

              {/* META */}
              <div className="mt-7 grid grid-cols-2 gap-3">
                <div className="rounded-[24px] border border-slate-100 bg-slate-50/80 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                    Ubwoko
                  </p>

                  <p className="mt-2 font-bold tracking-[-0.01em] text-slate-900">
                    {listingTypeLabel(
                      listing.listing_type,
                    )}
                  </p>
                </div>

                <div className="rounded-[24px] border border-slate-100 bg-slate-50/80 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                    Imiterere
                  </p>

                  <p className="mt-2 font-bold tracking-[-0.01em] text-slate-900">
                    {conditionLabel(listing.condition)}
                  </p>
                </div>
              </div>

              {/* LOCATION */}
              <div className="mt-5 rounded-[26px] border border-blue-100/80 bg-blue-50/60 p-4 backdrop-blur-xl">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-blue-500">
                  Aho biherereye
                </p>

                <p className="mt-2 flex items-start gap-2 font-bold leading-6 text-slate-900">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white shadow-sm">
                    📍
                  </span>

                  <span>{locationText()}</span>
                </p>
              </div>

              {/* DESCRIPTION */}
              <div className="mt-8 border-t border-slate-100 pt-7">
                <h2 className="text-lg font-black tracking-[-0.025em] text-slate-950">
                  Ibisobanuro
                </h2>

                <p className="mt-3 whitespace-pre-wrap text-[15px] font-medium leading-7 text-slate-600">
                  {listing.description ||
                    "Nta bisobanuro byashyizweho kuri iyi listing."}
                </p>
              </div>

              {/* DATE */}
              <div className="mt-6 flex items-center justify-between gap-4 border-t border-slate-100 pt-5 text-sm">
                <span className="font-medium text-slate-400">
                  Yashyizweho
                </span>

                <span className="font-bold text-slate-600">
                  {formatDate(listing.created_at)}
                </span>
              </div>

              {/* ACTIONS */}
              <div className="mt-7 space-y-3">
                {listing.contact_chat && (
                  <button
                    onClick={handleContactSeller}
                    disabled={contactLoading}
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-blue-600 px-5 py-4 text-sm font-bold text-white shadow-[0_14px_35px_-15px_rgba(37,99,235,0.85)] transition duration-200 hover:bg-blue-700 hover:shadow-[0_18px_40px_-15px_rgba(37,99,235,0.9)] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
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
                        "Contact ya seller izashyirwa hano nyuma.",
                      )
                    }
                    className="flex w-full items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-4 text-sm font-bold text-slate-900 shadow-sm transition hover:bg-slate-50 hover:shadow-md active:scale-[0.99]"
                  >
                    <span>📞</span>
                    Hamagara ugurisha
                  </button>
                )}
              </div>
            </div>

            {/* SAFETY */}
            <div className="relative mt-5 overflow-hidden rounded-[32px] border border-amber-200/80 bg-amber-50/85 p-5 shadow-sm backdrop-blur-xl sm:p-6">
              <div className="pointer-events-none absolute -right-16 -top-16 h-36 w-36 rounded-full bg-amber-200/40 blur-[55px]" />

              <div className="relative flex gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-amber-100 bg-white shadow-sm">
                  ⚠️
                </div>

                <div>
                  <h2 className="font-black tracking-[-0.02em] text-amber-950">
                    Umutekano wawe ni ingenzi
                  </h2>

                  <ul className="mt-3 space-y-2 text-sm font-medium leading-6 text-amber-900">
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
      <footer className="relative mt-12 border-t border-white/70 bg-white/60 backdrop-blur-2xl">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-black tracking-[-0.04em] text-slate-950">
              KUGURISHA
              <span className="text-blue-600">.COM</span>
            </p>

            <p className="text-sm font-medium text-slate-400">
              Gura icyo ushaka. Gurisha icyo ufite.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default ListingDetails