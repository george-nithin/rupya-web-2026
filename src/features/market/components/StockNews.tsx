import { GlassCard } from "@/components/ui/GlassCard";
import { Newspaper, TrendingUp, TrendingDown, ExternalLink, Clock } from "lucide-react";

interface NewsItem {
    id: number;
    title: string;
    source: string;
    time: string;
    sentiment: "Bullish" | "Bearish" | "Neutral";
    url: string;
}

export function StockNews({ symbol }: { symbol: string }) {
    // Mock Data - In real app, fetch from Supabase 'market_news' or external API
    const news: NewsItem[] = [
        {
            id: 1,
            title: `${symbol} beats quarterly earnings estimates by 15%`,
            source: "Bloomberg",
            time: "2h ago",
            sentiment: "Bullish",
            url: "#"
        },
        {
            id: 2,
            title: "Sector analysis: Why energy stocks are rallying today",
            source: "Reuters",
            time: "5h ago",
            sentiment: "Neutral",
            url: "#"
        },
        {
            id: 3,
            title: "Analyst downgrades price target amid global slowdown fears",
            source: "Economic Times",
            time: "1d ago",
            sentiment: "Bearish",
            url: "#"
        },
        {
            id: 4,
            title: `${symbol} announces new strategic partnership for expansion`,
            source: "LiveMint",
            time: "1d ago",
            sentiment: "Bullish",
            url: "#"
        }
    ];

    return (
        <GlassCard className="h-full">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Newspaper className="h-4 w-4 text-orange-400" />
                    Latest News
                </h3>
                <span className="text-xs text-sky-400 cursor-pointer hover:underline">View All</span>
            </div>

            <div className="space-y-4">
                {news.map((item) => (
                    <div key={item.id} className="group cursor-pointer">
                        <div className="flex justify-between items-start gap-3">
                            <div>
                                <h4 className="text-sm text-slate-200 font-medium leading-snug group-hover:text-sky-400 transition-colors">
                                    {item.title}
                                </h4>
                                <div className="flex items-center gap-2 mt-1.5">
                                    <span className="textxs text-slate-500 flex items-center gap-1">
                                        <Clock className="h-3 w-3" /> {item.time}
                                    </span>
                                    <span className="text-[10px] text-slate-600">•</span>
                                    <span className="text-xs text-slate-500">{item.source}</span>
                                </div>
                            </div>
                            <div className={`shrink-0 px-2 py-1 rounded text-[10px] font-bold border ${item.sentiment === "Bullish" ? "bg-green-500/10 text-green-400 border-green-500/20" :
                                    item.sentiment === "Bearish" ? "bg-red-500/10 text-red-400 border-red-500/20" :
                                        "bg-slate-500/10 text-slate-400 border-slate-500/20"
                                }`}>
                                {item.sentiment}
                            </div>
                        </div>
                        <div className="h-px bg-white/5 mt-3 group-last:hidden" />
                    </div>
                ))}
            </div>
        </GlassCard>
    );
}
