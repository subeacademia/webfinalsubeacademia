import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';

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
    return this.http.post(this.apiUrl, prompt, { headers });
  }
}


