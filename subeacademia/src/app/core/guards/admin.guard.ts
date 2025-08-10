import { CanMatchFn, Router, UrlTree } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { map, take } from 'rxjs/operators';

export const adminGuard: CanMatchFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isAdmin$.pipe(
    take(1),
    map((isAdmin) => {
      if (isAdmin) {
        return true;
      }
      const tree: UrlTree = router.parseUrl('/admin/login');
      return tree;
    })
  );
};

