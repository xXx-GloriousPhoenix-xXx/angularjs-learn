import { HttpClient } from '@angular/common/http';
import { Service, inject, signal } from '@angular/core';
import { Message } from '../interfaces/message.interface';
import { map, switchMap, tap } from 'rxjs';
import { ChatListItem } from '../interfaces/chat-list-item.interface';

@Service()
export class ChatService {
    http = inject(HttpClient);
    baseApiUrl = 'http://localhost:3000/chats';
    
    chats = signal<ChatListItem[]>([]);
    activeChatId = signal<string | null>(null);
    messages = signal<Message[]>([]);
    isLoadingMessages = signal(false);

    loadChats() {
        this.http.get<ChatListItem[]>(`${this.baseApiUrl}`).subscribe({
            next: (chats) => this.chats.set(chats),
        });
    }

    openChat(otherUsername: string) {
        this.http.post<{ chatId: string }>(`${this.baseApiUrl}/${otherUsername}`, {}).pipe(
            switchMap(res => {
                this.activeChatId.set(res.chatId);
                return this.loadMessages(res.chatId);
            })
        ).subscribe();
    }

    loadMessages(chatId: string) {
        this.isLoadingMessages.set(true);
        return this.http.get<{ items: Message[] }>(`${this.baseApiUrl}/${chatId}/messages`).pipe(
            map(page => page.items),
            tap({
                next: (msgs) => {
                    this.messages.set(msgs);
                    this.isLoadingMessages.set(false);
                },
                error: () => this.isLoadingMessages.set(false),
            })
        );
    }

    sendMessage(text: string) {
        const chatId = this.activeChatId();
        if (!chatId) return;
 
        this.http.post<Message>(`${this.baseApiUrl}/${chatId}/messages`, { text }).subscribe({
            next: (msg) => {
                this.messages.update(msgs => [...msgs, msg]);
            },
        });
    }
 
    startPolling(intervalMs = 5000) {
        setInterval(() => {
            if (this.activeChatId()) {
                this.loadMessages(this.activeChatId()!).subscribe();
            }
            this.loadChats();
        }, intervalMs);
    }

}
