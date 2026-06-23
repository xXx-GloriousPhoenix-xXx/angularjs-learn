import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../data/services/auth.service';
import { RegisterForm } from '../../data/interfaces/register-form.interface';
import { Router, RouterLink } from "@angular/router";

@Component({
    selector: 'app-register-page',
    imports: [ReactiveFormsModule, RouterLink],
    templateUrl: './register-page.component.html',
})
export class RegisterPageComponent {
    authService = inject(AuthService);
    router = inject(Router);

    form = new FormGroup<RegisterForm>({
        username: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
        email: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
        password: new FormControl('', { nonNullable: true, validators: [Validators.required] })
    })

    onSubmit() {
        if (this.form.valid) {
            const raw = this.form.getRawValue();
            this.authService.register(raw).subscribe({
                next: () => {
                    console.log('Registered successfully');
                    this.router.navigate(['/auth/login']);
                },
                error: (err) => {
                    console.error('Register failed, error:', err);
                }
            });
        }
    }
}
