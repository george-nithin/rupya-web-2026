"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { Maximize2, Target, ShieldAlert } from "lucide-react";

// Mock data for an active trade
const activeTrade = {
    symbol: "BANKNIFTY 47500 CE",
    entryPrice: 320,
    ltp: 345,
    quantity: 50, // 2 lots
    sl: 290,
    target: 380,
    pnl: 1250,
    mfe: 1400, // Max Favorable Excursion
    mae: -200, // Max Adverse Excursion (Drawdown)
};

export function ActiveTradeTracker() {
    const pnlColor = activeTrade.pnl >= 0 ? "text-green-400" : "text-red-400";
    const progressToTarget = ((activeTrade.ltp - activeTrade.entryPrice) / (activeTrade.target - activeTrade.entryPrice)) * 100;

    return (
        <GlassCard className="col-span-1 lg:col-span-12 relative overflow-hidden">
            {/* Background Glow based on P&L */}
            <div className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-[100px] opacity-10 ${activeTrade.pnl >= 0 ? 'bg-green-500' : 'bg-red-500'}`} />

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">

                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-green-500/20 text-green-400 border border-green-500/20 font-bold tracking-wider">INTRA-OPEN</span>
                        <h3 className="text-lg font-bold text-white">{activeTrade.symbol}</h3>
                    </div>
                    <div className="flex gap-4 text-xs text-slate-400">
                        <span>Qty: <span className="text-white">{activeTrade.quantity}</span></span>
                        <span>Avg: <span className="text-white">{activeTrade.entryPrice}</span></span>
                        <span>LTP: <span className="text-white font-mono">{activeTrade.ltp}</span></span>
                    </div>
                </div>

                {/* Visualization Bar */}
                <div className="flex-[2] w-full flex flex-col gap-2">
                    <div className="flex justify-between text-xs font-medium">
                        <span className="text-red-400 flex items-center gap-1"><ShieldAlert className="h-3 w-3" /> SL: {activeTrade.sl}</span>
                        <span className="text-green-400 flex items-center gap-1"><Target className="h-3 w-3" /> Tgt: {activeTrade.target}</span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden relative">
                        {/* Entry Marker */}
                        <div className="absolute top-0 bottom-0 w-0.5 bg-white left-[33%] z-20" title="Entry" />

                        {/* Current Price Marker */}
                        <div
                            className="absolute top-0 bottom-0 w-2 bg-sky-400 z-30 shadow-[0_0_10px_rgba(56,189,248,0.8)] transition-all duration-500"
                            style={{ left: `${33 + (progressToTarget * 0.33)}%` }} // Simplified relative positioning logic
                        />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-500">
                        <span>Risk: ₹{(activeTrade.entryPrice - activeTrade.sl) * activeTrade.quantity}</span>
                        <span>Reward: ₹{(activeTrade.target - activeTrade.entryPrice) * activeTrade.quantity}</span>
                    </div>
                </div>

                <div className="text-right min-w-[120px]">
                    <div className="text-xs text-slate-400 uppercase tracking-widest mb-1">Unrealized P&L</div>
                    <div className={`text-2xl font-bold font-mono ${pnlColor}`}>
                        {activeTrade.pnl > 0 ? "+" : ""}₹{activeTrade.pnl.toLocaleString()}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                        MFE: <span className="text-green-400">+{activeTrade.mfe}</span>
                    </div>
                </div>

                <GlassButton variant="secondary" size="sm">
                    <Maximize2 className="h-4 w-4" />
                </GlassButton>
            </div>
        </GlassCard>
    );
}
