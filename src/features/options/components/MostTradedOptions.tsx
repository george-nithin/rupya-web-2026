"use client";

import React from "react";
import { ArrowRightLeft, TrendingUp, TrendingDown, Activity, BarChart3, ArrowRight } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";

interface OptionContract {
    symbol: string;
    strike: number;
    type: "CE" | "PE";
    ltp: number;
    change: number;
    pChange: number;
    oi: number;
    volume: number;
    turnover?: number; // In Crores likely
}

interface MostTradedProps {
    ceData?: OptionContract;
    peData?: OptionContract;
    isLoading?: boolean;
}

export const MostTradedOptions = ({ ceData, peData, isLoading }: MostTradedProps) => {
    const [mostTradedCE, setMostTradedCE] = React.useState<any>(null);
    const [mostTradedPE, setMostTradedPE] = React.useState<any>(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        fetchMostTraded();
    }, []);

    const fetchMostTraded = async () => {
        try {
            const { supabase } = await import("@/lib/supabase");
            const { data } = await supabase
                .from('market_option_chains')
                .select('data')
                .eq('symbol', 'NIFTY')
                .single();

            if (data?.data?.records?.data) {
                const strikes = data.data.records.data;

                // Find highest volume CE and PE
                let maxCEVolume = 0;
                let maxPEVolume = 0;
                let topCE: any = null;
                let topPE: any = null;

                strikes.forEach((strike: any) => {
                    if (strike.CE?.totalTradedVolume > maxCEVolume) {
                        maxCEVolume = strike.CE.totalTradedVolume;
                        topCE = {
                            symbol: `NIFTY ${strike.strikePrice} CE`,
                            ltp: strike.CE.lastPrice,
                            change: strike.CE.change,
                            pChange: strike.CE.pChange,
                            oi: strike.CE.openInterest,
                            volume: strike.CE.totalTradedVolume,
                            strike: strike.strikePrice
                        };
                    }
                    if (strike.PE?.totalTradedVolume > maxPEVolume) {
                        maxPEVolume = strike.PE.totalTradedVolume;
                        topPE = {
                            symbol: `NIFTY ${strike.strikePrice} PE`,
                            ltp: strike.PE.lastPrice,
                            change: strike.PE.change,
                            pChange: strike.PE.pChange,
                            oi: strike.PE.openInterest,
                            volume: strike.PE.totalTradedVolume,
                            strike: strike.strikePrice
                        };
                    }
                });

                setMostTradedCE(topCE);
                setMostTradedPE(topPE);
            }
        } catch (error) {
            console.error("Error fetching most traded:", error);
        } finally {
            setLoading(false);
        }
    };

    // Fallback defaults if no data
    const defaultCE = { symbol: "NIFTY 24500 CE", ltp: 145.20, change: 12.5, pChange: 8.4, oi: 5400000, volume: 12500000, strike: 24500 };
    const defaultPE = { symbol: "NIFTY 24400 PE", ltp: 88.50, change: -15.4, pChange: -14.2, oi: 6200000, volume: 15400000, strike: 24400 };

    const ce = ceData || mostTradedCE || defaultCE;
    const pe = peData || mostTradedPE || defaultPE;

    const formatNumber = (num: number) => {
        if (num >= 10000000) return (num / 10000000).toFixed(2) + "Cr";
        if (num >= 100000) return (num / 100000).toFixed(2) + "L";
        return num.toLocaleString();
    };

    return (
        <div className="w-full max-w-4xl mx-auto p-1">
            <GlassCard className="relative overflow-hidden p-6 md:p-8 rounded-3xl border-border/50 bg-background/40">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div className="flex gap-2 items-center">
                        <Activity className="text-primary h-5 w-5" />
                        <h2 className="text-xl font-medium text-foreground/90">Most Traded Contracts</h2>
                    </div>
                    <div className="flex gap-2">
                        <button className="p-2 rounded-full hover:bg-card/20 transition-all duration-150 text-muted-foreground active:scale-95">
                            <ArrowRightLeft className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-6 relative">

                    {/* Left Card: Call Option (CE) */}
                    <GlassCard variant="dark" glow className="flex-1 p-6 relative group border-border/50">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Bullish Bet</span>
                                <div className="flex items-center gap-2 mt-1">
                                    <div className="h-6 w-6 rounded-full bg-green-500/20 flex items-center justify-center">
                                        <TrendingUp className="h-3 w-3 text-green-500" />
                                    </div>
                                    <span className="text-lg font-bold text-foreground">Call (CE)</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-xs text-muted-foreground">Strike</div>
                                <div className="text-lg font-mono text-foreground">{ce.strike || ce.symbol.split(" ").slice(-2, -1)}</div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="p-4 bg-background/40 rounded-xl border border-border/50 flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-xl bg-secondary/50 flex items-center justify-center text-xs font-bold text-primary">
                                        NIF
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-foreground">NIFTY</div>
                                        <div className="text-xs text-muted-foreground">Index Options</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className={`text-sm font-bold ${ce.pChange >= 0 ? "text-green-500" : "text-red-500"}`}>
                                        ₹{ce.ltp.toFixed(2)}
                                    </div>
                                    <div className={`text-xs ${ce.pChange >= 0 ? "text-green-500" : "text-red-500"}`}>
                                        {ce.pChange > 0 ? "+" : ""}{ce.pChange}%
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-between items-end mt-6">
                                <div>
                                    <div className="text-xs text-muted-foreground mb-1">Total Volume</div>
                                    <div className="text-3xl font-light text-foreground tracking-tight">
                                        {formatNumber(ce.volume)}
                                    </div>
                                    <div className="text-xs text-green-500 mt-1 flex items-center gap-1">
                                        <Activity className="h-3 w-3" /> High Activity
                                    </div>
                                </div>
                                <div className="text-right space-y-1">
                                    <div className="text-xs text-muted-foreground">Open Interest</div>
                                    <div className="text-sm font-mono text-foreground">{formatNumber(ce.oi)}</div>
                                </div>
                            </div>
                        </div>
                    </GlassCard>

                    {/* Center Icon (Absolute or Flex) */}
                    <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                        <div className="bg-card border border-border p-2 rounded-full shadow-xl shadow-primary/10">
                            <ArrowRightLeft className="h-5 w-5 text-muted-foreground" />
                        </div>
                    </div>

                    {/* Right Card: Put Option (PE) */}
                    <GlassCard variant="dark" glow className="flex-1 p-6 relative group border-border/50">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Bearish Bet</span>
                                <div className="flex items-center gap-2 mt-1">
                                    <div className="h-6 w-6 rounded-full bg-red-500/20 flex items-center justify-center">
                                        <TrendingDown className="h-3 w-3 text-red-500" />
                                    </div>
                                    <span className="text-lg font-bold text-foreground">Put (PE)</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-xs text-muted-foreground">Strike</div>
                                <div className="text-lg font-mono text-foreground">{pe.strike || pe.symbol.split(" ").slice(-2, -1)}</div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="p-4 bg-background/40 rounded-xl border border-border/50 flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-xl bg-secondary/50 flex items-center justify-center text-xs font-bold text-primary">
                                        NIF
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-foreground">NIFTY</div>
                                        <div className="text-xs text-muted-foreground">Index Options</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className={`text-sm font-bold ${pe.pChange >= 0 ? "text-green-500" : "text-red-500"}`}>
                                        ₹{pe.ltp.toFixed(2)}
                                    </div>
                                    <div className={`text-xs ${pe.pChange >= 0 ? "text-green-500" : "text-red-500"}`}>
                                        {pe.pChange > 0 ? "+" : ""}{pe.pChange}%
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-between items-end mt-6">
                                <div>
                                    <div className="text-xs text-muted-foreground mb-1">Total Volume</div>
                                    <div className="text-3xl font-light text-foreground tracking-tight">
                                        {formatNumber(pe.volume)}
                                    </div>
                                    <div className="text-xs text-red-500 mt-1 flex items-center gap-1">
                                        <Activity className="h-3 w-3" /> High Activity
                                    </div>
                                </div>
                                <div className="text-right space-y-1">
                                    <div className="text-xs text-muted-foreground">Open Interest</div>
                                    <div className="text-sm font-mono text-foreground">{formatNumber(pe.oi)}</div>
                                </div>
                            </div>
                        </div>
                    </GlassCard>
                </div>

                {/* Footer / CTA */}
                <div className="mt-8 flex justify-end">
                    <button className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 px-6 rounded-xl flex items-center gap-2 transition-all shadow-strong hover:shadow-primary/20 active:scale-95">
                        Analyze Option Chain <ArrowRight className="h-5 w-5" />
                    </button>
                </div>
            </GlassCard>
        </div>
    );
};
