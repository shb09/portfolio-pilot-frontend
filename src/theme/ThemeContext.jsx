import { createContext, useContext, useEffect, useState } from "react";

/**
 * Paper light is the default; carbon dark is the option.
 * Any stored legacy value (porcelain/charcoal/emerald/ivory/…) migrates
 * to paper so no stale theme can resurrect old styling.
 */
const THEMES = ["paper", "carbon"];
const ThemeContext = createContext({ theme: "paper", toggle: () => {}, setTheme: () => {} });

function stored() {
  try {
    const raw = localStorage.getItem("pp_theme") || "paper";
    return THEMES.includes(raw) ? raw : "paper";
  } catch {
    return "paper";
  }
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(stored);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem("pp_theme", theme);
    } catch {
      /* private mode: theme just won't persist */
    }
  }, [theme]);

  const toggle = () => setTheme((t) => (t === "paper" ? "carbon" : "paper"));

  return <ThemeContext.Provider value={{ theme, toggle, setTheme }}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);
