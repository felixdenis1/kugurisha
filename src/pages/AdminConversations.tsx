import { useEffect, useMemo, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "../services/supabase"

type Conversation = {
  id: string
  listing_id: string | null
  buyer_id: string
  seller_id: string
  created_at: string
  updated_at: string
}

type Message = {
  id: string
  conversation_id: string
  sender_id: string
  message: string
  is_read: boolean
  is_admin: boolean | null
  created_at: string
}

type Profile = { id: string; full_name: string | null; avatar_url: string | null }
type Listing = { id: string; title: string }

function AdminConversations() {
  const navigate = useNavigate()

  const [conversations, setConversations] = useState<Conversation[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [listings, setListings] = useState<Listing[]>([])

  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const [search, setSearch] = useState("")
  const [activeId, setActiveId] = useState<string | null>(null)
  const [adminReply, setAdminReply] = useState("")
  const [sending, setSending] = useState(false)
  const [archivingId, setArchivingId] = useState<string | null>(null)
  const [currentAdminId, setCurrentAdminId] = useState<string | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    checkAdminAndLoad()
  }, [])

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  async function checkAdminAndLoad(isRefresh = false) {
    if (isRefresh) setRefreshing(true)
    else setLoading(true)
    setError("")

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { navigate("/login"); return }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single()

      if (profileError || profile?.role !== "admin") {
        setError("Ntufite uburenganzira bwo kubona iyi page.")
        setLoading(false)
        return
      }
      setCurrentAdminId(user.id)

      // FIXED: no last_message_at — use updated_at
      const { data: convData, error: convError } = await supabase
        .from("conversations")
        .select("*")
        .order("updated_at", { ascending: false })

      if (convError) {
        console.error("CONV QUERY ERROR:", convError)
        throw new Error(`Conversations query: ${convError.message}`)
      }

      const convList = (convData || []) as Conversation[]
      setConversations(convList)

      const userIds = Array.from(
        new Set(convList.flatMap((c) => [c.buyer_id, c.seller_id]).filter(Boolean))
      )
      const listingIds = Array.from(
        new Set(convList.map((c) => c.listing_id).filter(Boolean))
      )

      if (userIds.length > 0) {
        const { data, error: pErr } = await supabase
          .from("profiles")
          .select("id, full_name, avatar_url")
          .in("id", userIds)
        if (pErr) {
          console.warn("profiles fetch fallback:", pErr.message)
          const { data: retry } = await supabase
            .from("profiles")
            .select("id, full_name")
            .in("id", userIds)
          setProfiles((retry || []).map((p) => ({ ...p, avatar_url: null })))
        } else {
          setProfiles(data || [])
        }
      } else setProfiles([])

      if (listingIds.length > 0) {
        const { data } = await supabase
          .from("listings")
          .select("id, title")
          .in("id", listingIds)
        setListings(data || [])
      } else setListings([])
    } catch (err) {
      console.error("CONVERSATIONS LOAD ERROR:", err)
      setError(err instanceof Error ? err.message : "Conversations ntizashoboye gufunguka.")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  async function openConversation(conv: Conversation) {
    setActiveId(conv.id)
    setMessages([])
    setMessagesLoading(true)
    setError("")

    try {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conv.id)
        .order("created_at", { ascending: true })

      if (error) throw error
      setMessages((data || []) as Message[])
    } catch (err) {
      console.error("MESSAGES ERROR:", err)
      setError(err instanceof Error ? err.message : "Messages ntizashoboye gufunguka.")
    } finally {
      setMessagesLoading(false)
    }
  }

  async function sendAdminReply() {
    if (!activeId || !adminReply.trim() || !currentAdminId) return

    setSending(true)
    setError("")

    try {
      // FIXED: message column is `message`, plus is_admin tag
      const { data, error } = await supabase
        .from("messages")
        .insert({
          conversation_id: activeId,
          sender_id: currentAdminId,
          message: adminReply.trim(),
          is_read: false,
          is_admin: true,
          topic: `conversation:${activeId}`,
        })
        .select()
        .single()

      if (error) throw error

      setMessages((curr) => [...curr, data as Message])
      setAdminReply("")

      await supabase
        .from("conversations")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", activeId)

      setConversations((curr) =>
        curr.map((c) =>
          c.id === activeId ? { ...c, updated_at: new Date().toISOString() } : c
        )
      )

      setSuccess("Ubutumwa bwoherejwe nk'admin.")
      setTimeout(() => setSuccess(""), 3000)
    } catch (err) {
      console.error("SEND ERROR:", err)
      setError(err instanceof Error ? err.message : "Ubutumwa ntibwoherejwe.")
    } finally {
      setSending(false)
    }
  }

  async function archiveConversation(conv: Conversation) {
    const confirmed = window.confirm(
      "Urashaka gusiba iyi conversation burundu?\n\nUbu nta `is_archived` column ihari, bityo iyi action isiba burundu (hard delete) hamwe na messages zose. Iki ntikizagaruka."
    )
    if (!confirmed) return

    setArchivingId(conv.id)
    setError("")

    try {
      // No is_archived column → hard delete (messages cascade first if no FK)
      const { error: msgErr } = await supabase
        .from("messages")
        .delete()
        .eq("conversation_id", conv.id)
      if (msgErr) throw msgErr

      const { error } = await supabase
        .from("conversations")
        .delete()
        .eq("id", conv.id)
      if (error) throw error

      setConversations((curr) => curr.filter((c) => c.id !== conv.id))
      if (activeId === conv.id) setActiveId(null)
      setSuccess("Conversation yasibwe burundu.")
      setTimeout(() => setSuccess(""), 3000)
    } catch (err) {
      console.error("ARCHIVE ERROR:", err)
      setError(err instanceof Error ? err.message : "Ntibyashobotse gusiba conversation.")
    } finally {
      setArchivingId(null)
    }
  }

  function getProfileName(id: string | null) {
    if (!id) return "Ntabonetse"
    return profiles.find((p) => p.id === id)?.full_name || "Umukoresha"
  }

  function getInitials(name: string) {
    const parts = name.trim().split(/\s+/)
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
  }

  function getListingTitle(id: string | null) {
    if (!id) return null
    return listings.find((l) => l.id === id)?.title || "Listing itabonetse"
  }

  function formatDate(date: string | null) {
    if (!date) return "—"
    const d = new Date(date)
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return "Ubu"
    if (diffMins < 60) return `${diffMins}m`
    if (diffHours < 24) return `${diffHours}h`
    if (diffDays < 7) return `${diffDays}d`
    return d.toLocaleDateString("rw-RW", { dateStyle: "short" })
  }

  function formatFullTime(date: string) {
    return new Date(date).toLocaleString("rw-RW", {
      dateStyle: "medium",
      timeStyle: "short",
    })
  }

  const filteredConversations = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return conversations

    return conversations.filter((c) => {
      const buyerName = getProfileName(c.buyer_id).toLowerCase()
      const sellerName = getProfileName(c.seller_id).toLowerCase()
      const listingTitle = (getListingTitle(c.listing_id) || "").toLowerCase()
      return (
        buyerName.includes(q) ||
        sellerName.includes(q) ||
        listingTitle.includes(q) ||
        c.id.toLowerCase().includes(q)
      )
    })
  }, [conversations, search, profiles, listings])

  const activeConversation = conversations.find((c) => c.id === activeId) || null

  return (
    <div className="mx-auto max-w-[1500px] space-y-6">
      {/* HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 text-xl text-white shadow-lg shadow-teal-500/30">
            💬
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white sm:text-3xl">
              Conversations
            </h1>
            <p className="mt-0.5 text-sm font-medium text-slate-500 dark:text-slate-400">
              Reba, subiza nk'admin, cyangwa usibe ibiganiro bibi.
            </p>
          </div>
        </div>
        <button
          onClick={() => checkAdminAndLoad(true)}
          disabled={refreshing}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
        >
          <svg className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
          {refreshing ? "Biravugurura..." : "Refresh"}
        </button>
      </div>

      {/* ALERTS */}
      {success && (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-3 text-sm text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400">
          <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="font-bold">{success}</p>
        </div>
      )}
      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-3 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-400">
          <svg className="mt-0.5 h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          <div className="flex-1">
            <p className="font-bold">Habaye ikibazo</p>
            <p className="mt-1 break-words">{error}</p>
          </div>
          <button onClick={() => setError("")} className="opacity-70 hover:opacity-100">×</button>
        </div>
      )}

      {/* MAIN SPLIT */}
      <div className="grid gap-4 lg:grid-cols-[minmax(0,380px)_1fr]">
        {/* LEFT — CONVERSATION LIST */}
        <div className="rounded-2xl border border-slate-200/80 bg-white/80 shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-[#0f1716]/80">
          <div className="border-b border-slate-100 p-3 dark:border-white/5">
            <div className="relative">
              <svg className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Shakisha umukoresha cyangwa listing..."
                className="w-full rounded-xl border border-slate-200/80 bg-slate-50/50 py-2.5 pl-10 pr-3 text-sm font-semibold outline-none transition focus:border-[#10b981] focus:bg-white focus:ring-4 focus:ring-[#10b981]/10 dark:border-white/10 dark:bg-white/[0.04] dark:text-white"
              />
            </div>
          </div>

          <div className="max-h-[calc(100vh-280px)] overflow-y-auto">
            {loading ? (
              <div className="space-y-2 p-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-20 animate-pulse rounded-xl bg-slate-100 dark:bg-white/5" />
                ))}
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-8 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-2xl dark:bg-white/5">
                  💬
                </div>
                <p className="mt-3 text-sm font-black text-slate-900 dark:text-white">Nta conversations</p>
                <p className="mt-1 text-xs text-slate-500">Nta biganiro biraboneka.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-white/5">
                {filteredConversations.map((conv) => {
                  const isActive = conv.id === activeId
                  const buyerName = getProfileName(conv.buyer_id)
                  const sellerName = getProfileName(conv.seller_id)
                  const listingTitle = getListingTitle(conv.listing_id)
                  return (
                    <button
                      key={conv.id}
                      onClick={() => openConversation(conv)}
                      className={`w-full px-4 py-3 text-left transition ${
                        isActive
                          ? "bg-[#10b981]/5 dark:bg-[#10b981]/10"
                          : "hover:bg-slate-50 dark:hover:bg-white/5"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="relative shrink-0">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-xs font-black text-white">
                            {getInitials(buyerName)}
                          </div>
                          <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-emerald-500 text-[8px] text-white dark:border-[#0f1716]">
                            {getInitials(sellerName).charAt(0)}
                          </div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="truncate text-xs font-black text-slate-900 dark:text-white">
                              {buyerName} ↔ {sellerName}
                            </p>
                            <span className="shrink-0 text-[10px] font-bold text-slate-400">
                              {formatDate(conv.updated_at)}
                            </span>
                          </div>
                          {listingTitle && (
                            <p className="mt-0.5 truncate text-[11px] font-semibold text-[#059669] dark:text-[#34d399]">
                              🏷️ {listingTitle}
                            </p>
                          )}
                          <p className="mt-0.5 truncate text-[11px] text-slate-500 dark:text-slate-400">
                            Conversation #{conv.id.slice(0, 8)}
                          </p>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT — MESSAGE PANEL */}
        <div className="flex min-h-[600px] flex-col rounded-2xl border border-slate-200/80 bg-white/80 shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-[#0f1716]/80">
          {!activeConversation ? (
            <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-teal-50 to-emerald-100 text-4xl dark:from-teal-500/20 dark:to-emerald-500/20">
                💬
              </div>
              <h3 className="mt-5 text-lg font-black text-slate-900 dark:text-white">
                Hitamo conversation
              </h3>
              <p className="mt-2 max-w-sm text-sm text-slate-500 dark:text-slate-400">
                Hitamo ikiganiro ku ruhande rw'ibumoso kugira ngo urebe ubutumwa.
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between gap-3 border-b border-slate-100 p-4 dark:border-white/5">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-black text-slate-900 dark:text-white">
                    {getProfileName(activeConversation.buyer_id)} ↔ {getProfileName(activeConversation.seller_id)}
                  </p>
                  {getListingTitle(activeConversation.listing_id) && (
                    <button
                      onClick={() => navigate(`/listing/${activeConversation.listing_id}`)}
                      className="mt-0.5 inline-flex items-center gap-1 text-[11px] font-bold text-[#059669] hover:underline dark:text-[#34d399]"
                    >
                      🏷️ {getListingTitle(activeConversation.listing_id)} →
                    </button>
                  )}
                </div>
                <button
                  onClick={() => archiveConversation(activeConversation)}
                  disabled={archivingId === activeConversation.id}
                  className="shrink-0 rounded-xl border border-rose-200 bg-white px-3 py-2 text-xs font-bold text-rose-600 transition hover:bg-rose-50 disabled:opacity-50 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-400"
                >
                  🗑️ Delete
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                {messagesLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className={`flex ${i % 2 === 0 ? "justify-end" : "justify-start"}`}>
                        <div className="h-16 w-2/3 animate-pulse rounded-2xl bg-slate-100 dark:bg-white/5" />
                      </div>
                    ))}
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-sm text-slate-400">
                    Nta butumwa muri iyi conversation.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {messages.map((msg) => {
                      const isBuyer = msg.sender_id === activeConversation.buyer_id
                      const isSeller = msg.sender_id === activeConversation.seller_id
                      const isAdmin = msg.is_admin === true || (!isBuyer && !isSeller)

                      return (
                        <div
                          key={msg.id}
                          className={`flex ${isAdmin ? "justify-center" : isBuyer ? "justify-start" : "justify-end"}`}
                        >
                          <div
                            className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                              isAdmin
                                ? "border border-purple-200 bg-purple-50 text-purple-800 dark:border-purple-500/30 dark:bg-purple-500/10 dark:text-purple-300"
                                : isBuyer
                                ? "bg-slate-100 text-slate-900 dark:bg-white/10 dark:text-white"
                                : "bg-[#10b981] text-white"
                            }`}
                          >
                            <p className="mb-1 text-[10px] font-black uppercase tracking-wider opacity-70">
                              {isAdmin ? "🛡️ Admin" : getProfileName(msg.sender_id)}
                            </p>
                            <p className="whitespace-pre-wrap break-words">{msg.message}</p>
                            <p className={`mt-1 text-[10px] font-medium ${isAdmin ? "text-purple-600" : isBuyer ? "text-slate-400" : "text-emerald-100"}`}>
                              {formatFullTime(msg.created_at)}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              <div className="border-t border-slate-100 p-3 dark:border-white/5">
                <div className="flex items-end gap-2">
                  <textarea
                    value={adminReply}
                    onChange={(e) => setAdminReply(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        sendAdminReply()
                      }
                    }}
                    rows={1}
                    placeholder="Subiza nk'admin... (Enter yohereza, Shift+Enter = newline)"
                    className="min-h-[42px] max-h-32 flex-1 resize-none rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm font-medium outline-none transition focus:border-[#10b981] focus:bg-white focus:ring-4 focus:ring-[#10b981]/10 dark:border-white/10 dark:bg-white/[0.04] dark:text-white"
                  />
                  <button
                    onClick={sendAdminReply}
                    disabled={sending || !adminReply.trim()}
                    className="flex h-[42px] shrink-0 items-center justify-center gap-1.5 rounded-xl bg-[#10b981] px-4 text-sm font-bold text-white transition hover:bg-[#059669] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {sending ? (
                      <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                      </svg>
                    ) : (
                      <>
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                        </svg>
                        Send
                      </>
                    )}
                  </button>
                </div>
                <p className="mt-1.5 text-[10px] font-medium text-slate-400">
                  Ubutumwa bwawe buzagaragara nk'ubwa <strong className="text-purple-600 dark:text-purple-400">Admin 🛡️</strong>
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      <p className="text-center text-xs font-bold text-slate-400">
        Showing {filteredConversations.length} of {conversations.length} conversations
      </p>
    </div>
  )
}

export default AdminConversations