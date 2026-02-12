"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { ShieldCheck } from "lucide-react";
import { RupeeSwapVisual } from "./RupeeSwapVisual";

export function TrustBanner() {
    return (
        <GlassCard className="relative overflow-hidden border-white/5 bg-gradient-to-br from-indigo-950/40 via-slate-950/90 to-indigo-950/40 rounded-[2.5rem] p-0 group">
            <div className="absolute inset-0 z-0">
                <div className="absolute -right-20 -top-20 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px]" />
                <div className="absolute -left-20 -bottom-20 w-96 h-96 bg-violet-600/10 rounded-full blur-[100px]" />
            </div>

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center p-8 md:p-16">
                <div className="lg:col-span-7 flex flex-col justify-center">
                    <div className="flex items-center gap-2 text-indigo-400 font-black text-[10px] uppercase tracking-[0.3em] mb-6">
                        <ShieldCheck className="h-4 w-4" /> Security & Trust
                    </div>

                    <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-6 leading-tight">
                        Built on <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-violet-300">Trust and Standards</span>
                    </h2>

                    <p className="text-lg text-white/60 font-medium mb-10 leading-relaxed max-w-lg">
                        Our trading rules ensure all orders are handled responsibly,
                        maintaining top-tier reliability and precision for every trader.
                    </p>

                    <GlassButton className="bg-white text-slate-950 hover:bg-slate-100 px-10 py-7 rounded-2xl font-black text-xl transition-all active:scale-95 w-fit">
                        Start Now
                    </GlassButton>
                </div>

                <div className="lg:col-span-5 flex justify-center lg:justify-end">
                    <RupeeSwapVisual />
                </div>
            </div>
        </GlassCard>
    );
}
