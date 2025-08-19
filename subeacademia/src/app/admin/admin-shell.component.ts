import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthCoreService } from '../core/auth-core.service';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-admin-shell',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet],
  template: `
    <div class="min-h-screen bg-gray-100 dark:bg-gray-900">
      <!-- Sidebar -->
      <div class="flex">
        <aside class="w-64 bg-white dark:bg-gray-800 shadow-lg min-h-screen">
          <div class="p-6">
            <h1 class="text-2xl font-bold text-gray-800 dark:text-white mb-8">Admin Panel</h1>
            <nav class="space-y-4">
              <a class="btn w-full" routerLink="/admin/posts">Posts</a>
              <a class="btn w-full" routerLink="/admin/productos">Productos</a>
              <a class="btn w-full" routerLink="/admin/projects">Proyectos</a>
              <a class="btn w-full" routerLink="/admin/media">Media</a>
              <a class="btn w-full" routerLink="/admin/logos">Logos</a>
              <a class="btn w-full" routerLink="/admin/settings">Ajustes</a>
            </nav>
          </div>
        </aside>

        <!-- Main content -->
        <main class="flex-1 p-8">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
  styles: [`
    .btn {
      @apply block w-full px-4 py-2 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors;
    }
  `]
})
export class AdminShellComponent implements OnInit, OnDestroy {
  private readonly auth = inject(AuthCoreService);
  private readonly router = inject(Router);

  ngOnInit(): void {
    console.log('🏗️ AdminShellComponent.ngOnInit() iniciado');
    console.log('🔐 Estado de autenticación:', {
      currentUser: this.auth.currentUser,
      isAdmin: this.auth.isAdminSync(),
      adminEmails: environment.adminEmails
    });
    
    // Verificar si el usuario está autenticado
    this.auth.authState$.subscribe(user => {
      console.log('👤 Usuario autenticado:', user);
      if (user) {
        console.log('📧 Email del usuario:', user.email);
        console.log('👑 ¿Es admin?:', this.auth.isAdminSync());
      } else {
        console.log('❌ No hay usuario autenticado');
      }
    });
  }

  ngOnDestroy(): void {
    // Cleanup si es necesario
  }
}
