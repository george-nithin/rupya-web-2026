"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { Command, Hash, MoreHorizontal, Zap } from "lucide-react";
import { motion } from "framer-motion";

export function BreakdownStats() {
    const categories = [
        { name: "Billing", percentage: 57, icon: <Zap className="h-4 w-4" /> },
        { name: "Software", percentage: 24, icon: <Command className="h-4 w-4" /> },
        { name: "Others", percentage: 19, icon: <Hash className="h-4 w-4" /> },
    ];

    return (
        <GlassCard className="p-8 border-white/5 bg-[#121212]/50 backdrop-blur-3xl flex flex-col justify-between h-full overflow-hidden group">
            {/* Dynamic Background Glow */}
            <div className="absolute inset-x-0 bottom-0 h-40 bg-orange-500/5 blur-[80px] pointer-events-none group-hover:opacity-100 opacity-50 transition-opacity duration-1000" />

            <div className="flex justify-between items-center mb-10 relative z-10">
                <div className="flex flex-col">
                    <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-1">Portfolio</span>
                    <h3 className="text-xl font-black text-white tracking-tight uppercase">Segment Battle</h3>
                </div>
                <button className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white transition-all">
                    <MoreHorizontal className="h-4 w-4" />
                </button>
            </div>

            <div className="flex justify-between mb-12 relative z-10">
                {categories.map((cat, i) => (
                    <div key={i} className="text-left">
                        <div className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-2">{cat.name}</div>
                        <div className="text-3xl font-black text-white tabular-nums tracking-tighter">
                            {cat.percentage}<span className="text-sm text-white/20 ml-1">%</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="relative h-24 flex items-center z-10">
                {/* Segmented Progress Bar with High-Fidelity Gradients */}
                <div className="flex w-full h-20 rounded-2xl overflow-hidden border border-white/10 bg-white/5 shadow-inner">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: '57%' }}
                        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                        className="h-full bg-gradient-to-r from-orange-600 to-orange-400 relative group/seg"
                    >
                        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover/seg:opacity-100 transition-opacity" />
                    </motion.div>
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: '24%' }}
                        transition={{ duration: 1, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                        className="h-full bg-orange-400/30 border-r border-white/5"
                    />
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: '19%' }}
                        transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                        className="h-full bg-orange-400/10"
                    />
                </div>

                {/* Overlaid Animated Icons with Glows */}
                <div className="absolute inset-0 flex items-center pointer-events-none">
                    <div style={{ width: '57%' }} className="relative flex justify-end">
                        <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.8, type: "spring" }}
                            className="absolute translate-x-1/2 w-12 h-12 rounded-2xl bg-[#1a1a1a] border border-white/20 flex items-center justify-center shadow-[0_10px_30px_rgba(0,0,0,0.5)] ring-1 ring-white/10"
                        >
                            <Zap className="h-5 w-5 text-orange-400 drop-shadow-[0_0_8px_rgba(249,115,22,0.8)]" />
                        </motion.div>
                    </div>
                    <div style={{ width: '24%' }} className="relative flex justify-end">
                        <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 1, type: "spring" }}
                            className="absolute translate-x-1/2 w-12 h-12 rounded-2xl bg-[#222] border border-white/10 flex items-center justify-center shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
                        >
                            <Command className="h-5 w-5 text-white/40" />
                        </motion.div>
                    </div>
                </div>

                {/* Overall Performance Badge */}
                <div className="absolute bottom-[-14px] left-[57%] -translate-x-1/2">
                    <div className="px-4 py-1.5 rounded-full bg-orange-500 text-[9px] font-black text-white uppercase tracking-[0.2em] whitespace-nowrap shadow-[0_8px_16px_rgba(249,115,22,0.4)] border border-white/20">
                        Bullish Trend ↗
                    </div>
                </div>
            </div>

            <div className="mt-8 text-[10px] font-bold text-white/20 uppercase tracking-[0.3em] text-center italic">
                Cross-segment allocation index v1.0.4
            </div>
        </GlassCard>
    );
}
