import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { supabase } from "../services/supabase"

type Category = {
  id: string
  name: string
}

export default function CreateListing() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [message, setMessage] = useState("")
  const [success, setSuccess] = useState(false)

  const [title, setTitle] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [listingType, setListingType] = useState("sale")
  const [condition, setCondition] = useState("used")

  const [province, setProvince] = useState("")
  const [district, setDistrict] = useState("")
  const [sector, setSector] = useState("")

  const [images, setImages] = useState<File[]>([])

  useEffect(() => {
    void loadCategories()
  }, [])

  async function loadCategories() {
    setLoadingCategories(true)

    const { data, error } = await supabase
      .from("categories")
      .select("id, name")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })

    if (error) {
      setMessage(error.message)
      setSuccess(false)
    } else {
      setCategories(data || [])
    }

    setLoadingCategories(false)
  }

  function handleImagesChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])

    if (files.length > 5) {
      setMessage("Hitamo amafoto atarenze 5.")
      setSuccess(false)
      setImages(files.slice(0, 5))
      return
    }

    setMessage("")
    setImages(files)
  }

  function removeImage(index: number) {
    setImages((current) =>
      current.filter((_, imageIndex) => imageIndex !== index)
    )
  }

  function formatLocation() {
    return [sector, district, province]
      .filter(Boolean)
      .join(", ")
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    setLoading(true)
    setMessage("")
    setSuccess(false)

    try {
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

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setMessage("Ugomba kubanza kwinjira muri konti yawe.")
        return
      }

      // 1. CREATE LOCATION
      const {
        data: location,
        error: locationError,
      } = await supabase
        .from("locations")
        .insert({
          province: province.trim(),
          district: district.trim() || null,
          sector: sector.trim() || null,
        })
        .select()
        .single()

      if (locationError) {
        console.error(locationError)
        setMessage(`Location error: ${locationError.message}`)
        return
      }

      // 2. CREATE LISTING
      const {
        data: listing,
        error: listingError,
      } = await supabase
        .from("listings")
        .insert({
          seller_id: user.id,
          category_id: categoryId,
          location_id: location.id,
          title: title.trim(),
          description: description.trim() || null,
          price: price ? Number(price) : null,
          currency: "RWF",
          listing_type: listingType,
          condition: condition,
          status: "active",
          contact_phone: true,
          contact_chat: true,
        })
        .select()
        .single()

      if (listingError) {
        console.error(listingError)
        setMessage(`Listing error: ${listingError.message}`)
        return
      }

      // 3. UPLOAD IMAGES
      let uploadedImages = 0

      for (let i = 0; i < images.length; i++) {
        const image = images[i]

        const extension =
          image.name.split(".").pop()?.toLowerCase() || "jpg"

        const filePath = `${user.id}/${listing.id}/${crypto.randomUUID()}.${extension}`

        const { error: uploadError } = await supabase.storage
          .from("listing-images")
          .upload(filePath, image, {
            cacheControl: "3600",
            upsert: false,
            contentType: image.type,
          })

        if (uploadError) {
          console.error("Image upload error:", uploadError)
          continue
        }

        const {
          data: { publicUrl },
        } = supabase.storage
          .from("listing-images")
          .getPublicUrl(filePath)

        // 4. SAVE IMAGE URL
        const { error: imageError } = await supabase
          .from("listing_images")
          .insert({
            listing_id: listing.id,
            image_url: publicUrl,
            sort_order: i,
          })

        if (imageError) {
          console.error("Listing image database error:", imageError)
          continue
        }

        uploadedImages++
      }

      // 5. SUCCESS
      setSuccess(true)

      if (images.length > 0 && uploadedImages === 0) {
        setMessage(
          "Kwamamaza byawe byashyizwe ku isoko, ariko amafoto ntiyabashije kubikwa."
        )
      } else if (images.length > uploadedImages) {
        setMessage(
          `Kwamamaza byawe byashyizwe ku isoko neza. Amafoto ${uploadedImages}/${images.length} ni yo yabitswe.`
        )
      } else {
        setMessage("Kwamamaza byawe byashyizwe ku isoko neza!")
      }

      // RESET FORM
      setTitle("")
      setCategoryId("")
      setDescription("")
      setPrice("")
      setListingType("sale")
      setCondition("used")
      setProvince("")
      setDistrict("")
      setSector("")
      setImages([])
    } catch (error) {
      console.error(error)
      setSuccess(false)
      setMessage("Habaye ikibazo kitateganyijwe. Ongera ugerageze.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden kg-bg kg-text transition-colors duration-300">
      {/* GLOBAL BACKGROUND ACCENTS */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[8%] top-[8%] h-[34rem] w-[34rem] rounded-full bg-emerald-600/10 dark:bg-emerald-500/10 blur-[120px]" />
        <div className="absolute right-[4%] top-[22%] h-[32rem] w-[32rem] rounded-full bg-slate-500/10 blur-[120px]" />
        <div className="absolute bottom-[5%] left-[35%] h-[36rem] w-[36rem] rounded-full bg-emerald-700/10 blur-[130px]" />
      </div>

      {/* TOP NAV */}
      <header className="sticky top-0 z-40 border-b kg-border kg-surface backdrop-blur-2xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
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

          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-2xl border kg-border kg-surface px-4 py-2 text-xs font-bold kg-text shadow-sm transition hover:border-emerald-500"
          >
            <span>←</span>
            Garuka
          </Link>
        </div>
      </header>

      {/* HERO BANNER */}
      <section className="relative overflow-hidden bg-slate-950 text-white py-10 px-4 sm:px-6">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-emerald-400 backdrop-blur-md">
            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/50" />
            Umwanya wo kugurisha
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
            Shyiraho Ikicuruzwa gishya
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-400 max-w-lg mx-auto">
            Andika amakuru y'ingenzi, shyiramo amafoto, maze ugere ku baguzi benshi mu Rwanda.
          </p>
        </div>
      </section>

      {/* FORM CONTENT */}
      <div className="relative z-10 mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:py-10">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* 1. BASIC INFO */}
          <section className="overflow-hidden rounded-3xl border kg-border kg-surface shadow-xl backdrop-blur-xl">
            <div className="border-b kg-border px-6 py-5 sm:px-7 flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <div>
                <h2 className="text-base font-black kg-text">Amakuru y'ikintu</h2>
                <p className="text-xs kg-text-secondary">Izina, icyiciro n'ibisobanuro birambuye.</p>
              </div>
            </div>

            <div className="space-y-5 p-6 sm:p-7">
              <div>
                <label className="text-xs font-black uppercase tracking-wider kg-text">
                  Izina ry'ikintu <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  placeholder="Urugero: iPhone 15 Pro Max"
                  className="mt-2 w-full rounded-xl border kg-border kg-input px-4 py-3 text-sm font-bold outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-black uppercase tracking-wider kg-text">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  required
                  disabled={loadingCategories}
                  className="mt-2 w-full rounded-xl border kg-border kg-input px-4 py-3 text-sm font-bold outline-none disabled:opacity-50"
                >
                  <option value="">
                    {loadingCategories ? "Turimo kuzana categories..." : "Hitamo category"}
                  </option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id} className="kg-surface kg-text">
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black uppercase tracking-wider kg-text">Ibisobanuro</label>
                  <span className="text-[11px] kg-text-muted">{description.length} chars</span>
                </div>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  placeholder="Sobanura neza uko ikintu kimeze, igihe cyakoreshejwe..."
                  className="mt-2 w-full resize-none rounded-xl border kg-border kg-input px-4 py-3 text-sm font-medium outline-none"
                />
              </div>
            </div>
          </section>

          {/* 2. MEDIA UPLOAD */}
          <section className="overflow-hidden rounded-3xl border kg-border kg-surface shadow-xl backdrop-blur-xl">
            <div className="border-b kg-border px-6 py-5 sm:px-7 flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-base font-black kg-text">Amafoto</h2>
                <p className="text-xs kg-text-secondary">Shyiraho amafoto meza (kugeza kuri 5).</p>
              </div>
            </div>

            <div className="p-6 sm:p-7">
              <label
                htmlFor="listing-images"
                className="group flex cursor-pointer items-center justify-between rounded-2xl border-2 border-dashed kg-border kg-bg-secondary p-5 transition hover:border-emerald-500"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl kg-surface text-xl shadow-sm transition group-hover:scale-105">
                    📷
                  </div>
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider kg-text">Ongeramo amafoto y'ikintu</h3>
                    <p className="mt-0.5 text-xs kg-text-secondary">Kanda hano cyangwa ushyire amafoto hano</p>
                  </div>
                </div>
                <span className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition group-hover:bg-emerald-700">
                  Hitamo
                </span>
                <input
                  id="listing-images"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImagesChange}
                  className="hidden"
                />
              </label>

              {images.length > 0 && (
                <div className="mt-5">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-[11px] font-bold uppercase tracking-wider kg-text-muted">Amafoto wahisemo</p>
                    <span className="rounded-full kg-bg-secondary px-2.5 py-0.5 text-[11px] font-bold kg-text-muted">
                      {images.length}/5
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
                    {images.map((image, index) => (
                      <div key={`${image.name}-${index}`} className="group relative aspect-square overflow-hidden rounded-xl border kg-border kg-bg-secondary">
                        <img
                          src={URL.createObjectURL(image)}
                          alt={`Preview ${index + 1}`}
                          className="h-full w-full object-cover"
                        />
                        {index === 0 && (
                          <div className="absolute left-1.5 top-1.5 rounded bg-emerald-600 px-1.5 py-0.5 text-[8px] font-black text-white">
                            MAIN
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-xs font-black text-white transition hover:bg-red-600"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* 3. SALE DETAILS & PRICING */}
          <section className="overflow-hidden rounded-3xl border kg-border kg-surface shadow-xl backdrop-blur-xl">
            <div className="border-b kg-border px-6 py-5 sm:px-7 flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-base font-black kg-text">Uburyo n'igiciro</h2>
                <p className="text-xs kg-text-secondary">Hitamo niba ugurisha cyangwa ukodesha hamwe n'igiciro.</p>
              </div>
            </div>

            <div className="space-y-5 p-6 sm:p-7">
              <div>
                <label className="text-xs font-black uppercase tracking-wider kg-text">Uburyo bwo gutanga</label>
                <div className="mt-2.5 grid gap-3 sm:grid-cols-2">
                  {[
                    { value: "sale", icon: "🏷️", title: "Kugurisha", desc: "Shaka umuguzi" },
                    { value: "rent", icon: "🔑", title: "Gukodesha", desc: "Kodesha icyo ufite" },
                  ].map((item) => {
                    const selected = listingType === item.value
                    return (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() => setListingType(item.value)}
                        className={`rounded-2xl border p-3.5 text-left transition flex items-center gap-3 ${
                          selected
                            ? "border-emerald-600 bg-emerald-500/10 ring-2 ring-emerald-500/20"
                            : "kg-border kg-surface hover:border-emerald-500/50"
                        }`}
                      >
                        <span className="text-xl">{item.icon}</span>
                        <div className="flex-1">
                          <p className="text-xs font-black uppercase tracking-wider kg-text">{item.title}</p>
                          <p className="text-[11px] kg-text-secondary">{item.desc}</p>
                        </div>
                        {selected && (
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-black text-white">
                            ✓
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-black uppercase tracking-wider kg-text">Igiciro (Frw)</label>
                  <div className="relative mt-2">
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="650000"
                      min="0"
                      className="w-full rounded-xl border kg-border kg-input px-4 py-3 pr-16 text-sm font-bold outline-none"
                    />
                    <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black kg-text-muted">
                      FRW
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-black uppercase tracking-wider kg-text">Imimerere y'ikintu</label>
                  <select
                    value={condition}
                    onChange={(e) => setCondition(e.target.value)}
                    className="mt-2 w-full rounded-xl border kg-border kg-input px-4 py-3 text-sm font-bold outline-none"
                  >
                    <option value="new" className="kg-surface kg-text">Bishya</option>
                    <option value="used" className="kg-surface kg-text">Byakoreshejwe</option>
                    <option value="refurbished" className="kg-surface kg-text">Byavuguruwe</option>
                  </select>
                </div>
              </div>
            </div>
          </section>

          {/* 4. LOCATION */}
          <section className="overflow-hidden rounded-3xl border kg-border kg-surface shadow-xl backdrop-blur-xl">
            <div className="border-b kg-border px-6 py-5 sm:px-7 flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-base font-black kg-text">Aho ikintu giherereye</h2>
                <p className="text-xs kg-text-secondary">Province, District na Sector.</p>
              </div>
            </div>

            <div className="p-6 sm:p-7">
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="text-xs font-black uppercase tracking-wider kg-text">
                    Province <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    required
                    placeholder="Kigali"
                    className="mt-2 w-full rounded-xl border kg-border kg-input px-4 py-3 text-sm font-bold outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-black uppercase tracking-wider kg-text">District</label>
                  <input
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder="Gasabo"
                    className="mt-2 w-full rounded-xl border kg-border kg-input px-4 py-3 text-sm font-bold outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-black uppercase tracking-wider kg-text">Sector</label>
                  <input
                    type="text"
                    value={sector}
                    onChange={(e) => setSector(e.target.value)}
                    placeholder="Remera"
                    className="mt-2 w-full rounded-xl border kg-border kg-input px-4 py-3 text-sm font-bold outline-none"
                  />
                </div>
              </div>

              {formatLocation() && (
                <div className="mt-4 rounded-xl kg-bg-secondary px-4 py-2.5 text-xs font-bold kg-text-secondary flex items-center gap-2">
                  <span>📍</span>
                  <span>{formatLocation()}</span>
                </div>
              )}
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
            disabled={loading || loadingCategories}
            className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-700 to-emerald-900 px-6 py-4 text-sm font-black text-white shadow-xl shadow-emerald-700/25 transition-all hover:scale-[1.01] hover:shadow-emerald-700/40 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                <span>Turimo kohereza...</span>
              </>
            ) : (
              <>
                <span>Ohereza ku Isoko</span>
                <span>→</span>
              </>
            )}
          </button>
        </form>
      </div>
    </main>
  )
}