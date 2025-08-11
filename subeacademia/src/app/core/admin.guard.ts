import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { inject, runInInjectionContext, createEnvironmentInjector } from '@angular/core';
import { map } from 'rxjs/operators';
import { AuthCoreService } from './auth-core.service';
import { Observable } from 'rxjs';

export const AdminGuard: CanActivateFn = (): boolean | UrlTree | Observable<boolean | UrlTree> => {
  const router = inject(Router);
  const auth = inject(AuthCoreService);
  // Evitar suscripción reactiva en el guard para no crear inyectores/zonas adicionales
  const isAdmin = auth.isAdminSync();
  if (isAdmin) return true;
  // Si no hay usuario, a login; si hay usuario pero no admin, a login con denied
  return auth.authState$.pipe(
    map((user) => {
      if (!user) return router.createUrlTree(['/admin/login']);
      return router.createUrlTree(['/admin/login'], { queryParams: { denied: 1 } });
    })
  );
};

