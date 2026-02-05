"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const data = [
    { name: "Equity", value: 65, color: "#38bdf8" }, // Sky 400
    { name: "F&O", value: 15, color: "#c084fc" },   // Purple 400
    { name: "Mutual Funds", value: 10, color: "#34d399" }, // Emerald 400
    { name: "Cash", value: 10, color: "#94a3b8" }, // Slate 400
];

export function PortfolioSummary() {
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
                        <div className="text-3xl font-bold text-white">₹24,50,000</div>
                    </div>
                    <div className="space-y-1">
                        <div className="text-xs text-slate-400 uppercase tracking-wider">Day's P&L</div>
                        <div className="text-xl font-bold text-green-400">+ ₹12,450 (0.5%)</div>
                    </div>
                    <div className="space-y-1">
                        <div className="text-xs text-slate-400 uppercase tracking-wider">Invested</div>
                        <div className="text-xl font-medium text-slate-200">₹18,20,000</div>
                    </div>
                    <div className="space-y-1">
                        <div className="text-xs text-slate-400 uppercase tracking-wider">Total P&L</div>
                        <div className="text-xl font-medium text-green-400">+ ₹6,30,000 (34%)</div>
                    </div>
                </div>
            </div>

            <div className="w-full md:w-64 h-48 relative">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                            stroke="none"
                        >
                            {data.map((entry, index) => (
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
                    <div className="text-sm font-bold text-white">24.5L</div>
                </div>
            </div>
        </GlassCard>
    );
}
