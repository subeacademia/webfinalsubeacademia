import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GenerativeAiService {
  private http = inject(HttpClient);
  // La URL apunta a la ruta que configuramos en firebase.json
  private apiUrl = '/api/generate';

  constructor() {}

  generateContent(prompt: string): Observable<string> {
    console.log('Enviando prompt a la Cloud Function:', prompt);

    // Hacemos una solicitud POST a nuestra Cloud Function
    return this.http.post<{ response: string }>(this.apiUrl, { prompt }).pipe(
      map(res => res.response)
    );
  }
}
