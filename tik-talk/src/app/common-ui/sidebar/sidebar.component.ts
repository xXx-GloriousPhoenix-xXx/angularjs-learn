import { Component, inject } from '@angular/core';
import { SvgIconComponent } from "../svg-icon/svg-icon.component";
import { SubscriberCardComponent } from "./subscriber-card/subscriber-card.component";
import { RouterLink, RouterLinkActive } from "@angular/router";
import { ProfileService } from '../../data/services/profile.service';
import { firstValueFrom } from 'rxjs';

@Component({
    selector: 'app-sidebar',
    imports: [SvgIconComponent, RouterLink, SubscriberCardComponent, RouterLinkActive],
    templateUrl: './sidebar.component.html',
    styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
    profileService = inject(ProfileService);
    me = this.profileService.me
    subscriberCount = this.profileService.subscribersCount;
    subscribers = this.profileService.subscribers;

    menuItems = [
        {
            label: 'Home',
            icon: 'home',
            link: 'profile/me'
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
    ];

    ngOnInit() {
        firstValueFrom(this.profileService.getMe());
    }
}
