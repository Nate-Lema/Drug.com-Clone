import { Component, inject, input, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MedicationService } from '../medication/medication.service';
import { Review } from '../medication/medication.type';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-add-review',
  standalone: true,
  imports: [ReactiveFormsModule, MatButtonModule, MatInputModule],
  template: `
    <div class="wrapper">
      <form [formGroup]="form" (ngSubmit)="addReviewHandler()">
        <mat-form-field class="input-field">
          <textarea matInput placeholder="Enter your review" formControlName="review"></textarea>
          @if(form.controls.review.invalid && (form.controls.review.dirty || form.controls.review.touched)){
            @if(form.controls.review.hasError('required')){<mat-error>Review is <strong>required</strong></mat-error>}
          }
        </mat-form-field>
        <mat-form-field class="input-field">
          <input matInput type="number" min="1" max="5" placeholder="Enter your rating (1-5)" formControlName="rating" />
          @if(form.controls.rating.invalid && (form.controls.rating.dirty || form.controls.rating.touched)){
            @if(form.controls.rating.hasError('required')){<mat-error>Rating is <strong>required</strong></mat-error>}
            @if(form.controls.rating.hasError('min') || form.controls.rating.hasError('max')){<mat-error>Rating must be between <strong>1 and 5</strong></mat-error>}
          }
        </mat-form-field>
        <button mat-flat-button color="accent" type="submit" class="button" [disabled]="form.invalid">Add Review</button>
      </form>
    </div>
  `,
  styles: `
  .wrapper {
    width: 100vw;
    height: 100%;
    background: url("/images/form.jpg") no-repeat bottom;
    background-size: cover;
    padding-top: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  form {
    background: rgba(255, 255, 255, 0.8);
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    max-width: 500px;
    width: 100%;
  }
  .input-field {
    width: 100%;
  }
  .input-field textarea, .input-field input {
    font-size: 16px;
    padding: 10px;
  }
  button {
    width: 100%;
    padding: 10px;
    border-radius: 8px;
    background-color: #00796b !important;
    color: white;
    font-size: 16px;
    font-weight: bold;
    border: none;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }
  button:disabled {
    background-color: #aaa !important;
  }
`
})
export class AddReviewComponent implements OnInit {
  readonly title = inject(Title)
  readonly #medicationService = inject(MedicationService);
  readonly #notification = inject(ToastrService);
  readonly #router = inject(Router);
  form = inject(FormBuilder).nonNullable.group({
    review: ['', Validators.required],
    rating: ['', [Validators.required, Validators.min(1), Validators.max(5)]],
  });
  medication_id = input<string>('');
  addedBy: { user_id: string; fullname: string } | null = null;

  ngOnInit() {
    if (this.medication_id()) {
      this.#medicationService.getMedicationById(this.medication_id()).subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.addedBy = response.data.added_by;
          } else {
            this.#notification.error('Failed to fetch medication details');
          }
        },
        error: () => {
          this.#notification.error('Failed to fetch medication details');
        }
      });
    }
    this.title.setTitle('Add Review');
  }

  addReviewHandler() {
    if (this.medication_id() && this.addedBy) {
      const reviewData = this.form.value;
      const review: Review = {
        _id: '',
        review: reviewData.review as string,
        rating: Number(reviewData.rating),
        by: this.addedBy,
        date: Date.now(),
      };

      this.#medicationService.addMedicationReview(this.medication_id(), review).subscribe({
        next: (response) => {
          if (response.success) {
            this.#notification.success('Review added successfully');
            this.#router.navigate(['/medications', 'detail', this.medication_id()]);
          } else {
            this.#notification.error('Failed to add review, try again.');
          }
        },
        error: () => {
          this.#notification.error('Failed to add review, try again.');
        }
      });
    } else {
      this.#notification.error('Medication ID or user information is missing');
    }
  }
}
