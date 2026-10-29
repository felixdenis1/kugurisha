import { useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"

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

  // Contact phone settings
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

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        navigate("/login")
        return
      }

      const { data: listing, error } = await supabase
        .from("listings")
        .select(`
          id,
          seller_id,
          title,
          description,
          price,
          listing_type,
          condition,
          category_id,
          location_id,
          contact_phone,
          contact_phone_number,
          locations (
            province,
            district,
            sector
          )
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
      setListingType(listing.listing_type || "sale")
      setCondition(listing.condition || "used")
      setCategoryId(listing.category_id || "")
      setContactPhone(listing.contact_phone ?? true)
      setPhoneNumber(listing.contact_phone_number || "")

      // Strict type guard for location join data
      let location: LocationData | null = null
      if (listing.locations) {
        if (Array.isArray(listing.locations)) {
          location = (listing.locations[0] as unknown) as LocationData
        } else {
          location = (listing.locations as unknown) as LocationData
        }
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
      const {
        data: { user },
      } = await supabase.auth.getUser()

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
            if (cleaned && !uniqueMap.has(cleaned)) {
              uniqueMap.set(cleaned, item.created_at)
            }
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
    const confirmed = window.confirm("Urashaka gusiba iri foto?")
    if (!confirmed) return

    const { error } = await supabase
      .from("listing_images")
      .delete()
      .eq("id", image.id)

    if (error) {
      console.error(error)
      setSuccess(false)
      setMessage(`Ntibyashobotse gusiba ifoto: ${error.message}`)
      return
    }

    setExistingImages((current) => current.filter((item) => item.id !== image.id))
    setMessage("")
  }

  function removeNewImage(index: number): void {
    setNewImages((current) => current.filter((_, imageIndex) => imageIndex !== index))
  }

  async function uploadNewImages(): Promise<void> {
    if (!id || newImages.length === 0) return

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error("Ugomba kwinjira.")
    }

    const startOrder = existingImages.length

    for (let i = 0; i < newImages.length; i++) {
      const image = newImages[i]
      const extension = image.name.split(".").pop()?.toLowerCase() || "jpg"
      const filePath = `${user.id}/${id}/${crypto.randomUUID()}.${extension}`

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
        listing_id: id,
        image_url: publicUrl,
        sort_order: startOrder + i,
      })

      if (imageError) {
        console.error("Image DB Insert Error:", imageError.message)
      }
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

  async function handleSave(e: React.FormEvent): Promise<void> {
    e.preventDefault()

    if (!id) return

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

      // Update location
      const { data: listingData, error: listingFetchError } = await supabase
        .from("listings")
        .select("location_id")
        .eq("id", id)
        .eq("seller_id", user.id)
        .single()

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
          .select()
          .single()

        if (error) throw error

        const { error: updateLocationError } = await supabase
          .from("listings")
          .update({ location_id: location.id })
          .eq("id", id)
          .eq("seller_id", user.id)

        if (updateLocationError) throw updateLocationError
      }

      const finalNormalizedPhone = contactPhone && phoneNumber.trim() ? normalizePhoneNumber(phoneNumber.trim()) : null
      const parsedPrice: number | null = listingType === "free" ? null : price.trim() !== "" ? Number(price) : null

      // Update listing
      const { error: updateError } = await supabase
        .from("listings")
        .update({
          title: title.trim(),
          category_id: categoryId,
          description: description.trim() || null,
          price: parsedPrice,
          listing_type: listingType,
          condition: listingType === "free" ? "not_applicable" : condition,
          contact_phone: contactPhone,
          contact_phone_number: finalNormalizedPhone,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .eq("seller_id", user.id)

      if (updateError) throw updateError

      // Upload additional images
      await uploadNewImages()

      setSuccess(true)
      setMessage("Kwamamaza ryawe ryavuguruwe neza!")
      setNewImages([]) // Safely pass empty array to clear state

      await loadListing()
      await loadPreviousPhones()
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Habaye ikibazo mu kubika impinduka."
      console.error(errorMsg)
      setSuccess(false)
      setMessage("Habaye ikibazo mu kubika impinduka.")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="flex min-h-screen items-center justify-center px-6">
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-3xl shadow-sm">
              ⏳
            </div>
            <h2 className="mt-5 text-lg font-black text-slate-900">
              Turimo kuzana listing...
            </h2>
            <p className="mt-2 text-sm text-slate-500">Tegereza akanya gato.</p>
          </div>
        </div>
      </main>
    )
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
              Seller dashboard
            </div>

            <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl">
              Hindura listing yawe.
              <span className="mt-1 block text-blue-400">
                Gumana amakuru agezweho.
              </span>
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
              Vugurura amakuru, igiciro, amafoto cyangwa aho ikintu giherereye kugira ngo listing yawe ikomeze kuba nziza ku baguzi.
            </p>
          </div>
        </div>
      </section>

      {/* CONTENT */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
          <form onSubmit={handleSave} className="space-y-6">
            {/* BASIC INFORMATION */}
            <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-6 py-6 sm:px-8">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-lg">
                    📝
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-950">Amakuru y'ikintu</h2>
                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      Hindura amakuru y'ingenzi ya listing yawe.
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
                    placeholder="Urugero: iPhone 15 Pro"
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
                    placeholder="Sobanura neza icyo ugurisha..."
                    className="mt-2 w-full resize-none rounded-2xl border border-slate-200 px-4 py-3.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  />
                </div>
              </div>
            </section>

            {/* TYPE & PRICE */}
            <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-6 py-6 sm:px-8">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-lg">
                    💰
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-950">Uburyo n'igiciro</h2>
                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      Hindura uburyo listing itangwa n'igiciro.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-6 p-6 sm:p-8">
                <div>
                  <label className="text-sm font-bold text-slate-800">Uburyo bwo gutanga</label>
                  <div className="mt-3 grid gap-3 sm:grid-cols-3">
                    {[
                      { value: "sale", icon: "🏷️", title: "Kugurisha", description: "Shaka umuguzi" },
                      { value: "rent", icon: "🔑", title: "Gukodesha", description: "Kodesha icyo ufite" },
                      { value: "free", icon: "🎁", title: "Ubuntu", description: "Gutanga ubuntu" },
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
                            <span className="text-2xl">{item.icon}</span>
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

                {listingType !== "free" && (
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
                )}
              </div>
            </section>

            {/* LOCATION */}
            <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-6 py-6 sm:px-8">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-lg">
                    📍
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-950">Aho giherereye</h2>
                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      Hindura aho ikintu giherereye.
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
                  <div className="mt-5 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                    <span className="mr-2">📍</span>
                    {formatLocation()}
                  </div>
                )}
              </div>
            </section>

            {/* CONTACT PHONE SECTION */}
            <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-6 py-6 sm:px-8 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-lg">
                    📞
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-950">Nimero ya Telefoni</h2>
                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      Emerera abaguzi kukuvugisha kuri telefoni kuri iyi listing.
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
                          <span>Gukoresha nimero yawe wari warakoresheje mbere</span>
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
                        className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                      />
                    </div>
                  )}
                </div>
              )}
            </section>

            {/* EXISTING PHOTOS */}
            <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-6 py-6 sm:px-8">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-purple-50 text-lg">
                      📸
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-slate-950">Amafoto</h2>
                      <p className="mt-1 text-sm leading-6 text-slate-500">
                        Gucunga amafoto ari kuri listing yawe.
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-black text-slate-500">
                    {existingImages.length + newImages.length}/5
                  </span>
                </div>
              </div>

              <div className="p-6 sm:p-8">
                {existingImages.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-8 text-center">
                    <div className="text-3xl">🖼️</div>
                    <p className="mt-3 text-sm font-bold text-slate-700">Nta foto iri kuri listing.</p>
                    <p className="mt-1 text-xs text-slate-400">Ongeraho amafoto hepfo.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
                    {existingImages.map((image, index) => (
                      <div
                        key={image.id}
                        className="group relative aspect-square overflow-hidden rounded-2xl border border-slate-200 bg-slate-100"
                      >
                        <img
                          src={image.image_url}
                          alt={`Ifoto ${index + 1}`}
                          className="h-full w-full object-cover"
                        />
                        {index === 0 && (
                          <div className="absolute left-2 top-2 rounded-lg bg-slate-950/80 px-2 py-1 text-[10px] font-black text-white backdrop-blur">
                            MAIN
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => deleteExistingImage(image)}
                          className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-red-600 text-sm font-black text-white opacity-100 shadow-lg transition hover:bg-red-700 sm:opacity-0 sm:group-hover:opacity-100"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* ADD IMAGES */}
                <div className="mt-8">
                  <label
                    htmlFor="new-listing-images"
                    className="group flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center transition hover:border-blue-400 hover:bg-blue-50/40"
                  >
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm transition group-hover:scale-105">
                      +
                    </div>
                    <h3 className="mt-4 text-sm font-black text-slate-900">Ongeraho andi mafoto</h3>
                    <p className="mt-1 text-xs text-slate-500">Amafoto yose hamwe ntarenze 5.</p>
                    <span className="mt-4 rounded-xl bg-slate-950 px-4 py-2 text-xs font-bold text-white group-hover:bg-blue-600">
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
                        <p className="text-sm font-bold text-slate-800">Amafoto mashya</p>
                        <span className="text-xs text-slate-400">{newImages.length} mashya</span>
                      </div>
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
                        {newImages.map((image, index) => (
                          <div
                            key={`${image.name}-${index}`}
                            className="group relative aspect-square overflow-hidden rounded-2xl border border-slate-200 bg-slate-100"
                          >
                            <img
                              src={URL.createObjectURL(image)}
                              alt={`New Preview ${index + 1}`}
                              className="h-full w-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => removeNewImage(index)}
                              className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-red-600 text-xs font-black text-white shadow-lg transition hover:bg-red-700"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* MESSAGE ALERT */}
            {message && (
              <div
                className={`rounded-2xl border p-4 text-xs ${
                  success
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                    : "border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400"
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <span className="text-sm font-black">{success ? "✓" : "!"}</span>
                  <div>
                    <p className="font-bold uppercase tracking-wider">
                      {success ? "Byagenze neza" : "Hari ikibazo"}
                    </p>
                    <p className="mt-0.5 font-medium leading-relaxed">{message}</p>
                  </div>
                </div>
              </div>
            )}

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={saving}
              className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-800 px-6 py-4 text-sm font-black text-white shadow-xl shadow-blue-600/25 transition-all hover:scale-[1.01] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  <span>Turimo kubika...</span>
                </>
              ) : (
                <>
                  <span>Bika Impinduka</span>
                  <span>→</span>
                </>
              )}
            </button>
          </form>

          {/* SIDEBAR PREVIEW */}
          <aside className="space-y-6">
            <div className="sticky top-24 overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-900">
                Inshamake ya Listing
              </h3>

              <div className="mt-5 space-y-4 text-xs">
                <div>
                  <span className="font-bold text-slate-400">IZINA:</span>
                  <p className="mt-1 font-bold text-slate-800">{title || "Ntazina ryashyizweho"}</p>
                </div>

                <div>
                  <span className="font-bold text-slate-400">IGICIRO:</span>
                  <p className="mt-1 font-bold text-emerald-600 text-sm">
                    {listingType === "free" ? "Ubuntu" : price ? `${Number(price).toLocaleString()} Frw` : "Nta giciro"}
                  </p>
                </div>

                <div>
                  <span className="font-bold text-slate-400">AHOHEREREYE:</span>
                  <p className="mt-1 font-bold text-slate-800">{formatLocation() || "Ntihavuzwe"}</p>
                </div>

                <div>
                  <span className="font-bold text-slate-400">TELEFONI YO GUHAMAGARWA:</span>
                  <p className="mt-1 font-bold text-slate-800">
                    {contactPhone && phoneNumber ? phoneNumber : "Ntihariho / Ntibyemewe"}
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  )
}