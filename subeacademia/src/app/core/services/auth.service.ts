import { Injectable, inject } from '@angular/core';
import { User } from '@angular/fire/auth';
import { Observable } from 'rxjs';
import { AuthCoreService } from '../auth-core.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly core = inject(AuthCoreService);

  readonly currentUser$: Observable<User | null> = this.core.authState$;
  readonly isAdmin$: Observable<boolean> = this.core.isAdmin$;

  async loginWithEmailPassword(email: string, password: string): Promise<User> {
    return this.core.loginWithEmailPassword(email, password);
  }

  logout(): Promise<void> { return this.core.logout(); }
}

