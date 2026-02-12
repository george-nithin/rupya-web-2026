import { UserVsIndex } from "@/features/analytics/components/UserVsIndex";
import { TraderScorecard } from "@/features/analytics/components/TraderScorecard";

export default function BenchmarksPage() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-foreground">Performance Benchmarking</h1>
                <p className="text-muted-foreground">Measure your edge against the market.</p>
            </div>

            <TraderScorecard />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <UserVsIndex />
                </div>
                <div className="lg:col-span-1 space-y-4">
                    <div className="p-4 bg-card/20 rounded-xl border border-border">
                        <div className="text-xs text-muted-foreground mb-1">Alpha Generated</div>
                        <div className="text-2xl font-bold text-green-400">+10.4%</div>
                        <div className="text-xs text-muted-foreground mt-2">Excess returns over NIFTY 50</div>
                    </div>
                    <div className="p-4 bg-card/20 rounded-xl border border-border">
                        <div className="text-xs text-muted-foreground mb-1">Beta</div>
                        <div className="text-2xl font-bold text-foreground">1.12</div>
                        <div className="text-xs text-muted-foreground mt-2">Aggressive volatility profile</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
