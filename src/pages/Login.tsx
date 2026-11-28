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
   AUTO-CHANGING SUBTITLE (Typewriter)
   ────────────────────────────────────────────────────────────────────────── */
function TypingSubtitle({ usingSavedAccount }: { usingSavedAccount: boolean }) {
  const phrases = usingSavedAccount 
    ? ["Twabibutse konti yawe. Injiza password gusa."]
    : [
        "Uzuza amakuru yawe kugira ukomeze.",
        "Injira urebe ibicuruzwa bishya kuri KUGURISHA.",
        "Gurisha ibintu byawe ubu, ubone amahirwe menshi.",
        "Ibyo ushaka byose ubibona hano, injira ubu."
      ]
  
  const [index, setIndex] = useState(0)
  const [subIndex, setSubIndex] = useState(0)
  const [reverse, setReverse] = useState(false)

  useEffect(() => {
    if (phrases.length === 1) {
      setSubIndex(phrases[0].length)
      return
    }

    if (subIndex === phrases[index].length + 1 && !reverse) {
      const timeout = setTimeout(() => setReverse(true), 2500)
      return () => clearTimeout(timeout)
    }
    if (subIndex === 0 && reverse) {
      setReverse(false)
      setIndex((prev) => (prev + 1) % phrases.length)
      return
    }
    const timeout = setTimeout(() => {
      setSubIndex((prev) => prev + (reverse ? -1 : 1))
    }, reverse ? 30 : 60)
    return () => clearTimeout(timeout)
  }, [subIndex, index, reverse, phrases])

  return (
    <p className="mt-2 text-sm font-medium text-slate-500 dark:text-slate-400 min-h-[40px]">
      {phrases[index].substring(0, subIndex)}
      <span className="inline-block w-1.5 h-4 ml-1 bg-[#FF5D00] animate-pulse align-middle rounded-full" />
    </p>
  )
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
    /* The Deep Gray Background matching your design */
    <main className="relative min-h-screen overflow-hidden bg-[#e2e8f0] dark:bg-[#0a1017] flex flex-col justify-center transition-colors duration-300">
      
      {/* High-end Studio Lighting Mesh */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-[600px] w-[600px] rounded-full bg-white/60 blur-[120px] dark:bg-white/5" />
        <div className="absolute -bottom-40 right-0 h-[500px] w-[500px] rounded-full bg-slate-400/40 blur-[140px] dark:bg-[#102436]/60" />
        <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#82c4e0]/20 blur-[100px] dark:bg-[#82c4e0]/10" />
      </div>

      {/* TOP NAV BAR (Light Mode Friendly) */}
      <nav className="absolute top-0 left-0 right-0 z-20 mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
        <Link to="/" className="flex items-center gap-2.5">
          <img src="/favicon.svg" alt="KUGURISHA" className="h-10 w-10 object-contain" />
        </Link>

        <div className="flex items-center gap-2">
          <span className="hidden items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 sm:inline-flex">
            <Icon.Shield className="w-3 h-3" />
            Umutekano
          </span>
          <Link
            to="/register"
            className="group inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-white/80 px-4 py-2 text-xs font-black text-slate-800 shadow-sm backdrop-blur-md transition hover:border-slate-400 hover:bg-white dark:border-white/15 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
          >
            Fungura konti
            <Icon.ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </nav>

      {/* MAIN LOGIN CARD (Matches your image perfectly) */}
      <div className="relative z-10 w-full px-4 pb-12 pt-24 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-[420px] overflow-hidden rounded-[2rem] bg-white p-8 shadow-2xl shadow-slate-300/50 dark:bg-[#132433] dark:shadow-black/50 sm:p-10 border border-slate-200/50 dark:border-white/5">
          
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-slate-300">
              <Icon.User className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              Injira muri Konti
            </h1>
            {/* The Dynamic Auto-changing Subtitle */}
            <TypingSubtitle usingSavedAccount={usingSavedAccount} />
          </div>

          {savedLogin && usingSavedAccount && (
            <div className="mb-6 flex items-center gap-2.5 rounded-xl border border-blue-500/20 bg-blue-50 p-2.5 dark:border-blue-500/30 dark:bg-blue-500/10">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-500 text-white shadow-sm">
                <Icon.User className="w-4 h-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[9px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400">Konti yabitswe</p>
                <p className="truncate text-xs font-bold text-slate-900 dark:text-white">{savedLogin.email}</p>
              </div>
              <button
                type="button"
                onClick={handleForgetSaved}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-rose-500/15 hover:text-rose-500"
              >
                <Icon.X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* FORM */}
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="email" className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">
                Email
              </label>
              <div className="relative">
                <span className={`pointer-events-none absolute inset-y-0 left-0 flex w-11 items-center justify-center transition-colors ${emailFocused ? "text-[#FF5D00]" : "text-slate-400"}`}>
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
                  placeholder="Email yawe"
                  className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#FF5D00] focus:bg-white focus:ring-4 focus:ring-[#FF5D00]/10 dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:border-[#FF5D00] dark:focus:bg-[#1a2d3e]"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label htmlFor="password" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Password
                </label>
                <Link to="/forgot-password" className="text-[11px] font-bold text-[#FF5D00] hover:underline">
                  Wibagiwe?
                </Link>
              </div>
              <div className="relative">
                <span className={`pointer-events-none absolute inset-y-0 left-0 flex w-11 items-center justify-center transition-colors ${passwordFocused ? "text-[#FF5D00]" : "text-slate-400"}`}>
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
                  placeholder="Password yawe"
                  className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-11 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#FF5D00] focus:bg-white focus:ring-4 focus:ring-[#FF5D00]/10 dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:border-[#FF5D00] dark:focus:bg-[#1a2d3e]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-slate-400 transition hover:text-[#FF5D00]"
                >
                  {showPassword ? <Icon.EyeOff className="w-4 h-4" /> : <Icon.Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember me */}
            <div className="flex items-center justify-between pt-1">
              <label className="group flex cursor-pointer items-center gap-2 select-none">
                <span className="relative inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="peer sr-only"
                  />
                  <span className="flex h-4 w-4 items-center justify-center rounded border border-slate-300 bg-white transition peer-checked:border-[#FF5D00] peer-checked:bg-[#FF5D00] dark:border-white/20 dark:bg-white/5">
                    <Icon.Check className={`w-2.5 h-2.5 text-white transition ${rememberMe ? "scale-100 opacity-100" : "scale-0 opacity-0"}`} />
                  </span>
                </span>
                <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                  Nibuke kuri iyi device
                </span>
              </label>
            </div>

            {/* Error */}
            {message && (
              <div className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-600 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-400">
                <Icon.Alert className="mt-0.5 w-4 h-4 shrink-0" />
                <p className="leading-5">{message}</p>
              </div>
            )}

            {/* Submit (The Big Orange Button from your image) */}
            <button
              type="submit"
              disabled={!canSubmit}
              className="group relative mt-2 flex h-14 w-full items-center justify-center gap-2 overflow-hidden rounded-full bg-[#FF5D00] text-base font-black text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#FF7424] hover:shadow-xl hover:shadow-[#FF5D00]/30 active:scale-95 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 disabled:shadow-none dark:disabled:bg-slate-800 dark:disabled:text-slate-500"
            >
              {loading ? (
                <>
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  <span>Turinjira...</span>
                </>
              ) : (
                <>
                  <span>Injira</span>
                </>
              )}
            </button>
          </form>

          {/* Divider / Register */}
          <div className="mt-8 text-center">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Ntabwo konti ufite?{" "}
              <Link to="/register" className="font-black text-[#FF5D00] hover:underline">
                Fungura ubu
              </Link>
            </p>
          </div>

        </div>
      </div>

      {/* Back link */}
      <div className="absolute bottom-6 left-0 right-0 z-10 text-center">
        <Link
          to="/"
          className="group inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
        >
          <Icon.ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
          Subira ku isoko
        </Link>
      </div>
    </main>
  )
}

export default Login