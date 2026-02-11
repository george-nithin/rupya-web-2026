"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { GlassCard } from "@/components/ui/GlassCard";
import {
    TrendingUp,
    TrendingDown,
    Activity,
    Zap,
    BarChart3,
    PieChart,
    ArrowUpRight,
    ArrowDownRight,
    RefreshCw
} from "lucide-react";

interface SectorData {
    symbol: string;
    last_price: number;
    change: number;
    p_change: number;
    open: number;
    high: number;
    low: number;
    previous_close: number;
    trend: 'bullish' | 'bearish' | 'neutral';
    updated_at: string;
}

export default function SectorPage() {
    const [sectors, setSectors] = useState<SectorData[]>([]);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState<string | null>(null);

    const fetchSectors = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('market_sectors')
            .select('*')
            .order('p_change', { ascending: false });

        if (data && !error) {
            setSectors(data);
            if (data.length > 0) {
                setLastUpdated(new Date(data[0].updated_at).toLocaleTimeString());
            }
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchSectors();
        // Auto-refresh every 60s
        const interval = setInterval(fetchSectors, 60000);
        return () => clearInterval(interval);
    }, []);

    const formatNumber = (num: number) => {
        return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(num);
    };

    // Helper to get icon based on sector name
    const getSectorIcon = (name: string) => {
        if (name.includes("BANK")) return <PieChart className="h-5 w-5 text-blue-400" />;
        if (name.includes("IT")) return <Zap className="h-5 w-5 text-purple-400" />;
        if (name.includes("AUTO")) return <Activity className="h-5 w-5 text-orange-400" />;
        if (name.includes("PHARMA")) return <Activity className="h-5 w-5 text-green-400" />;
        return <BarChart3 className="h-5 w-5 text-gray-400" />;
    };

    return (
        <div className="space-y-8 p-1 pb-20 max-w-[1600px] mx-auto">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Sector Performance</h1>
                    <p className="text-muted-foreground mt-1">Real-time tracking of NSE Sectoral Indices</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Activity className="h-3 w-3" /> Live
                    </span>
                    <button
                        onClick={fetchSectors}
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-muted-foreground hover:text-white"
                    >
                        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Top Stats Row (Best & Worst) */}
            {!loading && sectors.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Top Gainer */}
                    <GlassCard className="p-6 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <TrendingUp className="h-24 w-24 text-green-500" />
                        </div>
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <div className="text-xs font-semibold text-green-400 uppercase tracking-wider mb-1">Top Gainer</div>
                                <h3 className="text-xl font-bold text-white">{sectors[0].symbol}</h3>
                            </div>
                            <div className="h-8 w-8 rounded-full bg-green-500/20 flex items-center justify-center">
                                <ArrowUpRight className="h-4 w-4 text-green-500" />
                            </div>
                        </div>
                        <div className="flex items-end justify-between">
                            <div>
                                <div className="text-2xl font-bold text-white mb-1">
                                    {sectors[0].p_change > 0 ? "+" : ""}{sectors[0].p_change}%
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    {formatNumber(sectors[0].last_price)}
                                </div>
                            </div>
                        </div>
                    </GlassCard>

                    {/* Top Loser */}
                    <GlassCard className="p-6 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <TrendingDown className="h-24 w-24 text-red-500" />
                        </div>
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <div className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-1">Top Loser</div>
                                <h3 className="text-xl font-bold text-white">{sectors[sectors.length - 1].symbol}</h3>
                            </div>
                            <div className="h-8 w-8 rounded-full bg-red-500/20 flex items-center justify-center">
                                <ArrowDownRight className="h-4 w-4 text-red-500" />
                            </div>
                        </div>
                        <div className="flex items-end justify-between">
                            <div>
                                <div className="text-2xl font-bold text-white mb-1">
                                    {sectors[sectors.length - 1].p_change}%
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    {formatNumber(sectors[sectors.length - 1].last_price)}
                                </div>
                            </div>
                        </div>
                    </GlassCard>
                </div>
            )}


            {/* Main Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {loading ? (
                    // Skeleton Loaders
                    Array(8).fill(0).map((_, i) => (
                        <div key={i} className="h-40 rounded-2xl bg-white/5 animate-pulse border border-white/5" />
                    ))
                ) : (
                    sectors.map((sector) => {
                        const isPositive = sector.p_change >= 0;
                        return (
                            <Link
                                href={`/dashboard/sectors/${encodeURIComponent(sector.symbol)}`}
                                key={sector.symbol}
                                className="block group"
                            >
                                <GlassCard
                                    className="p-6 h-full hover:bg-white/5 transition-all duration-300 border-white/5 relative overflow-hidden"
                                    glow
                                >
                                    {/* Background Glow */}
                                    <div className={`absolute -right-12 -top-12 h-32 w-32 rounded-full blur-3xl transition-opacity duration-500 opacity-0 group-hover:opacity-20 ${isPositive ? 'bg-green-500' : 'bg-red-500'}`} />

                                    <div className="flex justify-between items-start mb-6 relative z-10">
                                        <div className="flex items-center gap-3">
                                            <div className={`h-10 w-10 rounded-xl flex items-center justify-center border border-white/10 ${isPositive ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                                {getSectorIcon(sector.symbol)}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-white text-sm">{sector.symbol}</h3>
                                                <p className="text-xs text-muted-foreground">NSE Index</p>
                                            </div>
                                        </div>
                                        <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full border border-white/5 ${isPositive ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                            {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                                            {Math.abs(sector.p_change)}%
                                        </div>
                                    </div>

                                    <div className="flex items-end justify-between relative z-10">
                                        <div>
                                            <div className="text-2xl font-bold text-white tracking-tight">
                                                {formatNumber(sector.last_price)}
                                            </div>
                                            <div className={`text-xs mt-1 ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                                                {isPositive ? "+" : ""}{formatNumber(sector.change)}
                                            </div>
                                        </div>

                                        {/* Mini Sparkline visual */}
                                        <div className="flex gap-0.5 items-end h-8">
                                            {[40, 60, 45, 70, 50, 80, 65].map((h, i) => (
                                                <div
                                                    key={i}
                                                    className={`w-1 rounded-t-sm ${isPositive ? 'bg-green-500/40' : 'bg-red-500/40'}`}
                                                    style={{ height: `${h}%` }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </GlassCard>
                            </Link>
                        );
                    })
                )}
            </div >
        </div >
    );
}
