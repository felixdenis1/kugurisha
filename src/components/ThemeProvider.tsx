import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"

export type Theme = "dark" | "light"

type ThemeContextValue = {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

const ThemeContext =
  createContext<ThemeContextValue | undefined>(
    undefined,
  )

const STORAGE_KEY = "kugurisha-theme"

function getInitialTheme(): Theme {
  if (typeof window === "undefined") {
    return "dark"
  }

  const savedTheme =
    window.localStorage.getItem(STORAGE_KEY)

  if (
    savedTheme === "dark" ||
    savedTheme === "light"
  ) {
    return savedTheme
  }

  return "dark"
}

function applyTheme(theme: Theme) {
  if (typeof document === "undefined") {
    return
  }

  const root = document.documentElement

  root.setAttribute("data-theme", theme)
  root.style.colorScheme = theme
}

export function ThemeProvider({
  children,
}: {
  children: ReactNode
}) {
  const [theme, setThemeState] =
    useState<Theme>(getInitialTheme)

  useEffect(() => {
    applyTheme(theme)

    window.localStorage.setItem(
      STORAGE_KEY,
      theme,
    )
  }, [theme])

  const setTheme = (nextTheme: Theme) => {
    setThemeState(nextTheme)
  }

  const toggleTheme = () => {
    setThemeState((current) =>
      current === "dark" ? "light" : "dark",
    )
  }

  const value = useMemo(
    () => ({
      theme,
      setTheme,
      toggleTheme,
    }),
    [theme],
  )

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)

  if (!context) {
    throw new Error(
      "useTheme igomba gukoreshwa imbere muri ThemeProvider.",
    )
  }

  return context
}