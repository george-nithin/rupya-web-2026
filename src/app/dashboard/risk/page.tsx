import { RiskCalculator } from "@/features/risk/components/RiskCalculator";

export default function RiskPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] gap-6">
            <div className="text-center">
                <h1 className="text-2xl font-bold text-white">Risk Calculator</h1>
                <p className="text-slate-400">Position sizing is the key to survival.</p>
            </div>
            <RiskCalculator />
        </div>
    );
}
