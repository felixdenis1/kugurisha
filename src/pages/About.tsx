
import { Link } from "react-router-dom"

function About() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f7faff] text-slate-950">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-blue-100 bg-white">
        <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-blue-100/70 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-20 h-72 w-72 rounded-full bg-indigo-100/60 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
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

          <div className="mt-10 grid items-center gap-12 lg:grid-cols-[1.15fr_0.85fr]">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-blue-700">
                <span className="h-2 w-2 rounded-full bg-blue-600" />
                KUGURISHA.COM
              </span>

              <h1 className="mt-6 max-w-3xl text-4xl font-black leading-[1.1] tracking-[-0.045em] sm:text-5xl lg:text-6xl">
                Turi kumwe mu
                <span className="block text-blue-600">
                  isoko ryo mu Rwanda.
                </span>
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
                KUGURISHA.COM ni urubuga rugamije korohereza
                Abanyarwanda kugura no kugurisha, bahuriza hamwe
                abakeneye ibicuruzwa na serivisi n'abafite ibyo
                batanga ku isoko.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/create-listing"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-black text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700"
                >
                  Gurisha ubu
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
                  to="/"
                  className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-bold text-slate-700 transition hover:border-blue-300 hover:text-blue-600"
                >
                  Reba ibicuruzwa
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-3 rounded-[2rem] bg-gradient-to-br from-blue-100 via-indigo-50 to-white blur-xl" />

              <div className="relative overflow-hidden rounded-[1.75rem] border border-blue-100 bg-white p-6 shadow-xl shadow-slate-200/60 sm:p-8">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
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
                      <path d="m3 10 9-7 9 7" />
                      <path d="M5 9v11h14V9" />
                      <path d="M9 20v-6h6v6" />
                    </svg>
                  </div>

                  <div>
                    <p className="text-lg font-black tracking-tight">
                      Isoko rimwe
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Amahirwe menshi kuri buri wese
                    </p>
                  </div>
                </div>

                <div className="my-7 h-px bg-slate-100" />

                <div className="space-y-5">
                  <div className="flex gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <svg
                        width="20"
                        height="20"
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
                    </div>
                    <div>
                      <h2 className="font-extrabold">Kugura byoroshye</h2>
                      <p className="mt-1 text-sm leading-6 text-slate-500">
                        Shakisha ibicuruzwa, urebe ibisobanuro
                        hanyuma uhuze n'ubigurisha.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                      <svg
                        width="20"
                        height="20"
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
                      <h2 className="font-extrabold">Kugurisha byoroshye</h2>
                      <p className="mt-1 text-sm leading-6 text-slate-500">
                        Shyiraho amatangazo y'ibyo ugurisha,
                        wongere amahirwe yo kubonwa n'ababikeneye.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                      <svg
                        width="20"
                        height="20"
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
                    </div>
                    <div>
                      <h2 className="font-extrabold">Guhana amakuru</h2>
                      <p className="mt-1 text-sm leading-6 text-slate-500">
                        Abaguzi n'abacuruzi bashobora kuvugana
                        kugira ngo bumvikane ku bicuruzwa.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-7 rounded-2xl bg-slate-50 p-4">
                  <p className="text-sm font-extrabold text-slate-800">
                    🇷🇼 Isoko ryawe ryo mu Rwanda
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Gura icyo ushaka. Gurisha icyo ufite.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission and vision */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">
            Icyo tugamije
          </p>
          <h2 className="mt-3 text-3xl font-black tracking-[-0.04em] sm:text-4xl">
            Korohereza abantu gucuruzanya.
          </h2>
          <p className="mt-4 text-base leading-8 text-slate-600">
            Twifuza ko kubona ibyo umuntu akeneye no kugeza ibyo
            afite ku bandi byoroha, hifashishijwe urubuga rumwe
            rworoshye gukoresha kandi rwubakiye ku byo abakoresha
            bo mu Rwanda bakeneye.
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          <article className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/50 sm:p-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white">
              <svg
                width="23"
                height="23"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="m8 12 2.5 2.5L16 9" />
              </svg>
            </div>

            <h3 className="mt-5 text-xl font-black">Intego yacu</h3>
            <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
              Guhuza abaguzi n'abagurisha, koroshya kubona
              ibicuruzwa no gufasha abantu kwamamaza ibyo bafite
              ku buryo bworoshye.
            </p>
          </article>

          <article className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/50 sm:p-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 transition group-hover:bg-indigo-600 group-hover:text-white">
              <svg
                width="23"
                height="23"
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
            </div>

            <h3 className="mt-5 text-xl font-black">Icyerekezo cyacu</h3>
            <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
              Gukomeza guteza imbere isoko ryo kuri internet
              ryorohereza Abanyarwanda kugura no kugurisha ibintu
              bitandukanye, harimo ibikoresho, ibikoresho byo mu
              rugo, ubutaka n'amazu.
            </p>
          </article>
        </div>
      </section>

      {/* Values */}
      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">
              Amahame yacu
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-[-0.04em] sm:text-4xl">
              Ibyo twubakiraho
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
              Dushaka gukora urubuga rworoshye, rufasha abantu
              kandi rukomeza kunozwa hashingiwe ku byo bakeneye.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-[#f7faff] p-6">
              <span className="text-2xl" aria-hidden="true">🤝</span>
              <h3 className="mt-4 font-black">Guhuza abantu</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Korohereza abaguzi n'abagurisha kubona abo
                bahuza n'ibyo bakeneye.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-[#f7faff] p-6">
              <span className="text-2xl" aria-hidden="true">💡</span>
              <h3 className="mt-4 font-black">Ubworoherane</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Gutegura uburyo bworoshye bwo gushakisha no
                gushyira amatangazo ku rubuga.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-[#f7faff] p-6 sm:col-span-2 lg:col-span-1">
              <span className="text-2xl" aria-hidden="true">🇷🇼</span>
              <h3 className="mt-4 font-black">Kwita ku Rwanda</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Kubaka ubunararibonye bujyanye n'ibyo abakoresha
                bo mu Rwanda bakeneye.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="relative overflow-hidden rounded-[2rem] bg-slate-950 px-6 py-10 text-white sm:px-10 sm:py-14 lg:px-14">
          <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full bg-blue-500/30 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-28 left-1/3 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl" />

          <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-300">
                Tangira uyu munsi
              </p>
              <h2 className="mt-3 text-3xl font-black tracking-[-0.04em] sm:text-4xl">
                Ufite icyo ushaka kugurisha?
              </h2>
              <p className="mt-4 text-sm leading-7 text-slate-300 sm:text-base">
                Shyira itangazo ryawe kuri KUGURISHA.COM,
                cyangwa ushakishe ibicuruzwa ushaka kugura.
              </p>
            </div>

            <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
              <Link
                to="/create-listing"
                className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-black text-white transition hover:bg-blue-500"
              >
                Tangira kugurisha
              </Link>

              <Link
                to="/"
                className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/5 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-white/10"
              >
                Shakisha ibicuruzwa
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

export default About
