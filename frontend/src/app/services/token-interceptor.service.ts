import { HttpErrorResponse, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable, Injector } from '@angular/core';
import { EMPTY, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class TokenInterceptorService implements HttpInterceptor {

  constructor(private injector: Injector) { }

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    const authService = this.injector.get(AuthService);
    
    const tokenizedReq = req.clone({
      setHeaders: {
        //'x-access-token': (authService.getAccessToken() as string)
        Authorization: `Bearer ${authService.loggedIn()}`
      }
    });
    return next.handle(tokenizedReq).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          console.log(error);
          authService.logout();
          return EMPTY;
        }

        return throwError(error);
      })
    );
  }

}
