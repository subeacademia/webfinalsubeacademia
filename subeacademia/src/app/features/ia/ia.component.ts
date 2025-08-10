import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-ia',
  standalone: true,
  template: `
    <section class="container mx-auto p-6">
      <h2 class="text-3xl font-semibold">Laboratorio IA</h2>
      <p class="text-muted mt-2">Placeholder para herramientas de IA.</p>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IaComponent {}

