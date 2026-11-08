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

const socialLinks = [
  {
    name: "Instagram",
    url: "https://www.instagram.com/eafricandevelopers/",
    path: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z",
  },
  {
    name: "LinkedIn",
    url: "https://www.linkedin.com/in/east-african-developers-foundation-78505944a/",
    path: "M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z",
  },
  {
    name: "TikTok",
    url: "https://www.tiktok.com/@felixdenis_",
    path: "M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z",
  },
  {
    name: "Threads",
    url: "https://www.threads.com/@eafricandevelopers",
    path: "M12.186 24h-.007C5.495 24 0 18.625 0 11.95 0 5.276 5.495 0 12.179 0h.014c6.677 0 12.08 5.397 12.08 12.057 0 6.634-5.325 12-11.979 12h-.008zm-.014-22C6.586 2 2 6.586 2 12.05 2 17.514 6.586 22 12.172 22h.007c5.514 0 9.98-4.448 9.98-9.943 0-5.514-4.466-9.957-9.979-9.957zm1.758 14.502c-1.127.525-2.527.756-3.877.756-3.69 0-6.195-2.227-6.195-5.992 0-3.64 2.455-5.972 6.075-5.972 3.013 0 5.068 1.764 5.068 4.786 0 2.924-1.579 4.887-3.957 4.965-1.173.039-2.078-.309-2.709-1.025-.568-.642-.876-1.578-.898-2.735-.045-2.14 1.341-3.666 3.196-3.666 1.139 0 1.944.475 2.274 1.363.178.477.262 1.05.262 1.737 0 .809-.136 1.547-.394 2.152-.303.708-.85 1.144-1.616 1.144-.805 0-1.396-.451-1.531-1.218-.112-.633-.146-1.398-.106-2.247.05-1.02.261-1.892.62-2.551.411-.767 1.137-1.196 2.072-1.196 1.418 0 2.378 1.054 2.378 2.96 0 1.332-.249 2.484-.71 3.238-.403.659-.971 1.025-1.67 1.025z",
  },
  {
    name: "X (Twitter)",
    url: "https://x.com/felixdenis_",
    path: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z",
  },
  {
    name: "Facebook",
    url: "https://web.facebook.com/tuyizere.denys.1",
    path: "M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.376 14.5 5 15.5 5H18V0h-3.808C10.5 0 9 1.5 9 4.615V8z",
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

        {/* Bottom bar with Social Icons */}
        <div className="mt-9 flex flex-col gap-4 border-t kg-border pt-5 text-xs kg-text-muted sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
            <p>
              © {new Date().getFullYear()} KUGURISHA.COM
            </p>

            {/* Social Media Links */}
            <div className="flex items-center gap-3.5">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.name}
                  className="kg-text-muted transition-colors duration-200 hover:text-emerald-600 dark:hover:text-emerald-400"
                >
                  <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                    <path d={social.path} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

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