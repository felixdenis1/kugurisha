import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { supabase } from "../services/supabase"

/* ──────────────────────────────────────────────────────────────────────────
   ICON SYSTEM
   ────────────────────────────────────────────────────────────────────────── */
type IconProps = { className?: string }
const Icon = {
  User: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  ),
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
  ShoppingCart: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
    </svg>
  ),
  Store: ({ className = "w-4 h-4" }: IconProps) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" />
    </svg>
  ),
}

/* ──────────────────────────────────────────────────────────────────────────
   AUTO-CHANGING SUBTITLE (Typewriter)
   ────────────────────────────────────────────────────────────────────────── */
function TypingSubtitle() {
  const phrases = [
    "Uzuza amakuru make hanyuma utangire gukoresha KUGURISHA.COM.",
    "Fungura konti yawe ubu, utangire kugura cyangwa kugurisha.",
    "Injira mu isoko rinini ry'abanyarwanda, ubone amahirwe menshi.",
    "Byoroshye, byihuse kandi ni ubuntu. Tangira ubu."
  ]
  
  const [index, setIndex] = useState(0)
  const [subIndex, setSubIndex] = useState(0)
  const [reverse, setReverse] = useState(false)

  useEffect(() => {
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
function Register() {
  const navigate = useNavigate()
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [role, setRole] = useState<"buyer" | "seller">("buyer")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [success, setSuccess] = useState(false)
  const [focused, setFocused] = useState<string | null>(null)

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMessage("")
    setSuccess(false)

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { full_name: fullName.trim(), role },
      },
    })

    if (error) {
      setMessage(error.message)
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)

    if (data.session) {
      setMessage("Konti yakozwe neza! Turimo kukujyana ahatangirira...")
      setTimeout(() => navigate("/"), 1000)
    } else {
      setMessage("Konti yakozwe neza. Reba email yawe niba verification isabwa.")
    }
  }

  const isNameValid = fullName.trim().length >= 2
  const isEmailValid = email.includes("@") && email.includes(".")
  const isPasswordValid = password.length >= 6
  const canSubmit = isNameValid && isEmailValid && isPasswordValid && !loading

  return (
    /* The Deep Gray Background matching your design */
    <main className="relative min-h-screen overflow-hidden bg-[#e2e8f0] dark:bg-[#0a1017] flex flex-col justify-center transition-colors duration-300 py-12">
      
      {/* High-end Studio Lighting Mesh */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-[600px] w-[600px] rounded-full bg-white/60 blur-[120px] dark:bg-white/5" />
        <div className="absolute -bottom-40 right-0 h-[500px] w-[500px] rounded-full bg-slate-400/40 blur-[140px] dark:bg-[#102436]/60" />
        <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#82c4e0]/20 blur-[100px] dark:bg-[#82c4e0]/10" />
      </div>

      {/* TOP NAV BAR */}
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
            to="/login"
            className="group inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-white/80 px-4 py-2 text-xs font-black text-slate-800 shadow-sm backdrop-blur-md transition hover:border-slate-400 hover:bg-white dark:border-white/15 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
          >
            Injira
            <Icon.ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </nav>

      {/* MAIN REGISTER CARD */}
      <div className="relative z-10 w-full px-4 pt-20 pb-8 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-[440px] overflow-hidden rounded-[2rem] bg-white p-8 shadow-2xl shadow-slate-300/50 dark:bg-[#132433] dark:shadow-black/50 sm:p-10 border border-slate-200/50 dark:border-white/5">
          
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-orange-50 text-[#FF5D00] dark:bg-orange-500/10">
              <Icon.Sparkles className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              Fungura Konti Nshya
            </h1>
            {/* The Dynamic Auto-changing Subtitle */}
            <TypingSubtitle />
          </div>

          {/* FORM */}
          <form onSubmit={handleRegister} className="space-y-4">
            {/* Full name */}
            <div>
              <label htmlFor="fullName" className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">
                Amazina yawe
              </label>
              <div className="relative">
                <span className={`pointer-events-none absolute inset-y-0 left-0 flex w-11 items-center justify-center transition-colors ${focused === "name" ? "text-[#FF5D00]" : "text-slate-400"}`}>
                  <Icon.User className="w-4 h-4" />
                </span>
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  onFocus={() => setFocused("name")}
                  onBlur={() => setFocused(null)}
                  required
                  placeholder="Andika amazina yawe"
                  className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#FF5D00] focus:bg-white focus:ring-4 focus:ring-[#FF5D00]/10 dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:border-[#FF5D00] dark:focus:bg-[#1a2d3e]"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">
                Email
              </label>
              <div className="relative">
                <span className={`pointer-events-none absolute inset-y-0 left-0 flex w-11 items-center justify-center transition-colors ${focused === "email" ? "text-[#FF5D00]" : "text-slate-400"}`}>
                  <Icon.Mail className="w-4 h-4" />
                </span>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocused("email")}
                  onBlur={() => setFocused(null)}
                  required
                  placeholder="email@example.com"
                  className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#FF5D00] focus:bg-white focus:ring-4 focus:ring-[#FF5D00]/10 dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:border-[#FF5D00] dark:focus:bg-[#1a2d3e]"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">
                Password
              </label>
              <div className="relative">
                <span className={`pointer-events-none absolute inset-y-0 left-0 flex w-11 items-center justify-center transition-colors ${focused === "password" ? "text-[#FF5D00]" : "text-slate-400"}`}>
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
                  placeholder="Nibura inyuguti 6"
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

            {/* Role Selection */}
            <div className="pt-2">
              <p className="mb-2 text-xs font-bold text-slate-700 dark:text-slate-300">Uje gukora iki?</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  {
                    value: "buyer" as const,
                    icon: Icon.ShoppingCart,
                    title: "NDASHAKA KUGURA",
                    subtitle: "Shaka ibintu",
                  },
                  {
                    value: "seller" as const,
                    icon: Icon.Store,
                    title: "NDASHAKA KUGURISHA",
                    subtitle: "Gurisha ibintu",
                  },
                ].map((option) => {
                  const isActive = role === option.value
                  const OptionIcon = option.icon
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setRole(option.value)}
                      className={`group relative flex flex-col items-start rounded-xl border p-3.5 transition-all duration-300 ${
                        isActive
                          ? "border-[#FF5D00] bg-orange-50/50 shadow-sm dark:border-[#FF5D00] dark:bg-[#FF5D00]/10"
                          : "border-slate-200 bg-slate-50 hover:border-slate-300 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
                      }`}
                    >
                      <div className="flex w-full items-center justify-between">
                        <span className={`flex h-9 w-9 items-center justify-center rounded-lg transition ${isActive ? "bg-[#FF5D00] text-white shadow-sm" : "bg-white text-slate-400 dark:bg-white/10"}`}>
                          <OptionIcon className="w-4 h-4" />
                        </span>
                        {isActive && (
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#FF5D00] text-white">
                            <Icon.Check className="w-3 h-3" />
                          </span>
                        )}
                      </div>
                      <p className={`mt-2.5 text-[10px] font-black uppercase tracking-wider ${isActive ? "text-[#FF5D00]" : "text-slate-600 dark:text-slate-300"}`}>
                        {option.title}
                      </p>
                      <p className="mt-0.5 text-[10px] font-medium text-slate-500">{option.subtitle}</p>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Message / Error */}
            {message && (
              <div className={`flex items-start gap-2.5 rounded-xl border p-3 text-xs font-semibold ${
                success
                  ? "border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400"
                  : "border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-400"
              }`}>
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
                  <span>Turimo gukora...</span>
                </>
              ) : (
                <>
                  <span>Fungura Konti</span>
                  <Icon.ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </form>

          {/* Divider / Login */}
          <div className="mt-8 text-center">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Usanzwe ufite konti?{" "}
              <Link to="/login" className="font-black text-[#FF5D00] hover:underline">
                Injira ubu
              </Link>
            </p>
          </div>

        </div>
      </div>

      {/* Back link */}
      <div className="relative z-10 mb-4 text-center">
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

export default Register