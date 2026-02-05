import { MarketOverview } from "@/features/dashboard/components/MarketOverview";
import { PortfolioSummary } from "@/features/dashboard/components/PortfolioSummary";
import { RecentNews } from "@/features/dashboard/components/RecentNews";
import { WatchlistWidget } from "@/features/dashboard/components/WatchlistWidget";
import { ActiveTradeTracker } from "@/features/journal/components/ActiveTradeTracker";

export default function DashboardPage() {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold text-white">Dashboard</h1>
                    <p className="text-slate-400">Welcome back, Nithin</p>
                </div>
                <div className="text-right hidden sm:block">
                    <div className="text-sm text-slate-400">Market Status</div>
                    <div className="text-green-400 font-medium flex items-center gap-2">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        Live Market
                    </div>
                </div>
            </div>

            <MarketOverview />

            {/* New Active Trade Section */}
            <ActiveTradeTracker />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <PortfolioSummary />
                <WatchlistWidget />
            </div>

            <RecentNews />
        </div>
    );
}
