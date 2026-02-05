"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { ResponsiveContainer, Treemap, Tooltip } from "recharts";

const data = [
    {
        name: 'Nifty 50',
        children: [
            { name: 'HDFC Bank', size: 1300, change: 1.2 },
            { name: 'Reliance', size: 1500, change: -0.5 },
            { name: 'ICICI Bank', size: 900, change: 2.1 },
            { name: 'Infosys', size: 800, change: -1.4 },
            { name: 'ITC', size: 600, change: 0.2 },
            { name: 'TCS', size: 1100, change: 0.8 },
            { name: 'L&T', size: 500, change: 1.5 },
            { name: 'Axis Bank', size: 400, change: -0.2 },
            { name: 'Kotak Bank', size: 450, change: -0.8 },
            { name: 'SBI', size: 550, change: 2.5 },
        ],
    },
];

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
            <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
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
            </div>
        </GlassCard>
    );
}
