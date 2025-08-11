import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, firstValueFrom, throwError } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class IaService {
  private readonly http = inject(HttpClient);
  // Endpoint fijo pedido por el usuario, sin usar environments
  private readonly azureGenerateUrl = 'https://apisube-smoky.vercel.app/api/azure/generate';
  // Alias solicitado como apiUrl
  private readonly apiUrl = this.azureGenerateUrl;

  // Compatibilidad: ask() ahora usa el endpoint de Azure directo
  ask<TRequest = unknown, TResponse = unknown>(payload: TRequest): Observable<TResponse> {
    return this.generateWithAzure<TResponse>(payload as any);
  }

  async askOnce<TRequest = unknown, TResponse = unknown>(payload: TRequest): Promise<TResponse> {
    return await firstValueFrom(this.ask<TRequest, TResponse>(payload));
  }

  /**
   * Llama a la API de Azure Function para generación de texto
   * URL fija: https://apisube-smoky.vercel.app/api/azure/generate
   */
  generateWithAzure<TResponse = { content?: string; text?: string; message?: string }>(
    body: { prompt: string; system?: string; temperature?: number; maxTokens?: number; [k: string]: unknown },
    options?: { timeoutMs?: number }
  ): Observable<TResponse> {
    const url = this.azureGenerateUrl;
    const t = options?.timeoutMs ?? 30000;
    return this.http.post<TResponse>(url, body, { withCredentials: false }).pipe(
      timeout(t),
      catchError((err: any) => {
        const msg = err?.error?.error || err?.message || 'Error llamando a Azure Generate';
        return throwError(() => new Error(msg));
      })
    );
  }

  // Implementación solicitada por el usuario
  generarTextoAzure(prompt: any): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(this.apiUrl, prompt, { headers });
  }

  async generarTextoAzureOnce(payload: any): Promise<any> {
    return await firstValueFrom(this.generarTextoAzure(payload));
  }

  async generateWithAzureOnce<TResponse = { content?: string; text?: string; message?: string }>(
    body: { prompt: string; system?: string; temperature?: number; maxTokens?: number; [k: string]: unknown },
    options?: { timeoutMs?: number }
  ): Promise<TResponse> {
    return await firstValueFrom(this.generateWithAzure<TResponse>(body, options));
  }
}

