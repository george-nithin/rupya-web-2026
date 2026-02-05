"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface NewsItem {
    id: string; // Changed to match UUID
    source: string;
    title: string;
    published_at: string;
    sentiment: string; // Assuming sentiment field might exist or fallback
}

export function RecentNews() {
    const [newsItems, setNewsItems] = useState<NewsItem[]>([]);

    useEffect(() => {
        const fetchNews = async () => {
            const { data } = await supabase
                .from('market_news')
                .select('*')
                .order('published_at', { ascending: false })
                .limit(5);

            if (data) {
                setNewsItems(data.map(item => ({
                    ...item,
                    time: new Date(item.published_at).toLocaleString(), // Basic formatting
                    sentiment: item.category === 'positive' ? 'positive' : 'neutral' // Simple mapping if sentiment column missing
                })) as any); // Type assertion for now
            }
        };

        fetchNews();
    }, []);

    return (
        <div className="col-span-1 lg:col-span-12 mt-4 space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">Market News</h2>
                <button className="text-sm text-sky-400 hover:text-sky-300 flex items-center transition-colors">
                    View All <ArrowRight className="ml-1 h-3 w-3" />
                </button>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                {newsItems.length === 0 ? (
                    <div className="text-slate-500 text-sm">No recent news loaded.</div>
                ) : (
                    newsItems.map((item) => (
                        <GlassCard
                            key={item.id}
                            className="min-w-[300px] md:min-w-[400px] flex-shrink-0 hover:bg-white/10 transition-colors cursor-pointer"
                            variant="frosted"
                        >
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-xs font-medium text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-full border border-sky-500/20">
                                    {item.source || 'Market News'}
                                </span>
                                <span className="text-xs text-slate-500">
                                    {new Date(item.published_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                            <h3 className="text-sm font-medium text-white leading-relaxed line-clamp-2">
                                {item.title}
                            </h3>
                            {/* Simple sentiment indicator if available */}
                            <div className={`mt-3 h-1 w-full rounded-full bg-slate-500/50`} />
                        </GlassCard>
                    ))
                )}
            </div>
        </div>
    );
}
