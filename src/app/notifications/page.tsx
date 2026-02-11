"use client";

import { NotificationList } from "@/features/notifications/components/NotificationList";
import { GlassCard } from "@/components/ui/GlassCard";

export default function NotificationsPage() {
    return (
        <div className="container mx-auto p-6 max-w-3xl">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-white mb-2">Notifications</h1>
                <p className="text-slate-400">Stay updated with market alerts, trade executions, and system messages.</p>
            </div>

            <NotificationList />
        </div>
    );
}
