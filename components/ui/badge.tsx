import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        lost: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
        found: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
        open: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
        claimed: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
        removed: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
        default: "bg-[var(--bg-2)] text-[var(--text-2)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
