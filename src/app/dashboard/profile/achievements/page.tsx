import { AchievementsGrid } from "@/features/gamification/components/AchievementsGrid";

export default function AchievementsPage() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-white">Achievements</h1>
                <p className="text-slate-400">Milestones and badges earned on your journey.</p>
            </div>
            <AchievementsGrid />
        </div>
    );
}
