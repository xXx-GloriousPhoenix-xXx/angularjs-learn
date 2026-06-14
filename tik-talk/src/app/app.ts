import { Component, inject, signal } from '@angular/core';
// import { RouterOutlet } from '@angular/router';
import { ProfileCard } from './common-ui/profile-card/profile-card';
import { ProfileService } from './data/services/profile.service';
import { Profile } from './data/interfaces/profile.interface';

@Component({
    selector: 'app-root',
    imports: [
        ProfileCard,
    ],
    templateUrl: './app.html',
    styleUrl: './app.scss'
})
export class App {
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
