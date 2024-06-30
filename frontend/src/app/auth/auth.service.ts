import { HttpClient } from '@angular/common/http';
import { Injectable, effect, inject, signal } from '@angular/core';
import { User } from './user.type';
import { environment } from '../../environments/environment';
export interface LogInUser {
  _id: string;
  fullname: string;
  email: string;
  jwt: string
}
export const initial_user = {
  _id: '',
  fullname: 'Guest',
  email: '',
  jwt: '',
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  readonly #http = inject(HttpClient)
  $state = signal<LogInUser>(initial_user)

  constructor() {
    effect(() => {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('user_detail', JSON.stringify(this.$state()))
      }
    })
  }

  is_logged_in() {
    return this.$state()._id !== ''
  }

  signup(user_detail: User) {
    return this.#http.post<{ success: boolean, data: User }>(environment.BACKEND_SERVER_URL + '/users/signup', user_detail)
  }

  signin(credentials: { email: string, password: string }) {
    return this.#http.post<{ success: boolean, data: string }>(environment.BACKEND_SERVER_URL + '/users/signin', credentials)
  }

  verfiy_user_exit(body:{email: string}) {
    return this.#http.post<null | Record<string,boolean>>(environment.BACKEND_SERVER_URL+'/users/verify',body)
  }

}
