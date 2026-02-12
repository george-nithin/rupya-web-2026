"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from "recharts";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { PortfolioHealthMeter } from "@/features/portfolio/components/PortfolioHealthMeter";
import { RiskMetrics } from "@/features/portfolio/components/RiskMetrics";
import { StockScoreCard } from "@/features/portfolio/components/StockScoreCard";
import { BrokerConnectionModal } from "@/features/portfolio/components/BrokerConnectionModal";
import { Sparkles, Link as LinkIcon } from "lucide-react";

export default function PortfolioPage() {
    const [holdings, setHoldings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [analytics, setAnalytics] = useState<any>(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [allocation, setAllocation] = useState<any[]>([]);
    const [showBrokerModal, setShowBrokerModal] = useState(false);

    useEffect(() => {
        fetchPortfolio();
    }, []);

    const analyzePortfolio = async () => {
        setAnalyzing(true);
        try {
            const response = await fetch('/api/portfolio/analyze', {
                method: 'POST',
            });
            const data = await response.json();
            setAnalytics(data);
        } catch (error) {
            console.error('Error analyzing portfolio:', error);
        } finally {
            setAnalyzing(false);
        }
    };

    const fetchPortfolio = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: port, error: pError } = await supabase
                .from('user_portfolio')
                .select('*')
                .eq('user_id', user.id);

            if (pError) throw pError;
            if (!port || port.length === 0) {
                setHoldings([]);
                setLoading(false);
                return;
            }

            const symbols = port.map(p => p.symbol);

            const { data: quotes, error: qError } = await supabase
                .from('market_equity_quotes')
                .select('symbol, last_price, sector')
                .in('symbol', symbols);

            if (qError) throw qError;

            const sectorMap: { [key: string]: number } = {};
            const merged = port.map(p => {
                const quote = quotes?.find(q => q.symbol === p.symbol);
                const ltp = quote?.last_price || p.avg_price;
                const value = ltp * p.quantity;
                const invested = p.avg_price * p.quantity;
                const pnl = value - invested;
                const pnlPercent = invested ? (pnl / invested) * 100 : 0;

                const sector = quote?.sector || "Others";
                sectorMap[sector] = (sectorMap[sector] || 0) + value;

                return {
                    symbol: p.symbol,
                    qty: p.quantity,
                    avg: p.avg_price,
                    ltp: ltp,
                    value: value,
                    pnl: pnl,
                    pnlPercent: pnlPercent,
                    sector: sector
                };
            });

            setHoldings(merged);

            const colors = ["#38bdf8", "#c084fc", "#34d399", "#fbbf24", "#f87171", "#818cf8"];
            const alloc = Object.entries(sectorMap).map(([name, value], i) => ({
                name,
                value,
                color: colors[i % colors.length]
            }));
            setAllocation(alloc);

        } catch (error) {
            console.error("Error fetching portfolio:", error);
        } finally {
            setLoading(false);
        }
    };

    const totalValue = holdings.reduce((acc, curr) => acc + curr.value, 0);
    const totalInvested = holdings.reduce((acc, curr) => acc + (curr.avg * curr.qty), 0);
    const totalPnl = totalValue - totalInvested;
    const totalPnlPercent = totalInvested ? (totalPnl / totalInvested) * 100 : 0;

    return (
        <div className="space-y-6">
            <BrokerConnectionModal
                isOpen={showBrokerModal}
                onClose={() => setShowBrokerModal(false)}
            />

            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Portfolio Intelligence</h1>
                    <p className="text-muted-foreground">AI-powered portfolio analysis & forecasting</p>
                </div>
                <div className="flex gap-3">
                    <GlassButton
                        variant="secondary"
                        onClick={() => setShowBrokerModal(true)}
                    >
                        <LinkIcon className="h-4 w-4 mr-2" />
                        Connect Broker
                    </GlassButton>
                    <GlassButton
                        variant="primary"
                        onClick={analyzePortfolio}
                        disabled={analyzing || holdings.length === 0}
                    >
                        <Sparkles className="h-4 w-4 mr-2" />
                        {analyzing ? "Analyzing..." : "Analyze Portfolio"}
                    </GlassButton>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <GlassCard>
                    <div className="text-sm text-muted-foreground">Current Value</div>
                    <div className="text-3xl font-bold text-foreground mt-1">₹{totalValue.toLocaleString()}</div>
                </GlassCard>
                <GlassCard>
                    <div className="text-sm text-muted-foreground">Invested Amount</div>
                    <div className="text-2xl font-semibold text-foreground mt-1">₹{totalInvested.toLocaleString()}</div>
                </GlassCard>
                <GlassCard>
                    <div className="text-sm text-muted-foreground">Total P&L</div>
                    <div className={`text-2xl font-bold mt-1 ${totalPnl >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                        {totalPnl >= 0 ? "+" : ""}₹{totalPnl.toLocaleString()} ({totalPnlPercent.toFixed(2)}%)
                    </div>
                </GlassCard>
            </div>

            {/* Portfolio Intelligence Dashboard */}
            {analytics && (
                <div className="space-y-6">
                    <PortfolioHealthMeter
                        healthScore={analytics.healthScore}
                        classification={analytics.classification}
                        expectedReturn={analytics.forecast.expectedReturn}
                        downside5={analytics.forecast.downside5}
                        upside95={analytics.forecast.upside95}
                        warnings={analytics.portfolioAnalysis.warnings}
                    />

                    <RiskMetrics
                        portfolioBeta={analytics.portfolioAnalysis.riskMetrics.portfolioBeta}
                        portfolioVolatility={analytics.portfolioAnalysis.riskMetrics.portfolioVolatility}
                        sharpeRatio={analytics.portfolioAnalysis.riskMetrics.sharpeRatio}
                        diversificationScore={analytics.portfolioAnalysis.diversification.diversificationScore}
                        top3Concentration={analytics.portfolioAnalysis.allocation.top3Concentration}
                        sectorAllocation={analytics.portfolioAnalysis.allocation.sectorAllocation}
                    />

                    {/* Stock Scores */}
                    <div>
                        <h2 className="text-xl font-bold text-foreground mb-4">Stock Fundamental Analysis</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {analytics.stockScores.map((score: any) => (
                                <StockScoreCard
                                    key={score.symbol}
                                    symbol={score.symbol}
                                    qualityScore={score.qualityScore}
                                    growthScore={score.growthScore}
                                    valuationScore={score.valuationScore}
                                    stabilityScore={score.stabilityScore}
                                    totalScore={score.totalScore}
                                    rating={score.rating}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Allocation Chart */}
                <GlassCard className="col-span-1 min-h-[300px]">
                    <h2 className="text-lg font-semibold text-foreground mb-4">Sector Allocation</h2>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={allocation}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {allocation.map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <RechartsTooltip
                                    contentStyle={{
                                        backgroundColor: 'hsl(var(--card))',
                                        borderColor: 'hsl(var(--border))',
                                        color: 'hsl(var(--foreground))',
                                        borderRadius: '12px',
                                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                    }}
                                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </GlassCard>

                {/* Holdings Table */}
                <GlassCard className="col-span-1 lg:col-span-2">
                    <h2 className="text-lg font-semibold text-foreground mb-4">Holdings</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="text-muted-foreground border-b border-border/50">
                                <tr>
                                    <th className="pb-3 pl-2">Symbol</th>
                                    <th className="pb-3 text-right">Qty</th>
                                    <th className="pb-3 text-right">Avg Price</th>
                                    <th className="pb-3 text-right">LTP</th>
                                    <th className="pb-3 text-right">Cur. Value</th>
                                    <th className="pb-3 text-right pr-2">P&L</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/10">
                                {holdings.map((stock) => (
                                    <tr key={stock.symbol} className="hover:bg-muted/50 transition-all duration-150">
                                        <td className="py-3 pl-2 font-medium text-foreground">{stock.symbol}</td>
                                        <td className="py-3 text-right text-foreground">{stock.qty}</td>
                                        <td className="py-3 text-right text-foreground">₹{stock.avg.toLocaleString()}</td>
                                        <td className="py-3 text-right text-foreground">₹{stock.ltp.toLocaleString()}</td>
                                        <td className="py-3 text-right text-foreground font-medium">₹{stock.value.toLocaleString()}</td>
                                        <td className={`py-3 text-right pr-2 font-medium ${stock.pnl >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                                            {stock.pnl >= 0 ? "+" : ""}₹{stock.pnl.toLocaleString()} <br />
                                            <span className="text-xs opacity-80">({stock.pnlPercent.toFixed(2)}%)</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </GlassCard>
            </div>
        </div>
    );
}
