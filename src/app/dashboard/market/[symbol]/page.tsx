"use client";

import { GlassButton } from "@/components/ui/GlassButton";
import { GlassCard } from "@/components/ui/GlassCard";
import { TVChart } from "@/components/ui/TVChart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { ArrowLeft, Star, Share2, TrendingUp, DollarSign, Activity, Newspaper, ChevronRight, Plus, BarChart2, Zap, TrendingDown, X, BookOpen } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { TechIndictorsSelector } from "@/features/market/components/TechIndicatorsSelector";
import { TechnicalSignals } from "@/features/market/components/TechnicalSignals";
import { StockFundamentals } from "@/features/market/components/StockFundamentals";
import { MarketDepth } from "@/features/market/components/MarketDepth";
import { ShareholdingPattern } from "@/features/market/components/ShareholdingPattern";
import { CompanyProfile } from "@/features/market/components/CompanyProfile";
import { PeerComparison } from "@/features/market/components/PeerComparison";
import { StockNews } from "@/features/market/components/StockNews";
import { StockSpotlight, FinancialsChart } from "@/features/market/components/StockSpotlight";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function StockDetailPage() {
    const params = useParams();
    const symbol = (params.symbol as string || "RELIANCE").toUpperCase();
    const [stockData, setStockData] = useState<any>(null);
    const [technicals, setTechnicals] = useState<any>(null);
    const [stock, setStock] = useState<any>(null);
    const [fundamentals, setFundamentals] = useState<any>(null);
    const [inWatchlist, setInWatchlist] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStockDetails();
    }, [symbol]);

    const fetchStockDetails = async () => {
        try {
            const { data: quote } = await supabase.from('market_equity_quotes').select('*').eq('symbol', symbol).single();
            setStockData(quote);
            if (quote) setStock(quote); // Assuming stockData is the main quote, and 'stock' is a new state for it.

            const { data: tech } = await supabase.from('market_technicals').select('*').eq('symbol', symbol).single();
            setTechnicals(tech);

            // Fetch fundamentals
            const { data: fundData } = await supabase
                .from('stock_fundamentals')
                .select('*')
                .eq('symbol', symbol)
                .single();

            if (fundData) setFundamentals(fundData);

            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: watch } = await supabase.from('user_watchlist').select('symbol').eq('user_id', user.id).eq('symbol', symbol).single();
                setInWatchlist(!!watch);
            }
        } catch (err) {
            console.error("Error fetching stock data:", err);
        } finally {
            setLoading(false);
        }
    };

    const toggleWatchlist = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        if (inWatchlist) {
            await supabase.from('user_watchlist').delete().eq('user_id', user.id).eq('symbol', symbol);
            setInWatchlist(false);
        } else {
            await supabase.from('user_watchlist').upsert({ user_id: user.id, symbol });
            setInWatchlist(true);
        }
    };

    if (loading && !stockData) return <div className="h-screen flex items-center justify-center text-slate-500">Loading {symbol} Details...</div>;

    const isPositive = (stockData?.percent_change || 0) >= 0;

    return (
        <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
            {/* Header / Breadcrumb */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Link href="/dashboard/market" className="hover:text-foreground transition-colors">Markets</Link>
                    <ChevronRight className="h-4 w-4" />
                    <Link href="/dashboard/watchlist" className="hover:text-foreground transition-colors">Watchlist</Link>
                    <ChevronRight className="h-4 w-4" />
                    <span className="text-foreground font-medium">{symbol}</span>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/50 border border-border/50 text-xs text-muted-foreground">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        Live NSE Data
                    </div>
                </div>
            </div>

            {/* Main Hero: Price & Chart - Always Visible */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-12">
                    <GlassCard className="p-0 overflow-hidden relative group min-h-[500px] flex flex-col border-border/50 shadow-sm">
                        {/* Header Section */}
                        <div className="p-6 border-b border-border/50 bg-card/50">
                            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                                <div>
                                    <div className="flex items-center gap-3">
                                        <h1 className="text-4xl font-bold text-foreground tracking-tight">{symbol}</h1>
                                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-secondary/50 text-muted-foreground border border-border/50">NSE</span>
                                        <button
                                            onClick={toggleWatchlist}
                                            className={`h-8 w-8 rounded-full flex items-center justify-center cursor-pointer transition-colors ${inWatchlist ? "bg-sky-500/20 text-sky-500" : "bg-secondary text-muted-foreground hover:bg-secondary/80"}`}
                                        >
                                            <Star className={`h-4 w-4 ${inWatchlist ? "fill-sky-500" : ""}`} />
                                        </button>
                                    </div>
                                    <p className="text-muted-foreground text-sm font-medium mt-1">{stockData?.company_name || "Company Details"}</p>
                                </div>
                                <div className="text-left md:text-right">
                                    <div className="text-3xl font-bold text-foreground tracking-tighter">₹{stockData?.last_price?.toLocaleString()}</div>
                                    <div className={`flex items-center md:justify-end gap-1 text-sm font-medium ${isPositive ? "text-emerald-500" : "text-red-500"}`}>
                                        {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                                        <span>{stockData?.change > 0 ? "+" : ""}{stockData?.change} ({stockData?.percent_change}%)</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Chart Area */}
                        <div className="flex-1 relative bg-background/50">
                            <TVChart data={[]} />
                        </div>

                        {/* Action Bar */}
                        <div className="p-4 border-t border-border/50 bg-card/30 flex flex-col md:flex-row justify-between items-center gap-4">
                            <div className="flex gap-6 text-sm text-muted-foreground">
                                <span>Vol: <span className="text-foreground font-mono">{(stockData?.total_traded_volume / 1000000).toFixed(2)}M</span></span>
                                <span>Open: <span className="text-foreground font-mono">₹{stockData?.open}</span></span>
                                <span>High: <span className="text-foreground font-mono">₹{stockData?.day_high}</span></span>
                                <span>Low: <span className="text-foreground font-mono">₹{stockData?.day_low}</span></span>
                            </div>
                            <GlassButton variant="secondary" onClick={() => window.location.href = `/dashboard/journal/edit/new?symbol=${symbol}`}>
                                <BookOpen className="h-4 w-4 mr-2" /> Log Trade
                            </GlassButton>
                        </div>
                    </GlassCard>
                </div>
            </div>

            {/* Tabbed Detailed View */}
            <Tabs defaultValue="overview" className="w-full">
                <TabsList className="w-full md:w-auto grid grid-cols-2 md:inline-flex md:grid-cols-none h-auto md:h-12 gap-2">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="technicals">Technicals</TabsTrigger>
                    <TabsTrigger value="fundamentals">Fundamentals</TabsTrigger>
                    <TabsTrigger value="news">News & Peers</TabsTrigger>
                </TabsList>

                {/* TAB 1: OVERVIEW */}
                <TabsContent value="overview">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                        {/* Left: Spotlight & Profile */}
                        <div className="md:col-span-8 space-y-6">
                            <StockSpotlight symbol={symbol} technicals={technicals} fundamentals={stockData} />
                            <CompanyProfile symbol={symbol} description={stockData?.description} />
                        </div>
                        {/* Right: Quick Stats Sidebar */}
                        <div className="md:col-span-4 space-y-6">
                            <StockFundamentals data={fundamentals} compact={true} />
                            <GlassCard>
                                <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                                    <Activity className="h-4 w-4 text-primary" />
                                    Market Status
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Status</span>
                                        <span className="text-emerald-500 font-bold">Open</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Trend</span>
                                        <span className={`font-bold ${isPositive ? "text-emerald-500" : "text-red-500"}`}>{isPositive ? "Bullish" : "Bearish"}</span>
                                    </div>
                                </div>
                            </GlassCard>
                        </div>
                    </div>
                </TabsContent>

                {/* TAB 2: TECHNICALS */}
                <TabsContent value="technicals">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                        <div className="md:col-span-8">
                            <div className="grid grid-cols-1 gap-6">
                                <TechnicalSignals data={technicals} />
                                <MarketDepth />
                            </div>
                        </div>
                        <div className="md:col-span-4 space-y-6">
                            <GlassCard>
                                <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                                    <Zap className="h-4 w-4 text-primary" />
                                    Live Indicators
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center p-3 bg-secondary/30 rounded-xl border border-border/50">
                                        <div>
                                            <div className="text-xs text-muted-foreground">RSI (14)</div>
                                            <div className="text-sm font-bold text-foreground mt-1">{technicals?.rsi_14?.toFixed(2) || "N/A"}</div>
                                        </div>
                                        <div className={`px-2 py-1 rounded text-[10px] font-bold ${(technicals?.rsi_14 || 50) > 70 ? "bg-destructive/20 text-destructive" : (technicals?.rsi_14 || 50) < 30 ? "bg-emerald-500/20 text-emerald-500" : "bg-primary/20 text-primary"}`}>
                                            {(technicals?.rsi_14 || 50) > 70 ? "OVERBOUGHT" : (technicals?.rsi_14 || 50) < 30 ? "OVERSOLD" : "NEUTRAL"}
                                        </div>
                                    </div>
                                    {/* Add more indicators here if available */}
                                </div>
                            </GlassCard>
                        </div>
                    </div>
                </TabsContent>

                {/* TAB 3: FUNDAMENTALS */}
                <TabsContent value="fundamentals">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                        <div className="md:col-span-8 space-y-6">
                            <FinancialsChart data={fundamentals} />
                            <ShareholdingPattern />
                            {/* Fundamentals */}
                            <div className="h-[400px]">
                                <StockFundamentals data={fundamentals} />
                            </div>
                        </div>
                        <div className="md:col-span-4">
                            <StockFundamentals data={fundamentals} />
                        </div>
                    </div>
                </TabsContent>

                {/* TAB 4: NEWS & PEERS */}
                <TabsContent value="news">
                    <div className="space-y-6">
                        <StockNews symbol={symbol} />
                        <PeerComparison currentSymbol={symbol} />
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
