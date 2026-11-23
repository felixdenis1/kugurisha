import { useEffect, useState, useRef } from "react"
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

type ChatMessage = {
  role: "user" | "assistant"
  content: string
  intent?: SearchIntent
  results?: Listing[]
}

/* ──────────────────────────────────────────────────────────────────────────
   ICON SYSTEM
   ────────────────────────────────────────────────────────────────────────── */
type IconProps = { className?: string }
const Icon = {
  ArrowLeft: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
  ),
  ArrowRight: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
  ),
  ArrowUp: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" /></svg>
  ),
  Search: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>
  ),
  Sparkles: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M11.644 1.515a.75.75 0 0 1 .712 0l2.223 1.345a.75.75 0 0 1 0 1.28l-2.223 1.345a.75.75 0 0 1-.712 0L9.421 4.14a.75.75 0 0 1 0-1.28l2.223-1.345zM4.5 9.75a.75.75 0 0 1 .75-.75h13.5a.75.75 0 0 1 0 1.5H5.25a.75.75 0 0 1-.75-.75zM3.75 14.25a.75.75 0 0 1 .75-.75h15a.75.75 0 0 1 0 1.5h-15a.75.75 0 0 1-.75-.75zM4.5 18.75a.75.75 0 0 1 .75-.75h13.5a.75.75 0 0 1 0 1.5H5.25a.75.75 0 0 1-.75-.75z" /></svg>
  ),
  Bolt: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg>
  ),
  Brain: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" /></svg>
  ),
  Tag: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" /></svg>
  ),
  Pin: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
  ),
  Filter: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" /></svg>
  ),
  Check: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.4} d="M4.5 12.75l6 6 9-13.5" /></svg>
  ),
  Alert: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /></svg>
  ),
  Clock: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
  ),
  Shield: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>
  ),
  Image: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>
  ),
  Refresh: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>
  ),
  Store: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" /></svg>
  ),
  Plus: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15m7.5-7.5h-15" /></svg>
  ),
  Settings: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
  ),
  History: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
  ),
  Cube: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" /></svg>
  ),
  Menu: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
  ),
  Chevron: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m6 9 6 6 6-6" /></svg>
  ),
  Trash: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
  )
}

/* ──────────────────────────────────────────────────────────────────────────
   MAIN COMPONENT
   ────────────────────────────────────────────────────────────────────────── */
