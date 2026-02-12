"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface RiskMetricsProps {
    portfolioBeta: number;
    portfolioVolatility: number;
    sharpeRatio: number;
    diversificationScore: number;
    top3Concentration: number;
    sectorAllocation: Record<string, number>;
}

export function RiskMetrics({
    portfolioBeta,
    portfolioVolatility,
    sharpeRatio,
    diversificationScore,
    top3Concentration,
    sectorAllocation,
}: RiskMetricsProps) {
    const sectorData = Object.entries(sectorAllocation)
        .map(([name, value]) => ({ name, value: Number(value.toFixed(1)) }))
        .sort((a, b) => b.value - a.value);

    const colors = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444", "#6366f1"];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Risk Metrics Grid */}
            <GlassCard className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Risk Metrics</h3>
                <div className="grid grid-cols-2 gap-4">
                    <MetricCard
                        label="Portfolio Beta"
                        value={portfolioBeta.toFixed(2)}
                        description={portfolioBeta > 1 ? "Higher than market" : "Lower than market"}
                        color={portfolioBeta > 1.2 ? "text-amber-500" : "text-emerald-500"}
                    />
                    <MetricCard
                        label="Volatility"
                        value={`${portfolioVolatility.toFixed(1)}%`}
                        description="Annual volatility"
                        color={portfolioVolatility > 25 ? "text-red-500" : "text-blue-500"}
                    />
                    <MetricCard
                        label="Sharpe Ratio"
                        value={sharpeRatio.toFixed(2)}
                        description="Risk-adjusted return"
                        color={sharpeRatio > 1 ? "text-emerald-500" : "text-amber-500"}
                    />
                    <MetricCard
                        label="Diversification"
                        value={`${diversificationScore}/100`}
                        description="Portfolio spread"
                        color={diversificationScore > 70 ? "text-emerald-500" : "text-amber-500"}
                    />
                </div>

                <div className="mt-4 pt-4 border-t border-border/50">
                    <div className="text-sm text-muted-foreground mb-1">Top 3 Concentration</div>
                    <div className="flex items-center gap-3">
                        <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                            <div
                                className={`h-full transition-all duration-500 ${top3Concentration > 55 ? "bg-red-500" : "bg-blue-500"
                                    }`}
                                style={{ width: `${Math.min(100, top3Concentration)}%` }}
                            />
                        </div>
                        <span className="text-lg font-bold text-foreground">
                            {top3Concentration.toFixed(1)}%
                        </span>
                    </div>
                </div>
            </GlassCard>

            {/* Sector Allocation Chart */}
            <GlassCard className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Sector Allocation</h3>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={sectorData} layout="vertical">
                            <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                            <YAxis
                                type="category"
                                dataKey="name"
                                stroke="hsl(var(--muted-foreground))"
                                fontSize={12}
                                width={80}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "hsl(var(--card))",
                                    borderColor: "hsl(var(--border))",
                                    borderRadius: "12px",
                                    color: "hsl(var(--foreground))",
                                }}
                                formatter={(value: any) => [`${value}%`, "Allocation"]}
                            />
                            <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                                {sectorData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </GlassCard>
        </div>
    );
}

function MetricCard({
    label,
    value,
    description,
    color,
}: {
    label: string;
    value: string;
    description: string;
    color: string;
}) {
    return (
        <div className="space-y-1">
            <div className="text-xs text-muted-foreground">{label}</div>
            <div className={`text-2xl font-bold ${color}`}>{value}</div>
            <div className="text-xs text-muted-foreground">{description}</div>
        </div>
    );
}
