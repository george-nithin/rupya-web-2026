"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { Filter } from "lucide-react";

const newsCategories = ["All", "Markets", "Economy", "Global", "IPO", "Commodities"];

const newsFeed = [
    {
        id: 1,
        title: "Sensex, Nifty hit fresh record highs; IT stocks lead rally",
        source: "Moneycontrol",
        time: "15 mins ago",
        category: "Markets",
        summary: "Indian equity benchmarks scaled new peaks on Monday, led by gains in information technology and banking stocks.",
        sentiment: "Positive"
    },
    {
        id: 2,
        title: "US inflation cools to 3.1%, cementing rate cut hopes",
        source: "Bloomberg",
        time: "1 hour ago",
        category: "Global",
        summary: "Consumer prices in the US rose less than expected in last month, bolstering case for Federal Reserve to start cutting rates.",
        sentiment: "Positive"
    },
    {
        id: 3,
        title: "Oil prices dip as demand concerns outweigh supply fears",
        source: "Reuters",
        time: "3 hours ago",
        category: "Commodities",
        summary: "Crude oil futures fell 1% as weak manufacturing data from China raised concerns about demand.",
        sentiment: "Negative"
    }
];

export default function NewsPage() {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-white">Market News</h1>
                    <p className="text-slate-400">Stay updated with latest buzz</p>
                </div>
            </div>

            {/* Category Filters */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                {newsCategories.map((cat, i) => (
                    <button
                        key={cat}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${i === 0
                                ? "bg-sky-500 text-white"
                                : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
                            }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {newsFeed.map((news) => (
                    <GlassCard key={news.id} className="cursor-pointer hover:border-white/20 transition-all group">
                        <div className="flex justify-between items-start mb-3">
                            <div className="flex gap-2">
                                <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 border border-white/10 uppercase tracking-wider">
                                    {news.category}
                                </span>
                                <span className={`px-2 py-0.5 rounded text-[10px] border border-white/10 uppercase tracking-wider ${news.sentiment === 'Positive' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                        news.sentiment === 'Negative' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                            'bg-slate-500/10 text-slate-400'
                                    }`}>
                                    {news.sentiment}
                                </span>
                            </div>
                            <span className="text-xs text-slate-500">{news.time}</span>
                        </div>

                        <h3 className="text-lg font-bold text-white mb-2 group-hover:text-sky-400 transition-colors">
                            {news.title}
                        </h3>
                        <p className="text-sm text-slate-400 leading-relaxed mb-4">
                            {news.summary}
                        </p>

                        <div className="flex items-center gap-2 text-xs text-slate-500">
                            <span>{news.source}</span>
                            <span>•</span>
                            <span>Read full story</span>
                        </div>
                    </GlassCard>
                ))}
            </div>
        </div>
    );
}
