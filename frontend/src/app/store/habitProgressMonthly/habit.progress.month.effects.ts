import { inject, Injectable } from "@angular/core";
import { HabitProgressService } from "../../services/habit-progress.service";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { addHabitProgressByMonth, loadHabitProgressByMonth, loadHabitProgressByMonthSuccess, removeHabitProgressByMonth, updateHabitProgressByMonth } from "./habit.progress.month.action";
import { EMPTY, map, mergeMap, withLatestFrom } from "rxjs";
import { addHabitProgressSuccess, removeHabitProgressSuccess, updateHabitProgressSuccess } from "../habitProgress/habit.progress.action";
import { select, Store } from "@ngrx/store";
import { selectHabitProgressByMonth } from "../../selectors/habit.selector";

@Injectable()
export class HabitProgressMonthlyEffects {
    
    loadHabitProgressByMonth$ = createEffect(
        () => inject(Actions).pipe(
            ofType(loadHabitProgressByMonth),
            withLatestFrom(inject(Store).select(selectHabitProgressByMonth)),
            mergeMap(([{years, habitIds}, progressByMonth]) => {
                const yearsToFetch = years.filter(year => !progressByMonth?.[year]);
                if(!yearsToFetch.length) return EMPTY;
                return this.habitProgressService.getTotalDoneByYears(yearsToFetch, habitIds)
                .pipe(
                    map(progress => loadHabitProgressByMonthSuccess({progress})),
                    // error
                )
            })
        )
    )

    addHabitProgressByMonth$ = createEffect(
        () => inject(Actions).pipe(
            ofType(addHabitProgressSuccess),
            map(action => {
                const date = new Date(action.habitProgressNew.date);
                const year = date.getFullYear();
                const month = date.getMonth() + 1;

                return addHabitProgressByMonth({
                    year,
                    month,
                    habitId: action.habitId,
                    timesPerformed: action.habitProgressNew.timesPerformed
                });
            })
        )
    )

    updateHabitProgressByMonth$ = createEffect(
        () => inject(Actions).pipe(
            ofType(updateHabitProgressSuccess),
            map(action => {
                const date = new Date(action.habitProgressUpdate.date);
                const year = date.getFullYear();
                const month = date.getMonth() + 1;

                return updateHabitProgressByMonth({
                    year,
                    month,
                    habitId: action.habitId,
                    timesPerformed: action.habitProgressUpdate.timesPerformed
                });
            })
        )
    )

    removeHabitProgressByMonth$ = createEffect(
        () => inject(Actions).pipe(
            ofType(removeHabitProgressSuccess),
            withLatestFrom(inject(Store).pipe(select(state => state.habitProgress.lastRemovedProgress))),
            map(([action, lastRemovedProgress]) => {
                if(lastRemovedProgress){
                    const date = new Date(lastRemovedProgress.date);
                    const year = date.getFullYear();
                    const month = date.getMonth() + 1;
                    return removeHabitProgressByMonth({
                        year,
                        month,
                        habitId: action.habitId,
                        timesPerformed: lastRemovedProgress.timesPerformed
                    });
                }
                return { type: 'NO_ACTION'}
            })
        )
    )

    constructor(
        private habitProgressService : HabitProgressService,
    ) {}
}