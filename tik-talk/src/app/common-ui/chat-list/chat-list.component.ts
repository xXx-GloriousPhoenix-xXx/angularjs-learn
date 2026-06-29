import { Component, inject } from '@angular/core';
import { ChatService } from '../../data/services/chat.service';
import { SearchInputComponent } from "../search-input/search-input.component";
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
    selector: 'app-chat-list',
    imports: [SearchInputComponent, RouterLink, RouterLinkActive],
    templateUrl: './chat-list.component.html',
    styleUrl: './chat-list.component.scss',
})
export class ChatListComponent {
    chatService = inject(ChatService);
    chats = this.chatService.chats;
    router = inject(Router);
 
    ngOnInit() {
        this.chatService.loadChats();
    }

    formatLastActivity(isoDate: string): string {
        const date = new Date(isoDate);
        const now = new Date();
 
        const isToday =
            date.getFullYear() === now.getFullYear() &&
            date.getMonth() === now.getMonth() &&
            date.getDate() === now.getDate();
 
        if (isToday) {
            return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
        }
 
        return date.toLocaleDateString(undefined, { day: '2-digit', month: '2-digit' });
    }
}
