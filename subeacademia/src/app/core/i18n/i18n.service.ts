import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class I18nService {
  constructor(@Inject(DOCUMENT) private readonly documentRef: Document) {}

  setDocumentLang(lang: 'es' | 'en' | 'pt') {
    this.documentRef.documentElement.lang = lang;
  }
}

