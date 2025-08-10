import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-courses-list',
  standalone: true,
  template: `
    <main class="container mx-auto p-6">
      <h2 class="text-3xl font-semibold">Cursos</h2>
      <p class="text-muted mt-2">Listado de cursos.</p>
    </main>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CoursesListComponent {}

