"use client";

import { OptionChain } from "@/features/options/components/OptionChain";
import { PayoffAnalyzer } from "@/features/options/components/PayoffAnalyzer";

export default function StrategyBuilderPage() {
    return (
        <div className="p-6 space-y-6">
            <h1 className="text-2xl font-bold text-white mb-4">Strategy Builder</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Option Chain Section */}
                <div className="lg:col-span-2 h-[600px]">
                    <OptionChain />
                </div>

                {/* Analysis Section */}
                <div className="lg:col-span-1 space-y-6">
                    <PayoffAnalyzer />

                    {/* Placeholder for Trades/Legs */}
                    <div className="p-4 bg-slate-900/50 border border-white/10 rounded-xl">
                        <h3 className="text-sm font-semibold text-white mb-2">Selected Legs</h3>
                        <div className="text-xs text-slate-500 text-center py-4">
                            Select strikes from Option Chain to build strategy.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
