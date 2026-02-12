import { Notification } from "../types";
import { GlassCard } from "@/components/ui/GlassCard";
import { Bell, Info, AlertTriangle, TrendingUp, CheckCircle } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

interface NotificationItemProps {
    notification: Notification;
    onRead?: (id: string) => void;
}

export function NotificationItem({ notification, onRead }: NotificationItemProps) {
    const getIcon = () => {
        switch (notification.type) {
            case 'alert': return <AlertTriangle className="h-5 w-5 text-red-400" />;
            case 'trade': return <TrendingUp className="h-5 w-5 text-green-400" />;
            case 'system': return <CheckCircle className="h-5 w-5 text-blue-400" />;
            default: return <Info className="h-5 w-5 text-sky-400" />;
        }
    };

    const getBorderColor = () => {
        if (notification.is_read) return "border-border/50";
        switch (notification.type) {
            case 'alert': return "border-red-500/30";
            case 'trade': return "border-green-500/30";
            default: return "border-sky-500/30";
        }
    };

    const Content = (
        <div className="flex gap-4">
            <div className={`p-2 rounded-full bg-card/20 h-fit ${!notification.is_read ? 'animate-pulse' : ''}`}>
                {getIcon()}
            </div>
            <div className="flex-1 space-y-1">
                <div className="flex justify-between items-start">
                    <h4 className={`font-medium ${notification.is_read ? 'text-muted-foreground' : 'text-foreground'}`}>
                        {notification.title}
                    </h4>
                    <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                    </span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                    {notification.message}
                </p>
            </div>
        </div>
    );

    return (
        <GlassCard
            className={`p-4 transition-all hover:bg-card/20 cursor-pointer ${getBorderColor()}`}
            onClick={() => onRead && !notification.is_read && onRead(notification.id)}
        >
            {notification.link ? (
                <Link href={notification.link}>
                    {Content}
                </Link>
            ) : (
                Content
            )}
        </GlassCard>
    );
}
