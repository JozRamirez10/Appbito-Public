import { Component, OnInit} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Store } from '@ngrx/store';
import { logout, removeAccount } from './store/auth/auth.action';

@Component({
    selector: 'app-root',
    imports: [
        RouterOutlet,
    ],
    templateUrl: './app.component.html',
    styleUrl: './app.component.css'
})
export class AppComponent implements OnInit{
  
    loading ! : boolean;

    constructor(
        private store : Store<{users : any, auth : any, loading : any}>,

    ) { 
    }

    ngOnInit(): void {

        const logoutChannel = new BroadcastChannel('logout_channel');

        logoutChannel.onmessage = (event) => {
            if(event.data === 'logout') {
                logoutChannel.close();
                this.store.dispatch(logout());
            }else if(event.data === 'remove'){
                logoutChannel.close();
                this.store.dispatch(removeAccount());
            }
        }
    }

}
 