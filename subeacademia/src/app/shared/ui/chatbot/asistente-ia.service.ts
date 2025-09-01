import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError, of } from 'rxjs';
import { catchError, timeout, retry } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AsistenteIaService {
  private readonly apiUrl = 'https://apisube-smoky.vercel.app/api/azure/generate';

  private readonly asistenteAbiertoSubject = new BehaviorSubject<boolean>(false);
  readonly asistenteAbierto$ = this.asistenteAbiertoSubject.asObservable();

  constructor(private readonly http: HttpClient) {}

  setAsistenteAbierto(abierto: boolean): void {
    this.asistenteAbiertoSubject.next(abierto);
  }

  generarTextoAzure(prompt: unknown): Observable<unknown> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    
    return this.http.post(this.apiUrl, prompt, { headers }).pipe(
      timeout(25000), // 25 segundos de timeout
      retry(1), // Reintentar una vez
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Error desconocido';
    
    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del lado del servidor
      errorMessage = `Código de error: ${error.status}\nMensaje: ${error.message}`;
    }
    
    console.error('Error en el servicio de IA:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}


