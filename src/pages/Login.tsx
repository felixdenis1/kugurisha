import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { supabase } from "../services/supabase"

/* ──────────────────────────────────────────────────────────────────────────
   ICON SYSTEM
   ────────────────────────────────────────────────────────────────────────── */
type IconProps = { className?: string }
const Icon = {
  Mail: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
    </svg>
  ),
  Lock: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
    </svg>
  ),
  Eye: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  EyeOff: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
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
  Alert: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
    </svg>
  ),
  Check: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.4} d="M4.5 12.75l6 6 9-13.5" />
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
  Sparkles: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
    </svg>
  ),
  Tag: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
    </svg>
  ),
  User: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  ),
  X: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
}

/* ──────────────────────────────────────────────────────────────────────────
   STORAGE HELPERS
   ────────────────────────────────────────────────────────────────────────── */
const STORAGE_KEY = "kugurisha_saved_login"

type SavedLogin = {
  email: string
  savedAt: string
}

function readSavedLogin(): SavedLogin | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as SavedLogin
    if (typeof parsed.email !== "string") return null
    return parsed
  } catch {
    return null
  }
}

function writeSavedLogin(email: string) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ email, savedAt: new Date().toISOString() })
    )
  } catch (err) {
    console.warn("Could not save login:", err)
  }
}

function clearSavedLogin() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (err) {
    console.warn("Could not clear saved login:", err)
  }
}

/* ──────────────────────────────────────────────────────────────────────────
   COMPONENT
   ────────────────────────────────────────────────────────────────────────── */
