import { useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from "react"
import { Link, useNavigate } from "react-router-dom"
import { supabase } from "../services/supabase"

type Category = { id: string; name: string }
type PreviousPhoneOption = { number: string; lastUsedAt: string }
type IconProps = { className?: string }

const Icon = {
  Pencil: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19.5 7.125L16.875 4.5" /></svg>
  ),
  Grid: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" /></svg>
  ),
  Tag: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M6 6h.008v.008H6V6z" /></svg>
  ),
  Document: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
  ),
  Pin: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
  ),
  Phone: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" /></svg>
  ),
  Camera: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" /></svg>
  ),
  Chat: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" /></svg>
  ),
  Check: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.4} d="M4.5 12.75l6 6 9-13.5" /></svg>
  ),
  Alert: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /></svg>
  ),
  ArrowLeft: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
  ),
  ArrowRight: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
  ),
  Close: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
  ),
  Trash: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
  ),
  Sparkles: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" /></svg>
  ),
  Eye: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
  ),
  Image: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5z" /></svg>
  ),
  Plus: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M12 4.5v15m7.5-7.5h-15" /></svg>
  ),
  Shield: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>
  ),
  Clock: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
  ),
  ChevronDown: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
  ),
  ChevronUp: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.5 15.75l7.5-7.5 7.5 7.5" /></svg>
  ),
}

