import { inject } from '@angular/core';
import { CanMatchFn, ResolveFn, Route, Router, UrlSegment } from '@angular/router';
import { I18nService } from './i18n.service';

const SUPPORTED = new Set(['es', 'en', 'pt']);

export const languageGuard: CanMatchFn = (
  route: Route,
  segments: UrlSegment[]
) => {
  const router = inject(Router);
  const i18n = inject(I18nService);
  const first = segments[0]?.path ?? 'es';
  if (!SUPPORTED.has(first)) {
    router.navigate(['es']);
    return false;
  }
  // Establecer idioma al entrar en una sección con :lang
  void i18n.setLang(first as 'es' | 'en' | 'pt');
  return true;
};

// Resolver para precargar diccionario antes de activar la ruta
export const languageResolver: ResolveFn<boolean> = async (route) => {
  const i18n = inject(I18nService);
  const lang = (route.paramMap.get('lang') ?? 'es') as 'es' | 'en' | 'pt';
  await i18n.ensureLoaded(lang);
  await i18n.setLang(lang);
  return true;
};

