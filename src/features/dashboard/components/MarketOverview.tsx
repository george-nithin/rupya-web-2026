"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface MarketIndex {
    index_name: string;
    last_price: number;
    change: number;
    percent_change: number;
}

const defaultIndices = [
    { index_name: "NIFTY 50", last_price: 0, change: 0, percent_change: 0 },
    { index_name: "NIFTY BANK", last_price: 0, change: 0, percent_change: 0 },
    { index_name: "SENSEX", last_price: 0, change: 0, percent_change: 0 }, // Note: Sensex might not be in NSE data, fallback or check
    { index_name: "NIFTY IT", last_price: 0, change: 0, percent_change: 0 },
];

export function MarketOverview() {
    const [indices, setIndices] = useState<MarketIndex[]>(defaultIndices);

    useEffect(() => {
        const fetchIndices = async () => {
            const { data } = await supabase
                .from('market_indices')
                .select('index_name, last_price, change, percent_change')
                .in('index_name', ['NIFTY 50', 'NIFTY BANK', 'NIFTY IT', 'SENSEX']); // Adjust names as per DB

            if (data && data.length > 0) {
                // Merge with defaults to maintain order/placeholders
                const merged = defaultIndices.map(def => {
                    const found = data.find(d => d.index_name === def.index_name);
                    return found || def;
                });
                setIndices(merged);
            }
        };

        fetchIndices();

        // Optional: Realtime subscription
        const channel = supabase
            .channel('market_indices_changes')
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'market_indices',
                },
                (payload) => {
                    setIndices((current) =>
                        current.map((idx) =>
                            idx.index_name === payload.new.index_name
                                ? { ...idx, ...payload.new }
                                : idx
                        )
                    );
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {indices.map((index) => (
                <GlassCard key={index.index_name} className="relative overflow-hidden group hover:border-white/20">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Activity className="h-12 w-12" />
                    </div>

                    <div className="space-y-3 relative z-10">
                        <div className="text-sm font-medium text-slate-400">{index.index_name}</div>
                        <div className="text-2xl font-bold text-white tracking-tight">
                            {index.last_price?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </div>

                        <div className={`flex items-center text-sm font-medium ${index.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {index.change >= 0 ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
                            {index.change > 0 ? '+' : ''}{index.change} ({index.percent_change}%)
                        </div>
                    </div>
                </GlassCard>
            ))}
        </div>
    );
}
