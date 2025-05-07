import { HttpInterceptorFn, HttpRequest } from "@angular/common/http";
import { AuthService } from "../services/auth.service";
import { inject } from "@angular/core";
import { catchError, from, mergeMap, tap, throwError } from "rxjs";
import { showModal } from "../utils/helpers";
import { Store } from "@ngrx/store";
import { logoutError } from "../store/auth/auth.action";

export const tokenInterceptor : HttpInterceptorFn = (req, next) => {
    const authService = inject(AuthService);
    const store = inject(Store)
    const token = authService.getToken() || sessionStorage.getItem("token");
    const isRefreshRequest = req.url.includes("/auth/refresh");

    if(!token){
        return next(req);
    }

    if (isRefreshRequest) {
        return next(req).pipe(
            catchError(error => {
                store.dispatch(logoutError());
                modalError(error.error.error);
                return throwError(() => error);
            })
        );
    }

    req = req.clone({
        url : req.url,
        setHeaders: {
            Authorization: `Bearer ${token}`
        }
    });


    return next(req).pipe(
        catchError(error => {
            if(error.status !== 401) 
                return throwError( () => error);
            
            if(error.status === 500){
                return throwError( () => error.log(error))
            }

            return from(authService.refreshToken()).pipe(
                mergeMap(newToken => {
                    if(!newToken) {
                        store.dispatch(logoutError());
                        modalError(error.error.error);
                        return throwError( () => error);
                    }

                    authService.setToken(newToken);
                    return next(reqClone(req, newToken));

                }),
                catchError( (error) => {
                    store.dispatch(logoutError());
                    modalError(error.error.error);
                    return throwError( () => error);
                })
            )
        })
    )
}

export function reqClone(req : HttpRequest<any>, token : string) : HttpRequest<any> {
    return req.clone({
        setHeaders: {Authorization: `Bearer ${token}`}
    });
}

export function modalError(message : string){
    if(message.includes("JWT expired")){
        showModal('expired');
    }else{
        showModal('errorSession');
    }
}