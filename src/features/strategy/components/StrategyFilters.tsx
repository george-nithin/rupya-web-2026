"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Search, X } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";

export interface FilterState {
    margin: string[];
    category: string[];
    instruments: string[];
}

interface StrategyFiltersProps {
    filters: FilterState;
    setFilters: (filters: FilterState) => void;
    onClearAll: () => void;
}

export function StrategyFilters({ filters, setFilters, onClearAll }: StrategyFiltersProps) {
    const [expandedSections, setExpandedSections] = useState({
        margin: true,
        category: true,
        segments: true,
    });

    const toggleSection = (section: keyof typeof expandedSections) => {
        setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const handleCheckboxChange = (section: keyof FilterState, value: string) => {
        const current = filters[section];
        const updated = current.includes(value)
            ? current.filter(v => v !== value)
            : [...current, value];

        setFilters({ ...filters, [section]: updated });
    };

    const sections = [
        {
            id: 'margin' as const,
            label: 'Margin (Funds Required)',
            options: [
                { label: 'Under 25k', value: 'under-25k' },
                { label: '25k to 1 Lakh', value: '25k-1l' },
                { label: '1 Lakh to 2 Lakh', value: '1l-2l' },
                { label: 'Above 2 Lakh', value: 'above-2l' },
            ]
        },
        {
            id: 'category' as const,
            label: 'Category',
            options: [
                { label: 'Options Buying', value: 'Options Buying' },
                { label: 'Options Selling', value: 'Options Selling' },
                { label: 'Mixed', value: 'Mixed' },
                { label: 'Others', value: 'Others' },
            ]
        }
    ];

    return (
        <div className="w-80 space-y-4 pr-6 border-r border-white/5 h-full">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <Search className="w-5 h-5 text-sky-400" />
                    <h3 className="text-lg font-bold text-white">Filter</h3>
                    {Object.values(filters).flat().length > 0 && (
                        <span className="bg-sky-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                            {Object.values(filters).flat().length}
                        </span>
                    )}
                </div>
                <button
                    onClick={onClearAll}
                    className="text-xs text-sky-400 hover:text-sky-300 transition-colors uppercase tracking-wider font-medium"
                >
                    Clear All
                </button>
            </div>

            {sections.map(section => (
                <div key={section.id} className="space-y-3 pb-4 border-b border-white/5">
                    <button
                        onClick={() => toggleSection(section.id as any)}
                        className="flex items-center justify-between w-full group"
                    >
                        <span className="text-sm font-semibold text-slate-300 group-hover:text-white transition-colors uppercase tracking-tight">
                            {section.label}
                        </span>
                        {expandedSections[section.id as keyof typeof expandedSections] ? (
                            <ChevronUp className="w-4 h-4 text-slate-500" />
                        ) : (
                            <ChevronDown className="w-4 h-4 text-slate-500" />
                        )}
                    </button>

                    {expandedSections[section.id as keyof typeof expandedSections] && (
                        <div className="space-y-3 pt-2">
                            {section.options.map(option => (
                                <label key={option.value} className="flex items-center gap-3 cursor-pointer group">
                                    <div className="relative flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={filters[section.id].includes(option.value)}
                                            onChange={() => handleCheckboxChange(section.id, option.value)}
                                            className="appearance-none w-4 h-4 border border-white/20 rounded bg-white/5 checked:bg-sky-500 checked:border-sky-500 transition-all cursor-pointer"
                                        />
                                        {filters[section.id].includes(option.value) && (
                                            <X className="absolute inset-0 w-4 h-4 text-white p-0.5 pointer-events-none" />
                                        )}
                                    </div>
                                    <span className="text-sm text-slate-400 group-hover:text-slate-200 transition-colors">
                                        {option.label}
                                    </span>
                                </label>
                            ))}
                        </div>
                    )}
                </div>
            ))}

            <div className="space-y-3 pb-4 border-b border-white/5">
                <button
                    onClick={() => toggleSection('segments')}
                    className="flex items-center justify-between w-full group"
                >
                    <span className="text-sm font-semibold text-slate-300 group-hover:text-white transition-colors uppercase tracking-tight">
                        Segments & Instruments
                    </span>
                    {expandedSections.segments ? (
                        <ChevronUp className="w-4 h-4 text-slate-500" />
                    ) : (
                        <ChevronDown className="w-4 h-4 text-slate-500" />
                    )}
                </button>
                {expandedSections.segments && (
                    <div className="pt-2">
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 group-focus-within:text-sky-400 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search instruments..."
                                value={filters.instruments[0] || ""}
                                onChange={(e) => setFilters({ ...filters, instruments: [e.target.value] })}
                                className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pl-9 pr-4 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-sky-500/50 transition-all"
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
