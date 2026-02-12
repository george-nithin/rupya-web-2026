"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { useState } from "react";

const indicators = [
    { id: "rsi", label: "RSI", active: true },
    { id: "macd", label: "MACD", active: false },
    { id: "ema_20", label: "EMA 20", active: true },
    { id: "ema_50", label: "EMA 50", active: true },
    { id: "ema_200", label: "EMA 200", active: false },
    { id: "bollinger", label: "Bollinger Bands", active: false },
    { id: "supertrend", label: "Supertrend", active: false },
    { id: "vwap", label: "VWAP", active: true },
];

export function TechIndictorsSelector() {
    const [activeIndicators, setActiveIndicators] = useState<string[]>(
        indicators.filter(i => i.active).map(i => i.id)
    );

    const toggleIndicator = (id: string) => {
        if (activeIndicators.includes(id)) {
            setActiveIndicators(activeIndicators.filter(i => i !== id));
        } else {
            setActiveIndicators([...activeIndicators, id]);
        }
    };

    return (
        <GlassCard className="p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-foreground/80">Technical Indicators</h3>
                <span className="text-xs text-muted-foreground">{activeIndicators.length} Active</span>
            </div>
            <div className="flex flex-wrap gap-2">
                {indicators.map((ind) => {
                    const isActive = activeIndicators.includes(ind.id);
                    return (
                        <button
                            key={ind.id}
                            onClick={() => toggleIndicator(ind.id)}
                            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${isActive
                                    ? "bg-sky-500 text-white shadow-strong shadow-sky-500/20"
                                    : "bg-card/20 text-muted-foreground hover:bg-card/30 hover:text-foreground border border-border/50"
                                }`}
                        >
                            {ind.label}
                        </button>
                    );
                })}
            </div>
        </GlassCard>
    );
}
