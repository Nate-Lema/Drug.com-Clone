import { Component, inject, input, Input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormsModule, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MedicationService } from './medication.service';
import { Router, RouterLink } from '@angular/router';
import { Medication } from './medication.type';
import { ToastrService } from 'ngx-toastr';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-update',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink, MatButtonModule, MatInputModule],
  template: `
    <div class="update-container">
      <h1>Update Medication</h1>
      <form [formGroup]="form" (ngSubmit)="updateMedication()">
        <mat-form-field class="input-field">
          <input matInput placeholder="Name" formControlName="name">
          @if(name.invalid && (name.dirty || name.touched)){
             @if(name.hasError('required')){<mat-error>Name is <strong>required</strong></mat-error>}
          }
        </mat-form-field>
        <mat-form-field class="input-field">
          <input matInput placeholder="Generic Name" formControlName="generic_name">
          @if(generic_name.invalid && (generic_name.dirty || generic_name.touched)){
            @if(generic_name.hasError('required')){<mat-error>Generic name is <strong>required</strong></mat-error>}
          }
        </mat-form-field>
        <mat-form-field class="input-field">
          <input matInput placeholder="Medication Class" formControlName="medication_class">
          @if(medication_class.invalid && (medication_class.dirty || medication_class.touched)){
            @if(medication_class.hasError('required')){<mat-error>Medication class is <strong>required</strong></mat-error>}
          }
        </mat-form-field>
        <mat-form-field class="input-field">
          <input matInput placeholder="Availability" formControlName="availability">
          @if(availability.invalid && (availability.dirty || availability.touched)){
            @if(availability.hasError('required')){
              <mat-error>Availability is <strong>required</strong></mat-error>}
              @if(availability.hasError('invalidAvailability')){
                <mat-error>Please enter <strong>Prescription or OTC</strong></mat-error>}
          }
        </mat-form-field>
        <input type="file" (change)="onFileChange($event)" />
        <button mat-flat-button color="accent" type="submit" [disabled]="form.invalid">Update</button>
      </form>
    </div>
  `,
  styles: [`
    .update-container {
      margin: 20px;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      border: 1px solid #ddd;
      border-radius: 4px;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    }
    h1 {
      text-align: center;
      color: #00796b;
    }
    form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .input-field {
      width: 100%;
    }
    input[type="file"] {
      margin: 10px 0;
    }
    button {
      width: 100%;
      padding: 10px;
      background-color: #00796b!important;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 16px;
    }
    button:disabled {
      background-color: #aaa !important;
    }
  `]
})
export class UpdateComponent implements OnInit {
  readonly #medicationService = inject(MedicationService);
  readonly #router = inject(Router);
  medication_id = input<string>('');
  medication$ = signal<Medication | null>(null);
  #notification = inject(ToastrService);
  file!: File;

  form = inject(FormBuilder).nonNullable.group({
    name: ['', Validators.required],
    generic_name: ['', Validators.required],
    availability: ['', [Validators.required, this.availabilityValidator()]],
    medication_class: ['', Validators.required],
  });

  get name() { return this.form.controls.name; }
  get generic_name() { return this.form.controls.generic_name; }
  get availability() { return this.form.controls.availability; }
  get medication_class() { return this.form.controls.medication_class; }

  ngOnInit() {
    if (this.medication_id) {
      this.#medicationService.getMedicationById(this.medication_id()).subscribe({
        next: response => {
          this.medication$.set(response.data);
          this.form.patchValue(response.data);
        },
        error: err => {
          console.error('Error fetching medication:', err);
          this.#router.navigate(['/medications', 'list']);
        }
      });
    }
  }

  onFileChange(event: Event) {
    const currFile = event.target as HTMLInputElement;
    if (currFile.files!.length > 0) {
      this.file = currFile.files![0];
    }
  }

  updateMedication() {
    if (this.form.valid && this.medication$()) {
      const updatedMedication = this.form.value as Medication;

      const formData = new FormData();
      formData.append('name', updatedMedication.name);
      formData.append('generic_name', updatedMedication.generic_name);
      formData.append('medication_class', updatedMedication.medication_class);
      formData.append('availability', updatedMedication.availability);
      if (this.file) {
        formData.append('medication_image', this.file);
      }

      this.#medicationService.updateMedicationById(formData, this.medication$()!._id).subscribe({
        next: response => {
          if (response.success) {
            this.#notification.success('Medication Updated Successfully!');
            this.#router.navigate(['/medications', 'list']);
          } else {
            this.#notification.error('Failed to Update Medication');
          }
        },
        error: err => {
          console.error('Error updating medication:', err);
          this.#notification.error('Failed to Update Medication');
        }
      });
    }
  }

  availabilityValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const validValues = ['Prescription', 'OTC'];
      return validValues.includes(control.value) ? null : { invalidAvailability: true };
    };
  }
}
