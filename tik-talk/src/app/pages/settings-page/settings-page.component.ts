import { Component, ViewChild, effect, inject } from '@angular/core';
import { ProfileHeaderComponent } from "../../common-ui/profile-header/profile-header.component";
import { ProfileService } from '../../data/services/profile.service';
import { toObservable } from '@angular/core/rxjs-interop';
import { AsyncPipe } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { Profile } from '../../data/interfaces/profile.interface';
import { StackStringPipe } from '../../common-ui/pipes/stack-string-pipe';
import { StackListPipe } from '../../common-ui/pipes/stack-list-pipe';
import { AvatarUploadComponent } from "./avatar-upload/avatar-upload.component";
import { SvgIconComponent } from "../../common-ui/svg-icon/svg-icon.component";
import { AuthService } from '../../data/services/auth.service';
import { Router } from '@angular/router';
import { FormFieldComponent } from '../../common-ui/form-field/form-field.component';
import { TagInputComponent } from "../../common-ui/tag-input/tag-input.component";

@Component({
    selector: 'app-settings-page',
    imports: [ProfileHeaderComponent, AsyncPipe, ReactiveFormsModule, AvatarUploadComponent, SvgIconComponent, FormFieldComponent, TagInputComponent],
    templateUrl: './settings-page.component.html',
    styleUrl: './settings-page.component.scss',
})
export class SettingsPageComponent {
    profileService = inject(ProfileService);
    authService = inject(AuthService);
    me$ = toObservable(this.profileService.me);

    router = inject(Router);

    private stackListPipe = new StackListPipe();
    private stackStringPipe = new StackStringPipe();

    @ViewChild(AvatarUploadComponent) avatarUploader!: AvatarUploadComponent;

    constructor() {
        this.form.controls.username.disable();
        effect(() => {
            this.resetFormFromProfile();
        });
    }

    private resetFormFromProfile() {
        const profile = this.profileService.me();
        if (!profile) return;
        this.form.patchValue({
            ...profile,
            stack: profile.stack ?? [],
        });
    }

    fb = inject(FormBuilder);
    form = this.fb.group({
        firstName: this.fb.nonNullable.control('', Validators.required),
        lastName: this.fb.nonNullable.control('', Validators.required),
        username: this.fb.nonNullable.control('', { validators: Validators.required }),
        description: this.fb.nonNullable.control(''),
        stack: this.fb.nonNullable.control<string[]>([]),
    });

    async onSave() {
        this.form.markAllAsTouched();
        this.form.updateValueAndValidity();
        if (this.form.invalid) {
            return;
        }

        const avatarFile = this.avatarUploader.avatar();
        if (avatarFile) {
            await firstValueFrom(
                this.profileService.uploadAvatar(avatarFile)
            );
        }

        const raw = this.form.getRawValue();
        const payload: Partial<Profile> = {
            firstName: raw.firstName,
            lastName: raw.lastName,
            description: raw.description,
            stack: raw.stack,
        };

        await firstValueFrom(this.profileService.patchProfile(payload));

        this.router.navigate(['/profile/me']);
    }

    onCancel() {
        this.router.navigate(['/profile/me']);
    }

    onDelete() {
        this.resetFormFromProfile();
        this.avatarUploader.reset();
    }

    onLogout() {
        this.authService.logout();
    }
}
