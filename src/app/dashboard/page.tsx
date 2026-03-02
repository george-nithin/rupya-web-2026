"use client";

import { MarketOverview } from "@/features/dashboard/components/MarketOverview";
import { PortfolioSummary } from "@/features/dashboard/components/PortfolioSummary";
import { RecentNews } from "@/features/dashboard/components/RecentNews";
import { WatchlistWidget } from "@/features/dashboard/components/WatchlistWidget";
import { ActiveTradeTracker } from "@/features/journal/components/ActiveTradeTracker";
import { AlertsWidget } from "@/features/dashboard/components/AlertsWidget";
import { MarketEvents } from "@/features/dashboard/components/MarketEvents";
import { PremiumCTA } from "@/features/dashboard/components/PremiumCTA";
import { StatusBanner } from "@/features/dashboard/components/StatusBanner";
import { BreakdownStats } from "@/features/dashboard/components/BreakdownStats";
import { PnLCashflowChart } from "@/features/dashboard/components/PnLCashflowChart";
import { StatsCircularWidget } from "@/features/dashboard/components/StatsCircularWidget";
import { InviteWidget } from "@/features/dashboard/components/InviteWidget";
import { TrustBanner } from "@/features/dashboard/components/TrustBanner";
import { FeaturePromoGrid } from "@/features/dashboard/components/FeaturePromoGrid";
import { SocialLinks } from "@/features/dashboard/components/SocialLinks";
import { NiftyYearlyCard } from "@/features/dashboard/components/NiftyYearlyCard";
import { MarketSentimentMeter } from "@/features/dashboard/components/MarketSentimentMeter";
import { MarketMovers } from "@/features/dashboard/components/MarketMovers";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function DashboardPage() {
    const [userName, setUserName] = useState("Trader");

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user?.user_metadata?.full_name) {
                setUserName(user.user_metadata.full_name.split(' ')[0]);
            }
        };
        getUser();
    }, []);

    return (
        <div className="space-y-12">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight leading-none">Dashboard</h1>
                    <p className="text-white/40 font-bold uppercase tracking-widest text-[10px] mt-2">Welcome back, {userName} • Terminal Active</p>
                </div>
                <div className="text-right hidden sm:block">
                    <div className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-1">Market Status</div>
                    <div className="text-green-400 font-bold flex items-center gap-2 justify-end">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        Live Market
                    </div>
                </div>
            </div>

            {/* Top Brand Banner */}
            <TrustBanner />

            {/* Compact Market Indices */}
            <MarketOverview />

            {/* Top Movers Section */}
            <MarketMovers />

            {/* Feature Promo Cards */}
            <FeaturePromoGrid />

            {/* Alerts & Events Row */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <AlertsWidget />
                <MarketEvents />
            </div>

            {/* Active Trades */}
            <ActiveTradeTracker />

            {/* Premium Insights & Nifty Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                <div className="lg:col-span-4 h-full">
                    <NiftyYearlyCard />
                </div>
                <div className="lg:col-span-4 h-full">
                    <MarketSentimentMeter score={64} />
                </div>
                <div className="lg:col-span-4 flex flex-col gap-6">
                    <StatsCircularWidget />
                    <InviteWidget />
                </div>

                {/* Second Row */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                    <BreakdownStats />
                    <StatusBanner />
                </div>
                <div className="lg:col-span-8">
                    <PnLCashflowChart />
                </div>
            </div>

            {/* Portfolio & Watchlist */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <PortfolioSummary />
                <WatchlistWidget />
            </div>

            {/* Premium CTA Section */}
            <PremiumCTA />

            {/* Market News */}
            <RecentNews />

            {/* Footer Socials */}
            <SocialLinks />
        </div>
    );
}
