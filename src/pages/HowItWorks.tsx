
import { Link } from "react-router-dom"

const steps = [
  {
    number: "01",
    title: "Shakisha icyo ukeneye",
    description:
      "Koresha search ya KUGURISHA.COM ushakishe ibicuruzwa, urebe ibyiciro bitandukanye, kandi ugereranye ibyo ubonye.",
    icon: (
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
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-4-4" />
      </svg>
    ),
    color: "blue",
  },
  {
    number: "02",
    title: "Reba ibisobanuro",
    description:
      "Fungura itangazo urebe amafoto, igiciro, aho igicuruzwa giherereye n'ibindi bisobanuro byatanzwe n'ugurisha.",
    icon: (
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
        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
    color: "indigo",
  },
  {
    number: "03",
    title: "Vugana n'ugurisha",
    description:
      "Koresha uburyo bwo kohereza ubutumwa kugira ngo ubaze ibibazo, usobanuze ibisigaye kandi muganire ku gicuruzwa.",
    icon: (
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
        <path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5Z" />
      </svg>
    ),
    color: "emerald",
  },
  {
    number: "04",
    title: "Mwumvikane ku gicuruzwa",
    description:
      "Muganire ku giciro, aho muzahurira n'uburyo bwo guhererekanya igicuruzwa. Banza ugenzure neza ibyo uguze mbere yo kwishyura.",
    icon: (
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
        <path d="M12 3 4 7v5c0 5 3.5 8 8 9 4.5-1 8-4 8-9V7l-8-4Z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
    color: "amber",
  },
]

function HowItWorks() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f7faff] text-slate-950">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-blue-100 bg-white">
        <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-blue-100/70 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-20 h-72 w-72 rounded-full bg-indigo-100/60 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:border-blue-300 hover:text-blue-600"
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

          <div className="mx-auto mt-10 max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-blue-700">
              <span className="h-2 w-2 rounded-full bg-blue-600" />
              KUGURISHA.COM
            </span>

            <h1 className="mt-6 text-4xl font-black leading-tight tracking-[-0.045em] sm:text-5xl lg:text-6xl">
              Kumenya uko bikora
              <span className="block text-blue-600">
                biroroshye.
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
              Waba ushaka kugura cyangwa kugurisha, KUGURISHA.COM
              igufasha gushakisha ibicuruzwa, kureba ibisobanuro
              no kuvugana n'abantu mufitanye inyungu ku isoko.
            </p>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                to="/"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-black text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700"
              >
                Tangira gushakisha
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
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </Link>

              <Link
                to="/create-listing"
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-bold text-slate-700 transition hover:border-blue-300 hover:text-blue-600"
              >
                Shyiraho itangazo
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">
            Intambwe ku yindi
          </p>
          <h2 className="mt-3 text-3xl font-black tracking-[-0.04em] sm:text-4xl">
            Uko ugura kuri KUGURISHA.COM
          </h2>
          <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
            Kurikiza izi ntambwe kugira ngo ubone icyo ukeneye
            kandi ubashe kuvugana n'ugurisha.
          </p>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => (
            <article
              key={step.number}
              className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/50 sm:p-7"
            >
              <span className="absolute right-5 top-5 text-4xl font-black tracking-tighter text-slate-100 transition group-hover:text-blue-100">
                {step.number}
              </span>

              <div
                className={`relative flex h-12 w-12 items-center justify-center rounded-2xl ${
                  step.color === "blue"
                    ? "bg-blue-50 text-blue-600"
                    : step.color === "indigo"
                      ? "bg-indigo-50 text-indigo-600"
                      : step.color === "emerald"
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-amber-50 text-amber-600"
                }`}
              >
                {step.icon}
              </div>

              <h3 className="relative mt-6 text-lg font-black leading-6">
                {step.title}
              </h3>

              <p className="mt-3 text-sm leading-7 text-slate-600">
                {step.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* Selling */}
      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-2 lg:px-8">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">
              Ku bagurisha
            </p>

            <h2 className="mt-3 text-3xl font-black tracking-[-0.04em] sm:text-4xl">
              Ufite icyo ushaka kugurisha?
            </h2>

            <p className="mt-5 text-sm leading-7 text-slate-600 sm:text-base">
              Shyiraho itangazo ririmo amakuru y'igicuruzwa,
              amafoto meza n'igiciro. Abantu bashobora kuribona
              bakakwandikira kugira ngo babaze ibisobanuro
              cyangwa baganire nawe.
            </p>

            <ul className="mt-6 space-y-4">
              {[
                "Tanga amakuru yumvikana ku gicuruzwa.",
                "Ongeraho amafoto agaragaza uko giteye.",
                "Subiza ibibazo by'abaguzi mu buryo bwumvikana.",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="m5 12 4 4L19 6" />
                    </svg>
                  </span>
                  <span className="text-sm leading-6 text-slate-700">
                    {item}
                  </span>
                </li>
              ))}
            </ul>

            <Link
              to="/create-listing"
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-black text-white transition hover:bg-blue-700"
            >
              Tangira kugurisha
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
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </Link>
          </div>

          <div className="relative">
            <div className="absolute -inset-3 rounded-[2rem] bg-gradient-to-br from-blue-100 via-indigo-50 to-white blur-xl" />

            <div className="relative rounded-3xl border border-slate-200 bg-[#f7faff] p-6 sm:p-8">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white">
                  <svg
                    width="27"
                    height="27"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M3 10h18" />
                    <path d="M5 10V6l7-3 7 3v4" />
                    <path d="M5 10v10h14V10" />
                    <path d="M9 20v-5h6v5" />
                  </svg>
                </div>
                <div>
                  <p className="font-black">Kwamamaza ibyo ufite</p>
                  <p className="mt-1 text-sm text-slate-500">
                    Byoroshye, intambwe ku yindi
                  </p>
                </div>
              </div>

              <div className="mt-7 space-y-3">
                {[
                  ["1", "Fungura konti yawe"],
                  ["2", "Shyiraho itangazo"],
                  ["3", "Tegereza abaguzi bakwandikire"],
                ].map(([number, label]) => (
                  <div
                    key={number}
                    className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-sm font-black text-blue-700">
                      {number}
                    </span>
                    <span className="text-sm font-bold text-slate-700">
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Safety */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M12 3 4 7v5c0 5 3.5 8 8 9 4.5-1 8-4 8-9V7l-8-4Z" />
                <path d="M12 8v4" />
                <path d="M12 16h.01" />
              </svg>
            </div>

            <div>
              <h2 className="text-lg font-black text-amber-950">
                Jya ugura witonze
              </h2>
              <p className="mt-2 text-sm leading-7 text-amber-900/80">
                Banza urebe neza igicuruzwa n'ibisobanuro byacyo,
                ubaze ibibazo bikenewe kandi mwumvikane ku buryo
                bwo guhererekanya igicuruzwa. Ntukohereze amafaranga
                utabanje kugenzura amakuru n'ubwizerwe bw'uwo
                muganira. KUGURISHA.COM ihuza abaguzi n'abagurisha;
                buri ruhande rugomba kwitwararika mu masezerano
                rugirana n'urundi.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 sm:pb-20 lg:px-8">
        <div className="relative overflow-hidden rounded-[2rem] bg-slate-950 px-6 py-10 text-white sm:px-10 sm:py-14 lg:px-14">
          <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full bg-blue-500/30 blur-3xl" />

          <div className="relative flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-black tracking-[-0.04em] sm:text-4xl">
                Witeguye gutangira?
              </h2>
              <p className="mt-4 text-sm leading-7 text-slate-300 sm:text-base">
                Shakisha icyo ukeneye cyangwa ushyireho itangazo
                ryawe kuri KUGURISHA.COM.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                to="/"
                className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-black text-white transition hover:bg-blue-500"
              >
                Shakisha ibicuruzwa
              </Link>

              <Link
                to="/create-listing"
                className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/5 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-white/10"
              >
                Gurisha
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

export default HowItWorks
