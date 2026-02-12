"use client";

import { useState, useEffect } from "react";
import { AlgoStrategyCard } from "./AlgoStrategyCard";
import { AlgoStrategy } from "../types";
import { supabase } from "@/lib/supabase";
import { Search } from "lucide-react";
import { StrategyFilters, FilterState } from "@/features/strategy/components/StrategyFilters";

const PREDEFINED_STRATEGIES: AlgoStrategy[] = [
    {
        id: "expanding_range_breakout",
        name: "Momentum Option Buying",
        description: "Captures volatility expansion with multi-timeframe confirmation.",
        manager_name: "Rupya Core",
        risk_level: "High",
        capital_required: 30000,
        min_amount: 30000,
        max_amount: 5000000,
        tags: ["Options Buying", "Breakout", "Nifty"],
        cagr: 42.5,
        win_rate: 55.0,
        max_drawdown: -18.5,
        created_at: new Date().toISOString()
    },
    {
        id: "nifty_short_strangle",
        name: "Nifty Short Strangle",
        description: "Standard delta-neutral strategy for low volatility periods.",
        manager_name: "Rupya Core",
        risk_level: "High",
        capital_required: 250000,
        min_amount: 250000,
        max_amount: 5000000,
        tags: ["Options Selling", "Intraday", "Nifty"],
        cagr: 18.5,
        win_rate: 68.0,
        max_drawdown: -8.5,
        created_at: new Date().toISOString()
    },
    {
        id: "ma_crossover",
        name: "Moving Average Crossover",
        description: "Classic trend following using fast/slow MA crossover.",
        manager_name: "Rupya Core",
        risk_level: "Low",
        capital_required: 15000,
        min_amount: 10000,
        max_amount: 1000000,
        tags: ["Trend", "Technical", "Equity"],
        cagr: 15.5,
        win_rate: 45.0,
        max_drawdown: -12.0,
        created_at: new Date().toISOString()
    },
    {
        id: "rsi_mean_reversion",
        name: "RSI Mean Reversion",
        description: "Buy oversold (RSI < 30), sell overbought (RSI > 70).",
        manager_name: "Rupya Core",
        risk_level: "Medium",
        capital_required: 25000,
        min_amount: 10000,
        max_amount: 500000,
        tags: ["Reversion", "Technical", "Swing"],
        cagr: 22.1,
        win_rate: 65.0,
        max_drawdown: -15.5,
        created_at: new Date().toISOString()
    },
    {
        id: "breakout",
        name: "Breakout Strategy",
        description: "Captures strong moves breaking 20-day highs.",
        manager_name: "Rupya Core",
        risk_level: "High",
        capital_required: 50000,
        min_amount: 25000,
        max_amount: 1000000,
        tags: ["Breakout", "Momentum", "Equity"],
        cagr: 35.0,
        win_rate: 40.0,
        max_drawdown: -25.0,
        created_at: new Date().toISOString()
    },
    {
        id: "buy_and_hold",
        name: "Buy and Hold",
        description: "Passive investing: Buy once and hold forever.",
        manager_name: "Rupya Core",
        risk_level: "Low",
        capital_required: 5000,
        min_amount: 1000,
        max_amount: 10000000,
        tags: ["Passive", "Long Term", "Others"],
        cagr: 12.0,
        win_rate: 100.0,
        max_drawdown: -20.0,
        created_at: new Date().toISOString()
    }
];

const MOCK_FALLBACK_STRATEGIES: AlgoStrategy[] = [
    {
        id: "mock-1",
        name: "Credit Spread PE",
        description: "A smart market shock absorber that profits from turbulence.",
        manager_name: "Stratzy",
        risk_level: "High",
        capital_required: 45000,
        min_amount: 45000,
        max_amount: 320000,
        tags: ["Nifty", "Hedged", "Options Selling"],
        cagr: 205.69,
        win_rate: 66.67,
        max_drawdown: -20.27,
        created_at: new Date().toISOString()
    }
];

export function AlgoStrategyList() {
    const [strategies, setStrategies] = useState<AlgoStrategy[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState<FilterState>({
        margin: [],
        category: [],
        instruments: []
    });

    useEffect(() => {
        fetchStrategies();
    }, []);

    const fetchStrategies = async () => {
        try {
            const { data, error } = await supabase
                .from('algo_strategies')
                .select('*');

            if (error) throw error;

            const customStrategies = (data && data.length > 0) ? data : MOCK_FALLBACK_STRATEGIES;
            setStrategies([...PREDEFINED_STRATEGIES, ...customStrategies]);

        } catch (e) {
            console.error("Error fetching strategies:", e);
            setStrategies([...PREDEFINED_STRATEGIES, ...MOCK_FALLBACK_STRATEGIES]);
        } finally {
            setLoading(false);
        }
    };

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

    const filteredStrategies = strategies.filter((s: AlgoStrategy) => {
        const searchTerm = filters.instruments[0] || "";
        const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.manager_name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesMargin = isMarginMatch(s.capital_required || s.min_amount || 0);
        const matchesCategory = isCategoryMatch(s.tags || []);
        return matchesSearch && matchesMargin && matchesCategory;
    });

    return (
        <div className="flex gap-8">
            <StrategyFilters
                filters={filters}
                setFilters={setFilters}
                onClearAll={() => setFilters({ margin: [], category: [], instruments: [] })}
            />

            <div className="flex-1 space-y-6">
                <div className="flex justify-between items-center mb-8">
                    <div className="text-sm font-medium text-slate-400">
                        {filteredStrategies.length} Strategies Available
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-500 uppercase tracking-widest font-bold">Show by</span>
                        <select className="bg-slate-900 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500 transition-colors">
                            <option>10</option>
                            <option>20</option>
                            <option>50</option>
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-[280px] rounded-2xl bg-card/10 animate-pulse border border-white/5" />
                        ))}
                    </div>
                ) : (
                    <>
                        {filteredStrategies.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 gap-6">
                                {filteredStrategies.map(strategy => (
                                    <AlgoStrategyCard key={strategy.id} strategy={strategy} />
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-24 text-center">
                                <div className="h-20 w-20 rounded-full bg-slate-900/50 flex items-center justify-center mb-6 border border-white/5">
                                    <Search className="w-8 h-8 text-slate-600" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">No Strategies Available</h3>
                                <p className="text-slate-400 max-w-xs mx-auto">
                                    Try refining your search results or removing some filters
                                </p>
                                <button
                                    onClick={() => setFilters({ margin: [], category: [], instruments: [] })}
                                    className="mt-6 px-6 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors border border-white/10"
                                >
                                    Clear Filters
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

