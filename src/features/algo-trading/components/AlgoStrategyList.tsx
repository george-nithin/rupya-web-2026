"use client";

import { useState, useEffect } from "react";
import { AlgoStrategyCard } from "./AlgoStrategyCard";
import { AlgoStrategy } from "../types";
import { supabase } from "@/lib/supabase";
import { Search, Filter } from "lucide-react";
import { GlassInput } from "@/components/ui/GlassInput";

// Mock data for initial development/fallback
const MOCK_STRATEGIES: AlgoStrategy[] = [
    {
        id: "ma_crossover",
        name: "Moving Average Crossover",
        description: "Classic trend following using fast/slow MA crossover.",
        manager_name: "Rupya Core",
        risk_level: "Low",
        capital_required: 10000,
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
        tags: ["Breakout", "Momentum", "High Volatility"],
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
        tags: ["Passive", "Long Term", "Investment"],
        cagr: 12.0,
        win_rate: 100.0,
        max_drawdown: -20.0,
        created_at: new Date().toISOString()
    },
    {
        id: "mock-1",
        name: "Damper Credit Spread",
        description: "A smart market shock absorber that profits from turbulence.",
        manager_name: "Stratzy",
        risk_level: "High",
        capital_required: 100000,
        min_amount: 100000,
        max_amount: 320000,
        tags: ["Nifty", "Hedged", "Directional"],
        cagr: 205.69,
        win_rate: 66.67,
        max_drawdown: -20.27,
        created_at: new Date().toISOString()
    },
    // ... other mocks can remain or be removed if too many
];

export function AlgoStrategyList() {
    const [strategies, setStrategies] = useState<AlgoStrategy[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchStrategies();
    }, []);

    const fetchStrategies = async () => {
        try {
            const { data, error } = await supabase
                .from('algo_strategies')
                .select('*');

            if (error || !data || data.length === 0) {
                // Fallback to mock data if DB is empty or error
                setStrategies(MOCK_STRATEGIES);
            } else {
                setStrategies(data);
            }
        } catch (e) {
            console.error("Error fetching strategies:", e);
            setStrategies(MOCK_STRATEGIES);
        } finally {
            setLoading(false);
        }
    };

    const [activeTab, setActiveTab] = useState<'predefined' | 'custom'>('predefined');

    // Split strategies into predefined (static IDs) and custom
    const PREDEFINED_IDS = ['ma_crossover', 'rsi_mean_reversion', 'breakout', 'buy_and_hold'];

    const predefinedList = strategies.filter(s => PREDEFINED_IDS.includes(s.id));
    const customList = strategies.filter(s => !PREDEFINED_IDS.includes(s.id));

    // Use the active list for searching/filtering
    const currentList = activeTab === 'predefined' ? predefinedList : customList;

    const filteredStrategies = currentList.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.manager_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4 border-b border-white/10">
                <button
                    onClick={() => setActiveTab('predefined')}
                    className={`pb-3 px-1 text-sm font-medium transition-colors relative ${activeTab === 'predefined'
                            ? 'text-primary'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                >
                    Predefined Strategies
                    {activeTab === 'predefined' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('custom')}
                    className={`pb-3 px-1 text-sm font-medium transition-colors relative ${activeTab === 'custom'
                            ? 'text-primary'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                >
                    My Custom Strategies
                    {activeTab === 'custom' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />
                    )}
                </button>
            </div>

            <div className="flex gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <GlassInput
                        placeholder="Search strategies or managers..."
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button className="h-10 px-4 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2 text-sm font-medium text-slate-300 hover:bg-white/10 transition-colors">
                    <Filter className="h-4 w-4" />
                    Filters
                </button>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-[280px] rounded-2xl bg-white/5 animate-pulse" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredStrategies.length > 0 ? (
                        filteredStrategies.map(strategy => (
                            <AlgoStrategyCard key={strategy.id} strategy={strategy} />
                        ))
                    ) : (
                        <div className="col-span-full text-center py-12 text-slate-500">
                            No strategies found in {activeTab === 'predefined' ? 'predefined' : 'custom'} list.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
