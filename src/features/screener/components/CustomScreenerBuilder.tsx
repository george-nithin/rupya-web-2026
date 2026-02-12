"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { GlassInput } from "@/components/ui/GlassInput";
import { Plus, X, Filter, Save } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

interface FilterCondition {
    id: string;
    field: string;
    operator: string;
    value: string;
}

const FILTER_FIELDS = [
    { value: 'last_price', label: 'Price', type: 'number' },
    { value: 'percent_change', label: '% Change', type: 'number' },
    { value: 'total_traded_volume', label: 'Volume', type: 'number' },
    { value: 'market_cap', label: 'Market Cap', type: 'number' },
    { value: 'pe_ratio', label: 'P/E Ratio', type: 'number' },
    { value: 'pb_ratio', label: 'P/B Ratio', type: 'number' },
    { value: 'dividend_yield', label: 'Dividend Yield (%)', type: 'number' },
    { value: 'roe', label: 'ROE (%)', type: 'number' },
    { value: 'sector', label: 'Sector', type: 'text' },
];

const OPERATORS = {
    number: [
        { value: 'gt', label: '>' },
        { value: 'gte', label: '>=' },
        { value: 'lt', label: '<' },
        { value: 'lte', label: '<=' },
        { value: 'eq', label: '=' },
    ],
    text: [
        { value: 'eq', label: 'equals' },
        { value: 'like', label: 'contains' },
    ]
};

interface CustomScreenerBuilderProps {
    onRun: (conditions: FilterCondition[]) => void;
    onSave?: (name: string, conditions: FilterCondition[]) => void;
}

export function CustomScreenerBuilder({ onRun, onSave }: CustomScreenerBuilderProps) {
    const [conditions, setConditions] = useState<FilterCondition[]>([
        { id: '1', field: 'percent_change', operator: 'gt', value: '2' }
    ]);
    const [screenerName, setScreenerName] = useState("");

    const addCondition = () => {
        setConditions([
            ...conditions,
            { id: Date.now().toString(), field: 'last_price', operator: 'gt', value: '' }
        ]);
    };

    const removeCondition = (id: string) => {
        setConditions(conditions.filter(c => c.id !== id));
    };

    const updateCondition = (id: string, field: keyof FilterCondition, value: string) => {
        setConditions(conditions.map(c => c.id === id ? { ...c, [field]: value } : c));
    };

    const handleRun = () => {
        onRun(conditions);
    };

    const handleSave = async () => {
        if (!screenerName.trim()) {
            alert("Please enter a screener name");
            return;
        }

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const filters = conditions.reduce((acc, cond) => {
                const field = FILTER_FIELDS.find(f => f.value === cond.field);
                if (!field) return acc;

                return {
                    ...acc,
                    [cond.field]: {
                        operator: cond.operator,
                        value: field.type === 'number' ? parseFloat(cond.value) : cond.value
                    }
                };
            }, {});

            const { error } = await supabase.from('screener_configs').insert({
                name: screenerName,
                source: 'custom',
                filters: filters,
                created_by: user.id,
                is_public: false
            });

            if (!error) {
                alert("Screener saved successfully!");
                if (onSave) onSave(screenerName, conditions);
                setScreenerName("");
            }
        } catch (error) {
            console.error("Error saving screener:", error);
        }
    };

    return (
        <GlassCard>
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                        <Filter className="h-5 w-5 text-sky-400" />
                        Custom Screener Builder
                    </h3>
                    <GlassButton onClick={addCondition} size="sm">
                        <Plus className="h-5 w-5 mr-1" />
                        Add Filter
                    </GlassButton>
                </div>

                {/* Conditions */}
                <div className="space-y-3">
                    {conditions.map((condition, index) => {
                        const field = FILTER_FIELDS.find(f => f.value === condition.field);
                        const operators = field ? OPERATORS[field.type as 'number' | 'text'] : OPERATORS.number;

                        return (
                            <div key={condition.id} className="flex items-center gap-3 p-3 bg-card/20 rounded-xl border border-border">
                                {index > 0 && (
                                    <span className="text-xs text-muted-foreground font-medium">AND</span>
                                )}

                                {/* Field Selector */}
                                <select
                                    value={condition.field}
                                    onChange={(e) => updateCondition(condition.id, 'field', e.target.value)}
                                    className="flex-1 px-3 py-2 bg-card/20 border border-border rounded-xl text-foreground text-sm"
                                >
                                    {FILTER_FIELDS.map(f => (
                                        <option key={f.value} value={f.value}>{f.label}</option>
                                    ))}
                                </select>

                                {/* Operator Selector */}
                                <select
                                    value={condition.operator}
                                    onChange={(e) => updateCondition(condition.id, 'operator', e.target.value)}
                                    className="px-3 py-2 bg-card/20 border border-border rounded-xl text-foreground text-sm"
                                >
                                    {operators.map(op => (
                                        <option key={op.value} value={op.value}>{op.label}</option>
                                    ))}
                                </select>

                                {/* Value Input */}
                                <GlassInput
                                    type={field?.type === 'number' ? 'number' : 'text'}
                                    value={condition.value}
                                    onChange={(e) => updateCondition(condition.id, 'value', e.target.value)}
                                    placeholder="Value"
                                    className="flex-1"
                                />

                                {/* Remove Button */}
                                <button
                                    onClick={() => removeCondition(condition.id)}
                                    className="p-2 hover:bg-red-500/20 rounded-xl transition-all duration-150 text-red-400 active:scale-95"
                                    disabled={conditions.length === 1}
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                        );
                    })}
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t border-border">
                    <div className="flex-1 flex gap-2">
                        <GlassInput
                            placeholder="Screener name (optional)"
                            value={screenerName}
                            onChange={(e) => setScreenerName(e.target.value)}
                            className="flex-1"
                        />
                        <GlassButton onClick={handleSave} variant="secondary">
                            <Save className="h-5 w-5 mr-2" />
                            Save
                        </GlassButton>
                    </div>
                    <GlassButton onClick={handleRun} variant="primary">
                        <Filter className="h-5 w-5 mr-2" />
                        Run Screener
                    </GlassButton>
                </div>

                {/* Example Hint */}
                <div className="text-xs text-slate-400 bg-sky-500/5 border border-sky-500/20 rounded-xl p-3">
                    <strong className="text-sky-400">Example:</strong> To find high-growth stocks, try: "% Change &gt; 2" AND "Volume &gt; 1000000"
                </div>
            </div>
        </GlassCard>
    );
}
