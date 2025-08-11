import { inject, Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { CanActivate, CanMatchFn, ResolveFn, Route, Router, UrlSegment, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { isPlatformServer } from '@angular/common';
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

@Injectable({ providedIn: 'root' })
export class LanguageGuard implements CanActivate {
  constructor(
    private readonly router: Router,
    @Inject(PLATFORM_ID) private readonly platformId: Object,
  ) {}

  canActivate(_route: ActivatedRouteSnapshot, _state: RouterStateSnapshot): boolean {
    // En SSR no redirigimos; dejamos continuar
    if (isPlatformServer(this.platformId)) {
      return true;
    }

    try {
      const browserLangFull = navigator.language || (navigator as any).userLanguage || 'es';
      const browserLang = String(browserLangFull).slice(0, 2).toLowerCase();
      const target = SUPPORTED.has(browserLang) ? browserLang : 'es';
      void this.router.navigate([`/${target}`]);
    } catch {
      void this.router.navigate(['/es']);
    }

    // Cancelar la navegación actual; el guard redirige
    return false;
  }
}

// Resolver para precargar diccionario antes de activar la ruta
export const languageResolver: ResolveFn<boolean> = async (route) => {
  const i18n = inject(I18nService);
  const lang = (route.paramMap.get('lang') ?? 'es') as 'es' | 'en' | 'pt';
  await i18n.ensureLoaded(lang);
  await i18n.setLang(lang);
  return true;
};

