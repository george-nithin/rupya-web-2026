import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface GlassButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "ghost" | "danger";
    size?: "sm" | "md" | "lg";
}

const GlassButton = forwardRef<HTMLButtonElement, GlassButtonProps>(
    ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
        return (
            <button
                ref={ref}
                className={cn(
                    "inline-flex items-center justify-center rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-95",
                    {
                        // Variants (Semantic)
                        "bg-primary text-primary-foreground shadow-lg hover:bg-primary/90": variant === "primary",
                        "bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border/10": variant === "secondary",
                        "hover:bg-accent hover:text-accent-foreground text-muted-foreground": variant === "ghost",
                        "bg-destructive text-destructive-foreground hover:bg-destructive/90": variant === "danger",

                        // Sizes
                        "h-9 px-4 text-sm": size === "sm",
                        "h-11 px-6 text-base": size === "md",
                        "h-14 px-8 text-lg": size === "lg",
                    },
                    className
                )}
                {...props}
            >
                {children}
            </button>
        );
    }
);
GlassButton.displayName = "GlassButton";

export { GlassButton };
