import { DOCUMENT } from '@angular/common';
import { Inject, Injectable, Signal, computed, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';

type Language = 'es' | 'en' | 'pt';

export interface Translations {
  [key: string]: string | Translations;
}

function getNestedTranslation(dictionary: Translations, key: string): string | undefined {
  // 1) Soporte para claves planas con puntos, ej: "chatbot.header_title"
  const direct = dictionary[key];
  if (typeof direct === 'string') return direct;

  // 2) Búsqueda anidada por partes separadas por punto
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
    this.currentLanguageSignal.set(target);
    this.setDocumentLangAndDir(target);
    // Forzar recarga del diccionario en cada cambio de idioma para evitar caché obsoleta durante desarrollo
    await this.ensureLoaded(target, true);
    this.currentDictionarySignal.set(this.languageDictionariesCache.get(target) ?? {});
  }

  private setDocumentLangAndDir(lang: Language) {
    this.documentRef.documentElement.lang = lang;
    const dir = 'ltr';
    this.documentRef.body.setAttribute('dir', dir);
  }

  async ensureLoaded(lang: Language, forceReload: boolean = false): Promise<void> {
    if (this.languageDictionariesCache.has(lang) && !forceReload) return;
    const win = (this.documentRef as any).defaultView as (Window & typeof globalThis) | undefined;
    if (!win) {
      // SSR: omitimos carga; el navegador la realizará en hidratación
      return;
    }
    const base = win.location?.origin || this.documentRef.baseURI || '/';
    const urlObj = new URL(`/assets/i18n/${lang}.json`, base);
    // Bust de caché: generar un valor nuevo en cada recarga forzada
    if (forceReload) {
      urlObj.searchParams.set('v', Date.now().toString());
    }
    const url = urlObj.toString();
    try {
      const response = await win.fetch(url);
      if (!response.ok) {
        this.languageDictionariesCache.set(lang, {});
        return;
      }
      const json = (await response.json()) as Translations;
      this.languageDictionariesCache.set(lang, json);
    } catch {
      this.languageDictionariesCache.set(lang, {});
    }
  }

  translate(key: string): string {
    const dict = this.currentDictionarySignal();
    let found = getNestedTranslation(dict, key);
    // Compatibilidad: algunas traducciones históricas usaron 'produtos'
    if (typeof found === 'undefined' && key.startsWith('productos.')) {
      const aliasKey = key.replace(/^productos\./, 'produtos.');
      found = getNestedTranslation(dict, aliasKey);
    }
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

