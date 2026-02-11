"use client";

import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { GlassCard } from "@/components/ui/GlassCard";
import { BacktestResult } from "../types";

interface BacktestPerformanceProps {
    data?: BacktestResult['equity_curve'];
}

// Mock data if none provided
const MOCK_DATA = Array.from({ length: 30 }, (_, i) => ({
    date: `2024-01-${i + 1}`,
    equity: 100000 * (1 + (i * 0.02) + (Math.sin(i) * 0.05))
}));

export function BacktestPerformance({ data = MOCK_DATA }: BacktestPerformanceProps) {
    const startValue = data[0]?.equity || 0;
    const endValue = data[data.length - 1]?.equity || 0;
    const totalReturn = ((endValue - startValue) / startValue) * 100;

    return (
        <GlassCard className="h-[400px] flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="font-bold text-white">Backtest Performance</h3>
                    <p className="text-sm text-slate-400">Equity Curve</p>
                </div>
                <div className="text-right">
                    <div className="text-xs text-slate-400">Total Return</div>
                    <div className={`text-xl font-bold ${totalReturn >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {totalReturn > 0 ? '+' : ''}{totalReturn.toFixed(2)}%
                    </div>
                </div>
            </div>

            <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="colorEquity" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                        <XAxis
                            dataKey="date"
                            stroke="#64748b"
                            tick={{ fontSize: 10 }}
                            tickFormatter={(val) => {
                                const d = new Date(val);
                                return `${d.getDate()} ${d.toLocaleString('default', { month: 'short' })}`;
                            }}
                        />
                        <YAxis
                            stroke="#64748b"
                            tick={{ fontSize: 10 }}
                            tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
                            domain={['auto', 'auto']}
                        />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#fff' }}
                            formatter={(val: any) => [`₹${Number(val).toFixed(2)}`, 'Equity']}
                            labelFormatter={(label) => new Date(label).toLocaleDateString()}
                        />
                        <Area
                            type="monotone"
                            dataKey="equity"
                            stroke="#38bdf8"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorEquity)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </GlassCard>
    );
}
