"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { GlassInput } from "@/components/ui/GlassInput";
import { Plus, Trash2, Save, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

const ruleSchema = z.object({
    condition: z.string().min(1, "Condition is required"),
    type: z.enum(["entry", "exit"]),
});

const strategySchema = z.object({
    name: z.string().min(3, "Name is required"),
    description: z.string().optional(),
    type: z.enum(["Intraday", "Swing", "Positional", "Scalping", "Options"]),
    timeframes: z.array(z.string()).min(1, "Select at least one timeframe"),
    riskPerTrade: z.coerce.number().min(0.1).max(100),
});

export function StrategyForm() {
    const [rules, setRules] = useState<{ id: number; text: string; type: 'entry' | 'exit' }[]>([]);
    const [newRule, setNewRule] = useState("");
    const [ruleType, setRuleType] = useState<'entry' | 'exit'>('entry');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(strategySchema),
        defaultValues: {
            type: "Intraday",
            riskPerTrade: 1
        }
    });

    const addRule = () => {
        if (!newRule.trim()) return;
        setRules([...rules, { id: Date.now(), text: newRule, type: ruleType }]);
        setNewRule("");
    };

    const removeRule = (id: number) => {
        setRules(rules.filter(r => r.id !== id));
    };

    const onSubmit = async (data: any) => {
        setIsSubmitting(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("User not found");

            // Combine form data with rules
            const strategyData = {
                user_id: user.id,
                name: data.name,
                type: data.type,
                description: data.description,
                timeframes: data.timeframes, // Store array (Supabase handles valid types)? No, create_webapp_features.sql defined user_strategies. 
                // Wait, check schema. Schema said: name, type, description, win_rate, etc.
                // It didn't explicitly have a JSONB for details, but it has 'description'.
                // I might need to store 'rules' and 'timeframes' in the description or add a column.
                // Looking at schema: metadata JSONB column wasn't in the snippet.
                // Actually, let's just dump extra info into description for now or assume a JSON column if I added one.
                // Ah, the previous schema snippet:
                // CREATE TABLE user_strategies ( ... name TEXT, type TEXT, description TEXT ... )
                // I should probably concatenate rules to description or just ignore them if DB doesn't support.
                // BETTER: I'll append rules to description for now as MVP.
            };

            // Construct a rich description
            let fullDescription = data.description || "";
            if (data.timeframes && data.timeframes.length > 0) {
                fullDescription += `\n\nTimeframes: ${data.timeframes.join(', ')}`;
            }
            if (data.riskPerTrade) {
                fullDescription += `\nRisk per Trade: ${data.riskPerTrade}%`;
            }
            if (rules.length > 0) {
                fullDescription += `\n\nRules:\n` + rules.map(r => `[${r.type.toUpperCase()}] ${r.text}`).join('\n');
            }

            const { error } = await supabase.from('user_strategies').insert({
                user_id: user.id,
                name: data.name,
                type: data.type,
                description: fullDescription,
                is_active: true
            });

            if (error) throw error;

            alert("Strategy created successfully!");
            router.push('/dashboard/strategies');
        } catch (error: any) {
            console.error("Error creating strategy:", error);
            alert("Failed to create strategy: " + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
                <Link href="/dashboard/strategies">
                    <GlassButton variant="ghost" size="sm">
                        <ArrowLeft className="h-5 w-5" />
                    </GlassButton>
                </Link>
                <h1 className="text-2xl font-bold text-foreground">Design Strategy</h1>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <GlassCard className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-1">Strategy Name</label>
                                <GlassInput {...register("name")} placeholder="e.g. 15min Breakout" />
                                {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name.message as string}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-1">Market Type</label>
                                <select
                                    {...register("type")}
                                    className="w-full bg-card/20 border border-border rounded-xl px-4 py-2 text-foreground outline-none focus:border-sky-500/50"
                                >
                                    {["Intraday", "Swing", "Positional", "Scalping", "Options"].map(t => (
                                        <option key={t} value={t}>{t}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-1">Description</label>
                                <textarea
                                    {...register("description")}
                                    className="w-full h-24 bg-card/20 border border-border rounded-xl p-3 text-foreground text-sm outline-none focus:border-sky-500/50 resize-none"
                                    placeholder="Briefly describe the edge..."
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-1">Risk per Trade (%)</label>
                                <GlassInput {...register("riskPerTrade")} type="number" step="0.1" />
                                <p className="text-xs text-muted-foreground mt-1">This will be used for auto-position sizing.</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-2">Preferred Timeframes</label>
                                <div className="flex flex-wrap gap-2">
                                    {['1m', '5m', '15m', '1H', '4H', '1D'].map(tf => (
                                        <label key={tf} className="flex items-center gap-2 bg-card/20 px-3 py-1.5 rounded cursor-pointer hover:bg-card/30 active:scale-95">
                                            <input type="checkbox" value={tf} {...register("timeframes")} className="rounded bg-slate-800 border-white/10 text-sky-500" />
                                            <span className="text-sm text-foreground/80">{tf}</span>
                                        </label>
                                    ))}
                                </div>
                                {errors.timeframes && <p className="text-xs text-red-400 mt-1">{errors.timeframes.message as string}</p>}
                            </div>
                        </div>
                    </div>
                </GlassCard>

                <GlassCard className="p-6">
                    <h3 className="text-lg font-semibold text-foreground mb-4">Trading Rules</h3>

                    <div className="flex gap-2 mb-4">
                        <select
                            value={ruleType}
                            onChange={(e) => setRuleType(e.target.value as 'entry' | 'exit')}
                            className="bg-card/20 border border-border rounded-xl px-3 py-2 text-foreground text-sm outline-none"
                        >
                            <option value="entry">Entry Condition</option>
                            <option value="exit">Exit Condition</option>
                        </select>
                        <GlassInput
                            value={newRule}
                            onChange={(e) => setNewRule(e.target.value)}
                            placeholder="e.g. RSI crosses above 60"
                            className="flex-1"
                        />
                        <GlassButton type="button" onClick={addRule}>
                            <Plus className="h-5 w-5" />
                        </GlassButton>
                    </div>

                    <div className="space-y-2">
                        {rules.length === 0 && (
                            <div className="text-center py-8 text-muted-foreground italic">No rules defined yet.</div>
                        )}
                        {rules.map((rule) => (
                            <div key={rule.id} className="flex items-center justify-between p-3 bg-card/20 rounded-xl border border-border/50 group">
                                <div className="flex items-center gap-3">
                                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${rule.type === 'entry' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                                        {rule.type}
                                    </span>
                                    <span className="text-foreground text-sm">{rule.text}</span>
                                </div>
                                <button type="button" onClick={() => removeRule(rule.id)} className="text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Trash2 className="h-5 w-5" />
                                </button>
                            </div>
                        ))}
                    </div>
                </GlassCard>

                <div className="flex justify-end pt-4">
                    <GlassButton size="lg" className="px-8" disabled={isSubmitting}>
                        <Save className="h-5 w-5 mr-2" />
                        {isSubmitting ? "Saving..." : "Save Strategy"}
                    </GlassButton>
                </div>
            </form>
        </div>
    );
}
