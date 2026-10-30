import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"

import { supabase } from "../services/supabase"

type Category = {
  id: string
  name: string
}

type PreviousPhoneOption = {
  number: string
  lastUsedAt: string
}

export default function CreateListing() {
  const navigate = useNavigate()

  const [categories, setCategories] = useState<Category[]>([])
  const [images, setImages] = useState<File[]>([])

  const [title, setTitle] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [listingType, setListingType] = useState("sale")
  const [condition, setCondition] = useState("used")

  const [province, setProvince] = useState("")
  const [district, setDistrict] = useState("")
  const [sector, setSector] = useState("")

  // Contact phone settings
  const [contactPhone, setContactPhone] = useState(true)
  const [phoneNumber, setPhoneNumber] = useState("")
  const [selectedPhoneOption, setSelectedPhoneOption] = useState<"previous" | "new">("previous")
  const [previousNumbers, setPreviousNumbers] = useState<PreviousPhoneOption[]>([])
  const [fetchingPhones, setFetchingPhones] = useState(false)

  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    void loadCategories()
    void loadPreviousPhones()
  }, [])

  async function loadCategories(): Promise<void> {
    try {
      const { data } = await supabase
        .from("categories")
        .select("id, name")
        .eq("is_active", true)
        .order("sort_order", { ascending: true })

      setCategories(data || [])
    } catch (err: unknown) {
      console.error("Failed to load categories:", err)
    }
  }

  async function loadPreviousPhones(): Promise<void> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      setFetchingPhones(true)

      // 1. First attempt to check the profiles table for a saved default phone
      const { data: profileData } = await supabase
        .from("profiles")
        .select("phone_number")
        .eq("id", user.id)
        .single()

      // 2. Fetch any previous phone numbers from past listings
      const { data: listingPhones, error } = await supabase
        .from("listings")
        .select("contact_phone_number, created_at")
        .eq("seller_id", user.id)
        .not("contact_phone_number", "is", null)
        .order("created_at", { ascending: false })

      const uniqueMap = new Map<string, string>()

      if (profileData?.phone_number) {
        const cleaned = profileData.phone_number.trim()
        if (cleaned) {
          uniqueMap.set(cleaned, new Date().toISOString())
        }
      }

      if (!error && listingPhones) {
        listingPhones.forEach((item: { contact_phone_number: string | null; created_at: string }) => {
          if (item.contact_phone_number) {
            const cleaned = item.contact_phone_number.trim()
            if (cleaned && !uniqueMap.has(cleaned)) {
              uniqueMap.set(cleaned, item.created_at)
            }
          }
        })
      }

      const uniqueList: PreviousPhoneOption[] = Array.from(uniqueMap.entries()).map(
        ([number, lastUsedAt]) => ({ number, lastUsedAt })
      )

      setPreviousNumbers(uniqueList)

      // Automatic pre-filling: If previous numbers exist, pre-select the most recent one
      if (uniqueList.length > 0) {
        setPhoneNumber(uniqueList[0].number)
        setSelectedPhoneOption("previous")
      } else {
        setSelectedPhoneOption("new")
      }
    } catch (err: unknown) {
      console.error("Failed to load phone history:", err instanceof Error ? err.message : err)
    } finally {
      setFetchingPhones(false)
    }
  }

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>): void {
    const files = Array.from(e.target.files || [])
    const total = images.length + files.length

    if (total > 5) {
      const allowed = Math.max(0, 5 - images.length)
      setImages((prev) => [...prev, ...files.slice(0, allowed)])
      setMessage("Ushobora kugira amafoto atarenze 5 yose hamwe.")
      setSuccess(false)
      return
    }

    setMessage("")
    setImages((prev) => [...prev, ...files])
  }

  function removeImage(index: number): void {
    setImages((prev) => prev.filter((_, imageIndex) => imageIndex !== index))
  }

  function validatePhone(phone: string): boolean {
    const cleaned = phone.replace(/[\s\-\(\)]/g, "")
    const rwandaRegex = /^(?:\+?250|0)?7[2389]\d{7}$/
    const globalE164Regex = /^\+[1-9]\d{6,14}$/
    return rwandaRegex.test(cleaned) || globalE164Regex.test(cleaned)
  }

  function normalizePhoneNumber(phone: string): string {
    let cleaned = phone.replace(/[\s\-\(\)]/g, "")
    if (cleaned.startsWith("07") && cleaned.length === 10) {
      cleaned = "+250" + cleaned.slice(1)
    } else if (cleaned.startsWith("250") && cleaned.length === 12) {
      cleaned = "+" + cleaned
    }
    return cleaned
  }

  function formatLocation(): string {
    return [sector, district, province].filter(Boolean).join(", ")
  }

  async function uploadImages(listingId: string, userId: string): Promise<void> {
    if (images.length === 0) return

    for (let i = 0; i < images.length; i++) {
      const image = images[i]
      const extension = image.name.split(".").pop()?.toLowerCase() || "jpg"
      const filePath = `${userId}/${listingId}/${crypto.randomUUID()}.${extension}`

      const { error: uploadError } = await supabase.storage
        .from("listing-images")
        .upload(filePath, image, {
          cacheControl: "3600",
          upsert: false,
          contentType: image.type,
        })

      if (uploadError) {
        console.error("Upload Error:", uploadError.message)
        continue
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("listing-images").getPublicUrl(filePath)

      const { error: imageError } = await supabase.from("listing_images").insert({
        listing_id: listingId,
        image_url: publicUrl,
        sort_order: i,
      })

      if (imageError) {
        console.error("Image DB Insert Error:", imageError.message)
      }
    }
  }

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault()

    try {
      setSaving(true)
      setMessage("")
      setSuccess(false)

      if (!title.trim()) {
        setMessage("Andika izina ry'ikintu.")
        return
      }

      if (!categoryId) {
        setMessage("Hitamo category.")
        return
      }

      if (!province.trim()) {
        setMessage("Andika Province.")
        return
      }

      if (contactPhone) {
        if (!phoneNumber.trim()) {
          setMessage("Nyamuneka shyiramo nimero ya telefoni yo guhamagarwa.")
          return
        }
        if (!validatePhone(phoneNumber)) {
          setMessage("Nimero ya telefoni wanditse ntabwo yubahirije imiterere yemewe (+250 cyangwa 07...).")
          return
        }
      }

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        navigate("/login")
        return
      }

      // Create location record
      const { data: location, error: locationError } = await supabase
        .from("locations")
        .insert({
          province: province.trim(),
          district: district.trim() || null,
          sector: sector.trim() || null,
        })
        .select()
        .single()

      if (locationError) throw locationError

      const finalNormalizedPhone = contactPhone && phoneNumber.trim() ? normalizePhoneNumber(phoneNumber.trim()) : null
      const parsedPrice: number | null = price.trim() !== "" ? Number(price) : null

      // Insert new listing
      const { data: newListing, error: listingError } = await supabase
        .from("listings")
        .insert({
          seller_id: user.id,
          title: title.trim(),
          category_id: categoryId,
          location_id: location.id,
          description: description.trim() || null,
          price: parsedPrice,
          listing_type: listingType,
          condition: condition,
          contact_phone: contactPhone,
          contact_phone_number: finalNormalizedPhone,
          contact_chat: true,
          status: "active",
        })
        .select("id")
        .single()

      if (listingError) throw listingError

      // Upload selected images
      await uploadImages(newListing.id, user.id)

      setSuccess(true)
      setMessage("Kwamamaza ryawe gushyizweho neza!")

      setTimeout(() => {
        navigate(`/listings/${newListing.id}`)
      }, 1200)
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Habaye ikibazo mu gushyiraho kwamamaza."
      console.error(errorMsg)
      setSuccess(false)
      setMessage("Habaye ikibazo mu gushyiraho kwamamaza. Ongera ugerageze.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">
      {/* NAVBAR */}
      <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" className="text-xl font-black tracking-tight text-slate-950">
            KUGURISHA
            <span className="text-blue-600">.COM</span>
          </Link>

          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
          >
            ← Dashboard
          </Link>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden bg-slate-950">
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-blue-600/20 blur-3xl" />
        <div className="absolute -bottom-32 right-0 h-96 w-96 rounded-full bg-indigo-600/20 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-14">
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-widest text-blue-300">
              <span className="h-2 w-2 rounded-full bg-blue-400" />
              Gurisha icyo ufite
            </div>

            <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl">
              Shyiraho Kwamamaza Gushya.
              <span className="mt-1 block text-blue-400">
                Ugere ku baguzi benshi mu Rwanda.
              </span>
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
              Uzuza amakuru y'ikintu wifuza kugurisha cyangwa gukodesha. Ni byiza kandi byihuta.
            </p>
          </div>
        </div>
      </section>

      {/* CONTENT */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* BASIC INFORMATION */}
            <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-6 py-6 sm:px-8">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-950">Amakuru y'ikintu</h2>
                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      Shyiramo amakuru y'ingenzi agaragaza icyo ugurisha.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-6 p-6 sm:p-8">
                <div>
                  <label className="text-sm font-bold text-slate-800">
                    Izina ry'ikintu <span className="ml-1 text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    placeholder="Urugero: iPhone 15 Pro Max 256GB"
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  />
                </div>

                <div>
                  <label className="text-sm font-bold text-slate-800">
                    Category <span className="ml-1 text-red-500">*</span>
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    required
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  >
                    <option value="">Hitamo category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-bold text-slate-800">Ibisobanuro</label>
                    <span className="text-xs text-slate-400">{description.length} characters</span>
                  </div>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={6}
                    placeholder="Sobanura neza icyo ugurisha, imimerere yacyo n'ibindi..."
                    className="mt-2 w-full resize-none rounded-2xl border border-slate-200 px-4 py-3.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  />
                </div>
              </div>
            </section>

            {/* TYPE & PRICE */}
            <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-6 py-6 sm:px-8">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-950">Uburyo n'igiciro</h2>
                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      Hitamo niba ari ukugurisha cyangwa gukodesha.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-6 p-6 sm:p-8">
                <div>
                  <label className="text-sm font-bold text-slate-800">Uburyo bwo gutanga</label>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {[
                      { 
                        value: "sale", 
                        icon: (
                          <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                          </svg>
                        ), 
                        title: "Kugurisha", 
                        description: "Shaka umuguzi" 
                      },
                      { 
                        value: "rent", 
                        icon: (
                          <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                          </svg>
                        ), 
                        title: "Gukodesha", 
                        description: "Kodesha icyo ufite" 
                      },
                    ].map((item) => {
                      const selected = listingType === item.value
                      return (
                        <button
                          key={item.value}
                          type="button"
                          onClick={() => setListingType(item.value)}
                          className={`rounded-2xl border p-4 text-left transition ${
                            selected
                              ? "border-blue-500 bg-blue-50 ring-4 ring-blue-500/10"
                              : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="p-2 bg-white rounded-xl shadow-sm">{item.icon}</div>
                            {selected && (
                              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-black text-white">
                                ✓
                              </span>
                            )}
                          </div>
                          <p className="mt-4 text-sm font-black text-slate-900">{item.title}</p>
                          <p className="mt-1 text-xs text-slate-500">{item.description}</p>
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-bold text-slate-800">Igiciro (Frw)</label>
                    <div className="relative mt-2">
                      <input
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        min="0"
                        placeholder="650000"
                        className="w-full rounded-2xl border border-slate-200 px-4 py-3.5 pr-16 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                      />
                      <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400">
                        FRW
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-bold text-slate-800">Imimerere</label>
                    <select
                      value={condition}
                      onChange={(e) => setCondition(e.target.value)}
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                    >
                      <option value="new">Bishya</option>
                      <option value="used">Byakoreshejwe</option>
                      <option value="refurbished">Byavuguruwe</option>
                    </select>
                  </div>
                </div>
              </div>
            </section>

            {/* LOCATION */}
            <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-6 py-6 sm:px-8">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-950">Aho giherereye</h2>
                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      Shyiramo aho ikintu giherereye kugira ngo abaguzi bo hafi babibone.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 sm:p-8">
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <label className="text-sm font-bold text-slate-800">
                      Province <span className="ml-1 text-red-500">*</span>
                    </label>
                    <input
                      value={province}
                      onChange={(e) => setProvince(e.target.value)}
                      required
                      placeholder="Kigali"
                      className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3.5 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-bold text-slate-800">District</label>
                    <input
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      placeholder="Gasabo"
                      className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3.5 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-bold text-slate-800">Sector</label>
                    <input
                      value={sector}
                      onChange={(e) => setSector(e.target.value)}
                      placeholder="Remera"
                      className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3.5 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                    />
                  </div>
                </div>

                {formatLocation() && (
                  <div className="mt-5 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600 flex items-center gap-2">
                    <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    <span>{formatLocation()}</span>
                  </div>
                )}
              </div>
            </section>

            {/* CONTACT PHONE SECTION WITH AUTOMATIC PRE-FILLING */}
            <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-6 py-6 sm:px-8 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-950">Nimero ya Telefoni</h2>
                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      Emerera abaguzi kukuvugisha kuri telefoni.
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={contactPhone}
                    onChange={(e) => setContactPhone(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              {contactPhone && (
                <div className="p-6 sm:p-8 space-y-4">
                  {fetchingPhones ? (
                    <p className="text-xs text-slate-400">Turimo gushaka nimero zawe zahise...</p>
                  ) : previousNumbers.length > 0 ? (
                    <div className="space-y-3">
                      <label className="text-xs font-black uppercase tracking-wider text-slate-700 block">
                        Hitamo uburyo bwo gutanga nimero:
                      </label>
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
                          <input
                            type="radio"
                            name="phoneOption"
                            value="previous"
                            checked={selectedPhoneOption === "previous"}
                            onChange={() => {
                              setSelectedPhoneOption("previous")
                              if (previousNumbers.length > 0) {
                                setPhoneNumber(previousNumbers[0].number)
                              }
                            }}
                            className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                          />
                          <span>Gukoresha nimero yawe wari warakoresheje mbere (Pre-filled)</span>
                        </label>

                        {selectedPhoneOption === "previous" && (
                          <div className="ml-6">
                            <select
                              value={phoneNumber}
                              onChange={(e) => setPhoneNumber(e.target.value)}
                              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-900 outline-none"
                            >
                              {previousNumbers.map((item, index) => (
                                <option key={index} value={item.number}>
                                  {item.number} {index === 0 ? "(Iyaherukaga gukoreshwa)" : ""}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}

                        <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
                          <input
                            type="radio"
                            name="phoneOption"
                            value="new"
                            checked={selectedPhoneOption === "new"}
                            onChange={() => {
                              setSelectedPhoneOption("new")
                              setPhoneNumber("")
                            }}
                            className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                          />
                          <span>Andika nimero nshya</span>
                        </label>
                      </div>
                    </div>
                  ) : null}

                  {(selectedPhoneOption === "new" || previousNumbers.length === 0) && (
                    <div>
                      <label className="text-sm font-bold text-slate-800">
                        Nimero ya telefoni <span className="ml-1 text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="Urugero: +250788000000 cyangwa 0788000000"
                        className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3.5 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                      />
                    </div>
                  )}
                </div>
              )}
            </section>

            {/* PHOTOS */}
            <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-6 py-6 sm:px-8">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-purple-50 text-purple-600">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-slate-950">Amafoto</h2>
                      <p className="mt-1 text-sm leading-6 text-slate-500">
                        Ongeraho amafoto asobanutse meza.
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-black text-slate-500">
                    {images.length}/5
                  </span>
                </div>
              </div>

              <div className="p-6 sm:p-8">
                <label
                  htmlFor="listing-images"
                  className="group flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center transition hover:border-blue-400 hover:bg-blue-50/40"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-slate-600 shadow-sm transition group-hover:scale-105">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <h3 className="mt-4 text-sm font-black text-slate-950">Ongeraho amafoto</h3>
                  <p className="mt-1 text-xs text-slate-500">Ushobora gushyiraho amafoto agera kuri 5.</p>
                  <span className="mt-4 rounded-xl bg-slate-950 px-4 py-2 text-xs font-bold text-white group-hover:bg-blue-600">
                    Hitamo amafoto
                  </span>
                  <input
                    id="listing-images"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                </label>

                {images.length > 0 && (
                  <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
                    {images.map((image, index) => (
                      <div
                        key={`${image.name}-${index}`}
                        className="group relative aspect-square overflow-hidden rounded-2xl border border-slate-200 bg-slate-100"
                      >
                        <img
                          src={URL.createObjectURL(image)}
                          alt={`Preview ${index + 1}`}
                          className="h-full w-full object-cover"
                        />
                        {index === 0 && (
                          <div className="absolute left-2 top-2 rounded-lg bg-slate-950/80 px-2 py-1 text-[10px] font-black text-white backdrop-blur">
                            MAIN
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-red-600 text-xs font-black text-white shadow-lg transition hover:bg-red-700"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>

            {message && (
              <div className={`p-4 rounded-2xl text-sm font-bold ${success ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                {message}
              </div>
            )}

            <div className="flex justify-end gap-4">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-8 py-4 text-sm font-bold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? "Birimo koherezwa..." : "Shyiraho Kwamamaza"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  )
}