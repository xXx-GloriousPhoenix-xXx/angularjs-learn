export interface ChatListItem {
    id: string;
    otherUser: {
        username: string;
        firstName: string;
        lastName: string;
        avatarUrl: string | null;
    };
    lastMessage: string | null;
    lastActivity: string;
    unreadCount: number;
}
