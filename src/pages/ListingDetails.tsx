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
  categories: { name: string } | null
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

/* ──────────────────────────────────────────────────────────────────────────
   ICON SYSTEM
   ────────────────────────────────────────────────────────────────────────── */
type IconProps = { className?: string }
const Icon = {
  ArrowLeft: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
    </svg>
  ),
  ArrowRight: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
    </svg>
  ),
  Heart: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
    </svg>
  ),
  HeartFilled: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
    </svg>
  ),
  Chat: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
    </svg>
  ),
  Phone: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
    </svg>
  ),
  Pin: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
    </svg>
  ),
  Tag: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
    </svg>
  ),
  Clock: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Check: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.4} d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  ),
  Alert: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
    </svg>
  ),
  Shield: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  ),
  Bolt: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
    </svg>
  ),
  Sparkles: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
    </svg>
  ),
  Image: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25z" />
    </svg>
  ),
  Copy: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
    </svg>
  ),
  Pencil: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
    </svg>
  ),
  Plus: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  ),
  Flag: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 3v18m0-13.5c0 0 3-1.5 6-1.5s6 1.5 6 1.5 3-1.5 6-1.5v9c-3 0-6 1.5-6 1.5s-3-1.5-6-1.5-6 1.5-6 1.5" />
    </svg>
  ),
  User: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  ),
  Store: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614" />
    </svg>
  ),
  X: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
}

/* ──────────────────────────────────────────────────────────────────────────
   HELPERS
   ────────────────────────────────────────────────────────────────────────── */
function formatPrice(price: number | null, listingType: string) {
  if (listingType === "free") return "Ubuntu"
  if (price === null || price === undefined) return "Vugana n'ugurisha"
  return `${new Intl.NumberFormat("en-US").format(price)} RWF`
}

function conditionLabel(condition: string | null) {
  switch (condition) {
    case "new": return "Gishya"
    case "used": return "Cyakoreshejwe"
    case "refurbished": return "Cyasanwe neza"
    case "not_applicable": return "Ntabwo bireba"
    default: return "Ntabwo byavuzwe"
  }
}

function listingTypeLabel(type: string) {
  switch (type) {
    case "sale": return "Kugurisha"
    case "rent": return "Gukodesha"
    case "free": return "Ubuntu"
    case "wanted": return "Ndabishaka"
    default: return type
  }
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("rw-RW", { day: "numeric", month: "long", year: "numeric" }).format(new Date(date))
}

