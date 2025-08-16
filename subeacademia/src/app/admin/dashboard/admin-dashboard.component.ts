import { ChangeDetectionStrategy, Component, ViewChild, inject } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [RouterLink, RouterOutlet, MatSidenavModule, MatToolbarModule, MatListModule, MatIconModule, MatButtonModule],
  template: `
    <mat-sidenav-container class="min-h-dvh" autosize>
      <mat-sidenav #sidenav mode="side" opened class="w-64 bg-[var(--panel)] text-[var(--fg)]">
        <div class="px-4 py-4 font-semibold tracking-wide">Sube Academ-IA · Admin</div>
        <mat-nav-list>
          <a mat-list-item routerLink="posts"><mat-icon>article</mat-icon><span class="ml-3">Posts</span></a>
          <a mat-list-item routerLink="courses"><mat-icon>school</mat-icon><span class="ml-3">Courses</span></a>
          <a mat-list-item routerLink="media"><mat-icon>photo_library</mat-icon><span class="ml-3">Media</span></a>
          <a mat-list-item routerLink="settings"><mat-icon>settings</mat-icon><span class="ml-3">Settings</span></a>
        </mat-nav-list>
        <div class="px-4 py-4">
          <button mat-stroked-button color="primary" class="w-full" (click)="logout()"><mat-icon>logout</mat-icon><span class="ml-2">Cerrar sesión</span></button>
        </div>
      </mat-sidenav>
      <mat-sidenav-content>
        <mat-toolbar class="bg-[var(--panel)] text-[var(--fg)] border-b border-white/10">
          <button mat-icon-button class="md:hidden" (click)="sidenav.toggle()"><mat-icon>menu</mat-icon></button>
          <span class="ml-2">Panel</span>
          <span class="flex-1"></span>
          <button mat-button (click)="logout()"><mat-icon>logout</mat-icon> Cerrar sesión</button>
        </mat-toolbar>
        <div class="admin-page p-6">
          <router-outlet />
        </div>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminDashboardComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  async logout() {
    await this.auth.logout();
    await this.router.navigateByUrl('/admin/login');
  }
}

