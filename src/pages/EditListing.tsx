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

function EditListing() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [categories, setCategories] = useState<Category[]>([])
  const [existingImages, setExistingImages] = useState<
    ExistingImage[]
  >([])
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

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (id) {
      loadListing()
    }
  }, [id])

  async function loadListing() {
    try {
      setLoading(true)
      setMessage("")

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

        setMessage(
          "Ntitwashoboye kubona iyi listing."
        )

        return
      }

      setTitle(listing.title || "")
      setDescription(listing.description || "")

      setPrice(
        listing.price !== null
          ? String(listing.price)
          : ""
      )

      setListingType(listing.listing_type || "sale")
      setCondition(listing.condition || "used")
      setCategoryId(listing.category_id || "")

      const location = Array.isArray(listing.locations)
        ? listing.locations[0]
        : listing.locations

      if (location) {
        setProvince(location.province || "")
        setDistrict(location.district || "")
        setSector(location.sector || "")
      }

      const { data: categoryData } = await supabase
        .from("categories")
        .select("id, name")
        .eq("is_active", true)
        .order("sort_order", {
          ascending: true,
        })

      setCategories(categoryData || [])

      const { data: imageData } = await supabase
        .from("listing_images")
        .select("id, image_url, sort_order")
        .eq("listing_id", id)
        .order("sort_order", {
          ascending: true,
        })

      setExistingImages(imageData || [])
    } catch (error) {
      console.error(error)

      setMessage(
        "Habaye ikibazo mu kuzana listing."
      )
    } finally {
      setLoading(false)
    }
  }

  function handleNewImages(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const files = Array.from(e.target.files || [])

    const total =
      existingImages.length + files.length

    if (total > 5) {
      const allowed = Math.max(
        0,
        5 - existingImages.length
      )

      setNewImages(files.slice(0, allowed))

      setMessage(
        "Ushobora kugira amafoto atarenze 5 yose hamwe."
      )

      setSuccess(false)
      return
    }

    setMessage("")
    setNewImages(files)
  }

  async function deleteExistingImage(
    image: ExistingImage
  ) {
    const confirmed = window.confirm(
      "Urashaka gusiba iri foto?"
    )

    if (!confirmed) {
      return
    }

    const { error } = await supabase
      .from("listing_images")
      .delete()
      .eq("id", image.id)

    if (error) {
      console.error(error)

      setSuccess(false)
      setMessage(
        `Ntibyashobotse gusiba ifoto: ${error.message}`
      )

      return
    }

    setExistingImages((current) =>
      current.filter(
        (item) => item.id !== image.id
      )
    )

    setMessage("")
  }

  function removeNewImage(index: number) {
    setNewImages((current) =>
      current.filter(
        (_, imageIndex) =>
          imageIndex !== index
      )
    )
  }

  async function uploadNewImages() {
    if (!id || newImages.length === 0) {
      return
    }

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error("Ugomba kwinjira.")
    }

    const startOrder = existingImages.length

    for (let i = 0; i < newImages.length; i++) {
      const image = newImages[i]

      const extension =
        image.name
          .split(".")
          .pop()
          ?.toLowerCase() || "jpg"

      const filePath =
        `${user.id}/${id}/${crypto.randomUUID()}.${extension}`

      const { error: uploadError } =
        await supabase.storage
          .from("listing-images")
          .upload(filePath, image, {
            cacheControl: "3600",
            upsert: false,
            contentType: image.type,
          })

      if (uploadError) {
        console.error(uploadError)
        continue
      }

      const {
        data: { publicUrl },
      } = supabase.storage
        .from("listing-images")
        .getPublicUrl(filePath)

      const { error: imageError } =
        await supabase
          .from("listing_images")
          .insert({
            listing_id: id,
            image_url: publicUrl,
            sort_order: startOrder + i,
          })

      if (imageError) {
        console.error(imageError)
      }
    }
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

  function getCategoryName() {
    return (
      categories.find(
        (category) => category.id === categoryId
      )?.name || "Nta category"
    )
  }

  function getListingTypeLabel() {
    if (listingType === "rent") {
      return "Gukodesha"
    }

    if (listingType === "free") {
      return "Ubuntu"
    }

    return "Kugurisha"
  }

  function getConditionLabel() {
    if (condition === "new") {
      return "Bishya"
    }

    if (condition === "refurbished") {
      return "Byavuguruwe"
    }

    return "Byakoreshejwe"
  }

  async function handleSave(
    e: React.FormEvent
  ) {
    e.preventDefault()

    if (!id) {
      return
    }

    try {
      setSaving(true)
      setMessage("")
      setSuccess(false)

      if (!title.trim()) {
        setMessage(
          "Andika izina ry'ikintu."
        )
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
        navigate("/login")
        return
      }

      // Update location
      const {
        data: listingData,
        error: listingFetchError,
      } = await supabase
        .from("listings")
        .select("location_id")
        .eq("id", id)
        .eq("seller_id", user.id)
        .single()

      if (listingFetchError) {
        throw listingFetchError
      }

      if (listingData.location_id) {
        const { error: locationError } =
          await supabase
            .from("locations")
            .update({
              province: province.trim(),
              district:
                district.trim() || null,
              sector:
                sector.trim() || null,
            })
            .eq(
              "id",
              listingData.location_id
            )

        if (locationError) {
          throw locationError
        }
      } else {
        const {
          data: location,
          error,
        } = await supabase
          .from("locations")
          .insert({
            province: province.trim(),
            district:
              district.trim() || null,
            sector:
              sector.trim() || null,
          })
          .select()
          .single()

        if (error) {
          throw error
        }

        const {
          error: updateLocationError,
        } = await supabase
          .from("listings")
          .update({
            location_id: location.id,
          })
          .eq("id", id)
          .eq("seller_id", user.id)

        if (updateLocationError) {
          throw updateLocationError
        }
      }

      // Update listing
      const { error: updateError } =
        await supabase
          .from("listings")
          .update({
            title: title.trim(),
            category_id: categoryId,
            description:
              description.trim() || null,
            price:
              listingType === "free"
                ? null
                : price
                  ? Number(price)
                  : null,
            listing_type: listingType,
            condition:
              listingType === "free"
                ? "not_applicable"
                : condition,
            updated_at:
              new Date().toISOString(),
          })
          .eq("id", id)
          .eq("seller_id", user.id)

      if (updateError) {
        throw updateError
      }

      // Upload additional images
      await uploadNewImages()

      setSuccess(true)

      setMessage(
        "Kwamamaza ryawe ryavuguruwe neza!"
      )

      setNewImages([])

      await loadListing()
    } catch (error) {
      console.error(error)

      setSuccess(false)

      setMessage(
        "Habaye ikibazo mu kubika impinduka."
      )
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

            <p className="mt-2 text-sm text-slate-500">
              Tegereza akanya gato.
            </p>
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
          <Link
            to="/"
            className="text-xl font-black tracking-tight text-slate-950"
          >
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
              Vugurura amakuru, igiciro, amafoto cyangwa aho
              ikintu giherereye kugira ngo listing yawe ikomeze
              kuba nziza ku baguzi.
            </p>
          </div>
        </div>
      </section>

      {/* CONTENT */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
          <form
            onSubmit={handleSave}
            className="space-y-6"
          >
            {/* BASIC INFORMATION */}
            <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
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
                      Hindura amakuru y'ingenzi ya listing yawe.
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
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  />
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
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  >
                    <option value="">
                      Hitamo category
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
                    <h2 className="text-xl font-black text-slate-950">
                      Uburyo n'igiciro
                    </h2>

                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      Hindura uburyo listing itangwa n'igiciro.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-6 p-6 sm:p-8">
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
                      <label className="text-sm font-bold text-slate-800">
                        Imimerere
                      </label>

                      <select
                        value={condition}
                        onChange={(e) =>
                          setCondition(e.target.value)
                        }
                        className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
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
            <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-6 py-6 sm:px-8">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-lg">
                    📍
                  </div>

                  <div>
                    <h2 className="text-xl font-black text-slate-950">
                      Aho giherereye
                    </h2>

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
                      Province
                      <span className="ml-1 text-red-500">*</span>
                    </label>

                    <input
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

            {/* EXISTING PHOTOS */}
            <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-6 py-6 sm:px-8">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-purple-50 text-lg">
                      📸
                    </div>

                    <div>
                      <h2 className="text-xl font-black text-slate-950">
                        Amafoto
                      </h2>

                      <p className="mt-1 text-sm leading-6 text-slate-500">
                        Gucunga amafoto ari kuri listing yawe.
                      </p>
                    </div>
                  </div>

                  <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-black text-slate-500">
                    {existingImages.length +
                      newImages.length}
                    /5
                  </span>
                </div>
              </div>

              <div className="p-6 sm:p-8">
                {existingImages.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-8 text-center">
                    <div className="text-3xl">
                      🖼️
                    </div>

                    <p className="mt-3 text-sm font-bold text-slate-700">
                      Nta foto iri kuri listing.
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Ongeraho amafoto hepfo.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
                    {existingImages.map(
                      (image, index) => (
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
                            onClick={() =>
                              deleteExistingImage(
                                image
                              )
                            }
                            className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-red-600 text-sm font-black text-white opacity-100 shadow-lg transition hover:bg-red-700 sm:opacity-0 sm:group-hover:opacity-100"
                          >
                            ×
                          </button>
                        </div>
                      )
                    )}
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

                    <h3 className="mt-4 text-sm font-black text-slate-900">
                      Ongeraho andi mafoto
                    </h3>

                    <p className="mt-1 text-xs text-slate-500">
                      Amafoto yose hamwe ntarenze 5.
                    </p>

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
                        <p className="text-sm font-bold text-slate-800">
                          Amafoto mashya
                        </p>

                        <span className="text-xs text-slate-400">
                          {newImages.length} mashya
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
                        {newImages.map(
                          (image, index) => (
                            <div
                              key={`${image.name}-${index}`}
                              className="group relative aspect-square overflow-hidden rounded-2xl border border-slate-200"
                            >
                              <img
                                src={URL.createObjectURL(
                                  image
                                )}
                                alt={`Ifoto nshya ${
                                  index + 1
                                }`}
                                className="h-full w-full object-cover"
                              />

                              <button
                                type="button"
                                onClick={() =>
                                  removeNewImage(
                                    index
                                  )
                                }
                                className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-sm font-black text-white transition hover:bg-red-600"
                              >
                                ×
                              </button>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}
                </div>
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

            {/* ACTIONS */}
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                to="/dashboard"
                className="rounded-2xl border border-slate-200 bg-white px-6 py-4 text-center font-black text-slate-700 transition hover:bg-slate-50"
              >
                Reka
              </Link>

              <button
                type="submit"
                disabled={saving}
                className="group flex flex-1 items-center justify-center gap-3 rounded-2xl bg-blue-600 px-6 py-4 font-black text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Turimo kubika...
                  </>
                ) : (
                  <>
                    <span>💾</span>
                    Bika impinduka
                    <span className="transition-transform group-hover:translate-x-1">
                      →
                    </span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* PREVIEW */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-5">
              <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                <div className="bg-slate-950 px-6 py-6">
                  <p className="text-xs font-bold uppercase tracking-widest text-blue-300">
                    Live preview
                  </p>

                  <h2 className="mt-2 text-xl font-black text-white">
                    Listing yawe
                  </h2>
                </div>

                <div className="p-6">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-slate-100">
                    {existingImages.length > 0 ? (
                      <img
                        src={existingImages[0].image_url}
                        alt="Listing preview"
                        className="h-full w-full object-cover"
                      />
                    ) : newImages.length > 0 ? (
                      <img
                        src={URL.createObjectURL(
                          newImages[0]
                        )}
                        alt="New preview"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <div className="text-center">
                          <div className="text-4xl">
                            📷
                          </div>

                          <p className="mt-2 text-xs font-bold text-slate-400">
                            Nta foto
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-5">
                    <h3 className="line-clamp-2 text-lg font-black text-slate-950">
                      {title ||
                        "Izina ry'ikintu cyawe"}
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
                          {getCategoryName()}
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
                          {formatLocation() ||
                            "Rwanda"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-4 text-sm">
                        <span className="text-slate-400">
                          Amafoto
                        </span>

                        <span className="font-bold text-slate-700">
                          {existingImages.length +
                            newImages.length}
                          /5
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-blue-100 bg-blue-50 p-5">
                <div className="flex gap-3">
                  <div className="text-xl">💡</div>

                  <div>
                    <h3 className="text-sm font-black text-slate-900">
                      Inama
                    </h3>

                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      Komeza amakuru ya listing yawe agezweho.
                      Amafoto meza n'ibisobanuro bisobanutse
                      bifasha abaguzi kuyumva neza.
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

export default EditListing