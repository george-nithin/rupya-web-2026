"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { Maximize2, Target, ShieldAlert, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface Trade {
    id: string;
    symbol: string;
    direction: "LONG" | "SHORT";
    entry_price: number;
    quantity: number;
    stop_loss: number;
    target_price: number;
    pnl: number;
    status: string;
    trade_type: string;
}

export function ActiveTradeTracker() {
    const [activeTrade, setActiveTrade] = useState<Trade | null>(null);
    const [loading, setLoading] = useState(true);
    const [ltp, setLtp] = useState<number>(0);

    useEffect(() => {
        const fetchOpenTrade = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from('journal_trades')
                .select('*')
                .eq('user_id', user.id)
                .eq('status', 'OPEN')
                .order('entry_date', { ascending: false })
                .limit(1)
                .single();

            if (data) {
                setActiveTrade(data);
                setLtp(data.entry_price); // Init LTP
            }
            setLoading(false);
        };

        fetchOpenTrade();

        // Subscribe to changes
        const channel = supabase
            .channel('active-trade')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'journal_trades' },
                () => fetchOpenTrade()
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    // Effect for LTP updates - Run unconditionally, check inside
    useEffect(() => {
        if (!activeTrade) return;

        // 1. Fetch initial LTP if not set
        const fetchLTP = async () => {
            const { data } = await supabase.from('market_equity_quotes').select('last_price').eq('symbol', activeTrade.symbol).single();
            if (data) setLtp(data.last_price);
        };
        fetchLTP();

        // 2. Subscribe to market data
        const channel = supabase
            .channel(`active_trade_${activeTrade.symbol}`)
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'market_equity_quotes', filter: `symbol=eq.${activeTrade.symbol}` },
                (payload) => {
                    if (payload.new.last_price) setLtp(payload.new.last_price);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [activeTrade?.symbol]);

    if (loading) return <div className="h-32 animate-pulse bg-white/5 rounded-xl text-center flex items-center justify-center text-slate-500">Loading Active Trade...</div>;
    if (!activeTrade) return null; // Or show "No Active Trades" card

    // Calculate P&L
    const isLong = activeTrade.direction === "LONG";
    const rawPnl = (ltp - activeTrade.entry_price) * activeTrade.quantity;
    const currentPnl = isLong ? rawPnl : -rawPnl;

    // Progress
    const risk = Math.abs(activeTrade.entry_price - activeTrade.stop_loss);
    const reward = Math.abs(activeTrade.target_price - activeTrade.entry_price);
    // Simple visual progress: 0 = entry, 100 = target, -100 = SL (approx)
    const progressPercent = reward > 0 ? (currentPnl / (reward * activeTrade.quantity)) * 100 : 0;

    // Clamp for visual bar (e.g. within some range)
    // Actually simpler: just map LTP between SL and Target
    // 0% = SL, 100% = Target, Entry = determined by Risk:Reward ratio
    const totalRange = Math.abs(activeTrade.target_price - activeTrade.stop_loss);
    const progressFromSL = isLong
        ? (ltp - activeTrade.stop_loss) / totalRange
        : (activeTrade.stop_loss - ltp) / totalRange;

    const barPercent = Math.min(Math.max(progressFromSL * 100, 0), 100);

    return (
        <GlassCard className="col-span-1 lg:col-span-12 relative overflow-hidden p-6">
            {/* Background Glow based on P&L */}
            <div className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-[100px] opacity-10 ${currentPnl >= 0 ? 'bg-green-500' : 'bg-red-500'}`} />

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">

                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                        <span className={`px-2 py-0.5 rounded text-[10px] bg-opacity-20 border border-opacity-20 font-bold tracking-wider ${activeTrade.direction === "LONG" ? "bg-green-500 text-green-400 border-green-500" : "bg-red-500 text-red-400 border-red-500"}`}>
                            {activeTrade.trade_type?.toUpperCase() || 'INTRADAY'} - {activeTrade.direction}
                        </span>
                        <h3 className="text-lg font-bold text-white">{activeTrade.symbol}</h3>
                    </div>
                    <div className="flex gap-4 text-xs text-slate-400">
                        <span>Qty: <span className="text-white">{activeTrade.quantity}</span></span>
                        <span>Entry: <span className="text-white">{activeTrade.entry_price}</span></span>
                        <span>Target: <span className="text-green-400">{activeTrade.target_price}</span></span>
                    </div>
                </div>

                {/* Visualization Bar */}
                <div className="flex-[2] w-full flex flex-col gap-2">
                    <div className="flex justify-between text-xs font-medium">
                        <span className="text-red-400 flex items-center gap-1"><ShieldAlert className="h-3 w-3" /> SL: {activeTrade.stop_loss}</span>
                        {/* Current LTP marker text */}
                        <span className={`font-bold ${currentPnl >= 0 ? "text-green-400" : "text-red-400"}`}>LTP: {ltp}</span>
                        <span className="text-green-400 flex items-center gap-1"><Target className="h-3 w-3" /> Tgt: {activeTrade.target_price}</span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden relative">
                        <div className="absolute top-0 bottom-0 w-2 bg-sky-400 z-30 shadow-[0_0_10px_rgba(56,189,248,0.8)] transition-all duration-500" style={{ left: `${barPercent}%` }} />
                        {/* Markers for Entry */}
                        <div className="absolute top-0 bottom-0 w-0.5 bg-white z-20" style={{ left: `${isLong ? ((activeTrade.entry_price - activeTrade.stop_loss) / totalRange) * 100 : ((activeTrade.stop_loss - activeTrade.entry_price) / totalRange) * 100}%` }} title="Entry" />
                    </div>
                </div>

                <div className="text-right min-w-[120px]">
                    <div className="text-xs text-slate-400 uppercase tracking-widest mb-1">Unrealized P&L</div>
                    <div className={`text-2xl font-bold font-mono ${currentPnl >= 0 ? "text-green-400" : "text-red-400"}`}>
                        {currentPnl >= 0 ? "+" : ""}{currentPnl.toFixed(2)}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                        Risk:Reward 1:{(reward / risk).toFixed(1)}
                    </div>
                </div>

                <GlassButton variant="secondary" size="sm">
                    <Maximize2 className="h-4 w-4" />
                </GlassButton>
            </div>
        </GlassCard>
    );
}
