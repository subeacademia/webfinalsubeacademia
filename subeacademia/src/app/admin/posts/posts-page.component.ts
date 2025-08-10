import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PostsService } from '../../core/data/posts.service';

@Component({
  standalone: true,
  selector: 'app-posts-page',
  imports: [CommonModule, RouterLink],
  template: `
  <div class="flex items-center justify-between mb-5">
    <h1 class="text-2xl font-semibold">Posts</h1>
    <a class="btn btn-primary" routerLink="/admin/posts/new">Nuevo</a>
  </div>

  <ng-container *ngIf="posts().length; else empty">
    <div class="grid gap-3">
      <div *ngFor="let p of posts()" class="card p-4 flex items-center justify-between">
        <div>
          <div class="font-semibold">{{ p.title || '(sin título)' }}</div>
          <div class="text-sm text-[var(--muted)]">{{ p.lang }} • {{ p.status }} • {{ p.slug }}</div>
        </div>
        <a class="btn" [routerLink]="['/admin/posts', p.id]">Editar</a>
      </div>
    </div>
  </ng-container>

  <ng-template #empty>
    <div class="card p-6 flex items-center gap-3">
      <span class="text-[var(--muted)]">No hay posts aún.</span>
      <a class="btn" routerLink="/admin/posts/new">Crear primero</a>
    </div>
  </ng-template>
  `
})
export class PostsPageComponent{
  private svc = inject(PostsService);
  posts = signal<any[]>([]);
  constructor(){
    this.svc.list('es').then(v => this.posts.set(v));
  }
}

