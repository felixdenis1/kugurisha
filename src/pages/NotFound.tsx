import { Link, useNavigate } from "react-router-dom"
import { useTheme } from "../components/ThemeProvider"

function NotFound() {
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()

  return (
    <main
      className="min-h-screen"
      style={{
        backgroundColor: "var(--bg)",
        color: "var(--text)",
      }}
    >
      <header
        className="border-b"
        style={{
          backgroundColor: "var(--bg)",
          borderColor: "var(--border)",
        }}
      >
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link
            to="/"
            className="text-xl font-black tracking-[-0.055em] sm:text-2xl"
            style={{
              color: "var(--text)",
            }}
          >
            KUGURISHA
            <span className="text-blue-600">.COM</span>
          </Link>

          <button
            type="button"
            onClick={toggleTheme}
            className="flex h-10 w-10 items-center justify-center rounded-full border text-base transition hover:scale-105"
            style={{
              backgroundColor: "var(--surface)",
              borderColor: "var(--border)",
              color: "var(--text)",
            }}
            aria-label="Hindura theme"
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </button>
        </div>
      </header>

      <section className="flex min-h-[calc(100vh-73px)] items-center justify-center px-4 py-16">
        <div className="w-full max-w-xl text-center">
          <div
            className="mx-auto flex h-24 w-24 items-center justify-center rounded-[2rem] border text-4xl"
            style={{
              backgroundColor: "var(--surface)",
              borderColor: "var(--border)",
            }}
          >
            🔎
          </div>

          <p className="mt-8 text-sm font-black uppercase tracking-[0.2em] text-blue-600">
            Error 404
          </p>

          <h1
            className="mt-3 text-4xl font-black tracking-[-0.04em] sm:text-5xl"
            style={{
              color: "var(--text)",
            }}
          >
            Urupapuro ntirwabonywe
          </h1>

          <p
            className="mx-auto mt-5 max-w-md text-sm leading-7 sm:text-base"
            style={{
              color: "var(--text-secondary)",
            }}
          >
            Birasa n'aho page washakaga itakibaho,
            yahinduwe, cyangwa URL wayanditse
            itari yo.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              to="/"
              className="rounded-full bg-blue-600 px-6 py-3.5 text-sm font-black text-white transition hover:bg-blue-700"
            >
              ← Subira Ahabanza
            </Link>

            <button
              type="button"
              onClick={() => navigate(-1)}
              className="rounded-full border px-6 py-3.5 text-sm font-black transition hover:bg-[var(--soft-bg-hover)]"
              style={{
                backgroundColor: "var(--surface)",
                borderColor: "var(--border)",
                color: "var(--text)",
              }}
            >
              Subira inyuma
            </button>
          </div>

          <div
            className="mx-auto mt-10 max-w-md rounded-2xl border p-4 text-left"
            style={{
              backgroundColor: "var(--soft-bg)",
              borderColor: "var(--border)",
            }}
          >
            <p
              className="text-xs font-black uppercase tracking-wider"
              style={{
                color: "var(--text-muted)",
              }}
            >
              Ushobora no
            </p>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <Link
                to="/"
                className="rounded-xl px-3 py-2.5 text-sm font-bold transition hover:bg-[var(--soft-bg-hover)]"
                style={{
                  color: "var(--text)",
                }}
              >
                🏠 Ahabanza
              </Link>

              <Link
                to="/ai-search"
                className="rounded-xl px-3 py-2.5 text-sm font-bold transition hover:bg-[var(--soft-bg-hover)]"
                style={{
                  color: "var(--text)",
                }}
              >
                ✨ AI Search
              </Link>

              <Link
                to="/favorites"
                className="rounded-xl px-3 py-2.5 text-sm font-bold transition hover:bg-[var(--soft-bg-hover)]"
                style={{
                  color: "var(--text)",
                }}
              >
                ❤️ Ibyakunzwe
              </Link>

              <Link
                to="/create-listing"
                className="rounded-xl px-3 py-2.5 text-sm font-bold transition hover:bg-[var(--soft-bg-hover)]"
                style={{
                  color: "var(--text)",
                }}
              >
                🛍️ Gurisha
              </Link>
            </div>
          </div>

          <p
            className="mt-10 text-xs"
            style={{
              color: "var(--text-muted)",
            }}
          >
            KUGURISHA.COM · Isoko ryawe ryo mu Rwanda 🇷🇼
          </p>
        </div>
      </section>
    </main>
  )
}

export default NotFound