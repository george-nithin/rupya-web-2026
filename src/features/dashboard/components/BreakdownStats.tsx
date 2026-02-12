"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { Command, Hash, MoreHorizontal } from "lucide-react";

export function BreakdownStats() {
    const categories = [
        { name: "Billing", percentage: 57, icon: null },
        { name: "Softwares", percentage: 24, icon: <Command className="h-4 w-4" /> },
        { name: "Others", percentage: 19, icon: <Hash className="h-4 w-4" /> },
    ];

    return (
        <GlassCard className="p-8 border-white/5 bg-card/30 flex flex-col justify-between h-full">
            <div className="flex justify-between items-center mb-10">
                <h3 className="text-xl font-black text-white tracking-tight">Trade Breakdown</h3>
                <button className="text-white/20 hover:text-white transition-colors">
                    <MoreHorizontal className="h-5 w-5" />
                </button>
            </div>

            <div className="flex justify-between mb-8">
                {categories.map((cat, i) => (
                    <div key={i} className="text-left">
                        <div className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-2">{cat.name}</div>
                        <div className="text-2xl font-black text-white">{cat.percentage}%</div>
                    </div>
                ))}
            </div>

            <div className="relative h-24 flex items-center">
                {/* Segmented Progress Bar */}
                <div className="flex w-full h-20 rounded-2xl overflow-hidden border border-white/5">
                    <div className="h-full bg-gradient-to-r from-indigo-600 to-indigo-400 relative group" style={{ width: '57%' }}>
                        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="h-full bg-indigo-500/20 w-[24%]" />
                    <div className="h-full bg-indigo-500/10 w-[19%]" />
                </div>

                {/* Overlaid Icons */}
                <div className="absolute inset-0 flex items-center pointer-events-none">
                    <div style={{ width: '57%' }} className="relative flex justify-end">
                        <div className="absolute translate-x-1/2 w-10 h-10 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center shadow-2xl">
                            <Command className="h-4 w-4 text-white/60" />
                        </div>
                    </div>
                    <div style={{ width: '24%' }} className="relative flex justify-end">
                        <div className="absolute translate-x-1/2 w-10 h-10 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center shadow-2xl">
                            <Hash className="h-4 w-4 text-white/60" />
                        </div>
                    </div>
                </div>

                {/* Overall Estimated Badge */}
                <div className="absolute bottom-[-10px] left-[57%] -translate-x-1/2">
                    <div className="px-2 py-1 rounded-md bg-slate-800 border border-white/10 text-[8px] font-black text-white/40 uppercase tracking-widest whitespace-nowrap">
                        Overall Estimated ↗
                    </div>
                </div>
            </div>
        </GlassCard>
    );
}
