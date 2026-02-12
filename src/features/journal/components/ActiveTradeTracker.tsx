"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { Maximize2, Target, ShieldAlert, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

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

    if (loading) return <div className="h-32 animate-pulse bg-card/20 rounded-xl text-center flex items-center justify-center text-muted-foreground">Loading Active Trade...</div>;
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
        <GlassCard
            colorBorder={currentPnl >= 0 ? "emerald" : "rose"}
            glow
            className="col-span-1 lg:col-span-12 relative overflow-hidden p-8"
        >
            {/* Background Glow based on P&L */}
            <div className={`absolute -top-20 -right-20 w-80 h-80 rounded-full blur-[100px] opacity-20 ${currentPnl >= 0 ? 'bg-green-500' : 'bg-rose-500'}`} />

            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">

                <div className="flex-1 w-full lg:w-auto">
                    <div className="flex items-center gap-4 mb-3">
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black tracking-[0.1em] border ${activeTrade.direction === "LONG" ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-rose-500/10 text-rose-400 border-rose-500/20"}`}>
                            {activeTrade.trade_type?.toUpperCase() || 'INTRADAY'} • {activeTrade.direction}
                        </span>
                        <h3 className="text-2xl font-black text-white tracking-tight">{activeTrade.symbol}</h3>
                    </div>
                    <div className="flex gap-6 text-[11px] font-bold text-white/40 uppercase tracking-widest">
                        <span>Qty: <span className="text-white ml-1">{activeTrade.quantity}</span></span>
                        <span>Entry: <span className="text-white ml-1">{activeTrade.entry_price}</span></span>
                        <span>Basis: <span className="text-sky-400 ml-1">₹{(activeTrade.entry_price * activeTrade.quantity).toLocaleString()}</span></span>
                    </div>
                </div>

                {/* Visualization Bar */}
                <div className="flex-[2] w-full flex flex-col gap-4">
                    <div className="flex justify-between items-end">
                        <div className="flex flex-col">
                            <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] mb-1">Stop Loss</span>
                            <span className="text-xs font-bold text-rose-400/80">₹{activeTrade.stop_loss}</span>
                        </div>
                        <div className="text-center flex flex-col items-center">
                            <span className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1 ${currentPnl >= 0 ? "text-green-400" : "text-rose-400"}`}>Market Price</span>
                            <span className={`text-lg font-black ${currentPnl >= 0 ? "text-green-400" : "text-rose-400"}`}>₹{ltp.toFixed(2)}</span>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] mb-1">Target</span>
                            <span className="text-xs font-bold text-green-400/80">₹{activeTrade.target_price}</span>
                        </div>
                    </div>

                    <div className="h-3 bg-white/5 rounded-full overflow-hidden relative border border-white/5 shadow-inner">
                        <div
                            className="absolute top-0 bottom-0 w-1.5 bg-white z-40 shadow-[0_0_15px_rgba(255,255,255,0.8)] transition-all duration-700 ease-out"
                            style={{ left: `${barPercent}%`, transform: 'translateX(-50%)' }}
                        />
                        {/* Progress gradients */}
                        <div
                            className={`absolute top-0 bottom-0 left-0 transition-all duration-700 ease-out ${currentPnl >= 0 ? 'bg-gradient-to-r from-green-500/10 to-green-500/40' : 'bg-gradient-to-r from-rose-500/10 to-rose-500/40'}`}
                            style={{ width: `${barPercent}%` }}
                        />
                        {/* Entry Marker */}
                        <div
                            className="absolute top-0 bottom-0 w-0.5 bg-sky-400 z-30 opacity-50"
                            style={{ left: `${isLong ? ((activeTrade.entry_price - activeTrade.stop_loss) / totalRange) * 100 : ((activeTrade.stop_loss - activeTrade.entry_price) / totalRange) * 100}%` }}
                        />
                    </div>
                </div>

                <div className="text-right min-w-[160px] bg-white/5 p-4 rounded-2xl border border-white/5">
                    <div className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-1">Potential Payoff</div>
                    <div className={`text-3xl font-black tabular-nums tracking-tighter ${currentPnl >= 0 ? "text-green-400" : "text-rose-400"}`}>
                        {currentPnl >= 0 ? "+" : ""}₹{currentPnl.toFixed(2)}
                    </div>
                    <div className="flex items-center justify-end gap-2 mt-2">
                        <span className="text-[10px] font-bold text-white/40">R:R</span>
                        <span className="text-xs font-black text-white">1:{(reward / risk).toFixed(1)}</span>
                    </div>
                </div>

                <Link href={`/dashboard/journal/${activeTrade.id}`}>
                    <GlassButton variant="secondary" className="h-12 w-12 rounded-2xl p-0 hover:bg-white hover:text-black transition-all">
                        <Maximize2 className="h-6 w-6" />
                    </GlassButton>
                </Link>
            </div>
        </GlassCard>
    );
}
