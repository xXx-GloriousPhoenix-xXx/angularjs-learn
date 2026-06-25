import { Component, Input } from '@angular/core';
import { Profile } from '../../data/interfaces/profile.interface';
import { RouterLink } from "@angular/router";

@Component({
    selector: 'app-profile-card',
    imports: [RouterLink],
    templateUrl: './profile-card.html',
    styleUrl: './profile-card.scss',
})
export class ProfileCardComponent {
    @Input() profile!: Profile;
}
