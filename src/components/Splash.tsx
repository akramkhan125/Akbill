import { useEffect } from "react";
import { Logo } from "@/components/Logo";
import { APP_AUTHOR, APP_NAME } from "@/lib/bill/constants";

type Props = {
  onDone: () => void;
};

export function Splash({ onDone }: Props) {
  useEffect(() => {
    const id = window.setTimeout(onDone, 1400);
    return () => window.clearTimeout(id);
  }, [onDone]);

  return (
    <button
      type="button"
      className="splash-enter fixed inset-0 z-[60] flex flex-col items-center justify-center gap-4 bg-[var(--bg)] px-6 text-center"
      onClick={onDone}
      aria-label="Continue"
    >
      <Logo size={88} />
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-[var(--fg)]">{APP_NAME}</h1>
        <p className="mt-1 text-sm text-[var(--ac)]">Made by {APP_AUTHOR}</p>
      </div>
      <span className="mt-8 text-xs tracking-wide text-[var(--fg-subtle)]">Tap to continue</span>
    </button>
  );
}
