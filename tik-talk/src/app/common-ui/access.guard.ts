import { inject } from "@angular/core"
import { AuthService } from "../data/services/auth.service"
import { Router } from "@angular/router";

export const canActivateAuth = () => {
    const authService = inject(AuthService);
    if (authService.access_token || authService.refresh_token) {
        return true;
    }

    return inject(Router).navigate(["/auth/login"]);
}