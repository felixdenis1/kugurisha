import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { supabase } from "../services/supabase"

type WantedAd = {
  id: string
  user_id: string
  title: string
  description: string | null
  category_id: string | null
  budget_min: number | null
  budget_max: number | null
  currency: string
  created_at: string
  profiles: { full_name: string | null } | null
  categories: { name: string } | null
}

function timeAgo(iso: string, now: number): string {
  const diff = Math.max(0, Math.floor((now - new Date(iso).getTime()) / 1000))
  if (diff < 60) return "ubu"
  const min = Math.floor(diff / 60)
  if (min < 60) return `${min}m ishize`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr}h ishize`
  const d = Math.floor(hr / 24)
  return `${d}d ishize`
}

function displayName(ad: WantedAd): string {
  const full = ad.profiles?.full_name?.trim() || ""
  if (!full) return "Umuguzi"
  const parts = full.split(/\s+/)
  if (parts.length === 1) return parts[0]
  return `${parts[0]} ${parts[parts.length - 1][0]}.`
}

function formatBudget(ad: WantedAd): string {
  const fmt = (n: number) => `${n.toLocaleString("en-US")}`
  if (ad.budget_min && ad.budget_max) {
    return `${fmt(ad.budget_min)} – ${fmt(ad.budget_max)} ${ad.currency}`
  }
  if (ad.budget_max) return `Munsi ya ${fmt(ad.budget_max)} ${ad.currency}`
  if (ad.budget_min) return `Hejuru ya ${fmt(ad.budget_min)} ${ad.currency}`
  return "Igiciro kigaragara"
}

export default function WantedFeed({ limit }: { limit?: number }) {
  const [ads, setAds] = useState<WantedAd[]>([])
  const [loading, setLoading] = useState(true)
  const [nowTick, setNowTick] = useState(Date.now())
  const [filterCategory, setFilterCategory] = useState("")
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    void supabase.auth.getUser().then(({ data: { user } }) => {
      setCurrentUserId(user?.id ?? null)
    })
    void loadAds()

    const channel = supabase
      .channel("wanted-feed")
      .on("postgres_changes", { event: "*", schema: "public", table: "wanted_ads" }, () => void loadAds())
      .subscribe()
    const tick = setInterval(() => setNowTick(Date.now()), 30_000)
    return () => {
      clearInterval(tick)
      void supabase.removeChannel(channel)
    }
  }, [])

  async function loadAds() {
    try {
      const query = supabase
        .from("wanted_ads")
        .select(`
          id, user_id, title, description, category_id, budget_min, budget_max,
          currency, created_at,
          categories(name)
        `)
        .eq("status", "active")
        .order("created_at", { ascending: false })
      if (limit) query.limit(limit)
      const { data, error } = await query
      if (error) throw error

      const rows = data || []
      const userIds = [...new Set(rows.map((r: any) => r.user_id).filter(Boolean))]
      const profilesRes = userIds.length > 0
        ? await supabase.from("profiles").select("id, full_name").in("id", userIds)
        : { data: [] as { id: string; full_name: string | null }[] }

      const profileMap = new Map((profilesRes.data || []).map((p) => [p.id, p]))
      const enriched = rows.map((row: any) => {
        const profile = profileMap.get(row.user_id) ?? null
        const cat = Array.isArray(row.categories) ? row.categories[0] ?? null : row.categories ?? null
        return { ...row, profiles: profile, categories: cat }
      })
      setAds(enriched as WantedAd[])
    } catch (err) {
      console.error("WantedFeed load failed:", err)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Urashaka gusiba iki cyifuzo?")) return
    setDeletingId(id)
    const { error } = await supabase
      .from("wanted_ads")
      .delete()
      .eq("id", id)
      .eq("user_id", currentUserId)
    if (error) {
      console.error("Delete failed:", error)
      alert("Habaye ikibazo mu gusiba icyifuzo.")
    } else {
      setAds((prev) => prev.filter((ad) => ad.id !== id))
    }
    setDeletingId(null)
  }

  const categoriesInFeed = useMemo(() => {
    const map = new Map<string, string>()
    ads.forEach((a) => a.categories?.name && map.set(a.category_id || "", a.categories.name))
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }))
  }, [ads])

  const filtered = useMemo(
    () => (filterCategory ? ads.filter((a) => a.category_id === filterCategory) : ads),
    [ads, filterCategory],
  )

  return (
    <section className="relative isolate overflow-hidden bg-[#f4f7f6] py-20 dark:bg-[#0a1210] sm:py-24 lg:py-28">
      {/* Ambient Background Mesh */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-40 top-0 h-[500px] w-[500px] rounded-full bg-[#4ade80]/10 blur-[120px] dark:bg-[#4ade80]/5" />
        <div className="absolute -left-40 bottom-0 h-[500px] w-[500px] rounded-full bg-[#374151]/10 blur-[120px] dark:bg-[#374151]/5" />
        <div 
          className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05]"
          style={{
            backgroundImage: "radial-gradient(#1f2937 1px, transparent 1px)",
            backgroundSize: "32px 32px"
          }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* 2-COLUMN GRID */}
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16 xl:gap-24">
          
          {/* LEFT DIV: Editorial Text */}
          <div className="flex flex-col justify-center">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[#475569]/20 bg-white/60 px-3 py-1.5 shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-white/5">
              <span className="relative flex h-2 w-2">
                <span className="absolute inset-0 animate-ping rounded-full bg-[#10b981] opacity-75" />
                <span className="relative flex h-2 w-2 rounded-full bg-[#10b981]" />
              </span>
              <span className="text-[10px] font-black uppercase tracking-[0.22em] text-[#475569] dark:text-[#94a3b8]">
                Isoko ry'ibyifuzo
              </span>
            </div>

            <h2 className="mt-6 text-4xl font-black leading-[1.05] tracking-[-0.03em] text-slate-900 dark:text-white sm:text-5xl">
              Abaguzi bavuga <br />
              <span className="bg-[linear-gradient(110deg,#475569_0%,#10b981_70%,#059669_100%)] bg-clip-text text-transparent">
                ibyo bashaka.
              </span>
            </h2>

            <p className="mt-5 max-w-md text-base leading-8 text-slate-600 dark:text-slate-400">
              Niba ufite ikintu gikwiriye icyifuzo cy'umuguzi, mwunganire ubu. 
              Cyangwa nawe vuga icyo ushaka kugura ubone abagurisha bakugisha.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/wanted/new"
                className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full bg-[#1f2937] px-6 py-3.5 text-sm font-black text-white shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl dark:bg-[#10b981]"
              >
                <span className="pointer-events-none absolute inset-0 -translate-x-full bg-[linear-gradient(115deg,transparent_35%,rgba(255,255,255,.2)_50%,transparent_65%)] transition-transform duration-700 group-hover:translate-x-full" />
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.4}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Vuga icyo ushaka
              </Link>
              
              <Link
                to="/wanted"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 bg-white/50 px-6 py-3.5 text-sm font-bold text-slate-700 backdrop-blur-sm transition-all hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
              >
                Reba byose
              </Link>
            </div>

            {/* Trust / Info Line */}
            <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-slate-200/60 pt-6 dark:border-white/10">
              <span className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <svg className="h-4 w-4 text-[#10b981]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.4}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Byoroshye gukoresha
              </span>
              <span className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <svg className="h-4 w-4 text-[#10b981]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.4}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Byihuse
              </span>
            </div>
          </div>

          {/* RIGHT DIV: The Feed */}
          <div className="flex min-w-0 flex-col">
            {/* Header of the feed area */}
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inset-0 animate-ping rounded-full bg-[#10b981] opacity-75" />
                  <span className="relative flex h-2.5 w-2.5 rounded-full bg-[#10b981]" />
                </span>
                <h3 className="text-sm font-black tracking-tight text-slate-900 dark:text-white sm:text-base">
                  Ibyifuzo bishya
                </h3>
                {!loading && (
                  <span className="rounded-full bg-slate-200/50 px-2 py-0.5 text-[10px] font-black text-slate-600 dark:bg-white/10 dark:text-slate-300">
                    {filtered.length}
                  </span>
                )}
              </div>
            </div>

            {/* Category Filters */}
            {categoriesInFeed.length > 0 && (
              <div className="mb-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setFilterCategory("")}
                  className={`rounded-full px-3 py-1.5 text-[11px] font-bold transition ${
                    !filterCategory
                      ? "bg-[#475569] text-white shadow-sm dark:bg-[#10b981]"
                      : "border border-slate-200 bg-white/70 text-slate-600 hover:border-slate-300 dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
                  }`}
                >
                  Byose
                </button>
                {categoriesInFeed.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setFilterCategory(c.id)}
                    className={`rounded-full px-3 py-1.5 text-[11px] font-bold transition ${
                      filterCategory === c.id
                        ? "bg-[#475569] text-white shadow-sm dark:bg-[#10b981]"
                        : "border border-slate-200 bg-white/70 text-slate-600 hover:border-slate-300 dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            )}

            {/* Feed Content */}
            {loading ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-36 animate-pulse rounded-2xl bg-slate-200/50 dark:bg-white/5" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-white/40 p-8 py-14 text-center dark:border-white/10 dark:bg-white/[0.02]">
                <svg className="mx-auto mb-3 h-10 w-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
                <h4 className="font-black text-slate-800 dark:text-slate-200">Nta cyifuzo kirimo</h4>
                <p className="mt-1 text-xs text-slate-500">Ba wa mbere uvuga icyo ushaka kugura.</p>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {filtered.map((ad) => (
                  <article
                    key={ad.id}
                    className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white/80 p-4 shadow-sm transition-all hover:-translate-y-1 hover:border-[#10b981]/40 hover:shadow-lg dark:border-white/10 dark:bg-[#0f1716]/80"
                  >
                    {/* Header: Name + Time + Delete */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#475569] to-[#334155] text-[10px] font-black text-white shadow-sm">
                          {displayName(ad).charAt(0)}
                        </div>
                        <div>
                          <p className="text-xs font-black text-slate-900 dark:text-white">
                            {displayName(ad)}
                          </p>
                          <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500">
                            {timeAgo(ad.created_at, nowTick)}
                          </p>
                        </div>
                      </div>
                      
                      {currentUserId === ad.user_id && (
                        <button
                          type="button"
                          onClick={() => handleDelete(ad.id)}
                          disabled={deletingId === ad.id}
                          className="flex h-6 w-6 items-center justify-center rounded-full text-slate-400 transition hover:bg-rose-500/10 hover:text-rose-500 disabled:opacity-50"
                          aria-label="Siba icyifuzo"
                        >
                          {deletingId === ad.id ? (
                            <span className="h-3 w-3 animate-spin rounded-full border-2 border-rose-500 border-t-transparent" />
                          ) : (
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.4}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                            </svg>
                          )}
                        </button>
                      )}
                    </div>

                    {/* Body: What they are looking for */}
                    <div className="mt-3 flex-1">
                      <h4 className="line-clamp-2 text-sm font-black leading-tight text-slate-900 dark:text-white group-hover:text-[#10b981] transition-colors">
                        {ad.title}
                      </h4>
                      {ad.description && (
                        <p className="mt-1 line-clamp-2 text-[10px] font-medium leading-relaxed text-slate-500 dark:text-slate-400">
                          {ad.description}
                        </p>
                      )}
                    </div>

                    {/* Footer: Budget */}
                    <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-white/5">
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-black text-[#059669] dark:text-[#34d399]">
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.4}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {formatBudget(ad)}
                      </span>
                      {ad.categories?.name && (
                        <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold text-slate-500 dark:bg-white/5 dark:text-slate-400">
                          {ad.categories.name}
                        </span>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}