"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/badge";
import { AlgoStrategy } from "../types";
import { TrendingUp, Users, AlertTriangle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { GlassButton } from "@/components/ui/GlassButton";

interface AlgoStrategyCardProps {
    strategy: AlgoStrategy;
}

export function AlgoStrategyCard({ strategy }: AlgoStrategyCardProps) {
    return (
        <GlassCard className="flex flex-col h-full hover:border-sky-500/30 transition-all duration-300 group overflow-hidden border-white/5 bg-slate-900/40">
            <div className="p-6">
                <div className="mb-4">
                    <h3 className="text-lg font-bold text-white group-hover:text-sky-400 transition-colors mb-2 line-clamp-1">
                        {strategy.name}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {strategy.description}
                    </p>
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">
                        NIFTY
                    </span>
                    {(strategy.tags || []).map(tag => (
                        <span key={tag} className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-white/5 text-slate-400 border border-white/10">
                            {tag}
                        </span>
                    ))}
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-white/5 text-slate-400 border border-white/10">
                        INTRADAY
                    </span>
                </div>

                <div className="space-y-4 pt-4 border-t border-white/5">
                    <div className="text-center">
                        <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Margin Required (Approx)</div>
                        <div className="text-xl font-bold text-white">
                            ₹{(strategy.capital_required || strategy.min_amount || 0).toLocaleString()}
                        </div>
                    </div>

                    <div className="flex justify-center">
                        <Link
                            href={`/dashboard/algo-trading/${strategy.id}`}
                            className="text-xs text-sky-400 hover:text-sky-300 transition-colors flex items-center gap-1 group/link"
                        >
                            View Details
                            <ArrowRight className="w-3 h-3 group-hover/link:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </div>
            </div>
        </GlassCard>
    );
}
