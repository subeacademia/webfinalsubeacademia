import { DOCUMENT } from '@angular/common';
import { Inject, Injectable, Signal, computed, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';

type Language = 'es' | 'en' | 'pt';

export interface Translations {
  [key: string]: string | Translations;
}

function getNestedTranslation(dictionary: Translations, key: string): string | undefined {
  const parts = key.split('.');
  let current: unknown = dictionary;
  for (const part of parts) {
    if (typeof current !== 'object' || current === null) return undefined;
    const asRecord = current as Record<string, unknown>;
    current = asRecord[part];
  }
  return typeof current === 'string' ? current : undefined;
}

@Injectable({ providedIn: 'root' })
export class I18nService {
  private readonly supportedLanguages: ReadonlySet<Language> = new Set(['es', 'en', 'pt']);

  private readonly currentLanguageSignal = signal<Language>('es');
  private readonly languageDictionariesCache = new Map<Language, Translations>();
  private readonly currentDictionarySignal = signal<Translations>({});

  // Exponer señales de solo lectura
  readonly currentLang: Signal<Language> = computed(() => this.currentLanguageSignal());
  readonly currentDictionary: Signal<Translations> = computed(() => this.currentDictionarySignal());
  readonly currentLang$ = toObservable(this.currentLang);

  constructor(@Inject(DOCUMENT) private readonly documentRef: Document) {}

  async setLang(lang: Language): Promise<void> {
    const target: Language = this.supportedLanguages.has(lang) ? lang : 'es';
    if (this.currentLanguageSignal() === target && this.currentDictionarySignal() && Object.keys(this.currentDictionarySignal()).length > 0) {
      this.setDocumentLangAndDir(target);
      return;
    }

    this.currentLanguageSignal.set(target);
    this.setDocumentLangAndDir(target);
    await this.ensureLoaded(target);
    this.currentDictionarySignal.set(this.languageDictionariesCache.get(target) ?? {});
  }

  private setDocumentLangAndDir(lang: Language) {
    this.documentRef.documentElement.lang = lang;
    const dir = 'ltr';
    this.documentRef.body.setAttribute('dir', dir);
  }

  async ensureLoaded(lang: Language): Promise<void> {
    if (this.languageDictionariesCache.has(lang)) return;
    const url = `/assets/i18n/${lang}.json`;
    const response = await fetch(url);
    if (!response.ok) {
      this.languageDictionariesCache.set(lang, {});
      return;
    }
    const json = (await response.json()) as Translations;
    this.languageDictionariesCache.set(lang, json);
  }

  translate(key: string): string {
    const dict = this.currentDictionarySignal();
    const found = getNestedTranslation(dict, key);
    if (typeof found === 'string') return found;
    // Fallback: intentar en ES si el idioma actual no lo contiene
    const fallback = this.languageDictionariesCache.get('es');
    const fallbackFound = fallback ? getNestedTranslation(fallback, key) : undefined;
    return typeof fallbackFound === 'string' ? fallbackFound : key;
  }

  // Alias solicitado: getTranslations(key)
  getTranslations(key: string): string {
    return this.translate(key);
  }
}

