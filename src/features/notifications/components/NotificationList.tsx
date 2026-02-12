"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Notification } from "../types";
import { NotificationItem } from "./NotificationItem";
import { GlassCard } from "@/components/ui/GlassCard";
import { Loader2, BellOff } from "lucide-react";

export function NotificationList() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNotifications();
        subscribeToNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(50);

            if (data) setNotifications(data as Notification[]);
        } finally {
            setLoading(false);
        }
    };

    const subscribeToNotifications = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const channel = supabase
            .channel('notifications_list')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${user.id}`
                },
                (payload) => {
                    const newNotification = payload.new as Notification;
                    setNotifications(prev => [newNotification, ...prev]);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    };

    const markAsRead = async (id: string) => {
        // Optimistic update
        setNotifications(prev => prev.map(n =>
            n.id === id ? { ...n, is_read: true } : n
        ));

        await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('id', id);
    };

    if (loading) {
        return (
            <div className="flex justify-center p-8">
                <Loader2 className="w-8 h-8 text-sky-400 animate-spin" />
            </div>
        );
    }

    if (notifications.length === 0) {
        return (
            <GlassCard className="p-8 text-center flex flex-col items-center justify-center min-h-[400px]">
                <div className="p-4 rounded-full bg-card/20 mb-4">
                    <BellOff className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-medium text-foreground mb-2">No Notifications</h3>
                <p className="text-muted-foreground max-w-sm">
                    You're all caught up! notifications about market movements and your trades will appear here.
                </p>
            </GlassCard>
        );
    }

    return (
        <div className="space-y-4">
            {notifications.map(notification => (
                <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onRead={markAsRead}
                />
            ))}
        </div>
    );
}
