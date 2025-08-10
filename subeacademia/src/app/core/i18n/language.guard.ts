import { inject } from '@angular/core';
import { CanMatchFn, Route, Router, UrlSegment } from '@angular/router';

const SUPPORTED = new Set(['es', 'en', 'pt']);

export const languageGuard: CanMatchFn = (
  route: Route,
  segments: UrlSegment[]
) => {
  const router = inject(Router);
  const first = segments[0]?.path ?? 'es';
  if (!SUPPORTED.has(first)) {
    router.navigate(['es']);
    return false;
  }
  return true;
};

