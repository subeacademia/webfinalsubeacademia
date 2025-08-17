import { Injectable, inject } from '@angular/core';
import { User } from '@angular/fire/auth';
import { Observable } from 'rxjs';
import { AuthCoreService } from '../auth-core.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly core = inject(AuthCoreService);

  readonly currentUser$: Observable<User | null> = this.core.authState$;
  readonly user$: Observable<User | null> = this.core.authState$; // Alias para compatibilidad
  readonly isAdmin$: Observable<boolean> = this.core.isAdmin$;
  readonly isLoggedIn$: Observable<boolean> = this.core.isLoggedIn$;

  async loginWithEmailPassword(email: string, password: string): Promise<User> {
    return this.core.loginWithEmailPassword(email, password);
  }

  async loginWithGoogle(): Promise<User> {
    return this.core.loginWithGoogle();
  }

  logout(): Promise<void> { 
    return this.core.logout(); 
  }
}

