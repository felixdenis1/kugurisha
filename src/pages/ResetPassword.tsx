import { useEffect, useMemo, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { supabase } from "../services/supabase"

/* ──────────────────────────────────────────────────────────────────────────
   ICON SYSTEM
   ────────────────────────────────────────────────────────────────────────── */
type IconProps = { className?: string }
const Icon = {
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
  X: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
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
  Key: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
    </svg>
  ),
  Refresh: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
    </svg>
  ),
  Mail: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
    </svg>
  ),
}

/* ──────────────────────────────────────────────────────────────────────────
   PASSWORD STRENGTH
   ────────────────────────────────────────────────────────────────────────── */
function getPasswordStrength(pw: string): { score: number; label: string; color: string; bar: string } {
  let score = 0
  if (pw.length >= 6) score++
  if (pw.length >= 10) score++
  if (/[A-Z]/.test(pw)) score++
  if (/\d/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++

  if (pw.length === 0) return { score: 0, label: "", color: "text-slate-500", bar: "bg-slate-600" }
  if (score <= 1) return { score: 1, label: "Ntoya", color: "text-rose-400", bar: "bg-rose-500" }
  if (score === 2) return { score: 2, label: "Iri hagati", color: "text-amber-400", bar: "bg-amber-500" }
  if (score === 3) return { score: 3, label: "Nini", color: "text-blue-400", bar: "bg-blue-500" }
  if (score === 4) return { score: 4, label: "Nini cyane", color: "text-emerald-400", bar: "bg-emerald-500" }
  return { score: 5, label: "Ikomeye cyane", color: "text-emerald-400", bar: "bg-gradient-to-r from-emerald-500 to-teal-500" }
}

/* ──────────────────────────────────────────────────────────────────────────
   COMPONENT
   ────────────────────────────────────────────────────────────────────────── */
function ResetPassword() {
  const navigate = useNavigate()

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [ready, setReady] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [focused, setFocused] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    async function checkRecoverySession() {
      const { data, error } = await supabase.auth.getSession()
      if (!mounted) return
      if (error) {
        setError("Link yo guhindura password ntibashoboye gufunguka.")
        setLoading(false)
        return
      }
      if (data.session) setReady(true)
      else setError("Link yo guhindura password ntiyemewe cyangwa yarangiye. Ongera usabe link nshya.")
      setLoading(false)
    }

    void checkRecoverySession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return
      if (event === "PASSWORD_RECOVERY" && session) {
        setReady(true)
        setLoading(false)
        setError("")
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  async function handleUpdatePassword(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setMessage("")

    if (password.length < 6) { setError("Password igomba kuba nibura inyuguti 6."); return }
    if (password !== confirmPassword) { setError("Password zombi zigomba kuba zimeze kimwe."); return }

    setUpdating(true)
    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) { setError(error.message); return }

      setMessage("Password yawe yahinduwe neza. Urongera winjire ukoresheje password nshya.")
      setPassword("")
      setConfirmPassword("")
      setTimeout(() => navigate("/login"), 2000)
    } catch (err) {
      console.error("RESET PASSWORD ERROR:", err)
      setError("Habaye ikibabo mu guhindura password.")
    } finally {
      setUpdating(false)
    }
  }

  const strength = useMemo(() => getPasswordStrength(password), [password])
  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword
  const showMismatch = confirmPassword.length > 0 && password !== confirmPassword
  const canSubmit = password.length >= 6 && password === confirmPassword && !updating

  /* ─────────── LOADING ─────────── */
  if (loading) {
    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#060f19] text-slate-100">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-1/2 top-1/2 h-[42rem] w-[42rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/25 blur-[140px]" />
          <div className="absolute -left-32 -top-32 h-[34rem] w-[34rem] rounded-full bg-indigo-500/25 blur-[120px]" />
          <div className="absolute -bottom-32 -right-32 h-[36rem] w-[36rem] rounded-full bg-cyan-400/20 blur-[130px]" />
          <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
        </div>
        <div className="relative w-full max-w-sm rounded-[2rem] border border-white/10 bg-white/[0.03] p-8 text-center shadow-[0_40px_100px_-30px_rgba(0,0,0,0.8)] backdrop-blur-2xl">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/15 text-blue-400">
            <span className="h-6 w-6 animate-spin rounded-full border-2 border-blue-400/30 border-t-blue-400" />
          </div>
          <h1 className="mt-6 text-xl font-black text-white">Turagenzura link yawe</h1>
          <p className="mt-2 text-sm leading-6 text-slate-400">Turimo kugenzura niba link yo guhindura password ikiri gukora.</p>
        </div>
      </main>
    )
  }

  /* ─────────── INVALID LINK ─────────── */
  if (!ready) {
    return (
      <main className="relative min-h-screen overflow-hidden bg-[#060f19] text-slate-100">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-1/2 top-1/2 h-[42rem] w-[42rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-rose-500/20 blur-[140px]" />
          <div className="absolute -left-32 -top-32 h-[34rem] w-[34rem] rounded-full bg-rose-600/15 blur-[120px]" />
          <div className="absolute -bottom-32 -right-32 h-[36rem] w-[36rem] rounded-full bg-amber-500/10 blur-[130px]" />
          <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
        </div>
        <div className="relative z-10 mx-auto flex min-h-screen max-w-md items-center justify-center px-4">
          <div className="w-full overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 shadow-[0_40px_100px_-30px_rgba(0,0,0,0.8)] backdrop-blur-2xl sm:p-8">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/15 text-rose-400">
              <Icon.Alert className="w-7 h-7" />
            </div>

            <h1 className="mt-6 text-2xl font-black tracking-tight text-white sm:text-3xl">
              Link ntiyemewe
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Link yo guhindura password ntiyemewe cyangwa yarangiye.
            </p>

            {error && (
              <div className="mt-5 flex items-start gap-2.5 rounded-xl border border-rose-500/25 bg-rose-500/10 p-3 text-xs font-semibold text-rose-300">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-rose-500/20 text-rose-400">
                  <Icon.Alert className="w-3.5 h-3.5" />
                </span>
                <p className="mt-1 leading-5">{error}</p>
              </div>
            )}

            <Link
              to="/forgot-password"
              className="group relative mt-6 flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-[#FF5D00] via-[#FF7424] to-[#e05200] text-sm font-black text-white shadow-[0_16px_38px_-10px_rgba(255,93,0,0.65)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_22px_45px_-10px_rgba(255,93,0,0.85)] active:scale-95"
            >
              <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              <Icon.Mail className="relative w-4 h-4" />
              <span className="relative">Ongera usabe link nshya</span>
              <Icon.ArrowRight className="relative w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </Link>

            <div className="mt-4 text-center">
              <Link to="/login" className="group inline-flex items-center gap-1.5 text-xs font-bold text-blue-400 transition hover:text-blue-300">
                <Icon.ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
                Subira kuri Login
              </Link>
            </div>
          </div>
        </div>
      </main>
    )
  }

  /* ─────────── MAIN FORM ─────────── */
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#060f19] text-slate-100">
      {/* Cinematic background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/2 h-[42rem] w-[42rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/25 blur-[140px]" />
        <div className="absolute -left-32 -top-32 h-[34rem] w-[34rem] rounded-full bg-indigo-500/25 blur-[120px]" />
        <div className="absolute -bottom-32 -right-32 h-[36rem] w-[36rem] rounded-full bg-cyan-400/20 blur-[130px]" />
        <div className="absolute right-[10%] top-[12%] h-[26rem] w-[26rem] rounded-full bg-blue-600/20 blur-[110px]" />
        <div className="absolute bottom-[8%] left-[12%] h-[24rem] w-[24rem] rounded-full bg-indigo-600/20 blur-[110px]" />
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
      </div>

      {/* Top nav */}
      <nav className="relative z-20 mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
        <Link to="/" className="group flex items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30 transition-transform group-hover:scale-105">
            <Icon.Tag className="w-4 h-4" />
          </span>
          <div>
            <p className="text-sm font-black tracking-tight text-white">
              KUGURISHA
              <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">.COM</span>
            </p>
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Isoko ryawe</p>
          </div>
        </Link>

        <span className="hidden items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-emerald-400 sm:inline-flex">
          <Icon.Shield className="w-3 h-3" />
          Secure Reset
        </span>
      </nav>

      {/* Main panel */}
      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-84px)] max-w-7xl items-center justify-center px-4 pb-10 sm:px-6 lg:px-8">
        <div className="w-full max-w-md overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.03] shadow-[0_40px_100px_-30px_rgba(0,0,0,0.8)] backdrop-blur-2xl">
          <section className="relative px-6 py-10 sm:px-10 sm:py-12">
            <div className="mx-auto w-full max-w-md">
              {/* Mobile brand */}
              <div className="mb-8 flex items-center justify-between sm:hidden">
                <Link to="/" className="group flex items-center gap-2.5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md">
                    <Icon.Tag className="w-4 h-4" />
                  </span>
                  <p className="text-sm font-black text-white">
                    KUGURISHA<span className="text-blue-400">.COM</span>
                  </p>
                </Link>
                <Link to="/login" className="text-xs font-bold text-slate-400 hover:text-white">
                  ← Login
                </Link>
              </div>

              {/* Header */}
              <div>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-blue-400 backdrop-blur">
                  <Icon.Key className="w-3 h-3" />
                  Password Recovery
                </div>

                <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
                  Password{" "}
                  <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                    nshya
                  </span>
                </h1>

                <p className="mt-2 text-sm font-medium text-slate-400">
                  Shyiramo password nshya ikomeye kugira urinde konti yawe.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleUpdatePassword} className="mt-6 space-y-4">
                {/* New password */}
                <div>
                  <label htmlFor="password" className="flex items-center justify-between text-xs font-black text-slate-300">
                    <span>Password nshya</span>
                    {password && (
                      <span className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-wider ${strength.color}`}>
                        <Icon.Bolt className="w-3 h-3" />
                        {strength.label}
                      </span>
                    )}
                  </label>
                  <div className="relative mt-2">
                    <span className={`pointer-events-none absolute inset-y-0 left-0 flex w-12 items-center justify-center transition-colors ${focused === "password" ? "text-blue-400" : "text-slate-500"}`}>
                      <Icon.Lock className="w-4 h-4" />
                    </span>
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setFocused("password")}
                      onBlur={() => setFocused(null)}
                      required
                      minLength={6}
                      placeholder="Andika password nshya"
                      autoComplete="new-password"
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

                  {/* Strength meter */}
                  {password && (
                    <div className="mt-2 flex gap-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <span
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                            i <= strength.score ? strength.bar : "bg-white/10"
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Confirm password */}
                <div>
                  <label htmlFor="confirmPassword" className="flex items-center justify-between text-xs font-black text-slate-300">
                    <span>Ongera wandike</span>
                    {confirmPassword && (
                      <span className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-wider ${passwordsMatch ? "text-emerald-400" : "text-rose-400"}`}>
                        {passwordsMatch ? <Icon.Check className="w-3 h-3" /> : <Icon.X className="w-3 h-3" />}
                        {passwordsMatch ? "Bihuye" : "Ntibihuye"}
                      </span>
                    )}
                  </label>
                  <div className="relative mt-2">
                    <span className={`pointer-events-none absolute inset-y-0 left-0 flex w-12 items-center justify-center transition-colors ${focused === "confirm" ? "text-blue-400" : "text-slate-500"}`}>
                      <Icon.Lock className="w-4 h-4" />
                    </span>
                    <input
                      id="confirmPassword"
                      type={showConfirm ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      onFocus={() => setFocused("confirm")}
                      onBlur={() => setFocused(null)}
                      required
                      minLength={6}
                      placeholder="Ongera wandike password"
                      autoComplete="new-password"
                      className={`h-12 w-full rounded-xl border bg-white/[0.04] pl-12 pr-12 text-sm font-medium text-white outline-none transition placeholder:text-slate-500 focus:bg-white/[0.06] focus:ring-4 ${
                        showMismatch
                          ? "border-rose-500/40 focus:border-rose-500/60 focus:ring-rose-500/15"
                          : "border-white/10 focus:border-blue-400/60 focus:ring-blue-500/15"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((p) => !p)}
                      aria-label={showConfirm ? "Hisha ijambo ry'ibanga" : "Erekana ijambo ry'ibanga"}
                      className="absolute inset-y-0 right-0 flex w-12 items-center justify-center rounded-r-xl text-slate-500 transition hover:text-blue-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-400"
                    >
                      {showConfirm ? <Icon.EyeOff className="w-4 h-4" /> : <Icon.Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Success */}
                {message && (
                  <div className="flex items-start gap-2.5 rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-3 text-xs font-semibold text-emerald-300">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                      <Icon.Check className="w-3.5 h-3.5" />
                    </span>
                    <p className="mt-1 leading-5">{message}</p>
                  </div>
                )}

                {/* Error */}
                {error && (
                  <div className="flex items-start gap-2.5 rounded-xl border border-rose-500/25 bg-rose-500/10 p-3 text-xs font-semibold text-rose-300">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-rose-500/20 text-rose-400">
                      <Icon.Alert className="w-3.5 h-3.5" />
                    </span>
                    <p className="mt-1 leading-5">{error}</p>
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={!canSubmit}
                  className="group relative flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-[#FF5D00] via-[#FF7424] to-[#e05200] text-sm font-black text-white shadow-[0_16px_38px_-10px_rgba(255,93,0,0.65)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_22px_45px_-10px_rgba(255,93,0,0.85)] active:scale-95 disabled:cursor-not-allowed disabled:from-slate-700 disabled:to-slate-700 disabled:shadow-none disabled:opacity-60"
                >
                  <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                  {updating ? (
                    <>
                      <span className="relative h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                      <span className="relative">Turahindura...</span>
                    </>
                  ) : (
                    <>
                      <Icon.Sparkles className="relative w-4 h-4" />
                      <span className="relative">Hindura password</span>
                      <Icon.ArrowRight className="relative w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                    </>
                  )}
                </button>
              </form>

              {/* Back to login */}
              <div className="mt-6 text-center">
                <Link to="/login" className="group inline-flex items-center gap-1.5 text-xs font-bold text-blue-400 transition hover:text-blue-300">
                  <Icon.ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
                  Subira kuri Login
                </Link>
              </div>

              {/* Trust footer */}
              <div className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 border-t border-white/5 pt-5 text-[10px] font-semibold text-slate-500">
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
    </main>
  )
}

export default ResetPassword