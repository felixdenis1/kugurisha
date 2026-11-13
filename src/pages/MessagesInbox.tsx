import { useEffect, useMemo, useRef, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { supabase } from "../services/supabase"

type Conversation = {
  id: string
  listing_id: string
  buyer_id: string
  seller_id: string
  updated_at: string
  listing?: {
    title: string
    price: number | null
    currency: string | null
  } | null
}

type Message = {
  id: string
  conversation_id: string
  sender_id: string
  message: string
  is_read: boolean
  created_at: string
}

type ConversationWithMessage = Conversation & {
  latestMessage: Message | null
  unreadCount?: number
}

/* ──────────────────────────────────────────────────────────────────────────
   ICON SYSTEM
   ────────────────────────────────────────────────────────────────────────── */
type IconProps = { className?: string }
const Icon = {
  Search: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
  ),
  Chat: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
    </svg>
  ),
  Send: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
    </svg>
  ),
  ArrowRight: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
    </svg>
  ),
  ArrowLeft: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
    </svg>
  ),
  ArrowUpRight: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
    </svg>
  ),
  ArrowDownLeft: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19.5 4.5l-15 15m0 0h11.25M4.5 19.5V8.25" />
    </svg>
  ),
  Tag: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
    </svg>
  ),
  Plus: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  ),
  Home: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75" />
    </svg>
  ),
  Clock: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  User: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  ),
  Store: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" />
    </svg>
  ),
  Sparkles: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
    </svg>
  ),
  Inbox: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M2.25 13.5h3.86a2.25 2.25 0 012.012 1.244l.256.512a2.25 2.25 0 002.013 1.244h3.218a2.25 2.25 0 002.013-1.244l.256-.512a2.25 2.25 0 012.013-1.244h3.859m-19.5.338V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 00-2.15-1.588H6.911a2.25 2.25 0 00-2.15 1.588L2.35 13.177a2.25 2.25 0 00-.1.661z" />
    </svg>
  ),
  Check: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  ),
  Close: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  Filter: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
    </svg>
  ),
  Alert: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
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
  Keyboard: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M6 12h.008v.008H6V12zm2.25 0h.008v.008h-.008V12zm2.25 0h.008v.008H10.5V12zm2.25 0h.008v.008H12.75V12zm2.25 0h.008v.008H15V12zm2.25 0h.008v.008H17.25V12zM4.5 21h15a2.25 2.25 0 002.25-2.25V5.25A2.25 2.25 0 0019.5 3h-15A2.25 2.25 0 002.25 5.25v13.5A2.25 2.25 0 004.5 21zM6 15.75h12" />
    </svg>
  ),
  Volume: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
    </svg>
  ),
  Bell: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
    </svg>
  ),
}

/* ──────────────────────────────────────────────────────────────────────────
   HELPERS
   ────────────────────────────────────────────────────────────────────────── */
function formatPrice(price: number | null | undefined, currency: string | null | undefined) {
  if (price === null || price === undefined) return "Twandikire ku giciro"
  return `${new Intl.NumberFormat("en-US").format(price)} ${currency || "RWF"}`
}

function formatDate(date: string) {
  const value = new Date(date)
  const now = new Date()
  const diff = now.getTime() - value.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (minutes < 1) return "Nonaha"
  if (minutes < 60) return `${minutes} min`
  if (hours < 24) return `${hours}h`
  if (days < 7) return `${days}d`
  return value.toLocaleDateString("rw-RW", { day: "2-digit", month: "short" })
}

function truncate(text: string, length = 95) {
  if (text.length <= length) return text
  return `${text.slice(0, length).trim()}...`
}

function getInitials(label: string) {
  const words = label.trim().split(/\s+/)
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return `${words[0][0]}${words[1][0]}`.toUpperCase()
}

