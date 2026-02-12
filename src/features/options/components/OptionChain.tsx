"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export function OptionChain() {
    const [chainData, setChainData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [symbol, setSymbol] = useState("NIFTY");
    const [expiry, setExpiry] = useState("");

    useEffect(() => {
        fetchOptionChain();
    }, [symbol]);

    const fetchOptionChain = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('market_option_chains')
            .select('data, last_update_time')
            .eq('symbol', symbol)
            .single();

        if (data && data.data) {
            setChainData(data.data);
            // Backend stores the full structure in data.data, expiry is nested in records
            if (data.data.records?.expiryDates && data.data.records.expiryDates.length > 0) {
                setExpiry(data.data.records.expiryDates[0]);
            }
        }
        setLoading(false);
    };

    // Backend structure: data.records.data contains the strikes array
    const strikes = chainData?.records?.data || chainData?.filtered?.data || [];
    const spotPrice = chainData?.records?.underlyingValue || 0;

    return (
        <GlassCard className="h-full overflow-hidden flex flex-col p-0">
            <div className="p-4 border-b border-border flex justify-between items-center bg-card/50">
                <div className="flex items-center gap-4">
                    <select
                        value={symbol}
                        onChange={(e) => setSymbol(e.target.value)}
                        className="bg-sky-500/10 border border-sky-500/20 rounded-xl px-2 py-1 text-sm font-bold text-white outline-none"
                    >
                        <option value="NIFTY">NIFTY</option>
                        <option value="BANKNIFTY">BANKNIFTY</option>
                    </select>
                    <select
                        value={expiry}
                        onChange={(e) => setExpiry(e.target.value)}
                        className="bg-card/20 border border-border rounded-xl px-2 py-1 text-xs text-foreground outline-none"
                    >
                        {chainData?.records?.expiryDates?.slice(0, 5).map((exp: string) => (
                            <option key={exp} value={exp}>{exp}</option>
                        ))}
                    </select>
                </div>
                <div className="text-xs text-muted-foreground">
                    Spot: <span className="text-foreground font-bold">{spotPrice.toLocaleString()}</span>
                </div>
            </div>


            <div className="flex-1 overflow-auto">
                {loading ? (
                    <div className="h-full flex items-center justify-center text-muted-foreground">Loading live chain...</div>
                ) : (
                    <table className="w-full text-xs border-collapse">
                        <thead className="text-muted-foreground bg-card/20 sticky top-0 z-10 font-medium">
                            <tr>
                                <th className="py-2 px-2 text-green-400/80">OI</th>
                                <th className="py-2 px-2 text-green-400/80">OI Chg</th>
                                <th className="py-2 px-2 text-green-400/80">Vol</th>
                                <th className="py-2 px-2 text-green-400/80">IV</th>
                                <th className="py-2 px-2 text-green-400/80 border-r border-white/10">LTP</th>
                                <th className="py-2 px-4 bg-secondary text-foreground">STRIKE</th>
                                <th className="py-2 px-2 text-red-400/80 border-l border-white/10">LTP</th>
                                <th className="py-2 px-2 text-red-400/80">IV</th>
                                <th className="py-2 px-2 text-red-400/80">Vol</th>
                                <th className="py-2 px-2 text-red-400/80">OI Chg</th>
                                <th className="py-2 px-2 text-red-400/80">OI</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-foreground/80">
                            {(() => {
                                // Filter strikes around ATM (±500 points for NIFTY, ±1000 for BANKNIFTY)
                                const range = symbol === "NIFTY" ? 500 : 1000;
                                const atmStrikes = strikes
                                    .filter((s: any) => Math.abs(s.strikePrice - spotPrice) <= range)
                                    .sort((a: any, b: any) => a.strikePrice - b.strikePrice);

                                return atmStrikes.map((strike: any) => {
                                    const isATM = Math.abs(strike.strikePrice - spotPrice) < 50;
                                    return (
                                        <tr key={strike.strikePrice} className={`hover:bg-white/5 transition-all duration-150 ${isATM ? 'bg-sky-500/10' : ''}`}>
                                            {/* CALLS */}
                                            <td className="py-2 px-2 text-center">{strike.CE?.openInterest?.toLocaleString() || '-'}</td>
                                            <td className="py-2 px-2 text-center">
                                                <span className={strike.CE?.changeinOpenInterest > 0 ? 'text-green-400' : 'text-red-400'}>
                                                    {strike.CE?.changeinOpenInterest?.toLocaleString() || '-'}
                                                </span>
                                            </td>
                                            <td className="py-2 px-2 text-center text-muted-foreground">{strike.CE?.totalTradedVolume?.toLocaleString() || '-'}</td>
                                            <td className="py-2 px-2 text-center text-muted-foreground">{strike.CE?.impliedVolatility || '-'}</td>
                                            <td className="py-2 px-2 font-medium text-foreground border-r border-border text-center">{strike.CE?.lastPrice || '-'}</td>

                                            {/* STRIKE */}
                                            <td className={`py-2 px-4 font-bold bg-slate-800 text-center ${isATM ? 'text-sky-400' : 'text-white'}`}>{strike.strikePrice}</td>

                                            {/* PUTS */}
                                            <td className="py-2 px-2 font-medium text-foreground border-l border-border text-center">{strike.PE?.lastPrice || '-'}</td>
                                            <td className="py-2 px-2 text-center text-muted-foreground">{strike.PE?.impliedVolatility || '-'}</td>
                                            <td className="py-2 px-2 text-center text-muted-foreground">{strike.PE?.totalTradedVolume?.toLocaleString() || '-'}</td>
                                            <td className="py-2 px-2 text-center">
                                                <span className={strike.PE?.changeinOpenInterest > 0 ? 'text-green-400' : 'text-red-400'}>
                                                    {strike.PE?.changeinOpenInterest?.toLocaleString() || '-'}
                                                </span>
                                            </td>
                                            <td className="py-2 px-2 text-center">{strike.PE?.openInterest?.toLocaleString() || '-'}</td>
                                        </tr>
                                    );
                                });
                            })()}
                        </tbody>
                    </table>
                )}
            </div>
        </GlassCard>
    );
}
