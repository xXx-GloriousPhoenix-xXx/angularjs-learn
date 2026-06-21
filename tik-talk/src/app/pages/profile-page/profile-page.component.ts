import { Component, inject } from '@angular/core';
import { ProfileHeaderComponent } from "../../common-ui/profile-header/profile-header.component";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { ProfileService } from '../../data/services/profile.service';
import { toObservable } from '@angular/core/rxjs-interop';
import { Observable, switchMap } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { Profile } from '../../data/interfaces/profile.interface';
import { PostFeedComponent } from "./post-feed/post-feed.component";

@Component({
    selector: 'app-profile-page',
    imports: [ProfileHeaderComponent, RouterLink, AsyncPipe, PostFeedComponent],
    templateUrl: './profile-page.component.html',
    styleUrl: './profile-page.component.scss',
})
export class ProfilePageComponent {
    profileService = inject(ProfileService);
    route = inject(ActivatedRoute);
    
    subscribers$ = this.profileService.getSubscribersShortList(5);
    profile$ = this.route.params
        .pipe(
            switchMap(({id}) => {                
                if (id === 'me') return this.me$;
                return this.profileService.getAccount(id);
            })
        );

    me$ = toObservable(this.profileService.me);
}
