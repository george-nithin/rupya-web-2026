"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { ChevronDown, ChevronRight, CheckCircle2, XCircle, Circle } from "lucide-react";

interface Trade {
    id: string;
    symbol: string;
    direction: "LONG" | "SHORT";
    entry_price: number;
    exit_price?: number;
    pnl?: number;
    status: "OPEN" | "CLOSED" | "CANCELLED";
    entry_date: string;
    exit_date?: string;
    reasoning?: string;
    strategy_name?: string;
    screenshot_url?: string;
}

interface GroupedTrades {
    symbol: string;
    trades: Trade[];
}

export function JournalTimeline() {
    const [groupedTrades, setGroupedTrades] = useState<GroupedTrades[]>([]);
    const [expandedTradeId, setExpandedTradeId] = useState<string | null>(null);

    useEffect(() => {
        fetchTrades();

        // Realtime Subscription
        const channel = supabase
            .channel('journal-updates')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'journal_trades'
                },
                () => {
                    fetchTrades(); // Refresh data on any change
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const fetchTrades = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase
            .from('journal_trades')
            .select('*')
            .eq('user_id', user.id)
            .order('entry_date', { ascending: false });

        if (data) {
            // Group by symbol
            const groups: { [key: string]: Trade[] } = {};
            data.forEach((trade: Trade) => {
                if (!groups[trade.symbol]) {
                    groups[trade.symbol] = [];
                }
                groups[trade.symbol].push(trade);
            });

            const sortedGroups = Object.keys(groups).map(symbol => ({
                symbol,
                trades: groups[symbol].sort((a, b) => new Date(a.entry_date).getTime() - new Date(b.entry_date).getTime()) // Sort chronological text for timeline
            }));

            setGroupedTrades(sortedGroups);
        }
    };

    const toggleTrade = (id: string) => {
        if (expandedTradeId === id) {
            setExpandedTradeId(null);
        } else {
            setExpandedTradeId(id);
        }
    };

    const getStatusIcon = (status: string, pnl: number = 0) => {
        if (status === 'OPEN') return <Circle className="h-4 w-4 text-slate-400" />;
        if (pnl > 0) return <CheckCircle2 className="h-4 w-4 text-green-400" />;
        return <XCircle className="h-4 w-4 text-red-400" />;
    };

    const getStatusColor = (status: string, pnl: number = 0) => {
        if (status === 'OPEN') return 'bg-slate-500';
        if (pnl > 0) return 'bg-green-500';
        return 'bg-red-500';
    };

    return (
        <div className="space-y-6">
            {groupedTrades.length === 0 && (
                <div className="p-8 text-center text-slate-500 bg-white/5 rounded-lg border border-white/10">
                    No trades logged yet. Start your journey! @
                </div>
            )}

            {groupedTrades.map((group) => (
                <GlassCard key={group.symbol} className="p-6">
                    <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-2">
                        <h3 className="text-xl font-bold text-white">{group.symbol}</h3>
                        <span className="text-sm text-slate-400">{group.trades.length} Trades</span>
                    </div>

                    <div className="relative pt-2 pb-6 overflow-x-auto">
                        {/* Horizontal Line */}
                        <div className="absolute top-5 left-0 w-full h-0.5 bg-white/10 -z-10 mt-1" />

                        <div className="flex gap-12 min-w-max px-2">
                            {group.trades.map((trade, index) => (
                                <div key={trade.id} className="relative flex flex-col items-center group">
                                    {/* Date Label above */}
                                    <span className="text-[10px] text-slate-500 mb-2 whitespace-nowrap">
                                        {new Date(trade.entry_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                    </span>

                                    {/* Dot */}
                                    <button
                                        onClick={() => toggleTrade(trade.id)}
                                        className={`w-4 h-4 rounded-full ${getStatusColor(trade.status, trade.pnl)} border-2 border-[#000] hover:scale-125 transition-transform cursor-pointer relative z-10 ${expandedTradeId === trade.id ? 'ring-2 ring-white ring-offset-2 ring-offset-[#000]' : ''}`}
                                    />

                                    {/* Connector Line Logic (Optional visual polish) */}

                                    {/* Expanded Detail Card - Absolute positioned relative to this dot would be tricky for overflow.
                                        Instead, we can render the active detail below the timeline IF selected.
                                     */}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Detailed Accordion Area */}
                    <div className="mt-4">
                        {group.trades.map(trade => (
                            trade.id === expandedTradeId && (
                                <div key={trade.id} className="bg-white/5 rounded-lg p-4 border border-white/10 animate-in fade-in slide-in-from-top-2">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`text-xs font-bold px-2 py-0.5 rounded ${trade.direction === 'LONG' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                                    {trade.direction}
                                                </span>
                                                <span className="text-xs text-slate-400">{trade.strategy_name}</span>
                                            </div>
                                            <div className="text-sm text-slate-300">
                                                Entry: <span className="text-white font-medium">{trade.entry_price}</span>
                                                {trade.exit_price && (
                                                    <> • Exit: <span className="text-white font-medium">{trade.exit_price}</span></>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className={`text-lg font-bold ${trade.pnl && trade.pnl > 0 ? 'text-green-400' : trade.pnl && trade.pnl < 0 ? 'text-red-400' : 'text-slate-200'}`}>
                                                {trade.status === 'OPEN' ? 'OPEN' : `₹${trade.pnl}`}
                                            </div>
                                            <div className="text-xs text-slate-500 capitalize">{trade.status.toLowerCase()}</div>
                                        </div>
                                    </div>

                                    {trade.reasoning && (
                                        <div className="bg-black/20 p-3 rounded text-sm text-slate-300 italic mb-3">
                                            "{trade.reasoning}"
                                        </div>
                                    )}

                                    {/* Placeholder for screenshot if URL exists */}
                                    {trade.screenshot_url && (
                                        <div className="mt-2 text-xs text-sky-400 underline cursor-pointer">
                                            View Chart Screenshot
                                        </div>
                                    )}
                                </div>
                            )
                        ))}
                    </div>
                </GlassCard>
            ))}
        </div>
    );
}
