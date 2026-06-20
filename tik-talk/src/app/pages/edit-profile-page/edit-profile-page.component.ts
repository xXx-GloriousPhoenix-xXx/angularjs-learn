import { Component, inject } from '@angular/core';
import { ProfileService } from '../../data/services/profile.service';
import { ActivatedRoute } from '@angular/router';
import { toObservable } from '@angular/core/rxjs-interop';
import { switchMap } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { ProfileHeaderComponent } from "../../common-ui/profile-header/profile-header.component";

@Component({
    selector: 'app-edit-profile-page',
    imports: [AsyncPipe, ProfileHeaderComponent],
    templateUrl: './edit-profile-page.component.html',
    styleUrl: './edit-profile-page.component.scss',
})
export class EditProfilePageComponent {
    profileService = inject(ProfileService);
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
