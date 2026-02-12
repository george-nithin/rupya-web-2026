"use client";

import { cn } from "@/lib/utils";
import { GlassCard } from "./GlassCard";

interface HeatmapItem {
    label: string;
    value: number;
    sublabel?: string;
    onClick?: () => void;
}

interface PerformanceHeatmapProps {
    items: HeatmapItem[];
    title?: string;
    className?: string;
}

export function PerformanceHeatmap({ items, title, className }: PerformanceHeatmapProps) {
    const getBgColor = (value: number) => {
        if (value >= 3) return "bg-green-600 hover:bg-green-500 shadow-[inset_0_0_20px_rgba(34,197,94,0.4)]";
        if (value >= 1.5) return "bg-green-500/80 hover:bg-green-500 shadow-[inset_0_0_15px_rgba(34,197,94,0.3)]";
        if (value > 0) return "bg-green-500/40 hover:bg-green-500/50 shadow-[inset_0_0_10px_rgba(34,197,94,0.2)]";
        if (value === 0) return "bg-white/5 hover:bg-white/10";
        if (value < -3) return "bg-rose-600 hover:bg-rose-500 shadow-[inset_0_0_20px_rgba(244,63,94,0.4)]";
        if (value <= -1.5) return "bg-rose-500/80 hover:bg-rose-500 shadow-[inset_0_0_15px_rgba(244,63,94,0.3)]";
        return "bg-rose-500/40 hover:bg-rose-500/50 shadow-[inset_0_0_10px_rgba(244,63,94,0.2)]";
    };

    return (
        <GlassCard className={cn("p-6 overflow-hidden border-white/5 bg-card/30", className)}>
            {title && (
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-black text-white tracking-tight uppercase">{title}</h3>
                    <div className="flex items-center gap-4 text-[10px] font-bold text-white/30 uppercase tracking-widest">
                        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-rose-500" /> Negative</div>
                        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-green-500" /> Positive</div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                {items.map((item, idx) => (
                    <button
                        key={idx}
                        onClick={item.onClick}
                        className={cn(
                            "group relative h-24 rounded-2xl transition-all duration-300 flex flex-col items-center justify-center p-3 text-center active:scale-95 border border-white/5",
                            getBgColor(item.value)
                        )}
                    >
                        <span className="text-sm font-black text-white tracking-tighter truncate w-full group-hover:scale-110 transition-transform">
                            {item.label}
                        </span>
                        <div className="text-lg font-black text-white/90 tabular-nums">
                            {item.value > 0 ? "+" : ""}{item.value.toFixed(2)}%
                        </div>
                        {item.sublabel && (
                            <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest mt-1 group-hover:text-white transition-colors">
                                {item.sublabel}
                            </span>
                        )}

                        {/* Interactive overlay glow */}
                        <div className="absolute inset-0 rounded-2xl bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                    </button>
                ))}
            </div>
        </GlassCard>
    );
}
