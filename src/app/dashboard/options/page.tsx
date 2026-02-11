import { OptionChain } from "@/features/options/components/OptionChain";
import { PayoffAnalyzer } from "@/features/options/components/PayoffAnalyzer";
import { MostTradedOptions } from "@/features/options/components/MostTradedOptions";

export default function OptionsPage() {
    return (
        <div className="space-y-6 h-[calc(100vh-100px)] flex flex-col">
            <div>
                <h1 className="text-2xl font-bold text-white">Options Desk</h1>
                <p className="text-slate-400">Advanced Option Chain & Strategy Builder</p>
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
                        <h3 className="text-sm font-semibold text-slate-400 mb-2">Strategy Presets</h3>
                        {['Long Straddle', 'Short Strangle', 'Bull Call Spread', 'Iron Butterfly'].map(s => (
                            <button key={s} className="w-full text-left p-3 text-sm bg-white/5 hover:bg-white/10 rounded-lg text-slate-300 hover:text-white transition-colors border border-white/5">
                                {s}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
