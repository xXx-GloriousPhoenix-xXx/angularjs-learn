import { Component, Input, computed, inject, signal } from '@angular/core';
import { Profile } from '../../data/interfaces/profile.interface';
import { RouterLink } from "@angular/router";
import { ProfileService } from '../../data/services/profile.service';

@Component({
    selector: 'app-profile-card',
    imports: [RouterLink],
    templateUrl: './profile-card.html',
    styleUrl: './profile-card.scss',
})
export class ProfileCardComponent {
    @Input() profile!: Profile;
    profileService = inject(ProfileService);

    isSubscribed = computed(() => {
        return this.profileService.mySubscriptions().includes(this.profile.username);
    });

    onToggleSubscribe() {
        const username = this.profile.username;
        const action = this.isSubscribed()
            ? this.profileService.unsubscribe(username)
            : this.profileService.subscribe(username);

        action.subscribe({
            next: () => {
                this.profileService.loadMySubscriptions();
                this.profileService.refreshMySubscribers();
            },
            error: (err) => console.error('Subscription error', err)
        });
    }
}
