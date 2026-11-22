import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
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
      const { data: { user } } = await supabase.auth.getUser()
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
      .update({ is_active: !category.is_active })
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
      `Urashaka gusiba category "${category.name}"?\n\nNiba ifite listings cyangwa sub-categories, gusiba bizananirwa.`
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

    setCategories((current) => current.filter((item) => item.id !== category.id))
  }

  const parentName = (parentId: string | null) => {
    if (!parentId) return "Main category"
    return categories.find((category) => category.id === parentId)?.name || "Unknown parent"
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
    <div className="space-y-6">
      {/* PAGE HEADER (No sidebar here, handled by AdminLayout) */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Category Management
          </h1>
          <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">
            Genzura amazina, hierarchy, n'uko categories zigaragara ku isoko.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#10b981] px-5 py-3 text-sm font-black text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#059669] hover:shadow-md"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add Category
        </button>
      </div>

      {/* ERROR BANNER */}
      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-400">
          <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          <div className="flex-1">
            <p className="font-bold">Habaye ikibazo</p>
            <p className="mt-1">{error}</p>
          </div>
          <button onClick={() => setError("")} className="font-bold opacity-70 hover:opacity-100">
            ×
          </button>
        </div>
      )}

      {/* STATS GRID */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200/80 bg-white/60 p-5 shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-white/[0.03]">
          <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total Categories</p>
          <p className="mt-2 text-3xl font-black text-slate-900 dark:text-white">{categories.length}</p>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white/60 p-5 shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-white/[0.03]">
          <p className="text-[10px] font-black uppercase tracking-wider text-[#059669]">Active</p>
          <p className="mt-2 text-3xl font-black text-[#059669] dark:text-[#34d399]">{activeCount}</p>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white/60 p-5 shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-white/[0.03]">
          <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Inactive</p>
          <p className="mt-2 text-3xl font-black text-slate-500 dark:text-slate-300">{inactiveCount}</p>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white/60 p-5 shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-white/[0.03]">
          <p className="text-[10px] font-black uppercase tracking-wider text-[#475569]">Main Categories</p>
          <p className="mt-2 text-3xl font-black text-[#475569] dark:text-slate-200">{parentCount}</p>
        </div>
      </div>

      {/* TOOLBAR */}
      <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-3 shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-white/[0.03]">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative flex-1">
            <svg className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Shakisha category..."
              className="w-full rounded-xl border border-slate-200/80 bg-slate-50/50 py-2.5 pl-11 pr-4 text-sm font-semibold outline-none transition focus:border-[#10b981] focus:bg-white focus:ring-4 focus:ring-[#10b981]/10 dark:border-white/10 dark:bg-white/[0.04] dark:text-white"
            />
          </div>
          <div className="flex gap-1.5 overflow-x-auto rounded-xl bg-slate-100/80 p-1 dark:bg-white/5">
            {[["all", "All"], ["active", "Active"], ["inactive", "Inactive"]].map(([value, label]) => (
              <button
                key={value}
                onClick={() => setFilter(value as "all" | "active" | "inactive")}
                className={`whitespace-nowrap rounded-lg px-4 py-1.5 text-xs font-bold transition ${
                  filter === value
                    ? "bg-white text-slate-900 shadow-sm dark:bg-[#10b981] dark:text-white"
                    : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* LIST */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="h-28 animate-pulse rounded-2xl border border-slate-200 bg-white/50 dark:border-white/10 dark:bg-white/5" />
          ))}
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white/50 px-6 py-16 text-center dark:border-white/10 dark:bg-white/[0.02]">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-3xl dark:bg-white/5">
            🗂️
          </div>
          <h3 className="mt-5 text-lg font-black text-slate-900 dark:text-white">Nta categories zabonetse</h3>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">Gerageza guhindura search/filter cyangwa wongere category nshya.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredCategories.map((category) => (
            <article key={category.id} className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/80 p-4 shadow-sm backdrop-blur-sm transition-all hover:border-[#10b981]/30 hover:shadow-md dark:border-white/10 dark:bg-slate-900/60 sm:p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                
                {/* Info */}
                <div className="flex min-w-0 items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-100 to-white text-2xl shadow-sm ring-1 ring-slate-200/50 dark:from-white/10 dark:to-white/5 dark:ring-white/10">
                    {category.icon || "🗂️"}
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-black text-slate-900 dark:text-white">{category.name}</h3>
                      <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-black tracking-wide ${
                        category.is_active
                          ? "bg-[#10b981]/10 text-[#059669] ring-1 ring-[#10b981]/20 dark:text-[#34d399]"
                          : "bg-slate-100 text-slate-500 ring-1 ring-slate-200 dark:bg-white/5 dark:text-slate-400 dark:ring-white/10"
                      }`}>
                        {category.is_active ? "ACTIVE" : "INACTIVE"}
                      </span>
                    </div>
                    <p className="mt-1 text-xs font-semibold text-slate-400">/{category.slug}</p>
                    {category.description && (
                      <p className="mt-2 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">{category.description}</p>
                    )}
                    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-[11px] font-bold text-slate-500 dark:text-slate-400">
                      <span>Parent: <span className="text-slate-800 dark:text-slate-200">{parentName(category.parent_id)}</span></span>
                      <span className="hidden sm:inline text-slate-300 dark:text-white/20">•</span>
                      <span>Order: <span className="text-slate-800 dark:text-slate-200">{category.sort_order}</span></span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-2 lg:shrink-0">
                  <button
                    onClick={() => toggleCategory(category)}
                    className={`rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                      category.is_active
                        ? "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
                        : "bg-[#10b981] text-white hover:bg-[#059669]"
                    }`}
                  >
                    {category.is_active ? "Deactivate" : "Activate"}
                  </button>
                  <button
                    onClick={() => openEdit(category)}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteCategory(category)}
                    className="flex h-8 w-8 items-center justify-center rounded-xl border border-rose-200 bg-rose-50 text-rose-500 transition hover:bg-rose-100 hover:text-rose-600 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-400"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <p className="mt-4 text-center text-xs font-bold text-slate-400">
        Showing {filteredCategories.length} of {categories.length} categories
      </p>

      {/* FORM MODAL */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 p-0 backdrop-blur-sm sm:items-center sm:p-4">
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl bg-white shadow-2xl dark:bg-[#0f1716] sm:rounded-3xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white/90 px-6 py-4 backdrop-blur-md dark:border-white/10 dark:bg-[#0f1716]/90">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#10b981]">
                  Category
                </p>
                <h2 className="text-lg font-black text-slate-900 dark:text-white">
                  {editingCategory ? "Edit Category" : "Add Category"}
                </h2>
              </div>
              <button
                onClick={closeForm}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200 dark:bg-white/5 dark:text-slate-400 dark:hover:bg-white/10"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={saveCategory} className="space-y-5 p-6">
              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">Category Name</label>
                <input
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value)
                    if (!editingCategory) setSlug(makeSlug(e.target.value))
                  }}
                  placeholder="Urugero: Electronics"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-semibold outline-none focus:border-[#10b981] focus:bg-white focus:ring-4 focus:ring-[#10b981]/10 dark:border-white/10 dark:bg-white/[0.04] dark:text-white"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">Slug</label>
                <input
                  value={slug}
                  onChange={(e) => setSlug(makeSlug(e.target.value))}
                  placeholder="electronics"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-semibold outline-none focus:border-[#10b981] focus:bg-white focus:ring-4 focus:ring-[#10b981]/10 dark:border-white/10 dark:bg-white/[0.04] dark:text-white"
                />
                <p className="mt-1.5 text-[11px] text-slate-400">Ikoreshwa mu URL/search. Urugero: electronics.</p>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">Icon (Emoji)</label>
                  <input
                    value={icon}
                    onChange={(e) => setIcon(e.target.value)}
                    placeholder="📱"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-semibold outline-none focus:border-[#10b981] focus:bg-white focus:ring-4 focus:ring-[#10b981]/10 dark:border-white/10 dark:bg-white/[0.04] dark:text-white"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">Sort Order</label>
                  <input
                    type="number"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-semibold outline-none focus:border-[#10b981] focus:bg-white focus:ring-4 focus:ring-[#10b981]/10 dark:border-white/10 dark:bg-white/[0.04] dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">Parent Category</label>
                <select
                  value={parentId}
                  onChange={(e) => setParentId(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-semibold outline-none focus:border-[#10b981] focus:bg-white focus:ring-4 focus:ring-[#10b981]/10 dark:border-white/10 dark:bg-[#0f1716] dark:text-white"
                >
                  <option value="">Main category</option>
                  {categories.filter((c) => c.id !== editingCategory?.id).map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Sobanura ibyo iyi category ikubiyemo..."
                  className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-medium outline-none focus:border-[#10b981] focus:bg-white focus:ring-4 focus:ring-[#10b981]/10 dark:border-white/10 dark:bg-white/[0.04] dark:text-white"
                />
              </div>

              <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/[0.02] dark:hover:bg-white/[0.05]">
                <div>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Category Active</p>
                  <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">Iyo iri active, category ishobora kugaragara ku isoko.</p>
                </div>
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="h-5 w-5 accent-[#10b981]"
                />
              </label>

              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 dark:border-white/10 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeForm}
                  disabled={saving}
                  className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-[#10b981] px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-[#059669] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? "Saving..." : editingCategory ? "Save Changes" : "Create Category"}
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