
import { Link, useLocation } from "react-router-dom"

const footerGroups = [
  {
    title: "Urubuga",
    links: [
      { label: "Ibyiciro", to: "/categories" },
      { label: "Ibicuruzwa", to: "/#listings" },
      { label: "Ibyo dukora", to: "/about" },
      { label: "Uko rukora", to: "/how-it-works" },
    ],
  },
  {
    title: "Konti",
    links: [
      { label: "Injira", to: "/login" },
      { label: "Iyandikishe", to: "/register" },
      { label: "Gurisha", to: "/create-listing" },
      { label: "AI Search", to: "/ai-search" },
    ],
  },
]

export default function HomeFooter() {
  const { pathname } = useLocation()

  return (
    <footer className="border-t kg-border kg-surface kg-text">
      <div className="mx-auto max-w-7xl px-5 pt-10 pb-5 sm:px-8 lg:pt-12">
        <div className="grid gap-9 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr] lg:gap-12">
          {/* Brand */}
          <div>
            <Link
              to="/"
              className="group inline-flex items-center gap-2.5 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-500"
            >
              <img
                src="/favicon.svg"
                alt=""
                className="h-9 w-9 object-contain transition-transform duration-200 group-hover:scale-105"
              />

              <span className="text-xl font-extrabold tracking-[-0.055em]">
                KUGURISHA
                <span className="text-emerald-600 dark:text-emerald-400">
                  .COM
                </span>
              </span>
            </Link>

            <p className="mt-3 max-w-xs text-sm leading-6 kg-text-secondary">
              Isoko rihuza abaguzi n'abagurisha mu Rwanda.
              Gura icyo ukeneye, ugurishe icyo ufite.
            </p>
          </div>

          {/* Links */}
          {footerGroups.map((group) => (
            <div key={group.title}>
              <h2 className="text-sm font-bold kg-text">
                {group.title}
              </h2>

              <ul className="mt-4 space-y-2.5">
                {group.links.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="text-sm kg-text-muted transition-colors duration-200 hover:text-emerald-600 dark:hover:text-emerald-400"
                      onClick={
                        link.to === "/#listings" && pathname === "/"
                          ? () => {
                              document
                                .getElementById("listings")
                                ?.scrollIntoView({
                                  behavior: "smooth",
                                })
                            }
                          : undefined
                      }
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-9 flex flex-col gap-2 border-t kg-border pt-5 text-xs kg-text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} KUGURISHA.COM
          </p>

          <p>
            Yakozwe na{" "}
            <span className="font-semibold kg-text-secondary">
              East African Developers Foundation
            </span>
          </p>
        </div>
      </div>
    </footer>
  )
}
