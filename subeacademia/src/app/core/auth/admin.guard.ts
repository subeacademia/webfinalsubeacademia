import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { map, tap } from 'rxjs/operators';
import { AuthService } from './auth.service';

export const AdminGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.isAdmin$.pipe(
    map((isAdmin) => !!isAdmin),
    tap((ok) => {
      if (!ok) router.navigate(['/admin/login'], { queryParams: { denied: 1 } });
    })
  );
};

