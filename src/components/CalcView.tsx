import { Delete } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import {
  handleKey,
  initialCalc,
  inputBack,
  inputClear,
  inputDigit,
  inputDot,
  inputEq,
  inputOp,
  inputPct,
  type CalcState,
  type Op,
} from "@/lib/bill/calculator";
import { useBillStore } from "@/lib/bill/store";
import { cn } from "@/lib/utils";

const KEYS: { label: string; action: string; span?: boolean; tone?: "op" | "eq" | "fn" }[] = [
  { label: "C", action: "C", tone: "fn" },
  { label: "⌫", action: "Backspace", tone: "fn" },
  { label: "%", action: "%", tone: "fn" },
  { label: "÷", action: "/", tone: "op" },
  { label: "7", action: "7" },
  { label: "8", action: "8" },
  { label: "9", action: "9" },
  { label: "×", action: "*", tone: "op" },
  { label: "4", action: "4" },
  { label: "5", action: "5" },
  { label: "6", action: "6" },
  { label: "−", action: "-", tone: "op" },
  { label: "1", action: "1" },
  { label: "2", action: "2" },
  { label: "3", action: "3" },
  { label: "+", action: "+", tone: "op" },
  { label: "0", action: "0", span: true },
  { label: ".", action: "." },
  { label: "=", action: "=", tone: "eq" },
];

export function CalcView() {
  const [state, setState] = useState<CalcState>(initialCalc);
  const beep = useBillStore((s) => s.beep);

  const applyKey = useCallback(
    (key: string) => {
      setState((prev) => {
        const next = handleKey(prev, key);
        return next ?? prev;
      });
      beep("click");
    },
    [beep],
  );

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      const next = handleKey(state, e.key);
      if (!next) return;
      e.preventDefault();
      applyKey(e.key);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [state, applyKey]);

  function press(action: string) {
    if (action === "C") {
      setState(inputClear());
      beep("click");
      return;
    }
    if (action === "Backspace") {
      setState((s) => inputBack(s));
      beep("click");
      return;
    }
    if (action === "%") {
      setState((s) => inputPct(s));
      beep("click");
      return;
    }
    if (action === ".") {
      setState((s) => inputDot(s));
      beep("click");
      return;
    }
    if (action === "=") {
      setState((s) => inputEq(s));
      beep("click");
      return;
    }
    if (action === "+" || action === "-" || action === "*" || action === "/") {
      setState((s) => inputOp(s, action as Exclude<Op, null>));
      beep("click");
      return;
    }
    setState((s) => inputDigit(s, action));
    beep("click");
  }

  return (
    <div className="mx-auto flex w-full max-w-sm flex-1 flex-col px-4 py-6">
      <div className="card-surface flex flex-1 flex-col p-4">
        <div className="flex min-h-28 flex-col items-end justify-end rounded-[var(--radius-md)] bg-[var(--bg)] px-4 py-5">
          <p className="text-xs text-[var(--fg-subtle)]">{state.op ? state.op : "\u00a0"}</p>
          <p className="max-w-full truncate font-display text-4xl font-semibold tabular-nums tracking-tight text-[var(--fg)]">
            {state.display}
          </p>
        </div>
        <div className="mt-4 grid grid-cols-4 gap-2">
          {KEYS.map((k) => (
            <button
              key={k.label}
              type="button"
              onClick={() => press(k.action)}
              className={cn(
                "h-14 rounded-[var(--radius-md)] text-lg font-medium transition-[transform,background] duration-[var(--motion-quick)] active:scale-[0.96]",
                k.span && "col-span-2",
                k.tone === "eq" && "btn-primary text-[var(--ac-fg)]",
                k.tone === "op" && "bg-[var(--surface-2)] text-[var(--ac)]",
                k.tone === "fn" && "bg-[var(--surface-2)] text-[var(--fg-muted)]",
                !k.tone && "bg-[var(--bg-elevated)] text-[var(--fg)] shadow-[var(--shadow-border)]",
              )}
            >
              {k.action === "Backspace" ? <Delete className="mx-auto size-5" /> : k.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
