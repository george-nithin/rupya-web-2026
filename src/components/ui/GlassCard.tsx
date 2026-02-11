import { cn } from "@/lib/utils";
import { HTMLAttributes, forwardRef } from "react";

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
    variant?: "default" | "dark" | "frosted";
    colorBorder?: "cyan" | "purple" | "emerald" | "amber" | "orange" | "none";
}

const GlassCard = forwardRef<HTMLDivElement, GlassCardProps & { glow?: boolean }>(
    ({ className, variant = "default", colorBorder = "none", glow = false, children, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(
                    "rounded-2xl border transition-all duration-300 p-6",
                    {
                        // Default: Pro Deep Glass
                        "bg-card/40 backdrop-blur-xl border-white/5 shadow-lg": variant === "default" && colorBorder === "none",

                        // Dark: Heavier contrast for inputs/panels
                        "bg-card/80 backdrop-blur-2xl border-white/5 text-card-foreground": variant === "dark" && colorBorder === "none",

                        // Frosted: Lighter, more transparent
                        "bg-white/5 backdrop-blur-md border-white/10": variant === "frosted" && colorBorder === "none",

                        // Colorful Borders - Gradient Style
                        "border-orange-500/30 bg-gradient-to-br from-slate-900/40 to-slate-900/60 backdrop-blur-xl shadow-lg shadow-orange-500/10": colorBorder === "orange",
                        "border-cyan-500/30 bg-gradient-to-br from-slate-900/40 to-slate-900/60 backdrop-blur-xl shadow-lg shadow-cyan-500/10": colorBorder === "cyan",
                        "border-purple-500/30 bg-gradient-to-br from-slate-900/40 to-slate-900/60 backdrop-blur-xl shadow-lg shadow-purple-500/10": colorBorder === "purple",
                        "border-emerald-500/30 bg-gradient-to-br from-slate-900/40 to-slate-900/60 backdrop-blur-xl shadow-lg shadow-emerald-500/10": colorBorder === "emerald",
                        "border-amber-500/30 bg-gradient-to-br from-slate-900/40 to-slate-900/60 backdrop-blur-xl shadow-lg shadow-amber-500/10": colorBorder === "amber",

                        // Glow Effects on Hover
                        "hover:shadow-orange-500/30 hover:border-orange-400/50": glow && colorBorder === "orange",
                        "hover:shadow-cyan-500/30 hover:border-cyan-400/50": glow && colorBorder === "cyan",
                        "hover:shadow-purple-500/30 hover:border-purple-400/50": glow && colorBorder === "purple",
                        "hover:shadow-emerald-500/30 hover:border-emerald-400/50": glow && colorBorder === "emerald",
                        "hover:shadow-amber-500/30 hover:border-amber-400/50": glow && colorBorder === "amber",
                        "hover:shadow-[0_0_20px_-5px_var(--primary)] hover:border-primary/30": glow && colorBorder === "none"
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
