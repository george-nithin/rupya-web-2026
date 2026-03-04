"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

interface MarketIndex {
    index_name: string;
    last_price: number;
    change: number;
    percent_change: number;
}

const defaultIndices = [
    { index_name: "NIFTY 50", last_price: 0, change: 0, percent_change: 0 },
    { index_name: "NIFTY BANK", last_price: 0, change: 0, percent_change: 0 },
    { index_name: "SENSEX", last_price: 0, change: 0, percent_change: 0 },
    { index_name: "NIFTY IT", last_price: 0, change: 0, percent_change: 0 },
    { index_name: "NIFTY MIDCAP 100", last_price: 0, change: 0, percent_change: 0 },
    { index_name: "NIFTY SMLCAP 100", last_price: 0, change: 0, percent_change: 0 },
    { index_name: "NIFTY PHARMA", last_price: 0, change: 0, percent_change: 0 },
    { index_name: "NIFTY AUTO", last_price: 0, change: 0, percent_change: 0 },
    { index_name: "NIFTY FMCG", last_price: 0, change: 0, percent_change: 0 },
    { index_name: "NIFTY METAL", last_price: 0, change: 0, percent_change: 0 },
];

export function MarketOverview() {
    const [indices, setIndices] = useState<MarketIndex[]>(defaultIndices);
    const [lastUpdated, setLastUpdated] = useState<Record<string, number>>({});

    useEffect(() => {
        const fetchIndices = async () => {
            const { data } = await supabase
                .from('market_indices')
                .select('index_name, last_price, change, percent_change')
                .order('index_name', { ascending: true });

            if (data && data.length > 0) {
                // Prioritize Nifty 50 and Bank Nifty, then others
                const prioritized = [
                    'NIFTY 50', 'NIFTY BANK', 'NIFTY FIN SERVICE', 'NIFTY IT',
                    'NIFTY PHARMA', 'NIFTY AUTO', 'NIFTY FMCG', 'NIFTY METAL',
                    'NIFTY INFRA', 'NIFTY REALTY'
                ];

                const sorted = data.sort((a, b) => {
                    const aIdx = prioritized.indexOf(a.index_name);
                    const bIdx = prioritized.indexOf(b.index_name);
                    if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
                    if (aIdx !== -1) return -1;
                    if (bIdx !== -1) return 1;
                    return a.index_name.localeCompare(b.index_name);
                }).slice(0, 10); // Keep top 10 for dashboard

                setIndices(sorted);
            }
        };

        fetchIndices();

        // Realtime subscription
        const channel = supabase
            .channel('market_indices_changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'market_indices',
                },
                (payload) => {
                    const newData = payload.new as MarketIndex;
                    if (newData && newData.index_name) {
                        setIndices((current) => {
                            const exists = current.find(idx => idx.index_name === newData.index_name);
                            if (exists) {
                                return current.map((idx) =>
                                    idx.index_name === newData.index_name
                                        ? { ...idx, ...newData }
                                        : idx
                                );
                            }
                            return current;
                        });

                        setLastUpdated(prev => ({
                            ...prev,
                            [newData.index_name]: Date.now()
                        }));

                        setTimeout(() => {
                            setLastUpdated(prev => {
                                const next = { ...prev };
                                delete next[newData.index_name];
                                return next;
                            });
                        }, 1000);
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    return (
        <div className="relative -mx-4 md:-mx-6 lg:mx-0">
            <div className="flex lg:grid lg:grid-cols-5 gap-3 overflow-x-auto px-4 md:px-6 lg:px-0 pb-4 no-scrollbar snap-x snap-mandatory">
                {indices.map((index) => {
                    const isFlash = !!lastUpdated[index.index_name];

                    return (
                        <div
                            key={index.index_name}
                            className="flex-shrink-0 w-[160px] md:w-[200px] lg:w-auto snap-start"
                        >
                            <GlassCard
                                className={cn(
                                    "relative overflow-hidden group hover:border-border transition-all cursor-pointer p-3 border-transparent h-full",
                                    isFlash && "ring-2 ring-orange-500/50 bg-orange-500/10"
                                )}
                            >
                                <div className="absolute top-0 right-0 p-2 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <Activity className="h-6 w-6" />
                                </div>

                                <div className="space-y-1 relative z-10">
                                    <div className="text-[9px] font-black text-white/40 uppercase tracking-widest flex items-center gap-1.5">
                                        <span className={cn(
                                            "h-1 w-1 rounded-full",
                                            index.change >= 0 ? "bg-green-500" : "bg-red-500",
                                            isFlash && "animate-ping"
                                        )} />
                                        {index.index_name}
                                    </div>
                                    <div className={cn(
                                        "text-base font-black text-white tracking-tight transition-colors",
                                        isFlash && "text-orange-400"
                                    )}>
                                        {index.last_price?.toLocaleString('en-IN', { maximumFractionDigits: 1 })}
                                    </div>

                                    <div className={cn(
                                        "flex items-center text-[10px] font-bold",
                                        index.change >= 0 ? "text-green-400" : "text-red-400"
                                    )}>
                                        {index.change >= 0 ? <TrendingUp className="h-2.5 w-2.5 mr-0.5" /> : <TrendingDown className="h-2.5 w-2.5 mr-0.5" />}
                                        {index.percent_change?.toFixed(2)}%
                                    </div>
                                </div>

                                {isFlash && (
                                    <div className="absolute inset-0 bg-orange-500/5 animate-pulse pointer-events-none" />
                                )}
                            </GlassCard>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
