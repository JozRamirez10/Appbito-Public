import { Actions, createEffect, ofType } from "@ngrx/effects";
import { inject, Injectable } from "@angular/core";
import { add, addSuccess, edit, editBatch, editBatchSuccess, editSucess, findByUserId, findByUserIdRange, loadByUserId, loadByUserIdRange, remove, removeSucess, setErrors } from "./habits.action";
import { catchError, EMPTY, exhaustMap, map, mergeMap, of, tap } from "rxjs";
import { HabitService } from "../../services/habit.service";
import { Router } from "@angular/router";
import { showModal } from "../../utils/helpers";
import { Store } from "@ngrx/store";
import { loadingState } from "../loading/loading.action";
import Swal from "sweetalert2";

@Injectable()
export class HabitsEffects {
    
    findHabitsByUserId$ = createEffect(
        () => inject(Actions).pipe(
            ofType(findByUserId),
            exhaustMap( 
                (action) => this.habitService.findByUserId(action.id).pipe(
                    map(habits => (loadByUserId({habits}))),
                    catchError( () => EMPTY )
                )
            )
        )
    );
    
    loadHabitsByUserId$ = createEffect(
        () => inject(Actions).pipe(
            ofType(loadByUserId),
            tap( () => {
                this.store.dispatch(loadingState({loading: false}));
            })
        ),
        {dispatch : false}
    );

    findHabitsByUserIdRange$ = createEffect(
        () => inject(Actions).pipe(
            ofType(findByUserIdRange),
            exhaustMap( 
                (action) => this.habitService.findByUserId(action.id).pipe(
                    map(habits => (loadByUserIdRange({
                        habits,
                        startDate: action.startDate,
                        endDate: action.endDate
                    }))),
                    catchError( () => EMPTY )
                )
            )
        )
    );

    loadHabitsByUserIdRange$ = createEffect(
        () => inject(Actions).pipe(
            ofType(loadByUserIdRange),
            tap( () => {
                this.store.dispatch(loadingState({loading: false}));
            })
        ),
        {dispatch : false}
    );

    addHabit$ = createEffect(
      () => inject(Actions).pipe(
        ofType(add),
        exhaustMap(
            (action) => this.habitService.create(action.habitNew)
            .pipe(
                map((habitNew) => addSuccess({habitNew})),
                catchError(error => (error.status == 400) ? of(setErrors({habitForm: action.habitNew, errors: error.error})) : of(error))
            )
        )
      )  
    );

    addSuccessHabit$ = createEffect(
        () => inject(Actions).pipe(
            ofType(addSuccess),
            tap( () => {
                this.router.navigate(['/listHabits']);
                Swal.close();
                showModal('create');
            })
        ),
        {dispatch : false}
    );

    updateHabit$ = createEffect(
        () => inject(Actions).pipe(
            ofType(edit),
            exhaustMap(
                action => this.habitService.update(action.habitUpdate)
                .pipe(
                    map((habitUpdate) => editSucess({habitUpdate})),
                    catchError(error => (error.status == 400) ? of(setErrors({habitForm: action.habitUpdate, errors: error.error})) : of(error))
                )
            )
        )
    );

    updateSuccessHabit$ = createEffect(
        () => inject(Actions).pipe(
            ofType(editSucess),
            tap( () => {
                this.router.navigate(['/listHabits']);
                Swal.close();
                showModal('edit');
            })
        ),
        {dispatch: false}
    );

    updateHabitsBatch$ = createEffect(
        () => inject(Actions).pipe(
            ofType(editBatch),
            mergeMap(
                ({habitsUpdate}) => this.habitService.updateBatch(habitsUpdate)
                .pipe(
                    map( (habitsUpdate) => editBatchSuccess({habitsUpdate})),
                )
            )
        )
    );

    removeHabit$ = createEffect(
        () => inject(Actions).pipe(
            ofType(remove),
            exhaustMap(
                action => this.habitService.delete(action.id)
                .pipe(
                    map((id) => removeSucess({id}))
                )
            )
        )
    );

    removeSucessHabit$ = createEffect(
        () => inject(Actions).pipe(
            ofType(removeSucess),
            tap( () => {
                Swal.close();
                showModal('delete');
            })
        ),
        {dispatch: false}
    );

    setErrors$ = createEffect(
        () => inject(Actions).pipe(
            ofType(setErrors),
            tap( () => {
                this.store.dispatch(loadingState({loading: false}));
                Swal.close();
            })
        ),
        {dispatch : false}
    );

    constructor(
        private habitService : HabitService,
        private router : Router,
        private store : Store
    ) { }
}