"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { AlgoStrategy, BacktestResult } from "@/features/algo-trading/types";
import { supabase } from "@/lib/supabase";
import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Share2, Bookmark } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BacktestPerformance } from "@/features/algo-trading/components/BacktestPerformance";
import { DrawdownAnalysis } from "@/features/algo-trading/components/DrawdownAnalysis";
import { MonthlyReturns } from "@/features/algo-trading/components/MonthlyReturns";
import { CodeEditor } from "@/features/algo-trading/components/CodeEditor";

// Mock Data Generators for Detail View
const MOCK_STRATEGY_DETAIL: AlgoStrategy = {
    id: "mock-1",
    name: "Damper Credit Spread",
    description: "A smart market shock absorber that profits from market turbulence. Think of it as a sophisticated weather forecaster for the stock market - it watches multiple indicators to predict volatility.",
    manager_name: "Stratzy",
    risk_level: "High",
    capital_required: 100000,
    min_amount: 100000,
    max_amount: 320000,
    tags: ["Nifty", "Hedged", "Directional"],
    cagr: 205.69,
    win_rate: 66.67,
    max_drawdown: -20.27,
    created_at: new Date().toISOString(),
    code: `
# This is a mock strategy code example.
# In a real scenario, this would contain Python code for the strategy.

class DamperCreditSpread:
    def __init__(self, capital):
        self.capital = capital
        self.positions = {}
        self.history = []

    def on_tick(self, market_data):
        # Implement strategy logic here
        # Example: Check for volatility spikes
        if market_data['volatility'] > 0.20:
            self.execute_trade('SELL_CREDIT_SPREAD', 'NIFTY_OPTIONS')
        
    def execute_trade(self, trade_type, instrument):
        # Log trade
        self.history.append({
            'timestamp': market_data['timestamp'],
            'type': trade_type,
            'instrument': instrument,
            'status': 'executed'
        })
        print(f"Executed {trade_type} on {instrument}")

# Example usage (for backtesting environment)
# strategy = DamperCreditSpread(capital=100000)
# for data_point in historical_data:
#     strategy.on_tick(data_point)
`
};

