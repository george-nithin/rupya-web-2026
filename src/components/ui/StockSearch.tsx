"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Loader2, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { GlassInput } from "@/components/ui/GlassInput";
import { cn } from "@/lib/utils";

interface Stock {
    symbol: string;
    company_name: string;
    last_price: number;
    percent_change: number;
}

interface StockSearchProps {
    onSelect: (stock: Stock) => void;
    placeholder?: string;
    className?: string;
    initialValue?: string;
}

export function StockSearch({ onSelect, placeholder = "Search stocks...", className, initialValue = "" }: StockSearchProps) {
    const [query, setQuery] = useState(initialValue);
    const [results, setResults] = useState<Stock[]>([]);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [debugError, setDebugError] = useState<string | null>(null);

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
            // Remove length check to allow fetching list when empty
            /* if (!query || query.length < 2) {
                setResults([]);
                return;
            } */

            setLoading(true);
            try {
                // Determine if we should search or list
                let queryBuilder = supabase
                    .from('market_equity_quotes')
                    .select('symbol, company_name, last_price, percent_change')
                    .limit(20);

                if (query && query.trim().length > 0) {
                    // Use textSearch for better results if ilike fails, or ensure ilike format is correct
                    // Try ilike on symbol OR company_name for flexibility
                    const searchTerm = `%${query.trim()}%`;
                    queryBuilder = queryBuilder.or(`symbol.ilike.${searchTerm},company_name.ilike.${searchTerm}`);
                } else {
                    // Default order
                    queryBuilder = queryBuilder.order('symbol', { ascending: true });
                }

                const { data, error } = await queryBuilder;

                if (error) {
                    // More visible error logging
                    console.error("StockSearch Error:", error.message, error.details);
                    setDebugError(error.message); // If we add this state back
                } else if (data) {
                    // Filter client-side if needed, but API should handle it
                    setResults(data);
                }
            } catch (err) {
                console.error("StockSearch Exception:", err);
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
                    onFocus={() => setOpen(true)}
                />

                {loading && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 animate-spin" />
                )}
            </div>

            {open && results.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-popover backdrop-blur-xl border border-border rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="max-h-60 overflow-y-auto py-1">
                        {results.map((stock) => (
                            <button
                                key={stock.symbol}
                                onClick={() => handleSelect(stock)}
                                className="w-full text-left px-4 py-3 hover:bg-accent transition-all duration-150 group flex justify-between items-center active:scale-95"
                            >
                                <div>
                                    <div className="font-bold text-foreground group-hover:text-primary transition-all duration-150">
                                        {stock.symbol}
                                    </div>
                                    <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                                        {stock.company_name}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-mono text-foreground">
                                        ₹{stock.last_price.toFixed(2)}
                                    </div>
                                    <div className={`text-xs font-bold ${stock.percent_change >= 0 ? "text-green-400" : "text-red-400"}`}>
                                        {stock.percent_change > 0 ? "+" : ""}{stock.percent_change}%
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {open && query.length >= 2 && results.length === 0 && !loading && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-popover backdrop-blur-xl border border-border rounded-xl p-4 text-center text-muted-foreground text-sm z-50">
                    No stocks found for "{query}"
                </div>
            )}
        </div>
    );
}
