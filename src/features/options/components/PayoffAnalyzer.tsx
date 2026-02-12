"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, ReferenceLine } from "recharts";

const payoffData = [
    { price: 21200, pnl: -2000 },
    { price: 21300, pnl: -2000 },
    { price: 21400, pnl: -2000 },
    { price: 21450, pnl: -1000 },
    { price: 21600, pnl: 5000 }, // Max Profit
    { price: 21750, pnl: -1000 },
    { price: 21800, pnl: -2000 },
    { price: 21900, pnl: -2000 },
    { price: 22000, pnl: -2000 },
];

export function PayoffAnalyzer() {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-500/10 p-3 rounded-xl border border-green-500/20 text-center">
                    <div className="text-xs text-muted-foreground mb-1">Max Profit</div>
                    <div className="text-lg font-bold text-green-400">₹5,000</div>
                </div>
                <div className="bg-red-500/10 p-3 rounded-xl border border-red-500/20 text-center">
                    <div className="text-xs text-muted-foreground mb-1">Max Loss</div>
                    <div className="text-lg font-bold text-red-400">₹2,000</div>
                </div>
            </div>

            <GlassCard className="p-2">
                <h3 className="text-sm font-semibold text-foreground px-2 pt-2">Payoff Diagram (Iron Condor)</h3>
                <div className="h-[250px] w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={payoffData}>
                            <defs>
                                <linearGradient id="splitColor" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0.5" stopColor="#4ade80" stopOpacity={0.3} />
                                    <stop offset="0.5" stopColor="#f87171" stopOpacity={0.3} />
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="price" stroke="#64748b" tick={{ fontSize: 10 }} />
                            <YAxis hide />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#fff' }}
                                formatter={(val: any) => [`₹${val}`, 'P&L']}
                            />
                            <ReferenceLine y={0} stroke="#cbd5e1" strokeDasharray="3 3" />
                            <Area
                                type="monotone"
                                dataKey="pnl"
                                stroke="#38bdf8"
                                strokeWidth={2}
                                fill="url(#splitColor)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </GlassCard>
        </div>
    );
}
