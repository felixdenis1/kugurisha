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
  contact_phone_number: string | null
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

export default function ListingDetails() {
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
  const [showDesktopPhone, setShowDesktopPhone] = useState(false)
  const [copied, setCopied] = useState(false)

  // Current logged in user state & Seller Phone Editing
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [editingPhone, setEditingPhone] = useState(false)
  const [newPhoneNumber, setNewPhoneNumber] = useState("")
  const [savingPhone, setSavingPhone] = useState(false)

  useEffect(() => {
    if (!id) return
    void loadListing()
    void checkUser()
  }, [id])

  useEffect(() => {
    if (!id) return
    void checkFavorite()
  }, [id])

  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      setCurrentUserId(user.id)
    }
  }

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
          contact_phone_number,
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

      let activePhoneNumber = data.contact_phone_number?.trim() || null

      // 1. Fallback: Check profile table for seller phone
      if (!activePhoneNumber && data.seller_id) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("phone")
          .eq("id", data.seller_id)
          .maybeSingle()

        if (profileData?.phone && profileData.phone.trim().length > 0) {
          activePhoneNumber = profileData.phone.trim()
        }
      }

      // 2. Fallback: Check previous listings from seller
      if (!activePhoneNumber && data.seller_id) {
        const { data: userPrevListings } = await supabase
          .from("listings")
          .select("contact_phone_number")
          .eq("seller_id", data.seller_id)
          .not("contact_phone_number", "is", null)
          .order("created_at", { ascending: false })
          .limit(1)

        if (userPrevListings && userPrevListings.length > 0 && userPrevListings[0].contact_phone_number) {
          activePhoneNumber = userPrevListings[0].contact_phone_number.trim()
        }
      }

      const normalizedListing: Listing = {
        ...data,
        contact_phone_number: activePhoneNumber,
        categories: Array.isArray(data.categories)
          ? data.categories[0] ?? null
          : data.categories,
        locations: Array.isArray(data.locations)
          ? data.locations[0] ?? null
          : data.locations,
      }

      setListing(normalizedListing)
      if (activePhoneNumber) {
        setNewPhoneNumber(activePhoneNumber)
      }

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
      alert("Ntibyakunze gutangiza conversation. Ongera ugerageze.")
    } finally {
      setContactLoading(false)
    }
  }

  function handleCallClick() {
    if (!listing?.contact_phone_number) return

    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)

    if (isMobile) {
      window.location.href = `tel:${listing.contact_phone_number.replace(/\s+/g, "")}`
    } else {
      setShowDesktopPhone((prev) => !prev)
    }
  }

  function copyPhoneNumber() {
    if (listing?.contact_phone_number) {
      navigator.clipboard.writeText(listing.contact_phone_number)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  async function handleSavePhoneNumber() {
    if (!listing) return
    if (!newPhoneNumber.trim()) {
      alert("Nyamuneka andika nimero ya telefoni.")
      return
    }

    setSavingPhone(true)
    try {
      const { error } = await supabase
        .from("listings")
        .update({
          contact_phone: true,
          contact_phone_number: newPhoneNumber.trim(),
        })
        .eq("id", listing.id)
        .eq("seller_id", currentUserId)

      if (error) throw error

      setListing((prev) => prev ? {
        ...prev,
        contact_phone: true,
        contact_phone_number: newPhoneNumber.trim(),
      } : null)

      setEditingPhone(false)
      alert("Nimero ya telefoni yabitswe neza!")
    } catch (err) {
      console.error(err)
      alert("Habaye ikibazo mu kubika nimero. Ongera ugerageze.")
    } finally {
      setSavingPhone(false)
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

      const reason = window.prompt("Ni iki kibazo wabonye kuri iyi listing?")

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
      <div className="min-h-screen overflow-hidden kg-bg kg-text antialiased transition-colors duration-300">
        <header className="sticky top-0 z-20 border-b kg-border kg-surface backdrop-blur-2xl">
          <div className="mx-auto flex h-[76px] max-w-6xl items-center px-4 sm:px-6">
            <Link
              to="/"
              className="group inline-flex items-center gap-3 rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-slate-500/10 via-emerald-600/15 to-emerald-800/20 p-1 border border-emerald-500/30">
                <img
                  src="/favicon.svg"
                  alt=""
                  className="h-full w-full object-contain rounded-full bg-transparent"
                />
              </div>
              <span className="text-2xl font-black tracking-[-0.07em] bg-gradient-to-r from-slate-500 via-emerald-700 to-emerald-900 dark:from-slate-300 dark:via-emerald-400 dark:to-emerald-500 bg-clip-text text-transparent">
                KUGURISHA
              </span>
            </Link>
          </div>
        </header>

        <main className="relative mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-10">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(380px,0.9fr)]">
            <div className="aspect-square animate-pulse rounded-3xl border kg-border kg-surface shadow-sm backdrop-blur-xl" />
            <div className="space-y-5">
              <div className="h-5 w-32 animate-pulse rounded-full kg-bg-secondary" />
              <div className="h-12 w-4/5 animate-pulse rounded-2xl kg-bg-secondary" />
              <div className="h-14 w-2/5 animate-pulse rounded-2xl kg-bg-secondary" />
              <div className="grid grid-cols-2 gap-3">
                <div className="h-24 animate-pulse rounded-2xl kg-bg-secondary" />
                <div className="h-24 animate-pulse rounded-2xl kg-bg-secondary" />
              </div>
              <div className="h-32 animate-pulse rounded-3xl kg-bg-secondary" />
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (error || !listing) {
    return (
      <div className="relative min-h-screen overflow-hidden px-5 py-10 kg-bg kg-text antialiased transition-colors duration-300">
        <header className="sticky top-0 z-10 border-b kg-border kg-surface backdrop-blur-2xl">
          <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6">
            <Link
              to="/"
              className="group inline-flex items-center gap-3 rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-slate-500/10 via-emerald-600/15 to-emerald-800/20 p-1 border border-emerald-500/30">
                <img
                  src="/favicon.svg"
                  alt=""
                  className="h-full w-full object-contain rounded-full bg-transparent"
                />
              </div>
              <span className="text-2xl font-black tracking-[-0.07em] bg-gradient-to-r from-slate-500 via-emerald-700 to-emerald-900 dark:from-slate-300 dark:via-emerald-400 dark:to-emerald-500 bg-clip-text text-transparent">
                KUGURISHA
              </span>
            </Link>
          </div>
        </header>

        <main className="relative mx-auto flex min-h-[75vh] max-w-4xl items-center justify-center px-4 py-16">
          <div className="relative w-full max-w-md overflow-hidden rounded-3xl border kg-border kg-surface p-8 text-center shadow-2xl backdrop-blur-2xl">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border kg-border kg-bg-secondary text-2xl shadow-sm">
              🔎
            </div>
            <h1 className="mt-5 text-2xl font-black tracking-tight kg-text">
              Listing ntiyabonetse
            </h1>
            <p className="mt-2 text-sm font-medium leading-6 kg-text-secondary">
              {error || "Iyi listing ntabwo ikiboneka."}
            </p>
            <Link
              to="/"
              className="mt-6 inline-flex rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-700 to-emerald-900 px-6 py-3 text-xs font-black text-white shadow-lg shadow-emerald-700/25 transition hover:scale-105"
            >
              ← Subira kuri Home
            </Link>
          </div>
        </main>
      </div>
    )
  }

  const hasValidPhone = Boolean(listing.contact_phone_number && listing.contact_phone_number.trim().length > 0)
  const isOwner = currentUserId && currentUserId === listing.seller_id

  return (
    <div className="min-h-screen overflow-hidden kg-bg kg-text antialiased transition-colors duration-300">
      {/* BACKGROUND ACCENTS */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[8%] top-[8%] h-[34rem] w-[34rem] rounded-full bg-emerald-600/10 dark:bg-emerald-500/10 blur-[120px]" />
        <div className="absolute right-[4%] top-[22%] h-[32rem] w-[32rem] rounded-full bg-slate-500/10 blur-[120px]" />
        <div className="absolute bottom-[5%] left-[35%] h-[36rem] w-[36rem] rounded-full bg-emerald-700/10 blur-[130px]" />
      </div>

      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b kg-border kg-surface backdrop-blur-2xl">
        <div className="mx-auto flex h-[76px] max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link
            to="/"
            className="group inline-flex items-center gap-3 rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-slate-500/10 via-emerald-600/15 to-emerald-800/20 p-1 border border-emerald-500/30">
              <img
                src="/favicon.svg"
                alt=""
                className="h-full w-full object-contain rounded-full bg-transparent"
              />
            </div>
            <span className="text-2xl font-black tracking-[-0.07em] bg-gradient-to-r from-slate-500 via-emerald-700 to-emerald-900 dark:from-slate-300 dark:via-emerald-400 dark:to-emerald-500 bg-clip-text text-transparent">
              KUGURISHA
            </span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/"
              className="hidden rounded-2xl px-4 py-2.5 text-xs font-bold kg-text-secondary transition hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400 sm:block"
            >
              Ahabanza
            </Link>

            <Link
              to="/favorites"
              className="flex h-10 w-10 items-center justify-center rounded-2xl border kg-border kg-surface text-base shadow-sm transition hover:border-emerald-500"
              title="Ibyakunzwe"
            >
              {favorite ? "❤️" : "♡"}
            </Link>

            <Link
              to="/create-listing"
              className="rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-700 to-emerald-900 px-5 py-2.5 text-xs font-black text-white shadow-lg shadow-emerald-700/25 transition hover:scale-105"
            >
              Gurisha
            </Link>
          </div>
        </div>
      </header>

      {/* CONTENT */}
      <main className="relative mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
        {/* BREADCRUMB */}
        <div className="mb-6 flex items-center justify-between gap-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-2xl px-3.5 py-2 text-xs font-bold kg-text-secondary transition hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400"
          >
            <span>←</span>
            Subira kuri listings
          </Link>

          <button
            onClick={handleReport}
            disabled={reportLoading}
            className="rounded-2xl px-4 py-2 text-xs font-bold kg-text-muted transition hover:bg-red-500/10 hover:text-red-500 disabled:opacity-50"
          >
            🚩 {reportLoading ? "Kohereza..." : "Report"}
          </button>
        </div>

        <div className="grid items-start gap-7 lg:grid-cols-[minmax(0,1.1fr)_minmax(380px,0.9fr)] lg:gap-10">
          {/* IMAGE GALLERY */}
          <section className="lg:sticky lg:top-24">
            <div className="relative">
              <div className="overflow-hidden rounded-3xl border kg-border kg-surface shadow-2xl backdrop-blur-2xl">
                <div className="relative aspect-square overflow-hidden kg-bg-secondary">
                  {selectedImage ? (
                    <img
                      src={selectedImage}
                      alt={listing.title}
                      className="h-full w-full object-cover transition duration-500"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <div className="text-center">
                        <div className="text-5xl">📷</div>
                        <p className="mt-3 text-xs font-bold kg-text-muted">Nta foto iriho</p>
                      </div>
                    </div>
                  )}

                  {listing.categories && (
                    <div className="absolute left-4 top-4 rounded-full border kg-border kg-surface px-3.5 py-1.5 text-xs font-bold kg-text shadow-lg backdrop-blur-xl">
                      {listing.categories.name}
                    </div>
                  )}

                  <div className="absolute bottom-4 right-4 rounded-full border kg-border bg-slate-950/80 px-3 py-1 text-[10px] font-black text-white backdrop-blur-xl">
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
                    onClick={() => setSelectedImage(image.image_url)}
                    className={`group aspect-square overflow-hidden rounded-2xl border-2 kg-surface shadow-sm transition duration-200 ${
                      selectedImage === image.image_url
                        ? "border-emerald-500 ring-2 ring-emerald-500/20"
                        : "border-transparent hover:border-emerald-500/50"
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
            <div className="relative overflow-hidden rounded-3xl border kg-border kg-surface p-6 shadow-2xl backdrop-blur-2xl sm:p-8">
              {/* CATEGORY + FAVORITE */}
              <div className="relative flex items-start justify-between gap-5">
                <div className="min-w-0">
                  {listing.categories && (
                    <p className="mb-2 text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                      {listing.categories.name}
                    </p>
                  )}
                  <h1 className="text-2xl font-black leading-tight kg-text sm:text-3xl">
                    {listing.title}
                  </h1>
                </div>

                <button
                  onClick={toggleFavorite}
                  disabled={favoriteLoading}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border kg-border kg-surface text-lg shadow-sm transition hover:border-emerald-500 disabled:opacity-50"
                  title="Bika muri favorites"
                >
                  {favorite ? "❤️" : "♡"}
                </button>
              </div>

              {/* PRICE */}
              <div className="relative mt-6">
                <p className="text-3xl font-black tracking-tight kg-text sm:text-4xl">
                  {formatPrice(listing.price, listing.listing_type)}
                </p>
                <p className="mt-1 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  {listingTypeLabel(listing.listing_type)}
                </p>
              </div>

              {/* META */}
              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border kg-border kg-bg-secondary p-4">
                  <p className="text-[10px] font-black uppercase tracking-wider kg-text-muted">
                    Ubwoko
                  </p>
                  <p className="mt-1.5 text-xs font-bold kg-text">
                    {listingTypeLabel(listing.listing_type)}
                  </p>
                </div>

                <div className="rounded-2xl border kg-border kg-bg-secondary p-4">
                  <p className="text-[10px] font-black uppercase tracking-wider kg-text-muted">
                    Imimerere
                  </p>
                  <p className="mt-1.5 text-xs font-bold kg-text">
                    {conditionLabel(listing.condition)}
                  </p>
                </div>
              </div>

              {/* LOCATION */}
              <div className="mt-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 backdrop-blur-xl">
                <p className="text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                  Aho biherereye
                </p>
                <p className="mt-1.5 flex items-start gap-2 text-xs font-bold kg-text">
                  <span>📍</span>
                  <span>{locationText()}</span>
                </p>
              </div>

              {/* DESCRIPTION */}
              <div className="mt-6 border-t kg-border pt-6">
                <h2 className="text-sm font-black uppercase tracking-wider kg-text">
                  Ibisobanuro
                </h2>
                <p className="mt-3 whitespace-pre-wrap text-sm font-medium leading-relaxed kg-text-secondary">
                  {listing.description || "Nta bisobanuro byashyizweho kuri iyi listing."}
                </p>
              </div>

              {/* DATE */}
              <div className="mt-6 flex items-center justify-between gap-4 border-t kg-border pt-4 text-xs">
                <span className="font-bold kg-text-muted">Yashyizweho</span>
                <span className="font-bold kg-text">{formatDate(listing.created_at)}</span>
              </div>

              {/* ACTIONS */}
              <div className="mt-6 space-y-3">
                {listing.contact_chat && (
                  <button
                    onClick={handleContactSeller}
                    disabled={contactLoading}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-700 to-emerald-900 px-5 py-3.5 text-xs font-black text-white shadow-xl shadow-emerald-700/25 transition hover:scale-[1.01] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <span>💬</span>
                    {contactLoading ? "Birategurwa..." : "Vugisha ugurisha"}
                  </button>
                )}

                {hasValidPhone && (
                  <>
                    <button
                      onClick={handleCallClick}
                      className="flex w-full items-center justify-center gap-2 rounded-2xl border kg-border kg-surface px-5 py-3.5 text-xs font-bold kg-text shadow-sm transition hover:border-emerald-500 active:scale-95"
                    >
                      <span>📞</span>
                      Hamagara ugurisha
                    </button>

                    {showDesktopPhone && (
                      <div className="mt-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 flex items-center justify-between backdrop-blur-xl">
                        <div className="flex items-center gap-2">
                          <span>📞</span>
                          <a
                            href={`tel:${listing.contact_phone_number?.replace(/\s+/g, "")}`}
                            className="font-bold text-sm text-emerald-800 dark:text-emerald-300 hover:underline"
                          >
                            {listing.contact_phone_number}
                          </a>
                        </div>
                        <button
                          onClick={copyPhoneNumber}
                          className="rounded-xl px-3 py-1.5 text-xs font-bold kg-surface border kg-border transition hover:border-emerald-500"
                        >
                          {copied ? "Byakopewe! ✓" : "Kopi"}
                        </button>
                      </div>
                    )}
                  </>
                )}

                {/* SELLER EDIT PHONE OPTION */}
                {isOwner && (
                  <div className="mt-4 pt-4 border-t kg-border">
                    <p className="text-xs font-black uppercase tracking-wider kg-text mb-2">
                      Uburyo bw'umucuruzi (Phone Management)
                    </p>
                    {!editingPhone ? (
                      <button
                        onClick={() => setEditingPhone(true)}
                        className="w-full py-2.5 px-4 bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 font-bold text-xs rounded-xl hover:bg-emerald-600/20 transition"
                      >
                        {listing.contact_phone_number ? "✏️ Hindura nimero ya telefoni" : "➕ Ongeramo nimero ya telefoni"}
                      </button>
                    ) : (
                      <div className="space-y-3 bg-emerald-500/5 p-3 rounded-xl border kg-border">
                        <input
                          type="tel"
                          value={newPhoneNumber}
                          onChange={(e) => setNewPhoneNumber(e.target.value)}
                          placeholder="Urugero: +250 788 000 000"
                          className="w-full rounded-xl border kg-border kg-input px-3 py-2 text-xs font-bold outline-none"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={handleSavePhoneNumber}
                            disabled={savingPhone}
                            className="flex-1 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-md disabled:opacity-50"
                          >
                            {savingPhone ? "Bikwa..." : "Bika Nimero"}
                          </button>
                          <button
                            onClick={() => setEditingPhone(false)}
                            className="px-3 py-2 border kg-border text-xs font-bold rounded-xl"
                          >
                            Hagarika
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* SAFETY */}
            <div className="relative mt-5 overflow-hidden rounded-3xl border border-amber-500/20 bg-amber-500/10 p-5 shadow-sm backdrop-blur-xl sm:p-6">
              <div className="relative flex gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-amber-500/20 kg-surface shadow-sm">
                  ⚠️
                </div>
                <div>
                  <h2 className="text-xs font-black uppercase tracking-wider text-amber-900 dark:text-amber-300">
                    Umutekano wawe ni ingenzi
                  </h2>
                  <ul className="mt-2 space-y-1.5 text-xs font-medium leading-relaxed text-amber-800/90 dark:text-amber-200/80">
                    <li>• Ntukohereze amafaranga mbere yo kubona icyo ugura.</li>
                    <li>• Niba bishoboka, bonanira ahantu hizewe.</li>
                    <li>• Reba neza ibintu n'inyandiko mbere yo kwishyura.</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="relative mt-12 border-t kg-border kg-surface backdrop-blur-2xl">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-xl font-black tracking-[-0.07em] bg-gradient-to-r from-slate-500 via-emerald-700 to-emerald-900 dark:from-slate-300 dark:via-emerald-400 dark:to-emerald-500 bg-clip-text text-transparent">
              KUGURISHA
            </span>
            <p className="text-xs font-bold kg-text-muted">
              Gura icyo ushaka. Gurisha icyo ufite.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}