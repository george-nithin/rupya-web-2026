"use client";

import { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { supabase } from "@/lib/supabase";
import { TrendingUp, TrendingDown, Minus, Move, Star, Info } from "lucide-react";

interface TradingStrategy {
    id: string;
    name: string;
    description: string;
    sentiment: 'Bullish' | 'Bearish' | 'Neutral' | 'Directional';
    risk_profile: string;
    legs_count: number;
    legs_config: any;
    payoff_diagram_url?: string;
}

function PayoffPlaceholder({ sentiment }: { sentiment: string }) {
    // Simple SVG curves to mimic payoff
    let path = "";
    let color = "stroke-sky-400";

    if (sentiment === 'Bullish') {
        path = "M 10 90 L 40 90 L 90 10"; // Upward
        color = "stroke-green-400";
    } else if (sentiment === 'Bearish') {
        path = "M 10 10 L 60 90 L 90 90"; // Downward
        color = "stroke-red-400";
    } else if (sentiment === 'Neutral') {
        // Iron Condor shape (Flat top, losses on wings)
        // M 10 90 L 30 20 L 70 20 L 90 90
        path = "M 10 90 L 30 20 L 70 20 L 90 90";
        color = "stroke-sky-400";
    } else if (sentiment === 'Directional') {
        // V shape (Straddle/Strangle)
        path = "M 10 10 L 50 90 L 90 10";
        color = "stroke-purple-400";
    }

    return (
        <svg viewBox="0 0 100 100" className="w-full h-full p-2">
            <path d={path} fill="none" strokeWidth="2" className={color} strokeLinecap="round" strokeLinejoin="round" />
            <line x1="0" y1="50" x2="100" y2="50" stroke="rgba(255,255,255,0.1)" strokeDasharray="4" strokeWidth="0.5" />
        </svg>
    );
}

export function StrategyBrowser() {
    const [activeTab, setActiveTab] = useState<'Bullish' | 'Bearish' | 'Neutral' | 'Directional' | 'Favourites'>('Bullish');
    const [strategies, setStrategies] = useState<TradingStrategy[]>([]);
    const [selectedIndex, setSelectedIndex] = useState("NIFTY");
    const [indices, setIndices] = useState<string[]>(["NIFTY", "BANKNIFTY", "FINNIFTY"]);
    const [loading, setLoading] = useState(true);

    const [favorites, setFavorites] = useState<Set<string>>(new Set());
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const load = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
            await Promise.all([fetchStrategies(), fetchIndices()]);
            if (user) await fetchFavorites(user.id);
        };
        load();
    }, []);

    const fetchFavorites = async (userId: string) => {
        const { data } = await supabase
            .from('user_strategy_favourites')
            .select('strategy_id')
            .eq('user_id', userId);

        if (data) {
            setFavorites(new Set(data.map(f => f.strategy_id)));
        }
    };

    const toggleFavorite = async (strategyId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();

        if (!user) {
            alert("Please login to save favorites");
            return;
        }

        const newFavs = new Set(favorites);
        if (newFavs.has(strategyId)) {
            newFavs.delete(strategyId);
            setFavorites(new Set(newFavs)); // Optimistic UI
            await supabase.from('user_strategy_favourites').delete().match({ user_id: user.id, strategy_id: strategyId });
        } else {
            newFavs.add(strategyId);
            setFavorites(new Set(newFavs)); // Optimistic UI
            await supabase.from('user_strategy_favourites').insert({ user_id: user.id, strategy_id: strategyId });
        }
    };

    const fetchIndices = async () => {
        // Try fetching from DB first
        const { data } = await supabase.from('market_indices').select('index_name');
        if (data && data.length > 0) {
            setIndices(data.map(i => i.index_name));
        }
    };

    const fetchStrategies = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('trading_strategies')
            .select('*');

        if (data) {
            setStrategies(data as any);
        }
        setLoading(false);
    };

    const filteredStrategies = strategies.filter(s => {
        if (activeTab === 'Favourites') return favorites.has(s.id);
        return s.sentiment === activeTab;
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-xl font-bold text-white uppercase tracking-wider">Trading Strategies</h2>
                    <p className="text-xs text-slate-400 mt-1">Select a market view to see relevant templates</p>
                </div>

                <div className="flex items-center gap-3 bg-white/5 p-1 rounded-lg border border-white/10">
                    <span className="text-xs text-slate-400 pl-2">Strategy For:</span>
                    <select
                        value={selectedIndex}
                        onChange={(e) => setSelectedIndex(e.target.value)}
                        className="bg-slate-900 border-none rounded px-3 py-1.5 text-sm font-bold text-white outline-none focus:ring-1 focus:ring-sky-500"
                    >
                        {indices.map(idx => <option key={idx} value={idx}>{idx}</option>)}
                    </select>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-white/10 overflow-x-auto no-scrollbar">
                {['Bullish', 'Bearish', 'Directional', 'Neutral', 'Favourites'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab as any)}
                        className={`px-6 py-3 text-sm font-medium transition-colors relative whitespace-nowrap ${activeTab === tab ? 'text-sky-400' : 'text-slate-400 hover:text-white'
                            }`}
                    >
                        {tab}
                        {activeTab === tab && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.5)]" />
                        )}
                    </button>
                ))}
            </div>

            {/* Description Banner */}
            <div className="bg-gradient-to-r from-sky-500/10 to-transparent border-l-4 border-sky-400 rounded-r-lg p-4 text-sm text-slate-300 flex items-start gap-3">
                <Info className="h-5 w-5 text-sky-400 shrink-0 mt-0.5" />
                <div className="font-medium">
                    {activeTab === 'Bullish' && "You expect the market to go up sharply or give a big movement upwards."}
                    {activeTab === 'Bearish' && "You expect the market to go down sharply or give a big movement downwards."}
                    {activeTab === 'Neutral' && "You expect the market to remain where it is or move sideways. No drastic movements."}
                    {activeTab === 'Directional' && "You don't know where the market will go, i.e. Up or down. But are sure that it won't stay neutral."}
                    {activeTab === 'Favourites' && "Your saved strategy templates."}
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {loading ? (
                    // Skeletons
                    [1, 2, 3, 4].map(i => (
                        <div key={i} className="h-64 bg-white/5 animate-pulse rounded-xl border border-white/5" />
                    ))
                ) : filteredStrategies.length > 0 ? (
                    filteredStrategies.map(strategy => (
                        <GlassCard key={strategy.id} className="p-0 overflow-hidden group hover:border-sky-500/30 transition-all relative">
                            {/* Card Header */}
                            <div className="p-4 flex justify-between items-start border-b border-white/5 bg-white/[0.02]">
                                <div>
                                    <h3 className="font-bold text-white group-hover:text-sky-400 transition-colors">{strategy.name}</h3>
                                    <span className="text-[10px] text-slate-500 bg-white/5 px-1.5 py-0.5 rounded border border-white/5 mt-1 inline-block">
                                        {strategy.legs_count} LEGS
                                    </span>
                                </div>
                                <button
                                    onClick={(e) => toggleFavorite(strategy.id, e)}
                                    className={`transition-colors p-1 relative z-20 ${favorites.has(strategy.id) ? 'text-yellow-400' : 'text-slate-600 hover:text-yellow-400'}`}
                                >
                                    <Star className={`h-4 w-4 ${favorites.has(strategy.id) ? 'fill-yellow-400' : ''}`} />
                                </button>
                            </div>

                            {/* Payoff Diagram Area */}
                            <div className="h-32 bg-slate-900/40 relative flex items-center justify-center p-4">
                                <PayoffPlaceholder sentiment={strategy.sentiment} />

                                {/* Overlay Risk Profile */}
                                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/90 to-transparent text-[10px] text-center text-slate-400 group-hover:opacity-0 transition-opacity">
                                    {strategy.risk_profile}
                                </div>
                            </div>

                            {/* HOVER OVERLAY: Details & Legs */}
                            <div className="absolute inset-0 top-[60px] bg-slate-900/95 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4 flex flex-col z-10">
                                <p className="text-xs text-slate-300 mb-3 line-clamp-2">{strategy.description}</p>

                                <div className="space-y-2 overflow-y-auto flex-1 pr-1 custom-scrollbar">
                                    <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Strategy Legs</h4>
                                    {Array.isArray(strategy.legs_config) && strategy.legs_config.map((leg: any, idx: number) => (
                                        <div key={idx} className="flex items-center justify-between text-xs border-b border-white/5 pb-1 last:border-0">
                                            <span className={`${leg.action === 'Buy' ? 'text-green-400' : 'text-red-400'} font-medium`}>
                                                {leg.action}
                                            </span>
                                            <span className="text-slate-200">
                                                {leg.strike_offset === 0 ? 'ATM' : leg.strike_offset > 0 ? `OTM +${leg.strike_offset}` : `ITM ${leg.strike_offset}`} {leg.type}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                <div className="pt-3 mt-auto border-t border-white/10">
                                    <div className="flex justify-between items-center text-[10px] text-slate-400 mb-2">
                                        <span>Est. Margin</span>
                                        <span className="text-white">₹ {(strategy.legs_count * 25000).toLocaleString()}+</span>
                                    </div>
                                </div>
                            </div>

                            {/* Footer Action */}
                            <div className="p-4 bg-white/[0.02] border-t border-white/5">
                                <GlassButton size="sm" className="w-full bg-white/5 hover:bg-sky-500 hover:text-white border-white/10"
                                    onClick={() => alert(`Added ${strategy.name} to basket for ${selectedIndex}`)}
                                >
                                    Add to Basket
                                </GlassButton>
                            </div>
                        </GlassCard>
                    ))
                ) : (
                    <div className="col-span-full py-20 flex flex-col items-center justify-center text-slate-500 border border-dashed border-white/10 rounded-xl bg-white/[0.02]">
                        <div className="h-16 w-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                            <Star className="h-8 w-8 opacity-20" />
                        </div>
                        <p className="font-medium">No strategies found for this view.</p>
                        <p className="text-xs mt-1">Try switching tabs or creating a custom strategy.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
