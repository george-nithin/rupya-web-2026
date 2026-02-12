import { OptionChain } from "@/features/options/components/OptionChain";
import { PayoffAnalyzer } from "@/features/options/components/PayoffAnalyzer";
import { MostTradedOptions } from "@/features/options/components/MostTradedOptions";

export default function OptionsPage() {
    return (
        <div className="space-y-6 h-[calc(100vh-100px)] flex flex-col">
            <div>
                <h1 className="text-2xl font-bold text-foreground">Options Desk</h1>
                <p className="text-muted-foreground">Advanced Option Chain & Strategy Builder</p>
            </div>

            {/* Most Traded Options Section */}
            <div className="w-full">
                <MostTradedOptions />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 overflow-hidden">
                <div className="lg:col-span-8 h-full min-h-[500px]">
                    <OptionChain />
                </div>
                <div className="lg:col-span-4 h-full overflow-y-auto">
                    <PayoffAnalyzer />

                    {/* Strategy Selector (Placeholder) */}
                    <div className="mt-6 space-y-2">
                        <h3 className="text-sm font-semibold text-muted-foreground mb-2">Strategy Presets</h3>
                        {['Long Straddle', 'Short Strangle', 'Bull Call Spread', 'Iron Butterfly'].map(s => (
                            <button key={s} className="w-full text-left p-3 text-sm bg-card/20 hover:bg-card/30 rounded-xl text-foreground/80 hover:text-foreground transition-all duration-150 border border-border/50 active:scale-95">
                                {s}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
