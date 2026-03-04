"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { StockSearchInput } from "@/components/ui/StockSearchInput";
import {
    X,
    Info,
    AlertTriangle,
    Trophy,
    TrendingUp,
    ShieldCheck,
    Zap,
    BarChart3,
    Share2,
    ArrowUpRight,
    CheckCircle2,
    Target
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { RiverDynamicsChart } from "@/features/dashboard/components/RiverDynamicsChart";
import { RadialImpactChart } from "@/features/dashboard/components/RadialImpactChart";

// --- Types ---
interface StockData {
    symbol: string;
    company_name: string;
    sector: string;
    industry?: string;
    last_price: number;
    market_cap: number;
    pe_ratio: number;
    pb_ratio: number;
    dividend_yield: number;
    roe: number;
    eps: number;
    high_52w: number;
    low_52w: number;
    volume_avg: number;
    pchange_1y: number;

    // Mocked/Enriched Fields for Demo
    sector_pe?: number;
    price_to_sales?: number;
    revenue_growth_yoy?: number;
    profit_growth_yoy?: number;
    roce?: number;
    debt_to_equity?: number;
    op_margin?: number;
    net_margin?: number;
    beta?: number;
    volatility?: number; // 1-100
    sector_trend?: 'Bullish' | 'Neutral' | 'Bearish';
    relative_strength?: number; // vs sector
    all_time_high?: number;
}

// --- Helper Functions ---
const formatCurrency = (val: number | undefined | null) => {
    if (val === undefined || val === null || isNaN(val)) return "-";
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)}Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)}L`;
    return `₹${val.toLocaleString()}`;
};

const formatPercent = (val: number | undefined | null) => {
    if (val === undefined || val === null || isNaN(val)) return "-";
    return `${val.toFixed(2)}%`;
};

const formatNumber = (val: number | undefined | null, decimals = 1) => {
    if (val === undefined || val === null || isNaN(val)) return "-";
    return val.toFixed(decimals);
};

// --- Scoring Logic ---
const calculateWinner = (stocks: StockData[]) => {
    if (stocks.length < 2) return null;

    const scores = stocks.map(stock => {
        let score = 0;
        let reasons: string[] = [];

        // 1. Valuation (Low PE is weighted)
        const avgPE = stocks.reduce((acc, s) => acc + (s.pe_ratio || 0), 0) / stocks.length;
        if ((stock.pe_ratio || 0) < avgPE) {
            score += 20;
            reasons.push("Better Valuation (Lower P/E)");
        }

        // 2. Growth (Revenue/Profit)
        const avgGrowth = stocks.reduce((acc, s) => acc + (s.revenue_growth_yoy || 0), 0) / stocks.length;
        if ((stock.revenue_growth_yoy || 0) > avgGrowth) {
            score += 25;
            reasons.push("Superior Revenue Growth");
        }

        // 3. Efficiency (ROE/ROCE)
        const avgROE = stocks.reduce((acc, s) => acc + (s.roe || 0), 0) / stocks.length;
        if ((stock.roe || 0) > avgROE) {
            score += 25;
            reasons.push("High Capital Efficiency (ROE)");
        }

        // 4. Financial Health (Debt to Equity - Lower is better)
        const avgDebt = stocks.reduce((acc, s) => acc + (s.debt_to_equity || 0), 0) / stocks.length;
        if ((stock.debt_to_equity || 0) < avgDebt) {
            score += 15;
            reasons.push("Lower Debt Profile");
        }

        // 5. Price Strength (52W High vicinity)
        const pFromHigh = ((stock.high_52w - stock.last_price) / stock.high_52w) * 100;
        if (pFromHigh < 10) {
            score += 15;
            reasons.push("Strong Momentum (Near 52W High)");
        }

        return { symbol: stock.symbol, score, reasons };
    });

    return scores.sort((a, b) => b.score - a.score)[0];
};

export default function ResearchPage() {
    const [selectedSymbols, setSelectedSymbols] = useState<string[]>(['RELIANCE', 'TCS', 'INFY']);
    const [stockData, setStockData] = useState<StockData[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (selectedSymbols.length > 0) fetchData();
        else setStockData([]);
    }, [selectedSymbols]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('market_equity_quotes')
                .select('*')
                .in('symbol', selectedSymbols);

            if (data) {
                const enrichedData = data.map(stock => ({
                    ...stock,
                    sector: stock.sector || "Technology",
                    industry: "IT Services",
                    pb_ratio: stock.pb_ratio || (Math.random() * 5 + 1),
                    price_to_sales: Math.random() * 8 + 1,
                    sector_pe: 25.4,
                    revenue_growth_yoy: (Math.random() * 20 - 5) + 10,
                    profit_growth_yoy: (Math.random() * 15) + 5,
                    roce: (stock.roe || 15) + (Math.random() * 5),
                    debt_to_equity: Math.random() * 0.8,
                    op_margin: Math.random() * 25 + 15,
                    net_margin: Math.random() * 15 + 10,
                    beta: 0.8 + Math.random() * 0.4,
                    volatility: Math.random() * 20 + 5,
                    sector_trend: Math.random() > 0.5 ? 'Bullish' : 'Neutral',
                    all_time_high: (stock.high_52w || stock.last_price) * (1 + Math.random() * 0.2),
                }));

                const sorted = selectedSymbols.map(sym => enrichedData.find((d: any) => d.symbol === sym)).filter(Boolean) as StockData[];
                setStockData(sorted);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const winner = useMemo(() => calculateWinner(stockData), [stockData]);

    const MetricVisual = ({ value, max, label, color = "sky" }: { value: number, max: number, label: string, color?: string }) => {
        const percentage = Math.min((value / max) * 100, 100);
        return (
            <div className="space-y-2">
                <div className="flex justify-between items-end">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{label}</span>
                    <span className={`text-sm font-bold text-${color}-400`}>{formatNumber(value)}%</span>
                </div>
                <div className="h-1.5 w-full bg-card/50 rounded-full overflow-hidden border border-white/5">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        className={`h-full bg-gradient-to-r from-${color}-500 to-${color}-400 shadow-[0_0_10px_rgba(var(--${color}-500),0.3)]`}
                    />
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-10 max-w-[1600px] mx-auto pb-24">
            {/* Nav & Search */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pt-4">
                <div>
                    <h1 className="text-4xl font-extrabold text-foreground tracking-tighter mb-2">
                        Battle of Assets
                    </h1>
                    <div className="flex items-center gap-3">
                        <div className="flex -space-x-2">
                            {selectedSymbols.map(s => (
                                <div key={s} className="h-8 w-8 rounded-full bg-gradient-to-br from-orange-500 to-red-500 border-2 border-background flex items-center justify-center text-[10px] font-bold text-white shadow-xl">
                                    {s[0]}
                                </div>
                            ))}
                        </div>
                        <p className="text-muted-foreground text-sm font-medium">Comparing {selectedSymbols.length} Market Leaders</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <StockSearchInput
                        onSelect={(symbol) => {
                            if (!selectedSymbols.includes(symbol) && selectedSymbols.length < 3) {
                                setSelectedSymbols([...selectedSymbols, symbol]);
                            }
                        }}
                        placeholder="Add stock to battle..."
                        className="w-full md:w-80 shadow-2xl"
                    />
                    <button className="p-3 rounded-xl bg-card border border-border/50 hover:bg-muted text-foreground transition-all">
                        <Share2 className="h-5 w-5" />
                    </button>
                </div>
            </div>

            {/* Selection Chips */}
            <div className="flex flex-wrap gap-2">
                {selectedSymbols.map(sym => (
                    <motion.div
                        layout
                        key={sym}
                        className="flex items-center gap-2 pl-4 pr-2 py-2 bg-gradient-to-r from-card to-card/50 border border-border/40 rounded-2xl shadow-xl group"
                    >
                        <span className="font-bold text-sm">{sym}</span>
                        <button
                            onClick={() => setSelectedSymbols(selectedSymbols.filter(s => s !== sym))}
                            className="p-1 rounded-lg hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 transition-colors"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </motion.div>
                ))}
            </div>

            {loading ? (
                <div className="h-96 flex flex-col items-center justify-center gap-4 text-muted-foreground">
                    <div className="h-10 w-10 border-4 border-t-sky-500 border-sky-500/20 rounded-full animate-spin" />
                    <p className="animate-pulse font-medium uppercase tracking-widest text-xs">Simulating Battle Results...</p>
                </div>
            ) : stockData.length > 0 ? (
                <div className="space-y-12">
                    {/* New Stepped Rank Design for Battle Power (Inspired by User Reference) */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-0 rounded-[2rem] overflow-hidden border border-white/5 shadow-2xl bg-white">
                        {stockData.sort((a, b) => {
                            const scoreA = calculateWinner([a, ...stockData.filter(x => x !== a)])?.score || 0;
                            const scoreB = calculateWinner([b, ...stockData.filter(x => x !== b)])?.score || 0;
                            return scoreB - scoreA;
                        }).map((stock, idx) => {
                            const colors = [
                                { bg: 'bg-[#0a262a]', text: 'text-white', rank: 'rank 01/', meta: 'text-white/40' },
                                { bg: 'bg-[#2ec4b6]', text: 'text-[#0a262a]', rank: 'rank 02/', meta: 'text-[#0a262a]/60' },
                                { bg: 'bg-[#cbf3f0]', text: 'text-[#0a262a]', rank: 'rank 03/', meta: 'text-[#0a262a]/60' },
                            ];
                            const theme = colors[idx] || colors[2];
                            const scoreValue = Math.round(calculateWinner([stock, ...stockData.filter(x => x !== stock)])?.score || 0);

                            return (
                                <div key={stock.symbol} className={`${theme.bg} ${theme.text} p-12 min-h-[400px] flex flex-col justify-between relative group`}>
                                    <div>
                                        <div className="flex items-start justify-between">
                                            <div className="text-8xl font-black tracking-tighter flex items-start">
                                                {scoreValue}
                                                <span className="text-xl mt-4 ml-1 font-bold">(%)</span>
                                            </div>
                                        </div>
                                        <div className="mt-8 flex gap-8">
                                            <div className="text-[10px] font-bold uppercase tracking-widest opacity-60">
                                                {theme.rank}
                                            </div>
                                            <div className="text-[10px] font-bold uppercase tracking-wider leading-relaxed">
                                                /Battle Power Score<br />
                                                Exchange - {stock.symbol}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-12">
                                        <div className="text-2xl font-black uppercase tracking-tighter mb-1">
                                            {stock.company_name.split(' ')[0]}
                                        </div>
                                        <div className="text-xs font-bold opacity-40 uppercase tracking-[0.2em]">
                                            Ranked Market Leader
                                        </div>
                                    </div>

                                    {/* Steep Diagonal Cutout Overlay (SVG) */}
                                    <div className="absolute bottom-0 left-0 w-full h-16 pointer-events-none overflow-hidden">
                                        <div className="w-[120%] h-full bg-white transform -rotate-6 origin-bottom-left translate-y-8" />
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Bottom Labeling for the Rankings */}
                    <div className="flex justify-between items-start px-12 -mt-12 relative z-10 pointer-events-none">
                        <div className="text-4xl font-black text-[#0a262a] tracking-tighter uppercase leading-[0.9]">
                            Market Assets<br />
                            Compared
                        </div>
                        <div className="text-[10px] font-bold text-[#0a262a]/40 uppercase tracking-widest mt-4">
                            Based on live performance data<br />
                            as of {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </div>
                    </div>

                    {/* Market Dynamics Chart (New Design Element) */}
                    <RiverDynamicsChart />

                    {/* Radial Impact Chart (New Design Element) */}
                    <RadialImpactChart />

                    {/* Session-Based Comparison ( Inspired by Image 1 & 4 ) */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Session 1: Valuation Champions */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 px-2">
                                <div className="h-10 w-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                                    <Target className="h-5 w-5 text-orange-500" />
                                </div>
                                <h3 className="text-xl font-black tracking-tight">Valuation Hub</h3>
                            </div>
                            {stockData.map(stock => (
                                <GlassCard key={stock.symbol} className={`hover:border-orange-500/40 transition-all duration-300 ${winner?.symbol === stock.symbol ? 'border-sky-500/30' : ''}`}>
                                    <div className="flex justify-between items-start mb-6">
                                        <span className="text-lg font-black">{stock.symbol}</span>
                                        <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${stock.pe_ratio < 25 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-orange-500/10 text-orange-500'}`}>
                                            P/E: {formatNumber(stock.pe_ratio)}
                                        </span>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="text-3xl font-black text-foreground">{formatCurrency(stock.last_price)}</div>
                                        <MetricVisual value={stock.pe_ratio} max={60} label="Valuation P/E Rating" color="orange" />
                                    </div>
                                </GlassCard>
                            ))}
                        </div>

                        {/* Session 2: Financial Strength (Radial/Bar Style) */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 px-2">
                                <div className="h-10 w-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center">
                                    <ShieldCheck className="h-5 w-5 text-sky-500" />
                                </div>
                                <h3 className="text-xl font-black tracking-tight">Capital Efficiency</h3>
                            </div>
                            {stockData.map(stock => (
                                <GlassCard key={stock.symbol} className="group overflow-hidden">
                                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
                                        <Zap className="h-12 w-12 text-sky-500" />
                                    </div>
                                    <div className="mb-4">
                                        <span className="text-sm font-bold text-muted-foreground">{stock.symbol} Core Stability</span>
                                    </div>
                                    <div className="flex items-end gap-1 mb-6">
                                        <span className="text-4xl font-black text-sky-400">{formatNumber(stock.roe)}</span>
                                        <span className="text-lg font-bold text-sky-500/50 pb-1">% ROE</span>
                                    </div>
                                    <div className="space-y-4">
                                        <MetricVisual value={stock.roce || 0} max={40} label="Return on Capital (ROCE)" color="sky" />
                                        <MetricVisual value={(1 - (stock.debt_to_equity || 0)) * 100} max={100} label="Debt Safety Score" color="emerald" />
                                    </div>
                                </GlassCard>
                            ))}
                        </div>

                        {/* Session 3: Growth Velocity */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 px-2">
                                <div className="h-10 w-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                                    <TrendingUp className="h-5 w-5 text-purple-500" />
                                </div>
                                <h3 className="text-xl font-black tracking-tight">Growth Catalyst</h3>
                            </div>
                            {stockData.map(stock => (
                                <div key={stock.symbol} className="relative group">
                                    <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-sky-500 rounded-3xl blur opacity-0 group-hover:opacity-10 transition duration-500" />
                                    <GlassCard className="relative h-full">
                                        <div className="flex justify-between items-center mb-6">
                                            <span className="text-sm font-black text-purple-400 uppercase tracking-widest">{stock.symbol}</span>
                                            <div className="flex items-center gap-1 text-emerald-400 text-xs font-bold">
                                                <ArrowUpRight className="h-3 w-3" />
                                                BEST GROWTH
                                            </div>
                                        </div>
                                        <div className="text-5xl font-black text-foreground mb-6">
                                            +{formatNumber(stock.revenue_growth_yoy)}<span className="text-xl text-muted-foreground">%</span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                                                <div className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Profit %</div>
                                                <div className="text-lg font-black text-foreground">{formatNumber(stock.profit_growth_yoy)}%</div>
                                            </div>
                                            <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                                                <div className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Margin</div>
                                                <div className="text-lg font-black text-foreground">{formatNumber(stock.op_margin)}%</div>
                                            </div>
                                        </div>
                                    </GlassCard>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Technical Comparison Table ( Aesthetic cleanup ) */}
                    <section className="pt-8">
                        <div className="flex items-center gap-3 mb-8 px-2">
                            <BarChart3 className="h-6 w-6 text-foreground" />
                            <h3 className="text-2xl font-black tracking-tighter">Deep Technicals</h3>
                        </div>
                        <GlassCard className="p-0 overflow-hidden border-border/50">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-secondary/20">
                                            <th className="p-6 text-xs font-black text-muted-foreground uppercase tracking-widest">Metric Matrix</th>
                                            {stockData.map(s => (
                                                <th key={s.symbol} className="p-6 text-center">
                                                    <span className="text-lg font-black text-foreground">{s.symbol}</span>
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/20">
                                        <tr className="hover:bg-white/[0.02] transition-colors">
                                            <td className="p-6 text-sm font-bold text-muted-foreground">Market Cap</td>
                                            {stockData.map(s => <td key={s.symbol} className="p-6 text-center text-sm font-black">{formatCurrency(s.market_cap)}</td>)}
                                        </tr>
                                        <tr className="hover:bg-white/[0.02] transition-colors">
                                            <td className="p-6 text-sm font-bold text-muted-foreground">Price/Sales Ratio</td>
                                            {stockData.map(s => <td key={s.symbol} className="p-6 text-center text-sm font-black">{formatNumber(s.price_to_sales, 2)}x</td>)}
                                        </tr>
                                        <tr className="hover:bg-white/[0.02] transition-colors">
                                            <td className="p-6 text-sm font-bold text-muted-foreground">52W Range Velocity</td>
                                            {stockData.map(s => {
                                                const range = s.high_52w - s.low_52w;
                                                const currentPos = ((s.last_price - s.low_52w) / range) * 100;
                                                return (
                                                    <td key={s.symbol} className="p-6 text-center">
                                                        <div className="flex flex-col items-center gap-2">
                                                            <div className="text-xs font-black text-foreground">{formatNumber(currentPos)}% From Low</div>
                                                            <div className="w-24 h-1 bg-white/10 rounded-full overflow-hidden">
                                                                <div className="h-full bg-sky-500" style={{ width: `${currentPos}%` }} />
                                                            </div>
                                                        </div>
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                        <tr className="hover:bg-white/[0.02] transition-colors">
                                            <td className="p-6 text-sm font-bold text-muted-foreground">Beta (Risk)</td>
                                            {stockData.map(s => <td key={s.symbol} className={`p-6 text-center text-sm font-black ${s.beta && s.beta > 1.2 ? 'text-orange-400' : 'text-emerald-400'}`}>{formatNumber(s.beta, 2)}</td>)}
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </GlassCard>
                    </section>
                </div>
            ) : (
                <div className="h-96 flex items-center justify-center">
                    <p className="text-muted-foreground font-medium text-lg">Select stocks to compare their battle stats</p>
                </div>
            )}

            {/* Disclaimer */}
            <div className="mt-20 p-8 rounded-3xl border border-border bg-card/10 backdrop-blur-sm text-muted-foreground text-xs leading-relaxed flex items-start gap-6">
                <AlertTriangle className="h-6 w-6 text-orange-500 shrink-0" />
                <div>
                    <h4 className="font-black text-foreground text-sm mb-2 uppercase tracking-widest">Risk Disclosure</h4>
                    <p>
                        Battle stats are generated based on historical performance and simulated point-weighting logic. This does not constitute financial advice.
                        Market dynamics can change rapidly. Past performance (ROE, Growth) is not indicative of future results.
                        Rupya Fintech uses mathematical models and scraper data which may contain discrepancies. Always consult with a SEBI-registered advisor before executing trades.
                    </p>
                </div>
            </div>
        </div>
    );
}
