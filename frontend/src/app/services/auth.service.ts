import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { WebRequestService } from './web-request.service';
import { catchError, shareReplay, tap } from 'rxjs/operators';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { throwError } from 'rxjs';
import { User } from '../models/user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private webReqService: WebRequestService, private router: Router, private http: HttpClient) { }

  login(email: string, password: string) {
    return this.webReqService.login(email, password).pipe(
      shareReplay(),
      tap((res: HttpResponse<any>) => {
        if (res) {
          this.setSession(res.body._id, res.body.email, res.headers.get('Authorization') || '');
        }
      }),
      catchError((error: any) => {
        return throwError(() => error);
      })
    )
  }

  signup(email: string, password: string) {
    return this.webReqService.signup(email, password).pipe(
      shareReplay(),
      tap((res: HttpResponse<any>) => {
        if (res) {
          this.setSession(res.body._id, res.body.email, res.headers.get('Authorization') || '');
        }
      }),
      catchError((error: any) => {
        return throwError(() => error);
      })
    )
  }

  resetPassword(password: string) {
    return this.webReqService.patch(`users/${this.getUserId()}`, { password });
  }

  getUserById(id: string | undefined) {
    if (id === undefined) {
      return;
    }
    return this.webReqService.get<User>(`users/${id}`);
  }

  loggedIn() {
    return localStorage.getItem('x-access-token');
  }

  logout() {
    this.removeSession();
    this.router.navigate(['/login']);
  }

  getAccessToken() {
    return localStorage.getItem('x-access-token');
  }

  getUserId() {
    return localStorage.getItem('user-id') || '';
  }

  setAccessToken(accessToken: string) {
    localStorage.setItem('x-access-token', accessToken)
  }

  private setSession(userId: string, email: string, accessToken: string) {
    localStorage.setItem('user-id', userId);
    localStorage.setItem('email', email);
    localStorage.setItem('x-access-token', accessToken);
    //localStorage.setItem('x-refresh-token', refreshToken);
  }

  removeSession() {
    localStorage.removeItem('user-id');
    localStorage.removeItem('x-access-token');
    //localStorage.removeItem('x-refresh-token');
  }

  /*getNewAccessToken() {
    return this.http.get(`${this.webReqService.ROOT_URL}/users/me/access-token`, {
      headers: {
        'x-refresh-token': this.getRefreshToken(),
        '_id': this.getUserId()
      },
      observe: 'response'
    }).pipe(
      tap((res: HttpResponse<any>) => {
        this.setAccessToken(res.headers.get('x-access-token') || '');
      })
    )
  }*/
}
