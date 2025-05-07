import { Component, OnInit, ViewChild } from '@angular/core';
import { User } from '../../models/user';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { editImage, findById } from '../../store/user/user.action';
import { AuthService } from '../../services/auth.service';
import { UserState } from '../../store/user/user.reducer'; 
import { UserFormDataComponent } from '../user.form.data/user.form.data.component';
import { UserFormPasswordComponent } from "../user.form.password/user.form.password.component";
import { UserFormDeleteComponent } from '../user.form.delete/user.form.delete.component';
import { loadingState } from '../../store/loading/loading.action';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [
    RouterLink,
    UserFormDataComponent,
    UserFormPasswordComponent,
    UserFormDeleteComponent
  ],
  templateUrl: './user.component.html',
  styleUrl: './user.component.css'
})
export class UserComponent implements OnInit{

  user ! : User;

  nameUser ! : string;
  lastnameUser ! : string;
  emailUser ! : string; 

  image : any;

  selectedFile : File | null = null;
  fileError : string | null = null;

  loading ! : boolean; 

  constructor(
    private store : Store<{users: UserState, auth : any, loading : any}>,
    private authService : AuthService,
  ) {
    this.store.select('users').subscribe(state => {
      this.user = {... state.user};
      this.loadDataInForm();
    });

    this.store.select('loading').subscribe(loading => {
      this.loading = loading;
    })
  }
  
  ngOnInit(): void {
    if(!this.user.id){
      this.store.dispatch(findById({ id: Number(this.authService.getPayload().sub) }));
      this.store.dispatch(loadingState({loading : true}));
    }
  }

  loadDataInForm(){
    if(this.user.name != '')
      this.nameUser = this.user.name;

    if(this.user.lastname != '')
      this.lastnameUser = this.user.lastname;

    if(this.user.email != '')
      this.emailUser = this.user.email;
  }

  onFileSelected(event : Event) : void{
    const input = event.target as HTMLInputElement;
    if(!input.files || input.files.length === 0){
      this.fileError = "No file selected";
      this.selectedFile = null;
      return;
    }

    const file = input.files[0];
    const fileType = file.type;

    if(fileType === 'image/png' || fileType === 'image/jpeg'){
      this.fileError = null;
      this.selectedFile = file;
    }else{
      this.fileError = 'Invalid file type. Only PNG and JPG are allowed.'
      this.selectedFile = null;
    }
  }

  onSaveImage(event : Event) : void{
    event.preventDefault();
    if(this.selectedFile){
      const formData = new FormData();
      formData.append('image', this.selectedFile);
      formData.append('email', this.user.email);

      this.store.dispatch(editImage({ formImage: formData }));

    }
  }
}
