import { Component, EventEmitter, Input, Output, computed, inject, signal } from '@angular/core';
import { Profile } from '../../data/interfaces/profile.interface';
import { RouterLink } from "@angular/router";
import { ProfileService } from '../../data/services/profile.service';
import { SkillTagComponent } from "../skill-tag/skill-tag.component";

@Component({
    selector: 'app-profile-card',
    imports: [RouterLink, SkillTagComponent],
    templateUrl: './profile-card.html',
    styleUrl: './profile-card.scss',
})
export class ProfileCardComponent {
    @Input() profile!: Profile;
    @Output() skillClick = new EventEmitter<string>();
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
