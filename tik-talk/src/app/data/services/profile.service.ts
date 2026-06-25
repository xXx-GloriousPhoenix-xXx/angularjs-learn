import { HttpClient, HttpParams } from '@angular/common/http';
import { Service, computed, inject, signal } from '@angular/core';
import { Profile } from '../interfaces/profile.interface';
import { map, tap } from 'rxjs';
import { Pagable } from '../interfaces/pagable.interface';

@Service()
export class ProfileService {
    http = inject(HttpClient);
    baseApiUrl = 'http://localhost:3000';
    me = signal<Profile | null>(null);
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
}
