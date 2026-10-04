import { useEffect, useMemo, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { supabase } from "../services/supabase"

type Conversation = {
  id: string
  listing_id: string
  buyer_id: string
  seller_id: string
  created_at: string
  updated_at: string
  listings: {
    title: string
    price: number | null
    currency: string
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

function MessagesInbox() {
  const navigate = useNavigate()

  const [userId, setUserId] = useState<string | null>(null)
  const [conversations, setConversations] = useState<
    Conversation[]
  >([])
  const [latestMessages, setLatestMessages] = useState<
    Record<string, Message>
  >({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")

  useEffect(() => {
    loadInbox()
  }, [])

  async function loadInbox() {
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

      const { data, error } = await supabase
        .from("conversations")
        .select(`
          id,
          listing_id,
          buyer_id,
          seller_id,
          created_at,
          updated_at,
          listings (
            title,
            price,
            currency
          )
        `)
        .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
        .order("updated_at", {
          ascending: false,
        })

      if (error) throw error

      const loadedConversations: Conversation[] = (
        data || []
      ).map((conversation) => {
        const listing = Array.isArray(conversation.listings)
          ? conversation.listings[0]
          : conversation.listings

        return {
          ...conversation,
          listings: listing || null,
        } as unknown as Conversation
      })

      setConversations(loadedConversations)

      if (loadedConversations.length === 0) {
        setLatestMessages({})
        return
      }

      const conversationIds = loadedConversations.map(
        (conversation) => conversation.id,
      )

      const {
        data: messageData,
        error: messageError,
      } = await supabase
        .from("messages")
        .select(`
          id,
          conversation_id,
          sender_id,
          message,
          is_read,
          created_at
        `)
        .in("conversation_id", conversationIds)
        .order("created_at", {
          ascending: false,
        })

      if (messageError) throw messageError

      const latest: Record<string, Message> = {}

      for (const message of (messageData || []) as Message[]) {
        if (!latest[message.conversation_id]) {
          latest[message.conversation_id] = message
        }
      }

      setLatestMessages(latest)
    } catch (err) {
      console.error("Inbox error:", err)
      setError(
        "Habaye ikibazo mu kuzana ubutumwa.",
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!userId) return

    const channel = supabase
      .channel(`inbox-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          const message = payload.new as Message

          setLatestMessages((current) => ({
            ...current,
            [message.conversation_id]: message,
          }))

          setConversations((current) => {
            const exists = current.some(
              (conversation) =>
                conversation.id ===
                message.conversation_id,
            )

            if (!exists) {
              return current
            }

            const updated = current.map(
              (conversation) =>
                conversation.id ===
                message.conversation_id
                  ? {
                      ...conversation,
                      updated_at:
                        message.created_at,
                    }
                  : conversation,
            )

            return [...updated].sort(
              (a, b) =>
                new Date(
                  b.updated_at,
                ).getTime() -
                new Date(
                  a.updated_at,
                ).getTime(),
            )
          })
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId])

  function formatPrice(
    price: number | null,
    currency: string,
  ) {
    if (price === null) {
      return "Vugana n'ugurisha"
    }

    return `${new Intl.NumberFormat("rw-RW").format(
      price,
    )} ${currency || "RWF"}`
  }

  function formatDate(date: string) {
    const value = new Date(date)
    const now = new Date()

    if (
      value.toDateString() ===
      now.toDateString()
    ) {
      return value.toLocaleTimeString(
        "rw-RW",
        {
          hour: "2-digit",
          minute: "2-digit",
        },
      )
    }

    const difference =
      now.getTime() - value.getTime()

    const oneDay = 24 * 60 * 60 * 1000

    if (difference < 7 * oneDay) {
      return value.toLocaleDateString(
        "rw-RW",
        {
          weekday: "short",
        },
      )
    }

    return value.toLocaleDateString(
      "rw-RW",
      {
        day: "2-digit",
        month: "short",
      },
    )
  }

  function truncate(
    text: string,
    length = 70,
  ) {
    if (text.length <= length) {
      return text
    }

    return `${text.substring(0, length)}...`
  }

  function getOtherUserLabel(
    conversation: Conversation,
  ) {
    if (!userId) return "Umuntu"

    return conversation.buyer_id === userId
      ? "Ugurisha"
      : "Umuguzi"
  }

  function getInitials(
    conversation: Conversation,
  ) {
    return conversation.buyer_id === userId
      ? "U"
      : "M"
  }

  const filteredConversations = useMemo(() => {
    const query = search.trim().toLowerCase()

    if (!query) {
      return conversations
    }

    return conversations.filter(
      (conversation) => {
        const latest =
          latestMessages[conversation.id]

        const title =
          conversation.listings?.title?.toLowerCase() ||
          ""

        const message =
          latest?.message?.toLowerCase() || ""

        const role =
          getOtherUserLabel(
            conversation,
          ).toLowerCase()

        return (
          title.includes(query) ||
          message.includes(query) ||
          role.includes(query)
        )
      },
    )
  }, [
    search,
    conversations,
    latestMessages,
  ])

  const unreadCount = conversations.filter(
    (conversation) => {
      const latest =
        latestMessages[conversation.id]

      return (
        latest &&
        latest.sender_id !== userId &&
        !latest.is_read
      )
    },
  ).length

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f6f8fb]">
        <header className="border-b border-slate-200/80 bg-white">
          <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="h-10 w-40 animate-pulse rounded-2xl bg-slate-200" />
            <div className="h-10 w-28 animate-pulse rounded-2xl bg-slate-200" />
          </div>
        </header>

        <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:py-10">
          <div className="mb-7 space-y-3">
            <div className="h-4 w-28 animate-pulse rounded bg-slate-200" />
            <div className="h-11 w-64 animate-pulse rounded-xl bg-slate-200" />
            <div className="h-4 w-80 max-w-full animate-pulse rounded bg-slate-100" />
          </div>

          <div className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 p-4 sm:p-5">
              <div className="h-12 animate-pulse rounded-2xl bg-slate-100" />
            </div>

            {[1, 2, 3, 4, 5].map(
              (item) => (
                <div
                  key={item}
                  className="flex gap-4 border-b border-slate-100 p-5"
                >
                  <div className="h-14 w-14 shrink-0 animate-pulse rounded-2xl bg-slate-200" />

                  <div className="min-w-0 flex-1">
                    <div className="h-4 w-1/2 animate-pulse rounded bg-slate-200" />

                    <div className="mt-3 h-4 w-3/4 animate-pulse rounded bg-slate-100" />

                    <div className="mt-2 h-3 w-1/3 animate-pulse rounded bg-slate-100" />
                  </div>
                </div>
              ),
            )}
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f6f8fb] text-slate-900">
      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            to="/"
            className="group flex items-center gap-3"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-sm font-black text-white shadow-lg shadow-slate-950/10 transition duration-200 group-hover:scale-105">
              K
            </div>

            <div className="leading-none">
              <div className="text-lg font-black tracking-[-0.04em] text-slate-950">
                KUGURISHA
                <span className="text-slate-400">
                  .COM
                </span>
              </div>

              <div className="mt-1 hidden text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 sm:block">
                Isoko ryawe
              </div>
            </div>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/favorites"
              className="hidden h-10 items-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 sm:flex"
            >
              <span className="mr-2 text-lg">
                ♡
              </span>
              Ibyakunzwe
            </Link>

            <Link
              to="/dashboard"
              className="hidden h-10 items-center rounded-xl px-4 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 md:flex"
            >
              Dashboard
            </Link>

            <Link
              to="/create-listing"
              className="flex h-10 items-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-bold text-white shadow-lg shadow-slate-950/10 transition hover:-translate-y-0.5 hover:bg-slate-800"
            >
              <span className="text-base">
                +
              </span>
              <span>Gurisha</span>
            </Link>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="mx-auto max-w-5xl px-4 py-7 sm:px-6 sm:py-10">
        {/* INTRO */}
        <section className="mb-7">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-slate-950"
          >
            <span>←</span>
            Ahabanza
          </Link>

          <div className="mt-5 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-blue-600">
                <span className="h-2 w-2 rounded-full bg-blue-500" />
                Ubutumwa bwawe
              </div>

              <h1 className="text-3xl font-black tracking-[-0.05em] text-slate-950 sm:text-5xl">
                Ubutumwa
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500 sm:text-base">
                Reba ibiganiro byawe byose
                n'abaguzi n'abagurisha ahantu
                hamwe.
              </p>
            </div>

            <div className="flex gap-3">
              <div className="min-w-[110px] rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                <div className="text-2xl font-black text-slate-950">
                  {conversations.length}
                </div>

                <div className="mt-1 text-xs font-semibold text-slate-400">
                  Ibiganiro
                </div>
              </div>

              <div className="min-w-[110px] rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                <div className="flex items-center gap-2 text-2xl font-black text-slate-950">
                  {unreadCount}

                  {unreadCount > 0 && (
                    <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
                  )}
                </div>

                <div className="mt-1 text-xs font-semibold text-slate-400">
                  Bishya
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ERROR */}
        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 text-red-700">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-100 font-bold">
              !
            </div>

            <div>
              <p className="font-bold">
                Habaye ikibazo
              </p>

              <p className="mt-1 text-sm text-red-600">
                {error}
              </p>
            </div>
          </div>
        )}

        {/* EMPTY */}
        {conversations.length === 0 ? (
          <div className="relative overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_20px_70px_-30px_rgba(15,23,42,0.25)]">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-100/60 blur-3xl" />

            <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-slate-100 blur-3xl" />

            <div className="relative px-6 py-20 text-center sm:px-10 sm:py-28">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[26px] bg-blue-600 text-3xl text-white shadow-xl shadow-blue-600/20">
                💬
              </div>

              <p className="mt-6 text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                Inbox yawe
              </p>

              <h2 className="mt-3 text-2xl font-black tracking-[-0.04em] text-slate-950 sm:text-3xl">
                Nta biganiro uragira
              </h2>

              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500 sm:text-base">
                Iyo ubonye listing igushimishije,
                ushobora kuvugisha ugurisha
                ugatangira ikiganiro.
              </p>

              <Link
                to="/"
                className="mt-7 inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-6 py-3.5 text-sm font-bold text-white shadow-xl shadow-slate-950/15 transition hover:-translate-y-0.5 hover:bg-slate-800"
              >
                Reba listings
                <span>→</span>
              </Link>
            </div>
          </div>
        ) : (
          <section className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-[0_20px_70px_-30px_rgba(15,23,42,0.25)]">
            {/* TOOLBAR */}
            <div className="border-b border-slate-100 bg-white p-4 sm:p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="font-black tracking-[-0.02em] text-slate-950">
                    Ibiganiro
                  </h2>

                  <p className="mt-1 text-xs text-slate-400">
                    Kanda ikiganiro ushaka
                    gukomeza
                  </p>
                </div>

                <div className="relative w-full sm:max-w-sm">
                  <svg
                    className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M21 21L16.65 16.65M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>

                  <input
                    value={search}
                    onChange={(event) =>
                      setSearch(
                        event.target.value,
                      )
                    }
                    placeholder="Shakisha ubutumwa..."
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50"
                  />
                </div>
              </div>
            </div>

            {/* NO SEARCH RESULTS */}
            {filteredConversations.length === 0 ? (
              <div className="px-6 py-16 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-xl">
                  🔎
                </div>

                <h3 className="mt-4 font-black text-slate-950">
                  Nta biganiro bibonetse
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Gerageza irindi jambo ryo
                  gushakisha.
                </p>

                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="mt-5 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800"
                >
                  Reba byose
                </button>
              </div>
            ) : (
              <div>
                {filteredConversations.map(
                  (
                    conversation,
                    index,
                  ) => {
                    const latest =
                      latestMessages[
                        conversation.id
                      ]

                    const unread =
                      !!latest &&
                      latest.sender_id !==
                        userId &&
                      !latest.is_read

                    const listingTitle =
                      conversation.listings
                        ?.title ||
                      "Listing"

                    const isLast =
                      index ===
                      filteredConversations.length -
                        1

                    return (
                      <button
                        key={
                          conversation.id
                        }
                        type="button"
                        onClick={() =>
                          navigate(
                            `/messages/${conversation.id}`,
                          )
                        }
                        className={`group relative w-full text-left transition duration-200 ${
                          !isLast
                            ? "border-b border-slate-100"
                            : ""
                        } ${
                          unread
                            ? "bg-blue-50/40"
                            : "bg-white"
                        } hover:bg-slate-50`}
                      >
                        {/* UNREAD BAR */}
                        {unread && (
                          <span className="absolute bottom-0 left-0 top-0 w-1 bg-blue-600" />
                        )}

                        <div className="flex gap-3 p-4 sm:gap-5 sm:p-5">
                          {/* AVATAR */}
                          <div className="relative shrink-0">
                            <div
                              className={`flex h-14 w-14 items-center justify-center rounded-[18px] text-sm font-black transition duration-200 group-hover:scale-105 sm:h-16 sm:w-16 ${
                                unread
                                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                                  : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {getInitials(
                                conversation,
                              )}
                            </div>

                            <span
                              className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-[3px] border-white ${
                                unread
                                  ? "bg-emerald-500"
                                  : "bg-slate-300"
                              }`}
                            />
                          </div>

                          {/* CONTENT */}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <h3
                                  className={`truncate text-sm sm:text-base ${
                                    unread
                                      ? "font-black text-slate-950"
                                      : "font-bold text-slate-800"
                                  }`}
                                >
                                  {listingTitle}
                                </h3>

                                <div className="mt-1.5 flex items-center gap-2">
                                  <span
                                    className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${
                                      conversation.buyer_id ===
                                      userId
                                        ? "bg-blue-50 text-blue-600"
                                        : "bg-emerald-50 text-emerald-600"
                                    }`}
                                  >
                                    {getOtherUserLabel(
                                      conversation,
                                    )}
                                  </span>

                                  {conversation.listings && (
                                    <span className="hidden truncate text-xs font-semibold text-slate-400 sm:block">
                                      •{" "}
                                      {formatPrice(
                                        conversation
                                          .listings
                                          .price,
                                        conversation
                                          .listings
                                          .currency,
                                      )}
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className="flex shrink-0 flex-col items-end gap-2">
                                <span
                                  className={`text-[11px] font-semibold ${
                                    unread
                                      ? "text-blue-600"
                                      : "text-slate-400"
                                  }`}
                                >
                                  {latest
                                    ? formatDate(
                                        latest.created_at,
                                      )
                                    : formatDate(
                                        conversation.updated_at,
                                      )}
                                </span>

                                <span className="hidden text-lg text-slate-300 transition duration-200 group-hover:translate-x-1 sm:block">
                                  →
                                </span>
                              </div>
                            </div>

                            {/* MOBILE PRICE */}
                            {conversation.listings && (
                              <div className="mt-2 text-xs font-bold text-slate-500 sm:hidden">
                                {formatPrice(
                                  conversation
                                    .listings
                                    .price,
                                  conversation
                                    .listings
                                    .currency,
                                )}
                              </div>
                            )}

                            {/* LAST MESSAGE */}
                            <div className="mt-2.5 flex items-center gap-2">
                              <p
                                className={`min-w-0 flex-1 truncate text-sm ${
                                  unread
                                    ? "font-bold text-slate-900"
                                    : "font-medium text-slate-500"
                                }`}
                              >
                                {latest
                                  ? truncate(
                                      latest.message,
                                    )
                                  : "Nta butumwa burandikwa."}
                              </p>

                              {unread && (
                                <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-blue-600 px-1.5 text-[10px] font-black text-white shadow-sm">
                                  1
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </button>
                    )
                  },
                )}
              </div>
            )}
          </section>
        )}

        {/* REALTIME HINT */}
        {conversations.length > 0 && (
          <div className="mt-5 flex items-center justify-center gap-2 text-xs font-medium text-slate-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Ubutumwa bushya buza ako kanya
          </div>
        )}
      </main>
    </div>
  )
}

export default MessagesInbox