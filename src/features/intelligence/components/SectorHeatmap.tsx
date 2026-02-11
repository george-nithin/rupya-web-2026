"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { ResponsiveContainer, Treemap, Tooltip } from "recharts";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const CustomizedContent = (props: any) => {
    const { x, y, width, height, change, name } = props;

    if (!width || !height) return null; // Safety check

    return (
        <g>
            <rect
                x={x}
                y={y}
                width={width}
                height={height}
                style={{
                    fill: change >= 0 ? `rgba(74, 222, 128, ${0.1 + (change / 5)})` : `rgba(248, 113, 113, ${0.1 + (Math.abs(change) / 5)})`,
                    stroke: '#1e293b',
                    strokeWidth: 2,
                }}
            />
            {width > 60 && height > 40 && (
                <>
                    <text x={x + width / 2} y={y + height / 2 - 7} textAnchor="middle" fill="#fff" fontSize={12} fontWeight="bold">
                        {name}
                    </text>
                    <text x={x + width / 2} y={y + height / 2 + 7} textAnchor="middle" fill="#cbd5e1" fontSize={10}>
                        {change > 0 ? '+' : ''}{change}%
                    </text>
                </>
            )}
        </g>
    );
};

export function SectorHeatmap() {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchHeatmapData();

        const channel = supabase
            .channel('heatmap_changes')
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'market_equity_quotes'
                },
                (payload) => {
                    // Refresh data or update specific item
                    // For simplicity and accuracy in ranking, we'll re-fetch for now, 
                    // optimization could be to update local state directly
                    fetchHeatmapData();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const fetchHeatmapData = async () => {
        try {
            // 1. Get NIFTY 50 symptoms
            const { data: constituents } = await supabase
                .from('index_constituents')
                .select('symbol')
                .eq('index_name', 'NIFTY 50');

            if (!constituents) return;
            const symbols = constituents.map(c => c.symbol);

            // 2. Get quotes for these symbols
            const { data: quotes } = await supabase
                .from('market_equity_quotes')
                .select('symbol, last_price, percent_change, market_cap')
                .in('symbol', symbols)
                .order('market_cap', { ascending: false })
                .limit(20);

            if (quotes) {
                setData([{
                    name: 'Nifty 50',
                    children: quotes.map(q => ({
                        name: q.symbol,
                        size: q.market_cap || 100,
                        change: q.percent_change || 0
                    }))
                }]);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <GlassCard className="h-full min-h-[400px]">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-white">Market Heatmap</h2>
                <div className="flex gap-2">
                    <span className="text-xs flex items-center gap-1 text-slate-400">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div> Bullish
                    </span>
                    <span className="text-xs flex items-center gap-1 text-slate-400">
                        <div className="w-2 h-2 rounded-full bg-red-500"></div> Bearish
                    </span>
                </div>
            </div>
            <div className="h-[350px] min-w-0">
                {loading ? (
                    <div className="h-full flex items-center justify-center text-slate-500">Loading Market Data...</div>
                ) : (
                    <ResponsiveContainer width="100%" height={350}>
                        <Treemap
                            data={data}
                            dataKey="size"
                            stroke="#fff"
                            fill="#8884d8"
                            content={<CustomizedContent />}
                        >
                            <Tooltip
                                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#fff' }}
                                formatter={(val: any, name: any, props: any) => [`${props.payload.change}%`, 'Change']}
                            />
                        </Treemap>
                    </ResponsiveContainer>
                )}
            </div>
        </GlassCard>
    );
}
