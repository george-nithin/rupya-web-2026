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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {stats.map((stat, i) => (
                <GlassCard key={`${stat.month}-${stat.year}`} className="p-4 relative overflow-hidden group hover:bg-white/5 transition-colors">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <div className="text-sm font-bold text-sky-400 uppercase tracking-wider">{stat.month} {stat.year}</div>
                            <div className={`text-2xl font-bold mt-1 ${stat.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {stat.pnl >= 0 ? '+' : '-'}₹{Math.abs(stat.pnl).toLocaleString()}
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-[10px] text-slate-500 uppercase">Win Rate</div>
                            <div className="text-sm font-bold text-white">{stat.winRate.toFixed(0)}%</div>
                        </div>
                    </div>

                    <div className="space-y-2 text-xs text-slate-400">
                        <div className="flex justify-between">
                            <span>Best Trade</span>
                            <span className="text-green-400 font-medium">+₹{stat.bestTrade.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Worst Trade</span>
                            <span className="text-red-400 font-medium">{stat.worstTrade !== 0 ? '-' : ''}₹{Math.abs(stat.worstTrade).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-white/5">
                            <span>No. of Trades</span>
                            <span className="text-white">{stat.totalTrades}</span>
                        </div>
                    </div>
                </GlassCard>
            ))}
        </div>
    );
}
