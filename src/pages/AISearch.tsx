import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { supabase } from "../services/supabase"

type Listing = {
  id: string
  title: string
  description: string | null
  price: number | null
  currency: string
  condition: string
  status: string
  listing_type: string
  category: { name: string; slug: string } | null
  location: {
    province: string
    district: string | null
    sector: string | null
  } | null
}

type SearchIntent = {
  search_text: string
  min_price: number | null
  max_price: number | null
  location: string
  category: string
  condition: string
  listing_type: string
}

type LocalIntent = {
  keyword: string
  maxPrice: number | null
  minPrice: number | null
  location: string | null
  words: string[]
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
  Sparkles: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
    </svg>
  ),
  Bolt: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
    </svg>
  ),
  Brain: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
    </svg>
  ),
  Tag: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
    </svg>
  ),
  Pin: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
    </svg>
  ),
  Filter: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
    </svg>
  ),
  Check: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.4} d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  ),
  Alert: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
    </svg>
  ),
  Clock: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Shield: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  ),
  Image: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
  ),
  Refresh: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
    </svg>
  ),
  Store: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" />
    </svg>
  ),
}

/* Animated counter */
function useCountUp(target: number, duration = 700) {
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

/* ──────────────────────────────────────────────────────────────────────────
   MAIN COMPONENT
   ────────────────────────────────────────────────────────────────────────── */
export default function AISearch() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<Listing[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [error, setError] = useState("")
  const [aiIntent, setAiIntent] = useState<SearchIntent | null>(null)
  const [aiStatus, setAiStatus] = useState("")
  const [thinkingStep, setThinkingStep] = useState(0)

  function normalizeText(value: string) {
    return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim()
  }

  function parsePrice(value: string) {
    const normalized = value.toLowerCase().replace(/,/g, "").replace(/\s/g, "")
    const match = normalized.match(/(\d+(?:\.\d+)?)(m|miliyoni|million|k|kuko|rwf)?/)
    if (!match) return null
    let number = Number(match[1])
    const unit = match[2]
    if (unit === "k" || unit === "kuko") number *= 1000
    if (unit === "m" || unit === "miliyoni" || unit === "million") number *= 1000000
    return Number.isFinite(number) ? number : null
  }

  function parseLocalIntent(input: string): LocalIntent {
    const text = normalizeText(input)
    const words = text.split(/\s+/).filter((word) => word.length >= 2)
    let maxPrice: number | null = null
    let minPrice: number | null = null

    const maxPatterns = [
      /munsi ya\s+(\d[\d.,]*(?:k|m|miliyoni|million)?)/i,
      /itarenze\s+(\d[\d.,]*(?:k|m|miliyoni|million)?)/i,
      /kugeza kuri\s+(\d[\d.,]*(?:k|m|miliyoni|million)?)/i,
      /atarenze\s+(\d[\d.,]*(?:k|m|miliyoni|million)?)/i,
      /under\s+(\d[\d.,]*(?:k|m|miliyoni|million)?)/i,
      /below\s+(\d[\d.,]*(?:k|m|miliyoni|million)?)/i,
    ]
    for (const pattern of maxPatterns) {
      const match = text.match(pattern)
      if (match) { maxPrice = parsePrice(match[1]); break }
    }

    const minPatterns = [
      /hejuru ya\s+(\d[\d.,]*(?:k|m|miliyoni|million)?)/i,
      /urenze\s+(\d[\d.,]*(?:k|m|miliyoni|million)?)/i,
      /guhera kuri\s+(\d[\d.,]*(?:k|m|miliyoni|million)?)/i,
      /above\s+(\d[\d.,]*(?:k|m|miliyoni|million)?)/i,
    ]
    for (const pattern of minPatterns) {
      const match = text.match(pattern)
      if (match) { minPrice = parsePrice(match[1]); break }
    }

    const locationNames = ["kigali", "gasabo", "kicukiro", "nyarugenge", "musanze", "rubavu", "huye", "nyamagabe", "muhanga", "kamonyi", "bugesera", "rwamagana", "kayonza", "ngoma", "gicumbi", "nyagatare", "ruhango", "gisagara", "karongi", "rusizi"]
    const location = locationNames.find((l) => text.includes(l)) || null

    const ignoredWords = new Set(["ndashaka", "ndifuza", "nshaka", "gushaka", "kugura", "kugurisha", "iri", "iriho", "munsi", "yarenze", "itarenze", "kugeza", "kuri", "hejuru", "ya", "mu", "muri", "ku", "kandi", "cyangwa", "the", "and", "with", "under", "below", "above", "in", "from", "rw", "rwf"])
    const usefulWords = words.filter((w) => !ignoredWords.has(w) && !/^\d/.test(w) && w.length >= 3)
    const keyword = usefulWords.slice(0, 4).join(" ")

    return { keyword, maxPrice, minPrice, location, words: usefulWords }
  }

  async function askAI(cleanQuery: string): Promise<SearchIntent | null> {
    try {
      setAiStatus("AI iri gusobanura ibyo ushaka...")
      const { data, error } = await supabase.functions.invoke("ai-assistant", { body: { query: cleanQuery } })
      if (error) { console.error("AI function error:", error); return null }
      if (!data || !data.intent) return null
      const intent = data.intent as SearchIntent
      return {
        search_text: intent.search_text || "",
        min_price: typeof intent.min_price === "number" ? intent.min_price : null,
        max_price: typeof intent.max_price === "number" ? intent.max_price : null,
        location: intent.location || "",
        category: intent.category || "",
        condition: intent.condition || "",
        listing_type: intent.listing_type || "",
      }
    } catch (error) {
      console.error("AI request error:", error)
      return null
    } finally {
      setAiStatus("")
    }
  }

  async function searchListings() {
    const cleanQuery = query.trim()
    if (!cleanQuery) {
      setResults([]); setSearched(false); setAiIntent(null)
      setError("Andika icyo ushaka mbere yo gushakisha.")
      return
    }

    setLoading(true); setError(""); setSearched(true); setResults([]); setAiIntent(null)
    setThinkingStep(0)

    const stepInterval = setInterval(() => {
      setThinkingStep((s) => Math.min(s + 1, 3))
    }, 500)

    try {
      const aiResult = await askAI(cleanQuery)
      let searchIntent: SearchIntent

      if (aiResult) {
        searchIntent = aiResult
        setAiIntent(aiResult)
      } else {
        const local = parseLocalIntent(cleanQuery)
        searchIntent = {
          search_text: local.keyword,
          min_price: local.minPrice,
          max_price: local.maxPrice,
          location: local.location || "",
          category: "",
          condition: "",
          listing_type: "",
        }
        setAiIntent(searchIntent)
      }

      let builder = supabase
        .from("listings")
        .select(`
          id, title, description, price, currency, condition, status, listing_type,
          category:categories ( name, slug ),
          location:locations ( province, district, sector )
        `)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(100)

      if (searchIntent.max_price !== null) builder = builder.lte("price", searchIntent.max_price)
      if (searchIntent.min_price !== null) builder = builder.gte("price", searchIntent.min_price)
      if (searchIntent.listing_type) builder = builder.eq("listing_type", searchIntent.listing_type)
      if (searchIntent.condition) builder = builder.eq("condition", searchIntent.condition)

      const { data, error: searchError } = await builder
      if (searchError) {
        console.error("Supabase listing search error:", searchError)
        setError("Search yanze. Ongera ugerageze.")
        setResults([])
        return
      }

      let filtered = (data || []).map((listing) => ({
        ...listing,
        category: Array.isArray(listing.category) ? listing.category[0] || null : listing.category || null,
        location: Array.isArray(listing.location) ? listing.location[0] || null : listing.location || null,
      })) as Listing[]

      if (searchIntent.category) {
        const cs = normalizeText(searchIntent.category)
        filtered = filtered.filter((l) => {
          const ct = normalizeText([l.category?.name || "", l.category?.slug || ""].join(" "))
          return ct.includes(cs) || cs.includes(ct)
        })
      }
      if (searchIntent.location) {
        const ls = normalizeText(searchIntent.location)
        filtered = filtered.filter((l) => {
          const lt = normalizeText([l.location?.province || "", l.location?.district || "", l.location?.sector || ""].join(" "))
          return lt.includes(ls)
        })
      }
      if (searchIntent.search_text) {
        const sw = normalizeText(searchIntent.search_text).split(/\s+/).filter((w) => w.length >= 2)
        if (sw.length > 0) {
          filtered = filtered.filter((l) => {
            const st = normalizeText([l.title, l.description || "", l.category?.name || "", l.category?.slug || ""].join(" "))
            return sw.some((w) => st.includes(w))
          })
        }
      }

      setResults(filtered)
    } catch (err) {
      console.error("Search exception:", err)
      setError("Hari ikibazo cyabaye muri search.")
      setResults([])
    } finally {
      clearInterval(stepInterval)
      setLoading(false)
    }
  }

  function formatPrice(price: number | null, currency: string) {
    if (price === null) return "Saba igiciro"
    return `${new Intl.NumberFormat("en-RW").format(price)} ${currency}`
  }

  function formatCondition(condition: string) {
    const n = normalizeText(condition)
    if (n === "new") return "Bishya"
    if (n === "used") return "Byakoreshejwe"
    if (n === "refurbished") return "Byavuguruwe"
    if (n === "not_applicable") return ""
    return condition
  }

  function formatListingType(type: string) {
    const n = normalizeText(type)
    if (n === "sale") return "Kugurisha"
    if (n === "free") return "Ubuntu"
    if (n === "rent") return "Ubukode"
    return type
  }

  const examples = [
    "Ndashaka iPhone munsi ya 500k",
    "Laptop munsi ya 400k mu Kigali",
    "Imodoka iri hejuru ya 5m",
  ]

  const cResults = useCountUp(results.length)

  const thinkingSteps = [
    { label: "Kumva icyo ushaka", icon: Icon.Brain },
    { label: "Gusesengura ibisabwa", icon: Icon.Filter },
    { label: "Gushakisha ku isoko", icon: Icon.Search },
    { label: "Gutunganya ibisubizo", icon: Icon.Sparkles },
  ]

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f4f8fb] text-[#102436] dark:bg-[#060f19] dark:text-slate-100">
      {/* Ambient glows */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-blue-500/10 blur-[140px] dark:bg-blue-500/[0.06]" />
        <div className="absolute top-1/3 -right-40 h-[600px] w-[600px] rounded-full bg-[#FF5D00]/10 blur-[140px] dark:bg-[#FF5D00]/[0.06]" />
        <div className="absolute bottom-0 left-1/3 h-[500px] w-[500px] rounded-full bg-indigo-500/10 blur-[140px] dark:bg-indigo-500/[0.04]" />
      </div>

      {/* HEADER */}
      <header className="sticky top-0 z-40 border-b border-slate-200/60 bg-white/70 backdrop-blur-2xl dark:border-white/10 dark:bg-[#060f19]/70">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6 lg:px-8">
          <Link to="/" className="group flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30 transition-transform group-hover:scale-105">
              <Icon.Tag className="w-4 h-4" />
            </span>
            <div>
              <p className="text-sm font-black tracking-tight text-slate-900 dark:text-white">
                KUGURISHA
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">.COM</span>
              </p>
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">AI Search</p>
            </div>
          </Link>

          <div className="flex items-center gap-1.5">
            <span className="hidden items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 sm:inline-flex">
              <Icon.Bolt className="w-3 h-3" />
              AI Active
            </span>
            <Link
              to="/"
              className="group inline-flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-white px-3.5 py-2 text-xs font-extrabold text-slate-700 shadow-sm transition hover:border-[#FF5D00] hover:text-[#FF5D00] dark:border-white/10 dark:bg-white/[0.06] dark:text-slate-200"
            >
              <Icon.ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
              Ahabanza
            </Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-4xl px-4 pt-10 pb-6 sm:px-6 lg:pt-14">
          <div className="text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/70 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-blue-600 backdrop-blur dark:border-white/10 dark:bg-white/[0.06] dark:text-blue-400">
              <span className="relative flex h-2 w-2">
                <span className="absolute inset-0 animate-ping rounded-full bg-blue-500 opacity-75" />
                <span className="relative flex h-2 w-2 rounded-full bg-blue-500" />
              </span>
              <Icon.Sparkles className="w-3 h-3" />
              AI Search ya KUGURISHA
            </div>

            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white sm:text-5xl lg:text-6xl">
              Bwira AI icyo
              <span className="ml-2 bg-gradient-to-r from-[#FF5D00] via-[#FF7424] to-[#e05200] bg-clip-text text-transparent">
                ushaka kugura
              </span>
            </h1>

            <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-slate-600 dark:text-slate-400 sm:text-base">
              Andika ibyo ushaka mu buryo busanzwe. AI irabisesengura, igashaka mu bicuruzwa biri ku isoko.
            </p>
          </div>

          {/* SEARCH BOX */}
          <div className="mx-auto mt-8 max-w-3xl">
            <div className="rounded-3xl border border-slate-200/70 bg-white/90 p-2 shadow-[0_20px_50px_-20px_rgba(16,36,54,0.3)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/80">
              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="relative flex-1">
                  <Icon.Search className="pointer-events-none absolute left-4 top-1/2 w-5 h-5 -translate-y-1/2 text-slate-400" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") void searchListings() }}
                    placeholder="Urugero: Ndashaka iPhone munsi ya 500k mu Kigali"
                    className="min-h-14 w-full rounded-2xl bg-transparent pl-12 pr-4 text-sm font-bold text-slate-900 outline-none placeholder:font-medium placeholder:text-slate-400 dark:text-white dark:placeholder:text-slate-500"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => void searchListings()}
                  disabled={loading}
                  className="group relative flex min-h-14 items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-[#FF5D00] via-[#FF7424] to-[#e05200] px-7 text-xs font-black text-white shadow-lg shadow-[#FF5D00]/30 transition hover:-translate-y-0.5 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                  {loading ? (
                    <>
                      <span className="relative h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                      <span className="relative">Irashakisha...</span>
                    </>
                  ) : (
                    <>
                      <Icon.Sparkles className="relative w-4 h-4" />
                      <span className="relative">Shakisha</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* EXAMPLES */}
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {examples.map((example) => (
                <button
                  key={example}
                  type="button"
                  onClick={() => setQuery(example)}
                  className="group inline-flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-white/70 px-3.5 py-1.5 text-[11px] font-semibold text-slate-600 backdrop-blur transition hover:border-[#FF5D00]/40 hover:bg-[#FF5D00]/[0.04] hover:text-[#FF5D00] dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300"
                >
                  <Icon.Bolt className="w-3 h-3 text-[#FF5D00]" />
                  {example}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* MAIN */}
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {/* AI THINKING PIPELINE */}
        {loading && (
          <div className="mx-auto mb-6 max-w-3xl">
            <div className="overflow-hidden rounded-3xl border border-slate-200/70 bg-white/90 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/80">
              <div className="border-b border-slate-100 bg-gradient-to-r from-blue-500/[0.06] to-indigo-500/[0.03] px-5 py-4 dark:border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30">
                    <Icon.Brain className="w-5 h-5" />
                    <span className="absolute inset-0 animate-ping rounded-xl border-2 border-blue-500/40" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">
                      AI Assistant
                    </p>
                    <p className="text-sm font-black text-slate-900 dark:text-white">
                      {aiStatus || "Irakumva..."}
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-5">
                <div className="space-y-2.5">
                  {thinkingSteps.map((step, i) => {
                    const StepIcon = step.icon
                    const isDone = thinkingStep > i
                    const isActive = thinkingStep === i
                    return (
                      <div key={step.label} className="flex items-center gap-2.5">
                        <span className={`flex h-7 w-7 items-center justify-center rounded-full transition-all ${
                          isDone
                            ? "bg-emerald-500 text-white shadow-sm"
                            : isActive
                            ? "bg-blue-500 text-white shadow-md animate-pulse"
                            : "bg-slate-100 text-slate-400 dark:bg-white/[0.06]"
                        }`}>
                          {isDone ? <Icon.Check className="w-3.5 h-3.5" /> : <StepIcon className="w-3.5 h-3.5" />}
                        </span>
                        <span className={`text-xs font-bold ${isDone ? "text-emerald-600 dark:text-emerald-400" : isActive ? "text-slate-900 dark:text-white" : "text-slate-400"}`}>
                          {step.label}
                        </span>
                        {isActive && (
                          <span className="ml-auto flex h-4 gap-1">
                            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-500 [animation-delay:-0.3s]" />
                            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-500 [animation-delay:-0.15s]" />
                            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-500" />
                          </span>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ERROR */}
        {error && !loading && (
          <div className="mx-auto mb-6 max-w-3xl">
            <div className="flex items-start gap-3 rounded-2xl border border-amber-500/25 bg-amber-500/10 p-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
                <Icon.Alert className="w-4 h-4" />
              </span>
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-400">
                  Icyitonderwa
                </p>
                <p className="mt-0.5 text-xs font-semibold text-amber-800/90 dark:text-amber-200/90">
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* AI INTENT INTERPRETATION */}
        {searched && !loading && aiIntent && (
          <section className="mx-auto mb-6 max-w-3xl">
            <div className="overflow-hidden rounded-3xl border border-slate-200/70 bg-white/90 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/80">
              <div className="border-b border-slate-100 bg-gradient-to-r from-blue-500/[0.06] to-indigo-500/[0.03] px-5 py-3.5 dark:border-white/10">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md">
                      <Icon.Brain className="w-4 h-4" />
                    </span>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400">
                        AI yumvise
                      </p>
                      <p className="text-xs font-black text-slate-900 dark:text-white">Ibyo ushaka</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setQuery(""); setSearched(false); setResults([]); setAiIntent(null); setError("") }}
                    className="flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-black text-slate-500 transition hover:border-[#FF5D00] hover:text-[#FF5D00] dark:border-white/10 dark:bg-white/[0.06] dark:text-slate-400"
                  >
                    <Icon.Refresh className="w-3 h-3" />
                    Gishya
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 p-4">
                {aiIntent.search_text && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-slate-700 dark:bg-white/[0.06] dark:text-slate-300">
                    <Icon.Search className="w-2.5 h-2.5" />
                    "{aiIntent.search_text}"
                  </span>
                )}
                {aiIntent.category && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400">
                    <Icon.Tag className="w-2.5 h-2.5" />
                    {aiIntent.category}
                  </span>
                )}
                {aiIntent.location && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    <Icon.Pin className="w-2.5 h-2.5" />
                    {aiIntent.location}
                  </span>
                )}
                {aiIntent.max_price !== null && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">
                    <Icon.Tag className="w-2.5 h-2.5" />
                    ≤ {new Intl.NumberFormat("en-RW").format(aiIntent.max_price)} RWF
                  </span>
                )}
                {aiIntent.min_price !== null && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-indigo-500/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                    <Icon.Tag className="w-2.5 h-2.5" />
                    ≥ {new Intl.NumberFormat("en-RW").format(aiIntent.min_price)} RWF
                  </span>
                )}
                {aiIntent.condition && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-purple-600 dark:text-purple-400">
                    {formatCondition(aiIntent.condition)}
                  </span>
                )}
                {aiIntent.listing_type && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-rose-600 dark:text-rose-400">
                    {formatListingType(aiIntent.listing_type)}
                  </span>
                )}
              </div>
            </div>
          </section>
        )}

        {/* RESULTS */}
        {searched && !loading && (
          <section>
            <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                  <Icon.Search className="w-3 h-3" />
                  Ibyabonetse
                </p>
                <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                  Search Results
                </h2>
                <p className="mt-0.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
                  <span className="font-black text-[#FF5D00]">{cResults}</span>{" "}
                  {results.length === 1 ? "ikintu kibonetse" : "ibintu byabonetse"}
                </p>
              </div>

              {results.length > 0 && (
                <div className="inline-flex items-center gap-1.5 self-start rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1.5 text-[11px] font-black text-emerald-600 dark:text-emerald-400 sm:self-auto">
                  <Icon.Check className="w-3.5 h-3.5" />
                  AI yatoranyije ibisubizo
                </div>
              )}
            </div>

            {results.length === 0 ? (
              <div className="mx-auto max-w-xl rounded-3xl border border-slate-200/70 bg-white/90 px-6 py-14 text-center shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/80">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-500/15 to-indigo-500/10 text-blue-500">
                  <Icon.Search className="w-8 h-8" />
                </div>
                <h3 className="mt-5 text-base font-black text-slate-900 dark:text-white">
                  Nta listing ihuye n'ibyo washakaga
                </h3>
                <p className="mx-auto mt-1.5 max-w-sm text-xs font-medium text-slate-500 dark:text-slate-400">
                  Gerageza guhindura amagambo, igiciro cyangwa location.
                </p>
                <button
                  type="button"
                  onClick={() => { setQuery(""); setSearched(false); setResults([]); setAiIntent(null); setError("") }}
                  className="group mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#FF5D00] via-[#FF7424] to-[#e05200] px-5 py-2.5 text-xs font-black text-white shadow-lg shadow-[#FF5D00]/30 transition hover:-translate-y-0.5"
                >
                  <Icon.Refresh className="w-3.5 h-3.5 transition-transform group-hover:rotate-180" />
                  Ongera ushakishe
                </button>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {results.map((listing) => (
                  <Link
                    key={listing.id}
                    to={`/listing/${listing.id}`}
                    className="group relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#FF5D00]/40 hover:shadow-xl dark:border-white/10 dark:bg-slate-900/60"
                  >
                    {/* Image placeholder */}
                    <div className="relative flex h-44 items-center justify-center overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 text-slate-400 dark:from-slate-800 dark:to-slate-900">
                      <Icon.Image className="w-12 h-12 transition-transform duration-300 group-hover:scale-110" />

                      <div className="absolute left-3 top-3 rounded-full bg-black/60 px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-white backdrop-blur-md">
                        {listing.category?.name || "Ibindi"}
                      </div>

                      {listing.status === "active" && (
                        <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-emerald-500 px-2.5 py-1 text-[9px] font-black text-white shadow-sm">
                          <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                          Biracyahari
                        </div>
                      )}
                    </div>

                    {/* Body */}
                    <div className="p-4">
                      <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-black leading-5 text-slate-900 transition group-hover:text-[#FF5D00] dark:text-white">
                        {listing.title}
                      </h3>

                      <p className="mt-2 flex items-center gap-1 text-lg font-black text-[#FF5D00]">
                        <Icon.Tag className="w-3.5 h-3.5" />
                        {formatPrice(listing.price, listing.currency)}
                      </p>

                      <div className="mt-2.5 space-y-1 border-t border-slate-100 pt-2.5 dark:border-white/10">
                        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                          <Icon.Pin className="w-3 h-3 shrink-0 text-[#569ab5]" />
                          <span className="truncate">
                            {[listing.location?.district, listing.location?.sector].filter(Boolean).join(", ") || "Location ntashyizweho"}
                          </span>
                        </div>

                        {listing.condition && listing.condition !== "not_applicable" && (
                          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                            <Icon.Check className="w-3 h-3 shrink-0 text-[#569ab5]" />
                            <span>{formatCondition(listing.condition)}</span>
                          </div>
                        )}

                        {listing.listing_type && (
                          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                            <Icon.Store className="w-3 h-3 shrink-0 text-[#569ab5]" />
                            <span>{formatListingType(listing.listing_type)}</span>
                          </div>
                        )}
                      </div>

                      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5 dark:border-white/10">
                        <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                          <Icon.Clock className="w-2.5 h-2.5" />
                          Reba ibisobanuro
                        </span>
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#FF5D00]/10 text-[#FF5D00] transition-all group-hover:bg-[#FF5D00] group-hover:text-white">
                          <Icon.ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        )}

        {/* INITIAL STATE */}
        {!searched && !loading && (
          <section className="mx-auto max-w-4xl py-4">
            <div className="mb-6 text-center">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                Uko bikora
              </p>
              <h2 className="mt-1 text-2xl font-black text-slate-900 dark:text-white">
                Byoroshye mu ntambwe 3
              </h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {[
                {
                  icon: Icon.Brain,
                  title: "Andika uko ubishaka",
                  text: "Ntugomba kumenya category nyayo. Andika nk'uko ubivuga.",
                  tone: "from-blue-500 to-indigo-600",
                },
                {
                  icon: Icon.Sparkles,
                  title: "AI irabisesengura",
                  text: "AI imenya ibyo ushaka, igiciro, aho biherereye n'ibindi.",
                  tone: "from-[#FF5D00] to-[#e05200]",
                },
                {
                  icon: Icon.Check,
                  title: "Shaka ibisubizo",
                  text: "Uhabwa listings zijyanye n'icyo ushaka, byoroshye kandi byihuse.",
                  tone: "from-emerald-500 to-teal-600",
                },
              ].map((item) => {
                const ItemIcon = item.icon
                return (
                  <div key={item.title} className="group rounded-2xl border border-slate-200/70 bg-white/80 p-5 shadow-sm backdrop-blur transition hover:-translate-y-1 hover:shadow-lg dark:border-white/10 dark:bg-slate-900/60">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${item.tone} text-white shadow-lg`}>
                      <ItemIcon className="w-6 h-6" />
                    </div>
                    <h3 className="mt-4 text-sm font-black text-slate-900 dark:text-white">{item.title}</h3>
                    <p className="mt-1.5 text-xs font-medium leading-5 text-slate-500 dark:text-slate-400">
                      {item.text}
                    </p>
                  </div>
                )
              })}
            </div>

            {/* Trust row */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[11px] font-semibold text-slate-400">
              <span className="flex items-center gap-1.5">
                <Icon.Shield className="w-3.5 h-3.5 text-emerald-500" />
                AI ikora mu mutekano
              </span>
              <span className="flex items-center gap-1.5">
                <Icon.Bolt className="w-3.5 h-3.5 text-[#FF5D00]" />
                Igisubizo mu masegonda
              </span>
              <span className="flex items-center gap-1.5">
                <Icon.Sparkles className="w-3.5 h-3.5 text-blue-500" />
                Ibisubizo byiza
              </span>
            </div>
          </section>
        )}
      </main>

      {/* FOOTER */}
      <footer className="mt-12 border-t border-slate-200/60 bg-white/70 backdrop-blur-2xl dark:border-white/10 dark:bg-[#060f19]/70">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 px-4 py-8 sm:flex-row sm:items-center sm:px-6 lg:px-8">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md">
              <Icon.Tag className="w-4 h-4" />
            </span>
            <div>
              <p className="text-sm font-black text-slate-900 dark:text-white">
                KUGURISHA
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">.COM</span>
              </p>
              <p className="text-[11px] text-slate-400">Isoko ryawe ryo mu Rwanda</p>
            </div>
          </div>

          <Link
            to="/"
            className="group inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 transition hover:text-[#FF5D00] dark:text-slate-400"
          >
            Ahabanza
            <Icon.ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </footer>
    </div>
  )
}