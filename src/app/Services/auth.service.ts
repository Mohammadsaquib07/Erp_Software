import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Login, LoginResponse } from '../Model/Login';
import { BehaviorSubject, Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl: string = "https://localhost:7246/api/Login/login";
  private readonly jwt_Token_Key = "JWT_TOKEN";
  private isAuthenticated = new BehaviorSubject<boolean>(false);
  private http = inject(HttpClient);
  private router = inject(Router);
  private logedUser?: string;

  constructor() { }

  login(userObj: Login): Observable<any> {
    return this.http.post<LoginResponse>(this.apiUrl, userObj).pipe(
      tap(res => this.doLogin(userObj.username, res.token))
    );
  }

  private doLogin(username: string, token: string) {
    this.logedUser = username;
    this.storeToken(token);
    this.isAuthenticated.next(true);
  }

  private storeToken(token: string) {
    localStorage.setItem(this.jwt_Token_Key, token);
  }

  logOut() {
    localStorage.removeItem(this.jwt_Token_Key);
    this.isAuthenticated.next(false);
    this.router.navigate(['/login']);
  }
  getToken(): string | null {
    return localStorage.getItem(this.jwt_Token_Key);
  }
}
