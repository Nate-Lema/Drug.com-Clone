import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MedicationService } from './medication.service';
import { Medication } from './medication.type';
import { RouterLink } from '@angular/router';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container">
      <div class="buttons-container">
        @for (letter of alphabet; track $index) {
          <button (click)="getMedicationsByLetter(letter)">
            {{ letter }}
          </button>
        }
      </div>
      <div class="medications-container">
        <h2>Medications starting with "{{ selectedLetter$() }}"</h2>
        @if (medications$().length > 0) {
          <ul>
            @for (medication of medications$(); track $index) {
              <li><a [routerLink]="['/detail', medication._id]">{{ medication.name }}</a></li>
            }
          </ul>
        } @else {
          <p>No medications found for this letter.</p>
        }
      </div>
    </div>
  `,
  styles: `
    .container {
      padding: 20px;
      text-align: center;
    }
    .buttons-container {
      margin-bottom: 20px;
    }
    .buttons-container button {
      margin: 2px;
      padding: 10px 15px;
      background-color: #00796b;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 16px;
    }
    .buttons-container button:hover {
      background-color: #005a4f;
    }
    .medications-container {
      margin-top: 20px;
    }
    .medications-container h2 {
      color: #333;
    }
    .medications-container ul {
      list-style-type: none;
      padding: 0;
    }
    .medications-container li {
      padding: 5px 0;
    }
    .medications-container li a {
      text-decoration: none;
      color: #00796b;
      font-size: 18px;
      font-weight: bold;
      transition: color 0.3s ease, background-color 0.3s ease;
      padding: 5px 10px;
      border-radius: 4px;
      display: inline-block;
    }
    .medications-container li a:hover {
      color: white;
      background-color: #00796b;
    }
  `,
})
export class ListMedicationComponent implements OnInit {
  readonly title = inject(Title)
  readonly #medicationService = inject(MedicationService);
  alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  medications$ = signal<Medication[]>([]);
  userMedications$ = signal<Medication[]>([]);
  selectedLetter$ = signal('A');

  ngOnInit() {
    this.getMedicationsByLetter(this.selectedLetter$());
    this.title.setTitle('List Medication');
  }

  getMedicationsByLetter(letter: string) {
    this.selectedLetter$.set(letter);
    this.#medicationService.getMedicationsByFirstLetter(letter).subscribe({
      next: (medications) => {
        this.medications$.set(medications.data);
      },
      error: () => {
        this.medications$.set([]);
      },
    });
  }
}
