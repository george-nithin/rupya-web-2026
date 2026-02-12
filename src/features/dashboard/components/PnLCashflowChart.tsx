"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { useState } from "react";

export function PnLCashflowChart() {
    const [period, setPeriod] = useState<"Monthly" | "Yearly">("Monthly");

    // Data matched to the reference image bars
    const data = [
        { label: "Oct 12", value: 18000 },
        { label: "Oct 13", value: 12000 },
        { label: "Oct 14", value: 14000 },
        { label: "Oct 15", value: 45000, highlight: true }, // The "insight" bar
        { label: "Oct 16", value: 8000 },
        { label: "Oct 17", value: 25000 },
        { label: "Oct 18", value: 16000 },
    ];

    const maxValue = 50000;

    return (
        <GlassCard className="p-8 border-white/5 bg-card/30 flex flex-col h-full overflow-visible">
            <div className="flex justify-between items-start mb-2">
                <div>
                    <div className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-1">Cashflow</div>
                    <div className="text-3xl font-black text-white">$35,843.00</div>
                </div>
                <div className="flex bg-white/5 rounded-full p-1 border border-white/5">
                    {["Monthly", "Yearly"].map((p) => (
                        <button
                            key={p}
                            onClick={() => setPeriod(p as any)}
                            className={`px-4 py-1.5 rounded-full text-[10px] font-black transition-all ${period === p ? "bg-white text-slate-950 shadow-lg" : "text-white/40 hover:text-white"
                                }`}
                        >
                            {p}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 flex items-baseline justify-between gap-2 mt-12 relative h-48">
                {/* Y-Axis Labels (Simplified) */}
                <div className="absolute left-[-30px] h-full flex flex-col justify-between text-[8px] font-black text-white/20 uppercase tracking-widest text-right">
                    <span>50K</span>
                    <span>30K</span>
                    <span>10K</span>
                    <span>00K</span>
                    <span>-10K</span>
                    <span>-30K</span>
                </div>

                {data.map((item, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                        {/* Highlight Tooltip for Oct 15 */}
                        {item.highlight && (
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 translate-y-[-110%] z-20">
                                <GlassCard className="p-4 border-white/10 bg-slate-900/90 backdrop-blur-xl rounded-2xl shadow-2xl min-w-[140px]">
                                    <div className="text-[8px] font-black text-white/30 uppercase tracking-widest mb-2">Dec 13, 2023</div>
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-[10px] font-bold text-white/60">Cashflow</span>
                                        <span className="text-[10px] font-black text-white">$38,318.00</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-bold text-white/60">Inflow</span>
                                        <span className="text-[10px] font-black text-indigo-400">+$17,254.00</span>
                                    </div>
                                </GlassCard>
                                {/* Connector Line */}
                                <div className="w-[1px] h-24 border-l border-dashed border-white/20 absolute left-1/2 top-full mt-2" />
                            </div>
                        )}

                        {/* Bar */}
                        <div
                            className={`w-full max-w-[40px] rounded-t-lg transition-all duration-500 relative ${item.highlight
                                    ? "bg-gradient-to-t from-indigo-700 to-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.4)]"
                                    : "bg-indigo-500/20 group-hover:bg-indigo-500/40"
                                }`}
                            style={{ height: `${(item.value / maxValue) * 100}%` }}
                        >
                            {item.highlight && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-[8px] font-black text-white uppercase tracking-tighter italic">insight</span>
                                </div>
                            )}
                        </div>

                        {/* X-Axis Label */}
                        <div className="mt-4 text-[9px] font-black text-white/20 uppercase tracking-widest leading-none">
                            {item.label}
                        </div>
                    </div>
                ))}
            </div>
        </GlassCard>
    );
}
