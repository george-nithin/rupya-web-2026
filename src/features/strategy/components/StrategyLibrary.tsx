"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { Plus, TrendingUp, BarChart2, Clock, MoreVertical, Copy, Archive } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface Strategy {
    id: string; // Changed to string for UUID
    name: string;
    type: string;
    win_rate: number;
    total_trades: number;
    total_pnl: number;
    last_used_at: string | null;
    status: string;
}

export function StrategyLibrary() {
    const [strategies, setStrategies] = useState<Strategy[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchStrategies() {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                const { data, error } = await supabase
                    .from('user_strategies')
                    .select('*')
                    .eq('user_id', user.id);

                if (data) {
                    setStrategies(data as any); // Type assertion for now, ensuring shape matches
                }
            } catch (error) {
                console.error("Error fetching strategies:", error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchStrategies();
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Strategy Playbook</h1>
                    <p className="text-muted-foreground">Manage and refine your trading systems</p>
                </div>
                <Link href="/dashboard/strategies/create">
                    <GlassButton>
                        <Plus className="h-5 w-5 mr-2" />
                        Create Strategy
                    </GlassButton>
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {strategies.map((strategy) => (
                    <GlassCard key={strategy.id} className="group relative overflow-hidden transition-all hover:border-sky-500/30">
                        <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                            <button className="p-1 hover:bg-card/30 rounded text-muted-foreground hover:text-foreground active:scale-95" title="Duplicate">
                                <Copy className="h-5 w-5" />
                            </button>
                            <button className="p-1 hover:bg-card/30 rounded text-muted-foreground hover:text-foreground active:scale-95" title="Archive">
                                <Archive className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="mb-4">
                            <div className="text-xs font-bold text-sky-400 uppercase tracking-widest mb-1">{strategy.type}</div>
                            <h3 className="text-xl font-bold text-foreground">{strategy.name}</h3>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div>
                                <div className="text-xs text-muted-foreground mb-1">Win Rate</div>
                                <div className={`text-xl font-bold ${strategy.win_rate > 60 ? 'text-green-400' : 'text-slate-200'}`}>
                                    {strategy.win_rate}%
                                </div>
                            </div>
                            <div>
                                <div className="text-xs text-muted-foreground mb-1">Net P&L</div>
                                <div className="text-xl font-bold text-foreground">₹{strategy.total_pnl.toLocaleString()}</div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t border-border/50">
                            <div className="flex items-center gap-1">
                                <BarChart2 className="h-3 w-3" /> {strategy.total_trades} Trades
                            </div>
                            <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" /> Used {strategy.last_used_at ? new Date(strategy.last_used_at).toLocaleDateString() : 'Never'}
                            </div>
                        </div>
                    </GlassCard>
                ))}

                {/* New Strategy Placeholder Card */}
                <Link href="/dashboard/strategies/create" className="block">
                    <div className="h-full min-h-[200px] border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center text-slate-500 hover:border-sky-500/50 hover:bg-sky-500/5 transition-all cursor-pointer group active:scale-95">
                        <div className="h-12 w-12 rounded-full bg-card/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                            <Plus className="h-6 w-6 text-slate-400 group-hover:text-sky-400" />
                        </div>
                        <span className="font-medium group-hover:text-foreground">Design New System</span>
                    </div>
                </Link>
            </div>
        </div>
    );
}
