import { Component, inject, input, signal } from '@angular/core';
import { MedicationService } from '../medication/medication.service';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { DatePipe, CommonModule } from '@angular/common';
import { Review } from '../medication/medication.type';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-detail-review',
  standalone: true,
  imports: [CommonModule, DatePipe, RouterLink],
  template: `
    <div class="detail-container">
      <h1>Review Detail</h1>
      <div class="reviews">
        @if (review$() !== null) {
          <p><strong>{{ review$()?.by?.fullname}}</strong>: {{ review$()?.review}}</p>
          <p>Rating: {{ review$()?.rating ?? 0 }}/5</p>
          <p>Date: {{ review$()?.date | date }}</p>
        }
      </div>
      <div class="actions">
        @if (authService.is_logged_in() && review$()?.by?.user_id === authService.$state()._id){
          <button [routerLink]="['/medications', medication_id(), 'reviews', review$()?._id]">Edit</button>
          <button (click)="deleteReview(medication_id()!, review$()?._id!)">Delete</button>
        }
      </div>
    </div>
  `,
  styles: [`
    .detail-container {
      margin: 20px;
      padding: 20px;
      border: 1px solid #ddd;
      border-radius: 4px;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
      max-width: 600px;
      margin: 0 auto;
    }
    h1 {
      text-align: center;
      color: #00796b;
    }
    .reviews {
      margin-top: 20px;
    }
    .reviews p {
      margin: 5px 0;
      color: #555;
    }
    .actions {
      margin-top: 20px;
      display: flex;
      justify-content: space-around;
    }
    button {
      padding: 10px 20px;
      background-color: #00796b;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 16px;
    }
    button:hover {
      background-color: #005a4f;
    }
  `]
})
export class DetailReviewComponent {
  readonly title = inject(Title);
  readonly #medicationService = inject(MedicationService);
  authService = inject(AuthService);
  readonly #router = inject(Router);
  medication_id = input<string>('');
  review_id = input<string>('');
  review$ = signal<Review | null>(null);


  ngOnInit() {
    // this.medicationId = this.route.snapshot.paramMap.get('medication_id');
    // const reviewId = this.route.snapshot.paramMap.get('review_id');
    if (this.medication_id() && this.review_id()) {
      this.getReview(this.medication_id(), this.review_id());
    }
    this.title.setTitle('Review Detail');
  }

  getReview(medication_id: string, reviewId: string) {
    this.#medicationService.getMedicationReviewById(medication_id, reviewId).subscribe(response => {
      if (response.success && response.data) {
        this.review$.set(response.data);
      } else {
        alert('Failed to fetch Review');
      }
    });
  }

  deleteReview(medication_id: string, reviewId: string) {
    this.#medicationService.deleteMedicationReviewById(medication_id, reviewId).subscribe({
      next: () => this.#router.navigate(['detail', medication_id]),
      error: () => alert('Failed to delete Review')
    });
  }
}

