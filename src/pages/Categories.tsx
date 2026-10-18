
import { useCallback, useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"

import { supabase } from "../services/supabase"

type Category = {
  id: string
  name: string
}

function Categories() {
  const navigate = useNavigate()

  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const loadCategories = useCallback(async () => {
    setLoading(true)
    setError("")

    try {
      const { data, error: queryError } = await supabase
        .from("categories")
        .select("id, name")
        .eq("is_active", true)
        .order("sort_order", { ascending: true })

      if (queryError) {
        throw queryError
      }

      setCategories(data ?? [])
    } catch (err) {
      console.error("Failed to load categories:", err)
      setError(
        "Ntibyashobotse kubona ibyiciro. Ongera ugerageze."
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadCategories()
  }, [loadCategories])

  function openCategory(category: Category) {
    navigate(`/?category=${encodeURIComponent(category.name)}`)
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f7faff] text-slate-950">
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-16 lg:px-8">
        {/* Page heading */}
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-blue-600">
              KUGURISHA.COM
            </p>

            <h1 className="mt-2 text-3xl font-black tracking-[-0.04em] sm:text-4xl">
              Ibyiciro
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
              Hitamo icyiciro cy'ibicuruzwa ushaka kureba,
              ushakishe ibyo ukeneye ku isoko ryo mu Rwanda.
            </p>
          </div>

          <Link
            to="/"
            className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:border-blue-300 hover:text-blue-600"
          >
            <svg
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
            Ahabanza
          </Link>
        </div>

        {/* Loading state */}
        {loading && (
          <div
            role="status"
            className="mt-9 rounded-3xl border border-slate-200 bg-white p-10 text-center"
          >
            <div className="mx-auto h-9 w-9 animate-spin rounded-full border-[3px] border-blue-100 border-t-blue-600" />

            <p className="mt-4 text-sm font-semibold text-slate-500">
              Turimo kuzana ibyiciro...
            </p>
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div
            role="alert"
            className="mt-9 rounded-3xl border border-red-200 bg-red-50 p-8 text-center"
          >
            <p className="text-sm font-semibold text-red-700">
              {error}
            </p>

            <button
              type="button"
              onClick={() => void loadCategories()}
              className="mt-5 rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-700"
            >
              Ongera ugerageze
            </button>
          </div>
        )}

        {/* Categories grid */}
        {!loading && !error && categories.length > 0 && (
          <>
            <div className="mt-9 flex items-center justify-between gap-3">
              <h2 className="text-sm font-bold text-slate-700">
                Hitamo icyiciro
              </h2>

              <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700">
                {categories.length} ibyiciro
              </span>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {categories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => openCategory(category)}
                  className="group relative flex min-h-[150px] flex-col items-start overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4 text-left shadow-sm transition duration-300 hover:-translate-y-1 hover:border-blue-300 hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 sm:min-h-[165px] sm:rounded-3xl sm:p-5"
                >
                  <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-blue-100/60 blur-2xl transition group-hover:bg-blue-200/80" />

                  <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition duration-300 group-hover:bg-blue-600 group-hover:text-white">
                    <svg
                      width="21"
                      height="21"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <rect x="3" y="3" width="7" height="7" rx="1.5" />
                      <rect x="14" y="3" width="7" height="7" rx="1.5" />
                      <rect x="3" y="14" width="7" height="7" rx="1.5" />
                      <rect x="14" y="14" width="7" height="7" rx="1.5" />
                    </svg>
                  </div>

                  <span className="relative mt-4 line-clamp-2 text-sm font-black leading-5 text-slate-900">
                    {category.name}
                  </span>

                  <span className="relative mt-auto flex items-center gap-1.5 pt-4 text-xs font-bold text-blue-600">
                    Reba ibicuruzwa

                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M5 12h14" />
                      <path d="m12 5 7 7-7 7" />
                    </svg>
                  </span>
                </button>
              ))}
            </div>
          </>
        )}

        {/* Empty state */}
        {!loading && !error && categories.length === 0 && (
          <div className="mt-9 rounded-3xl border border-slate-200 bg-white px-6 py-14 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <svg
                width="25"
                height="25"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect x="3" y="3" width="7" height="7" rx="1.5" />
                <rect x="14" y="3" width="7" height="7" rx="1.5" />
                <rect x="3" y="14" width="7" height="7" rx="1.5" />
                <rect x="14" y="14" width="7" height="7" rx="1.5" />
              </svg>
            </div>

            <h2 className="mt-5 text-lg font-black text-slate-900">
              Nta byiciro bihari ubu
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Ibyiciro bizagaragara hano igihe bizaba biri muri
              sisitemu.
            </p>

            <Link
              to="/"
              className="mt-6 inline-flex rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
            >
              Subira Ahabanza
            </Link>
          </div>
        )}
      </section>
    </main>
  )
}

export default Categories
