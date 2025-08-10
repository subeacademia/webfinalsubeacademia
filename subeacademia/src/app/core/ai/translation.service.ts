import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

type TranslateTo = 'en' | 'pt';

@Injectable({ providedIn: 'root' })
export class TranslationService {
  private http = inject(HttpClient);

  translate(body: { title: string; summary?: string; content: string; to: TranslateTo }) {
    return this.http.post<any>(`${environment.backendIaUrl}/translate`, body);
  }
}

