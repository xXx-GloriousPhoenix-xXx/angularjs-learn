import { Component, inject } from '@angular/core';
import { ProfileService } from '../../data/services/profile.service';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { switchMap } from 'rxjs';
import { toObservable } from '@angular/core/rxjs-interop';
import { AsyncPipe } from '@angular/common';
import { ProfileHeaderComponent } from "../../common-ui/profile-header/profile-header.component";
import { SvgIconComponent } from "../../common-ui/svg-icon/svg-icon.component";

@Component({
    selector: 'app-view-profile-page',
    imports: [AsyncPipe, ProfileHeaderComponent, RouterLink, SvgIconComponent],
    templateUrl: './view-profile-page.component.html',
    styleUrl: './view-profile-page.component.scss',
})
export class ViewProfilePageComponent {
    profileService = inject(ProfileService);
    subscribers$ = this.profileService.getSubscribersShortList(5);
    route = inject(ActivatedRoute);
    me$ = toObservable(this.profileService.me);
    profile$ = this.route.params
        .pipe(
            switchMap(({id}) => {                
                if (id === 'me') return this.me$;
                return this.profileService.getAccount(id);
            })
        )
}
