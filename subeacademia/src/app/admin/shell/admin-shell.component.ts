import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { AuthCoreService } from '../../core/auth-core.service';
import { LocalSettingsService } from '../../core/services/local-settings.service';
import { I18nService } from '../../core/i18n/i18n.service';
import { I18nTranslatePipe } from '../../core/i18n/i18n.pipe';
import { NgIf } from '@angular/common';
import { User } from '@angular/fire/auth';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-admin-shell',
  standalone: true,
  imports: [RouterLink, RouterOutlet, NgIf, I18nTranslatePipe],
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
        <span class="menu-icon">📝</span> {{ 'admin.menu.posts' | i18nTranslate }}
      </a>
      <a class="menu-item" routerLink="/admin/productos">
        <span class="menu-icon">🛍️</span> {{ 'admin.menu.productos' | i18nTranslate }}
      </a>
      <a class="menu-item" routerLink="/admin/projects">
        <span class="menu-icon">🚀</span> {{ 'admin.menu.projects' | i18nTranslate }}
      </a>
      <a class="menu-item" routerLink="/admin/certificados">
        <span class="menu-icon">🏆</span> {{ 'admin.menu.certificados' | i18nTranslate }}
      </a>
      <a class="menu-item" routerLink="/admin/media">
        <span class="menu-icon">📷</span> {{ 'admin.menu.media' | i18nTranslate }}
      </a>
      <a class="menu-item" routerLink="/admin/clientes">
        <span class="menu-icon">👥</span> {{ 'admin.menu.clientes' | i18nTranslate }}
      </a>
      <a class="menu-item" routerLink="/admin/history">
        <span class="menu-icon">📚</span> {{ 'admin.menu.history' | i18nTranslate }}
      </a>
      <a class="menu-item" routerLink="/admin/collaborators">
        <span class="menu-icon">🤝</span> {{ 'admin.menu.collaborators' | i18nTranslate }}
      </a>
      <a class="menu-item" routerLink="/admin/leads">
        <span class="menu-icon">📊</span> {{ 'admin.menu.leads' | i18nTranslate }}
      </a>
      <a class="menu-item" routerLink="/admin/users">
        <span class="menu-icon">👥</span> {{ 'admin.menu.users' | i18nTranslate }}
      </a>
      <a class="menu-item" routerLink="/admin/settings">
        <span class="menu-icon">⚙️</span> {{ 'admin.menu.settings' | i18nTranslate }}
      </a>
      <button class="menu-item" (click)="logout()">
        <span class="menu-icon">🚪</span> {{ 'admin.menu.logout' | i18nTranslate }}
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
  private i18n = inject(I18nService);
  
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

