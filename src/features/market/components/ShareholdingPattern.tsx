"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

const data = [
    { name: "Promoters", value: 50.2, color: "#4ade80" },
    { name: "FII", value: 20.5, color: "#38bdf8" },
    { name: "DII", value: 15.3, color: "#a78bfa" },
    { name: "Public", value: 14.0, color: "#fbbf24" },
];

export function ShareholdingPattern() {
    return (
        <GlassCard className="h-full flex flex-col">
            <h3 className="text-sm font-bold text-white mb-2">Shareholding Pattern</h3>
            <div className="flex-1 min-h-[200px] relative">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
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
                            contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "8px", fontSize: "12px" }}
                            itemStyle={{ color: "#fff" }}
                        />
                        <Legend
                            verticalAlign="bottom"
                            height={36}
                            iconSize={8}
                            wrapperStyle={{ fontSize: "10px", color: "#94a3b8" }}
                        />
                    </PieChart>
                </ResponsiveContainer>
                {/* Center Text */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none pb-8">
                    <span className="text-xs font-bold text-slate-500">Dec 2025</span>
                </div>
            </div>
        </GlassCard>
    );
}
