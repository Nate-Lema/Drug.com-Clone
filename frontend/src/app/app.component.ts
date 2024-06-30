import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthService, initial_user } from './auth/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  template: `
    <header>
      <div class="logo-container">
        <img class="logo" src="./assets/images/drugscom-logo.svg" alt="Drugs.com Logo">
      </div>
      <nav>
        <ul class="nav-links">
          @if(auth.is_logged_in()) {
            <li><a [routerLink]="['','medications','list']">Home</a></li>
            <li><a [routerLink]="['','medications','add']">Add Medication</a></li>
            <li (click)="logoutHandler()">Log Out</li>
          } @else {
            <li><a routerLink="list">Browse</a></li>
            <li><a routerLink="signup">Signup</a></li>
            <li><a routerLink="signin">Signin</a></li>
          }
        </ul>
      </nav>
    </header>
    <main>
      <h1>Find Drugs & Conditions</h1>
      <h3>Welcome {{auth.$state().fullname}}!</h3>
      @if(!auth.is_logged_in()) {
        <p>Please sign in to manage medications.</p>
      }
    </main>
    <footer>
      <p>&copy; 2024 Drugs.com. All rights reserved.</p>
    </footer>
    <router-outlet></router-outlet>
  `,
  styles: [`
  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 20px;
    background-color: #00796b;
    color: white;
    height: 50px;
    position: fixed;
    top: 0;
    width: 98%;
    z-index: 1000;
  }
  .logo-container {
    flex: 1;
  }
  .logo {
    width: 150px;
  }
  nav {
    flex: 2;
    text-align: right;
  }
  .nav-links {
    list-style-type: none;
    padding: 0;
    margin: 0;
    display: flex;
    gap: 20px;
    justify-content: flex-end;
  }
  .nav-links li {
    display: inline;
  }
  .nav-links li a, .nav-links li {
    color: white;
    text-decoration: none;
    font-weight: bold;
    cursor: pointer;
  }
  main {
    padding: 80px 20px 20px;
    text-align: center;
  }
  footer {
    text-align: center;
    padding: 10px 20px;
    background-color: #00796b;
    color: white;
    position: fixed;
    bottom: 0;
    width: 100%;
    height: 80px;
    z-index: 1000;
  }
`]
})
export class AppComponent {
  readonly auth = inject(AuthService)
  readonly #router = inject(Router)

  logoutHandler() {
    this.auth.$state.set(initial_user)
    this.#router.navigate(['list'])
  }
}
