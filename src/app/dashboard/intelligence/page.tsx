import { TradingCalendar } from "@/features/intelligence/components/TradingCalendar";
import { SectorHeatmap } from "@/features/intelligence/components/SectorHeatmap";

export default function IntelligencePage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-foreground">Market Intelligence</h1>
                <p className="text-muted-foreground">Analyze performance and market breadth.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <div className="lg:col-span-7 h-full">
                    <TradingCalendar />
                </div>
                <div className="lg:col-span-5 h-full">
                    <SectorHeatmap />
                </div>
            </div>
        </div>
    );
}
