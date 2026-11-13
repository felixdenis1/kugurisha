import { useCallback, useEffect, useMemo, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { supabase } from "../services/supabase"

type Category = {
  id: string
  name: string
}

/* ──────────────────────────────────────────────────────────────────────────
   ICON SYSTEM
   ────────────────────────────────────────────────────────────────────────── */
type IconProps = { className?: string }
const Icon = {
  ArrowLeft: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
    </svg>
  ),
  ArrowRight: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
    </svg>
  ),
  Search: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
  ),
  Close: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  Grid: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
    </svg>
  ),
  List: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
  ),
  Tag: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
    </svg>
  ),
  Sparkles: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
    </svg>
  ),
  Alert: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
    </svg>
  ),
  Check: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.4} d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  ),
  Shield: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  ),
  Bolt: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
    </svg>
  ),
}

/* ──────────────────────────────────────────────────────────────────────────
   TONE PALETTE — per-index category color theming
   ────────────────────────────────────────────────────────────────────────── */
const TONES = [
  { bg: "bg-blue-500/10", text: "text-blue-600 dark:text-blue-400", tile: "bg-gradient-to-br from-blue-500 to-indigo-600", hex: "#3b82f6" },
  { bg: "bg-emerald-500/10", text: "text-emerald-600 dark:text-emerald-400", tile: "bg-gradient-to-br from-emerald-500 to-teal-600", hex: "#10b981" },
  { bg: "bg-amber-500/10", text: "text-amber-600 dark:text-amber-400", tile: "bg-gradient-to-br from-amber-500 to-orange-600", hex: "#f59e0b" },
  { bg: "bg-rose-500/10", text: "text-rose-600 dark:text-rose-400", tile: "bg-gradient-to-br from-rose-500 to-pink-600", hex: "#f43f5e" },
  { bg: "bg-purple-500/10", text: "text-purple-600 dark:text-purple-400", tile: "bg-gradient-to-br from-purple-500 to-fuchsia-600", hex: "#8b5cf6" },
  { bg: "bg-cyan-500/10", text: "text-cyan-600 dark:text-cyan-400", tile: "bg-gradient-to-br from-cyan-500 to-sky-600", hex: "#06b6d4" },
]

function toneForIndex(i: number) {
  return TONES[i % TONES.length]
}

/* Animated counter */
function useCountUp(target: number, duration = 800) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    let raf = 0
    const start = performance.now()
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - t, 3)
      setValue(Math.round(target * eased))
      if (t < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [target, duration])
  return value
}

type ViewMode = "grid" | "list"

/* ──────────────────────────────────────────────────────────────────────────
   COMPONENT
   ────────────────────────────────────────────────────────────────────────── */
