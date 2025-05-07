import { Component } from '@angular/core';
import { UserState } from '../../store/user/user.reducer';
import { Store } from '@ngrx/store';
import { User } from '../../models/user';
import { FormsModule, NgForm } from '@angular/forms';
import { edit } from '../../store/user/user.action';
import { CommonModule } from '@angular/common';
import { logout } from '../../store/auth/auth.action';
import { showModal } from '../../utils/helpers';

@Component({
  selector: 'app-user-form-data',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './user.form.data.component.html',
  styleUrl: './user.form.data.component.css'
})
export class UserFormDataComponent {

  buttonEdits = [
    {
      button: 'name',
      edit: false
    },
    {
      button: 'lastname',
      edit: false
    },
    {
      button: 'date',
      edit: false
    }
  ];

  user ! : User;
  errors : any = {};

  constructor(
    private store : Store<{users : UserState, auth: any}>,
  ) {
    this.store.select('users').subscribe(state => {
      this.user = {... state.user};
      this.errors = state.errors;
    });
  }

  btnEdit(input : string) : void {
    this.buttonEdits = this.buttonEdits.map(field => field.button == input ? {... field, edit: !field.edit} : field);
  }

  isEdit(input : string) : boolean{
    const field = this.buttonEdits.find(field => field.button == input);
    return field ? field.edit : false;
  }

  onSubmit(userForm : NgForm) : void {
    if(userForm.valid){
      this.store.dispatch(edit({userUpdate: this.user}));
      showModal('edit');
    }
  }

  handlerLogout() : void {
    this.store.dispatch(logout());
  }

}
