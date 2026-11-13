import { useState } from "react"
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
  Key: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
    </svg>
  ),
  Inbox: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M2.25 13.5h3.86a2.25 2.25 0 012.012 1.244l.256.512a2.25 2.25 0 002.013 1.244h3.218a2.25 2.25 0 002.013-1.244l.256-.512a2.25 2.25 0 012.013-1.244h3.859m-19.5.338V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 00-2.15-1.588H6.911a2.25 2.25 0 00-2.15 1.588L2.35 13.177a2.25 2.25 0 00-.1.661z" />
    </svg>
  ),
  Refresh: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
    </svg>
  ),
}

/* ──────────────────────────────────────────────────────────────────────────
   COMPONENT
   ────────────────────────────────────────────────────────────────────────── */
function ForgotPassword() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [focused, setFocused] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleResetRequest(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMessage("")
    setError("")

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) {
        setError(error.message)
        return
      }

      setMessage(
        "Niba iyi email iri muri KUGURISHA.COM, twohereje link yo guhindura password. Reba email yawe."
      )
      setSent(true)
    } catch (err) {
      console.error("FORGOT PASSWORD ERROR:", err)
      setError("Habaye ikibazo. Ongera ugerageze.")
    } finally {
      setLoading(false)
    }
  }

  function resetFlow() {
    setSent(false)
    setMessage("")
    setError("")
    setEmail("")
  }

  const isEmailValid = email.includes("@") && email.includes(".")
  const canSubmit = isEmailValid && !loading

  /* ═══════════════ SUCCESS STATE ═══════════════ */
  if (sent) {
    return (
      <main className="relative min-h-screen overflow-hidden bg-[#060f19] text-slate-100">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-1/2 top-1/2 h-[42rem] w-[42rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/20 blur-[140px]" />
          <div className="absolute -left-32 -top-32 h-[34rem] w-[34rem] rounded-full bg-blue-500/20 blur-[120px]" />
          <div className="absolute -bottom-32 -right-32 h-[36rem] w-[36rem] rounded-full bg-indigo-500/15 blur-[130px]" />
          <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
        </div>

        <div className="relative z-10 mx-auto flex min-h-screen max-w-md items-center justify-center px-4">
          <div className="w-full overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 shadow-[0_40px_100px_-30px_rgba(0,0,0,0.8)] backdrop-blur-2xl sm:p-8">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-400">
              <Icon.Inbox className="w-8 h-8" />
            </div>

            <h1 className="mt-6 text-2xl font-black tracking-tight text-white sm:text-3xl">
              Reba email yawe
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-400">{message}</p>

            <div className="mt-5 flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] p-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.06] text-slate-400">
                <Icon.Mail className="w-3.5 h-3.5" />
              </span>
              <p className="truncate text-xs font-bold text-white">{email}</p>
            </div>

            <div className="mt-5 space-y-2 rounded-xl border border-white/10 bg-white/[0.02] p-3.5">
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">Inama</p>
              <ul className="space-y-1.5 text-[11px] font-medium text-slate-400">
                <li className="flex items-start gap-1.5">
                  <Icon.Check className="w-3 h-3 mt-0.5 shrink-0 text-emerald-500" />
                  Reba mu spam cyangwa trash niba utabonye
                </li>
                <li className="flex items-start gap-1.5">
                  <Icon.Check className="w-3 h-3 mt-0.5 shrink-0 text-emerald-500" />
                  Link izakora iminsi ibiri gusa
                </li>
                <li className="flex items-start gap-1.5">
                  <Icon.Check className="w-3 h-3 mt-0.5 shrink-0 text-emerald-500" />
                  Koresha email ngiro wakoresheje
                </li>
              </ul>
            </div>

            <button
              type="button"
              onClick={resetFlow}
              className="group mt-5 flex w-full items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] py-2.5 text-xs font-bold text-slate-300 transition hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
            >
              <Icon.Refresh className="w-3.5 h-3.5" />
              Ongera ohereze kuri email indi
            </button>

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

  /* ═══════════════ FORM STATE ═══════════════ */
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
                  Wibagiwe{" "}
                  <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                    password?
                  </span>
                </h1>

                <p className="mt-2 text-sm font-medium text-slate-400">
                  Andika email ukoresha kuri konti yawe. Niba iri muri system, turakohereza link yo guhindura password.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleResetRequest} className="mt-6 space-y-4">
                <div>
                  <label htmlFor="email" className="flex items-center justify-between text-xs font-black text-slate-300">
                    <span>Email yawe</span>
                    {email && (
                      <span className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-wider ${isEmailValid ? "text-emerald-400" : "text-amber-400"}`}>
                        {isEmailValid ? <Icon.Check className="w-3 h-3" /> : <Icon.Alert className="w-3 h-3" />}
                        {isEmailValid ? "Byiza" : "Si email"}
                      </span>
                    )}
                  </label>
                  <div className="relative mt-2">
                    <span className={`pointer-events-none absolute inset-y-0 left-0 flex w-12 items-center justify-center transition-colors ${focused ? "text-blue-400" : "text-slate-500"}`}>
                      <Icon.Mail className="w-4 h-4" />
                    </span>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onFocus={() => setFocused(true)}
                      onBlur={() => setFocused(false)}
                      required
                      placeholder="Andika email yawe"
                      autoComplete="email"
                      className="h-12 w-full rounded-xl border border-white/10 bg-white/[0.04] pl-12 pr-4 text-sm font-medium text-white outline-none transition placeholder:text-slate-500 focus:border-blue-400/60 focus:bg-white/[0.06] focus:ring-4 focus:ring-blue-500/15"
                    />
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
                  {loading ? (
                    <>
                      <span className="relative h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                      <span className="relative">Turategereza...</span>
                    </>
                  ) : (
                    <>
                      <Icon.Sparkles className="relative w-4 h-4" />
                      <span className="relative">Ohereza link</span>
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

export default ForgotPassword