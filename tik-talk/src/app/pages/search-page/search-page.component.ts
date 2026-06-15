import { Component, inject, signal } from '@angular/core';
import { ProfileService } from '../../data/services/profile.service';
import { Profile } from '../../data/interfaces/profile.interface';
import { ProfileCardComponent } from '../../common-ui/profile-card/profile-card';

@Component({
    selector: 'app-search-page',
    imports: [
        ProfileCardComponent,
    ],
    templateUrl: './search-page.component.html',
    styleUrl: './search-page.component.scss',
})
export class SearchPageComponent {
    protected readonly title = signal('tik-talk');
    profileService = inject(ProfileService);
    profiles = signal<Profile[]>([]);
    constructor() {
        this.profileService.getTestAccount()
            .subscribe(val => {
                this.profiles.set(val);
            });
    }
}
