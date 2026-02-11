"use client";

import { Search as SearchIcon, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";

interface Stock {
    symbol: string;
    company_name?: string;
    last_price?: number;
}

interface StockSearchInputProps {
    onSelect: (symbol: string) => void;
    placeholder?: string;
    className?: string;
}

export function StockSearchInput({ onSelect, placeholder = "Search stocks...", className = "" }: StockSearchInputProps) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<Stock[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        const searchStocks = async () => {
            if (query.length < 1) {
                setResults([]);
                setIsOpen(false);
                return;
            }

            setLoading(true);
            try {
                const { data } = await supabase
                    .from('market_equity_quotes')
                    .select('symbol, last_price')
                    .or(`symbol.ilike.%${query}%`)
                    .order('total_traded_volume', { ascending: false })
                    .limit(10);

                if (data) {
                    setResults(data as Stock[]);
                    setIsOpen(true);
                }
            } catch (error) {
                console.error('Search error:', error);
            } finally {
                setLoading(false);
            }
        };

        const debounce = setTimeout(searchStocks, 300);
        return () => clearTimeout(debounce);
    }, [query]);

    const handleSelect = (symbol: string) => {
        setQuery("");
        setResults([]);
        setIsOpen(false);
        onSelect(symbol);
    };

    const handleClear = () => {
        setQuery("");
        setResults([]);
        setIsOpen(false);
    };

    return (
        <div ref={wrapperRef} className={`relative ${className}`}>
            <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={placeholder}
                    className="w-full pl-10 pr-10 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-500/50 focus:bg-white/10 transition-all"
                />
                {query && (
                    <button
                        onClick={handleClear}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}
            </div>

            {isOpen && (
                <div className="absolute top-full mt-2 w-full bg-slate-900 border border-white/10 rounded-lg shadow-xl max-h-80 overflow-y-auto z-50">
                    {loading ? (
                        <div className="p-4 text-center text-slate-400 text-sm">
                            <div className="animate-spin h-5 w-5 border-2 border-sky-500 border-t-transparent rounded-full mx-auto"></div>
                        </div>
                    ) : results.length === 0 ? (
                        <div className="p-4 text-center text-slate-400 text-sm">
                            No stocks found for "{query}"
                        </div>
                    ) : (
                        <div className="py-2">
                            {results.map((stock) => (
                                <button
                                    key={stock.symbol}
                                    onClick={() => handleSelect(stock.symbol)}
                                    className="w-full px-4 py-2.5 text-left hover:bg-white/10 transition-colors flex items-center justify-between group"
                                >
                                    <div>
                                        <div className="font-medium text-white group-hover:text-sky-400 transition-colors">
                                            {stock.symbol}
                                        </div>
                                    </div>
                                    {stock.last_price && (
                                        <div className="text-sm text-slate-400">
                                            ₹{stock.last_price.toFixed(2)}
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
