import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-verify',
  imports: [
    RouterLink
  ],
  templateUrl: './verify.component.html',
  styleUrl: './verify.component.css'
})
export class VerifyComponent {

  verify: boolean | null = null;

  constructor(
    private route: ActivatedRoute,
    private router : Router,
    private authService : AuthService
  ) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const token = params['token'];
      if (token) {
        this.verifyAccount(token);
      } else {
        this.verify = null; // Si no hay token, mostrar error
      }
    });
  }

  async verifyAccount(token : string){
    this.verify = await this.authService.verifyAccount(token);
  }

  toLogin(){
    this.router.navigate(["/login"]);
  }

}
