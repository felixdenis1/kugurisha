import { useEffect, useRef, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import {
  AlertCircle,
  Check,
  CheckCircle2,
  FileText,
  Image as ImageIcon,
  KeyRound,
  Loader2,
  MapPin,
  Phone,
  Plus,
  Camera,
  Banknote,
  Tag,
  X,
  Save,
  Sparkles,
  Eye,
  Clock,
  Trash2,
  ArrowRight,
  Shield,
  Grid,
  Pencil,
  Bolt,
  ChevronDown,
  ChevronUp,
} from "lucide-react"

import { supabase } from "../services/supabase"

type Category = {
  id: string
  name: string
}

type ExistingImage = {
  id: string
  image_url: string
  sort_order: number
}

type PreviousPhoneOption = {
  number: string
  lastUsedAt: string
}

/* ──────────────────────────────────────────────────────────────────
   Style tokens
   ────────────────────────────────────────────────────────────────── */
const cardCls =
  "relative overflow-hidden rounded-[28px] border border-slate-200/70 bg-white/80 shadow-sm backdrop-blur-sm transition-all duration-300 dark:border-white/10 dark:bg-slate-900/60"
const cardHeaderCls =
  "flex items-start justify-between gap-4 border-b border-slate-100 dark:border-white/10 px-5 py-4 sm:px-7 sm:py-5"
const inputCls =
  "w-full rounded-2xl border border-slate-200/80 bg-slate-50/50 px-4 py-3.5 text-sm font-bold text-slate-900 outline-none transition-all placeholder:font-semibold placeholder:text-slate-400 focus:border-[#FF5D00] focus:bg-white focus:ring-4 focus:ring-[#FF5D00]/10 dark:border-white/10 dark:bg-white/[0.03] dark:text-white dark:placeholder:text-slate-500"
const labelCls = "text-sm font-black text-slate-900 dark:text-white"
const iconBoxCls =
  "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#FF5D00]/10 text-[#FF5D00] ring-1 ring-[#FF5D00]/15"

/* Safe UUID — unchanged happy path, fallback only on ancient WebViews */
function safeUUID(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID()
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === "x" ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

function SectionHeader({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode
  title: string
  subtitle: string
}) {
  return (
    <div className="flex min-w-0 items-start gap-3.5">
      <div className={iconBoxCls}>{icon}</div>
      <div className="min-w-0">
        <h2 className="text-base font-black tracking-tight text-slate-900 dark:text-white sm:text-lg">
          {title}
        </h2>
        <p className="mt-0.5 text-xs leading-5 text-slate-500 dark:text-slate-400">{subtitle}</p>
      </div>
    </div>
  )
}

export default function EditListing() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const formRef = useRef<HTMLFormElement | null>(null)
  const submittingRef = useRef(false)

  const [categories, setCategories] = useState<Category[]>([])
  const [existingImages, setExistingImages] = useState<ExistingImage[]>([])
  const [newImages, setNewImages] = useState<File[]>([])
  const [newPreviewUrls, setNewPreviewUrls] = useState<string[]>([])
  const [activePreviewIndex, setActivePreviewIndex] = useState(0)

  const [title, setTitle] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [listingType, setListingType] = useState("sale")
  const [condition, setCondition] = useState("used")

  const [province, setProvince] = useState("")
  const [district, setDistrict] = useState("")
  const [sector, setSector] = useState("")
  const [locationId, setLocationId] = useState<string | null>(null)

  const [contactPhone, setContactPhone] = useState(true)
  const [phoneNumber, setPhoneNumber] = useState("")
  const [selectedPhoneOption, setSelectedPhoneOption] = useState<"previous" | "new">("new")
  const [previousNumbers, setPreviousNumbers] = useState<PreviousPhoneOption[]>([])
  const [fetchingPhones, setFetchingPhones] = useState(false)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")
  const [success, setSuccess] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  // Tracks which field failed validation so we can highlight it
  const [errorField, setErrorField] = useState<string | null>(null)

  useEffect(() => {
    if (id) {
      void loadListing()
      void loadPreviousPhones()
    }
  }, [id])

  useEffect(() => {
    const urls = newImages.map((file) => URL.createObjectURL(file))
    setNewPreviewUrls(urls)
    return () => urls.forEach((url) => URL.revokeObjectURL(url))
  }, [newImages])

  useEffect(() => {
    setActivePreviewIndex((prev) =>
      prev >= existingImages.length ? Math.max(0, existingImages.length - 1) : prev,
    )
  }, [existingImages.length])

  async function loadListing(): Promise<void> {
    try {
      setLoading(true)
      setMessage("")
      if (!id) return
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { navigate("/login"); return }

      const { data: listing, error } = await supabase
        .from("listings")
        .select(`
          id, seller_id, title, description, price, listing_type, condition,
          category_id, location_id, contact_phone, contact_phone_number
        `)
        .eq("id", id)
        .eq("seller_id", user.id)
        .single()

      if (error || !listing) {
        console.error(error)
        setMessage("Ntitwashoboye kubona iyi listing.")
        return
      }

      setTitle(listing.title || "")
      setDescription(listing.description || "")
      setPrice(listing.price !== null && listing.price !== undefined ? String(listing.price) : "")
      setListingType(listing.listing_type === "free" ? "sale" : listing.listing_type || "sale")
      setCondition(listing.condition || "used")
      setCategoryId(listing.category_id || "")
      setContactPhone(listing.contact_phone ?? true)
      setPhoneNumber(listing.contact_phone_number || "")
      setLocationId(listing.location_id ?? null)

      if (listing.location_id) {
        const { data: loc, error: locErr } = await supabase
          .from("locations")
          .select("id, province, district, sector")
          .eq("id", listing.location_id)
          .maybeSingle()
        if (!locErr && loc) {
          setProvince(loc.province || "")
          setDistrict(loc.district || "")
          setSector(loc.sector || "")
        }
      } else {
        setProvince("")
        setDistrict("")
        setSector("")
      }

      const { data: categoryData } = await supabase
        .from("categories")
        .select("id, name")
        .eq("is_active", true)
        .order("sort_order", { ascending: true })
      setCategories(categoryData || [])

      const { data: imageData } = await supabase
        .from("listing_images")
        .select("id, image_url, sort_order")
        .eq("listing_id", id)
        .order("sort_order", { ascending: true })
      setExistingImages(imageData || [])
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Habaye ikibazo mu kuzana listing."
      console.error(errorMsg)
      setMessage("Habaye ikibazo mu kuzana listing.")
    } finally {
      setLoading(false)
    }
  }

  async function loadPreviousPhones(): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setFetchingPhones(true)
      const { data, error } = await supabase
        .from("listings")
        .select("contact_phone_number, created_at")
        .eq("seller_id", user.id)
        .not("contact_phone_number", "is", null)
        .order("created_at", { ascending: false })

      if (!error && data) {
        const uniqueMap = new Map<string, string>()
        data.forEach((item: { contact_phone_number: string | null; created_at: string }) => {
          if (item.contact_phone_number) {
            const cleaned = item.contact_phone_number.trim()
            if (cleaned && !uniqueMap.has(cleaned)) uniqueMap.set(cleaned, item.created_at)
          }
        })
        const uniqueList: PreviousPhoneOption[] = Array.from(uniqueMap.entries()).map(
          ([number, lastUsedAt]) => ({ number, lastUsedAt })
        )
        setPreviousNumbers(uniqueList)
      }
    } catch (err: unknown) {
      console.error("Failed to load phone history:", err instanceof Error ? err.message : err)
    } finally {
      setFetchingPhones(false)
    }
  }

  function handleNewImages(e: React.ChangeEvent<HTMLInputElement>): void {
    const files = Array.from(e.target.files || [])
    const total = existingImages.length + files.length
    if (total > 5) {
      const allowed = Math.max(0, 5 - existingImages.length)
      setNewImages(files.slice(0, allowed))
      setMessage("Ushobora kugira amafoto atarenze 5 yose hamwe.")
      setSuccess(false)
      e.target.value = ""
      return
    }
    setMessage("")
    setNewImages(files)
    e.target.value = ""
  }

  async function deleteExistingImage(image: ExistingImage): Promise<void> {
    if (!window.confirm("Urashaka gusiba iri foto?")) return
    const { error } = await supabase.from("listing_images").delete().eq("id", image.id)
    if (error) {
      setSuccess(false)
      setMessage(`Ntibyashobotse gusiba ifoto: ${error.message}`)
      return
    }
    setExistingImages((cur) => cur.filter((item) => item.id !== image.id))
    setMessage("")
  }

  function removeNewImage(index: number): void {
    setNewImages((cur) => cur.filter((_, i) => i !== index))
  }

  async function uploadNewImages(): Promise<void> {
    if (!id || newImages.length === 0) return
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Ugomba kwinjira.")
    const startOrder = existingImages.length

    for (let i = 0; i < newImages.length; i++) {
      const image = newImages[i]
      const extension = image.name.split(".").pop()?.toLowerCase() || "jpg"
      const filePath = `${user.id}/${id}/${safeUUID()}.${extension}`
      const { error: uploadError } = await supabase.storage
        .from("listing-images")
        .upload(filePath, image, { cacheControl: "3600", upsert: false, contentType: image.type })
      if (uploadError) { console.error("Upload Error:", uploadError.message); continue }
      const { data: { publicUrl } } = supabase.storage.from("listing-images").getPublicUrl(filePath)
      const { error: imageError } = await supabase.from("listing_images").insert({
        listing_id: id, image_url: publicUrl, sort_order: startOrder + i,
      })
      if (imageError) console.error("Image DB Insert Error:", imageError.message)
    }
  }

  function validatePhone(phone: string): boolean {
    const cleaned = phone.replace(/[\s\-\(\)]/g, "")
    const rwandaRegex = /^(?:\+?250|0)?7[2389]\d{7}$/
    const globalE164Regex = /^\+[1-9]\d{6,14}$/
    return rwandaRegex.test(cleaned) || globalE164Regex.test(cleaned)
  }

  function normalizePhoneNumber(phone: string): string {
    let cleaned = phone.replace(/[\s\-\(\)]/g, "")
    if (cleaned.startsWith("07") && cleaned.length === 10) cleaned = "+250" + cleaned.slice(1)
    else if (cleaned.startsWith("250") && cleaned.length === 12) cleaned = "+" + cleaned
    return cleaned
  }

  function formatLocation(): string {
    return [sector, district, province].filter(Boolean).join(", ")
  }

  function scrollToField(key: string) {
    if (!formRef.current) return
    const el = formRef.current.querySelector<HTMLElement>(`[data-field="${key}"]`)
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" })
      const input = el.querySelector<HTMLElement>("input, select, textarea")
      input?.focus({ preventScroll: true })
    }
  }

  /**
   * MASTER SAVE — called by every button (desktop form + mobile sticky bar).
   * Does not rely on native form submission, form= attribute, or HTML5 required.
   * Works identically on all devices.
   */
  async function saveListing(): Promise<void> {
    if (!id) return
    if (submittingRef.current || saving) return
    submittingRef.current = true
    setSaving(true)
    setMessage("")
    setSuccess(false)
    setErrorField(null)

    // Scroll to top so the toast is guaranteed visible (esp. on mobile)
    window.scrollTo({ top: 0, behavior: "smooth" })

    try {
      if (!title.trim()) { setMessage("Andika izina ry'ikintu."); setErrorField("title"); scrollToField("title"); return }
      if (!categoryId) { setMessage("Hitamo category."); setErrorField("category"); scrollToField("category"); return }
      if (!province.trim()) { setMessage("Andika Province."); setErrorField("province"); scrollToField("province"); return }
      if (contactPhone) {
        if (!phoneNumber.trim()) { setMessage("Shyiramo nimero ya telefoni."); setErrorField("phone"); scrollToField("phone"); return }
        if (!validatePhone(phoneNumber)) { setMessage("Nimero wanditse ntabwo yemewe (+250 cyangwa 07...)."); setErrorField("phone"); scrollToField("phone"); return }
      }

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { navigate("/login"); return }

      const { data: listingData, error: listingFetchError } = await supabase
        .from("listings")
        .select("location_id")
        .eq("id", id)
        .eq("seller_id", user.id)
        .single()
      if (listingFetchError) throw listingFetchError

      const currentLocationId: string | null = listingData?.location_id ?? locationId

      const locationPayload = {
        province: province.trim(),
        district: district.trim() || null,
        sector: sector.trim() || null,
      }

      let resolvedLocationId: string | null = currentLocationId

      if (currentLocationId) {
        const { error: locationError } = await supabase
          .from("locations")
          .update(locationPayload)
          .eq("id", currentLocationId)
        if (locationError) throw locationError
      } else {
        const { data: inserted, error: insertError } = await supabase
          .from("locations")
          .insert(locationPayload)
          .select("id")
          .single()
        if (insertError) throw insertError
        resolvedLocationId = inserted.id
      }

      const finalNormalizedPhone = contactPhone && phoneNumber.trim() ? normalizePhoneNumber(phoneNumber.trim()) : null
      const parsedPrice: number | null = price.trim() !== "" ? Number(price) : null

      const { error: updateError } = await supabase
        .from("listings")
        .update({
          title: title.trim(),
          category_id: categoryId,
          location_id: resolvedLocationId,
          description: description.trim() || null,
          price: parsedPrice,
          listing_type: listingType,
          condition: condition,
          contact_phone: contactPhone,
          contact_phone_number: finalNormalizedPhone,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .eq("seller_id", user.id)
      if (updateError) throw updateError

      await uploadNewImages()
      setSuccess(true)
      setMessage("Kwamamaza ryawe ryavuguruwe neza! 🎉")
      setNewImages([])
      window.scrollTo({ top: 0, behavior: "smooth" })
      await loadListing()
      await loadPreviousPhones()
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Habaye ikibazo mu kubika impinduka."
      console.error("Save error:", errorMsg)
      setSuccess(false)
      setMessage("Habaye ikibazo mu kubika impinduka. Ongera ugerageze.")
    } finally {
      setSaving(false)
      submittingRef.current = false
    }
  }

  function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault()
    void saveListing()
  }

  const listingTypeOptions = [
    { value: "sale", icon: <Tag className="h-5 w-5" strokeWidth={1.8} />, title: "Kugurisha", description: "Shaka umuguzi w'ikintu" },
    { value: "rent", icon: <KeyRound className="h-5 w-5" strokeWidth={1.8} />, title: "Gukodesha", description: "Kodesha icyo ufite" },
  ]

  const conditionLabelMap: Record<string, string> = {
    new: "Bishya", used: "Byakoreshejwe", refurbished: "Byavuguruwe", not_applicable: "Nta mimerere",
  }

  const previewPrice = price && Number(price) > 0 ? `${Number(price).toLocaleString()} FRW` : "0 FRW"
  const selectedCategoryName = categories.find((c) => c.id === categoryId)?.name
  const totalImages = existingImages.length + newImages.length
  const heroImageUrl =
    existingImages[0]?.image_url || newPreviewUrls[0] || undefined

  if (loading) {
    return (
      <main className="relative min-h-screen overflow-hidden bg-[#f4f8fb] dark:bg-[#060f19]">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-[#FF5D00]/10 blur-[120px]" />
          <div className="absolute top-1/3 -right-40 h-[500px] w-[500px] rounded-full bg-blue-500/10 blur-[120px]" />
        </div>
        <div className="relative flex min-h-screen items-center justify-center px-6">
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-200/80 bg-white text-[#FF5D00] shadow-lg dark:border-white/10 dark:bg-slate-900">
              <Loader2 className="h-7 w-7 animate-spin" strokeWidth={1.8} />
            </div>
            <h2 className="mt-5 text-lg font-black text-slate-900 dark:text-white">Turimo kuzana listing...</h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Tegereza akanya gato.</p>
          </div>
        </div>
      </main>
    )
  }

  const previewCard = (
    <div className="overflow-hidden rounded-[2rem] border border-slate-200/90 bg-white shadow-[0_30px_80px_-25px_rgba(16,36,54,0.28)] dark:border-white/10 dark:bg-slate-900 dark:shadow-black/60">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900">
        {heroImageUrl ? (
          <img src={heroImageUrl} alt={title || "Preview"} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full flex-col items-center justify-center p-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-white/60 text-slate-400 shadow-inner dark:bg-white/5">
              <ImageIcon className="w-8 h-8" strokeWidth={1.6} />
            </div>
            <p className="mt-3 text-xs font-extrabold text-slate-500 dark:text-slate-400">Ifoto izagaragara hano</p>
          </div>
        )}

        <div className="absolute left-3 right-3 top-3 flex items-center justify-between gap-2">
          <span className="rounded-full bg-black/60 px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-wider text-white backdrop-blur-md">
            {selectedCategoryName || "Icyiciro"}
          </span>
          <div className="flex items-center gap-1.5">
            <span className="rounded-full bg-[#102436]/85 px-2 py-0.5 text-[9px] font-extrabold text-white backdrop-blur-md">
              {listingType === "rent" ? "Gukodesha" : "Kugurisha"}
            </span>
            <span className="rounded-full bg-[#FF5D00] px-2 py-0.5 text-[9px] font-black text-white shadow-sm">
              {conditionLabelMap[condition] || "Used"}
            </span>
          </div>
        </div>

        {totalImages > 0 && (
          <span className="absolute bottom-3 right-3 rounded-full bg-black/65 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur-md">
            {activePreviewIndex + 1} / {totalImages}
          </span>
        )}
      </div>

      <div className="p-5">
        <h3 className="text-base font-black leading-snug text-slate-900 dark:text-white">
          {title.trim() || "Izina ry'ikintu..."}
        </h3>

        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-xl font-black tracking-tight text-[#FF5D00]">{previewPrice}</span>
          {listingType === "rent" && <span className="text-[11px] font-bold text-slate-400">/ ukwezi</span>}
        </div>

        <div className="mt-2.5 flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400">
          <MapPin className="w-3.5 h-3.5 text-[#569ab5]" strokeWidth={2} />
          <span className="truncate">{formatLocation() || "Kigali, Rwanda"}</span>
        </div>

        <p className="mt-3 line-clamp-3 rounded-2xl bg-slate-50 p-3 text-xs font-medium leading-relaxed text-slate-600 dark:bg-white/[0.04] dark:text-slate-300">
          {description.trim() || "Ibisobanuro by'ikintu cyawe bizagaragara hano..."}
        </p>

        <div className="mt-4 grid grid-cols-2 gap-2 border-t border-slate-100 pt-3 dark:border-white/10">
          <div className="flex items-center justify-center gap-1.5 rounded-xl bg-[#102436] py-2 text-[11px] font-extrabold text-white dark:bg-white/10">
            <Grid className="w-3 h-3" strokeWidth={2} />
            <span>Andikira</span>
          </div>
          <div className={`flex items-center justify-center gap-1.5 rounded-xl py-2 text-[11px] font-extrabold ${
            contactPhone && phoneNumber.trim()
              ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
              : "bg-slate-100 text-slate-400 dark:bg-white/[0.04]"
          }`}>
            <Phone className="w-3 h-3" strokeWidth={2.2} />
            <span className="truncate">
              {contactPhone && phoneNumber.trim() ? phoneNumber.trim() : "Nta telefoni"}
            </span>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-center gap-1.5 text-[10px] font-semibold text-slate-400">
          <Shield className="w-3 h-3" strokeWidth={2} />
          <span>Kugurisha mu mutekano ku Isoko</span>
        </div>
      </div>
    </div>
  )

  return (
    <main className="relative min-h-screen bg-[#f4f8fb] text-[#102436] dark:bg-[#060f19] dark:text-slate-100">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-[#FF5D00]/10 blur-[140px] dark:bg-[#FF5D00]/[0.08]" />
        <div className="absolute top-1/3 -right-40 h-[600px] w-[600px] rounded-full bg-blue-500/10 blur-[140px] dark:bg-blue-500/[0.06]" />
        <div className="absolute bottom-0 left-1/3 h-[500px] w-[500px] rounded-full bg-indigo-500/10 blur-[140px]" />
      </div>

      <section className="relative overflow-hidden">
        <div className="relative mx-auto max-w-7xl px-4 pb-6 pt-8 sm:px-6 sm:pt-10 lg:px-8">
          <div className="max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/70 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-[#FF5D00] backdrop-blur dark:border-white/10 dark:bg-white/[0.06]">
              <span className="relative flex h-2 w-2">
                <span className="absolute inset-0 animate-ping rounded-full bg-[#FF5D00] opacity-75" />
                <span className="relative flex h-2 w-2 rounded-full bg-[#FF5D00]" />
              </span>
              <Pencil className="w-3 h-3" strokeWidth={2.2} />
              Edit Listing
            </div>
          </div>
        </div>
      </section>

      {/* Fixed toast — always visible on any device / scroll position */}
      {message && (
        <div className="fixed inset-x-0 top-[calc(56px+env(safe-area-inset-top,0px))] z-[60] mx-auto max-w-7xl px-3 pt-3 sm:top-[68px] sm:px-6 lg:px-8">
          <div className={`flex items-center justify-between gap-3 rounded-2xl border p-3 text-sm font-bold shadow-2xl sm:p-3.5 ${
            success
              ? "border-emerald-400 bg-emerald-500 text-white"
              : "border-rose-400 bg-rose-500 text-white"
          }`}>
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/25 text-white">
                {success ? <CheckCircle2 className="h-4 w-4" strokeWidth={2.5} /> : <AlertCircle className="h-4 w-4" strokeWidth={2.5} />}
              </span>
              <span className="min-w-0 break-words">{message}</span>
            </div>
            <button
              type="button"
              onClick={() => setMessage("")}
              className="shrink-0 rounded-full p-1.5 text-white/90 transition hover:bg-white/20"
              aria-label="Funga"
            >
              <X className="w-4 h-4" strokeWidth={2.5} />
            </button>
          </div>
        </div>
      )}

      <div className="relative mx-auto max-w-7xl px-3 pb-36 sm:px-6 sm:pb-12 lg:px-8">
        <div className="grid gap-5 sm:gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
          {/* Form — noValidate so HTML5 native validation never silently blocks */}
          <form ref={formRef} onSubmit={handleFormSubmit} noValidate className="space-y-4 sm:space-y-5">

            {/* 1. BASIC INFO */}
            <section data-field="title" className={cardCls}>
              <div className={cardHeaderCls}>
                <SectionHeader
                  icon={<FileText className="h-5 w-5" strokeWidth={1.8} />}
                  title="Amakuru y'ikintu"
                  subtitle="Hindura amakuru y'ingenzi ya listing yawe."
                />
              </div>
              <div className="space-y-5 p-5 sm:p-7">
                <div>
                  <label className={labelCls}>
                    Izina ry'ikintu <span className="ml-1 text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => { setTitle(e.target.value); if (errorField === "title") setErrorField(null) }}
                    maxLength={80}
                    placeholder="Urugero: iPhone 15 Pro"
                    className={`${inputCls} mt-2 ${errorField === "title" ? "border-rose-500 ring-4 ring-rose-500/15" : ""}`}
                  />
                  <div className="mt-1.5 flex justify-end">
                    <span className={`text-[10px] font-bold ${title.length > 70 ? "text-amber-500" : "text-slate-400"}`}>
                      {title.length}/80
                    </span>
                  </div>
                </div>

                <div data-field="category">
                  <label className={labelCls}>
                    Category <span className="ml-1 text-rose-500">*</span>
                  </label>
                  <div className="relative mt-2">
                    <select
                      value={categoryId}
                      onChange={(e) => { setCategoryId(e.target.value); if (errorField === "category") setErrorField(null) }}
                      className={`${inputCls} cursor-pointer appearance-none pr-10 ${errorField === "category" ? "border-rose-500 ring-4 ring-rose-500/15" : ""}`}
                    >
                      <option value="">Hitamo category</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>{category.name}</option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" strokeWidth={2} />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <label className={labelCls}>Ibisobanuro</label>
                    <span className={`text-[11px] font-bold ${description.length > 700 ? "text-amber-500" : "text-slate-400"}`}>
                      {description.length}/800
                    </span>
                  </div>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={5}
                    maxLength={800}
                    placeholder="Sobanura neza icyo ugurisha..."
                    className={`${inputCls} mt-2 min-h-[120px] resize-none`}
                  />
                </div>
              </div>
            </section>

            {/* 2. TYPE & PRICE */}
            <section className={cardCls}>
              <div className={cardHeaderCls}>
                <SectionHeader
                  icon={<Banknote className="h-5 w-5" strokeWidth={1.8} />}
                  title="Uburyo n'igiciro"
                  subtitle="Hindura uburyo listing itangwa n'igiciro."
                />
              </div>
              <div className="space-y-5 p-5 sm:p-7">
                <div>
                  <label className={labelCls}>Uburyo bwo gutanga</label>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {listingTypeOptions.map((item) => {
                      const selected = listingType === item.value
                      return (
                        <button
                          key={item.value}
                          type="button"
                          onClick={() => setListingType(item.value)}
                          className={`group relative rounded-2xl border p-4 text-left transition-all ${
                            selected
                              ? "border-[#FF5D00] bg-[#FF5D00]/[0.04] shadow-[0_10px_30px_-10px_rgba(255,93,0,0.35)] ring-4 ring-[#FF5D00]/10"
                              : "border-slate-200/80 bg-slate-50/50 hover:border-slate-300 hover:bg-slate-100/70 dark:border-white/10 dark:bg-white/[0.03] dark:hover:bg-white/[0.06]"
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <span className={`flex h-9 w-9 items-center justify-center rounded-xl transition-colors ${
                              selected ? "bg-[#FF5D00]/15 text-[#FF5D00]" : "bg-slate-200/60 text-slate-500 dark:bg-white/10 dark:text-slate-400"
                            }`}>
                              {item.icon}
                            </span>
                            {selected && (
                              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#FF5D00] text-white shadow-sm">
                                <Check className="h-3.5 w-3.5" strokeWidth={3} />
                              </span>
                            )}
                          </div>
                          <p className="mt-3 text-sm font-black text-slate-900 dark:text-white">{item.title}</p>
                          <p className="mt-0.5 text-xs font-medium text-slate-500 dark:text-slate-400">{item.description}</p>
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className={labelCls}>Igiciro (Frw)</label>
                    <div className="relative mt-2">
                      <input
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        min="0"
                        inputMode="numeric"
                        placeholder="650000"
                        className={`${inputCls} pr-16`}
                      />
                      <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[11px] font-black text-slate-400">
                        FRW
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className={labelCls}>Imimerere</label>
                    <div className="relative mt-2">
                      <select
                        value={condition}
                        onChange={(e) => setCondition(e.target.value)}
                        className={`${inputCls} cursor-pointer appearance-none pr-10`}
                      >
                        <option value="new">Bishya</option>
                        <option value="used">Byakoreshejwe</option>
                        <option value="refurbished">Byavuguruwe</option>
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" strokeWidth={2} />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 3. LOCATION */}
            <section data-field="province" className={cardCls}>
              <div className={cardHeaderCls}>
                <SectionHeader
                  icon={<MapPin className="h-5 w-5" strokeWidth={1.8} />}
                  title="Aho giherereye"
                  subtitle="Hindura aho ikintu giherereye — birafasha abaguzi kubona vuba."
                />
                {formatLocation() && (
                  <span className="hidden shrink-0 items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-emerald-600 ring-1 ring-emerald-500/20 dark:text-emerald-400 sm:inline-flex">
                    <Check className="h-3 w-3" strokeWidth={3} />
                    Byujuje
                  </span>
                )}
              </div>
              <div className="p-5 sm:p-7">
                <div className="grid gap-3.5 sm:grid-cols-3">
                  <div>
                    <label className={labelCls}>
                      Intara <span className="ml-1 text-rose-500">*</span>
                    </label>
                    <input
                      value={province}
                      onChange={(e) => { setProvince(e.target.value); if (errorField === "province") setErrorField(null) }}
                      placeholder="Kigali"
                      className={`${inputCls} mt-2 ${errorField === "province" ? "border-rose-500 ring-4 ring-rose-500/15" : ""}`}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Akarere</label>
                    <input
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      placeholder="Gasabo"
                      className={`${inputCls} mt-2`}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Umurenge</label>
                    <input
                      value={sector}
                      onChange={(e) => setSector(e.target.value)}
                      placeholder="Remera"
                      className={`${inputCls} mt-2`}
                    />
                  </div>
                </div>

                {formatLocation() && (
                  <div className="mt-4 flex items-start gap-2.5 rounded-2xl border border-[#569ab5]/20 bg-[#569ab5]/[0.06] px-4 py-3 dark:border-[#569ab5]/25 dark:bg-[#569ab5]/10">
                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#569ab5] text-white shadow-sm">
                      <MapPin className="h-3.5 w-3.5" strokeWidth={2.4} />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[10px] font-black uppercase tracking-wider text-[#569ab5] dark:text-[#6ec5c9]">
                        Aho kizagaragara
                      </p>
                      <p className="mt-0.5 break-words text-sm font-bold text-slate-800 dark:text-slate-100">
                        {formatLocation()}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* 4. PHONE */}
            <section data-field="phone" className={cardCls}>
              <div className={cardHeaderCls}>
                <SectionHeader
                  icon={<Phone className="h-5 w-5" strokeWidth={1.8} />}
                  title="Nimero ya Telefoni"
                  subtitle="Emerera abaguzi kukuvugisha kuri telefoni kuri iyi listing."
                />
                <label className="relative inline-flex shrink-0 cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={contactPhone}
                    onChange={(e) => setContactPhone(e.target.checked)}
                    className="peer sr-only"
                  />
                  <div className="h-6 w-11 rounded-full bg-slate-300 transition-colors after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow-sm after:transition-all after:content-[''] peer-checked:bg-emerald-500 peer-checked:after:translate-x-full peer-focus-visible:ring-4 peer-focus-visible:ring-emerald-500/20 dark:bg-white/15"></div>
                </label>
              </div>

              {contactPhone && (
                <div className="space-y-4 p-5 sm:p-7">
                  {fetchingPhones ? (
                    <p className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                      <span className="h-3 w-3 animate-spin rounded-full border-2 border-slate-400 border-t-transparent" />
                      Turimo gushaka nimero zawe zahise...
                    </p>
                  ) : previousNumbers.length > 0 ? (
                    <div className="space-y-3">
                      <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Hitamo uburyo bwo gutanga nimero:
                      </label>
                      <div className="space-y-2">
                        <label className={`flex cursor-pointer items-center gap-2.5 rounded-xl border p-3 transition-all ${
                          selectedPhoneOption === "previous"
                            ? "border-[#FF5D00] bg-[#FF5D00]/[0.04] ring-2 ring-[#FF5D00]/10"
                            : "border-slate-200/80 bg-slate-50/50 hover:border-slate-300 dark:border-white/10 dark:bg-white/[0.03]"
                        }`}>
                          <input
                            type="radio"
                            name="phoneOption"
                            value="previous"
                            checked={selectedPhoneOption === "previous"}
                            onChange={() => {
                              setSelectedPhoneOption("previous")
                              if (previousNumbers.length > 0) setPhoneNumber(previousNumbers[0].number)
                            }}
                            className="h-4 w-4 accent-[#FF5D00]"
                          />
                          <Clock className="h-4 w-4 text-[#FF5D00]" strokeWidth={2.2} />
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Gukoresha nimero yawe wari warakoresheje mbere</span>
                        </label>

                        {selectedPhoneOption === "previous" && (
                          <div className="ml-7">
                            <div className="relative">
                              <select
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                className={`${inputCls} cursor-pointer appearance-none pr-10`}
                              >
                                {previousNumbers.map((item, index) => (
                                  <option key={index} value={item.number}>
                                    {item.number} {index === 0 ? "(Iyaherukaga gukoreshwa)" : ""}
                                  </option>
                                ))}
                              </select>
                              <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" strokeWidth={2} />
                            </div>
                          </div>
                        )}

                        <label className={`flex cursor-pointer items-center gap-2.5 rounded-xl border p-3 transition-all ${
                          selectedPhoneOption === "new"
                            ? "border-[#FF5D00] bg-[#FF5D00]/[0.04] ring-2 ring-[#FF5D00]/10"
                            : "border-slate-200/80 bg-slate-50/50 hover:border-slate-300 dark:border-white/10 dark:bg-white/[0.03]"
                        }`}>
                          <input
                            type="radio"
                            name="phoneOption"
                            value="new"
                            checked={selectedPhoneOption === "new"}
                            onChange={() => { setSelectedPhoneOption("new"); setPhoneNumber("") }}
                            className="h-4 w-4 accent-[#FF5D00]"
                          />
                          <Plus className="h-4 w-4 text-[#FF5D00]" strokeWidth={2.2} />
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Andika nimero nshya</span>
                        </label>
                      </div>
                    </div>
                  ) : null}

                  {(selectedPhoneOption === "new" || previousNumbers.length === 0) && (
                    <div>
                      <label className={labelCls}>
                        Nimero ya telefoni <span className="ml-1 text-rose-500">*</span>
                      </label>
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => { setPhoneNumber(e.target.value); if (errorField === "phone") setErrorField(null) }}
                        inputMode="tel"
                        autoComplete="tel"
                        placeholder="Urugero: +250788000000 cyangwa 0788000000"
                        className={`${inputCls} mt-2 ${errorField === "phone" ? "border-rose-500 ring-4 ring-rose-500/15" : ""}`}
                      />
                    </div>
                  )}
                </div>
              )}
            </section>

            {/* 5. IMAGES */}
            <section className={cardCls}>
              <div className={cardHeaderCls}>
                <SectionHeader
                  icon={<Camera className="h-5 w-5" strokeWidth={1.8} />}
                  title="Amafoto"
                  subtitle="Gucunga amafoto ari kuri listing yawe."
                />
                <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1.5 text-[11px] font-black text-slate-600 dark:bg-white/[0.06] dark:text-slate-300">
                  {totalImages}/5
                </span>
              </div>

              <div className="p-5 sm:p-7">
                {heroImageUrl && (
                  <div className="group/hero relative mb-4 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-[0_18px_40px_-20px_rgba(16,36,54,0.35)] dark:border-white/10 dark:bg-slate-800">
                    <div className="relative aspect-[16/10] w-full">
                      <img
                        src={heroImageUrl}
                        alt="Ifoto y'ibanze"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover/hero:scale-[1.03]"
                      />
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/0 to-black/20" />

                      <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-[#FF5D00] px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-white shadow-lg ring-2 ring-white/30 backdrop-blur">
                        <Sparkles className="h-3 w-3" strokeWidth={2.4} />
                        Ifoto y'ibanze
                      </span>

                      {existingImages[0] && (
                        <button
                          type="button"
                          onClick={() => deleteExistingImage(existingImages[0])}
                          aria-label="Siba ifoto y'ibanze"
                          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/55 text-white shadow-lg backdrop-blur-md transition-all hover:scale-110 hover:bg-rose-600"
                        >
                          <Trash2 className="h-4 w-4" strokeWidth={2.2} />
                        </button>
                      )}

                      <span className="absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-full bg-black/55 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur">
                        <ImageIcon className="h-3 w-3" strokeWidth={2} />
                        1 / {totalImages}
                      </span>
                    </div>
                  </div>
                )}

                {totalImages > 0 && (
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 sm:gap-3">
                    {existingImages.slice(1).map((image, idx) => {
                      const realIndex = idx + 1
                      return (
                        <div
                          key={image.id}
                          className="group/img relative aspect-square overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-sm dark:border-white/10 dark:bg-slate-800"
                        >
                          <img src={image.image_url} alt={`Ifoto ${realIndex + 1}`} className="h-full w-full object-cover" />
                          <span className="absolute left-1.5 top-1.5 rounded-full bg-black/55 px-1.5 py-0.5 text-[9px] font-black text-white backdrop-blur">
                            {realIndex + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => deleteExistingImage(image)}
                            aria-label="Siba ifoto"
                            className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/55 text-white opacity-0 hover:bg-rose-600 group-hover/img:opacity-100 focus:opacity-100"
                          >
                            <X className="h-3 w-3" strokeWidth={2.5} />
                          </button>
                        </div>
                      )
                    })}

                    {newImages.map((image, idx) => (
                      <div
                        key={`new-${idx}-${image.name}`}
                        className="group/img relative aspect-square overflow-hidden rounded-xl border border-emerald-500/30 bg-slate-100 ring-2 ring-emerald-500/10 dark:bg-slate-800"
                      >
                        <img src={newPreviewUrls[idx]} alt={`New ${idx + 1}`} className="h-full w-full object-cover" />
                        <span className="absolute left-1.5 top-1.5 flex items-center gap-1 rounded-full bg-emerald-500 px-1.5 py-0.5 text-[9px] font-black uppercase text-white">
                          <Check className="w-2.5 h-2.5" strokeWidth={3} />
                          New
                        </span>
                        <button
                          type="button"
                          onClick={() => removeNewImage(idx)}
                          aria-label="Kuraho ifoto"
                          className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/55 text-white hover:bg-rose-600"
                        >
                          <Trash2 className="h-3 w-3" strokeWidth={2.2} />
                        </button>
                      </div>
                    ))}

                    {totalImages < 5 && (
                      <label className="group/add relative flex aspect-square cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-gradient-to-br from-slate-50 to-white hover:border-[#FF5D00] dark:border-white/15 dark:from-white/[0.03] dark:to-transparent">
                        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#FF5D00]/10 text-[#FF5D00]">
                          <Plus className="h-4 w-4" strokeWidth={2.2} />
                        </span>
                        <span className="mt-1.5 text-[10px] font-black uppercase tracking-wider text-slate-500">Ongeraho</span>
                        <span className="text-[9px] font-bold text-slate-400">{5 - totalImages} isigaye</span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleNewImages}
                          onClick={(e) => { (e.target as HTMLInputElement).value = "" }}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                )}

                {totalImages === 0 && (
                  <label className="group/drop relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-gradient-to-br from-slate-50 to-white p-6 text-center hover:border-[#FF5D00] dark:border-white/15 dark:from-white/[0.03] dark:to-transparent sm:p-8">
                    <span className="relative flex h-14 w-14 items-center justify-center rounded-[1.3rem] bg-gradient-to-br from-[#FF5D00] to-[#e05200] text-white shadow-[0_16px_35px_-12px_rgba(255,93,0,0.6)]">
                      <Camera className="h-6 w-6" strokeWidth={2} />
                    </span>
                    <span className="relative mt-3 text-sm font-black text-slate-900 dark:text-white">Ongeraho amafoto</span>
                    <span className="relative mt-1 max-w-xs text-[11px] font-medium leading-relaxed text-slate-500 dark:text-slate-400">
                      Ifoto ya mbere ni yo igaragara imbere · Kugera kuri 5
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleNewImages}
                      onClick={(e) => { (e.target as HTMLInputElement).value = "" }}
                      className="hidden"
                    />
                  </label>
                )}

                {newImages.length > 0 && (
                  <p className="mt-3 flex items-start gap-1.5 text-[10px] font-medium leading-relaxed text-emerald-600 dark:text-emerald-400">
                    <Check className="mt-0.5 h-3 w-3 shrink-0" strokeWidth={3} />
                    <span>Amafoto {newImages.length} mashya azongerwa ku gicuruzwa cyawe iyo ukibona "Bika Impinduka".</span>
                  </p>
                )}
              </div>
            </section>

            {/* Mobile: preview toggle */}
            <button
              type="button"
              onClick={() => setPreviewOpen((v) => !v)}
              className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm font-bold text-slate-700 shadow-sm backdrop-blur transition hover:bg-white dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200 lg:hidden"
            >
              <span className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-[#569ab5]" strokeWidth={2} />
                Reba uko Biribumere
              </span>
              {previewOpen ? <ChevronUp className="w-4 h-4" strokeWidth={2} /> : <ChevronDown className="w-4 h-4" strokeWidth={2} />}
            </button>

            {previewOpen && <div className="lg:hidden">{previewCard}</div>}

            {/* Desktop: submit button (calls saveListing directly) */}
            <div className="hidden pt-2 lg:block">
              <SaveButton saving={saving} onClick={saveListing} />
            </div>
          </form>

          {/* SIDEBAR — LIVE PREVIEW */}
          <aside className="hidden space-y-5 lg:sticky lg:top-24 lg:block lg:self-start">
            <div className="mb-1 flex items-center justify-between px-1">
              <div className="inline-flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inset-0 animate-ping rounded-full bg-emerald-500 opacity-75" />
                  <span className="relative flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 dark:text-slate-300">
                  uko Bigaragara
                </span>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-600 ring-1 ring-emerald-500/20 dark:text-emerald-400">
                <Eye className="w-3 h-3" strokeWidth={2} />
                Isoko
              </span>
            </div>

            {previewCard}

            <div className="rounded-2xl border border-slate-200/70 bg-white/70 p-4 backdrop-blur-sm dark:border-white/10 dark:bg-slate-900/60">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <Bolt className="w-3.5 h-3.5 text-[#FF5D00]" strokeWidth={2.2} />
                Inshamake yihuse
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <div className="rounded-xl bg-slate-50 p-2.5 dark:bg-white/[0.04]">
                  <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">Amafoto</p>
                  <p className="mt-0.5 text-sm font-black text-slate-900 dark:text-white">{totalImages}/5</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-2.5 dark:bg-white/[0.04]">
                  <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">Uburyo</p>
                  <p className="mt-0.5 text-sm font-black text-slate-900 dark:text-white">{listingType === "rent" ? "Gukodesha" : "Kugurisha"}</p>
                </div>
                <div className="col-span-2 rounded-xl bg-slate-50 p-2.5 dark:bg-white/[0.04]">
                  <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">Imiterere</p>
                  <p className="mt-0.5 text-sm font-black text-slate-900 dark:text-white">{conditionLabelMap[condition] || "—"}</p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* MOBILE STICKY SAVE BAR — button calls saveListing directly via onClick */}
      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200/70 bg-white/95 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom,0px))] pt-2.5 shadow-[0_-8px_30px_-10px_rgba(16,36,54,0.15)] backdrop-blur-2xl dark:border-white/10 dark:bg-[#060f19]/95 lg:hidden">
        <div className="mx-auto flex max-w-3xl items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Impinduka
            </p>
            <p className="mt-0.5 truncate text-xs font-bold text-slate-700 dark:text-slate-200">
              {title.trim() || "Nta zirahari"}
            </p>
          </div>
          <SaveButton saving={saving} onClick={saveListing} compact />
        </div>
      </div>
    </main>
  )
}

/* ──────────────────────────────────────────────────────────────────
   Save button — shared between desktop form and mobile sticky bar.
   type="button" + onClick — no form attribute, no native submit needed.
   Works identically on desktop, tablet, and mobile.
   ────────────────────────────────────────────────────────────────── */
function SaveButton({
  saving,
  onClick,
  compact = false,
}: {
  saving: boolean
  onClick: () => void | Promise<void>
  compact?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={saving}
      aria-busy={saving}
      className={`group relative overflow-hidden rounded-full bg-gradient-to-r from-[#FF5D00] via-[#FF7424] to-[#e05200] text-center text-sm font-black text-white shadow-[0_16px_38px_-10px_rgba(255,93,0,0.65)] transition-all duration-300 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 ${
        compact ? "shrink-0 px-6 py-3.5 text-sm" : "w-full py-4"
      }`}
      style={{ touchAction: "manipulation" }}
    >
      <span className="relative z-10 flex items-center justify-center gap-2">
        {saving ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.5} />
            <span>Turimo kubika...</span>
          </>
        ) : (
          <>
            <Save className="h-4 w-4" strokeWidth={2.2} />
            <span>Ohereza</span>
            {!compact && <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" strokeWidth={2.2} />}
          </>
        )}
      </span>
    </button>
  )
}