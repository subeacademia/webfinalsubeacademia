import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { I18nService } from './core/i18n/i18n.service';
import { SeoService } from './core/seo/seo.service';
import { Subject, filter, takeUntil } from 'rxjs';
import { AppShellComponent } from './core/ui/app-shell/app-shell.component';
import { ToastContainerComponent } from './core/ui/toast/toast.container';
import { ChatbotComponent } from './shared/ui/chatbot/chatbot.component';
import { ThemeService } from './shared/theme.service';
import { AuthCoreService } from './core/auth-core.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, AppShellComponent, ChatbotComponent, CommonModule, ToastContainerComponent],
  template: `
    <app-shell>
      <router-outlet />
      <app-chatbot *ngIf="!isAdminRoute" />
      <app-toast-container />
    </app-shell>
    
    <!-- Debug temporal simple -->
    <div *ngIf="showDebug" class="fixed top-4 right-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 max-w-sm z-50">
      <h3 class="text-lg font-semibold mb-3 text-gray-800 dark:text-white">🔐 Debug Simple</h3>
      <div class="space-y-2 text-sm">
        <div>Usuario: {{ authStatus.currentUser ? '✅ Logueado' : '❌ No logueado' }}</div>
        <div>Email: {{ authStatus.email || 'N/A' }}</div>
        <div>Admin: {{ authStatus.isAdmin ? '👑 Sí' : '❌ No' }}</div>
      </div>
      <div class="mt-3 space-y-2">
        <button (click)="loginWithGoogle()" class="w-full bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm">Login Google</button>
        <button (click)="testAdmin()" class="w-full bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm">Test Admin</button>
        <button (click)="goToAdmin()" class="w-full bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded text-sm">Ir a Admin</button>
      </div>
    </div>
  `,
  styleUrl: './app.css'
})
export class App implements OnInit, OnDestroy {
  protected readonly title = 'subeacademia';
  private readonly themeService = inject(ThemeService);
  private readonly router = inject(Router);
  private readonly i18n = inject(I18nService);
  private readonly seo = inject(SeoService);
  private readonly authService = inject(AuthCoreService);
  private readonly unsubscribe$ = new Subject<void>();
  isAdminRoute = false;
  showDebug = true; // Temporal
  
  authStatus = {
    currentUser: null as any,
    email: null as string | null,
    isAdmin: false
  };
  
  constructor() {}
  ngOnInit() {
    // Inicializa el tema (lee almacenamiento y aplica clases)
    try { this.themeService.init(); } catch {}

    // Suscribirse a cambios de ruta para detectar rutas admin
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      takeUntil(this.unsubscribe$)
    ).subscribe((event: NavigationEnd) => {
      this.isAdminRoute = event.url.startsWith('/admin');
      console.log('🔍 [App] Ruta detectada:', event.url, '¿Es admin?:', this.isAdminRoute);
    });

    // Configurar SEO básico
    try {
      this.seo.updateTags({
        title: 'Sube Academia - Aprende IA, cursos y recursos',
        description: 'Aprende IA, cursos y recursos', 
        type: 'website' 
      });
    } catch {}
    
    // Actualizar estado de auth cada 2 segundos
    setInterval(() => {
      this.updateAuthStatus();
    }, 2000);
  }
  
  private updateAuthStatus() {
    try {
      this.authStatus.currentUser = this.authService.currentUser;
      this.authStatus.email = this.authStatus.currentUser?.email || null;
      this.authStatus.isAdmin = this.authService.isAdminSync();
    } catch (error) {
      console.error('Error actualizando auth status:', error);
    }
  }
  
  async loginWithGoogle() {
    try {
      console.log('🔑 Intentando login...');
      await this.authService.loginWithGoogle();
      console.log('✅ Login exitoso');
    } catch (error) {
      console.error('❌ Error en login:', error);
    }
  }
  
  testAdmin() {
    try {
      const isAdmin = this.authService.isAdminSync();
      console.log('🧪 Test Admin:', isAdmin);
      alert(`¿Es admin? ${isAdmin ? 'SÍ' : 'NO'}`);
    } catch (error) {
      console.error('❌ Error en test:', error);
    }
  }
  
  goToAdmin() {
    try {
      console.log('🚀 Navegando a admin...');
      this.router.navigate(['/admin']);
    } catch (error) {
      console.error('❌ Error navegando:', error);
    }
  }
  
  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
