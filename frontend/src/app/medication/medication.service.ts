import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../environments/environment';
import { Medication, Review } from './medication.type';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MedicationService {
  readonly #http = inject(HttpClient)

  createMedication(formData: FormData) {
    return this.#http.post<{ success: boolean, data: Medication }>(`${environment.BACKEND_SERVER_URL}/medications`, formData);
  }

  getMedicationsByFirstLetter(firstLetter: string = "A") {
    return this.#http.get<{ success: boolean, data: Medication[] }>(`${environment.BACKEND_SERVER_URL}/medications?first_letter=${firstLetter}`);
  }

  updateMedicationById(formData: FormData, medication_id: string) {
    return this.#http.put<{ success: boolean; data: boolean }>(
      `${environment.BACKEND_SERVER_URL}/medications/${medication_id}`,
      formData
    );
  }

  getMedicationById(medication_id: string) {
    return this.#http.get<{ success: boolean, data: Medication }>(`${environment.BACKEND_SERVER_URL}/medications/${medication_id}`);
  }

  deleteMedicationById(medication_id: string) {
    return this.#http.delete<{ success: boolean, data: boolean }>(`${environment.BACKEND_SERVER_URL}/medications/${medication_id}`);
  }

  addMedicationReview(medication_id: string, review: Review) {
    return this.#http.post<{ success: boolean, data: string }>(`${environment.BACKEND_SERVER_URL}/medications/${medication_id}/reviews`, review);
  }

  getMedicationReviews(medication_id: string) {
    return this.#http.get<{ success: boolean, data: Review[] }>(`${environment.BACKEND_SERVER_URL}/medications/${medication_id}/reviews`);
  }

  updateMedicationReview(medication_id: string, review: Review) {
    return this.#http.put<{ success: boolean, data: boolean }
    >(`${environment.BACKEND_SERVER_URL}/medications/${medication_id}/reviews/${review._id}`, review);
  }

  getMedicationReviewById(medication_id: string, review_id: string) {
    return this.#http.get<{ success: boolean, data: Review }>(`${environment.BACKEND_SERVER_URL}/medications/${medication_id}/reviews/${review_id}`);
  }

  deleteMedicationReviewById(medication_id: string, review_id: string) {
    return this.#http.delete<{ success: boolean, data: boolean }>(`${environment.BACKEND_SERVER_URL}/medications/${medication_id}/reviews/${review_id}`);
  }

  getMedicationImageById(imageId: string): Observable<Blob> {
    return this.#http.get(`${environment.BACKEND_SERVER_URL}/medications/images/${imageId}`, { responseType: 'blob' });
  }

  verfiy_medication_name_exit(body: { name: string }) {
    return this.#http.post<null | Record<string, boolean>>(environment.BACKEND_SERVER_URL + '/medications/name/verify', body)
  }

}
