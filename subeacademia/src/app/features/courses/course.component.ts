import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-course',
  standalone: true,
  template: `
    <article class="container mx-auto p-6">
      <h1 class="text-3xl font-bold">Curso: {{ slug }}</h1>
      <p class="text-muted mt-2">Contenido próximamente.</p>
    </article>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CourseComponent {
  protected slug: string | null = null;
  constructor(private readonly route: ActivatedRoute) {
    this.slug = this.route.snapshot.paramMap.get('slug');
  }
}

