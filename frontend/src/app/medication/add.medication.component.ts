import { Component, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MedicationService } from './medication.service';
import { ToastrService } from 'ngx-toastr';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { Router } from '@angular/router';
import { Medication } from './medication.type';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-add-medication',
  standalone: true,
  imports: [ReactiveFormsModule, MatButtonModule, MatInputModule],
  template: `
    <div class="page-container">
      <div class="form-container">
        <h1>Add Medication</h1>
        <form [formGroup]="form" (ngSubmit)="addMedicationHandler()">
          <mat-form-field class="input-field">
            <input matInput placeholder="Enter drug name" [formControl]="name" />
            @if(name.invalid && (name.dirty || name.touched)){
               @if(name.hasError('required')){<mat-error>Name is <strong>required</strong></mat-error>}
               @if(name.hasError('name_exist')){<mat-error>Medication name already <strong>exist</strong></mat-error>}
            }
          </mat-form-field>
          <mat-form-field class="input-field">
            <input matInput placeholder="Enter generic name" formControlName="generic_name" />
            @if(generic_name.invalid && (generic_name.dirty || generic_name.touched)){
              @if(generic_name.hasError('required')){<mat-error>Generic name is <strong>required</strong></mat-error>}
            }
          </mat-form-field>
          <mat-form-field class="input-field">
            <input matInput placeholder="Availability" formControlName="availability" />
            @if(availability.invalid && (availability.dirty || availability.touched)){
              @if(availability.hasError('required')){
                <mat-error>Availability is <strong>required</strong></mat-error>}
              @if(availability.hasError('invalidAvailability')){
                <mat-error>Please enter <strong>Prescription or OTC</strong></mat-error>}
            }
          </mat-form-field>
          <mat-form-field class="input-field">
            <input matInput placeholder="Medication Class" formControlName="medication_class" />
            @if(medication_class.invalid && (medication_class.dirty || medication_class.touched)){
              @if(medication_class.hasError('required')){<mat-error>Medication class is <strong>required</strong></mat-error>}
            }
          </mat-form-field>
          <input type="file" (change)="onFileChange($event)" />
          <button mat-flat-button color="accent" type="submit" class="button" [disabled]="form.invalid">Add</button>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .page-container {
      height: 65vh;
      overflow-y: auto;
      background-color: #f0f0f0;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .form-container {
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
    form {
      display: flex;
      flex-direction: column;
      gap: 16px;
      align-items: center;
    }
    .input-field {
      width: 100%;
      max-width: 450px;
    }
    button {
      width: 100%;
      max-width: 450px;
      border-radius: 8px;
      background-color: #005a4f !important;
      color: white;
    }
    button:disabled {
      background-color: #aaa !important;
    }
  `]
})
export class AddMedicationComponent {
  readonly title = inject(Title);
  readonly #medicationService = inject(MedicationService);
  readonly #notification = inject(ToastrService);
  readonly #router = inject(Router);
  file!: File;

  constructor() {
    this.title.setTitle('Add Medication');
  }

  form = inject(FormBuilder).nonNullable.group({
    name: ['', {
      validators: [Validators.required],
      asyncValidators: this.checkMedicationNameExist.bind(this),
      updateOn: 'blur'
    }],
    generic_name: ['', Validators.required],
    availability: ['', [Validators.required, this.availabilityValidator()]],
    medication_class: ['', Validators.required],
  });

  get name() { return this.form.controls.name; }
  get generic_name() { return this.form.controls.generic_name; }
  get availability() { return this.form.controls.availability; }
  get medication_class() { return this.form.controls.medication_class; }

  addMedicationHandler() {
    const medication = this.form.value as Medication;
    const formData = new FormData();
    formData.append('name', medication.name);
    formData.append('generic_name', medication.generic_name);
    formData.append('medication_class', medication.medication_class);
    formData.append('availability', medication.availability);
    if (this.file) {
      formData.append('medication_image', this.file);
    }
    this.#medicationService.createMedication(formData).subscribe({
      next: response => {
        if (response.success) {
          this.#notification.success('Medication added successfully');
          this.#router.navigate(['/medications', 'list']);
        }
      },
      error: () => this.#notification.error('Failed to add medication, please try again.')
    });
  }

  onFileChange(event: Event) {
    const inputFile = event.target as HTMLInputElement;
    if (inputFile.files!.length > 0) {
      this.file = inputFile.files![0];
    }
  }

  availabilityValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const validValues = ['Prescription', 'OTC'];
      return validValues.includes(control.value) ? null : { invalidAvailability: true };
    };
  }

  checkMedicationNameExist(control: AbstractControl): Observable<null | Record<string, boolean>> {
    return this.#medicationService.verfiy_medication_name_exit({ name: this.name.value })
  }

}
