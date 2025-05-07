import { inject, Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { UserService } from "../../services/user.service";
import { Router } from "@angular/router";
import { add, addSuccess, edit, editImage, editImageSuccess, editPassword, editPasswordSuccess, editSuccess, findById, findByIdSuccess, findImage, findImageSuccess, remove, removeSuccess, setErrorImage, setErrors, setErrorsAny, setErrorsRemove } from "./user.action";
import { catchError, exhaustMap, finalize, from, map, mergeMap, of, tap } from "rxjs";
import { showModal } from "../../utils/helpers";
import { Store } from "@ngrx/store";
import { logout, removeAccount } from "../auth/auth.action";
import Swal from "sweetalert2";
import { loadingState } from "../loading/loading.action";

@Injectable()
export class UserEffects {

    findUser$ = createEffect(
        () => inject(Actions).pipe(
            ofType(findById),
            exhaustMap(
                (action) => this.userService.findById(action.id).pipe(
                    mergeMap( (user) => [
                        findByIdSuccess({user}),
                        findImage({pathImage: user.image})
                    ])   
                )
            )
        )
    )

    findUserByIdSuccess$ = createEffect(
        () => inject(Actions).pipe(
            ofType(findByIdSuccess),
            tap( () => {
                this.store.dispatch(loadingState({loading: false}));
            })
        ),
        {dispatch: false}
    )

    findImageUser$ = createEffect(
        () => inject(Actions).pipe(
            ofType(findImage),
            exhaustMap(
                (action) => this.userService.findImage(action.pathImage)
                .pipe(
                    map((imageBlob) => {
                        const imageUrl = URL.createObjectURL(imageBlob);
                        return findImageSuccess({ image: imageUrl });
                    })
                )
            )
        )
    )

    addUser$ = createEffect(
        () => inject(Actions).pipe(
            ofType(add),
            exhaustMap(
                (action) => this.userService.create(action.user)
                .pipe(
                    map((user) => addSuccess({user})),
                    catchError(error => (error.status == 400) ? of(setErrors({userForm: action.user, errors: error.error})) : of(error))
                )
            )
        )
    )

    addSuccessUser$ = createEffect(
        () => inject(Actions).pipe(
            ofType(addSuccess),
            tap( () => {
                this.router.navigate(['/login']);
                this.store.dispatch(loadingState({loading: false}));
                showModal('userCreated');
            })
        ),
        {dispatch: false}
    )

    editUser$ = createEffect(
        () => inject(Actions).pipe(
            ofType(edit),
            exhaustMap(
                (action) => this.userService.edit(action.userUpdate)
                .pipe(
                    map((userUpdate) => editSuccess({userUpdate})),
                    catchError(error => (error.status == 400) ? of(setErrors({userForm: action.userUpdate, errors: error.error})) : of(error))
                )
            )
        )
    )

    editSuccessUser$ = createEffect(
        () => inject(Actions).pipe(
            ofType(editSuccess),
            tap( async () => {
                Swal.close();
                await showModal('edit');
                window.location.reload();

            })
        ),
        {dispatch: false}
    )

    editImageUser$ = createEffect(
        () => inject(Actions).pipe(
            ofType(editImage),
            exhaustMap(
                (action) => this.userService.uploadProfileImage(action.formImage)
                .pipe(
                    map((response) => editImageSuccess({image: response.image})),
                    catchError(error => of(setErrorImage))
                )
            )
        )
    )

    editImageSuccessUser$ = createEffect(
        () => inject(Actions).pipe(
            ofType(editImageSuccess),
            tap( async (response) => {
                await showModal('edit');
                window.location.reload();
            })
        ),
        {dispatch: false}
    )

    editPassword$ = createEffect(
        () => inject(Actions).pipe(
            ofType(editPassword),
            exhaustMap(
                (action) => this.userService.editPassword(action.request, action.id)
                .pipe(
                    map((userUpdate) => editPasswordSuccess({userUpdate})),
                    catchError(error => (error.status == 400) ? of(setErrorsAny({errors: error.error})): of(error)),
                    finalize( () => of(null) )
                )
            )
        )
    )

    editPasswordSuccess$ = createEffect(
        () => inject(Actions).pipe(
            ofType(editPasswordSuccess),
            exhaustMap( () => 
                from(showModal('editPassword')).pipe(
                    tap( () => this.store.dispatch(logout()))
                )
            )
        ),
        {dispatch: false}
    )

    removeUser$ = createEffect(
        () => inject(Actions).pipe(
            ofType(remove),
            exhaustMap(
                (action) => this.userService.remove(action.request, action.id)
                .pipe(
                    map(() => removeSuccess()),
                    catchError(error => (error.status == 400) ? of(setErrorsRemove({errors: error.error})) : of(error))
                )
            )
        )
    )

    removeUserSuccess$ = createEffect(
        () => inject(Actions).pipe(
            ofType(removeSuccess),
            tap( () => {
                Swal.close();
                showModal('userRemoved');
                this.store.dispatch(removeAccount());
            })
        ),
        {dispatch: false}
    )

    setErrors$ = createEffect(
        () => inject(Actions).pipe(
            ofType(setErrors),
            tap( () => {
                Swal.close();
                this.store.dispatch(loadingState({loading : false}));
            })
        ),
        {dispatch: false}
    )

    setErrorImage$ = createEffect(
        () => inject(Actions).pipe(
            ofType(setErrorImage),
            tap( () => {
                Swal.close();
                showModal('errorImage');
            })
        ),
        {dispatch: false}
    )

    setErrorsRemove$ = createEffect(
        () => inject(Actions).pipe(
            ofType(setErrorsRemove),
            tap( (action) => {
                Swal.close();
                Swal.fire({
                    title: "An error ocurred",
                    text: action.errors.error,
                    icon: "error"
                })
            })
        ),
        {dispatch: false}
    )

    setErrorsAny$ = createEffect(
        () => inject(Actions).pipe(
            ofType(setErrorsAny),
            tap( () => {
                Swal.close();
            })
        ),
        {dispatch : false}
    )

    constructor(
        private userService : UserService,
        private store : Store<{auth: any}>,
        private router : Router
    ) { }
}