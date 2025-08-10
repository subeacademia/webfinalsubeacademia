import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [RouterLink, RouterOutlet],
  template: `
    <div class="min-h-dvh grid grid-cols-12">
      <aside class="col-span-3 p-4 bg-panel">
        <nav class="space-y-2">
          <a routerLink="posts" class="block">Posts</a>
          <a routerLink="courses" class="block">Courses</a>
          <a routerLink="media" class="block">Media</a>
          <a routerLink="settings" class="block">Settings</a>
        </nav>
      </aside>
      <main class="col-span-9 p-6">
        <router-outlet />
      </main>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminDashboardComponent {}

