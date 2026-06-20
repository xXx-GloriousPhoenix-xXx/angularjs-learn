import { Component, input } from '@angular/core';
import { Profile } from '../../data/interfaces/profile.interface';

@Component({
    selector: 'app-profile-header',
    standalone: true,
    templateUrl: './profile-header.component.html',
    styleUrl: './profile-header.component.scss',
    host: {
        '[class.is-edit]': 'isEdit()'
    }
})
export class ProfileHeaderComponent {
    profile = input<Profile | null>(null);
    isEdit = input<boolean>(false);
}
