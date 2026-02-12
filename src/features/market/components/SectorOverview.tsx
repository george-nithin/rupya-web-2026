"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { ArrowUpRight, ArrowDownRight, Zap, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface SectorIndex {
    index_name: string;
    last_price: number;
    change: number;
    percent_change: number;
}

export function SectorOverview() {
    const [sectors, setSectors] = useState<SectorIndex[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSectors = async () => {
            try {
                // Fetch Nifty sectoral indices
                const { data } = await supabase
                    .from('market_indices')
                    .select('index_name, last_price, change, percent_change')
                    .ilike('index_name', 'Nifty %')
                    .not('index_name', 'eq', 'NIFTY 50')
                    .not('index_name', 'eq', 'NIFTY BANK')
                    .not('index_name', 'eq', 'NIFTY NEXT 50')
                    .order('index_name', { ascending: true });

                if (data) setSectors(data);
            } finally {
                setLoading(false);
            }
        };

        fetchSectors();
    }, []);

    if (loading) return (
        <div className="h-64 flex items-center justify-center">
            <Loader2 className="h-8 w-8 text-sky-400 animate-spin" />
        </div>
    );

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {sectors.map((sector) => (
                <GlassCard key={sector.index_name} className="p-4 hover:bg-card/20 transition-all duration-150 cursor-pointer group active:scale-95">
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-semibold text-foreground">{sector.index_name}</span>
                        {sector.percent_change >= 2 && (
                            <Zap className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                        )}
                    </div>

                    <div className="flex items-end justify-between">
                        <div className={`text-xl font-bold ${sector.percent_change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {sector.percent_change > 0 ? '+' : ''}{sector.percent_change}%
                        </div>

                        {sector.percent_change >= 0 ? (
                            <ArrowUpRight className="h-5 w-5 text-green-400 opacity-50 group-hover:opacity-100 transition-opacity" />
                        ) : (
                            <ArrowDownRight className="h-5 w-5 text-red-400 opacity-50 group-hover:opacity-100 transition-opacity" />
                        )}
                    </div>

                    <div className="mt-2 text-[10px] text-muted-foreground uppercase tracking-wider">
                        LTP: <span className="text-foreground">₹{sector.last_price?.toLocaleString()}</span>
                    </div>
                </GlassCard>
            ))}
        </div>
    );
}
