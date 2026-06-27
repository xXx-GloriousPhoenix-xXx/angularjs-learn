import { Component, computed, inject, input, signal } from '@angular/core';
import { Profile } from '../../../data/interfaces/profile.interface';
import { ProfileService } from '../../../data/services/profile.service';
import { RouterLink } from "@angular/router";

@Component({
    selector: 'app-subscriber-profile-card',
    standalone: true,
    imports: [RouterLink],
    templateUrl: './subscriber-profile-card.component.html',
    styleUrl: './subscriber-profile-card.component.scss',
})
export class SubscriberProfileCardComponent {
    profile = input.required<Profile>();
    isSubscribed = computed(() => {
        return this.profileService.mySubscriptions().includes(this.profile().username);
    });
    profileService = inject(ProfileService);
    onToggleSubscribe() {
        const username = this.profile().username;
        const currentlySubscribed = this.isSubscribed();
        const action = currentlySubscribed
            ? this.profileService.unsubscribe(username)
            : this.profileService.subscribe(username);

            action.subscribe({
                next: () => {
                    this.profileService.loadMySubscriptions();
                    this.profileService.refreshMySubscribers();
                },
                error: (err) => {
                    console.error('Subscription toggle failed', err);
                }
            });
    }

    hasSkills = computed(() => {
        const stack = this.profile()?.stack;
        return Array.isArray(stack) ? stack.length > 0 : !!stack;
    });
}
