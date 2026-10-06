import { Calculator, ReceiptText } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { t } from "@/lib/bill/i18n";
import { useBillStore } from "@/lib/bill/store";

export function HomeView() {
  const lang = useBillStore((s) => s.lang);
  const setView = useBillStore((s) => s.setView);

  return (
    <div className="flex flex-1 flex-col items-center px-5 pb-12 pt-10">
      <div className="flex w-full max-w-lg flex-col items-center gap-4">
        <Button size="xl" className="home-cta" onClick={() => setView("bill")}>
          <ReceiptText className="size-5" />
          {t(lang, "billCalculator")}
        </Button>
        <Button size="xl" className="home-cta" onClick={() => setView("calc")}>
          <Calculator className="size-5" />
          {t(lang, "simpleCalculator")}
        </Button>
      </div>
      <div className="mt-14 flex flex-col items-center gap-3">
        <Logo size={96} />
        <div className="h-px w-16 bg-[var(--ac)]/50" />
        <p className="font-display text-sm text-[var(--fg-muted)]">{t(lang, "madeBy")}</p>
      </div>
    </div>
  );
}
