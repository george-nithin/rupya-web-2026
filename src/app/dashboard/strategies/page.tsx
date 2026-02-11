import { StrategyLibrary } from "@/features/strategy/components/StrategyLibrary";
import { StrategyBrowser } from "@/features/strategy/components/StrategyBrowser";

export default function StrategiesPage() {
    return (
        <div className="space-y-12 pb-12">
            {/* Standard Strategies (Templates) */}
            <StrategyBrowser />

            {/* User Custom Strategies */}
            <div className="pt-8 border-t border-white/10">
                <StrategyLibrary />
            </div>
        </div>
    );
}
