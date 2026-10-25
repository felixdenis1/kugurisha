
import { Link } from "react-router-dom"

export default function MovingStory() {
  return (
    <section
      aria-labelledby="moving-story-title"
      className="mx-auto max-w-7xl px-4 pt-12 pb-5 sm:px-6 lg:pt-16"
    >
      <div className="grid items-center gap-8 md:grid-cols-2 lg:gap-14">
        {/* LEFT: MESSAGE */}
        <div className="max-w-xl">
          <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.15em] text-blue-600 dark:text-cyan-400">
            KUGURISHA.COM · Uburyo bworoshye
          </p>

          <h2
            id="moving-story-title"
            className="text-2xl font-extrabold leading-tight tracking-[-0.045em] text-[var(--text)] sm:text-3xl"
          >
            Ese ufite gahunda yo kwimuka?
          </h2>

          <p className="mt-4 text-base leading-8 text-[var(--text-secondary)]">
            Ese ugize gahunda yo kwimuka, ariko ukaba
            udafite gahunda yo kwimukana ibintu byose?
            Erekana ibyo udashaka kwimukana hano,
            ubone ababikeneye, muvugane babigure.
          </p>

          <Link
            to="/create-listing"
            className="group mt-6 inline-flex items-center gap-2 text-sm font-bold text-blue-600 transition-colors hover:text-blue-700 dark:text-cyan-400"
          >
            Erekana ibyo ushaka kugurisha
            <span
              aria-hidden="true"
              className="transition-transform group-hover:translate-x-1"
            >
              →
            </span>
          </Link>
        </div>

        {/* RIGHT: ANIMATED 2D SCENE */}
        <div className="relative overflow-hidden rounded-2xl border border-[var(--glass-border)] bg-[var(--surface)] p-4 sm:p-6">
          <svg
            viewBox="0 0 480 300"
            className="mx-auto block h-auto w-full max-w-[440px]"
            role="img"
            aria-label="Umuntu uri kwimuka, afite ibikoresho, akoresha telefoni kugira ngo abishyire ku isoko"
          >
            {/* Floor */}
            <ellipse
              cx="240"
              cy="269"
              rx="194"
              ry="13"
              fill="#8bb5d1"
              opacity=".13"
            />

            {/* Moving boxes */}
            <g className="kg-moving-box">
              <rect
                x="48"
                y="174"
                width="103"
                height="84"
                rx="7"
                fill="#c99a67"
              />
              <path
                d="M48 195H151M99 174V258"
                stroke="#9d7148"
                strokeWidth="3"
              />
              <rect
                x="65"
                y="211"
                width="35"
                height="22"
                rx="3"
                fill="#f0d4a9"
              />
            </g>

            <g className="kg-moving-box kg-moving-box-two">
              <rect
                x="128"
                y="209"
                width="91"
                height="49"
                rx="6"
                fill="#ddb17f"
              />
              <path
                d="M128 224H219M173 209V258"
                stroke="#ac8052"
                strokeWidth="3"
              />
            </g>

            {/* Person */}
            <g className="kg-moving-person">
              <path
                d="M267 158L254 252"
                stroke="#354b67"
                strokeWidth="17"
                strokeLinecap="round"
              />
              <path
                d="M302 158L323 252"
                stroke="#354b67"
                strokeWidth="17"
                strokeLinecap="round"
              />
              <path
                d="M246 252H267M313 252H337"
                stroke="#22364c"
                strokeWidth="10"
                strokeLinecap="round"
              />

              <path
                d="M260 95Q281 83 303 97L317 173H247Z"
                fill="#347cb1"
              />

              <path
                d="M259 111L232 150L208 139"
                fill="none"
                stroke="#e5ad85"
                strokeWidth="12"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              <path
                d="M305 111L331 146L346 128"
                fill="none"
                stroke="#e5ad85"
                strokeWidth="12"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              <rect
                x="338"
                y="104"
                width="24"
                height="39"
                rx="5"
                fill="#253b52"
                transform="rotate(12 350 123)"
              />
              <rect
                x="342"
                y="109"
                width="16"
                height="26"
                rx="2"
                fill="#a5dcf4"
                transform="rotate(12 350 123)"
              />

              <circle cx="281" cy="66" r="28" fill="#e9b48e" />
              <path
                d="M254 65Q248 29 280 32Q311 31 309 66L298 49Q274 58 254 65Z"
                fill="#263b50"
              />
              <circle cx="272" cy="68" r="2" fill="#263b50" />
              <circle cx="292" cy="68" r="2" fill="#263b50" />
              <path
                d="M276 81Q282 77 288 81"
                stroke="#8f5e4a"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
              />
            </g>

            {/* Question bubble */}
            <g className="kg-moving-question">
              <circle cx="191" cy="63" r="25" fill="#e7f3fb" />
              <text
                x="191"
                y="73"
                textAnchor="middle"
                fontSize="28"
                fontWeight="800"
                fill="#347cb1"
              >
                ?
              </text>
            </g>

            {/* Marketplace card */}
            <g className="kg-moving-listing">
              <rect
                x="361"
                y="160"
                width="99"
                height="92"
                rx="12"
                fill="#f0f8ff"
                stroke="#a7cfe8"
                strokeWidth="2"
              />
              <rect
                x="373"
                y="172"
                width="75"
                height="43"
                rx="6"
                fill="#b6d9ec"
              />
              <path
                d="M380 208L397 191L408 201L423 183L442 208"
                fill="none"
                stroke="#4e96bc"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M376 225H436M376 235H416"
                stroke="#7ca9c2"
                strokeWidth="4"
                strokeLinecap="round"
              />
              <circle cx="449" cy="162" r="12" fill="#22c55e" />
              <path
                d="M444 162L448 166L455 158"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>

            {/* Motion trail */}
            <g className="kg-moving-spark">
              <path
                d="M370 130L390 115M370 115L390 130"
                stroke="#48a5d2"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </g>
          </svg>
        </div>
      </div>

      <style>{`
        @keyframes kgMovingFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-7px); }
        }

        @keyframes kgMovingAppear {
          0%, 15% { opacity: 0; transform: translateY(10px); }
          35%, 90% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(5px); }
        }

        @keyframes kgMovingThink {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }

        .kg-moving-person {
          animation: kgMovingFloat 4s ease-in-out infinite;
          transform-origin: center bottom;
        }

        .kg-moving-question {
          animation: kgMovingThink 2.5s ease-in-out infinite;
        }

        .kg-moving-listing {
          animation: kgMovingAppear 6s ease-in-out infinite;
        }

        .kg-moving-spark {
          animation: kgMovingAppear 6s ease-in-out infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .kg-moving-person,
          .kg-moving-question,
          .kg-moving-listing,
          .kg-moving-spark {
            animation: none !important;
          }
        }
      `}</style>
    </section>
  )
}
