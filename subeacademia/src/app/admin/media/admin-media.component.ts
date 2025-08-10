import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-admin-media',
  standalone: true,
  template: `
    <h1 class="text-2xl font-semibold">Admin · Media</h1>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminMediaComponent {}

