"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { ArrowUpRight, ArrowDownRight, Zap } from "lucide-react";

const sectors = [
    { name: "Nifty Auto", change: 2.3, momentum: "High" },
    { name: "Nifty IT", change: -1.2, momentum: "Low" },
    { name: "Nifty Bank", change: 0.8, momentum: "Neutral" },
    { name: "Nifty Pharma", change: 1.5, momentum: "High" },
    { name: "Nifty Metal", change: -0.5, momentum: "Neutral" },
    { name: "Nifty FMCG", change: 0.2, momentum: "Neutral" },
    { name: "Nifty Realty", change: 3.1, momentum: "High" },
    { name: "Nifty Energy", change: -0.8, momentum: "Low" },
];

export function SectorOverview() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {sectors.map((sector) => (
                <GlassCard key={sector.name} className="p-4 hover:bg-white/5 transition-colors cursor-pointer group">
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-semibold text-white">{sector.name}</span>
                        {sector.momentum === "High" && (
                            <Zap className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                        )}
                    </div>

                    <div className="flex items-end justify-between">
                        <div className={`text-xl font-bold ${sector.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {sector.change > 0 ? '+' : ''}{sector.change}%
                        </div>

                        {sector.change >= 0 ? (
                            <ArrowUpRight className="h-5 w-5 text-green-400 opacity-50 group-hover:opacity-100 transition-opacity" />
                        ) : (
                            <ArrowDownRight className="h-5 w-5 text-red-400 opacity-50 group-hover:opacity-100 transition-opacity" />
                        )}
                    </div>

                    <div className="mt-2 text-[10px] text-slate-500 uppercase tracking-wider">
                        Momentum: <span className={
                            sector.momentum === 'High' ? 'text-yellow-400' :
                                sector.momentum === 'Low' ? 'text-red-400' : 'text-slate-400'
                        }>{sector.momentum}</span>
                    </div>
                </GlassCard>
            ))}
        </div>
    );
}
