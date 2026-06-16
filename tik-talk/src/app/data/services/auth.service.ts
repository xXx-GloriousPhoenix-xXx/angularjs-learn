import { HttpClient } from '@angular/common/http';
import { Service, inject } from '@angular/core';
import { TokenResponse } from '../interfaces/token-response.interface';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { LoginPayload } from '../interfaces/login-payload.interface';
import { RegisterPayload } from '../interfaces/register-payload.interface';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';

@Service()
export class AuthService {
    http = inject(HttpClient);
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
                tap(val => {
                    this.access_token = val.access_token;
                    this.refresh_token = val.refresh_token;

                    this.cookieService.set("access_token", val.access_token, undefined, '/');
                    this.cookieService.set("refresh_token", val.refresh_token, undefined, '/');
                })
            );
    }
    register(payload: RegisterPayload) {
        return this.http.post(
            `${this.baseApiUrl}/register`,
            payload);
    }

    // logout()
    refresh(): Observable<boolean> {
        if (this.refresh_token) {
            this.router.navigate(["/login"]);
            return of(false);
        }
        
        return this.http.post<TokenResponse>(
            `${this.baseApiUrl}/refresh`,
            { refresh_token: this.refresh_token })
            .pipe(
                tap(val => {
                    this.access_token = val.access_token;
                }),
                map(() => true),
                catchError((err) => {
                    console.error('Refresh failed, logging out...', err);
                    this.access_token = null;
                    this.refresh_token = null;

                    this.router.navigate(["/auth/login"]);
                    return of(false);
                })
            );
    }
}
