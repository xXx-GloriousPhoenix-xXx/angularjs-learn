import { Component, inject } from '@angular/core';
import { ProfileService } from '../../data/services/profile.service';

@Component({
    selector: 'app-edit-profile-header',
    imports: [],
    templateUrl: './edit-profile-header.component.html',
    styleUrl: './edit-profile-header.component.scss',
})
export class EditProfileHeaderComponent {
    profileService = inject(ProfileService);
    me = this.profileService.me;
}
