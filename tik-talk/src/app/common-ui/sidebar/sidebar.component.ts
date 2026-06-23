import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { SvgIconComponent } from "../svg-icon/svg-icon.component";
import { SubscriberCardComponent } from "./subscriber-card/subscriber-card.component";
import { RouterLink, RouterLinkActive } from "@angular/router";
import { ProfileService } from '../../data/services/profile.service';
import { firstValueFrom } from 'rxjs';

@Component({
    selector: 'app-sidebar',
    imports: [SvgIconComponent, RouterLink, AsyncPipe, SubscriberCardComponent, RouterLinkActive],
    templateUrl: './sidebar.component.html',
    styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
    profileService = inject(ProfileService);
    subscribers$ = this.profileService.getSubscribersShortList();
    me = this.profileService.me

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
