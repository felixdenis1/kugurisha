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

  const channelRef = useRef<
    ReturnType<typeof supabase.channel> | null
  >(null)

  const typingTimeoutRef = useRef<
    ReturnType<typeof setTimeout> | null
  >(null)

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

      const {
        data: conversationData,
        error: conversationError,
      } = await supabase
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

      const {
        data: listingData,
        error: listingError,
      } = await supabase
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

      const {
        data: messagesData,
        error: messagesError,
      } = await supabase
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

      const unreadIds = (messagesData ?? [])
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

    const channel = supabase.channel(
      `conversation-${currentConversationId}`,
      {
        config: {
          broadcast: {
            self: false,
          },
          presence: {
            key: currentUserId,
          },
        },
      },
    )

    channel
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
            incomingMessage.sender_id ===
            currentUserId
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

          const typing = Boolean(
            payload.payload?.typing,
          )

          setIsOtherTyping(typing)

          if (typingTimeoutRef.current) {
            clearTimeout(
              typingTimeoutRef.current,
            )
          }

          if (typing) {
            typingTimeoutRef.current =
              setTimeout(() => {
                setIsOtherTyping(false)
              }, 3000)
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
        clearTimeout(
          typingTimeoutRef.current,
        )
      }

      autoResizeTextarea()
      return
    }

    void broadcastTyping(true)

    if (typingTimeoutRef.current) {
      clearTimeout(
        typingTimeoutRef.current,
      )
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

      const {
        data,
        error: insertError,
      } = await supabase
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
        textareaRef.current.style.height =
          "auto"

        textareaRef.current.focus()
      }

      await supabase
        .from("conversations")
        .update({
          updated_at: new Date().toISOString(),
        })
        .eq("id", conversationId)
    } catch (err) {
      console.error(
        "Send message error:",
        err,
      )

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

    const previous = messages[index - 1]

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

    const previous = messages[index - 1]

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
        <div className="border-b border-slate-200 bg-white">
          <div className="mx-auto h-20 max-w-5xl animate-pulse px-4 sm:px-6">
            <div className="flex h-full items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-slate-200" />

              <div className="space-y-2">
                <div className="h-3.5 w-40 rounded-full bg-slate-200" />
                <div className="h-2.5 w-20 rounded-full bg-slate-100" />
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto flex min-h-[calc(100vh-80px)] w-full max-w-4xl items-center justify-center px-4 py-8">
          <div className="w-full max-w-2xl animate-pulse">
            <div className="mb-5 h-16 rounded-[26px] bg-slate-200/70" />

            <div className="rounded-[32px] border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
              <div className="space-y-5">
                <div className="ml-auto h-14 w-2/3 rounded-[22px] bg-slate-200" />
                <div className="h-14 w-1/2 rounded-[22px] bg-slate-100" />
                <div className="ml-auto h-16 w-3/5 rounded-[22px] bg-slate-200" />
                <div className="h-14 w-2/5 rounded-[22px] bg-slate-100" />
              </div>

              <div className="mt-10 h-14 rounded-[22px] bg-slate-100" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error && !conversation) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-slate-50 px-5 py-10">
        <div className="pointer-events-none absolute left-1/2 top-10 h-72 w-72 -translate-x-1/2 rounded-full bg-blue-200/40 blur-[120px]" />

        <div className="relative mx-auto flex min-h-[80vh] max-w-xl items-center justify-center">
          <div className="w-full rounded-[30px] border border-slate-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-lg font-bold text-red-500">
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
              className="mt-6 inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Subira ku butumwa
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen overflow-hidden text-slate-900 antialiased"
      style={{
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Inter", "Segoe UI", sans-serif',
        background:
          "linear-gradient(135deg, #eff6ff 0%, #f8fafc 38%, #eef2ff 68%, #dbeafe 100%)",
      }}
    >
      {/* PAGE BACKGROUND */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-[-240px] h-[620px] w-[850px] -translate-x-1/2 rounded-full bg-gradient-to-br from-blue-400/45 via-indigo-300/30 to-cyan-200/10 blur-[120px]" />

        <div className="absolute right-[-180px] top-[22%] h-[500px] w-[500px] rounded-full bg-gradient-to-bl from-blue-400/30 via-indigo-300/20 to-transparent blur-[125px]" />

        <div className="absolute bottom-[-220px] left-[-80px] h-[520px] w-[520px] rounded-full bg-gradient-to-tr from-blue-300/35 via-indigo-200/25 to-transparent blur-[120px]" />

        <div className="absolute left-[30%] top-[42%] h-[300px] w-[420px] rounded-full bg-blue-300/15 blur-[100px]" />
      </div>

      {/* HEADER */}
      <header className="sticky top-0 z-30 border-b border-white/60 bg-white/80 backdrop-blur-2xl">
        <div className="mx-auto flex h-[72px] w-full max-w-5xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              to="/messages"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200/80 bg-white/80 text-slate-600 shadow-sm transition hover:bg-white hover:text-slate-950"
              aria-label="Subira"
            >
              <svg
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M15 18L9 12L15 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-950 text-sm font-bold text-white shadow-sm">
              {listing?.title?.charAt(0)?.toUpperCase() ||
                "K"}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="truncate text-sm font-bold tracking-[-0.01em] text-slate-950 sm:text-[15px]">
                  {listing?.title || "Ubutumwa"}
                </h1>

                <span
                  className={`h-2 w-2 shrink-0 rounded-full ${
                    isOtherOnline
                      ? "bg-emerald-500"
                      : "bg-slate-300"
                  }`}
                />
              </div>

              <p className="mt-0.5 text-[11px] font-semibold text-slate-400">
                {isOtherOnline
                  ? "Online ubu"
                  : "Offline"}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {listing && (
              <Link
                to={`/listing/${listing.id}`}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/80 px-3.5 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-white hover:text-slate-950 sm:px-4 sm:py-2.5 sm:text-sm"
              >
                <span className="hidden sm:inline">
                  Reba listing
                </span>

                <span className="sm:hidden">
                  Reba
                </span>

                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M7 17L17 7"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  <path
                    d="M8 7H17V16"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
            )}

            <div
              className={`hidden items-center gap-2 rounded-full border px-3 py-2 text-[11px] font-semibold lg:flex ${
                channelReady
                  ? "border-emerald-100 bg-emerald-50/70 text-emerald-700"
                  : "border-slate-200 bg-white/70 text-slate-500"
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

      {/* MAIN */}
      <main className="relative min-h-[calc(100vh-72px)] overflow-hidden">
        <div className="relative mx-auto flex w-full max-w-4xl flex-col px-3 py-5 sm:px-6 sm:py-7">
          {/* LISTING CONTEXT */}
          {listing && (
            <Link
              to={`/listing/${listing.id}`}
              className="group relative mx-auto mb-4 flex w-full max-w-2xl items-center justify-between gap-4 overflow-hidden rounded-full border border-white/70 bg-white/75 px-4 py-3.5 shadow-[0_18px_50px_-35px_rgba(37,99,235,0.45)] backdrop-blur-xl transition hover:bg-white/90 sm:px-5"
            >
              <div className="min-w-0">
                <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-slate-400">
                  Ikiganiro kijyanye na
                </p>

                <p className="mt-1 truncate text-sm font-bold tracking-[-0.01em] text-slate-900">
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

                <p className="mt-0.5 text-[11px] font-semibold text-slate-400 transition group-hover:text-blue-600">
                  Reba →
                </p>
              </div>
            </Link>
          )}

          {/* CHAT */}
          <div className="relative mx-auto w-full max-w-2xl">
            {/* STRONG BLUR BEHIND CHAT */}
            <div className="pointer-events-none absolute -inset-14 -z-10 rounded-[100px] bg-gradient-to-br from-blue-400/35 via-indigo-300/25 to-cyan-200/20 blur-[90px]" />

            <div className="pointer-events-none absolute -inset-6 -z-10 rounded-[70px] bg-blue-300/20 blur-[55px]" />

            <div className="relative flex h-[calc(100vh-190px)] min-h-[520px] max-h-[760px] flex-col overflow-hidden rounded-[36px] border border-white/80 bg-white/90 shadow-[0_30px_100px_-45px_rgba(30,64,175,0.45)] backdrop-blur-2xl">
              {/* CHAT TOP STRIP */}
              <div className="flex shrink-0 items-center justify-between border-b border-slate-100/80 px-5 py-3.5 sm:px-6">
                <div>
                  <p className="text-xs font-bold tracking-[-0.01em] text-slate-900">
                    Ikiganiro
                  </p>

                  <p className="mt-0.5 text-[10px] font-medium text-slate-400">
                    Ubutumwa bwawe na nyir'igicuruzwa
                  </p>
                </div>

                <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      isOtherOnline
                        ? "bg-emerald-500"
                        : "bg-slate-300"
                    }`}
                  />

                  {isOtherOnline
                    ? "Online"
                    : "Offline"}
                </div>
              </div>

              {/* MESSAGES */}
              <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-7 sm:py-7">
                {messages.length === 0 ? (
                  <div className="flex h-full min-h-[380px] items-center justify-center">
                    <div className="max-w-xs text-center">
                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-500">
                        <svg
                          width="22"
                          height="22"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M20 11.5C20 15.6421 16.4183 19 12 19C10.8143 19 9.68642 18.7579 8.68 18.3214L4 20L5.47214 16.0686C4.54851 14.813 4 13.2378 4 11.5C4 7.35786 7.58172 4 12 4C16.4183 4 20 7.35786 20 11.5Z"
                            stroke="currentColor"
                            strokeWidth="1.7"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>

                      <h2 className="mt-4 text-base font-bold tracking-[-0.015em] text-slate-900">
                        Tangira ikiganiro
                      </h2>

                      <p className="mt-1.5 text-xs font-medium leading-5 text-slate-400">
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
                              <div className="my-6 flex items-center gap-3">
                                <div className="h-px flex-1 bg-slate-100" />

                                <span className="shrink-0 rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-[10px] font-bold text-slate-400">
                                  {formatDay(
                                    message.created_at,
                                  )}
                                </span>

                                <div className="h-px flex-1 bg-slate-100" />
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
                                className={`max-w-[84%] sm:max-w-[72%] ${
                                  grouped
                                    ? "mt-1"
                                    : "mt-3"
                                }`}
                              >
                                <div
                                  className={[
                                    "px-4 py-3 text-[13px] font-semibold leading-5 tracking-[-0.005em] transition",
                                    isMine
                                      ? "rounded-full bg-blue-600 text-white shadow-[0_8px_25px_-12px_rgba(37,99,235,0.8)]"
                                      : "rounded-full border border-slate-200 bg-slate-50 text-slate-800",
                                  ].join(
                                    " ",
                                  )}
                                >
                                  <p className="whitespace-pre-wrap break-words">
                                    {
                                      message.message
                                    }
                                  </p>
                                </div>

                                <div
                                  className={`mt-1.5 flex items-center gap-1.5 px-1 text-[9px] font-semibold text-slate-400 ${
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
                                          : "text-slate-300"
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

                    {/* TYPING */}
                    {isOtherTyping && (
                      <div className="mt-4 flex justify-start">
                        <div className="flex items-center gap-2.5 rounded-full border border-slate-200 bg-slate-50 px-4 py-3">
                          <div className="flex items-center gap-1">
                            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.3s]" />
                            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.15s]" />
                            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400" />
                          </div>

                          <span className="text-[10px] font-semibold text-slate-400">
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
                <div className="mx-4 mb-2 rounded-full border border-red-100 bg-red-50 px-4 py-2.5 text-[11px] font-semibold text-red-600 sm:mx-6">
                  {error}
                </div>
              )}

              {/* COMPOSER */}
              <div className="shrink-0 border-t border-slate-100/80 bg-white/80 p-3.5 backdrop-blur-xl sm:p-4">
                <div className="rounded-full border border-slate-200 bg-slate-50/80 p-1.5 transition-all duration-200 focus-within:border-blue-300 focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(37,99,235,0.08)]">
                  <div className="flex items-end gap-2">
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
                      className="max-h-[140px] min-h-[43px] flex-1 resize-none overflow-y-auto rounded-full bg-transparent px-3 py-2.5 text-[13px] font-semibold leading-5 tracking-[-0.005em] text-slate-900 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed disabled:opacity-60"
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
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white shadow-[0_8px_24px_-10px_rgba(37,99,235,0.8)] transition-all duration-200 hover:bg-blue-700 active:scale-95 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
                      aria-label="Ohereza ubutumwa"
                    >
                      {sending ? (
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      ) : (
                        <svg
                          width="17"
                          height="17"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M22 2L11 13"
                            stroke="currentColor"
                            strokeWidth="1.9"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />

                          <path
                            d="M22 2L15 22L11 13L2 9L22 2Z"
                            stroke="currentColor"
                            strokeWidth="1.9"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <div className="mt-2 flex items-center justify-between px-2">
                  <p className="text-[9px] font-medium text-slate-400">
                    Enter yo kohereza • Shift + Enter
                    ku murongo mushya
                  </p>

                  {isOtherTyping && (
                    <p className="hidden text-[9px] font-semibold text-slate-400 sm:block">
                      Arimo kwandika...
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}