import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => (
    <textarea
      className={cn(
        "flex min-h-[100px] w-full rounded-lg border border-[var(--border-clr)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--text)] ring-offset-[var(--bg)] placeholder:text-[var(--text-3)] transition-colors duration-150 resize-y",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[oklch(0.20_0.018_264)] focus-visible:border-transparent",
        "dark:focus-visible:ring-white/30",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  )
);

Textarea.displayName = "Textarea";

export { Textarea };
