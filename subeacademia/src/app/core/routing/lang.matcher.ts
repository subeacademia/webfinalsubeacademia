import { UrlMatchResult, UrlSegment } from '@angular/router';

export function langMatcher(segments: UrlSegment[]): UrlMatchResult | null {
  if (!segments.length) return null;
  const first = segments[0].path;
  if (first === 'es' || first === 'en' || first === 'pt') {
    return {
      consumed: [segments[0]],
      posParams: { lang: segments[0] }
    };
  }
  return null;
}

