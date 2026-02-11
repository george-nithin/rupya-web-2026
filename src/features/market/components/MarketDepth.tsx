import { GlassCard } from "@/components/ui/GlassCard";

export function MarketDepth() {
    // Mock Data
    const bids = [
        { price: 2450.50, qty: 1500, percent: 80 },
        { price: 2450.45, qty: 800, percent: 40 },
        { price: 2450.40, qty: 1200, percent: 60 },
        { price: 2450.35, qty: 500, percent: 25 },
        { price: 2450.30, qty: 2000, percent: 100 },
    ];

    const asks = [
        { price: 2451.00, qty: 1000, percent: 60 },
        { price: 2451.05, qty: 1800, percent: 90 },
        { price: 2451.10, qty: 600, percent: 30 },
        { price: 2451.15, qty: 400, percent: 20 },
        { price: 2451.20, qty: 1500, percent: 75 },
    ];

    const totalBuy = bids.reduce((acc, curr) => acc + curr.qty, 0);
    const totalSell = asks.reduce((acc, curr) => acc + curr.qty, 0);
    const sentiment = totalBuy > totalSell ? "Bullish" : "Bearish";

    return (
        <GlassCard>
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-white">Market Depth</h3>
                <span className={`text-xs px-2 py-0.5 rounded border ${sentiment === 'Bullish' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                    {sentiment}
                </span>
            </div>

            <div className="flex gap-4 mb-2 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                <div className="flex-1">Bid (Buy)</div>
                <div className="flex-1 text-right">Ask (Sell)</div>
            </div>

            <div className="flex gap-4">
                {/* Bids */}
                <div className="flex-1 space-y-1">
                    {bids.map((bid, i) => (
                        <div key={i} className="relative h-6 flex items-center justify-between px-2 text-xs">
                            {/* Bar Background */}
                            <div className="absolute inset-y-0 left-0 bg-green-500/10 rounded-sm" style={{ width: `${bid.percent}%` }} />
                            <span className="relative z-10 text-slate-300 font-mono">{bid.qty}</span>
                            <span className="relative z-10 text-green-400 font-bold font-mono">{bid.price}</span>
                        </div>
                    ))}
                    <div className="pt-2 mt-2 border-t border-white/5 flex justify-between text-xs font-bold text-slate-400">
                        <span>Total</span>
                        <span className="text-green-400">{totalBuy}</span>
                    </div>
                </div>

                {/* Asks */}
                <div className="flex-1 space-y-1">
                    {asks.map((ask, i) => (
                        <div key={i} className="relative h-6 flex items-center justify-between px-2 text-xs">
                            {/* Bar Background (Right aligned visually handled by flex-row-reverse if needed, but simple width from right is tricky in CSS without dir=rtl or flex hack. Using simple bg for now) */}
                            <div className="absolute inset-y-0 right-0 bg-red-500/10 rounded-sm" style={{ width: `${ask.percent}%` }} />
                            <span className="relative z-10 text-red-400 font-bold font-mono">{ask.price}</span>
                            <span className="relative z-10 text-slate-300 font-mono">{ask.qty}</span>
                        </div>
                    ))}
                    <div className="pt-2 mt-2 border-t border-white/5 flex justify-between text-xs font-bold text-slate-400">
                        <span className="text-red-400">{totalSell}</span>
                        <span>Total</span>
                    </div>
                </div>
            </div>
        </GlassCard>
    );
}
