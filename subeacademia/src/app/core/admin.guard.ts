import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { map } from 'rxjs/operators';
import { AuthCoreService } from './auth-core.service';

export const AdminGuard: CanActivateFn = () => {
  const auth = inject(AuthCoreService);
  const router = inject(Router);
  return auth.isAdmin$.pipe(
    map((allowed) => {
      // eslint-disable-next-line no-console
      console.info('[Guard] Admin', allowed);
      return allowed ? true : router.createUrlTree(['/']);
    })
  );
};

