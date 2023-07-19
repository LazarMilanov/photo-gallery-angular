import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { catchError, EMPTY } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {

  resetPasswordForm: FormGroup;

  constructor(private formBuilder: FormBuilder, private router: Router, private authService: AuthService) {
    this.resetPasswordForm = this.formBuilder.group({
      password: [''],
      confirmPassword: ['']
    });
  }

  ngOnInit(): void {
  }

  resetPassword(): void {
    const signupCredentials = this.resetPasswordForm.value;
    const password = signupCredentials.password;
    const confirmPassword = signupCredentials.confirmPassword;

    if(password === confirmPassword){
      
      this.authService.resetPassword(password).pipe(
        catchError((err) => {
          alert("Password not validated or server error");
          return EMPTY;
        })
      ).subscribe((res) => {
        console.log(res);
        this.authService.logout();
        this.router.navigate(['/login']);
      });

    }else{
      alert("Password doesn't match");
    }
  }
}
