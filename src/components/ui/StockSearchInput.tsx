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
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={placeholder}
                    className="w-full pl-10 pr-10 py-2.5 bg-card/20 border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-sky-500/50 focus:bg-card/30 transition-all"
                />
                {query && (
                    <button
                        onClick={handleClear}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-all duration-150"
                    >
                        <X className="h-5 w-5" />
                    </button>
                )}
            </div>

            {isOpen && (
                <div className="absolute top-full mt-2 w-full bg-card border border-border rounded-xl shadow-xl max-h-80 overflow-y-auto z-50">
                    {loading ? (
                        <div className="p-4 text-center text-muted-foreground text-sm">
                            <div className="animate-spin h-5 w-5 border-2 border-sky-500 border-t-transparent rounded-full mx-auto"></div>
                        </div>
                    ) : results.length === 0 ? (
                        <div className="p-4 text-center text-muted-foreground text-sm">
                            No stocks found for "{query}"
                        </div>
                    ) : (
                        <div className="py-2">
                            {results.map((stock) => (
                                <button
                                    key={stock.symbol}
                                    onClick={() => handleSelect(stock.symbol)}
                                    className="w-full px-4 py-2.5 text-left hover:bg-card/30 transition-all duration-150 flex items-center justify-between group active:scale-95"
                                >
                                    <div>
                                        <div className="font-medium text-white group-hover:text-sky-400 transition-all duration-150">
                                            {stock.symbol}
                                        </div>
                                    </div>
                                    {stock.last_price && (
                                        <div className="text-sm text-muted-foreground">
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
