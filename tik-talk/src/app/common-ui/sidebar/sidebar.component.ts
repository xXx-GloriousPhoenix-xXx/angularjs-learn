import { Component, inject } from '@angular/core';
import { SvgIconComponent } from "../svg-icon/svg-icon.component";
import { SubscriberCardComponent } from "./subscriber-card/subscriber-card.component";
import { RouterLink, RouterLinkActive } from "@angular/router";
import { ProfileService } from '../../data/services/profile.service';
import { firstValueFrom } from 'rxjs';
import { CountIndicatorComponent } from "../count-indicator/count-indicator.component";

@Component({
    selector: 'app-sidebar',
    imports: [SvgIconComponent, RouterLink, SubscriberCardComponent, RouterLinkActive, CountIndicatorComponent],
    templateUrl: './sidebar.component.html',
    styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
    profileService = inject(ProfileService);
    me = this.profileService.me
    subscribersCount = this.profileService.mySubscribersCount;
    subscribers = this.profileService.mySubscribers;

    ngOnInit() {
        firstValueFrom(this.profileService.getMe());
    }
}
