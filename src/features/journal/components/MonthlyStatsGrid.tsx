"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface MonthlyStat {
    month: string;
    year: number;
    pnl: number;
    winRate: number;
    totalTrades: number;
    bestTrade: number;
    worstTrade: number;
}

interface MonthlyStatsGridProps {
    trades: any[];
}

export function MonthlyStatsGrid({ trades }: MonthlyStatsGridProps) {
    // Process trades to calculate monthly stats
    const stats: MonthlyStat[] = [];

    if (trades && trades.length > 0) {
        // Group by Month-Year
        const groups: Record<string, any[]> = {};

        trades.forEach(trade => {
            const date = new Date(trade.entry_date);
            const key = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
            if (!groups[key]) groups[key] = [];
            groups[key].push(trade);
        });

        Object.entries(groups).forEach(([key, groupTrades]) => {
            const [month, yearStr] = key.split(' ');
            const year = parseInt(yearStr);

            let pnl = 0;
            let wins = 0;
            let best = -Infinity;
            let worst = Infinity;

            groupTrades.forEach(t => {
                const val = t.pnl || 0;
                pnl += val;
                if (val > 0) wins++;
                if (val > best) best = val;
                if (val < worst) worst = val;
            });

            if (best === -Infinity) best = 0;
            if (worst === Infinity) worst = 0;

            stats.push({
                month,
                year,
                pnl,
                winRate: groupTrades.length > 0 ? (wins / groupTrades.length) * 100 : 0,
                totalTrades: groupTrades.length,
                bestTrade: best,
                worstTrade: worst
            });
        });
    }

    // Sort by date (descending or ascending based on preference, here usually recent first)
    // For now, let's just reverse to show latest? Or robust sort.
    // stats.sort(...) 

    if (stats.length === 0) {
        // Add placeholders if empty
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
        months.forEach(m => {
            stats.push({ month: m, year: 2024, pnl: 0, winRate: 0, totalTrades: 0, bestTrade: 0, worstTrade: 0 });
        });
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
                <GlassCard
                    key={`${stat.month}-${stat.year}`}
                    colorBorder={stat.pnl >= 0 ? "emerald" : "rose"}
                    glow
                    className="p-6 relative overflow-hidden group transition-all duration-300 active:scale-95"
                >
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <div className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-1">{stat.month} {stat.year}</div>
                            <div className={`text-2xl font-black mt-1 ${stat.pnl >= 0 ? 'text-green-400' : 'text-rose-400'}`}>
                                {stat.pnl >= 0 ? '+' : '-'}₹{Math.abs(stat.pnl).toLocaleString()}
                            </div>
                        </div>
                        <div className="h-10 w-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                            {stat.pnl >= 0 ? <TrendingUp className="h-5 w-5 text-green-400" /> : <TrendingDown className="h-5 w-5 text-rose-400" />}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-[11px] font-semibold text-white/40 uppercase tracking-wider">Win Rate</span>
                            <span className="text-sm font-bold text-white">{stat.winRate.toFixed(0)}%</span>
                        </div>

                        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                            <div
                                className={`h-full transition-all duration-1000 ${stat.winRate >= 50 ? 'bg-green-500' : 'bg-rose-500'}`}
                                style={{ width: `${stat.winRate}%` }}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-white/5">
                            <div>
                                <div className="text-[9px] font-bold text-white/30 uppercase tracking-tighter mb-1">Best Trade</div>
                                <div className="text-xs font-bold text-green-400">+₹{stat.bestTrade.toLocaleString()}</div>
                            </div>
                            <div className="text-right">
                                <div className="text-[9px] font-bold text-white/30 uppercase tracking-tighter mb-1">Worst Trade</div>
                                <div className="text-xs font-bold text-rose-400">{stat.worstTrade !== 0 ? '-' : ''}₹{Math.abs(stat.worstTrade).toLocaleString()}</div>
                            </div>
                        </div>
                    </div>
                </GlassCard>
            ))}
        </div>
    );
}
