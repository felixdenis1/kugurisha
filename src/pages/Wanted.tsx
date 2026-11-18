import { Link, useSearchParams } from "react-router-dom"
import { useEffect, useState } from "react"
import WantedFeed from "../components/WantedFeed"

export default function Wanted() {
  const [params] = useSearchParams()
  const posted = params.get("posted")
  const [showSuccess, setShowSuccess] = useState(Boolean(posted))

  useEffect(() => {
    if (posted) {
      const t = setTimeout(() => setShowSuccess(false), 5000)
      return () => clearTimeout(t)
    }
  }, [posted])

  return (
    <main className="min-h-screen bg-[#f5f9fb] px-4 py-10 text-[#102436] dark:bg-[#07111c] dark:text-slate-100 sm:px-6 sm:py-14">
      <div className="mx-auto max-w-7xl">
        {showSuccess && (
          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm font-bold text-emerald-700 dark:text-emerald-300">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-white">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.6}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </span>
            Icyifuzo cyawe cyashyizweho! Abagurisha bazakibona.
          </div>
        )}

        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 transition hover:text-[#39778f] dark:text-slate-400"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.4}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Ahabanza
          </Link>
        </div>

        <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
          Ibyifuzo{" "}
          <span className="bg-[linear-gradient(110deg,#39778f_0%,#569ab5_50%,#6ec5c9_100%)] bg-clip-text text-transparent">
            by'Abaguzi
          </span>
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-400">
          Abaguzi bavuga icyo bashaka. Niba ufite ikintu kibakwiriye, hamagara cyangwa ubatumire ubutumwa.
        </p>

        <div className="mt-8">
          <WantedFeed />
        </div>
      </div>
    </main>
  )
}