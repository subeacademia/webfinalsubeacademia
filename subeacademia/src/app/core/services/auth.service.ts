import { Injectable, inject } from '@angular/core';
import { Auth, User, authState, signInWithEmailAndPassword, signOut } from '@angular/fire/auth';
import { environment } from '../../../environments/environment';
import { map, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly auth: Auth = inject(Auth);

  readonly currentUser$: Observable<User | null> = authState(this.auth);

  readonly isAdmin$: Observable<boolean> = this.currentUser$.pipe(
    map(user => {
      const email = user?.email?.toLowerCase() ?? '';
      return environment.adminEmails.map(e => e.toLowerCase()).includes(email);
    })
  );

  async loginWithEmailPassword(email: string, password: string): Promise<User> {
    const credential = await signInWithEmailAndPassword(this.auth, email, password);
    const user = credential.user;
    const isAllowed = environment.adminEmails.map(e => e.toLowerCase()).includes((user.email || '').toLowerCase());
    if (!isAllowed) {
      await signOut(this.auth);
      throw new Error('Acceso restringido: solo administradores.');
    }
    return user;
  }

  logout(): Promise<void> {
    return signOut(this.auth);
  }
}

