"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { GlassCard } from "@/components/ui/GlassCard";
import { ArrowLeft, TrendingUp, TrendingDown, Activity, RefreshCw } from "lucide-react";

interface Stock {
    symbol: string;
    description: string;
    last_price: number;
    percent_change: number;
    volume: number;
    sector: string;
}

// Mapping from NIFTY Index Name (URL param) to CSV Industry Name (DB column)
// Note: This is a heuristic. A proper many-to-many relationship table is ideal but out of scope for now.
const SECTOR_MAPPING: Record<string, string[]> = {
    "NIFTY BANK": ["Financial Services"],
    "NIFTY PSU BANK": ["Financial Services"],
    "NIFTY IT": ["Information Technology"],
    "NIFTY AUTO": ["Automobile and Auto Components"],
    "NIFTY PHARMA": ["Healthcare"],
    "NIFTY FMCG": ["Fast Moving Consumer Goods"],
    "NIFTY METAL": ["Metals & Mining"],
    "NIFTY REALTY": ["Realty"],
    "NIFTY ENERGY": ["Oil Gas & Consumable Fuels", "Power"],
    "NIFTY INFRA": ["Construction", "Construction Materials", "Telecommunication", "Power"],
    "NIFTY COMMODITIES": ["Metals & Mining", "Oil Gas & Consumable Fuels", "Chemicals"],
    "NIFTY FIN SERVICE": ["Financial Services"],
};

export default function SectorDetailsPage() {
    const params = useParams();
    const router = useRouter();
    // Decode URL param, e.g., "NIFTY%20BANK" -> "NIFTY BANK"
    const sectorId = decodeURIComponent(params.sectorId as string);

    const [stocks, setStocks] = useState<Stock[]>([]);
    const [loading, setLoading] = useState(true);
    const [priceData, setPriceData] = useState<any>(null); // For index itself

    useEffect(() => {
        fetchData();
    }, [sectorId]);

    const fetchData = async () => {
        setLoading(true);

        // 1. Fetch Index Data (Mock or from market_sectors if available)
        const { data: indexData } = await supabase
            .from('market_sectors')
            .select('*')
            .eq('symbol', sectorId)
            .single();

        if (indexData) {
            setPriceData(indexData);
        }

        // 2. Fetch Stocks
        // Determine which industries correspond to this index
        const targetIndustries = SECTOR_MAPPING[sectorId] || [sectorId]; // Fallback to exact match if not in map

        let query = supabase
            .from('market_equity_quotes')
            .select('symbol, description, last_price, percent_change, volume, sector')
            .in('sector', targetIndustries)
            .order('volume', { ascending: false }) // Show most active first
            .limit(50); // Cap at 50 for performance

        const { data: stockData, error } = await query;

        if (stockData) {
            setStocks(stockData);
        } else {
            console.error(error);
        }

        setLoading(false);
    };

    const formatNumber = (num: number) => {
        return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(num);
    };

    return (
        <div className="space-y-6 p-1 pb-20 max-w-[1600px] mx-auto min-h-screen">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={() => router.back()}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-muted-foreground hover:text-foreground"
                >
                    <ArrowLeft className="h-5 w-5" />
                </button>
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">{sectorId}</h1>
                    <p className="text-muted-foreground mt-1">
                        {priceData ? (
                            <span className={`font-mono ${priceData.p_change >= 0 ? "text-green-500" : "text-red-500"}`}>
                                {formatNumber(priceData.last_price)} ({priceData.p_change > 0 ? "+" : ""}{priceData.p_change}%)
                            </span>
                        ) : "Sector Constituent Performance"}
                    </p>
                </div>
                <div className="ml-auto">
                    <button
                        onClick={fetchData}
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-muted-foreground hover:text-white"
                    >
                        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Content */}
            <GlassCard className="overflow-hidden border-border/50">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-white/5 text-muted-foreground font-medium uppercase text-xs">
                            <tr>
                                <th className="px-6 py-4">Symbol</th>
                                <th className="px-6 py-4">Sector</th>
                                <th className="px-6 py-4 text-right">Price</th>
                                <th className="px-6 py-4 text-right">Change %</th>
                                <th className="px-6 py-4 text-right">Volume</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-6 py-4"><div className="h-4 w-24 bg-white/5 rounded" /></td>
                                        <td className="px-6 py-4"><div className="h-4 w-32 bg-white/5 rounded" /></td>
                                        <td className="px-6 py-4 text-right"><div className="h-4 w-16 bg-white/5 rounded ml-auto" /></td>
                                        <td className="px-6 py-4 text-right"><div className="h-4 w-12 bg-white/5 rounded ml-auto" /></td>
                                        <td className="px-6 py-4 text-right"><div className="h-4 w-20 bg-white/5 rounded ml-auto" /></td>
                                    </tr>
                                ))
                            ) : stocks.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                                        No stocks found for this sector mapping.
                                        <br />
                                        <span className="text-xs opacity-50">Mapping keys: {SECTOR_MAPPING[sectorId]?.join(", ") || sectorId}</span>
                                    </td>
                                </tr>
                            ) : (
                                stocks.map((stock) => (
                                    <tr
                                        key={stock.symbol}
                                        onClick={() => router.push(`/dashboard/market/${stock.symbol}`)}
                                        className="hover:bg-white/5 transition-colors cursor-pointer group"
                                    >
                                        <td className="px-6 py-4 font-medium text-foreground group-hover:text-primary transition-colors">
                                            {stock.symbol}
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground">
                                            {stock.sector}
                                        </td>
                                        <td className="px-6 py-4 text-right font-mono text-foreground">
                                            {formatNumber(stock.last_price)}
                                        </td>
                                        <td className={`px-6 py-4 text-right font-bold ${stock.percent_change >= 0 ? "text-green-500" : "text-red-500"}`}>
                                            {stock.percent_change > 0 ? "+" : ""}{stock.percent_change}%
                                        </td>
                                        <td className="px-6 py-4 text-right text-muted-foreground font-mono">
                                            {formatNumber(stock.volume)}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </GlassCard>
        </div>
    );
}
