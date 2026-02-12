"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { Play, Loader2, AlertTriangle } from "lucide-react";
import { useState, useEffect } from "react";
import { StockSearch } from "@/components/ui/StockSearch";
import { supabase } from "@/lib/supabase";

export function Backtester() {
    const [running, setRunning] = useState(false);
    const [strategies, setStrategies] = useState<any[]>([]);
    const [selectedStrategyId, setSelectedStrategyId] = useState<string>("");
    const [selectedStock, setSelectedStock] = useState<any>(null);
    const [timeframe, setTimeframe] = useState("1y");
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchStrategies();
    }, []);

    const fetchStrategies = async () => {
        const { data } = await supabase.from('algo_strategies').select('id, name');

        const predefined = [
            { id: 'expanding_range_breakout', name: 'Nifty 500 Expanding Range Breakout' },
            { id: 'ma_crossover', name: 'Moving Average Crossover' },
            { id: 'rsi_mean_reversion', name: 'RSI Mean Reversion' },
            { id: 'breakout', name: 'Breakout Strategy' },
            { id: 'buy_and_hold', name: 'Buy and Hold' }
        ];

        let allStrategies = [...predefined];
        if (data && data.length > 0) {
            allStrategies = [...allStrategies, ...data];
        }

        setStrategies(allStrategies);
        if (allStrategies.length > 0) {
            setSelectedStrategyId(allStrategies[0].id);
        }
    };

    const runBacktest = async () => {
        if (!selectedStrategyId || !selectedStock) {
            setError("Please select a strategy and a stock.");
            return;
        }
        setRunning(true);
        setError("");
        setResult(null);

        try {
            // 1. Create Job with Params
            const { data: job, error: jobError } = await supabase
                .from('algo_backtest_results')
                .insert({
                    strategy_id: selectedStrategyId,
                    status: 'Pending',
                    parameters: {
                        symbol: selectedStock.symbol,
                        period: timeframe
                    }
                })
                .select()
                .single();

            if (jobError) throw jobError;

            // 2. Poll
            const interval = setInterval(async () => {
                const { data: res } = await supabase
                    .from('algo_backtest_results')
                    .select('*')
                    .eq('id', job.id)
                    .single();

                if (res?.status === 'Completed') {
                    clearInterval(interval);
                    setResult(res);
                    setRunning(false);
                } else if (res?.status === 'Failed') {
                    clearInterval(interval);
                    setError("Backtest failed. Check backend logs.");
                    setRunning(false);
                }
            }, 1000);

        } catch (err: any) {
            console.error(err);
            setError(err.message);
            setRunning(false);
        }
    };

    return (
        <div className="space-y-6">
            <GlassCard>
                <div className="flex flex-col md:flex-row justify-between items-end gap-4 mb-6">
                    <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                        <div>
                            <label className="block text-xs font-medium text-muted-foreground mb-1">Strategy</label>
                            <select
                                className="bg-[hsl(var(--card))] border border-border rounded-xl px-3 py-2 text-foreground text-sm outline-none w-full md:w-48 appearance-none"
                                value={selectedStrategyId}
                                onChange={(e) => setSelectedStrategyId(e.target.value)}
                            >
                                {strategies.map(s => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="w-full md:w-64">
                            <label className="block text-xs font-medium text-muted-foreground mb-1">Instrument</label>
                            <StockSearch
                                onSelect={setSelectedStock}
                                placeholder="Search (e.g. RELIANCE)"
                                className="w-full"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-muted-foreground mb-1">Period</label>
                            <select
                                className="bg-[hsl(var(--card))] border border-border rounded-xl px-3 py-2 text-foreground text-sm outline-none w-24 appearance-none"
                                value={timeframe}
                                onChange={(e) => setTimeframe(e.target.value)}
                            >
                                <option value="1mo">1 Month</option>
                                <option value="6mo">6 Months</option>
                                <option value="1y">1 Year</option>
                                <option value="2y">2 Years</option>
                                <option value="5y">5 Years</option>
                            </select>
                        </div>
                    </div>

                    <GlassButton
                        onClick={runBacktest}
                        disabled={running || !selectedStock}
                        className="w-full md:w-auto bg-primary hover:bg-primary/90 active:scale-95"
                    >
                        {running ? <Loader2 className="h-5 w-5 mr-2 animate-spin" /> : <Play className="h-5 w-5 mr-2" />}
                        {running ? "Simulating..." : "Run Backtest"}
                    </GlassButton>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5" /> {error}
                    </div>
                )}

                <div className="h-[350px] w-full bg-black/20 rounded-xl overflow-hidden relative border border-border/50">
                    {result ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={result.equity_curve}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                                <XAxis
                                    dataKey="date"
                                    stroke="#64748b"
                                    tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { month: 'short', year: '2-digit' })}
                                    minTickGap={30}
                                />
                                <YAxis
                                    stroke="#64748b"
                                    domain={['auto', 'auto']}
                                    tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#fff' }}
                                    formatter={(val: any) => [`₹${val.toFixed(2)}`, 'Equity']}
                                    labelFormatter={(label) => new Date(label).toLocaleDateString()}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="equity"
                                    stroke="#38bdf8"
                                    strokeWidth={2}
                                    dot={false}
                                    activeDot={{ r: 4, strokeWidth: 0 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                            {running ? "Processing Strategy..." : "Select parameters and run backtest to see results"}
                        </div>
                    )}
                </div>

                {result && result.metrics && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                        <div className="p-4 bg-card/20 rounded-xl border border-border/50 text-center">
                            <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Total Return</div>
                            <div className={`text-xl font-bold ${result.metrics.total_return >= 0 ? "text-green-400" : "text-red-400"}`}>
                                {result.metrics.total_return > 0 ? "+" : ""}{result.metrics.total_return}%
                            </div>
                        </div>
                        <div className="p-4 bg-card/20 rounded-xl border border-border/50 text-center">
                            <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Max Drawdown</div>
                            <div className="text-xl font-bold text-red-400">{result.metrics.max_drawdown}%</div>
                        </div>
                        <div className="p-4 bg-card/20 rounded-xl border border-border/50 text-center">
                            <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">CAGR</div>
                            <div className={`text-xl font-bold ${result.metrics.cagr >= 0 ? "text-green-400" : "text-red-400"}`}>
                                {result.metrics.cagr}%
                            </div>
                        </div>
                        <div className="p-4 bg-card/20 rounded-xl border border-border/50 text-center">
                            <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Win Rate</div>
                            <div className="text-xl font-bold text-sky-400">{result.metrics.win_rate || '-'}%</div>
                        </div>
                    </div>
                )}
            </GlassCard>
        </div>
    );
}
