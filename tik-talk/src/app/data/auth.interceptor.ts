import { HttpHandlerFn, HttpInterceptorFn, HttpRequest } from "@angular/common/http";
import { inject } from "@angular/core";
import { AuthService } from "./services/auth.service";
import { BehaviorSubject, Subject, catchError, filter, switchMap, take, tap, throwError } from "rxjs";

let isRefreshing$ = new BehaviorSubject<boolean>(false);

export const authTokenInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(AuthService);

    if (req.url.includes('/auth/')) return next(req);

    const token = authService.access_token;
    if (!token && authService.refresh_token) {
        return refreshAndProceed(authService, req, next);
    }

    if (!token) return next(req);

    if (isRefreshing$.value) {
        return refreshAndProceed(authService, req, next);
    }

    return next(addToken(req, token)).pipe(
        catchError(error => {
            if (error.status === 401) {
                return refreshAndProceed(authService, req, next);
            }
            return throwError(() => error);
        })
    );
}

const refreshAndProceed= (
    authService: AuthService,
    req: HttpRequest<any>,
    next: HttpHandlerFn
) => {
    if (!isRefreshing$.value) {
        isRefreshing$.next(true);
        return authService.refresh().pipe(
            switchMap(res => {
                
                return next(addToken(req, res.access_token))
                .pipe(
                    tap(() => isRefreshing$.next(false))
                );
            }),
            catchError(error => {
                isRefreshing$.next(false);
                return throwError(() => error);
            })
        );
    }

    if (req.url.includes('refresh')) {
        return next(addToken(req, authService.access_token));
    }

    return isRefreshing$.pipe(
        filter(isRefreshing => !isRefreshing),
        switchMap(() => {
            return next(addToken(req, authService.access_token))
        })
    )
}

const addToken = (req: HttpRequest<any>, token: string | null) => {
    return req.clone({
        setHeaders: {
            Authorization: `Bearer ${token}`
        }
    });
}