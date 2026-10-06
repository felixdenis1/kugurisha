import { useState } from "react"
import { Link } from "react-router-dom"
import { supabase } from "../services/supabase"

function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()

    setLoading(true)
    setMessage("")

    try {
      // 1. Injira muri Supabase Auth
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

      console.log("LOGIN SUCCESS")
      console.log("USER ID:", user.id)
      console.log("USER EMAIL:", user.email)

      // 2. Shaka profile y'uyu user
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id, role, is_active")
        .eq("id", user.id)
        .maybeSingle()

      console.log("PROFILE:", profile)
      console.log("PROFILE ERROR:", profileError)

      if (profileError) {
        setMessage(
          `Ntitwashoboye kubona profile yawe. ${profileError.message}`
        )
        return
      }

      // 3. Niba nta profile ihari
      if (!profile) {
        setMessage(
          `Profile y'uyu mukoresha ntiyabonetse. User ID: ${user.id}`
        )
        return
      }

      // 4. Konti yahagaritswe
      if (profile.is_active === false) {
        await supabase.auth.signOut()
        setMessage("Iyi konti yahagaritswe. Hamagara admin.")
        return
      }

      console.log("PROFILE ROLE:", profile.role)

      // 5. Admin → Admin Dashboard
      if (profile.role === "admin") {
        window.location.href = "/admin"
        return
      }

      // 6. Buyer / Seller → Marketplace Home
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

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-50 text-slate-900">
      {/* =========================================================
          STRONG VISIBLE GRADIENT BACKGROUND
          ========================================================= */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Main blue glow */}
        <div className="absolute left-1/2 top-1/2 h-[38rem] w-[38rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/35 blur-[120px]" />

        {/* Top-left indigo glow */}
        <div className="absolute -left-32 -top-32 h-[32rem] w-[32rem] rounded-full bg-indigo-500/30 blur-[110px]" />

        {/* Bottom-right cyan glow */}
        <div className="absolute -bottom-32 -right-32 h-[34rem] w-[34rem] rounded-full bg-cyan-400/25 blur-[120px]" />

        {/* Secondary blue glow */}
        <div className="absolute right-[10%] top-[15%] h-[24rem] w-[24rem] rounded-full bg-blue-600/25 blur-[100px]" />

        {/* Bottom indigo glow */}
        <div className="absolute bottom-[5%] left-[15%] h-[22rem] w-[22rem] rounded-full bg-indigo-600/20 blur-[100px]" />

        {/* Subtle gradient wash */}
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(59,130,246,0.08),transparent_35%,rgba(99,102,241,0.08)_65%,rgba(6,182,212,0.06))]" />
      </div>

      {/* =========================================================
          MAIN CONTENT
          ========================================================= */}
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-white/70 bg-white shadow-2xl shadow-slate-900/15 lg:grid-cols-[0.9fr_1.1fr]">
          {/* =========================================================
              BRAND PANEL
              ========================================================= */}
          <section className="relative hidden overflow-hidden bg-slate-900 p-10 text-white lg:flex lg:flex-col lg:justify-between xl:p-12">
            {/* Decorative shapes */}
            <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />

            <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl" />

            <div className="relative">
              {/* Brand */}
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-base font-black text-slate-900 shadow-lg">
                  K
                </div>

                <div>
                  <p className="text-lg font-black tracking-tight">
                    KUGURISHA.COM
                  </p>

                  <p className="text-xs text-slate-400">
                    Isoko ryawe ryo mu Rwanda
                  </p>
                </div>
              </div>

              {/* Main message */}
              <div className="mt-20 max-w-md xl:mt-28">
                <div className="mb-5 inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-slate-300">
                  🇷🇼 Isoko ryawe ryo mu Rwanda
                </div>

                <h2 className="text-4xl font-black leading-tight tracking-tight xl:text-5xl">
                  Gura icyo ushaka.
                  <br />

                  <span className="text-slate-400">
                    Gurisha icyo ufite.
                  </span>
                </h2>

                <p className="mt-6 max-w-sm text-sm leading-7 text-slate-400 xl:text-base">
                  Injira muri konti yawe ukomeze kugura no kugurisha
                  ibintu bitandukanye mu Rwanda.
                </p>
              </div>
            </div>

            {/* Bottom */}
            <div className="relative flex items-center gap-3 border-t border-white/10 pt-6 text-sm text-slate-400">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5">
                🇷🇼
              </span>

              <span>
                Isoko ry'abanyarwanda,
                <br />
                ahantu hamwe.
              </span>
            </div>
          </section>

          {/* =========================================================
              LOGIN PANEL
              ========================================================= */}
          <section className="bg-white px-5 py-8 sm:px-10 sm:py-10 lg:px-12 xl:px-14 xl:py-12">
            <div className="mx-auto w-full max-w-md">
              {/* Mobile brand */}
              <div className="mb-9 lg:hidden">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-base font-black text-white shadow-sm">
                    K
                  </div>

                  <div>
                    <p className="text-lg font-black tracking-tight text-slate-950">
                      KUGURISHA.COM
                    </p>

                    <p className="text-xs text-slate-500">
                      Isoko ryawe ryo mu Rwanda
                    </p>
                  </div>
                </div>
              </div>

              {/* Header */}
              <div>
                <div className="mb-4 inline-flex items-center rounded-xl border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700">
                  👋 Murakaza neza
                </div>

                <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                  Injira muri konti yawe
                </h1>

                <p className="mt-3 text-sm leading-6 text-slate-500 sm:text-base">
                  Komeza ukoreshe KUGURISHA.COM ukoresheje amakuru ya
                  konti yawe.
                </p>
              </div>

              {/* =====================================================
                  FORM
                  ===================================================== */}
              <form onSubmit={handleLogin} className="mt-8 space-y-5">
                {/* Email */}
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md sm:p-5">
                  <label
                    htmlFor="email"
                    className="block text-sm font-bold text-slate-700"
                  >
                    Email
                  </label>

                  <div className="relative mt-2">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        className="h-5 w-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3 7.5 12 13l9-5.5M5 19h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2Z"
                        />
                      </svg>
                    </div>

                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="Andika email yawe"
                      autoComplete="email"
                      className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-12 pr-4 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md sm:p-5">
                  <div className="flex items-center justify-between gap-3">
                    <label
                      htmlFor="password"
                      className="block text-sm font-bold text-slate-700"
                    >
                      Password
                    </label>

                    <Link
                      to="/forgot-password"
                      className="text-xs font-bold text-blue-600 transition hover:text-blue-700 hover:underline sm:text-sm"
                    >
                      Wibagiwe password?
                    </Link>
                  </div>

                  <div className="relative mt-2">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        className="h-5 w-5"
                      >
                        <rect
                          width="16"
                          height="11"
                          x="4"
                          y="10"
                          rx="2"
                        />

                        <path
                          strokeLinecap="round"
                          d="M8 10V7a4 4 0 0 1 8 0v3"
                        />
                      </svg>
                    </div>

                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="Andika password yawe"
                      autoComplete="current-password"
                      className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-12 pr-4 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50"
                    />
                  </div>
                </div>

                {/* Error */}
                {message && (
                  <div
                    role="alert"
                    className="flex gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700"
                  >
                    <span className="mt-0.5 shrink-0">⚠️</span>

                    <p>{message}</p>
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="flex h-12 w-full items-center justify-center rounded-xl bg-slate-900 px-5 text-sm font-extrabold text-white shadow-sm transition hover:bg-slate-800 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <span className="mr-3 h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Turinjira...
                    </>
                  ) : (
                    <>
                      Injira muri konti

                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="ml-2 h-4 w-4"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 12h14m-6-6 6 6-6 6"
                        />
                      </svg>
                    </>
                  )}
                </button>
              </form>

              {/* Register */}
              <div className="mt-8 border-t border-slate-100 pt-7 text-center">
                <p className="text-sm text-slate-500">
                  Ntabwo urafite konti?
                </p>

                <Link
                  to="/register"
                  className="mt-2 inline-flex items-center text-sm font-extrabold text-blue-600 transition hover:text-blue-700 hover:underline"
                >
                  Fungura konti nshya

                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="ml-1.5 h-4 w-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 12h14m-6-6 6 6-6 6"
                    />
                  </svg>
                </Link>
              </div>

              {/* Footer */}
              <p className="mt-8 text-center text-xs leading-5 text-slate-400">
                © {new Date().getFullYear()} KUGURISHA.COM
                <br />
                Isoko ryawe ryo mu Rwanda 🇷🇼
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}

export default Login