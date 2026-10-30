// src/components/Navbar.tsx

import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { supabase } from "../services/supabase"

export default function Navbar() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    void checkAuth()
  }, [])

  async function checkAuth() {
    const { data: { user } } = await supabase.auth.getUser()
    setIsAuthenticated(!!user)
  }

  return (
    <nav className="sticky top-0 z-50 border-b kg-border kg-surface backdrop-blur-2xl">
      <div className="mx-auto flex h-[76px] max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        
        {/* LOGO & BRANDING */}
        <Link
          to="/"
          className="group inline-flex items-center gap-3 rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-slate-500/10 via-emerald-600/15 to-emerald-800/20 p-1 border border-emerald-500/30">
            <img
              src="/favicon.svg"
              alt="Kugurisha"
              className="h-full w-full object-contain rounded-full bg-transparent"
            />
          </div>
          <span className="text-2xl font-black tracking-[-0.07em] bg-gradient-to-r from-slate-500 via-emerald-700 to-emerald-900 dark:from-slate-300 dark:via-emerald-400 dark:to-emerald-500 bg-clip-text text-transparent">
            KUGURISHA
          </span>
        </Link>

        {/* MAIN NAVIGATION LINKS (PRIMARY SITELINKS CANDIDATES) */}
        <div className="flex items-center gap-2 sm:gap-4">
          <Link
            to="/"
            className="hidden rounded-2xl px-4 py-2.5 text-xs font-bold kg-text-secondary transition hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400 sm:block"
          >
            Ahabanza
          </Link>

          <Link
            to="/about"
            className="hidden rounded-2xl px-4 py-2.5 text-xs font-bold kg-text-secondary transition hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400 sm:block"
          >
            Abo Turi Bo
          </Link>

          {isAuthenticated ? (
            <Link
              to="/profile"
              className="rounded-2xl border kg-border kg-surface px-4 py-2.5 text-xs font-black kg-text shadow-sm transition hover:border-emerald-500"
            >
              Akawunti Yange
            </Link>
          ) : (
            <Link
              to="/login"
              className="rounded-2xl border kg-border kg-surface px-4 py-2.5 text-xs font-black kg-text shadow-sm transition hover:border-emerald-500"
            >
              Injira
            </Link>
          )}

          <Link
            to="/create-listing"
            className="rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-700 to-emerald-900 px-5 py-2.5 text-xs font-black text-white shadow-lg shadow-emerald-700/25 transition hover:scale-105"
          >
            Gurisha
          </Link>
        </div>

      </div>
    </nav>
  )
}