
"use client";

import { useEffect, useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { Plus, Code, Trash2, Play } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Strategy {
    id: string;
    name: string;
    description: string;
    code: string | null;
    created_at: string;
}

export default function StrategiesListPage() {
    const [strategies, setStrategies] = useState<Strategy[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        fetchStrategies();
    }, []);

    const fetchStrategies = async () => {
        try {
            const res = await fetch('/api/strategies');
            const data = await res.json();
            if (Array.isArray(data)) {
                setStrategies(data);
            }
        } catch (error) {
            console.error("Failed to fetch strategies:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateNew = async () => {
        try {
            const res = await fetch('/api/strategies', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: "New Custom Strategy",
                    description: "A new custom Python strategy",
                    code: `
# Custom Strategy
class CustomStrategy(TradingStrategy):
    def __init__(self):
        super().__init__("Custom Stats")
        
    def initialize(self, portfolio, data):
        super().initialize(portfolio, data)
        # Add indicators here
        
    def on_data(self, timestamp, current_bar, historical_data):
        # Implement trading logic
        # return [Order(symbol=self.symbol, side=OrderSide.BUY, quantity=1)]
        return []
`
                })
            });
            const newStrategy = await res.json();
            if (newStrategy && newStrategy.id) {
                router.push(`/dashboard/backtesting/strategies/${newStrategy.id}`);
            }
        } catch (error) {
            console.error("Failed to create strategy:", error);
            alert("Failed to create strategy");
        }
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.preventDefault();
        if (!confirm("Are you sure you want to delete this strategy?")) return;

        try {
            await fetch(`/api/strategies/${id}`, { method: 'DELETE' });
            setStrategies(strategies.filter(s => s.id !== id));
        } catch (error) {
            console.error("Failed to delete strategy:", error);
        }
    };

    return (
        <div className="space-y-6">

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Strategy Library</h1>
                    <p className="text-slate-400">Manage your custom Python algorithmic strategies</p>
                </div>
                <Link href="/dashboard/backtesting/strategies/new">
                    <GlassButton>
                        <Plus className="h-4 w-4 mr-2" />
                        New Strategy
                    </GlassButton>
                </Link>
            </div>

            {isLoading ? (
                <div className="text-center py-12 text-slate-500">Loading strategies...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Predefined Strategies (Hardcoded for display) */}
                    {[
                        {
                            id: 'ma_crossover',
                            name: 'Moving Average Crossover',
                            description: 'Classic trend following strategy using fast and slow moving averages.'
                        },
                        {
                            id: 'rsi_mean_reversion',
                            name: 'RSI Mean Reversion',
                            description: 'Buy oversold (RSI < 30) and sell overbought (RSI > 70).'
                        },
                        {
                            id: 'breakout',
                            name: 'Breakout Strategy',
                            description: 'Buy on 20-day high breakout with stop-loss and profit target.'
                        },
                        {
                            id: 'buy_and_hold',
                            name: 'Buy and Hold',
                            description: 'Buy on first day and hold until the end.'
                        }
                    ].map((strategy) => (
                        <GlassCard key={strategy.id} className="p-6 border-l-4 border-l-blue-500/50">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2 bg-blue-500/10 rounded-lg">
                                    <Code className="h-6 w-6 text-blue-400" />
                                </div>
                                <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded">Built-in</span>
                            </div>
                            <h3 className="text-lg font-bold text-white mb-2">{strategy.name}</h3>
                            <p className="text-sm text-slate-400 mb-4 line-clamp-2">
                                {strategy.description}
                            </p>
                            <div className="flex gap-2">
                                <Link href={`/dashboard/backtesting?strategy=${strategy.id}`} className="flex-1">
                                    <GlassButton size="sm" className="w-full">
                                        <Play className="h-3 w-3 mr-2" /> Backtest
                                    </GlassButton>
                                </Link>
                                <Link href={`/dashboard/backtesting/strategies/new?clone=${strategy.id}`}>
                                    <GlassButton size="sm" variant="secondary" className="px-3 hover:bg-white/20">
                                        <Code className="h-4 w-4 mr-2" /> Clone
                                    </GlassButton>
                                </Link>
                            </div>
                        </GlassCard>
                    ))}

                    {/* Custom Strategies */}
                    {strategies.map((strategy) => (
                        <GlassCard
                            key={strategy.id}
                            className="p-6 h-full hover:border-sky-500/50 transition-colors cursor-pointer group relative flex flex-col justify-between"
                            onClick={() => router.push(`/dashboard/backtesting/strategies/${strategy.id}`)}
                        >
                            <div>
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-2 bg-purple-500/10 rounded-lg">
                                        <Code className="h-6 w-6 text-purple-400" />
                                    </div>
                                    <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded">Custom</span>
                                </div>
                                <h3 className="text-lg font-bold text-white mb-2">{strategy.name}</h3>
                                <p className="text-sm text-slate-400 mb-4 line-clamp-2">
                                    {strategy.description || "No description provided."}
                                </p>
                            </div>

                            <div className="flex justify-end gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        router.push(`/dashboard/backtesting/strategies/${strategy.id}`);
                                    }}
                                    className="p-2 bg-sky-500/10 hover:bg-sky-500/20 rounded-lg text-sky-400 transition-colors"
                                    title="Edit Strategy"
                                >
                                    <Code className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDelete(strategy.id, e);
                                    }}
                                    className="p-2 bg-red-500/10 hover:bg-red-500/20 rounded-lg text-red-400 transition-colors"
                                    title="Delete Strategy"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </GlassCard>
                    ))}
                </div>
            )}
        </div>
    );
}
