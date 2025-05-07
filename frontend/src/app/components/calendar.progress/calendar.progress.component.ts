import { Component, Input, OnInit } from '@angular/core';
import { Habit, HabitProgress } from '../../models/habit';
import { Store } from '@ngrx/store';
import { weekDays, monthNames, isToday, getDone, dayWihtoutTime, hasNote, getMonthlyRanges, getTwoMonthlyRangesForToday } from '../../utils/helpers';
import { Observable, Subject, takeUntil } from 'rxjs';
import { selectHabitsWithProgress } from '../../selectors/habit.selector';
import { CommonModule } from '@angular/common';
import { DetailHabitProgressComponent } from '../detail.habit.progress/detail.habit.progress.component';
import { findByIdHabitAndRange, findHabitProgress } from '../../store/habitProgress/habit.progress.action';

@Component({
  selector: 'app-calendar-progress',
  standalone: true,
  imports: [
    CommonModule,
    DetailHabitProgressComponent
  ],
  templateUrl: './calendar.progress.component.html',
  styleUrl: './calendar.progress.component.css'
})
export class CalendarProgressComponent implements OnInit {
  
  habitProgress ! : HabitProgress[];
  destroy$ = new Subject<void>();

  currentDate: Date = new Date();
  daysInMonth: Date[] = [];
  weekDays : string[] = weekDays;
  monthNames : string [] = monthNames;
  
  @Input() edit : boolean  = false;
  
  habit ! : Habit ; 
  habits ! : Habit[];
  habits$ ! : Observable<Habit[]>;
  
  constructor(
    private store : Store<{habits: any}>
  ) {
    
    this.store.select('habits').subscribe(state => {
      this.habit = state.habit;
      this.habits = state.habits;
    });

    this.habits$ = this.store.select(selectHabitsWithProgress);
  }

  ngOnInit() {
    this.generateCalendar();
    this.habits$.pipe(takeUntil(this.destroy$)).subscribe(habits => {
      this.habitProgress = habits.flatMap(habit => habit.id == this.habit.id ? habit.habitProgress : []);
    });

    const ranges = getTwoMonthlyRangesForToday();

    this.store.dispatch(findByIdHabitAndRange({
      habits: [this.habit],
      startDate: ranges.start,
      endDate: ranges.end
    }));
  }

  generateCalendar() {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();

    // Ajustar el inicio de la semana (lunes a domingo)
    const offset = (firstDayOfMonth + 6) % 7;

    this.daysInMonth = Array(offset).fill(null).concat(
      Array.from({ length: totalDays }, (_, i) => new Date(year, month, i + 1))
    );
  }

  prevMonth() {
    this.currentDate.setMonth(this.currentDate.getMonth() - 1);
    this.generateCalendar();
    this.findPrevMonth(this.currentDate);
  }

  findPrevMonth(day : Date) {
    const lastDayMonth = new Date(day.getFullYear(), day.getMonth() - 1, day.getDate());
    const monthRanges = getMonthlyRanges(lastDayMonth);

    this.store.dispatch(findByIdHabitAndRange({
      habits: this.habits,
      startDate: monthRanges.start,
      endDate: monthRanges.end
    }));
  }

  nextMonth() {
    this.currentDate.setMonth(this.currentDate.getMonth() + 1);
    this.generateCalendar();
    this.findNextMonth(this.currentDate);
  }

  findNextMonth(day : Date) {
    const nextDayMonth = new Date(day.getFullYear(), day.getMonth() + 1, day.getDate());
    const monthRanges = getMonthlyRanges(nextDayMonth);

    this.store.dispatch(findByIdHabitAndRange({
      habits: this.habits,
      startDate: monthRanges.start,
      endDate: monthRanges.end
    }));
  }

  isToday(day : Date) : boolean {
    return isToday(day);
  }

  getDone(day : Date, habitProgress : HabitProgress[]) : number {
    if(day != null){
      return getDone(dayWihtoutTime(day), habitProgress);
    }
    return 0;
  }

  hasNote(day : Date, habitProgress : HabitProgress[]) : boolean {
    if(day != null){
      return hasNote(day, habitProgress);
    }
    return false;
  }

  loadHabitProgress(habit: Habit, day : Date) {
    if(day != null){
      this.store.dispatch(findHabitProgress({habit, day}));
    }
  }

}
