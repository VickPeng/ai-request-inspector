"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/theme-provider";
import { useTranslation } from "@/lib/i18n-context";
import type { Lang } from "@/lib/i18n";
import {
  LayoutDashboard,
  List,
  BarChart3,
  Server,
  Sun,
  Moon,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "nav.dashboard", icon: LayoutDashboard },
  { href: "/logs", label: "nav.logs", icon: List },
  { href: "/models", label: "nav.models", icon: BarChart3 },
];

export function Sidebar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { t, lang, setLang } = useTranslation();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-56 border-r bg-sidebar flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-2.5 px-5 pt-6 pb-5">
        <div className="h-7 w-7 rounded-md bg-sidebar-primary flex items-center justify-center">
          <Server className="h-4 w-4 text-sidebar-primary-foreground" />
        </div>
        <span className="font-semibold text-sm tracking-tight">{t("app.title")}</span>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-0.5 px-3 flex-1">
        {navItems.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )}
            >
              <item.icon className={cn("h-4 w-4", active && "text-sidebar-primary")} />
              {t(item.label as any)}
            </Link>
          );
        })}
      </nav>

      {/* Bottom: toggles */}
      <div className="px-3 pb-4 flex flex-col gap-1.5 border-t border-sidebar-border pt-4">
        {/* Theme toggle */}
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-all"
        >
          {theme === "dark" ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
          {theme === "dark" ? t("theme.light") : t("theme.dark")}
        </button>

        {/* Lang toggle */}
        <div className="flex rounded-md border border-sidebar-border overflow-hidden">
          {(["en", "zh"] as Lang[]).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={cn(
                "flex-1 px-3 py-2 text-xs font-medium transition-colors",
                lang === l
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent/50"
              )}
            >
              {t(l === "en" ? "lang.en" : "lang.zh")}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
