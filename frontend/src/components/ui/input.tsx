import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-lg border bg-[var(--card-bg)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-text)] shadow-xs transition-colors",
          "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50",
          error
            ? "border-[var(--danger-border)] focus-visible:border-[var(--danger-text)] focus-visible:ring-[var(--danger-text)]"
            : "border-[var(--card-border)] focus-visible:border-[#112250] dark:focus-visible:border-[#E0C58F] focus-visible:ring-[#112250] dark:focus-visible:ring-[#E0C58F]",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
