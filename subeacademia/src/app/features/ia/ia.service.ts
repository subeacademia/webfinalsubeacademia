import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable, firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class IaService {
  private readonly http = inject(HttpClient);
  private readonly endpointUrl: string = (environment.backendIaUrl || '').trim();

  ask<TRequest = unknown, TResponse = unknown>(payload: TRequest): Observable<TResponse> {
    if (!this.endpointUrl) {
      throw new Error('backendIaUrl no configurado en environment');
    }
    return this.http.post<TResponse>(this.endpointUrl, payload, { withCredentials: false });
  }

  async askOnce<TRequest = unknown, TResponse = unknown>(payload: TRequest): Promise<TResponse> {
    return await firstValueFrom(this.ask<TRequest, TResponse>(payload));
  }
}

