import { GlassCard } from "@/components/ui/GlassCard";
import { Info } from "lucide-react";

interface StockFundamentalsProps {
    data: any;
    compact?: boolean;
}

export function StockFundamentals({ data, compact = false }: StockFundamentalsProps) {
    // Data comes from stock_fundamentals table
    // Keys: market_cap, stock_pe, roce, roe, etc. (all strings from Screener)
    const metrics = [
        { label: "Market Cap", value: data?.market_cap || "N/A", tooltip: "Total value of all shares" },
        { label: "P/E Ratio", value: data?.stock_pe || "N/A", tooltip: "Price to Earnings Ratio" },
        { label: "Book Value", value: data?.book_value || "N/A", tooltip: "Price to Book Ratio" },
        { label: "Div Yield", value: data?.dividend_yield || "N/A", tooltip: "Annual Dividend Yield" },
        { label: "ROCE", value: data?.roce || "N/A", tooltip: "Return on Capital Employed" },
        { label: "ROE", value: data?.roe || "N/A", tooltip: "Return on Equity" },
        { label: "High / Low", value: data?.high_low || "N/A" },
        { label: "Face Value", value: data?.face_value || "N/A" },
    ];

    const displayMetrics = compact ? metrics.slice(0, 4) : metrics;

    return (
        <GlassCard className="h-full flex flex-col">
            <h3 className="text-sm font-bold text-foreground mb-4 flex items-center justify-between shrink-0">
                Fundamentals
                <Info className="h-4 w-4 text-muted-foreground" />
            </h3>

            <div className={`grid ${compact ? 'grid-cols-1 gap-3' : 'grid-cols-2 gap-4'} mb-4`}>
                {displayMetrics.map((m, i) => (
                    <div key={i} className="flex flex-col border-b border-border/10 pb-2 last:border-0 last:pb-0">
                        <span className="text-xs text-muted-foreground mb-1">{m.label}</span>
                        <span className={`text-sm font-bold text-foreground`}>{m.value}</span>
                    </div>
                ))}
            </div>

            {!compact && (data?.pros?.length > 0 || data?.cons?.length > 0) && (
                <div className="mt-4 pt-4 border-t border-white/10 grow overflow-y-auto">
                    {data?.pros?.length > 0 && (
                        <div className="mb-3">
                            <h4 className="text-xs font-semibold text-green-400 mb-2">Pros</h4>
                            <ul className="list-disc list-inside text-xs text-muted-foreground space-y-1">
                                {data.pros.slice(0, 3).map((p: string, i: number) => (
                                    <li key={i}>{p}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                    {data?.cons?.length > 0 && (
                        <div>
                            <h4 className="text-xs font-semibold text-red-400 mb-2">Cons</h4>
                            <ul className="list-disc list-inside text-xs text-muted-foreground space-y-1">
                                {data.cons.slice(0, 3).map((c: string, i: number) => (
                                    <li key={i}>{c}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </GlassCard>
    );
}
