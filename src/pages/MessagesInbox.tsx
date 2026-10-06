import { useEffect, useMemo, useState } from "react"
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
}

function formatPrice(
  price: number | null | undefined,
  currency: string | null | undefined
) {
  if (price === null || price === undefined) {
    return "Twandikire ku giciro"
  }

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

  return value.toLocaleDateString("rw-RW", {
    day: "2-digit",
    month: "short",
  })
}

function truncate(text: string, length = 95) {
  if (text.length <= length) return text
  return `${text.slice(0, length).trim()}...`
}

function getInitials(label: string) {
  const words = label.trim().split(/\s+/)

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase()
  }

  return `${words[0][0]}${words[1][0]}`.toUpperCase()
}

function getRoleLabel(
  conversation: Conversation,
  userId: string
) {
  if (conversation.buyer_id === userId) {
    return "Umuguzi"
  }

  if (conversation.seller_id === userId) {
    return "Umucuruzi"
  }

  return "Umunyamuryango"
}

function getOtherUserId(
  conversation: Conversation,
  userId: string
) {
  if (conversation.buyer_id === userId) {
    return conversation.seller_id
  }

  return conversation.buyer_id
}

function MessagesInbox() {
  const navigate = useNavigate()

  const [userId, setUserId] = useState<string | null>(null)
  const [conversations, setConversations] = useState<ConversationWithMessage[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    let mounted = true

    const loadUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!mounted) return

      if (!user) {
        navigate("/login")
        return
      }

      setUserId(user.id)
    }

    loadUser()

    return () => {
      mounted = false
    }
  }, [navigate])

  useEffect(() => {
    if (!userId) return

    let mounted = true

    const loadConversations = async () => {
      setLoading(true)
      setError("")

      try {
        const { data: conversationData, error: conversationError } =
          await supabase
            .from("conversations")
            .select(
              `
                id,
                listing_id,
                buyer_id,
                seller_id,
                updated_at,
                listing:listings(
                  title,
                  price,
                  currency
                )
              `
            )
            .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
            .order("updated_at", { ascending: false })

        if (conversationError) {
          throw conversationError
        }

        const baseConversations = (conversationData || []).map((item) => ({
          ...item,
          listing: Array.isArray(item.listing)
            ? item.listing[0] || null
            : item.listing || null,
        })) as Conversation[]

        if (baseConversations.length === 0) {
          if (mounted) {
            setConversations([])
            setLoading(false)
          }
          return
        }

        const conversationIds = baseConversations.map(
          (conversation) => conversation.id
        )

        const { data: messageData, error: messageError } = await supabase
          .from("messages")
          .select(
            `
              id,
              conversation_id,
              sender_id,
              message,
              is_read,
              created_at
            `
          )
          .in("conversation_id", conversationIds)
          .order("created_at", { ascending: false })

        if (messageError) {
          throw messageError
        }

        const latestMessages = new Map<string, Message>()

        ;(messageData || []).forEach((message) => {
          if (!latestMessages.has(message.conversation_id)) {
            latestMessages.set(message.conversation_id, message)
          }
        })

        const result: ConversationWithMessage[] = baseConversations.map(
          (conversation) => ({
            ...conversation,
            latestMessage:
              latestMessages.get(conversation.id) || null,
          })
        )

        if (mounted) {
          setConversations(result)
        }
      } catch (err) {
        console.error("Error loading conversations:", err)

        if (mounted) {
          setError(
            "Habaye ikibazo mu kubona ibiganiro byawe. Ongera ugerageze."
          )
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    loadConversations()

    const channel = supabase
      .channel(`messages-inbox-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        async (payload) => {
          const newMessage = payload.new as Message

          const existingConversation = conversations.find(
            (conversation) =>
              conversation.id === newMessage.conversation_id
          )

          if (existingConversation) {
            setConversations((current) =>
              current
                .map((conversation) =>
                  conversation.id === newMessage.conversation_id
                    ? {
                        ...conversation,
                        latestMessage: newMessage,
                        updated_at: newMessage.created_at,
                      }
                    : conversation
                )
                .sort(
                  (a, b) =>
                    new Date(b.updated_at).getTime() -
                    new Date(a.updated_at).getTime()
                )
            )

            return
          }

          await loadConversations()
        }
      )
      .subscribe()

    return () => {
      mounted = false
      supabase.removeChannel(channel)
    }
  }, [userId])

  const filteredConversations = useMemo(() => {
    const value = search.trim().toLowerCase()

    if (!value) {
      return conversations
    }

    return conversations.filter((conversation) => {
      const title = conversation.listing?.title?.toLowerCase() || ""
      const message =
        conversation.latestMessage?.message?.toLowerCase() || ""

      const role = userId
        ? getRoleLabel(conversation, userId).toLowerCase()
        : ""

      return (
        title.includes(value) ||
        message.includes(value) ||
        role.includes(value)
      )
    })
  }, [conversations, search, userId])

  const unreadCount = useMemo(() => {
    return conversations.filter(
      (conversation) =>
        conversation.latestMessage &&
        conversation.latestMessage.sender_id !== userId &&
        !conversation.latestMessage.is_read
    ).length
  }, [conversations, userId])

  const openConversation = async (
    conversation: ConversationWithMessage
  ) => {
    if (
      userId &&
      conversation.latestMessage &&
      conversation.latestMessage.sender_id !== userId &&
      !conversation.latestMessage.is_read
    ) {
      await supabase
        .from("messages")
        .update({ is_read: true })
        .eq("conversation_id", conversation.id)
        .neq("sender_id", userId)
    }

    navigate(`/messages/${conversation.id}`)
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-50 text-slate-900">
      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-[36rem] w-[36rem] rounded-full bg-blue-500/20 blur-[125px]" />

        <div className="absolute right-[-10rem] top-[5%] h-[34rem] w-[34rem] rounded-full bg-indigo-500/20 blur-[125px]" />

        <div className="absolute bottom-[-12rem] left-[20%] h-[38rem] w-[38rem] rounded-full bg-cyan-400/15 blur-[135px]" />

        <div className="absolute bottom-[5%] right-[5%] h-[24rem] w-[24rem] rounded-full bg-blue-600/15 blur-[110px]" />

        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(59,130,246,0.05),transparent_35%,rgba(99,102,241,0.06)_65%,rgba(6,182,212,0.04))]" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-white/70 bg-white/80 backdrop-blur-2xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            to="/"
            className="group flex items-center gap-3"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-sm font-black tracking-tight text-white shadow-lg shadow-slate-900/15 transition-transform duration-300 group-hover:-translate-y-0.5">
              K
            </div>

            <div>
              <p className="text-lg font-black tracking-tight text-slate-950">
                KUGURISHA<span className="text-blue-600">.COM</span>
              </p>

              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                Ubutumwa
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="hidden rounded-xl px-4 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 sm:inline-flex"
            >
              Ahabanza
            </Link>

            <Link
              to="/create-listing"
              className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-black text-white shadow-lg shadow-slate-900/15 transition hover:-translate-y-0.5 hover:bg-blue-600"
            >
              <span>＋</span>
              Gurisha
            </Link>
          </div>
        </div>
      </header>

      {/* Main */}
      <div className="relative z-10 mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Intro */}
        <section className="mx-auto mb-8 max-w-4xl">
          <Link
            to="/"
            className="mb-5 inline-flex items-center gap-2 text-sm font-bold text-slate-500 transition hover:text-blue-600"
          >
            <span>←</span>
            Subira Ahabanza
          </Link>

          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white/75 px-3.5 py-2 text-xs font-black uppercase tracking-[0.12em] text-blue-700 shadow-sm backdrop-blur-xl">
                <span className="h-2 w-2 rounded-full bg-blue-600 shadow-[0_0_0_4px_rgba(37,99,235,0.10)]" />
                Ubutumwa bwawe
              </div>

              <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                Ubutumwa
              </h1>

              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500 sm:text-base">
                Reba ibiganiro byawe byose n&apos;abaguzi cyangwa
                abacuruzi hano.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-2xl border border-white/80 bg-white/80 px-4 py-3 shadow-sm backdrop-blur-xl">
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Ibiganiro
                </p>

                <p className="mt-0.5 text-xl font-black text-slate-950">
                  {conversations.length}
                </p>
              </div>

              <div className="rounded-2xl border border-blue-100 bg-blue-50/80 px-4 py-3 shadow-sm backdrop-blur-xl">
                <p className="text-[10px] font-black uppercase tracking-wider text-blue-500">
                  Bishya
                </p>

                <p className="mt-0.5 text-xl font-black text-blue-700">
                  {unreadCount}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SMALL CENTERED CHAT BOX */}
        <section className="mx-auto w-full max-w-3xl">
          <div className="overflow-hidden rounded-[36px] border border-white/90 bg-white/85 shadow-[0_30px_90px_-35px_rgba(15,23,42,0.32)] backdrop-blur-2xl">
            {/* Toolbar */}
            <div className="border-b border-slate-100/90 bg-white/70 p-4 sm:p-5">
              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg text-slate-400">
                  ⌕
                </span>

                <input
                  type="text"
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Shakisha ikiganiro..."
                  className="h-13 w-full rounded-[20px] border border-slate-200 bg-slate-50/80 pl-11 pr-4 text-sm font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="mx-4 mt-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 sm:mx-5">
                {error}
              </div>
            )}

            {/* Loading */}
            {loading ? (
              <div className="p-4 sm:p-5">
                <div className="space-y-3">
                  {[1, 2, 3].map((item) => (
                    <div
                      key={item}
                      className="rounded-[25px] border border-slate-100 bg-slate-50/70 p-4"
                    >
                      <div className="flex gap-4">
                        <div className="h-14 w-14 shrink-0 animate-pulse rounded-[20px] bg-slate-200" />

                        <div className="min-w-0 flex-1">
                          <div className="h-4 w-40 animate-pulse rounded-full bg-slate-200" />

                          <div className="mt-2 h-3 w-28 animate-pulse rounded-full bg-slate-200" />

                          <div className="mt-4 h-12 w-full animate-pulse rounded-2xl bg-slate-200" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="px-6 py-16 text-center sm:px-10">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[28px] bg-slate-100 text-3xl shadow-inner">
                  💬
                </div>

                <h2 className="mt-5 text-xl font-black text-slate-950">
                  {search
                    ? "Nta biganiro bibonetse"
                    : "Nta biganiro uratangira"}
                </h2>

                <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
                  {search
                    ? "Gerageza gushakisha ukoresheje irindi jambo."
                    : "Iyo wandikiye umucuruzi cyangwa umuguzi, ibiganiro byawe bizagaragara hano."}
                </p>

                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="mt-5 rounded-xl bg-slate-950 px-5 py-3 text-sm font-black text-white transition hover:bg-blue-600"
                  >
                    Reba ibiganiro byose
                  </button>
                )}
              </div>
            ) : (
              <div className="p-3 sm:p-4">
                {filteredConversations.map(
                  (conversation) => {
                    const latestMessage =
                      conversation.latestMessage

                    const unread =
                      !!latestMessage &&
                      latestMessage.sender_id !== userId &&
                      !latestMessage.is_read

                    const otherUserId = userId
                      ? getOtherUserId(
                          conversation,
                          userId
                        )
                      : ""

                    const role = userId
                      ? getRoleLabel(
                          conversation,
                          userId
                        )
                      : "Umunyamuryango"

                    const listingTitle =
                      conversation.listing?.title ||
                      "Ikiganiro"

                    const initials =
                      getInitials(listingTitle)

                    const isSentByMe =
                      !!latestMessage &&
                      latestMessage.sender_id ===
                        userId

                    return (
                      <button
                        key={conversation.id}
                        type="button"
                        onClick={() =>
                          openConversation(conversation)
                        }
                        className={`group mb-3 block w-full text-left last:mb-0 ${
                          unread
                            ? "rounded-[27px] border border-blue-200 bg-blue-50/75 shadow-[0_14px_35px_-20px_rgba(37,99,235,0.45)]"
                            : "rounded-[27px] border border-slate-100 bg-white shadow-[0_12px_30px_-24px_rgba(15,23,42,0.35)]"
                        } p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-[0_20px_45px_-25px_rgba(15,23,42,0.35)] sm:p-5`}
                      >
                        <div className="flex gap-4">
                          {/* Avatar */}
                          <div
                            className={`relative flex h-15 w-15 shrink-0 items-center justify-center rounded-[21px] text-sm font-black shadow-sm transition duration-300 group-hover:scale-[1.03] ${
                              unread
                                ? "bg-blue-600 text-white shadow-blue-600/20"
                                : "bg-slate-950 text-white"
                            }`}
                          >
                            {initials}

                            {unread && (
                              <span className="absolute -right-1 -top-1 h-3.5 w-3.5 rounded-full border-[3px] border-white bg-blue-600" />
                            )}
                          </div>

                          {/* Content */}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <h3
                                    className={`truncate text-[15px] font-black sm:text-base ${
                                      unread
                                        ? "text-slate-950"
                                        : "text-slate-800"
                                    }`}
                                  >
                                    {listingTitle}
                                  </h3>

                                  {unread && (
                                    <span className="rounded-full bg-blue-600 px-2 py-1 text-[9px] font-black uppercase tracking-wider text-white">
                                      Bishya
                                    </span>
                                  )}
                                </div>

                                <div className="mt-1 flex flex-wrap items-center gap-2">
                                  <span className="text-xs font-bold text-slate-400">
                                    {role}
                                  </span>

                                  <span className="h-1 w-1 rounded-full bg-slate-300" />

                                  <span className="text-xs font-bold text-slate-400">
                                    {formatDate(
                                      conversation.updated_at
                                    )}
                                  </span>
                                </div>
                              </div>

                              <span className="shrink-0 text-slate-300 transition group-hover:translate-x-1 group-hover:text-blue-600">
                                →
                              </span>
                            </div>

                            {/* Listing info */}
                            <div className="mt-3 flex flex-wrap items-center gap-2">
                              <span className="rounded-xl border border-slate-100 bg-slate-50 px-2.5 py-1.5 text-[10px] font-black text-slate-500">
                                {formatPrice(
                                  conversation.listing
                                    ?.price,
                                  conversation.listing
                                    ?.currency
                                )}
                              </span>

                              <span className="rounded-xl bg-slate-100/80 px-2.5 py-1.5 text-[10px] font-black text-slate-400">
                                💬 Ikiganiro
                              </span>
                            </div>

                            {/* PREMIUM MESSAGE PREVIEW */}
                            {latestMessage ? (
                              <div
                                className={`mt-3 rounded-[21px] border px-4 py-3.5 transition ${
                                  unread
                                    ? "border-blue-100 bg-white shadow-sm"
                                    : "border-slate-100 bg-slate-50/80"
                                }`}
                              >
                                <div className="flex items-center justify-between gap-3">
                                  <div className="flex min-w-0 items-center gap-2">
                                    <span
                                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs ${
                                        isSentByMe
                                          ? "bg-slate-900 text-white"
                                          : "bg-blue-100 text-blue-700"
                                      }`}
                                    >
                                      {isSentByMe
                                        ? "↗"
                                        : "↙"}
                                    </span>

                                    <span
                                      className={`truncate text-[10px] font-black uppercase tracking-[0.12em] ${
                                        isSentByMe
                                          ? "text-slate-500"
                                          : "text-blue-600"
                                      }`}
                                    >
                                      {isSentByMe
                                        ? "Wowe"
                                        : "Ubutumwa bushya"}
                                    </span>
                                  </div>

                                  <span className="shrink-0 text-[10px] font-bold text-slate-400">
                                    {formatDate(
                                      latestMessage.created_at
                                    )}
                                  </span>
                                </div>

                                <p
                                  className={`mt-2.5 text-sm leading-5 ${
                                    unread
                                      ? "font-bold text-slate-800"
                                      : "font-semibold text-slate-500"
                                  }`}
                                >
                                  {truncate(
                                    latestMessage.message
                                  )}
                                </p>
                              </div>
                            ) : (
                              <div className="mt-3 rounded-[21px] border border-dashed border-slate-200 bg-slate-50/60 px-4 py-3">
                                <p className="text-xs font-semibold italic text-slate-400">
                                  Nta butumwa buraboneka...
                                </p>
                              </div>
                            )}

                            {/* Bottom hint */}
                            <div className="mt-3 flex items-center justify-between">
                              <span className="text-[10px] font-bold text-slate-400">
                                {otherUserId
                                  ? "Kanda urebe ikiganiro"
                                  : "Fungura ikiganiro"}
                              </span>

                              <span
                                className={`text-[11px] font-black transition ${
                                  unread
                                    ? "text-blue-600"
                                    : "text-slate-400 group-hover:text-blue-600"
                                }`}
                              >
                                Reba →
                              </span>
                            </div>
                          </div>
                        </div>
                      </button>
                    )
                  }
                )}
              </div>
            )}
          </div>

          {/* Bottom note */}
          {!loading &&
            filteredConversations.length > 0 && (
              <div className="mt-5 text-center">
                <p className="text-xs font-semibold text-slate-400">
                  Ubutumwa bwawe bubikwa kandi bugahora
                  buboneka igihe ubukeneye.
                </p>
              </div>
            )}
        </section>
      </div>
    </main>
  )
}

export default MessagesInbox