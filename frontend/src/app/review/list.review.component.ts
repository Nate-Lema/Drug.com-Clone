import { Component, inject, input, signal } from '@angular/core';
import { MedicationService } from '../medication/medication.service';
import { Router, RouterLink } from '@angular/router';
import { Medication, Review } from '../medication/medication.type';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-list.review',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="page-container">
      <div class="detail-container">
        <h1>Medication Medical Review Lists</h1>
            @for(review of reviews$(); track review._id) {
              <a [routerLink]="['/review_detail', medication$()?._id, 'review', review._id]" class="review-link">
                <p><strong>{{ review.by.fullname }}</strong>:{{ review.review }}</p>
              </a>
            }
          </div>
    </div>
  `,
  styles: [`
  .page-container {
    height: 70vh;
    overflow-y: auto;
    background-color: #f0f0f0;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .detail-container {
    margin: 20px auto;
    padding: 20px;
    border: 1px solid #ddd;
    border-radius: 8px;
    box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);
    max-width: 700px;
    width: 100%;
    background-color: #f9f9f9;
    max-height: 100vh;
    overflow-y: auto;
  }
  h1 {
    text-align: center;
    color: #00796b;
    font-size: 2em;
    margin-bottom: 20px;
  }
  .review-link {
    text-decoration: none;
    color: inherit;
    display: block;
    padding: 10px;
    border-radius: 4px;
    transition: background-color 0.3s;
  }
  .review-link:hover {
    background-color: #f1f1f1;
  }
`]
})
export class ListReviewComponent {
  readonly title = inject(Title);
  readonly #medicationService = inject(MedicationService);
  readonly #router = inject(Router);
  medication_id = input<string>('');
  medication$ = signal<Medication | null>(null);
  reviews$ = signal<Review[]>([]);
  imageUrl$ = signal<string | null>(null);

  ngOnInit() {
    if (this.medication_id()) {
      this.getMedicationById(this.medication_id());
      this.getReviews(this.medication_id());
    }
    this.title.setTitle('Medication Reviews');
  }

  getMedicationById(medication_id: string) {
    this.#medicationService.getMedicationById(medication_id).subscribe({
      next: response => {
        this.medication$.set(response.data);
        if (response.data.image && response.data.image._id) {
          this.#medicationService.getMedicationImageById(response.data.image._id).subscribe({
            next: blob => {
              const url = URL.createObjectURL(blob);
              this.imageUrl$.set(url);
            },
            error: () => this.#router.navigate(['/medications', 'list'])
          });
        }
      },
      error: () => this.#router.navigate(['/medications', 'list'])
    });
  }

  getReviews(medicationId: string) {
    this.#medicationService.getMedicationReviews(medicationId).subscribe({
      next: response => this.reviews$.set(response.data),
      error: () => this.#router.navigate(['/medications', 'list'])
    });
  }
}
