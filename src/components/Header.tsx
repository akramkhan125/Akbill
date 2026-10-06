import { ArrowLeft, Moon, Settings, Sun } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { t } from "@/lib/bill/i18n";
import { useBillStore } from "@/lib/bill/store";

export function Header() {
  const view = useBillStore((s) => s.view);
  const theme = useBillStore((s) => s.theme);
  const lang = useBillStore((s) => s.lang);
  const setTheme = useBillStore((s) => s.setTheme);
  const setView = useBillStore((s) => s.setView);
  const goBack = useBillStore((s) => s.goBack);
  const showBack = view !== "home";

  return (
    <header
      dir="ltr"
      className="sticky top-0 z-30 border-b border-[var(--border)] bg-[color-mix(in_oklab,var(--bg)_88%,transparent)] pt-[env(safe-area-inset-top)] backdrop-blur-md"
    >
      <div className="mx-auto flex h-14 max-w-lg items-center gap-1 px-2">
        <Button
          variant="ghost"
          size="icon"
          className="size-11 shrink-0"
          aria-label={t(lang, "toggleTheme")}
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          {theme === "dark" ? <Sun className="size-5" /> : <Moon className="size-5" />}
        </Button>
        {showBack ? (
          <Button
            variant="ghost"
            size="icon"
            className="size-11 shrink-0"
            aria-label={t(lang, "back")}
            onClick={goBack}
          >
            <ArrowLeft className="size-5" />
          </Button>
        ) : (
          <span className="size-2 shrink-0" />
        )}
        <div className="min-w-0 flex-1 text-center">
          <p className="truncate font-display text-sm font-semibold leading-tight text-[var(--fg)] sm:text-base">
            {t(lang, "appTitle")}
          </p>
          <p className="truncate text-[10px] leading-tight text-[var(--fg-muted)] sm:text-xs">
            {t(lang, "madeBy")}
          </p>
        </div>
        <Logo size={32} className="mx-1" />
        <Button
          variant="ghost"
          size="icon"
          className="size-11 shrink-0"
          aria-label={t(lang, "settings")}
          onClick={() => setView("settings")}
        >
          <Settings className="size-5" />
        </Button>
      </div>
    </header>
  );
}
