"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export function PortfolioSummary() {
    const [stats, setStats] = useState({
        totalValue: 0,
        dayPnl: 0,
        invested: 0,
        totalPnl: 0,
        allocation: [] as any[]
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPortfolioStats();
    }, []);

    const fetchPortfolioStats = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // 1. Get Portfolio & Market Data (Simplified Join-like flow)
            const { data: port } = await supabase.from('user_portfolio').select('symbol, quantity, avg_price').eq('user_id', user.id);
            if (!port || port.length === 0) {
                setLoading(false);
                return;
            }

            const symbols = port.map(p => p.symbol);
            const { data: quotes } = await supabase.from('market_equity_quotes').select('symbol, last_price, change, sector').in('symbol', symbols);

            let totalValue = 0;
            let invested = 0;
            let dayPnl = 0;
            const sectorValues: Record<string, number> = {};

            port.forEach(p => {
                const quote = quotes?.find(q => q.symbol === p.symbol);
                const ltp = quote?.last_price || p.avg_price;
                const value = ltp * p.quantity;
                const inv = p.avg_price * p.quantity;

                totalValue += value;
                invested += inv;
                dayPnl += (quote?.change || 0) * p.quantity;

                const s = quote?.sector || "Other";
                sectorValues[s] = (sectorValues[s] || 0) + value;
            });

            const totalPnl = totalValue - invested;
            const allocation = Object.entries(sectorValues).map(([name, value], i) => ({
                name,
                value,
                color: [`#38bdf8`, `#c084fc`, `#34d399`, `#fbbf24`, `#f87171`][i % 5]
            }));

            setStats({ totalValue, dayPnl, invested, totalPnl, allocation });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Subscribe to portfolio changes (users adding/removing stocks)
        const portfolioChannel = supabase
            .channel('portfolio_changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'user_portfolio' }, fetchPortfolioStats)
            .subscribe();

        // Subscribe to market data changes (price updates)
        const marketChannel = supabase
            .channel('portfolio_market_updates')
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'market_equity_quotes' }, fetchPortfolioStats)
            .subscribe();

        return () => {
            supabase.removeChannel(portfolioChannel);
            supabase.removeChannel(marketChannel);
        };
    }, []);

    const dayPnlPercent = stats.invested ? (stats.dayPnl / stats.invested) * 100 : 0;
    const totalPnlPercent = stats.invested ? (stats.totalPnl / stats.invested) * 100 : 0;

    return (
        <GlassCard className="col-span-1 lg:col-span-8 flex flex-col md:flex-row gap-6">
            <div className="flex-1 space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-white">Portfolio Summary</h2>
                    <GlassButton variant="secondary" size="sm">View Details</GlassButton>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <div className="text-xs text-slate-400 uppercase tracking-wider">Total Value</div>
                        <div className="text-3xl font-bold text-white">₹{stats.totalValue.toLocaleString('en-IN')}</div>
                    </div>
                    <div className="space-y-1">
                        <div className="text-xs text-slate-400 uppercase tracking-wider">Day's P&L</div>
                        <div className={`text-xl font-bold ${stats.dayPnl >= 0 ? "text-green-400" : "text-red-400"}`}>
                            {stats.dayPnl >= 0 ? "+" : "-"} ₹{Math.abs(stats.dayPnl).toLocaleString('en-IN')} ({dayPnlPercent.toFixed(2)}%)
                        </div>
                    </div>
                    <div className="space-y-1">
                        <div className="text-xs text-slate-400 uppercase tracking-wider">Invested</div>
                        <div className="text-xl font-medium text-slate-200">₹{stats.invested.toLocaleString('en-IN')}</div>
                    </div>
                    <div className="space-y-1">
                        <div className="text-xs text-slate-400 uppercase tracking-wider">Total P&L</div>
                        <div className={`text-xl font-medium ${stats.totalPnl >= 0 ? "text-green-400" : "text-red-400"}`}>
                            {stats.totalPnl >= 0 ? "+" : "-"} ₹{Math.abs(stats.totalPnl).toLocaleString('en-IN')} ({totalPnlPercent.toFixed(2)}%)
                        </div>
                    </div>
                </div>
            </div>

            <div className="w-full md:w-64 h-48 relative min-w-[200px]">
                <ResponsiveContainer width="100%" height={192}>
                    <PieChart>
                        <Pie
                            data={stats.allocation.length > 0 ? stats.allocation : [{ name: "No Data", value: 1, color: "#334155" }]}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                            stroke="none"
                        >
                            {stats.allocation.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                            itemStyle={{ color: '#fff' }}
                        />
                    </PieChart>
                </ResponsiveContainer>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                    <div className="text-xs text-slate-400">Net Worth</div>
                    <div className="text-sm font-bold text-white">
                        {stats.totalValue > 10000000 ? `${(stats.totalValue / 10000000).toFixed(2)}Cr` :
                            stats.totalValue > 100000 ? `${(stats.totalValue / 100000).toFixed(2)}L` :
                                stats.totalValue.toLocaleString()}
                    </div>
                </div>
            </div>
        </GlassCard>
    );
}
