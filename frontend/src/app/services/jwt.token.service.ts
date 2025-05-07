import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class JwtTokenService {

  jwtToken ! : string;
  decodedToken ! : {
    exp ? : number,
    [key : string] : any
  };

  constructor() { }

  setToken(token : string){
    if(token){
      this.jwtToken = token;
      sessionStorage.setItem("token", token);
    }
  }

  getToken() : string | null {
    return sessionStorage.getItem("token");
  }

  decodeToken() {
    if(this.jwtToken)
        this.decodedToken = jwtDecode(this.jwtToken);
  }

  getDecodeToken() {
    return jwtDecode(this.jwtToken);
  }

  getExpiryTime() {
    this.decodeToken();
    return this.decodedToken ? this.decodedToken.exp : null;
  }

  isTokenExpired() : boolean {
    const expiryTime = this.getExpiryTime();
    if(expiryTime){
      return ((1000 * expiryTime) - (new Date()).getTime()) < 5000; 
    }else{
      return false;
    }
  }

}
