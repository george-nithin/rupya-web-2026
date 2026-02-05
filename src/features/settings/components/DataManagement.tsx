"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { Download, Upload, Trash2, FileText, FileSpreadsheet } from "lucide-react";

export function DataManagement() {
    const handleExport = (type: string) => {
        alert(`Exporting data as ${type}... (Mock)`);
    };

    const handleClearData = () => {
        if (confirm("Are you sure you want to clear all local data? This action cannot be undone.")) {
            alert("Data cleared.");
        }
    };

    return (
        <GlassCard className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-white mb-1">Data Management</h3>
                <p className="text-sm text-slate-400">Control your trading data and account privacy.</p>
            </div>

            <div className="space-y-4">
                <div className="p-4 bg-white/5 rounded-xl border border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-sky-500/20 rounded-lg text-sky-400">
                            <Download className="h-5 w-5" />
                        </div>
                        <div>
                            <h4 className="text-sm font-medium text-white">Export Trading Journal</h4>
                            <p className="text-xs text-slate-400">Download your entire trade history.</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <GlassButton onClick={() => handleExport("CSV")} variant="secondary" size="sm">
                            <FileSpreadsheet className="h-4 w-4 mr-2" /> CSV
                        </GlassButton>
                        <GlassButton onClick={() => handleExport("PDF")} variant="secondary" size="sm">
                            <FileText className="h-4 w-4 mr-2" /> PDF
                        </GlassButton>
                    </div>
                </div>

                <div className="p-4 bg-white/5 rounded-xl border border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-500/20 rounded-lg text-green-400">
                            <Upload className="h-5 w-5" />
                        </div>
                        <div>
                            <h4 className="text-sm font-medium text-white">Import from Broker</h4>
                            <p className="text-xs text-slate-400">Sync trades from Zerodha/Angel One.</p>
                        </div>
                    </div>
                    <GlassButton variant="secondary" size="sm">
                        Connect Broker
                    </GlassButton>
                </div>

                <div className="p-4 bg-red-500/10 rounded-xl border border-red-500/20 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-500/20 rounded-lg text-red-400">
                            <Trash2 className="h-5 w-5" />
                        </div>
                        <div>
                            <h4 className="text-sm font-medium text-white">Danger Zone</h4>
                            <p className="text-xs text-red-300">Permanently delete all account data.</p>
                        </div>
                    </div>
                    <GlassButton onClick={handleClearData} className="bg-red-500 hover:bg-red-600 border-none text-white" size="sm">
                        Clear All Data
                    </GlassButton>
                </div>
            </div>
        </GlassCard>
    );
}
