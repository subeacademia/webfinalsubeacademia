import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgFor, NgIf } from '@angular/common';
import { CoursesService } from '../../core/data/courses.service';

@Component({
  standalone: true,
  selector: 'app-admin-courses-page',
  imports: [RouterLink, NgFor, NgIf],
  template: `
  <div class="flex items-center justify-between mb-4">
    <h1 class="text-2xl font-semibold">Cursos</h1>
    <a routerLink="/admin/courses/new" class="btn btn-primary">Nuevo</a>
  </div>
  <div class="grid gap-3">
    <div *ngFor="let c of courses()" class="card p-4">
      <div class="md:flex items-center justify-between">
        <div>
          <div class="font-semibold">{{c.title}}</div>
          <div class="text-sm text-[var(--muted)]">{{c.lang}} • {{c.level}} • {{c.status}}</div>
        </div>
        <a class="btn block md:inline-block w-full md:w-auto mt-3 md:mt-0" [routerLink]="['/admin/courses', c.id]">Editar</a>
      </div>
    </div>
    <div *ngIf="!courses().length" class="card p-6 text-[var(--muted)]">No hay cursos aún. <a class="btn inline-block ml-3" routerLink="/admin/courses/new">Crear primero</a></div>
  </div>
  `,
})
export class CoursesPageComponent {
  private coursesSvc = inject(CoursesService);
  courses = signal<any[]>([]);
  constructor(){
    this.coursesSvc.list('es').subscribe(list => this.courses.set(list as any[]));
  }
}

