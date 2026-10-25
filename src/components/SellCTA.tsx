
import { Link } from "react-router-dom"

export default function SellCTA() {
  return (
    <section
      aria-labelledby="sell-cta-title"
      className="mx-auto max-w-7xl px-4 py-9 sm:px-6 lg:py-12"
    >
      <div className="relative overflow-hidden rounded-[22px] border border-[var(--glass-border)] bg-[var(--surface)] shadow-[var(--card-shadow)]">
        {/* Small brand accent */}
        <div
          aria-hidden="true"
          className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-blue-600 to-cyan-400"
        />

        <div className="flex flex-col gap-6 px-6 py-7 sm:px-9 sm:py-8 lg:flex-row lg:items-center lg:justify-between lg:gap-12 lg:px-11">
          {/* Text */}
          <div className="min-w-0 max-w-2xl">
            <p className="mb-2 text-[11px] font-extrabold uppercase tracking-[0.14em] text-blue-600 dark:text-cyan-400">
              Ufite icyo ushaka kugurisha?
            </p>

            <h2
              id="sell-cta-title"
              className="text-[clamp(1.45rem,2.7vw,2.15rem)] font-extrabold leading-tight tracking-[-0.04em] text-[var(--text)]"
            >
              Icyo ufite, hari ugikeneye.
            </h2>

            <p className="mt-2.5 max-w-xl text-sm leading-6 text-[var(--text-secondary)]">
              Shyiraho amafoto n&apos;ibisobanuro by&apos;icyo
              ushaka kugurisha. Abaguzi bakibone,
              mubashe kuvugana no kumvikana.
            </p>
          </div>

          {/* Action */}
          <Link
            to="/create-listing"
            className="group inline-flex w-full shrink-0 items-center justify-center gap-3 self-start rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-500 sm:w-auto lg:self-center"
          >
            Tangira kugurisha

            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className="transition-transform duration-200 group-hover:translate-x-1"
            >
              <path d="M5 12h14" />
              <path d="m13 6 6 6-6 6" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  )
}
