import { HttpHandlerFn, HttpInterceptorFn, HttpRequest } from "@angular/common/http";
import { inject } from "@angular/core";
import { AuthService } from "./services/auth.service";
import { catchError, switchMap, throwError } from "rxjs";

let isRefreshing = false;

export const authTokenInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(AuthService);

    if (req.url.includes('/auth/')) return next(req);

    const token = authService.access_token;
    if (!token && authService.refresh_token) {
        return refreshAndProceed(authService, req, next);
    }

    if (!token) return next(req);

    if (isRefreshing) {
        return refreshAndProceed(authService, req, next);
    }

    return next(addToken(req, token)).pipe(
        catchError(error => {
            if (error.status === 403) {
                return refreshAndProceed(authService, req, next);
            }
            return throwError(() => error);
        })
    );
}

const refreshAndProceed = (
    authService: AuthService,
    req: HttpRequest<any>,
    next: HttpHandlerFn
) => {
    if (!isRefreshing) {
        isRefreshing = true;
        return authService.refresh().pipe(
            switchMap(res => {
                isRefreshing = false;
                return next(addToken(req, res.access_token));
            })
        );
    }

    return next(addToken(req, authService.access_token!));
}

const addToken = (req: HttpRequest<any>, token: string) => {
    return req.clone({
        setHeaders: {
            Authorization: `Bearer ${token}`
        }
    });
}