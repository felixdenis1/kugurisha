// src/pages/Profile.tsx

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

export default function Profile() {
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [email, setEmail] = useState("")

  const [fullName, setFullName] = useState("")
  const [phone, setPhone] = useState("")
  const [avatarUrl, setAvatarUrl] = useState("")

  // Security state
  const [newEmail, setNewEmail] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const [loading, setLoading] = useState(true)
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingEmail, setSavingEmail] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)

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
        setError("Ugomba kubanza kwinjira muri konti yawe.")
        return
      }

      setEmail(user.email ?? "")

      const {
        data,
        error: profileError,
      } = await supabase
        .from("profiles")
        .select("id, full_name, phone, avatar_url, role, is_active")
        .eq("id", user.id)
        .maybeSingle()

      if (profileError) {
        setError(`Ntitwashoboye kubona profile yawe. ${profileError.message}`)
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
    } catch (err) {
      console.error("PROFILE LOAD ERROR:", err)
      setError("Habaye ikibazo mu kubona amakuru ya profile yawe.")
    } finally {
      setLoading(false)
    }
  }

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault()
    setSavingProfile(true)
    setMessage("")
    setError("")

    try {
      if (!profile) {
        setError("Profile yawe ntiyabonetse.")
        return
      }

      const { data, error: updateError } = await supabase
        .from("profiles")
        .update({
          full_name: fullName.trim() || null,
          phone: phone.trim() || null,
          avatar_url: avatarUrl.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", profile.id)
        .select("id, full_name, phone, avatar_url, role, is_active")
        .single()

      if (updateError) {
        setError(`Ntibyashobotse kubika profile. ${updateError.message}`)
        return
      }

      setProfile(data)
      setFullName(data.full_name ?? "")
      setPhone(data.phone ?? "")
      setAvatarUrl(data.avatar_url ?? "")
      setMessage("Amakuru ya profile yawe yabitswe neza.")
    } catch (err) {
      console.error("PROFILE UPDATE ERROR:", err)
      setError("Habaye ikibazo mu kubika amakuru yawe.")
    } finally {
      setSavingProfile(false)
    }
  }

  async function handleUpdateEmail(e: React.FormEvent) {
    e.preventDefault()
    if (!newEmail.trim()) return

    setSavingEmail(true)
    setMessage("")
    setError("")

    try {
      const { error: emailError } = await supabase.auth.updateUser({
        email: newEmail.trim(),
      })

      if (emailError) {
        setError(`Ntibyashobotse guhindura email. ${emailError.message}`)
        return
      }

      setMessage("Email yahinduwe neza. Reba ubutumwa muri email yawe nshya kugira ngo uyemeze.")
      setEmail(newEmail.trim())
      setNewEmail("")
    } catch (err) {
      console.error("EMAIL UPDATE ERROR:", err)
      setError("Habaye ikibazo mu guhindura email.")
    } finally {
      setSavingEmail(false)
    }
  }

  async function handleUpdatePassword(e: React.FormEvent) {
    e.preventDefault()
    if (!newPassword || !confirmPassword) {
      setError("Ugomba kuzuza amagambo yombi y'ibanga.")
      return
    }

    if (newPassword !== confirmPassword) {
      setError("Amagambo y'ibanga yombi ntahuye.")
      return
    }

    if (newPassword.length < 6) {
      setError("Ijambo ry'ibanga rigomba kugira nibura inyuguti 6.")
      return
    }

    setSavingPassword(true)
    setMessage("")
    setError("")

    try {
      const { error: passwordError } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (passwordError) {
        setError(`Ntibyashobotse guhindura ijambo ry'ibanga. ${passwordError.message}`)
        return
      }

      setMessage("Ijambo ry'ibanga ryahinduwe neza.")
      setNewPassword("")
      setConfirmPassword("")
    } catch (err) {
      console.error("PASSWORD UPDATE ERROR:", err)
      setError("Habaye ikibazo mu guhindura ijambo ry'ibanga.")
    } finally {
      setSavingPassword(false)
    }
  }

  function getInitials(name: string) {
    const parts = name.trim().split(/\s+/).filter(Boolean)
    if (parts.length === 0) return "U"
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
  }

  function formatRole(role: string) {
    const normalized = role.toLowerCase()
    if (normalized === "buyer") return "Umuguzi"
    if (normalized === "seller") return "Umucuruzi"
    if (normalized === "admin") return "Admin"
    return role
  }

  if (loading) {
    return (
      <main className="min-h-screen kg-bg kg-text flex items-center justify-center">
        <div className="w-full max-w-sm rounded-[2rem] border border-slate-200/80 dark:border-white/15 bg-white/90 dark:bg-slate-900/80 p-8 text-center shadow-xl backdrop-blur-md">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#427c94] to-[#36677b] text-white shadow-md">
            <div className="h-7 w-7 animate-spin rounded-full border-4 border-white/20 border-t-white" />
          </div>
          <h2 className="mt-5 font-black text-slate-900 dark:text-white text-lg">
            Turabona profile yawe...
          </h2>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Tegereza akanya gato.
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen overflow-x-hidden kg-bg kg-text transition-colors duration-300">
      {/* VIVID GRADIENT BACKGROUND LAYER */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden select-none">
        <div className="absolute inset-0 bg-gradient-to-bl from-transparent via-white/40 to-white/95 dark:from-transparent dark:via-slate-950/50 dark:to-slate-950/95" />
      </div>

      {/* HEADER */}
      <header className="relative z-20 border-b border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" className="group flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#427c94] to-[#36677b] text-sm font-black text-white shadow-lg transition group-hover:scale-105">
              K
            </div>
            <div>
              <div className="text-lg font-black tracking-tight sm:text-xl bg-gradient-to-r from-slate-900 via-slate-800 to-[#427c94] dark:from-white dark:via-slate-100 dark:to-[#73afc9] bg-clip-text text-transparent">
                KUGURISHA.COM
              </div>
              <div className="hidden text-[10px] font-semibold uppercase tracking-[0.22em] text-[#427c94] dark:text-[#73afc9] sm:block">
                Isoko ryawe ryo mu Rwanda
              </div>
            </div>
          </Link>

          <Link
            to="/"
            className="rounded-xl border border-slate-200 dark:border-white/10 bg-white/50 dark:bg-white/5 px-4 py-2.5 text-sm font-bold text-slate-800 dark:text-white transition hover:bg-slate-100 dark:hover:bg-white/10 shadow-sm backdrop-blur-sm"
          >
            ← Ahabanza
          </Link>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative z-10 pb-16 pt-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#569ab5]/40 bg-[#569ab5]/10 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-[#427c94] dark:text-[#73afc9] shadow-sm backdrop-blur-sm">
          <span>👤 Konti yanjye</span>
        </div>
        <h1 className="text-4xl font-black tracking-tight sm:text-5xl text-slate-900 dark:text-white">
          Profile yawe
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-slate-300 font-medium">
          Genzura kandi uhindure amakuru yawe bwite, email, n'ijambo ry'ibanga kuri KUGURISHA.COM.
        </p>
      </section>

      {/* MAIN CONTENT GRID */}
      <section className="relative z-10 mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[340px_1fr]">
          
          {/* PROFILE SUMMARY SIDEBAR */}
          <aside>
            <div className="overflow-hidden rounded-[2.2rem] border border-slate-200/80 dark:border-white/15 bg-white/90 dark:bg-slate-900/80 shadow-xl backdrop-blur-md">
              <div className="h-28 bg-gradient-to-br from-[#427c94] via-[#569ab5] to-[#36677b]" />

              <div className="-mt-12 px-6 pb-7">
                <div className="flex items-end justify-between">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="Profile"
                      className="h-24 w-24 rounded-3xl border-4 border-white dark:border-slate-900 bg-slate-100 dark:bg-slate-800 object-cover shadow-xl"
                      onError={(e) => {
                        e.currentTarget.style.display = "none"
                      }}
                    />
                  ) : (
                    <div className="flex h-24 w-24 items-center justify-center rounded-3xl border-4 border-white dark:border-slate-900 bg-gradient-to-br from-[#427c94] to-[#36677b] text-3xl font-black text-white shadow-xl">
                      {getInitials(fullName)}
                    </div>
                  )}

                  <div
                    className={`mb-2 rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-wide shadow-sm ${
                      profile?.is_active
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300/50"
                        : "bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300 border border-red-300/50"
                    }`}
                  >
                    {profile?.is_active ? "Active" : "Inactive"}
                  </div>
                </div>

                <div className="mt-5">
                  <h2 className="text-xl font-black text-slate-900 dark:text-white truncate">
                    {fullName || "Umukoresha"}
                  </h2>
                  <p className="mt-1 text-xs font-bold text-[#427c94] dark:text-[#73afc9]">
                    {profile?.role ? formatRole(profile.role) : "Umukoresha"}
                  </p>
                </div>

                <div className="mt-6 space-y-4 border-t border-slate-200/60 dark:border-white/10 pt-5 text-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      ✉️
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">Email</p>
                      <p className="truncate text-xs font-bold text-slate-700 dark:text-slate-200">{email || "Ntabwo irimo"}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      📱
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">Telefoni</p>
                      <p className="truncate text-xs font-bold text-slate-700 dark:text-slate-200">{phone || "Ntabwo irashyirwaho"}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      🛡️
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">Status</p>
                      <p className={`text-xs font-bold ${profile?.is_active ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
                        {profile?.is_active ? "Konti irakora neza" : "Konti yahagaritswe"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-7">
                  <Link
                    to="/dashboard"
                    className="flex w-full items-center justify-center rounded-2xl border border-slate-200 dark:border-white/15 bg-white dark:bg-slate-800/80 px-4 py-3 text-sm font-black text-slate-800 dark:text-white transition hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm"
                  >
                    Dashboard →
                  </Link>
                </div>
              </div>
            </div>
          </aside>

          {/* EDIT FORMS CONTAINER */}
          <div className="space-y-8">
            
            {/* 1. GENERAL PROFILE FORM */}
            <div className="overflow-hidden rounded-[2.2rem] border border-slate-200/80 dark:border-white/15 bg-white/90 dark:bg-slate-900/80 shadow-xl backdrop-blur-md">
              <div className="border-b border-slate-200/60 dark:border-white/10 px-6 py-5 sm:px-8">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#427c94] dark:text-[#73afc9]">
                  Amakuru rusange
                </p>
                <h2 className="mt-1 text-xl font-black text-slate-900 dark:text-white sm:text-2xl">
                  Hindura profile yawe
                </h2>
              </div>

              <form onSubmit={handleSaveProfile} className="p-6 sm:p-8 space-y-6">
                <div>
                  <label className="mb-2 block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Amazina yuzuye
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Andika amazina yawe"
                    className="min-h-12 w-full rounded-2xl border border-slate-200 dark:border-white/15 bg-white dark:bg-slate-950/60 px-4 text-sm font-medium text-slate-900 dark:text-white outline-none transition placeholder:text-slate-400 hover:border-[#569ab5]/60 focus:border-[#569ab5] focus:ring-4 focus:ring-[#569ab5]/20"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Telefoni
                  </label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-base">📱</span>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="07XXXXXXXX"
                      className="min-h-12 w-full rounded-2xl border border-slate-200 dark:border-white/15 bg-white dark:bg-slate-950/60 px-4 pl-11 text-sm font-medium text-slate-900 dark:text-white outline-none transition placeholder:text-slate-400 hover:border-[#569ab5]/60 focus:border-[#569ab5] focus:ring-4 focus:ring-[#569ab5]/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Link y&apos;ifoto ya profile (Avatar URL)
                  </label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-base">🖼️</span>
                    <input
                      type="url"
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                      placeholder="https://..."
                      className="min-h-12 w-full rounded-2xl border border-slate-200 dark:border-white/15 bg-white dark:bg-slate-950/60 px-4 pl-11 text-sm font-medium text-slate-900 dark:text-white outline-none transition placeholder:text-slate-400 hover:border-[#569ab5]/60 focus:border-[#569ab5] focus:ring-4 focus:ring-[#569ab5]/20"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="min-h-12 rounded-2xl bg-gradient-to-r from-[#427c94] via-[#569ab5] to-[#36677b] px-7 text-sm font-black text-white shadow-lg shadow-[#569ab5]/30 transition hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
                  >
                    {savingProfile ? "Turabika..." : "Bika amakuru ya profile"}
                  </button>
                </div>
              </form>
            </div>

            {/* 2. CHANGE EMAIL FORM */}
            <div className="overflow-hidden rounded-[2.2rem] border border-slate-200/80 dark:border-white/15 bg-white/90 dark:bg-slate-900/80 shadow-xl backdrop-blur-md">
              <div className="border-b border-slate-200/60 dark:border-white/10 px-6 py-5 sm:px-8">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#427c94] dark:text-[#73afc9]">
                  Umutekano wa Konti
                </p>
                <h2 className="mt-1 text-xl font-black text-slate-900 dark:text-white sm:text-2xl">
                  Hindura Email
                </h2>
              </div>

              <form onSubmit={handleUpdateEmail} className="p-6 sm:p-8 space-y-6">
                <div>
                  <label className="mb-2 block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Email nshya
                  </label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-base">✉️</span>
                    <input
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="andika.email@example.com"
                      className="min-h-12 w-full rounded-2xl border border-slate-200 dark:border-white/15 bg-white dark:bg-slate-950/60 px-4 pl-11 text-sm font-medium text-slate-900 dark:text-white outline-none transition placeholder:text-slate-400 hover:border-[#569ab5]/60 focus:border-[#569ab5] focus:ring-4 focus:ring-[#569ab5]/20"
                    />
                  </div>
                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                    Uzamenyeshwa cyangwa usabwe kwemeza email nshya.
                  </p>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={savingEmail || !newEmail.trim()}
                    className="min-h-12 rounded-2xl bg-slate-950 dark:bg-slate-800 px-7 text-sm font-black text-white shadow-lg transition hover:bg-slate-800 dark:hover:bg-slate-700 active:scale-[0.98] disabled:opacity-50"
                  >
                    {savingEmail ? "Birimo koherezwa..." : "Hindura Email"}
                  </button>
                </div>
              </form>
            </div>

            {/* 3. CHANGE PASSWORD FORM */}
            <div className="overflow-hidden rounded-[2.2rem] border border-slate-200/80 dark:border-white/15 bg-white/90 dark:bg-slate-900/80 shadow-xl backdrop-blur-md">
              <div className="border-b border-slate-200/60 dark:border-white/10 px-6 py-5 sm:px-8">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#427c94] dark:text-[#73afc9]">
                  Ijambo ry&apos;ibanga
                </p>
                <h2 className="mt-1 text-xl font-black text-slate-900 dark:text-white sm:text-2xl">
                  Hindura ijambo ry&apos;ibanga (Password)
                </h2>
              </div>

              <form onSubmit={handleUpdatePassword} className="p-6 sm:p-8 space-y-6">
                <div>
                  <label className="mb-2 block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Ijambo ry&apos;ibanga rishya
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="min-h-12 w-full rounded-2xl border border-slate-200 dark:border-white/15 bg-white dark:bg-slate-950/60 px-4 text-sm font-medium text-slate-900 dark:text-white outline-none transition placeholder:text-slate-400 hover:border-[#569ab5]/60 focus:border-[#569ab5] focus:ring-4 focus:ring-[#569ab5]/20"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Wemeze ijambo ry&apos;ibanga rishya
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="min-h-12 w-full rounded-2xl border border-slate-200 dark:border-white/15 bg-white dark:bg-slate-950/60 px-4 text-sm font-medium text-slate-900 dark:text-white outline-none transition placeholder:text-slate-400 hover:border-[#569ab5]/60 focus:border-[#569ab5] focus:ring-4 focus:ring-[#569ab5]/20"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={savingPassword || !newPassword || !confirmPassword}
                    className="min-h-12 rounded-2xl bg-slate-950 dark:bg-slate-800 px-7 text-sm font-black text-white shadow-lg transition hover:bg-slate-800 dark:hover:bg-slate-700 active:scale-[0.98] disabled:opacity-50"
                  >
                    {savingPassword ? "Birimo guhinduka..." : "Hindura Password"}
                  </button>
                </div>
              </form>
            </div>

            {/* STATUS NOTIFICATIONS */}
            {message && (
              <div className="flex items-start gap-3 rounded-2xl border border-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 p-4 shadow-sm backdrop-blur-sm">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 font-bold">✓</div>
                <div>
                  <p className="text-sm font-black text-emerald-900 dark:text-emerald-200">Byagenze neza</p>
                  <p className="mt-1 text-xs text-emerald-700 dark:text-emerald-300">{message}</p>
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-start gap-3 rounded-2xl border border-red-300 bg-red-50 dark:bg-red-950/40 p-4 shadow-sm backdrop-blur-sm">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 font-bold">!</div>
                <div>
                  <p className="text-sm font-black text-red-900 dark:text-red-200">Habaye ikibazo</p>
                  <p className="mt-1 text-xs text-red-700 dark:text-red-300">{error}</p>
                </div>
              </div>
            )}

          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 border-t border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div>
            <p className="font-black text-slate-900 dark:text-white">KUGURISHA.COM</p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Isoko ryawe ryo mu Rwanda 🇷🇼</p>
          </div>
          <Link to="/" className="text-sm font-bold text-slate-600 dark:text-slate-300 transition hover:text-[#427c94] dark:hover:text-[#73afc9]">
            Ahabanza →
          </Link>
        </div>
      </footer>
    </main>
  )
}