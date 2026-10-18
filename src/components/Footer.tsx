
import { Link } from "react-router-dom"

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2">
            <Link
              to="/"
              className="inline-flex items-center gap-3"
              aria-label="KUGURISHA.COM - Ahabanza"
            >
              <img
                src="/favicon.svg"
                alt=""
                className="h-11 w-11 object-contain"
              />
              <span className="text-lg font-black tracking-tight text-slate-900">
                KUGURISHA<span className="text-emerald-600">.COM</span>
              </span>
            </Link>

            <p className="mt-4 max-w-md text-sm leading-7 text-slate-600">
              Isoko ryawe ryo mu Rwanda. Gura icyo ushaka, ugurishe ibyo ufite
              byoroshye kandi wifashishije ikoranabuhanga.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Urubuga
            </h3>

            <ul className="mt-4 space-y-3 text-sm text-slate-600">
              <li>
                <Link to="/" className="transition hover:text-emerald-700">
                  Ahabanza
                </Link>
              </li>
              <li>
                <Link
                  to="/categories"
                  className="transition hover:text-emerald-700"
                >
                  Categories
                </Link>
              </li>
              <li>
                <Link
                  to="/ai-search"
                  className="transition hover:text-emerald-700"
                >
                  Shakisha ukoresheje AI
                </Link>
              </li>
              <li>
                <Link
                  to="/create-listing"
                  className="transition hover:text-emerald-700"
                >
                  Gurisha
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Aho wamenyera byinshi
            </h3>

            <ul className="mt-4 space-y-3 text-sm text-slate-600">
              <li>
                <Link
                  to="/about"
                  className="transition hover:text-emerald-700"
                >
                  Ibyo dukora
                </Link>
              </li>
              <li>
                <Link
                  to="/how-it-works"
                  className="transition hover:text-emerald-700"
                >
                  Uko urubuga rukora
                </Link>
              </li>
              <li>
                <Link
                  to="/profile"
                  className="transition hover:text-emerald-700"
                >
                  Konti yanjye
                </Link>
              </li>
              <li>
                <Link
                  to="/login"
                  className="transition hover:text-emerald-700"
                >
                  Injira
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-slate-200 pt-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} KUGURISHA.COM. Uburenganzira bwose
            burabitswe.
          </p>

          <p>Yubakiwe Abanyarwanda 🇷🇼</p>
        </div>
      </div>
    </footer>
  )
}
