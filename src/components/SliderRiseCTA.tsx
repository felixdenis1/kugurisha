/* ═══════════════════════════════════════════════════════════════
   SliderRiseCTA — editorial CTA banner under the home slider.
   Teal/Gukodesha palette · classic typography · large 3D person.
   ═══════════════════════════════════════════════════════════════ */

export default function SliderRiseCTA() {
  return (
    <div className="group relative mt-6 overflow-hidden rounded-[2rem] border border-slate-200/80 bg-gradient-to-br from-white via-[#f5fafc] to-[#eaf4f9] shadow-[0_24px_70px_-30px_rgba(57,119,143,0.28)] backdrop-blur-xl transition-all duration-500 hover:shadow-[0_30px_80px_-30px_rgba(57,119,143,0.4)] dark:border-white/10 dark:from-[#0d1a29] dark:via-[#0a1725] dark:to-[#08131f] dark:shadow-black/60">

      {/* Ambient glows — teal primary */}
      <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[#569ab5]/25 blur-3xl dark:bg-[#569ab5]/20" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-[#6ec5c9]/20 blur-3xl dark:bg-[#6ec5c9]/12" />
      {/* Small warm accent, used sparingly */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#FF7A29]/10 blur-3xl" />

      {/* Subtle grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035] dark:opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(57,119,143,.5) 1px,transparent 1px),linear-gradient(90deg,rgba(57,119,143,.5) 1px,transparent 1px)",
          backgroundSize: "28px 28px",
          maskImage: "radial-gradient(ellipse at center, black 30%, transparent 78%)",
          WebkitMaskImage: "radial-gradient(ellipse at center, black 30%, transparent 78%)",
        }}
      />

      {/* ═══════════ LAYOUT ═══════════ */}
      <div className="relative flex flex-col gap-8 p-6 sm:flex-row sm:items-center sm:gap-10 sm:p-10">

        {/* ───── LEFT: illustrated stage (bigger, framed) ───── */}
        <div className="relative flex shrink-0 items-center justify-center sm:w-[240px]">
          {/* Stage card behind illustration */}
          <div className="relative flex h-[220px] w-[220px] items-center justify-center rounded-[1.75rem] border border-white/70 bg-white/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_12px_40px_-20px_rgba(57,119,143,0.4)] backdrop-blur-md dark:border-white/10 dark:bg-white/[0.04] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
            {/* Glow behind product */}
            <div className="pointer-events-none absolute left-1/2 top-6 h-20 w-20 -translate-x-1/2 rounded-full bg-[#6ec5c9]/40 blur-2xl dark:bg-[#6ec5c9]/30" />

            {/* ── Floating PRODUCT ── */}
            <div
              className="absolute left-1/2 top-5 -translate-x-1/2"
              style={{ animation: "kg-cta-rise 3.5s ease-in-out infinite" }}
            >
              <div className="absolute -bottom-2 left-1/2 h-2 w-12 -translate-x-1/2 rounded-full bg-[#39778f]/40 blur-md" />
              <div className="relative">
                <div className="absolute -inset-1.5 rounded-2xl bg-gradient-to-br from-[#569ab5] to-[#39778f] opacity-40 blur-lg" />
                <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#6ec5c9] via-[#569ab5] to-[#39778f] shadow-[0_10px_24px_-8px_rgba(57,119,143,0.7)] ring-1 ring-white/40">
                  <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* ── Rising CHEVRONS ── */}
            <div className="absolute left-1/2 top-[78px] -translate-x-1/2">
              <div className="flex flex-col items-center gap-1">
                {[0, 1, 2].map((i) => (
                  <svg
                    key={i}
                    className="h-3 w-4 text-[#569ab5]"
                    fill="none"
                    viewBox="0 0 24 12"
                    stroke="currentColor"
                    strokeWidth={3}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{
                      animation: `kg-cta-arrow 1.8s ease-in-out ${i * 0.2}s infinite`,
                      opacity: 0.35 + i * 0.22,
                    }}
                  >
                    <path d="M3 9 L12 3 L21 9" />
                  </svg>
                ))}
              </div>
            </div>

            {/* ── LARGE 3D PERSON looking up ── */}
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2">
              <svg
                viewBox="0 0 100 100"
                className="h-[130px] w-[130px] drop-shadow-[0_10px_16px_rgba(16,36,54,0.28)]"
                style={{ animation: "kg-cta-look 4s ease-in-out infinite" }}
              >
                <defs>
                  <radialGradient id="kgHeadGrad2" cx="35%" cy="28%" r="68%">
                    <stop offset="0%" stopColor="#fde8d5" />
                    <stop offset="55%" stopColor="#f5cba7" />
                    <stop offset="100%" stopColor="#c98a55" />
                  </radialGradient>
                  <linearGradient id="kgTorsoGrad2" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#569ab5" />
                    <stop offset="100%" stopColor="#39778f" />
                  </linearGradient>
                  <linearGradient id="kgTorsoHighlight2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.28" />
                    <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id="kgArmGrad2" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#6ec5c9" />
                    <stop offset="100%" stopColor="#569ab5" />
                  </linearGradient>
                </defs>

                {/* Ground shadow */}
                <ellipse cx="50" cy="96" rx="30" ry="4" fill="rgba(16,36,54,0.18)" />

                {/* Neck */}
                <rect x="42" y="52" width="16" height="10" rx="7" fill="#c98a55" />

                {/* Torso */}
                <path
                  d="M 26 62 Q 24 90 33 93 L 67 93 Q 76 90 74 62 Q 70 54 50 54 Q 30 54 26 62 Z"
                  fill="url(#kgTorsoGrad2)"
                />
                {/* Torso highlight panel */}
                <path
                  d="M 33 62 Q 31 82 35 88 L 44 88 Q 39 78 39 62 Z"
                  fill="url(#kgTorsoHighlight2)"
                />

                {/* Left arm raised */}
                <path
                  d="M 30 66 Q 18 58 14 44 Q 13 40 16 39 Q 19 38 21 42 Q 27 54 36 62 Z"
                  fill="url(#kgArmGrad2)"
                />
                <circle cx="15" cy="39" r="4.2" fill="#f5cba7" />

                {/* Right arm resting */}
                <path
                  d="M 70 66 Q 80 72 78 84 Q 77 88 73 87 Q 70 86 70 80 Q 70 74 64 68 Z"
                  fill="url(#kgArmGrad2)"
                />
                <circle cx="75" cy="87" r="3.4" fill="#f5cba7" />

                {/* Head tilted back */}
                <g style={{ transformOrigin: "50px 40px", transform: "rotate(-12deg)" }}>
                  <circle cx="50" cy="40" r="16" fill="url(#kgHeadGrad2)" />
                  {/* Hair cap */}
                  <path
                    d="M 34 36 Q 36 22 50 22 Q 64 22 66 36 Q 63 28 50 27 Q 37 28 34 36 Z"
                    fill="#1e293b"
                  />
                  {/* Eyes looking up */}
                  <ellipse cx="44.5" cy="36" rx="1.9" ry="2.6" fill="#1e293b" />
                  <ellipse cx="55.5" cy="36" rx="1.9" ry="2.6" fill="#1e293b" />
                  {/* Eyebrows raised (curiosity) */}
                  <path d="M 42 31 Q 44.5 30 47 31" stroke="#1e293b" strokeWidth="1" fill="none" strokeLinecap="round" />
                  <path d="M 53 31 Q 55.5 30 58 31" stroke="#1e293b" strokeWidth="1" fill="none" strokeLinecap="round" />
                  {/* Smile */}
                  <path
                    d="M 45 47 Q 50 50 55 47"
                    fill="none"
                    stroke="#1e293b"
                    strokeWidth="1.3"
                    strokeLinecap="round"
                  />
                </g>

                {/* Gaze dashed line to product */}
                <line
                  x1="50"
                  y1="22"
                  x2="50"
                  y2="2"
                  stroke="#569ab5"
                  strokeWidth="1"
                  strokeDasharray="2 3"
                  strokeLinecap="round"
                  opacity="0.55"
                  style={{ animation: "kg-cta-gaze 2.5s ease-in-out infinite" }}
                />
              </svg>
            </div>

            {/* Sparkles */}
            <span
              className="pointer-events-none absolute right-5 top-5 h-1.5 w-1.5 rounded-full bg-[#6ec5c9]"
              style={{ animation: "kg-cta-sparkle 2s ease-in-out infinite" }}
            />
            <span
              className="pointer-events-none absolute left-6 top-8 h-1 w-1 rounded-full bg-[#569ab5]"
              style={{ animation: "kg-cta-sparkle 2.4s ease-in-out 0.4s infinite" }}
            />
          </div>
        </div>

        {/* ───── RIGHT: classic editorial content ───── */}
        <div className="min-w-0 flex-1 sm:py-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#569ab5]/25 bg-[#569ab5]/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.22em] text-[#39778f] dark:border-[#6ec5c9]/25 dark:bg-[#6ec5c9]/10 dark:text-[#6ec5c9]">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inset-0 animate-ping rounded-full bg-[#569ab5] opacity-75" />
              <span className="relative flex h-1.5 w-1.5 rounded-full bg-[#569ab5]" />
            </span>
            Tangira ubu
          </div>

          <p className="mt-3 max-w-md text-sm font-medium leading-7 text-slate-600 dark:text-slate-400 sm:text-[15px]">
            Iyo ushyize ikintu kuri KUGURISHA.COM, kigera ku bantu benshi
            bafite ibyo bakeneye — mu Rwanda hose. 
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-2.5">
            <a
              href="/create-listing"
              className="group/btn relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-[#39778f] via-[#569ab5] to-[#427c94] px-5 py-2.5 text-xs font-black text-white shadow-[0_10px_24px_-8px_rgba(57,119,143,0.6)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_32px_-8px_rgba(57,119,143,0.8)] sm:text-sm"
            >
              <span className="pointer-events-none absolute inset-0 -translate-x-full bg-[linear-gradient(115deg,transparent_35%,rgba(255,255,255,.3)_50%,transparent_65%)] transition-transform duration-700 group-hover/btn:translate-x-full" />
              <svg className="relative h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.4}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              <span className="relative">Shyiraho ikintu</span>
            </a>

            <a
              href="/Listings"
              className="group/link inline-flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-white/70 px-4 py-2.5 text-xs font-bold text-slate-600 transition-all hover:border-[#39778f]/40 hover:text-[#39778f] dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300 dark:hover:text-[#6ec5c9] sm:text-sm"
            >
              Reba byose
              <svg className="h-3.5 w-3.5 transition-transform group-hover/link:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.4}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </a>
          </div>

          {/* Trust line */}
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            <span className="inline-flex items-center gap-1">
              <svg className="h-3 w-3 text-[#569ab5]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.4}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
              Ubuntu
            </span>
            <span className="h-2 w-px bg-slate-300 dark:bg-white/15" />
            <span>Abaguzi babona vuba</span>
            <span className="h-2 w-px bg-slate-300 dark:bg-white/15" />
            <span>Mu Rwanda hose</span>
          </div>
        </div>
      </div>

      {/* ═══════════ INLINE KEYFRAMES ═══════════ */}
      <style>{`
        @keyframes kg-cta-rise {
          0%, 100% { transform: translate(-50%, 0); }
          50%      { transform: translate(-50%, -8px); }
        }
        @keyframes kg-cta-arrow {
          0%, 100% { transform: translateY(0);   opacity: 0.3; }
          50%      { transform: translateY(-5px); opacity: 1; }
        }
        @keyframes kg-cta-look {
          0%, 100% { transform: translateX(-50%) rotate(0deg); }
          50%      { transform: translateX(-50%) rotate(-2deg); }
        }
        @keyframes kg-cta-gaze {
          0%, 100% { opacity: 0.2; }
          50%      { opacity: 0.85; }
        }
        @keyframes kg-cta-sparkle {
          0%, 100% { opacity: 0.2; transform: scale(0.8); }
          50%      { opacity: 1;   transform: scale(1.5); }
        }
        @media (prefers-reduced-motion: reduce) {
          [style*="kg-cta"] { animation: none !important; }
        }
      `}</style>
    </div>
  )
}