import { Routes } from '@angular/router';
import { LoginPageComponent } from './pages/login-page/login-page.component';
import { SearchPageComponent } from './pages/search-page/search-page.component';
import { ViewProfilePageComponent } from './pages/view-profile-page/view-profile-page.component';
import { RegisterPageComponent } from './pages/register-page/register-page.component';
import { AuthLayoutComponent } from './common-ui/auth-layout/auth-layout.component';
import { SidebarLayoutComponent } from './common-ui/sidebar-layout/sidebar-layout.component';
import { canActivateAuth } from './common-ui/access.guard';
import { EditProfilePageComponent } from './pages/edit-profile-page/edit-profile-page.component';
import { ProfilePageComponent } from './pages/profile-page/profile-page.component';

export const routes: Routes = [
    { 
        path: '', 
        component: SidebarLayoutComponent, 
        children: [
            { path: '', component: SearchPageComponent },
            { 
                path: 'profile',
                children: [
                    { path: '', redirectTo: '/', pathMatch: 'full' },
                    { path: ':id', component: ProfilePageComponent },
                    { path: ':id/edit', component: EditProfilePageComponent }
                ]
                
            }
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
