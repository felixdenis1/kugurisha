import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { supabase } from "../services/supabase"

type Category = {
  id: string
  name: string
}

function CreateListing() {
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
    loadCategories()
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

  function handleImagesChange(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
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

  function formatPricePreview() {
    if (listingType === "free") {
      return "Ubuntu"
    }

    if (!price) {
      return "Igiciro kitarashyirwaho"
    }

    const numericPrice = Number(price)

    if (Number.isNaN(numericPrice)) {
      return "Igiciro"
    }

    return `${numericPrice.toLocaleString("en-US")} Frw`
  }

  function getSelectedCategoryName() {
    return (
      categories.find((category) => category.id === categoryId)?.name ||
      "Nta category wahisemo"
    )
  }

  function getListingTypeLabel() {
    if (listingType === "rent") return "Gukodesha"
    if (listingType === "free") return "Ubuntu"
    return "Kugurisha"
  }

  function getConditionLabel() {
    if (condition === "new") return "Bishya"
    if (condition === "refurbished") return "Byavuguruwe"
    return "Byakoreshejwe"
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
        setMessage(
          "Ugomba kubanza kwinjira muri konti yawe."
        )
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

        setMessage(
          `Location error: ${locationError.message}`
        )

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
          condition:
            listingType === "free"
              ? "not_applicable"
              : condition,
          status: "active",
          contact_phone: true,
          contact_chat: true,
        })
        .select()
        .single()

      if (listingError) {
        console.error(listingError)

        setMessage(
          `Listing error: ${listingError.message}`
        )

        return
      }

      // 3. UPLOAD IMAGES
      let uploadedImages = 0

      for (let i = 0; i < images.length; i++) {
        const image = images[i]

        const extension =
          image.name.split(".").pop()?.toLowerCase() || "jpg"

        const filePath =
          `${user.id}/${listing.id}/${crypto.randomUUID()}.${extension}`

        const { error: uploadError } =
          await supabase.storage
            .from("listing-images")
            .upload(filePath, image, {
              cacheControl: "3600",
              upsert: false,
              contentType: image.type,
            })

        if (uploadError) {
          console.error(
            "Image upload error:",
            uploadError
          )

          continue
        }

        const {
          data: { publicUrl },
        } = supabase.storage
          .from("listing-images")
          .getPublicUrl(filePath)

        // 4. SAVE IMAGE URL
        const { error: imageError } =
          await supabase
            .from("listing_images")
            .insert({
              listing_id: listing.id,
              image_url: publicUrl,
              sort_order: i,
            })

        if (imageError) {
          console.error(
            "Listing image database error:",
            imageError
          )

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
        setMessage(
          "Kwamamaza byawe byashyizwe ku isoko neza!"
        )
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

      setMessage(
        "Habaye ikibazo kitateganyijwe. Ongera ugerageze."
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-50 text-slate-900">
      {/* =========================================================
          GLOBAL BACKGROUND
          ========================================================= */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[8%] top-[8%] h-[34rem] w-[34rem] rounded-full bg-blue-500/20 blur-[120px]" />

        <div className="absolute right-[4%] top-[22%] h-[32rem] w-[32rem] rounded-full bg-indigo-500/20 blur-[120px]" />

        <div className="absolute bottom-[5%] left-[35%] h-[36rem] w-[36rem] rounded-full bg-cyan-400/15 blur-[130px]" />

        <div className="absolute -bottom-40 -right-40 h-[34rem] w-[34rem] rounded-full bg-blue-600/15 blur-[120px]" />

        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(59,130,246,0.06),transparent_35%,rgba(99,102,241,0.06)_65%,rgba(6,182,212,0.04))]" />
      </div>

      {/* =========================================================
          TOP NAV
          ========================================================= */}
      <header className="sticky top-0 z-40 border-b border-white/70 bg-white/80 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link
            to="/"
            className="text-xl font-black tracking-tight text-slate-950"
          >
            KUGURISHA
            <span className="text-blue-600">.COM</span>
          </Link>

          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 hover:shadow-md"
          >
            <span>←</span>
            Garuka
          </Link>
        </div>
      </header>

      {/* =========================================================
          HERO
          ========================================================= */}
      <section className="relative overflow-hidden bg-slate-950">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-32 -top-32 h-[32rem] w-[32rem] rounded-full bg-blue-600/30 blur-[120px]" />

          <div className="absolute right-[8%] top-[-8rem] h-[30rem] w-[30rem] rounded-full bg-indigo-600/25 blur-[120px]" />

          <div className="absolute -bottom-40 left-[35%] h-[30rem] w-[30rem] rounded-full bg-cyan-500/15 blur-[130px]" />

          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(37,99,235,0.18),transparent_38%,rgba(79,70,229,0.16)_68%,rgba(6,182,212,0.08))]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-widest text-blue-300 backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-blue-400 shadow-lg shadow-blue-400/50" />
              Umwanya wo kugurisha
            </div>

            <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
              Gurisha icyo ufite.
              <span className="mt-1 block text-blue-400">
                Ugere ku baguzi.
              </span>
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
              Shyiraho amakuru y'ikintu cyawe, wongereho
              amafoto meza, maze ugishyire ku isoko rya
              KUGURISHA.COM.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300 backdrop-blur-md">
                ✓ Ubuntu kuyishyiraho
              </div>

              <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300 backdrop-blur-md">
                ✓ Amafoto agera kuri 5
              </div>

              <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300 backdrop-blur-md">
                ✓ Abaguzi bo mu Rwanda
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          CONTENT
          ========================================================= */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
          {/* =====================================================
              FORM
              ===================================================== */}
          <form
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            {/* BASIC INFO */}
            <section className="overflow-hidden rounded-3xl border border-white/80 bg-white/95 shadow-xl shadow-slate-900/5 backdrop-blur-xl">
              <div className="border-b border-slate-100 px-6 py-6 sm:px-8">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-lg">
                    📝
                  </div>

                  <div>
                    <h2 className="text-xl font-black text-slate-950">
                      Amakuru y'ikintu
                    </h2>

                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      Banza utange amakuru y'ingenzi azafasha
                      umuguzi kumenya icyo ugurisha.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-6 p-6 sm:p-8">
                {/* TITLE */}
                <div>
                  <label className="text-sm font-bold text-slate-800">
                    Izina ry'ikintu
                    <span className="ml-1 text-red-500">*</span>
                  </label>

                  <input
                    type="text"
                    value={title}
                    onChange={(e) =>
                      setTitle(e.target.value)
                    }
                    required
                    placeholder="Urugero: iPhone 15 Pro"
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  />

                  <p className="mt-2 text-xs text-slate-400">
                    Andika izina risobanutse kandi rigufi.
                  </p>
                </div>

                {/* CATEGORY */}
                <div>
                  <label className="text-sm font-bold text-slate-800">
                    Category
                    <span className="ml-1 text-red-500">*</span>
                  </label>

                  <select
                    value={categoryId}
                    onChange={(e) =>
                      setCategoryId(e.target.value)
                    }
                    required
                    disabled={loadingCategories}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-100"
                  >
                    <option value="">
                      {loadingCategories
                        ? "Turimo kuzana categories..."
                        : "Hitamo category"}
                    </option>

                    {categories.map((category) => (
                      <option
                        key={category.id}
                        value={category.id}
                      >
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* DESCRIPTION */}
                <div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-bold text-slate-800">
                      Ibisobanuro
                    </label>

                    <span className="text-xs text-slate-400">
                      {description.length} characters
                    </span>
                  </div>

                  <textarea
                    value={description}
                    onChange={(e) =>
                      setDescription(e.target.value)
                    }
                    rows={6}
                    placeholder="Sobanura neza icyo ugurisha. Vuga uko kimeze, igihe wakoresheje, ibintu bijyana na cyo, n'andi makuru umuguzi yakenera..."
                    className="mt-2 w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  />
                </div>
              </div>
            </section>

            {/* PHOTOS */}
            <section className="overflow-hidden rounded-3xl border border-white/80 bg-white/95 shadow-xl shadow-slate-900/5 backdrop-blur-xl">
              <div className="border-b border-slate-100 px-6 py-6 sm:px-8">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-lg">
                    📸
                  </div>

                  <div>
                    <h2 className="text-xl font-black text-slate-950">
                      Amafoto
                    </h2>

                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      Amafoto meza afasha abaguzi gusobanukirwa
                      neza n'icyo ugurisha.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 sm:p-8">
                <label
                  htmlFor="listing-images"
                  className="group flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center transition hover:border-blue-400 hover:bg-blue-50/40"
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-3xl shadow-sm transition group-hover:scale-105">
                    📷
                  </div>

                  <h3 className="mt-5 text-base font-black text-slate-900">
                    Ongeramo amafoto y'ikintu
                  </h3>

                  <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                    Kanda hano uhitemo amafoto cyangwa uyashyire
                    muri aka gace. Ushobora kongeramo amafoto
                    agera kuri 5.
                  </p>

                  <span className="mt-5 rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-bold text-white transition group-hover:bg-blue-600">
                    Hitamo amafoto
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
                  <div className="mt-6">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-sm font-bold text-slate-800">
                        Amafoto wahisemo
                      </p>

                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">
                        {images.length}/5
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
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
                            <div className="absolute left-2 top-2 rounded-lg bg-slate-950/80 px-2 py-1 text-[10px] font-bold text-white backdrop-blur">
                              MAIN
                            </div>
                          )}

                          <button
                            type="button"
                            onClick={() =>
                              removeImage(index)
                            }
                            className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-sm font-black text-white opacity-100 transition hover:bg-red-600 sm:opacity-0 sm:group-hover:opacity-100"
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

            {/* SALE DETAILS */}
            <section className="overflow-hidden rounded-3xl border border-white/80 bg-white/95 shadow-xl shadow-slate-900/5 backdrop-blur-xl">
              <div className="border-b border-slate-100 px-6 py-6 sm:px-8">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-lg">
                    💰
                  </div>

                  <div>
                    <h2 className="text-xl font-black text-slate-950">
                      Uburyo n'igiciro
                    </h2>

                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      Hitamo niba ugurisha, ukodesha cyangwa utanga
                      ubuntu.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-6 p-6 sm:p-8">
                {/* LISTING TYPE */}
                <div>
                  <label className="text-sm font-bold text-slate-800">
                    Uburyo bwo gutanga
                  </label>

                  <div className="mt-3 grid gap-3 sm:grid-cols-3">
                    {[
                      {
                        value: "sale",
                        icon: "🏷️",
                        title: "Kugurisha",
                        description: "Shaka umuguzi",
                      },
                      {
                        value: "rent",
                        icon: "🔑",
                        title: "Gukodesha",
                        description: "Kodesha icyo ufite",
                      },
                      {
                        value: "free",
                        icon: "🎁",
                        title: "Ubuntu",
                        description: "Gutanga ubuntu",
                      },
                    ].map((item) => {
                      const selected =
                        listingType === item.value

                      return (
                        <button
                          key={item.value}
                          type="button"
                          onClick={() =>
                            setListingType(item.value)
                          }
                          className={`rounded-2xl border p-4 text-left transition ${
                            selected
                              ? "border-blue-500 bg-blue-50 ring-4 ring-blue-500/10"
                              : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <span className="text-2xl">
                              {item.icon}
                            </span>

                            {selected && (
                              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-black text-white">
                                ✓
                              </span>
                            )}
                          </div>

                          <p className="mt-4 text-sm font-black text-slate-900">
                            {item.title}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {item.description}
                          </p>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {listingType !== "free" && (
                  <div className="grid gap-5 md:grid-cols-2">
                    {/* PRICE */}
                    <div>
                      <label className="text-sm font-bold text-slate-800">
                        Igiciro (Frw)
                      </label>

                      <div className="relative mt-2">
                        <input
                          type="number"
                          value={price}
                          onChange={(e) =>
                            setPrice(e.target.value)
                          }
                          placeholder="650000"
                          min="0"
                          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 pr-16 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                        />

                        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400">
                          FRW
                        </span>
                      </div>
                    </div>

                    {/* CONDITION */}
                    <div>
                      <label className="text-sm font-bold text-slate-800">
                        Imimerere y'ikintu
                      </label>

                      <select
                        value={condition}
                        onChange={(e) =>
                          setCondition(e.target.value)
                        }
                        className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                      >
                        <option value="new">
                          Bishya
                        </option>

                        <option value="used">
                          Byakoreshejwe
                        </option>

                        <option value="refurbished">
                          Byavuguruwe
                        </option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* LOCATION */}
            <section className="overflow-hidden rounded-3xl border border-white/80 bg-white/95 shadow-xl shadow-slate-900/5 backdrop-blur-xl">
              <div className="border-b border-slate-100 px-6 py-6 sm:px-8">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-lg">
                    📍
                  </div>

                  <div>
                    <h2 className="text-xl font-black text-slate-950">
                      Aho ikintu giherereye
                    </h2>

                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      Andika aho umuguzi ashobora gusanga ikintu.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 sm:p-8">
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <label className="text-sm font-bold text-slate-800">
                      Province
                      <span className="ml-1 text-red-500">
                        *
                      </span>
                    </label>

                    <input
                      type="text"
                      value={province}
                      onChange={(e) =>
                        setProvince(e.target.value)
                      }
                      required
                      placeholder="Kigali"
                      className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3.5 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-bold text-slate-800">
                      District
                    </label>

                    <input
                      type="text"
                      value={district}
                      onChange={(e) =>
                        setDistrict(e.target.value)
                      }
                      placeholder="Gasabo"
                      className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3.5 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-bold text-slate-800">
                      Sector
                    </label>

                    <input
                      type="text"
                      value={sector}
                      onChange={(e) =>
                        setSector(e.target.value)
                      }
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

            {/* MESSAGE */}
            {message && (
              <div
                className={`rounded-3xl border p-5 ${
                  success
                    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                    : "border-red-200 bg-red-50 text-red-800"
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-xl">
                    {success ? "✓" : "!"}
                  </span>

                  <div>
                    <p className="font-bold">
                      {success
                        ? "Byagenze neza"
                        : "Hari ikibazo"}
                    </p>

                    <p className="mt-1 text-sm leading-6">
                      {message}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* SUBMIT */}
            <button
              type="submit"
              disabled={loading || loadingCategories}
              className="group flex w-full items-center justify-center gap-3 rounded-2xl bg-slate-950 px-6 py-4 text-base font-black text-white shadow-xl shadow-slate-900/15 transition hover:-translate-y-0.5 hover:bg-blue-600 hover:shadow-2xl hover:shadow-blue-600/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <>
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />

                  Turimo kubika...
                </>
              ) : (
                <>
                  Shyira ku isoko

                  <span className="transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </>
              )}
            </button>
          </form>

          {/* =====================================================
              SUMMARY SIDEBAR
              ===================================================== */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-5">
              <div className="overflow-hidden rounded-3xl border border-white/80 bg-white/95 shadow-xl shadow-slate-900/5 backdrop-blur-xl">
                <div className="bg-slate-950 px-6 py-6">
                  <p className="text-xs font-bold uppercase tracking-widest text-blue-300">
                    Preview
                  </p>

                  <h2 className="mt-2 text-xl font-black text-white">
                    Uko listing yawe izagaragara
                  </h2>
                </div>

                <div className="p-6">
                  <div className="flex aspect-[4/3] items-center justify-center overflow-hidden rounded-2xl bg-slate-100">
                    {images.length > 0 ? (
                      <img
                        src={URL.createObjectURL(images[0])}
                        alt="Preview"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="text-center">
                        <div className="text-4xl">
                          📷
                        </div>

                        <p className="mt-2 text-xs font-bold text-slate-400">
                          Ongeramo ifoto
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="mt-5">
                    <h3 className="line-clamp-2 text-lg font-black text-slate-950">
                      {title || "Izina ry'ikintu cyawe"}
                    </h3>

                    <p className="mt-2 text-xl font-black text-blue-600">
                      {formatPricePreview()}
                    </p>

                    <div className="mt-4 space-y-3 border-t border-slate-100 pt-4">
                      <div className="flex items-center justify-between gap-4 text-sm">
                        <span className="text-slate-400">
                          Category
                        </span>

                        <span className="text-right font-bold text-slate-700">
                          {getSelectedCategoryName()}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-4 text-sm">
                        <span className="text-slate-400">
                          Uburyo
                        </span>

                        <span className="font-bold text-slate-700">
                          {getListingTypeLabel()}
                        </span>
                      </div>

                      {listingType !== "free" && (
                        <div className="flex items-center justify-between gap-4 text-sm">
                          <span className="text-slate-400">
                            Imimerere
                          </span>

                          <span className="font-bold text-slate-700">
                            {getConditionLabel()}
                          </span>
                        </div>
                      )}

                      <div className="flex items-start justify-between gap-4 text-sm">
                        <span className="text-slate-400">
                          Aho iri
                        </span>

                        <span className="text-right font-bold text-slate-700">
                          {formatLocation() || "Rwanda"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-blue-100 bg-blue-50/90 p-5 shadow-sm backdrop-blur-xl">
                <div className="flex gap-3">
                  <div className="text-xl">💡</div>

                  <div>
                    <h3 className="text-sm font-black text-slate-900">
                      Inama nto
                    </h3>

                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      Shyiramo amafoto asobanutse kandi wandike
                      ibisobanuro bihagije. Ibi bifasha umuguzi
                      kumenya neza icyo agiye kugura.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  )
}

export default CreateListing