import { Component, Input } from '@angular/core';
import { ProgressHabitComponent } from '../progress.habit/progress.habit.component';
import { Habit } from '../../models/habit';
import { RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { find, remove } from '../../store/habit/habits.action';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { DaysOfWeek } from '../../enums/days.enum';
import { showModal } from '../../utils/helpers';
import { Subject } from 'rxjs';

@Component({
    selector: 'app-detail-habit',
    standalone: true,
    imports: [
      CommonModule,
      RouterModule,
      ProgressHabitComponent
    ],
    templateUrl: './detail.habit.component.html',
    styleUrl: './detail.habit.component.css'
})
export class DetailHabitComponent {

  private destroy$ = new Subject<void>();
  
  public viewProgress ! : boolean;

  daysOfWeek = DaysOfWeek;

  @Input() habit ! : Habit;

  habitStore ! : Habit;

  constructor(
    private store : Store<{habits : any, loading : any}>
  ) {

    this.viewProgress = false;
    this.store.select('habits').subscribe(state => {
      this.habitStore = {... state.habit};
    });
  }

  buttonViewProgress() : boolean{
    this.viewProgress = !this.viewProgress;
    if(this.viewProgress){
      this.store.dispatch(find({id: this.habit.id}));
    }
    return this.viewProgress;
  }

  remove(id: number) : void {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!"
    }).then((result) => {
      if (result.isConfirmed) {
        this.store.dispatch(remove({id}));
        showModal("loading");
      }
    });
  }

  ngOnDestroy() : void {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
