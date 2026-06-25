import { HttpClient, HttpParams } from '@angular/common/http';
import { Service, computed, inject, signal } from '@angular/core';
import { Profile } from '../interfaces/profile.interface';
import { Subject, map, of, startWith, switchMap, tap } from 'rxjs';
import { Pagable } from '../interfaces/pagable.interface';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';

@Service()
export class ProfileService {
    http = inject(HttpClient);
    baseApiUrl = 'http://localhost:3000';
    me = signal<Profile | null>(null);
    route = inject(ActivatedRoute);
    filteredProfiles = signal<Pagable<Profile>>({
        items: [],
        itemCount: 0,
        pageSize: 3,
        pageCount: 1,
        pageNum: 1
    });
    isProfileCompleted = computed(() => {
        const profile = this.me();
        if (!profile) {
            return false;
        }
        
        return profile.firstName.trim() !== ''
            && profile.lastName.trim() !== '';
    });
    private mySubscribersRefresh$ = new Subject<void>();
    subscribers = toSignal(
        this.route.params.pipe(
            switchMap(() => this.getSubscribersShortList(5))
        ),
        { initialValue: [] }
    );
    subscribersCount = computed(() => this.subscribers().length);
    refreshMySubscribers() {
        this.mySubscribersRefresh$.next();
    }
    mySubscribers = toSignal(
        this.mySubscribersRefresh$.pipe(
            startWith(null),
            switchMap(() => {
                const me = this.me();
                if (!me) return of([]);
                return this.getSubscribers(me.username, 5).pipe(
                    map(page => page.items)
                );
            })
        ),
        { initialValue: [] }
    );
    
    mySubscribersCount = computed(() => this.mySubscribers().length);

    getMe() {
        return this.http.get<Profile>(`${this.baseApiUrl}/account/me`)
            .pipe(
                tap(val => this.me.set(val))
            );
    }
    getSubscribersShortList(count: number = 3) {
        const params = new HttpParams().set('pageSize', count.toString());
        return this.http.get<Pagable<Profile>>(
            `${this.baseApiUrl}/subscribers`,
            { params }
        ).pipe(
            map(res => res.items)
        );
    }
    getAccount(id: string) {
        return this.http.get<Profile>(`${this.baseApiUrl}/account/${id}`);
    }

    patchProfile(profile: Partial<Profile>) {
        return this.http.patch<Profile>(
            `${this.baseApiUrl}/account/me`,
            profile
        ).pipe(
            tap(val => this.me.set(val))
        )
    }

    uploadAvatar(file: File) {
        const fd = new FormData();
        fd.append('avatar', file);

        return this.http.post<Profile>(
            `${this.baseApiUrl}/account/me/avatar`,
            fd
        ).pipe(
            tap(val => this.me.set(val))
        );
    }

    filterProfiles(params: Record<string, any>) {
        let httpParams: Record<string, any> = { ...params };
        const currentMe = this.me();
        if (currentMe && currentMe.username) {
            httpParams['excludeUsername'] = currentMe.username;
        }

        return this.http.get<Pagable<Profile>>(
            `${this.baseApiUrl}/account/accounts`,
            { params: httpParams }
        ).pipe(
            tap(res => this.filteredProfiles.set(res))
        );
    }

    getSubscribers(username: string, pageSize = 10) {
        const params: any = { pageSize };
        return this.http.get<Pagable<Profile>>(
            `${this.baseApiUrl}/subscribers/${username}`,
            { params }
        );
    }

    subscribe(username: string) {
        return this.http.post<any>(`${this.baseApiUrl}/subscribers/${username}`, {});
    }
    
    unsubscribe(username: string) {
        return this.http.delete<any>(`${this.baseApiUrl}/subscribers/${username}`);
    }
}
