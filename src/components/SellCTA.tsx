import { Link } from "react-router-dom"

function SellCTA() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-20">
      <div
        className="relative overflow-hidden rounded-[2rem] border px-7 py-12 shadow-[0_30px_80px_-35px_rgba(37,99,235,0.35)] sm:px-12 lg:px-16"
        style={{
          background:
            "linear-gradient(135deg, rgba(239,246,255,0.98), rgba(224,242,254,0.90), rgba(239,246,255,0.98))",
          borderColor: "rgba(96,165,250,0.20)",
        }}
      >
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-blue-500/[0.12] blur-3xl" />

        <div className="pointer-events-none absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-cyan-400/[0.10] blur-3xl" />

        <div className="pointer-events-none absolute left-1/4 top-1/2 h-40 w-40 rounded-full bg-white/80 blur-3xl" />

        <div className="relative flex flex-col justify-between gap-9 md:flex-row md:items-center">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-blue-600">
              Ufite icyo ushaka kugurisha?
            </p>

            <h2 className="mt-3 max-w-2xl text-3xl font-black tracking-[-0.035em] text-slate-950 sm:text-4xl">
              Shyira ikintu cyawe ku isoko.
            </h2>

            <p className="mt-4 max-w-xl text-sm leading-7 text-slate-600 sm:text-base">
              Shyiraho amafoto, igiciro n&apos;aho
              giherereye. Abaguzi bashobore kukibona
              kuri KUGURISHA.COM.
            </p>
          </div>

          <Link
            to="/create-listing"
            className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-7 py-4 text-sm font-black text-white shadow-[0_16px_35px_-16px_rgba(37,99,235,0.9)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_40px_-15px_rgba(37,99,235,0.9)]"
          >
            Tangira kugurisha

            <svg
              width={16}
              height={16}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
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

export default SellCTA