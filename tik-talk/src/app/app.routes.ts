import { Routes } from '@angular/router';
import { LoginPageComponent } from './pages/login-page/login-page.component';
import { SearchPageComponent } from './pages/search-page/search-page.component';
import { RegisterPageComponent } from './pages/register-page/register-page.component';
import { AuthLayoutComponent } from './common-ui/auth-layout/auth-layout.component';
import { SidebarLayoutComponent } from './common-ui/sidebar-layout/sidebar-layout.component';
import { canActivateAuth } from './common-ui/access.guard';
import { ProfilePageComponent } from './pages/profile-page/profile-page.component';
import { SettingsPageComponent } from './pages/settings-page/settings-page.component';

export const routes: Routes = [
    { 
        path: '', 
        component: SidebarLayoutComponent, 
        children: [
            { path: '', redirectTo: 'profile/me', pathMatch: 'full' },
            { path: 'search', component: SearchPageComponent },
            { path: 'profile/:id', component: ProfilePageComponent },
            { path: 'settings', component: SettingsPageComponent }
        ],
        canActivate: [canActivateAuth]
    },
    { 
        path: 'auth',
        component: AuthLayoutComponent,
        children: [
            { path: 'login', component: LoginPageComponent },
            { path: 'register', component: RegisterPageComponent }
        ] 
    },
];
