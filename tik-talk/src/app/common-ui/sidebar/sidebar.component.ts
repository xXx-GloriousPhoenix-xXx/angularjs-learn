import { Component } from '@angular/core';
import { SvgIconComponent } from "../svg-icon/svg-icon.component";
import { SubscriberCardComponent } from "./subscriber-card/subscriber-card.component";
import { RouterLink } from "@angular/router";

@Component({
    selector: 'app-sidebar',
    imports: [SvgIconComponent, RouterLink],
    templateUrl: './sidebar.component.html',
    styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
    menuItems = [
        {
            label: 'Home',
            icon: 'home',
            link: ''
        },
        {
            label: 'Chats',
            icon: 'chat',
            link: 'chats'
        },
        {
            label: 'Search',
            icon: 'search',
            link: 'search'
        }
    ]
}
