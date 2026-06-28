import { Component } from '@angular/core';
import { ChatListComponent } from '../chat-list/chat-list.component';
import { RouterOutlet } from '@angular/router';

@Component({
    selector: 'app-chat-layout',
    imports: [ChatListComponent, RouterOutlet],
    templateUrl: './chat-layout.component.html',
    styleUrl: './chat-layout.component.scss',
})
export class ChatLayoutComponent {

}
