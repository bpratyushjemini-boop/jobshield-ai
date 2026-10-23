import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const alertVariants = cva(
  "relative w-full rounded-xl border p-4 text-sm [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 transition-colors",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--card-bg)] text-[var(--foreground)] border-[var(--card-border)] [&>svg]:text-[var(--foreground)]",
        destructive:
          "border-[var(--danger-border)] bg-[var(--danger-bg)] text-[var(--danger-text)] [&>svg]:text-[var(--danger-text)]",
        warning:
          "border-[var(--warning-border)] bg-[var(--warning-bg)] text-[var(--warning-text)] [&>svg]:text-[var(--warning-text)]",
        success:
          "border-[var(--success-border)] bg-[var(--success-bg)] text-[var(--success-text)] [&>svg]:text-[var(--success-text)]",
        cyber:
          "border-[var(--card-border)] bg-[var(--subtle-bg)] text-[var(--foreground)] [&>svg]:text-[var(--foreground)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(alertVariants({ variant }), className)}
    {...props}
  />
));
Alert.displayName = "Alert";

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1 font-semibold leading-tight text-inherit", className)}
    {...props}
  />
));
AlertTitle.displayName = "AlertTitle";

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-xs sm:text-sm [&_p]:leading-relaxed text-inherit opacity-90", className)}
    {...props}
  />
));
AlertDescription.displayName = "AlertDescription";

export { Alert, AlertTitle, AlertDescription };
