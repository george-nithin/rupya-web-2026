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

interface SavedScreener {
    id: string;
    name: string;
    filters: any;
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

// Utility for formatting volume in Lakhs
const formatInLakhs = (num: number) => {
    if (!num) return "0";
    if (num >= 100000) {
        return (num / 100000).toFixed(1) + "L";
    }
    return num.toLocaleString('en-IN');
};

export default function ScreenerPage() {
    const [activeTab, setActiveTab] = useState<'presets' | 'saved'>('presets');
    const [savedScreeners, setSavedScreeners] = useState<SavedScreener[]>([]);
    const [activeScreener, setActiveScreener] = useState<string | null>(null);
    const [results, setResults] = useState<StockResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [showCustomBuilder, setShowCustomBuilder] = useState(false);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [currentConditions, setCurrentConditions] = useState<FilterCondition[] | null>(null);
    const pageSize = 20;

    useEffect(() => {
        if (activeTab === 'saved') {
            fetchSavedScreeners();
        }
    }, [activeTab]);

    const fetchSavedScreeners = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data } = await supabase
                .from('screener_configs')
                .select('*')
                .eq('created_by', user.id);

            if (data) setSavedScreeners(data);
        } catch (error) {
            console.error("Error fetching saved screeners:", error);
        }
    };

    const runScreener = async (screenerId: string, page = 1) => {
        setResults([]); // Clear previous results to avoid confusion
        setTotalCount(0);
        setActiveScreener(screenerId);
        setCurrentPage(page);
        setCurrentConditions(null);
        setLoading(true);

        try {
            // Different queries based on screener type
            let query = supabase.from('market_equity_quotes').select('*', { count: 'exact' });

            switch (screenerId) {
                case 'top-gainers':
                    query = query.order('percent_change', { ascending: false });
                    break;
                case 'top-losers':
                    query = query.order('percent_change', { ascending: true });
                    break;
                case '52w-high':
                    // Note: Ideally this should be an RPC if comparing columns, 
                    // but for now let's just use a high threshold or gte a static value
                    // if we can't do column vs column easily in a single query.
                    // Actually, let's just fetch everything and sort or filter by year_high if columns are known.
                    query = query.not('year_high', 'is', null).order('percent_change', { ascending: false });
                    break;
                case 'high-volume':
                    query = query.order('total_traded_volume', { ascending: false });
                    break;
                case 'breakout':
                    query = query.gt('percent_change', 3).order('percent_change', { ascending: false });
                    break;
                case 'momentum':
                    query = query.gt('percent_change', 2).order('total_traded_volume', { ascending: false });
                    break;
            }

            const from = (page - 1) * pageSize;
            const to = from + pageSize - 1;

            let { data, count, error } = await query.range(from, to);

            if (error) throw error;

            if (screenerId === '52w-high' && data) {
                // Manual filtering for 52W High since Supabase URL filters don't support col >= col * 0.95
                data = data.filter(item => item.last_price >= item.year_high * 0.98);
            }

            if (count !== null) setTotalCount(count);

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

    const runCustomScreener = async (conditions: FilterCondition[], page = 1) => {
        setResults([]);
        setTotalCount(0);
        setActiveScreener('custom');
        setCurrentPage(page);
        setCurrentConditions(conditions);
        setLoading(true);

        try {
            let query = supabase.from('market_equity_quotes').select('*', { count: 'exact' });

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

            const from = (page - 1) * pageSize;
            const to = from + pageSize - 1;

            const { data, count, error } = await query.range(from, to);

            if (error) throw error;

            if (count !== null) setTotalCount(count);

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

            {/* Tab Switcher */}
            <div className="flex gap-2 p-1 bg-white/5 border border-white/5 rounded-2xl w-fit">
                <button
                    onClick={() => setActiveTab('presets')}
                    className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'presets' ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/20' : 'text-white/40 hover:text-white/60'
                        }`}
                >
                    Preset Screeners
                </button>
                <button
                    onClick={() => setActiveTab('saved')}
                    className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'saved' ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/20' : 'text-white/40 hover:text-white/60'
                        }`}
                >
                    Saved Custom Screeners
                </button>
            </div>

            {/* Preset Screeners Grid */}
            {activeTab === 'presets' && (
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
            )}

            {/* Saved Custom Screeners List */}
            {activeTab === 'saved' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {savedScreeners.length === 0 ? (
                        <GlassCard className="col-span-full py-20 text-center">
                            <Filter className="h-12 w-12 mx-auto mb-4 opacity-10" />
                            <p className="text-sm font-bold text-white/40 uppercase tracking-widest">No saved screeners found</p>
                            <p className="text-xs text-white/20 mt-2">Build and save a custom screener to see it here</p>
                        </GlassCard>
                    ) : (
                        savedScreeners.map((screener) => {
                            const isActive = activeScreener === screener.id;
                            return (
                                <GlassCard
                                    key={screener.id}
                                    className={`cursor-pointer transition-all hover:scale-[1.02] ${isActive ? 'ring-2 ring-sky-500 bg-sky-500/10' : 'hover:bg-white/10'}`}
                                    onClick={() => {
                                        // Convert filters JSON back to FilterCondition array if possible
                                        // or handle custom parsing logic
                                        const conditions = Object.entries(screener.filters).map(([field, filter]: [string, any]) => ({
                                            id: Math.random().toString(),
                                            field,
                                            operator: filter.operator,
                                            value: filter.value.toString()
                                        }));
                                        runCustomScreener(conditions);
                                        setActiveScreener(screener.id);
                                    }}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start gap-3">
                                            <div className="p-3 rounded-xl bg-sky-500/10 text-sky-400">
                                                <Target className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-semibold text-foreground mb-1">{screener.name}</h3>
                                                <p className="text-[10px] font-black uppercase text-white/40 tracking-wider">Custom Strategy</p>
                                            </div>
                                        </div>
                                        <Play className={`h-5 w-5 ${isActive ? 'text-sky-400' : 'text-white/20'}`} />
                                    </div>
                                </GlassCard>
                            );
                        })
                    )}
                </div>
            )}

            {/* Custom Screener Builder */}
            {showCustomBuilder && (
                <CustomScreenerBuilder
                    onRun={runCustomScreener}
                    onSave={() => {
                        setShowCustomBuilder(false);
                        fetchSavedScreeners();
                    }}
                />
            )}

            {/* Results Table */}
            {activeScreener && (
                <GlassCard>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-foreground uppercase tracking-tight">
                                {activeTab === 'presets' ? defaultScreeners.find(s => s.id === activeScreener)?.name : savedScreeners.find(s => s.id === activeScreener)?.name} Results
                            </h3>
                            <span className="text-[10px] font-black uppercase bg-sky-500/20 text-sky-400 px-3 py-1 rounded-full border border-sky-500/10 tracking-widest">
                                {totalCount} stocks found
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
                            <div className="space-y-6">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-white/5">
                                                <th className="text-left text-[10px] font-black text-white/40 uppercase tracking-widest pb-3 pl-2">#</th>
                                                <th className="text-left text-[10px] font-black text-white/40 uppercase tracking-widest pb-3">Symbol</th>
                                                <th className="text-right text-[10px] font-black text-white/40 uppercase tracking-widest pb-3">Price</th>
                                                <th className="text-right text-[10px] font-black text-white/40 uppercase tracking-widest pb-3">Change</th>
                                                <th className="text-right text-[10px] font-black text-white/40 uppercase tracking-widest pb-3">% Change</th>
                                                <th className="text-right text-[10px] font-black text-white/40 uppercase tracking-widest pb-3 pr-2">Volume (L)</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {results.map((stock, index) => (
                                                <tr
                                                    key={stock.symbol}
                                                    className="border-b border-white/5 hover:bg-white/5 transition-all duration-150 group"
                                                >
                                                    <td className="py-4 text-white/20 text-[10px] font-mono pl-2">{(currentPage - 1) * pageSize + index + 1}</td>
                                                    <td className="py-4">
                                                        <div className="font-black text-xs md:text-sm text-foreground group-hover:text-sky-400 transition-colors">{stock.symbol}</div>
                                                    </td>
                                                    <td className="py-4 text-right font-mono text-xs text-foreground font-semibold">
                                                        ₹{stock.last_price?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                    </td>
                                                    <td className={`py-4 text-right font-black text-xs ${stock.change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                                        {stock.change >= 0 ? '+' : ''}{stock.change?.toFixed(2)}
                                                    </td>
                                                    <td className={`py-4 text-right font-black text-xs ${stock.percent_change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                                        {stock.percent_change >= 0 ? '+' : ''}{stock.percent_change?.toFixed(2)}%
                                                    </td>
                                                    <td className="py-4 text-right text-sky-400/60 font-black text-xs pr-2">
                                                        {formatInLakhs(stock.volume)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination Controls */}
                                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                    <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">
                                        Showing <span className="text-white">{(currentPage - 1) * pageSize + 1}</span> to <span className="text-white">{Math.min(currentPage * pageSize, totalCount)}</span> of <span className="text-white">{totalCount}</span>
                                    </p>
                                    <div className="flex gap-2">
                                        <GlassButton
                                            size="sm"
                                            onClick={() => {
                                                if (activeScreener === 'custom' || activeTab === 'saved') {
                                                    if (currentConditions) runCustomScreener(currentConditions, currentPage - 1);
                                                } else if (activeScreener) {
                                                    runScreener(activeScreener, currentPage - 1);
                                                }
                                            }}
                                            disabled={currentPage === 1 || loading}
                                        >
                                            Prev
                                        </GlassButton>
                                        <div className="flex items-center px-4 rounded-xl bg-white/5 border border-white/5 text-[10px] font-black text-white/40 uppercase tracking-widest">
                                            {currentPage} / {Math.ceil(totalCount / pageSize)}
                                        </div>
                                        <GlassButton
                                            size="sm"
                                            onClick={() => {
                                                if (activeScreener === 'custom' || activeTab === 'saved') {
                                                    if (currentConditions) runCustomScreener(currentConditions, currentPage + 1);
                                                } else if (activeScreener) {
                                                    runScreener(activeScreener, currentPage + 1);
                                                }
                                            }}
                                            disabled={currentPage * pageSize >= totalCount || loading}
                                        >
                                            Next
                                        </GlassButton>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </GlassCard>
            )}

            {/* Empty State */}
            {!activeScreener && !showCustomBuilder && (
                <GlassCard>
                    <div className="text-center py-24">
                        <div className="h-20 w-20 bg-sky-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6 transform rotate-12">
                            <Search className="h-10 w-10 text-sky-400 transform -rotate-12" />
                        </div>
                        <h2 className="text-xl font-black text-foreground uppercase tracking-tight mb-2">Initialize Scanner</h2>
                        <p className="text-sm text-white/40 uppercase tracking-widest font-bold max-w-xs mx-auto">
                            Pick a preset or run your saved filters to decode market signals
                        </p>
                    </div>
                </GlassCard>
            )}
        </div>
    );
}
