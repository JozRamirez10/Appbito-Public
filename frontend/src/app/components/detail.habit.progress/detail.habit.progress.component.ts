import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { Habit, HabitProgress } from '../../models/habit';
import { Store } from '@ngrx/store';
import { CommonModule } from '@angular/common';
import { showModal } from '../../utils/helpers';
import { FormsModule, NgForm } from '@angular/forms';
import { addHabitProgress, removeHabitProgress, updateHabitProgress } from '../../store/habitProgress/habit.progress.action';

@Component({
  selector: 'app-detail-habit-progress',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './detail.habit.progress.component.html',
  styleUrl: './detail.habit.progress.component.css'
})
export class DetailHabitProgressComponent {
  @ViewChild('closeButton') closeButton ! : ElementRef;

  @Input() edit : boolean = false;

  habitProgress ! : HabitProgress;

  habit ! : Habit;

  day ! : Date;
  
  constructor (
    private store : Store<{habitProgress : any, habits : any, loading : any}>,
  ) {
    this.habitProgress = new HabitProgress();
    this.habit = new Habit();
    
    this.store.select('habitProgress').subscribe(state => {
      this.habitProgress = {...state.habitProgress};
      this.habit = {...state.habit};
      this.day = state.day;
    });

  }

  setDone(operation : string) : void{

    let updateProgress = {... this.habitProgress};

    switch(operation){
      case '+':
        updateProgress.timesPerformed++;
        break;
      case '-':
        if(updateProgress.timesPerformed > 0)
          updateProgress.timesPerformed--;
        break;
      default:
        break;
    }

    this.habitProgress = {...updateProgress};

  }

  onSubmit(habitProgressForm : NgForm) : void {
    if(this.habitProgress.timesPerformed > 0 || (this.habitProgress.note !== undefined && this.habitProgress.note?.length > 0) ){
      if(this.habitProgress.id === undefined){
        this.habitProgress.date = this.day;
        this.habitProgress.habitId = this.habit.id;
        this.store.dispatch(addHabitProgress({habitProgressNew: this.habitProgress }));
      }else{
        this.store.dispatch(updateHabitProgress({habitProgressUpdate: this.habitProgress }));
      }
      showModal('loading');
      this.closeHabitProgressCanvas();
    }else{
      const message = 'You should include the times you have done it or a quick note';
      showModal('custom', "Error", message, "error");
    }
  }

  onDeleteHabitProgress(){
    this.store.dispatch(removeHabitProgress({
      habitId: this.habit.id,
      habitProgressId: this.habitProgress.id
    }));
    showModal('loading');
    this.closeHabitProgressCanvas();
  }

  closeHabitProgressCanvas(){
    if(this.closeButton){
      this.closeButton.nativeElement.click();
    }
  }

}
