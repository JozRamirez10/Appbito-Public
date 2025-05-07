import { Component, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { UpdatePasswordRequest, User } from '../../models/user';
import { Store } from '@ngrx/store';
import { editPassword } from '../../store/user/user.action';
import { showModal } from '../../utils/helpers';

@Component({
  selector: 'app-user-form-password',
  standalone: true,
  imports: [
    FormsModule
  ],
  templateUrl: './user.form.password.component.html',
  styleUrl: './user.form.password.component.css'
})
export class UserFormPasswordComponent implements OnInit{

  user ! : User;
  requestPassword : UpdatePasswordRequest;
  newPasswordConfirm ! : string;
  
  matches : boolean = true;
  passwordConfirmEmpty : boolean = false;
  
  errors : any = {};

  constructor(
    private store : Store<{users : any}>
  ) {
    this.store.select('users').subscribe(state => {
      this.user = {... state.user};
      this.errors = state.errors;
    });
    this.requestPassword = new UpdatePasswordRequest();
    this.requestPassword.newPassword = '';
    this.requestPassword.oldPassword = '';
    this.newPasswordConfirm = '';
  }
  ngOnInit(): void {
    this.newPasswordConfirm = '';
  }

  onSubmit(passwordForm : NgForm) : void{
    if(passwordForm.valid){
      this.passwordConfirmEmpty = false;
      this.matches = true;
  
      if(this.newPasswordConfirm == undefined || this.newPasswordConfirm == ''){
        this.passwordConfirmEmpty = true;
      }else if(this.requestPassword.newPassword != this.newPasswordConfirm){
        this.matches = false;
      }else{
        this.store.dispatch(editPassword({
          request: {... this.requestPassword},
          id: this.user.id
        }));

        showModal("loading");

      }
    }
  }
}
