"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

const performanceData = [
    { trade: 1, equity: 100000 },
    { trade: 2, equity: 102000 },
    { trade: 3, equity: 101500 },
    { trade: 4, equity: 104500 },
    { trade: 5, equity: 103000 },
    { trade: 6, equity: 108000 },
    { trade: 7, equity: 112000 },
    { trade: 8, equity: 110000 },
    { trade: 9, equity: 115000 },
    { trade: 10, equity: 118000 },
];

export function JournalAnalytics() {
    return (
        <div className="space-y-6">
            {/* Equity Curve */}
            <GlassCard>
                <h3 className="text-lg font-semibold text-white mb-6">Equity Curve</h3>
                <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={performanceData}>
                            <defs>
                                <linearGradient id="colorEquity" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="trade" stroke="#64748b" tickFormatter={(val) => `T${val}`} />
                            <YAxis stroke="#64748b" domain={['auto', 'auto']} tickFormatter={(val) => `₹${val / 1000}k`} />
                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#fff' }}
                                formatter={(val: any) => [`₹${val.toLocaleString()}`, "Equity"]}
                            />
                            <Area
                                type="monotone"
                                dataKey="equity"
                                stroke="#38bdf8"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorEquity)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </GlassCard>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: "Win Rate", value: "65%", color: "text-green-400" },
                    { label: "Profit Factor", value: "2.4", color: "text-sky-400" },
                    { label: "Avg R:R", value: "1:2.1", color: "text-white" },
                    { label: "Max Drawdown", value: "-4.2%", color: "text-red-400" },
                ].map((stat, i) => (
                    <GlassCard key={i} className="p-4 text-center">
                        <div className="text-sm text-slate-500 mb-1">{stat.label}</div>
                        <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                    </GlassCard>
                ))}
            </div>
        </div>
    );
}
