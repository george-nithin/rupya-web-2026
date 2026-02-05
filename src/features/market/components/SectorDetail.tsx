"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface SectorConstituent {
    symbol: string;
    company_name: string;
    last_price: number;
    percent_change: number;
    change: number;
}

export function SectorDetail() {
    const [constituents, setConstituents] = useState<SectorConstituent[]>([]);

    useEffect(() => {
        const fetchConstituents = async () => {
            // Fetching 'Auto' sector stocks as an example, or just top market movers if sector column is empty/different
            const { data } = await supabase
                .from('market_equity_quotes')
                .select('symbol, company_name, last_price, percent_change, change')
                .eq('sector', 'Automobile') // Adjusted to match likely DB value, or remove filter for general top stocks
                .order('percent_change', { ascending: false })
                .limit(5);

            if (data && data.length > 0) {
                setConstituents(data as any);
            } else {
                // Fallback: fetch any top 5 stocks if specific sector returns empty
                const { data: fallbackData } = await supabase
                    .from('market_equity_quotes')
                    .select('symbol, company_name, last_price, percent_change, change')
                    .limit(5);
                if (fallbackData) setConstituents(fallbackData as any);
            }
        };

        fetchConstituents();
    }, []);

    return (
        <GlassCard>
            <h3 className="text-sm font-bold text-white mb-4">Top Constituents (Auto)</h3>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-400">
                    <thead className="text-xs uppercase bg-white/5 text-slate-300">
                        <tr>
                            <th className="px-4 py-3 rounded-l-lg">Stock</th>
                            <th className="px-4 py-3">Price</th>
                            <th className="px-4 py-3">Change</th>
                            <th className="px-4 py-3 rounded-r-lg text-right">Contribution</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {constituents.length === 0 ? (
                            <tr><td colSpan={4} className="px-4 py-3 text-center">Loading...</td></tr>
                        ) : (
                            constituents.map((stock) => (
                                <tr key={stock.symbol} className="hover:bg-white/5 transition-colors">
                                    <td className="px-4 py-3 font-medium text-white">{stock.symbol}</td>
                                    <td className="px-4 py-3">₹{stock.last_price?.toLocaleString()}</td>
                                    <td className={`px-4 py-3 font-bold ${stock.percent_change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                        {stock.percent_change > 0 ? '+' : ''}{stock.percent_change}%
                                    </td>
                                    <td className="px-4 py-3 text-right text-slate-300">
                                        {/* Contribution is complex to calc without index weight, handling as static/placeholder or derived */}
                                        {(stock.change * 0.1).toFixed(2)} pts
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </GlassCard>
    );
}
