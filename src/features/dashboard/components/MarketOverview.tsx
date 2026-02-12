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

    useEffect(() => {
        const fetchIndices = async () => {
            const { data } = await supabase
                .from('market_indices')
                .select('index_name, last_price, change, percent_change')
                .in('index_name', [
                    'NIFTY 50', 'NIFTY BANK', 'SENSEX', 'NIFTY IT',
                    'NIFTY MIDCAP 100', 'NIFTY SMLCAP 100',
                    'NIFTY PHARMA', 'NIFTY AUTO', 'NIFTY FMCG', 'NIFTY METAL'
                ]);

            if (data && data.length > 0) {
                const merged = defaultIndices.map(def => {
                    const found = data.find(d => d.index_name === def.index_name);
                    return found || def;
                });
                setIndices(merged);
            }
        };

        fetchIndices();

        // Realtime subscription
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
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
            {indices.map((index) => (
                <GlassCard key={index.index_name} className="relative overflow-hidden group hover:border-border transition-all cursor-pointer p-3">
                    <div className="absolute top-0 right-0 p-2 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Activity className="h-6 w-6" />
                    </div>

                    <div className="space-y-1 relative z-10">
                        <div className="text-[9px] font-medium text-muted-foreground uppercase tracking-wider">
                            {index.index_name}
                        </div>
                        <div className="text-base font-bold text-foreground tracking-tight">
                            {index.last_price?.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                        </div>

                        <div className={`flex items-center text-xs font-medium ${index.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {index.change >= 0 ? <TrendingUp className="h-3 w-3 mr-0.5" /> : <TrendingDown className="h-3 w-3 mr-0.5" />}
                            {index.percent_change?.toFixed(2)}%
                        </div>
                    </div>
                </GlassCard>
            ))}
        </div>
    );
}