function Categories() {
  const navigate = useNavigate()

  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [query, setQuery] = useState("")
  const [view, setView] = useState<ViewMode>("grid")

  const loadCategories = useCallback(async () => {
    setLoading(true); setError("")
    try {
      const { data, error: queryError } = await supabase
        .from("categories")
        .select("id, name")
        .eq("is_active", true)
        .order("sort_order", { ascending: true })

      if (queryError) throw queryError
      setCategories(data ?? [])
    } catch (err) {
      console.error("Failed to load categories:", err)
      setError("Ntibyashobotse kubona ibyiciro. Ongera ugerageze.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void loadCategories() }, [loadCategories])

  function openCategory(category: Category) {
    navigate(`/?category=${encodeURIComponent(category.name)}`)
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return categories
    return categories.filter((c) => c.name.toLowerCase().includes(q))
  }, [categories, query])

  const cCount = useCountUp(categories.length)
  const cFiltered = useCountUp(filtered.length)

  /* ─────────── LOADING ─────────── */
  if (loading) {
    return (
      <main className="min-h-screen bg-[#f4f8fb] dark:bg-[#060f19]">
        <header className="sticky top-0 z-30 border-b border-slate-200/60 bg-white/70 backdrop-blur-2xl dark:border-white/10 dark:bg-[#060f19]/70">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
            <Link to="/" className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg">
                <Icon.Tag className="w-4 h-4" />
              </span>
              <span className="text-sm font-black text-slate-900 dark:text-white">
                KUGURISHA<span className="text-blue-600 dark:text-blue-400">.COM</span>
              </span>
            </Link>
            <div className="h-9 w-24 animate-pulse rounded-full bg-slate-200 dark:bg-white/10" />
          </div>
        </header>

        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="h-40 animate-pulse rounded-[28px] bg-slate-200 dark:bg-white/10" />
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
              <div key={i} className="h-40 animate-pulse rounded-2xl border border-slate-200/70 bg-white dark:border-white/10 dark:bg-slate-900/60" />
            ))}
          </div>
        </div>
      </main>
    )
  }

  /* ─────────── MAIN ─────────── */
  return (
    <main className="min-h-screen bg-[#f4f8fb] text-[#102436] dark:bg-[#060f19] dark:text-slate-100">
      {/* Ambient glows */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-blue-500/10 blur-[140px] dark:bg-blue-500/[0.06]" />
        <div className="absolute top-1/3 -right-40 h-[600px] w-[600px] rounded-full bg-[#FF5D00]/10 blur-[140px] dark:bg-[#FF5D00]/[0.06]" />
        <div className="absolute bottom-0 left-1/3 h-[500px] w-[500px] rounded-full bg-indigo-500/10 blur-[140px] dark:bg-indigo-500/[0.04]" />
      </div>

      {/* HEADER */}
      <header className="sticky top-0 z-30 border-b border-slate-200/60 bg-white/70 backdrop-blur-2xl dark:border-white/10 dark:bg-[#060f19]/70">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3.5 sm:px-6 lg:px-8">
          <Link to="/" className="group flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30 transition-transform group-hover:scale-105">
              <Icon.Tag className="w-4 h-4" />
            </span>
            <div>
              <p className="text-sm font-black tracking-tight text-slate-900 dark:text-white">
                KUGURISHA
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-indigo-400">.COM</span>
              </p>
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Ibyiciro</p>
            </div>
          </Link>

          <Link
            to="/"
            className="group inline-flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-white px-3.5 py-2 text-xs font-extrabold text-slate-700 shadow-sm transition hover:border-[#FF5D00] hover:text-[#FF5D00] dark:border-white/10 dark:bg-white/[0.06] dark:text-slate-200"
          >
            <Icon.ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
            Ahabanza
          </Link>
        </div>
      </header>

      <section className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {/* HERO */}
        <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#0a0f1e] via-[#0d1526] to-[#0a0f1e] p-6 text-white shadow-[0_30px_80px_-25px_rgba(10,15,30,0.6)] sm:p-8">
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-blue-500/30 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-10 h-52 w-52 rounded-full bg-[#FF5D00]/25 blur-3xl" />
          <div className="pointer-events-none absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "22px 22px" }} />

          <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-slate-300 backdrop-blur">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inset-0 animate-ping rounded-full bg-blue-400 opacity-75" />
                  <span className="relative flex h-2 w-2 rounded-full bg-blue-400" />
                </span>
                <Icon.Grid className="w-3 h-3" />
                Shakisha ku byiciro
              </div>

              <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
                Ibyiciro
                <span className="ml-2 bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">byose</span>
              </h1>

              <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-300">
                Hitamo icyiciro cy'ibicuruzwa ushaka kureba, ushakishe ibyo ukeneye ku isoko ryo mu Rwanda.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 backdrop-blur">
                <p className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-blue-400">
                  <Icon.Grid className="w-2.5 h-2.5" />
                  Byose
                </p>
                <p className="mt-0.5 text-2xl font-black text-white">{cCount}</p>
              </div>
            </div>
          </div>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mt-5 flex items-center gap-2 rounded-2xl border border-rose-500/25 bg-rose-500/10 px-4 py-3 text-sm font-bold text-rose-600 dark:text-rose-400">
            <Icon.Alert className="w-4 h-4 shrink-0" />
            <span className="flex-1">{error}</span>
            <button
              type="button"
              onClick={() => void loadCategories()}
              className="shrink-0 rounded-full bg-rose-500 px-3 py-1 text-[11px] font-black text-white transition hover:bg-rose-600"
            >
              Ongera
            </button>
          </div>
        )}

        {/* EMPTY (no categories at all) */}
        {!error && categories.length === 0 && (
          <div className="mt-6 overflow-hidden rounded-[28px] border border-slate-200/70 bg-white/90 p-6 py-16 text-center shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-slate-900/60 sm:px-10">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-500/15 to-indigo-500/10 text-blue-500">
              <Icon.Grid className="w-9 h-9" />
            </div>
            <h2 className="mt-6 text-2xl font-black text-slate-900 dark:text-white">Nta byiciro bihari ubu</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
              Ibyiciro bizagaragara hano igihe bizaba biri muri sisitemu.
            </p>
            <Link
              to="/"
              className="group mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#FF5D00] via-[#FF7424] to-[#e05200] px-6 py-3 text-sm font-black text-white shadow-lg shadow-[#FF5D00]/30 transition hover:-translate-y-0.5"
            >
              Subira Ahabanza
              <Icon.ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        )}

        {/* TOOLBAR + GRID / LIST */}
        {!error && categories.length > 0 && (
          <>
            {/* Toolbar */}
            <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-slate-200/70 bg-white/70 p-3.5 backdrop-blur-sm dark:border-white/10 dark:bg-slate-900/60 sm:flex-row sm:items-center sm:justify-between">
              {/* Search */}
              <div className="relative flex-1">
                <Icon.Search className="pointer-events-none absolute left-3.5 top-1/2 w-3.5 h-3.5 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Shakisha icyiciro..."
                  className="w-full rounded-full border border-slate-200/80 bg-slate-50/70 pl-9 pr-9 py-2 text-xs font-bold text-slate-900 outline-none transition-all placeholder:font-semibold placeholder:text-slate-400 focus:border-[#FF5D00] focus:bg-white focus:ring-4 focus:ring-[#FF5D00]/10 dark:border-white/10 dark:bg-white/[0.03] dark:text-white dark:placeholder:text-slate-500"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    className="absolute right-2.5 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full bg-slate-200/70 text-slate-500 transition hover:bg-slate-300 dark:bg-white/10 dark:text-slate-300"
                  >
                    <Icon.Close className="w-2.5 h-2.5" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-black text-slate-600 dark:bg-white/[0.06] dark:text-slate-300">
                  {cFiltered} {filtered.length === 1 ? "icyiciro" : "ibyiciro"}
                </span>

                <div className="flex rounded-full border border-slate-200 bg-white p-0.5 dark:border-white/10 dark:bg-white/[0.06]">
                  {[
                    { key: "grid" as ViewMode, icon: Icon.Grid },
                    { key: "list" as ViewMode, icon: Icon.List },
                  ].map(({ key, icon: VIcon }) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setView(key)}
                      className={`flex h-7 w-7 items-center justify-center rounded-full transition ${
                        view === key ? "bg-[#102436] text-white shadow-sm dark:bg-[#FF5D00]" : "text-slate-500 hover:text-slate-900 dark:text-slate-400"
                      }`}
                    >
                      <VIcon className="w-3.5 h-3.5" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Filter empty */}
            {filtered.length === 0 ? (
              <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-white/50 py-16 text-center dark:border-white/15 dark:bg-slate-900/40">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-white/[0.05]">
                  <Icon.Search className="w-6 h-6" />
                </div>
                <p className="mt-3 text-sm font-bold text-slate-600 dark:text-slate-300">
                  Nta cyiciro cyabonetse
                </p>
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="mt-3 text-xs font-black text-[#FF5D00] hover:underline"
                >
                  Kuraho gushakisha
                </button>
              </div>
            ) : view === "grid" ? (
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {filtered.map((category, index) => {
                  const tone = toneForIndex(index)
                  return (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => openCategory(category)}
                      className="group relative flex min-h-[150px] flex-col items-start overflow-hidden rounded-2xl border border-slate-200/70 bg-white/90 p-4 text-left shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-xl dark:border-white/10 dark:bg-slate-900/60 dark:hover:border-white/20 sm:min-h-[165px] sm:rounded-3xl sm:p-5"
                    >
                      {/* Colored blob */}
                      <div className={`pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full ${tone.bg} blur-2xl transition group-hover:scale-125`} />

                      <div className={`relative flex h-11 w-11 items-center justify-center rounded-xl ${tone.bg} ${tone.text} transition duration-300 group-hover:${tone.tile} group-hover:text-white`}>
                        <Icon.Tag className="w-5 h-5" />
                      </div>

                      <span className="relative mt-4 line-clamp-2 text-sm font-black leading-5 text-slate-900 dark:text-white">
                        {category.name}
                      </span>

                      <span className={`relative mt-auto flex items-center gap-1.5 pt-4 text-[11px] font-black ${tone.text}`}>
                        Reba ibicuruzwa
                        <Icon.ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </button>
                  )
                })}
              </div>
            ) : (
              <div className="mt-4 space-y-2">
                {filtered.map((category, index) => {
                  const tone = toneForIndex(index)
                  return (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => openCategory(category)}
                      className="group flex w-full items-center gap-3 rounded-2xl border border-slate-200/70 bg-white/90 p-3 text-left shadow-sm backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg dark:border-white/10 dark:bg-slate-900/60 dark:hover:border-white/20 sm:p-4"
                    >
                      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${tone.bg} ${tone.text} transition-transform group-hover:scale-105`}>
                        <Icon.Tag className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-black text-slate-900 dark:text-white">
                          {category.name}
                        </p>
                        <p className={`text-[10px] font-bold uppercase tracking-wider ${tone.text}`}>
                          Icyiciro
                        </p>
                      </div>
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition group-hover:bg-[#FF5D00] group-hover:text-white dark:bg-white/[0.06]">
                        <Icon.ArrowRight className="w-3 h-3" />
                      </span>
                    </button>
                  )
                })}
              </div>
            )}

            {/* Trust footer */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[11px] font-semibold text-slate-400">
              <span className="flex items-center gap-1.5">
                <Icon.Shield className="w-3.5 h-3.5 text-emerald-500" />
                Umutekano
              </span>
              <span className="flex items-center gap-1.5">
                <Icon.Bolt className="w-3.5 h-3.5 text-[#FF5D00]" />
                Byihuse
              </span>
              <span className="flex items-center gap-1.5">
                <Icon.Sparkles className="w-3.5 h-3.5 text-blue-500" />
                {categories.length} ibyiciro byose
              </span>
            </div>
          </>
        )}
      </section>
    </main>
  )
}

export default Categories