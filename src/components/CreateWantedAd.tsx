import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "../services/supabase"

type Category = { id: string; name: string }

export default function CreateWantedAd() {
  const navigate = useNavigate()
  const [categories, setCategories] = useState<Category[]>([])
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [budgetMin, setBudgetMin] = useState("")
  const [budgetMax, setBudgetMax] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    void (async () => {
      const { data } = await supabase
        .from("categories")
        .select("id, name")
        .eq("is_active", true)
        .order("sort_order", { ascending: true })
      setCategories(data || [])
    })()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    if (!title.trim()) { setError("Andika icyo ushaka."); return }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      navigate("/login?redirect=/wanted/new")
      return
    }

    setSaving(true)
    try {
      const { error: insertError } = await supabase.from("wanted_ads").insert({
        title: title.trim(),
        description: description.trim() || null,
        category_id: categoryId || null,
        budget_min: budgetMin.trim() !== "" ? Number(budgetMin) : null,
        budget_max: budgetMax.trim() !== "" ? Number(budgetMax) : null,
      })

      if (insertError) throw insertError
      navigate("/wanted?posted=1")
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Habaye ikibazo."
      setError(msg)
    } finally {
      setSaving(false)
    }
  }

  const budgetPresets = [
    { label: "Munsi ya 100K", max: 100_000 },
    { label: "Munsi ya 500K", max: 500_000 },
    { label: "Munsi ya 1M", max: 1_000_000 },
    { label: "Munsi ya 5M", max: 5_000_000 },
  ]

  return (
    <main className="relative min-h-screen bg-[#f5f9fb] px-4 py-10 text-[#102436] dark:bg-[#07111c] dark:text-slate-100 sm:px-6 sm:py-14">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#569ab5]/25 bg-white/85 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.22em] text-[#39778f] dark:border-white/10 dark:bg-slate-900/75 dark:text-[#83c2dc]">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inset-0 animate-ping rounded-full bg-[#569ab5] opacity-75" />
            <span className="relative flex h-1.5 w-1.5 rounded-full bg-[#569ab5]" />
          </span>
          Icyifuzo cy'umuguzi
        </div>

        <h1 className="text-3xl font-black leading-tight tracking-tight sm:text-4xl">
          Vuga icyo{" "}
          <span className="bg-[linear-gradient(110deg,#39778f_0%,#569ab5_50%,#6ec5c9_100%)] bg-clip-text text-transparent">
            ushaka kugura.
          </span>
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-7 text-slate-600 dark:text-slate-400">
          Andika icyo ushaka n'ingengo y'imari yawe. Abagurisha babona icyifuzo cyawe, bakakugisha ibyo bafite.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div className="rounded-[1.75rem] border border-slate-200/80 bg-white/85 p-5 shadow-sm dark:border-white/10 dark:bg-slate-900/60 sm:p-7">
            <label className="text-sm font-black text-slate-900 dark:text-white">
              Ushaka iki? <span className="text-rose-500">*</span>
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={80}
              required
              placeholder="Urugero: Nshaka moto nziza itarenze miliyoni imwe"
              className="mt-2 w-full rounded-2xl border border-slate-200/80 bg-slate-50/50 px-4 py-3.5 text-sm font-bold outline-none focus:border-[#569ab5] focus:bg-white focus:ring-4 focus:ring-[#569ab5]/10 dark:border-white/10 dark:bg-white/[0.03] dark:text-white"
            />
            <div className="mt-1.5 flex justify-end">
              <span className={`text-[10px] font-bold ${title.length > 70 ? "text-amber-500" : "text-slate-400"}`}>
                {title.length}/80
              </span>
            </div>

            <label className="mt-4 block text-sm font-black text-slate-900 dark:text-white">
              Ibisobanuro (bidategetswe)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={500}
              rows={4}
              placeholder="Vuga ibintu by'ingenzi: imiterere, ibara, ingano..."
              className="mt-2 min-h-[100px] w-full resize-none rounded-2xl border border-slate-200/80 bg-slate-50/50 px-4 py-3.5 text-sm font-medium outline-none focus:border-[#569ab5] focus:bg-white focus:ring-4 focus:ring-[#569ab5]/10 dark:border-white/10 dark:bg-white/[0.03] dark:text-white"
            />
          </div>

          <div className="rounded-[1.75rem] border border-slate-200/80 bg-white/85 p-5 shadow-sm dark:border-white/10 dark:bg-slate-900/60 sm:p-7">
            <label className="text-sm font-black text-slate-900 dark:text-white">Icyiciro</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="mt-2 w-full cursor-pointer appearance-none rounded-2xl border border-slate-200/80 bg-slate-50/50 px-4 py-3.5 text-sm font-bold outline-none focus:border-[#569ab5] dark:border-white/10 dark:bg-slate-900 dark:text-white"
            >
              <option value="">Hitamo icyiciro (bidategetswe)</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>

            <label className="mt-5 block text-sm font-black text-slate-900 dark:text-white">
              Ingengo y'imari (FRW)
            </label>
            <div className="mt-2 flex flex-wrap gap-2">
              {budgetPresets.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => { setBudgetMin(""); setBudgetMax(String(p.max)) }}
                  className={`rounded-full px-3 py-1.5 text-[11px] font-bold transition ${
                    budgetMax === String(p.max) && !budgetMin
                      ? "bg-[#39778f] text-white"
                      : "border border-slate-200 bg-white/70 text-slate-600 hover:border-[#569ab5]/50 hover:text-[#39778f] dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <input
                type="number"
                min="0"
                inputMode="numeric"
                value={budgetMin}
                onChange={(e) => setBudgetMin(e.target.value)}
                placeholder="Guihera (min)"
                className="w-full rounded-2xl border border-slate-200/80 bg-slate-50/50 px-4 py-3 text-sm font-bold outline-none focus:border-[#569ab5] dark:border-white/10 dark:bg-white/[0.03] dark:text-white"
              />
              <input
                type="number"
                min="0"
                inputMode="numeric"
                value={budgetMax}
                onChange={(e) => setBudgetMax(e.target.value)}
                placeholder="Kugeza (max)"
                className="w-full rounded-2xl border border-slate-200/80 bg-slate-50/50 px-4 py-3 text-sm font-bold outline-none focus:border-[#569ab5] dark:border-white/10 dark:bg-white/[0.03] dark:text-white"
              />
            </div>
          </div>

          {error && (
            <div className="rounded-2xl border border-rose-500/25 bg-rose-500/10 p-3.5 text-sm font-bold text-rose-600 dark:text-rose-400">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="group relative w-full overflow-hidden rounded-full bg-gradient-to-r from-[#39778f] via-[#569ab5] to-[#427c94] py-4 text-center text-sm font-black text-white shadow-[0_16px_38px_-10px_rgba(57,119,143,0.65)] transition-all hover:-translate-y-0.5 hover:shadow-[0_22px_45px_-10px_rgba(57,119,143,0.85)] disabled:opacity-50"
          >
            <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
            <span className="relative">
              {saving ? "Turimo kohereza..." : "Ohereza icyifuzo"}
            </span>
          </button>
        </form>
      </div>
    </main>
  )
}