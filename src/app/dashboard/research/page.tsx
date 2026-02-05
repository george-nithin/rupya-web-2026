"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { GlassInput } from "@/components/ui/GlassInput";
import { Plus, X } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface StockQuote {
    symbol: string;
    last_price: number;
    pe_ratio: number;
    market_cap: number; // in Crores
    roe: number;
    pchange_1y: number;
    pchange_30d: number;
    volume_avg_30d: number;
}

export default function ComparisonPage() {
    const [view, setView] = useState<'fundamental' | 'performance'>('fundamental');
    const [selectedSymbols, setSelectedSymbols] = useState<string[]>(['RELIANCE', 'TCS', 'HDFCBANK']);
    const [stockData, setStockData] = useState<StockQuote[]>([]);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        if (selectedSymbols.length > 0) {
            fetchStockData();
        } else {
            setStockData([]);
        }
    }, [selectedSymbols]);

    const fetchStockData = async () => {
        const { data, error } = await supabase
            .from('market_equity_quotes')
            .select('symbol, last_price, pe_ratio, market_cap, roe, pchange_1y, pchange_30d, volume_avg_30d')
            .in('symbol', selectedSymbols);

        if (data) {
            // Sort data to match the order of selectedSymbols for consistent column ordering
            const sortedData = selectedSymbols.map(sym => data.find(d => d.symbol === sym)).filter(Boolean) as StockQuote[];
            setStockData(sortedData);
        }
    };

    const addSymbol = () => {
        if (searchQuery && !selectedSymbols.includes(searchQuery.toUpperCase())) {
            setSelectedSymbols([...selectedSymbols, searchQuery.toUpperCase()]);
            setSearchQuery("");
        }
    };

    const removeSymbol = (symbol: string) => {
        setSelectedSymbols(selectedSymbols.filter(s => s !== symbol));
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-white">Stock Comparison</h1>
                    <p className="text-slate-400">Compare assets side-by-side</p>
                </div>
                <div className="flex gap-2">
                    <GlassInput
                        placeholder="Add symbol (e.g. INFY)"
                        className="w-64"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addSymbol()}
                    />
                    <GlassButton onClick={addSymbol}>
                        <Plus className="h-4 w-4" />
                    </GlassButton>
                </div>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex gap-2 flex-wrap">
                    {selectedSymbols.map(stock => (
                        <div key={stock} className="flex items-center px-3 py-1 bg-white/10 rounded-full text-sm text-white border border-white/5">
                            {stock}
                            <button onClick={() => removeSymbol(stock)} className="ml-2 hover:text-red-400 transition-colors"><X className="h-3 w-3" /></button>
                        </div>
                    ))}
                </div>
                <div className="flex gap-2 bg-white/5 p-1 rounded-lg border border-white/10">
                    <button
                        onClick={() => setView('fundamental')}
                        className={`px-3 py-1.5 rounded text-sm font-medium transition-all ${view === 'fundamental' ? 'bg-sky-500 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
                    >
                        Fundamentals
                    </button>
                    <button
                        onClick={() => setView('performance')}
                        className={`px-3 py-1.5 rounded text-sm font-medium transition-all ${view === 'performance' ? 'bg-sky-500 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
                    >
                        Performance
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <GlassCard className="min-w-[800px]">
                    <div className="p-1">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="text-slate-400 border-b border-white/10">
                                <tr>
                                    <th className="p-4 bg-white/5 sticky left-0 font-medium z-10 w-48">Metric</th>
                                    {stockData.map(stock => (
                                        <th key={stock.symbol} className="p-4 font-bold text-white text-center border-l border-white/5">
                                            {stock.symbol}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {view === 'fundamental' && (
                                    <>
                                        <tr>
                                            <td className="p-4 font-medium text-slate-300 sticky left-0 bg-slate-900/90 backdrop-blur-md">Price</td>
                                            {stockData.map(stock => (
                                                <td key={stock.symbol} className="p-4 text-center text-white border-l border-white/5">₹{stock.last_price}</td>
                                            ))}
                                        </tr>
                                        <tr>
                                            <td className="p-4 font-medium text-slate-300 sticky left-0 bg-slate-900/90 backdrop-blur-md">P/E Ratio</td>
                                            {stockData.map(stock => (
                                                <td key={stock.symbol} className="p-4 text-center text-white border-l border-white/5">{stock.pe_ratio || '-'}</td>
                                            ))}
                                        </tr>
                                        <tr>
                                            <td className="p-4 font-medium text-slate-300 sticky left-0 bg-slate-900/90 backdrop-blur-md">Market Cap (Cr)</td>
                                            {stockData.map(stock => (
                                                <td key={stock.symbol} className="p-4 text-center text-white border-l border-white/5">
                                                    {stock.market_cap ? `₹${(stock.market_cap / 10000000).toFixed(0)}Cr` : '-'}
                                                </td>
                                            ))}
                                        </tr>
                                        <tr>
                                            <td className="p-4 font-medium text-slate-300 sticky left-0 bg-slate-900/90 backdrop-blur-md">ROE</td>
                                            {stockData.map(stock => (
                                                <td key={stock.symbol} className="p-4 text-center text-white border-l border-white/5">
                                                    {stock.roe ? `${stock.roe}%` : '-'}
                                                </td>
                                            ))}
                                        </tr>
                                    </>
                                )}
                                {view === 'performance' && (
                                    <>
                                        <tr>
                                            <td className="p-4 font-medium text-slate-300 sticky left-0 bg-slate-900/90 backdrop-blur-md">1M Change</td>
                                            {stockData.map(stock => (
                                                <td key={stock.symbol} className={`p-4 text-center border-l border-white/5 font-medium ${stock.pchange_30d >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                    {stock.pchange_30d ? `${stock.pchange_30d}%` : '-'}
                                                </td>
                                            ))}
                                        </tr>
                                        <tr>
                                            <td className="p-4 font-medium text-slate-300 sticky left-0 bg-slate-900/90 backdrop-blur-md">1Y Change</td>
                                            {stockData.map(stock => (
                                                <td key={stock.symbol} className={`p-4 text-center border-l border-white/5 font-bold ${stock.pchange_1y >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                    {stock.pchange_1y ? `${stock.pchange_1y}%` : '-'}
                                                </td>
                                            ))}
                                        </tr>
                                    </>
                                )}
                            </tbody>
                        </table>
                    </div>
                </GlassCard>
            </div>
        </div>
    );
}
