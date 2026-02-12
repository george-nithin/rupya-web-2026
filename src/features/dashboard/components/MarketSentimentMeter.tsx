"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { Info, Gauge } from "lucide-react";
import { useMemo } from "react";

interface MarketSentimentMeterProps {
    score?: number; // 0 to 100
}

export function MarketSentimentMeter({ score = 64 }: MarketSentimentMeterProps) {
    // 0-20: Extreme Fear, 20-40: Fear, 40-60: Balanced, 60-80: Greed, 80-100: Extreme Greed
    const getSentimentLabel = (val: number) => {
        if (val < 20) return "Extreme Fear";
        if (val < 40) return "Fear";
        if (val < 60) return "Balanced";
        if (val < 80) return "Greed";
        return "Extreme Greed";
    };

    const label = getSentimentLabel(score);

    // Needle rotation: -90deg to 90deg for a semi-circle
    const needleRotation = (score / 100) * 180 - 90;

    return (
        <GlassCard className="relative overflow-hidden border-white/5 bg-slate-950/80 p-8 flex flex-col items-center justify-between h-full group">
            {/* Background Glow */}
            <div className="absolute inset-x-0 top-0 h-40 bg-indigo-500/10 blur-[100px] pointer-events-none" />

            <div className="w-full flex justify-between items-center mb-8 relative z-10">
                <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.8)]" />
                    <span className="text-[10px] font-black text-white/50 uppercase tracking-[0.3em]">Market Sentiment</span>
                </div>
                <button className="text-white/20 hover:text-white transition-colors">
                    <Info className="h-4 w-4" />
                </button>
            </div>

            <div className="relative w-full aspect-[2/1] flex items-end justify-center overflow-visible mb-8">
                {/* SVG Gauge */}
                <svg viewBox="0 0 200 100" className="w-full h-full">
                    {/* Gauge Segments */}
                    <path
                        d="M 20 100 A 80 80 0 0 1 180 100"
                        fill="none"
                        stroke="rgba(255,255,255,0.03)"
                        strokeWidth="12"
                        strokeLinecap="round"
                    />

                    {/* Active Segments Highlight (Simplified for aesthetic) */}
                    <path
                        d="M 20 100 A 80 80 0 0 1 60 40"
                        fill="none"
                        stroke="rgba(239, 68, 68, 0.1)"
                        strokeWidth="12"
                    />
                    <path
                        d="M 60 40 A 80 80 0 0 1 100 20"
                        fill="none"
                        stroke="rgba(249, 115, 22, 0.1)"
                        strokeWidth="12"
                    />
                    <path
                        d="M 100 20 A 80 80 0 0 1 140 40"
                        fill="none"
                        stroke="rgba(251, 191, 36, 0.3)"
                        strokeWidth="12"
                    />
                    <path
                        d="M 140 40 A 80 80 0 0 1 180 100"
                        fill="none"
                        stroke="rgba(34, 197, 94, 0.1)"
                        strokeWidth="12"
                    />

                    {/* Glowing active segment based on score */}
                    <path
                        d="M 100 20 A 80 80 0 0 1 140 40"
                        fill="none"
                        stroke="#fbbf24"
                        strokeWidth="14"
                        strokeLinecap="round"
                        className="opacity-40 blur-[4px]"
                        style={{ display: score >= 60 && score < 80 ? 'block' : 'none' }}
                    />

                    {/* Needle */}
                    <g transform={`rotate(${needleRotation}, 100, 100)`}>
                        <line x1="100" y1="100" x2="100" y2="25" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" />
                        <circle cx="100" cy="100" r="4" fill="#fbbf24" />
                        <line x1="100" y1="100" x2="100" y2="20" stroke="white" strokeWidth="0.5" opacity="0.3" />
                    </g>
                </svg>

                {/* Center Label Display */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1">
                    <div className="flex items-center gap-2">
                        <div className="w-1 h-1 bg-white/20 rotate-45" />
                        <div className="px-4 py-1.5 rounded-lg border border-white/5 bg-white/5 backdrop-blur-md shadow-2xl">
                            <span className="text-xl font-black text-white tracking-widest uppercase">{label}</span>
                        </div>
                        <div className="w-1 h-1 bg-white/20 rotate-45" />
                    </div>
                </div>
            </div>

            <div className="w-full relative z-10 pt-4 border-t border-white/5">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <div className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1">Risk Strategy</div>
                        <div className="text-xs font-bold text-white/80">Tailored Risk Management</div>
                    </div>
                    <div className="text-right">
                        <div className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1">Index</div>
                        <div className="text-xs font-black text-indigo-400">0.64 G-UNIT</div>
                    </div>
                </div>

                <div className="text-[10px] font-medium text-white/40 leading-relaxed text-center italic">
                    "Full control, zero guesswork. Adjusting risk tolerance to your preference."
                </div>
            </div>

            {/* Cinematic Brackets Ornament */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-16 pointer-events-none opacity-20">
                <div className="w-4 h-[1px] bg-white" />
                <div className="w-4 h-[1px] bg-white" />
            </div>
        </GlassCard>
    );
}
