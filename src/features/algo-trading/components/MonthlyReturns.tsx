"use client";

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, CartesianGrid } from "recharts";
import { GlassCard } from "@/components/ui/GlassCard";
import { BacktestResult } from "../types";

interface MonthlyReturnsProps {
    data?: BacktestResult['monthly_returns'];
}

// Mock Data
const MOCK_MONTHLY = [
    { month: 'Jan', ret: 5.2 },
    { month: 'Feb', ret: -2.1 },
    { month: 'Mar', ret: 8.4 },
    { month: 'Apr', ret: 3.2 },
    { month: 'May', ret: -1.5 },
    { month: 'Jun', ret: 4.8 },
    { month: 'Jul', ret: 6.2 },
    { month: 'Aug', ret: -0.5 },
    { month: 'Sep', ret: 2.1 },
    { month: 'Oct', ret: 7.5 },
    { month: 'Nov', ret: 1.2 },
    { month: 'Dec', ret: 4.3 },
];

export function MonthlyReturns({ data }: MonthlyReturnsProps) {
    // Transform data object to array if provided, else use mock
    const chartData = data
        ? Object.entries(data).map(([key, val]) => ({ month: key, ret: val }))
        : MOCK_MONTHLY;

    return (
        <GlassCard className="h-[350px] flex flex-col">
            <h3 className="font-bold text-white mb-6">Monthly Returns</h3>

            <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                        <XAxis dataKey="month" stroke="#64748b" tick={{ fontSize: 10 }} />
                        <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                        <Tooltip
                            cursor={{ fill: '#ffffff05' }}
                            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#fff' }}
                            formatter={(val: any) => [`${Number(val)}%`, 'Return']}
                        />
                        <Bar dataKey="ret">
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.ret >= 0 ? '#4ade80' : '#f87171'} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </GlassCard>
    );
}
