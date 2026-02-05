import { SystemHealth } from "@/features/admin/components/SystemHealth";

export default function AdminPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white">Admin Console</h1>
                <p className="text-slate-400">System overview and health monitoring.</p>
            </div>

            <SystemHealth />
        </div>
    );
}