export default function AlgoStrategyDetailPage() {
    const params = useParams();
    const id = params?.id as string;
    const [strategy, setStrategy] = useState<AlgoStrategy | null>(null);
    const [backtestResult, setBacktestResult] = useState<BacktestResult | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStrategyDetails();
    }, [id]);

    const fetchStrategyDetails = async () => {
        try {
            // 1. Fetch Strategy
            const { data: stratData } = await supabase
                .from('algo_strategies')
                .select('*')
                .eq('id', id)
                .single();

            if (stratData) {
                setStrategy(stratData);

                // 2. Fetch Backtest Results
                const { data: resData } = await supabase
                    .from('algo_backtest_results')
                    .select('*')
                    .eq('strategy_id', id)
                    .single();

                if (resData && resData.status === 'Completed') {
                    setBacktestResult(resData);
                }
            } else {
                setStrategy(MOCK_STRATEGY_DETAIL);
            }
        } catch (e) {
            console.error(e);
            setStrategy(MOCK_STRATEGY_DETAIL);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="text-foreground p-8">Loading Strategy...</div>;
    if (!strategy) return <div className="text-foreground p-8">Strategy not found</div>;

    return (
        <div className="space-y-6 pb-20">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/algo-trading">
                        <div className="p-2 rounded-xl bg-card/20 hover:bg-card/30 transition-all duration-150 active:scale-95">
                            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
                        </div>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">{strategy.name}</h1>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>by {strategy.manager_name}</span>
                            <span className="w-1 h-1 rounded-full bg-slate-600" />
                            <div className="flex gap-2">
                                {strategy.tags && strategy.tags.map(tag => (
                                    <Badge key={tag} variant="outline" className="border-border text-foreground/80">
                                        {tag}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                {/* ... Actions ... */}
                <div className="flex gap-2">
                    <Button variant="outline" size="icon" className="bg-card/20 border-border text-muted-foreground">
                        <Share2 className="h-5 w-5" />
                    </Button>
                    <Button variant="outline" size="icon" className="bg-card/20 border-border text-muted-foreground">
                        <Bookmark className="h-5 w-5" />
                    </Button>
                    <Button className="bg-primary hover:bg-primary/90 text-foreground font-bold px-6 active:scale-95">
                        Deploy
                    </Button>
                </div>
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

                {/* Left Column: Analysis (3 cols wide) */}
                <div className="lg:col-span-3 space-y-8">
                    {/* Performance Chart */}
                    <BacktestPerformance data={backtestResult?.equity_curve} />

                    {/* Detailed Analysis Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Fix: Pass missing prop or handle internal mock fallback if undefined */}
                        <DrawdownAnalysis />
                        <MonthlyReturns data={backtestResult?.monthly_returns} />
                    </div>

                    <PerformanceSummary strategy={strategy} />

                    {/* Code Section */}
                    <div className="space-y-4">
                        <h2 className="text-lg font-bold text-foreground">Strategy Logic</h2>
                        <CodeEditor
                            initialCode={strategy.code}
                            onRunComplete={fetchStrategyDetails}
                        />
                    </div>
                </div>{/* Sidebar Area (Stats & Actions) */}
                <div className="lg:col-span-1 space-y-6">
                    <GlassCard>
                        <h3 className="font-bold text-foreground mb-4">Performance Metrics</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center pb-2 border-b border-border/50">
                                <span className="text-sm text-muted-foreground">CAGR</span>
                                <span className="text-lg font-bold text-green-400">{(strategy.cagr || 0)}%</span>
                            </div>
                            <div className="flex justify-between items-center pb-2 border-b border-border/50">
                                <span className="text-sm text-muted-foreground">Win Rate</span>
                                <span className="text-lg font-bold text-sky-400">{(strategy.win_rate || 0)}%</span>
                            </div>
                            <div className="flex justify-between items-center pb-2 border-b border-border/50">
                                <span className="text-sm text-muted-foreground">Max Drawdown</span>
                                <span className="text-lg font-bold text-red-400">{(strategy.max_drawdown || 0)}%</span>
                            </div>
                        </div>
                    </GlassCard>

                    <GlassCard>
                        <h3 className="font-bold text-foreground mb-4">Investment</h3>
                        <div className="space-y-4 mb-6">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Min Investment</span>
                                <span className="text-foreground">₹{(strategy.min_amount || 0).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Capital Required</span>
                                <span className="text-foreground">₹{(strategy.capital_required || 0).toLocaleString()}</span>
                            </div>
                        </div>
                        <Button className="w-full bg-primary hover:bg-primary/90 text-foreground font-bold py-6 active:scale-95">
                            Deploy Strategy
                        </Button>
                    </GlassCard>
                </div>
            </div>
        </div>
    );
}

// --- Inline Components ---

function AlgoCorrelation() {
    const CORRELATIONS = [
        { name: "Damper Credit Spread", score: 1.00 },
        { name: "Curvature Overnight", score: 0.05 },
        { name: "Mathematician's Spread", score: -0.01 },
        { name: "Convex Credit Spread", score: 0.06 },
        { name: "IV-Imbalance Spread", score: 0.13 },
        { name: "Chain-Sync Spread", score: 0.00 },
    ];

    return (
        <GlassCard className="h-full">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-foreground">Combine Other Algos</h3>
                <div className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground mb-4">
                Combine algos to improve portfolio stability (low correlation is better).
            </p>
            <div className="space-y-1">
                <div className="grid grid-cols-4 text-[10px] text-muted-foreground pb-2 border-b border-border/50 uppercase tracking-wider">
                    <div className="col-span-2">Algo</div>
                    <div className="text-right">Score</div>
                    <div className="text-right">Corr</div>
                </div>
                {CORRELATIONS.map((item, i) => (
                    <div key={i} className="grid grid-cols-4 items-center py-3 border-b border-border/50 last:border-0 hover:bg-card/20 transition-all duration-150 px-2 -mx-2 rounded-xl active:scale-95">
                        <div className="col-span-2 flex items-center gap-2">
                            <input type="checkbox" className="rounded border-border bg-card/20" disabled={i === 0} checked={i === 0} readOnly />
                            <span className={`text-sm ${i === 0 ? 'text-foreground font-medium' : 'text-foreground/80'}`}>
                                {item.name}
                            </span>
                        </div>
                        <div className="text-right text-sm text-muted-foreground">
                            {(Math.random() * 50).toFixed(2)}
                        </div>
                        <div className="text-right text-sm font-mono text-foreground">
                            {item.score.toFixed(2)}
                        </div>
                    </div>
                ))}
            </div>
        </GlassCard>
    );
}

function StrategyOverview({ strategy }: { strategy: AlgoStrategy }) {
    return (
        <div className="space-y-6">
            <GlassCard>
                <h3 className="font-bold text-foreground mb-4">Overview</h3>
                <div className="flex flex-wrap gap-2 mb-4">
                    {strategy.tags && strategy.tags.map(tag => (
                        <span key={tag} className="px-3 py-1 rounded-full bg-card/20 border border-border text-xs text-foreground/80">
                            {tag}
                        </span>
                    ))}
                </div>
                <p className="text-sm text-foreground/80 leading-relaxed">
                    {strategy.description}
                </p>
                <div className="mt-4 p-4 bg-sky-500/10 border border-sky-500/20 rounded-xl">
                    <p className="text-xs text-sky-200">
                        This strategy acts as a "smart market shock absorber". It watches likely volatility
                        indicators and collects premiums when other traders are panicking.
                    </p>
                </div>
            </GlassCard>

            <GlassCard>
                <h3 className="font-bold text-foreground mb-4">Managed By</h3>
                <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-foreground font-bold text-xl">
                        {strategy.manager_name[0]}
                    </div>
                    <div>
                        <h4 className="font-bold text-foreground">{strategy.manager_name}</h4>
                        <div className="text-xs text-muted-foreground">SEBI Registered Algo Provider</div>

                        <div className="flex gap-4 mt-3">
                            <div className="text-center">
                                <div className="text-lg font-bold text-foreground">43</div>
                                <div className="text-[10px] text-muted-foreground uppercase">Algos</div>
                            </div>
                            <div className="text-center border-l border-border pl-4">
                                <div className="text-lg font-bold text-foreground">5Y</div>
                                <div className="text-[10px] text-muted-foreground uppercase">Active</div>
                            </div>
                            <div className="text-center border-l border-border pl-4">
                                <div className="text-lg font-bold text-foreground">12.5K</div>
                                <div className="text-[10px] text-muted-foreground uppercase">Users</div>
                            </div>
                        </div>
                    </div>
                </div>
            </GlassCard>

            <GlassCard className="border-l-2 border-l-yellow-500">
                <div className="flex items-center gap-2 mb-2">
                    <div className="h-5 w-5 text-yellow-500" />
                    <h3 className="font-bold text-foreground text-sm">Risk Disclosures</h3>
                </div>
                <ul className="space-y-2 mt-2">
                    <li className="text-xs text-muted-foreground list-disc list-inside">
                        Algorithmic trading involves market risks and is subject to slippage.
                    </li>
                    <li className="text-xs text-muted-foreground list-disc list-inside">
                        Past performance does not guarantee future results.
                    </li>
                    <li className="text-xs text-muted-foreground list-disc list-inside">
                        Limit orders may remain unexecuted based on market conditions.
                    </li>
                </ul>
            </GlassCard>
        </div>
    );
}

function PerformanceSummary({ strategy }: { strategy: AlgoStrategy }) {
    const metrics = [
        { label: "Cumulative Return", value: `+${(strategy.cagr || 0)}%`, dim: false },
        { label: "CAGR", value: "+205.69%", dim: false },
        { label: "Sharpe Ratio", value: "3.42", dim: false },
        { label: "Max Drawdown", value: "-20.27%", dim: true },
        { label: "Win Rate", value: "66.67%", dim: false },
        { label: "Avg Loss", value: "-3.40%", dim: true },
    ];

    return (
        <GlassCard>
            <h3 className="font-bold text-foreground mb-4">Performance Metrics</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-8">
                {metrics.map((m, i) => (
                    <div key={i} className="flex justify-between items-center border-b border-border/50 pb-2 last:border-0">
                        <span className="text-xs text-muted-foreground">{m.label}</span>
                        <span className={`text-sm font-bold ${m.dim ? 'text-red-400' : 'text-white'}`}>
                            {m.value}
                        </span>
                    </div>
                ))}
            </div>
        </GlassCard>
    );
}
