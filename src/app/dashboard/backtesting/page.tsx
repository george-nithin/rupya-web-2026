'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, TrendingUp, TrendingDown, Activity, DollarSign, Target, BarChart3, PlayCircle, Download, AlertCircle, Clock, Award } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { GlassCard } from '@/components/ui/GlassCard';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { useSearchParams } from 'next/navigation';

interface Strategy {
    id: string;
    name: string;
    description: string;
    type: 'predefined' | 'custom';
    cagr?: number;
    win_rate?: number;
    max_drawdown?: number;
}

interface BacktestMetrics {
    total_return: number;
    cagr: number;
    sharpe_ratio: number;
    max_drawdown: number;
    total_trades: number;
    winning_trades: number;
    losing_trades: number;
    win_rate: number;
    profit_factor: number;
    average_win: number;
    average_loss: number;
}

interface BacktestResult {
    id: string;
    strategy_id: string;
    metrics: BacktestMetrics;
    equity_curve: Array<{ timestamp: string; equity: number; cash: number; positions_value: number }>;
    trade_log: Array<{
        symbol: string;
        entry_date: string;
        exit_date: string;
        entry_price: number;
        exit_price: number;
        quantity: number;
        pnl: number;
        pnl_percent: number;
        holding_days: number;
    }>;
    status: string;
    created_at: string;
}