export default function AISearch() {
  const [query, setQuery] = useState("")
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [aiStatus, setAiStatus] = useState("")
  const [thinkingStep, setThinkingStep] = useState(0)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  
  const inputRef = useRef<HTMLInputElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [chatHistory, loading])

  function normalizeText(value: string) {
    return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim()
  }

  async function askAI(cleanQuery: string) {
    try {
      setAiStatus("AI iri gusobanura ibyo ushaka...")
      
      const historyPayload = chatHistory.map(msg => ({
        role: msg.role,
        content: msg.content
      }))

      const { data, error } = await supabase.functions.invoke("ai-assistant", { 
        body: { query: cleanQuery, history: historyPayload } 
      })
      
      if (error) { console.error("AI function error:", error); return null }
      if (!data || !data.intent) return null
      
      return {
        message: data.message || "Ndagushakishirije ibyo usabye.",
        intent: {
          search_text: data.intent.search_text || "",
          min_price: typeof data.intent.min_price === "number" ? data.intent.min_price : null,
          max_price: typeof data.intent.max_price === "number" ? data.intent.max_price : null,
          location: data.intent.location || "",
          category: data.intent.category || "",
          condition: data.intent.condition || "",
          listing_type: data.intent.listing_type || "",
        }
      }
    } catch (error) {
      console.error("AI request error:", error)
      return null
    } finally {
      setAiStatus("")
    }
  }

  async function searchListings(customQuery?: string) {
    const cleanQuery = (customQuery || query).trim()
    if (!cleanQuery) return

    setQuery("")
    setLoading(true); setError(""); setThinkingStep(0)

    setChatHistory(prev => [...prev, { role: "user", content: cleanQuery }])

    const stepInterval = setInterval(() => {
      setThinkingStep((s) => Math.min(s + 1, 3))
    }, 500)

    try {
      const aiResult = await askAI(cleanQuery)
      let searchIntent: SearchIntent
      let aiMessage = ""

      if (aiResult) {
        searchIntent = aiResult.intent
        aiMessage = aiResult.message
      } else {
        // Fallback
        searchIntent = { search_text: cleanQuery, min_price: null, max_price: null, location: "", category: "", condition: "", listing_type: "" }
        aiMessage = "Ntabwo nashoboye kumenya neza icyo ushaka, ariko dore ibyo nabonye:"
      }

      // If AI says something like "Murakoze", intent will be empty. We shouldn't search.
      if (!searchIntent.search_text && !searchIntent.location && !searchIntent.category) {
         setChatHistory(prev => [...prev, { role: "assistant", content: aiMessage }])
         setLoading(false)
         return
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
      if (searchError) throw searchError

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

      setChatHistory(prev => [...prev, { 
        role: "assistant", 
        content: aiMessage,
        intent: searchIntent,
        results: filtered
      }])

    } catch (err) {
      console.error("Search exception:", err)
      setError("Hari ikibazo cyabaye muri search. Ongera ugerageze.")
    } finally {
      clearInterval(stepInterval)
      setLoading(false)
    }
  }

  function resetChat() {
    setQuery("")
    setChatHistory([])
    setError("")
    inputRef.current?.focus()
  }

  function deleteHistoryItem(indexToDelete: number) {
    // Filter out the user message and its immediate assistant response
    const newHistory = [...chatHistory]
    // If deleting a user message, we also want to delete the assistant's response that follows it
    if (newHistory[indexToDelete].role === "user" && newHistory[indexToDelete + 1]?.role === "assistant") {
      newHistory.splice(indexToDelete, 2)
    } else {
      newHistory.splice(indexToDelete, 1)
    }
    setChatHistory(newHistory)
  }

  function formatPrice(price: number | null, currency: string) {
    if (price === null) return "Saba igiciro"
    return `${new Intl.NumberFormat("en-RW").format(price)} ${currency}`
  }

  const suggestions = [
    { icon: Icon.Sparkles, label: "Ibyatoranyijwe", active: true },
    { icon: Icon.Store, label: "Ibicuruzwa bishya", active: false },
    { icon: Icon.Tag, label: "Ibiciro byiza", active: false },
    { icon: Icon.Pin, label: "Mu Kigali", active: false },
    { icon: Icon.Bolt, label: "Byihuse", active: false },
  ]

  const thinkingSteps = [
    { label: "Kumva icyo ushaka", icon: Icon.Brain },
    { label: "Gusesengura ibisabwa", icon: Icon.Filter },
    { label: "Gushakisha ku isoko", icon: Icon.Search },
    { label: "Gutunganya ibisubizo", icon: Icon.Sparkles },
  ]

  const isInitialState = chatHistory.length === 0 && !loading

  return (
    <div className="flex h-screen w-full overflow-hidden bg-white text-slate-900 dark:bg-[#0a0a0a] dark:text-slate-100 font-sans">
      
      {/* ────────── SIDEBAR ────────── */}
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-[#f8f9fa] transition-transform duration-300 dark:border-white/10 dark:bg-[#111] lg:static lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex h-16 items-center px-4">
          <Link to="/" className="flex items-center gap-2 text-lg font-black tracking-tight text-slate-900 dark:text-white">
            <Icon.Sparkles className="h-6 w-6 text-[#FF5D00]" />
            AI Mode
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="ml-auto lg:hidden p-2 text-slate-500 hover:bg-slate-200 rounded-lg">
            <Icon.ArrowLeft className="w-5 h-5" />
          </button>
        </div>

        <div className="px-3 py-4">
          <button onClick={resetChat} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-200/50 dark:text-slate-300 dark:hover:bg-white/5">
            <Icon.Plus className="h-5 w-5" />
            Gishya
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3">
          <div className="mb-2 px-3 text-xs font-bold uppercase tracking-wider text-slate-400">Amateka</div>
          <div className="space-y-1">
            {chatHistory.filter(m => m.role === 'user').length === 0 && (
              <p className="px-3 text-xs text-slate-400 italic">Nta mateka arahari.</p>
            )}
            {chatHistory.map((msg, i) => {
              if (msg.role !== 'user') return null;
              return (
                <div key={i} className="group flex items-center justify-between rounded-xl px-3 py-2 hover:bg-slate-200/50 dark:hover:bg-white/5">
                  <button 
                    onClick={() => {
                      // Optional: Scroll to specific message
                    }} 
                    className="flex flex-1 items-center gap-3 text-left text-sm font-medium text-slate-600 dark:text-slate-400 truncate"
                  >
                    <Icon.History className="h-4 w-4 shrink-0" />
                    <span className="truncate">{msg.content}</span>
                  </button>
                  <button 
                    onClick={() => deleteHistoryItem(i)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 transition-opacity"
                    title="Siba iyi nkuru"
                  >
                    <Icon.Trash className="h-3.5 w-3.5" />
                  </button>
                </div>
              )
            })}
          </div>
        </div>

        <div className="border-t border-slate-200 p-3 dark:border-white/10">
          <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-200/50 dark:text-slate-300 dark:hover:bg-white/5">
            <Icon.Settings className="h-5 w-5" />
            Igenamiterere
          </button>
        </div>
      </aside>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ────────── MAIN CONTENT ────────── */}
      <main className="relative flex flex-1 flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 px-4 dark:border-white/10 lg:hidden">
          <button onClick={() => setSidebarOpen(true)} className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg">
            <Icon.Menu className="w-6 h-6" />
          </button>
          <span className="font-black text-slate-900 dark:text-white">AI Mode</span>
          <Link to="/" className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg">
            <Icon.ArrowLeft className="w-5 h-5" />
          </Link>
        </header>

        {/* Scrollable Chat Area */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-8 sm:px-6 lg:px-12">
          <div className={`mx-auto w-full ${isInitialState ? "max-w-4xl" : "max-w-3xl"}`}>
            
            {/* INITIAL STATE: HERO & INPUT */}
            {isInitialState && (
              <div className="flex flex-col items-center justify-center pt-10 sm:pt-20">
                <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-1.5 text-xs font-bold text-slate-600 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-slate-300 mb-6">
                  <Icon.Sparkles className="w-4 h-4 text-[#FF5D00]" />
                  Reba uko AI yoroshye gushakisha
                  <Icon.ArrowRight className="w-3.5 h-3.5" />
                </div>
                
                <h1 className="text-center text-3xl font-black tracking-tight text-slate-900 dark:text-white sm:text-5xl">
                  Ibintu byose mu kubaza rimwe, gushakisha byoroshye na AI
                </h1>

                {/* THE BIG SEARCH BOX */}
                <div className="mt-10 w-full">
                  <div className="group relative flex flex-col rounded-[32px] border border-slate-300 bg-white p-2 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.1)] transition-all focus-within:border-[#FF5D00] focus-within:shadow-[0_8px_30px_-12px_rgba(255,93,0,0.3)] dark:border-white/20 dark:bg-[#1a1a1a] dark:focus-within:border-[#FF5D00]">
                    <div className="flex items-center">
                      <button className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10">
                        <Icon.Plus className="w-5 h-5" />
                      </button>
                      <input
                        ref={inputRef}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") void searchListings() }}
                        placeholder="Ni iki AI yakugirira?"
                        className="min-h-[48px] w-full bg-transparent px-3 text-lg font-medium outline-none placeholder:text-slate-400 dark:text-white"
                      />
                    </div>
                    <div className="flex items-center justify-between px-2 pb-2 pt-2">
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                        <Icon.Cube className="w-4 h-4" />
                        Auto
                        <Icon.Chevron className="w-3 h-3" />
                      </div>
                      <button
                        onClick={() => void searchListings()}
                        disabled={!query.trim()}
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-white transition hover:bg-slate-800 disabled:opacity-50 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
                      >
                        <Icon.ArrowUp className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* SUGGESTIONS */}
                <div className="mt-8 w-full">
                  <div className="flex flex-wrap items-center gap-2">
                    {suggestions.map((s, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          if (s.label === "Mu Kigali") setQuery("Ndashaka ibintu mu Kigali");
                          else if (s.label === "Ibiciro byiza") setQuery("Ndashaka ibintu bitujuje");
                          else if (s.label === "Ibicuruzwa bishya") setQuery("Ndashaka ibicuruzwa bishya");
                          else setQuery("");
                          inputRef.current?.focus();
                        }}
                        className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition ${
                          s.active
                            ? "bg-slate-100 text-slate-900 dark:bg-white/10 dark:text-white"
                            : "text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-white/5"
                        }`}
                      >
                        <s.icon className="w-4 h-4" />
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* TRENDING CARD */}
                <div className="mt-6 w-full rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md dark:border-white/10 dark:bg-[#1a1a1a]">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800">
                       <img src="/homeimg.png" alt="Trending" className="h-full w-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                        Shakisha Laptop mu Kigali ugereranye n'ibiciro, na condition.
                      </p>
                      <p className="mt-1 text-xs text-slate-500">Byakozwe na AI. Reba amakuru y'ingenzi ku bwisanzure.</p>
                    </div>
                    <Icon.ArrowRight className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              </div>
            )}

            {/* CHAT HISTORY */}
            {chatHistory.map((msg, idx) => (
              <div key={idx} className="mb-8">
                {msg.role === "user" ? (
                  <div className="flex justify-end mb-4">
                    <div className="rounded-2xl rounded-tr-sm bg-slate-900 px-5 py-3 text-sm font-medium text-white dark:bg-white dark:text-slate-900 max-w-[85%]">
                      {msg.content}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {/* AI Message Bubble */}
                    <div className="flex items-start gap-4">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#FF5D00] text-white">
                        <Icon.Sparkles className="w-4 h-4" />
                      </div>
                      <div className="rounded-2xl rounded-tl-sm bg-slate-100 px-5 py-3 text-sm font-medium text-slate-800 dark:bg-white/10 dark:text-slate-200 max-w-[85%]">
                        {msg.content}
                      </div>
                    </div>

                    {/* Intent Tags */}
                    {msg.intent && (msg.intent.search_text || msg.intent.location || msg.intent.max_price) && (
                      <div className="ml-12 flex flex-wrap gap-2">
                         {msg.intent.search_text && <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700 dark:bg-white/10 dark:text-slate-300">"{msg.intent.search_text}"</span>}
                         {msg.intent.location && <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-600 dark:bg-emerald-500/10">📍 {msg.intent.location}</span>}
                         {msg.intent.max_price && <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-600 dark:bg-amber-500/10">≤ {new Intl.NumberFormat("en-RW").format(msg.intent.max_price)} RWF</span>}
                      </div>
                    )}

                    {/* Results Grid */}
                    {msg.results && msg.results.length > 0 && (
                      <div className="ml-12 mt-2 grid gap-4 sm:grid-cols-2">
                        {msg.results.map((listing) => (
                          <Link
                            key={listing.id}
                            to={`/listing/${listing.id}`}
                            className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:border-[#FF5D00]/40 hover:shadow-md dark:border-white/10 dark:bg-[#1a1a1a]"
                          >
                            <div className="relative flex h-32 items-center justify-center bg-slate-100 dark:bg-slate-800">
                               <Icon.Image className="h-8 w-8 text-slate-300 transition-transform group-hover:scale-110" />
                               <div className="absolute left-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm">
                                 {listing.category?.name || "General"}
                               </div>
                            </div>
                            <div className="flex flex-1 flex-col p-4">
                              <h3 className="line-clamp-2 text-sm font-bold text-slate-900 group-hover:text-[#FF5D00] dark:text-white">{listing.title}</h3>
                              <p className="mt-2 text-base font-black text-[#FF5D00]">{formatPrice(listing.price, listing.currency)}</p>
                              <div className="mt-auto pt-3 text-xs font-semibold text-slate-500 flex items-center gap-1">
                                <Icon.Pin className="h-3 w-3" /> {listing.location?.district || "Rwanda"}
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                    
                    {msg.results && msg.results.length === 0 && (
                      <div className="ml-12 mt-2 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center dark:border-white/10 dark:bg-white/5">
                        <Icon.Search className="mx-auto h-8 w-8 text-slate-400 mb-2" />
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Nta bicuruzwa mbonye</p>
                        <p className="text-xs text-slate-500 mt-1">Gerageza guhindura amagambo cyangwa ibiciro.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {/* LOADING STATE */}
            {loading && (
              <div className="flex flex-col gap-3">
                <div className="flex justify-end mb-4">
                  <div className="rounded-2xl rounded-tr-sm bg-slate-100 px-5 py-3 text-sm font-medium text-slate-400 dark:bg-white/5">
                    Iratunganywa...
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#FF5D00]/20 text-[#FF5D00]">
                    <Icon.Brain className="w-4 h-4 animate-pulse" />
                  </div>
                  <div className="rounded-2xl rounded-tl-sm bg-slate-50 p-4 dark:bg-white/5 w-full max-w-md">
                    <p className="text-xs font-bold text-slate-500 mb-3">{aiStatus || "Irakumva..."}</p>
                    <div className="space-y-3">
                      {thinkingSteps.map((step, i) => {
                        const StepIcon = step.icon
                        const isDone = thinkingStep > i
                        const isActive = thinkingStep === i
                        return (
                          <div key={step.label} className="flex items-center gap-3">
                            <span className={`flex h-5 w-5 items-center justify-center rounded-full ${isDone ? "bg-emerald-500 text-white" : isActive ? "bg-[#FF5D00] text-white" : "bg-slate-200 text-slate-400 dark:bg-white/10"}`}>
                              {isDone ? <Icon.Check className="w-3 h-3" /> : <StepIcon className="w-3 h-3" />}
                            </span>
                            <span className={`text-xs font-semibold ${isDone ? "text-emerald-600" : isActive ? "text-slate-900 dark:text-white" : "text-slate-400"}`}>
                              {step.label}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ERROR */}
            {error && (
              <div className="mt-4 flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200">
                <Icon.Alert className="w-5 h-5 shrink-0" />
                <p className="text-sm font-semibold">{error}</p>
              </div>
            )}

          </div>
        </div>

        {/* BOTTOM INPUT BAR (Only when chat has started) */}
        {!isInitialState && (
          <div className="shrink-0 border-t border-slate-200 bg-white/80 p-4 backdrop-blur-md dark:border-white/10 dark:bg-[#0a0a0a]/80">
            <div className="mx-auto max-w-3xl">
              <div className="group relative flex items-center rounded-full border border-slate-300 bg-white p-1.5 shadow-sm transition-all focus-within:border-[#FF5D00] dark:border-white/20 dark:bg-[#1a1a1a]">
                <button onClick={resetChat} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10">
                  <Icon.Plus className="w-4 h-4" />
                </button>
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") void searchListings() }}
                  placeholder="Baza ikindi kibazo..."
                  className="min-h-[40px] w-full bg-transparent px-2 text-sm font-medium outline-none dark:text-white"
                />
                <button onClick={() => void searchListings()} disabled={!query.trim()} className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-white disabled:opacity-50 dark:bg-white dark:text-slate-900">
                  <Icon.ArrowUp className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}