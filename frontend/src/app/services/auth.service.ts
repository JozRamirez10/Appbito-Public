import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Store } from "@ngrx/store";
import { catchError, Observable, tap, throwError } from "rxjs";
import { JwtTokenService } from "./jwt.token.service";
import { Router } from "@angular/router";
import { environment } from "../../environments/environment";

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    
    private url: string = environment.apiUrl;

    constructor(
        private http : HttpClient,
        private store : Store<{auth : any}>,
        private jwtService : JwtTokenService,
        private router : Router,
    ) { }

    verifyAccount(token : string) : Promise<boolean> {
        return this.http.get(`${this.url}/auth/verify?token=${token}`).toPromise()
            .then( () => true)
            .catch( () => false);
    }

    loginUser({email, password} : any) : Observable<any> {
        return this.http.post<any>(`${this.url}/login`, {email, password}, {
            observe: 'response',
            withCredentials: true
        }).pipe(
            tap(response => {
                const token = response.headers.get('Authorization');
                if(!token){
                    return;
                }
                this.setToken(token);
            }),
            catchError(error => {
                return throwError( () => error);
            })
        );
    }

    refreshToken() : Promise<string | null> {
        return new Promise( (resolve) => {
            this.http.post<any>(`${this.url}/auth/refresh`, {}, {
                observe: 'response',
                withCredentials: true
            }).subscribe({
                next: response => {
                    const token = response.headers.get("Authorization");
                    if(!token){
                        resolve(null)
                        return;
                    }
                    this.setToken(token);
                    resolve(token);
                },
                error: () => {
                    resolve(null);
                }
            })
        });     
    }

    logout() : Observable<any>{
        return this.http.post<any>(`${this.url}/auth/logout`, {}, {withCredentials: true});
    }
    
    setToken(token : string){
        this.jwtService.setToken(token);
    }

    getToken() : string | null | undefined {
        const token = this.jwtService.getToken();
        const tokenWithoutBearer = token?.replace('Bearer ', '');
        return tokenWithoutBearer;
    }

    getPayload(){
        return this.jwtService.getDecodeToken();
    }

    isExpired() : boolean {
        return this.jwtService.isTokenExpired();
    }

    removeSession() : void {
        sessionStorage.removeItem('token');
    }
}