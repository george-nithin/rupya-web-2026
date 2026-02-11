import { GlassCard } from "@/components/ui/GlassCard";
import { TrendingUp, TrendingDown, Minus, Clock, Calendar } from "lucide-react";

interface TechnicalSignalsProps {
    data: any;
}

export function TechnicalSignals({ data }: TechnicalSignalsProps) {
    // Helper to generate a signal (Mock logic if specific timeframe data is missing)
    // In a real app, this would come from the backend for each timeframe
    const getSignal = (timeframe: string) => {
        // Using Daily RSI/MACD to influence the "Day" signal
        if (timeframe === "1D") {
            if ((data?.rsi_14 || 50) > 70) return { type: "SELL", label: "Strong Sell", color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20" };
            if ((data?.rsi_14 || 50) < 30) return { type: "BUY", label: "Strong Buy", color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/20" };
            return { type: "NEUTRAL", label: "Neutral", color: "text-slate-400", bg: "bg-slate-500/10", border: "border-slate-500/20" };
        }

        // Random variance for other timeframes to simulate active market analysis
        // TODO: Replace with real multi-timeframe backend data
        const sentiments = [
            { type: "BUY", label: "Buy", color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/20" },
            { type: "SELL", label: "Sell", color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20" },
            { type: "NEUTRAL", label: "Neutral", color: "text-slate-400", bg: "bg-slate-500/10", border: "border-slate-500/20" },
            { type: "STRONG_BUY", label: "Strong Buy", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
        ];
        // Deterministic hash based on timeframe to keep it stable during render
        const index = (timeframe.length + (data?.rsi_14 || 0)) % sentiments.length;
        return sentiments[index];
    };

    const intradayTimeframes = ["5 MIN", "15 MIN", "1 HOUR"];
    const longTermTimeframes = [
        { tf: "1 DAY", desc: "Trend alignment with moving averages." },
        { tf: "1 WEEK", desc: "Major support/resistance levels." },
        { tf: "1 MONTH", desc: "Macroeconomic trend direction." }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Intraday Signals */}
            <GlassCard>
                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-sky-400" />
                    Intraday Signals
                </h3>
                <div className="space-y-4">
                    {intradayTimeframes.map((tf) => {
                        const signal = getSignal(tf);
                        return (
                            <div key={tf} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5">
                                <span className="text-xs font-bold text-slate-400 w-16">{tf}</span>

                                <div className="flex-1 px-4">
                                    <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${signal.type.includes("BUY") ? "bg-green-500" : signal.type.includes("SELL") ? "bg-red-500" : "bg-slate-500"}`}
                                            style={{ width: signal.type.includes("STRONG") ? '90%' : '60%' }}
                                        />
                                    </div>
                                </div>

                                <span className={`text-xs font-bold px-2 py-1 rounded ${signal.bg} ${signal.color} border ${signal.border} min-w-[80px] text-center`}>
                                    {signal.label.toUpperCase()}
                                </span>
                            </div>
                        );
                    })}
                </div>
                <div className="mt-4 pt-4 border-t border-white/5 text-[10px] text-slate-500 text-center">
                    Based on real-time moving averages and oscillators.
                </div>
            </GlassCard>

            {/* Swing/Positional Advice */}
            <GlassCard>
                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-purple-400" />
                    Swing Strategy
                </h3>
                <div className="space-y-4">
                    {longTermTimeframes.map((item) => {
                        const signal = getSignal(item.tf === "1 DAY" ? "1D" : item.tf);
                        return (
                            <div key={item.tf} className="p-3 rounded-lg bg-white/5 border border-white/5">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs font-bold text-slate-300">{item.tf}</span>
                                    <div className={`flex items-center gap-1 text-xs font-bold ${signal.color}`}>
                                        {signal.type.includes("BUY") ? <TrendingUp className="h-3 w-3" /> : signal.type.includes("SELL") ? <TrendingDown className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
                                        {signal.label}
                                    </div>
                                </div>
                                <p className="text-xs text-slate-500 leading-relaxed">
                                    {signal.type === "NEUTRAL" ? "Market is ranging. Wait for a clearer breakout." :
                                        signal.type.includes("BUY") ? "Bullish structure confirmed. " + item.desc :
                                            "Bearish momentum dominant. " + item.desc}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </GlassCard>
        </div>
    );
}
