import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { supabase } from "../services/supabase"

function ResetPassword() {
  const navigate = useNavigate()

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [ready, setReady] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    let mounted = true

    async function checkRecoverySession() {
      const { data, error } = await supabase.auth.getSession()

      if (!mounted) return

      if (error) {
        setError(
          "Link yo guhindura password ntibashoboye gufunguka."
        )
        setLoading(false)
        return
      }

      if (data.session) {
        setReady(true)
      } else {
        setError(
          "Link yo guhindura password ntiyemewe cyangwa yarangiye. Ongera usabe link nshya."
        )
      }

      setLoading(false)
    }

    checkRecoverySession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return

        if (event === "PASSWORD_RECOVERY" && session) {
          setReady(true)
          setLoading(false)
          setError("")
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  async function handleUpdatePassword(e: React.FormEvent) {
    e.preventDefault()

    setError("")
    setMessage("")

    if (password.length < 6) {
      setError(
        "Password igomba kuba nibura inyuguti 6."
      )
      return
    }

    if (password !== confirmPassword) {
      setError(
        "Password zombi zigomba kuba zimeze kimwe."
      )
      return
    }

    setUpdating(true)

    try {
      const { error } = await supabase.auth.updateUser({
        password,
      })

      if (error) {
        setError(error.message)
        return
      }

      setMessage(
        "Password yawe yahinduwe neza. Urongera winjire ukoresheje password nshya."
      )

      setPassword("")
      setConfirmPassword("")

      setTimeout(() => {
        navigate("/login")
      }, 2000)
    } catch (error) {
      console.error("RESET PASSWORD ERROR:", error)

      setError(
        "Habaye ikibazo mu guhindura password."
      )
    } finally {
      setUpdating(false)
    }
  }

  /* Loading */
  if (loading) {
    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-6">
        <div className="absolute -left-32 -top-32 h-80 w-80 rounded-full bg-blue-600/20 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl" />

        <div className="relative w-full max-w-sm rounded-[2rem] bg-white p-8 text-center shadow-2xl">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50">
            <div className="h-7 w-7 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
          </div>

          <h1 className="mt-6 text-xl font-black text-slate-950">
            Turagenzura link yawe
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Turimo kugenzura niba link yo guhindura password
            ikiri gukora.
          </p>
        </div>
      </main>
    )
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
                  Umutekano wa konti
                </p>

                <h2 className="text-4xl font-black leading-tight xl:text-5xl">
                  Shyiramo
                  <br />
                  password nshya.
                </h2>

                <p className="mt-6 max-w-sm text-base leading-7 text-blue-100">
                  Koresha password nshya kandi ikomeye kugira ngo
                  ukomeze gukoresha konti yawe neza.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-sm text-blue-100">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
                🔐
              </span>

              <span>
                Konti yawe irinzwe na KUGURISHA.COM.
              </span>
            </div>
          </section>

          {/* Reset section */}
          <section className="bg-white px-6 py-9 sm:px-10 sm:py-12 xl:px-14">
            <div className="mx-auto w-full max-w-md">

              {/* Mobile brand */}
              <div className="mb-10 lg:hidden">
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

              {!ready ? (
                <>
                  {/* Invalid link */}
                  <div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-xl">
                      ⚠️
                    </div>

                    <h1 className="mt-6 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                      Link ntiyemewe
                    </h1>

                    <p className="mt-3 text-sm leading-6 text-slate-500 sm:text-base">
                      Link yo guhindura password ntiyemewe cyangwa
                      yarangiye.
                    </p>
                  </div>

                  <div className="mt-8 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm leading-6 text-red-700">
                    {error}
                  </div>

                  <Link
                    to="/forgot-password"
                    className="mt-6 flex h-13 w-full items-center justify-center rounded-2xl bg-blue-600 px-5 text-sm font-extrabold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20"
                  >
                    Ongera usabe link nshya
                  </Link>

                  <div className="mt-6 text-center">
                    <Link
                      to="/login"
                      className="text-sm font-bold text-blue-600 hover:text-blue-700 hover:underline"
                    >
                      Subira kuri Login
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  {/* Header */}
                  <div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-xl">
                      🔐
                    </div>

                    <h1 className="mt-6 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                      Password nshya
                    </h1>

                    <p className="mt-3 text-sm leading-6 text-slate-500 sm:text-base">
                      Shyiramo password nshya uzakoresha igihe
                      winjira muri konti yawe.
                    </p>
                  </div>

                  {/* Form */}
                  <form
                    onSubmit={handleUpdatePassword}
                    className="mt-8 space-y-5"
                  >
                    {/* New password */}
                    <div>
                      <label
                        htmlFor="password"
                        className="mb-2 block text-sm font-bold text-slate-800"
                      >
                        Password nshya
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
                          onChange={(e) =>
                            setPassword(e.target.value)
                          }
                          required
                          minLength={6}
                          placeholder="Andika password nshya"
                          autoComplete="new-password"
                          className="h-13 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-12 pr-4 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                        />
                      </div>

                      <p className="mt-2 text-xs leading-5 text-slate-400">
                        Password igomba kuba nibura inyuguti 6.
                      </p>
                    </div>

                    {/* Confirm password */}
                    <div>
                      <label
                        htmlFor="confirmPassword"
                        className="mb-2 block text-sm font-bold text-slate-800"
                      >
                        Ongera wandike password
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
                              d="m9 12 2 2 4-4"
                            />

                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                            />
                          </svg>
                        </div>

                        <input
                          id="confirmPassword"
                          type="password"
                          value={confirmPassword}
                          onChange={(e) =>
                            setConfirmPassword(e.target.value)
                          }
                          required
                          minLength={6}
                          placeholder="Ongera wandike password"
                          autoComplete="new-password"
                          className="h-13 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-12 pr-4 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                        />
                      </div>
                    </div>

                    {/* Success */}
                    {message && (
                      <div
                        role="status"
                        className="flex gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm leading-6 text-emerald-700"
                      >
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">
                          ✓
                        </span>

                        <p>{message}</p>
                      </div>
                    )}

                    {/* Error */}
                    {error && (
                      <div
                        role="alert"
                        className="flex gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm leading-6 text-red-700"
                      >
                        <span className="mt-0.5 shrink-0">
                          ⚠️
                        </span>

                        <p>{error}</p>
                      </div>
                    )}

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={updating}
                      className="group flex h-13 w-full items-center justify-center rounded-2xl bg-blue-600 px-5 text-sm font-extrabold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-600/25 focus:outline-none focus:ring-4 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <span>
                        {updating
                          ? "Turahindura..."
                          : "Hindura password"}
                      </span>

                      {!updating && (
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

                      {updating && (
                        <span className="ml-3 h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      )}
                    </button>
                  </form>

                  <div className="mt-7 text-center">
                    <Link
                      to="/login"
                      className="inline-flex items-center text-sm font-bold text-slate-500 transition hover:text-blue-600"
                    >
                      ← Subira kuri Login
                    </Link>
                  </div>
                </>
              )}

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

export default ResetPassword