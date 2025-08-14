import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { AuthCoreService } from '../../core/auth-core.service';
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
    <div class="font-semibold">Sube Academ-IA</div>
    <button class="md:hidden btn" (click)="open = !open">☰</button>
  </header>

  <div class="grid md:grid-cols-[240px_1fr]">
    <aside class="p-4 space-y-2 border-r border-white/10 bg-[var(--panel)]/50"
           [class.hidden]="!open" [class.md:block]="true">
      <div class="text-xs text-[var(--muted)] mb-2" *ngIf="userEmail">{{ userEmail }}</div>
      <a class="btn w-full" routerLink="/admin/posts">Posts</a>
      <a class="btn w-full" routerLink="/admin/courses">Cursos</a>
      <a class="btn w-full" routerLink="/admin/media">Media</a>
      <a class="btn w-full" routerLink="/admin/logos">Logos</a>
      <a class="btn w-full" routerLink="/admin/settings">Ajustes</a>
      <button class="btn w-full" (click)="logout()">Cerrar sesión</button>
    </aside>
    <main class="p-4">
      <router-outlet/>
    </main>
  </div>
</div>
  `
})
export class AdminShellComponent implements OnInit, OnDestroy {
  private authSvc = inject(AuthService);
  private coreAuth = inject(AuthCoreService);
  private router = inject(Router);
  open = true;
  userEmail: string | null = null;
  private readonly unsubscribe$ = new Subject<void>();

  ngOnInit(){
    if (typeof window !== 'undefined') this.open = window.innerWidth >= 768;
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

