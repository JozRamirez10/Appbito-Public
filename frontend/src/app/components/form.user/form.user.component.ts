import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { User } from '../../models/user';
import { FormsModule, NgForm } from '@angular/forms';
import { add, cleanUser } from '../../store/user/user.action';
import { loadingState } from '../../store/loading/loading.action';

@Component({
  selector: 'app-form-user',
  imports: [
    FormsModule,
    RouterLink
  ],
  templateUrl: './form.user.component.html',
  styleUrl: './form.user.component.css'
})
export class FormUserComponent implements OnInit{
  
  loading ! : boolean ;

  user ! : User;
  errors : any = {};
  passwordConfirm  ! : string;
  errorPassConfirm : boolean = false;

  constructor(
    private store : Store<{users : any, loading : any}>,
  ) {
    this.user = new User();
    this.store.select('users').subscribe(state => {
      this.user = {... state.user};
      this.errors = state.errors;
    });
    this.store.select('loading').subscribe(loading => {
      this.loading = loading
    })
  }
  
  ngOnInit(): void {
    this.store.dispatch(cleanUser());
    this.passwordConfirm = '';
    this.store.dispatch(loadingState({loading: false}));
  }

  onSubmit(userForm : NgForm) : void {
    if(userForm.valid){
      if(this.passwordConfirm == this.user.password){
        this.store.dispatch(loadingState({loading: true}))
        this.store.dispatch(add({user : this.user}));
      }else{
        this.errorPassConfirm = true;
      }
    }
  }

  ngOnDestroy() : void {
    this.user = new User();
  }

}
