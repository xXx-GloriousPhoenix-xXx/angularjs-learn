import { Component, Input, inject, signal } from '@angular/core';
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
    isSubscribed = signal(false);
    profileService = inject(ProfileService);
    onToggleSubscribe() {
        const username = this.profile.username;
        const action = this.isSubscribed()
            ? this.profileService.unsubscribe(username)
            : this.profileService.subscribe(username);

        action.subscribe({
            next: () => {
                this.isSubscribed.update(v => !v);
            },
            error: (err) => console.error('Subscription error', err)
        });
    }
}
