"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { GlassInput } from "@/components/ui/GlassInput";
import { Plus, Trash2, AlertOctagon, CheckCircle } from "lucide-react";
import { useState } from "react";

interface Rule {
    id: number;
    text: string;
    severity: "Hard" | "Soft";
}

export function RuleBuilder() {
    const [rules, setRules] = useState<Rule[]>([
        { id: 1, text: "Max Daily Loss < ₹5,000", severity: "Hard" },
        { id: 2, text: "No trading after 2 consecutive losses", severity: "Soft" },
        { id: 3, text: "Risk per trade max 1%", severity: "Hard" },
    ]);
    const [newRule, setNewRule] = useState("");
    const [severity, setSeverity] = useState<"Hard" | "Soft">("Hard");

    const addRule = () => {
        if (!newRule.trim()) return;
        setRules([...rules, { id: Date.now(), text: newRule, severity }]);
        setNewRule("");
    };

    const deleteRule = (id: number) => {
        setRules(rules.filter(r => r.id !== id));
    };

    return (
        <GlassCard className="h-full">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-sky-400" /> Trading Rules
                </h2>
                <span className="text-xs text-slate-500 bg-white/5 px-2 py-1 rounded">
                    {rules.length} Active Rules
                </span>
            </div>

            <div className="flex gap-2 mb-6">
                <select
                    className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none"
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value as "Hard" | "Soft")}
                >
                    <option value="Hard">Hard Rule 🛑</option>
                    <option value="Soft">Soft Rule ⚠️</option>
                </select>
                <GlassInput
                    value={newRule}
                    onChange={(e) => setNewRule(e.target.value)}
                    placeholder="Define a new rule..."
                    className="flex-1"
                />
                <GlassButton onClick={addRule}>
                    <Plus className="h-4 w-4" />
                </GlassButton>
            </div>

            <div className="space-y-3">
                {rules.map((rule) => (
                    <div key={rule.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5 hover:border-white/20 transition-all group">
                        <div className="flex items-center gap-3">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${rule.severity === 'Hard' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'
                                }`}>
                                {rule.severity}
                            </span>
                            <span className="text-sm text-slate-200">{rule.text}</span>
                        </div>
                        <button
                            onClick={() => deleteRule(rule.id)}
                            className="text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    </div>
                ))}
            </div>
        </GlassCard>
    );
}
