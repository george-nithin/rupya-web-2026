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

    // Left Block State
    const [activeMoverTab, setActiveMoverTab] = useState<'Price Gainers' | 'Price Losers' | 'OI Gainers' | 'OI Losers'>('Price Gainers');

    // Right Block State
    const [activeBuildupTab, setActiveBuildupTab] = useState<'Long Buildup' | 'Short Buildup' | 'Short Covering' | 'Long Unwinding'>('Long Buildup');

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 60000); // 1 min refresh
        return () => clearInterval(interval);
    }, []);

    const fetchData = async () => {
        const { data, error } = await supabase
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
                    <td colSpan={4} className="py-8 text-center text-slate-500 text-xs">
                        No data available for this category
                    </td>
                </tr>
            );
        }

        return data.map((item) => (
            <tr key={item.symbol} className="hover:bg-white/5 transition-colors group border-b border-white/5 last:border-0">
                <td className="py-3 pl-2">
                    <div className="font-bold text-white text-xs group-hover:text-sky-400 transition-colors uppercase">{item.symbol}</div>
                    <div className="text-[10px] text-slate-500">24 Feb 2026</div>
                </td>
                <td className="py-3 text-right font-medium text-white text-xs">
                    ₹{item.ltp.toLocaleString()}
                </td>
                <td className={`py-3 text-right text-xs font-medium ${item.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {item.change > 0 ? '+' : ''}{item.change.toFixed(2)}
                </td>
                <td className="py-3 text-right pr-2">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold inline-block min-w-[50px] text-center ${item.percent_change >= 0
                            ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                            : 'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}>
                        {item.percent_change > 0 ? '+' : ''}{item.percent_change.toFixed(2)}%
                    </span>
                </td>
            </tr>
        ));
    };

    const TabButton = ({ active, label, onClick }: any) => (
        <button
            onClick={onClick}
            className={`px-3 py-1.5 text-[10px] font-medium rounded-lg transition-all border uppercase tracking-wider ${active
                    ? 'bg-sky-500/10 text-sky-400 border-sky-500/20 shadow-[0_0_10px_rgba(14,165,233,0.1)]'
                    : 'text-slate-400 border-transparent hover:text-white hover:bg-white/5'
                }`}
        >
            {label}
        </button>
    );

    return (
        <div className="space-y-4 w-full">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Activity className="h-5 w-5 text-sky-400" />
                    Movers and Buildups
                </h2>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 w-full">
                {/* MOVERS PANEL */}
                <GlassCard className="p-0 overflow-hidden flex flex-col h-full w-full bg-slate-900/40 backdrop-blur-md border border-white/10">
                    <div className="p-4 border-b border-white/5 bg-white/[0.02]">
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
                            <div className="h-64 flex items-center justify-center text-slate-500 text-xs animate-pulse">Loading market data...</div>
                        ) : (
                            <div className="overflow-x-auto w-full">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-white/5 text-slate-500 text-[10px] uppercase tracking-wider bg-white/[0.01]">
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

                    <div className="p-3 border-t border-white/5 bg-white/[0.01] flex justify-end">
                        <button className="text-[10px] text-sky-400 hover:text-sky-300 font-bold uppercase tracking-wider flex items-center gap-1">
                            View All <ArrowUpRight className="h-3 w-3" />
                        </button>
                    </div>
                </GlassCard>

                {/* BUILDUPS PANEL */}
                <GlassCard className="p-0 overflow-hidden flex flex-col h-full w-full bg-slate-900/40 backdrop-blur-md border border-white/10">
                    <div className="p-4 border-b border-white/5 bg-white/[0.02]">
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
                            <div className="h-64 flex items-center justify-center text-slate-500 text-xs animate-pulse">Loading data...</div>
                        ) : (
                            <div className="overflow-x-auto w-full">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-white/5 text-slate-500 text-[10px] uppercase tracking-wider bg-white/[0.01]">
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

                    <div className="p-3 border-t border-white/5 bg-white/[0.01] flex justify-end">
                        <button className="text-[10px] text-sky-400 hover:text-sky-300 font-bold uppercase tracking-wider flex items-center gap-1">
                            View All <ArrowUpRight className="h-3 w-3" />
                        </button>
                    </div>
                </GlassCard>
            </div>
        </div>
    );
}
