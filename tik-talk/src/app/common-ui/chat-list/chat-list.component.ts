import { Component, inject } from '@angular/core';
import { ChatService } from '../../data/services/chat.service';
import { ProfileService } from '../../data/services/profile.service';
import { Chat } from '../../data/interfaces/chat.interface';
import { SearchInputComponent } from "../search-input/search-input.component";

@Component({
    selector: 'app-chat-list',
    imports: [SearchInputComponent],
    templateUrl: './chat-list.component.html',
    styleUrl: './chat-list.component.scss',
})
export class ChatListComponent {
    chatService = inject(ChatService);
    profileService = inject(ProfileService);
    chats = this.chatService.chats;
    me = this.profileService.me;

    ngOnInit() {
        this.chatService.loadChats();
    }

    getOtherParticipant(chat: Chat): string {
        const me = this.profileService.me()?.username;
        return chat.participants.find(p => p !== me) || '';
    }

    log(value: string) {
        console.log(value);
    }
}
