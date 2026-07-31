import type { InputHTMLAttributes, ReactNode } from "react";
import { cn } from "../utils/cn";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: ReactNode;
}

function Input({ icon, className, ...props }: InputProps) {
  return (
    <div className="relative">
      {icon && (
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
          {icon}
        </div>
      )}

      <input
        className={cn(
          "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition duration-200",
          "placeholder:text-gray-400",
          "focus:border-orange-300 focus:ring-4 focus:ring-orange-100",
          "disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400",
          icon && "pl-11",
          className
        )}
        {...props}
      />
    </div>
  );
}

export default Input;