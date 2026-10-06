import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { useBillStore } from "@/lib/bill/store";
import type { SoundKind } from "@/lib/bill/sound";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium select-none transition-[transform,opacity,box-shadow,background] duration-[var(--motion-quick)] ease-[var(--ease-out)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--foc)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)] disabled:pointer-events-none disabled:opacity-40 active:scale-[0.96]",
  {
    variants: {
      variant: {
        default: "btn-primary text-[var(--ac-fg)]",
        secondary:
          "bg-[var(--surface)] text-[var(--fg)] shadow-[var(--shadow-border)] hover:shadow-[var(--shadow-border-hover)]",
        outline:
          "bg-transparent text-[var(--fg)] shadow-[var(--shadow-border)] hover:bg-[var(--bg-elevated)]",
        ghost: "bg-transparent text-[var(--fg-muted)] hover:bg-[var(--surface)] hover:text-[var(--fg)]",
        danger: "bg-[var(--danger)] text-[var(--danger-fg)]",
        gold: "btn-primary text-[var(--ac-fg)]",
      },
      size: {
        default: "h-11 px-4 text-sm rounded-[var(--radius-md)]",
        lg: "h-14 px-5 text-base rounded-[var(--radius-lg)]",
        sm: "h-9 px-3 text-xs rounded-[var(--radius-sm)]",
        icon: "size-11 rounded-[var(--radius-md)]",
        xl: "h-[3.25rem] px-6 text-base rounded-[var(--radius-lg)] w-full max-w-[290px]",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

type Props = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    sound?: SoundKind;
  };

export function Button({ className, variant, size, sound = "click", onClick, type, ...props }: Props) {
  const beep = useBillStore((s) => s.beep);
  return (
    <button
      type={type ?? "button"}
      className={cn(buttonVariants({ variant, size }), className)}
      onClick={(e) => {
        if (sound !== "none") beep(sound);
        onClick?.(e);
      }}
      {...props}
    />
  );
}
