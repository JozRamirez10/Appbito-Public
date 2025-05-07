import { RouterLink } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Habit, HabitProgress, HabitStreak } from '../../models/habit';
import { findByUserIdRange } from '../../store/habit/habits.action';
import { CommonModule, DatePipe } from '@angular/common';
import { compareDay, dayWihtoutTime, getDayOfWeek, getWeeklyRanges } from '../../utils/helpers';
import { CalendarWeekProgressComponent } from "../calendar.week.progress/calendar.week.progress.component";
import { ChartMonthProgressComponent } from "../chart.month.progress/chart.month.progress.component";
import { User } from '../../models/user';
import { AuthService } from '../../services/auth.service';
import { filter, Observable, Subject, take, takeUntil } from 'rxjs';
import { findById } from '../../store/user/user.action';
import { loadingState } from '../../store/loading/loading.action';
import { selectHabitsWithProgress } from '../../selectors/habit.selector';
import { addHabitProgress, findByIdHabitAndRange, findHabitProgress, removeHabitProgress, updateHabitProgress } from '../../store/habitProgress/habit.progress.action';
import { DetailHabitProgressComponent } from "../detail.habit.progress/detail.habit.progress.component";
import { HabitProgressService } from '../../services/habit-progress.service';

@Component({
  selector: 'app-daily.habits',
  imports: [
    RouterLink,
    DatePipe,
    CommonModule,
    CalendarWeekProgressComponent,
    ChartMonthProgressComponent,
    DetailHabitProgressComponent
],
  templateUrl: './daily.habits.component.html',
  styleUrl: './daily.habits.component.css'
})
export class DailyHabitsComponent implements OnInit{

  private destroy$ = new Subject<void>();

  user ! : User;
  id ! : number;
  
  today : Date = dayWihtoutTime(new Date());
  loading ! : boolean;

  saveHabits : Habit[] = [];

  habits$ ! : Observable<Habit[]>;
  habits ! : Habit[];

  dailyHabits ! : Habit[];
  dailyHabit ! : Habit;

  habitStreaks ! : HabitStreak[];

  constructor(
    private store : Store<{habits : any, users : any, auth : any, loading : any, habitProgress : any }>,
    private authService : AuthService,
    private habitProgressService : HabitProgressService
  ) {
    this.habits$ = this.store.select(selectHabitsWithProgress);
  }

  ngOnInit(): void {
    this.habits$.pipe(takeUntil(this.destroy$)).subscribe(habits => {
      this.habits = habits;
      this.loadDailyHabits();
      this.rechargeStreaks();
    });

    this.store.select('auth')
      .pipe(takeUntil(this.destroy$))
      .subscribe(state => {
        this.id = {... state.id}
    })

    this.store.select('users')
      .pipe(takeUntil(this.destroy$))
      .subscribe(state => {
        this.user = state.user;
    });

    this.store.select('loading').subscribe(loading => {
      this.loading = loading
    });

    this.chargeHabits();
  }

  loadDailyHabits(){
    const today = getDayOfWeek();
    this.dailyHabits = this.habits.filter(habit => habit.days.some(day => day === today));
  }

  loadHabitProgress(habit: Habit, day : Date) {
    this.store.dispatch(findHabitProgress({habit, day}));
  }

  chargeHabits() {

    const weekRanges = this.getWeeklyRanges();

    if (!this.user.id) {
      this.store.dispatch(loadingState({loading: true}));
      this.store.dispatch(findById({ id: Number(this.authService.getPayload().sub) }));
    
      this.store.select(state => state.users.user?.id) 
        .pipe(
          filter(id => !!id), 
          take(1) 
        )
        .subscribe(id => {
          this.store.dispatch(findByUserIdRange({ id: id, startDate: weekRanges.start, endDate: weekRanges.end }));
        });
    }else if(this.habits.length === 0){
      this.store.dispatch(loadingState({loading: true}));
      this.store.dispatch(findByUserIdRange({id: this.user.id, startDate: weekRanges.start, endDate: weekRanges.end }));  
    }else{
      this.store.dispatch(findByIdHabitAndRange({
        habits: this.habits,
        startDate: weekRanges.start,
        endDate: weekRanges.end
      }))
    }
  }

  onDailyHabitDone(event : Event, habit : Habit) : void {
    const dailyHabitCheck = event.target as HTMLInputElement;
    this.dailyHabit = habit;
    
    if(dailyHabitCheck.checked){
      this.createHabitProgress();

    }else{

      const habitProgress = this.dailyHabit.habitProgress.find(progress => 
        compareDay(progress.date, dayWihtoutTime(new Date())));

      if(habitProgress != undefined ){
        if(habitProgress.note == null || habitProgress.note.length == 0){
          this.deleteHabitProgress(habitProgress);
        } else {
          this.store.dispatch(updateHabitProgress({habitProgressUpdate: {... habitProgress, timesPerformed: 0} }));
          !dailyHabitCheck.checked;
        }
      } 
    }
  }

  createHabitProgress(){
    let habitProgress = new HabitProgress();
    habitProgress.id = Math.random();
    habitProgress.date = dayWihtoutTime( new Date() );
    habitProgress.timesPerformed = 1;
    habitProgress.habitId = this.dailyHabit.id;

    this.store.dispatch(addHabitProgress({
      habitProgressNew: habitProgress
    }));
  }

  deleteHabitProgress(habitProgress : HabitProgress){
    this.store.dispatch(removeHabitProgress({
      habitId: this.dailyHabit.id,
      habitProgressId: habitProgress.id
    }));
  }

  isChecked(habit: Habit) : boolean{
    return habit.habitProgress.some(progress => {
      return compareDay(progress.date, this.today) && progress.timesPerformed > 0;
    });
  }

  hasNote(habit : Habit) : boolean{
    return habit.habitProgress.some(progress =>{
      return compareDay(progress.date, this.today) && progress.note && progress.note?.length > 0
    })
  }

  getWeeklyRanges(){
    const lastDayWeek = dayWihtoutTime(new Date());
    lastDayWeek.setDate(lastDayWeek.getDate() - 7);

    const nextDayWeek = dayWihtoutTime(new Date());
    nextDayWeek.setDate(nextDayWeek.getDate() + 7);

    const lastWeek = getWeeklyRanges(lastDayWeek);
    const nextWeek = getWeeklyRanges(nextDayWeek);

    return {
      start: lastWeek.start,
      end: nextWeek.end
    }
  }

  async rechargeStreaks(){
    this.habitStreaks = await Promise.all(
      this.dailyHabits.map(async dailyHabit => ({
          habit: dailyHabit,
          streak: await this.habitProgressService.getStreakByIdHabit(dailyHabit.id)
      }))
    );
  }

  ngOnDestroy() : void {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
