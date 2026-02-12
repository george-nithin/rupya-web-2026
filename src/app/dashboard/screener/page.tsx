"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { CustomScreenerBuilder } from "@/features/screener/components/CustomScreenerBuilder";
import { Search, TrendingUp, TrendingDown, Zap, Target, Filter, Plus, Play } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface ScreenerConfig {
    id: string;
    name: string;
    description: string;
    source: string;
    is_default: boolean;
}

interface StockResult {
    symbol: string;
    last_price: number;
    change: number;
    percent_change: number;
    volume: number;
    market_cap?: number;
}

interface FilterCondition {
    id: string;
    field: string;
    operator: string;
    value: string;
}

const defaultScreeners = [
    {
        id: 'top-gainers',
        name: '🚀 Top Gainers',
        description: 'Stocks with highest % gain today',
        icon: TrendingUp,
        color: 'green'
    },
    {
        id: 'top-losers',
        name: '📉 Top Losers',
        description: 'Stocks with highest % loss today',
        icon: TrendingDown,
        color: 'red'
    },
    {
        id: '52w-high',
        name: '🎯 Near 52W High',
        description: 'Stocks near their 52-week high',
        icon: Target,
        color: 'purple'
    },
    {
        id: 'high-volume',
        name: '⚡ High Volume',
        description: 'Stocks with unusually high volume',
        icon: Zap,
        color: 'orange'
    },
    {
        id: 'breakout',
        name: '💥 Breakout Stocks',
        description: 'Stocks breaking resistance levels',
        icon: TrendingUp,
        color: 'sky'
    },
    {
        id: 'momentum',
        name: '🔥 Momentum Stocks',
        description: 'Strong momentum with high RSI',
        icon: Zap,
        color: 'yellow'
    },
];

