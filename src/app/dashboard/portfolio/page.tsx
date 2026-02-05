"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from "recharts";

import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

export default function PortfolioPage() {
    const [holdings, setHoldings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPortfolio();
    }, []);

    const fetchPortfolio = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // 1. Get Portfolio
            const { data: port, error: pError } = await supabase
                .from('user_portfolio')
                .select('*')
                .eq('user_id', user.id);

            if (pError) throw pError;
            if (!port || port.length === 0) {
                setHoldings([]);
                setLoading(false);
                return;
            }

            const symbols = port.map(p => p.symbol);

            // 2. Get Market Data
            const { data: quotes, error: qError } = await supabase
                .from('market_equity_quotes')
                .select('symbol, last_price')
                .in('symbol', symbols);

            if (qError) throw qError;

            // 3. Merge
            const merged = port.map(p => {
                const quote = quotes?.find(q => q.symbol === p.symbol);
                const ltp = quote?.last_price || p.avg_price; // Fallback
                const value = ltp * p.quantity;
                const invested = p.avg_price * p.quantity;
                const pnl = value - invested;
                const pnlPercent = invested ? (pnl / invested) * 100 : 0;

                return {
                    symbol: p.symbol,
                    qty: p.quantity,
                    avg: p.avg_price,
                    ltp: ltp,
                    value: value,
                    pnl: pnl,
                    pnlPercent: pnlPercent
                };
            });

            setHoldings(merged);
        } catch (error) {
            console.error("Error fetching portfolio:", error);
        } finally {
            setLoading(false);
        }
    };

    const allocationData = [
        { name: "Energy", value: 30, color: "#38bdf8" },
        { name: "Banking", value: 25, color: "#c084fc" },
        { name: "IT", value: 35, color: "#34d399" },
        { name: "Auto", value: 10, color: "#fbbf24" },
    ];

    const totalValue = holdings.reduce((acc, curr) => acc + curr.value, 0);
    const totalInvested = holdings.reduce((acc, curr) => acc + (curr.avg * curr.qty), 0);
    const totalPnl = totalValue - totalInvested;
    const totalPnlPercent = totalInvested ? (totalPnl / totalInvested) * 100 : 0;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-white">Portfolio</h1>
                    <p className="text-slate-400">Track your investments</p>
                </div>
                <GlassButton variant="secondary">Sync with Broker</GlassButton>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <GlassCard>
                    <div className="text-sm text-slate-400">Current Value</div>
                    <div className="text-3xl font-bold text-white mt-1">₹{totalValue.toLocaleString()}</div>
                </GlassCard>
                <GlassCard>
                    <div className="text-sm text-slate-400">Invested Amount</div>
                    <div className="text-2xl font-semibold text-slate-200 mt-1">₹{totalInvested.toLocaleString()}</div>
                </GlassCard>
                <GlassCard>
                    <div className="text-sm text-slate-400">Total P&L</div>
                    <div className={`text-2xl font-bold mt-1 ${totalPnl >= 0 ? "text-green-400" : "text-red-400"}`}>
                        {totalPnl >= 0 ? "+" : ""}₹{totalPnl.toLocaleString()} ({totalPnlPercent.toFixed(2)}%)
                    </div>
                </GlassCard>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Allocation Chart */}
                <GlassCard className="col-span-1 min-h-[300px]">
                    <h2 className="text-lg font-semibold text-white mb-4">Sector Allocation</h2>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={allocationData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {allocationData.map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <RechartsTooltip contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '8px' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </GlassCard>

                {/* Holdings Table */}
                <GlassCard className="col-span-1 lg:col-span-2">
                    <h2 className="text-lg font-semibold text-white mb-4">Holdings</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="text-slate-400 border-b border-white/10">
                                <tr>
                                    <th className="pb-3 pl-2">Symbol</th>
                                    <th className="pb-3 text-right">Qty</th>
                                    <th className="pb-3 text-right">Avg Price</th>
                                    <th className="pb-3 text-right">LTP</th>
                                    <th className="pb-3 text-right">Cur. Value</th>
                                    <th className="pb-3 text-right pr-2">P&L</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {holdings.map((stock) => (
                                    <tr key={stock.symbol} className="hover:bg-white/5">
                                        <td className="py-3 pl-2 font-medium text-white">{stock.symbol}</td>
                                        <td className="py-3 text-right text-slate-300">{stock.qty}</td>
                                        <td className="py-3 text-right text-slate-300">₹{stock.avg.toLocaleString()}</td>
                                        <td className="py-3 text-right text-slate-300">₹{stock.ltp.toLocaleString()}</td>
                                        <td className="py-3 text-right text-white font-medium">₹{stock.value.toLocaleString()}</td>
                                        <td className={`py-3 text-right pr-2 font-medium ${stock.pnl >= 0 ? "text-green-400" : "text-red-400"}`}>
                                            {stock.pnl >= 0 ? "+" : ""}₹{stock.pnl.toLocaleString()} <br />
                                            <span className="text-xs opacity-80">({stock.pnlPercent.toFixed(2)}%)</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </GlassCard>
            </div>
        </div>
    );
}
