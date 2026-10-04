import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { supabase } from "../services/supabase"

type ProfileData = {
  id: string
  full_name: string | null
  phone: string | null
  avatar_url: string | null
  role: string
  is_active: boolean
}

function Profile() {
  const [profile, setProfile] =
    useState<ProfileData | null>(null)

  const [fullName, setFullName] = useState("")
  const [phone, setPhone] = useState("")
  const [avatarUrl, setAvatarUrl] = useState("")

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    loadProfile()
  }, [])

  async function loadProfile() {
    setLoading(true)
    setError("")

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
        setError(
          "Ugomba kubanza kwinjira muri konti yawe."
        )
        return
      }

      const {
        data,
        error: profileError,
      } = await supabase
        .from("profiles")
        .select(
          "id, full_name, phone, avatar_url, role, is_active"
        )
        .eq("id", user.id)
        .maybeSingle()

      if (profileError) {
        setError(
          `Ntitwashoboye kubona profile yawe. ${profileError.message}`
        )
        return
      }

      if (!data) {
        setError("Profile yawe ntiyabonetse.")
        return
      }

      setProfile(data)
      setFullName(data.full_name ?? "")
      setPhone(data.phone ?? "")
      setAvatarUrl(data.avatar_url ?? "")
    } catch (error) {
      console.error("PROFILE LOAD ERROR:", error)

      setError(
        "Habaye ikibazo mu kubona amakuru ya profile yawe."
      )
    } finally {
      setLoading(false)
    }
  }

  async function handleSave(
    e: React.FormEvent
  ) {
    e.preventDefault()

    setSaving(true)
    setMessage("")
    setError("")

    try {
      if (!profile) {
        setError("Profile yawe ntiyabonetse.")
        return
      }

      const {
        data,
        error: updateError,
      } = await supabase
        .from("profiles")
        .update({
          full_name: fullName.trim() || null,
          phone: phone.trim() || null,
          avatar_url: avatarUrl.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", profile.id)
        .select(
          "id, full_name, phone, avatar_url, role, is_active"
        )
        .single()

      if (updateError) {
        setError(
          `Ntibyashobotse kubika profile. ${updateError.message}`
        )
        return
      }

      setProfile(data)
      setFullName(data.full_name ?? "")
      setPhone(data.phone ?? "")
      setAvatarUrl(data.avatar_url ?? "")

      setMessage(
        "Amakuru ya profile yawe yabitswe neza."
      )
    } catch (error) {
      console.error(
        "PROFILE UPDATE ERROR:",
        error
      )

      setError(
        "Habaye ikibazo mu kubika amakuru yawe."
      )
    } finally {
      setSaving(false)
    }
  }

  function getInitials(name: string) {
    const parts = name
      .trim()
      .split(/\s+/)
      .filter(Boolean)

    if (parts.length === 0) {
      return "U"
    }

    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase()
    }

    return (
      parts[0].charAt(0) +
      parts[parts.length - 1].charAt(0)
    ).toUpperCase()
  }

  function formatRole(role: string) {
    const normalized = role.toLowerCase()

    if (normalized === "buyer") {
      return "Umuguzi"
    }

    if (normalized === "seller") {
      return "Umucuruzi"
    }

    if (normalized === "admin") {
      return "Admin"
    }

    return role
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="flex min-h-screen items-center justify-center px-4">
          <div className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-950">
              <div className="h-7 w-7 animate-spin rounded-full border-4 border-white/20 border-t-white" />
            </div>

            <h2 className="mt-5 font-black text-slate-950">
              Turabona profile yawe...
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Tegereza akanya gato.
            </p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      {/* Header */}
      <header className="border-b border-white/10 bg-slate-950 text-white">
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

      {/* Hero */}
      <section className="relative overflow-hidden bg-slate-950 pb-20 pt-10 text-white sm:pt-14">
        <div className="absolute -left-24 top-0 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-slate-300">
              👤 Konti yanjye
            </div>

            <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
              Profile yawe
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
              Genzura kandi uhindure amakuru yawe
              bwite kuri KUGURISHA.COM.
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          {/* Profile summary */}
          <aside>
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="h-24 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950" />

              <div className="-mt-12 px-6 pb-6">
                <div className="flex items-end justify-between">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="Profile"
                      className="h-24 w-24 rounded-3xl border-4 border-white bg-slate-100 object-cover shadow-lg"
                      onError={(e) => {
                        e.currentTarget.style.display =
                          "none"
                      }}
                    />
                  ) : (
                    <div className="flex h-24 w-24 items-center justify-center rounded-3xl border-4 border-white bg-blue-600 text-3xl font-black text-white shadow-lg">
                      {getInitials(fullName)}
                    </div>
                  )}

                  <div
                    className={`mb-2 rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-wide ${
                      profile?.is_active
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {profile?.is_active
                      ? "Active"
                      : "Inactive"}
                  </div>
                </div>

                <div className="mt-5">
                  <h2 className="text-xl font-black text-slate-950">
                    {fullName || "Umukoresha"}
                  </h2>

                  <p className="mt-1 text-sm font-semibold text-slate-500">
                    {profile?.role
                      ? formatRole(profile.role)
                      : "Umukoresha"}
                  </p>
                </div>

                <div className="mt-6 space-y-3 border-t border-slate-100 pt-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100">
                      📱
                    </div>

                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                        Telefoni
                      </p>

                      <p className="truncate text-sm font-semibold text-slate-700">
                        {phone || "Ntabwo irashyirwaho"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100">
                      🛡️
                    </div>

                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                        Status
                      </p>

                      <p
                        className={`text-sm font-bold ${
                          profile?.is_active
                            ? "text-emerald-600"
                            : "text-red-600"
                        }`}
                      >
                        {profile?.is_active
                          ? "Konti irakora"
                          : "Konti yahagaritswe"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <Link
                    to="/dashboard"
                    className="flex w-full items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-50"
                  >
                    Dashboard →
                  </Link>
                </div>
              </div>
            </div>
          </aside>

          {/* Form */}
          <div>
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-5 py-5 sm:px-7">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">
                  Amakuru ya konti
                </p>

                <h2 className="mt-1 text-xl font-black text-slate-950 sm:text-2xl">
                  Hindura profile yawe
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Shyiramo amakuru ushaka ko agaragara
                  kuri konti yawe.
                </p>
              </div>

              <form
                onSubmit={handleSave}
                className="p-5 sm:p-7"
              >
                <div className="grid gap-6">
                  {/* Full name */}
                  <div>
                    <label className="mb-2 block text-sm font-black text-slate-800">
                      Amazina yuzuye
                    </label>

                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) =>
                        setFullName(e.target.value)
                      }
                      placeholder="Andika amazina yawe"
                      className="min-h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                    />

                    <p className="mt-2 text-xs text-slate-400">
                      Amazina azagaragara kuri profile
                      yawe.
                    </p>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="mb-2 block text-sm font-black text-slate-800">
                      Telefoni
                    </label>

                    <div className="relative">
                      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-base">
                        📱
                      </span>

                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) =>
                          setPhone(e.target.value)
                        }
                        placeholder="07XXXXXXXX"
                        autoComplete="tel"
                        className="min-h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 pl-11 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                      />
                    </div>
                  </div>

                  {/* Avatar */}
                  <div>
                    <label className="mb-2 block text-sm font-black text-slate-800">
                      Link y&apos;ifoto ya profile
                    </label>

                    <div className="relative">
                      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-base">
                        🖼️
                      </span>

                      <input
                        type="url"
                        value={avatarUrl}
                        onChange={(e) =>
                          setAvatarUrl(e.target.value)
                        }
                        placeholder="https://..."
                        className="min-h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 pl-11 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                      />
                    </div>

                    <p className="mt-2 text-xs leading-5 text-slate-400">
                      Ubu dukoresha image URL.
                      Upload y&apos;ifoto muri Supabase
                      Storage tuzayongeraho nyuma.
                    </p>
                  </div>

                  {/* Account status */}
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-start gap-3">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                          profile?.is_active
                            ? "bg-emerald-100"
                            : "bg-red-100"
                        }`}
                      >
                        {profile?.is_active
                          ? "✓"
                          : "!"}
                      </div>

                      <div>
                        <p className="text-sm font-black text-slate-800">
                          Status ya konti
                        </p>

                        <p
                          className={`mt-1 text-sm font-semibold ${
                            profile?.is_active
                              ? "text-emerald-600"
                              : "text-red-600"
                          }`}
                        >
                          {profile?.is_active
                            ? "Konti yawe irakora neza."
                            : "Konti yawe yahagaritswe."}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  {message && (
                    <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                        ✓
                      </div>

                      <div>
                        <p className="text-sm font-black text-emerald-900">
                          Byagenze neza
                        </p>

                        <p className="mt-1 text-sm text-emerald-700">
                          {message}
                        </p>
                      </div>
                    </div>
                  )}

                  {error && (
                    <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-700">
                        !
                      </div>

                      <div>
                        <p className="text-sm font-black text-red-900">
                          Habaye ikibazo
                        </p>

                        <p className="mt-1 text-sm text-red-700">
                          {error}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Save */}
                  <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">
                    <Link
                      to="/"
                      className="flex min-h-12 items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 text-sm font-black text-slate-700 transition hover:bg-slate-50"
                    >
                      Kureka
                    </Link>

                    <button
                      type="submit"
                      disabled={saving}
                      className="min-h-12 rounded-2xl bg-slate-950 px-7 text-sm font-black text-white shadow-lg shadow-slate-950/10 transition hover:bg-slate-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {saving
                        ? "Turabika..."
                        : "Bika amakuru"}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white">
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
    </main>
  )
}

export default Profile