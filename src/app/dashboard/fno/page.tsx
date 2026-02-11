"use client";

import { FnoMovers } from "@/features/market/components/FnoMovers";
import { ResearchRecommendations } from "@/features/market/components/ResearchRecommendations";

export default function FnoDashboardPage() {
    return (
        <div className="space-y-8 pb-10">
            <div>
                <h1 className="text-2xl font-bold text-white mb-2">F&O Dashboard</h1>
                <p className="text-sm text-slate-400">Future & Options Market Analysis and Trading Ideas</p>
            </div>

            {/* F&O Movers & Buildups */}
            <FnoMovers />

            {/* Trading Ideas */}
            <ResearchRecommendations />
        </div>
    );
}
