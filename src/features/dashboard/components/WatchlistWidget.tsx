"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { Plus, TrendingUp, TrendingDown, Clock, ArrowRight } from "lucide-react";
import { useState } from "react";

// Real Data Implementation
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function WatchlistWidget() {
    const [watchlistData, setWatchlistData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'gainers' | 'losers'>('all');
    const [flashSymbols, setFlashSymbols] = useState<Record<string, boolean>>({});

    useEffect(() => {
        fetchWatchlist();

        const channel = supabase
            .channel('watchlist_changes')
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'market_equity_quotes'
                },
                (payload) => {
                    const newData = payload.new as any;
                    setWatchlistData(current => {
                        const exists = current.find(item => item.symbol === newData.symbol);
                        if (exists) {
                            // Trigger flash for this symbol
                            setFlashSymbols(prev => ({ ...prev, [newData.symbol]: true }));
                            setTimeout(() => {
                                setFlashSymbols(prev => {
                                    const next = { ...prev };
                                    delete next[newData.symbol];
                                    return next;
                                });
                            }, 1000);

                            return current.map(item =>
                                item.symbol === newData.symbol
                                    ? {
                                        ...item,
                                        ltp: newData.last_price,
                                        dayChange: newData.change || 0,
                                        dayPercent: newData.percent_change || 0,
                                        momentum: (newData.percent_change || 0) > 0 ? "bullish" : "bearish"
                                    }
                                    : item
                            );
                        }
                        return current;
                    });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const fetchWatchlist = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: watchlist, error: wError } = await supabase
                .from('user_watchlist')
                .select('symbol')
                .eq('user_id', user.id);

            if (wError) throw wError;
            if (!watchlist || watchlist.length === 0) {
                setWatchlistData([]);
                setLoading(false);
                return;
            }

            const symbols = watchlist.map(w => w.symbol);

            const { data: quotes, error: qError } = await supabase
                .from('market_equity_quotes')
                .select('symbol, last_price, change, percent_change, pchange_1y')
                .in('symbol', symbols);

            if (qError) throw qError;

            const mappedData = quotes?.map(q => ({
                symbol: q.symbol,
                ltp: q.last_price,
                dayChange: q.change || 0,
                dayPercent: q.percent_change || 0,
                sinceChange: 0,
                sincePercent: q.pchange_1y || 0,
                addedAt: "Live",
                momentum: (q.percent_change || 0) > 0 ? "bullish" : "bearish"
            })) || [];

            setWatchlistData(mappedData);
        } catch (error) {
            console.error("Error fetching watchlist:", error);
        } finally {
            setLoading(false);
        }
    };

    const filtered = watchlistData.filter(item => {
        if (filter === 'gainers') return item.dayPercent > 0;
        if (filter === 'losers') return item.dayPercent < 0;
        return true;
    });

    return (
        <GlassCard className="col-span-1 lg:col-span-4 h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="text-lg font-semibold text-foreground">Watchlist</h2>
                    <div className="flex gap-2 text-xs text-muted-foreground mt-1">
                        <span className={`cursor-pointer hover:text-foreground transition-all duration-150 ${filter === 'all' ? 'text-foreground font-bold' : ''}`} onClick={() => setFilter('all')}>All</span>
                        <span className={`cursor-pointer hover:text-green-400 transition-all duration-150 ${filter === 'gainers' ? 'text-green-400 font-bold' : ''}`} onClick={() => setFilter('gainers')}>Gainers</span>
                        <span className={`cursor-pointer hover:text-red-400 transition-all duration-150 ${filter === 'losers' ? 'text-red-400 font-bold' : ''}`} onClick={() => setFilter('losers')}>Losers</span>
                    </div>
                </div>
                <GlassButton size="sm" variant="ghost">
                    <Plus className="h-5 w-5" />
                </GlassButton>
            </div>

            <div className="space-y-1 flex-1 overflow-y-auto pr-1 custom-scrollbar">
                {filtered.map((item) => {
                    const isFlash = !!flashSymbols[item.symbol];
                    return (
                        <div
                            key={item.symbol}
                            className={`group p-3 rounded-xl transition-all cursor-pointer border border-transparent hover:border-border/50 active:scale-95 ${isFlash ? 'bg-orange-500/10 border-orange-500/30 ring-1 ring-orange-500/20' : 'hover:bg-card/20'
                                }`}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <span className={`font-bold transition-colors ${isFlash ? 'text-orange-400' : 'text-foreground'}`}>{item.symbol}</span>
                                    {item.momentum === 'bullish' && <div className={`h-2 w-2 rounded-full bg-green-500 ${isFlash ? 'animate-ping' : ''}`} />}
                                    {item.momentum === 'bearish' && <div className={`h-2 w-2 rounded-full bg-red-500 ${isFlash ? 'animate-ping' : ''}`} />}
                                </div>
                                <div className="text-right">
                                    <div className={`text-sm font-black transition-colors ${isFlash ? 'text-orange-400' : 'text-foreground'}`}>₹{item.ltp.toLocaleString()}</div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between text-[10px]">
                                <div className="flex items-center text-muted-foreground gap-3">
                                    <span className={`flex items-center font-bold ${item.dayPercent >= 0 ? "text-green-400" : "text-red-400"}`}>
                                        {item.dayPercent >= 0 ? "+" : ""}{item.dayPercent.toFixed(2)}%
                                    </span>
                                    <span className="flex items-center gap-1 opacity-40">
                                        <Clock className="h-2.5 w-2.5" /> {item.addedAt}
                                    </span>
                                </div>
                                <div className={`font-black ${item.sincePercent >= 0 ? "text-green-400" : "text-red-400"}`}>
                                    {item.sincePercent >= 0 ? "+" : ""}{item.sincePercent.toFixed(2)}%
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="pt-4 mt-2 border-t border-border/50">
                <GlassButton variant="ghost" className="w-full text-[10px] uppercase tracking-widest font-black text-muted-foreground hover:text-foreground justify-between">
                    Market Intelligence <ArrowRight className="h-3 w-3" />
                </GlassButton>
            </div>
        </GlassCard>
    );
}
