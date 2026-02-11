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
        <GlassCard className="flex flex-col h-full hover:border-primary/50 transition-colors group">
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center border border-white/10">
                        <TrendingUp className="h-5 w-5 text-indigo-400" />
                    </div>
                    <div>
                        <h3 className="font-bold text-white group-hover:text-primary transition-colors">{strategy.name}</h3>
                        <p className="text-xs text-slate-400">by {strategy.manager_name}</p>
                    </div>
                </div>
                <Badge variant="outline" className={`
                    ${strategy.risk_level === 'Low' ? 'border-green-500/50 text-green-400' :
                        strategy.risk_level === 'Medium' ? 'border-yellow-500/50 text-yellow-400' :
                            'border-red-500/50 text-red-400'}
                `}>
                    {strategy.risk_level} Risk
                </Badge>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
                {(strategy.tags || []).map(tag => (
                    <span key={tag} className="text-[10px] px-2 py-1 rounded-full bg-white/5 text-slate-400 border border-white/5">
                        {tag}
                    </span>
                ))}
            </div>

            <div className="grid grid-cols-3 gap-2 mb-6 p-3 rounded-xl bg-white/5 border border-white/5">
                <div className="text-center">
                    <div className="text-[10px] text-slate-500 mb-1">CAGR</div>
                    <div className="text-sm font-bold text-green-400">{strategy.cagr}%</div>
                </div>
                <div className="text-center border-l border-white/5">
                    <div className="text-[10px] text-slate-500 mb-1">Win Rate</div>
                    <div className="text-sm font-bold text-sky-400">{strategy.win_rate}%</div>
                </div>
                <div className="text-center border-l border-white/5">
                    <div className="text-[10px] text-slate-500 mb-1">Max DD</div>
                    <div className="text-sm font-bold text-red-400">{strategy.max_drawdown}%</div>
                </div>
            </div>

            <div className="mt-auto space-y-3">
                <div className="flex justify-between text-xs text-slate-400">
                    <span>Min Capital</span>
                    <span className="text-slate-200">₹{(strategy.min_amount || 0).toLocaleString()}</span>
                </div>

                <div className="flex gap-2">
                    <Link href={`/dashboard/algo-trading/${strategy.id}`} className="flex-1">
                        <GlassButton size="sm" variant="secondary" className="w-full justify-center text-xs">
                            Analytics
                        </GlassButton>
                    </Link>
                    {['ma_crossover', 'rsi_mean_reversion', 'breakout', 'buy_and_hold'].includes(strategy.id) ? (
                        <Link href={`/dashboard/backtesting/strategies/new?clone=${strategy.id}`} className="flex-1">
                            <GlassButton size="sm" className="w-full justify-center text-xs group-hover:bg-primary group-hover:text-primary-foreground">
                                Clone & Edit
                            </GlassButton>
                        </Link>
                    ) : (
                        <Link href={`/dashboard/algo-trading/${strategy.id}`} className="flex-1">
                            <GlassButton size="sm" className="w-full justify-center text-xs group-hover:bg-primary group-hover:text-primary-foreground">
                                Edit
                            </GlassButton>
                        </Link>
                    )}
                </div>
            </div>
        </GlassCard>
    );
}
