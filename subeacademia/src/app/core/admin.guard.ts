import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { inject } from '@angular/core';
import { map } from 'rxjs/operators';
import { AuthCoreService } from './auth-core.service';
import { Observable } from 'rxjs';

export const AdminGuard: CanActivateFn = (): boolean | UrlTree | Observable<boolean | UrlTree> => {
  const auth = inject(AuthCoreService);
  const router = inject(Router);
  return auth.authState$.pipe(
    map((user) => {
      if (!user) {
        return router.createUrlTree(['/admin/login']);
      }
      return auth.isAdminSync()
        ? true
        : router.createUrlTree(['/admin/login'], { queryParams: { denied: 1 } });
    })
  );
};

