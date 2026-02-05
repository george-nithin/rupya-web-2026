import { AIReview } from "@/features/analytics/components/AIReview";
import { Backtester } from "@/features/analytics/components/Backtester";

export default function AnalyticsPage() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-white">Analytics & AI</h1>
                <p className="text-slate-400">Deep dive into your performance metrics.</p>
            </div>

            <div className="space-y-8">
                <section>
                    <h2 className="text-lg font-semibold text-white mb-4">Strategy Backtesting</h2>
                    <Backtester />
                </section>

                <section>
                    <h2 className="text-lg font-semibold text-white mb-4">AI Trade Review</h2>
                    <AIReview />
                </section>
            </div>
        </div>
    );
}