/* ──────────────────────────────────────────────────────────────────────────
   COMPONENT
   ────────────────────────────────────────────────────────────────────────── */
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

  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [editingPhone, setEditingPhone] = useState(false)
  const [newPhoneNumber, setNewPhoneNumber] = useState("")
  const [savingPhone, setSavingPhone] = useState(false)

  useEffect(() => {
    if (!id) return
    void loadListing()
    void checkUser()
    void checkFavorite()
  }, [id])

  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) setCurrentUserId(user.id)
  }

  async function loadListing() {
    try {
      setLoading(true); setError("")
      const { data, error } = await supabase
        .from("listings")
        .select(`
          id, seller_id, title, description, price, currency, condition, status, listing_type,
          contact_phone, contact_phone_number, contact_chat, created_at,
          categories ( name ),
          locations ( province, district, sector, cell, village )
        `)
        .eq("id", id).maybeSingle()

      if (error) throw error
      if (!data) { setError("Iyi listing ntibonetse."); return }

      let activePhoneNumber = data.contact_phone_number?.trim() || null

      if (!activePhoneNumber && data.seller_id) {
        const { data: profileData } = await supabase
          .from("profiles").select("phone").eq("id", data.seller_id).maybeSingle()
        if (profileData?.phone && profileData.phone.trim().length > 0) activePhoneNumber = profileData.phone.trim()
      }

      if (!activePhoneNumber && data.seller_id) {
        const { data: userPrevListings } = await supabase
          .from("listings").select("contact_phone_number")
          .eq("seller_id", data.seller_id)
          .not("contact_phone_number", "is", null)
          .order("created_at", { ascending: false }).limit(1)
        if (userPrevListings && userPrevListings.length > 0 && userPrevListings[0].contact_phone_number) {
          activePhoneNumber = userPrevListings[0].contact_phone_number.trim()
        }
      }

      const normalizedListing: Listing = {
        ...data,
        contact_phone_number: activePhoneNumber,
        categories: Array.isArray(data.categories) ? data.categories[0] ?? null : data.categories,
        locations: Array.isArray(data.locations) ? data.locations[0] ?? null : data.locations,
      }

      setListing(normalizedListing)
      if (activePhoneNumber) setNewPhoneNumber(activePhoneNumber)

      const { data: imageData, error: imageError } = await supabase
        .from("listing_images").select("id, image_url, sort_order")
        .eq("listing_id", id).order("sort_order", { ascending: true })

      if (imageError) throw imageError

      const loadedImages = (imageData || []) as ListingImage[]
      setImages(loadedImages)
      if (loadedImages.length > 0) setSelectedImage(loadedImages[0].image_url)
    } catch (err) {
      console.error(err)
      setError("Habaye ikibazo mu kuzana listing.")
    } finally {
      setLoading(false)
    }
  }

  async function checkFavorite() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || !id) return
      const { data } = await supabase.from("favorites").select("listing_id")
        .eq("user_id", user.id).eq("listing_id", id).maybeSingle()
      setFavorite(!!data)
    } catch (err) { console.error(err) }
  }

  async function toggleFavorite() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { navigate("/login"); return }
      if (!id) return

      setFavoriteLoading(true)
      if (favorite) {
        const { error } = await supabase.from("favorites").delete().eq("user_id", user.id).eq("listing_id", id)
        if (error) throw error
        setFavorite(false)
      } else {
        const { error } = await supabase.from("favorites").insert({ user_id: user.id, listing_id: id })
        if (error) throw error
        setFavorite(true)
      }
    } catch (err) { console.error(err); alert("Habaye ikibazo. Ongera ugerageze.") }
    finally { setFavoriteLoading(false) }
  }

  async function handleContactSeller() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { navigate("/login"); return }
      if (!listing) return
      if (user.id === listing.seller_id) { alert("Ntushobora kwandikira wowe ubwawe."); return }
      if (!listing.contact_chat) { alert("Uyu mucuruzi ntabwo yemeye ubutumwa."); return }

      setContactLoading(true)
      const { data: existingConversation, error: existingError } = await supabase
        .from("conversations").select("id")
        .eq("listing_id", listing.id).eq("buyer_id", user.id).eq("seller_id", listing.seller_id).maybeSingle()
      if (existingError) throw existingError

      if (existingConversation) { navigate(`/messages/${existingConversation.id}`); return }

      const { data: newConversation, error: createError } = await supabase
        .from("conversations")
        .insert({ listing_id: listing.id, buyer_id: user.id, seller_id: listing.seller_id })
        .select("id").single()
      if (createError) throw createError

      navigate(`/messages/${newConversation.id}`)
    } catch (err) {
      console.error(err)
      alert("Ntibyakunze gutangiza conversation. Ongera ugerageze.")
    } finally { setContactLoading(false) }
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
    if (!newPhoneNumber.trim()) { alert("Nyamuneka andika nimero ya telefoni."); return }

    setSavingPhone(true)
    try {
      const { error } = await supabase.from("listings").update({
        contact_phone: true,
        contact_phone_number: newPhoneNumber.trim(),
      }).eq("id", listing.id).eq("seller_id", currentUserId)
      if (error) throw error

      setListing((prev) => prev ? { ...prev, contact_phone: true, contact_phone_number: newPhoneNumber.trim() } : null)
      setEditingPhone(false)
      alert("Nimero ya telefoni yabitswe neza!")
    } catch (err) {
      console.error(err)
      alert("Habaye ikibazo mu kubika nimero. Ongera ugerageze.")
    } finally { setSavingPhone(false) }
  }

  async function handleReport() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { navigate("/login"); return }
      if (!listing) return

      const reason = window.prompt("Ni iki kibazo wabonye kuri iyi listing?")
      if (!reason || !reason.trim()) return

      setReportLoading(true)
      const { error } = await supabase.from("reports").insert({
        reporter_id: user.id, listing_id: listing.id, reason: reason.trim(),
      })
      if (error) throw error
      alert("Raporo yawe yakiriwe. Murakoze.")
    } catch (err) { console.error(err); alert("Raporo ntiyoherejwe. Ongera ugerageze.") }
    finally { setReportLoading(false) }
  }

  function locationText() {
    if (!listing?.locations) return "Aho biherereye ntihavuzwe"
    const l = listing.locations
    return [l.village, l.cell, l.sector, l.district, l.province].filter(Boolean).join(", ")
  }

  /* ─────────── LOADING ─────────── */
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f4f8fb] dark:bg-[#060f19]">
        <header className="sticky top-0 z-20 border-b border-slate-200/60 bg-white/70 backdrop-blur-2xl dark:border-white/10 dark:bg-[#060f19]/70">
          <div className="mx-auto flex h-16 max-w-7xl items-center px-4 sm:px-6 lg:px-8">
            <Link to="/" className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30">
                <Icon.Tag className="w-4 h-4" />
              </span>
              <span className="text-sm font-black text-slate-900 dark:text-white">KUGURISHA<span className="text-blue-600 dark:text-blue-400">.COM</span></span>
            </Link>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
            <div className="aspect-square animate-pulse rounded-3xl border border-slate-200/70 bg-white/50 dark:border-white/10 dark:bg-slate-900/40" />
            <div className="space-y-4">
              <div className="h-5 w-32 animate-pulse rounded-full bg-slate-200 dark:bg-white/10" />
              <div className="h-12 w-4/5 animate-pulse rounded-xl bg-slate-200 dark:bg-white/10" />
              <div className="h-14 w-2/5 animate-pulse rounded-xl bg-slate-200 dark:bg-white/10" />
              <div className="grid grid-cols-2 gap-3">
                <div className="h-24 animate-pulse rounded-2xl bg-slate-200 dark:bg-white/10" />
                <div className="h-24 animate-pulse rounded-2xl bg-slate-200 dark:bg-white/10" />
              </div>
              <div className="h-32 animate-pulse rounded-2xl bg-slate-200 dark:bg-white/10" />
            </div>
          </div>
        </main>
      </div>
    )
  }

  /* ─────────── ERROR ─────────── */
  if (error || !listing) {
    return (
      <div className="relative min-h-screen bg-[#f4f8fb] dark:bg-[#060f19]">
        <header className="sticky top-0 z-10 border-b border-slate-200/60 bg-white/70 backdrop-blur-2xl dark:border-white/10 dark:bg-[#060f19]/70">
          <div className="mx-auto flex h-16 max-w-7xl items-center px-4 sm:px-6 lg:px-8">
            <Link to="/" className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg">
                <Icon.Tag className="w-4 h-4" />
              </span>
              <span className="text-sm font-black text-slate-900 dark:text-white">KUGURISHA<span className="text-blue-600 dark:text-blue-400">.COM</span></span>
            </Link>
          </div>
        </header>

        <main className="mx-auto flex min-h-[75vh] max-w-md items-center justify-center px-4 py-16">
          <div className="w-full overflow-hidden rounded-3xl border border-slate-200/70 bg-white/90 p-8 text-center shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-slate-900/60">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/15 to-indigo-500/10 text-blue-500">
              <Icon.Alert className="w-8 h-8" />
            </div>
            <h1 className="mt-5 text-2xl font-black text-slate-900 dark:text-white">Listing ntiyabonetse</h1>
            <p className="mt-2 text-sm font-medium leading-6 text-slate-500 dark:text-slate-400">
              {error || "Iyi listing ntabwo ikiboneka."}
            </p>
            <Link
              to="/"
              className="group mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#FF5D00] via-[#FF7424] to-[#e05200] px-6 py-3 text-xs font-black text-white shadow-lg shadow-[#FF5D00]/30 transition hover:-translate-y-0.5"
            >
              <Icon.ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
              Subira kuri Home
            </Link>
          </div>
        </main>
      </div>
    )
  }

  const hasValidPhone = Boolean(listing.contact_phone_number && listing.contact_phone_number.trim().length > 0)
  const isOwner = currentUserId && currentUserId === listing.seller_id

  return (
    <div className="min-h-screen bg-[#f4f8fb] text-[#102436] dark:bg-[#060f19] dark:text-slate-100">
      {/* Ambient glows */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-blue-500/10 blur-[140px] dark:bg-blue-500/[0.06]" />
        <div className="absolute top-1/3 -right-40 h-[600px] w-[600px] rounded-full bg-[#FF5D00]/10 blur-[140px] dark:bg-[#FF5D00]/[0.06]" />
        <div className="absolute bottom-0 left-1/3 h-[500px] w-[500px] rounded-full bg-indigo-500/10 blur-[140px] dark:bg-indigo-500/[0.04]" />
      </div>

      {/* HEADER */}
      <header className="sticky top-0 z-30 border-b border-slate-200/60 bg-white/70 backdrop-blur-2xl dark:border-white/10 dark:bg-[#060f19]/70">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link to="/" className="group flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30 transition-transform group-hover:scale-105">
              <Icon.Tag className="w-4 h-4" />
            </span>
            <div>
              <p className="text-sm font-black tracking-tight text-slate-900 dark:text-white">
                KUGURISHA
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-indigo-400">.COM</span>
              </p>
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Listing</p>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="hidden items-center gap-1.5 rounded-full border border-slate-200/80 bg-white px-3.5 py-2 text-xs font-extrabold text-slate-700 shadow-sm transition hover:border-[#FF5D00] hover:text-[#FF5D00] dark:border-white/10 dark:bg-white/[0.06] dark:text-slate-200 sm:inline-flex"
            >
              <Icon.ArrowLeft className="w-3.5 h-3.5" />
              Ahabanza
            </Link>
            <Link
              to="/favorites"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200/80 bg-white text-slate-600 shadow-sm transition hover:border-[#FF5D00] hover:text-[#FF5D00] dark:border-white/10 dark:bg-white/[0.06] dark:text-slate-300"
            >
              <Icon.Heart className="w-4 h-4" />
            </Link>
            <Link
              to="/create-listing"
              className="group inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#FF5D00] via-[#FF7424] to-[#e05200] px-3.5 py-2 text-xs font-black text-white shadow-md shadow-[#FF5D00]/30 transition hover:-translate-y-0.5"
            >
              <Icon.Plus className="w-3.5 h-3.5" />
              Gurisha
            </Link>
          </div>
        </div>
      </header>

      {/* CONTENT */}
      <main className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {/* BREADCRUMB */}
        <div className="mb-5 flex items-center justify-between gap-4">
          <Link
            to="/"
            className="group inline-flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-white px-3 py-1.5 text-[11px] font-bold text-slate-600 shadow-sm transition hover:border-[#FF5D00] hover:text-[#FF5D00] dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300"
          >
            <Icon.ArrowLeft className="w-3 h-3 transition-transform group-hover:-translate-x-0.5" />
            Subira kuri listings
          </Link>

          <button
            onClick={handleReport}
            disabled={reportLoading}
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-white px-3 py-1.5 text-[11px] font-bold text-slate-500 shadow-sm transition hover:border-rose-500/40 hover:text-rose-600 disabled:opacity-50 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-400"
          >
            <Icon.Flag className="w-3 h-3" />
            {reportLoading ? "Kohereza..." : "Report"}
          </button>
        </div>

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_400px]">
          {/* LEFT: GALLERY + DESCRIPTION */}
          <div className="space-y-5">
            {/* GALLERY */}
            <div className="overflow-hidden rounded-[1.75rem] border border-slate-200/70 bg-white/90 shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-slate-900/60">
              <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900">
                {selectedImage ? (
                  <img
                    src={selectedImage}
                    alt={listing.title}
                    className="h-full w-full object-cover transition duration-500"
                  />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center text-slate-400">
                    <Icon.Image className="w-14 h-14" />
                    <p className="mt-3 text-xs font-bold">Nta foto iriho</p>
                  </div>
                )}

                {listing.categories && (
                  <div className="absolute left-4 top-4 rounded-full bg-black/60 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-white backdrop-blur-md">
                    {listing.categories.name}
                  </div>
                )}

                <div className="absolute bottom-4 right-4 rounded-full bg-black/60 px-3 py-1 text-[10px] font-black text-white backdrop-blur-md">
                  {images.length > 0 ? `${images.length} ${images.length === 1 ? "foto" : "amafoto"}` : "Nta foto"}
                </div>

                {/* Favorite on image */}
                <button
                  onClick={toggleFavorite}
                  disabled={favoriteLoading}
                  className={`absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full backdrop-blur-md transition ${
                    favorite
                      ? "bg-rose-500 text-white shadow-md"
                      : "bg-white/90 text-slate-700 hover:bg-white dark:bg-black/50 dark:text-white"
                  }`}
                >
                  {favorite ? <Icon.HeartFilled className="w-4 h-4" /> : <Icon.Heart className="w-4 h-4" />}
                </button>
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto border-t border-slate-100 bg-slate-50/60 p-3 dark:border-white/10 dark:bg-white/[0.02]">
                  {images.map((image) => (
                    <button
                      key={image.id}
                      onClick={() => setSelectedImage(image.image_url)}
                      className={`h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 transition ${
                        selectedImage === image.image_url
                          ? "border-[#FF5D00] ring-2 ring-[#FF5D00]/20"
                          : "border-transparent opacity-70 hover:opacity-100"
                      }`}
                    >
                      <img src={image.image_url} alt="" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* DESCRIPTION */}
            <div className="overflow-hidden rounded-[1.75rem] border border-slate-200/70 bg-white/90 shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-slate-900/60">
              <div className="border-b border-slate-100 px-6 py-4 dark:border-white/10">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                    <Icon.Sparkles className="w-3.5 h-3.5" />
                  </span>
                  <h2 className="text-sm font-black text-slate-900 dark:text-white">Ibisobanuro</h2>
                </div>
              </div>
              <div className="p-6">
                <p className="whitespace-pre-wrap text-sm font-medium leading-7 text-slate-600 dark:text-slate-300">
                  {listing.description || "Nta bisobanuro byashyizweho kuri iyi listing."}
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT: STICKY SIDEBAR */}
          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            {/* MAIN INFO CARD */}
            <div className="overflow-hidden rounded-[1.75rem] border border-slate-200/70 bg-white/90 shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-slate-900/60">
              <div className="p-6">
                {listing.categories && (
                  <p className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">
                    {listing.categories.name}
                  </p>
                )}
                <h1 className="mt-1.5 text-xl font-black leading-tight text-slate-900 dark:text-white sm:text-2xl">
                  {listing.title}
                </h1>

                {/* Price */}
                <div className="mt-4 flex items-baseline gap-2">
                  <p className="text-3xl font-black tracking-tight text-[#FF5D00]">
                    {formatPrice(listing.price, listing.listing_type)}
                  </p>
                </div>
                <p className="mt-1 inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-slate-600 dark:bg-white/[0.06] dark:text-slate-300">
                  {listingTypeLabel(listing.listing_type)}
                </p>

                {/* Meta chips */}
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <div className="rounded-xl bg-slate-50 p-3 dark:bg-white/[0.03]">
                    <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">Ubwoko</p>
                    <p className="mt-0.5 text-xs font-black text-slate-900 dark:text-white">
                      {listingTypeLabel(listing.listing_type)}
                    </p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3 dark:bg-white/[0.03]">
                    <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">Imimerere</p>
                    <p className="mt-0.5 text-xs font-black text-slate-900 dark:text-white">
                      {conditionLabel(listing.condition)}
                    </p>
                  </div>
                </div>

                {/* Location */}
                <div className="mt-3 flex items-start gap-2 rounded-xl bg-emerald-500/5 p-3 dark:bg-emerald-500/[0.08]">
                  <Icon.Pin className="w-3.5 h-3.5 mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <div className="min-w-0">
                    <p className="text-[9px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Aho biherereye</p>
                    <p className="mt-0.5 text-xs font-bold text-slate-900 dark:text-white">{locationText()}</p>
                  </div>
                </div>

                {/* Date */}
                <div className="mt-3 flex items-center justify-between text-[11px]">
                  <span className="flex items-center gap-1 font-bold text-slate-400">
                    <Icon.Clock className="w-3 h-3" />
                    Yashyizweho
                  </span>
                  <span className="font-black text-slate-700 dark:text-slate-200">{formatDate(listing.created_at)}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="border-t border-slate-100 bg-slate-50/60 p-4 space-y-2 dark:border-white/10 dark:bg-white/[0.02]">
                {listing.contact_chat && (
                  <button
                    onClick={handleContactSeller}
                    disabled={contactLoading}
                    className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-[#FF5D00] via-[#FF7424] to-[#e05200] py-3 text-sm font-black text-white shadow-md shadow-[#FF5D00]/30 transition hover:-translate-y-0.5 active:scale-95 disabled:opacity-50"
                  >
                    <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                    <Icon.Chat className="relative w-4 h-4" />
                    <span className="relative">{contactLoading ? "Birategurwa..." : "Vugisha ugurisha"}</span>
                  </button>
                )}

                {hasValidPhone && (
                  <button
                    onClick={handleCallClick}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-3 text-sm font-black text-slate-700 transition hover:border-[#FF5D00] hover:text-[#FF5D00] active:scale-95 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200"
                  >
                    <Icon.Phone className="w-4 h-4" />
                    Hamagara ugurisha
                  </button>
                )}

                {showDesktopPhone && hasValidPhone && (
                  <div className="flex items-center justify-between rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <Icon.Phone className="w-3.5 h-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                      <a
                        href={`tel:${listing.contact_phone_number?.replace(/\s+/g, "")}`}
                        className="truncate text-xs font-black text-emerald-700 hover:underline dark:text-emerald-300"
                      >
                        {listing.contact_phone_number}
                      </a>
                    </div>
                    <button
                      onClick={copyPhoneNumber}
                      className="flex shrink-0 items-center gap-1 rounded-lg bg-white px-2.5 py-1.5 text-[10px] font-black text-emerald-600 shadow-sm transition hover:bg-emerald-50 dark:bg-white/10 dark:text-emerald-300"
                    >
                      {copied ? <><Icon.Check className="w-3 h-3" />Byakopewe</> : <><Icon.Copy className="w-3 h-3" />Kopi</>}
                    </button>
                  </div>
                )}

                {/* Owner phone edit */}
                {isOwner && (
                  <div className="pt-2">
                    {!editingPhone ? (
                      <button
                        onClick={() => setEditingPhone(true)}
                        className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-blue-500/10 py-2.5 text-[11px] font-black text-blue-600 transition hover:bg-blue-500/20 dark:text-blue-400"
                      >
                        {listing.contact_phone_number ? (
                          <><Icon.Pencil className="w-3 h-3" />Hindura nimero</>
                        ) : (
                          <><Icon.Plus className="w-3 h-3" />Ongeramo nimero</>
                        )}
                      </button>
                    ) : (
                      <div className="space-y-2 rounded-xl border border-blue-500/20 bg-blue-500/5 p-3">
                        <input
                          type="tel"
                          value={newPhoneNumber}
                          onChange={(e) => setNewPhoneNumber(e.target.value)}
                          placeholder="+250 788 000 000"
                          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-900 outline-none transition focus:border-[#FF5D00] focus:ring-2 focus:ring-[#FF5D00]/10 dark:border-white/10 dark:bg-white/[0.04] dark:text-white"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={handleSavePhoneNumber}
                            disabled={savingPhone}
                            className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-blue-600 py-2 text-[11px] font-black text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-50"
                          >
                            {savingPhone ? "Bikwa..." : <><Icon.Check className="w-3 h-3" />Bika</>}
                          </button>
                          <button
                            onClick={() => setEditingPhone(false)}
                            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] font-black text-slate-600 transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300"
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

            {/* SELLER CARD */}
            <div className="overflow-hidden rounded-[1.75rem] border border-slate-200/70 bg-white/90 p-5 shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-slate-900/60">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md">
                  <Icon.User className="w-5 h-5" />
                </span>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">Umucuruzi</p>
                  <p className="text-sm font-black text-slate-900 dark:text-white">Umukoresha wa KUGURISHA</p>
                  <p className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                    <Icon.Shield className="w-2.5 h-2.5" />
                    Yemejwe
                  </p>
                </div>
              </div>
            </div>

            {/* SAFETY */}
            <div className="rounded-[1.75rem] border border-amber-500/25 bg-amber-500/[0.06] p-5 shadow-sm backdrop-blur-sm dark:border-amber-500/20 dark:bg-amber-500/[0.05]">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400">
                  <Icon.Alert className="w-4 h-4" />
                </span>
                <h3 className="text-xs font-black text-amber-900 dark:text-amber-300">Umutekano wawe ni ingenzi</h3>
              </div>
              <ul className="mt-3 space-y-2 text-[11px] font-medium leading-5 text-amber-800/90 dark:text-amber-200/80">
                {[
                  "Ntukohereze amafaranga mbere yo kubona icyo ugura.",
                  "Niba bishoboka, bonanira ahantu hizewe.",
                  "Reba neza ibintu n'inyandiko mbere yo kwishyura.",
                ].map((tip, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <Icon.Check className="w-3 h-3 mt-0.5 shrink-0 text-amber-600 dark:text-amber-400" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>

            {/* Trust footer */}
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-[10px] font-semibold text-slate-400">
              <span className="flex items-center gap-1">
                <Icon.Shield className="w-3 h-3 text-emerald-500" />
                Umutekano
              </span>
              <span className="flex items-center gap-1">
                <Icon.Bolt className="w-3 h-3 text-blue-500" />
                Byihuse
              </span>
              <span className="flex items-center gap-1">
                <Icon.Check className="w-3 h-3 text-emerald-500" />
                Byizewe
              </span>
            </div>
          </aside>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="relative mt-8 border-t border-slate-200/60 bg-white/70 backdrop-blur-2xl dark:border-white/10 dark:bg-[#060f19]/70">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 px-4 py-8 sm:flex-row sm:items-center sm:px-6 lg:px-8">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md">
              <Icon.Tag className="w-4 h-4" />
            </span>
            <div>
              <p className="text-sm font-black text-slate-900 dark:text-white">
                KUGURISHA<span className="text-blue-600 dark:text-blue-400">.COM</span>
              </p>
              <p className="text-[11px] text-slate-400">Isoko ryawe ryo mu Rwanda</p>
            </div>
          </div>
          <Link to="/" className="group inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 transition hover:text-[#FF5D00] dark:text-slate-400">
            Ahabanza
            <Icon.ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </footer>
    </div>
  )
}