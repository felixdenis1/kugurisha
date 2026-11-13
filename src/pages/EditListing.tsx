import { useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import {
  AlertCircle,
  ArrowLeft,
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

type LocationData = {
  province: string | null
  district: string | null
  sector: string | null
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
  "flex items-start justify-between gap-4 border-b border-slate-100 dark:border-white/10 px-6 py-5 sm:px-7"
const inputCls =
  "mt-2 w-full rounded-2xl border border-slate-200/80 bg-slate-50/50 px-4 py-3.5 text-sm font-bold text-slate-900 outline-none transition-all placeholder:font-semibold placeholder:text-slate-400 focus:border-[#FF5D00] focus:bg-white focus:ring-4 focus:ring-[#FF5D00]/10 dark:border-white/10 dark:bg-white/[0.03] dark:text-white dark:placeholder:text-slate-500"
const labelCls = "text-sm font-black text-slate-900 dark:text-white"
const iconBoxCls =
  "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#FF5D00]/10 text-[#FF5D00] ring-1 ring-[#FF5D00]/15"

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

  const [categories, setCategories] = useState<Category[]>([])
  const [existingImages, setExistingImages] = useState<ExistingImage[]>([])
  const [newImages, setNewImages] = useState<File[]>([])

  const [title, setTitle] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [listingType, setListingType] = useState("sale")
  const [condition, setCondition] = useState("used")

  const [province, setProvince] = useState("")
  const [district, setDistrict] = useState("")
  const [sector, setSector] = useState("")

  const [contactPhone, setContactPhone] = useState(true)
  const [phoneNumber, setPhoneNumber] = useState("")
  const [selectedPhoneOption, setSelectedPhoneOption] = useState<"previous" | "new">("new")
  const [previousNumbers, setPreviousNumbers] = useState<PreviousPhoneOption[]>([])
  const [fetchingPhones, setFetchingPhones] = useState(false)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (id) {
      void loadListing()
      void loadPreviousPhones()
    }
  }, [id])

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
          category_id, location_id, contact_phone, contact_phone_number,
          locations (province, district, sector)
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
      // Coerce "free" legacy listings to "sale" since we removed the option
      setListingType(listing.listing_type === "free" ? "sale" : listing.listing_type || "sale")
      setCondition(listing.condition || "used")
      setCategoryId(listing.category_id || "")
      setContactPhone(listing.contact_phone ?? true)
      setPhoneNumber(listing.contact_phone_number || "")

      let location: LocationData | null = null
      if (listing.locations) {
        location = (Array.isArray(listing.locations) ? listing.locations[0] : listing.locations) as LocationData
      }
      if (location) {
        setProvince(location.province || "")
        setDistrict(location.district || "")
        setSector(location.sector || "")
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
      return
    }
    setMessage("")
    setNewImages(files)
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
      const filePath = `${user.id}/${id}/${crypto.randomUUID()}.${extension}`
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

  async function handleSave(e: React.FormEvent): Promise<void> {
    e.preventDefault()
    if (!id) return
    try {
      setSaving(true); setMessage(""); setSuccess(false)
      if (!title.trim()) { setMessage("Andika izina ry'ikintu."); return }
      if (!categoryId) { setMessage("Hitamo category."); return }
      if (!province.trim()) { setMessage("Andika Province."); return }
      if (contactPhone) {
        if (!phoneNumber.trim()) { setMessage("Nyamuneka shyiramo nimero ya telefoni yo guhamagarwa."); return }
        if (!validatePhone(phoneNumber)) { setMessage("Nimero ya telefoni wanditse ntabwo yubahirije imiterere yemewe (+250 cyangwa 07...)."); return }
      }

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { navigate("/login"); return }

      const { data: listingData, error: listingFetchError } = await supabase
        .from("listings").select("location_id").eq("id", id).eq("seller_id", user.id).single()
      if (listingFetchError) throw listingFetchError

      if (listingData.location_id) {
        const { error: locationError } = await supabase
          .from("locations")
          .update({
            province: province.trim(),
            district: district.trim() || null,
            sector: sector.trim() || null,
          })
          .eq("id", listingData.location_id)
        if (locationError) throw locationError
      } else {
        const { data: location, error } = await supabase
          .from("locations")
          .insert({
            province: province.trim(),
            district: district.trim() || null,
            sector: sector.trim() || null,
          })
          .select().single()
        if (error) throw error
        const { error: updateLocationError } = await supabase
          .from("listings").update({ location_id: location.id }).eq("id", id).eq("seller_id", user.id)
        if (updateLocationError) throw updateLocationError
      }

      const finalNormalizedPhone = contactPhone && phoneNumber.trim() ? normalizePhoneNumber(phoneNumber.trim()) : null
      const parsedPrice: number | null = price.trim() !== "" ? Number(price) : null

      const { error: updateError } = await supabase
        .from("listings")
        .update({
          title: title.trim(),
          category_id: categoryId,
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
      setMessage("Kwamamaza ryawe ryavuguruwe neza!")
      setNewImages([])
      await loadListing()
      await loadPreviousPhones()
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Habaye ikibazo mu kubika impinduka."
      console.error(errorMsg)
      setSuccess(false)
      setMessage("Habaye ikibazo mu kubika impinduka.")
    } finally { setSaving(false) }
  }

  // Only two options now — Ubuntu (free) removed
  const listingTypeOptions = [
    { value: "sale", icon: <Tag className="h-5 w-5" strokeWidth={1.8} />, title: "Kugurisha", description: "Shaka umuguzi w'ikintu" },
    { value: "rent", icon: <KeyRound className="h-5 w-5" strokeWidth={1.8} />, title: "Gukodesha", description: "Kodesha icyo ufite" },
  ]

  const conditionLabelMap: Record<string, string> = {
    new: "Bishya", used: "Byakoreshejwe", refurbished: "Byavuguruwe", not_applicable: "Nta mimerere",
  }

  const previewPrice = price && Number(price) > 0 ? `${Number(price).toLocaleString()} FRW` : "0 FRW"

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

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f4f8fb] text-[#102436] dark:bg-[#060f19] dark:text-slate-100">
      {/* Ambient glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-[#FF5D00]/10 blur-[140px] dark:bg-[#FF5D00]/[0.08]" />
        <div className="absolute top-1/3 -right-40 h-[600px] w-[600px] rounded-full bg-blue-500/10 blur-[140px] dark:bg-blue-500/[0.06]" />
        <div className="absolute bottom-0 left-1/3 h-[500px] w-[500px] rounded-full bg-indigo-500/10 blur-[140px]" />
      </div>

      {/* NAVBAR */}
      <header className="sticky top-0 z-30 border-b border-slate-200/60 bg-white/70 backdrop-blur-2xl dark:border-white/10 dark:bg-[#060f19]/70">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3.5 sm:px-6 lg:px-8">
          <Link to="/" className="group flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30 transition-transform group-hover:scale-105">
              <Tag className="w-4 h-4" strokeWidth={2} />
            </span>
            <span className="text-sm font-black tracking-tight text-slate-900 dark:text-white">
              KUGURISHA
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">.COM</span>
            </span>
          </Link>

          <Link
            to="/dashboard"
            className="group inline-flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-white px-3.5 py-2 text-xs font-extrabold text-slate-700 shadow-sm transition-all hover:border-[#FF5D00] hover:text-[#FF5D00] hover:shadow-[0_4px_20px_-6px_rgba(255,93,0,0.4)] dark:border-white/10 dark:bg-white/[0.06] dark:text-slate-200"
          >
            <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" strokeWidth={2.2} />
            <span>Dashboard</span>
          </Link>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="relative mx-auto max-w-7xl px-4 pt-10 pb-6 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/70 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-[#FF5D00] backdrop-blur dark:border-white/10 dark:bg-white/[0.06]">
              <span className="relative flex h-2 w-2">
                <span className="absolute inset-0 animate-ping rounded-full bg-[#FF5D00] opacity-75" />
                <span className="relative flex h-2 w-2 rounded-full bg-[#FF5D00]" />
              </span>
              <Pencil className="w-3 h-3" strokeWidth={2.2} />
              Edit Listing
            </div>

            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white sm:text-4xl lg:text-5xl">
              Hindura listing yawe.
              <span className="mt-1 block bg-gradient-to-r from-[#FF5D00] via-[#FF7424] to-[#e05200] bg-clip-text text-transparent">
                Gumana amakuru agezweho.
              </span>
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-400 sm:text-base">
              Vugurura amakuru, igiciro, amafoto cyangwa aho ikintu giherereye kugira ngo listing yawe ikomeze kuba nziza ku baguzi.
            </p>
          </div>
        </div>
      </section>

      {/* CONTENT */}
      <div className="relative mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
          <form onSubmit={handleSave} className="space-y-5">

            {/* 1. BASIC INFO */}
            <section className={cardCls}>
              <div className={cardHeaderCls}>
                <SectionHeader
                  icon={<FileText className="h-5 w-5" strokeWidth={1.8} />}
                  title="Amakuru y'ikintu"
                  subtitle="Hindura amakuru y'ingenzi ya listing yawe."
                />
              </div>
              <div className="space-y-5 p-6 sm:p-7">
                <div>
                  <label className={labelCls}>
                    Izina ry'ikintu <span className="ml-1 text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    placeholder="Urugero: iPhone 15 Pro"
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className={labelCls}>
                    Category <span className="ml-1 text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      required
                      className={`${inputCls} cursor-pointer appearance-none pr-10`}
                    >
                      <option value="">Hitamo category</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>{category.name}</option>
                      ))}
                    </select>
                    <svg className="pointer-events-none absolute right-4 top-1/2 mt-1 w-4 h-4 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <label className={labelCls}>Ibisobanuro</label>
                    <span className="text-[11px] font-bold text-slate-400">{description.length} characters</span>
                  </div>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={6}
                    placeholder="Sobanura neza icyo ugurisha..."
                    className={`${inputCls} resize-none`}
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
              <div className="space-y-5 p-6 sm:p-7">
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
                    <div className="relative">
                      <input
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        min="0"
                        placeholder="650000"
                        className={`${inputCls} pr-16`}
                      />
                      <span className="pointer-events-none absolute right-4 top-1/2 mt-1 -translate-y-1/2 text-[11px] font-black text-slate-400">
                        FRW
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className={labelCls}>Imimerere</label>
                    <div className="relative">
                      <select
                        value={condition}
                        onChange={(e) => setCondition(e.target.value)}
                        className={`${inputCls} cursor-pointer appearance-none pr-10`}
                      >
                        <option value="new">Bishya</option>
                        <option value="used">Byakoreshejwe</option>
                        <option value="refurbished">Byavuguruwe</option>
                      </select>
                      <svg className="pointer-events-none absolute right-4 top-1/2 mt-1 w-4 h-4 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 3. LOCATION */}
            <section className={cardCls}>
              <div className={cardHeaderCls}>
                <SectionHeader
                  icon={<MapPin className="h-5 w-5" strokeWidth={1.8} />}
                  title="Aho giherereye"
                  subtitle="Hindura aho ikintu giherereye."
                />
              </div>
              <div className="p-6 sm:p-7">
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <label className={labelCls}>
                      Province <span className="ml-1 text-rose-500">*</span>
                    </label>
                    <input
                      value={province}
                      onChange={(e) => setProvince(e.target.value)}
                      required
                      placeholder="Kigali"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>District</label>
                    <input
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      placeholder="Gasabo"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Sector</label>
                    <input
                      value={sector}
                      onChange={(e) => setSector(e.target.value)}
                      placeholder="Remera"
                      className={inputCls}
                    />
                  </div>
                </div>

                {formatLocation() && (
                  <div className="mt-4 flex items-center gap-2 rounded-2xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-600 dark:bg-white/[0.04] dark:text-slate-300">
                    <MapPin className="h-4 w-4 shrink-0 text-[#FF5D00]" strokeWidth={2.2} />
                    {formatLocation()}
                  </div>
                )}
              </div>
            </section>

            {/* 4. PHONE */}
            <section className={cardCls}>
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
                <div className="space-y-4 p-6 sm:p-7">
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
                                className={`${inputCls} mt-0 cursor-pointer appearance-none pr-10`}
                              >
                                {previousNumbers.map((item, index) => (
                                  <option key={index} value={item.number}>
                                    {item.number} {index === 0 ? "(Iyaherukaga gukoreshwa)" : ""}
                                  </option>
                                ))}
                              </select>
                              <svg className="pointer-events-none absolute right-4 top-1/2 w-4 h-4 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                              </svg>
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
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="Urugero: +250788000000 cyangwa 0788000000"
                        className={inputCls}
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
                  {existingImages.length + newImages.length}/5
                </span>
              </div>

              <div className="p-6 sm:p-7">
                {existingImages.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 px-6 py-8 text-center dark:border-white/15 dark:bg-white/[0.02]">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-white/[0.05]">
                      <ImageIcon className="h-6 w-6" strokeWidth={1.6} />
                    </div>
                    <p className="mt-3 text-sm font-bold text-slate-700 dark:text-slate-200">Nta foto iri kuri listing.</p>
                    <p className="mt-1 text-xs font-medium text-slate-400">Ongeraho amafoto hepfo.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
                    {existingImages.map((image, index) => (
                      <div
                        key={image.id}
                        className="group relative aspect-square overflow-hidden rounded-2xl border border-slate-200 shadow-sm dark:border-white/10"
                      >
                        <img
                          src={image.image_url}
                          alt={`Ifoto ${index + 1}`}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                        {index === 0 && (
                          <div className="absolute left-2 top-2 flex items-center gap-1 rounded-lg bg-[#FF5D00] px-2 py-1 text-[9px] font-black uppercase tracking-wider text-white shadow-md">
                            <Sparkles className="w-2.5 h-2.5" strokeWidth={2.5} />
                            Main
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => deleteExistingImage(image)}
                          aria-label="Siba ifoto"
                          className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-rose-600 text-white opacity-100 shadow-lg transition hover:scale-110 hover:bg-rose-700 sm:opacity-0 sm:group-hover:opacity-100"
                        >
                          <X className="h-3.5 w-3.5" strokeWidth={2.5} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-6">
                  <label
                    htmlFor="new-listing-images"
                    className="group flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-300 bg-slate-50/50 px-6 py-8 text-center transition-all hover:border-[#FF5D00] hover:bg-[#FF5D00]/[0.03] dark:border-white/15 dark:bg-white/[0.02] dark:hover:border-[#FF5D00]/60"
                  >
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FF5D00]/10 text-[#FF5D00] shadow-sm transition group-hover:scale-110">
                      <Plus className="h-6 w-6" strokeWidth={2.2} />
                    </div>
                    <h3 className="mt-3 text-sm font-black text-slate-900 dark:text-white">Ongeraho andi mafoto</h3>
                    <p className="mt-1 text-xs font-medium text-slate-400">Amafoto yose hamwe ntarenze 5.</p>
                    <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-[#102436] px-4 py-2 text-xs font-black text-white transition group-hover:bg-[#FF5D00] dark:bg-white/10">
                      <Camera className="w-3.5 h-3.5" strokeWidth={2} />
                      Hitamo amafoto
                    </span>
                    <input
                      id="new-listing-images"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleNewImages}
                      className="hidden"
                    />
                  </label>

                  {newImages.length > 0 && (
                    <div className="mt-5">
                      <div className="mb-3 flex items-center justify-between">
                        <p className="flex items-center gap-1.5 text-sm font-black text-slate-900 dark:text-white">
                          <Sparkles className="w-3.5 h-3.5 text-[#FF5D00]" strokeWidth={2.2} />
                          Amafoto mashya
                        </p>
                        <span className="text-[11px] font-bold text-slate-400">{newImages.length} mashya</span>
                      </div>
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
                        {newImages.map((image, index) => (
                          <div
                            key={`${image.name}-${index}`}
                            className="group relative aspect-square overflow-hidden rounded-2xl border border-emerald-500/30 bg-slate-50 shadow-sm ring-2 ring-emerald-500/10 dark:bg-white/[0.03]"
                          >
                            <img
                              src={URL.createObjectURL(image)}
                              alt={`New Preview ${index + 1}`}
                              className="h-full w-full object-cover"
                            />
                            <span className="absolute left-2 top-2 flex items-center gap-1 rounded-lg bg-emerald-500 px-1.5 py-0.5 text-[9px] font-black uppercase text-white shadow-sm">
                              <Check className="w-2.5 h-2.5" strokeWidth={3} />
                              New
                            </span>
                            <button
                              type="button"
                              onClick={() => removeNewImage(index)}
                              aria-label="Kuraho ifoto"
                              className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-rose-600 text-white shadow-lg transition hover:scale-110 hover:bg-rose-700"
                            >
                              <Trash2 className="h-3.5 w-3.5" strokeWidth={2.2} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* MESSAGE */}
            {message && (
              <div
                className={`flex items-start gap-3 rounded-2xl border p-4 text-sm font-semibold ${
                  success
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                    : "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300"
                }`}
              >
                <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white ${
                  success ? "bg-emerald-500" : "bg-rose-500"
                }`}>
                  {success ? <CheckCircle2 className="h-4 w-4" strokeWidth={2.5} /> : <AlertCircle className="h-4 w-4" strokeWidth={2.5} />}
                </span>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider">
                    {success ? "Byagenze neza" : "Hari ikibazo"}
                  </p>
                  <p className="mt-0.5 text-sm font-medium leading-relaxed">{message}</p>
                </div>
              </div>
            )}

            {/* SUBMIT */}
            <button
              type="submit"
              disabled={saving}
              className="group relative w-full overflow-hidden rounded-full bg-gradient-to-r from-[#FF5D00] via-[#FF7424] to-[#e05200] py-4 text-center text-sm font-black text-white shadow-[0_16px_38px_-10px_rgba(255,93,0,0.65)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_22px_45px_-10px_rgba(255,93,0,0.85)] active:scale-95 disabled:opacity-50"
            >
              <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              <span className="relative z-10 flex items-center justify-center gap-2">
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.5} />
                    <span>Turimo kubika...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" strokeWidth={2.2} />
                    <span>Bika Impinduka</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" strokeWidth={2.2} />
                  </>
                )}
              </span>
            </button>
          </form>

          {/* SIDEBAR — LIVE PREVIEW */}
          <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
            <div className="mb-1 flex items-center justify-between px-1">
              <div className="inline-flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inset-0 animate-ping rounded-full bg-emerald-500 opacity-75" />
                  <span className="relative flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 dark:text-slate-300">
                  Live Preview
                </span>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-600 ring-1 ring-emerald-500/20 dark:text-emerald-400">
                <Eye className="w-3 h-3" strokeWidth={2} />
                Isoko
              </span>
            </div>

            <div className="overflow-hidden rounded-[2rem] border border-slate-200/90 bg-white shadow-[0_30px_80px_-25px_rgba(16,36,54,0.28)] dark:border-white/10 dark:bg-slate-900 dark:shadow-black/60">
              {/* Main image */}
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900">
                {existingImages[0]?.image_url || newImages[0] ? (
                  <img
                    src={existingImages[0]?.image_url || URL.createObjectURL(newImages[0])}
                    alt={title || "Preview"}
                    className="h-full w-full object-cover"
                  />
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
                    {categories.find((c) => c.id === categoryId)?.name || "Icyiciro"}
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

            {/* Extra info card */}
            <div className="rounded-2xl border border-slate-200/70 bg-white/70 p-4 backdrop-blur-sm dark:border-white/10 dark:bg-slate-900/60">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <Bolt className="w-3.5 h-3.5 text-[#FF5D00]" strokeWidth={2.2} />
                Inshamake yihuse
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <div className="rounded-xl bg-slate-50 p-2.5 dark:bg-white/[0.04]">
                  <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">Amafoto</p>
                  <p className="mt-0.5 text-sm font-black text-slate-900 dark:text-white">{existingImages.length + newImages.length}/5</p>
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
    </main>
  )
}