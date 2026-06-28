export interface Chat {
    id: string;
    participants: string[];
    lastActivity: string;
    lastMessage?: string;
    unreadCount?: number;
}
