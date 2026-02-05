import { RuleBuilder } from "@/features/rules/components/RuleBuilder";
import { DisciplineDashboard } from "@/features/rules/components/DisciplineDashboard";

export default function RulesPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white">Rule Engine</h1>
                <p className="text-slate-400">Define your edge, track your discipline.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                <div className="md:col-span-8">
                    <RuleBuilder />
                </div>
                <div className="md:col-span-4">
                    <DisciplineDashboard />
                </div>
            </div>
        </div>
    );
}
