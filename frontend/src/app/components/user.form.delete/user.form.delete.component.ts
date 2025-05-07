import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Store } from '@ngrx/store';
import { remove } from '../../store/user/user.action';
import { User } from '../../models/user';
import Swal from 'sweetalert2';
import { showModal } from '../../utils/helpers';

@Component({
  selector: 'app-user-form-delete',
  standalone: true,
  imports: [
    FormsModule
  ],
  templateUrl: './user.form.delete.component.html',
  styleUrl: './user.form.delete.component.css'
})
export class UserFormDeleteComponent {

  user ! : User;

  password ! : string;
  passwordConfirm ! : string;

  matches : boolean = true;
  passwordConfirmEmpty : boolean = false;

  errors : any = {};

  constructor(
    private store : Store<{users : any}>
  ) {
    this.password = '';
    this.passwordConfirm = '';
    this.store.select('users').subscribe(state => {
      this.user = {... state.user},
      this.errors = state.errors;
    });
  }

  onSubmit(deleteForm : NgForm) : void {
    this.matches = true;
    this.passwordConfirmEmpty = false;
    if(deleteForm.valid){
      if(this.passwordConfirm == undefined || this.passwordConfirm == ''){
        this.passwordConfirmEmpty = true;
      }else if(this.password != this.passwordConfirm){
        this.matches = false;
      }else{
        
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
            this.store.dispatch(remove({
              request: { password : this.password },
              id: this.user.id
            }))

            showModal("loading");
          }
        });
      }
    }
  }

}
