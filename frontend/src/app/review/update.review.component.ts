import { Component, OnInit, inject, input } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MedicationService } from '../medication/medication.service';
import { Review } from '../medication/medication.type';
import { CommonModule } from '@angular/common';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-update-review',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatButtonModule, MatInputModule],
  template: `
    <div class="wrapper">
      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <mat-form-field class="input-field">
          <textarea matInput placeholder="Update your review" formControlName="review"></textarea>
        </mat-form-field>
        <mat-form-field class="input-field">
          <input matInput type="number" min="1" max="5" placeholder="Update your rating (1-5)" formControlName="rating" />
        </mat-form-field>
        <button mat-flat-button type="submit" class="button">Update Review</button>
      </form>
    </div>
  `,
  styles: [`
    .wrapper {
      width: 100vw;
      height: 100%;
      background: url("/images/form.jpg");
      background-size: cover;
      background-repeat: no-repeat;
      background-position: bottom;
      padding-top: 28px;
    }
    form {
      height: 80%;
      gap: 16px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    .input-field {
      width: 450px;
    }
    button {
      width: 450px;
      border-radius: 8px;
      background-color: #005a4f!important;
    }
  `]
})
export class UpdateReviewComponent implements OnInit {
  readonly title = inject(Title);
  readonly #medicationService = inject(MedicationService);
  readonly #notification = inject(ToastrService);
  readonly #router = inject(Router);
  form = inject(FormBuilder).nonNullable.group({
    review: ['', Validators.required],
    rating: ['', [Validators.required, Validators.min(1), Validators.max(5)]],
  });

  medication_id = input<string>('');
  review_id = input<string>('');

  ngOnInit() {
    if (this.medication_id() && this.review_id()) {
      this.#medicationService.getMedicationReviewById(this.medication_id(), this.review_id()).subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.form.patchValue({
              review: response.data.review,
              rating: response.data.rating.toString(),
            });
          } else {
            this.#notification.error('Failed to fetch review details');
          }
        },
        error: () => {
          this.#notification.error('Failed to fetch review details');
        }
      });
    }
    this.title.setTitle('Update Review');
  }

  onSubmit() {
    if (this.form.valid) {
      const reviewData = this.form.value;
      const updatedReview: Review = {
        _id: this.review_id(),
        review: reviewData.review as string,
        rating: Number(reviewData.rating),
        by: { user_id: '', fullname: '' }, // Assuming user info is managed elsewhere
        date: Date.now(),
      };

      this.#medicationService.updateMedicationReview(this.medication_id(), updatedReview).subscribe({
        next: (response) => {
          if (response.success) {
            this.#notification.success('Review updated successfully');
            this.#router.navigate(['/medications', 'detail', this.medication_id()]);
          } else {
            this.#notification.error('Failed to update review, try again.');
          }
        },
        error: () => {
          this.#notification.error('Failed to update review, try again.');
        }
      });
    }
  }
}
