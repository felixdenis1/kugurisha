import { useEffect, useMemo, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { supabase } from "../services/supabase"

type Category = {
  id: string
  name: string
  slug: string
  description: string | null
  icon: string | null
  parent_id: string | null
  is_active: boolean
  sort_order: number
  created_at: string
}

function AdminCategories() {
  const navigate = useNavigate()

  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all")

  const [showForm, setShowForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)

  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [description, setDescription] = useState("")
  const [icon, setIcon] = useState("")
  const [parentId, setParentId] = useState("")
  const [sortOrder, setSortOrder] = useState("0")
  const [isActive, setIsActive] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    checkAdminAndLoad()
  }, [])

  async function checkAdminAndLoad() {
    setLoading(true)
    setError("")

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        navigate("/login")
        return
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single()

      if (profileError) throw profileError

      if (profile?.role !== "admin") {
        navigate("/")
        return
      }

      await loadCategories()
    } catch (err: any) {
      setError(err?.message || "Ntibyashobotse gufungura categories.")
    } finally {
      setLoading(false)
    }
  }

  async function loadCategories() {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true })

    if (error) throw error

    setCategories((data || []) as Category[])
  }

  function resetForm() {
    setName("")
    setSlug("")
    setDescription("")
    setIcon("")
    setParentId("")
    setSortOrder("0")
    setIsActive(true)
    setEditingCategory(null)
  }

  function openCreate() {
    resetForm()
    setShowForm(true)
  }

  function openEdit(category: Category) {
    setEditingCategory(category)

    setName(category.name)
    setSlug(category.slug)
    setDescription(category.description || "")
    setIcon(category.icon || "")
    setParentId(category.parent_id || "")
    setSortOrder(String(category.sort_order))
    setIsActive(category.is_active)

    setShowForm(true)
  }

  function closeForm() {
    if (saving) return

    setShowForm(false)
    resetForm()
  }

  function makeSlug(value: string) {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
  }

  async function saveCategory(e: React.FormEvent) {
    e.preventDefault()

    if (!name.trim()) {
      setError("Andika izina rya category.")
      return
    }

    setSaving(true)
    setError("")

    try {
      const payload = {
        name: name.trim(),
        slug: slug.trim() || makeSlug(name),
        description: description.trim() || null,
        icon: icon.trim() || null,
        parent_id: parentId || null,
        sort_order: Number(sortOrder) || 0,
        is_active: isActive,
      }

      if (editingCategory) {
        const { error } = await supabase
          .from("categories")
          .update(payload)
          .eq("id", editingCategory.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from("categories")
          .insert(payload)

        if (error) throw error
      }

      await loadCategories()

      setShowForm(false)
      resetForm()
    } catch (err: any) {
      setError(err?.message || "Ntibyashobotse kubika category.")
    } finally {
      setSaving(false)
    }
  }

  async function toggleCategory(category: Category) {
    setError("")

    const { error } = await supabase
      .from("categories")
      .update({
        is_active: !category.is_active,
      })
      .eq("id", category.id)

    if (error) {
      setError(error.message)
      return
    }

    setCategories((current) =>
      current.map((item) =>
        item.id === category.id
          ? { ...item, is_active: !item.is_active }
          : item
      )
    )
  }

  async function deleteCategory(category: Category) {
    const confirmed = window.confirm(
      `Urashaka gusiba category "${category.name}"?`
    )

    if (!confirmed) return

    setError("")

    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("id", category.id)

    if (error) {
      setError(
        "Ntibyashobotse gusiba iyi category. Reba niba hari listings cyangwa sub-categories ziyikoresha."
      )
      return
    }

    setCategories((current) =>
      current.filter((item) => item.id !== category.id)
    )
  }

  const parentName = (parentId: string | null) => {
    if (!parentId) return "Main category"

    return (
      categories.find((category) => category.id === parentId)?.name ||
      "Unknown parent"
    )
  }

  const filteredCategories = useMemo(() => {
    const query = search.trim().toLowerCase()

    return categories.filter((category) => {
      const matchesFilter =
        filter === "all" ||
        (filter === "active" && category.is_active) ||
        (filter === "inactive" && !category.is_active)

      const matchesSearch =
        !query ||
        category.name.toLowerCase().includes(query) ||
        category.slug.toLowerCase().includes(query) ||
        (category.description || "").toLowerCase().includes(query)

      return matchesFilter && matchesSearch
    })
  }, [categories, search, filter])

  const activeCount = categories.filter((item) => item.is_active).length
  const inactiveCount = categories.filter((item) => !item.is_active).length
  const parentCount = categories.filter((item) => !item.parent_id).length

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-slate-200 bg-white lg:block">
        <div className="flex h-full flex-col">
          <div className="border-b border-slate-200 px-6 py-5">
            <Link to="/" className="text-xl font-black tracking-tight">
              KUGURISHA<span className="text-blue-600">.COM</span>
            </Link>

            <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Admin Center
            </p>
          </div>

          <nav className="flex-1 space-y-1 p-4">
            <Link
              to="/admin"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-100"
            >
              📊 Overview
            </Link>

            <Link
              to="/admin/users"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-100"
            >
              👥 Users
            </Link>

            <Link
              to="/admin/listings"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-100"
            >
              🏷️ Listings
            </Link>

            <Link
              to="/admin/reports"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-100"
            >
              🚩 Reports
            </Link>

            <Link
              to="/admin/categories"
              className="flex items-center gap-3 rounded-xl bg-blue-50 px-4 py-3 text-sm font-bold text-blue-700"
            >
              🗂️ Categories
            </Link>

            <div className="mt-6 border-t border-slate-100 pt-4">
              <p className="px-4 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Management
              </p>

              <button className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold text-slate-400">
                💬 Messages
              </button>

              <button className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold text-slate-400">
                🔔 Notifications
              </button>

              <button className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold text-slate-400">
                📈 Analytics
              </button>

              <button className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold text-slate-400">
                🧾 Activity Log
              </button>
            </div>
          </nav>

          <div className="border-t border-slate-200 p-4">
            <Link
              to="/"
              className="block rounded-xl px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-100"
            >
              ← Back to marketplace
            </Link>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="lg:pl-64">
        {/* Header */}
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="flex min-h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                Admin Center
              </p>

              <h1 className="text-lg font-black sm:text-xl">
                Category Management
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <Link
                to="/admin"
                className="hidden rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 sm:block"
              >
                Overview
              </Link>

              <button
                onClick={openCreate}
                className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700"
              >
                + Add category
              </button>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
          {/* Intro */}
          <section className="mb-6 rounded-3xl bg-slate-900 p-6 text-white shadow-sm sm:p-8">
            <div className="max-w-3xl">
              <p className="mb-2 text-sm font-bold text-blue-300">
                🗂️ CATEGORY MANAGEMENT
              </p>

              <h2 className="text-2xl font-black tracking-tight sm:text-3xl">
                Tegura categories za marketplace
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-300 sm:text-base">
                Genzura amazina, hierarchy, order n’uko categories
                zigaragara ku isoko.
              </p>
            </div>
          </section>

          {/* Error */}
          {error && (
            <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <span className="text-lg">⚠️</span>

              <div className="flex-1">
                <p className="font-bold">Habaye ikibazo</p>
                <p className="mt-1">{error}</p>
              </div>

              <button
                onClick={() => setError("")}
                className="font-bold text-red-500 hover:text-red-700"
              >
                ×
              </button>
            </div>
          )}

          {/* Stats */}
          <section className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Total
              </p>
              <p className="mt-2 text-3xl font-black">{categories.length}</p>
              <p className="mt-1 text-sm text-slate-500">Categories zose</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Active
              </p>
              <p className="mt-2 text-3xl font-black text-emerald-600">
                {activeCount}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Zigaragara ku isoko
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Inactive
              </p>
              <p className="mt-2 text-3xl font-black text-slate-500">
                {inactiveCount}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Zidahari ku isoko
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Main categories
              </p>
              <p className="mt-2 text-3xl font-black text-blue-600">
                {parentCount}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Root categories
              </p>
            </div>
          </section>

          {/* Toolbar */}
          <section className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative flex-1">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  🔎
                </span>

                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Shakisha category..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <div className="flex gap-2 overflow-x-auto">
                {[
                  ["all", "All"],
                  ["active", "Active"],
                  ["inactive", "Inactive"],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    onClick={() =>
                      setFilter(value as "all" | "active" | "inactive")
                    }
                    className={`whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-bold transition ${
                      filter === value
                        ? "bg-slate-900 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Loading */}
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5"
                >
                  <div className="h-5 w-1/3 rounded bg-slate-200" />
                  <div className="mt-3 h-4 w-2/3 rounded bg-slate-100" />
                  <div className="mt-5 h-10 w-full rounded-xl bg-slate-100" />
                </div>
              ))}
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-3xl">
                🗂️
              </div>

              <h3 className="mt-5 text-lg font-black">
                Nta categories zabonetse
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                Gerageza guhindura search/filter cyangwa wongere category
                nshya.
              </p>

              <button
                onClick={openCreate}
                className="mt-6 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700"
              >
                + Add category
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredCategories.map((category) => (
                <article
                  key={category.id}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300 hover:shadow-md sm:p-5"
                >
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                    <div className="flex min-w-0 items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-2xl">
                        {category.icon || "🗂️"}
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base font-black text-slate-900">
                            {category.name}
                          </h3>

                          <span
                            className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                              category.is_active
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            {category.is_active ? "ACTIVE" : "INACTIVE"}
                          </span>
                        </div>

                        <p className="mt-1 text-xs font-medium text-slate-400">
                          /{category.slug}
                        </p>

                        {category.description && (
                          <p className="mt-2 line-clamp-2 text-sm text-slate-600">
                            {category.description}
                          </p>
                        )}

                        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold text-slate-500">
                          <span>
                            Parent:{" "}
                            <strong className="text-slate-700">
                              {parentName(category.parent_id)}
                            </strong>
                          </span>

                          <span>
                            Order:{" "}
                            <strong className="text-slate-700">
                              {category.sort_order}
                            </strong>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 xl:shrink-0">
                      <button
                        onClick={() => toggleCategory(category)}
                        className={`rounded-xl px-3.5 py-2.5 text-sm font-bold transition ${
                          category.is_active
                            ? "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                            : "bg-emerald-600 text-white hover:bg-emerald-700"
                        }`}
                      >
                        {category.is_active ? "Deactivate" : "Activate"}
                      </button>

                      <button
                        onClick={() => openEdit(category)}
                        className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-700"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => deleteCategory(category)}
                        className="rounded-xl border border-red-200 px-3.5 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          <p className="mt-5 text-center text-xs font-medium text-slate-400">
            Showing {filteredCategories.length} of {categories.length}{" "}
            categories
          </p>
        </div>
      </main>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/50 p-0 backdrop-blur-sm sm:items-center sm:p-4">
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4 sm:px-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                  Category
                </p>

                <h2 className="text-lg font-black">
                  {editingCategory ? "Edit category" : "Add category"}
                </h2>
              </div>

              <button
                onClick={closeForm}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-xl text-slate-500 hover:bg-slate-200"
              >
                ×
              </button>
            </div>

            <form onSubmit={saveCategory} className="space-y-5 p-5 sm:p-6">
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Category name
                </label>

                <input
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value)

                    if (!editingCategory) {
                      setSlug(makeSlug(e.target.value))
                    }
                  }}
                  placeholder="Urugero: Electronics"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Slug
                </label>

                <input
                  value={slug}
                  onChange={(e) => setSlug(makeSlug(e.target.value))}
                  placeholder="electronics"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />

                <p className="mt-1.5 text-xs text-slate-400">
                  Slug ikoreshwa mu URL/search. Example: electronics.
                </p>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Icon
                  </label>

                  <input
                    value={icon}
                    onChange={(e) => setIcon(e.target.value)}
                    placeholder="📱"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Sort order
                  </label>

                  <input
                    type="number"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Parent category
                </label>

                <select
                  value={parentId}
                  onChange={(e) => setParentId(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                >
                  <option value="">Main category</option>

                  {categories
                    .filter(
                      (category) =>
                        category.id !== editingCategory?.id
                    )
                    .map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Description
                </label>

                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  placeholder="Sobanura ibyo iyi category ikubiyemo..."
                  className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div>
                  <p className="text-sm font-bold text-slate-800">
                    Category active
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Iyo iri active, category ishobora kugaragara ku isoko.
                  </p>
                </div>

                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="h-5 w-5 accent-blue-600"
                />
              </label>

              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeForm}
                  disabled={saving}
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving
                    ? "Saving..."
                    : editingCategory
                      ? "Save changes"
                      : "Create category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminCategories