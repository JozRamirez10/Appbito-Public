import { inject, Injectable } from "@angular/core";
import { AuthService } from "../../services/auth.service";
import { Router } from "@angular/router";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { catchError, exhaustMap, finalize, map, of, tap } from "rxjs";
import { login, loginError, loginSuccess, logout, logoutError, logoutSuccess, removeAccount, removeSuccessAccount } from "./auth.action";
import Swal from "sweetalert2";
import { showModal } from "../../utils/helpers";
import { Store } from "@ngrx/store";
import { cleanUser, findById } from "../user/user.action";
import { loadingState } from "../loading/loading.action";

@Injectable()
export class AuthEffects {

    login$ = createEffect(
        () => inject(Actions).pipe(
            ofType(login),
            exhaustMap(
                (action) => this.service.loginUser(action).pipe(
                    map( () => loginSuccess({
                        login:{
                            id: Number(this.service.getPayload().sub),
                            token: this.service.getToken()
                        }
                    })),
                    catchError( (error) => of(loginError({error: error.error.message}))),
                    finalize( () => of(null))
                )
            )
        )
    );

    loginSuccess$ = createEffect(
        () => inject(Actions).pipe(
            ofType(loginSuccess),
            tap( () => {
                this.store.dispatch(loadingState({loading: false}));
                Swal.close();
                this.router.navigate(['/dailyHabits']);
            })
        ),  
        {dispatch: false}
    )

    loginError$ = createEffect(
        () => inject(Actions).pipe(
            ofType(loginError),
            tap( (action) =>{
                Swal.close();
                Swal.fire("Error in the login", action.error, 'error');
            })
        ),
        {dispatch: false}
    )

    logout$ = createEffect(
        () => inject(Actions).pipe(
            ofType(logout),
            exhaustMap(
                () => this.service.logout()
            )
        ).pipe(
            map( () => logoutSuccess())
            //catchError( )
        )
    )

    logoutSuccess$ = createEffect(
        () => inject(Actions).pipe(
            ofType(logoutSuccess),
            tap( () => {
                this.service.removeSession();
                this.store.dispatch(cleanUser());
                this.router.navigate(['/login']);

                const logoutChannel = new BroadcastChannel('logout_channel');
                logoutChannel.postMessage('logout');
                logoutChannel.close();

                showModal('exit');
            })
        ),
        {dispatch : false}
    )

    logoutError$ = createEffect(
        () => inject(Actions).pipe(
            ofType(logoutError),
            tap( () => {
                this.service.removeSession();
                this.store.dispatch(cleanUser());
                this.router.navigate(['/login']);

                const logoutChannel = new BroadcastChannel('logout_channel');
                logoutChannel.postMessage('logout');
                logoutChannel.close();

            })
        ),
        {dispatch : false}
    )

    remove$ = createEffect(
        () => inject(Actions).pipe(
            ofType(removeAccount),
            exhaustMap(
                () => this.service.logout()
            )
        ).pipe(
            map( () => removeSuccessAccount())
            //catchError( )
        )
    )

    removeSuccess$ = createEffect(
        () => inject(Actions).pipe(
            ofType(removeSuccessAccount),
            tap( () => {
                this.service.removeSession();
                this.store.dispatch(cleanUser());
                this.router.navigate(['/login']);

                const logoutChannel = new BroadcastChannel('logout_channel');
                logoutChannel.postMessage('remove');
                logoutChannel.close();

            })
        ),
        {dispatch : false}
    )

    constructor(
        private service : AuthService,
        private router : Router,
        private store : Store<{users : any}>
    ) { }
}