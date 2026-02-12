'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { Calendar, TrendingUp, TrendingDown, Activity, DollarSign, Target, BarChart3, PlayCircle, Download, AlertCircle, Clock, Award, Code, Search } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { GlassCard } from '@/components/ui/GlassCard';
import { StockSearch } from '@/components/ui/StockSearch';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { useSearchParams } from 'next/navigation';
import { StrategyFilters, FilterState } from "@/features/strategy/components/StrategyFilters";

interface Strategy {
    id: string;
    name: string;
    description: string;
    type: 'predefined' | 'custom';
    capital_required?: number;
    tags?: string[];
    cagr?: number;
    win_rate?: number;
    max_drawdown?: number;
    code?: string;
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

function BacktestingContent() {
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
    const [filters, setFilters] = useState<FilterState>({
        margin: [],
        category: [],
        instruments: []
    });

    const isMarginMatch = (capital: number) => {
        if (filters.margin.length === 0) return true;
        return filters.margin.some((range: string) => {
            if (range === 'under-25k') return capital < 25000;
            if (range === '25k-1l') return capital >= 25000 && capital < 100000;
            if (range === '1l-2l') return capital >= 100000 && capital < 200000;
            if (range === 'above-2l') return capital >= 200000;
            return false;
        });
    };

    const isCategoryMatch = (tags: string[]) => {
        if (filters.category.length === 0) return true;
        return filters.category.some((cat: string) => tags.includes(cat));
    };

    const isInstrumentMatch = (name: string, description: string) => {
        if (filters.instruments.length === 0 || !filters.instruments[0]) return true;
        const search = filters.instruments[0].toLowerCase();
        return name.toLowerCase().includes(search) || description.toLowerCase().includes(search);
    };

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
                id: 'expanding_range_breakout',
                name: 'Momentum Option Buying',
                description: 'Captures volatility expansion with multi-timeframe confirmation',
                type: 'predefined',
                capital_required: 30000,
                tags: ['Options Buying', 'Breakout', 'Nifty'],
                code: `# Code included in backend`
            },
            {
                id: 'ma_crossover',
                name: 'Moving Average Crossover',
                description: 'Buy when fast MA crosses above slow MA, sell on opposite crossover',
                type: 'predefined',
                capital_required: 15000,
                tags: ['Trend', 'Technical', 'Equity'],
                code: `# Code included in backend`
            },
            {
                id: 'rsi_mean_reversion',
                name: 'RSI Mean Reversion',
                description: 'Buy when RSI < 30, sell when RSI > 70',
                type: 'predefined',
                capital_required: 25000,
                tags: ['Reversion', 'Technical', 'Equity'],
                code: `# Code included in backend`
            },
            {
                id: 'breakout',
                name: 'Breakout Strategy',
                description: 'Buy on 20-day high breakout with stop-loss and profit target',
                type: 'predefined',
                capital_required: 50000,
                tags: ['Breakout', 'Momentum', 'Equity'],
                code: `# Code included in backend`
            }
        ];

        // Fetch custom strategies from unified API
        try {
            const res = await fetch('/api/strategies');
            const apiStrategies = await res.json();

            if (Array.isArray(apiStrategies)) {
                // Map to Strategy interface
                const mappedCustom = apiStrategies
                    .filter((s: any) => s.type === 'custom' || s.source === 'playbook')
                    .map((s: any) => ({
                        id: s.id,
                        name: s.name,
                        description: s.description || 'Custom Strategy',
                        type: 'custom' as const,
                        capital_required: s.capital_required || 0,
                        tags: s.tags || (s.source === 'playbook' ? ['Playbook'] : []),
                        cagr: s.cagr,
                        win_rate: s.win_rate,
                        max_drawdown: s.max_drawdown,
                        code: s.code
                    }));

                // Combine with default strategies (avoid duplicates)
                const allStrategies = [...defaultStrategies, ...mappedCustom];
                setStrategies(allStrategies);

                // Initial selection logic
                const urlStrategy = searchParams.get('strategy');
                if (urlStrategy && allStrategies.some(s => s.id === urlStrategy)) {
                    setSelectedStrategy(urlStrategy);
                    const strategy = allStrategies.find(s => s.id === urlStrategy);
                    if (strategy?.type === 'custom') {
                        setStrategyTab('custom');
                    }
                } else if (!selectedStrategy) {
                    setSelectedStrategy(allStrategies[0]?.id || 'ma_crossover');
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
        <div className="min-h-screen bg-background p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-foreground mb-2 flex items-center gap-3">
                        <BarChart3 className="h-10 w-10 text-primary" />
                        Strategy Backtesting
                    </h1>
                    <p className="text-foreground/80">
                        Test your trading strategies on historical data and analyze performance
                    </p>
                </div>

                {/* Main Content with Sidebar */}
                <div className="flex gap-8">
                    {/* Filter Sidebar */}
                    <StrategyFilters
                        filters={filters}
                        setFilters={setFilters}
                        onClearAll={() => setFilters({ margin: [], category: [], instruments: [] })}
                    />

                    <div className="flex-1 space-y-6">
                        {/* Configuration Card */}
                        <GlassCard className="mb-6 p-6" variant="frosted">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                                    <PlayCircle className="h-5 w-5 text-sky-400" />
                                    Backtest Configuration
                                </h2>
                                <div className="text-xs text-slate-500 font-bold uppercase tracking-widest">
                                    {strategies.filter(s => s.type === strategyTab && isMarginMatch(s.capital_required || 0) && isCategoryMatch(s.tags || []) && isInstrumentMatch(s.name, s.description)).length} Strategies Available
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {/* Strategy Selection */}
                                <div className="md:col-span-2 lg:col-span-1">
                                    <label className="block text-sm font-medium text-slate-300 mb-2 uppercase tracking-wide text-[11px]">
                                        Strategy Selection
                                    </label>

                                    {/* Strategy Type Tabs */}
                                    <div className="flex bg-slate-900/50 p-1 rounded-xl mb-3 border border-white/5">
                                        <button
                                            onClick={() => setStrategyTab('predefined')}
                                            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${strategyTab === 'predefined'
                                                ? 'bg-sky-500 text-white shadow-lg'
                                                : 'text-slate-400 hover:text-white hover:bg-white/5'
                                                }`}
                                        >
                                            Predefined
                                        </button>
                                        <button
                                            onClick={() => setStrategyTab('custom')}
                                            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${strategyTab === 'custom'
                                                ? 'bg-sky-500 text-white shadow-lg'
                                                : 'text-slate-400 hover:text-white hover:bg-white/5'
                                                }`}
                                        >
                                            My Strategies
                                        </button>
                                    </div>

                                    <select
                                        value={selectedStrategy}
                                        onChange={(e) => setSelectedStrategy(e.target.value)}
                                        className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-sky-500 transition-all mb-2"
                                    >
                                        <option value="">Select a strategy</option>
                                        {strategies
                                            .filter(s => {
                                                const isTabMatch = s.type === strategyTab;
                                                const isMarginOk = isMarginMatch(s.capital_required || 0);
                                                const isCategoryOk = (s.tags && s.tags.length > 0) ? isCategoryMatch(s.tags) : true;
                                                const isSearchMatch = isInstrumentMatch(s.name, s.description);

                                                return isTabMatch && isMarginOk && isCategoryOk && isSearchMatch;
                                            })
                                            .map((strategy) => (
                                                <option key={strategy.id} value={strategy.id}>
                                                    {strategy.name}
                                                </option>
                                            ))}

                                    </select>

                                    {strategyTab === 'custom' && (
                                        <a
                                            href="/dashboard/strategies/create"
                                            className="text-xs text-sky-400 hover:text-sky-300 flex items-center justify-end gap-1 font-medium transition-colors"
                                        >
                                            + Create New Strategy
                                        </a>
                                    )}

                                    {selectedStrategy && (
                                        <p className="mt-3 text-xs text-slate-500 italic leading-relaxed">
                                            {strategies.find(s => s.id === selectedStrategy)?.description}
                                        </p>
                                    )}
                                </div>

                                {/* Symbol */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2 uppercase tracking-wide text-[11px]">
                                        Trading Symbol
                                    </label>
                                    <StockSearch
                                        initialValue={symbol}
                                        onSelect={(stock) => setSymbol(stock.symbol)}
                                        placeholder="Search symbol (e.g. RELIANCE)"
                                    />
                                </div>

                                {/* Initial Capital */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2 uppercase tracking-wide text-[11px]">
                                        Initial Capital (₹)
                                    </label>
                                    <input
                                        type="number"
                                        value={initialCapital}
                                        onChange={(e) => setInitialCapital(Number(e.target.value))}
                                        className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-sky-500 transition-all"
                                    />
                                </div>

                                {/* Start Date */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2 uppercase tracking-wide text-[11px]">
                                        Start Date
                                    </label>
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-sky-500 transition-all font-mono text-sm [color-scheme:dark]"
                                    />
                                </div>

                                {/* End Date */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2 uppercase tracking-wide text-[11px]">
                                        End Date
                                    </label>
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-sky-500 transition-all font-mono text-sm [color-scheme:dark]"
                                    />
                                </div>

                                {/* Run Button */}
                                <div className="flex items-end">
                                    <button
                                        onClick={runBacktest}
                                        disabled={isRunning}
                                        className="w-full bg-sky-500 hover:bg-sky-400 text-white font-bold py-2.5 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-sky-500/20 active:scale-[0.98]"
                                    >
                                        {isRunning ? (
                                            <>
                                                <Activity className="h-5 w-5 animate-spin" />
                                                Running Backtest...
                                            </>
                                        ) : (
                                            <>
                                                <PlayCircle className="h-5 w-5" />
                                                Run Simulation
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="mt-6 bg-red-500/5 border border-red-500/20 rounded-xl p-4 flex items-start gap-3">
                                    <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-red-400 font-bold text-sm uppercase tracking-tight">Technical Error</p>
                                        <p className="text-red-300/80 text-xs mt-1 leading-relaxed">{error}</p>
                                    </div>
                                </div>
                            )}
                        </GlassCard>

                        {/* Strategy Code Section */}
                        {selectedStrategy && (
                            <GlassCard className="mb-6 p-6" variant="frosted">
                                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                    <Code className="h-5 w-5 text-indigo-400" />
                                    Execution Logic
                                </h2>
                                <div className="bg-black/60 rounded-xl p-5 font-mono text-xs text-slate-300 overflow-x-auto max-h-96 border border-white/5 scrollbar-thin scrollbar-thumb-white/10">
                                    <pre>
                                        <code>
                                            {strategies.find(s => s.id === selectedStrategy)?.code || '# No execution logic available for this model'}
                                        </code>
                                    </pre>
                                </div>
                            </GlassCard>
                        )}
                    </div>
                </div>


                {/* Results Section */}
                {result && (
                    <>
                        {/* Performance Metrics Cards */}
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
                            <GlassCard variant="frosted" className="p-4">
                                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                                    <TrendingUp className="h-5 w-5" />
                                    <span className="text-xs">Total Return</span>
                                </div>
                                <p className={`text-2xl font-bold ${result.metrics.total_return >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                    {formatPercent(result.metrics.total_return)}
                                </p>
                            </GlassCard>

                            <GlassCard variant="frosted" className="p-4">
                                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                                    <Activity className="h-5 w-5" />
                                    <span className="text-xs">CAGR</span>
                                </div>
                                <p className={`text-2xl font-bold ${result.metrics.cagr >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                    {formatPercent(result.metrics.cagr)}
                                </p>
                            </GlassCard>

                            <GlassCard variant="frosted" className="p-4">
                                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                                    <Award className="h-5 w-5" />
                                    <span className="text-xs">Sharpe Ratio</span>
                                </div>
                                <p className="text-2xl font-bold text-purple-400">
                                    {result.metrics.sharpe_ratio.toFixed(2)}
                                </p>
                            </GlassCard>

                            <GlassCard variant="frosted" className="p-4">
                                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                                    <TrendingDown className="h-5 w-5" />
                                    <span className="text-xs">Max Drawdown</span>
                                </div>
                                <p className="text-2xl font-bold text-red-400">
                                    {formatPercent(-result.metrics.max_drawdown)}
                                </p>
                            </GlassCard>

                            <GlassCard variant="frosted" className="p-4">
                                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                                    <Target className="h-5 w-5" />
                                    <span className="text-xs">Win Rate</span>
                                </div>
                                <p className="text-2xl font-bold text-sky-400">
                                    {formatPercent(result.metrics.win_rate)}
                                </p>
                            </GlassCard>

                            <GlassCard variant="frosted" className="p-4">
                                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                                    <BarChart3 className="h-5 w-5" />
                                    <span className="text-xs">Total Trades</span>
                                </div>
                                <p className="text-2xl font-bold text-foreground">
                                    {result.metrics.total_trades}
                                </p>
                            </GlassCard>
                        </div>

                        {/* Equity Curve Chart */}
                        <GlassCard className="mb-6" variant="frosted">
                            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
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
                                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                                    <Clock className="h-5 w-5 text-blue-400" />
                                    Trade Log ({result.trade_log.length} trades)
                                </h3>
                                <button className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-2">
                                    <Download className="h-5 w-5" />
                                    Export CSV
                                </button>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-border">
                                            <th className="text-left text-xs font-medium text-muted-foreground pb-3">Entry</th>
                                            <th className="text-left text-xs font-medium text-muted-foreground pb-3">Exit</th>
                                            <th className="text-right text-xs font-medium text-muted-foreground pb-3">Entry Price</th>
                                            <th className="text-right text-xs font-medium text-muted-foreground pb-3">Exit Price</th>
                                            <th className="text-right text-xs font-medium text-muted-foreground pb-3">Quantity</th>
                                            <th className="text-right text-xs font-medium text-muted-foreground pb-3">P&L</th>
                                            <th className="text-right text-xs font-medium text-muted-foreground pb-3">Return %</th>
                                            <th className="text-right text-xs font-medium text-muted-foreground pb-3">Days</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {result.trade_log.map((trade, index) => (
                                            <tr key={index} className="border-b border-border/50 hover:bg-card/20 active:scale-95">
                                                <td className="py-3 text-sm text-foreground/80">
                                                    {new Date(trade.entry_date).toLocaleDateString()}
                                                </td>
                                                <td className="py-3 text-sm text-foreground/80">
                                                    {new Date(trade.exit_date).toLocaleDateString()}
                                                </td>
                                                <td className="py-3 text-sm text-foreground/80 text-right">
                                                    {formatCurrency(trade.entry_price)}
                                                </td>
                                                <td className="py-3 text-sm text-foreground/80 text-right">
                                                    {formatCurrency(trade.exit_price)}
                                                </td>
                                                <td className="py-3 text-sm text-foreground/80 text-right">
                                                    {trade.quantity}
                                                </td>
                                                <td className={`py-3 text-sm font-medium text-right ${trade.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                    {formatCurrency(trade.pnl)}
                                                </td>
                                                <td className={`py-3 text-sm font-medium text-right ${trade.pnl_percent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                    {formatPercent(trade.pnl_percent)}
                                                </td>
                                                <td className="py-3 text-sm text-foreground/80 text-right">
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
                        <h3 className="text-xl font-semibold text-foreground/80 mb-2">
                            No Backtest Results Yet
                        </h3>
                        <p className="text-muted-foreground">
                            Configure your backtest parameters above and click "Run Backtest" to get started
                        </p>
                    </GlassCard>
                )}
            </div>
        </div>
    );
}

export default function BacktestingPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-background p-6 flex items-center justify-center">
                <Activity className="h-8 w-8 text-primary animate-spin" />
            </div>
        }>
            <BacktestingContent />
        </Suspense>
    );
}
