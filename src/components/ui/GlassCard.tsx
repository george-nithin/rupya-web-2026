import { cn } from "@/lib/utils";
import { HTMLAttributes, forwardRef } from "react";

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
    variant?: "default" | "dark" | "frosted";
    colorBorder?: "cyan" | "purple" | "emerald" | "amber" | "orange" | "blue" | "red" | "rose" | "none";
}

const GlassCard = forwardRef<HTMLDivElement, GlassCardProps & { glow?: boolean }>(
    ({ className, variant = "default", colorBorder = "none", glow = false, children, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(
                    "rounded-3xl border transition-all duration-300 p-6", // Rounded 3xl for modern feel
                    {
                        // Default: Pro Deep Glass
                        "bg-card/45 backdrop-blur-xl border-white/5 shadow-2xl": variant === "default" && colorBorder === "none",

                        // Dark: Heavier contrast
                        "bg-card/90 backdrop-blur-3xl border-white/10 text-card-foreground": variant === "dark" && colorBorder === "none",

                        // Frosted: Lighter
                        "bg-card/25 backdrop-blur-lg border-white/10": variant === "frosted" && colorBorder === "none",

                        // Colorful Borders & Background Accents - Matching reference styles
                        "border-orange-500/40 bg-orange-500/5 backdrop-blur-2xl shadow-lg shadow-orange-500/10": colorBorder === "orange",
                        "border-cyan-500/40 bg-cyan-500/5 backdrop-blur-2xl shadow-lg shadow-cyan-500/10": colorBorder === "cyan",
                        "border-purple-500/40 bg-purple-500/5 backdrop-blur-2xl shadow-lg shadow-purple-500/10": colorBorder === "purple",
                        "border-emerald-500/40 bg-emerald-500/5 backdrop-blur-2xl shadow-lg shadow-emerald-500/10": colorBorder === "emerald",
                        "border-amber-500/40 bg-amber-500/5 backdrop-blur-2xl shadow-lg shadow-amber-500/10": colorBorder === "amber",
                        "border-blue-500/40 bg-blue-500/5 backdrop-blur-2xl shadow-lg shadow-blue-500/10": colorBorder === "blue",
                        "border-red-500/40 bg-red-500/5 backdrop-blur-2xl shadow-lg shadow-red-500/10": colorBorder === "red",
                        "border-rose-500/40 bg-rose-500/5 backdrop-blur-2xl shadow-lg shadow-rose-500/10": colorBorder === "rose",

                        // Glow Effects on Hover
                        "hover:shadow-orange-500/30 hover:border-orange-400/60 transition-all": glow && colorBorder === "orange",
                        "hover:shadow-cyan-500/30 hover:border-cyan-400/60 transition-all": glow && colorBorder === "cyan",
                        "hover:shadow-purple-500/30 hover:border-purple-400/60 transition-all": glow && colorBorder === "purple",
                        "hover:shadow-emerald-500/30 hover:border-emerald-400/60 transition-all": glow && colorBorder === "emerald",
                        "hover:shadow-amber-500/30 hover:border-amber-400/60 transition-all": glow && colorBorder === "amber",
                        "hover:shadow-blue-500/30 hover:border-blue-400/60 transition-all": glow && colorBorder === "blue",
                        "hover:shadow-red-500/30 hover:border-red-400/60 transition-all": glow && colorBorder === "red",
                        "hover:shadow-rose-500/30 hover:border-rose-400/60 transition-all": glow && colorBorder === "rose",
                        "hover:shadow-2xl hover:border-white/20 transition-all": glow && colorBorder === "none"

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
