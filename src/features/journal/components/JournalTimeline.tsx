"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { ChevronDown, ChevronRight, CheckCircle2, XCircle, Circle, Tag, Brain, Clock, Wallet, Search, Pencil, Filter } from "lucide-react";
import { GlassInput } from "@/components/ui/GlassInput";
import { GlassButton } from "@/components/ui/GlassButton";
import Link from "next/link";

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
    trade_type?: string;
    tags?: string[];
    emotions?: string[];
    fees?: number;
    session?: string;
    stop_loss?: number;
    target_price?: number;
    quantity?: number;
}

interface GroupedTrades {
    symbol: string;
    trades: Trade[];
}

export function JournalTimeline() {
    const [groupedTrades, setGroupedTrades] = useState<GroupedTrades[]>([]);
    const [allTrades, setAllTrades] = useState<Trade[]>([]); // Store flat list for searching
    const [expandedTradeId, setExpandedTradeId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchTrades();

        const channel = supabase
            .channel('journal-updates')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'journal_trades' }, fetchTrades)
            .subscribe();

        return () => { supabase.removeChannel(channel); };
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
            setAllTrades(data);
            groupTrades(data);
        }
    };

    const groupTrades = (trades: Trade[]) => {
        const groups: { [key: string]: Trade[] } = {};
        trades.forEach((trade) => {
            if (!groups[trade.symbol]) groups[trade.symbol] = [];
            groups[trade.symbol].push(trade);
        });

        const sortedGroups = Object.keys(groups).map(symbol => ({
            symbol,
            trades: groups[symbol].sort((a, b) => new Date(a.entry_date).getTime() - new Date(b.entry_date).getTime())
        }));
        setGroupedTrades(sortedGroups);
    };

    // Filter trades when search term changes
    useEffect(() => {
        if (!searchTerm) {
            groupTrades(allTrades);
            return;
        }

        const lowerTerm = searchTerm.toLowerCase();
        const filtered = allTrades.filter(t =>
            t.symbol.toLowerCase().includes(lowerTerm) ||
            t.reasoning?.toLowerCase().includes(lowerTerm) ||
            t.tags?.some(tag => tag.toLowerCase().includes(lowerTerm)) ||
            t.strategy_name?.toLowerCase().includes(lowerTerm)
        );
        groupTrades(filtered);
    }, [searchTerm, allTrades]);

    const toggleTrade = (id: string) => {
        setExpandedTradeId(expandedTradeId === id ? null : id);
    };

    const getStatusColor = (status: string, pnl: number = 0) => {
        if (status === 'OPEN') return 'bg-slate-500';
        if (pnl > 0) return 'bg-green-500';
        return 'bg-red-500';
    };

    return (
        <div className="space-y-6">
            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <GlassInput
                    placeholder="Search by Symbol, Tags, or Notes..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {groupedTrades.length === 0 && (
                <div className="p-8 text-center text-slate-500 bg-white/5 rounded-lg border border-white/10">
                    {allTrades.length === 0 ? "No trades logged yet. Start your journey! 🚀" : "No trades found matching your search."}
                </div>
            )}

            {groupedTrades.map((group) => (
                <GlassCard key={group.symbol} className="p-6">
                    <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-2">
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-white border border-white/10">
                                {group.symbol.substring(0, 2)}
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white">{group.symbol}</h3>
                                <div className="text-xs text-slate-400 flex gap-2">
                                    <span>{group.trades.length} Trades</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="relative pt-2 pb-6 overflow-x-auto min-h-[80px]">
                        {/* Timeline Line */}
                        <div className="absolute top-8 left-0 w-full h-0.5 bg-white/10 -z-10" />

                        <div className="flex gap-12 min-w-max px-4">
                            {group.trades.map((trade) => (
                                <div key={trade.id} className="relative flex flex-col items-center group">
                                    {/* Top Label: PnL/Status */}
                                    <div className={`mb-3 text-[10px] font-bold px-2 py-0.5 rounded-full border ${trade.status === 'OPEN' ? 'bg-slate-500/10 text-slate-300 border-slate-500/20' :
                                        (trade.pnl || 0) >= 0 ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'
                                        }`}>
                                        {trade.status === 'OPEN' ? 'OPEN' : `${(trade.pnl || 0) >= 0 ? '+' : ''}${trade.pnl}`}
                                    </div>

                                    {/* Dot */}
                                    <button
                                        onClick={() => toggleTrade(trade.id)}
                                        className={`w-4 h-4 rounded-full ${getStatusColor(trade.status, trade.pnl)} border-2 border-[#000] hover:scale-125 transition-transform cursor-pointer relative z-10 ${expandedTradeId === trade.id ? 'ring-2 ring-white ring-offset-2 ring-offset-[#000]' : ''}`}
                                    />

                                    {/* Bottom Label: Date */}
                                    <span className="text-[10px] text-slate-500 mt-2 whitespace-nowrap">
                                        {new Date(trade.entry_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Detailed Expanded View */}
                    <div className="mt-2 space-y-4">
                        {group.trades.map(trade => (
                            trade.id === expandedTradeId && (
                                <div key={trade.id} className="bg-white/5 rounded-xl border border-white/10 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                    {/* Header */}
                                    <div className="p-4 bg-white/5 border-b border-white/5 flex justify-between items-start">
                                        <div className="flex gap-3">
                                            <div className={`mt-1 px-2 py-0.5 rounded textxs font-bold uppercase tracking-wider ${trade.direction === 'LONG' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                                {trade.direction}
                                            </div>
                                            <div>
                                                <div className="text-white font-medium flex items-center gap-2">
                                                    {trade.strategy_name || "No Strategy"}
                                                    <span className="text-slate-500 text-xs font-normal">• {trade.trade_type}</span>
                                                </div>
                                                <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                                                    <span>{new Date(trade.entry_date).toLocaleString()}</span>
                                                    {trade.session && <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {trade.session}</span>}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <div className="text-right">
                                                <div className={`text-xl font-bold ${trade.status === 'OPEN' ? 'text-white' : (trade.pnl || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                    {trade.status === 'OPEN' ? 'OPEN' : `₹${trade.pnl}`}
                                                </div>
                                                <div className="text-[10px] text-slate-500 uppercase tracking-widest text-right">Net PnL</div>
                                            </div>
                                            <Link href={`/dashboard/journal/edit/${trade.id}`}>
                                                <GlassButton size="sm" variant="ghost" className="h-8 w-8 p-0 text-slate-400 hover:text-white">
                                                    <Pencil className="h-4 w-4" />
                                                </GlassButton>
                                            </Link>
                                        </div>
                                    </div>

                                    {/* Body */}
                                    <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {/* Row 1: Numbers */}
                                        <div className="space-y-3">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-slate-400">Quantity</span>
                                                <span className="text-white font-mono">{trade.quantity}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-slate-400">Entry Price</span>
                                                <span className="text-white font-mono">{trade.entry_price}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-slate-400">Exit Price</span>
                                                <span className="text-white font-mono">{trade.exit_price || '-'}</span>
                                            </div>
                                            <div className="flex justify-between text-sm pt-2 border-t border-white/5">
                                                <span className="text-slate-500">Stop Loss</span>
                                                <span className="text-red-400/80 font-mono text-xs">{trade.stop_loss}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-slate-500">Target</span>
                                                <span className="text-green-400/80 font-mono text-xs">{trade.target_price}</span>
                                            </div>
                                        </div>

                                        {/* Row 2: Notes, Image & Emotions */}
                                        <div className="md:col-span-2 space-y-4">
                                            {/* Thumbnail & Note Combo */}
                                            <div className="flex gap-4">
                                                {trade.screenshot_url && (
                                                    <div className="h-20 w-32 shrink-0 rounded-lg overflow-hidden border border-white/10 bg-black/20 group relative cursor-pointer">
                                                        <Link href={`/dashboard/journal/${trade.id}`}>
                                                            <img src={trade.screenshot_url} alt="Trade chart" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/40 transition-opacity">
                                                                <Search className="h-4 w-4 text-white" />
                                                            </div>
                                                        </Link>
                                                    </div>
                                                )}

                                                <div className={`bg-black/20 p-3 rounded-lg border border-white/5 flex-1 ${!trade.screenshot_url ? 'w-full' : ''}`}>
                                                    <div className="text-[10px] text-slate-500 uppercase mb-1">Trade Notes</div>
                                                    <p className="text-sm text-slate-300 italic leading-relaxed line-clamp-2">
                                                        {trade.reasoning || "No notes added."}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap gap-2 items-center justify-between">
                                                <div className="flex flex-wrap gap-2">
                                                    {trade.tags?.map(tag => (
                                                        <span key={tag} className="flex items-center gap-1 text-xs bg-slate-800 text-slate-300 px-2 py-1 rounded border border-white/10">
                                                            <Tag className="h-3 w-3 text-slate-500" /> {tag}
                                                        </span>
                                                    ))}
                                                    {trade.emotions?.map(emo => (
                                                        <span key={emo} className="flex items-center gap-1 text-xs bg-purple-500/10 text-purple-300 px-2 py-1 rounded border border-purple-500/20">
                                                            <Brain className="h-3 w-3" /> {emo}
                                                        </span>
                                                    ))}
                                                </div>

                                                <Link href={`/dashboard/journal/${trade.id}`} className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1">
                                                    View Full Details <ChevronRight className="h-3 w-3" />
                                                </Link>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Footer: Fee Info */}
                                    <div className="px-4 py-2 bg-black/20 border-t border-white/5 flex justify-between items-center text-xs text-slate-600">
                                        {trade.fees ? <span>Est Fees: ₹{trade.fees}</span> : <span>No fees recorded</span>}
                                    </div>
                                </div>
                            )
                        ))}
                    </div>
                </GlassCard>
            ))}
        </div>
    );
}
