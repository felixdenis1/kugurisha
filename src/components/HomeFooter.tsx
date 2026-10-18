import { Link } from "react-router-dom"

function HomeFooter() {
  return (
    <footer
      className="border-t"
      style={{
        background:
          "linear-gradient(180deg, #f8fbff 0%, #eef5ff 100%)",
        borderColor: "rgba(148,163,184,0.18)",
      }}
    >
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link
              to="/"
              className="text-2xl font-black tracking-[-0.065em] text-slate-950"
            >
              <span>KUGU</span>
              <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                RISHA
              </span>
            </Link>

            <p className="mt-4 max-w-xs text-sm leading-6 text-slate-600">
              Isoko rihuza abaguzi n&apos;abagurisha
              mu Rwanda.
            </p>
          </div>

          <div>
            <p className="text-xs font-black uppercase tracking-[0.15em] text-slate-900">
              Urubuga
            </p>

            <div className="mt-4 space-y-3">
              <Link
                to="/categories"
                className="block text-sm text-slate-500 transition hover:text-blue-600"
              >
                Ibyiciro
              </Link>

              <a
                href="#listings"
                className="block text-sm text-slate-500 transition hover:text-blue-600"
              >
                Ibicuruzwa
              </a>

              <Link
                to="/about"
                className="block text-sm text-slate-500 transition hover:text-blue-600"
              >
                Ibyo dukora
              </Link>

              <Link
                to="/how-it-works"
                className="block text-sm text-slate-500 transition hover:text-blue-600"
              >
                Uko urubuga rukora
              </Link>
            </div>
          </div>

          <div>
            <p className="text-xs font-black uppercase tracking-[0.15em] text-slate-900">
              Konti
            </p>

            <div className="mt-4 space-y-3">
              <Link
                to="/login"
                className="block text-sm text-slate-500 transition hover:text-blue-600"
              >
                Injira
              </Link>

              <Link
                to="/register"
                className="block text-sm text-slate-500 transition hover:text-blue-600"
              >
                Iyandikishe
              </Link>

              <Link
                to="/create-listing"
                className="block text-sm text-slate-500 transition hover:text-blue-600"
              >
                Gurisha
              </Link>

              <Link
                to="/ai-search"
                className="block text-sm text-slate-500 transition hover:text-blue-600"
              >
                AI Search
              </Link>
            </div>
          </div>

          <div>
            <p className="text-xs font-black uppercase tracking-[0.15em] text-slate-900">
              KUGURISHA.COM
            </p>

            <p className="mt-4 text-sm leading-6 text-slate-600">
              Gura. Gurisha. Bihuze.
            </p>

            <p className="mt-3 text-xs text-slate-400">
              © {new Date().getFullYear()} KUGURISHA.COM
            </p>
          </div>
        </div>

        <div className="mt-10 border-t border-slate-200/70 pt-6">
          <p className="text-xs text-slate-400">
            KUGURISHA — Isoko ryawe ryo mu Rwanda.
            <span className="ml-2 sm:ml-6">
              Yakozwe na East African Developers Foundation
            </span>
          </p>
        </div>
      </div>
    </footer>
  )
}

export default HomeFooter