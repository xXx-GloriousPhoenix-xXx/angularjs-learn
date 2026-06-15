import { HttpClient } from '@angular/common/http';
import { Service, inject } from '@angular/core';
import { Profile } from '../interfaces/profile.interface';

@Service()
export class ProfileService {
    http = inject(HttpClient);
    baseApiUrl = 'http://localhost:3000';
    getTestAccount() {
        return this.http.get<Profile[]>(`${this.baseApiUrl}/account/test_account`);
    }
}
