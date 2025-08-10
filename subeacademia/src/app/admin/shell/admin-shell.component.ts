import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { NgIf } from '@angular/common';
import { authState, Auth, User } from '@angular/fire/auth';

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
export class AdminShellComponent implements OnInit {
  private authSvc = inject(AuthService);
  private auth = inject(Auth);
  private router = inject(Router);
  open = true;
  userEmail: string | null = null;
  ngOnInit(){
    if (typeof window !== 'undefined') this.open = window.innerWidth >= 768;
    authState(this.auth).subscribe((u: User | null) => {
      this.userEmail = u?.email ?? null;
    });
  }
  async logout(){
    await this.authSvc.logout();
    void this.router.navigate(['/es']);
  }
}

