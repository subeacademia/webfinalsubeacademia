import { Injectable, inject } from '@angular/core';
import { Auth, User, authState, signInWithEmailAndPassword, signOut } from '@angular/fire/auth';
import { Observable, of } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthCoreService {
  private readonly auth = inject(Auth);

  readonly authState$: Observable<User | null> = authState(this.auth).pipe(shareReplay(1));
  readonly isLoggedIn$: Observable<boolean> = this.authState$.pipe(map(u => !!u));

  // Admin mínimo por email permitido (ajusta el listado)
  private readonly allowedAdmins = new Set<string>(['bruno@subeia.tech']);

  readonly isAdmin$: Observable<boolean> = this.authState$.pipe(
    map(u => !!u?.email && this.allowedAdmins.has(u.email!)),
    shareReplay(1)
  );

  // Lógica básica de login/logout sin depender de guards ni router
  async loginWithEmailPassword(email: string, password: string) {
    const cred = await signInWithEmailAndPassword(this.auth, email, password);
    return cred.user;
  }

  async logout(): Promise<void> { await signOut(this.auth); }
}

