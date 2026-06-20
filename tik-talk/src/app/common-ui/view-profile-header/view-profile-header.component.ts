import { Component, inject } from '@angular/core';
import { ProfileService } from '../../data/services/profile.service';
import { SvgIconComponent } from "../svg-icon/svg-icon.component";
import { RouterLink } from "@angular/router";

@Component({
    selector: 'app-view-profile-header',
    imports: [SvgIconComponent, RouterLink],
    templateUrl: './view-profile-header.component.html',
    styleUrl: './view-profile-header.component.scss',
})
export class ViewProfileHeaderComponent {
    profileService = inject(ProfileService);
    me = this.profileService.me;
}
