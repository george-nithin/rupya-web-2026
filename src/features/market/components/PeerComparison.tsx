import { GlassCard } from "@/components/ui/GlassCard";
import { ArrowLeftRight, TrendingUp, TrendingDown, BarChart3 } from "lucide-react";

interface Peer {
    name: string;
    symbol: string;
    price: number;
    change: number;
    marketCap: string;
    pe: number;
    roe: number;
    sector: string;
}

export function PeerComparison({ currentSymbol }: { currentSymbol: string }) {
    // Mock Data - In real app, fetch based on sector of currentSymbol
    const peers: Peer[] = [
        { name: "Reliance Industries", symbol: "RELIANCE", price: 2980.50, change: 1.2, marketCap: "19.5T", pe: 28.5, roe: 18.2, sector: "Oil & Gas" },
        { name: "TCS", symbol: "TCS", price: 3890.50, change: -0.5, marketCap: "14.2T", pe: 32.1, roe: 48.5, sector: "IT Services" },
        { name: "HDFC Bank", symbol: "HDFCBANK", price: 1540.00, change: 0.8, marketCap: "11.8T", pe: 18.9, roe: 16.5, sector: "Banking" },
        { name: "ICICI Bank", symbol: "ICICIBANK", price: 1050.00, change: 1.5, marketCap: "7.4T", pe: 17.2, roe: 17.8, sector: "Banking" },
        { name: "Infosys", symbol: "INFY", price: 1650.00, change: -1.2, marketCap: "6.8T", pe: 24.5, roe: 31.2, sector: "IT Services" },
    ];

    // Filter to highlight current or show relevant peers
    // For demo, we just show the list and highlight the current if it matches

    return (
        <GlassCard className="overflow-hidden">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <ArrowLeftRight className="h-5 w-5 text-sky-400" />
                    Peer Comparison
                </h3>
                <div className="flex gap-2">
                    <span className="px-3 py-1 bg-white/5 rounded-full text-xs text-slate-400 border border-white/5">Nifty 50</span>
                    <span className="px-3 py-1 bg-white/5 rounded-full text-xs text-slate-400 border border-white/5">Sector Leaders</span>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="text-xs text-slate-500 uppercase tracking-wider border-b border-white/5 bg-white/[0.02]">
                            <th className="px-4 py-3 font-medium">Company</th>
                            <th className="px-4 py-3 font-medium text-right">Price</th>
                            <th className="px-4 py-3 font-medium text-right">Change %</th>
                            <th className="px-4 py-3 font-medium text-right">Market Cap</th>
                            <th className="px-4 py-3 font-medium text-right">P/E Ratio</th>
                            <th className="px-4 py-3 font-medium text-right">ROE %</th>
                            <th className="px-4 py-3 font-medium text-center">Trend</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        {peers.map((peer, index) => {
                            const isCurrent = peer.symbol === currentSymbol;
                            return (
                                <tr
                                    key={peer.symbol}
                                    className={`border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors ${isCurrent ? "bg-sky-500/10" : ""}`}
                                >
                                    <td className="px-4 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded bg-white/10 flex items-center justify-center text-[10px] font-bold text-slate-300">
                                                {peer.symbol.substring(0, 2)}
                                            </div>
                                            <div>
                                                <div className={`font-bold ${isCurrent ? "text-sky-400" : "text-white"}`}>
                                                    {peer.name}
                                                </div>
                                                <div className="text-xs text-slate-500">{peer.sector}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 text-right text-slate-200 font-mono">
                                        ₹{peer.price.toLocaleString()}
                                    </td>
                                    <td className="px-4 py-4 text-right">
                                        <div className={`inline-flex items-center gap-1 font-bold ${peer.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                            {peer.change > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                                            {Math.abs(peer.change)}%
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 text-right text-slate-400 font-mono">{peer.marketCap}</td>
                                    <td className="px-4 py-4 text-right">
                                        <div className="inline-block px-2 py-1 rounded bg-white/5 text-slate-300 border border-white/5 text-xs font-bold">
                                            {peer.pe}x
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 text-right text-slate-300 font-mono">{peer.roe}%</td>
                                    <td className="px-4 py-4 text-center">
                                        <div className="h-1.5 w-16 bg-white/10 rounded-full overflow-hidden mx-auto">
                                            <div
                                                className={`h-full rounded-full ${peer.change >= 0 ? "bg-green-500" : "bg-red-500"}`}
                                                style={{ width: `${Math.min(Math.abs(peer.change) * 20, 100)}%` }}
                                            />
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <div className="mt-4 flex justify-end">
                <button className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1 transition-colors">
                    View Complete Industry Analysis <BarChart3 className="h-3 w-3" />
                </button>
            </div>
        </GlassCard>
    );
}
