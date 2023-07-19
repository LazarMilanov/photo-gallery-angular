import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddImageComponent } from './components/add-image/add-image.component';
import { EditImageComponent } from './components/edit-image/edit-image.component';
import { LoginComponent } from './components/login/login.component';
import { MainPageComponent } from './components/main-page/main-page.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { SignUpComponent } from './components/sign-up/sign-up.component';
import { ViewImageComponent } from './components/view-image/view-image.component';
import { AuthGuard } from './services/auth.guard';

const routes: Routes = [
  {path: 'images', component: MainPageComponent, canActivate: [AuthGuard]},
  {path: 'add-image', component: AddImageComponent, canActivate: [AuthGuard]},
  {path: 'view-image/:imageId', component: ViewImageComponent, canActivate: [AuthGuard]},
  {path: 'edit-image/:imageId', component: EditImageComponent, canActivate: [AuthGuard]},
  {path: 'login', component: LoginComponent},
  {path: 'sign-up', component: SignUpComponent},
  {path: 'reset-password', component: ResetPasswordComponent, canActivate: [AuthGuard]},
  {path: '**', component: LoginComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
