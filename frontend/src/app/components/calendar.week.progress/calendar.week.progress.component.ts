import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Habit, HabitProgress } from '../../models/habit';
import { compareDay, dayWihtoutTime, getDone, getWeeklyRanges, hasNote, isToday, monthNames, weekDays } from '../../utils/helpers';
import { CommonModule } from '@angular/common';
import { Observable, Subject, takeUntil } from 'rxjs';
import { selectHabitsWithProgress } from '../../selectors/habit.selector';
import { findByIdHabitAndRange, findHabitProgress } from '../../store/habitProgress/habit.progress.action';

@Component({
  selector: 'app-calendar-week-progress',
  imports: [
    CommonModule,
  ],
  templateUrl: './calendar.week.progress.component.html',
  styleUrl: './calendar.week.progress.component.css'
})
export class CalendarWeekProgressComponent implements OnInit {
  
  private destroy$ = new Subject<void>();

  habits$ ! : Observable<Habit[]>;
  habits ! : Habit[];
  
  weekDays ! : string[];
  monthNames  : string[] = monthNames;
  
  currentDay : Date = new Date;
  
  daysInWeek : Date[] = [];

  timesPerformed : number = 0;
  
  constructor(
    private store : Store<{habits : any}>
  ) {
    this.habits$ = this.store.select(selectHabitsWithProgress);
  }

  ngOnInit(): void {
    
    this.habits$.pipe(takeUntil(this.destroy$)).subscribe(habits => {
      this.habits = habits;
    })
    this.generateWeek();

  }

  generateWeek(){
    this.weekDays = weekDays;
    const currentDayIndex = this.currentDay.getDay();
    
    const startOfWeek = new Date(this.currentDay);
    startOfWeek.setDate(this.currentDay.getDate() - ((currentDayIndex + 6) % 7));

    this.daysInWeek = Array.from({length: 7}, (_, i) => {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      return day;
    });

    this.weekDays = this.weekDays.map((day, index) => {
      return day + ' - ' + this.daysInWeek[index].getDate();
    });

    this.weekDays.unshift('');
  }

  prevWeek(){
    this.currentDay.setDate(this.currentDay.getDate() - 7);
    this.generateWeek();
    this.findPrevWeek(this.currentDay);
  }

  findPrevWeek(day : Date){
    const lastDayWeek = new Date(day);
    lastDayWeek.setDate(lastDayWeek.getDate() - 7);

    const weekRanges = getWeeklyRanges(lastDayWeek);
    this.store.dispatch(findByIdHabitAndRange({
      habits: this.habits,
      startDate: weekRanges.start,
      endDate: weekRanges.end
    }));
  }

  nextWeek(){
    this.currentDay.setDate(this.currentDay.getDate() + 7)
    this.generateWeek();
    this.findNextWeek(this.currentDay);
  }

  findNextWeek(day : Date){
    const nextDayWeek = new Date(day);
    nextDayWeek.setDate(nextDayWeek.getDate() + 7);

    const weekRanges = getWeeklyRanges(nextDayWeek);
    this.store.dispatch(findByIdHabitAndRange({
      habits: this.habits,
      startDate: weekRanges.start,
      endDate: weekRanges.end
    }));
  }

  isToday(day : Date) : boolean {
    return isToday(day);
  }

  getDone(day : Date, habitProgress : HabitProgress[]) : number {
    return getDone(day, habitProgress);
  }

  hasNote(day : Date, habitProgress : HabitProgress[]) : boolean {
    return hasNote(day, habitProgress);
  }

  loadHabitProgress(habit: Habit, day : Date) {
    this.store.dispatch(findHabitProgress({habit, day: dayWihtoutTime(day)}));
  }

}
