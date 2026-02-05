"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { Check } from "lucide-react";

interface MarketStepProps {
    value: string[];
    onChange: (value: string[]) => void;
}

const markets = [
    { id: "equity", title: "Equity (Cash)", description: "Stocks & ETFs" },
    { id: "fno", title: "Futures & Options", description: "Derivatives Trading" },
    { id: "commodity", title: "Commodities", description: "Gold, Silver, Oil" },
    { id: "currency", title: "Currency", description: "Forex Pairs" },
    { id: "mutual_funds", title: "Mutual Funds", description: "SIPs & Lumpsum" },
    { id: "ipo", title: "IPOs", description: "Initial Public Offerings" },
];

export function MarketStep({ value, onChange }: MarketStepProps) {
    const toggleSelection = (id: string) => {
        if (value.includes(id)) {
            onChange(value.filter((item) => item !== id));
        } else {
            onChange([...value, id]);
        }
    };

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-bold text-white text-center">Which markets do you trade?</h2>
            <p className="text-slate-400 text-center text-sm mb-6">Select all that apply.</p>

            <div className="grid grid-cols-2 gap-4">
                {markets.map((market) => {
                    const isSelected = value.includes(market.id);
                    return (
                        <GlassCard
                            key={market.id}
                            className={`cursor-pointer transition-all relative border-2 ${isSelected
                                    ? "border-sky-500 bg-sky-500/5 shadow-[0_0_15px_-3px_rgba(14,165,233,0.3)]"
                                    : "border-transparent hover:border-white/10"
                                }`}
                            onClick={() => toggleSelection(market.id)}
                        >
                            {isSelected && (
                                <div className="absolute top-2 right-2 bg-sky-500 rounded-full p-0.5">
                                    <Check className="h-3 w-3 text-white" />
                                </div>
                            )}
                            <div className="font-semibold text-white text-sm">{market.title}</div>
                            <div className="text-xs text-slate-500 mt-1">{market.description}</div>
                        </GlassCard>
                    );
                })}
            </div>
        </div>
    );
}
