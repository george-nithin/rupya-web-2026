"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts";

const comparisonData = Array.from({ length: 30 }, (_, i) => ({
    day: `Day ${i + 1}`,
    user: 100 + (Math.random() * 20 - 5) + (i * 2),
    nifty: 100 + (Math.random() * 10 - 2) + (i * 1.2),
}));

export function UserVsIndex() {
    return (
        <GlassCard className="h-[400px]">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-white">Performance vs Benchmark</h3>
                <div className="flex gap-2 text-xs">
                    <span className="flex items-center gap-1 text-sky-400"><div className="w-2 h-2 bg-sky-400 rounded-full"></div> You (+24%)</span>
                    <span className="flex items-center gap-1 text-slate-400"><div className="w-2 h-2 bg-slate-400 rounded-full"></div> NIFTY 50 (+14%)</span>
                </div>
            </div>

            <ResponsiveContainer width="100%" height="80%">
                <LineChart data={comparisonData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                    <XAxis dataKey="day" hide />
                    <YAxis hide domain={['auto', 'auto']} />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#fff' }}
                    />
                    <Line type="monotone" dataKey="user" stroke="#38bdf8" strokeWidth={3} dot={false} />
                    <Line type="monotone" dataKey="nifty" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                </LineChart>
            </ResponsiveContainer>
        </GlassCard>
    );
}
