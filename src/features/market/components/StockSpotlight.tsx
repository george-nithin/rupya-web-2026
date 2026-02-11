import { GlassCard } from "@/components/ui/GlassCard";
import { TrendingUp, TrendingDown, Target, Brain, Award } from "lucide-react";

interface StockSpotlightProps {
    symbol: string;
    technicals: any;
    fundamentals: any;
}

export function StockSpotlight({ symbol, technicals, fundamentals }: StockSpotlightProps) {
    // Mock Calculation for "Stock Score" (0-100)
    const rsi = technicals?.rsi_14 || 50;
    const isBullish = technicals?.macd_value > technicals?.macd_signal;
    let score = 50;
    if (rsi > 40 && rsi < 70) score += 20; // Stable zone
    if (isBullish) score += 15;
    if (fundamentals?.pe_ratio < 30) score += 10;

    // Cap score
    score = Math.min(Math.max(Math.round(score), 10), 99);

    return (
        <GlassCard className="h-full bg-[#111316] border-white/10 p-5 flex flex-col gap-6">
            {/* Header: Persona Info */}
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-sm text-slate-400 font-medium mb-1">Stock Health Score</h3>
                    <div className="flex items-baseline gap-2">
                        <span className={`text-5xl font-bold tracking-tighter ${score >= 70 ? 'text-green-400' : score >= 40 ? 'text-yellow-400' : 'text-red-400'}`}>
                            {score}
                        </span>
                        <span className="text-sm text-slate-500">/ 100</span>
                    </div>
                </div>
                <div className="text-right">
                    <div className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-xs font-bold text-white mb-1 inline-flex items-center gap-2">
                        <Award className="h-3 w-3 text-purple-400" />
                        {score >= 80 ? "STRONG BUY" : score >= 60 ? "BUY" : score >= 40 ? "HOLD" : "SELL"}
                    </div>
                    <div className="text-[10px] text-slate-500">Analyst Consensus</div>
                </div>
            </div>

            {/* Analyst Meter */}
            <div className="space-y-2">
                <div className="flex justify-between text-xs text-slate-400">
                    <span>Sell</span>
                    <span>Hold</span>
                    <span>Buy</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden flex">
                    <div className="h-full bg-red-500/50 w-[20%]" />
                    <div className="h-full bg-yellow-500/50 w-[30%]" />
                    <div className="h-full bg-green-500/50 w-[50%]" />
                </div>
                <div className="relative h-2">
                    <div
                        className="absolute top-0 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[8px] border-b-white transition-all duration-500"
                        style={{ left: `${score}%`, transform: 'translateX(-50%)' }}
                    />
                </div>
            </div>

            {/* Key Insights Grid */}
            <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Beta (Volatility)</div>
                    <div className="text-lg font-bold text-white">1.12</div>
                </div>
                <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Sector Rank</div>
                    <div className="text-lg font-bold text-sky-400">#4</div>
                </div>
            </div>

            {/* AI Insight */}
            <div className="p-3 bg-purple-500/10 rounded-xl border border-purple-500/20">
                <div className="flex items-center gap-2 text-purple-300 mb-2">
                    <Brain className="h-4 w-4" />
                    <span className="text-xs font-bold uppercase">AI Insight</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                    {symbol} shows strong bullish momentum based on MACD crossover. Fundamentals remain stable with P/E below sector average.
                </p>
            </div>
        </GlassCard>
    );
}

interface FinancialsChartProps {
    data?: any;
}

export function FinancialsChart({ data: propData }: FinancialsChartProps) {
    // Fallback or use real data if available. 
    // Assuming propData might have quarterly fields like results_q1, results_q2 etc.
    // For now, if no data, we might show empty or loading, but let's keep mock as fallback for demo if data missing
    const data = propData ? [
        { q: "Q1", rev: propData.revenue_q1 || 0, prof: propData.profit_q1 || 0 },
        { q: "Q2", rev: propData.revenue_q2 || 0, prof: propData.profit_q2 || 0 },
        { q: "Q3", rev: propData.revenue_q3 || 0, prof: propData.profit_q3 || 0 },
        { q: "Q4", rev: propData.revenue_q4 || 0, prof: propData.profit_q4 || 0 },
    ] : [
        { q: "Q1", rev: 0, prof: 0 },
        { q: "Q2", rev: 0, prof: 0 },
        { q: "Q3", rev: 0, prof: 0 },
        { q: "Q4", rev: 0, prof: 0 },
    ];

    // Calculate max for scale
    const max = Math.max(...data.map(d => d.rev), 1) * 1.1;

    return (
        <GlassCard className="space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-400" />
                Quarterly Financials
            </h3>

            <div className="flex items-end gap-4 h-[120px] pt-4">
                {data.map((item) => (
                    <div key={item.q} className="flex-1 flex flex-col justify-end gap-1 group">
                        <div className="relative w-full bg-white/5 rounded-t-sm overflow-hidden" style={{ height: `${(item.rev / max) * 100}%` }}>
                            <div className="absolute bottom-0 w-full bg-sky-500/40 group-hover:bg-sky-500/60 transition-colors" style={{ height: '100%' }} />
                            <div className="absolute bottom-0 w-full bg-green-500/80 group-hover:bg-green-500 transition-colors z-10" style={{ height: `${(item.prof / item.rev) * 100}%` }} />
                        </div>
                        <div className="text-[10px] text-center text-slate-500">{item.q}</div>
                    </div>
                ))}
            </div>
            <div className="flex justify-center gap-4 text-[10px]">
                <div className="flex items-center gap-1 text-slate-400"><div className="w-2 h-2 rounded-full bg-sky-500/40" /> Revenue</div>
                <div className="flex items-center gap-1 text-slate-400"><div className="w-2 h-2 rounded-full bg-green-500/80" /> Profit</div>
            </div>
        </GlassCard>
    );
}
