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
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <GlassInput
                    placeholder="Search by Symbol, Tags, or Notes..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {groupedTrades.length === 0 && (
                <div className="p-8 text-center text-muted-foreground bg-card/20 rounded-xl border border-border">
                    {allTrades.length === 0 ? "No trades logged yet. Start your journey! 🚀" : "No trades found matching your search."}
                </div>
            )}

            {groupedTrades.map((group) => (
                <GlassCard key={group.symbol} className="p-0 overflow-hidden border-white/5 bg-card/30">
                    <div className="flex items-center justify-between p-6 bg-white/5">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-lg font-black text-sky-400">
                                {group.symbol.substring(0, 2)}
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-white tracking-tight">{group.symbol}</h3>
                                <div className="text-[10px] text-white/40 font-bold uppercase tracking-widest mt-1">
                                    {group.trades.length} Cumulative Trades
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="relative py-10 overflow-x-auto">
                        {/* Timeline Line */}
                        <div className="absolute top-[52px] left-0 w-full h-0.5 bg-white/5 -z-10" />

                        <div className="flex gap-16 min-w-max px-8">
                            {group.trades.map((trade) => (
                                <div key={trade.id} className="relative flex flex-col items-center group">
                                    {/* Top Label: PnL/Status */}
                                    <div className={`mb-4 text-[10px] font-black px-3 py-1 rounded-lg border transition-all duration-300 ${trade.status === 'OPEN' ? 'bg-white/10 text-white border-white/10' :
                                        (trade.pnl || 0) >= 0 ? 'bg-green-500/10 text-green-400 border-green-500/20 group-hover:bg-green-500 group-hover:text-black group-hover:border-green-500' : 'bg-rose-500/10 text-rose-400 border-rose-500/20 group-hover:bg-rose-500 group-hover:text-black group-hover:border-rose-500'
                                        }`}>
                                        {trade.status === 'OPEN' ? 'OPEN' : `${(trade.pnl || 0) >= 0 ? '+' : ''}${trade.pnl}`}
                                    </div>

                                    {/* Dot */}
                                    <button
                                        onClick={() => toggleTrade(trade.id)}
                                        className={`w-5 h-5 rounded-full ${getStatusColor(trade.status, trade.pnl)} border-[3px] border-slate-950 hover:scale-150 transition-all duration-300 cursor-pointer relative z-10 ${expandedTradeId === trade.id ? 'ring-2 ring-white ring-offset-4 ring-offset-slate-950 shadow-[0_0_20px_rgba(255,255,255,0.3)]' : ''}`}
                                    />

                                    {/* Bottom Label: Date */}
                                    <span className="text-[10px] font-bold text-white/30 mt-3 whitespace-nowrap uppercase tracking-tighter">
                                        {new Date(trade.entry_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Detailed Expanded View */}
                    <div className="px-6 pb-6">
                        {group.trades.map(trade => (
                            trade.id === expandedTradeId && (
                                <GlassCard
                                    key={trade.id}
                                    colorBorder={(trade.pnl || 0) >= 0 ? "emerald" : "rose"}
                                    glow
                                    className="p-0 border-none animate-in fade-in slide-in-from-top-4 duration-300 overflow-hidden"
                                >
                                    {/* Header */}
                                    <div className="p-6 bg-white/5 border-b border-white/5 flex flex-wrap justify-between items-center gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${trade.direction === 'LONG' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                                                {trade.direction}
                                            </div>
                                            <div>
                                                <div className="text-white font-black text-lg flex items-center gap-3">
                                                    {trade.strategy_name || "No Strategy"}
                                                    <span className="h-1 w-1 rounded-full bg-white/20" />
                                                    <span className="text-white/40 text-xs font-bold uppercase tracking-widest">{trade.trade_type}</span>
                                                </div>
                                                <div className="text-[11px] font-bold text-white/30 mt-1 flex items-center gap-3">
                                                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {new Date(trade.entry_date).toLocaleString()}</span>
                                                    {trade.session && <span className="flex items-center gap-1 h-4 px-1.5 rounded bg-white/5">{trade.session}</span>}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-6">
                                            <div className="text-right">
                                                <div className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] mb-1">Net PnL</div>
                                                <div className={`text-2xl font-black tabular-nums tracking-tighter ${trade.status === 'OPEN' ? 'text-white' : (trade.pnl || 0) >= 0 ? 'text-green-400' : 'text-rose-400'}`}>
                                                    {trade.status === 'OPEN' ? 'OPEN' : `₹${trade.pnl}`}
                                                </div>
                                            </div>
                                            <Link href={`/dashboard/journal/edit/${trade.id}`}>
                                                <GlassButton size="sm" variant="secondary" className="h-10 w-10 p-0 rounded-xl hover:bg-white hover:text-black transition-all">
                                                    <Pencil className="h-5 w-5" />
                                                </GlassButton>
                                            </Link>
                                        </div>
                                    </div>

                                    {/* Body */}
                                    <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-8">
                                        {/* Numbers Column */}
                                        <div className="md:col-span-4 space-y-4 bg-white/5 p-5 rounded-2xl border border-white/5">
                                            {[
                                                { label: "Quantity", value: trade.quantity, color: "text-white" },
                                                { label: "Entry Price", value: `₹${trade.entry_price}`, color: "text-white" },
                                                { label: "Exit Price", value: trade.exit_price ? `₹${trade.exit_price}` : '-', color: "text-white/60" },
                                                { label: "Stop Loss", value: `₹${trade.stop_loss}`, color: "text-rose-400/80" },
                                                { label: "Target", value: `₹${trade.target_price}`, color: "text-green-400/80" },
                                            ].map((item, idx) => (
                                                <div key={idx} className="flex justify-between items-center">
                                                    <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">{item.label}</span>
                                                    <span className={`text-sm font-black tabular-nums ${item.color}`}>{item.value}</span>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Notes and Tags Column */}
                                        <div className="md:col-span-8 space-y-6">
                                            <div className="flex flex-col md:flex-row gap-6">
                                                {trade.screenshot_url && (
                                                    <Link href={`/dashboard/journal/${trade.id}`} className="block h-32 w-full md:w-56 shrink-0 rounded-2xl overflow-hidden border border-white/10 bg-black/40 group relative">
                                                        <img src={trade.screenshot_url} alt="Trade chart" className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500" />
                                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/60 transition-all">
                                                            <Search className="h-6 w-6 text-white" />
                                                        </div>
                                                    </Link>
                                                )}

                                                <div className="flex-1 bg-white/5 p-5 rounded-2xl border border-white/5 min-h-[128px]">
                                                    <div className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] mb-3">Analysis & Reasoning</div>
                                                    <p className="text-sm text-white/70 font-medium leading-relaxed italic">
                                                        {trade.reasoning || "Secure your thoughts here. No notes added for this trade."}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/5">
                                                <div className="flex flex-wrap gap-2">
                                                    {trade.tags?.map(tag => (
                                                        <span key={tag} className="flex items-center gap-1.5 text-[10px] font-black bg-sky-500/10 text-sky-400 px-3 py-1.5 rounded-lg border border-sky-500/20 uppercase tracking-tight">
                                                            <Tag className="h-3 w-3" /> {tag}
                                                        </span>
                                                    ))}
                                                    {trade.emotions?.map(emo => (
                                                        <span key={emo} className="flex items-center gap-1.5 text-[10px] font-black bg-purple-500/10 text-purple-400 px-3 py-1.5 rounded-lg border border-purple-500/20 uppercase tracking-tight">
                                                            <Brain className="h-3 w-3" /> {emo}
                                                        </span>
                                                    ))}
                                                </div>

                                                <Link href={`/dashboard/journal/${trade.id}`} className="text-[11px] font-black text-sky-400 hover:text-white uppercase tracking-widest flex items-center gap-2 group/link transition-colors">
                                                    Full Analysis <ChevronRight className="h-4 w-4 group-hover/link:translate-x-1 transition-transform" />
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </GlassCard>
                            )
                        ))}
                    </div>
                </GlassCard>

            ))}
        </div>
    );
}
