import { inject, Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { addHabitProgress, addHabitProgressSuccess, findByIdHabitAndRange, loadByIdHabit, loadByIdHabitRange, removeHabitProgress, removeHabitProgressSuccess, updateHabitProgress, updateHabitProgressSuccess } from "./habit.progress.action";
import { EMPTY, exhaustMap, forkJoin, map, mergeAll, mergeMap, tap, withLatestFrom } from "rxjs";
import { loadByUserId, loadByUserIdRange } from "../habit/habits.action";
import { HabitProgressService } from "../../services/habit-progress.service";
import Swal from "sweetalert2";
import { dayWihtoutTime, showModal } from "../../utils/helpers";
import { Store } from "@ngrx/store";
import { selectHabitProgressState, selectHabitsWithProgress } from "../../selectors/habit.selector";

@Injectable()
export class HabitProgressEffects {
    
    findHabitProgressByHabitId$ = createEffect(
        () => inject(Actions).pipe(
            ofType(loadByUserId),
            mergeMap( action => {
                if(!action.habits.length) return EMPTY;
                return forkJoin(
                    action.habits.map(habit => this.habitProgressService.findAllByIdHabit(habit.id))
                ).pipe(
                    map(habitsProgress => 
                        habitsProgress.map((progress, index) =>
                            loadByIdHabit({habitId: action.habits[index].id, habitProgress: progress})
                        )
                    ),
                    mergeAll()
                )
            })
        )
    );

    findByIdHabitAndRange$ = createEffect(
        () => inject(Actions).pipe(
            ofType(loadByUserIdRange, findByIdHabitAndRange),
            withLatestFrom(inject(Store).select(selectHabitProgressState)),
            mergeMap( ([action, habitProgrogresState]) => {
                if(!action.habits.length) return EMPTY;

                const requestedStartDate = dayWihtoutTime(new Date(action.startDate));
                const requestEndDate = dayWihtoutTime(new Date(action.endDate));

                const habitsToFetch = action.habits.filter(habit => {
                    const storedData = habitProgrogresState.progressByIdHabit[habit.id];
                    if(!storedData) return true;

                    const storedStartDate = dayWihtoutTime(new Date(storedData.startDate));
                    const storedEndDate = dayWihtoutTime(new Date(storedData.endDate));

                    return requestedStartDate < storedStartDate || requestEndDate > storedEndDate;
                })

                if(!habitsToFetch.length) return EMPTY;

                return forkJoin(
                    habitsToFetch.map(habit => 
                        this.habitProgressService.findByIdHabitAndDateRange(habit.id, action.startDate, action.endDate)
                    )
                ).pipe(
                    map(habitProgress => 
                        habitProgress.map((progress, index) =>
                            loadByIdHabitRange({
                                habitId: action.habits[index].id, 
                                habitProgress: progress, startDate: 
                                action.startDate, 
                                endDate: action.endDate})
                        )
                    ),
                    mergeAll()
                );
            })
        )
    )

    addHabitProgress$ = createEffect(
        () => inject(Actions).pipe(
            ofType(addHabitProgress),
            mergeMap(
                (action) => this.habitProgressService.create(action.habitProgressNew)
                .pipe(
                    map(habitProgressNew => (addHabitProgressSuccess({habitId: habitProgressNew.habitId ,habitProgressNew}))),
                )
            )
        )
    )

    addHabitProgressSucess$ = createEffect(
        () => inject(Actions).pipe(
            ofType(addHabitProgressSuccess),
            tap( () => {
                if(Swal.isVisible()){
                    Swal.close();
                    showModal('edit');
                }
            })
        ),
        {dispatch: false}
    )

    updateHabitProgress$ = createEffect(
        () => inject(Actions).pipe(
            ofType(updateHabitProgress),
            exhaustMap(
                action => this.habitProgressService.update(action.habitProgressUpdate)
                .pipe(
                    map(habitProgresUpdate => (updateHabitProgressSuccess({
                        habitId: habitProgresUpdate.habitId, 
                        habitProgressUpdate: habitProgresUpdate
                    })))
                )
            )
        )
    )

    updateHabitProgressSuccess$ = createEffect(
        () => inject(Actions).pipe(
            ofType(updateHabitProgressSuccess),
            tap( () => {
                Swal.close();
            })
        ),
        {dispatch: false}
    )

    removeHabitProgress$ = createEffect(
        () => inject(Actions).pipe(
            ofType(removeHabitProgress),
            mergeMap( ({habitId, habitProgressId}) => 
                this.habitProgressService.delete(habitProgressId).pipe(
                    map( () => removeHabitProgressSuccess({habitId, habitProgressId})),
                )
            )
        )
    )

    removeHabitProgressSucess$ = createEffect(
        () => inject(Actions).pipe(
            ofType(removeHabitProgressSuccess),
            tap( () => {
                if(Swal.isVisible()){
                    Swal.close();
                    showModal('delete');
                }
            })
        ),
        {dispatch: false}
    )
    
    constructor(
        private habitProgressService : HabitProgressService
    ) {}
}