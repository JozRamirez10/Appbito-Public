import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { User } from '../../models/user';
import { login } from '../../store/auth/auth.action';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { loadingState } from '../../store/loading/loading.action';
import { showModal } from '../../utils/helpers';
import { cleanUser } from '../../store/user/user.action';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit{

  user ! : User;
  message ! : string;

  constructor(
    private store : Store<{auth : any, loading : any}>,
  ) {
    this.user = new User(); 
  }
  
  ngOnInit(): void {
    this.store.dispatch(cleanUser());
    this.store.dispatch(loadingState({loading: false}));
  }

  onSubmit() : void {
    if(!this.user.email || !this.user.password){
      this.message = 'Email and password required';
    }else{
      this.store.dispatch(login({
        email: this.user.email,
        password: this.user.password
      }));

      this.store.dispatch(loadingState({loading: true}));
      showModal('loading');
    }
  }

  ngOnDestroy() : void {
    this.user = new User();
  }

}
