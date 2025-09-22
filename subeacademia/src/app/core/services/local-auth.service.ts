import { Injectable, signal } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  phoneNumber: string | null;
  providerId: string;
  emailVerified: boolean;
  isAnonymous: boolean;
  metadata: {
    creationTime?: string;
    lastSignInTime?: string;
  };
  providerData: any[];
  refreshToken: string;
  tenantId: string | null;
  delete(): Promise<void>;
  getIdToken(forceRefresh?: boolean): Promise<string>;
  getIdTokenResult(forceRefresh?: boolean): Promise<any>;
  reload(): Promise<void>;
  toJSON(): object;
}

/**
 * Servicio de autenticación local que reemplaza Firebase Auth
 * Usa almacenamiento local del navegador para simular autenticación
 */
@Injectable({
  providedIn: 'root'
})
export class LocalAuthService {
  private currentUser = signal<User | null>(null);
  private readonly STORAGE_KEY = 'subeacademia_user';

  constructor() {
    // Cargar usuario desde localStorage al inicializar
    this.loadUserFromStorage();
  }

  /**
   * Obtiene el estado actual del usuario
   */
  getCurrentUser(): Observable<User | null> {
    return of(this.currentUser());
  }

  /**
   * Obtiene el usuario actual como signal
   */
  getCurrentUserSignal() {
    return this.currentUser.asReadonly();
  }

  /**
   * Simula login con Google (usando datos locales)
   */
  async loginWithGoogle(): Promise<User> {
    console.info('🔑 [LocalAuth] Simulando login con Google...');
    
    // Crear un usuario simulado
    const mockUser: User = {
      uid: 'local_user_' + Date.now(),
      email: 'usuario@subeacademia.com',
      displayName: 'Usuario Local',
      photoURL: 'https://via.placeholder.com/150/4F46E5/FFFFFF?text=U',
      phoneNumber: null,
      providerId: 'local',
      emailVerified: true,
      isAnonymous: false,
      metadata: {
        creationTime: new Date().toISOString(),
        lastSignInTime: new Date().toISOString()
      },
      providerData: [],
      refreshToken: 'local_refresh_token',
      tenantId: null,
      delete: async () => {},
      getIdToken: async () => 'local_id_token',
      getIdTokenResult: async () => ({}),
      reload: async () => {},
      toJSON: () => ({})
    };

    // Guardar en localStorage
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(mockUser));
    
    // Actualizar el estado
    this.currentUser.set(mockUser);
    
    console.info('✅ [LocalAuth] Login simulado exitoso:', mockUser.email);
    return mockUser;
  }

  /**
   * Simula login con email y contraseña
   */
  async loginWithEmail(email: string, password: string): Promise<User> {
    console.info('🔑 [LocalAuth] Simulando login con email:', email);
    
    const mockUser: User = {
      uid: 'local_user_' + Date.now(),
      email: email,
      displayName: email.split('@')[0],
      photoURL: 'https://via.placeholder.com/150/4F46E5/FFFFFF?text=' + email.charAt(0).toUpperCase(),
      phoneNumber: null,
      providerId: 'local',
      emailVerified: true,
      isAnonymous: false,
      metadata: {
        creationTime: new Date().toISOString(),
        lastSignInTime: new Date().toISOString()
      },
      providerData: [],
      refreshToken: 'local_refresh_token',
      tenantId: null,
      delete: async () => {},
      getIdToken: async () => 'local_id_token',
      getIdTokenResult: async () => ({}),
      reload: async () => {},
      toJSON: () => ({})
    };

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(mockUser));
    this.currentUser.set(mockUser);
    
    console.info('✅ [LocalAuth] Login con email exitoso:', email);
    return mockUser;
  }

  /**
   * Cierra la sesión del usuario
   */
  async logout(): Promise<void> {
    console.info('🚪 [LocalAuth] Cerrando sesión...');
    
    localStorage.removeItem(this.STORAGE_KEY);
    this.currentUser.set(null);
    
    console.info('✅ [LocalAuth] Sesión cerrada');
  }

  /**
   * Verifica si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    return this.currentUser() !== null;
  }

  /**
   * Obtiene el UID del usuario actual
   */
  getCurrentUserId(): string | null {
    return this.currentUser()?.uid || null;
  }

  /**
   * Carga el usuario desde localStorage
   */
  private loadUserFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const user = JSON.parse(stored) as User;
        this.currentUser.set(user);
        console.info('👤 [LocalAuth] Usuario cargado desde localStorage:', user.email);
      }
    } catch (error) {
      console.warn('⚠️ [LocalAuth] Error cargando usuario desde localStorage:', error);
      localStorage.removeItem(this.STORAGE_KEY);
    }
  }

  /**
   * Simula el estado de autenticación como Observable
   */
  authState(): Observable<User | null> {
    return new Observable(observer => {
      // Emitir el estado actual
      observer.next(this.currentUser());
      
      // En un sistema real, aquí escucharías cambios de autenticación
      // Para simplicidad, solo emitimos el estado actual
      observer.complete();
    });
  }
}
