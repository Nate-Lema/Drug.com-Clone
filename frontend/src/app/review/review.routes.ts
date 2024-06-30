import { Routes } from "@angular/router"

export const review_routes: Routes = [
    { path: ':medication_id/reviews/add', loadComponent: () => import('./add.review.component').then(c => c.AddReviewComponent) },
    { path: '/reviews/:review_id', loadComponent: () => import('../medication/update.medication.component').then(c => c.UpdateComponent) },
    { path: ':medication_id/reviews', loadComponent: () => import('./list.review.component').then(c => c.ListReviewComponent) },

]