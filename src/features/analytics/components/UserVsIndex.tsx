"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { GlassCard } from "@/components/ui/GlassCard";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export function UserVsIndex() {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPerformanceData();
    }, []);

    const fetchPerformanceData = async () => {
        try {
            // Mocking a trend for now because historical portfolio snapshots require a separate table
            // However, we can fetch real NIFTY 50 historical data for the benchmark
            const { data: nifty } = await supabase
                .from('market_indices')
                .select('last_price, percent_change')
                .eq('index_name', 'NIFTY 50')
                .single();

            // Generate 30 days of data ending at current price
            const basePrice = nifty?.last_price || 21000;
            const pChange = nifty?.percent_change || 0;

            const generatedData = Array.from({ length: 30 }, (_, i) => {
                const day = i + 1;
                const niftyPrice = basePrice * (1 - (pChange / 100) * (30 - day) / 30);
                const userPerformance = niftyPrice * (1 + (Math.sin(day / 5) * 0.02) + (day * 0.001)); // User slightly outperforming or reacting differently

                return {
                    day: `Day ${day}`,
                    user: userPerformance,
                    nifty: niftyPrice
                };
            });

            setData(generatedData);
        } finally {
            setLoading(false);
        }
    };

    return (
        <GlassCard className="h-[400px]">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-white">Performance vs Benchmark</h3>
                <div className="flex gap-2 text-xs">
                    <span className="flex items-center gap-1 text-sky-400"><div className="w-2 h-2 bg-sky-400 rounded-full"></div> Portfolio</span>
                    <span className="flex items-center gap-1 text-slate-400"><div className="w-2 h-2 bg-slate-400 rounded-full"></div> NIFTY 50</span>
                </div>
            </div>

            <div className="h-[80%] min-w-0">
                {loading ? (
                    <div className="h-full flex items-center justify-center text-slate-500 text-sm">Loading performance metrics...</div>
                ) : (
                    <ResponsiveContainer width="100%" height={320}>
                        <LineChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                            <XAxis dataKey="day" hide />
                            <YAxis hide domain={['auto', 'auto']} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#fff' }}
                                formatter={(value: any) => [Number(value).toFixed(2), "Value"]}
                            />
                            <Line type="monotone" dataKey="user" stroke="#38bdf8" strokeWidth={3} dot={false} />
                            <Line type="monotone" dataKey="nifty" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                )}
            </div>
        </GlassCard>
    );
}
