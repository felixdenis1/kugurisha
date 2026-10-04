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

export default function Messages() {
  const { conversationId } = useParams()
  const navigate = useNavigate()

  const [userId, setUserId] = useState<string | null>(null)
  const [conversation, setConversation] =
    useState<Conversation | null>(null)
  const [listing, setListing] = useState<Listing | null>(null)
  const [messages, setMessages] = useState<Message[]>([])

  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState("")

  const [isOtherTyping, setIsOtherTyping] = useState(false)
  const [isOtherOnline, setIsOtherOnline] = useState(false)
  const [channelReady, setChannelReady] = useState(false)

  const bottomRef = useRef<HTMLDivElement | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  const channelRef = useRef<ReturnType<
    typeof supabase.channel
  > | null>(null)

  const typingTimeoutRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null)

  useEffect(() => {
    if (!conversationId) {
      navigate("/messages")
      return
    }

    loadConversation()

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }

      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
    }
  }, [conversationId])

  useEffect(() => {
    scrollToBottom()
  }, [messages, isOtherTyping])

  async function loadConversation() {
    try {
      setLoading(true)
      setError("")

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        navigate("/login")
        return
      }

      setUserId(user.id)

      if (!conversationId) {
        navigate("/messages")
        return
      }

      const { data: conversationData, error: conversationError } =
        await supabase
          .from("conversations")
          .select(
            `
              id,
              listing_id,
              buyer_id,
              seller_id,
              created_at,
              updated_at
            `,
          )
          .eq("id", conversationId)
          .single()

      if (conversationError) {
        throw conversationError
      }

      const currentConversation =
        conversationData as Conversation

      const isParticipant =
        currentConversation.buyer_id === user.id ||
        currentConversation.seller_id === user.id

      if (!isParticipant) {
        throw new Error(
          "Ntibyemewe kubona ubu butumwa.",
        )
      }

      setConversation(currentConversation)

      const { data: listingData, error: listingError } =
        await supabase
          .from("listings")
          .select(
            `
              id,
              title,
              price,
              currency,
              status
            `,
          )
          .eq("id", currentConversation.listing_id)
          .single()

      if (!listingError && listingData) {
        setListing(listingData as Listing)
      }

      const { data: messagesData, error: messagesError } =
        await supabase
          .from("messages")
          .select(
            `
              id,
              conversation_id,
              sender_id,
              message,
              is_read,
              created_at
            `,
          )
          .eq("conversation_id", conversationId)
          .order("created_at", {
            ascending: true,
          })

      if (messagesError) {
        throw messagesError
      }

      setMessages((messagesData ?? []) as Message[])

      const unreadIds =
        (messagesData ?? [])
          .filter(
            (message) =>
              message.sender_id !== user.id &&
              !message.is_read,
          )
          .map((message) => message.id)

      if (unreadIds.length > 0) {
        await supabase
          .from("messages")
          .update({ is_read: true })
          .in("id", unreadIds)
      }

      setupRealtimeChannel(
        conversationId,
        user.id,
      )
    } catch (err) {
      console.error("Load conversation error:", err)

      setError(
        err instanceof Error
          ? err.message
          : "Habaye ikibazo mu gufungura ubutumwa.",
      )
    } finally {
      setLoading(false)
    }
  }

  function setupRealtimeChannel(
    currentConversationId: string,
    currentUserId: string,
  ) {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current)
    }

    setChannelReady(false)

    const channel = supabase
      .channel(`conversation-${currentConversationId}`, {
        config: {
          broadcast: {
            self: false,
          },
          presence: {
            key: currentUserId,
          },
        },
      })
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${currentConversationId}`,
        },
        async (payload) => {
          const incomingMessage =
            payload.new as Message

          if (
            incomingMessage.sender_id === currentUserId
          ) {
            return
          }

          setMessages((current) => {
            const alreadyExists = current.some(
              (message) =>
                message.id === incomingMessage.id,
            )

            if (alreadyExists) {
              return current
            }

            return [...current, incomingMessage]
          })

          setIsOtherTyping(false)

          await supabase
            .from("messages")
            .update({ is_read: true })
            .eq("id", incomingMessage.id)
        },
      )
      .on(
        "broadcast",
        { event: "typing" },
        (payload) => {
          const senderId =
            payload.payload?.userId

          if (senderId === currentUserId) {
            return
          }

          const typing =
            Boolean(payload.payload?.typing)

          setIsOtherTyping(typing)

          if (typingTimeoutRef.current) {
            clearTimeout(
              typingTimeoutRef.current,
            )
          }

          if (typing) {
            typingTimeoutRef.current = setTimeout(
              () => {
                setIsOtherTyping(false)
              },
              3000,
            )
          }
        },
      )
      .on(
        "presence",
        { event: "sync" },
        () => {
          const state = channel.presenceState()

          const onlineUsers = Object.keys(
            state,
          ).filter(
            (key) => key !== currentUserId,
          )

          setIsOtherOnline(
            onlineUsers.length > 0,
          )
        },
      )
      .on(
        "presence",
        { event: "join" },
        ({ key }) => {
          if (key !== currentUserId) {
            setIsOtherOnline(true)
          }
        },
      )
      .on(
        "presence",
        { event: "leave" },
        ({ key }) => {
          if (key !== currentUserId) {
            setIsOtherOnline(false)
            setIsOtherTyping(false)
          }
        },
      )
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          setChannelReady(true)

          try {
            await channel.track({
              userId: currentUserId,
              onlineAt: new Date().toISOString(),
            })
          } catch (trackError) {
            console.error(
              "Presence track error:",
              trackError,
            )
          }
        } else {
          setChannelReady(false)
        }
      })

    channelRef.current = channel
  }

  async function broadcastTyping(
    typing: boolean,
  ) {
    const channel = channelRef.current

    if (!channel || !channelReady || !userId) {
      return
    }

    try {
      await channel.send({
        type: "broadcast",
        event: "typing",
        payload: {
          userId,
          typing,
        },
      })
    } catch (err) {
      console.error(
        "Typing broadcast error:",
        err,
      )
    }
  }

  function handleTyping(value: string) {
    setNewMessage(value)

    if (!value.trim()) {
      void broadcastTyping(false)

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }

      return
    }

    void broadcastTyping(true)

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    typingTimeoutRef.current = setTimeout(() => {
      void broadcastTyping(false)
    }, 1800)

    autoResizeTextarea()
  }

  function autoResizeTextarea() {
    const textarea = textareaRef.current

    if (!textarea) {
      return
    }

    textarea.style.height = "auto"

    const nextHeight = Math.min(
      textarea.scrollHeight,
      140,
    )

    textarea.style.height = `${nextHeight}px`
  }

  function handleKeyDown(
    event: KeyboardEvent<HTMLTextAreaElement>,
  ) {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault()

      void sendMessage()
    }
  }

  async function sendMessage() {
    const text = newMessage.trim()

    if (!text || !conversationId || !userId) {
      return
    }

    try {
      setSending(true)
      setError("")

      const { data, error: insertError } =
        await supabase
          .from("messages")
          .insert({
            conversation_id: conversationId,
            sender_id: userId,
            message: text,
            is_read: false,
          })
          .select(
            `
              id,
              conversation_id,
              sender_id,
              message,
              is_read,
              created_at
            `,
          )
          .single()

      if (insertError) {
        throw insertError
      }

      if (data) {
        setMessages((current) => {
          const alreadyExists = current.some(
            (message) =>
              message.id === data.id,
          )

          if (alreadyExists) {
            return current
          }

          return [...current, data as Message]
        })
      }

      setNewMessage("")

      if (typingTimeoutRef.current) {
        clearTimeout(
          typingTimeoutRef.current,
        )
      }

      void broadcastTyping(false)

      if (textareaRef.current) {
        textareaRef.current.style.height = "auto"
        textareaRef.current.focus()
      }

      await supabase
        .from("conversations")
        .update({
          updated_at: new Date().toISOString(),
        })
        .eq("id", conversationId)
    } catch (err) {
      console.error("Send message error:", err)

      setError(
        "Ubutumwa ntibwoherejwe. Ongera ugerageze.",
      )
    } finally {
      setSending(false)
    }
  }

  function scrollToBottom() {
    requestAnimationFrame(() => {
      bottomRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      })
    })
  }

  function formatPrice(
    price: number | null,
    currency: string | null,
  ) {
    if (price === null) {
      return "Twandikire ku giciro"
    }

    return `${new Intl.NumberFormat(
      "rw-RW",
    ).format(price)} ${currency || "Frw"}`
  }

  function formatTime(date: string) {
    return new Intl.DateTimeFormat(
      "rw-RW",
      {
        hour: "2-digit",
        minute: "2-digit",
      },
    ).format(new Date(date))
  }

  function formatDay(date: string) {
    const messageDate = new Date(date)
    const today = new Date()

    const isToday =
      messageDate.toDateString() ===
      today.toDateString()

    if (isToday) {
      return "Uyu munsi"
    }

    const yesterday = new Date()
    yesterday.setDate(
      yesterday.getDate() - 1,
    )

    const isYesterday =
      messageDate.toDateString() ===
      yesterday.toDateString()

    if (isYesterday) {
      return "Ejo"
    }

    return new Intl.DateTimeFormat(
      "rw-RW",
      {
        day: "numeric",
        month: "long",
        year: "numeric",
      },
    ).format(messageDate)
  }

  function shouldShowDay(
    currentMessage: Message,
    index: number,
  ) {
    if (index === 0) {
      return true
    }

    const previous =
      messages[index - 1]

    return (
      new Date(
        currentMessage.created_at,
      ).toDateString() !==
      new Date(
        previous.created_at,
      ).toDateString()
    )
  }

  function shouldGroupWithPrevious(
    currentMessage: Message,
    index: number,
  ) {
    if (index === 0) {
      return false
    }

    const previous =
      messages[index - 1]

    if (
      previous.sender_id !==
      currentMessage.sender_id
    ) {
      return false
    }

    const difference =
      new Date(
        currentMessage.created_at,
      ).getTime() -
      new Date(
        previous.created_at,
      ).getTime()

    return difference < 5 * 60 * 1000
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto flex min-h-screen max-w-6xl flex-col">
          <div className="h-20 border-b border-slate-200 bg-white" />

          <div className="flex flex-1 items-center justify-center p-6">
            <div className="w-full max-w-3xl animate-pulse space-y-5">
              <div className="h-16 rounded-3xl bg-slate-200" />

              <div className="space-y-4">
                <div className="ml-auto h-16 w-2/3 rounded-3xl bg-slate-200" />
                <div className="h-16 w-1/2 rounded-3xl bg-slate-200" />
                <div className="ml-auto h-20 w-3/5 rounded-3xl bg-slate-200" />
              </div>

              <div className="h-20 rounded-3xl bg-slate-200" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error && !conversation) {
    return (
      <div className="min-h-screen bg-slate-50 px-5 py-10">
        <div className="mx-auto max-w-xl rounded-3xl border border-red-100 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-2xl">
            !
          </div>

          <h1 className="text-xl font-semibold text-slate-900">
            Habaye ikibazo
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            {error}
          </p>

          <Link
            to="/messages"
            className="mt-6 inline-flex rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Subira ku butumwa
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f6f8fb] text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col">
        {/* HEADER */}
        <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/85 backdrop-blur-xl">
          <div className="flex h-20 items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <Link
                to="/messages"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50"
                aria-label="Subira"
              >
                ←
              </Link>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="truncate text-sm font-bold text-slate-950 sm:text-base">
                    {listing?.title ||
                      "Ubutumwa"}
                  </h1>

                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      isOtherOnline
                        ? "bg-emerald-500"
                        : "bg-slate-300"
                    }`}
                  />
                </div>

                <p className="mt-0.5 text-xs text-slate-500">
                  {isOtherOnline
                    ? "Online ubu"
                    : "Offline"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {listing && (
                <Link
                  to={`/listing/${listing.id}`}
                  className="hidden rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 sm:inline-flex"
                >
                  Reba listing
                </Link>
              )}

              <div
                className={`hidden items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium sm:flex ${
                  channelReady
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    channelReady
                      ? "bg-emerald-500"
                      : "bg-slate-400"
                  }`}
                />

                {channelReady
                  ? "Realtime"
                  : "Connecting"}
              </div>
            </div>
          </div>
        </header>

        {/* CHAT AREA */}
        <main className="relative flex flex-1 flex-col overflow-hidden">
          <div className="pointer-events-none absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-blue-200/20 blur-3xl" />

          <div className="relative mx-auto flex w-full max-w-4xl flex-1 flex-col px-3 pb-3 pt-4 sm:px-6 sm:pt-6">
            {/* LISTING MINI CARD */}
            {listing && (
              <Link
                to={`/listing/${listing.id}`}
                className="mb-4 flex items-center justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white px-4 py-3 shadow-sm transition hover:border-slate-300 hover:shadow-md"
              >
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Ikiganiro kijyanye na
                  </p>

                  <p className="mt-1 truncate text-sm font-semibold text-slate-900">
                    {listing.title}
                  </p>
                </div>

                <div className="shrink-0 text-right">
                  <p className="text-sm font-bold text-slate-950">
                    {formatPrice(
                      listing.price,
                      listing.currency,
                    )}
                  </p>

                  <p className="mt-0.5 text-xs text-blue-600">
                    Reba →
                  </p>
                </div>
              </Link>
            )}

            {/* MESSAGES PANEL */}
            <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-[0_20px_70px_-35px_rgba(15,23,42,0.3)]">
              <div className="min-h-0 flex-1 overflow-y-auto px-3 py-5 sm:px-6 sm:py-7">
                {messages.length === 0 ? (
                  <div className="flex h-full min-h-[420px] items-center justify-center">
                    <div className="max-w-sm text-center">
                      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-blue-50 text-2xl">
                        💬
                      </div>

                      <h2 className="mt-5 text-lg font-bold text-slate-950">
                        Tangira ikiganiro
                      </h2>

                      <p className="mt-2 text-sm leading-6 text-slate-500">
                        Ohereza ubutumwa bwa mbere
                        kugira ngo mutangire
                        kuvugana.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {messages.map(
                      (message, index) => {
                        const isMine =
                          message.sender_id ===
                          userId

                        const showDay =
                          shouldShowDay(
                            message,
                            index,
                          )

                        const grouped =
                          shouldGroupWithPrevious(
                            message,
                            index,
                          )

                        return (
                          <div
                            key={message.id}
                          >
                            {showDay && (
                              <div className="my-5 flex items-center justify-center">
                                <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-500">
                                  {formatDay(
                                    message.created_at,
                                  )}
                                </span>
                              </div>
                            )}

                            <div
                              className={`flex ${
                                isMine
                                  ? "justify-end"
                                  : "justify-start"
                              }`}
                            >
                              <div
                                className={`max-w-[82%] sm:max-w-[70%] ${
                                  grouped
                                    ? "mt-1"
                                    : "mt-3"
                                }`}
                              >
                                <div
                                  className={[
                                    "px-4 py-3 text-sm leading-6 shadow-sm",
                                    isMine
                                      ? "bg-blue-600 text-white"
                                      : "border border-slate-200 bg-white text-slate-800",
                                    isMine
                                      ? grouped
                                        ? "rounded-2xl rounded-br-md"
                                        : "rounded-2xl rounded-br-md"
                                      : grouped
                                        ? "rounded-2xl rounded-bl-md"
                                        : "rounded-2xl rounded-bl-md",
                                  ].join(" ")}
                                >
                                  <p className="whitespace-pre-wrap break-words">
                                    {message.message}
                                  </p>
                                </div>

                                <div
                                  className={`mt-1 flex items-center gap-1.5 px-1 text-[10px] text-slate-400 ${
                                    isMine
                                      ? "justify-end"
                                      : "justify-start"
                                  }`}
                                >
                                  <span>
                                    {formatTime(
                                      message.created_at,
                                    )}
                                  </span>

                                  {isMine && (
                                    <span
                                      className={
                                        message.is_read
                                          ? "text-blue-500"
                                          : "text-slate-400"
                                      }
                                    >
                                      {message.is_read
                                        ? "✓✓"
                                        : "✓"}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      },
                    )}

                    {/* TYPING INDICATOR */}
                    {isOtherTyping && (
                      <div className="mt-4 flex justify-start">
                        <div className="flex items-center gap-3 rounded-2xl rounded-bl-md border border-slate-200 bg-white px-4 py-3 shadow-sm">
                          <div className="flex items-center gap-1">
                            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.3s]" />
                            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.15s]" />
                            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400" />
                          </div>

                          <span className="text-xs font-medium text-slate-500">
                            Arimo kwandika
                          </span>
                        </div>
                      </div>
                    )}

                    <div ref={bottomRef} />
                  </div>
                )}
              </div>

              {/* ERROR */}
              {error && (
                <div className="mx-3 mb-2 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-xs text-red-600 sm:mx-5">
                  {error}
                </div>
              )}

              {/* COMPOSER */}
              <div className="border-t border-slate-200 bg-white p-3 sm:p-4">
                <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-2 transition focus-within:border-blue-300 focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(37,99,235,0.08)]">
                  <div className="flex items-end gap-2">
                    <button
                      type="button"
                      disabled
                      className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-400 transition sm:flex"
                      title="Attachment izaza nyuma"
                    >
                      +
                    </button>

                    <textarea
                      ref={textareaRef}
                      value={newMessage}
                      onChange={(event) =>
                        handleTyping(
                          event.target.value,
                        )
                      }
                      onKeyDown={handleKeyDown}
                      placeholder="Andika ubutumwa..."
                      rows={1}
                      disabled={sending}
                      className="max-h-[140px] min-h-[42px] flex-1 resize-none overflow-y-auto bg-transparent px-2 py-2.5 text-sm leading-6 text-slate-900 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed disabled:opacity-60"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        void sendMessage()
                      }
                      disabled={
                        sending ||
                        !newMessage.trim()
                      }
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-sm transition hover:bg-blue-700 active:scale-95 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
                      aria-label="Ohereza ubutumwa"
                    >
                      {sending ? (
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                      ) : (
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M22 2L11 13"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />

                          <path
                            d="M22 2L15 22L11 13L2 9L22 2Z"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <div className="mt-2 flex items-center justify-between px-2">
                  <p className="text-[10px] text-slate-400">
                    Enter yo kohereza • Shift + Enter
                    ku murongo mushya
                  </p>

                  {isOtherTyping && (
                    <p className="hidden text-[10px] font-medium text-blue-500 sm:block">
                      Arimo kwandika...
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}