"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { motion } from "framer-motion";

interface RiverDynamicsChartProps {
    data?: {
        label: string;
        value: number;
        subscribers: string;
        color: string;
    }[];
}

export function RiverDynamicsChart({ data: initialData }: RiverDynamicsChartProps) {
    const data = initialData || [
        { label: "Market Volume", value: 357, subscribers: "Institutional", color: "rgba(165, 180, 252, 0.4)" }, // Light Indigo
        { label: "Social Sentiment", value: 315, subscribers: "Retail", color: "rgba(129, 140, 248, 0.6)" },    // Medium Indigo
        { label: "Order Flow", value: 432, subscribers: "HFT Nodes", color: "rgba(79, 70, 229, 0.8)" },        // Deep Purple
    ];

    // SVG Path Generation for the "River" waves
    // We'll create 3 overlapping paths with different heights and curves
    const generatePath = (heightShift: number, amplitude: number) => {
        return `M 0 50 
                C 100 ${50 + amplitude}, 200 ${50 - amplitude}, 300 ${50 + heightShift}
                C 400 ${50 + heightShift + amplitude}, 600 ${50 + heightShift - amplitude}, 800 ${50 + heightShift}
                L 800 150 L 0 150 Z`;
    };

    return (
        <GlassCard className="p-12 border-white/5 bg-[#121212]/30 backdrop-blur-3xl overflow-hidden relative group">
            <div className="text-center mb-16 relative z-10">
                <h2 className="text-4xl font-black text-white tracking-tighter mb-4 uppercase">Market Dynamics</h2>
                <p className="max-w-2xl mx-auto text-sm font-bold text-white/30 leading-relaxed uppercase tracking-widest">
                    AI-driven liquidity flow mapping. Real-time correlation between retail sentiment,
                    institutional volume, and algorithmic HFT order blocks.
                </p>
            </div>

            <div className="flex justify-center gap-16 mb-20 relative z-10">
                {data.map((item, i) => (
                    <div key={i} className="flex flex-col items-center">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                            <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">{item.label}</span>
                        </div>
                        <div className="text-[10px] font-bold text-white/20 uppercase mb-2">{item.subscribers}</div>
                        <div className="text-3xl font-black text-orange-400 tabular-nums">
                            {item.value}% <span className="text-sm">↑</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="relative h-64 -mx-12 overflow-visible">
                {/* SVG River Waves */}
                <svg viewBox="0 0 800 150" preserveAspectRatio="none" className="w-full h-full opacity-80 filter drop-shadow-[0_-20px_50px_rgba(79,70,229,0.2)]">
                    {/* Layer 1 (Back - Lightest) */}
                    <motion.path
                        initial={{ d: generatePath(0, 0) }}
                        animate={{ d: generatePath(10, 15) }}
                        transition={{ duration: 4, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
                        d={generatePath(10, 15)}
                        fill="rgba(165, 180, 252, 0.2)"
                    />
                    {/* Layer 2 (Middle) */}
                    <motion.path
                        initial={{ d: generatePath(0, 0) }}
                        animate={{ d: generatePath(20, 25) }}
                        transition={{ duration: 5, repeat: Infinity, repeatType: "mirror", ease: "easeInOut", delay: 0.5 }}
                        d={generatePath(20, 25)}
                        fill="rgba(129, 140, 248, 0.4)"
                    />
                    {/* Layer 3 (Front - Darkest) */}
                    <motion.path
                        initial={{ d: generatePath(0, 0) }}
                        animate={{ d: generatePath(30, 35) }}
                        transition={{ duration: 6, repeat: Infinity, repeatType: "mirror", ease: "easeInOut", delay: 1 }}
                        d={generatePath(30, 35)}
                        fill="rgba(79, 70, 229, 0.6)"
                    />

                    {/* Interactive Points (Glows) */}
                    <circle cx="280" cy="65" r="4" fill="white" className="animate-pulse shadow-[0_0_20px_white]" />
                    <circle cx="550" cy="85" r="5" fill="white" className="animate-pulse shadow-[0_0_20px_white]" />
                    <circle cx="720" cy="55" r="3" fill="white" className="animate-pulse shadow-[0_0_20px_white]" />
                </svg>

                {/* Overlaid Values like the reference image */}
                <div className="absolute top-0 right-20 flex flex-col items-end gap-12 text-white/40 font-black text-lg pointer-events-none">
                    <span className="translate-y-4">23k</span>
                    <span className="translate-y-8 text-white/60">143k</span>
                    <span className="translate-y-12">11k</span>
                </div>
            </div>

            {/* Cinematic Bottom Gradient Overlay */}
            <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-[#121212] to-transparent z-20" />
        </GlassCard>
    );
}
