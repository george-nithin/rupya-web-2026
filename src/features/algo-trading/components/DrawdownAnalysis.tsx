"use client";

import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { GlassCard } from "@/components/ui/GlassCard";

// Mock Data
const MOCK_DRAWDOWN = Array.from({ length: 30 }, (_, i) => ({
    date: `2024-01-${i + 1}`,
    drawdown: Math.max(-20, -Math.abs(Math.sin(i) * 15) - (Math.random() * 5))
}));

export function DrawdownAnalysis() {
    return (
        <GlassCard className="h-[300px] flex flex-col">
            <h3 className="font-bold text-white mb-6">Drawdown Analysis</h3>

            <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={MOCK_DRAWDOWN}>
                        <defs>
                            <linearGradient id="colorDrawdown" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                        <XAxis dataKey="date" hide />
                        <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#fff' }}
                            formatter={(val: any) => [`${Number(val).toFixed(2)}%`, 'Drawdown']}
                        />
                        <Area
                            type="monotone"
                            dataKey="drawdown"
                            stroke="#ef4444"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorDrawdown)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </GlassCard>
    );
}
