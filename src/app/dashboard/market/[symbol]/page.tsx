"use client";

import { GlassButton } from "@/components/ui/GlassButton";
import { GlassCard } from "@/components/ui/GlassCard";
import { TVChart } from "@/components/ui/TVChart";
import { ArrowLeft, Star, Share2, TrendingUp, DollarSign, Activity, Newspaper, ChevronRight, Plus, BarChart2, Zap } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { TechIndictorsSelector } from "@/features/market/components/TechIndicatorsSelector";

// Mock Data
const mockCandles = [
    { time: "2023-12-22", open: 1560.00, high: 1572.00, low: 1555.00, close: 1565.00 },
    { time: "2023-12-23", open: 1565.00, high: 1580.00, low: 1560.00, close: 1575.00 },
    { time: "2023-12-24", open: 1575.00, high: 1590.00, low: 1570.00, close: 1585.00 },
    { time: "2023-12-25", open: 1585.00, high: 1600.00, low: 1580.00, close: 1595.00 },
    { time: "2023-12-26", open: 1595.00, high: 1610.00, low: 1590.00, close: 1600.00 },
];

export default function StockDetailPage() {
    const params = useParams();
    const symbol = (params.symbol as string || "RELIANCE").toUpperCase();
    const isPositive = true; // Mock trend

    return (
        <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
            {/* Header / Breadcrumb */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-slate-400">
                    <Link href="/dashboard/market" className="hover:text-white transition-colors">Markets</Link>
                    <ChevronRight className="h-4 w-4" />
                    <Link href="/dashboard/watchlist" className="hover:text-white transition-colors">Stocks</Link>
                    <ChevronRight className="h-4 w-4" />
                    <span className="text-white font-medium">{symbol}</span>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-slate-300">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        Market Open
                    </div>
                </div>
            </div>

            {/* Hero Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <GlassCard className="lg:col-span-8 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-50 group-hover:opacity-100 transition-opacity">
                        <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center cursor-pointer hover:bg-white/10 transition-colors">
                            <Star className="h-5 w-5 text-slate-400" />
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h1 className="text-4xl font-bold text-white tracking-tight">{symbol}</h1>
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/10 text-slate-300 border border-white/5">NSE</span>
                            </div>
                            <p className="text-slate-400 text-sm font-medium">Reliance Industries Ltd.</p>

                            <div className="mt-6 flex items-baseline gap-4">
                                <span className="text-5xl font-bold text-white tracking-tighter">₹2,987.50</span>
                                <div className="flex items-center gap-1 text-lg font-medium text-green-400">
                                    <TrendingUp className="h-5 w-5" />
                                    <span>+34.20 (1.15%)</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-8 text-sm">
                            <div>
                                <div className="text-slate-500 mb-1 text-xs uppercase tracking-wider">Market Cap</div>
                                <div className="text-white font-semibold text-lg">₹19.5T</div>
                            </div>
                            <div>
                                <div className="text-slate-500 mb-1 text-xs uppercase tracking-wider">Volume</div>
                                <div className="text-white font-semibold text-lg">4.2M</div>
                            </div>
                            <div>
                                <div className="text-slate-500 mb-1 text-xs uppercase tracking-wider">52W High</div>
                                <div className="text-white font-semibold text-lg">₹3,024</div>
                            </div>
                        </div>
                    </div>

                    {/* Ambient Background Glow */}
                    <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-green-500/10 rounded-full blur-3xl pointer-events-none" />
                </GlassCard>

                {/* Quick Actions & Signal */}
                <div className="lg:col-span-4 grid grid-rows-2 gap-6">
                    <GlassCard className="flex flex-col justify-center">
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Analyst Rating</h3>
                        <div className="flex items-center gap-4">
                            <div className="h-16 w-16 rounded-full border-4 border-green-500/30 flex items-center justify-center bg-green-500/10">
                                <span className="text-green-400 font-bold text-lg">84%</span>
                            </div>
                            <div>
                                <div className="text-xl font-bold text-white">Strong Buy</div>
                                <div className="text-xs text-slate-400 mt-1">Based on 32 analysts</div>
                            </div>
                            <div className="ml-auto">
                                <GlassButton size="sm" className="bg-green-500 hover:bg-green-600 text-white border-none shadow-[0_0_15px_rgba(34,197,94,0.3)]">
                                    Buy Now
                                </GlassButton>
                            </div>
                        </div>
                    </GlassCard>

                    <GlassCard className="flex flex-col justify-center">
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Actions</h3>
                        <div className="flex gap-3">
                            <GlassButton className="flex-1" variant="secondary">
                                <Plus className="h-4 w-4 mr-2" /> Watchlist
                            </GlassButton>
                            <GlassButton className="flex-1" variant="secondary">
                                <BarChart2 className="h-4 w-4 mr-2" /> Journal
                            </GlassButton>
                            <GlassButton className="flex-initial px-3" variant="secondary">
                                <Share2 className="h-4 w-4" />
                            </GlassButton>
                        </div>
                    </GlassCard>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* Left Column: Chart & News */}
                <div className="lg:col-span-8 space-y-6">
                    <GlassCard className="p-0 overflow-hidden min-h-[500px] flex flex-col">
                        <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/5">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2 text-sm text-white font-medium">
                                    <Activity className="h-4 w-4 text-sky-400" />
                                    Price Chart
                                </div>
                                <div className="h-4 w-px bg-white/10" />
                                <div className="flex gap-1">
                                    {['Price', 'Vol', 'RSI'].map(type => (
                                        <button key={type} className="px-2 py-1 text-[10px] rounded hover:bg-white/10 text-slate-400 transition-colors">
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-black/20 p-1 rounded-lg flex gap-1">
                                {['1D', '1W', '1M', '3M', '1Y', '5Y'].map((tf, i) => (
                                    <button
                                        key={tf}
                                        className={`text-[10px] px-3 py-1 rounded-md font-medium transition-all ${i === 2 ? 'bg-white/10 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'
                                            }`}
                                    >
                                        {tf}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="flex-1 p-4 relative">
                            <TVChart data={mockCandles} />
                        </div>
                    </GlassCard>

                    {/* News Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <GlassCard>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-bold text-white">Latest News</h3>
                                <Zap className="h-4 w-4 text-yellow-400" />
                            </div>
                            <div className="space-y-4">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="group cursor-pointer">
                                        <div className="text-xs text-sky-400 mb-1 font-medium">Finance • 2h ago</div>
                                        <div className="text-sm text-slate-200 group-hover:text-white transition-colors line-clamp-2">
                                            Reliance likely to announce major green energy partnership this week.
                                        </div>
                                        <div className="h-px w-full bg-white/5 mt-3 group-last:hidden" />
                                    </div>
                                ))}
                            </div>
                        </GlassCard>

                        <TechIndictorsSelector />
                    </div>
                </div>

                {/* Right Column: Metrics & Stats */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Technicals Card */}
                    <GlassCard>
                        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                            <Activity className="h-4 w-4 text-purple-400" />
                            Technical Indicators
                        </h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5">
                                <div>
                                    <div className="text-xs text-slate-500">RSI (14)</div>
                                    <div className="text-sm font-bold text-white mt-1">64.2</div>
                                </div>
                                <div className="px-2 py-1 rounded bg-purple-500/20 text-purple-400 text-[10px] font-bold">NEUTRAL</div>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5">
                                <div>
                                    <div className="text-xs text-slate-500">MACD</div>
                                    <div className="text-sm font-bold text-white mt-1">Bullish X</div>
                                </div>
                                <div className="px-2 py-1 rounded bg-green-500/20 text-green-400 text-[10px] font-bold">BUY</div>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5">
                                <div>
                                    <div className="text-xs text-slate-500">200 DMA</div>
                                    <div className="text-sm font-bold text-white mt-1">Above</div>
                                </div>
                                <div className="px-2 py-1 rounded bg-green-500/20 text-green-400 text-[10px] font-bold">STRONG</div>
                            </div>
                        </div>
                    </GlassCard>

                    {/* Fundamentals Card */}
                    <GlassCard>
                        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                            <BarChart2 className="h-4 w-4 text-orange-400" />
                            Fundamentals
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-center">
                                <div className="text-[10px] text-slate-500 uppercase">P/E Ratio</div>
                                <div className="text-lg font-bold text-white mt-1">28.4</div>
                            </div>
                            <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-center">
                                <div className="text-[10px] text-slate-500 uppercase">ROE</div>
                                <div className="text-lg font-bold text-green-400 mt-1">14.2%</div>
                            </div>
                            <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-center">
                                <div className="text-[10px] text-slate-500 uppercase">Div Yield</div>
                                <div className="text-lg font-bold text-white mt-1">0.3%</div>
                            </div>
                            <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-center">
                                <div className="text-[10px] text-slate-500 uppercase">EPS</div>
                                <div className="text-lg font-bold text-white mt-1">₹104</div>
                            </div>
                        </div>
                    </GlassCard>

                    {/* Market Depth Preview */}
                    <GlassCard>
                        <h3 className="text-sm font-bold text-white mb-4">Market Depth</h3>
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs mb-2 text-slate-500 uppercase font-bold">
                                <span>Bid</span>
                                <span>Ask</span>
                            </div>
                            {[1, 2, 3].map(i => (
                                <div key={i} className="flex justify-between items-center text-xs">
                                    <div className="text-green-400 font-mono">1,240 @ 2987.40</div>
                                    <div className="text-red-400 font-mono">500 @ 2987.55</div>
                                </div>
                            ))}
                        </div>
                    </GlassCard>

                </div>
            </div>
        </div>
    );
}
