import { Button } from "@/components/ui/button";
import { t } from "@/lib/bill/i18n";
import { useBillStore } from "@/lib/bill/store";
import { applyUpdate } from "@/lib/bill/version";

export function UpdateBanner() {
  const lang = useBillStore((s) => s.lang);
  const updateAvailable = useBillStore((s) => s.updateAvailable);
  if (!updateAvailable) return null;
  return (
    <div className="mx-auto flex w-full max-w-lg items-center justify-between gap-3 bg-[var(--ac)] px-4 py-2.5 text-[var(--ac-fg)]">
      <p className="text-sm font-medium">{t(lang, "newVersion")}</p>
      <Button
        size="sm"
        variant="secondary"
        className="h-9 shrink-0 bg-[var(--ac-fg)] text-[var(--ac)]"
        onClick={() => void applyUpdate()}
      >
        {t(lang, "updateNow")}
      </Button>
    </div>
  );
}
