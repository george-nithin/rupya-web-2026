"use client";

import { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { supabase } from "@/lib/supabase";
import { TrendingUp, TrendingDown, Target, AlertTriangle, Clock, ArrowRight, Eye, Star, BarChart2, Link as LinkIcon } from "lucide-react";

interface Recommendation {
    id: string;
    symbol: string;
    recommendation_type: 'BUY' | 'SELL' | 'HOLD';
    timeframe: string;
    entry_price: number;
    target_price: number;
    stop_loss: number;
    created_at: string;
    conviction: string;
}

export function ResearchRecommendations() {
    const [recs, setRecs] = useState<Recommendation[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFlash, setIsFlash] = useState(false);

    useEffect(() => {
        const fetchRecs = async () => {
            const { data } = await supabase
                .from('research_recommendations')
                .select('*')
                .eq('active', true)
                .order('created_at', { ascending: false })
                .limit(6);

            if (data) setRecs(data);
            setLoading(false);
        };

        fetchRecs();

        const channel = supabase
            .channel('research_updates')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'research_recommendations' },
                () => {
                    fetchRecs();
                    setIsFlash(true);
                    setTimeout(() => setIsFlash(false), 1000);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const getPotential = (rec: Recommendation) => {
        const diff = Math.abs(rec.target_price - rec.entry_price);
        const pct = (diff / rec.entry_price) * 100;
        return pct.toFixed(2) + "%";
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                    F&O Research Recommendations
                </h2>
                <button className="text-xs text-sky-400 hover:text-white flex items-center gap-1">
                    VIEW ALL TRADING IDEAS <ArrowRight className="h-5 w-5" />
                </button>
            </div>

            <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 transition-all duration-700 ${isFlash ? 'ring-2 ring-sky-500/20 bg-sky-500/5 p-2 rounded-2xl' : ''}`}>
                {loading ? (
                    [1, 2, 3].map(i => (
                        <div key={i} className="h-64 bg-card/40 rounded-xl border border-border/50 animate-pulse" />
                    ))
                ) : recs.length > 0 ? (
                    recs.map((rec) => (
                        <div key={rec.id} className={`rounded-xl overflow-hidden border border-border bg-[#0f1115] hover:border-sky-500/30 transition-all group relative ${isFlash ? 'border-sky-500/50 shadow-[0_0_15px_rgba(14,165,233,0.1)]' : ''}`}>
                            {/* Top Banner (Target Expected) */}
                            <div className="absolute top-3 right-3 z-10">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border transition-colors duration-500 ${isFlash ? 'text-sky-400 border-sky-400 bg-sky-400/10' : (rec.recommendation_type === 'BUY'
                                    ? 'text-green-400 bg-green-500/10 border-green-500/20'
                                    : 'text-red-400 bg-red-500/10 border-red-500/20')
                                    }`}>
                                    {getPotential(rec)} TARGET {rec.recommendation_type === 'BUY' ? 'EXPECTED' : 'LEFT'}
                                </span>
                            </div>

                            {/* Card Header */}
                            <div className="p-4 border-b border-border/50">
                                <h3 className="font-bold text-foreground text-md tracking-wide">{rec.symbol}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[10px] text-muted-foreground">24 Feb 2026</span>
                                    <span className="text-[10px] text-purple-400 bg-purple-500/10 px-1 rounded border border-purple-500/20">CE</span>
                                </div>
                                <div className="mt-2">
                                    <span className="text-[9px] text-muted-foreground uppercase border border-border px-1.5 py-0.5 rounded bg-card/20 tracking-wider">
                                        {rec.timeframe}
                                    </span>
                                </div>
                            </div>

                            {/* Card Body */}
                            <div className="p-4 bg-[#0a0c10]/50">
                                <div className="flex justify-between items-end mb-4">
                                    <div>
                                        <div className="text-[10px] text-muted-foreground mb-0.5 flex items-center gap-1">
                                            LTP: <span className="text-green-400 text-[9px] flex items-center">● Within Buy Range</span>
                                        </div>
                                        <div className="text-lg font-mono font-bold text-foreground flex items-center gap-2">
                                            {rec.entry_price}
                                            <span className={`text-xs ${rec.recommendation_type === 'BUY' ? 'text-green-400' : 'text-red-400'}`}>
                                                <TrendingUp className="h-3 w-3 inline mr-0.5" />
                                                +13.02%
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[10px] text-muted-foreground mb-0.5">Recommended Price:</div>
                                        <div className="text-sm font-bold text-foreground/80 font-mono">
                                            {rec.entry_price} - {(rec.entry_price * 1.01).toFixed(2)}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center pt-3 border-t border-dashed border-border">
                                    <div>
                                        <div className="text-[10px] text-muted-foreground mb-0.5">Target:</div>
                                        <div className="text-sm font-bold text-foreground font-mono">{rec.target_price}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[10px] text-muted-foreground mb-0.5">StopLoss:</div>
                                        <div className="text-sm font-bold text-foreground/80 font-mono">{rec.stop_loss}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Card Footer Actions */}
                            <div className="p-3 bg-[#0a0c10] border-t border-border/50 flex justify-between items-center">
                                <div className="text-[9px] text-slate-600">
                                    Updated: {new Date(rec.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>

                                <div className="flex items-center gap-2">
                                    <button className="p-1.5 text-muted-foreground hover:text-foreground bg-card/20 rounded transition-all duration-150 border border-border/50 hover:border-border">
                                        <LinkIcon className="h-3.5 w-3.5" />
                                    </button>
                                    <button className="p-1.5 text-muted-foreground hover:text-foreground bg-card/20 rounded transition-all duration-150 border border-border/50 hover:border-border">
                                        <BarChart2 className="h-3.5 w-3.5" />
                                    </button>
                                    <button className="p-1.5 text-muted-foreground hover:text-foreground bg-card/20 rounded transition-all duration-150 border border-border/50 hover:border-border">
                                        <Eye className="h-3.5 w-3.5" />
                                    </button>
                                    <button className="p-1.5 text-muted-foreground hover:text-yellow-400 bg-card/20 rounded transition-all duration-150 border border-border/50 hover:border-border">
                                        <Star className="h-3.5 w-3.5" />
                                    </button>

                                    <button className={`ml-2 px-4 py-1.5 text-[10px] font-bold rounded flex items-center gap-1 transition-all uppercase tracking-wider ${rec.recommendation_type === 'BUY'
                                        ? 'bg-teal-500 hover:bg-teal-400 text-black shadow-[0_0_10px_rgba(20,184,166,0.2)]'
                                        : 'bg-red-500 hover:bg-red-400 text-white shadow-[0_0_10px_rgba(239,68,68,0.2)]'
                                        }`}>
                                        {rec.recommendation_type}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full py-20 flex flex-col items-center justify-center text-muted-foreground border border-dashed border-border rounded-xl bg-white/[0.02]">
                        <p className="font-medium">No trading ideas available right now.</p>
                        <p className="text-xs mt-1">Our algorithms are scanning the market...</p>
                    </div>
                )}
            </div>
        </div>
    );
}
