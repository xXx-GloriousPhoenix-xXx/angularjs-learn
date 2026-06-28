import { Component, inject } from '@angular/core';
import { ChatService } from '../../data/services/chat.service';
import { ProfileService } from '../../data/services/profile.service';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';

@Component({
    selector: 'app-chat-window',
    imports: [FormsModule, DatePipe],
    templateUrl: './chat-window.component.html',
    styleUrl: './chat-window.component.scss',
})
export class ChatWindowComponent {
    chatService = inject(ChatService);
    profileService = inject(ProfileService);
    messages = this.chatService.messages;
    activeChatId = this.chatService.activeChatId;
    me = this.profileService.me;

    newMessage = '';

    send() {
        if (this.newMessage.trim()) {
            this.chatService.sendMessage(this.newMessage.trim());
            this.newMessage = '';
        }
    }
}
