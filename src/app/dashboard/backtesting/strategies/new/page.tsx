
"use client";

import { useEffect, useState, Suspense } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { GlassInput } from "@/components/ui/GlassInput";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

// Wrap in Suspense for useSearchParams
function StrategyEditorContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const cloneId = searchParams.get('clone');

    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Form state
    const [name, setName] = useState("New Strategy");
    const [description, setDescription] = useState("");
    const [code, setCode] = useState("");

    useEffect(() => {
        const fetchTemplate = async () => {
            setIsLoading(true);
            try {
                // If cloning, fetch specific strategy code
                // If not, fetch base structure
                const idToFetch = cloneId || 'base_structure';
                const res = await fetch(`/api/strategies/predefined?id=${idToFetch}`);
                const data = await res.json();

                if (data.code) {
                    setCode(data.code);
                    if (cloneId) {
                        setName(`Copy of ${cloneId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}`);
                        setDescription(`Based on ${cloneId} strategy.`);
                    } else {
                        setName("New Custom Strategy");
                        setDescription("A custom trading strategy.");
                    }
                }
            } catch (error) {
                console.error("Failed to load template:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchTemplate();
    }, [cloneId]);

    const handleSave = async () => {
        if (!name.trim()) {
            alert("Please provide a strategy name");
            return;
        }

        setIsSaving(true);
        try {
            const res = await fetch('/api/strategies', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    description,
                    code
                })
            });
            const newStrategy = await res.json();

            if (newStrategy && newStrategy.id) {
                // Redirect to edit page of the new strategy
                router.push(`/dashboard/backtesting/strategies/${newStrategy.id}`);
            } else {
                throw new Error("Invalid response");
            }
        } catch (error) {
            console.error("Failed to create strategy:", error);
            alert("Failed to create strategy");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return <div className="text-center py-12 text-slate-500">Loading template...</div>;

    return (
        <div className="space-y-6 h-[calc(100vh-100px)] flex flex-col">
            <div className="flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/backtesting/strategies">
                        <GlassButton size="sm" variant="ghost">
                            <ArrowLeft className="h-4 w-4" />
                        </GlassButton>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-white">Create New Strategy</h1>
                        <p className="text-slate-400 text-sm">
                            {cloneId ? `Cloning: ${cloneId}` : "Start from scratch or template"}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <GlassButton onClick={handleSave} disabled={isSaving}>
                        <Save className="h-4 w-4 mr-2" />
                        {isSaving ? "Creating..." : "Create Strategy"}
                    </GlassButton>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
                {/* Metadata Column */}
                <div className="lg:col-span-1 space-y-6 overflow-y-auto">
                    <GlassCard className="p-6 space-y-4">
                        <h3 className="text-lg font-semibold text-white">Details</h3>
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Name</label>
                            <GlassInput value={name} onChange={(e) => setName(e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Description</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full h-32 bg-white/5 border border-white/10 rounded-lg p-3 text-white text-sm outline-none focus:border-sky-500/50 resize-none"
                            />
                        </div>
                    </GlassCard>

                    <GlassCard className="p-6">
                        <h3 className="text-lg font-semibold text-white mb-2">Instructions</h3>
                        <ul className="list-disc list-inside text-sm text-slate-400 space-y-2">
                            <li>Define a class inheriting <code>TradingStrategy</code>.</li>
                            <li>Override <code>initialize</code> and <code>on_data</code>.</li>
                            <li>Return <code>Order</code> objects in <code>on_data</code>.</li>
                        </ul>
                    </GlassCard>
                </div>

                {/* Code Editor Column */}
                <div className="lg:col-span-2 flex flex-col min-h-0">
                    <GlassCard className="flex-1 p-0 overflow-hidden flex flex-col border border-white/10">
                        <div className="bg-slate-900/50 p-2 border-b border-white/5 text-xs text-slate-400 font-mono">
                            main.py
                        </div>
                        <textarea
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            spellCheck={false}
                            className="flex-1 w-full bg-[#0d1117] text-gray-300 font-mono text-sm p-4 outline-none resize-none leading-relaxed"
                            style={{ tabSize: 4 }}
                        />
                    </GlassCard>
                </div>
            </div>
        </div>
    );
}

export default function NewStrategyPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <StrategyEditorContent />
        </Suspense>
    );
}

