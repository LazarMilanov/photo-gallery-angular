import { HttpResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { EMPTY } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.css']
})
export class SignUpComponent implements OnInit {

  signupForm: FormGroup;

  constructor(private formBuilder: FormBuilder, private authService: AuthService, private router: Router) {

    this.signupForm = this.formBuilder.group({
      email: [''],
      password: [''],
      confirmPassword: ['']
    });

  }

  ngOnInit(): void {
    if (this.authService.loggedIn()) {
      this.router.navigate(['/images']);
    }
  }

  signup(): void {

    const signupCredentials = this.signupForm.value;
    const email = signupCredentials.email;
    const password = signupCredentials.password;
    const confirmPassword = signupCredentials.confirmPassword;

    if(email){

      if(password === confirmPassword){
        
        this.authService.signup(email, password).pipe(
          catchError((err) => {
            alert("Bad signup credentials or account exists");
            return EMPTY;
          })
        ).subscribe((res) => {
          console.log(res);
          this.router.navigate(['/images']);
        });

      }else{
        alert("Password don't match");
      }

    }else{
      alert("Please add an email address");
    }

  }

}
