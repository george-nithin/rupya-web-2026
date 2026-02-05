"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip, Cell } from "recharts";

// Mock Data: 1 = Perfect Day, 0.5 = Minor Violation, 0 = Major Violation
const disciplineData = [
    { day: "M", score: 1 },
    { day: "T", score: 1 },
    { day: "W", score: 0.5 },
    { day: "T", score: 0 },
    { day: "F", score: 1 },
    { day: "M", score: 1 },
    { day: "T", score: 1 },
];

export function DisciplineDashboard() {
    const currentStreak = 3;
    const adherenceRate = 85;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
                <GlassCard className="p-4 text-center">
                    <div className="text-xs text-slate-400 mb-1">Current Streak</div>
                    <div className="text-3xl font-bold text-green-400">{currentStreak} Days</div>
                </GlassCard>
                <GlassCard className="p-4 text-center">
                    <div className="text-xs text-slate-400 mb-1">Adherence Rate</div>
                    <div className="text-3xl font-bold text-sky-400">{adherenceRate}%</div>
                </GlassCard>
            </div>

            <GlassCard>
                <h3 className="text-sm font-semibold text-white mb-4">Discipline Trend (Last 7 Days)</h3>
                <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={disciplineData}>
                            <XAxis dataKey="day" stroke="#64748b" tickLine={false} axisLine={false} />
                            <Tooltip
                                cursor={{ fill: 'transparent' }}
                                contentStyle={{ background: '#0f172a', border: 'none', color: '#fff' }}
                                formatter={(val: any) => [val === 1 ? 'Perfect' : val === 0.5 ? 'Minor Issue' : 'Violation', 'Status']}
                            />
                            <Bar dataKey="score" radius={[4, 4, 4, 4]}>
                                {disciplineData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={entry.score === 1 ? '#4ade80' : entry.score === 0.5 ? '#facc15' : '#ef4444'}
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </GlassCard>
        </div>
    );
}
