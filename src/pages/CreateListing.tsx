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

      const { data: profileData } = await supabase
        .from("profiles")
        .select("phone_number")
        .eq("id", user.id)
        .single()

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
    <main className="min-h-screen kg-bg kg-text">
      {/* NAVBAR */}
      <header className="sticky top-0 z-30 kg-header">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          

          <Link
            to="/dashboard"
            className="kg-h-action inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition"
            style={{ border: "1px solid var(--border)", background: "var(--surface)" }}
          >
            ← Dashboard
          </Link>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden py-12 lg:py-14" style={{ background: "var(--bg-secondary)", borderBottom: "1px solid var(--border)" }}>
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full opacity-20 blur-3xl" style={{ background: "var(--primary)" }} />
        <div className="absolute -bottom-32 right-0 h-96 w-96 rounded-full opacity-10 blur-3xl" style={{ background: "var(--primary)" }} />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div
              className="mb-5 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest"
              style={{ background: "var(--soft-bg-hover)", color: "var(--primary)", border: "1px solid var(--border)" }}
            >
              <span className="h-2 w-2 rounded-full" style={{ background: "var(--primary)" }} />
              Gurisha icyo ufite
            </div>

            <h1 className="text-3xl font-black tracking-tight sm:text-5xl kg-text">
              Shyiraho icyo ushaka kugurisha.
              uzuza ibisabwa byose hano
              <span className="mt-1 block kg-gradient-text">
               Abagishaka bakwandikire,Baguhamagare .
              </span>
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-relaxed sm:text-lg kg-text-secondary">
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
            <section className="overflow-hidden rounded-3xl border shadow-sm transition-colors" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
              <div className="border-b px-6 py-6 sm:px-8" style={{ borderColor: "var(--border)" }}>
                <div className="flex items-start gap-4">
                  <div
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl"
                    style={{ background: "var(--soft-bg-hover)", color: "var(--primary)" }}
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-black kg-text">Amakuru y'ikintu</h2>
                    <p className="mt-1 text-sm leading-6 kg-text-muted">
                      Shyiramo amakuru y'ingenzi agaragaza icyo ugurisha.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-6 p-6 sm:p-8">
                <div>
                  <label className="text-sm font-bold kg-text">
                    Izina ry'ikintu <span className="ml-1 text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    placeholder="Urugero: iPhone 15 Pro Max 256GB"
                    className="kg-input mt-2 w-full rounded-2xl px-4 py-3.5 outline-none"
                  />
                </div>

                <div>
                  <label className="text-sm font-bold kg-text">
                    Category <span className="ml-1 text-red-500">*</span>
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    required
                    className="kg-input mt-2 w-full rounded-2xl px-4 py-3.5 outline-none cursor-pointer"
                  >
                    <option value="" style={{ background: "var(--surface)", color: "var(--text)" }}>Hitamo category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id} style={{ background: "var(--surface)", color: "var(--text)" }}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-bold kg-text">Ibisobanuro</label>
                    <span className="text-xs kg-text-muted">{description.length} characters</span>
                  </div>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={6}
                    placeholder="Sobanura neza icyo ugurisha, imimerere yacyo n'ibindi..."
                    className="kg-input mt-2 w-full resize-none rounded-2xl px-4 py-3.5 outline-none"
                  />
                </div>
              </div>
            </section>

            {/* TYPE & PRICE */}
            <section className="overflow-hidden rounded-3xl border shadow-sm transition-colors" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
              <div className="border-b px-6 py-6 sm:px-8" style={{ borderColor: "var(--border)" }}>
                <div className="flex items-start gap-4">
                  <div
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl"
                    style={{ background: "var(--soft-bg-hover)", color: "var(--primary)" }}
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-black kg-text">Uburyo n'igiciro</h2>
                    <p className="mt-1 text-sm leading-6 kg-text-muted">
                      Hitamo niba ari ukugurisha cyangwa gukodesha.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-6 p-6 sm:p-8">
                <div>
                  <label className="text-sm font-bold kg-text">Uburyo bwo gutanga</label>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {[
                      { 
                        value: "sale", 
                        icon: (
                          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: "var(--primary)" }}>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                          </svg>
                        ), 
                        title: "Kugurisha", 
                        description: "Shaka umuguzi" 
                      },
                      { 
                        value: "rent", 
                        icon: (
                          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: "var(--primary)" }}>
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
                          className="rounded-2xl border p-4 text-left transition"
                          style={{
                            background: selected ? "var(--soft-bg-hover)" : "var(--surface)",
                            borderColor: selected ? "var(--primary)" : "var(--border)",
                            boxShadow: selected ? "0 0 0 3px var(--glow-color)" : "none",
                          }}
                        >
                          <div className="flex items-start justify-between">
                            <div className="p-2 rounded-xl shadow-sm" style={{ background: "var(--bg)" }}>{item.icon}</div>
                            {selected && (
                              <span className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-black text-white" style={{ background: "var(--primary)" }}>
                                ✓
                              </span>
                            )}
                          </div>
                          <p className="mt-4 text-sm font-black kg-text">{item.title}</p>
                          <p className="mt-1 text-xs kg-text-muted">{item.description}</p>
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-bold kg-text">Igiciro (Frw)</label>
                    <div className="relative mt-2">
                      <input
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        min="0"
                        placeholder="650000"
                        className="kg-input w-full rounded-2xl px-4 py-3.5 pr-16 outline-none"
                      />
                      <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black kg-text-muted">
                        FRW
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-bold kg-text">Imimerere</label>
                    <select
                      value={condition}
                      onChange={(e) => setCondition(e.target.value)}
                      className="kg-input mt-2 w-full rounded-2xl px-4 py-3.5 outline-none cursor-pointer"
                    >
                      <option value="new" style={{ background: "var(--surface)", color: "var(--text)" }}>Bishya</option>
                      <option value="used" style={{ background: "var(--surface)", color: "var(--text)" }}>Byakoreshejwe</option>
                      <option value="refurbished" style={{ background: "var(--surface)", color: "var(--text)" }}>Byavuguruwe</option>
                    </select>
                  </div>
                </div>
              </div>
            </section>

            {/* LOCATION */}
            <section className="overflow-hidden rounded-3xl border shadow-sm transition-colors" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
              <div className="border-b px-6 py-6 sm:px-8" style={{ borderColor: "var(--border)" }}>
                <div className="flex items-start gap-4">
                  <div
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl"
                    style={{ background: "var(--soft-bg-hover)", color: "var(--primary)" }}
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-black kg-text">Aho giherereye</h2>
                    <p className="mt-1 text-sm leading-6 kg-text-muted">
                      Shyiramo aho ikintu giherereye kugira ngo abaguzi bo hafi babibone.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 sm:p-8">
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <label className="text-sm font-bold kg-text">
                      Province <span className="ml-1 text-red-500">*</span>
                    </label>
                    <input
                      value={province}
                      onChange={(e) => setProvince(e.target.value)}
                      required
                      placeholder="Kigali"
                      className="kg-input mt-2 w-full rounded-2xl px-4 py-3.5 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-bold kg-text">District</label>
                    <input
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      placeholder="Gasabo"
                      className="kg-input mt-2 w-full rounded-2xl px-4 py-3.5 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-bold kg-text">Sector</label>
                    <input
                      value={sector}
                      onChange={(e) => setSector(e.target.value)}
                      placeholder="Remera"
                      className="kg-input mt-2 w-full rounded-2xl px-4 py-3.5 outline-none"
                    />
                  </div>
                </div>

                {formatLocation() && (
                  <div className="mt-5 rounded-2xl px-4 py-3 text-sm flex items-center gap-2 kg-text-secondary" style={{ background: "var(--bg-secondary)" }}>
                    <svg className="w-4 h-4 shrink-0 kg-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    <span>{formatLocation()}</span>
                  </div>
                )}
              </div>
            </section>

            {/* CONTACT PHONE SECTION */}
            <section className="overflow-hidden rounded-3xl border shadow-sm transition-colors" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
              <div className="border-b px-6 py-6 sm:px-8 flex items-center justify-between" style={{ borderColor: "var(--border)" }}>
                <div className="flex items-center gap-4">
                  <div
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl"
                    style={{ background: "var(--soft-bg-hover)", color: "var(--primary)" }}
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-black kg-text">Nimero ya Telefoni</h2>
                    <p className="mt-1 text-sm leading-6 kg-text-muted">
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
                  <div className="w-11 h-6 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all" style={{ background: contactPhone ? "var(--primary)" : "var(--border-strong)" }}></div>
                </label>
              </div>

              {contactPhone && (
                <div className="p-6 sm:p-8 space-y-4">
                  {fetchingPhones ? (
                    <p className="text-xs kg-text-muted">Turimo gushaka nimero zawe zahise...</p>
                  ) : previousNumbers.length > 0 ? (
                    <div className="space-y-3">
                      <label className="text-xs font-black uppercase tracking-wider kg-text-secondary block">
                        Hitamo uburyo bwo gutanga nimero:
                      </label>
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-xs font-bold kg-text cursor-pointer">
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
                            className="w-4 h-4 accent-[var(--primary)]"
                          />
                          <span>Gukoresha nimero yawe wari warakoresheje mbere (Pre-filled)</span>
                        </label>

                        {selectedPhoneOption === "previous" && (
                          <div className="ml-6">
                            <select
                              value={phoneNumber}
                              onChange={(e) => setPhoneNumber(e.target.value)}
                              className="kg-input w-full rounded-2xl px-4 py-3 text-sm font-bold outline-none cursor-pointer"
                            >
                              {previousNumbers.map((item, index) => (
                                <option key={index} value={item.number} style={{ background: "var(--surface)", color: "var(--text)" }}>
                                  {item.number} {index === 0 ? "(Iyaherukaga gukoreshwa)" : ""}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}

                        <label className="flex items-center gap-2 text-xs font-bold kg-text cursor-pointer">
                          <input
                            type="radio"
                            name="phoneOption"
                            value="new"
                            checked={selectedPhoneOption === "new"}
                            onChange={() => {
                              setSelectedPhoneOption("new")
                              setPhoneNumber("")
                            }}
                            className="w-4 h-4 accent-[var(--primary)]"
                          />
                          <span>Andika nimero nshya</span>
                        </label>
                      </div>
                    </div>
                  ) : null}

                  {(selectedPhoneOption === "new" || previousNumbers.length === 0) && (
                    <div>
                      <label className="text-sm font-bold kg-text">
                        Nimero ya telefoni <span className="ml-1 text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="Urugero: +250788000000 cyangwa 0788000000"
                        className="kg-input mt-2 w-full rounded-2xl px-4 py-3.5 outline-none"
                      />
                    </div>
                  )}
                </div>
              )}
            </section>

            {/* PHOTOS */}
            <section className="overflow-hidden rounded-3xl border shadow-sm transition-colors" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
              <div className="border-b px-6 py-6 sm:px-8" style={{ borderColor: "var(--border)" }}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl"
                      style={{ background: "var(--soft-bg-hover)", color: "var(--primary)" }}
                    >
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-xl font-black kg-text">Amafoto</h2>
                      <p className="mt-1 text-sm leading-6 kg-text-muted">
                        Ongeraho amafoto asobanutse kugira ngo abaguzi babone neza icyo ugurisha (Ushobora gushyiramo kugeza kuri 5).
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 sm:p-8 space-y-6">
                <div className="flex flex-wrap gap-4">
                  {images.map((file, index) => (
                    <div key={index} className="relative h-24 w-24 overflow-hidden rounded-2xl border" style={{ borderColor: "var(--border)", background: "var(--bg-secondary)" }}>
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Preview ${index}`}
                        className="h-full w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full text-xs text-white transition"
                        style={{ background: "rgba(0,0,0,0.7)" }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}

                  {images.length < 5 && (
                    <label
                      className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed transition"
                      style={{ borderColor: "var(--border-strong)", background: "var(--soft-bg)" }}
                    >
                      <svg className="w-6 h-6 kg-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      <span className="mt-1 text-[10px] font-bold kg-text-muted">Ongeraho</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageSelect}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>
            </section>

            {/* STATUS MESSAGE */}
            {message && (
              <div
                className="rounded-2xl px-4 py-3 text-sm font-bold border transition-colors"
                style={{
                  background: success ? "var(--success-bg)" : "var(--danger-bg)",
                  borderColor: success ? "var(--success-border)" : "var(--danger-border)",
                  color: success ? "var(--success-text)" : "var(--danger-text)",
                }}
              >
                {message}
              </div>
            )}

            {/* SUBMIT BUTTON */}
            <div className="flex justify-end gap-4">
              <button
                type="submit"
                disabled={saving}
                className="kg-h-sell inline-flex items-center justify-center rounded-2xl px-8 py-4 text-base font-bold transition disabled:opacity-50 cursor-pointer"
              >
                {saving ? "Birimo koherezwa..." : "Emeza Kwamamaza"}
              </button>
            </div>
          </form>

          {/* SIDEBAR TIPS */}
          <aside className="space-y-6">
            <div className="rounded-3xl border p-6 shadow-sm transition-colors" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
              <h3 className="text-base font-black kg-text">💡 Inama zo kwamamaza neza</h3>
              <ul className="mt-4 space-y-3 text-sm kg-text-secondary">
                <li className="flex items-start gap-2">
                  <span className="font-bold" style={{ color: "var(--primary)" }}>•</span>
                  <span>Andika izina ry'ikintu risobanutse neza n'ibara cyangwa ubwoko bwacyo.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold" style={{ color: "var(--primary)" }}>•</span>
                  <span>Shyiraho amafoto meza afashwe ku mucyo kugira ngo abaguzi babyishimire.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold" style={{ color: "var(--primary)" }}>•</span>
                  <span>Emeza neza ko nimero yawe ya telefoni ikora neza kugira ngo bagushake byoroshye.</span>
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </main>
  )
}