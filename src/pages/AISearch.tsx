import { useState } from "react"
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
  category: {
    name: string
    slug: string
  } | null
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

export default function AISearch() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<Listing[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [error, setError] = useState("")
  const [aiIntent, setAiIntent] = useState<SearchIntent | null>(null)
  const [aiStatus, setAiStatus] = useState("")

  function normalizeText(value: string) {
    return value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim()
  }

  function parsePrice(value: string) {
    const normalized = value
      .toLowerCase()
      .replace(/,/g, "")
      .replace(/\s/g, "")

    const match = normalized.match(
      /(\d+(?:\.\d+)?)(m|miliyoni|million|k|kuko|rwf)?/
    )

    if (!match) return null

    let number = Number(match[1])
    const unit = match[2]

    if (unit === "k" || unit === "kuko") {
      number *= 1000
    }

    if (
      unit === "m" ||
      unit === "miliyoni" ||
      unit === "million"
    ) {
      number *= 1000000
    }

    return Number.isFinite(number) ? number : null
  }

  function parseLocalIntent(input: string): LocalIntent {
    const text = normalizeText(input)

    const words = text
      .split(/\s+/)
      .filter((word) => word.length >= 2)

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
      if (match) {
        maxPrice = parsePrice(match[1])
        break
      }
    }

    const minPatterns = [
      /hejuru ya\s+(\d[\d.,]*(?:k|m|miliyoni|million)?)/i,
      /urenze\s+(\d[\d.,]*(?:k|m|miliyoni|million)?)/i,
      /guhera kuri\s+(\d[\d.,]*(?:k|m|miliyoni|million)?)/i,
      /above\s+(\d[\d.,]*(?:k|m|miliyoni|million)?)/i,
    ]

    for (const pattern of minPatterns) {
      const match = text.match(pattern)
      if (match) {
        minPrice = parsePrice(match[1])
        break
      }
    }

    const locationNames = [
      "kigali",
      "gasabo",
      "kicukiro",
      "nyarugenge",
      "musanze",
      "rubavu",
      "huye",
      "nyamagabe",
      "muhanga",
      "kamonyi",
      "bugesera",
      "rwamagana",
      "kayonza",
      "ngoma",
      "gicumbi",
      "nyagatare",
      "ruhango",
      "gisagara",
      "karongi",
      "rusizi",
    ]

    const location =
      locationNames.find((locationName) =>
        text.includes(locationName)
      ) || null

    const ignoredWords = new Set([
      "ndashaka",
      "ndifuza",
      "nshaka",
      "gushaka",
      "kugura",
      "kugurisha",
      "iri",
      "iriho",
      "munsi",
      "yarenze",
      "itarenze",
      "kugeza",
      "kuri",
      "hejuru",
      "ya",
      "mu",
      "muri",
      "ku",
      "kandi",
      "cyangwa",
      "the",
      "and",
      "with",
      "under",
      "below",
      "above",
      "in",
      "from",
      "rw",
      "rwf",
    ])

    const usefulWords = words.filter(
      (word) =>
        !ignoredWords.has(word) &&
        !/^\d/.test(word) &&
        word.length >= 3
    )

    const keyword = usefulWords.slice(0, 4).join(" ")

    return {
      keyword,
      maxPrice,
      minPrice,
      location,
      words: usefulWords,
    }
  }

  async function askAI(
    cleanQuery: string
  ): Promise<SearchIntent | null> {
    try {
      setAiStatus("AI iri gusobanura ibyo ushaka...")

      const { data, error } =
        await supabase.functions.invoke(
          "ai-assistant",
          {
            body: {
              query: cleanQuery,
            },
          }
        )

      if (error) {
        console.error("AI function error:", error)
        return null
      }

      if (!data || !data.intent) {
        return null
      }

      const intent = data.intent as SearchIntent

      return {
        search_text: intent.search_text || "",
        min_price:
          typeof intent.min_price === "number"
            ? intent.min_price
            : null,
        max_price:
          typeof intent.max_price === "number"
            ? intent.max_price
            : null,
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
      setResults([])
      setSearched(false)
      setAiIntent(null)
      setError(
        "Andika icyo ushaka mbere yo gushakisha."
      )
      return
    }

    setLoading(true)
    setError("")
    setSearched(true)
    setResults([])
    setAiIntent(null)

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

        setError(""
          
        )
      }

      let builder = supabase
        .from("listings")
        .select(`
          id,
          title,
          description,
          price,
          currency,
          condition,
          status,
          listing_type,
          category:categories (
            name,
            slug
          ),
          location:locations (
            province,
            district,
            sector
          )
        `)
        .eq("status", "active")
        .order("created_at", {
          ascending: false,
        })
        .limit(100)

      if (searchIntent.max_price !== null) {
        builder = builder.lte(
          "price",
          searchIntent.max_price
        )
      }

      if (searchIntent.min_price !== null) {
        builder = builder.gte(
          "price",
          searchIntent.min_price
        )
      }

      if (searchIntent.listing_type) {
        builder = builder.eq(
          "listing_type",
          searchIntent.listing_type
        )
      }

      if (searchIntent.condition) {
        builder = builder.eq(
          "condition",
          searchIntent.condition
        )
      }

      const {
        data,
        error: searchError,
      } = await builder

      if (searchError) {
        console.error("Supabase listing search error:", searchError)
        setError("Search yanze. Ongera ugerageze.")
        setResults([])
        return
      }

      let filtered = (data || []).map(
        (listing) => ({
          ...listing,
          category: Array.isArray(
            listing.category
          )
            ? listing.category[0] || null
            : listing.category || null,
          location: Array.isArray(
            listing.location
          )
            ? listing.location[0] || null
            : listing.location || null,
        })
      ) as Listing[]

      if (searchIntent.category) {
        const categorySearch =
          normalizeText(searchIntent.category)

        filtered = filtered.filter(
          (listing) => {
            const categoryText =
              normalizeText(
                [
                  listing.category?.name || "",
                  listing.category?.slug || "",
                ].join(" ")
              )

            return (
              categoryText.includes(
                categorySearch
              ) ||
              categorySearch.includes(
                categoryText
              )
            )
          }
        )
      }

      if (searchIntent.location) {
        const locationSearch =
          normalizeText(searchIntent.location)

        filtered = filtered.filter(
          (listing) => {
            const locationText =
              normalizeText(
                [
                  listing.location?.province || "",
                  listing.location?.district || "",
                  listing.location?.sector || "",
                ].join(" ")
              )

            return locationText.includes(
              locationSearch
            )
          }
        )
      }

      if (searchIntent.search_text) {
        const searchWords =
          normalizeText(searchIntent.search_text)
            .split(/\s+/)
            .filter(
              (word) => word.length >= 2
            )

        if (searchWords.length > 0) {
          filtered = filtered.filter(
            (listing) => {
              const searchableText =
                normalizeText(
                  [
                    listing.title,
                    listing.description || "",
                    listing.category?.name || "",
                    listing.category?.slug || "",
                  ].join(" ")
                )

              return searchWords.some(
                (word) =>
                  searchableText.includes(word)
              )
            }
          )
        }
      }

      setResults(filtered)
    } catch (err) {
      console.error("Search exception:", err)
      setError("Hari ikibazo cyabaye muri search.")
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  function formatPrice(
    price: number | null,
    currency: string
  ) {
    if (price === null) {
      return "Saba igiciro"
    }

    return `${new Intl.NumberFormat(
      "en-RW"
    ).format(price)} ${currency}`
  }

  function formatCondition(condition: string) {
    const normalized = normalizeText(condition)

    if (normalized === "new") return "Bishya"
    if (normalized === "used") return "Byakoreshejwe"
    if (normalized === "refurbished") return "Byavuguruwe"
    if (normalized === "not_applicable") return ""

    return condition
  }

  function formatListingType(type: string) {
    const normalized = normalizeText(type)

    if (normalized === "sale") return "Kugurisha"
    if (normalized === "free") return "Ubuntu"
    if (normalized === "rent") return "Ubukode"

    return type
  }

  function formatIntent() {
    if (!aiIntent) return ""

    const parts: string[] = []

    if (aiIntent.search_text) parts.push(`Shakisha: "${aiIntent.search_text}"`)
    if (aiIntent.category) parts.push(`Icyiciro: ${aiIntent.category}`)
    if (aiIntent.location) parts.push(`Aho biherereye: ${aiIntent.location}`)

    if (aiIntent.max_price !== null) {
      parts.push(
        `Kugeza kuri ${new Intl.NumberFormat("en-RW").format(
          aiIntent.max_price
        )} RWF`
      )
    }

    if (aiIntent.min_price !== null) {
      parts.push(
        `Guhera kuri ${new Intl.NumberFormat("en-RW").format(
          aiIntent.min_price
        )} RWF`
      )
    }

    if (aiIntent.condition) parts.push(`Imiterere: ${aiIntent.condition}`)
    if (aiIntent.listing_type) parts.push(`Ubwoko: ${aiIntent.listing_type}`)

    return parts.join(" • ")
  }

  const examples = [
    "Ndashaka iPhone munsi ya 500k",
    "Laptop munsi ya 400k mu Kigali",
    "Imodoka iri hejuru ya 5m",
  ]

  return (
    <div className="relative min-h-screen overflow-hidden kg-bg kg-text transition-colors duration-300">
      {/* GLOBAL BACKGROUND ACCENTS */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[8%] top-[8%] h-[34rem] w-[34rem] rounded-full bg-[#569ab5]/10 blur-[120px]" />
        <div className="absolute right-[4%] top-[22%] h-[32rem] w-[32rem] rounded-full bg-slate-500/10 blur-[120px]" />
        <div className="absolute bottom-[5%] left-[35%] h-[36rem] w-[36rem] rounded-full bg-[#569ab5]/10 blur-[130px]" />
      </div>

      {/* HEADER */}
      <header className="sticky top-0 z-40 border-b kg-border kg-surface backdrop-blur-2xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Link
            to="/"
            className="group inline-flex items-center gap-3 rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[#569ab5]"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-slate-500/10 via-[#569ab5]/15 to-[#427c94]/20 p-1 border border-[#569ab5]/30">
              <img
                src="/favicon.svg"
                alt=""
                className="h-full w-full object-contain rounded-full bg-transparent"
              />
            </div>
            <span className="text-2xl font-black tracking-[-0.07em] bg-gradient-to-r from-slate-500 via-[#569ab5] to-[#36677b] dark:from-slate-300 dark:via-[#569ab5] dark:to-[#73afc9] bg-clip-text text-transparent">
              KUGURISHA
            </span>
          </Link>

          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-2xl border kg-border kg-surface px-4 py-2 text-xs font-bold kg-text shadow-sm transition hover:border-[#569ab5]"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Ahabanza
          </Link>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden bg-slate-950 text-white py-14 px-4 sm:px-6 lg:py-20">
        <div className="relative mx-auto max-w-4xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#73afc9] backdrop-blur-md">
            <svg className="w-4 h-4 text-[#73afc9]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            AI Search ya KUGURISHA
          </div>

          <h1 className="text-3xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
            Bwira AI icyo <span className="block text-[#73afc9] mt-1">ushaka kugura.</span>
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-xs sm:text-sm text-slate-400">
            Andika ibyo ushaka mu buryo busanzwe. AI irabisesengura, igashaka mu bicuruzwa biri ku isoko.
          </p>

          {/* SEARCH BOX */}
          <div className="mx-auto mt-8 max-w-3xl">
            <div className="rounded-3xl border border-white/10 bg-white/10 p-2 shadow-2xl backdrop-blur-xl">
              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="relative flex-1">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </span>

                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        void searchListings()
                      }
                    }}
                    placeholder="Urugero: Ndashaka iPhone munsi ya 500k mu Kigali"
                    className="min-h-14 w-full rounded-2xl border border-white/10 bg-white px-12 pr-4 text-xs sm:text-sm font-bold text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-[#569ab5] focus:ring-4 focus:ring-[#569ab5]/20"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => void searchListings()}
                  disabled={loading}
                  className="min-h-14 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#4b8aa3] via-[#569ab5] to-[#36677b] px-7 text-xs font-black text-white shadow-lg shadow-[#569ab5]/25 transition hover:scale-[1.01] active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      <span>Irashakisha...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>
                      <span>Shakisha</span>
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
                  className="rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-[11px] font-semibold text-slate-300 transition hover:border-[#569ab5]/40 hover:bg-white/10 hover:text-white flex items-center gap-1.5"
                >
                  <svg className="w-3 h-3 text-[#73afc9]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  {example}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CONTENT */}
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-10">
        {/* AI STATUS */}
        {loading && aiStatus && (
          <div className="mx-auto mb-6 max-w-3xl">
            <div className="flex items-center gap-4 rounded-3xl border border-[#569ab5]/20 bg-[#569ab5]/10 p-4 backdrop-blur-xl">
              <div className="flex h-11 w-11 shrink-0 animate-pulse items-center justify-center rounded-2xl bg-[#569ab5]/20 text-[#569ab5]">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-[#427c94] dark:text-[#73afc9]">
                  AI irakumva...
                </p>
                <p className="mt-0.5 text-xs font-medium kg-text-secondary">
                  {aiStatus}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ERROR */}
        {error && !loading && (
          <div className="mx-auto mb-6 max-w-3xl">
            <div className="flex items-start gap-3 rounded-3xl border border-amber-500/20 bg-amber-500/10 p-4 backdrop-blur-xl">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border border-amber-500/20 kg-surface text-amber-600 dark:text-amber-400 shadow-sm">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-amber-900 dark:text-amber-300">
                  Icyitonderwa
                </p>
                <p className="mt-1 text-xs font-medium text-amber-800/90 dark:text-amber-200/80">
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* AI INTERPRETATION */}
        {searched && !loading && aiIntent && (
          <section className="mx-auto mb-8 max-w-3xl">
            <div className="overflow-hidden rounded-3xl border kg-border kg-surface shadow-xl backdrop-blur-xl">
              <div className="border-b kg-border px-5 py-4 sm:px-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#569ab5]/10 text-[#569ab5]">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-[#427c94] dark:text-[#73afc9]">
                    AI Assistant
                  </p>
                  <h2 className="text-sm font-black kg-text">
                    AI yumvise ibyo ushaka
                  </h2>
                </div>
              </div>

              <div className="p-5 sm:p-6">
                <p className="text-xs sm:text-sm font-medium leading-relaxed kg-text-secondary">
                  {formatIntent()}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {aiIntent.category && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#569ab5]/20 bg-[#569ab5]/10 px-3 py-1 text-xs font-bold text-[#36677b] dark:text-[#73afc9]">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                      {aiIntent.category}
                    </span>
                  )}
                  {aiIntent.location && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#569ab5]/20 bg-[#569ab5]/10 px-3 py-1 text-xs font-bold text-[#36677b] dark:text-[#73afc9]">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {aiIntent.location}
                    </span>
                  )}
                  {aiIntent.max_price !== null && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-700 dark:text-amber-300">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      ≤ {new Intl.NumberFormat("en-RW").format(aiIntent.max_price)} RWF
                    </span>
                  )}
                  {aiIntent.min_price !== null && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-xs font-bold text-indigo-700 dark:text-indigo-300">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      ≥ {new Intl.NumberFormat("en-RW").format(aiIntent.min_price)} RWF
                    </span>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* RESULTS */}
        {searched && !loading && (
          <section>
            <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-[#427c94] dark:text-[#73afc9]">
                  Ibyabonetse
                </p>
                <h2 className="text-2xl font-black tracking-tight kg-text">
                  Search results
                </h2>
                <p className="text-xs font-medium kg-text-secondary">
                  {results.length} {results.length === 1 ? "listing" : "listings"} zabonetse
                </p>
              </div>

              {results.length > 0 && (
                <div className="inline-flex items-center gap-1.5 rounded-2xl border kg-border kg-surface px-3 py-1.5 text-[11px] font-bold kg-text-secondary shadow-sm">
                  <svg className="w-3.5 h-3.5 text-[#569ab5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                  <span>AI yatoranyije ibisubizo</span>
                </div>
              )}
            </div>

            {results.length === 0 ? (
              <div className="mx-auto max-w-xl rounded-3xl border kg-border kg-surface px-6 py-14 text-center shadow-xl backdrop-blur-xl">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border kg-border kg-bg-secondary text-[#569ab5]">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="mt-5 text-base font-black kg-text">
                  Nta listing ihuye n&apos;ibyo washakaga.
                </h3>
                <p className="mx-auto mt-1.5 max-w-sm text-xs font-medium kg-text-secondary">
                  Gerageza guhindura amagambo wakoresheje, igiciro cyangwa location.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setQuery("")
                    setSearched(false)
                    setResults([])
                    setAiIntent(null)
                    setError("")
                  }}
                  className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#4b8aa3] via-[#569ab5] to-[#36677b] px-5 py-2.5 text-xs font-black text-white shadow-lg shadow-[#569ab5]/25 transition hover:scale-105"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Ongera ushakishe</span>
                </button>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {results.map((listing) => (
                  <Link
                    key={listing.id}
                    to={`/listing/${listing.id}`}
                    className="group overflow-hidden rounded-3xl border kg-border kg-surface shadow-xl backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-[#569ab5]/50"
                  >
                    {/* IMAGE PLACEHOLDER */}
                    <div className="relative flex h-44 items-center justify-center overflow-hidden kg-bg-secondary text-[#569ab5]/40">
                      <svg className="w-12 h-12 transition duration-300 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>

                      <div className="absolute left-3 top-3 rounded-full border kg-border kg-surface px-2.5 py-1 text-[9px] font-black uppercase tracking-wide kg-text shadow-sm backdrop-blur-md">
                        {listing.category?.name || "Ibindi"}
                      </div>

                      {listing.status === "active" && (
                        <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-[#569ab5] px-2.5 py-1 text-[9px] font-black text-white shadow-sm">
                          <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                          Biracyahari
                        </div>
                      )}
                    </div>

                    {/* CARD BODY */}
                    <div className="p-4 sm:p-5">
                      <h3 className="line-clamp-2 min-h-[2.5rem] text-xs sm:text-sm font-black leading-snug kg-text transition group-hover:text-[#569ab5]">
                        {listing.title}
                      </h3>

                      <p className="mt-2 text-base sm:text-lg font-black tracking-tight kg-text">
                        {formatPrice(listing.price, listing.currency)}
                      </p>

                      <div className="mt-3 space-y-1.5 border-t kg-border pt-3">
                        <div className="flex items-center gap-2 text-[11px] font-medium kg-text-secondary">
                          <svg className="w-3.5 h-3.5 shrink-0 text-[#569ab5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          </svg>
                          <span className="line-clamp-1">
                            {[
                              listing.location?.district,
                              listing.location?.sector,
                            ]
                              .filter(Boolean)
                              .join(", ") || "Location ntashyizweho"}
                          </span>
                        </div>

                        {listing.condition && listing.condition !== "not_applicable" && (
                          <div className="flex items-center gap-2 text-[11px] font-medium kg-text-secondary">
                            <svg className="w-3.5 h-3.5 shrink-0 text-[#569ab5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                            <span>{formatCondition(listing.condition)}</span>
                          </div>
                        )}

                        {listing.listing_type && (
                          <div className="flex items-center gap-2 text-[11px] font-medium kg-text-secondary">
                            <svg className="w-3.5 h-3.5 shrink-0 text-[#569ab5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            <span>{formatListingType(listing.listing_type)}</span>
                          </div>
                        )}
                      </div>

                      <div className="mt-4 flex items-center justify-between border-t kg-border pt-3">
                        <span className="text-[11px] font-bold kg-text-muted">Reba ibisobanuro</span>
                        <span className="flex h-7 w-7 items-center justify-center rounded-xl kg-bg-secondary text-xs font-bold transition group-hover:bg-[#569ab5] group-hover:text-white">
                          →
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
          <section className="mx-auto max-w-4xl py-6">
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                {
                  icon: (
                    <svg className="w-6 h-6 text-[#569ab5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                  ),
                  title: "Andika uko ubishaka",
                  text: "Ntugomba kumenya category nyayo.",
                },
                {
                  icon: (
                    <svg className="w-6 h-6 text-[#569ab5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  ),
                  title: "AI irabisesengura",
                  text: "AI imenya ibyo ushaka n'ibisabwa.",
                },
                {
                  icon: (
                    <svg className="w-6 h-6 text-[#569ab5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ),
                  title: "Shaka ibisubizo",
                  text: "Uhabwa listings zijyanye n'icyo ushaka.",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-3xl border kg-border kg-surface p-6 shadow-xl backdrop-blur-xl"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border kg-border kg-bg-secondary">
                    {item.icon}
                  </div>
                  <h3 className="mt-4 text-sm font-black kg-text">
                    {item.title}
                  </h3>
                  <p className="mt-1.5 text-xs font-medium leading-relaxed kg-text-secondary">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* FOOTER */}
      <footer className="mt-12 border-t kg-border kg-surface backdrop-blur-2xl">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <span className="text-xl font-black tracking-[-0.07em] bg-gradient-to-r from-slate-500 via-[#569ab5] to-[#36677b] dark:from-slate-300 dark:via-[#569ab5] dark:to-[#73afc9] bg-clip-text text-transparent">
              KUGURISHA
            </span>
            <p className="mt-1 text-xs font-bold kg-text-muted">
              Isoko ryawe ryo mu Rwanda
            </p>
          </div>

          <Link
            to="/"
            className="text-xs font-bold kg-text-secondary transition hover:text-[#569ab5] flex items-center gap-1"
          >
            <span>Ahabanza</span>
            <span>→</span>
          </Link>
        </div>
      </footer>
    </div>
  )
}