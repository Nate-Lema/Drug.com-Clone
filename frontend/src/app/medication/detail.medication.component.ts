import { Component, effect, inject, input, OnInit, signal } from '@angular/core';
import { MedicationService } from './medication.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Medication, Review } from './medication.type';
import { AuthService } from '../auth/auth.service';
import { DatePipe } from '@angular/common';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-detail-medication',
  standalone: true,
  imports: [RouterLink, DatePipe],
  template: `
    <div class="page-container">
      <div class="detail-container">
        <h1>Medication Detail</h1>
        @if(medication$()) {
          <div class="medication-info">
            <h2>{{ medication$()?.name }}</h2>
            <p><strong>Generic Name:</strong> {{ medication$()?.generic_name }}</p>
            <p><strong>Class:</strong> {{ medication$()?.medication_class }}</p>
            <p><strong>Availability:</strong> {{ medication$()?.availability }}</p>
            @if(imageUrl$()) {
              <img [src]="imageUrl$()" alt="{{ medication$()?.name }}" class="medication-image">
            }
          </div>
          <div class="reviews">
            @if(reviews$().length === 0) {
              <div>No reviews yet.</div>
            }@else{
              <a [routerLink]="['/medications',medication$()?._id, 'reviews',]" class="review-link">
                 <p>View reviews for this medication</p>
              </a>
            }
          </div>
          @if(authService.is_logged_in()) {
            <div class="actions">
              <button [routerLink]="['/medications', medication$()?._id, 'reviews', 'add']">Add Review</button>
            </div>
          }
          @if(medication$()?.added_by?.user_id === authService.$state()._id){
            <div class="actions">
              <button [routerLink]="['/medications', 'update', medication$()?._id]">Update</button>
              <button (click)="deleteMedication(medication$()!._id)">Delete</button>
            </div>
          } 
        }
      </div>
    </div>
  `,
  styles: [`
    .page-container {
      height: 110vh;
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
      max-height: 95vh;
      overflow-y: auto;
    }
    h1 {
      text-align: center;
      color: #00796b;
      font-size: 2em;
      margin-bottom: 20px;
    }
    .medication-info {
      margin-top: 20px;
      background-color: #fff;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.05);
    }
    .medication-info h2 {
      margin-bottom: 10px;
      color: #333;
      font-size: 1.5em;
    }
    .medication-info p {
      margin: 5px 0;
      color: #555;
      font-size: 1.1em;
    }
    .medication-image {
      width: 100%;
      max-width: 300px;
      height: auto;
      display: block;
      margin: 20px auto;
      border-radius: 8px;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    }
    .actions {
      margin-top: 20px;
      display: flex;
      justify-content: space-between;
      flex-wrap: wrap;
    }
    button {
      padding: 10px 20px;
      background-color: #00796b;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 16px;
      margin: 5px 0;
      transition: background-color 0.3s;
    }
    button:hover {
      background-color: #005a4f;
    }
    .reviews {
      margin-top: 20px;
      background-color: #fff;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.05);
    }
    .reviews h3 {
      color: #333;
      margin-bottom: 10px;
      font-size: 1.5em;
    }
    .reviews p {
      margin: 5px 0;
      color: #555;
      font-size: 1.1em;
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
export class DetailMedicationComponent {
  readonly title = inject(Title)
  readonly #medicationService = inject(MedicationService);
  authService = inject(AuthService);
  readonly #router = inject(Router);
  medication$ = signal<Medication | null>(null);
  reviews$ = signal<Review[]>([]);
  imageUrl$ = signal<string | null>(null);
  medication_id = input<string>('');



  ngOnInit() {
    if (this.medication_id()) {
      this.getMedicationById(this.medication_id());
      this.getReviews(this.medication_id());
    }
    this.title.setTitle('Detail Medication');
  }

  getMedicationById(medicationId: string) {
    this.#medicationService.getMedicationById(medicationId).subscribe({
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

  deleteMedication(medicationId: string) {
    if (this.medication$()) {
      this.#medicationService.deleteMedicationById(medicationId).subscribe({
        next: () => this.#router.navigate(['/medications', 'list']),
        error: () => alert('Failed to delete medication')
      });
    }
  }
}
