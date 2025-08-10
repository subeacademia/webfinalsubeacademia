import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {
  Auth,
  User,
  authState,
  browserLocalPersistence,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
} from '@angular/fire/auth';
import { environment } from '../../../environments/environment';
import { map, shareReplay } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly auth: Auth = inject(Auth);
  private readonly platformId: Object = inject(PLATFORM_ID);

  readonly user$: Observable<User | null> = authState(this.auth).pipe(shareReplay(1));
  readonly isAdmin$: Observable<boolean> = this.user$.pipe(
    map((u) => !!u?.email && environment.adminEmails.includes(u.email))
  );

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      setPersistence(this.auth, browserLocalPersistence).catch(() => {});
    }
  }

  async login(email: string, password: string): Promise<void> {
    await signInWithEmailAndPassword(this.auth, email, password);
  }

  async logout(): Promise<void> {
    await signOut(this.auth);
  }

  getCurrentEmail(): string | null {
    return this.auth.currentUser?.email ?? null;
  }
}

