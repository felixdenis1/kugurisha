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

function AISearch() {
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

      console.log("AI response:", data)

      if (error) {
        console.error("AI function error:", error)
        return null
      }

      if (!data) {
        console.error("AI returned no data")
        return null
      }

      if (!data.intent) {
        console.error(
          "AI response has no intent:",
          data
        )
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

        setError(
          "AI ntiyabonetse, ariko twakoresheje search isanzwe."
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
        console.error(
          "Supabase listing search error:",
          searchError
        )

        setError(
          "Search yanze. Ongera ugerageze."
        )

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
          normalizeText(
            searchIntent.category
          )

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
          normalizeText(
            searchIntent.location
          )

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
          normalizeText(
            searchIntent.search_text
          )
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
      console.error(
        "Search exception:",
        err
      )

      setError(
        "Hari ikibazo cyabaye muri search."
      )

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

    if (normalized === "new") {
      return "Bishya"
    }

    if (normalized === "used") {
      return "Byakoreshejwe"
    }

    if (normalized === "refurbished") {
      return "Byavuguruwe"
    }

    if (normalized === "not_applicable") {
      return ""
    }

    return condition
  }

  function formatListingType(type: string) {
    const normalized = normalizeText(type)

    if (normalized === "sale") {
      return "Kugurisha"
    }

    if (normalized === "free") {
      return "Ubuntu"
    }

    if (normalized === "rent") {
      return "Ubukode"
    }

    return type
  }

  function formatIntent() {
    if (!aiIntent) return ""

    const parts: string[] = []

    if (aiIntent.search_text) {
      parts.push(`🔎 ${aiIntent.search_text}`)
    }

    if (aiIntent.category) {
      parts.push(`📦 ${aiIntent.category}`)
    }

    if (aiIntent.location) {
      parts.push(`📍 ${aiIntent.location}`)
    }

    if (aiIntent.max_price !== null) {
      parts.push(
        `💰 kugeza kuri ${new Intl.NumberFormat(
          "en-RW"
        ).format(
          aiIntent.max_price
        )} RWF`
      )
    }

    if (aiIntent.min_price !== null) {
      parts.push(
        `💰 guhera kuri ${new Intl.NumberFormat(
          "en-RW"
        ).format(
          aiIntent.min_price
        )} RWF`
      )
    }

    if (aiIntent.condition) {
      parts.push(`🏷️ ${aiIntent.condition}`)
    }

    if (aiIntent.listing_type) {
      parts.push(
        `📋 ${aiIntent.listing_type}`
      )
    }

    return parts.join(" • ")
  }

  const examples = [
    "Ndashaka iPhone munsi ya 500k",
    "Laptop munsi ya 400k mu Kigali",
    "Imodoka iri hejuru ya 5m",
  ]

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* HEADER */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950 text-white shadow-lg">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link
            to="/"
            className="group flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-sm font-black text-slate-950 shadow-lg transition group-hover:scale-105">
              K
            </div>

            <div>
              <div className="text-lg font-black tracking-tight sm:text-xl">
                KUGURISHA.COM
              </div>
              <div className="hidden text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400 sm:block">
                Isoko ryawe ryo mu Rwanda
              </div>
            </div>
          </Link>

          <Link
            to="/"
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-white/10"
          >
            ← Ahabanza
          </Link>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden bg-slate-950 pb-24 pt-14 text-white sm:pt-20">
        <div className="absolute -left-24 top-0 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl" />

        <div className="relative mx-auto max-w-5xl px-4 text-center sm:px-6">
          <div className="mx-auto mb-5 flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-blue-200 backdrop-blur">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500/20">
              ✨
            </span>
            AI Search ya KUGURISHA.COM
          </div>

          <h1 className="text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
            Bwira AI icyo
            <span className="block text-blue-400">
              ushaka kugura.
            </span>
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
            Andika ibyo ushaka mu buryo busanzwe.
            AI irabisesengura, igashaka mu bicuruzwa
            biri kuri KUGURISHA.COM.
          </p>

          {/* SEARCH BOX */}
          <div className="mx-auto mt-9 max-w-4xl">
            <div className="rounded-3xl border border-white/10 bg-white/10 p-2 shadow-2xl backdrop-blur-xl">
              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="relative flex-1">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-xl">
                    🔎
                  </span>

                  <input
                    value={query}
                    onChange={(event) =>
                      setQuery(event.target.value)
                    }
                    onKeyDown={(event) => {
                      if (
                        event.key === "Enter"
                      ) {
                        searchListings()
                      }
                    }}
                    placeholder="Urugero: Ndashaka iPhone munsi ya 500k mu Kigali"
                    className="min-h-14 w-full rounded-2xl border border-white/10 bg-white px-12 pr-4 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-500/20"
                  />
                </div>

                <button
                  onClick={searchListings}
                  disabled={loading}
                  className="min-h-14 rounded-2xl bg-blue-500 px-7 text-sm font-black text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-400 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading
                    ? "🤖 Irashakisha..."
                    : "✨ Shakisha"}
                </button>
              </div>
            </div>

            {/* EXAMPLES */}
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {examples.map((example) => (
                <button
                  key={example}
                  onClick={() =>
                    setQuery(example)
                  }
                  className="rounded-full border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-semibold text-slate-300 transition hover:border-white/20 hover:bg-white/10 hover:text-white"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CONTENT */}
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* AI STATUS */}
        {loading && aiStatus && (
          <div className="mx-auto mb-6 max-w-4xl">
            <div className="flex items-center gap-4 rounded-2xl border border-blue-100 bg-blue-50 p-4">
              <div className="flex h-11 w-11 shrink-0 animate-pulse items-center justify-center rounded-2xl bg-blue-100 text-xl">
                🤖
              </div>

              <div>
                <p className="text-sm font-black text-blue-950">
                  AI irakumva...
                </p>
                <p className="mt-0.5 text-xs text-blue-700">
                  {aiStatus}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ERROR */}
        {error && !loading && (
          <div className="mx-auto mb-6 max-w-4xl">
            <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100">
                ⚠️
              </div>

              <div>
                <p className="text-sm font-black text-amber-950">
                  Icyitonderwa
                </p>
                <p className="mt-1 text-sm text-amber-800">
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* AI INTERPRETATION */}
        {searched &&
          !loading &&
          aiIntent && (
            <section className="mx-auto mb-10 max-w-4xl">
              <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 bg-slate-50 px-5 py-4 sm:px-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-xl shadow-sm">
                      🤖
                    </div>

                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                        AI Assistant
                      </p>
                      <h2 className="font-black text-slate-950">
                        AI yumvise ibyo ushaka
                      </h2>
                    </div>
                  </div>
                </div>

                <div className="px-5 py-5 sm:px-6">
                  <p className="text-sm leading-7 text-slate-600">
                    {formatIntent()}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {aiIntent.category && (
                      <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700">
                        📦 {aiIntent.category}
                      </span>
                    )}

                    {aiIntent.location && (
                      <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
                        📍 {aiIntent.location}
                      </span>
                    )}

                    {aiIntent.max_price !== null && (
                      <span className="rounded-full bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700">
                        💰 ≤{" "}
                        {new Intl.NumberFormat(
                          "en-RW"
                        ).format(
                          aiIntent.max_price
                        )}{" "}
                        RWF
                      </span>
                    )}

                    {aiIntent.min_price !== null && (
                      <span className="rounded-full bg-violet-50 px-3 py-1.5 text-xs font-bold text-violet-700">
                        💰 ≥{" "}
                        {new Intl.NumberFormat(
                          "en-RW"
                        ).format(
                          aiIntent.min_price
                        )}{" "}
                        RWF
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
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
                  Ibyabonetse
                </p>

                <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
                  Search results
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {results.length}{" "}
                  {results.length === 1
                    ? "listing"
                    : "listings"}{" "}
                  zabonetse
                </p>
              </div>

              {results.length > 0 && (
                <div className="rounded-xl bg-white px-3 py-2 text-xs font-bold text-slate-500 shadow-sm ring-1 ring-slate-200">
                  ✨ AI yatoranyije ibisubizo
                </div>
              )}
            </div>

            {results.length === 0 ? (
              <div className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white px-6 py-14 text-center shadow-sm">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-100 text-4xl">
                  🔍
                </div>

                <h3 className="mt-6 text-xl font-black text-slate-950">
                  Nta listing ihuye
                  n&apos;ibyo washakaga.
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                  Gerageza guhindura amagambo
                  wakoresheje, igiciro cyangwa
                  location.
                </p>

                <button
                  onClick={() => {
                    setQuery("")
                    setSearched(false)
                    setResults([])
                    setAiIntent(null)
                    setError("")
                  }}
                  className="mt-6 rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
                >
                  Ongera ushakishe
                </button>
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {results.map((listing) => (
                  <Link
                    key={listing.id}
                    to={`/listing/${listing.id}`}
                    className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                  >
                    {/* IMAGE PLACEHOLDER */}
                    <div className="relative flex h-48 items-center justify-center overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200">
                      <div className="text-5xl transition duration-300 group-hover:scale-110">
                        🛍️
                      </div>

                      <div className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1.5 text-[10px] font-black uppercase tracking-wide text-slate-700 shadow-sm backdrop-blur">
                        {listing.category?.name ||
                          "Ibindi"}
                      </div>

                      {listing.status ===
                        "active" && (
                        <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-emerald-500 px-2.5 py-1.5 text-[10px] font-black text-white shadow-sm">
                          <span className="h-1.5 w-1.5 rounded-full bg-white" />
                          Biracyahari
                        </div>
                      )}
                    </div>

                    {/* CARD BODY */}
                    <div className="p-5">
                      <h3 className="line-clamp-2 min-h-12 text-base font-black leading-6 text-slate-950 transition group-hover:text-blue-600">
                        {listing.title}
                      </h3>

                      <p className="mt-3 text-xl font-black tracking-tight text-slate-950">
                        {formatPrice(
                          listing.price,
                          listing.currency
                        )}
                      </p>

                      <div className="mt-4 space-y-2 border-t border-slate-100 pt-4">
                        <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                          <span>📍</span>
                          <span className="line-clamp-1">
                            {[
                              listing.location
                                ?.district,
                              listing.location
                                ?.sector,
                            ]
                              .filter(Boolean)
                              .join(", ") ||
                              "Location ntashyizweho"}
                          </span>
                        </div>

                        {listing.condition &&
                          listing.condition !==
                            "not_applicable" && (
                            <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                              <span>🏷️</span>
                              <span>
                                {formatCondition(
                                  listing.condition
                                )}
                              </span>
                            </div>
                          )}

                        {listing.listing_type && (
                          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                            <span>📋</span>
                            <span>
                              {formatListingType(
                                listing.listing_type
                              )}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                        <span className="text-xs font-bold text-slate-400">
                          Reba ibisobanuro
                        </span>

                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-sm transition group-hover:bg-blue-600 group-hover:text-white">
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
          <section className="mx-auto max-w-4xl py-8">
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                {
                  icon: "💬",
                  title: "Andika uko ubishaka",
                  text: "Ntugomba kumenya category nyayo.",
                },
                {
                  icon: "🤖",
                  title: "AI irabisesengura",
                  text: "AI imenya ibyo ushaka n'ibisabwa.",
                },
                {
                  icon: "🎯",
                  title: "Shaka ibisubizo",
                  text: "Uhabwa listings zijyanye n'icyo ushaka.",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-2xl">
                    {item.icon}
                  </div>

                  <h3 className="mt-5 font-black text-slate-950">
                    {item.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* FOOTER */}
      <footer className="mt-10 border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div>
            <p className="font-black text-slate-950">
              KUGURISHA.COM
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Isoko ryawe ryo mu Rwanda 🇷🇼
            </p>
          </div>

          <Link
            to="/"
            className="text-sm font-bold text-slate-500 transition hover:text-slate-950"
          >
            Ahabanza →
          </Link>
        </div>
      </footer>
    </div>
  )
}

export default AISearch