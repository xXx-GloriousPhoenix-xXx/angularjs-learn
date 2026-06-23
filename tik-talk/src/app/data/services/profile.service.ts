import { HttpClient } from '@angular/common/http';
import { Service, inject, signal } from '@angular/core';
import { Profile } from '../interfaces/profile.interface';
import { map, tap } from 'rxjs';
import { Pagable } from '../interfaces/pagable.interface';

@Service()
export class ProfileService {
    http = inject(HttpClient);
    baseApiUrl = 'http://localhost:3000';
    me = signal<Profile | null>(null);

    getTestAccount() {
        return this.http.get<Profile[]>(`${this.baseApiUrl}/account/test_account`);
    }
    getMe() {
        return this.http.get<Profile>(`${this.baseApiUrl}/account/me`)
            .pipe(
                tap(val => this.me.set(val))
            );
    }
    getSubscribersShortList(count: number = 3) {
        return this.http.get<Pagable<Profile>>(`${this.baseApiUrl}/account/subscribers`)
            .pipe(
                map(res => res.items.slice(0, count))
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
}
