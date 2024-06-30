import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService, LogInUser } from './auth.service';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { jwtDecode } from "jwt-decode";
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-signin',
  standalone: true,
  imports: [ReactiveFormsModule,MatButtonModule,MatInputModule,MatCardModule],
  template: `
    <div class="signin-container">
        <form [formGroup]="form" (ngSubmit)="signinHandler()">
          <h2>Sign In</h2>
          <mat-form-field appearance="fill" class="form-control">
            <input matInput type="text" placeholder="Email" formControlName="email">
            @if(email.invalid && (email.dirty || email.touched)){
                     @if(email.hasError('required')){<mat-error>Email is <strong>required</strong></mat-error>}
                     @if(email.hasError('email')){<mat-error>Please enter a valid email address</mat-error>}
               }
          </mat-form-field>
          <mat-form-field appearance="fill" class="form-control">
            <input matInput type="password" placeholder="Password" formControlName="password">
            @if(password.invalid && (password.dirty || password.touched)){
                  <div>
                     @if(password.hasError('required')){<mat-error>Password is <strong>required</strong></mat-error>}
                  </div>
               }
          </mat-form-field>
          <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid">Sign In</button>
        </form>
    </div>
  `,
  styles: [`
  .signin-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 70vh;
    background-color: #f7f7f7;
  }
  .signin-form {
    padding: 20px;
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
export class SigninComponent {
  readonly title = inject(Title)
  readonly #authService = inject(AuthService);
  readonly #notification = inject(ToastrService);
  readonly #router = inject(Router);

  form = inject(FormBuilder).nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  get email() { return this.form.controls.email }
  get password(){return this.form.controls.password}
  
  constructor() {
    this.title.setTitle('Sign In');
  }

  signinHandler() {
    this.#authService.signin(this.form.value as { email: string, password: string }).subscribe({
      next: response => {
        if (response.success) {
          const decoded_token = jwtDecode(response.data) as LogInUser;
          this.#authService.$state.set({
            _id: decoded_token._id,
            fullname: decoded_token.fullname,
            email: decoded_token.email,
            jwt: response.data
          });
          this.#notification.success('You Successfully Sign in!');
          this.#router.navigate(['','medications','list']);
        }
      },
      error: error => {
        this.#notification.error('Invalid Username or Password.');
      }
    });
  }
}

