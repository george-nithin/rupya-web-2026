"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function PnLCashflowChart() {
    const [period, setPeriod] = useState<"Monthly" | "Yearly">("Monthly");

    // Data matched to the reference image bars (approximate proportions)
    const data = [
        { label: "Jan", value: 28000 },
        { label: "Feb", value: 24000 },
        { label: "Mar", value: 42000, highlight: true }, // The "insight" bar
        { label: "Apr", value: 26000 },
        { label: "May", value: 34000 },
        { label: "Jun", value: 18000 },
        { label: "Jul", value: 27000 },
    ];

    const maxValue = 50000;

    return (
        <GlassCard className="p-8 border-white/5 bg-[#121212]/50 backdrop-blur-3xl flex flex-col h-full overflow-visible group">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                <div>
                    <div className="text-[9px] md:text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mb-2">Cash Flow</div>
                    <div className="text-2xl md:text-4xl font-black text-white tracking-tighter">$540,323.45</div>
                </div>
                <div className="flex bg-white/5 rounded-2xl p-1 border border-white/10 backdrop-blur-md w-full sm:w-auto overflow-x-auto whitespace-nowrap">
                    {["Monthly", "Yearly"].map((p) => (
                        <button
                            key={p}
                            onClick={() => setPeriod(p as any)}
                            className={`flex-1 sm:flex-none px-4 md:px-5 py-2 rounded-xl text-[9px] md:text-[10px] font-black transition-all duration-300 ${period === p
                                ? "bg-[#f97316] text-white shadow-[0_0_20px_rgba(249,115,22,0.4)]"
                                : "text-white/40 hover:text-white"
                                }`}
                        >
                            {p}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 flex items-end justify-between gap-3 mt-16 relative h-56 px-4">
                {/* Y-Axis Labels (From Reference) */}
                <div className="absolute left-[-10px] h-full flex flex-col justify-between text-[9px] font-bold text-white/20 uppercase tracking-widest text-right pb-10">
                    <span>50k</span>
                    <span>40k</span>
                    <span>30k</span>
                    <span>20k</span>
                    <span>10k</span>
                    <span>0k</span>
                </div>

                {data.map((item, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center group/bar relative h-full justify-end">
                        {/* Highlight Tooltip (Inspired by Reference Image 1) */}
                        <AnimatePresence>
                            {item.highlight && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    className="absolute top-0 left-1/2 -translate-x-1/2 translate-y-[-110%] z-20 pointer-events-none"
                                >
                                    <div className="bg-[#1a1a1a]/95 backdrop-blur-2xl border border-white/10 rounded-2xl p-4 shadow-[0_20px_40px_rgba(0,0,0,0.5)] min-w-[150px]">
                                        <div className="text-[9px] font-bold text-white/30 uppercase tracking-[0.2em] mb-2">July 23, 2026</div>
                                        <div className="flex justify-between items-center mb-1.5">
                                            <span className="text-[11px] font-bold text-white/50">Cashflow</span>
                                            <span className="text-[11px] font-black text-white">$33,847.00</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-[11px] font-bold text-white/50">Inflow</span>
                                            <span className="text-[11px] font-black text-orange-400">-$7,456.00</span>
                                        </div>
                                    </div>
                                    {/* Line down to dot */}
                                    <div className="w-[1.5px] h-12 bg-gradient-to-b from-white/20 to-transparent absolute left-1/2 top-full -translate-x-1/2" />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Bar Container */}
                        <div className="relative w-full max-w-[44px] flex flex-col items-center justify-end h-full">
                            {/* The Dot on Highlight */}
                            {item.highlight && (
                                <div className="absolute top-[-8px] z-30">
                                    <div className="h-4 w-4 rounded-full bg-white border-2 border-orange-500 shadow-[0_0_15px_white] animate-pulse" />
                                </div>
                            )}

                            {/* Bar with Shading and Grading */}
                            <motion.div
                                initial={{ height: 0 }}
                                animate={{ height: `${(item.value / maxValue) * 100}%` }}
                                transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                                className={`w-full rounded-t-2xl transition-all duration-500 relative ${item.highlight
                                    ? "bg-gradient-to-t from-white to-[#f97316] shadow-[0_0_40px_rgba(249,115,22,0.3)] ring-1 ring-white/20"
                                    : "bg-white/5 group-hover/bar:bg-white/10"
                                    }`}
                            >
                                {/* Top edge glow */}
                                <div className="absolute top-0 inset-x-0 h-[2px] bg-white/20 rounded-full blur-[1px]" />
                            </motion.div>
                        </div>

                        {/* X-Axis Label */}
                        <div className={`mt-6 text-[10px] font-black tracking-[0.2em] uppercase transition-colors duration-300 ${item.highlight ? 'text-white' : 'text-white/20 group-hover/bar:text-white/50'}`}>
                            {item.label}
                        </div>
                    </div>
                ))}
            </div>

            {/* Background Aesthetic Blur */}
            <div className="absolute inset-x-0 bottom-0 h-40 bg-[#f97316]/5 blur-[80px] pointer-events-none group-hover:opacity-100 opacity-50 transition-opacity duration-1000" />
        </GlassCard>
    );
}
