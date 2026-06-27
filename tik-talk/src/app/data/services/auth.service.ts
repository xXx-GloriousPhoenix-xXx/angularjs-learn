import { HttpClient } from '@angular/common/http';
import { Service, inject } from '@angular/core';
import { TokenResponse } from '../interfaces/token-response.interface';
import { EMPTY, Observable, catchError, map, of, tap, throwError } from 'rxjs';
import { LoginPayload } from '../interfaces/login-payload.interface';
import { RegisterPayload } from '../interfaces/register-payload.interface';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { ProfileService } from './profile.service';

@Service()
export class AuthService {
    http = inject(HttpClient);
    profileService = inject(ProfileService);
    baseApiUrl = 'http://localhost:3000/auth';
    
    cookieService = inject(CookieService);
    access_token: string | null = null;
    refresh_token: string | null = null;

    router = inject(Router)

    get isAuth() {
        return !!this.access_token;
    }

    constructor() {
        this.access_token = this.cookieService.get('access_token') || null;
        this.refresh_token = this.cookieService.get('refresh_token') || null;
    }

    login(payload: LoginPayload) {
        return this.http.post<TokenResponse>(
            `${this.baseApiUrl}/login`,
            payload)
            .pipe(
                tap(val => this.setToken(val))
            );
    }
    register(payload: RegisterPayload) {
        return this.http.post(
            `${this.baseApiUrl}/register`,
            payload);
    }

    refresh(): Observable<TokenResponse> {
        if (!this.refresh_token) {
            this.router.navigate(["/auth/login"]);
            return throwError(() => new Error('No refresh token available'));
        }
        
        return this.http.post<TokenResponse>(
            `${this.baseApiUrl}/refresh`,
            { refresh_token: this.refresh_token }
        ).pipe(
            tap(val => this.setToken(val)),
            catchError(err => {
                console.error('Refresh failed, logging out...', err);
                this.logout(); 
                return throwError(() => err);
            })
        );
    }

    logout() {
        this.removeToken();
        this.profileService.stopPolling();
        this.router.navigate(['/auth/login']);
    }

    setToken(res: TokenResponse) {
        this.cookieService.set("access_token", res.access_token, undefined, '/');
        this.cookieService.set("refresh_token", res.refresh_token, undefined, '/');
        this.access_token = res.access_token;
        this.refresh_token = res.refresh_token;
    }

    removeToken() {
        this.cookieService.delete('access_token', '/');
        this.cookieService.delete('refresh_token', '/');
        this.access_token = null;
        this.refresh_token = null;
    }
}
