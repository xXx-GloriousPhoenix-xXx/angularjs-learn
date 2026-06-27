import { Component, computed, inject, OnDestroy, OnInit } from '@angular/core';
import { ProfileHeaderComponent } from "../../common-ui/profile-header/profile-header.component";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { ProfileService } from '../../data/services/profile.service';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { Subject, map, merge, of, startWith, switchMap } from 'rxjs';
import { PostFeedComponent } from "./post-feed/post-feed.component";
import { StackListPipe } from '../../common-ui/pipes/stack-list-pipe';
import { SvgIconComponent } from "../../common-ui/svg-icon/svg-icon.component";
import { DestroyRef } from '@angular/core';
import { CountIndicatorComponent } from "../../common-ui/count-indicator/count-indicator.component";

@Component({
    selector: 'app-profile-page',
    imports: [ProfileHeaderComponent, RouterLink, PostFeedComponent, StackListPipe, SvgIconComponent, CountIndicatorComponent],
    templateUrl: './profile-page.component.html',
    styleUrl: './profile-page.component.scss',
})
export class ProfilePageComponent implements OnInit, OnDestroy {
    profileService = inject(ProfileService);
    route = inject(ActivatedRoute);
    destroyRef = inject(DestroyRef);

    private me$ = toObservable(this.profileService.me);

    private profileId$ = this.route.params.pipe(
        map(params => params['id'] || 'me')
    );

    private refreshProfile$ = new Subject<void>();

    profile = toSignal(
        this.profileId$.pipe(
            switchMap(id =>
                this.refreshProfile$.pipe(
                    startWith(null),
                    switchMap(() => {
                        if (id === 'me' || !id) {
                            return this.me$;
                        }
                        return this.profileService.getAccount(id);
                    })
                )
            )
        )
    );

    private refreshSubs$ = new Subject<void>();

    subscribers = toSignal(
        this.profileId$.pipe(
            switchMap(id =>
                this.refreshSubs$.pipe(
                    startWith(null),
                    switchMap(() => {
                        if (id === 'me') {
                            return this.me$.pipe(
                                switchMap(me => {
                                    if (!me) return of([]);
                                    return this.profileService.getSubscribers(me.username, 100)
                                        .pipe(map(page => page.items));
                                })
                            );
                        } else {
                            return this.profileService.getSubscribers(id, 100)
                                .pipe(map(page => page.items));
                        }
                    })
                )
            )
        ),
        { initialValue: [] }
    );

    subscriberCount = computed(() => this.subscribers().length);

    isMe = computed(() => {
        const me = this.profileService.me();
        const profile = this.profile();
        return me?.username === profile?.username;
    });

    isSubscribed = computed(() => {
        const me = this.profileService.me();
        if (!me) return false;
        return this.subscribers().some(sub => sub.username === me.username);
    });

    hasSkills = computed(() => {
        const stack = this.profile()?.stack;
        return Array.isArray(stack) ? stack.length > 0 : !!stack;
    });

    private pollingTimer: any = null;
    private readonly POLL_INTERVAL = 15000; // 15 секунд

    ngOnInit() {
        this.pollingTimer = setInterval(() => {
            this.refreshSubs$.next();
            this.refreshProfile$.next();
        }, this.POLL_INTERVAL);
    }

    ngOnDestroy() {
        if (this.pollingTimer) {
            clearInterval(this.pollingTimer);
        }
    }

    onToggleSubscribe() {
        const profile = this.profile();
        if (!profile) return;

        const username = profile.username;
        const action = this.isSubscribed()
            ? this.profileService.unsubscribe(username)
            : this.profileService.subscribe(username);

        action.subscribe({
            next: () => {
                this.refreshSubs$.next();
                this.refreshProfile$.next();
                this.profileService.loadMySubscriptions();
                this.profileService.refreshMySubscribers();
            },
            error: (err) => console.error('Subscription error', err)
        });
    }
}