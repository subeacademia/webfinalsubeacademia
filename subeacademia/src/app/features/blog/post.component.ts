import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-post',
  standalone: true,
  template: `
    <article class="container mx-auto p-6">
      <h1 class="text-3xl font-bold">Publicación: {{ slug }}</h1>
      <p class="text-muted mt-2">Contenido próximamente.</p>
    </article>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PostComponent {
  protected slug: string | null = null;
  constructor(private readonly route: ActivatedRoute) {
    this.slug = this.route.snapshot.paramMap.get('slug');
  }
}

