import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthCoreService } from './auth-core.service';
import { environment } from '../../environments/environment';
import { FirebaseInitService } from './firebase-init.service';
import { interval, Subscription } from 'rxjs';

interface AuthStatus {
  currentUser: any;
  email: string | null;
  isAdmin: boolean;
  allowedAdmins: string[];
  firebaseAvailable: boolean;
  firebaseInitialized: boolean;
  firebaseError: string | null;
}

@Component({
  selector: 'app-auth-debug',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed bottom-4 right-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 max-w-md z-50">
      <h3 class="text-lg font-semibold mb-3 text-gray-800 dark:text-white">🔐 Debug de Autenticación</h3>
      
      <div class="space-y-2 text-sm">
        <div class="flex justify-between">
          <span class="text-gray-600 dark:text-gray-400">Usuario actual:</span>
          <span class="font-mono text-xs" [ngClass]="authStatus.currentUser ? 'text-green-600' : 'text-red-600'">
            {{ authStatus.currentUser ? '✅ Logueado' : '❌ No logueado' }}
          </span>
        </div>
        
        <div class="flex justify-between">
          <span class="text-gray-600 dark:text-gray-400">Email:</span>
          <span class="font-mono text-xs" [ngClass]="authStatus.email ? 'text-green-600' : 'text-gray-500'">
            {{ authStatus.email || 'N/A' }}
          </span>
        </div>
        
        <div class="flex justify-between">
          <span class="text-gray-600 dark:text-gray-400">¿Es Admin?</span>
          <span class="font-mono text-xs" [ngClass]="authStatus.isAdmin ? 'text-green-600' : 'text-red-600'">
            {{ authStatus.isAdmin ? '👑 Sí' : '❌ No' }}
          </span>
        </div>
        
        <div class="flex justify-between">
          <span class="text-gray-600 dark:text-gray-400">Emails Admin:</span>
          <span class="font-mono text-xs text-blue-600">
            {{ authStatus.allowedAdmins.join(', ') }}
          </span>
        </div>
        
        <div class="flex justify-between">
          <span class="text-gray-600 dark:text-gray-400">Firebase Config:</span>
          <span class="font-mono text-xs" [ngClass]="authStatus.firebaseAvailable ? 'text-green-600' : 'text-red-600'">
            {{ authStatus.firebaseAvailable ? '✅ OK' : '❌ Error' }}
          </span>
        </div>
        
        <div class="flex justify-between">
          <span class="text-gray-600 dark:text-gray-400">Firebase Init:</span>
          <span class="font-mono text-xs" [ngClass]="authStatus.firebaseInitialized ? 'text-green-600' : 'text-yellow-600'">
            {{ authStatus.firebaseInitialized ? '✅ Listo' : '⏳ Inicializando...' }}
          </span>
        </div>
        
        <div *ngIf="authStatus.firebaseError" class="text-red-500 text-xs mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded">
          {{ authStatus.firebaseError }}
        </div>
      </div>
      
      <div class="mt-3 space-y-2">
        <button (click)="loginWithGoogle()" class="w-full bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm transition-colors">
          🔑 Login con Google
        </button>
        <button (click)="logout()" class="w-full bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm transition-colors">
          🚪 Logout
        </button>
        <button (click)="testAdminAccess()" class="w-full bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm transition-colors">
          🧪 Test Admin
        </button>
        <button (click)="resetFirebase()" class="w-full bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded text-sm transition-colors">
          🔄 Reset Firebase
        </button>
      </div>
      
      <div class="mt-3">
        <h4 class="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Logs:</h4>
        <div class="max-h-32 overflow-y-auto text-xs space-y-1">
          <div *ngFor="let log of logs" class="text-gray-600 dark:text-gray-400">
            {{ log }}
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .max-h-32 {
      max-height: 8rem;
    }
  `]
})
export class AuthDebugComponent implements OnInit, OnDestroy {
  private readonly authService = inject(AuthCoreService);
  private readonly firebaseInit = inject(FirebaseInitService);
  private readonly subscription = new Subscription();
  
  authStatus: AuthStatus = {
    currentUser: null,
    email: null,
    isAdmin: false,
    allowedAdmins: [],
    firebaseAvailable: false,
    firebaseInitialized: false,
    firebaseError: null
  };
  
  logs: string[] = [];
  
  ngOnInit() {
    this.log('🚀 Componente de debug iniciado');
    this.updateAuthStatus();
    
    // Actualizar estado cada 2 segundos
    this.subscription.add(
      interval(2000).subscribe(() => {
        this.updateAuthStatus();
      })
    );
    
    // Verificar Firebase
    this.checkFirebaseStatus();
  }
  
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
  
  private async checkFirebaseStatus() {
    try {
      this.log('🔍 Verificando estado de Firebase...');
      
      // Verificar si Firebase está disponible en window
      this.authStatus.firebaseAvailable = typeof (window as any).firebase !== 'undefined';
      
      // Verificar inicialización
      this.firebaseInit.isFirebaseReady().subscribe({
        next: (ready) => {
          this.authStatus.firebaseInitialized = ready;
          this.authStatus.firebaseError = null;
          this.log(`✅ Firebase inicializado: ${ready}`);
        },
        error: (error) => {
          this.authStatus.firebaseInitialized = false;
          this.authStatus.firebaseError = error.message;
          this.log(`❌ Error Firebase: ${error.message}`);
        }
      });
      
    } catch (error) {
      this.log(`❌ Error verificando Firebase: ${error}`);
    }
  }
  
  private updateAuthStatus() {
    try {
      this.authStatus.currentUser = this.authService.currentUser;
      this.authStatus.email = this.authStatus.currentUser?.email || null;
      this.authStatus.isAdmin = this.authService.isAdminSync();
      this.authStatus.allowedAdmins = Array.from(new Set(environment.adminEmails || []));
      
      this.log(`📊 Estado actualizado - Admin: ${this.authStatus.isAdmin}`);
    } catch (error) {
      this.log(`❌ Error actualizando estado: ${error}`);
    }
  }
  
  async loginWithGoogle() {
    try {
      this.log('🔑 Intentando login con Google...');
      await this.authService.loginWithGoogle();
      this.log('✅ Login exitoso');
    } catch (error) {
      this.log(`❌ Error en login: ${error}`);
    }
  }
  
  async logout() {
    try {
      this.log('🚪 Cerrando sesión...');
      await this.authService.logout();
      this.log('✅ Logout exitoso');
    } catch (error) {
      this.log(`❌ Error en logout: ${error}`);
    }
  }
  
  testAdminAccess() {
    try {
      const isAdmin = this.authService.isAdminSync();
      this.log(`🧪 Test Admin: ${isAdmin ? '✅ Sí es admin' : '❌ No es admin'}`);
    } catch (error) {
      this.log(`❌ Error en test admin: ${error}`);
    }
  }
  
  resetFirebase() {
    try {
      this.log('🔄 Reseteando Firebase...');
      this.firebaseInit.resetInitialization();
      this.authStatus.firebaseInitialized = false;
      this.authStatus.firebaseError = null;
      this.checkFirebaseStatus();
      this.log('✅ Firebase reseteado');
    } catch (error) {
      this.log(`❌ Error reseteando Firebase: ${error}`);
    }
  }
  
  private log(message: string) {
    const timestamp = new Date().toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
    this.logs.unshift(`[${timestamp}] ${message}`);
    
    // Mantener solo los últimos 10 logs
    if (this.logs.length > 10) {
      this.logs = this.logs.slice(0, 10);
    }
  }
}
