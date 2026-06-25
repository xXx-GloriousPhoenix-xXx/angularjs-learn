import { Component, computed, inject } from '@angular/core';
import { ProfileHeaderComponent } from "../../common-ui/profile-header/profile-header.component";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { ProfileService } from '../../data/services/profile.service';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { map, switchMap } from 'rxjs';
import { PostFeedComponent } from "./post-feed/post-feed.component";
import { StackListPipe } from '../../common-ui/pipes/stack-list-pipe';

@Component({
    selector: 'app-profile-page',
    imports: [ProfileHeaderComponent, RouterLink, PostFeedComponent, StackListPipe],
    templateUrl: './profile-page.component.html',
    styleUrl: './profile-page.component.scss',
})
export class ProfilePageComponent {
    profileService = inject(ProfileService);
    route = inject(ActivatedRoute);
    
    private routeId = toSignal(
        this.route.params.pipe(
            map(params => params['id'] || 'me')
        )
    );

    profile = toSignal(
        this.route.params.pipe(
            switchMap(({ id }) => {                
                if (id === 'me' || !id) return toObservable(this.profileService.me);
                return this.profileService.getAccount(id);
            })
        )
    );

    subscribers = toSignal(
        this.route.params.pipe(
            switchMap(() => this.profileService.getSubscribersShortList(5))
        ),
        { initialValue: [] }
    );

    hasSkills = computed(() => {
        const stack = this.profile()?.stack;
        return Array.isArray(stack) ? stack.length > 0 : !!stack;
    });

    subscribersCount = computed(() => this.subscribers().length);
}
