import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { AuthCoreService } from '../../core/auth-core.service';
import { LocalSettingsService } from '../../core/services/local-settings.service';
import { NgIf } from '@angular/common';
import { User } from '@angular/fire/auth';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-admin-shell',
  standalone: true,
  imports: [RouterLink, RouterOutlet, NgIf],
  template: `
<div class="min-h-screen">
  <header class="flex items-center justify-between px-4 py-3 border-b border-white/10">
    <div class="font-semibold">{{ brandName() }}</div>
    <button class="md:hidden btn" (click)="open = !open">☰</button>
  </header>

  <div class="grid md:grid-cols-[240px_1fr]">
    <aside class="p-4 space-y-2 border-r border-white/10 bg-[var(--panel)]/50"
           [class.hidden]="!open" [class.md:block]="true">
      <div class="text-xs text-[var(--muted)] mb-2" *ngIf="userEmail">{{ userEmail }}</div>
      <a class="menu-item" routerLink="/admin/posts">
        <span class="menu-icon">📝</span> Posts
      </a>
      <a class="menu-item" routerLink="/admin/productos">
        <span class="menu-icon">🛍️</span> Productos
      </a>
      <a class="menu-item" routerLink="/admin/projects">
        <span class="menu-icon">🚀</span> Proyectos
      </a>
      <a class="menu-item" routerLink="/admin/certificados">
        <span class="menu-icon">🏆</span> Certificados
      </a>
      <a class="menu-item" routerLink="/admin/media">
        <span class="menu-icon">📷</span> Media
      </a>
      <a class="menu-item" routerLink="/admin/logos">
        <span class="menu-icon">🎨</span> Logos
      </a>
      <a class="menu-item" routerLink="/admin/history">
        <span class="menu-icon">📚</span> Historia
      </a>
      <a class="menu-item" routerLink="/admin/collaborators">
        <span class="menu-icon">🤝</span> Colaboradores
      </a>
      <a class="menu-item" routerLink="/admin/leads">
        <span class="menu-icon">📊</span> Leads
      </a>
      <a class="menu-item" routerLink="/admin/users">
        <span class="menu-icon">👥</span> Usuarios
      </a>
      <a class="menu-item" routerLink="/admin/settings">
        <span class="menu-icon">⚙️</span> Ajustes
      </a>
      <button class="menu-item" (click)="logout()">
        <span class="menu-icon">🚪</span> Cerrar sesión
      </button>
    </aside>
    <main class="p-4">
      <router-outlet/>
    </main>
  </div>
</div>
  `,
  styles: [`
    .menu-item {
      @apply w-full px-3 py-2 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors;
      @apply flex items-center gap-3;
      text-decoration: none;
      border: none;
      background: none;
      cursor: pointer;
      font-family: inherit;
      font-size: inherit;
    }
    
    .menu-icon {
      @apply text-lg flex-shrink-0;
      width: 20px;
      display: flex;
      align-items: center;
      justify-content: flex-start;
    }
    
    .menu-item:hover {
      @apply bg-gray-100 dark:bg-gray-700;
    }
  `]
})
export class AdminShellComponent implements OnInit, OnDestroy {
  private authSvc = inject(AuthService);
  private coreAuth = inject(AuthCoreService);
  private router = inject(Router);
  private settings = inject(LocalSettingsService);
  
  open = true;
  userEmail: string | null = null;
  brandName = signal<string>('Sube Academ-IA');
  private readonly unsubscribe$ = new Subject<void>();

  ngOnInit(){
    if (typeof window !== 'undefined') this.open = window.innerWidth >= 768;
    
    // Cargar configuraciones para el nombre de marca
    this.settings.get()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(settings => {
        this.brandName.set(settings.brandName);
        console.log('✅ Nombre de marca cargado en admin:', settings.brandName);
      });
    
    this.coreAuth.authState$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((u: User | null) => { this.userEmail = u?.email ?? null; });
  }
  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
  async logout(){
    await this.authSvc.logout();
    void this.router.navigate(['/admin/login']);
  }
}

