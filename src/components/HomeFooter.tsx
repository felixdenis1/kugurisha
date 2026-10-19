import { Link } from "react-router-dom"

export default function HomeFooter() {
  return (
    <footer className="border-t kg-border kg-surface kg-text transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          
          {/* BRAND COLUMN */}
          <div>
            <Link
              to="/"
              className="group inline-flex items-center gap-3 rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-slate-500/10 via-emerald-600/15 to-emerald-800/20 p-1 border border-emerald-500/30 transition-transform duration-300 group-hover:scale-105">
                <img
                  src="/favicon.svg"
                  alt="KUGURISHA Logo"
                  className="h-full w-full object-contain rounded-full bg-transparent"
                />
              </div>
              <span className="text-2xl font-black tracking-[-0.07em] bg-gradient-to-r from-slate-500 via-emerald-700 to-emerald-900 dark:from-slate-300 dark:via-emerald-400 dark:to-emerald-500 bg-clip-text text-transparent">
                KUGURISHA
              </span>
            </Link>

            <p className="mt-4 max-w-xs text-sm leading-6 kg-text-secondary font-medium">
              Isoko rihuza abaguzi n&apos;abagurisha mu Rwanda.
            </p>
          </div>

          {/* NAVIGATION LINKS */}
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-400">
              Urubuga
            </p>

            <div className="mt-4 space-y-3 font-semibold">
              <Link
                to="/categories"
                className="block text-sm kg-text-muted transition-colors hover:text-emerald-600 dark:hover:text-emerald-400"
              >
                Ibyiciro
              </Link>

              <a
                href="#listings"
                className="block text-sm kg-text-muted transition-colors hover:text-emerald-600 dark:hover:text-emerald-400"
              >
                Ibicuruzwa
              </a>

              <Link
                to="/about"
                className="block text-sm kg-text-muted transition-colors hover:text-emerald-600 dark:hover:text-emerald-400"
              >
                Ibyo dukora
              </Link>

              <Link
                to="/how-it-works"
                className="block text-sm kg-text-muted transition-colors hover:text-emerald-600 dark:hover:text-emerald-400"
              >
                Uko urubuga rukora
              </Link>
            </div>
          </div>

          {/* ACCOUNT LINKS */}
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-400">
              Konti
            </p>

            <div className="mt-4 space-y-3 font-semibold">
              <Link
                to="/login"
                className="block text-sm kg-text-muted transition-colors hover:text-emerald-600 dark:hover:text-emerald-400"
              >
                Injira
              </Link>

              <Link
                to="/register"
                className="block text-sm kg-text-muted transition-colors hover:text-emerald-600 dark:hover:text-emerald-400"
              >
                Iyandikishe
              </Link>

              <Link
                to="/create-listing"
                className="block text-sm kg-text-muted transition-colors hover:text-emerald-600 dark:hover:text-emerald-400"
              >
                Gurisha
              </Link>

              <Link
                to="/ai-search"
                className="block text-sm kg-text-muted transition-colors hover:text-emerald-600 dark:hover:text-emerald-400"
              >
                AI Search
              </Link>
            </div>
          </div>

          {/* INFO & COPYRIGHT */}
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-400">
              KUGURISHA.COM
            </p>

            <p className="mt-4 text-sm leading-6 kg-text-secondary font-medium">
              Gura. Gurisha. Bihuze.
            </p>

            <p className="mt-3 text-xs kg-text-muted font-bold">
              © {new Date().getFullYear()} KUGURISHA.COM
            </p>
          </div>
        </div>

        {/* BOTTOM CREDIT BAR */}
        <div className="mt-10 border-t kg-border pt-6">
          <p className="text-xs font-medium kg-text-muted">
            KUGURISHA — Isoko ryawe ryo mu Rwanda.
            <span className="ml-2 block sm:inline sm:ml-6 text-emerald-700 dark:text-emerald-400 font-bold">
              Yakozwe na East African Developers Foundation
            </span>
          </p>
        </div>
      </div>
    </footer>
  )
}