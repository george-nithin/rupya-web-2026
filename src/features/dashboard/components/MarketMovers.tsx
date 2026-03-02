"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { TrendingUp, TrendingDown, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { GlassButton } from "@/components/ui/GlassButton";

interface Mover {
    symbol: string;
    price: number;
    change: number;
    percent_change: number;
    type: 'gainer' | 'loser';
}

export function MarketMovers() {
    const [gainers, setGainers] = useState<Mover[]>([]);
    const [losers, setLosers] = useState<Mover[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFlash, setIsFlash] = useState(false);

    const fetchMovers = async () => {
        const { data } = await supabase
            .from('market_movers')
            .select('*')
            .order('percent_change', { ascending: false });

        if (data) {
            const g = data.filter(d => d.type === 'gainer').slice(0, 5);
            const l = data.filter(d => d.type === 'loser').slice(0, 5);
            setGainers(g);
            setLosers(l);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchMovers();

        const channel = supabase
            .channel('market_movers_updates')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'market_movers' },
                () => {
                    fetchMovers();
                    setIsFlash(true);
                    setTimeout(() => setIsFlash(false), 1000);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    if (loading) return null;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
            <GlassCard className={`p-6 border-white/5 transition-all duration-500 ${isFlash ? 'ring-2 ring-green-500/30 bg-green-500/5' : ''}`}>
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-green-400" />
                        <h3 className="text-lg font-black text-white uppercase tracking-tight">Top Gainers</h3>
                    </div>
                </div>
                <div className="space-y-3">
                    {gainers.map((g) => (
                        <div key={g.symbol} className="flex justify-between items-center p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5">
                            <div>
                                <div className="text-sm font-black text-white">{g.symbol}</div>
                                <div className="text-[10px] text-white/40 uppercase font-bold tracking-widest">NSE Live</div>
                            </div>
                            <div className="text-right">
                                <div className="text-sm font-black text-white">₹{g.price.toLocaleString()}</div>
                                <div className="text-xs font-bold text-green-400">+{g.percent_change.toFixed(2)}%</div>
                            </div>
                        </div>
                    ))}
                </div>
            </GlassCard>

            <GlassCard className={`p-6 border-white/5 transition-all duration-500 ${isFlash ? 'ring-2 ring-red-500/30 bg-red-500/5' : ''}`}>
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-2">
                        <TrendingDown className="h-5 w-5 text-red-400" />
                        <h3 className="text-lg font-black text-white uppercase tracking-tight">Top Losers</h3>
                    </div>
                </div>
                <div className="space-y-3">
                    {losers.map((l) => (
                        <div key={l.symbol} className="flex justify-between items-center p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5">
                            <div>
                                <div className="text-sm font-black text-white">{l.symbol}</div>
                                <div className="text-[10px] text-white/40 uppercase font-bold tracking-widest">NSE Live</div>
                            </div>
                            <div className="text-right">
                                <div className="text-sm font-black text-white">₹{l.price.toLocaleString()}</div>
                                <div className="text-xs font-bold text-red-400">{l.percent_change.toFixed(2)}%</div>
                            </div>
                        </div>
                    ))}
                </div>
            </GlassCard>
        </div>
    );
}
