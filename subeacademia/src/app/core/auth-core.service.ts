import { Injectable, inject } from '@angular/core';
import { Auth, User, authState, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, signOut } from '@angular/fire/auth';
import { Observable, of } from 'rxjs';
import { map, shareReplay, switchMap, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { UserManagementService } from './services/user-management.service';
import { AppUser, hasPermission, isSuperUser } from './models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthCoreService {
  private readonly auth = inject(Auth);
  private readonly userManagement = inject(UserManagementService);
  private hasUpdatedLoginOnInit = false;

  readonly authState$: Observable<User | null> = authState(this.auth).pipe(shareReplay(1));
  readonly isLoggedIn$: Observable<boolean> = this.authState$.pipe(map(u => !!u));
  
  // Observable del usuario de la aplicación (con roles y permisos)
  readonly appUser$: Observable<AppUser | null> = this.authState$.pipe(
    switchMap(authUser => {
      if (!authUser?.email) return of(null);
      
      // Actualizar último login solo una vez al inicializar si hay sesión activa
      if (!this.hasUpdatedLoginOnInit) {
        this.hasUpdatedLoginOnInit = true;
        console.log('🔄 Detectando sesión existente, actualizando último login para:', authUser.email);
        this.userManagement.updateLastLogin(authUser.email).subscribe({
          next: () => console.log('✅ Último login actualizado automáticamente'),
          error: (error) => console.warn('⚠️ Error actualizando último login automático:', error)
        });
      }
      
      return this.userManagement.getUserByEmail(authUser.email).pipe(
        map(user => user || null),
        catchError(() => of(null))
      );
    }),
    shareReplay(1)
  );

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
    
    // Actualizar último login en el sistema de usuarios
    if (cred.user?.email) {
      this.userManagement.updateLastLogin(cred.user.email).subscribe({
        next: () => console.log('✅ Último login actualizado'),
        error: (error) => console.warn('⚠️ Error actualizando último login:', error)
      });
    }
    
    return cred.user;
  }

  async loginWithGoogle(): Promise<User> {
    if (!this.auth) throw new Error('Auth no disponible');
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(this.auth, provider);
    
    // Actualizar último login en el sistema de usuarios
    if (result.user?.email) {
      this.userManagement.updateLastLogin(result.user.email).subscribe({
        next: () => console.log('✅ Último login actualizado'),
        error: (error) => console.warn('⚠️ Error actualizando último login:', error)
      });
    }
    
    return result.user;
  }

  async logout(): Promise<void> { if (this.auth) await signOut(this.auth); }

  // Métodos de utilidad para verificar permisos
  hasPermission(module: string, action: 'read' | 'create' | 'update' | 'delete' | 'manage'): Observable<boolean> {
    return this.appUser$.pipe(
      map(user => user ? hasPermission(user, module, action) : false)
    );
  }

  hasPermissionSync(module: string, action: 'read' | 'create' | 'update' | 'delete' | 'manage'): boolean {
    const authUser = this.currentUser;
    if (!authUser?.email) return false;
    
    // Para compatibilidad, bruno@subeia.tech siempre tiene todos los permisos
    if (isSuperUser(authUser.email)) return true;
    
    // Por ahora, otros usuarios autenticados tienen permisos básicos de admin
    // En el futuro esto se basará en el sistema de usuarios completo
    return this.isAdminSync();
  }

  isSuperUser(): Observable<boolean> {
    return this.authState$.pipe(
      map(user => user?.email ? isSuperUser(user.email) : false)
    );
  }

  isSuperUserSync(): boolean {
    const user = this.currentUser;
    return user?.email ? isSuperUser(user.email) : false;
  }
}