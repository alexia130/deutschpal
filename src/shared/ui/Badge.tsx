import type { HTMLAttributes } from "react";
import { cn } from "../utils/cn";

type BadgeVariant = "neutral" | "primary";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variants: Record<BadgeVariant, string> = {
  neutral:
    "border-[#E8E2DC] bg-[#FAF8F6] text-[#77716B]",
  primary:
    "border-[#F1D4BC] bg-[#FFF0E2] text-[#B85F28]",
};

function Badge({
  variant = "neutral",
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export default Badge;