"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

interface SectorConstituent {
    symbol: string;
    company_name: string;
    last_price: number;
    percent_change: number;
    change: number;
}

export function SectorDetail() {
    const [constituents, setConstituents] = useState<SectorConstituent[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchConstituents = async () => {
            try {
                // Fetch top stocks across all sectors to show breadth
                const { data } = await supabase
                    .from('market_equity_quotes')
                    .select('symbol, company_name, last_price, percent_change, change')
                    .order('percent_change', { ascending: false })
                    .limit(8);

                if (data) setConstituents(data as any);
            } finally {
                setLoading(false);
            }
        };

        fetchConstituents();
    }, []);

    if (loading) return <div className="h-64 flex items-center justify-center"><Loader2 className="animate-spin text-sky-400" /></div>;

    return (
        <GlassCard>
            <h3 className="text-sm font-bold text-white mb-4">Market Movers by Sector</h3>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-400">
                    <thead className="text-xs uppercase bg-white/5 text-slate-300">
                        <tr>
                            <th className="px-4 py-3 rounded-l-lg">Stock</th>
                            <th className="px-4 py-3">Price</th>
                            <th className="px-4 py-3">Change</th>
                            <th className="px-4 py-3 rounded-r-lg text-right">Momentum</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {constituents.map((stock) => (
                            <tr key={stock.symbol} className="hover:bg-white/5 transition-colors">
                                <td className="px-4 py-3 font-medium text-white">{stock.symbol}</td>
                                <td className="px-4 py-3">₹{stock.last_price?.toLocaleString()}</td>
                                <td className={`px-4 py-3 font-bold ${stock.percent_change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                    {stock.percent_change > 0 ? '+' : ''}{stock.percent_change}%
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${stock.percent_change > 2 ? 'bg-green-500/20 text-green-400' : stock.percent_change < -2 ? 'bg-red-500/20 text-red-400' : 'bg-slate-500/20 text-slate-400'}`}>
                                        {stock.percent_change > 2 ? 'CORE' : stock.percent_change > 0 ? 'STEADY' : 'WEAK'}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </GlassCard>
    );
}
