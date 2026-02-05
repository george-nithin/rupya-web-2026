import { SectorOverview } from "@/features/market/components/SectorOverview";
import { SectorDetail } from "@/features/market/components/SectorDetail";

export default function SectorsPage() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-white">Sector Analysis</h1>
                <p className="text-slate-400">Deep dive into market sectors and industries.</p>
            </div>

            <SectorOverview />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <SectorDetail />
                {/* Placeholder for future expansion */}
                <div className="p-4 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center text-slate-500 text-sm h-[300px]">
                    Select a sector to view detailed charts (Coming Soon)
                </div>
            </div>
        </div>
    );
}