export default function ScreenerPage() {
    const [activeScreener, setActiveScreener] = useState<string | null>(null);
    const [results, setResults] = useState<StockResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [showCustomBuilder, setShowCustomBuilder] = useState(false);

    const runScreener = async (screenerId: string) => {
        setActiveScreener(screenerId);
        setLoading(true);

        try {
            // Different queries based on screener type
            let query = supabase.from('market_equity_quotes').select('*');

            switch (screenerId) {
                case 'top-gainers':
                    query = query.order('percent_change', { ascending: false }).limit(20);
                    break;
                case 'top-losers':
                    query = query.order('percent_change', { ascending: true }).limit(20);
                    break;
                case '52w-high':
                    // Stocks within 5% of 52W high
                    query = query.gte('last_price', supabase.rpc('last_price * 0.95')).limit(20);
                    break;
                case 'high-volume':
                    query = query.order('total_traded_volume', { ascending: false }).limit(20);
                    break;
                case 'breakout':
                    query = query.gt('percent_change', 3).order('percent_change', { ascending: false }).limit(20);
                    break;
                case 'momentum':
                    query = query.gt('percent_change', 2).order('total_traded_volume', { ascending: false }).limit(20);
                    break;
            }

            const { data } = await query;

            if (data) {
                setResults(data.map(item => ({
                    symbol: item.symbol,
                    last_price: item.last_price,
                    change: item.change,
                    percent_change: item.percent_change,
                    volume: item.total_traded_volume,
                    market_cap: item.market_cap
                })));
            }
        } catch (error) {
            console.error('Error running screener:', error);
        } finally {
            setLoading(false);
        }
    };

    const runCustomScreener = async (conditions: FilterCondition[]) => {
        setActiveScreener('custom');
        setLoading(true);

        try {
            let query = supabase.from('market_equity_quotes').select('*');

            // Apply each filter condition
            conditions.forEach(condition => {
                const value = isNaN(Number(condition.value)) ? condition.value : Number(condition.value);

                switch (condition.operator) {
                    case 'gt':
                        query = query.gt(condition.field, value);
                        break;
                    case 'gte':
                        query = query.gte(condition.field, value);
                        break;
                    case 'lt':
                        query = query.lt(condition.field, value);
                        break;
                    case 'lte':
                        query = query.lte(condition.field, value);
                        break;
                    case 'eq':
                        query = query.eq(condition.field, value);
                        break;
                    case 'like':
                        query = query.ilike(condition.field, `%${value}%`);
                        break;
                }
            });

            query = query.limit(50);

            const { data } = await query;

            if (data) {
                setResults(data.map(item => ({
                    symbol: item.symbol,
                    last_price: item.last_price,
                    change: item.change,
                    percent_change: item.percent_change,
                    volume: item.total_traded_volume,
                    market_cap: item.market_cap
                })));
            }
        } catch (error) {
            console.error('Error running custom screener:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Stock Screener</h1>
                    <p className="text-muted-foreground">Discover trading opportunities with preset and custom screeners</p>
                </div>
                <GlassButton
                    onClick={() => setShowCustomBuilder(!showCustomBuilder)}
                    variant="primary"
                >
                    <Plus className="h-5 w-5 mr-2" />
                    Custom Screener
                </GlassButton>
            </div>

            {/* Preset Screeners Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {defaultScreeners.map((screener) => {
                    const Icon = screener.icon;
                    const isActive = activeScreener === screener.id;

                    return (
                        <GlassCard
                            key={screener.id}
                            className={`cursor-pointer transition-all hover:scale-[1.02] ${isActive ? 'ring-2 ring-sky-500 bg-sky-500/10' : 'hover:bg-white/10'
                                }`}
                            onClick={() => runScreener(screener.id)}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex items-start gap-3">
                                    <div className={`p-3 rounded-xl bg-${screener.color}-500/10`}>
                                        <Icon className={`h-6 w-6 text-${screener.color}-400`} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-foreground mb-1">
                                            {screener.name}
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            {screener.description}
                                        </p>
                                    </div>
                                </div>
                                <GlassButton
                                    size="sm"
                                    variant={isActive ? "primary" : "secondary"}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        runScreener(screener.id);
                                    }}
                                >
                                    <Play className="h-5 w-5" />
                                </GlassButton>
                            </div>
                        </GlassCard>
                    );
                })}
            </div>

            {/* Custom Screener Builder */}
            {showCustomBuilder && (
                <CustomScreenerBuilder
                    onRun={runCustomScreener}
                    onSave={() => {
                        setShowCustomBuilder(false);
                    }}
                />
            )}

            {/* Results Table */}
            {activeScreener && (
                <GlassCard>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-foreground">
                                {defaultScreeners.find(s => s.id === activeScreener)?.name} Results
                            </h3>
                            <span className="text-sm text-muted-foreground">
                                {results.length} stocks found
                            </span>
                        </div>

                        {loading ? (
                            <div className="text-center py-12 text-muted-foreground">
                                <div className="animate-spin h-8 w-8 border-2 border-sky-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                                <p>Running screener...</p>
                            </div>
                        ) : results.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                <Search className="h-12 w-12 mx-auto mb-4 opacity-20" />
                                <p>No results found. Try a different screener.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-border">
                                            <th className="text-left text-sm font-medium text-muted-foreground pb-3">#</th>
                                            <th className="text-left text-sm font-medium text-muted-foreground pb-3">Symbol</th>
                                            <th className="text-right text-sm font-medium text-muted-foreground pb-3">Price</th>
                                            <th className="text-right text-sm font-medium text-muted-foreground pb-3">Change</th>
                                            <th className="text-right text-sm font-medium text-muted-foreground pb-3">% Change</th>
                                            <th className="text-right text-sm font-medium text-muted-foreground pb-3">Volume</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {results.map((stock, index) => (
                                            <tr
                                                key={stock.symbol}
                                                className="border-b border-border/50 hover:bg-card/20 transition-all duration-150 active:scale-95"
                                            >
                                                <td className="py-3 text-muted-foreground text-sm">{index + 1}</td>
                                                <td className="py-3">
                                                    <div className="font-medium text-foreground">{stock.symbol}</div>
                                                </td>
                                                <td className="py-3 text-right text-foreground">
                                                    ₹{stock.last_price?.toFixed(2)}
                                                </td>
                                                <td className={`py-3 text-right font-medium ${stock.change >= 0 ? 'text-green-400' : 'text-red-400'
                                                    }`}>
                                                    {stock.change >= 0 ? '+' : ''}{stock.change?.toFixed(2)}
                                                </td>
                                                <td className={`py-3 text-right font-medium ${stock.percent_change >= 0 ? 'text-green-400' : 'text-red-400'
                                                    }`}>
                                                    {stock.percent_change >= 0 ? '+' : ''}{stock.percent_change?.toFixed(2)}%
                                                </td>
                                                <td className="py-3 text-right text-muted-foreground text-sm">
                                                    {stock.volume?.toLocaleString('en-IN')}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </GlassCard>
            )}

            {/* Empty State */}
            {!activeScreener && !showCustomBuilder && (
                <GlassCard>
                    <div className="text-center py-16 text-muted-foreground">
                        <Search className="h-16 w-16 mx-auto mb-4 opacity-20" />
                        <p className="text-lg font-medium mb-2">Select a screener to get started</p>
                        <p className="text-sm">
                            Choose from preset screeners above or create your own custom screener
                        </p>
                    </div>
                </GlassCard>
            )}
        </div>
    );
}
