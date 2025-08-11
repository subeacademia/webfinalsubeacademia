import { Injectable, inject } from '@angular/core';
import { Auth, User, authState, signInWithEmailAndPassword, signOut } from '@angular/fire/auth';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthCoreService {
  private readonly auth = inject(Auth, { optional: true });

  readonly authState$: Observable<User | null> = this.auth ? authState(this.auth).pipe(shareReplay(1)) : new Observable<User | null>((obs) => { obs.next(null); obs.complete(); });
  readonly isLoggedIn$: Observable<boolean> = this.authState$.pipe(map(u => !!u));

  // Lista de admins declarada en environment
  private readonly allowedAdmins = new Set<string>(environment.adminEmails || []);

  readonly isAdmin$: Observable<boolean> = this.authState$.pipe(
    map(u => !!u?.email && this.allowedAdmins.has(u.email!)),
    shareReplay(1)
  );

  /** Versión síncrona usada por guards para evitar re-suscripciones innecesarias */
  isAdminSync(): boolean {
    const current = (this.auth as any)?.currentUser as User | null;
    const email = current?.email ?? null;
    return !!email && this.allowedAdmins.has(email);
  }

  // Lógica básica de login/logout sin depender de guards ni router
  async loginWithEmailPassword(email: string, password: string) {
    if (!this.auth) throw new Error('Auth no disponible');
    const cred = await signInWithEmailAndPassword(this.auth, email, password);
    return cred.user;
  }

  async logout(): Promise<void> { if (this.auth) await signOut(this.auth); }
}

