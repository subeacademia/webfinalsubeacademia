import { Injectable, inject } from '@angular/core';
import { Auth, User, authState, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, signOut } from '@angular/fire/auth';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthCoreService {
  private readonly auth = inject(Auth);

  readonly authState$: Observable<User | null> = authState(this.auth).pipe(shareReplay(1));
  readonly isLoggedIn$: Observable<boolean> = this.authState$.pipe(map(u => !!u));

  // Propiedad para acceso directo al usuario actual
  get currentUser(): User | null {
    return this.auth.currentUser;
  }

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
    const isAdmin = !!email && this.allowedAdmins.has(email);
    
    // Logging para debug
    console.log('🔐 AuthCoreService.isAdminSync():', {
      currentUser: current,
      email: email,
      allowedAdmins: Array.from(this.allowedAdmins),
      isAdmin: isAdmin
    });
    
    return isAdmin;
  }

  // Lógica básica de login/logout sin depender de guards ni router
  async loginWithEmailPassword(email: string, password: string) {
    if (!this.auth) throw new Error('Auth no disponible');
    const cred = await signInWithEmailAndPassword(this.auth, email, password);
    return cred.user;
  }

  async loginWithGoogle(): Promise<User> {
    if (!this.auth) throw new Error('Auth no disponible');
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(this.auth, provider);
    return result.user;
  }

  async logout(): Promise<void> { if (this.auth) await signOut(this.auth); }
}

