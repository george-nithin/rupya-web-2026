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

    useEffect(() => {
        fetchWatchlist();
    }, []);

    const fetchWatchlist = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // 1. Get user watchlist symbols
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

            // 2. Get market data for those symbols
            const { data: quotes, error: qError } = await supabase
                .from('market_equity_quotes')
                .select('symbol, last_price, pchange_30d, pchange_1y') // Using available fields as proxy for day change if needed, or just display available data
                .in('symbol', symbols);

            if (qError) throw qError;

            // Map to widget format
            const mappedData = quotes?.map(q => ({
                symbol: q.symbol,
                ltp: q.last_price,
                dayChange: 0, // Not available in current schema, defaulting
                dayPercent: q.pchange_30d ? (q.pchange_30d / 30) : 0, // Rough proxy or 0
                sinceChange: 0,
                sincePercent: q.pchange_1y || 0,
                addedAt: "Recently", // Timestamp not tracked in join usually
                momentum: (q.pchange_30d || 0) > 0 ? "bullish" : "bearish"
            })) || [];

            setWatchlistData(mappedData);
        } catch (error) {
            console.error("Error fetching watchlist:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <GlassCard className="col-span-1 lg:col-span-4 h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="text-lg font-semibold text-white">Watchlist</h2>
                    <div className="flex gap-2 text-xs text-slate-400 mt-1">
                        <span className="cursor-pointer hover:text-white transition-colors" onClick={() => setFilter('all')}>All</span>
                        <span className="cursor-pointer hover:text-green-400 transition-colors" onClick={() => setFilter('gainers')}>Gainers</span>
                        <span className="cursor-pointer hover:text-red-400 transition-colors" onClick={() => setFilter('losers')}>Losers</span>
                    </div>
                </div>
                <GlassButton size="sm" variant="ghost">
                    <Plus className="h-4 w-4" />
                </GlassButton>
            </div>

            <div className="space-y-1 flex-1 overflow-y-auto pr-1 custom-scrollbar">
                {watchlistData.map((item) => (
                    <div
                        key={item.symbol}
                        className="group p-3 rounded-lg hover:bg-white/5 transition-all cursor-pointer border border-transparent hover:border-white/5"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-white">{item.symbol}</span>
                                {item.momentum === 'bullish' && <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />}
                                {item.momentum === 'bearish' && <div className="h-2 w-2 rounded-full bg-red-500" />}
                            </div>
                            <div className="text-right">
                                <div className="text-sm font-medium text-slate-200">₹{item.ltp.toLocaleString()}</div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center text-slate-500 gap-3">
                                <span className={`flex items-center ${item.dayPercent >= 0 ? "text-green-400" : "text-red-400"}`}>
                                    {item.dayPercent >= 0 ? "+" : ""}{item.dayPercent}% (Day)
                                </span>
                                <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" /> {item.addedAt}
                                </span>
                            </div>
                            <div className={`font-medium ${item.sincePercent >= 0 ? "text-green-400" : "text-red-400"}`}>
                                {item.sincePercent >= 0 ? "+" : ""}{item.sincePercent}% Total
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="pt-4 mt-2 border-t border-white/10">
                <GlassButton variant="ghost" className="w-full text-xs text-slate-400 hover:text-white justify-between">
                    View Analytics <ArrowRight className="h-3 w-3" />
                </GlassButton>
            </div>
        </GlassCard>
    );
}