function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [emailFocused, setEmailFocused] = useState(false)
  const [passwordFocused, setPasswordFocused] = useState(false)
  const [savedLogin, setSavedLogin] = useState<SavedLogin | null>(null)
  const [usingSavedAccount, setUsingSavedAccount] = useState(false)

  /* ── Restore saved login on mount ── */
  useEffect(() => {
    const saved = readSavedLogin()
    if (saved) {
      setSavedLogin(saved)
      setEmail(saved.email)
      setUsingSavedAccount(true)
    }
  }, [])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMessage("")

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (error) {
        setMessage(error.message)
        return
      }

      const user = data.user
      if (!user) {
        setMessage("Ntibyashobotse kubona amakuru ya konti.")
        return
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id, role, is_active")
        .eq("id", user.id)
        .maybeSingle()

      if (profileError) {
        setMessage(`Ntitwashoboye kubona profile yawe. ${profileError.message}`)
        return
      }

      if (!profile) {
        setMessage(`Profile y'uyu mukoresha ntiyabonetse. User ID: ${user.id}`)
        return
      }

      if (profile.is_active === false) {
        await supabase.auth.signOut()
        setMessage("Iyi konti yahagaritswe. Hamagara admin.")
        return
      }

      // Save / clear remembered login depending on toggle
      if (rememberMe) {
        writeSavedLogin(email.trim())
      } else {
        clearSavedLogin()
      }

      if (profile.role === "admin") {
        window.location.href = "/admin"
        return
      }

      window.location.href = "/"
    } catch (error) {
      console.error("LOGIN UNEXPECTED ERROR:", error)
      setMessage(
        error instanceof Error
          ? error.message
          : "Habaye ikibazo mu gihe cyo kwinjira."
      )
    } finally {
      setLoading(false)
    }
  }

  function handleForgetSaved() {
    clearSavedLogin()
    setSavedLogin(null)
    setUsingSavedAccount(false)
    setEmail("")
    setPassword("")
  }

  const isEmailValid = email.includes("@") && email.includes(".")
  const isPasswordValid = password.length >= 6
  const canSubmit = isEmailValid && isPasswordValid && !loading

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#060f19] text-slate-100">
      {/* ═══════════════ CINEMATIC BACKGROUND ═══════════════ */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/2 h-[42rem] w-[42rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/25 blur-[140px]" />
        <div className="absolute -left-32 -top-32 h-[34rem] w-[34rem] rounded-full bg-indigo-500/25 blur-[120px]" />
        <div className="absolute -bottom-32 -right-32 h-[36rem] w-[36rem] rounded-full bg-cyan-400/20 blur-[130px]" />
        <div className="absolute right-[10%] top-[12%] h-[26rem] w-[26rem] rounded-full bg-blue-600/20 blur-[110px]" />
        <div className="absolute bottom-[8%] left-[12%] h-[24rem] w-[24rem] rounded-full bg-indigo-600/20 blur-[110px]" />
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
      </div>

      {/* ═══════════════ TOP NAV BAR ═══════════════ */}
      <nav className="relative z-20 mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
        <Link to="/" className="group flex items-center gap-2.5">
          
          
        </Link>

        <div className="flex items-center gap-2">
          <span className="hidden items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-emerald-400 sm:inline-flex">
            <Icon.Shield className="w-3 h-3" />
            Secure
          </span>
          <Link
            to="/register"
            className="group inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-black text-white backdrop-blur-md transition hover:border-white/30 hover:bg-white/10"
          >
            Fungura konti
            <Icon.ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </nav>

      {/* ═══════════════ MAIN PANEL ═══════════════ */}
      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-84px)] max-w-7xl items-center justify-center px-4 pb-10 sm:px-6 lg:px-8">
        <div className="w-full max-w-md overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.03] shadow-[0_40px_100px_-30px_rgba(0,0,0,0.8)] backdrop-blur-2xl">
          <section className="relative px-6 py-10 sm:px-10 sm:py-12">
            <div className="mx-auto w-full max-w-md">
              {/* Mobile brand */}
              <div className="mb-8 flex items-center justify-between sm:hidden">
                <Link to="/" className="group flex items-center gap-2.5">
                
                </Link>
                <Link to="/" className="text-xs font-bold text-slate-400 hover:text-white">
                  ← Ahabanza
                </Link>
              </div>

              {/* Header */}
              <div>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-blue-400 backdrop-blur">
                  <Icon.Sparkles className="w-3 h-3" />
                  Murakaza neza
                </div>

                <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
                  Injira muri{" "}
                  <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                    konti yawe
                  </span>
                </h1>

                <p className="mt-2 text-sm font-medium text-slate-400">
                  {usingSavedAccount
                    ? "Twabibutse konti yawe. Injiza password gusa."
                    : "Uzuza amakuru yawe kugira ukomeze."}
                </p>
              </div>

              {/* Saved account chip */}
              {savedLogin && usingSavedAccount && (
                <div className="mt-5 flex items-center gap-2.5 rounded-xl border border-blue-500/25 bg-blue-500/[0.06] p-2.5">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md">
                    <Icon.User className="w-4 h-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[9px] font-black uppercase tracking-wider text-blue-400">Konti yabitswe</p>
                    <p className="truncate text-xs font-bold text-white">{savedLogin.email}</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleForgetSaved}
                    aria-label="Kuraho konti yabitswe"
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-rose-500/15 hover:text-rose-400"
                  >
                    <Icon.X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* ═════════ FORM ═════════ */}
              <form onSubmit={handleLogin} className="mt-6 space-y-4">
                {/* Email */}
                <div>
                  <label htmlFor="email" className="flex items-center justify-between text-xs font-black text-slate-300">
                    <span>Email</span>
                    {email && (
                      <span className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-wider ${isEmailValid ? "text-emerald-400" : "text-amber-400"}`}>
                        {isEmailValid ? <Icon.Check className="w-3 h-3" /> : <Icon.Alert className="w-3 h-3" />}
                        {isEmailValid ? "Byiza" : "Si email"}
                      </span>
                    )}
                  </label>
                  <div className="relative mt-2">
                    <span className={`pointer-events-none absolute inset-y-0 left-0 flex w-12 items-center justify-center transition-colors ${emailFocused ? "text-blue-400" : "text-slate-500"}`}>
                      <Icon.Mail className="w-4 h-4" />
                    </span>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onFocus={() => setEmailFocused(true)}
                      onBlur={() => setEmailFocused(false)}
                      required
                      placeholder="Andika email yawe"
                      autoComplete="email"
                      className="h-12 w-full rounded-xl border border-white/10 bg-white/[0.04] pl-12 pr-4 text-sm font-medium text-white outline-none transition placeholder:text-slate-500 focus:border-blue-400/60 focus:bg-white/[0.06] focus:ring-4 focus:ring-blue-500/15"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <div className="flex items-center justify-between">
                    <label htmlFor="password" className="flex items-center gap-1.5 text-xs font-black text-slate-300">
                      <span>Password</span>
                      {password && (
                        <span className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-wider ${isPasswordValid ? "text-emerald-400" : "text-amber-400"}`}>
                          {isPasswordValid ? <Icon.Check className="w-3 h-3" /> : <Icon.Alert className="w-3 h-3" />}
                          {isPasswordValid ? "Byiza" : "Nibura 6"}
                        </span>
                      )}
                    </label>
                    <Link
                      to="/forgot-password"
                      className="text-[11px] font-bold text-blue-400 transition hover:text-blue-300 hover:underline"
                    >
                      Wibagiwe?
                    </Link>
                  </div>
                  <div className="relative mt-2">
                    <span className={`pointer-events-none absolute inset-y-0 left-0 flex w-12 items-center justify-center transition-colors ${passwordFocused ? "text-blue-400" : "text-slate-500"}`}>
                      <Icon.Lock className="w-4 h-4" />
                    </span>
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setPasswordFocused(true)}
                      onBlur={() => setPasswordFocused(false)}
                      required
                      placeholder="Andika password yawe"
                      autoComplete="current-password"
                      className="h-12 w-full rounded-xl border border-white/10 bg-white/[0.04] pl-12 pr-12 text-sm font-medium text-white outline-none transition placeholder:text-slate-500 focus:border-blue-400/60 focus:bg-white/[0.06] focus:ring-4 focus:ring-blue-500/15"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((p) => !p)}
                      aria-label={showPassword ? "Hisha ijambo ry'ibanga" : "Erekana ijambo ry'ibanga"}
                      className="absolute inset-y-0 right-0 flex w-12 items-center justify-center rounded-r-xl text-slate-500 transition hover:text-blue-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-400"
                    >
                      {showPassword ? <Icon.EyeOff className="w-4 h-4" /> : <Icon.Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember me */}
                <div className="flex items-center justify-between">
                  <label className="group flex cursor-pointer items-center gap-2 select-none">
                    <span className="relative inline-flex items-center">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="peer sr-only"
                      />
                      <span className="flex h-5 w-5 items-center justify-center rounded-md border border-white/15 bg-white/[0.04] transition peer-checked:border-[#FF5D00] peer-checked:bg-[#FF5D00] peer-focus-visible:ring-2 peer-focus-visible:ring-[#FF5D00]/40">
                        <Icon.Check className={`w-3 h-3 text-white transition ${rememberMe ? "scale-100 opacity-100" : "scale-0 opacity-0"}`} />
                      </span>
                    </span>
                    <span className="text-[11px] font-bold text-slate-300 transition group-hover:text-white">
                      Nibuke kuri iyi device
                    </span>
                  </label>
                </div>

                {/* Error */}
                {message && (
                  <div className="flex items-start gap-2.5 rounded-xl border border-rose-500/25 bg-rose-500/10 p-3 text-xs font-semibold text-rose-300">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-rose-500/20 text-rose-400">
                      <Icon.Alert className="w-3.5 h-3.5" />
                    </span>
                    <p className="mt-1 leading-5">{message}</p>
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={!canSubmit}
                  className="group relative flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-[#FF5D00] via-[#FF7424] to-[#e05200] text-sm font-black text-white shadow-[0_16px_38px_-10px_rgba(255,93,0,0.65)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_22px_45px_-10px_rgba(255,93,0,0.85)] active:scale-95 disabled:cursor-not-allowed disabled:from-slate-700 disabled:to-slate-700 disabled:shadow-none disabled:opacity-60"
                >
                  <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                  {loading ? (
                    <>
                      <span className="relative h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                      <span className="relative">Turinjira...</span>
                    </>
                  ) : (
                    <>
                      <span className="relative">Injira muri konti</span>
                      <Icon.ArrowRight className="relative w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                    </>
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="my-6 flex items-center gap-3">
                <div className="h-px flex-1 bg-white/10" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">cyangwa</span>
                <div className="h-px flex-1 bg-white/10" />
              </div>

              {/* Register */}
              <div className="text-center">
                <p className="text-xs font-semibold text-slate-400">Ntabwo konti ufite?</p>
                <Link
                  to="/register"
                  className="group mt-2 inline-flex items-center gap-1.5 text-sm font-black text-blue-400 transition hover:text-blue-300"
                >
                  Fungura konti nshya
                  <Icon.ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>

              {/* Trust footer */}
              <div className="mt-8 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 border-t border-white/5 pt-5 text-[10px] font-semibold text-slate-500">
                <span className="flex items-center gap-1">
                  <Icon.Shield className="w-3 h-3 text-emerald-500" />
                  Umutekano wuzuye
                </span>
                <span className="flex items-center gap-1">
                  <Icon.Bolt className="w-3 h-3 text-blue-400" />
                  Byihuse
                </span>
                <span className="flex items-center gap-1">
                  <Icon.Check className="w-3 h-3 text-emerald-500" />
                  Byizewe
                </span>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Back link (desktop) */}
      <div className="relative z-10 mx-auto mb-6 max-w-7xl px-5 text-center sm:px-8">
        <Link
          to="/"
          className="group inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 transition hover:text-white"
        >
          <Icon.ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
          Subira ku isoko
        </Link>
      </div>
    </main>
  )
}

export default Login