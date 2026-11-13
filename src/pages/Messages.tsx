import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { supabase } from "../services/supabase"

type Conversation = {
  id: string
  listing_id: string
  buyer_id: string
  seller_id: string
  created_at: string
  updated_at: string
}

type Listing = {
  id: string
  title: string
  price: number | null
  currency: string | null
  status: string | null
}

type Message = {
  id: string
  conversation_id: string
  sender_id: string
  message: string
  is_read: boolean
  created_at: string
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
  ArrowUpRight: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
    </svg>
  ),
  Send: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
    </svg>
  ),
  Chat: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
    </svg>
  ),
  Check: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  ),
  CheckDouble: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.3} d="M4.5 12.75l4 4L16 9.25M12 16.75l2 2 8.5-9.5" />
    </svg>
  ),
  Phone: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
    </svg>
  ),
  Video: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
    </svg>
  ),
  More: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
    </svg>
  ),
  Bolt: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
    </svg>
  ),
  Sparkles: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
    </svg>
  ),
  Shield: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  ),
  Alert: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
    </svg>
  ),
  Info: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
    </svg>
  ),
  Tag: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
    </svg>
  ),
  Pencil: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19.5 7.125L16.875 4.5" />
    </svg>
  ),
  Trash: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
  ),
  Close: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  Save: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17.25 7.5V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25h13.5A2.25 2.25 0 0021 18V8.25A2.25 2.25 0 0018.75 6h-1.5zm-10.5-3.75h9v3.75h-9V3.75zm10.5 16.5H5.25V13.5h12v6.75z" />
    </svg>
  ),
}

