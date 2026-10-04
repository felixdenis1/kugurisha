import { useState } from "react"
import { Link } from "react-router-dom"
import { supabase } from "../services/supabase"

function Register() {
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState<"buyer" | "seller">("buyer")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [success, setSuccess] = useState(false)

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()

    setLoading(true)
    setMessage("")
    setSuccess(false)

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role,
        },
      },
    })

    if (error) {
      setMessage(error.message)
      setLoading(false)
      return
    }

    setSuccess(true)
    setMessage(
      "Konti yakozwe neza. Reba email yawe niba verification isabwa."
    )
    setLoading(false)
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute -left-32 -top-32 h-80 w-80 rounded-full bg-blue-600/20 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl items-center justify-center px-5 py-10 sm:px-8">
        <div className="grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/10 bg-white shadow-2xl lg:grid-cols-[1.05fr_0.95fr]">

          {/* Brand section */}
          <section className="hidden bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 p-10 text-white lg:flex lg:flex-col lg:justify-between xl:p-14">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 text-lg font-black backdrop-blur">
                  K
                </div>

                <div>
                  <p className="text-lg font-black tracking-tight">
                    KUGURISHA.COM
                  </p>

                  <p className="text-xs text-blue-100">
                    Isoko ryawe ryo mu Rwanda
                  </p>
                </div>
              </div>

              <div className="mt-20 max-w-md">
                <p className="mb-5 text-sm font-bold uppercase tracking-[0.2em] text-blue-100">
                  Tangira urugendo rwawe
                </p>

                <h2 className="text-4xl font-black leading-tight xl:text-5xl">
                  Fungura konti.
                  <br />
                  Tangira kugura.
                  <br />
                  Tangira kugurisha.
                </h2>

                <p className="mt-6 max-w-sm text-base leading-7 text-blue-100">
                  Kora konti yawe kuri KUGURISHA.COM hanyuma ubone
                  uburyo bworoshye bwo kugura cyangwa kugurisha mu Rwanda.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-sm text-blue-100">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
                🇷🇼
              </span>

              <span>
                Isoko ry'abanyarwanda, ahantu hamwe.
              </span>
            </div>
          </section>

          {/* Register section */}
          <section className="bg-white px-6 py-9 sm:px-10 sm:py-12 xl:px-14">
            <div className="mx-auto w-full max-w-md">

              {/* Mobile brand */}
              <div className="mb-9 lg:hidden">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-lg font-black text-white shadow-lg shadow-blue-600/20">
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
                <div className="mb-4 inline-flex rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700">
                  ✨ Tangira ubu
                </div>

                <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                  Fungura konti
                </h1>

                <p className="mt-3 text-sm leading-6 text-slate-500 sm:text-base">
                  Uzuza amakuru make hanyuma utangire gukoresha
                  KUGURISHA.COM.
                </p>
              </div>

              {/* Form */}
              <form
                onSubmit={handleRegister}
                className="mt-8 space-y-5"
              >
                {/* Full name */}
                <div>
                  <label
                    htmlFor="fullName"
                    className="mb-2 block text-sm font-bold text-slate-800"
                  >
                    Amazina yawe
                  </label>

                  <div className="relative">
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
                          d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"
                        />
                        <circle
                          cx="9"
                          cy="7"
                          r="4"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"
                        />
                      </svg>
                    </div>

                    <input
                      id="fullName"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      placeholder="Andika amazina yawe"
                      autoComplete="name"
                      className="h-13 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-12 pr-4 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-bold text-slate-800"
                  >
                    Email
                  </label>

                  <div className="relative">
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
                      placeholder="email@example.com"
                      autoComplete="email"
                      className="h-13 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-12 pr-4 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label
                    htmlFor="password"
                    className="mb-2 block text-sm font-bold text-slate-800"
                  >
                    Password
                  </label>

                  <div className="relative">
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
                      minLength={6}
                      placeholder="Nibura inyuguti 6"
                      autoComplete="new-password"
                      className="h-13 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-12 pr-4 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                    />
                  </div>

                  <p className="mt-2 text-xs leading-5 text-slate-400">
                    Password igomba kuba nibura inyuguti 6.
                  </p>
                </div>

                {/* Role */}
                <div>
                  <p className="mb-3 text-sm font-bold text-slate-800">
                    Uje gukora iki?
                  </p>

                  <div className="grid grid-cols-2 gap-3">
                    {/* Buyer */}
                    <button
                      type="button"
                      onClick={() => setRole("buyer")}
                      aria-pressed={role === "buyer"}
                      className={`group rounded-2xl border p-4 text-left transition ${
                        role === "buyer"
                          ? "border-blue-600 bg-blue-50 shadow-sm shadow-blue-600/10"
                          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-xl text-xl transition ${
                          role === "buyer"
                            ? "bg-blue-600 text-white"
                            : "bg-slate-100"
                        }`}
                      >
                        🛒
                      </div>

                      <span
                        className={`mt-3 block text-xs font-black sm:text-sm ${
                          role === "buyer"
                            ? "text-blue-700"
                            : "text-slate-700"
                        }`}
                      >
                        NDASHAKA KUGURA
                      </span>

                      <span className="mt-1 block text-[11px] leading-4 text-slate-400">
                        Shaka ibyo ushaka kugura.
                      </span>

                      {role === "buyer" && (
                        <div className="mt-3 flex items-center gap-1.5 text-[11px] font-bold text-blue-600">
                          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-white">
                            ✓
                          </span>
                          Wahisemo
                        </div>
                      )}
                    </button>

                    {/* Seller */}
                    <button
                      type="button"
                      onClick={() => setRole("seller")}
                      aria-pressed={role === "seller"}
                      className={`group rounded-2xl border p-4 text-left transition ${
                        role === "seller"
                          ? "border-blue-600 bg-blue-50 shadow-sm shadow-blue-600/10"
                          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-xl text-xl transition ${
                          role === "seller"
                            ? "bg-blue-600 text-white"
                            : "bg-slate-100"
                        }`}
                      >
                        🏷️
                      </div>

                      <span
                        className={`mt-3 block text-xs font-black sm:text-sm ${
                          role === "seller"
                            ? "text-blue-700"
                            : "text-slate-700"
                        }`}
                      >
                        NDASHAKA KUGURISHA
                      </span>

                      <span className="mt-1 block text-[11px] leading-4 text-slate-400">
                        Tangira kugurisha ibyo ufite.
                      </span>

                      {role === "seller" && (
                        <div className="mt-3 flex items-center gap-1.5 text-[11px] font-bold text-blue-600">
                          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-white">
                            ✓
                          </span>
                          Wahisemo
                        </div>
                      )}
                    </button>
                  </div>
                </div>

                {/* Message */}
                {message && (
                  <div
                    role="alert"
                    className={`flex gap-3 rounded-2xl border p-4 text-sm leading-6 ${
                      success
                        ? "border-emerald-100 bg-emerald-50 text-emerald-700"
                        : "border-red-100 bg-red-50 text-red-700"
                    }`}
                  >
                    <span className="mt-0.5 shrink-0">
                      {success ? "✓" : "⚠️"}
                    </span>

                    <p>{message}</p>
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="group flex h-13 w-full items-center justify-center rounded-2xl bg-blue-600 px-5 text-sm font-extrabold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-600/25 focus:outline-none focus:ring-4 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span className="transition group-hover:translate-x-0.5">
                    {loading
                      ? "Turimo gukora konti..."
                      : "Fungura konti"}
                  </span>

                  {!loading && (
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="ml-2 h-4 w-4 transition group-hover:translate-x-1"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 12h14m-6-6 6 6-6 6"
                      />
                    </svg>
                  )}

                  {loading && (
                    <span className="ml-3 h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  )}
                </button>
              </form>

              {/* Login */}
              <div className="mt-8 border-t border-slate-100 pt-7 text-center">
                <p className="text-sm text-slate-500">
                  Usanzwe ufite konti?
                </p>

                <Link
                  to="/login"
                  className="mt-2 inline-flex items-center text-sm font-extrabold text-blue-600 transition hover:text-blue-700 hover:underline"
                >
                  Injira muri konti
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

export default Register