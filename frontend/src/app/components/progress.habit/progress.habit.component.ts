import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalendarProgressComponent } from '../calendar.progress/calendar.progress.component';
import { HabitProgress } from '../../models/habit';
import { HabitProgressService } from '../../services/habit-progress.service';

@Component({
    selector: 'app-progress-habit',
    standalone: true,
    imports: [
        CommonModule,
        CalendarProgressComponent
    ],
    templateUrl: './progress.habit.component.html',
    styleUrl: './progress.habit.component.css'
})
export class ProgressHabitComponent implements OnInit{

  @Input() edit : boolean = false;
  @Input() habitId ! : number;
  @Input() habitProgress ! : HabitProgress[];

  public counterStreak ! : number;

  constructor(
    private habitProgressService : HabitProgressService    
  ){
    this.counterStreak = 0;
  } 

  async ngOnInit(): Promise<void> {
    this.counterStreak = await this.habitProgressService.getStreakByIdHabit(this.habitId);
  }

}

