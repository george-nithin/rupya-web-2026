"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { GlassInput } from "@/components/ui/GlassInput";
import { cn } from "@/lib/utils";

interface Stock {
    symbol: string;
    company_name: string;
    last_price: number;
    change_percent: number;
}

interface StockSearchProps {
    onSelect: (stock: Stock) => void;
    placeholder?: string;
    className?: string;
}

export function StockSearch({ onSelect, placeholder = "Search stocks...", className }: StockSearchProps) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<Stock[]>([]);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Close on click outside
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        const searchStocks = async () => {
            if (!query || query.length < 2) {
                setResults([]);
                return;
            }

            setLoading(true);
            try {
                // Search by symbol OR company name
                const { data, error } = await supabase
                    .from('market_equity_quotes')
                    .select('symbol, company_name, last_price, change_percent')
                    .or(`symbol.ilike.%${query}%,company_name.ilike.%${query}%`)
                    .limit(5);

                if (data) {
                    setResults(data);
                    setOpen(true);
                }
            } catch (err) {
                console.error("Search error:", err);
            } finally {
                setLoading(false);
            }
        };

        const debounce = setTimeout(searchStocks, 300);
        return () => clearTimeout(debounce);
    }, [query]);

    const handleSelect = (stock: Stock) => {
        onSelect(stock);
        setQuery(stock.symbol);
        setOpen(false);
    };

    return (
        <div ref={wrapperRef} className={cn("relative w-full", className)}>
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                <GlassInput
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        if (!open) setOpen(true);
                    }}
                    placeholder={placeholder}
                    className="pl-10 w-full"
                />
                {loading && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 animate-spin" />
                )}
            </div>

            {open && results.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-[#1e1e1e]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="max-h-60 overflow-y-auto py-1">
                        {results.map((stock) => (
                            <button
                                key={stock.symbol}
                                onClick={() => handleSelect(stock)}
                                className="w-full text-left px-4 py-3 hover:bg-white/5 transition-colors group flex justify-between items-center"
                            >
                                <div>
                                    <div className="font-bold text-white group-hover:text-primary transition-colors">
                                        {stock.symbol}
                                    </div>
                                    <div className="text-xs text-slate-400 truncate max-w-[200px]">
                                        {stock.company_name}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-mono text-white">
                                        ₹{stock.last_price.toFixed(2)}
                                    </div>
                                    <div className={`text-xs font-bold ${stock.change_percent >= 0 ? "text-green-400" : "text-red-400"}`}>
                                        {stock.change_percent > 0 ? "+" : ""}{stock.change_percent}%
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {open && query.length >= 2 && results.length === 0 && !loading && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-[#1e1e1e]/95 backdrop-blur-xl border border-white/10 rounded-xl p-4 text-center text-slate-400 text-sm z-50">
                    No stocks found for "{query}"
                </div>
            )}
        </div>
    );
}
