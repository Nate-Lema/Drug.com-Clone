import { Router, Routes } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './auth/auth.service';
import { ListMedicationComponent } from './medication/list.medication.component';

export const routes: Routes = [
    { path: '', redirectTo: 'list', pathMatch: 'full' },
    {
        path: 'list',
        component: ListMedicationComponent,
    },

    {
        path: 'detail/:medication_id',
        loadComponent: () => import('./medication/detail.medication.component').then(c => c.DetailMedicationComponent),
    },
    {
        path: 'review_detail/:medication_id/review/:review_id',
        loadComponent: () =>
            import('./review/detail.review.component').then(
                (c) => c.DetailReviewComponent
            ),
    },
    {
        path: 'signin',
        loadComponent: () => import('./auth/signin.component').then(c => c.SigninComponent),
        canActivate: [() => !inject(AuthService).is_logged_in()]
    },

    {
        path: 'signup',
        loadComponent: () => import('./auth/signup.component').then(c => c.SignupComponent),
        canActivate: [() => !inject(AuthService).is_logged_in()]
    },
    {
        path: 'medications',
        loadChildren: () => import('./medication/medication.routes').then(r => r.medication_routes),
    },
    
    { path: '**', redirectTo: "list" }
];
