export type NotificationType = 'info' | 'alert' | 'trade' | 'system';

export interface Notification {
    id: string;
    user_id: string;
    type: NotificationType;
    title: string;
    message: string;
    link?: string;
    metadata?: any;
    is_read: boolean;
    created_at: string;
    updated_at: string;
}
