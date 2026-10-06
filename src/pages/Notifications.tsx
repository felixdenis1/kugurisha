import { useEffect, useMemo, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { supabase } from "../services/supabase"

type Notification = {
  id: string
  user_id: string
  type: string
  title: string
  body: string | null
  listing_id: string | null
  sender_id: string | null
  conversation_id: string | null
  is_read: boolean
  created_at: string
}

type NotificationGroup = {
  id: string
  notifications: Notification[]
  senderName: string
  latest: Notification
  unreadCount: number
  totalCount: number
}

type Profile = {
  id: string
  full_name: string | null
}

function Notifications() {
  const navigate = useNavigate()

  const [notifications, setNotifications] = useState<Notification[]>([])
  const [profiles, setProfiles] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    loadNotifications()

    const channel = supabase
      .channel("notifications-page")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
        },
        async (payload) => {
          const newNotification =
            payload.new as Notification

          const {
            data: { user },
          } = await supabase.auth.getUser()

          if (!user) return

          if (newNotification.user_id !== user.id) {
            return
          }

          setNotifications((current) => {
            const exists = current.some(
              (item) => item.id === newNotification.id,
            )

            if (exists) {
              return current
            }

            return [
              newNotification,
              ...current,
            ].slice(0, 50)
          })

          if (newNotification.sender_id) {
            loadSenderProfile(
              newNotification.sender_id,
            )
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  async function loadNotifications() {
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

      const {
        data,
        error: notificationsError,
      } = await supabase
        .from("notifications")
        .select(`
          id,
          user_id,
          type,
          title,
          body,
          listing_id,
          sender_id,
          conversation_id,
          is_read,
          created_at
        `)
        .eq("user_id", user.id)
        .order("created_at", {
          ascending: false,
        })
        .limit(50)

      if (notificationsError) {
        throw notificationsError
      }

      const notificationData =
        (data || []) as Notification[]

      setNotifications(notificationData)

      const senderIds = Array.from(
        new Set(
          notificationData
            .map((item) => item.sender_id)
            .filter(
              (id): id is string => Boolean(id),
            ),
        ),
      )

      if (senderIds.length > 0) {
        const { data: profileData } =
          await supabase
            .from("profiles")
            .select("id, full_name")
            .in("id", senderIds)

        if (profileData) {
          const profileMap: Record<
            string,
            string
          > = {}

          ;(profileData as Profile[]).forEach(
            (profile) => {
              profileMap[profile.id] =
                profile.full_name?.trim() ||
                "Umukoresha"
            },
          )

          setProfiles(profileMap)
        }
      }
    } catch (err) {
      console.error(
        "Notifications error:",
        err,
      )

      setError(
        "Habaye ikibazo mu kuzana notifications.",
      )
    } finally {
      setLoading(false)
    }
  }

  async function loadSenderProfile(
    senderId: string,
  ) {
    if (profiles[senderId]) {
      return
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name")
      .eq("id", senderId)
      .maybeSingle()

    if (error || !data) {
      return
    }

    setProfiles((current) => ({
      ...current,
      [senderId]:
        data.full_name?.trim() ||
        "Umukoresha",
    }))
  }

  const groupedNotifications =
    useMemo<NotificationGroup[]>(() => {
      const groups: NotificationGroup[] = []

      notifications.forEach(
        (notification) => {
          const lastGroup =
            groups[groups.length - 1]

          const sameGroup =
            lastGroup &&
            notification.type ===
              lastGroup.latest.type &&
            notification.sender_id ===
              lastGroup.latest.sender_id &&
            notification.conversation_id ===
              lastGroup.latest.conversation_id

          if (sameGroup) {
            lastGroup.notifications.push(
              notification,
            )

            lastGroup.totalCount += 1

            if (!notification.is_read) {
              lastGroup.unreadCount += 1
            }

            lastGroup.latest = notification
          } else {
            const senderName =
              notification.sender_id
                ? profiles[
                    notification.sender_id
                  ] ||
                  getSenderNameFromBody(
                    notification.body,
                  )
                : getSenderNameFromBody(
                    notification.body,
                  )

            groups.push({
              id: notification.id,
              notifications: [notification],
              senderName,
              latest: notification,
              unreadCount:
                notification.is_read ? 0 : 1,
              totalCount: 1,
            })
          }
        },
      )

      return groups.map((group) => ({
        ...group,
        senderName:
          group.latest.sender_id
            ? profiles[
                group.latest.sender_id
              ] ||
              group.senderName ||
              "Umukoresha"
            : group.senderName ||
              "Umukoresha",
      }))
    }, [notifications, profiles])

  function getSenderNameFromBody(
    body: string | null,
  ) {
    if (!body) {
      return "Umukoresha"
    }

    const suffix =
      " yakwoherereje ubutumwa."

    if (body.endsWith(suffix)) {
      return body.slice(
        0,
        -suffix.length,
      )
    }

    return body
  }

  async function openNotificationGroup(
    group: NotificationGroup,
  ) {
    const unreadIds = group.notifications
      .filter((item) => !item.is_read)
      .map((item) => item.id)

    if (unreadIds.length > 0) {
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .in("id", unreadIds)

      if (error) {
        console.error(
          "Mark grouped notifications read error:",
          error,
        )
      } else {
        setNotifications((current) =>
          current.map((item) =>
            unreadIds.includes(item.id)
              ? {
                  ...item,
                  is_read: true,
                }
              : item,
          ),
        )
      }
    }

    const notification = group.latest

    if (notification.type === "new_message") {
      if (notification.conversation_id) {
        navigate(
          `/messages/${notification.conversation_id}`,
        )
      } else {
        navigate("/messages")
      }

      return
    }

    if (notification.listing_id) {
      navigate(
        `/listing/${notification.listing_id}`,
      )
    }
  }

  async function markAllAsRead() {
    const unreadIds = notifications
      .filter((item) => !item.is_read)
      .map((item) => item.id)

    if (unreadIds.length === 0) {
      return
    }

    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .in("id", unreadIds)

    if (error) {
      console.error(
        "Mark all notifications read error:",
        error,
      )

      return
    }

    setNotifications((current) =>
      current.map((item) => ({
        ...item,
        is_read: true,
      })),
    )
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

    const oneDay =
      24 * 60 * 60 * 1000

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

  function getNotificationIcon(
    type: string,
  ) {
    if (type === "new_message") {
      return "💬"
    }

    if (type.includes("favorite")) {
      return "♡"
    }

    if (type.includes("listing")) {
      return "◈"
    }

    return "🔔"
  }

  function getNotificationLabel(
    type: string,
  ) {
    if (type === "new_message") {
      return "Ubutumwa"
    }

    if (type.includes("favorite")) {
      return "Ibyakunzwe"
    }

    if (type.includes("listing")) {
      return "Listing"
    }

    return "Notification"
  }

  const unreadCount = useMemo(
    () =>
      notifications.filter(
        (item) => !item.is_read,
      ).length,
    [notifications],
  )

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-50 text-slate-900">
      {/* =========================================================
          PREMIUM BACKGROUND
          ========================================================= */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-[34rem] w-[34rem] rounded-full bg-blue-500/20 blur-[120px]" />

        <div className="absolute right-[-8rem] top-[8%] h-[32rem] w-[32rem] rounded-full bg-indigo-500/20 blur-[120px]" />

        <div className="absolute bottom-[-10rem] left-[25%] h-[34rem] w-[34rem] rounded-full bg-cyan-400/15 blur-[130px]" />

        <div className="absolute bottom-[5%] right-[5%] h-[24rem] w-[24rem] rounded-full bg-blue-600/15 blur-[110px]" />

        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(59,130,246,0.06),transparent_35%,rgba(99,102,241,0.06)_65%,rgba(6,182,212,0.04))]" />
      </div>

      {/* =========================================================
          HEADER
          ========================================================= */}
      <header className="sticky top-0 z-50 border-b border-white/70 bg-white/80 backdrop-blur-2xl">
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
              to="/messages"
              className="hidden h-10 items-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 sm:flex"
            >
              <span className="mr-2">
                💬
              </span>
              Ubutumwa
            </Link>

            <Link
              to="/create-listing"
              className="flex h-10 items-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-bold text-white shadow-lg shadow-slate-950/10 transition hover:-translate-y-0.5 hover:bg-blue-600"
            >
              <span className="text-base">
                +
              </span>
              Gurisha
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-5xl px-4 py-7 sm:px-6 sm:py-10">
        {/* =====================================================
            PAGE INTRO
            ===================================================== */}
        <section className="mb-8">
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
                <span className="h-2 w-2 rounded-full bg-blue-500 shadow-sm shadow-blue-500/50" />
                Amakuru yawe
              </div>

              <h1 className="text-3xl font-black tracking-[-0.05em] text-slate-950 sm:text-5xl">
                Notifications
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500 sm:text-base">
                Reba amakuru mashya ajyanye
                n'ibikorwa byawe kuri
                KUGURISHA.COM.
              </p>
            </div>

            {/* STATS */}
            <div className="flex gap-3">
              <div className="min-w-[110px] rounded-2xl border border-white/80 bg-white/90 px-4 py-3 shadow-lg shadow-slate-900/5 backdrop-blur-xl">
                <div className="text-2xl font-black text-slate-950">
                  {groupedNotifications.length}
                </div>

                <div className="mt-1 text-xs font-semibold text-slate-400">
                  Amatsinda
                </div>
              </div>

              <div className="min-w-[110px] rounded-2xl border border-white/80 bg-white/90 px-4 py-3 shadow-lg shadow-slate-900/5 backdrop-blur-xl">
                <div className="flex items-center gap-2 text-2xl font-black text-slate-950">
                  {unreadCount}

                  {unreadCount > 0 && (
                    <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-blue-600" />
                  )}
                </div>

                <div className="mt-1 text-xs font-semibold text-slate-400">
                  Zitarasomwa
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            ERROR
            ===================================================== */}
        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50/95 p-4 text-red-700 shadow-sm">
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

        {/* =====================================================
            LOADING
            ===================================================== */}
        {loading ? (
          <section className="overflow-hidden rounded-[30px] border border-white/80 bg-white/95 shadow-2xl shadow-slate-900/10 backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-slate-100 p-5">
              <div>
                <div className="h-5 w-32 animate-pulse rounded bg-slate-200" />
                <div className="mt-2 h-3 w-48 animate-pulse rounded bg-slate-100" />
              </div>

              <div className="h-9 w-24 animate-pulse rounded-xl bg-slate-100" />
            </div>

            {[1, 2, 3, 4, 5].map(
              (item) => (
                <div
                  key={item}
                  className="flex gap-4 border-b border-slate-100 p-5"
                >
                  <div className="h-14 w-14 shrink-0 animate-pulse rounded-[18px] bg-slate-200" />

                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between gap-4">
                      <div className="h-4 w-1/2 animate-pulse rounded bg-slate-200" />
                      <div className="h-3 w-14 animate-pulse rounded bg-slate-100" />
                    </div>

                    <div className="mt-3 h-3 w-3/4 animate-pulse rounded bg-slate-100" />

                    <div className="mt-2 h-3 w-1/3 animate-pulse rounded bg-slate-100" />
                  </div>
                </div>
              ),
            )}
          </section>
        ) : groupedNotifications.length ===
          0 ? (
          /* =====================================================
             EMPTY STATE
             ===================================================== */
          <section className="relative overflow-hidden rounded-[32px] border border-white/80 bg-white/95 shadow-2xl shadow-slate-900/10 backdrop-blur-xl">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-100/60 blur-3xl" />

            <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-indigo-100/40 blur-3xl" />

            <div className="relative px-6 py-20 text-center sm:px-10 sm:py-28">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[26px] bg-slate-950 text-3xl text-white shadow-xl shadow-slate-950/20">
                🔔
              </div>

              <p className="mt-6 text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                Notifications zawe
              </p>

              <h2 className="mt-3 text-2xl font-black tracking-[-0.04em] text-slate-950 sm:text-3xl">
                Nta notifications ufite
              </h2>

              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500 sm:text-base">
                Iyo umuntu akwoherereje
                ubutumwa cyangwa hari ikindi
                gikorwa kigukorerwaho,
                amakuru azagaragara hano.
              </p>

              <Link
                to="/"
                className="mt-7 inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-6 py-3.5 text-sm font-bold text-white shadow-xl shadow-slate-950/15 transition hover:-translate-y-0.5 hover:bg-blue-600 hover:shadow-blue-600/20"
              >
                Reba listings
                <span>→</span>
              </Link>
            </div>
          </section>
        ) : (
          /* =====================================================
             NOTIFICATIONS LIST
             ===================================================== */
          <section className="overflow-hidden rounded-[30px] border border-white/80 bg-white/95 shadow-2xl shadow-slate-900/10 backdrop-blur-xl">
            {/* LIST HEADER */}
            <div className="border-b border-slate-100 bg-white/80 p-4 sm:p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="font-black tracking-[-0.02em] text-slate-950">
                    Amakuru yawe
                  </h2>

                  <p className="mt-1 text-xs text-slate-400">
                    Notifications za vuba aha
                  </p>
                </div>

                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={markAllAsRead}
                    className="inline-flex h-10 items-center justify-center rounded-xl bg-blue-50 px-4 text-sm font-bold text-blue-600 transition hover:bg-blue-100"
                  >
                    Soma zose
                  </button>
                )}
              </div>
            </div>

            <div>
              {groupedNotifications.map(
                (group, index) => {
                  const unread =
                    group.unreadCount > 0

                  const isLast =
                    index ===
                    groupedNotifications.length - 1

                  const notification =
                    group.latest

                  return (
                    <button
                      key={group.id}
                      type="button"
                      onClick={() =>
                        openNotificationGroup(
                          group,
                        )
                      }
                      className={`group relative w-full text-left transition duration-200 ${
                        !isLast
                          ? "border-b border-slate-100"
                          : ""
                      } ${
                        unread
                          ? "bg-blue-50/50"
                          : "bg-white"
                      } hover:bg-slate-50`}
                    >
                      {/* UNREAD BAR */}
                      {unread && (
                        <span className="absolute bottom-0 left-0 top-0 w-1 bg-blue-600" />
                      )}

                      <div className="flex gap-3 p-4 sm:gap-5 sm:p-5">
                        {/* ICON */}
                        <div className="relative shrink-0">
                          <div
                            className={`flex h-14 w-14 items-center justify-center rounded-[18px] text-xl transition duration-200 group-hover:scale-105 sm:h-16 sm:w-16 ${
                              unread
                                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {getNotificationIcon(
                              notification.type,
                            )}
                          </div>

                          {unread && (
                            <span className="absolute -right-0.5 -top-0.5 h-3.5 w-3.5 rounded-full border-[3px] border-white bg-blue-600" />
                          )}
                        </div>

                        {/* CONTENT */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <h3
                                  className={`text-sm sm:text-base ${
                                    unread
                                      ? "font-black text-slate-950"
                                      : "font-bold text-slate-800"
                                  }`}
                                >
                                  {notification.type ===
                                  "new_message"
                                    ? group.senderName
                                    : notification.title}
                                </h3>

                                <span
                                  className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${
                                    notification.type ===
                                    "new_message"
                                      ? "bg-blue-50 text-blue-600"
                                      : "bg-slate-100 text-slate-500"
                                  }`}
                                >
                                  {getNotificationLabel(
                                    notification.type,
                                  )}
                                </span>

                                {group.totalCount > 0 && (
                                  <span
                                    className={`rounded-full px-2.5 py-1 text-[11px] font-black ${
                                      unread
                                        ? "bg-blue-600 text-white"
                                        : "bg-slate-200 text-slate-600"
                                    }`}
                                  >
                                    +{group.totalCount}
                                  </span>
                                )}
                              </div>
                            </div>

                            <span
                              className={`shrink-0 text-[11px] font-semibold ${
                                unread
                                  ? "text-blue-600"
                                  : "text-slate-400"
                              }`}
                            >
                              {formatDate(
                                notification.created_at,
                              )}
                            </span>
                          </div>

                          {/* MESSAGE SUMMARY */}
                          {notification.type ===
                          "new_message" ? (
                            <div className="mt-2">
                              <p
                                className={`text-sm leading-6 ${
                                  unread
                                    ? "font-medium text-slate-700"
                                    : "text-slate-500"
                                }`}
                              >
                                Yakohereje ubutumwa
                              </p>

                              {group.totalCount > 1 && (
                                <p className="mt-1 text-xs font-semibold text-slate-400">
                                  Ubutumwa{" "}
                                  {group.totalCount}{" "}
                                  bushya
                                </p>
                              )}
                            </div>
                          ) : (
                            notification.body && (
                              <p
                                className={`mt-2 max-w-2xl text-sm leading-6 ${
                                  unread
                                    ? "font-medium text-slate-700"
                                    : "text-slate-500"
                                }`}
                              >
                                {notification.body}
                              </p>
                            )
                          )}

                          <div className="mt-3 flex items-center justify-between gap-3">
                            <span className="text-xs font-semibold text-slate-400">
                              {notification.type ===
                              "new_message"
                                ? "Kanda urebe ubutumwa"
                                : "Kanda urebe byinshi"}
                            </span>

                            <span className="translate-x-0 text-base text-slate-300 transition duration-200 group-hover:translate-x-1 group-hover:text-slate-500">
                              →
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>
                  )
                },
              )}
            </div>
          </section>
        )}

        {/* FOOTER HINT */}
        {groupedNotifications.length > 0 && (
          <div className="mt-5 flex items-center justify-center gap-2 text-xs font-medium text-slate-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Notifications zawe ziteguye
          </div>
        )}
      </main>
    </main>
  )
}

export default Notifications