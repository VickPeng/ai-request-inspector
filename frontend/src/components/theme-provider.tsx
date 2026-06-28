"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

interface ThemeContextValue {
  theme: string;
  setTheme: (t: string) => void;
}

const ThemeCtx = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = "theme";
const DEFAULT = "dark";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState(DEFAULT);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    const t = saved === "light" || saved === "dark" ? saved : DEFAULT;
    setThemeState(t);
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(t);
    setMounted(true);
  }, []);

  const setTheme = useCallback((t: string) => {
    setThemeState(t);
    localStorage.setItem(STORAGE_KEY, t);
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(t);
  }, []);

  // Prevent hydration mismatch on first render
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeCtx.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeCtx.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeCtx);
  if (!ctx) return { theme: DEFAULT, setTheme: (_t: string) => {} };
  return ctx;
}
