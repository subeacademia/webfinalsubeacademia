import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="min-h-dvh flex flex-col items-center justify-center text-center p-8">
      <h1 class="text-4xl md:text-6xl font-grotesk font-bold">Sube Academia</h1>
      <p class="mt-4 text-lg text-muted">Aprende IA, cursos y recursos.</p>
      <a class="mt-8 inline-flex items-center gap-2 bg-accent text-bg px-5 py-3 rounded-lg hover:opacity-90" routerLink="cursos">Explorar cursos</a>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {}

