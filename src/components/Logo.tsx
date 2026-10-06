import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  size?: number;
  title?: string;
};

export function Logo({ className, size = 40, title = "Bill Calculator" }: Props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className={cn("shrink-0", className)}
      role="img"
      aria-label={title}
    >
      <rect x="1.5" y="1.5" width="61" height="61" rx="16" fill="var(--bg-elevated)" stroke="var(--ac)" strokeWidth="1.5" />
      <rect x="8" y="8" width="48" height="48" rx="12" fill="var(--ac)" />
      <rect x="20" y="16" width="24" height="32" rx="3" fill="var(--ac-fg)" opacity="0.12" />
      <rect x="22" y="18" width="20" height="28" rx="2.5" fill="var(--ac-fg)" />
      <path
        d="M27 26h10M27 31.5h10M27 37h7"
        stroke="var(--ac)"
        strokeWidth="2.1"
        strokeLinecap="round"
      />
    </svg>
  );
}
