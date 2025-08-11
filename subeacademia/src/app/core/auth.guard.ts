import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { map } from 'rxjs/operators';
import { AuthCoreService } from './auth-core.service';

export const AuthGuard: CanActivateFn = () => {
  const auth = inject(AuthCoreService);
  const router = inject(Router);
  return auth.isLoggedIn$.pipe(
    map((ok) => {
      // eslint-disable-next-line no-console
      console.info('[Guard] Auth', ok);
      return ok ? true : router.createUrlTree(['/login']);
    })
  );
};

