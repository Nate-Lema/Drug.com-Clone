import { Component, inject } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from './auth.service';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { User } from './user.type';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { Observable,} from 'rxjs';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [ReactiveFormsModule, MatButtonModule, MatInputModule, MatCardModule],
  template: `
    <div class="signup-container">
        <form [formGroup]="form" (ngSubmit)="signupHandler()">
          <h2>Sign Up</h2>
          <mat-form-field appearance="fill" class="form-control">
            <input matInput type="text" placeholder="Fullname" formControlName="fullname"/>
            @if(fullname.invalid && (fullname.dirty || fullname.touched)){
                  <div>
                     @if(email.hasError('required')){<mat-error>Fullname is <strong>required</strong></mat-error>}
                  </div>
               }
          </mat-form-field>
          <mat-form-field appearance="fill" class="form-control">
            <input matInput type="text" placeholder="Email" formControlName="email"/>
               @if(email.invalid && (email.dirty || email.touched)){
                     @if(email.hasError('required')){<mat-error>Email is <strong>required</strong></mat-error>}
                     @if(email.hasError('email')){<mat-error>Please enter a valid email address</mat-error>}
                     @if (email.hasError('email_exist')) {<mat-error>Email already <strong>exist</strong></mat-error>}
               }
          </mat-form-field>
          <mat-form-field appearance="fill" class="form-control">
            <input matInput type="password" placeholder="Password" formControlName="password"/>
            @if(password.invalid && (password.dirty || password.touched)){
                  <div>
                     @if(password.hasError('required')){<mat-error>Password is <strong>required</strong></mat-error>}
                     @if(password.hasError('minLength')){<mat-error>Password must be at least 8 characters long!</mat-error>}
                  </div>
               }
          </mat-form-field>
          <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid">Sign Up</button>
        </form>
    </div>
  `,
  styles: [`
  .signup-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 70vh;
    background-color: #f7f7f7;
  }
  .signup-form {
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    width: 300px;
    text-align: center;
  }
  .form-control {
    width: 100%;
    margin-bottom: 10px;
  }
  button {
    width: 100%;
    margin-top: 10px;
    background-color: #00796b!important;
    color: white!important;
  }
  button:disabled {
      background-color: #aaa !important;
    }
`]
})
export class SignupComponent {
  readonly title = inject(Title);
  readonly #authService = inject(AuthService);
  readonly #notification = inject(ToastrService);
  readonly #router = inject(Router);
  form = inject(FormBuilder).nonNullable.group({
    fullname: ['', [Validators.required]],
    email: ['', {
      validators: [Validators.required, Validators.email],
      asyncValidators: this.checkEmailExist.bind(this),
      updateOn: 'blur'
    }],
    password: ['', Validators.required,Validators.minLength(8)]
  });

  get fullname() { return this.form.controls.fullname; }
  get email() { return this.form.controls.email; }
  get password() { return this.form.controls.email; }

  constructor() {
    this.title.setTitle('Sign Up');
  }

  signupHandler() {
    this.#authService.signup(this.form.value as User).subscribe(res => {
      if (res.success) {
        this.#notification.success('You Successfully Sign Up!');
        this.#router.navigate(['signin']);
      }
    });
  }
   checkEmailExist(control:AbstractControl):Observable<null | Record<string,boolean>> {
    return this.#authService.verfiy_user_exit({email:this.email.value})
  }
}