export default function BacktestingPage() {


    const [strategies, setStrategies] = useState<Strategy[]>([]);
    const [selectedStrategy, setSelectedStrategy] = useState<string>('');
    const [strategyTab, setStrategyTab] = useState<'predefined' | 'custom'>('predefined');
    const [symbol, setSymbol] = useState('RELIANCE');
    const [startDate, setStartDate] = useState('2024-01-01');
    const [endDate, setEndDate] = useState('2025-01-01');
    const [initialCapital, setInitialCapital] = useState(100000);
    const [isRunning, setIsRunning] = useState(false);
    const [result, setResult] = useState<BacktestResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    // URL params
    const searchParams = useSearchParams();

    // Fetch available strategies
    useEffect(() => {
        fetchStrategies();
    }, []);

    const fetchStrategies = async () => {
        // Use hardcoded strategies that coincide with what the Python backend supports
        const defaultStrategies: Strategy[] = [
            {
                id: 'ma_crossover',
                name: 'Moving Average Crossover',
                description: 'Buy when fast MA crosses above slow MA, sell on opposite crossover',
                type: 'predefined'
            },
            {
                id: 'rsi_mean_reversion',
                name: 'RSI Mean Reversion',
                description: 'Buy when RSI < 30, sell when RSI > 70',
                type: 'predefined'
            },
            {
                id: 'breakout',
                name: 'Breakout Strategy',
                description: 'Buy on 20-day high breakout with stop-loss and profit target',
                type: 'predefined'
            },
            {
                id: 'buy_and_hold',
                name: 'Buy and Hold',
                description: 'Buy on first day and hold until the end',
                type: 'predefined'
            }
        ];

        // Fetch custom strategies
        try {
            const res = await fetch('/api/strategies');
            const customStrategies = await res.json();
            if (Array.isArray(customStrategies)) {
                // Map to Strategy interface (ensure matching fields)
                // API returns: id, name, description, code, etc.
                const mappedCustom = customStrategies.map((s: any) => ({
                    id: s.id,
                    name: s.name,
                    description: s.description || 'Custom Strategy',
                    type: 'custom' as const,
                    cagr: s.cagr,
                    win_rate: s.win_rate,
                    max_drawdown: s.max_drawdown
                }));

                const allStrategies = [...defaultStrategies, ...mappedCustom];
                setStrategies(allStrategies);

                // Select from URL if present
                // Select from URL if present
                const urlStrategy = searchParams.get('strategy');
                if (urlStrategy && allStrategies.some(s => s.id === urlStrategy)) {
                    setSelectedStrategy(urlStrategy);
                    const strategy = allStrategies.find(s => s.id === urlStrategy);
                    if (strategy?.type === 'custom') {
                        setStrategyTab('custom');
                    }
                } else if (!selectedStrategy) {
                    setSelectedStrategy('ma_crossover');
                }
            } else {
                setStrategies(defaultStrategies);
                if (!selectedStrategy) setSelectedStrategy('ma_crossover');
            }
        } catch (e) {
            console.error("Failed to fetch custom strategies", e);
            setStrategies(defaultStrategies);
            if (!selectedStrategy) setSelectedStrategy('ma_crossover');
        }
    };

    const runBacktest = async () => {
        if (!selectedStrategy || !symbol) {
            setError('Please select a strategy and enter a symbol');
            return;
        }

        setIsRunning(true);
        setError(null);
        setResult(null);


        try {
            const response = await fetch('/api/backtest/run', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    strategy_id: selectedStrategy,
                    symbol,
                    start_date: startDate,
                    end_date: endDate,
                    initial_capital: initialCapital
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || data.details || 'Failed to run backtest');
            }

            if (data.metrics) {
                const backtestResult: BacktestResult = {
                    id: 'temp-id',
                    strategy_id: selectedStrategy,
                    metrics: {
                        total_return: data.metrics.total_return || 0,
                        cagr: data.metrics.cagr || 0,
                        sharpe_ratio: data.metrics.sharpe_ratio || 0,
                        max_drawdown: data.metrics.max_drawdown || 0,
                        total_trades: data.metrics.total_trades || 0,
                        winning_trades: data.metrics.winning_trades || 0,
                        losing_trades: data.metrics.losing_trades || 0,
                        win_rate: data.metrics.win_rate || 0,
                        profit_factor: data.metrics.profit_factor || 0,
                        average_win: data.metrics.average_win || 0,
                        average_loss: data.metrics.average_loss || 0,
                    },
                    equity_curve: data.equity_curve || [],
                    trade_log: data.trade_log || [],
                    status: data.status || 'completed',
                    created_at: new Date().toISOString()
                };
                setResult(backtestResult);
            }

        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to run backtest';
            setError(errorMessage);

            if (errorMessage.toLowerCase().includes('no data') || errorMessage.toLowerCase().includes('historical data')) {
                setError(
                    `No historical data found for ${symbol}. Please fetch data first using:\n` +
                    `python backend/historical_data_fetcher.py --symbols "${symbol}" --days 365`
                );
            }
        } finally {
            setIsRunning(false);
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(value);
    };

    const formatPercent = (value: number) => {
        return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                        <BarChart3 className="h-10 w-10 text-purple-400" />
                        Strategy Backtesting
                    </h1>
                    <p className="text-slate-300">
                        Test your trading strategies on historical data and analyze performance
                    </p>
                </div>

                {/* Configuration Card */}
                <GlassCard className="mb-6" variant="frosted">
                    <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                        <PlayCircle className="h-5 w-5 text-purple-400" />
                        Backtest Configuration
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Strategy Selection */}
                        <div className="md:col-span-2 lg:col-span-1">
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Strategy
                            </label>

                            {/* Strategy Type Tabs */}
                            <div className="flex bg-white/5 p-1 rounded-lg mb-3">
                                <button
                                    onClick={() => setStrategyTab('predefined')}
                                    className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${strategyTab === 'predefined'
                                        ? 'bg-purple-600 text-white shadow-lg'
                                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    Predefined
                                </button>
                                <button
                                    onClick={() => setStrategyTab('custom')}
                                    className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${strategyTab === 'custom'
                                        ? 'bg-purple-600 text-white shadow-lg'
                                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    My Strategies
                                </button>
                            </div>

                            <select
                                value={selectedStrategy}
                                onChange={(e) => setSelectedStrategy(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 mb-2"
                            >
                                <option value="">Select a strategy</option>
                                {strategies
                                    .filter(s => s.type === strategyTab)
                                    .map((strategy) => (
                                        <option key={strategy.id} value={strategy.id}>
                                            {strategy.name}
                                        </option>
                                    ))}
                            </select>

                            {strategyTab === 'custom' && (
                                <a
                                    href="/dashboard/backtesting/strategies"
                                    className="text-xs text-purple-400 hover:text-purple-300 flex items-center justify-end gap-1"
                                >
                                    + Create New Strategy
                                </a>
                            )}

                            {selectedStrategy && (
                                <p className="mt-2 text-xs text-slate-400">
                                    {strategies.find(s => s.id === selectedStrategy)?.description}
                                </p>
                            )}
                        </div>

                        {/* Symbol */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Symbol
                            </label>
                            <input
                                type="text"
                                value={symbol}
                                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                                placeholder="e.g., RELIANCE, TCS"
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                        </div>

                        {/* Initial Capital */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Initial Capital (₹)
                            </label>
                            <input
                                type="number"
                                value={initialCapital}
                                onChange={(e) => setInitialCapital(Number(e.target.value))}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                        </div>

                        {/* Start Date */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Start Date
                            </label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                        </div>

                        {/* End Date */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                End Date
                            </label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                        </div>

                        {/* Run Button */}
                        <div className="flex items-end">
                            <button
                                onClick={runBacktest}
                                disabled={isRunning}
                                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-2.5 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isRunning ? (
                                    <>
                                        <Activity className="h-5 w-5 animate-spin" />
                                        Running...
                                    </>
                                ) : (
                                    <>
                                        <PlayCircle className="h-5 w-5" />
                                        Run Backtest
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mt-4 bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-start gap-3">
                            <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-red-300 font-medium">Error</p>
                                <p className="text-red-200 text-sm mt-1">{error}</p>
                                <p className="text-red-200 text-xs mt-2">
                                    To run backtests, use: <code className="bg-black/20 px-2 py-1 rounded">python backend/run_backtest.py --strategy ma_crossover --symbol {symbol} --start-date {startDate} --end-date {endDate}</code>
                                </p>
                            </div>
                        </div>
                    )}
                </GlassCard>

                {/* Results Section */}
                {result && (
                    <>
                        {/* Performance Metrics Cards */}
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
                            <GlassCard variant="frosted" className="p-4">
                                <div className="flex items-center gap-2 text-slate-400 mb-2">
                                    <TrendingUp className="h-4 w-4" />
                                    <span className="text-xs">Total Return</span>
                                </div>
                                <p className={`text-2xl font-bold ${result.metrics.total_return >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                    {formatPercent(result.metrics.total_return)}
                                </p>
                            </GlassCard>

                            <GlassCard variant="frosted" className="p-4">
                                <div className="flex items-center gap-2 text-slate-400 mb-2">
                                    <Activity className="h-4 w-4" />
                                    <span className="text-xs">CAGR</span>
                                </div>
                                <p className={`text-2xl font-bold ${result.metrics.cagr >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                    {formatPercent(result.metrics.cagr)}
                                </p>
                            </GlassCard>

                            <GlassCard variant="frosted" className="p-4">
                                <div className="flex items-center gap-2 text-slate-400 mb-2">
                                    <Award className="h-4 w-4" />
                                    <span className="text-xs">Sharpe Ratio</span>
                                </div>
                                <p className="text-2xl font-bold text-purple-400">
                                    {result.metrics.sharpe_ratio.toFixed(2)}
                                </p>
                            </GlassCard>

                            <GlassCard variant="frosted" className="p-4">
                                <div className="flex items-center gap-2 text-slate-400 mb-2">
                                    <TrendingDown className="h-4 w-4" />
                                    <span className="text-xs">Max Drawdown</span>
                                </div>
                                <p className="text-2xl font-bold text-red-400">
                                    {formatPercent(-result.metrics.max_drawdown)}
                                </p>
                            </GlassCard>

                            <GlassCard variant="frosted" className="p-4">
                                <div className="flex items-center gap-2 text-slate-400 mb-2">
                                    <Target className="h-4 w-4" />
                                    <span className="text-xs">Win Rate</span>
                                </div>
                                <p className="text-2xl font-bold text-sky-400">
                                    {formatPercent(result.metrics.win_rate)}
                                </p>
                            </GlassCard>

                            <GlassCard variant="frosted" className="p-4">
                                <div className="flex items-center gap-2 text-slate-400 mb-2">
                                    <BarChart3 className="h-4 w-4" />
                                    <span className="text-xs">Total Trades</span>
                                </div>
                                <p className="text-2xl font-bold text-white">
                                    {result.metrics.total_trades}
                                </p>
                            </GlassCard>
                        </div>

                        {/* Equity Curve Chart */}
                        <GlassCard className="mb-6" variant="frosted">
                            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                <TrendingUp className="h-5 w-5 text-green-400" />
                                Equity Curve
                            </h3>
                            <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={result.equity_curve}>
                                        <defs>
                                            <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                        <XAxis
                                            dataKey="timestamp"
                                            stroke="#94a3b8"
                                            tick={{ fill: '#94a3b8', fontSize: 12 }}
                                            tickFormatter={(value) => new Date(value).toLocaleDateString()}
                                        />
                                        <YAxis
                                            stroke="#94a3b8"
                                            tick={{ fill: '#94a3b8', fontSize: 12 }}
                                            tickFormatter={(value) => formatCurrency(value)}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                                                border: '1px solid rgba(148, 163, 184, 0.2)',
                                                borderRadius: '8px',
                                                color: '#fff'
                                            }}
                                            labelFormatter={(value) => new Date(value).toLocaleDateString()}
                                            formatter={(value: number | undefined) => value !== undefined ? [formatCurrency(value), 'Portfolio Value'] : ['', '']}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="equity"
                                            stroke="#8b5cf6"
                                            strokeWidth={2}
                                            fill="url(#equityGradient)"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </GlassCard>

                        {/* Trade Log */}
                        <GlassCard variant="frosted">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                    <Clock className="h-5 w-5 text-blue-400" />
                                    Trade Log ({result.trade_log.length} trades)
                                </h3>
                                <button className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-2">
                                    <Download className="h-4 w-4" />
                                    Export CSV
                                </button>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-white/10">
                                            <th className="text-left text-xs font-medium text-slate-400 pb-3">Entry</th>
                                            <th className="text-left text-xs font-medium text-slate-400 pb-3">Exit</th>
                                            <th className="text-right text-xs font-medium text-slate-400 pb-3">Entry Price</th>
                                            <th className="text-right text-xs font-medium text-slate-400 pb-3">Exit Price</th>
                                            <th className="text-right text-xs font-medium text-slate-400 pb-3">Quantity</th>
                                            <th className="text-right text-xs font-medium text-slate-400 pb-3">P&L</th>
                                            <th className="text-right text-xs font-medium text-slate-400 pb-3">Return %</th>
                                            <th className="text-right text-xs font-medium text-slate-400 pb-3">Days</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {result.trade_log.map((trade, index) => (
                                            <tr key={index} className="border-b border-white/5 hover:bg-white/5">
                                                <td className="py-3 text-sm text-slate-300">
                                                    {new Date(trade.entry_date).toLocaleDateString()}
                                                </td>
                                                <td className="py-3 text-sm text-slate-300">
                                                    {new Date(trade.exit_date).toLocaleDateString()}
                                                </td>
                                                <td className="py-3 text-sm text-slate-300 text-right">
                                                    {formatCurrency(trade.entry_price)}
                                                </td>
                                                <td className="py-3 text-sm text-slate-300 text-right">
                                                    {formatCurrency(trade.exit_price)}
                                                </td>
                                                <td className="py-3 text-sm text-slate-300 text-right">
                                                    {trade.quantity}
                                                </td>
                                                <td className={`py-3 text-sm font-medium text-right ${trade.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                    {formatCurrency(trade.pnl)}
                                                </td>
                                                <td className={`py-3 text-sm font-medium text-right ${trade.pnl_percent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                    {formatPercent(trade.pnl_percent)}
                                                </td>
                                                <td className="py-3 text-sm text-slate-300 text-right">
                                                    {trade.holding_days}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </GlassCard>
                    </>
                )}

                {/* Empty State */}
                {!result && !error && (
                    <GlassCard variant="frosted" className="text-center py-16">
                        <BarChart3 className="h-16 w-16 text-slate-600 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-slate-300 mb-2">
                            No Backtest Results Yet
                        </h3>
                        <p className="text-slate-400">
                            Configure your backtest parameters above and click "Run Backtest" to get started
                        </p>
                    </GlassCard>
                )}
            </div>
        </div>
    );
}