function safeUUID(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID()
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === "x" ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export default function CreateListing() {
  const navigate = useNavigate()
  const formRef = useRef<HTMLFormElement | null>(null)
  const submittingRef = useRef(false)

  const [categories, setCategories] = useState<Category[]>([])
  const [images, setImages] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const [activePreviewIndex, setActivePreviewIndex] = useState(0)
  const [previewOpen, setPreviewOpen] = useState(false)

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
  const [selectedPhoneOption, setSelectedPhoneOption] = useState<"previous" | "new">("previous")
  const [previousNumbers, setPreviousNumbers] = useState<PreviousPhoneOption[]>([])
  const [fetchingPhones, setFetchingPhones] = useState(false)

  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")
  const [success, setSuccess] = useState(false)
  const [draftSavedAt, setDraftSavedAt] = useState<number | null>(null)
  // Tracks which field failed validation so we can highlight it
  const [errorField, setErrorField] = useState<string | null>(null)

  useEffect(() => {
    void loadCategories()
    void loadPreviousPhones()
  }, [])

  useEffect(() => {
    const urls = images.map((file) => URL.createObjectURL(file))
    setPreviewUrls(urls)
    return () => urls.forEach((url) => URL.revokeObjectURL(url))
  }, [images])

  useEffect(() => {
    setActivePreviewIndex((prev) => (prev >= previewUrls.length ? Math.max(0, previewUrls.length - 1) : prev))
  }, [previewUrls.length])

  useEffect(() => {
    if (!title && !description && !price && images.length === 0) return
    const t = setTimeout(() => setDraftSavedAt(Date.now()), 800)
    return () => clearTimeout(t)
  }, [title, description, price, images.length])

  async function loadCategories() {
    try {
      const { data } = await supabase.from("categories").select("id, name").eq("is_active", true).order("sort_order", { ascending: true })
      setCategories(data || [])
    } catch (err) { console.error("Failed to load categories:", err) }
  }

  async function loadPreviousPhones() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setFetchingPhones(true)
      const { data: profileData } = await supabase.from("profiles").select("phone_number").eq("id", user.id).single()
      const { data: listingPhones, error } = await supabase.from("listings").select("contact_phone_number, created_at").eq("seller_id", user.id).not("contact_phone_number", "is", null).order("created_at", { ascending: false })

      const uniqueMap = new Map<string, string>()
      if (profileData?.phone_number) {
        const cleaned = profileData.phone_number.trim()
        if (cleaned) uniqueMap.set(cleaned, new Date().toISOString())
      }
      if (!error && listingPhones) {
        listingPhones.forEach((item: any) => {
          if (item.contact_phone_number) {
            const cleaned = item.contact_phone_number.trim()
            if (cleaned && !uniqueMap.has(cleaned)) uniqueMap.set(cleaned, item.created_at)
          }
        })
      }
      const uniqueList: PreviousPhoneOption[] = Array.from(uniqueMap.entries()).map(([number, lastUsedAt]) => ({ number, lastUsedAt }))
      setPreviousNumbers(uniqueList)
      if (uniqueList.length > 0) { setPhoneNumber(uniqueList[0].number); setSelectedPhoneOption("previous") }
      else setSelectedPhoneOption("new")
    } catch (err) { console.error("Failed to load phone history:", err) }
    finally { setFetchingPhones(false) }
  }

  function handleImageSelect(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    if (images.length + files.length > 5) {
      const allowed = Math.max(0, 5 - images.length)
      setImages((prev) => [...prev, ...files.slice(0, allowed)])
      setMessage("Ushobora kugira amafoto atarenze 5 yose hamwe.")
      setSuccess(false)
      e.target.value = ""
      return
    }
    setMessage("")
    setImages((prev) => [...prev, ...files])
    e.target.value = ""
  }

  function removeImage(index: number) { setImages((prev) => prev.filter((_, i) => i !== index)) }

  function validatePhone(phone: string): boolean {
    const cleaned = phone.replace(/[\s\-\(\)]/g, "")
    return /^(?:\+?250|0)?7[2389]\d{7}$/.test(cleaned) || /^\+[1-9]\d{6,14}$/.test(cleaned)
  }

  function normalizePhoneNumber(phone: string): string {
    let cleaned = phone.replace(/[\s\-\(\)]/g, "")
    if (cleaned.startsWith("07") && cleaned.length === 10) cleaned = "+250" + cleaned.slice(1)
    else if (cleaned.startsWith("250") && cleaned.length === 12) cleaned = "+" + cleaned
    return cleaned
  }

  function formatLocation(): string { return [sector, district, province].filter(Boolean).join(", ") }

  const stepStatus = useMemo(() => {
    const isTitleDone = title.trim().length >= 3
    const isCategoryDone = Boolean(categoryId)
    const isPriceDone = price.trim() !== "" && Number(price) > 0
    const isDescriptionDone = description.trim().length >= 10
    const isLocationDone = province.trim().length >= 2
    const isPhoneDone = !contactPhone || (phoneNumber.trim() !== "" && validatePhone(phoneNumber))
    const isImagesDone = images.length > 0
    const steps = [
      { key: "title", done: isTitleDone }, { key: "category", done: isCategoryDone },
      { key: "price", done: isPriceDone }, { key: "description", done: isDescriptionDone },
      { key: "location", done: isLocationDone }, { key: "phone", done: isPhoneDone },
      { key: "images", done: isImagesDone },
    ]
    const completedCount = steps.filter((s) => s.done).length
    const firstIncompleteKey = steps.find((s) => !s.done)?.key ?? "ready"
    return { isTitleDone, isCategoryDone, isPriceDone, isDescriptionDone, isLocationDone, isPhoneDone, isImagesDone, completedCount, totalSteps: steps.length, firstIncompleteKey, progressPercent: Math.round((completedCount / steps.length) * 100) }
  }, [title, categoryId, price, description, province, contactPhone, phoneNumber, images.length])

  async function uploadImages(listingId: string, userId: string) {
    if (images.length === 0) return
    for (let i = 0; i < images.length; i++) {
      const image = images[i]
      const extension = image.name.split(".").pop()?.toLowerCase() || "jpg"
      const filePath = `${userId}/${listingId}/${safeUUID()}.${extension}`
      const { error: uploadError } = await supabase.storage.from("listing-images").upload(filePath, image, { cacheControl: "3600", upsert: false, contentType: image.type })
      if (uploadError) { console.error("Upload Error:", uploadError.message); continue }
      const { data: { publicUrl } } = supabase.storage.from("listing-images").getPublicUrl(filePath)
      const { error: imageError } = await supabase.from("listing_images").insert({ listing_id: listingId, image_url: publicUrl, sort_order: i })
      if (imageError) console.error("Image DB Insert Error:", imageError.message)
    }
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
   * MASTER SUBMIT — called by EVERY button (desktop in-form, mobile sticky, tablet)
   * Does NOT rely on form attribute, does NOT rely on native HTML5 validation.
   * All validation happens here in JS so it works identically on all devices.
   */
  async function submitListing() {
    // Guard against double-tap (very common on mobile)
    if (submittingRef.current || saving) return
    submittingRef.current = true
    setSaving(true)
    setMessage("")
    setSuccess(false)
    setErrorField(null)

    // Synchronously scroll to top so the toast is guaranteed visible
    window.scrollTo({ top: 0, behavior: "smooth" })

    try {
      // ─── VALIDATION (JS, works everywhere) ───
      if (!title.trim()) { setMessage("Andika izina ry'ikintu."); setErrorField("title"); scrollToField("title"); return }
      if (!categoryId) { setMessage("Hitamo category."); setErrorField("category"); scrollToField("category"); return }
      if (!province.trim()) { setMessage("Andika Province."); setErrorField("province"); scrollToField("province"); return }
      if (contactPhone) {
        if (!phoneNumber.trim()) { setMessage("Shyiramo nimero ya telefoni."); setErrorField("phone"); scrollToField("phone"); return }
        if (!validatePhone(phoneNumber)) { setMessage("Nimero wanditse ntabwo yemewe (+250 cyangwa 07...)."); setErrorField("phone"); scrollToField("phone"); return }
      }

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { navigate("/login"); return }

      const { data: location, error: locationError } = await supabase.from("locations").insert({
        province: province.trim(),
        district: district.trim() || null,
        sector: sector.trim() || null,
      }).select().single()
      if (locationError) throw locationError

      const finalNormalizedPhone = contactPhone && phoneNumber.trim() ? normalizePhoneNumber(phoneNumber.trim()) : null
      const parsedPrice: number | null = price.trim() !== "" ? Number(price) : null

      const { data: newListing, error: listingError } = await supabase.from("listings").insert({
        seller_id: user.id,
        title: title.trim(),
        category_id: categoryId,
        location_id: location.id,
        description: description.trim() || null,
        price: parsedPrice,
        listing_type: listingType,
        condition,
        contact_phone: contactPhone,
        contact_phone_number: finalNormalizedPhone,
        contact_chat: true,
        status: "active",
      }).select("id").single()
      if (listingError) throw listingError

      await uploadImages(newListing.id, user.id)
      setSuccess(true)
      setMessage("Byageze ku Isoko! 🎉 Turimo kukujyana...")
      window.scrollTo({ top: 0, behavior: "smooth" })
      setTimeout(() => navigate("/home"), 2200)
    } catch (err: unknown) {
      console.error("Submit error:", err)
      setSuccess(false)
      setMessage("Habaye ikibazo mu gushyiraho icyugurishwa. Ongera ugerageze.")
    } finally {
      setSaving(false)
      submittingRef.current = false
    }
  }

  // Form onSubmit also calls submitListing — for Enter key on desktop
  function handleFormSubmit(e: FormEvent) {
    e.preventDefault()
    void submitListing()
  }

  const selectedCategoryName = categories.find((c) => c.id === categoryId)?.name
  const conditionLabelMap: Record<string, string> = { new: "Bishya", used: "Byakoreshejwe", refurbished: "Byavuguruwe" }

  function getFieldCardClasses(isDone: boolean, isCurrentNext: boolean, isError: boolean) {
    if (isError) return "border-rose-500 bg-rose-50/60 ring-4 ring-rose-500/15 dark:border-rose-500 dark:bg-rose-500/[0.08]"
    if (isDone) return "border-emerald-400/40 bg-gradient-to-br from-emerald-50/60 to-white shadow-[0_10px_40px_-15px_rgba(16,185,129,0.35)] dark:border-emerald-500/30 dark:from-emerald-500/[0.06] dark:to-slate-900"
    if (isCurrentNext) return "border-[#FF5D00] bg-white shadow-[0_20px_50px_-15px_rgba(255,93,0,0.35)] ring-4 ring-[#FF5D00]/10 dark:border-[#FF5D00] dark:bg-slate-900"
    return "border-slate-200/70 bg-white/70 hover:border-slate-300 hover:bg-white dark:border-white/10 dark:bg-slate-900/60 dark:hover:border-white/20"
  }

  function renderStepBadge(isDone: boolean, isCurrentNext: boolean, IconComp: React.ComponentType<IconProps>) {
    if (isDone) return (
      <span className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-emerald-600 ring-1 ring-emerald-500/25 dark:text-emerald-400">
        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-white"><Icon.Check className="w-2.5 h-2.5" /></span>
        <span className="hidden sm:inline">Byemejwe</span>
        <span className="sm:hidden">✓</span>
      </span>
    )
    if (isCurrentNext) return (
      <span className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full bg-[#FF5D00]/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-[#FF5D00] ring-1 ring-[#FF5D00]/30">
        <span className="relative flex h-2 w-2"><span className="absolute inset-0 animate-ping rounded-full bg-[#FF5D00] opacity-75" /><span className="relative flex h-2 w-2 rounded-full bg-[#FF5D00]" /></span>
        <span className="hidden sm:inline">Uzuza aha</span>
        <span className="sm:hidden">!</span>
      </span>
    )
    return <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-400 ring-1 ring-slate-200/50 dark:bg-white/[0.05] dark:text-slate-500 dark:ring-white/10"><IconComp className="w-3.5 h-3.5" /></span>
  }

  /* ───────────── SHARED PREVIEW CARD ───────────── */
  const previewCard = (
    <div className="overflow-hidden rounded-[2rem] border border-slate-200/90 bg-white shadow-[0_30px_80px_-25px_rgba(16,36,54,0.28)] dark:border-white/10 dark:bg-slate-900">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900">
        {previewUrls.length > 0 ? (
          <img src={previewUrls[activePreviewIndex]} alt={title || "Preview"} className="h-full w-full object-cover transition-all duration-500" />
        ) : (
          <div className="flex h-full flex-col items-center justify-center p-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-white/60 text-slate-400 shadow-inner dark:bg-white/5"><Icon.Image className="w-8 h-8" /></div>
            <p className="mt-3 text-xs font-extrabold text-slate-500 dark:text-slate-400">Ifoto y'ikintu izagaragara hano</p>
          </div>
        )}
        <div className="absolute left-3.5 right-3.5 top-3.5 flex items-center justify-between gap-2">
          <span className="rounded-full bg-black/60 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-white backdrop-blur-md">{selectedCategoryName || "Icyiciro"}</span>
          <div className="flex items-center gap-1.5">
            <span className="rounded-full bg-[#102436]/85 px-2.5 py-1 text-[10px] font-extrabold text-white backdrop-blur-md">{listingType === "rent" ? "Gukodesha" : "Kugurisha"}</span>
            <span className="rounded-full bg-[#FF5D00] px-2.5 py-1 text-[10px] font-black text-white shadow-sm">{conditionLabelMap[condition] || "Used"}</span>
          </div>
        </div>
        {previewUrls.length > 0 && <span className="absolute bottom-3 right-3 rounded-full bg-black/65 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur-md">{activePreviewIndex + 1} / {previewUrls.length}</span>}
      </div>
      {previewUrls.length > 1 && (
        <div className="flex gap-2 border-b border-slate-100 bg-slate-50/70 px-4 py-2.5 dark:border-white/5 dark:bg-white/[0.02]">
          {previewUrls.map((url, idx) => (
            <button key={idx} type="button" onClick={() => setActivePreviewIndex(idx)} className={`h-11 w-11 overflow-hidden rounded-xl border-2 transition-all ${activePreviewIndex === idx ? "scale-105 border-[#FF5D00] shadow-sm" : "border-transparent opacity-60 hover:opacity-100"}`}>
              <img src={url} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
      <div className="p-6">
        <h2 className="text-lg font-black leading-snug text-slate-900 dark:text-white">{title.trim() || "Izina ry'ikintu ugurisha..."}</h2>
        <div className="mt-2.5 flex items-baseline gap-2">
          <span className="text-2xl font-black tracking-tight text-[#FF5D00]">{price && Number(price) > 0 ? `${Number(price).toLocaleString()} FRW` : "0 FRW"}</span>
          {listingType === "rent" && <span className="text-xs font-bold text-slate-400">/ ukwezi</span>}
        </div>
        <div className="mt-3 flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400"><Icon.Pin className="w-3.5 h-3.5 text-[#569ab5]" /><span>{formatLocation() || "Kigali, Rwanda"}</span></div>
        <p className="mt-3.5 line-clamp-3 rounded-2xl bg-slate-50 p-3.5 text-xs font-medium leading-relaxed text-slate-600 dark:bg-white/[0.04] dark:text-slate-300">{description.trim() || "Ibisobanuro by'ikintu cyawe bizagaragara hano..."}</p>
        <div className="mt-5 grid grid-cols-2 gap-2.5 border-t border-slate-100 pt-4 dark:border-white/10">
          <div className="flex items-center justify-center gap-1.5 rounded-xl bg-[#102436] py-2.5 text-xs font-extrabold text-white dark:bg-white/10"><Icon.Chat className="w-3.5 h-3.5" /><span>Andikira</span></div>
          <div className={`flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-extrabold ${contactPhone && phoneNumber.trim() ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" : "bg-slate-100 text-slate-400 dark:bg-white/[0.04]"}`}>
            <Icon.Phone className="w-3.5 h-3.5" /><span className="truncate">{contactPhone && phoneNumber.trim() ? phoneNumber.trim() : "Nta telefoni"}</span>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <main className="relative min-h-screen bg-[#f4f8fb] text-[#102436] dark:bg-[#060f19] dark:text-slate-100">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-[#FF5D00]/10 blur-[120px] dark:bg-[#FF5D00]/[0.08]" />
        <div className="absolute top-1/3 -right-40 h-[500px] w-[500px] rounded-full bg-emerald-500/10 blur-[120px] dark:bg-emerald-500/[0.06]" />
      </div>

      {/* HEADER */}
      <header className="sticky top-0 z-30 border-b border-slate-200/60 bg-white/70 backdrop-blur-2xl dark:border-white/10 dark:bg-[#060f19]/70" style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}>
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-3 py-3 sm:gap-4 sm:px-6 lg:px-8">
          <Link to="/dashboard" className="group inline-flex shrink-0 items-center gap-2 rounded-full border border-slate-200/80 bg-white px-3 py-2 text-xs font-extrabold text-slate-700 shadow-sm transition-all hover:border-[#FF5D00] hover:text-[#FF5D00] dark:border-white/10 dark:bg-white/[0.06] dark:text-slate-200">
            <Icon.ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
            <span className="hidden sm:inline">Dashboard</span>
          </Link>
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            {draftSavedAt && (
              <span className="hidden items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold text-emerald-600 ring-1 ring-emerald-500/20 dark:text-emerald-400 md:inline-flex">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />Byabitswe
              </span>
            )}
            <div className="text-right">
              <div className="flex items-center justify-end gap-1.5">
                <span className="text-[11px] font-black text-slate-700 dark:text-slate-200">{stepStatus.completedCount}/{stepStatus.totalSteps}</span>
                <span className="hidden text-[10px] font-bold text-slate-400 sm:inline">byuzuye</span>
              </div>
              <div className="mt-1 h-1.5 w-20 overflow-hidden rounded-full bg-slate-200/80 dark:bg-white/10 sm:w-28 md:w-36">
                <div className="h-full rounded-full bg-gradient-to-r from-[#FF5D00] via-[#FF7424] to-emerald-500 transition-all duration-700 ease-out" style={{ width: `${stepStatus.progressPercent}%` }} />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* TOAST — fixed, always visible, z-index above everything */}
      {message && (
        <div className="fixed inset-x-0 top-[calc(56px+env(safe-area-inset-top,0px))] z-[60] mx-auto max-w-7xl px-3 pt-3 sm:top-[68px] sm:px-6 lg:px-8">
          <div className={`flex items-center justify-between gap-3 rounded-2xl border p-3 text-sm font-bold shadow-2xl sm:p-3.5 ${success ? "border-emerald-400 bg-emerald-500 text-white" : "border-rose-400 bg-rose-500 text-white"}`}>
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/25 text-white">
                {success ? <Icon.Check className="w-4 h-4" /> : <Icon.Alert className="w-4 h-4" />}
              </span>
              <span className="min-w-0 break-words">{message}</span>
            </div>
            <button type="button" onClick={() => setMessage("")} className="shrink-0 rounded-full p-1.5 text-white/90 transition hover:bg-white/20" aria-label="Funga">
              <Icon.Close className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <div className="relative mx-auto max-w-7xl px-3 pb-36 pt-6 sm:px-6 sm:pt-8 lg:px-8 lg:pt-10 lg:pb-10">
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_420px] lg:gap-8 xl:grid-cols-[minmax(0,1fr)_460px]">

          {/* FORM — novalidate so browser native validation never blocks us silently */}
          <form ref={formRef} onSubmit={handleFormSubmit} noValidate className="space-y-3 sm:space-y-3.5">

            {/* 1. TITLE */}
            <div data-field="title" className={`group rounded-3xl border p-4 transition-all duration-300 sm:p-6 ${getFieldCardClasses(stepStatus.isTitleDone, stepStatus.firstIncompleteKey === "title", errorField === "title")}`}>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <label htmlFor="listing-title" className="flex items-center gap-2 text-sm font-black text-slate-900 dark:text-white">
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-colors ${stepStatus.isTitleDone ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" : "bg-[#FF5D00]/10 text-[#FF5D00]"}`}><Icon.Pencil className="w-4 h-4" /></span>
                  Izina ry'ikintu <span className="text-rose-500">*</span>
                </label>
                {renderStepBadge(stepStatus.isTitleDone, stepStatus.firstIncompleteKey === "title", Icon.Pencil)}
              </div>
              <input id="listing-title" type="text" value={title} onChange={(e) => { setTitle(e.target.value); if (errorField === "title") setErrorField(null) }} maxLength={80} placeholder="Urugero: iPhone, inzu yo kubamo..." className="w-full rounded-2xl border border-slate-200/80 bg-slate-50/50 px-4 py-3.5 text-sm font-bold text-slate-900 outline-none transition-all placeholder:font-semibold placeholder:text-slate-400 focus:border-[#FF5D00] focus:bg-white focus:ring-4 focus:ring-[#FF5D00]/10 dark:border-white/10 dark:bg-white/[0.03] dark:text-white dark:placeholder:text-slate-500" />
              <div className="mt-1.5 flex justify-end"><span className={`text-[10px] font-bold ${title.length > 70 ? "text-amber-500" : "text-slate-400"}`}>{title.length}/80</span></div>
            </div>

            {/* 2. CATEGORY */}
            <div data-field="category" className={`group rounded-3xl border p-4 transition-all duration-300 sm:p-6 ${getFieldCardClasses(stepStatus.isCategoryDone, stepStatus.firstIncompleteKey === "category", errorField === "category")}`}>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <label htmlFor="listing-category" className="flex items-center gap-2 text-sm font-black text-slate-900 dark:text-white">
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-colors ${stepStatus.isCategoryDone ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" : "bg-[#FF5D00]/10 text-[#FF5D00]"}`}><Icon.Grid className="w-4 h-4" /></span>
                  Icyiciro <span className="text-rose-500">*</span>
                </label>
                {renderStepBadge(stepStatus.isCategoryDone, stepStatus.firstIncompleteKey === "category", Icon.Grid)}
              </div>
              <div className="relative">
                <select id="listing-category" value={categoryId} onChange={(e) => { setCategoryId(e.target.value); if (errorField === "category") setErrorField(null) }} className="w-full cursor-pointer appearance-none rounded-2xl border border-slate-200/80 bg-slate-50/50 px-4 py-3.5 pr-10 text-sm font-bold text-slate-900 outline-none transition-all focus:border-[#FF5D00] focus:bg-white focus:ring-4 focus:ring-[#FF5D00]/10 dark:border-white/10 dark:bg-slate-900 dark:text-white">
                  <option value="">Hitamo ubwoko...</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"><Icon.ChevronDown className="w-4 h-4" /></span>
              </div>
            </div>

            {/* 3. PRICE */}
            <div data-field="price" className={`group rounded-3xl border p-4 transition-all duration-300 sm:p-6 ${getFieldCardClasses(stepStatus.isPriceDone, stepStatus.firstIncompleteKey === "price", errorField === "price")}`}>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <label className="flex items-center gap-2 text-sm font-black text-slate-900 dark:text-white">
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-colors ${stepStatus.isPriceDone ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" : "bg-[#FF5D00]/10 text-[#FF5D00]"}`}><Icon.Tag className="w-4 h-4" /></span>
                  Igiciro n'Imimerere <span className="text-rose-500">*</span>
                </label>
                {renderStepBadge(stepStatus.isPriceDone, stepStatus.firstIncompleteKey === "price", Icon.Tag)}
              </div>
              <div className="mb-4 grid grid-cols-2 gap-2.5">
                {[{ value: "sale", label: "Kugurisha", icon: Icon.Tag }, { value: "rent", label: "Gukodesha", icon: Icon.Clock }].map((item) => {
                  const active = listingType === item.value
                  const ItemIcon = item.icon
                  return (
                    <button key={item.value} type="button" onClick={() => setListingType(item.value)} className={`flex items-center justify-center gap-1.5 rounded-2xl border py-2.5 text-xs font-black transition-all ${active ? "border-[#102436] bg-[#102436] text-white shadow-md dark:border-[#FF5D00] dark:bg-[#FF5D00]" : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300 dark:hover:bg-white/[0.08]"}`}>
                      <ItemIcon className="w-3.5 h-3.5" />{item.label}
                    </button>
                  )
                })}
              </div>
              <div className="grid gap-3.5 sm:grid-cols-2">
                <div className="relative">
                  <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} min="0" inputMode="numeric" placeholder="Igiciro" className="w-full rounded-2xl border border-slate-200/80 bg-slate-50/50 px-4 py-3.5 pr-14 text-sm font-bold text-slate-900 outline-none transition-all placeholder:font-semibold placeholder:text-slate-400 focus:border-[#FF5D00] focus:bg-white focus:ring-4 focus:ring-[#FF5D00]/10 dark:border-white/10 dark:bg-white/[0.03] dark:text-white dark:placeholder:text-slate-500" />
                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[11px] font-black text-slate-400">FRW</span>
                </div>
                <div className="relative">
                  <select value={condition} onChange={(e) => setCondition(e.target.value)} className="w-full cursor-pointer appearance-none rounded-2xl border border-slate-200/80 bg-slate-50/50 px-4 py-3.5 pr-10 text-sm font-bold text-slate-900 outline-none transition-all focus:border-[#FF5D00] focus:bg-white focus:ring-4 focus:ring-[#FF5D00]/10 dark:border-white/10 dark:bg-slate-900 dark:text-white">
                    <option value="new">Bishya</option>
                    <option value="used">Byakoreshejwe</option>
                    <option value="refurbished">Byavuguruwe</option>
                  </select>
                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"><Icon.ChevronDown className="w-4 h-4" /></span>
                </div>
              </div>
            </div>

            {/* 4. DESCRIPTION */}
            <div data-field="description" className={`group rounded-3xl border p-4 transition-all duration-300 sm:p-6 ${getFieldCardClasses(stepStatus.isDescriptionDone, stepStatus.firstIncompleteKey === "description", false)}`}>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <label htmlFor="listing-description" className="flex items-center gap-2 text-sm font-black text-slate-900 dark:text-white">
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-colors ${stepStatus.isDescriptionDone ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" : "bg-[#FF5D00]/10 text-[#FF5D00]"}`}><Icon.Document className="w-4 h-4" /></span>
                  Ibisobanuro birambuye
                </label>
                {renderStepBadge(stepStatus.isDescriptionDone, stepStatus.firstIncompleteKey === "description", Icon.Document)}
              </div>
              <textarea id="listing-description" value={description} onChange={(e) => setDescription(e.target.value)} rows={4} maxLength={800} placeholder="Sobanura neza imimerere y'ikintu cyawe, ingano, ibara n'ibindi..." className="min-h-[120px] w-full resize-none rounded-2xl border border-slate-200/80 bg-slate-50/50 px-4 py-3.5 text-sm font-semibold text-slate-900 outline-none transition-all placeholder:font-medium placeholder:text-slate-400 focus:border-[#FF5D00] focus:bg-white focus:ring-4 focus:ring-[#FF5D00]/10 dark:border-white/10 dark:bg-white/[0.03] dark:text-white dark:placeholder:text-slate-500" />
              <div className="mt-1.5 flex justify-end"><span className={`text-[10px] font-bold ${description.length > 700 ? "text-amber-500" : "text-slate-400"}`}>{description.length}/800</span></div>
            </div>

            {/* 5. LOCATION */}
            <div data-field="province" className={`group rounded-3xl border p-4 transition-all duration-300 sm:p-6 ${getFieldCardClasses(stepStatus.isLocationDone, stepStatus.firstIncompleteKey === "location", errorField === "province")}`}>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <label className="flex items-center gap-2 text-sm font-black text-slate-900 dark:text-white">
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-colors ${stepStatus.isLocationDone ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" : "bg-[#FF5D00]/10 text-[#FF5D00]"}`}><Icon.Pin className="w-4 h-4" /></span>
                  Aho giherereye <span className="text-rose-500">*</span>
                </label>
                {renderStepBadge(stepStatus.isLocationDone, stepStatus.firstIncompleteKey === "location", Icon.Pin)}
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <input value={province} onChange={(e) => { setProvince(e.target.value); if (errorField === "province") setErrorField(null) }} placeholder="Intara" className="w-full rounded-2xl border border-slate-200/80 bg-slate-50/50 px-4 py-3.5 text-sm font-bold text-slate-900 outline-none transition-all placeholder:font-semibold placeholder:text-slate-400 focus:border-[#FF5D00] focus:bg-white focus:ring-4 focus:ring-[#FF5D00]/10 dark:border-white/10 dark:bg-white/[0.03] dark:text-white dark:placeholder:text-slate-500" />
                <input value={district} onChange={(e) => setDistrict(e.target.value)} placeholder="Akarere" className="w-full rounded-2xl border border-slate-200/80 bg-slate-50/50 px-4 py-3.5 text-sm font-bold text-slate-900 outline-none transition-all placeholder:font-semibold placeholder:text-slate-400 focus:border-[#FF5D00] focus:bg-white focus:ring-4 focus:ring-[#FF5D00]/10 dark:border-white/10 dark:bg-white/[0.03] dark:text-white dark:placeholder:text-slate-500" />
                <input value={sector} onChange={(e) => setSector(e.target.value)} placeholder="Umurenge" className="w-full rounded-2xl border border-slate-200/80 bg-slate-50/50 px-4 py-3.5 text-sm font-bold text-slate-900 outline-none transition-all placeholder:font-semibold placeholder:text-slate-400 focus:border-[#FF5D00] focus:bg-white focus:ring-4 focus:ring-[#FF5D00]/10 dark:border-white/10 dark:bg-white/[0.03] dark:text-white dark:placeholder:text-slate-500" />
              </div>
            </div>

            {/* 6. PHONE */}
            <div data-field="phone" className={`group rounded-3xl border p-4 transition-all duration-300 sm:p-6 ${getFieldCardClasses(stepStatus.isPhoneDone, stepStatus.firstIncompleteKey === "phone", errorField === "phone")}`}>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-3">
                  <label className="flex items-center gap-2 text-sm font-black text-slate-900 dark:text-white">
                    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-colors ${stepStatus.isPhoneDone ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" : "bg-[#FF5D00]/10 text-[#FF5D00]"}`}><Icon.Phone className="w-4 h-4" /></span>
                    Nimero ya Telefoni
                  </label>
                  <label className="relative inline-flex cursor-pointer items-center">
                    <input type="checkbox" checked={contactPhone} onChange={(e) => setContactPhone(e.target.checked)} className="peer sr-only" />
                    <div className="h-5 w-10 rounded-full bg-slate-300 transition-colors after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:shadow-sm after:transition-all peer-checked:bg-emerald-500 peer-checked:after:translate-x-5 dark:bg-white/15" />
                  </label>
                </div>
                {renderStepBadge(stepStatus.isPhoneDone, stepStatus.firstIncompleteKey === "phone", Icon.Phone)}
              </div>
              {contactPhone && (
                <div className="space-y-3 pt-1">
                  {fetchingPhones ? (
                    <p className="flex items-center gap-2 text-xs font-semibold text-slate-400"><span className="h-3 w-3 animate-spin rounded-full border-2 border-slate-400 border-t-transparent" />Turimo gushaka nimero zawe...</p>
                  ) : previousNumbers.length > 0 ? (
                    <div className="space-y-2.5">
                      <div className="flex flex-wrap gap-2">
                        <button type="button" onClick={() => { setSelectedPhoneOption("previous"); setPhoneNumber(previousNumbers[0].number) }} className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition ${selectedPhoneOption === "previous" ? "bg-[#102436] text-white shadow-sm dark:bg-white/15" : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-white/[0.05] dark:text-slate-300 dark:hover:bg-white/[0.08]"}`}><Icon.Clock className="w-3.5 h-3.5" />Nimero ya mbere</button>
                        <button type="button" onClick={() => { setSelectedPhoneOption("new"); setPhoneNumber("") }} className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition ${selectedPhoneOption === "new" ? "bg-[#102436] text-white shadow-sm dark:bg-white/15" : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-white/[0.05] dark:text-slate-300 dark:hover:bg-white/[0.08]"}`}><Icon.Plus className="w-3.5 h-3.5" />Nimero nshya</button>
                      </div>
                      {selectedPhoneOption === "previous" && (
                        <div className="relative">
                          <select value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className="w-full cursor-pointer appearance-none rounded-2xl border border-slate-200/80 bg-slate-50/50 px-4 py-3.5 pr-10 text-sm font-bold text-slate-900 outline-none transition-all focus:border-[#FF5D00] focus:bg-white dark:border-white/10 dark:bg-slate-900 dark:text-white">
                            {previousNumbers.map((item, idx) => <option key={idx} value={item.number}>{item.number} {idx === 0 ? "(Iyaherukaga)" : ""}</option>)}
                          </select>
                          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"><Icon.ChevronDown className="w-4 h-4" /></span>
                        </div>
                      )}
                    </div>
                  ) : null}
                  {(selectedPhoneOption === "new" || previousNumbers.length === 0) && (
                    <input type="tel" value={phoneNumber} onChange={(e) => { setPhoneNumber(e.target.value); if (errorField === "phone") setErrorField(null) }} inputMode="tel" autoComplete="tel" placeholder="Urugero: 0788000000 cyangwa +250788000000" className="w-full rounded-2xl border border-slate-200/80 bg-slate-50/50 px-4 py-3.5 text-sm font-bold text-slate-900 outline-none transition-all placeholder:font-semibold placeholder:text-slate-400 focus:border-[#FF5D00] focus:bg-white focus:ring-4 focus:ring-[#FF5D00]/10 dark:border-white/10 dark:bg-white/[0.03] dark:text-white dark:placeholder:text-slate-500" />
                  )}
                </div>
              )}
            </div>

            {/* 7. IMAGES */}
            <div data-field="images" className={`group rounded-3xl border p-4 transition-all duration-300 sm:p-6 ${getFieldCardClasses(stepStatus.isImagesDone, stepStatus.firstIncompleteKey === "images", false)}`}>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <label className="flex items-center gap-2 text-sm font-black text-slate-900 dark:text-white">
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-colors ${stepStatus.isImagesDone ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" : "bg-[#FF5D00]/10 text-[#FF5D00]"}`}><Icon.Camera className="w-4 h-4" /></span>
                  Amafoto y'ikintu <span className="font-bold text-slate-400">({images.length}/5)</span>
                </label>
                <div className="flex items-center gap-2">
                  <div className="hidden items-center gap-1 sm:flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i < images.length ? "w-6 bg-[#FF5D00]" : "w-3 bg-slate-200 dark:bg-white/15"}`} />
                    ))}
                  </div>
                  {renderStepBadge(stepStatus.isImagesDone, stepStatus.firstIncompleteKey === "images", Icon.Camera)}
                </div>
              </div>

              {images.length === 0 && (
                <label className="group/drop relative flex cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-slate-300 bg-gradient-to-br from-slate-50 to-white p-8 text-center transition-all duration-300 hover:border-[#FF5D00] sm:p-10">
                  <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-[#FF5D00]/10 blur-3xl" />
                  <span className="relative flex h-16 w-16 items-center justify-center rounded-[1.4rem] bg-gradient-to-br from-[#FF5D00] to-[#e05200] text-white shadow-[0_16px_35px_-12px_rgba(255,93,0,0.6)]"><Icon.Camera className="h-7 w-7" /></span>
                  <span className="relative mt-4 text-sm font-black text-slate-900 dark:text-white">Kanda ushyiremo amafoto</span>
                  <span className="relative mt-1 max-w-xs text-[11px] font-medium leading-relaxed text-slate-500 dark:text-slate-400">Ifoto ya mbere ni yo igaragara imbere ku isoko · Kugera kuri 5</span>
                  <input type="file" accept="image/*" multiple onChange={handleImageSelect} className="hidden" />
                </label>
              )}

              {images.length > 0 && (
                <div className="space-y-3">
                  <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 dark:border-white/10 dark:bg-slate-800">
                    <div className="relative aspect-[16/10] w-full">
                      <img src={previewUrls[0]} alt="Ifoto y'ibanze" className="h-full w-full object-cover" />
                      <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-[#FF5D00] px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-white shadow-lg"><Icon.Sparkles className="h-3 w-3" />Ifoto y'ibanze</span>
                      <button type="button" onClick={() => removeImage(0)} className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/55 text-white hover:bg-rose-600" aria-label="Siba"><Icon.Trash className="h-4 w-4" /></button>
                      <label className="absolute bottom-3 right-3 inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-[10px] font-black uppercase tracking-wide text-slate-800 shadow-md dark:bg-slate-900/95 dark:text-slate-100"><Icon.Camera className="h-3 w-3" />Hindura<input type="file" accept="image/*" multiple onChange={handleImageSelect} className="hidden" /></label>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 sm:gap-3">
                    {previewUrls.slice(1).map((url, idx) => {
                      const realIndex = idx + 1
                      return (
                        <div key={realIndex} className="group/img relative aspect-square overflow-hidden rounded-xl border border-slate-200 bg-slate-100 dark:border-white/10 dark:bg-slate-800">
                          <img src={url} alt={`Ifoto ${realIndex + 1}`} className="h-full w-full object-cover" />
                          <span className="absolute left-1.5 top-1.5 rounded-full bg-black/55 px-1.5 py-0.5 text-[9px] font-black text-white">{realIndex + 1}</span>
                          <button type="button" onClick={() => removeImage(realIndex)} className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/55 text-white hover:bg-rose-600" aria-label={`Siba ${realIndex + 1}`}><Icon.Trash className="h-3 w-3" /></button>
                        </div>
                      )
                    })}
                    {images.length < 5 && (
                      <label className="relative flex aspect-square cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-gradient-to-br from-slate-50 to-white hover:border-[#FF5D00]">
                        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#FF5D00]/10 text-[#FF5D00]"><Icon.Plus className="h-4 w-4" /></span>
                        <span className="mt-1.5 text-[10px] font-black uppercase tracking-wider text-slate-500">Ongeraho</span>
                        <span className="text-[9px] font-bold text-slate-400">{5 - images.length} isigaye</span>
                        <input type="file" accept="image/*" multiple onChange={handleImageSelect} className="hidden" />
                      </label>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Mobile preview toggle */}
            <button type="button" onClick={() => setPreviewOpen((v) => !v)} className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm font-bold text-slate-700 shadow-sm backdrop-blur transition hover:bg-white dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200 lg:hidden">
              <span className="flex items-center gap-2"><Icon.Eye className="w-4 h-4 text-[#569ab5]" />Reba uko bigenda kugaragara</span>
              {previewOpen ? <Icon.ChevronUp className="w-4 h-4" /> : <Icon.ChevronDown className="w-4 h-4" />}
            </button>

            {previewOpen && <div className="lg:hidden">{previewCard}</div>}

            {/* DESKTOP in-form submit — calls submitListing directly */}
            <div className="hidden pt-2 lg:block">
              <SubmitButton saving={saving} onClick={submitListing} />
            </div>
          </form>

          {/* RIGHT: live preview */}
          <aside className="hidden lg:sticky lg:top-24 lg:block">
            <div className="mb-3 flex items-center justify-between px-1">
              <div className="inline-flex items-center gap-2">
                <span className="relative flex h-2 w-2"><span className="absolute inset-0 animate-ping rounded-full bg-emerald-500 opacity-75" /><span className="relative flex h-2 w-2 rounded-full bg-emerald-500" /></span>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 dark:text-slate-300">Live Preview</span>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-600 ring-1 ring-emerald-500/20 dark:text-emerald-400"><Icon.Eye className="w-3 h-3" />Isoko</span>
            </div>
            {previewCard}
          </aside>
        </div>
      </div>

      {/* MOBILE / TABLET sticky action bar — button is type="button", calls submitListing directly */}
      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200/70 bg-white/95 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom,0px))] pt-2.5 shadow-[0_-8px_30px_-10px_rgba(16,36,54,0.15)] backdrop-blur-2xl dark:border-white/10 dark:bg-[#060f19]/95 lg:hidden">
        <div className="mx-auto flex max-w-3xl items-center gap-3">
          <div className="min-w-0 flex-1">
            <div className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Byuzuye {stepStatus.completedCount}/{stepStatus.totalSteps}</div>
            <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-200/80 dark:bg-white/10">
              <div className="h-full rounded-full bg-gradient-to-r from-[#FF5D00] via-[#FF7424] to-emerald-500 transition-all duration-700 ease-out" style={{ width: `${stepStatus.progressPercent}%` }} />
            </div>
          </div>
          <SubmitButton saving={saving} onClick={submitListing} compact />
        </div>
      </div>
    </main>
  )
}

/* ───────────── SUBMIT BUTTON (shared) ─────────────
   type="button" + onClick={submitListing} — no form attribute, no native submit.
   This works identically on desktop, tablet, and mobile. */
function SubmitButton({
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
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            <span>Birikoherezwa...</span>
          </>
        ) : (
          <>
            <Icon.Sparkles className="w-4 h-4" />
            <span>Ohereza</span>
            {!compact && <Icon.ArrowRight className="w-4 h-4" />}
          </>
        )}
      </span>
    </button>
  )
}