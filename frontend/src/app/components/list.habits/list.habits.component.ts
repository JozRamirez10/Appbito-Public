import { Component, OnInit } from '@angular/core';
import { Habit } from '../../models/habit';
import { DetailHabitComponent } from '../detail.habit/detail.habit.component';
import { Store } from '@ngrx/store';
import { RouterLink } from '@angular/router';
import { findByUserIdRange } from '../../store/habit/habits.action';
import { AuthService } from '../../services/auth.service';
import { loadingState } from '../../store/loading/loading.action';
import { getTwoMonthlyRangesForToday } from '../../utils/helpers';
import { Observable, Subject, takeUntil } from 'rxjs';
import { selectHabitsWithProgress } from '../../selectors/habit.selector';
import { findByIdHabitAndRange } from '../../store/habitProgress/habit.progress.action';

@Component({
    selector: 'app-list-habits',
    standalone: true,
    imports: [
      RouterLink,
      DetailHabitComponent
    ],
    templateUrl: './list.habits.component.html',
    styleUrl: './list.habits.component.css'
})
export class ListHabitsComponent implements OnInit{

  private destroy$ = new Subject<void>();

  habits$ ! : Observable<Habit[]>;
  habits ! : Habit[];

  loading ! : boolean;
  
  constructor(
    private store : Store<{habits: any, loading : any}>,
    private auth : AuthService
  ) {
    
    this.habits$ = this.store.select(selectHabitsWithProgress);

    this.store.select('loading').subscribe(loading => {
      this.loading = loading
    });
  }

  ngOnInit() : void {

    this.habits$.pipe(takeUntil(this.destroy$)).subscribe(habits => {
      this.habits = habits;
    });
    
    const ranges = getTwoMonthlyRangesForToday();

    if(this.habits.length <= 0){
      this.store.dispatch(loadingState({loading: true}));
      this.store.dispatch(findByUserIdRange({
        id : Number(this.auth.getPayload().sub), 
        startDate: ranges.start, 
        endDate: ranges.end 
      }));
    }else{
      this.store.dispatch(findByIdHabitAndRange({
        habits: this.habits, 
        startDate: ranges.start, 
        endDate: ranges.end
      }))
    }
  }

}
