import { cn } from "@/lib/utils";
import { HTMLAttributes, forwardRef } from "react";

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
    variant?: "default" | "dark" | "frosted";
}

const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
    ({ className, variant = "default", children, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(
                    "rounded-xl border p-6 transition-all duration-300",
                    {
                        "glass-card bg-slate-900/40 backdrop-blur-xl border-white/10": variant === "default",
                        "bg-black/40 backdrop-blur-2xl border-white/5": variant === "dark",
                        "bg-white/10 backdrop-blur-md border-white/20": variant === "frosted",
                    },
                    className
                )}
                {...props}
            >
                {children}
            </div>
        );
    }
);
GlassCard.displayName = "GlassCard";

export { GlassCard };
