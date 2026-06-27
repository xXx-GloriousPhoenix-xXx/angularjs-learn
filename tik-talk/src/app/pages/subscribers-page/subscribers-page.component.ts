import { Component, inject } from '@angular/core';
import { SubscriberProfileCardComponent } from './subscriber-profile-card/subscriber-profile-card.component';
import { ProfileService } from '../../data/services/profile.service';

@Component({
    selector: 'app-subscribers-page',
    standalone: true,
    imports: [SubscriberProfileCardComponent],
    templateUrl: './subscribers-page.component.html',
    styleUrl: './subscribers-page.component.scss',
})
export class SubscribersPageComponent {
    profileService = inject(ProfileService);
    subscribers = this.profileService.mySubscribers;


}
