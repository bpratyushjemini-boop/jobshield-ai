import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--foreground)]/20",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-[#112250] text-[#F5F0E9] dark:bg-[#F5F0E9] dark:text-[#112250] shadow-xs font-semibold",
        secondary:
          "border-[var(--card-border)] bg-[var(--subtle-bg)] text-[var(--foreground)]",
        destructive:
          "border-[var(--danger-border)] bg-[var(--danger-bg)] text-[var(--danger-text)] font-semibold",
        warning:
          "border-[var(--warning-border)] bg-[var(--warning-bg)] text-[var(--warning-text)] font-semibold",
        success:
          "border-[var(--success-border)] bg-[var(--success-bg)] text-[var(--success-text)] font-semibold",
        outline:
          "border-[var(--card-border)] text-[var(--muted-text)] bg-transparent",
        cyber:
          "border-[var(--card-border)] bg-[var(--subtle-bg)] text-[var(--foreground)] font-mono text-[11px]",
        highlight:
          "border-[#E0C58F] bg-[#E0C58F]/20 text-[#112250] dark:text-[#E0C58F] font-semibold",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
