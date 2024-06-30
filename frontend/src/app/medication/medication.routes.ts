import { inject } from "@angular/core"
import { Routes } from "@angular/router"
import { AuthService } from "../auth/auth.service"

export const medication_routes: Routes = [
    { path: 'list', loadComponent: () => import('./list.medication.component').then(c => c.ListMedicationComponent) },
    {
        path: 'add', loadComponent: () => import('./add.medication.component').then(c => c.AddMedicationComponent),
        canActivate: [() => inject(AuthService).is_logged_in()]
    },
    {
        path: 'update/:medication_id', loadComponent: () => import('./update.medication.component').then(c => c.UpdateComponent),
        canActivate: [() => inject(AuthService).is_logged_in()]
    },
    { path: 'detail/:medication_id', loadComponent: () => import('./detail.medication.component').then(c => c.DetailMedicationComponent) },
    {
        path: ':medication_id/reviews/add', loadComponent: () => import('../review/add.review.component').then(c => c.AddReviewComponent),
        canActivate: [() => inject(AuthService).is_logged_in()]
    },
    {
        path: ':medication_id/reviews/:review_id', loadComponent: () => import('../review/update.review.component').then(c => c.UpdateReviewComponent),
        canActivate: [() => inject(AuthService).is_logged_in()]
    },
    { path: ':medication_id/reviews', loadComponent: () => import('../review/list.review.component').then(c => c.ListReviewComponent) },
]