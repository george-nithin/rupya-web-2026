"use client";

import { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { supabase } from "@/lib/supabase";
import { ArrowUpRight, Activity } from "lucide-react";

interface FnoMover {
    symbol: string;
    ltp: number;
    change: number;
    percent_change: number;
    open_interest: number;
    oi_change: number;
    oi_percent_change: number;
    buildup: string;
}

export function FnoMovers() {
    const [movers, setMovers] = useState<FnoMover[]>([]);
    const [loading, setLoading] = useState(true);
    const [flashSymbols, setFlashSymbols] = useState<Record<string, boolean>>({});

    // Left Block State
    const [activeMoverTab, setActiveMoverTab] = useState<'Price Gainers' | 'Price Losers' | 'OI Gainers' | 'OI Losers'>('Price Gainers');

    // Right Block State
    const [activeBuildupTab, setActiveBuildupTab] = useState<'Long Buildup' | 'Short Buildup' | 'Short Covering' | 'Long Unwinding'>('Long Buildup');

    useEffect(() => {
        fetchData();

        const channel = supabase
            .channel('fno_movers_updates')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'market_fno_movers' },
                (payload) => {
                    const newData = payload.new as FnoMover;
                    if (newData && newData.symbol) {
                        setMovers(current => {
                            const exists = current.find(m => m.symbol === newData.symbol);
                            if (exists) {
                                return current.map(m => m.symbol === newData.symbol ? { ...m, ...newData } : m);
                            }
                            return [...current, newData];
                        });

                        // Trigger flash
                        setFlashSymbols(prev => ({ ...prev, [newData.symbol]: true }));
                        setTimeout(() => {
                            setFlashSymbols(prev => {
                                const next = { ...prev };
                                delete next[newData.symbol];
                                return next;
                            });
                        }, 1000);
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const fetchData = async () => {
        const { data } = await supabase
            .from('market_fno_movers')
            .select('*');
        if (data) {
            setMovers(data);
        }
        setLoading(false);
    };

    // Filter Logic for Movers
    const getFilteredMovers = () => {
        let sorted = [...movers];
        if (activeMoverTab === 'Price Gainers') {
            return sorted.sort((a, b) => b.percent_change - a.percent_change).slice(0, 5);
        } else if (activeMoverTab === 'Price Losers') {
            return sorted.sort((a, b) => a.percent_change - b.percent_change).slice(0, 5);
        } else if (activeMoverTab === 'OI Gainers') {
            return sorted.sort((a, b) => b.oi_percent_change - a.oi_percent_change).slice(0, 5);
        } else { // OI Losers
            return sorted.sort((a, b) => a.oi_percent_change - b.oi_percent_change).slice(0, 5);
        }
    };

    // Filter Logic for Buildups
    const getFilteredBuildups = () => {
        const filtered = movers.filter(m => m.buildup === activeBuildupTab);
        return filtered.sort((a, b) => b.percent_change - a.percent_change).slice(0, 5); // Sort by magnitude?
    };

    // Helper to render table rows
    const renderTableRows = (data: FnoMover[]) => {
        if (data.length === 0) {
            return (
                <tr>
                    <td colSpan={4} className="py-8 text-center text-muted-foreground text-xs">
                        No data available for this category
                    </td>
                </tr>
            );
        }

        return data.map((item) => {
            const isFlash = !!flashSymbols[item.symbol];
            return (
                <tr
                    key={item.symbol}
                    className={`transition-all duration-500 group border-b border-border/50 last:border-0 active:scale-95 ${isFlash ? 'bg-orange-500/10 border-orange-500/30 ring-1 ring-orange-500/20' : 'hover:bg-card/20'
                        }`}
                >
                    <td className="py-3 pl-4">
                        <div className={`font-black text-xs transition-colors duration-500 uppercase ${isFlash ? 'text-orange-400' : 'text-white group-hover:text-sky-400'}`}>{item.symbol}</div>
                        <div className="text-[10px] text-muted-foreground">MAR 2026</div>
                    </td>
                    <td className="py-3 text-right">
                        <div className={`text-xs font-black transition-colors duration-500 ${isFlash ? 'text-orange-400' : 'text-foreground'}`}>
                            ₹{item.ltp.toLocaleString()}
                        </div>
                    </td>
                    <td className={`py-3 text-right text-xs font-bold transition-colors duration-500 ${isFlash ? 'text-orange-400' : (item.change >= 0 ? 'text-green-400' : 'text-red-400')}`}>
                        {item.change > 0 ? '+' : ''}{item.change.toFixed(2)}
                    </td>
                    <td className="py-3 text-right pr-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black inline-block min-w-[55px] text-center transition-all duration-500 ${isFlash
                            ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40'
                            : (item.percent_change >= 0
                                ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                                : 'bg-red-500/10 text-red-400 border border-red-500/20')
                            }`}>
                            {item.percent_change > 0 ? '+' : ''}{item.percent_change.toFixed(2)}%
                        </span>
                    </td>
                </tr>
            );
        });
    };

    const TabButton = ({ active, label, onClick }: any) => (
        <button
            onClick={onClick}
            className={`px-3 py-1.5 text-[10px] font-medium rounded-xl transition-all border uppercase tracking-wider ${active
                ? 'bg-sky-500/10 text-sky-400 border-sky-500/20 shadow-[0_0_10px_rgba(14,165,233,0.1)]'
                : 'text-muted-foreground border-transparent hover:text-foreground hover:bg-card/20'
                }`}
        >
            {label}
        </button>
    );

    return (
        <div className="space-y-4 w-full">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                    <Activity className="h-5 w-5 text-sky-400" />
                    Movers and Buildups
                </h2>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 w-full">
                {/* MOVERS PANEL */}
                <GlassCard className="p-0 overflow-hidden flex flex-col h-full w-full bg-card/40 backdrop-blur-md border border-border">
                    <div className="p-4 border-b border-border/50 bg-white/[0.02]">
                        <div className="flex flex-wrap gap-2">
                            {['Price Gainers', 'Price Losers', 'OI Gainers', 'OI Losers'].map(tab => (
                                <TabButton
                                    key={tab}
                                    label={tab}
                                    active={activeMoverTab === tab}
                                    onClick={() => setActiveMoverTab(tab as any)}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="p-0 flex-1 w-full">
                        {loading ? (
                            <div className="h-64 flex items-center justify-center text-muted-foreground text-xs animate-pulse">Loading market data...</div>
                        ) : (
                            <div className="overflow-x-auto w-full">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-border/50 text-muted-foreground text-[10px] uppercase tracking-wider bg-white/[0.01]">
                                            <th className="py-2 pl-4 font-medium">F&O Scrips</th>
                                            <th className="py-2 text-right font-medium">LTP</th>
                                            <th className="py-2 text-right font-medium">Chng</th>
                                            <th className="py-2 text-right pr-4 font-medium">%Chng</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5 w-full">
                                        {renderTableRows(getFilteredMovers())}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    <div className="p-3 border-t border-border/50 bg-white/[0.01] flex justify-end">
                        <button className="text-[10px] text-sky-400 hover:text-sky-300 font-bold uppercase tracking-wider flex items-center gap-1">
                            View All <ArrowUpRight className="h-3 w-3" />
                        </button>
                    </div>
                </GlassCard>

                {/* BUILDUPS PANEL */}
                <GlassCard className="p-0 overflow-hidden flex flex-col h-full w-full bg-card/40 backdrop-blur-md border border-border">
                    <div className="p-4 border-b border-border/50 bg-white/[0.02]">
                        <div className="flex flex-wrap gap-2">
                            {['Long Buildup', 'Short Buildup', 'Short Covering', 'Long Unwinding'].map(tab => (
                                <TabButton
                                    key={tab}
                                    label={tab}
                                    active={activeBuildupTab === tab}
                                    onClick={() => setActiveBuildupTab(tab as any)}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="p-0 flex-1 w-full">
                        {loading ? (
                            <div className="h-64 flex items-center justify-center text-muted-foreground text-xs animate-pulse">Loading data...</div>
                        ) : (
                            <div className="overflow-x-auto w-full">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-border/50 text-muted-foreground text-[10px] uppercase tracking-wider bg-white/[0.01]">
                                            <th className="py-2 pl-4 font-medium">F&O Scrips</th>
                                            <th className="py-2 text-right font-medium">LTP</th>
                                            <th className="py-2 text-right font-medium">Chng</th>
                                            <th className="py-2 text-right pr-4 font-medium">%Chng</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5 w-full">
                                        {renderTableRows(getFilteredBuildups())}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    <div className="p-3 border-t border-border/50 bg-white/[0.01] flex justify-end">
                        <button className="text-[10px] text-sky-400 hover:text-sky-300 font-bold uppercase tracking-wider flex items-center gap-1">
                            View All <ArrowUpRight className="h-3 w-3" />
                        </button>
                    </div>
                </GlassCard>
            </div>
        </div>
    );
}
