"use client";

import { GlassCard } from "@/components/ui/GlassCard";

interface SectorStepProps {
    value: string[];
    onChange: (value: string[]) => void;
}

const sectors = [
    "Technology", "Banking", "Auto", "Pharma", "FMCG", "Metal",
    "Energy", "Real Estate", "Infra", "Media", "Public Sector", "Chemicals"
];

export function SectorStep({ value, onChange }: SectorStepProps) {
    const toggleSelection = (sector: string) => {
        if (value.includes(sector)) {
            onChange(value.filter((item) => item !== sector));
        } else {
            onChange([...value, sector]);
        }
    };

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-bold text-foreground text-center">Favorite Sectors</h2>
            <p className="text-muted-foreground text-center text-sm mb-6">We'll prioritize news for these industries.</p>

            <div className="flex flex-wrap gap-3 justify-center">
                {sectors.map((sector) => {
                    const isSelected = value.includes(sector);
                    return (
                        <button
                            key={sector}
                            onClick={() => toggleSelection(sector)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${isSelected
                                    ? "bg-sky-500 text-white shadow-strong shadow-sky-500/20 scale-105"
                                    : "bg-card/20 text-muted-foreground hover:bg-card/30 hover:text-foreground border border-border/50"
                                }`}
                        >
                            {sector}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
