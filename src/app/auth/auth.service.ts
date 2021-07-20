import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { User } from './user.model';

export interface AuthResponseData {
  kind: string;
  idToken:	string;
  email:	string;
  refreshToken:	string;
  expiresIn:	string;
  localId:	string;
  registered?: boolean;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiKey = environment.firebaseApiKey;
  private firebaseApi = 'https://identitytoolkit.googleapis.com/v1';
  user = new BehaviorSubject<User>(null); //is like a Subject but stores the last event emitted
  logoutTimeout;
  constructor(private http: HttpClient, private router: Router) {}

  signup(email: string, password: string) {
    return this.http.post<AuthResponseData>(
      `${this.firebaseApi}/accounts:signUp?key=${this.apiKey}`,
      {
        email,
        password,
        returnSecureToken: true,
      }
    ).pipe(catchError(this.handleError), tap(resData => {
      this.handleAuthentication(resData.email, resData.localId, resData.idToken, +resData.expiresIn);
    }));
  }

  login(email: string, password: string) {
    return this.http.post<AuthResponseData>(
      `${this.firebaseApi}/accounts:signInWithPassword?key=${this.apiKey}`,
      {
        email,
        password,
        returnSecureToken: true,
      }
    ).pipe(catchError(this.handleError), tap(resData => {
      this.handleAuthentication(resData.email, resData.localId, resData.idToken, +resData.expiresIn);
    }));
  }

  autoLogin() {
    const userData : {
      email: string;
      id: string;
      _token: string;
      _tokenExpDate: string;
    } = JSON.parse(localStorage.getItem('userData'));
    if(!userData) {
      return;
    }
    const expirationDate = new Date(userData._tokenExpDate);
    const loadedUser = new User(userData.email, userData.id, userData._token, expirationDate);

    if(loadedUser.token) {
      this.user.next(loadedUser);
      const expirationDuration = expirationDate.getTime() - new Date().getTime();
      this.autoLogout(expirationDuration);
    }
  }

  logout() {
    this.user.next(null);
    this.router.navigate(['/auth']);
    localStorage.removeItem('userData');
    if(this.logoutTimeout) {
      clearTimeout(this.logoutTimeout);
      this.logoutTimeout = null;
    }
  }

  autoLogout(expirationDuration: number) {
    this.logoutTimeout = setTimeout(() => {
      this.logout();
    }, expirationDuration);
  }

  private handleAuthentication(email: string, userId: string, token: string, expiresIn: number) {
    const expDate = new Date(new Date().getTime() + expiresIn * 1000);
    const user = new User(email, userId, token, expDate);
    this.user.next(user);
    this.autoLogout(expiresIn * 1000);
    localStorage.setItem('userData', JSON.stringify(user));
  }

  private handleError(errorRes: HttpErrorResponse) {
    switch(errorRes?.error?.error?.message) {
      case 'EMAIL_EXISTS':
        return throwError('This email already exists');
      case 'EMAIL_NOT_FOUND':
        return throwError('This email does not exist.');
      case 'INVALID_PASSWORD':
        return throwError('This password is not correct');
      default:
        return throwError('An unknown error occurred')
    }
  }
}
