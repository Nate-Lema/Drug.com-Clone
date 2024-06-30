import { APP_INITIALIZER, ApplicationConfig, inject, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideToastr } from 'ngx-toastr';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { addTokenInterceptor } from './auth/add.token.interceptor';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async'
import { AuthService } from './auth/auth.service';

const bootstrap = () => {
  const authService = inject(AuthService)
  return () => {
    if (typeof localStorage !== 'undefined') {
      const persisted_state = localStorage.getItem('user_detail');
      if (persisted_state) {
        authService.$state.set(JSON.parse(persisted_state));
      }
    }
  }
}

export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }),
  provideRouter(routes,withComponentInputBinding()),
  provideHttpClient(withInterceptors([addTokenInterceptor])),
  provideToastr(), provideAnimationsAsync(),
    { provide: APP_INITIALIZER, multi: true, useFactory: bootstrap },
    provideAnimationsAsync(), provideAnimationsAsync()
  ]
};
