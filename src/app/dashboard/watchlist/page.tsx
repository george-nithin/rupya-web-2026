"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { GlassInput } from "@/components/ui/GlassInput";
import {
    Search, Filter, ArrowUpRight, ArrowDownRight, MoreHorizontal,
    Activity, BarChart2, TrendingUp, ChevronDown, Eye, Plus, Trash2, X
} from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis } from "recharts";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

// Mock Data for Sparklines
const generateSparkData = (change: number) =>
    Array.from({ length: 20 }, (_, i) => ({
        value: 100 + (change >= 0 ? i * 0.5 : -i * 0.5) + Math.random() * 5
    }));

export default function WatchlistPage() {
    const [watchlist, setWatchlist] = useState<any[]>([]);
    const [topGainers, setTopGainers] = useState<any[]>([]);
    const [topLosers, setTopLosers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [showSearchBox, setShowSearchBox] = useState(false);
    const [flashSymbols, setFlashSymbols] = useState<Record<string, boolean>>({});

    useEffect(() => {
        fetchWatchlist();
        fetchMovers();

        // Realtime Subscription for Watchlist Prices
        const channel = supabase
            .channel('watchlist_realtime')
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'market_equity_quotes' },
                (payload) => {
                    const updated = payload.new as any;
                    setFlashSymbols(prev => ({ ...prev, [updated.symbol]: true }));
                    setTimeout(() => {
                        setFlashSymbols(prev => {
                            const next = { ...prev };
                            delete next[updated.symbol];
                            return next;
                        });
                    }, 1000);

                    // Optimistically update the watchlist state if the symbol exists
                    setWatchlist(prev => prev.map(s =>
                        s.symbol === updated.symbol ? { ...s, ...updated } : s
                    ));
                }
            )
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'market_movers' },
                () => fetchMovers()
            )
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'user_watchlist' },
                () => fetchWatchlist()
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

            const { data: watch } = await supabase
                .from('user_watchlist')
                .select('symbol')
                .eq('user_id', user.id);

            if (!watch || watch.length === 0) {
                setWatchlist([]);
                return;
            }

            const symbols = watch.map(w => w.symbol);
            const { data: quotes } = await supabase
                .from('market_equity_quotes')
                .select('*')
                .in('symbol', symbols);

            setWatchlist(quotes || []);
        } finally {
            setLoading(false);
        }
    };

    const fetchMovers = async () => {
        const { data: gainers } = await supabase.from('market_movers').select('*').eq('type', 'gainer').limit(3);
        const { data: losers } = await supabase.from('market_movers').select('*').eq('type', 'loser').limit(3);
        setTopGainers(gainers || []);
        setTopLosers(losers || []);
    };

    const handleSearch = async (query: string) => {
        setSearchQuery(query);
        if (query.length < 2) {
            setSearchResults([]);
            return;
        }

        const { data } = await supabase
            .from('market_equity_quotes')
            .select('symbol, company_name, last_price, percent_change')
            .or(`symbol.ilike.%${query}%,company_name.ilike.%${query}%`)
            .limit(5);

        setSearchResults(data || []);
    };

    const addToWatchlist = async (symbol: string) => {
        try {
            // Adding to watchlist
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                console.error("No user found");
                return;
            }

            const { error } = await supabase.from('user_watchlist').upsert({ user_id: user.id, symbol });
            if (error) {
                console.error("Error adding to watchlist:", error);
                return;
            }

            // Successfully added to watchlist
            setShowSearchBox(false);
            setSearchQuery("");
            await fetchWatchlist();
        } catch (err) {
            console.error("Unexpected error adding to watchlist:", err);
        }
    };

    const removeFromWatchlist = async (symbol: string) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        await supabase.from('user_watchlist').delete().eq('user_id', user.id).eq('symbol', symbol);
        fetchWatchlist();
    };

    return (
        <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl md:text-2xl font-bold text-foreground tracking-tight">Market Watchlist</h1>
                    <p className="text-muted-foreground text-xs md:text-sm">Monitor your favorite assets in real-time.</p>
                </div>

                <div className="flex items-center gap-3 relative">
                    <div className="relative group w-full md:w-auto">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search & Add Assets..."
                            value={searchQuery}
                            onChange={(e) => handleSearch(e.target.value)}
                            onFocus={() => setShowSearchBox(true)}
                            onBlur={() => setTimeout(() => setShowSearchBox(false), 200)}
                            className="bg-secondary/50 border border-border/50 rounded-xl pl-10 pr-4 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 w-full md:w-64 transition-all placeholder:text-muted-foreground"
                        />

                        {showSearchBox && searchResults.length > 0 && (
                            <div className="absolute top-full mt-2 w-full bg-card border border-border rounded-xl shadow-2xl z-50 overflow-hidden">
                                {searchResults.map((res) => (
                                    <div
                                        key={res.symbol}
                                        className="p-3 hover:bg-secondary/50 flex justify-between items-center cursor-pointer border-b border-border/50 last:border-0 active:scale-95"
                                        onMouseDown={(e) => {
                                            e.preventDefault();
                                            addToWatchlist(res.symbol);
                                        }}
                                    >
                                        <div>
                                            <div className="text-sm font-bold text-foreground">{res.symbol}</div>
                                            <div className="text-[10px] text-muted-foreground truncate max-w-[150px]">{res.company_name}</div>
                                        </div>
                                        <Plus className="h-5 w-5 text-primary" />
                                    </div>
                                ))}
                            </div>
                        )}
                        {showSearchBox && searchQuery && searchResults.length === 0 && (
                            <div className="absolute top-full mt-2 w-full bg-card border border-border rounded-xl p-4 text-xs text-muted-foreground text-center">
                                No stocks found
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Hero Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <GlassCard>
                    <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Watchlist Size</div>
                    <div className="text-2xl font-bold text-foreground">{watchlist.length} Assets</div>
                </GlassCard>
                <GlassCard>
                    <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Net Change (24h)</div>
                    <div className="text-2xl font-bold text-emerald-500">+1.24%</div>
                </GlassCard>
                <GlassCard className="hidden md:block">
                    <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Top Sector</div>
                    <div className="text-2xl font-bold text-foreground">Banking</div>
                </GlassCard>
                <GlassCard className="hidden md:block">
                    <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Day Volume</div>
                    <div className="text-2xl font-bold text-foreground">2.4B</div>
                </GlassCard>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Watchlist Table */}
                <div className="lg:col-span-9">
                    <GlassCard className="p-0 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-secondary/30 text-muted-foreground border-b border-border/50">
                                    <tr>
                                        <th className="px-4 md:px-6 py-3 font-semibold text-xs uppercase">Stock</th>
                                        <th className="px-4 md:px-6 py-3 font-semibold text-xs uppercase text-right">Price</th>
                                        <th className="px-4 md:px-6 py-3 font-semibold text-xs uppercase text-right">Change</th>
                                        <th className="hidden md:table-cell px-6 py-3 font-semibold text-xs uppercase text-right">Volume</th>
                                        <th className="hidden md:table-cell px-6 py-3 font-semibold text-xs uppercase">Sector</th>
                                        <th className="px-4 md:px-6 py-3 font-semibold text-xs uppercase text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/30">
                                    {loading ? (
                                        <tr><td colSpan={6} className="text-center py-20 text-muted-foreground">Loading your watchlist...</td></tr>
                                    ) : watchlist.length === 0 ? (
                                        <tr><td colSpan={6} className="text-center py-20 text-muted-foreground">Your watchlist is empty. Search above to add stocks.</td></tr>
                                    ) : watchlist.map((stock) => {
                                        const isFlash = !!flashSymbols[stock.symbol];
                                        return (
                                            <tr
                                                key={stock.symbol}
                                                className={`group transition-all duration-500 hover:bg-secondary/30 ${isFlash ? 'bg-orange-500/10 ring-1 ring-orange-500/20' : ''
                                                    }`}
                                            >
                                                <td className="px-4 md:px-6 py-3">
                                                    <Link href={`/dashboard/market/${stock.symbol}`} className="flex items-center gap-3">
                                                        <div className={`h-8 w-8 rounded-xl flex items-center justify-center font-black text-xs md:text-sm transition-colors duration-500 ${isFlash ? 'bg-orange-500 text-white' : 'bg-secondary/50 text-primary'}`}>
                                                            {stock.symbol[0]}
                                                        </div>
                                                        <div>
                                                            <div className={`font-black tracking-tight transition-colors duration-500 ${isFlash ? 'text-orange-400' : 'text-foreground'}`}>
                                                                {stock.symbol}
                                                            </div>
                                                            <div className="text-[10px] text-muted-foreground truncate max-w-[100px] md:max-w-[160px] font-bold uppercase">{stock.company_name}</div>
                                                        </div>
                                                    </Link>
                                                </td>
                                                <td className={`px-4 md:px-6 py-3 text-right font-black transition-colors duration-500 ${isFlash ? 'text-orange-400' : 'text-foreground'}`}>
                                                    ₹{stock.last_price?.toLocaleString()}
                                                </td>
                                                <td className={`px-4 md:px-6 py-3 text-right font-black transition-colors duration-500 ${isFlash ? 'text-orange-400' : (stock.percent_change >= 0 ? "text-emerald-500" : "text-red-500")}`}>
                                                    {stock.percent_change > 0 ? "+" : ""}{stock.percent_change}%
                                                </td>
                                                <td className="hidden md:table-cell px-6 py-3 text-right text-muted-foreground text-[10px] font-mono">
                                                    {(stock.total_traded_volume / 1000000).toFixed(1)}M
                                                </td>
                                                <td className="hidden md:table-cell px-6 py-3">
                                                    <span className="px-2 py-1 rounded bg-secondary/50 text-[9px] font-black text-white/40 border border-white/5 uppercase tracking-wider">
                                                        {stock.sector || "N/A"}
                                                    </span>
                                                </td>
                                                <td className="px-4 md:px-6 py-3 text-right">
                                                    <button
                                                        onClick={() => removeFromWatchlist(stock.symbol)}
                                                        className="p-2 opacity-0 group-hover:opacity-100 hover:bg-destructive/10 rounded-xl text-destructive transition-all active:scale-95"
                                                    >
                                                        <Trash2 className="h-5 w-5" />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </GlassCard>
                </div>

                {/* Sidebar Movers (Stacked below on mobile) */}
                <div className="lg:col-span-3 space-y-6">
                    <GlassCard>
                        <h3 className="text-sm font-bold text-foreground mb-4 flex justify-between items-center">
                            Top Gainers <TrendingUp className="h-5 w-5 text-emerald-500" />
                        </h3>
                        <div className="space-y-3">
                            {topGainers.map((stock) => (
                                <Link key={stock.symbol} href={`/dashboard/market/${stock.symbol}`} className="flex justify-between items-center p-2 hover:bg-secondary/50 rounded-xl transition-all duration-150 active:scale-95">
                                    <span className="text-sm font-medium text-foreground">{stock.symbol}</span>
                                    <span className="text-[10px] font-bold text-emerald-500">+{stock.percent_change}%</span>
                                </Link>
                            ))}
                        </div>
                    </GlassCard>

                    <GlassCard>
                        <h3 className="text-sm font-bold text-foreground mb-4 flex justify-between items-center">
                            Top Losers <ArrowDownRight className="h-5 w-5 text-red-500" />
                        </h3>
                        <div className="space-y-3">
                            {topLosers.map((stock) => (
                                <Link key={stock.symbol} href={`/dashboard/market/${stock.symbol}`} className="flex justify-between items-center p-2 hover:bg-secondary/50 rounded-xl transition-all duration-150 active:scale-95">
                                    <span className="text-sm font-medium text-foreground">{stock.symbol}</span>
                                    <span className="text-[10px] font-bold text-red-500">{stock.percent_change}%</span>
                                </Link>
                            ))}
                        </div>
                    </GlassCard>
                </div>
            </div>
        </div>
    );
}
