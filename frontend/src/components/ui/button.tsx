import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#112250]/25 dark:focus-visible:ring-[#E0C58F]/30 focus-visible:border-[#112250] dark:focus-visible:border-[#E0C58F] disabled:pointer-events-none disabled:opacity-50 cursor-pointer active:scale-[0.99]",
  {
    variants: {
      variant: {
        default:
          "bg-[#112250] text-[#F5F0E9] hover:bg-[#1D326D] dark:bg-[#F5F0E9] dark:text-[#112250] dark:hover:bg-[#E0C58F] shadow-xs font-semibold",
        destructive:
          "bg-[#991B1B] text-white hover:bg-[#7F1D1D] dark:bg-[#DC2626] dark:hover:bg-[#B91C1C] dark:text-white shadow-xs",
        outline:
          "border border-[var(--card-border)] bg-[var(--card-bg)] text-[var(--foreground)] hover:bg-[var(--subtle-bg)] hover:border-[var(--card-hover-border)] shadow-xs",
        secondary:
          "bg-[#3C507D] text-[#F5F0E9] hover:bg-[#2F3E61] dark:bg-[#3C507D] dark:hover:bg-[#4D649B] shadow-xs font-semibold",
        ghost:
          "text-[var(--muted-text)] hover:text-[var(--foreground)] hover:bg-[var(--subtle-bg)]",
        link:
          "text-[var(--foreground)] underline-offset-4 hover:underline p-0 h-auto font-medium hover:text-[var(--muted-text)]",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-11 rounded-lg px-6 text-sm font-semibold",
        icon: "h-9 w-9 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
