import * as React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
  asChild?: boolean;
}

const variantClasses: Record<string, string> = {
  default: "bg-foreground text-primary-foreground hover:bg-foreground/90",
  outline: "border border-border bg-transparent hover:bg-foreground/5",
  ghost: "bg-transparent hover:bg-foreground/5",
};

const sizeClasses: Record<string, string> = {
  default: "h-9 px-4 py-2 text-sm",
  sm: "h-8 px-3 text-xs",
  lg: "h-11 px-6 text-sm",
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "default", size = "default", asChild, children, ...props }, ref) => {
    const base =
      "inline-flex items-center justify-center rounded-sm font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50";
    const cls = [base, variantClasses[variant], sizeClasses[size], className].join(" ");

    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children as React.ReactElement<{ className?: string }>, {
        className: [cls, (children.props as { className?: string }).className].filter(Boolean).join(" "),
      });
    }

    return (
      <button ref={ref} className={cls} {...props}>
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };
