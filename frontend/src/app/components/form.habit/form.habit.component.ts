import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Habit } from '../../models/habit';
import { add, edit, find, resetHabit } from '../../store/habit/habits.action';
import { DaysOfWeek } from '../../enums/days.enum';
import { CalendarProgressComponent } from '../calendar.progress/calendar.progress.component';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { showModal } from '../../utils/helpers';

@Component({
  selector: 'app-form-habit',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    CalendarProgressComponent
  ],
  templateUrl: './form.habit.component.html',
  styleUrl: './form.habit.component.css'
})
export class FormHabitComponent implements OnInit{

  loading ! : boolean;

  habit ! : Habit;
  daysOfWeek = DaysOfWeek;

  errors : any = {}
  errorHour : boolean = false;
  
  view ! : string;

  hourAllowed : boolean;
  
  constructor(
    private store : Store<{habits : any, loading : any}>,
    private route : ActivatedRoute,
    private authService : AuthService
  ) {
    
    this.habit = new Habit();
    this.hourAllowed = false;

    this.store.select('habits').subscribe(state => {
      this.habit = {... state.habit};
      this.errors = state.errors;
    });

  }

  ngOnInit(): void {
    this.store.dispatch(resetHabit());
    this.route.paramMap.subscribe(params => {
      const id : number = + (params.get('id') || '0');
      if(id > 0){
        this.store.dispatch(find({id}));
        
        if(this.habit.hour){
          this.hourAllowed = true;
        }
        
      }
      this.view = params.get('view') || '';

      if(this.view !== 'view' && this.view !== 'edit'){
        this.store.dispatch(resetHabit());
      }

    })
  }

  onHourAllowed(event : Event ) : void {
    const onHourCheck = event.target as HTMLInputElement;
    if(onHourCheck.checked){
      this.hourAllowed = true;
    }else{
      this.hourAllowed = false;
      this.habit.hour = '';
    }
  }

  onSubmit(habitForm : NgForm) : void {
    this.errorHour = false;
    this.errors = {}

    if(this.hourAllowed){
      if(this.habit.hour == undefined || this.habit.hour == ''){
        this.errorHour = true;
        return;
      }
    }

    if(this.habit.id != null){
      this.store.dispatch(edit({habitUpdate: this.habit}));
    }else{
      this.habit.userId = Number(this.authService.getPayload().sub);
      this.store.dispatch(add({habitNew: this.habit}));
    } 
    showModal("loading");
  }

  toggleAllDays(){
    this.toggleDay(DaysOfWeek.MONDAY);
    this.toggleDay(DaysOfWeek.TUESDAY);
    this.toggleDay(DaysOfWeek.WEDNESDAY);
    this.toggleDay(DaysOfWeek.THURSDAY);
    this.toggleDay(DaysOfWeek.FRIDAY);
    this.toggleDay(DaysOfWeek.SATURDAY);
    this.toggleDay(DaysOfWeek.SUNDAY);
  }

  toggleDay(day : DaysOfWeek ){
    if(!this.habit.days){
      this.habit.days = [];
    }

    const updateDays = [... this.habit.days];
    const index = updateDays.indexOf(day);

    if(index === -1){
      updateDays.push(day);
    }else{
      updateDays.splice(index, 1);
    }

    this.habit.days = updateDays; 
  }

}
