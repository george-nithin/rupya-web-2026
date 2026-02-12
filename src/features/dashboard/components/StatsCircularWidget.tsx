"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { ArrowUpRight } from "lucide-react";

export function StatsCircularWidget() {
    return (
        <GlassCard className="p-6 border-white/5 bg-card/30 flex flex-col items-center justify-center text-center group h-full">
            <div className="w-full flex justify-between items-center mb-4">
                <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">Earning Hub</span>
                <button className="h-8 w-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">
                    <ArrowUpRight className="h-4 w-4 text-white/60" />
                </button>
            </div>

            <div className="relative w-32 h-32 flex items-center justify-center mb-6">
                {/* SVG Circular Progress */}
                <svg className="w-full h-full -rotate-90">
                    <circle
                        cx="64"
                        cy="64"
                        r="58"
                        stroke="currentColor"
                        strokeWidth="10"
                        fill="transparent"
                        className="text-white/5"
                    />
                    <circle
                        cx="64"
                        cy="64"
                        r="58"
                        stroke="currentColor"
                        strokeWidth="10"
                        fill="transparent"
                        strokeDasharray={360}
                        strokeDashoffset={100}
                        strokeLinecap="round"
                        className="text-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]"
                    />
                </svg>

                {/* Center Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="text-[9px] font-black text-white/30 uppercase tracking-tighter mb-0.5">Earning</div>
                    <div className="text-sm font-black text-white">$28,0421</div>
                </div>

                {/* Inner Glow Decorative */}
                <div className="absolute inset-2 bg-indigo-500/10 rounded-full blur-xl" />
            </div>
        </GlassCard>
    );
}
