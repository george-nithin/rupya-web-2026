"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { ArrowLeft, Calendar, Clock, DollarSign, Tag, Brain, Target, TrendingUp, TrendingDown, Share2, Trash2, Pencil, ExternalLink, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function JournalDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;
    const [trade, setTrade] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [relatedTrades, setRelatedTrades] = useState<any[]>([]);

    useEffect(() => {
        fetchTradeDetails();
    }, [id]);

    const fetchTradeDetails = async () => {
        const { data, error } = await supabase
            .from('journal_trades')
            .select('*')
            .eq('id', id)
            .single();

        if (data) {
            setTrade(data);
            fetchRelatedTrades(data.symbol);
        }
        setLoading(false);
    };

    const fetchRelatedTrades = async (symbol: string) => {
        const { data } = await supabase
            .from('journal_trades')
            .select('id, entry_date, direction, pnl, status')
            .eq('symbol', symbol)
            .neq('id', id)
            .order('entry_date', { ascending: false })
            .limit(5);

        if (data) setRelatedTrades(data);
    };

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this trade?")) return;

        const { error } = await supabase.from('journal_trades').delete().eq('id', id);
        if (!error) {
            router.push('/dashboard/journal');
        } else {
            alert("Failed to delete trade: " + error.message);
        }
    };

    if (loading) return <div className="text-center py-20 text-slate-500">Loading details...</div>;
    if (!trade) return <div className="text-center py-20 text-slate-500">Trade not found.</div>;

    const isProfit = (trade.pnl || 0) >= 0;

    return (
        <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/journal">
                        <GlassButton size="sm" variant="ghost">
                            <ArrowLeft className="h-5 w-5" />
                        </GlassButton>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                            {trade.symbol}
                            <span className={`text-sm px-2 py-0.5 rounded border ${trade.direction === 'LONG' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                                {trade.direction}
                            </span>
                        </h1>
                        <div className="text-sm text-slate-400 flex items-center gap-4 mt-1">
                            <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(trade.entry_date).toLocaleDateString()}</span>
                            <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {trade.session || "Session N/A"}</span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-3">
                    <Link href={`/dashboard/journal/edit/${id}`}>
                        <GlassButton>
                            <Pencil className="h-4 w-4 mr-2" /> Edit Trade
                        </GlassButton>
                    </Link>
                    <GlassButton variant="danger" onClick={handleDelete}>
                        <Trash2 className="h-4 w-4 mr-2" /> Delete
                    </GlassButton>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Main Content (Left) - Chart/Screenshot Area */}
                <div className="lg:col-span-8 space-y-6">
                    <GlassCard className="min-h-[500px] flex flex-col p-0 overflow-hidden relative group bg-card border-border/50">
                        <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/5">
                            <div className="flex items-center gap-2 text-sm text-white font-medium">
                                <TrendingUp className="h-4 w-4 text-green-400" />
                                Trade Chart
                            </div>
                            <div className="flex gap-2">
                                <span className="text-xs px-2 py-1 bg-white/5 rounded text-slate-400">1H</span>
                                <span className="text-xs px-2 py-1 bg-white/5 rounded text-slate-400">1D</span>
                            </div>
                        </div>

                        {trade.screenshot_url ? (
                            <div className="relative w-full flex-1 bg-black/40 flex items-center justify-center p-4">
                                <img
                                    src={trade.screenshot_url}
                                    alt="Trade Screenshot"
                                    className="max-w-full max-h-[600px] object-contain rounded shadow-2xl"
                                />
                                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <a href={trade.screenshot_url} target="_blank" rel="noopener noreferrer">
                                        <GlassButton size="sm" variant="secondary">
                                            <ExternalLink className="h-4 w-4 mr-2" /> Full Screen
                                        </GlassButton>
                                    </a>
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-slate-500 gap-4">
                                <TrendingUp className="h-16 w-16 opacity-10" />
                                <p>No chart uploaded.</p>
                                <Link href={`/dashboard/journal/edit/${id}`}>
                                    <GlassButton size="sm" variant="secondary">Upload Now</GlassButton>
                                </Link>
                            </div>
                        )}

                        {/* Caption/Notes Overlay Bottom */}
                        <div className="p-4 bg-white/5 border-t border-white/5">
                            <div className="text-[10px] text-slate-500 uppercase mb-1 font-bold tracking-wider">Analysis Notes</div>
                            <p className="text-sm text-slate-300 leading-relaxed font-light">
                                {trade.reasoning || "No detailed notes provided for this trade."}
                            </p>
                        </div>
                    </GlassCard>

                    {/* Related Trades List (Horizontal) */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest pl-1">Recent History: {trade.symbol}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {relatedTrades.map((t) => (
                                <Link key={t.id} href={`/dashboard/journal/${t.id}`}>
                                    <GlassCard className="p-3 hover:bg-white/5 transition-colors cursor-pointer flex items-center justify-between group">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-1 h-8 rounded-full ${t.status === 'OPEN' ? 'bg-sky-500' : (t.pnl || 0) >= 0 ? 'bg-green-500' : 'bg-red-500'}`} />
                                            <div>
                                                <div className="text-xs text-slate-400">{new Date(t.entry_date).toLocaleDateString()}</div>
                                                <div className={`text-xs font-bold ${t.direction === 'LONG' ? 'text-green-400' : 'text-red-400'}`}>{t.direction}</div>
                                            </div>
                                        </div>
                                        <div className={`text-sm font-mono font-bold ${(t.pnl || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                            {(t.pnl || 0) >= 0 ? '+' : ''}₹{t.pnl}
                                        </div>
                                    </GlassCard>
                                </Link>
                            ))}
                            {relatedTrades.length === 0 && <div className="text-xs text-slate-600 pl-1">No other trades found.</div>}
                        </div>
                    </div>
                </div>

                {/* Sidebar (Right) - "Spotlight" Card */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Persona Spotlight Card */}
                    <GlassCard className="bg-[#111316] border-white/10 p-5 space-y-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Total PnL</div>
                                <div className={`text-4xl font-bold tracking-tight ${isProfit ? 'text-green-400' : 'text-red-400'}`}>
                                    {isProfit ? '+' : ''}₹{trade.pnl}
                                </div>
                            </div>
                            <div className={`px-3 py-1 rounded-lg text-xs font-bold border ${trade.status === 'OPEN' ? 'bg-sky-500/10 text-sky-400 border-sky-500/20' : isProfit ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                                {trade.status}
                            </div>
                        </div>

                        {/* Key Metric Grid */}
                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                            <div>
                                <span className="text-xs text-slate-500 block">Entry</span>
                                <span className="text-lg font-mono text-white">₹{trade.entry_price}</span>
                            </div>
                            <div>
                                <span className="text-xs text-slate-500 block">Exit</span>
                                <span className="text-lg font-mono text-white">{trade.exit_price || '-'}</span>
                            </div>
                            <div>
                                <span className="text-xs text-slate-500 block">ROI</span>
                                <span className={`text-lg font-mono ${isProfit ? 'text-green-400' : 'text-red-400'}`}>
                                    {trade.entry_price && trade.quantity ? ((trade.pnl / (trade.entry_price * trade.quantity)) * 100).toFixed(2) : 0}%
                                </span>
                            </div>
                            <div>
                                <span className="text-xs text-slate-500 block">Quantity</span>
                                <span className="text-lg font-mono text-white">{trade.quantity}</span>
                            </div>
                        </div>

                        {/* Strategy & Tags */}
                        <div className="space-y-3 pt-4 border-t border-white/5">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500">Strategy</span>
                                <span className="text-white font-medium">{trade.strategy_name || "N/A"}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500">Session</span>
                                <span className="text-white font-medium">{trade.session || "N/A"}</span>
                            </div>
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-2 pt-2">
                            {trade.emotions?.length > 0 && trade.emotions.map((e: string) => (
                                <span key={e} className="text-[10px] px-2 py-1 bg-purple-500/10 text-purple-300 rounded border border-purple-500/20 uppercase font-bold">
                                    {e}
                                </span>
                            ))}
                            {trade.tags?.length > 0 && trade.tags.map((t: string) => (
                                <span key={t} className="text-[10px] px-2 py-1 bg-slate-800 text-slate-300 rounded border border-white/10 uppercase font-bold">
                                    #{t}
                                </span>
                            ))}
                        </div>
                    </GlassCard>

                    <Link href={`/dashboard/market/${trade.symbol}`}>
                        <GlassButton className="w-full" variant="secondary">
                            View Stock Details <ChevronRight className="h-4 w-4 ml-auto" />
                        </GlassButton>
                    </Link>
                </div>
            </div>
        </div>
    );
}
