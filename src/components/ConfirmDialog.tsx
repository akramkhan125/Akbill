import { Button } from "@/components/ui/button";
import { t } from "@/lib/bill/i18n";
import { useBillStore } from "@/lib/bill/store";

type Props = {
  open: boolean;
  title: string;
  message: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({ open, title, message, danger, onConfirm, onCancel }: Props) {
  const lang = useBillStore((s) => s.lang);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      <button
        type="button"
        className="absolute inset-0 bg-[var(--overlay)]"
        aria-label={t(lang, "cancel")}
        onClick={onCancel}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        className="relative w-full max-w-sm rounded-[var(--radius-xl)] bg-[var(--bg-elevated)] p-5 shadow-[var(--shadow-modal)]"
      >
        <h2 id="confirm-title" className="font-display text-lg font-semibold text-[var(--fg)] text-balance">
          {title}
        </h2>
        <p className="mt-2 text-sm leading-normal text-[var(--fg-muted)] text-pretty">{message}</p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={onCancel}>
            {t(lang, "cancel")}
          </Button>
          <Button variant={danger ? "danger" : "default"} sound={danger ? "thud" : "click"} onClick={onConfirm}>
            {t(lang, "confirm")}
          </Button>
        </div>
      </div>
    </div>
  );
}
