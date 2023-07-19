import { HttpResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { catchError, EMPTY } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  loginForm: FormGroup;

  constructor(private formBuilder: FormBuilder, private authService: AuthService, private router: Router) {

    this.loginForm = this.formBuilder.group({
      email: [''],
      password: ['']
    });

  }

  ngOnInit(): void {
    if (this.authService.loggedIn()) {
      this.router.navigate(['/images']);
    }
  }

  login(): void {
    const loginCredentials = this.loginForm.value;
    const email = loginCredentials.email;
    const password = loginCredentials.password;

    if (email && password) {
      this.authService.login(email, password).pipe(
        catchError((err) => {
          alert("Bad login credentials");
          return EMPTY;
        })
      ).subscribe((res: HttpResponse<any>) => {
        if (res.status === 200) {
          this.router.navigate(['/images']);
        } else {
          alert("Login error: " + res.status);
        }

        console.log(res);
      });
    } else {
      alert("Missing email or password");
    }

  }

}
