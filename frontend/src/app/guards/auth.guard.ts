import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { AuthService } from "../services/auth.service";

export const authGuard : CanActivateFn = (route, state) => {
    const service = inject(AuthService);
    const router = inject(Router);

    const token = service.getToken();

    if(token){
        return (route.routeConfig?.path === 'login' || route.routeConfig?.path === 'signIn')
            ? router.navigate(['/dailyHabits'])
            : true;
    }else{
        return (route.routeConfig?.path !== 'login' && route.routeConfig?.path !== 'signIn')
            ? router.navigate(['/login'])
            : true;
    }
};