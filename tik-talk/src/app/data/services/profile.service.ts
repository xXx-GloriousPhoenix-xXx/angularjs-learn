import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Profile } from '../interfaces/profile.interface';

@Injectable({ providedIn: 'root' })
export class ProfileService {
    http = inject(HttpClient);
    baseApiUrl = 'http://localhost:3000';
    getTestAccount() {
        return this.http.get<Profile[]>(`${this.baseApiUrl}/account/test_account`);
    }
}
