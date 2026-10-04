import { useState } from "react"
import { Link } from "react-router-dom"
import { supabase } from "../services/supabase"

function ForgotPassword() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  async function handleResetRequest(e: React.FormEvent) {
    e.preventDefault()

    setLoading(true)
    setMessage("")
    setError("")

    try {
      const { error } =
        await supabase.auth.resetPasswordForEmail(
          email.trim(),
          {
            redirectTo: `${window.location.origin}/reset-password`,
          }
        )

      if (error) {
        setError(error.message)
        return
      }

      // Message rusange kugira ngo tutagaragaza
      // niba email iri muri system cyangwa idahari.
      setMessage(
        "Niba iyi email iri muri KUGURISHA.COM, twohereje link yo guhindura password. Reba email yawe."
      )
    } catch (error) {
      console.error("FORGOT PASSWORD ERROR:", error)

      setError("Habaye ikibazo. Ongera ugerageze.")
    } finally {
      setLoading(false)
    }
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
                  Konti yawe
                </p>

                <h2 className="text-4xl font-black leading-tight xl:text-5xl">
                  Ongera ubone
                  <br />
                  konti yawe.
                </h2>

                <p className="mt-6 max-w-sm text-base leading-7 text-blue-100">
                  Ntugire impungenge niba wibagiwe password. Tuzagufasha
                  kuyihindura mu buryo bwizewe.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-sm text-blue-100">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
                🔐
              </span>

              <span>
                Umutekano wa konti yawe ni ingenzi.
              </span>
            </div>
          </section>

          {/* Form section */}
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

              {/* Header */}
              <div>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-xl">
                  🔐
                </div>

                <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                  Wibagiwe password?
                </h1>

                <p className="mt-3 text-sm leading-6 text-slate-500 sm:text-base">
                  Andika email ukoresha kuri konti yawe. Niba iri muri
                  system, turakohereza link yo guhindura password.
                </p>
              </div>

              {/* Form */}
              <form
                onSubmit={handleResetRequest}
                className="mt-8 space-y-5"
              >
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-bold text-slate-800"
                  >
                    Email yawe
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
                      placeholder="Andika email yawe"
                      autoComplete="email"
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
                  disabled={loading}
                  className="group flex h-13 w-full items-center justify-center rounded-2xl bg-blue-600 px-5 text-sm font-extrabold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-600/25 focus:outline-none focus:ring-4 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span>
                    {loading
                      ? "Turategereza..."
                      : "Ohereza link"}
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

              {/* Back to login */}
              <div className="mt-8 border-t border-slate-100 pt-7 text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center text-sm font-extrabold text-blue-600 transition hover:text-blue-700 hover:underline"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="mr-2 h-4 w-4 transition group-hover:-translate-x-1"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 12H5m7 7-7-7 7-7"
                    />
                  </svg>

                  Subira kuri Login
                </Link>
              </div>

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

export default ForgotPassword