export default function Messages() {
  const { conversationId } = useParams()
  const navigate = useNavigate()

  const [userId, setUserId] = useState<string | null>(null)
  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [listing, setListing] = useState<Listing | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState("")
  const [isOtherTyping, setIsOtherTyping] = useState(false)
  const [isOtherOnline, setIsOtherOnline] = useState(false)
  const [channelReady, setChannelReady] = useState(false)

  // Message edit/delete state
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState("")
  const [savingEdit, setSavingEdit] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const bottomRef = useRef<HTMLDivElement | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const editTextareaRef = useRef<HTMLTextAreaElement | null>(null)
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!conversationId) { navigate("/messages"); return }
    loadConversation()
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
      if (channelRef.current) { supabase.removeChannel(channelRef.current); channelRef.current = null }
    }
  }, [conversationId])

  useEffect(() => { scrollToBottom() }, [messages, isOtherTyping])

  // Focus the inline edit textarea and size it when entering edit mode
  useEffect(() => {
    if (editingId && editTextareaRef.current) {
      const ta = editTextareaRef.current
      ta.focus()
      ta.setSelectionRange(ta.value.length, ta.value.length)
      ta.style.height = "auto"
      ta.style.height = `${Math.min(ta.scrollHeight, 140)}px`
    }
  }, [editingId])

  async function loadConversation() {
    try {
      setLoading(true); setError("")
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { navigate("/login"); return }
      setUserId(user.id)
      if (!conversationId) { navigate("/messages"); return }

      const { data: conversationData, error: conversationError } = await supabase
        .from("conversations")
        .select(`id, listing_id, buyer_id, seller_id, created_at, updated_at`)
        .eq("id", conversationId).single()
      if (conversationError) throw conversationError

      const currentConversation = conversationData as Conversation
      const isParticipant =
        currentConversation.buyer_id === user.id || currentConversation.seller_id === user.id
      if (!isParticipant) throw new Error("Ntibyemewe kubona ubu butumwa.")

      setConversation(currentConversation)

      const { data: listingData, error: listingError } = await supabase
        .from("listings")
        .select(`id, title, price, currency, status`)
        .eq("id", currentConversation.listing_id).single()
      if (!listingError && listingData) setListing(listingData as Listing)

      const { data: messagesData, error: messagesError } = await supabase
        .from("messages")
        .select(`id, conversation_id, sender_id, message, is_read, created_at`)
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true })
      if (messagesError) throw messagesError

      setMessages((messagesData ?? []) as Message[])

      const unreadIds = (messagesData ?? [])
        .filter((m) => m.sender_id !== user.id && !m.is_read)
        .map((m) => m.id)
      if (unreadIds.length > 0) {
        await supabase.from("messages").update({ is_read: true }).in("id", unreadIds)
      }

      setupRealtimeChannel(conversationId, user.id)
    } catch (err) {
      console.error("Load conversation error:", err)
      setError(err instanceof Error ? err.message : "Habaye ikibazo mu gufungura ubutumwa.")
    } finally { setLoading(false) }
  }

  function setupRealtimeChannel(currentConversationId: string, currentUserId: string) {
    if (channelRef.current) supabase.removeChannel(channelRef.current)
    setChannelReady(false)

    const channel = supabase.channel(`conversation-${currentConversationId}`, {
      config: {
        broadcast: { self: false },
        presence: { key: currentUserId },
      },
    })

    channel
      .on("postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${currentConversationId}` },
        async (payload) => {
          const incomingMessage = payload.new as Message
          if (incomingMessage.sender_id === currentUserId) return
          setMessages((current) => {
            if (current.some((m) => m.id === incomingMessage.id)) return current
            return [...current, incomingMessage]
          })
          setIsOtherTyping(false)
          await supabase.from("messages").update({ is_read: true }).eq("id", incomingMessage.id)
        }
      )
      // Listen for UPDATE (edited messages from the other user)
      .on("postgres_changes",
        { event: "UPDATE", schema: "public", table: "messages", filter: `conversation_id=eq.${currentConversationId}` },
        (payload) => {
          const updated = payload.new as Message
          setMessages((current) => current.map((m) => (m.id === updated.id ? { ...m, ...updated } : m)))
        }
      )
      // Listen for DELETE (deleted messages from the other user)
      .on("postgres_changes",
        { event: "DELETE", schema: "public", table: "messages", filter: `conversation_id=eq.${currentConversationId}` },
        (payload) => {
          const removedId = (payload.old as { id?: string })?.id
          if (removedId) setMessages((current) => current.filter((m) => m.id !== removedId))
        }
      )
      .on("broadcast", { event: "typing" }, (payload) => {
        const senderId = payload.payload?.userId
        if (senderId === currentUserId) return
        const typing = Boolean(payload.payload?.typing)
        setIsOtherTyping(typing)
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
        if (typing) typingTimeoutRef.current = setTimeout(() => setIsOtherTyping(false), 3000)
      })
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState()
        const onlineUsers = Object.keys(state).filter((key) => key !== currentUserId)
        setIsOtherOnline(onlineUsers.length > 0)
      })
      .on("presence", { event: "join" }, ({ key }) => { if (key !== currentUserId) setIsOtherOnline(true) })
      .on("presence", { event: "leave" }, ({ key }) => {
        if (key !== currentUserId) { setIsOtherOnline(false); setIsOtherTyping(false) }
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          setChannelReady(true)
          try { await channel.track({ userId: currentUserId, onlineAt: new Date().toISOString() }) }
          catch (e) { console.error("Presence track error:", e) }
        } else setChannelReady(false)
      })

    channelRef.current = channel
  }

  async function broadcastTyping(typing: boolean) {
    const channel = channelRef.current
    if (!channel || !channelReady || !userId) return
    try { await channel.send({ type: "broadcast", event: "typing", payload: { userId, typing } }) }
    catch (err) { console.error("Typing broadcast error:", err) }
  }

  function handleTyping(value: string) {
    setNewMessage(value)
    if (!value.trim()) {
      void broadcastTyping(false)
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
      autoResizeTextarea(); return
    }
    void broadcastTyping(true)
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    typingTimeoutRef.current = setTimeout(() => { void broadcastTyping(false) }, 1800)
    autoResizeTextarea()
  }

  function autoResizeTextarea() {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = "auto"
    ta.style.height = `${Math.min(ta.scrollHeight, 140)}px`
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void sendMessage() }
  }

  async function sendMessage() {
    const text = newMessage.trim()
    if (!text || !conversationId || !userId) return
    try {
      setSending(true); setError("")
      const { data, error: insertError } = await supabase
        .from("messages")
        .insert({ conversation_id: conversationId, sender_id: userId, message: text, is_read: false })
        .select(`id, conversation_id, sender_id, message, is_read, created_at`)
        .single()
      if (insertError) throw insertError
      if (data) {
        setMessages((current) => {
          if (current.some((m) => m.id === data.id)) return current
          return [...current, data as Message]
        })
      }
      setNewMessage("")
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
      void broadcastTyping(false)
      if (textareaRef.current) { textareaRef.current.style.height = "auto"; textareaRef.current.focus() }
      await supabase.from("conversations").update({ updated_at: new Date().toISOString() }).eq("id", conversationId)
    } catch (err) {
      console.error("Send message error:", err)
      setError("Ubutumwa ntibwoherejwe. Ongera ugerageze.")
    } finally { setSending(false) }
  }

  /* ─────────────── EDIT MESSAGE ─────────────── */
  function startEdit(message: Message) {
    setEditingId(message.id)
    setEditText(message.message)
    setConfirmDeleteId(null)
  }

  function cancelEdit() {
    setEditingId(null)
    setEditText("")
  }

  function handleEditKeyDown(e: KeyboardEvent<HTMLTextAreaElement>, messageId: string) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      void saveEdit(messageId)
    } else if (e.key === "Escape") {
      e.preventDefault()
      cancelEdit()
    }
  }

  async function saveEdit(messageId: string) {
    const text = editText.trim()
    if (!text) return
    const original = messages.find((m) => m.id === messageId)
    if (!original || original.message === text) { cancelEdit(); return }

    try {
      setSavingEdit(true); setError("")
      const { error: updateError } = await supabase
        .from("messages")
        .update({ message: text })
        .eq("id", messageId)
        .eq("sender_id", userId)
      if (updateError) throw updateError
      setMessages((current) => current.map((m) => (m.id === messageId ? { ...m, message: text } : m)))
      cancelEdit()
    } catch (err) {
      console.error("Edit message error:", err)
      setError("Ubutumwa ntibwahinduwe. Ongera ugerageze.")
    } finally { setSavingEdit(false) }
  }

  /* ─────────────── DELETE MESSAGE ─────────────── */
  async function deleteMessage(messageId: string) {
    try {
      setDeletingId(messageId); setError("")
      const { error: deleteError } = await supabase
        .from("messages")
        .delete()
        .eq("id", messageId)
        .eq("sender_id", userId)
      if (deleteError) throw deleteError
      setMessages((current) => current.filter((m) => m.id !== messageId))
      setConfirmDeleteId(null)
      if (editingId === messageId) cancelEdit()
    } catch (err) {
      console.error("Delete message error:", err)
      setError("Ubutumwa ntibwasibwe. Ongera ugerageze.")
    } finally { setDeletingId(null) }
  }

  function scrollToBottom() {
    requestAnimationFrame(() => bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }))
  }

  function formatPrice(price: number | null, currency: string | null) {
    if (price === null) return "Twandikire ku giciro"
    return `${new Intl.NumberFormat("rw-RW").format(price)} ${currency || "Frw"}`
  }

  function formatTime(date: string) {
    return new Intl.DateTimeFormat("rw-RW", { hour: "2-digit", minute: "2-digit" }).format(new Date(date))
  }

  function formatDay(date: string) {
    const messageDate = new Date(date)
    const today = new Date()
    if (messageDate.toDateString() === today.toDateString()) return "Uyu munsi"
    const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1)
    if (messageDate.toDateString() === yesterday.toDateString()) return "Ejo"
    return new Intl.DateTimeFormat("rw-RW", { day: "numeric", month: "long", year: "numeric" }).format(messageDate)
  }

  function shouldShowDay(currentMessage: Message, index: number) {
    if (index === 0) return true
    const previous = messages[index - 1]
    return new Date(currentMessage.created_at).toDateString() !== new Date(previous.created_at).toDateString()
  }

  function shouldGroupWithPrevious(currentMessage: Message, index: number) {
    if (index === 0) return false
    const previous = messages[index - 1]
    if (previous.sender_id !== currentMessage.sender_id) return false
    const diff = new Date(currentMessage.created_at).getTime() - new Date(previous.created_at).getTime()
    return diff < 5 * 60 * 1000
  }

  /* ─────────────── LOADING ─────────────── */
  if (loading) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-[#f4f8fb] dark:bg-[#060f19]">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-blue-500/10 blur-[140px]" />
          <div className="absolute top-1/3 -right-40 h-[600px] w-[600px] rounded-full bg-[#FF5D00]/10 blur-[140px]" />
        </div>
        <div className="relative flex min-h-screen items-center justify-center px-6">
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-200/80 bg-white text-[#FF5D00] shadow-lg dark:border-white/10 dark:bg-slate-900">
              <span className="h-7 w-7 animate-spin rounded-full border-2 border-[#FF5D00]/30 border-t-[#FF5D00]" />
            </div>
            <h2 className="mt-5 text-lg font-black text-slate-900 dark:text-white">Turimo gufungura ubutumwa...</h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Tegereza akanya gato.</p>
          </div>
        </div>
      </div>
    )
  }

  /* ─────────────── ERROR ─────────────── */
  if (error && !conversation) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-[#f4f8fb] px-5 py-10 dark:bg-[#060f19]">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-rose-500/10 blur-[140px]" />
        </div>
        <div className="relative mx-auto flex min-h-[80vh] max-w-xl items-center justify-center">
          <div className="w-full rounded-[28px] border border-slate-200/70 bg-white/80 p-8 text-center shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-slate-900/60">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <Icon.Alert className="w-7 h-7" />
            </div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white">Habaye ikibazo</h1>
            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{error}</p>
            <Link
              to="/messages"
              className="group mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#FF5D00] via-[#FF7424] to-[#e05200] px-5 py-3 text-sm font-black text-white shadow-lg shadow-[#FF5D00]/30 transition hover:-translate-y-0.5"
            >
              <Icon.ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
              Subira ku butumwa
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const otherInitial = listing?.title?.charAt(0)?.toUpperCase() || "K"

  /* ─────────────── MAIN ─────────────── */
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f4f8fb] text-[#102436] antialiased dark:bg-[#060f19] dark:text-slate-100">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-blue-500/10 blur-[140px] dark:bg-blue-500/[0.06]" />
        <div className="absolute top-1/3 -right-40 h-[600px] w-[600px] rounded-full bg-[#FF5D00]/10 blur-[140px] dark:bg-[#FF5D00]/[0.06]" />
        <div className="absolute bottom-0 left-1/3 h-[500px] w-[500px] rounded-full bg-indigo-500/10 blur-[140px] dark:bg-indigo-500/[0.04]" />
      </div>

      {/* HEADER */}
      <header className="sticky top-0 z-30 border-b border-slate-200/60 bg-white/70 backdrop-blur-2xl dark:border-white/10 dark:bg-[#060f19]/70">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              to="/messages"
              className="group flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200/80 bg-white text-slate-600 shadow-sm transition hover:border-[#FF5D00] hover:text-[#FF5D00] dark:border-white/10 dark:bg-white/[0.06] dark:text-slate-300"
              aria-label="Subira"
            >
              <Icon.ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
            </Link>

            <div className="relative shrink-0">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-sm font-black text-white shadow-md shadow-blue-500/25">
                {otherInitial}
              </div>
              <span className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white dark:border-slate-900 ${isOtherOnline ? "bg-emerald-500" : "bg-slate-400"}`} />
            </div>

            <div className="min-w-0">
              <h1 className="truncate text-sm font-black tracking-tight text-slate-900 dark:text-white sm:text-base">
                {listing?.title || "Ubutumwa"}
              </h1>
              <p className="mt-0.5 flex items-center gap-1.5 text-[11px] font-bold text-slate-500 dark:text-slate-400">
                <span className={`h-1.5 w-1.5 rounded-full ${isOtherOnline ? "bg-emerald-500" : "bg-slate-400"}`} />
                {isOtherOnline ? "Online ubu" : "Offline"}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {listing && (
              <Link
                to={`/listing/${listing.id}`}
                className="group hidden items-center gap-1.5 rounded-full border border-slate-200/80 bg-white px-3.5 py-2 text-xs font-extrabold text-slate-700 shadow-sm transition hover:border-[#FF5D00] hover:text-[#FF5D00] dark:border-white/10 dark:bg-white/[0.06] dark:text-slate-200 sm:inline-flex"
              >
                <Icon.Tag className="w-3.5 h-3.5" />
                <span>Reba listing</span>
                <Icon.ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            )}

            <div className={`hidden items-center gap-1.5 rounded-full border px-3 py-1.5 text-[10px] font-black uppercase tracking-wider lg:inline-flex ${
              channelReady
                ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                : "border-slate-200 bg-slate-100/60 text-slate-500 dark:border-white/10 dark:bg-white/[0.05] dark:text-slate-400"
            }`}>
              <span className={`h-1.5 w-1.5 rounded-full ${channelReady ? "bg-emerald-500" : "bg-slate-400"}`} />
              <Icon.Bolt className="w-3 h-3" />
              {channelReady ? "Realtime" : "Connecting"}
            </div>

            <button className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200/80 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/[0.06] dark:text-slate-300">
              <Icon.More className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="relative mx-auto max-w-7xl px-3 py-5 sm:px-6 sm:py-6 lg:px-8">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
          {/* LEFT: CHAT PANEL */}
          <div className="flex flex-col overflow-hidden rounded-[28px] border border-slate-200/70 bg-white/80 shadow-[0_30px_80px_-30px_rgba(16,36,54,0.35)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/60">
            <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-5 py-3.5 dark:border-white/10 sm:px-6">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <Icon.Chat className="w-3.5 h-3.5" />
                </span>
                <div>
                  <p className="text-xs font-black text-slate-900 dark:text-white">Ikiganiro</p>
                  <p className="text-[10px] font-semibold text-slate-400">
                    {messages.length} ubutumwa · {isOtherOnline ? "araza kuri interineti" : "asanzwe offline"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/[0.06] dark:hover:text-slate-200">
                  <Icon.Phone className="w-3.5 h-3.5" />
                </button>
                <button className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/[0.06] dark:hover:text-slate-200">
                  <Icon.Video className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-6 sm:px-7 sm:py-7" style={{ maxHeight: "calc(100vh - 280px)" }}>
              {messages.length === 0 ? (
                <div className="flex h-full min-h-[380px] items-center justify-center">
                  <div className="max-w-xs text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-500/15 to-indigo-500/10 text-blue-500">
                      <Icon.Sparkles className="w-7 h-7" />
                    </div>
                    <h2 className="mt-5 text-base font-black text-slate-900 dark:text-white">Tangira ikiganiro</h2>
                    <p className="mt-1.5 text-xs font-semibold leading-5 text-slate-500 dark:text-slate-400">
                      Ohereza ubutumwa bwa mbere kugira ngo mutangire kuvugana.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-0.5">
                  {messages.map((message, index) => {
                    const isMine = message.sender_id === userId
                    const showDay = shouldShowDay(message, index)
                    const grouped = shouldGroupWithPrevious(message, index)
                    const isEditing = editingId === message.id
                    const isConfirmingDelete = confirmDeleteId === message.id
                    const isDeleting = deletingId === message.id

                    return (
                      <div key={message.id}>
                        {showDay && (
                          <div className="my-6 flex items-center gap-3">
                            <div className="h-px flex-1 bg-slate-100 dark:bg-white/10" />
                            <span className="shrink-0 rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-slate-500 backdrop-blur dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-400">
                              {formatDay(message.created_at)}
                            </span>
                            <div className="h-px flex-1 bg-slate-100 dark:bg-white/10" />
                          </div>
                        )}

                        <div className={`flex ${isMine ? "justify-end" : "justify-start"} ${grouped ? "mt-1" : "mt-3"}`}>
                          <div className="group/msg max-w-[85%] sm:max-w-[72%]">
                            {isEditing ? (
                              /* ─── INLINE EDIT MODE ─── */
                              <div className="rounded-3xl rounded-br-lg border border-[#FF5D00]/40 bg-white p-2 shadow-[0_10px_30px_-10px_rgba(255,93,0,0.35)] ring-4 ring-[#FF5D00]/10 dark:bg-slate-900">
                                <textarea
                                  ref={editTextareaRef}
                                  value={editText}
                                  onChange={(e) => {
                                    setEditText(e.target.value)
                                    const ta = e.currentTarget
                                    ta.style.height = "auto"
                                    ta.style.height = `${Math.min(ta.scrollHeight, 140)}px`
                                  }}
                                  onKeyDown={(e) => handleEditKeyDown(e, message.id)}
                                  rows={1}
                                  className="w-full resize-none rounded-2xl bg-transparent px-2.5 py-2 text-sm font-semibold leading-5 text-slate-900 outline-none placeholder:text-slate-400 dark:text-white"
                                  placeholder="Hindura ubutumwa..."
                                />
                                <div className="flex items-center justify-end gap-1.5 px-1 pb-1">
                                  <button
                                    type="button"
                                    onClick={cancelEdit}
                                    disabled={savingEdit}
                                    className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-black text-slate-500 transition hover:bg-slate-100 disabled:opacity-50 dark:text-slate-400 dark:hover:bg-white/[0.06]"
                                  >
                                    <Icon.Close className="w-3 h-3" />
                                    Hagarika
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => void saveEdit(message.id)}
                                    disabled={savingEdit || !editText.trim()}
                                    className="inline-flex items-center gap-1 rounded-full bg-[#FF5D00] px-2.5 py-1 text-[11px] font-black text-white shadow-sm transition hover:bg-[#e05200] disabled:opacity-50"
                                  >
                                    {savingEdit ? (
                                      <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                                    ) : (
                                      <Icon.Save className="w-3 h-3" />
                                    )}
                                    Bika
                                  </button>
                                </div>
                              </div>
                            ) : (
                              /* ─── NORMAL BUBBLE ─── */
                              <>
                                <div className="relative">
                                  <div
                                    className={[
                                      "px-4 py-2.5 text-sm font-semibold leading-6 shadow-sm transition-all",
                                      isMine
                                        ? "rounded-3xl rounded-br-lg bg-gradient-to-br from-[#0a0f1e] to-[#1a3350] text-white shadow-[0_8px_25px_-12px_rgba(10,15,30,0.8)] dark:from-[#FF5D00] dark:to-[#e05200]"
                                        : "rounded-3xl rounded-bl-lg border border-slate-200/80 bg-white text-slate-800 dark:border-white/10 dark:bg-white/[0.06] dark:text-slate-100",
                                    ].join(" ")}
                                  >
                                    <p className="whitespace-pre-wrap break-words">{message.message}</p>
                                  </div>

                                  {/* Hover actions — only for my own messages, not while confirming delete */}
                                  {isMine && !isConfirmingDelete && (
                                    <div className="pointer-events-none absolute -top-3 right-1 flex items-center gap-1 opacity-0 transition-opacity duration-150 group-hover/msg:pointer-events-auto group-hover/msg:opacity-100">
                                      <button
                                        type="button"
                                        onClick={() => startEdit(message)}
                                        aria-label="Hindura ubutumwa"
                                        className="flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-md transition hover:border-blue-500 hover:text-blue-600 dark:border-white/10 dark:bg-slate-800 dark:text-slate-300"
                                      >
                                        <Icon.Pencil className="w-3 h-3" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setConfirmDeleteId(message.id)}
                                        aria-label="Siba ubutumwa"
                                        className="flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-md transition hover:border-rose-500 hover:text-rose-600 dark:border-white/10 dark:bg-slate-800 dark:text-slate-300"
                                      >
                                        <Icon.Trash className="w-3 h-3" />
                                      </button>
                                    </div>
                                  )}
                                </div>

                                {/* Confirm delete inline row */}
                                {isConfirmingDelete && (
                                  <div className="mt-1.5 flex items-center justify-end gap-1.5 rounded-xl border border-rose-500/25 bg-rose-500/[0.06] px-2 py-1.5">
                                    <span className="mr-auto text-[10px] font-black uppercase tracking-wider text-rose-600 dark:text-rose-400">
                                      Siba ubu butumwa?
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => setConfirmDeleteId(null)}
                                      disabled={isDeleting}
                                      className="rounded-full px-2 py-1 text-[10px] font-black text-slate-600 transition hover:bg-white disabled:opacity-50 dark:text-slate-300 dark:hover:bg-white/10"
                                    >
                                      Oya
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => void deleteMessage(message.id)}
                                      disabled={isDeleting}
                                      className="inline-flex items-center gap-1 rounded-full bg-rose-600 px-2.5 py-1 text-[10px] font-black text-white shadow-sm transition hover:bg-rose-700 disabled:opacity-50"
                                    >
                                      {isDeleting ? (
                                        <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                                      ) : (
                                        <Icon.Trash className="w-3 h-3" />
                                      )}
                                      Siba
                                    </button>
                                  </div>
                                )}

                                <div className={`mt-1 flex items-center gap-1 px-1 text-[9px] font-bold text-slate-400 ${isMine ? "justify-end" : "justify-start"}`}>
                                  <span>{formatTime(message.created_at)}</span>
                                  {isMine && (
                                    <span className={message.is_read ? "text-blue-500" : "text-slate-400"}>
                                      {message.is_read ? <Icon.CheckDouble className="w-3 h-3" /> : <Icon.Check className="w-3 h-3" />}
                                    </span>
                                  )}
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}

                  {isOtherTyping && (
                    <div className="mt-4 flex justify-start">
                      <div className="flex items-center gap-2.5 rounded-full border border-slate-200/80 bg-white px-4 py-2.5 shadow-sm dark:border-white/10 dark:bg-white/[0.06]">
                        <div className="flex items-center gap-1">
                          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.3s]" />
                          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.15s]" />
                          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400" />
                        </div>
                        <span className="text-[10px] font-bold text-slate-400">Arimo kwandika</span>
                      </div>
                    </div>
                  )}

                  <div ref={bottomRef} />
                </div>
              )}
            </div>

            {error && (
              <div className="mx-4 mb-2 flex items-center gap-2 rounded-xl border border-rose-500/25 bg-rose-500/10 px-3.5 py-2 text-[11px] font-bold text-rose-600 dark:text-rose-400 sm:mx-6">
                <Icon.Alert className="w-3.5 h-3.5 shrink-0" />
                {error}
              </div>
            )}

            <div className="shrink-0 border-t border-slate-100 bg-white/60 p-3.5 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.02] sm:p-4">
              <div className="rounded-2xl border border-slate-200/80 bg-white p-1.5 transition-all duration-200 focus-within:border-[#FF5D00] focus-within:ring-4 focus-within:ring-[#FF5D00]/10 dark:border-white/10 dark:bg-white/[0.03]">
                <div className="flex items-end gap-2">
                  <textarea
                    ref={textareaRef}
                    value={newMessage}
                    onChange={(e) => handleTyping(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Andika ubutumwa bwawe..."
                    rows={1}
                    disabled={sending}
                    className="max-h-[140px] min-h-[42px] flex-1 resize-none overflow-y-auto rounded-xl bg-transparent px-3 py-2.5 text-sm font-semibold leading-5 text-slate-900 outline-none placeholder:font-medium placeholder:text-slate-400 disabled:cursor-not-allowed disabled:opacity-60 dark:text-white dark:placeholder:text-slate-500"
                  />

                  <button
                    type="button"
                    onClick={() => void sendMessage()}
                    disabled={sending || !newMessage.trim()}
                    className="group relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-r from-[#FF5D00] via-[#FF7424] to-[#e05200] text-white shadow-md shadow-[#FF5D00]/40 transition-all hover:-translate-y-0.5 hover:shadow-lg active:scale-95 disabled:cursor-not-allowed disabled:from-slate-200 disabled:to-slate-300 disabled:text-slate-400 disabled:shadow-none dark:disabled:from-white/10 dark:disabled:to-white/10"
                    aria-label="Ohereza ubutumwa"
                  >
                    <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                    {sending ? (
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    ) : (
                      <Icon.Send className="relative w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="mt-2 flex items-center justify-between px-1">
                <p className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                  <Icon.Info className="w-3 h-3" />
                  Enter = ohereza · Shift + Enter = murongo mushya
                </p>
                {isOtherTyping && (
                  <p className="hidden text-[10px] font-bold text-emerald-600 dark:text-emerald-400 sm:block">
                    Arimo kwandika...
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT: SIDEBAR */}
          <aside className="hidden space-y-4 lg:block">
            {listing && (
              <div className="overflow-hidden rounded-[28px] border border-slate-200/70 bg-white/80 shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-slate-900/60">
                <div className="relative h-32 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500">
                  <div className="pointer-events-none absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  <div className="absolute bottom-3 left-4 right-4">
                    <p className="text-[9px] font-black uppercase tracking-wider text-white/80">Ikiganiro kijyanye na</p>
                    <p className="mt-0.5 line-clamp-1 text-sm font-black text-white">{listing.title}</p>
                  </div>
                </div>

                <div className="p-5">
                  <div className="flex items-baseline justify-between">
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Igiciro</p>
                    <p className="text-lg font-black text-[#FF5D00]">{formatPrice(listing.price, listing.currency)}</p>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <Link
                      to={`/listing/${listing.id}`}
                      className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-2.5 text-[11px] font-black text-slate-700 transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200 dark:hover:bg-white/[0.08]"
                    >
                      <Icon.Tag className="w-3.5 h-3.5" />
                      Reba
                    </Link>
                    <button className="flex items-center justify-center gap-1.5 rounded-xl bg-[#102436] py-2.5 text-[11px] font-black text-white transition hover:bg-[#1a3350] dark:bg-[#FF5D00] dark:hover:bg-[#e05200]">
                      <Icon.Chat className="w-3.5 h-3.5" />
                      Chat
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="rounded-[28px] border border-slate-200/70 bg-white/80 p-5 shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-slate-900/60">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <Icon.Shield className="w-4 h-4" />
                </span>
                <p className="text-xs font-black text-slate-900 dark:text-white">Gurisha mu mutekano</p>
              </div>
              <ul className="mt-3 space-y-2 text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                <li className="flex items-start gap-1.5">
                  <Icon.Check className="w-3 h-3 mt-0.5 shrink-0 text-emerald-500" />
                  Reba ikintu mbere yo kwishyura
                </li>
                <li className="flex items-start gap-1.5">
                  <Icon.Check className="w-3 h-3 mt-0.5 shrink-0 text-emerald-500" />
                  Hutaza kohereza amafaranga utabonye ikintu
                </li>
                <li className="flex items-start gap-1.5">
                  <Icon.Check className="w-3 h-3 mt-0.5 shrink-0 text-emerald-500" />
                  Vugana gusa ku Isoko
                </li>
              </ul>
            </div>

            <div className="rounded-[28px] border border-slate-200/70 bg-white/80 p-5 shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-slate-900/60">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Uko uhagaze</p>
                <span className={`h-2 w-2 rounded-full ${channelReady ? "animate-pulse bg-emerald-500" : "bg-amber-500"}`} />
              </div>
              <p className="mt-2 flex items-center gap-1.5 text-xs font-black text-slate-900 dark:text-white">
                <Icon.Bolt className={`w-3.5 h-3.5 ${channelReady ? "text-emerald-500" : "text-amber-500"}`} />
                {channelReady ? "Realtime yatangiye" : "Irimo guhuza..."}
              </p>
              <p className="mt-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                {channelReady ? "Ubutumwa buhita bugera ku wundi mubiri." : "Tegereza akanya gato."}
              </p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  )
}