function getRoleLabel(conversation: Conversation, userId: string) {
  if (conversation.buyer_id === userId) return "Umuguzi"
  if (conversation.seller_id === userId) return "Umucuruzi"
  return "Umunyamuryango"
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

type FilterKey = "all" | "unread" | "buying" | "selling"

/* ──────────────────────────────────────────────────────────────────────────
   COMPONENT
   ────────────────────────────────────────────────────────────────────────── */
function MessagesInbox() {
  const navigate = useNavigate()

  const [userId, setUserId] = useState<string | null>(null)
  const [conversations, setConversations] = useState<ConversationWithMessage[]>([])
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<FilterKey>("all")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [showShortcuts, setShowShortcuts] = useState(false)
  const searchRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    let mounted = true
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!mounted) return
      if (!user) { navigate("/login"); return }
      setUserId(user.id)
    }
    loadUser()
    return () => { mounted = false }
  }, [navigate])

  useEffect(() => {
    if (!userId) return
    let mounted = true

    const loadConversations = async () => {
      setLoading(true)
      setError("")
      try {
        const { data: conversationData, error: conversationError } = await supabase
          .from("conversations")
          .select(`
            id, listing_id, buyer_id, seller_id, updated_at,
            listing:listings(title, price, currency)
          `)
          .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
          .order("updated_at", { ascending: false })

        if (conversationError) throw conversationError

        const baseConversations = (conversationData || []).map((item) => ({
          ...item,
          listing: Array.isArray(item.listing) ? item.listing[0] || null : item.listing || null,
        })) as Conversation[]

        if (baseConversations.length === 0) {
          if (mounted) { setConversations([]); setLoading(false) }
          return
        }

        const conversationIds = baseConversations.map((c) => c.id)

        const { data: messageData, error: messageError } = await supabase
          .from("messages")
          .select(`id, conversation_id, sender_id, message, is_read, created_at`)
          .in("conversation_id", conversationIds)
          .order("created_at", { ascending: false })

        if (messageError) throw messageError

        const latestMessages = new Map<string, Message>()
        const unreadCounts = new Map<string, number>()
        ;(messageData || []).forEach((m) => {
          if (!latestMessages.has(m.conversation_id)) latestMessages.set(m.conversation_id, m)
          if (m.sender_id !== userId && !m.is_read) {
            unreadCounts.set(m.conversation_id, (unreadCounts.get(m.conversation_id) || 0) + 1)
          }
        })

        const result: ConversationWithMessage[] = baseConversations.map((c) => ({
          ...c,
          latestMessage: latestMessages.get(c.id) || null,
          unreadCount: unreadCounts.get(c.id) || 0,
        }))

        if (mounted) setConversations(result)
      } catch (err) {
        console.error("Error loading conversations:", err)
        if (mounted) setError("Habaye ikibazo mu kubona ibiganiro byawe. Ongera ugerageze.")
      } finally {
        if (mounted) setLoading(false)
      }
    }

    loadConversations()

    const channel = supabase
      .channel(`messages-inbox-${userId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, async (payload) => {
        const newMessage = payload.new as Message
        const existingConversation = conversations.find((c) => c.id === newMessage.conversation_id)
        if (existingConversation) {
          setConversations((current) =>
            current
              .map((c) => c.id === newMessage.conversation_id
                ? {
                    ...c,
                    latestMessage: newMessage,
                    updated_at: newMessage.created_at,
                    unreadCount: (c.unreadCount || 0) + (newMessage.sender_id !== userId && !newMessage.is_read ? 1 : 0),
                  }
                : c
              )
              .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
          )
          return
        }
        await loadConversations()
      })
      .subscribe()

    return () => { mounted = false; supabase.removeChannel(channel) }
  }, [userId])

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: globalThis.KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        searchRef.current?.focus()
      }
      if (e.key === "/" && document.activeElement?.tagName !== "INPUT" && document.activeElement?.tagName !== "TEXTAREA") {
        e.preventDefault()
        searchRef.current?.focus()
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [])

  const filteredConversations = useMemo(() => {
    let arr = conversations
    if (filter === "unread") arr = arr.filter((c) => c.latestMessage && c.latestMessage.sender_id !== userId && !c.latestMessage.is_read)
    else if (filter === "buying") arr = arr.filter((c) => c.buyer_id === userId)
    else if (filter === "selling") arr = arr.filter((c) => c.seller_id === userId)

    const value = search.trim().toLowerCase()
    if (!value) return arr

    return arr.filter((c) => {
      const title = c.listing?.title?.toLowerCase() || ""
      const message = c.latestMessage?.message?.toLowerCase() || ""
      const role = userId ? getRoleLabel(c, userId).toLowerCase() : ""
      return title.includes(value) || message.includes(value) || role.includes(value)
    })
  }, [conversations, search, filter, userId])

  const unreadCount = useMemo(() => conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0), [conversations])
  const buyingCount = useMemo(() => conversations.filter((c) => c.buyer_id === userId).length, [conversations, userId])
  const sellingCount = useMemo(() => conversations.filter((c) => c.seller_id === userId).length, [conversations, userId])

  const totalConversations = useCountUp(conversations.length)
  const totalUnread = useCountUp(unreadCount)
  const totalBuying = useCountUp(buyingCount)
  const totalSelling = useCountUp(sellingCount)

  const openConversation = async (conversation: ConversationWithMessage) => {
    setSelectedId(conversation.id)
    if (userId && conversation.unreadCount && conversation.unreadCount > 0) {
      await supabase
        .from("messages")
        .update({ is_read: true })
        .eq("conversation_id", conversation.id)
        .neq("sender_id", userId)
    }
    navigate(`/messages/${conversation.id}`)
  }

  const filterTabs: { key: FilterKey; label: string; count: number; icon: React.ComponentType<IconProps>; tone: string }[] = [
    { key: "all", label: "Zose", count: totalConversations, icon: Icon.Inbox, tone: "slate" },
    { key: "unread", label: "Bishya", count: totalUnread, icon: Icon.Sparkles, tone: "orange" },
    { key: "buying", label: "Ndugura", count: totalBuying, icon: Icon.User, tone: "blue" },
    { key: "selling", label: "Ndegurisha", count: totalSelling, icon: Icon.Store, tone: "emerald" },
  ]

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f4f8fb] text-[#102436] dark:bg-[#060f19] dark:text-slate-100">
      {/* Ambient glows */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-blue-500/10 blur-[140px] dark:bg-blue-500/[0.06]" />
        <div className="absolute top-1/3 -right-40 h-[600px] w-[600px] rounded-full bg-[#FF5D00]/10 blur-[140px] dark:bg-[#FF5D00]/[0.06]" />
        <div className="absolute bottom-0 left-1/3 h-[500px] w-[500px] rounded-full bg-indigo-500/10 blur-[140px] dark:bg-indigo-500/[0.04]" />
      </div>

      {/* Header */}
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
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Ubutumwa</p>
            </div>
          </Link>

          <nav className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setShowShortcuts(true)}
              className="hidden items-center gap-1.5 rounded-full border border-slate-200/80 bg-white px-3 py-2 text-xs font-extrabold text-slate-700 shadow-sm transition hover:border-[#FF5D00] hover:text-[#FF5D00] dark:border-white/10 dark:bg-white/[0.06] dark:text-slate-200 sm:inline-flex"
            >
              <Icon.Keyboard className="w-3.5 h-3.5" />
              Shortcuts
            </button>
            <Link
              to="/"
              className="hidden items-center gap-1.5 rounded-full border border-slate-200/80 bg-white px-3.5 py-2 text-xs font-extrabold text-slate-700 shadow-sm transition hover:border-[#FF5D00] hover:text-[#FF5D00] dark:border-white/10 dark:bg-white/[0.06] dark:text-slate-200 sm:inline-flex"
            >
              <Icon.Home className="w-3.5 h-3.5" />
              Ahabanza
            </Link>
            <Link
              to="/create-listing"
              className="group inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#FF5D00] via-[#FF7424] to-[#e05200] px-3.5 py-2 text-xs font-black text-white shadow-md shadow-[#FF5D00]/30 transition hover:-translate-y-0.5"
            >
              <Icon.Plus className="w-3.5 h-3.5" />
              Gurisha
            </Link>
          </nav>
        </div>
      </header>

      <div className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Hero */}
        <section className="mb-6">
          <Link
            to="/"
            className="group mb-3 inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 transition hover:text-[#FF5D00] dark:text-slate-400"
          >
            <Icon.ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
            Subira Ahabanza
          </Link>

          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/70 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-blue-600 backdrop-blur dark:border-white/10 dark:bg-white/[0.06] dark:text-blue-400">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inset-0 animate-ping rounded-full bg-blue-500 opacity-75" />
                  <span className="relative flex h-2 w-2 rounded-full bg-blue-500" />
                </span>
                <Icon.Bolt className="w-3 h-3" />
                Inbox · Live
              </div>
              <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white sm:text-4xl">
                Ubutumwa
                <span className="ml-2 bg-gradient-to-r from-[#FF5D00] via-[#FF7424] to-[#e05200] bg-clip-text text-transparent">
                  bwose
                </span>
              </h1>
              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600 dark:text-slate-400 sm:text-base">
                Reba ibiganiro byose n'abaguzi n'abacuruzi. Kanda ikiganiro ujye kuvugana.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              {filterTabs.map((tab) => {
                const TabIcon = tab.icon
                const toneMap: Record<string, string> = {
                  slate: "text-slate-600 dark:text-slate-300",
                  orange: "text-[#FF5D00]",
                  blue: "text-blue-600 dark:text-blue-400",
                  emerald: "text-emerald-600 dark:text-emerald-400",
                }
                return (
                  <div
                    key={tab.key}
                    className="rounded-2xl border border-slate-200/70 bg-white/80 px-4 py-2.5 shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-900/60"
                  >
                    <p className={`flex items-center gap-1 text-[9px] font-black uppercase tracking-wider ${toneMap[tab.tone]}`}>
                      <TabIcon className="w-2.5 h-2.5" />
                      {tab.label}
                    </p>
                    <p className="mt-0.5 text-xl font-black text-slate-900 dark:text-white">{tab.count}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Main split-panel */}
        <section className="overflow-hidden rounded-[32px] border border-slate-200/70 bg-white/80 shadow-[0_30px_80px_-30px_rgba(16,36,54,0.35)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/60">
          <div className="grid lg:grid-cols-[minmax(0,1fr)_360px]">
            {/* LEFT: Conversation list */}
            <div className="min-w-0 border-r border-slate-100 dark:border-white/10">
              {/* Toolbar */}
              <div className="border-b border-slate-100 bg-white/60 p-4 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.02] sm:p-5">
                <div className="relative">
                  <Icon.Search className="pointer-events-none absolute left-4 top-1/2 w-4 h-4 -translate-y-1/2 text-slate-400" />
                  <input
                    ref={searchRef}
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Shakisha ikiganiro... (⌘K)"
                    className="w-full rounded-2xl border border-slate-200/80 bg-slate-50/70 pl-11 pr-11 py-3 text-sm font-bold text-slate-900 outline-none transition-all placeholder:font-semibold placeholder:text-slate-400 focus:border-[#FF5D00] focus:bg-white focus:ring-4 focus:ring-[#FF5D00]/10 dark:border-white/10 dark:bg-white/[0.03] dark:text-white dark:placeholder:text-slate-500"
                  />
                  {search ? (
                    <button
                      type="button"
                      onClick={() => setSearch("")}
                      aria-label="Siba gushakisha"
                      className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-slate-200/70 text-slate-500 transition hover:bg-slate-300 dark:bg-white/10 dark:text-slate-300 dark:hover:bg-white/20"
                    >
                      <Icon.Close className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <kbd className="absolute right-3 top-1/2 hidden -translate-y-1/2 items-center gap-1 rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-black text-slate-500 dark:border-white/10 dark:bg-white/[0.06] dark:text-slate-400 sm:inline-flex">
                      <span>⌘K</span>
                    </kbd>
                  )}
                </div>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {filterTabs.map((tab) => {
                    const isActive = filter === tab.key
                    const TabIcon = tab.icon
                    return (
                      <button
                        key={tab.key}
                        type="button"
                        onClick={() => setFilter(tab.key)}
                        className={`group inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-black transition-all ${
                          isActive
                            ? "bg-gradient-to-r from-[#102436] to-[#1a3350] text-white shadow-md dark:from-[#FF5D00] dark:to-[#e05200]"
                            : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/[0.06]"
                        }`}
                      >
                        <TabIcon className="w-3 h-3" />
                        <span>{tab.label}</span>
                        <span className={`rounded-full px-1.5 py-0.5 text-[9px] ${isActive ? "bg-white/20" : "bg-slate-200/70 dark:bg-white/10"}`}>
                          {tab.count}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="mx-4 mt-4 flex items-center gap-2 rounded-2xl border border-rose-500/25 bg-rose-500/10 px-4 py-3 text-sm font-bold text-rose-600 dark:text-rose-400">
                  <Icon.Alert className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}

              {/* Loading / empty / list */}
              {loading ? (
                <div className="space-y-2 p-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 dark:border-white/5 dark:bg-white/[0.02]">
                      <div className="flex gap-3">
                        <div className="h-12 w-12 shrink-0 animate-pulse rounded-2xl bg-slate-200 dark:bg-white/10" />
                        <div className="min-w-0 flex-1 space-y-2">
                          <div className="h-3.5 w-40 animate-pulse rounded-full bg-slate-200 dark:bg-white/10" />
                          <div className="h-3 w-24 animate-pulse rounded-full bg-slate-200 dark:bg-white/10" />
                          <div className="h-3 w-full animate-pulse rounded-full bg-slate-200 dark:bg-white/10" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="px-6 py-16 text-center">
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-500/15 to-indigo-500/10 text-blue-500">
                    {search || filter !== "all" ? <Icon.Filter className="w-9 h-9" /> : <Icon.Inbox className="w-9 h-9" />}
                  </div>
                  <h2 className="mt-5 text-xl font-black text-slate-900 dark:text-white">
                    {search ? "Nta biganiro bibonetse" : filter !== "all" ? "Nta biganiro muri iyi filtre" : "Nta biganiro uratangira"}
                  </h2>
                  <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500 dark:text-slate-400">
                    {search
                      ? "Gerageza gushakisha ukoresheje irindi jambo."
                      : filter !== "all"
                      ? "Subiza filtre urebe ibiganiro byose."
                      : "Iyo wandikiye umucuruzi cyangwa umuguzi, ibiganiro byawe bizagaragara hano."}
                  </p>
                  {(search || filter !== "all") && (
                    <button
                      type="button"
                      onClick={() => { setSearch(""); setFilter("all") }}
                      className="group mt-5 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#FF5D00] via-[#FF7424] to-[#e05200] px-5 py-2.5 text-sm font-black text-white shadow-lg shadow-[#FF5D00]/30 transition hover:-translate-y-0.5"
                    >
                      <Icon.Filter className="w-3.5 h-3.5" />
                      Reba ibiganiro byose
                    </button>
                  )}
                </div>
              ) : (
                <div className="max-h-[calc(100vh-260px)] space-y-1.5 overflow-y-auto p-3 sm:p-4">
                  {filteredConversations.map((conversation) => {
                    const latestMessage = conversation.latestMessage
                    const unread = !!latestMessage && latestMessage.sender_id !== userId && !latestMessage.is_read
                    const unreadN = conversation.unreadCount || 0
                    const role = userId ? getRoleLabel(conversation, userId) : "Umunyamuryango"
                    const listingTitle = conversation.listing?.title || "Ikiganiro"
                    const initials = getInitials(listingTitle)
                    const isSentByMe = !!latestMessage && latestMessage.sender_id === userId
                    const isSelected = selectedId === conversation.id

                    return (
                      <button
                        key={conversation.id}
                        type="button"
                        onClick={() => openConversation(conversation)}
                        className={`group relative block w-full rounded-2xl border p-3 text-left transition-all duration-300 sm:p-4 ${
                          isSelected
                            ? "border-[#FF5D00]/40 bg-[#FF5D00]/[0.04] shadow-[0_14px_35px_-20px_rgba(255,93,0,0.45)]"
                            : unread
                            ? "border-blue-500/25 bg-gradient-to-br from-blue-500/[0.04] to-transparent hover:border-blue-500/40 hover:bg-blue-500/[0.06]"
                            : "border-slate-200/70 bg-white hover:border-slate-300 hover:bg-slate-50/50 dark:border-white/10 dark:bg-slate-900/40 dark:hover:bg-white/[0.04]"
                        }`}
                      >
                        {/* Unread left bar */}
                        {unread && (
                          <span className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-gradient-to-b from-blue-500 to-indigo-600" />
                        )}

                        <div className="flex gap-3">
                          {/* Avatar */}
                          <div className="relative shrink-0">
                            <div className={`flex h-12 w-12 items-center justify-center rounded-2xl text-xs font-black shadow-sm transition-transform group-hover:scale-105 ${
                              unread
                                ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-blue-500/20"
                                : "bg-gradient-to-br from-slate-800 to-slate-950 text-white dark:from-slate-700 dark:to-slate-900"
                            }`}>
                              {initials}
                            </div>
                            {unreadN > 0 && (
                              <span className="absolute -right-1 -top-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full border-2 border-white bg-[#FF5D00] px-1 text-[9px] font-black text-white shadow-md dark:border-slate-900">
                                {unreadN > 9 ? "9+" : unreadN}
                              </span>
                            )}
                          </div>

                          {/* Content */}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <h3 className={`truncate text-sm font-black ${unread ? "text-slate-900 dark:text-white" : "text-slate-800 dark:text-slate-100"}`}>
                                  {listingTitle}
                                </h3>
                                <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                                  <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-slate-500 dark:text-slate-400">
                                    {role === "Umuguzi" ? <Icon.User className="w-2.5 h-2.5" /> : <Icon.Store className="w-2.5 h-2.5" />}
                                    {role}
                                  </span>
                                  <span className="h-0.5 w-0.5 rounded-full bg-slate-300 dark:bg-slate-600" />
                                  <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-slate-400">
                                    <Icon.Clock className="w-2.5 h-2.5" />
                                    {formatDate(conversation.updated_at)}
                                  </span>
                                </div>
                              </div>
                              <span className="shrink-0 rounded-full bg-slate-100 px-1.5 py-0.5 text-[9px] font-black text-slate-600 dark:bg-white/[0.06] dark:text-slate-300">
                                {formatPrice(conversation.listing?.price, conversation.listing?.currency)}
                              </span>
                            </div>

                            {/* Message preview */}
                            <div className="mt-2 flex items-start gap-1.5">
                              <span className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded ${
                                isSentByMe ? "bg-slate-900 text-white dark:bg-white/10" : "bg-[#FF5D00]/15 text-[#FF5D00]"
                              }`}>
                                {isSentByMe ? <Icon.ArrowUpRight className="w-2.5 h-2.5" /> : <Icon.ArrowDownLeft className="w-2.5 h-2.5" />}
                              </span>
                              <p className={`line-clamp-1 text-xs leading-5 ${unread ? "font-bold text-slate-700 dark:text-slate-200" : "font-medium text-slate-500 dark:text-slate-400"}`}>
                                {latestMessage ? truncate(latestMessage.message, 90) : "Nta butumwa..."}
                              </p>
                            </div>
                          </div>

                          {/* Right arrow */}
                          <span className="hidden shrink-0 items-center text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-[#FF5D00] sm:flex">
                            <Icon.ArrowRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}

              {/* Footer note */}
              {!loading && filteredConversations.length > 0 && (
                <div className="border-t border-slate-100 bg-white/50 px-4 py-2.5 text-center dark:border-white/10 dark:bg-white/[0.02]">
                  <p className="flex items-center justify-center gap-1 text-[10px] font-semibold text-slate-400">
                    <Icon.Shield className="w-3 h-3 text-emerald-500" />
                    Ubutumwa bwawe bubikwa kandi bugahora buboneka.
                  </p>
                </div>
              )}
            </div>

            {/* RIGHT: Context panel */}
            <aside className="hidden bg-gradient-to-br from-slate-50/60 to-white/40 dark:from-white/[0.02] dark:to-transparent lg:block">
              <div className="sticky top-24 space-y-4 p-5">
                {/* Live indicator card */}
                <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-900/60">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Uko uhagaze</p>
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inset-0 animate-ping rounded-full bg-emerald-500 opacity-75" />
                      <span className="relative flex h-2 w-2 rounded-full bg-emerald-500" />
                    </span>
                  </div>
                  <p className="mt-2 flex items-center gap-1.5 text-sm font-black text-slate-900 dark:text-white">
                    <Icon.Bolt className="w-4 h-4 text-emerald-500" />
                    Realtime yatangiye
                  </p>
                  <p className="mt-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    Ubutumwa buhita bugera kuri iyi device.
                  </p>
                </div>

                {/* Quick stats donut */}
                <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-900/60">
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Ibiganiro uko bimeze</p>
                  <div className="mt-3 flex items-center gap-4">
                    <div className="relative shrink-0">
                      <svg width="80" height="80" className="-rotate-90">
                        <circle cx="40" cy="40" r="32" fill="none" stroke="currentColor" strokeWidth="8" className="text-slate-200 dark:text-white/10" />
                        <circle
                          cx="40" cy="40" r="32"
                          fill="none" stroke="#3b82f6" strokeWidth="8" strokeLinecap="round"
                          strokeDasharray={`${conversations.length ? (buyingCount / conversations.length) * 201 : 0} 201`}
                          style={{ transition: "stroke-dasharray 700ms ease" }}
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <p className="text-lg font-black text-slate-900 dark:text-white">{conversations.length}</p>
                        <p className="text-[8px] font-black uppercase tracking-wider text-slate-400">Zose</p>
                      </div>
                    </div>
                    <div className="min-w-0 flex-1 space-y-1.5">
                      {[
                        { label: "Ndugura", value: buyingCount, color: "#3b82f6" },
                        { label: "Ndagurisha", value: sellingCount, color: "#10b981" },
                        { label: "Bishya", value: unreadCount, color: "#FF5D00" },
                      ].map((s) => (
                        <div key={s.label} className="flex items-center gap-1.5 text-[11px]">
                          <span className="h-1.5 w-1.5 rounded-full" style={{ background: s.color }} />
                          <span className="flex-1 truncate font-semibold text-slate-600 dark:text-slate-400">{s.label}</span>
                          <span className="font-black text-slate-900 dark:text-white">{s.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Tips card */}
                <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-900/60">
                  <p className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400">
                    <Icon.Sparkles className="w-3 h-3 text-[#FF5D00]" />
                    Inama
                  </p>
                  <ul className="mt-2.5 space-y-2 text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                    <li className="flex items-start gap-1.5">
                      <Icon.Check className="w-3 h-3 mt-0.5 shrink-0 text-emerald-500" />
                      Vugana gusa ku Isoko kugira ngo ube safe.
                    </li>
                    <li className="flex items-start gap-1.5">
                      <Icon.Check className="w-3 h-3 mt-0.5 shrink-0 text-emerald-500" />
                      Baza ibibazo mbere yo kwishyura.
                    </li>
                    <li className="flex items-start gap-1.5">
                      <Icon.Check className="w-3 h-3 mt-0.5 shrink-0 text-emerald-500" />
                      Koresha amafoto nyayo y'ikintu.
                    </li>
                  </ul>
                </div>

                {/* Shortcuts teaser */}
                <button
                  type="button"
                  onClick={() => setShowShortcuts(true)}
                  className="group flex w-full items-center justify-between rounded-2xl border border-slate-200/70 bg-white/80 p-3 text-left shadow-sm backdrop-blur transition hover:border-[#FF5D00]/40 hover:bg-[#FF5D00]/[0.03] dark:border-white/10 dark:bg-slate-900/60"
                >
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-500 dark:bg-white/[0.06] dark:text-slate-300">
                      <Icon.Keyboard className="w-3.5 h-3.5" />
                    </span>
                    <div>
                      <p className="text-[11px] font-black text-slate-900 dark:text-white">Keyboard shortcuts</p>
                      <p className="text-[9px] font-semibold text-slate-400">⌘K shakisha · ESC funga</p>
                    </div>
                  </div>
                  <Icon.ArrowRight className="w-3.5 h-3.5 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-[#FF5D00]" />
                </button>
              </div>
            </aside>
          </div>
        </section>
      </div>

      {/* Shortcuts modal */}
      {showShortcuts && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
          onClick={() => setShowShortcuts(false)}
        >
          <div
            className="w-full max-w-md rounded-3xl border border-slate-200/70 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-slate-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#FF5D00]/10 text-[#FF5D00]">
                  <Icon.Keyboard className="w-4 h-4" />
                </span>
                <h3 className="text-sm font-black text-slate-900 dark:text-white">Keyboard shortcuts</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowShortcuts(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 dark:hover:bg-white/[0.06]"
              >
                <Icon.Close className="w-4 h-4" />
              </button>
            </div>
            <div className="mt-4 space-y-2">
              {[
                { keys: ["⌘", "K"], label: "Shakisha ibiganiro" },
                { keys: ["/"], label: "Shakisha (vuba)" },
                { keys: ["Enter"], label: "Fungura ikiganiro" },
                { keys: ["Esc"], label: "Funga" },
              ].map((s) => (
                <div key={s.label} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2.5 dark:bg-white/[0.04]">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{s.label}</span>
                  <div className="flex items-center gap-1">
                    {s.keys.map((k) => (
                      <kbd key={k} className="rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-black text-slate-600 shadow-sm dark:border-white/10 dark:bg-white/[0.06] dark:text-slate-300">
                        {k}
                      </kbd>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

export default MessagesInbox