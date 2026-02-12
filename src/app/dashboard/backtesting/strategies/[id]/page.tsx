
"use client";

import { useEffect, useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { GlassInput } from "@/components/ui/GlassInput";
import { ArrowLeft, Save, Play, Trash2 } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

export default function StrategyEditorPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const [strategy, setStrategy] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Form state
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [code, setCode] = useState("");

    useEffect(() => {
        if (id) fetchStrategy();
    }, [id]);

    const fetchStrategy = async () => {
        try {
            const res = await fetch(`/api/strategies/${id}`);
            const data = await res.json();
            if (data) {
                setStrategy(data);
                setName(data.name);
                setDescription(data.description || "");
                setCode(data.code || "");
            }
        } catch (error) {
            console.error("Failed to fetch strategy:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const res = await fetch(`/api/strategies/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, description, code })
            });
            const updated = await res.json();
            if (updated) {
                setStrategy(updated);
                alert("Strategy saved successfully!");
            }
        } catch (error) {
            console.error("Failed to save strategy:", error);
            alert("Failed to save strategy");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this strategy?")) return;
        try {
            await fetch(`/api/strategies/${id}`, { method: 'DELETE' });
            router.push('/dashboard/backtesting/strategies');
        } catch (error) {
            console.error("Failed to delete strategy:", error);
        }
    };

    if (isLoading) return <div className="text-center py-12 text-muted-foreground">Loading editor...</div>;
    if (!strategy) return <div className="text-center py-12 text-red-500">Strategy not found</div>;

    return (
        <div className="space-y-6 h-[calc(100vh-100px)] flex flex-col">
            <div className="flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/backtesting/strategies">
                        <GlassButton size="sm" variant="ghost">
                            <ArrowLeft className="h-5 w-5" />
                        </GlassButton>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Edit Strategy</h1>
                        <p className="text-muted-foreground text-sm">ID: {id}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <GlassButton variant="danger" size="sm" onClick={handleDelete}>
                        <Trash2 className="h-5 w-5 mr-2" /> Delete
                    </GlassButton>
                    <Link href={`/dashboard/backtesting?strategy=${id}`}>
                        <GlassButton variant="secondary" size="sm">
                            <Play className="h-5 w-5 mr-2" /> Run Backtest
                        </GlassButton>
                    </Link>
                    <GlassButton onClick={handleSave} disabled={isSaving}>
                        <Save className="h-5 w-5 mr-2" />
                        {isSaving ? "Saving..." : "Save Code"}
                    </GlassButton>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
                {/* Metadata Column */}
                <div className="lg:col-span-1 space-y-6 overflow-y-auto">
                    <GlassCard className="p-6 space-y-4">
                        <h3 className="text-lg font-semibold text-foreground">Details</h3>
                        <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-1">Name</label>
                            <GlassInput value={name} onChange={(e) => setName(e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-1">Description</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full h-32 bg-card/20 border border-border rounded-xl p-3 text-foreground text-sm outline-none focus:border-sky-500/50 resize-none"
                            />
                        </div>
                    </GlassCard>

                    <GlassCard className="p-6">
                        <h3 className="text-lg font-semibold text-foreground mb-2">Instructions</h3>
                        <ul className="list-disc list-inside text-sm text-muted-foreground space-y-2">
                            <li>Must define a class inheriting <code>TradingStrategy</code>.</li>
                            <li>Should override <code>initialize</code> and <code>on_data</code>.</li>
                            <li>Use <code>self.data</code> to access OHLCv dataframe.</li>
                            <li>Return list of <code>Order</code> objects from <code>on_data</code>.</li>
                        </ul>
                    </GlassCard>
                </div>

                {/* Code Editor Column */}
                <div className="lg:col-span-2 flex flex-col min-h-0">
                    <GlassCard className="flex-1 p-0 overflow-hidden flex flex-col border border-border">
                        <div className="bg-card/50 p-2 border-b border-border/50 text-xs text-muted-foreground font-mono">
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
