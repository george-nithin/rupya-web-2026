"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";

interface SectorData {
    name: string;
    marketCap: number; // For box size
    performance: number; // For color
    stockCount: number;
    avgPe: number;
}

interface SectorHeatmapProps {
    sectors: SectorData[];
}

const getHeatmapColor = (performance: number) => {
    // Green for positive, Red for negative. Intensity based on magnitude.
    if (performance >= 3) return "bg-emerald-500 hover:bg-emerald-400";
    if (performance >= 1) return "bg-emerald-500/80 hover:bg-emerald-400/80";
    if (performance >= 0) return "bg-emerald-500/60 hover:bg-emerald-400/60";
    if (performance >= -1) return "bg-rose-500/60 hover:bg-rose-400/60";
    if (performance >= -3) return "bg-rose-500/80 hover:bg-rose-400/80";
    return "bg-rose-500 hover:bg-rose-400";
};

export const SectorHeatmap = ({ sectors }: SectorHeatmapProps) => {
    const router = useRouter();
    const { theme } = useTheme();

    // Sort by Market Cap for better visualization (larger blocks first)
    const sortedSectors = [...sectors].sort((a, b) => b.marketCap - a.marketCap);

    // Calculate total Market Cap for relative sizing (optional, for now using grid)
    // For a true Treemap, we'd need a library. For a "Heatmap Grid", strict tiles are cleaner.
    // We will use a responsive grid where card size is uniform but color carries the data. 

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {sortedSectors.map((sector, index) => {
                const colorClass = getHeatmapColor(sector.performance);
                const isPositive = sector.performance >= 0;

                return (
                    <motion.div
                        key={sector.name}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => router.push(`/dashboard/sectors/${encodeURIComponent(sector.name)}`)}
                        className={`
                            cursor-pointer relative overflow-hidden rounded-xl p-4
                            flex flex-col justify-between h-32 md:h-40
                            ${colorClass} shadow-lg transition-colors
                            border border-white/10
                        `}
                    >
                        {/* Background Gradient overlay for depth */}
                        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-black/10 pointer-events-none" />

                        <div className="relative z-10">
                            <h3 className="text-white font-bold text-lg leading-tight truncate" title={sector.name}>
                                {sector.name}
                            </h3>
                            <p className="text-white/80 text-xs font-medium mt-1">
                                {sector.stockCount} Stocks
                            </p>
                        </div>

                        <div className="relative z-10 self-end text-right">
                            <div className="text-2xl font-bold text-white tracking-tighter">
                                {sector.performance > 0 ? "+" : ""}{sector.performance.toFixed(2)}%
                            </div>
                            <div className="text-white/70 text-xs">
                                Avg PE: {sector.avgPe.toFixed(1)}
                            </div>
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
};
