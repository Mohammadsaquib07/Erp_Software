import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { LoginResponse } from '../Model/Login';
import { LoadingServiceService } from './loading-service.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly JWT_TOKEN = "JWT_TOKEN";
  private logedUser?: string;
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);

  private baseUrl = "https://localhost:7246/api";

  private http = inject(HttpClient);
  private loading = inject(LoadingServiceService);
  private router = inject(Router);

  constructor() { }

  login(user: { username: string, password: string }): Observable<any> {
    this.loading.show();
    return this.http.post<any>(`${this.baseUrl}/Login/login`, user).pipe(
      tap(res => {
        const token = (res && ((res.token) || (res.Token) || (res.data && res.data.token)) ) || null;
        if (token) {
          this.doLoginUser(user.username, token);
        } else {
          console.warn('AuthService.login: token not found in response', res);
        }
      })
    );
  }

  signup(payload: { username: string; email: string; password: string }): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(`${this.baseUrl}/auth/signup`, payload);
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