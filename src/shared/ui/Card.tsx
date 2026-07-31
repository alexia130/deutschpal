import type { HTMLAttributes } from "react";
import { cn } from "../utils/cn";

interface CardProps extends HTMLAttributes<HTMLDivElement> {}

function Card({ className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-[#ECE8E3] bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.05)]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export default Card;