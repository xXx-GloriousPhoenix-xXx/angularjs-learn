import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../data/services/auth.service';
import { LoginForm } from '../../data/interfaces/login-form.interface';
import { Router, RouterLink } from "@angular/router";

@Component({
    selector: 'app-login-page',
    imports: [ReactiveFormsModule, RouterLink],
    templateUrl: './login-page.component.html',
    styleUrl: './login-page.component.scss'
})
export class LoginPageComponent {
    authService = inject(AuthService);
    router = inject(Router);

    isPasswordHidden = signal<boolean>(true);

    form = new FormGroup<LoginForm>({
        username: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
        password: new FormControl('', { nonNullable: true, validators: [Validators.required] })
    })

    onSubmit() {
        if (this.form.valid) {
            const raw = this.form.getRawValue();
            this.authService.login(raw).subscribe({
                next: (response) => {
                    console.log('Logged in successfully, token:', response.access_token);
                    this.router.navigate(['/']);
                },
                error: (err) => {
                    console.error('Log in failed', err);
                }
            })
        }
    }
}
