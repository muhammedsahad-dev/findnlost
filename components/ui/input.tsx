import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-lg border border-[var(--border-clr)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--text)] ring-offset-[var(--bg)] placeholder:text-[var(--text-3)] transition-colors duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[oklch(0.20_0.018_264)] focus-visible:border-transparent",
        "dark:focus-visible:ring-white/30",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "file:border-0 file:bg-transparent file:text-sm file:font-medium",
        className
      )}
      ref={ref}
      {...props}
    />
  )
);

Input.displayName = "Input";

export { Input };
