// import { inject, Injectable } from '@angular/core';
// import { Router } from '@angular/router';
// import { Login, LoginResponse } from '../Model/Login';
// import { BehaviorSubject, Observable, tap } from 'rxjs';
// import { HttpClient } from '@angular/common/http';

// @Injectable({
//   providedIn: 'root'
// })
// export class AuthService {
//   private apiUrl: string = "https://localhost:7246/api/Login/login";
//   private readonly JWT_TOKEN = "JWT_TOKEN";
//   private isAuthenticated = new BehaviorSubject<boolean>(false);
//   private http = inject(HttpClient);
//   private router = inject(Router);
//   private logedUser?: string;

//   constructor() { }

//   login(userObj: Login): Observable<any> {
//     return this.http.post<LoginResponse>(this.apiUrl, userObj).pipe(
//       tap(res => this.doLogin(userObj.username, res.token))
//     );
//   }

//   private doLogin(username: string, token: string) {
//     this.logedUser = username;
//     this.storeToken(token);
//     this.isAuthenticated.next(true);
//   }

//   private storeToken(token: string) {
//     localStorage.setItem(this.JWT_TOKEN, token);
//   }

//   logOut() {
//     localStorage.removeItem(this.JWT_TOKEN);
//     this.isAuthenticated.next(false);
//     this.router.navigate(['']);
//   }
//   getToken(): string | null {
//     return localStorage.getItem(this.JWT_TOKEN);
//   }
// }
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { LoginResponse } from '../Model/Login';

// interface LoginResponse {
//   token: string;
// }
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly JWT_TOKEN = "JWT_TOKEN";
  private logedUser?: string;
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  private apiUrl = "https://localhost:7246/api/Login/login";
  private http = inject(HttpClient)

  private router = inject(Router)
  constructor() { }

  login(user: { username: string, password: string }) :Observable<any>{
     return this.http.post<LoginResponse>(this.apiUrl, user).pipe(
    tap(res => this.doLoginUser(user.username, res.token))
  );
  }
  private doLoginUser(username: string, token: any) {
    this.logedUser = username;
    this.storeToken(token);
    this.isAuthenticatedSubject.next(true);
  }
  private storeToken(token: string) {
  localStorage.setItem(this.JWT_TOKEN, token);
}
  logOut() {
    localStorage.removeItem(this.JWT_TOKEN);
    this.isAuthenticatedSubject.next(false);
    this.router.navigate(['']);
  }
  getToken(): string | null {
  return localStorage.getItem(this.JWT_TOKEN);
}
}