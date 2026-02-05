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
                        // Variants
                        "bg-sky-500/80 hover:bg-sky-500 text-white shadow-lg shadow-sky-500/20": variant === "primary",
                        "bg-white/10 hover:bg-white/20 text-white border border-white/10": variant === "secondary",
                        "hover:bg-white/5 text-slate-300 hover:text-white": variant === "ghost",
                        "bg-red-500/80 hover:bg-red-500 text-white": variant === "danger",

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
