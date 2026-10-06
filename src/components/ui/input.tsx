import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-[var(--radius-md)] bg-[var(--bg-elevated)] px-3 text-base text-[var(--fg)] shadow-[var(--shadow-border)] placeholder:text-[var(--fg-subtle)]",
        "transition-[box-shadow] duration-[var(--motion-quick)] ease-[var(--ease-out)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--foc)]",
        "disabled:opacity-50 tabular-nums",
        className,
      )}
      {...props}
    />
  );
}
