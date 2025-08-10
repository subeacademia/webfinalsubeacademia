import { Component, inject, signal } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { PostsService } from '../../core/data/posts.service';

@Component({
  standalone: true,
  selector: 'app-posts-page',
  imports: [RouterLink, NgFor, NgIf],
  template: `
  <div class="flex items-center justify-between mb-5">
    <h1 class="text-2xl font-semibold">Posts</h1>
    <button class="btn btn-primary" (click)="goNew()">Nuevo</button>
  </div>

  <div class="grid gap-3">
    <ng-container *ngIf="posts().length; else empty">
      <div *ngFor="let p of posts()" class="card p-4 md:flex items-center justify-between">
        <div>
          <div class="font-semibold">{{ p.title || '(sin título)' }}</div>
          <div class="text-sm text-[var(--muted)]">{{ p.lang }} • {{ p.status }} • {{ p.slug }}</div>
        </div>
        <a class="btn block md:inline-block w-full md:w-auto mt-3 md:mt-0" [routerLink]="['/admin/posts', p.id]">Editar</a>
      </div>
    </ng-container>
    <ng-template #empty>
      <div class="card p-6 flex items-center gap-3">
        <span class="text-[var(--muted)]">No hay posts aún.</span>
        <button class="btn" (click)="goNew()">Crear primero</button>
      </div>
    </ng-template>
  </div>
  `
})
export class PostsPageComponent{
  private postsSvc = inject(PostsService);
  private router = inject(Router);
  posts = signal<any[]>([]);
  constructor(){
    this.postsSvc.list('es').subscribe(list=>this.posts.set(list as any[]));
  }
  goNew(){ this.router.navigate(['/admin/posts/new']); }
}

